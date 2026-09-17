# FastAPI

> 建议先看完 [MySQL](../数据库/MySQL.md)，[Redis](../redis/Redis.md) 能看更好。
> 下一篇是页面：[Next.js](../nextjs/Nextjs.md)。最后用 [Docker](../docker/Docker.md) 把它们一起跑起来。
>
> FastAPI 是用 Python 写 **HTTP 接口** 的框架。浏览器 / Next.js 找它要数据，它再去问 MySQL、Redis。

---

## 是什么，能做什么

可以想成餐厅里的**服务员**：

- 客人（Next.js 页面）说「我要商品 42」
- 服务员（FastAPI）去后厨（MySQL）取，热菜还可以先看保温台（Redis）
- 把结果端回给客人

你写的是一个个 **路径 + 函数**：访问 `GET /products/42` 就跑这个函数，返回 JSON。

自带两样对初学者很友好的东西：

1. **Pydantic**：用类型描述「请求长什么样」，不对就自动 422，不必手写一堆 `if`。
2. **`/docs`**：启动后打开这个地址，能看见所有接口，还能点一下试。

| 能做                    | 不要靠它做                     |
| --------------------- | ------------------------- |
| 给页面提供 JSON 接口         | 取代 MySQL 存订单              |
| 校验参数、上传文件、SSE 打字机     | 画页面（那是 Next.js）           |
| 调 MySQL / Redis / 大模型 | 在一个请求里慢慢处理 200MB PDF（放队列） |
| 自动生成接口文档              | 把运行环境打包（那是 Docker）        |

没有 FastAPI，你也可以用 Flask、甚至纯 Next.js 的 Route Handler 写接口。痛点出现在：**参数校验要手写、文档没有、文件上传和打字机流不好接、业务和页面揉在一起。**

---

## 基础用法

### 最小能跑起来的例子

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
- `--reload`：改代码自动重启，开发用
- `--host 0.0.0.0`：在 Docker 里必须这样，否则容器外访问不到，见 [Docker](../docker/Docker.md)

打开 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) 就能点接口。这比先写前端省事。

### GET / POST，参数从哪来

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()

# 路径参数：/products/42 里的 42
@app.get("/products/{id}")
def get_product(id: int):
    return {"id": id}

# 查询参数：/products?status=on&page=1
@app.get("/products")
def list_products(status: str = "on", page: int = Query(1, ge=1)):
    return {"status": status, "page": page}

class OrderIn(BaseModel):
    product_id: int
    amount: int

# JSON 请求体：POST 过来的 { "product_id": 42, "amount": 1 }
@app.post("/orders")
def create_order(body: OrderIn):
    return {"product_id": body.product_id, "amount": body.amount}
```

| 位置 | 例子 | 人话 |
|---|---|---|
| 路径 | `/products/{id}` | 资源是哪一个 |
| Query | `?page=1` | 过滤、分页，可有可无的条件 |
| Body | JSON | 创建、修改时提交的数据 |
| Header | `Authorization` | 登录令牌这类 |

`id: int` 不是摆设：有人传 `abc`，FastAPI 直接 422，并告诉你哪一格不对。`Query(1, ge=1)` 表示默认第 1 页，且必须 ≥ 1。

### 返回错误，不要只 `return {"error": ...}` 还 200

```python
from fastapi import HTTPException

@app.get("/products/{id}")
def get_product(id: int):
    if id <= 0:
        raise HTTPException(status_code=404, detail="商品不存在")
    return {"id": id}
```

页面那边看 HTTP 状态码：200 成功，404 没有，422 参数不对，429 被限流，500 服务器自己炸了。

### 依赖注入：把「连数据库」从每个接口里抽出去

`Depends` 可以先理解成：跑接口之前，先帮我准备好一样东西（数据库连接、当前用户）。

```python
from fastapi import Depends

def get_db():
    db = "这里本应是 MySQL 连接"
    try:
        yield db
    finally:
        pass  # 关闭连接

@app.get("/products/{id}")
def get_product(id: int, db = Depends(get_db)):
    return {"id": id}
```

初学先知道有这个钩子。真连 MySQL 时，把 `yield db` 换成连接池即可，不必每个函数里 `open/close`。

### 给 Next.js 开 CORS（跨域）

页面在 `localhost:3000`，接口在 `localhost:8000`，浏览器会拦。接口这边要允许对方来访：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

生产环境把 `allow_origins` 换成真正的前端域名，不要写成 `*` 还带 cookie。

### 上传文件

```python
from fastapi import UploadFile, File

@app.post("/rag/files")
async def upload(file: UploadFile = File(...)):
    # file.filename 文件名；file.content_type 类型
    data = await file.read()          # 小文件可以；大文件请改成分块写磁盘
    return {"name": file.filename, "size": len(data)}
```

大 PDF 不要 `await file.read()` 一次进内存。改成一边读一边写入 `uploads/`，MySQL 只记文件名和状态，见下面场景。

### SSE：把字一个一个推出去

SSE = 服务器推事件：连接一直开着，接口不断往外写 `data: ...`。网页上就像打字机。

```python
import asyncio
from fastapi.responses import StreamingResponse

@app.get("/gen/stream")
async def gen_stream():
    async def chunks():
        for ch in ["茅", "台", "是", "酱", "香", "型"]:
            yield f"data: {ch}\n\n"
            await asyncio.sleep(0.05)
        yield "data: [DONE]\n\n"

    return StreamingResponse(chunks(), media_type="text/event-stream")
```

注意两点：必须是 `text/event-stream`；每一段以空行结束（`\n\n`）。前端怎么接，见 [Next.js](../nextjs/Nextjs.md)。

`async def` 表示这个函数里可以 `await` 等待（等数据库、等模型）而不把整个进程卡死。调 MySQL 的短查询用普通 `def` 也行；等大模型、等文件，用 `async` 更合适。

---

## 常用场景

都假设：数据在 MySQL，缓存和限流在 Redis，页面在 Next.js。

**商品详情。** `GET /products/{id}`：先 `GET product:{id}:detail`，没有再 `SELECT` MySQL，再 `SET EX 300`。见 [Redis](../redis/Redis.md)。

**后台列表。** `GET /products?status=on&page=1`：`WHERE status=? ORDER BY id DESC LIMIT 20`。不要用很大的 `OFFSET`。

**下单。** `POST /orders`：`START TRANSACTION`，插入订单 + `UPDATE ... stock >= 1`，失败 `ROLLBACK`。见 [事务](../数据库/事务/事务.md)。幂等 key 可以放 Header 里，Redis `SET NX` 挡住重复提交。

**生成商品详情。** `POST /products/{id}/gen` 不要在请求里死等模型 30 秒。更稳的两种：

1. 立刻返回「生成中」，后台跑完再 `UPDATE` + 删缓存；页面轮询或 SSE 听进度
2. 直接 SSE 把模型输出流给页面（打字机）

两种都不要把「调模型」包进 MySQL 事务里。

**RAG 上传。** `POST /rag/files`：文件写磁盘 → MySQL 插一条 `status=pending` → Redis `LPUSH rag:parse {id}` → 立刻返回。工人进程去切片、向量化，最后回写 MySQL。接口进程不当切片工人。

**登录限流。** 在依赖里 `INCR login:ip:{ip}`，超过就 `HTTPException(429)`。验证码同理，key 带 `EX 300`。

**健康检查。** `GET /health` 给 Docker / 前端探活，不要让它去跑复杂查询。

---

## 不用 FastAPI 的痛点，以及怎么解决

**把查库、下单全写在 Next.js 里。** 页面仓库会堆满 SQL 和密钥，App 以后也用不了同一套逻辑。页面只调 HTTP，SQL 放 FastAPI。

**每个接口手写 `if not body.name`。** 漏一个就 500。用 Pydantic 模型，类型和必填交给框架。

**成功失败都返回 200，错误写在 JSON 里。** 前端要猜。用 `HTTPException`，404 / 422 / 429 各是各的。

**大模型 / 切 PDF 写在接口函数里同步死等。** 用户刷新、网关超时、进程被占满。短等待可以 SSE；长任务进 Redis 队列，接口只记账。

**上传 200MB 一次 `read()` 进内存。** 进程被撑爆。分块写磁盘，MySQL 只存路径。

**本地能调通，Next.js 一上来就 CORS 报错。** 不是 Python 崩了，是浏览器跨端口拦截。加 `CORSMiddleware`，只放行前端源。

**改完代码不知道接口长什么样。** 打开 `/docs`。这是 FastAPI 相对手写 Flask 最明显的好处之一。

**在 Docker 里听 `127.0.0.1`，浏览器打不开。** 改 `--host 0.0.0.0`，见 [Docker](../docker/Docker.md)。

一条判断标准：这是 **给页面用的接口和校验**，放 FastAPI；这是 **必须落盘的真相**，放 MySQL；这是 **加速和短状态**，放 Redis；这是 **人看见的页面**，放 Next.js。

---

## 常见面试题

**FastAPI 和 Flask / Django 怎么选？**

Flask 更轻，校验和文档要自己接。Django 带后台和管理员，偏整站。FastAPI 适合「纯接口 + 类型校验 + 自动文档」，异步也顺手。酒类商城这种「Next.js 页面 + Python 接口 + MySQL」用 FastAPI 很合适。

**Pydantic 是干什么的？**

用 class 描述数据长什么样。请求一进来就按这个形状检查，不对自动 422。返回也可以用它，文档里的示例也从这里来。

**`Depends` 是什么？**

接口跑之前先执行的准备工作：开数据库、取当前用户、做限流。很多接口共用同一段逻辑时，不要复制粘贴，抽成 Depends。

**`def` 和 `async def` 怎么选？**

函数里没有 `await`，用 `def` 即可（FastAPI 会丢到线程池）。要等 Redis、httpx 调模型、文件流，用 `async def`。不要在 `async def` 里写卡住的 `time.sleep` 或同步的大计算。

**SSE 和 WebSocket 有什么不同？**

SSE 是服务器单向推，刚好做打字机。WebSocket 是双向，聊天室、协同编辑才需要。能 SSE 就别上 WebSocket，简单很多。

**为什么不在接口里开一个超长事务等模型？**

锁会一直拿着，别人下单要排队，还可能超时。模型在事务外跑完，最后一条短 `UPDATE`。见 [事务](../数据库/事务/事务.md)。

**跨域是前端的事还是后端的事？**

浏览器拦的，但**放行名单写在后端**。FastAPI 加 CORS 中间件。Next.js 若用服务端 `fetch` 打 FastAPI（不经过浏览器），则没有 CORS 问题——这是两种调用方式，Next 篇会对比。
