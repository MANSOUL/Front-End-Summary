# MySQL

> 初学者从这一篇开始。建议顺序：[MySQL](./MySQL.md) → [索引](./索引/索引.md) → [事务](./事务/事务.md) → [Redis](../redis/Redis.md) → [FastAPI](../fastapi/FastAPI.md) → [Next.js](../nextjs/Nextjs.md) → [Docker](../docker/Docker.md)。
>
> 没见过的词，第一次出现都会用括号讲成人话。面试题放最后，正文没看完可以先跳过。

---

## 是什么，能做什么

MySQL 是一个**数据库**：专门帮网站把数据存到磁盘上的软件。电脑重启、程序崩溃，数据还在。

可以把它想成加强版 Excel：

| Excel 里 | MySQL 里 | 例子 |
|---|---|---|
| 一个工作簿 | 一个**库**（database） | `wine_station` 这个项目的数据 |
| 一张工作表 | 一张**表**（table） | 商品表 `products` |
| 一行 | 一条**记录** | 「茅台，1499 元」 |
| 一列 | 一个**字段** / 列 | 名字、价格、状态 |
| 你用鼠标点 | 你写 **SQL**（跟数据库说话的语言） | `SELECT ...` |

Excel 没有、MySQL 有的三件事：

1. **类型和约束**：价格必须是整数；邮箱不能重复。乱填会直接报错。
2. **多表关联**：订单必须指向一个真实存在的商品，不能写一个不存在的 id。
3. **事务**：扣库存和写订单必须一起成功。只成功一步，货和钱就对不上。事务下一篇细讲。

默认的存储方式叫 **InnoDB**（可以理解为「表在磁盘上怎么放」）。它支持事务、一行一行地锁、崩溃后能恢复。下面的例子都按 MySQL 8 + InnoDB。

| 能做 | 不要靠它做 |
|---|---|
| 把用户、商品、订单好好存着 | 同一页每秒被打开几千次（那是 Redis 的活） |
| 按条件查、多表拼、做合计 | 把运行环境打包带走（那是 Docker 的活） |
| 规定「这列不能空、不能重复」 | 验证码这种 5 分钟就该消失的东西 |

和 Redis 的分工就一句：**必须正确、必须还能查回来的，放 MySQL。** 订单有没有支付，以 MySQL 为准。Redis 只是加速和放短状态，到那一篇再讲。

---

## 基础用法

### 建库、建表

先有一个库，再在里面建表。建表就是规定：有哪些列、每列什么类型、哪些不能空。

```sql
-- 建一个库。utf8mb4 = 能存中文和 emoji 的字符集
CREATE DATABASE wine_station DEFAULT CHARACTER SET utf8mb4;
USE wine_station;

CREATE TABLE products (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,  -- 主键：每行的身份证，自动 +1
  name       VARCHAR(120) NOT NULL,              -- 最长 120 个字符，不能空
  price      INT NOT NULL COMMENT '分',          -- 用「分」存，149900 表示 1499.00 元
  status     VARCHAR(16) NOT NULL DEFAULT 'on',  -- 不填就默认上架
  content    TEXT,                               -- 很长的详情，可以为空
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

几个词：

- **主键 `PRIMARY KEY`**：这一行的唯一编号。别人提到「商品 42」，指的就是 `id=42`。
- **`AUTO_INCREMENT`**：插入时不用自己填 id，数据库自动给 1、2、3…
- **`NOT NULL`**：这列必须有值。
- **`VARCHAR(120)`**：可变长字符串，最多 120。**`TEXT`**：更长的文章。
- **`INT`**：整数。金额用整数分，不要用 `FLOAT`（小数在计算机里会算不准，对账会差一分）。

字符集写 `utf8mb4`，不要写 `utf8`。MySQL 里那个 `utf8` 其实存不下 emoji，插入表情会报错。

订单表要记下「谁买了哪个商品」，所以有 `user_id`、`product_id` 两列，指向别的表的主键：

```sql
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  product_id  BIGINT NOT NULL,
  amount      INT NOT NULL,
  status      VARCHAR(16) NOT NULL DEFAULT 'created',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user (user_id),      -- 索引：方便按用户查订单，下一篇细讲
  KEY idx_product (product_id)
);
```

### 增删改查（四句就够用）

```sql
-- 增：插入一行
INSERT INTO products (name, price) VALUES ('茅台', 149900);

-- 查：读出某些列。WHERE = 过滤条件
SELECT id, name, price FROM products WHERE id = 1;

-- 改：改某一行。没有 WHERE 会改整张表，很危险
UPDATE products SET price = 159900 WHERE id = 1;

-- 删：删某一行。同样一定要带 WHERE
DELETE FROM products WHERE id = 1;
```

`SELECT *` 表示所有列，练手可以。接口里最好写出列名：表以后加了一列，你的返回结果不会突然多字段。

### 过滤、排序、分页

后台商品列表：只要上架的、价格至少 100 元，按 id 从新到旧，一页 20 条。

```sql
SELECT id, name, price
FROM products
WHERE status = 'on' AND price >= 10000
ORDER BY id DESC
LIMIT 20 OFFSET 0;
```

| 子句 | 人话 |
|---|---|
| `WHERE` | 先筛哪些行要 |
| `ORDER BY id DESC` | 按 id 从大到小（新的在前）。`ASC` 是从小到大 |
| `LIMIT 20` | 只要 20 条 |
| `OFFSET 0` | 跳过 0 条，即第一页。第二页是 `OFFSET 20` |

翻到很后面时，`OFFSET 100000` 会变慢：数据库要先跳过 10 万行再给你 20 行。更好的写法是记下上一页最小的 id，下一页写 `WHERE id < 上一页最小id ORDER BY id DESC LIMIT 20`。现在知道「深分页别用很大的 OFFSET」即可。

### 合计（聚合）

「每个状态下有多少商品、价格加起来多少」：

```sql
SELECT status, COUNT(*) AS n, SUM(price) AS total
FROM products
GROUP BY status
HAVING n > 10;
```

- `COUNT(*)`：有多少行。
- `SUM(price)`：价格加总。
- `GROUP BY status`：按状态分组，每组一行结果。
- `WHERE` 是分组**前**筛行；`HAVING` 是分组**后**筛组（所以「数量 > 10 的组」用 `HAVING`）。
- `COUNT(content)` 不计算 `content` 是空（`NULL`）的行，和 `COUNT(*)` 不一样。

### 两张表拼在一起（JOIN）

订单表只有 `product_id`，没有商品名。要把名字拿来，就要**关联**：

```sql
SELECT o.id, p.name, o.amount
FROM orders o
INNER JOIN products p ON p.id = o.product_id
WHERE o.user_id = 7
ORDER BY o.id DESC
LIMIT 20;
```

`orders o` 里的 `o` 是外号，后面写 `o.id` 省得表名太长。`ON p.id = o.product_id` 是拼接条件：订单的商品编号 = 商品表的 id。

| 写法 | 结果（人话） |
|---|---|
| `INNER JOIN` | 两边都配得上才留下。订单指向的商品被删了，这单不会出现 |
| `LEFT JOIN` | 左边（订单）全留下。商品没了，商品名那一格是空的 |
| `LEFT JOIN` 后再写 `WHERE p.status = 'on'` | 空的那些又被扔掉了，效果变成了 INNER。右表条件请写在 `ON` 里 |

一个用户有 10 个订单，JOIN 之后会变成 10 行，不是 1 行。这叫一对多，行数会变多。如果接口要的是「用户信息 + 他的订单列表」，往往查两次更干净，不要指望一次 JOIN 搞定所有形状。

### NULL 是「不知道」，不是 0，也不是空字符串

```sql
WHERE email = NULL      -- 永远不会成立
WHERE email IS NULL     -- 才是「邮箱为空」
```

`NOT IN (1, 2, NULL)` 整段会失效，查不出东西。能确定的列尽量写 `NOT NULL`，少留空。

### 这条 SQL 慢不慢：EXPLAIN

在 SQL 前面加 `EXPLAIN`，MySQL 会告诉你它**打算怎么查**，不会真的把数据返回来。

```sql
EXPLAIN SELECT * FROM products WHERE name = '茅台';
```

先看 `type` 这一列：`ALL` 表示整张表一行行翻（慢）；`ref` / `range` / `const` 表示走了索引（快）。看不懂其他列没关系，慢查询的细节在 [索引](./索引/索引.md)。

---

## 常用场景

下面都假设你在做酒类商城，后面会加上一点 AI 功能。

**商品详情页。** `SELECT id, name, price, content FROM products WHERE id=?`。按主键查，一张小表本身就很快。同一页被刷几千次以后，再把结果放到 Redis 里，见 Redis 那篇。

**后台商品列表。** `WHERE status=? ORDER BY id DESC LIMIT 20`。给 `(status, id)` 建联合索引，筛选和排序可以一起走，见索引那篇。

**下单。** 要插入订单、还要扣库存，两步必须包在一个事务里，见 [事务](./事务/事务.md)。

**登录。** 用户表的 `email` 做成 `UNIQUE`（唯一）：既不许两人用同一邮箱注册，查登录也快。

**AI 文档（RAG）。** RAG 先理解成：用户上传 PDF，系统切成小段，以后问答时先搜这些段落再让模型回答。MySQL 只存文件名、谁上传的、解析到哪一步、切了多少段。PDF 文件本身放磁盘，给 AI 用的向量放专门方案。不要把整份 PDF 塞进 `TEXT` 列。

**生成商品详情。** 模型在外面跑完，最后一条 `UPDATE products SET content=? WHERE id=?`。单条语句自己就是一个小事务，不必特意开事务。

表设计先记住这几条：每张表有主键；金额用整数分；时间用 `DATETIME`；状态用短词（`on` / `off`）。

---

## 不用 MySQL 的痛点，以及怎么解决

**把用户和订单只放在 Redis，或写在本地文件里。** 重启、内存满了、过期时间到了，数据就没了。该长期保存的进 MySQL。Redis 只放一份副本用来加速。

**数据一多，列表从几毫秒变成几秒。** 没有索引时只能一行行翻，叫全表扫描。按你真实的 `WHERE` / `ORDER BY` 建索引，用 `EXPLAIN` 确认，见 [索引](./索引/索引.md)。

**扣了库存，插入订单失败。** 两步不在同一事务里，会留下「库存少了但没有订单」的脏数据。`START TRANSACTION` … `COMMIT`，见 [事务](./事务/事务.md)。

**两个请求同时卖掉最后一件。** 用数据库当闸门：`UPDATE products SET stock = stock - 1 WHERE id=? AND stock >= 1`，看影响了几行，0 行说明没货了。不要先读出来、在 Python 里减一、再写回去。

**邮箱重复注册。** 只在 FastAPI（Python 写接口的框架）里 `if 已存在` 不够：两个请求同时检查都会说「没有」。要在数据库加 `UNIQUE` 约束。

**JOIN 之后行数翻倍。** 一个用户有 N 个订单，JOIN 再 `SELECT *`，一个用户变成 N 行。先想清楚接口要「一行一单」还是「用户 + 订单数组」。

**往后面翻页越来越慢。** 不要用很大的 `OFFSET`，改成按上一页的主键接着往下。

---

## 常见面试题

能用自己的话讲出来，比背定义有用。看不懂先回正文。

**MySQL 和 Redis 怎么分工？为什么不把订单只放 Redis？**

订单必须重启后还在，还要「要么全成功要么全撤销」。Redis 主要在内存里，过期、内存满、重启都可能丢。详情页被刷得很凶时，把 JSON 缓进 Redis；下单成不成功，仍以 MySQL 为准。

**为什么字符集用 `utf8mb4` 不是 `utf8`？**

MySQL 的 `utf8` 最多 3 个字节，emoji 存不下。`utf8mb4` 才是完整的 Unicode。建库建表时写上。

**金额为什么用整数，不用 `FLOAT`？**

`0.1 + 0.2` 在计算机里不等于 `0.3`，对账会差一分。价格存「分」，展示时除以 100。

**`INNER JOIN` 和 `LEFT JOIN` 有什么不同？**

INNER：两边都配上才留。LEFT：左表全留，右表没有就空着。如果 LEFT 完又在 `WHERE` 里写右表的条件，空行会被扔掉，效果变成 INNER。右表条件写在 `ON` 里。

**`COUNT(*)` 和 `COUNT(列)`？`NULL` 怎么比？**

`COUNT(*)` 数行。`COUNT(content)` 不数这一列为空的行。`NULL` 表示不知道，`= NULL` 永远不成立，要用 `IS NULL`。

**深分页为什么慢？**

`LIMIT 20 OFFSET 100000` 要先跳过 10 万行。改成 `WHERE id < 上一页最小id ORDER BY id DESC LIMIT 20`。

**一条 SQL 很慢，你怎么查？**

前面加 `EXPLAIN`。`type=ALL` 或 `key=NULL` 多半没走索引。先看最慢的那条 SQL，再针对性加索引，不要给每一列都加。细节见 [索引](./索引/索引.md)。

**主键为什么常用自增的 `BIGINT`？**

主键是这张表的目录本身（叫聚簇索引，索引篇会讲）。数字自增，新行都追加在末尾，插入快。用随机字符串当主键，新行会插到目录中间，表一大就慢。订单号这种业务编号可以另做 `UNIQUE` 列，不必当主键。
