# FastAPI

> FastAPI 是用 Python 写 **HTTP 接口** 的框架：浏览器或别的服务发请求进来，它校验参数、跑业务、返回 JSON（或文件、或一段流）。
>
> 没见过的词第一次会用人话解释。建议先会一点 Python（函数、类型标注 `x: int`、`class`）。数据库和缓存不是必须，但接口迟早会碰到它们。
>
> 读的顺序：是什么 → 基础 → 请求怎么走完（原理） → 进阶 → 场景 → 痛点 → 面试题。原理那节最重要，前面的装饰器都是为它服务的。

---

## 是什么，能做什么

Python 自己不会「听 8000 端口、按路径找函数」。Flask / Django / FastAPI 都是在补这一层。FastAPI 的特点不是「又能写网站」，而是把 **接口** 这件事做薄、做清楚：

1. **路径就是函数**：`GET /items/42` 对应一个 Python 函数
2. **类型标注会在运行时生效**：`id: int` 不只是给编辑器看，传 `abc` 会直接 422
3. **文档是长出来的**：启动后打开 `/docs`，接口列表、参数、示例都在，还能点一下试
4. **异步是一等公民**：等数据库、等外部 HTTP、把字一个一个推出去，都可以 `await`，不必卡死整个进程
5. **依赖注入**：鉴权、取数据库连接、限流，写成可复用的「先跑这段」

它不是另一种 Python。底层两块：

- **Starlette**：ASGI 应用（异步的 Web 接口规范），负责请求、路由、中间件、WebSocket
- **Pydantic**：用 class 描述数据长什么样，负责解析和校验

真正对外听端口的是 **Uvicorn**（一台 ASGI 服务器）。关系可以记成：Uvicorn 收 HTTP → 交给 FastAPI 应用 → 你的函数跑完 → 再写回响应。

| 能做 | 不要默认靠它做 |
|---|---|
| JSON 接口、参数校验、自动文档 | 替代数据库（真相仍在 DB） |
| 登录鉴权、文件上传、SSE / WebSocket | 画页面（那是前端框架的事） |
| 调数据库、缓存、外部 HTTP、大模型 | 一个请求里慢慢处理超大文件或跑 30 秒任务（放队列） |
| 给网站、App、别的服务当后端 | 把运行环境打包（那是 Docker / 进程管理的事） |

没有 FastAPI，Flask、Django REST、甚至前端框架自带的 Route Handler 也能写接口。痛点是：**校验要手写、文档没有、异步和流不好接、业务和页面容易揉在一起。** 多端共用同一套逻辑、复杂事务、密钥不能进浏览器时，独立后端更干净。

---

## 基础用法

### 建项目

```bash
pip install fastapi uvicorn
```

`main.py`：

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- `main:app`：`main.py` 里那个叫 `app` 的对象
- `--reload`：改代码自动重启，开发用；生产不要开
- `--host 0.0.0.0`：监听所有网卡。只写 `127.0.0.1` 时，本机浏览器可以，Docker / 别的机器进不来

打开 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) 是 Swagger UI；`/redoc` 是另一套文档。先在这里点接口，比先写前端省事。

`GET /openapi.json` 就是文档的原料。FastAPI 根据你的路径、参数类型、模型，自动生成这份 OpenAPI，`/docs` 只是拿它来画页面。

### 路径、Query、Body

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"id": item_id}

@app.get("/items")
def list_items(status: str = "on", page: int = Query(1, ge=1)):
    return {"status": status, "page": page}

class ItemIn(BaseModel):
    title: str
    amount: int

@app.post("/items")
def create_item(body: ItemIn):
    return {"title": body.title, "amount": body.amount}
```

| 位置 | 例子 | 人话 |
|---|---|---|
| 路径 | `/items/{item_id}` | 资源是哪一个 |
| Query | `?page=1` | 过滤、分页，可有可无的条件 |
| Body | JSON | 创建、修改时提交的数据 |
| Header | `Authorization` | 令牌这类 |
| Cookie | `session=...` | 浏览器自动带上的登录态 |
| Form / File | `multipart` | 表单、上传 |

`item_id: int` 不是摆设：有人传 `abc`，框架直接 **422 Unprocessable Entity**，并告诉你哪一格不对。`Query(1, ge=1)` 表示默认第 1 页，且必须 ≥ 1。

函数参数叫什么、类型是什么，FastAPI 靠它判断「这个值从哪来」：

- 路径里有同名 `{item_id}` → 路径参数
- 类型是 `BaseModel` → 请求体 JSON
- 简单类型（`int` / `str` / `bool`）且不在路径里 → Query
- 想强制来源，用 `Query()` / `Path()` / `Header()` / `Cookie()` / `Body()`

`Header` 有个坑：HTTP 头不区分大小写，Python 参数名里的 `_` 会按 `-` 去找。所以 `user_agent: str = Header()` 对应的是 `User-Agent`。

### 返回错误，不要只 `return {"error": ...}` 还 200

```python
from fastapi import HTTPException

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id <= 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"id": item_id}
```

调用方应先看 **HTTP 状态码**，再看 body：

| 码         | 意思                    |
| --------- | --------------------- |
| 200 / 201 | 成功 / 创建成功             |
| 400       | 你这请求业务上就不对            |
| 401       | 没登录                   |
| 403       | 登录了但没权限               |
| 404       | 没有这份资源                |
| 409       | 冲突，比如重复提交             |
| 422       | 参数形状不对（Pydantic 拦下来的） |
| 429       | 被限流                   |
| 500       | 服务器自己炸了，别把细节直接给浏览器    |

`detail` 可以是字符串，也可以是 list / dict。不要把堆栈、SQL、密钥放进去。

### 响应模型：出口也要过一遍形状

```python
from pydantic import BaseModel

class UserOut(BaseModel):
    id: int
    name: str

@app.get("/me", response_model=UserOut)
def me():
    return {"id": 1, "name": "ada", "password_hash": "secret"}
```

实际返回里 **不会有** `password_hash`。`response_model` 会按模型再筛一遍：多的丢掉，缺的报错。这是防止把内部字段漏给客户端的第一道闸。

需要不同出口时，可以用 `response_model_exclude` / 多个模型，不要图省事直接 `return db_row`。

### 依赖注入：把重复准备工作抽出去

`Depends` 可以先理解成：跑接口之前，先帮我准备好一样东西（数据库连接、当前用户、分页参数）。

```python
from fastapi import Depends

def get_db():
    db = "这里本应是连接池里借来的连接"
    try:
        yield db
    finally:
        pass  # 关闭或还回连接池

@app.get("/items/{item_id}")
def get_item(item_id: int, db=Depends(get_db)):
    return {"id": item_id}
```

`yield` 前面是「准备」，后面是「收尾」。接口函数 return 之后，`finally` 仍会跑。所以连接泄漏往往不是「忘了 close」，而是根本没走 Depends，在函数里随手 `open()`。

同一请求里同一个 Depends 默认只执行一次（可缓存）。layout 式的「先取当前用户，再取他的权限」可以叠：Depends 里再 Depends。

### 给浏览器开 CORS（跨域）

页面在 `localhost:3000`，接口在 `localhost:8000`，浏览器会先问一次 OPTIONS（预检），再决定是否放行真正的 POST。拦的是浏览器，**放行名单写在后端**：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

生产把 `allow_origins` 换成真正的前端源，不要 `*` 还带 cookie（`allow_credentials=True` 时 `*` 本身就不合法）。

若前端在 **服务器上** `fetch` 你的接口（不经过浏览器），没有 CORS 这回事。只有「浏览器里的 JS 打另一个源」才会撞上。

### 上传文件

```python
from fastapi import UploadFile, File

@app.post("/files")
async def upload(file: UploadFile = File(...)):
    data = await file.read()  # 小文件可以；大文件不要这样
    return {"name": file.filename, "size": len(data)}
```

`UploadFile` 底层是临时文件：很小会在内存，大了会落到磁盘。大文件不要 `await file.read()` 一次进内存，改成一边 `await file.read(1024 * 1024)` 一边写入目标路径。数据库只记文件名和状态，不把二进制塞进单元格。

---

## 请求怎么走完（原理）

这是 FastAPI 和「自己用 `http.server` 写两下」分道的地方。先分清几个常被混在一起的词：

| 词             | 人话                                           |
| ------------- | -------------------------------------------- |
| **WSGI**      | 老的 Python Web 接口规范，同步为主（Flask / Django 传统部署） |
| **ASGI**      | 异步的接口规范，能挂 WebSocket、SSE、长连接。FastAPI 走这条     |
| **Uvicorn**   | ASGI 服务器，真正 `bind` 端口、收字节                    |
| **Starlette** | FastAPI 底下的 Web 工具箱：Request、路由、中间件           |
| **Pydantic**  | 数据形状和校验，不是 Web 框架                            |

### 一次请求大概发生了什么

1. Uvicorn 读到 TCP 上的 HTTP 字节，拼成 ASGI 的 `scope` / `receive` / `send`。
2. 中间件从外到内：CORS、Gzip、你自己写的计时、鉴权（如果写成中间件）。
3. 路由表按 method + 路径找到函数。找不到 → 404。
4. 解析路径、Query、Header、Cookie、Body。Body 是 JSON 就 `json.loads`，再交给 Pydantic。
5. 按依赖图执行 `Depends`（先子依赖，后父依赖）。`yield` 型依赖在这里「进入」。
6. 调用你的函数。`def` 会丢进线程池，避免堵住事件循环；`async def` 直接在循环里 `await`。
7. 返回值按 `response_model` 过滤、序列化成 JSON（或你指定的 Response）。
8. 依赖的 `yield` 之后、`finally` 跑完（还连接、关文件）。
9. 中间件从内到外收尾，Uvicorn 写出 HTTP 响应。

其中任何一步抛 `HTTPException`，会变成对应状态码。没接住的普通异常变成 500，日志里才有堆栈。

### 类型标注为什么能拦请求

Python 的标注默认 **运行时不管**。FastAPI 在导入时把函数签名扫一遍：参数名、类型、默认值、`Query()` 这些对象，登记进 OpenAPI，同时生成「进来时怎么解析」。

Pydantic 模型是这份登记的核心：

```python
from pydantic import BaseModel, Field

class ItemIn(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    amount: int = Field(gt=0)
```

请求体对不上 → 422，body 里是一列 `loc` / `msg`。这不是「框架脾气怪」，是它拒绝让脏数据进业务函数。业务里的「库存够不够」仍然要你自己 `raise HTTPException`，那是规则，不是形状。

Pydantic v2 和 v1 配置项名字不同（`model_config` vs `class Config`）。新项目用 v2。看到文档和报错对不上，先看 `pydantic` 大版本。

### `def` 和 `async def`：事件循环

Uvicorn 每个进程里有一个 **事件循环**（event loop）：同一时间只在跑一段 Python，但遇到 `await` 可以把等待（网络、磁盘）让出去，去跑别的请求。所以：

- 函数里没有 `await`，写 `def` 即可。FastAPI 会把它丢到线程池，避免同步的数据库驱动把循环卡住。
- 要 `await` Redis、httpx、文件流，写 `async def`。
- **不要** 在 `async def` 里 `time.sleep`、跑很重的同步 CPU、用同步的 `requests.get`。那会把循环冻住，别的请求一起排队。等，用 `asyncio.sleep`；CPU 重活，丢进程池或独立 worker。

`async def` 里调同步 ORM（比如默认的 SQLAlchemy Session）是常见坑：看起来异步，实际仍在循环里阻塞。要么用同步 `def` + 线程池，要么换异步驱动和会话。

多核不是靠 `async` 变出来的。一个 Uvicorn worker 基本吃一核。要吃满机器：`uvicorn --workers 4`，或前面再放进程管理。async 解决的是 **IO 等待**，不是 **算得快**。

### 依赖图，不是「全局变量」

```python
def get_current_user(db=Depends(get_db), token: str = Header()):
    ...

def require_admin(user=Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(403, "forbidden")
    return user
```

`GET /admin` 声明 `Depends(require_admin)` 时，FastAPI 会先 `get_db`、读 token、`get_current_user`，再 `require_admin`。同一请求里 `get_db` 若被多处 Depends，默认只借一次连接。

这和中间件的差别：

| | 中间件 | Depends |
|---|---|---|
| 粒度 | 几乎每个请求 | 某个路由、某组路由 |
| 能拿到 | 原始 Request | 已经解析好的参数、子依赖 |
| 适合 | CORS、日志、链路 ID | 当前用户、DB、限流、权限 |

鉴权写成 Depends 更常见：不是所有路径都要登录，`/health` 不该被拦。

### 为什么 `/docs` 总是和代码一致

装饰器执行时就把路径、方法、参数、模型登记进 `app.openapi()`。没有单独维护的「文档项目」。反过来：文档里没有的字段，多半是你没写进模型，而不是 UI 丢了。

`response_model`、`status_code`、`tags`、`summary` 都会进 OpenAPI。想藏内部接口：`include_in_schema=False`。

---

## 进阶用法

### 把路由拆开：`APIRouter`

```python
from fastapi import APIRouter, FastAPI

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/{item_id}")
def get_item(item_id: int):
    return {"id": item_id}

app = FastAPI()
app.include_router(router)
```

`prefix` 进 URL，`tags` 进文档分组。权限也可以挂在 router 上：`dependencies=[Depends(require_admin)]`，这一组都会先跑。

### 生命周期：启动时准备，关闭时收尾

老写法 `@app.on_event("startup")` 还能用，新项目用 `lifespan`：

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动：建连接池、载配置
    yield
    # 关闭：关池子

app = FastAPI(lifespan=lifespan)
```

连接池、Redis 客户端这类「全进程共用」的东西放这里，不要每个请求 `connect()`。

### 鉴权：门禁不是装饰画

常见两种带登录态的方式：

1. **`Authorization: Bearer <jwt>`**：App、别的服务好用；XSS 还能偷，所以 JWT 里不要放密码，过期要短
2. **httpOnly cookie**：浏览器 JS 读不到，适合网站；要注意 CSRF（跨站带 cookie 的请求）

无论哪一种，**能不能跑必须在服务器再查一次**。前端藏按钮不是权限。

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer()

def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(bearer),
):
    user = decode_and_load(cred.credentials)  # 验签、查库或查缓存
    if user is None:
        raise HTTPException(status_code=401, detail="unauthorized")
    return user
```

`HTTPBearer` 只是把头拆出来。验签、过期、吊销列表都是你的事。OAuth2 密码模式、Cookie 方案官方有现成 class，原理一样：Depends 里取出令牌 → 验 → 返回用户或 401。

### 后台任务 ≠ 消息队列

```python
from fastapi import BackgroundTasks

def write_log(msg: str):
    open("app.log", "a").write(msg + "\n")

@app.post("/items")
def create_item(tasks: BackgroundTasks):
    tasks.add_task(write_log, "created")
    return {"ok": True}
```

`BackgroundTasks` 是 **响应发出之后、在同一个进程里再跑一小下**。适合写一行日志、清一个小缓存。不适合：发长邮件、切大文件、调 30 秒的模型。进程一重启，没跑完的任务就没了。那种活放 Redis 队列 / 独立 worker，接口只记账并立刻返回。

### SSE：服务器单向推

SSE = Server-Sent Events。连接一直开着，接口不断写 `data: ...\n\n`。适合打字机、进度条。

```python
import asyncio
from fastapi.responses import StreamingResponse

@app.get("/stream")
async def stream():
    async def chunks():
        for ch in ["A", "B", "C"]:
            yield f"data: {ch}\n\n"
            await asyncio.sleep(0.05)
        yield "data: [DONE]\n\n"

    return StreamingResponse(chunks(), media_type="text/event-stream")
```

必须是 `text/event-stream`；每一段以空行结束。反向（浏览器频繁推服务器）或双向聊天，才需要 WebSocket。能 SSE 就别上 WebSocket，状态机简单得多。

反向代理（Nginx 等）默认可能缓冲，打字机会一坨一坨出来。流式接口要关掉缓冲，并注意超时。

### 配置：不要把密钥写进代码

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    database_url: str
    secret_key: str

settings = Settings()
```

环境变量 / `.env` 进 Settings，代码只读 `settings.database_url`。密钥不要提交进 Git，也不要为了省事塞进前端能看到的包。

### 测试：不需要真的起端口

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}
```

`TestClient` 走 ASGI，中间件、Depends、校验都在。测鉴权时直接带 Header；测 DB 时把 `get_db` 换成假依赖：`app.dependency_overrides[get_db] = fake_get_db`。

---

## 常用场景

**给网站或 App 提供 JSON。** 路径按资源：`GET /items`、`GET /items/{id}`、`POST /items`。列表用 Query 做过滤和分页，`LIMIT` + 上一页最后一条 id，不要巨大的 `OFFSET`。

**读多写少的详情。** 接口里先问缓存，没有再问数据库，再设过期时间。更新数据库成功后 **删缓存**，不要一边写库一边设新缓存（并发下容易把旧值写回去）。缓存不是真相。

**下单、改库存、转账。** 数据库事务里完成「读条件 + 更新」，条件写进 `UPDATE ... WHERE stock >= 1`。不要先 SELECT 再在 Python 里减，再 UPDATE——中间别人插进来，数会对不上。接口层负责开事务、失败回滚、返回 409。幂等（同一请求点两次只生效一次）用客户端带来的 key，缓存里 `SET key 1 NX EX 60` 挡住重复提交。

**要登录才能改。** Depends 取当前用户；改别人的资源再查一次归属。`/health`、登录、公开列表不要挂这个依赖。

**调大模型 / 生成长文。** 两种稳妥做法：立刻返回「处理中」，后台跑完再更新；或 SSE 把输出流走。都不要把「等模型」包进数据库事务里，锁会一直拿着。

**上传后很慢的解析。** 文件落盘 → 数据库插一条 `pending` → 队列推进去 → 接口立刻返回 id。工人进程解析完回写状态。接口进程不当工人。

**登录限流。** Depends 里按 IP 或账号自增计数，超过 `HTTPException(429)`。计数和过期放缓存里，过期时间一到自己没。

**健康检查。** `GET /health` 给编排系统和负载均衡探活。它应当又快又稳，不要在里面跑复杂查询；需要深检可以另做 `/health/ready`。

**何时不要把核心后端写在前端框架里。** 多端共用同一套 API、长时间任务、复杂事务、特定语言生态——独立 FastAPI（或别的后端）更干净。前端仍做页面，需要时在服务器上聚合（BFF）。

---

## 不用 FastAPI 的痛点，以及怎么解决

**把查库、下单全写在前端仓库。** 页面里会堆满 SQL 和密钥，App 以后也用不了同一套逻辑。页面只调 HTTP，SQL 放后端。

**每个接口手写 `if not body.name`。** 漏一个就 500。用 Pydantic 模型，类型和必填交给框架。

**成功失败都返回 200，错误写在 JSON 里。** 调用方要猜。用 `HTTPException`，404 / 422 / 429 各是各的。

**`async def` 里跑同步阻塞。** 一个人上传大文件，所有人变慢。IO 用异步库；不得不同步就写 `def`，让框架丢线程池。

**大模型 / 切大文件写在接口函数里同步死等。** 用户刷新、网关超时、进程被占满。短等待可以 SSE；长任务进队列，接口只记账。

**上传一次 `read()` 进内存。** 进程被撑爆。分块写磁盘，数据库只存路径。

**浏览器一上来 CORS 报错，以为 Python 崩了。** 拦的是浏览器。加 `CORSMiddleware`，只放行前端源。服务器对服务器的调用没有这个问题。

**改完代码不知道接口长什么样。** 打开 `/docs`。文档和代码脱节，多半是没写模型或 `include_in_schema=False`。

**在容器里听 `127.0.0.1`，外面打不开。** `--host 0.0.0.0`。

**每个请求 `connect()` 数据库，连完不还。** 启动时建池，Depends `yield` 连接，结束还回去。

**Server Action / 页面里不鉴权，以为后端可以省。** 反过来说也成立：FastAPI 导出的接口谁都能 POST。权限查 session / JWT，不要以为「页面上没按钮」就是安全。

一条判断标准：这是 **给调用方用的接口和校验**，放 FastAPI；这是 **必须落盘的真相**，放数据库；这是 **加速和短状态**，放缓存；这是 **人看见的页面**，放前端。

---

## 常见面试题

**FastAPI 和 Flask / Django 怎么选？**

Flask 更轻，校验和文档要自己接。Django 带后台、ORM、管理员，偏整站。FastAPI 适合「纯接口 + 类型校验 + 自动文档」，ASGI 异步也顺手。已经有 Django 的业务后台，不必为了新而拆；新开的 API 服务用 FastAPI 很合适。

**Pydantic 是干什么的？**

用 class 描述数据长什么样。请求一进来就按这个形状检查，不对自动 422。返回也可以用它挡内部字段。文档里的示例也从这里来。

**`Depends` 是什么？**

接口跑之前先执行的准备工作：开数据库、取当前用户、做限流。可以嵌套，同一请求默认只跑一次。很多接口共用同一段逻辑时，不要复制粘贴。

**中间件和 Depends 怎么选？**

全局、不管路由（CORS、日志）用中间件。和某个资源、某个用户有关的，用 Depends。鉴权更常是 Depends，因为 `/health` 不该被一刀切。

**`def` 和 `async def` 怎么选？**

没有 `await` 用 `def`（框架丢线程池）。要等异步库、流式输出，用 `async def`。不要在 `async def` 里写卡住的 `time.sleep` 或同步大计算。async 吃的是等待，不是 CPU。

**ASGI 和 WSGI 是什么？**

都是 Python Web 应用和服务器之间的约定。WSGI 同步；ASGI 能异步、能 WebSocket。Uvicorn 讲 ASGI，Gunicorn 传统模式讲 WSGI。FastAPI 是 ASGI 应用。

**SSE 和 WebSocket 有什么不同？**

SSE 是服务器单向推，刚好做打字机、进度。WebSocket 是双向，聊天室、协同编辑才需要。能 SSE 就别上 WebSocket。

**为什么不在接口里开一个超长事务等外部服务？**

锁会一直拿着，别人写同一行要排队，还可能超时。外部调用在事务外跑完，最后一条短 `UPDATE`。

**跨域是前端的事还是后端的事？**

浏览器拦的，但放行名单写在后端。FastAPI 加 CORS 中间件。前端若在服务器里发 HTTP（不经过浏览器），没有 CORS。

**`response_model` 为什么重要？**

它按出口模型再筛一遍，多出来的字段（密码哈希、内部标记）不会进 JSON。单靠「我 return 的时候不写」很容易漏。

**`BackgroundTasks` 能当任务队列吗？**

不能。它只是响应后在本进程跑一小下，进程没了任务就没了。真排队用 Redis / 专业队列 + worker。

**高并发时 FastAPI 为什么还能顶一阵？**

IO 密集时，事件循环让等待中的请求让出 CPU，线程池消化同步函数。这不是无限油门：阻塞循环、连接池耗尽、把慢任务放在请求里，顶不住。该水平扩展 worker，该把慢活挪出请求路径。
