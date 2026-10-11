# Python

> 这一篇是后端那几篇的地基文件。MySQL / Redis / FastAPI 里零零散散用到的语法（类型标注、生成器、上下文管理器、异步、虚拟环境、依赖管理）在这里拼齐。
>
> 不打算替掉任何一本「入门到精通」。重点放在 **后端日常** 会用到的部分：装环境、写函数、读懂别人的接口、碰到坑知道去哪查。
>
> 没见过的词第一次会用人话解释。建议先会一点任意一门语言的函数、列表、循环；浏览器有搜索就行，不必先学后端。
>
> 读的顺序：是什么 → 基础 → 怎么跑起来（原理） → 进阶 → 场景 → 痛点 → 面试题。原理那节最重要，前面都是为它服务的。
>
> 你已经会一点也行——目录里点「基础」，看自己还没用过的语法。

---

## 是什么，能做什么

Python 是脚本语言里被用得最广的那一种：语法短，标准库大，写起来像英文。**后端日常用 Python 干三件事：**

1. **写接口**——FastAPI、Flask、Django 一类 Web 框架都是 Python 包；[FastAPI](../fastapi/FastAPI.md) 就是其中一种
2. **当胶水**——把数据库、Redis、大模型、爬虫、Excel 拼起来跑任务：拉一份 CSV，丢给模型，把结果塞回 MySQL
3. **当「跑一下」的工具**——一次性脚本：批量改名、跑数据迁移、解析日志

它 **不是**：JS 那种浏览器脚本、纯计算最快的那把刀（那是 CGo，生物圈）、移动 App 的主力语言。性能不够时，常见做法是「Python 负责编排，关键路径用 Rust/CGo 写扩展」，而不是换语言。

| 能做 | 不要默认靠它做 |
|---|---|
| Web 接口 / BFF | 操作系统级高性能服务（多走 CGo/Rust 扩展或换 Go） |
| 数据处理、爬虫、脚本、自动化 | 浏览器前端（那是 TS/JS） |
| 接 LLM / RAG / Embedding（用 SDK） | 超大并发连接（异步可以顶一阵，多核得显式扩 worker） |
| 教学、入门、运维工具 | 一次性写 GUI（用 Electron、Tauri 也好） |

不学 Python，你也可以用 Node、Go、Java 写后端。痛点是：**数据科学、机器学习生态（NumPy、pandas、PyTorch、LangChain）几乎全是 Python**；想跟这些生态沾边，多数时候绕不开。

---

## 基础用法

### 装 Python：不要装系统 Python

macOS 自带一个 Python 3，新手常常一上来就在它上面 `pip install`。这会有两个麻烦：自带的版本老、装包写到系统目录要 sudo、Homebrew 一动就被替换。

正规做法：

1. 装一个版本管理工具——`pyenv`（macOS / Linux）或官方安装包（macOS）直接装一份 3.12 以上。
2. 装 **虚拟环境**：每个项目一份，互不污染。

```bash
python3 --version
python3 -m venv .venv
source .venv/bin/activate       # macOS / Linux
.\\.venv\\Scripts\\activate       # Windows PowerShell
deactivate                     # 退出
```

激活后命令行会多一个 `(venv)`。**所有 `pip install` 都装在这份虚拟环境里**，不会动到系统 Python。

`.venv/` 不进 Git（加进 `.gitignore`）。这是项目自己重建的，不该入库。

更现代一档：把依赖写进 `pyproject.toml`（`uv` / `poetry` 管）。小项目还是 `requirements.txt`：

```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

### 最小能跑起来的脚本

```python
# greet.py
name = input("你的名字？")
print(f"你好，{name}")
```

```bash
python greet.py
```

两个常被忽略的细节：

- 文件首行 `#!/usr/bin/env python3` + `chmod +x` 可以直接当可执行文件：`./greet.py`
- 顶上 `# -*- coding: utf-8 -*-` 现在不用写，Python 3 默认 UTF-8

### 类型标注：编辑器补全的钥匙

```python
def add(a: int, b: int) -> int:
    return a + b

from typing import Optional, List, Dict

names: list[str] = []                # 内置直接用 list[str]
mapping: dict[str, int] = {}         # 3.9+ 起 PEP 585 写法
maybe: Optional[int] = None          # 等价于 int | None
```

- 标注是 **提示**，运行时 **不强制**。`add("a", "b")` 不会报错，只是编辑器会红。
- FastAPI / Pydantic 那一类库会 **读** 标注来校验，那时它就变成运行时检查了。
- 数据结构经常变、又不想每个都标：用 `Any` 或干脆不标。过度标注比不标更碍事。

### 常用容器

```python
# 列表 list：有序、可改
xs = [1, 2, 3]
xs.append(4)
xs[0]                               # 1
xs[-1]                              # 4
xs[1:3]                             # [2, 3]，左闭右开

# 字典 dict：键值对
ages = {"alice": 30, "bob": 25}
ages["alice"]
ages.get("cathy", 0)                # 默认值 0

# 集合 set：去重、查存在
seen = {1, 2, 3}
2 in seen                           # True

# 元组 tuple：有序、不可改，常当返回值
point = (10, 20)
```

列表推导式是后端最常用的小技巧：

```python
nums = [1, 2, 3, 4]
doubled = [n * 2 for n in nums if n > 1]   # [4, 6, 8]
```

和它对应的「生成器表达式」用圆括号，不一次性建列表：

```python
total = sum(n * 2 for n in nums if n > 1)  # 不造中间列表
```

### 函数：默认参数、可变默认值、关键字

```python
def greet(name: str, greeting: str = "你好") -> str:
    return f"{greeting}, {name}"

print(greet("ada"))                          # 你好, ada
print(greet("ada", greeting="hi"))           # hi, ada
```

**坑：可变默认值。** `def f(items=[]):` 的 `[]` 是函数定义时就建好的那个对象，每次调用都会 **复用** 它。要避免：

```python
def f(items=None):
    items = items or []
    items.append(1)
    return items
```

### 类：基础

```python
class User:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def __repr__(self) -> str:               # 调试时打印用
        return f"User({self.name!r}, {self.age})"

    def __hash__(self) -> int:               # 想放进 set / 当 dict key 时需要
        return hash((self.name, self.age))

    def __eq__(self, other) -> bool:         # 通常和 __hash__ 一起写
        return isinstance(other, User) and (self.name, self.age) == (other.name, other.age)
```

自带「魔法方法」（前后两个下划线）：`__init__` 构造、`__repr__` 调试打印、`__eq__` 相等、`__len__` 给 `len(obj)` 用。后端代码 **少写自己造轮子的类**，能用 dataclass / Pydantic 就别手写。

### dataclass：少写模板代码

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

u = User("ada", 30)
u == User("ada", 30)                         # True
```

要不可变：`@dataclass(frozen=True)`。后端往接口 / 数据库传的「纯数据」组件里 dataclass 比手写类短很多。Pydantic `BaseModel` 是它的运行时校验版，见 [FastAPI](../fastapi/FastAPI.md)。

### 上下文管理器：`with`

```python
with open("a.txt", "r", encoding="utf-8") as f:
    data = f.read()
# 出 with 时 f 自动关掉，哪怕中间抛错
```

数据库连接、文件、锁，都走 `with`。等价于：

```python
f = open("a.txt")
try:
    data = f.read()
finally:
    f.close()
```

自己写一个上下文管理器（需要拆 FastAPI `Depends` 里的 `yield` 那种收尾时会用到）：

```python
from contextlib import contextmanager

@contextmanager
def timer(label: str):
    import time
    t0 = time.perf_counter()
    try:
        yield                       # with 块从这里开始
    finally:
        print(f"{label}: {time.perf_counter() - t0:.3f}s")

with timer("load"):
    do_work()
```

FastAPI 的依赖注入（`yield db` + finally 里关连接）就是这个套路。

### 生成器：值一个一个流

```python
def count_up_to(n: int):
    i = 0
    while i < n:
        yield i                     # 每次 next() 跑到这里交一个值
        i += 1

for x in count_up_to(3):
    print(x)                        # 0 1 2
```

生成器是「懒」的——不在内存里攒整个列表。读大文件、流式接口、批量处理的时候常用：

```python
def read_lines(path: str):
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")
```

### 错误处理

```python
try:
    raw = int(input("几岁？"))
except ValueError:
    print("不是数字")
else:
    print("好的", raw)
finally:
    print("收尾")
```

- `try` 后只接 **可能真会抛** 的代码，不要用 `try` 包大段流程做「防御」
- `except Exception` 把所有异常吃掉 = 抓不到真问题；能 `except ValueError` 就不要 `except Exception`
- 想知道类型：`raise ValueError("xxx") from e`，抛的时候把原因带上

### 模块与包

```text
my_app/
  __init__.py            # 留空也行，表示这是一个包
  main.py
  routes/
    __init__.py
    users.py
```

```python
# 同一包内引用
from my_app.routes import users
from .routes import users           # 同一包内的相对引用
from .. import settings            # 上上级
```

包名、模块名一律小写下划线；类用大驼峰。`from module import *` 几乎永远别用，会污染命名空间。

### 第三方包怎么装

```bash
pip install fastapi uvicorn
pip install "fastapi>=0.110,<0.120"        # 锁范围
pip install -U fastapi                      # 升级
pip uninstall fastapi
```

装镜像（国内常见）：

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi
```

镜像源通常写在 `~/.pip/pip.conf`（Linux/macOS）或项目里的 `pyproject.toml`，不必每次敲。

---

## 怎么跑起来（原理）

后端写 Python 经常卡的不是语法，是 **它怎么被解释、怎么装包、怎么跑服务**。这一节把人话版讲清楚。

### CPython：`python` 命令到底在跑什么

输入 `python script.py`：

1. 解释器把 `.py` 编译成 **字节码**（`.pyc`），类似 JS 的 V8 把 JS 编译成机器码前的中间表示
2. 字节码丢进 **虚拟机**（VM）执行
3. 想要原生速度的部分（`numpy`、`cryptography`）用 C 写的 `.so` 直接调用

所以 Python 慢，**不是**字节码慢，是 VM 里一行行解释慢。NumPy / pandas / PyTorch 这些库 99% 的工作是用 C / C++ / CUDA 跑，Python 只负责调度。这就是「用 Python 写却不慢」的常见原因。

其他解释器还有 **PyPy**（JIT，更快）、**Jython**（跑在 JVM）、**MicroPython**（嵌入式）。后端基本只看 CPython。版本至少 3.10+，3.12 / 3.13 性能和新语法更香。

### `import`：包是怎么找的

```python
import json                          # 标准库
import fastapi                       # 第三方（site-packages 里）
from my_app.routes import users      # 项目里
```

Python 按 `sys.path` 这个列表顺序找模块：

1. 当前脚本所在目录
2. `PYTHONPATH` 环境变量里的目录
3. 标准库目录
4. `site-packages`（虚拟环境下的 `lib/python3.X/site-packages`）

名字撞车多是因为 `PYTHONPATH` 或者当前目录里有个同名文件。先 `python -c "import sys; print(sys.path)"` 看一眼。

### 虚拟环境为什么不是装 Python

`python -m venv .venv` 其实是 **不重装 Python**，而是：

1. 建一个空目录
2. 拷 / 软链一份 Python 解释器到 `.venv/bin/python`
3. 让 `.venv/bin/python` 启动时把 `sys.path` 第一项指向 `.venv/lib/.../site-packages`

激活（`source .venv/bin/activate`）只是改 `PATH`，让 `python` / `pip` 先找到虚拟环境里那份。**没激活也照样用**：直接 `.venv/bin/python script.py` 或 `.venv/bin/pip install ...`。

Docker 里通常连激活都不要，直接用解释器绝对路径。

### 异步：和事件循环一句话

```python
import asyncio

async def fetch_one(url: str) -> str:
    # 等网络时事件循环能去跑别的请求
    ...

async def main() -> None:
    a, b = await asyncio.gather(fetch_one(u1), fetch_one(u2))
```

- `async def` 定义协程函数；调用它拿到 **协程对象**，不直接跑
- `await` 让出 CPU，VM 回头跑别的协程
- 同步阻塞代码（`time.sleep`、同步 requests、`time.sleep(60)`）在协程里 = 把循环冻住
- CPU 重活（解一个大文件、压缩一张图）丢进程池：`asyncio.to_thread(...)` 或 `loop.run_in_executor(...)`

完整原理见 [FastAPI](../fastapi/FastAPI.md) 里的「`def` 和 `async def`：事件循环」。

### `__name__ == "__main__"`

```python
# my_script.py
def main():
    print("hello")

if __name__ == "__main__":
    main()
```

直接 `python my_script.py`：进 main。被别人 `import my_script`：**不**进 main。这是把「脚本」和「可复用模块」分开最常见的写法。

---

## 进阶用法

### 装饰器

```python
import functools
import time

def timer(fn):
    @functools.wraps(fn)              # 保住原函数的名字 / docstring
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {time.perf_counter() - t0:.3f}s")
    return wrapper

@timer
def add(a: int, b: int) -> int:
    return a + b
```

看到 `@something`：**它是一个函数**，接受下面那个函数当参数，返回一个新函数。这是后端框架最常用的钩子机制——FastAPI 的 `@app.get`、pytest 的 `@fixture`、SQLAlchemy 的 `@validates` 都是同一个套路。

带参数的装饰器（外面再包一层）：

```python
def retry(times: int):
    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for i in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if i == times - 1:
                        raise
        return wrapper
    return deco

@retry(times=3)
def flaky():
    ...
```

### `*args` / `**kwargs` 与解包

```python
def f(*args, **kwargs):              # args: tuple，kwargs: dict
    ...

f(1, 2, x=10, y=20)

xs = [1, 2]
dict1 = {"x": 10, "y": 20}
f(*xs, **dict1)                       # 等价于 f(1, 2, x=10, y=20)
```

转发参数给被别的函数时这两个几乎一定出现。**自己写的接口不要无脑塞 `**kwargs`**——失去类型提示，调试噩梦。

### 路径与文件

```python
from pathlib import Path

p = Path("uploads") / "2026" / "10" / "a.txt"
str(p)                                # "uploads/2026/10/a.txt"
Path("/tmp").exists()
p.parent
p.suffix                              # ".txt"
p.read_text(encoding="utf-8")
p.write_text("hi", encoding="utf-8")
for line in p.read_text().splitlines():
    ...
```

`pathlib` 比 `os.path` 好读。涉及权限 / 环境变量目录时仍然要 `os.environ` / `os.chmod`。

### 环境变量与配置

```python
import os

db = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
```

真实项目用 `pydantic-settings`，见 [FastAPI](../fastapi/FastAPI.md)。**不要** 把密钥 / 数据库地址硬编码进 Python 文件——会进 Git、会上日志、会被别人看到。

### 日志

```python
import logging

log = logging.getLogger(__name__)     # 模块自己的 logger

log.info("开始加载")
log.warning("找不到配置文件，用默认")
log.exception("崩了")                  # 自动带堆栈
```

- `print` 是给人看的，**生产别用**——很难关掉，没有级别，没有时间
- `logging` 是给运维 / 排障用的，能按级别过滤、能写文件、能接 Sentry
- 起服务时统一配一次：`logging.basicConfig(level=logging.INFO)`

### 单元测试

```python
# test_add.py
from my_app.calc import add

def test_add_basic():
    assert add(1, 2) == 3

def test_add_negative():
    assert add(-1, 1) == 0
```

```bash
pip install pytest
pytest -q
```

- 文件名 `test_*.py` / `*_test.py`
- 函数名以 `test_` 开头
- 跑得慢的（DB、外部 HTTP）丢 `@pytest.mark.slow`，平时跳过
- HTTP 接口走 FastAPI 的 `TestClient`，不用真起端口

### 打包成可执行

不需要解释器就能跑：用 `pyinstaller --onefile script.py`。产物是单文件，体积大、启动慢，但是给非 Python 用户用最省事。服务器内部署几乎都用 `pip install` 装包，没人会用 `pyinstaller`。

### 常用内置库（按场景）

| 场景 | 库 |
|---|---|
| HTTP 客户端 | `requests`（同步）/ `httpx`（异步） |
| JSON | `json` 标准库够用 |
| 命令行参数 | `argparse` / `click` / `typer` |
| 时间 | `datetime` / `zoneinfo`（时区） |
| 并发 | `concurrent.futures`（线程池 / 进程池） |
| 加密 / hash | `hashlib` / `secrets` |
| CSV | `csv` 标准库 |
| 数据 | `pandas`（装一下） |
| 环境隔离 | `venv` / `pyenv` / `uv` |

---

## 常用场景

**写一个接 JSON 的接口。** FastAPI 起服务、Pydantic 校验参数、`uvicorn` 跑。详见 [FastAPI](../fastapi/FastAPI.md)。

**爬一份网页。** `requests` 或 `httpx` 拿 HTML，`BeautifulSoup` 解析。注意 robots.txt 和频率。

**批处理 CSV。** `csv` 标准库读，`pandas` 处理大数据。读入之后一行处理逻辑就够了。

**调用大模型 / Embedding。** 装对应 SDK（`openai` / `dashscope` / `anthropic`），按 token 计费。Prompt 和 key 走环境变量。

**做 RAG。** 见 [RAG](../RAG.md) 和 [向量数据库](../向量数据库.md)。切片 → 嵌入 → 入库 → 检索 → 拼 prompt → 调模型，Python 全程。

**数据迁移。** 一次性脚本，读一份老库（MySQL / Postgres / CSV），写新库。事务 + 分批 + 失败重跑。

**运维脚本。** cron / systemd 起 Python，`logging` 落文件，错误发邮件或 Sentry。

**定时任务。** `APScheduler`（进程内）或交给外部 `cron` / 任务系统。看可观测性选后者。

**何时不要用 Python。** 极高 QPS 的纯计算、内存极敏感的热路径、系统级工具的 CLI——多走 Go / Rust。

---

## 不用 Python 时的痛点，以及怎么解决

**装包装到系统 Python 去了。** sudo pip install、版本冲撞、Homebrew 一动就坏。修：项目里 **永远用虚拟环境**，`python -m venv .venv`，所有 `pip install` 都在里面。

**`python` 命令指向错。** `which python` / `python --version` 不对。修：明确用 `.venv/bin/python`，或 `pyenv local 3.12` 锁住版本。

**包装了但 import 不到。** `ModuleNotFoundFound`。修：检查当前用的 `python` 和装包用的 `pip` 是不是同一份——虚拟环境没激活、或者 `pip` 指向系统。`python -m pip install ...` 比 `pip install ...` 安全，永远用前者。

**中文乱码 / Windows GBK。** 修：文件统一 `encoding="utf-8"`；环境变量 `PYTHONIOENCODING=utf-8`；Windows Terminal 用 UTF-8。

**脚本跑一半崩了没看到原因。** `print` 当日志。修：换 `logging`，异常用 `log.exception(...)` 自动带堆栈。

**改了文件没生效。** 进程还在跑老的。修：起服务时 `--reload`（开发），或者用 `supervisor` / `systemd` 自动重拉。

**`pip install` 超时。** 换镜像源（清华 / 阿里），或用 `uv`（极快）。

**环境不一样：本地能跑，服务器炸。** 修：`requirements.txt` 锁版本；Docker 把 Python 和包一起打包，是终极解。

**同步阻塞代码塞进 `async def`。** 整个事件循环被卡，别的请求一起排队。修：IO 用异步库；不得不同步就用 `asyncio.to_thread`。

**生成器忘了 `yield` 就是普通函数。** 一开始拿不到值。修：`yield` 是生成器的开关；调试时 `type(f)` 看是 `function` 还是 `generator`。

**循环里 `requests.get` 串行慢。** N 次网络串行。修：`asyncio.gather`（异步）或 `concurrent.futures.ThreadPoolExecutor`（同步）。

**判断不出「为什么慢」。** 修：`cProfile` / `py-spy` 看热点；`logging` 加耗时；查数据库走索引，**慢通常不在 Python，在 I/O**。

一条判断标准：这是 **业务编排、胶水、脚本、教学、数据 / AI**，用 Python；这是 **浏览器前端、极致性能、嵌入式**，换语言。

---

## 常见面试题

**Python 2 和 Python 3 还能选吗？**

不能。Python 2 已 EOL，社区和生态全部 3。新项目一律 3.10+。面试出现「Python 2」大概率考的是编码（bytes / str）和 print。

**GIL 是什么？多线程能并行吗？**

Global Interpreter Lock：同一进程内 Python 字节码同时只跑一个线程。CPU 密集任务多线程没用；要并行用多进程（`multiprocessing` / `ProcessPoolExecutor`）。IO 密集（网络、磁盘）多线程仍能提效，因为等 IO 时 GIL 释放。CPU 重又想简单：JIT（PyPy）或换 Go / Rust，或丢给原生扩展。

**list 和 tuple 的差别？**

list 可变、有 `append` / `extend`，后端绝大多数时候用这个；tuple 不可变、可以当 dict key、可以当 `*` 解包返回值。常量序列、记录式数据用 tuple，可变容器用 list。

**深拷贝和浅拷贝？**

浅拷贝只复制一层；深拷贝递归复制全部子对象。嵌套结构（list of dict、dict of list）默认复制是浅拷贝，改内层会影响原对象。`copy.deepcopy(x)` 才是真深拷。`x.copy()`、`list(x)`、`[:]` 都是浅拷。

**`is` 和 `==` 有什么区别？**

`==` 调 `__eq__`，值相等；`is` 比较是不是同一个对象（`id()` 一致）。常见误用：`a is None` 是对的，`a == None` 也能跑但建议前者。小整数和小字符串 CPython 会复用对象，`is` 偶尔能蒙对，但不要依赖。

**生成器 vs 列表推导式？**

生成器（`(... for ...)`）懒，下一次才算一个值，省内存；列表推导式（`[...]`）一次造好，能反复用、知道长度。数据大、流式、可能提前 break → 生成器；数据小、要多次访问 → 列表。

**装饰器是什么？**

函数包函数。`@timer` 等价于 `f = timer(f)`。看到 `@something`：它接受下面那个函数，返回一个新的。要保住原函数元数据（`__name__`、docstring），装饰器内部用 `@functools.wraps(fn)`。

**`async` / `await` 的本质是什么？**

协程：一个可以在某点让出、之后接着跑的函数。`async def` 定义协程函数，`await` 让出控制权，事件循环负责调度。同进程内 IO 密集并发能提效；CPU 密集没用。看完整说明见 [FastAPI](../fastapi/FastAPI.md)。

**GIL、协程、多进程怎么选？**

IO 密集（HTTP、DB、文件、Redis）→ 协程或线程池；CPU 密集（图像、加密、解码）→ 多进程或原生扩展；网络 IO 想简单 → `concurrent.futures.ThreadPoolExecutor`；想统一 → FastAPI + async / 异步驱动。

**`with` 在干什么？**

保证进入时拿资源、退出时释放（即使中间抛错）。文件、锁、连接都用它。自定义：实现 `__enter__` / `__exit__`，或用 `@contextmanager` + `yield`。

**为什么列表推导式有时反而比 `for` 慢？**

通常 **不会**。理解反是专门优化的字节码路径，比手写 `for + append` 还快一点。如果你看到慢，多半是里面写了脏活（多余函数调用、I/O），不是理解反本身的问题。

**`requirements.txt` 还是 `pyproject.toml`？**

小项目 `requirements.txt` 够用。大项目 / 库 / 想拿到 install / 多环境分组 → `pyproject.toml`（PEP 621），用 `uv` / `poetry` 管。这不是非此即彼——先把 `requirements.txt` 锁好，再升级。

**`pip install -U` 升级会不会崩？**

会。生产前看 changelog，先在测试环境跑一遍。能锁版本就锁：`fastapi==0.115.0`，比 `>=` 稳。

**为什么我的函数跑得慢？**

99% 不是 Python 慢，是 I/O 慢 / 算法差 / DB 没走索引。先用 `cProfile` / `py-spy` 找热点，再决定动哪。看 [索引](../数据库/索引/索引.md) 和 [事务](../数据库/事务/事务.md)。

**虚拟环境和 Docker 是什么关系？**

虚拟环境：**同一台机器上多个项目的 Python 包互不污染**。Docker：**整个运行环境**（操作系统 + Python + 包 + 配置）打包，是虚拟环境的超集。容器里通常也会建一层 venv，但多数情况直接装在系统 site-packages 也行。详见 [Docker](../docker/Docker.md)。
