# Docker

> 建议先知道 [MySQL](../数据库/MySQL.md) 和 [Redis](../redis/Redis.md) 各自干什么，再看这篇：怎么让它们在任何电脑上用同一条命令跑起来。
>
> 应用代码仍在 Git 里，用户和订单仍在 MySQL 里。Docker 管的是**运行环境**（Python 版本、MySQL 怎么装、端口谁占用）。

---

## 是什么，能做什么

没有 Docker 时常见的场面：你电脑是 Python 3.12 + MySQL 8，同事是 3.10，服务器还没装 Redis。同一份代码，三台机器三种死法。

Docker 的思路像**外卖打包**：把「能跑起来的那一套」封进一个盒子，换厨房加热就能吃，不必每到一个地方先买齐锅碗。

四个词，后面会反复出现：

| 词 | 人话 | 丢了会怎样 |
|---|---|---|
| **镜像** image | 只读的模板，一张「安装说明书 + 已经装好的软件」 | 还能重新下载 / 重新打包 |
| **容器** container | 用镜像跑起来的进程，一个正在工作的盒子 | 停掉、删掉，盒子里没另存的文件就没了 |
| **卷** volume | 盒子外面的U盘，专门放不能丢的数据 | 数据库真正活在这里 |
| **网络** network | 几个盒子所在的局域网 | 它们才能用名字找到对方 |

| 能做 | 不要靠它做 |
|---|---|
| 一条命令拉起 MySQL + Redis + 接口 | 替代 Git 存代码 |
| 新电脑几分钟对齐环境 | 替代 MySQL 存订单 |
| 依赖版本锁死在文件里 | 让查询自动变快（那是索引 / Redis） |

本地直接 `python` 跑接口调试，可以不用 Docker。痛点出现在：**换机器跑不起来、MySQL 和 Redis 安装说明写了三页、线上和你电脑不是同一套版本。**

---

## 基础用法

### 日常命令（先当「下载模板 → 跑起来 → 看看日志」）

```bash
docker pull mysql:8.0          # 下载 MySQL 8 的镜像
docker images                  # 看看本地有哪些镜像
docker run --name db \
  -e MYSQL_ROOT_PASSWORD=secret \
  -p 3306:3306 \
  -d mysql:8.0                 # 用这个镜像跑一个叫 db 的容器
docker ps                      # 正在跑的容器
docker logs -f db              # 看日志，-f 表示一直跟
docker exec -it db mysql -uroot -p   # 进到容器里打开 mysql
docker stop db                 # 停
docker rm db                   # 删容器（镜像还在）
```

`-p 3306:3306` 读作「宿主机端口:容器端口」。宿主机 = 你的电脑。这样你在电脑上用 `127.0.0.1:3306` 就能连进去调试。

盒子和盒子互相访问，走网络即可，不必每个服务都 `-p` 映射到电脑上。

### 数据必须放卷上

容器删了，容器里面的文件默认就没了。MySQL 的数据文件要挂到卷上，相当于插了一根U盘：

```bash
docker volume create mysqldata
docker run --name db \
  -e MYSQL_ROOT_PASSWORD=secret \
  -v mysqldata:/var/lib/mysql \
  -p 3306:3306 -d mysql:8.0
```

`-v mysqldata:/var/lib/mysql`：左边是卷的名字，右边是容器里 MySQL 放数据的目录。删容器、再新建容器，库还在。

### Dockerfile：把你的接口也做成镜像

项目根目录放一个叫 `Dockerfile` 的文件（没有后缀），内容是「从哪出发、装什么、怎么启动」。

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

一行行人话：

1. 从官方 Python 3.12 小镜像开始
2. 工作目录放到 `/app`
3. 先只复制依赖清单，再安装——依赖没变时，这一层可以走缓存，不用每次重装
4. 再复制你的代码
5. 声明容器听 8000 端口
6. 启动命令。**`--host 0.0.0.0` 很重要**：听 `127.0.0.1` 时只有容器自己能访问，你的浏览器进不去

另外两件小事：

- 密码、API Key 不要写进 Dockerfile，用环境变量传入
- 同目录放 `.dockerignore`，把 `.git`、`__pycache__`、`.env` 排除，镜像才小，密钥也不会被打进去

```bash
docker build -t wine-api .
docker run --rm -p 8000:8000 --env-file .env wine-api
```

### Compose：MySQL + Redis + 接口一起起

一个人开发时最有用的就是这一份 `compose.yaml`。三个服务放在同一网络里，用名字互相找。

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: wine_station
    volumes:
      - mysqldata:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-psecret"]
      interval: 5s
      retries: 10

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://root:secret@db:3306/wine_station
      REDIS_URL: redis://redis:6379/0
    volumes:
      - .:/app
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

volumes:
  mysqldata:
```

```bash
docker compose up --build   # 构建并启动
docker compose ps           # 三个都在跑吗
docker compose logs -f api  # 看接口日志
docker compose down         # 停容器，卷还在，数据还在
docker compose down -v      # 连 mysqldata 一起删，库没了
```

初学最容易踩的三个坑：

1. 连接串里写 `db`、`redis`，不是 `localhost`。`localhost` 在 api 容器里是它自己。
2. `depends_on` 只保证「先启动进程」，不保证 MySQL 已经能接连接。所以 db 要有 `healthcheck`（健康检查：每隔几秒 ping 一下），api 等到 `service_healthy` 再起。
3. `volumes: .:/app` 是**绑定挂载**：你电脑上的代码目录对进容器，改代码立刻看到，适合开发。MySQL 数据用**命名卷** `mysqldata`，不要绑到源码目录。

生产环境不要把源码目录挂进去，也不要把 `3306` / `6379` 无脑映射到公网。

---

## 常用场景

**新克隆一个仓库，一条命令对齐环境。** `docker compose up`，MySQL 8、Redis 7、接口一起起来。不用再写「先 brew install mysql、再改配置文件」。

**商品站后端。** `db` 存用户 / 商品 / 订单；`redis` 缓存详情、限流、锁；`api` 跑接口。生成商品详情那种慢操作，在 api 里调模型，结果 `UPDATE` 进 MySQL，再删 Redis 缓存。

**上传 PDF。** 大文件不要塞进镜像。开发可以把 `./uploads` 绑到容器里某个目录。MySQL 只存文件名和解析状态。

**给别人演示 / 自动测试。** 镜像打好，对方 `docker compose up` 就能点接口。测试跑完 `down -v` 清掉一次性的库。

**盒子坏了怎么看。**

```bash
docker compose logs -f db
docker compose exec api bash          # 进接口容器
docker compose exec db mysql -uroot -psecret wine_station
```

看日志、进容器、连上 MySQL，比在电脑上猜端口有用。

---

## 不用 Docker 的痛点，以及怎么解决

**换一台电脑，依赖全对不上。** 写成 `Dockerfile` + `compose.yaml`，Python、MySQL 8、Redis 版本锁在文件里。新机器只装 Docker，然后 `compose up`。

**「我本地是好的」。** 你电脑是 MySQL 5.7，线上是 8.0，字符集、SQL 模式都不一样。开发也用 `mysql:8.0` 镜像。

**接口起得比 MySQL 快，报连不上。** 只写 `depends_on` 不够。给 db 加健康检查，api 等它健康再起。

**容器删了，订单没了。** 数据写在容器自己的可写层里了。MySQL 必须挂命名卷。`compose down` 保留卷，只有你显式 `-v` 才清库。

**api 里写 `localhost:3306` 连不上。** 容器有自己的 localhost。同一份 Compose 里用服务名 `db`、`redis`。只有你在**电脑上**用客户端连映射出来的端口时，才用 `127.0.0.1:3306`。

**浏览器打不开接口。** 程序听了 `127.0.0.1`。改成 `--host 0.0.0.0`，并 `-p 8000:8000`。

**镜像 2GB，每次构建 10 分钟。** 没写 `.dockerignore`，把 `.git` 和虚拟环境打进去了；或每次改一行代码都重装 pip。先复制 `requirements.txt` 再复制源码。

**密码被打进镜像。** Dockerfile 里写了密码，或把 `.env` 复制进去了。改用运行时环境变量，`.env` 写进 `.dockerignore`。

**开发改代码要重新打包。** api 把源码绑定挂载 `.:/app`，只在依赖变化时 `--build`。

一条判断标准：这东西是 **运行环境**（解释器、数据库进程、端口、依赖版本）就交给 Docker；是 **业务真相**（订单、库存）就交给 MySQL；是 **加速和短状态** 才交给 Redis。

---

## 常见面试题

**镜像、容器、卷有什么区别？删容器数据还在吗？**

镜像是模板。容器是跑起来的进程，删了里面没放卷的文件就没了。卷在容器外面，MySQL 数据必须放卷上。`compose down` 停容器、卷还在；`down -v` 连卷一起删。

**Docker 和虚拟机有什么区别？**

虚拟机带完整的另一套操作系统，重、慢。容器共用你电脑的内核，只打包进程和依赖，启动快、镜像小。适合把 FastAPI + MySQL + Redis 整包带走，不适合当「另一个 Windows」。

**Compose 里为什么不能写 `localhost:3306`？**

每个容器有自己的 localhost。api 容器里的 localhost 是它自己，不是旁边的 MySQL。同一网络里用服务名 `db`、`redis`。只有在电脑上连映射端口时，才用 `127.0.0.1`。

**`depends_on` 为什么不够？还要健康检查？**

它只保证先启动，不保证 MySQL 已经能接连接。接口起太快就会连不上。db 加 ping，api 等到健康再起。

**绑定挂载和命名卷怎么选？**

开发接口：把代码目录绑进去，改了立刻看到。MySQL 数据用命名卷，不要绑到源码目录。

**为什么要听 `0.0.0.0`？`8000:8000` 是什么意思？**

听 `127.0.0.1` 时外面进不来。`0.0.0.0` 才对外网卡开放。`8000:8000` 是「你电脑的 8000 转到容器的 8000」。容器之间走内部网络，不必每个服务都映射到电脑。

**镜像为什么又大又慢？**

没忽略 `.git` / 虚拟环境；或每次改代码都重装依赖。先复制依赖清单再复制源码；密码不要写进 Dockerfile。

**一条命令把三件套拉起来，面试怎么讲？**

一份 Compose：`db` 用 `mysql:8.0` + 命名卷 + 健康检查；`redis` 用官方镜像；`api` 用自己的 Dockerfile，连接串写服务名不是 localhost。这解决的是「换机器跑不起来」，不是让查询变快。
