# Next.js

> 建议先看 [FastAPI](../fastapi/FastAPI.md)：页面上的数据从哪来，先有数。
>
> Next.js 是做 **页面** 的 React 框架。人看见的列表、详情、上传按钮、打字机效果，放这里。查库、下单、限流，仍走 FastAPI。

---

## 是什么，能做什么

React 负责「一块块 UI」。Next.js 在 React 外面加了几件网站必备的东西：

1. **按文件夹路由**：`app/products/page.tsx` 就是 `/products` 这个网址，不必自己配路由表
2. **能在服务器上跑 React**：打开页面时先在服务器把数据取好再吐 HTML，首屏更快、也利于 SEO
3. **约定文件**：`loading.tsx` 加载中，`error.tsx` 出错，不必每个页面手写一套

下面按现在的 **App Router**（`app/` 目录）讲，这是新项目的默认方式。

| 能做 | 不要靠它做 |
|---|---|
| 商品列表 / 详情 / 后台表单 | 直连 MySQL（密钥会进浏览器或前端仓库） |
| 调 FastAPI、展示 SSE 打字机 | 下单事务、扣库存（那是 FastAPI + MySQL） |
| 上传文件的进度条、选择器 | 切片 PDF、跑大模型 |
| 登录后的页面门禁 | 当 Redis 用（刷新就没了的状态可以，长期真相不行） |

没有 Next.js，用 Vite + React 也能做页面。痛点出现在：**要自己接路由和首屏渲染、接口密钥容易暴露、SSE 和上传要全手写、开发和线上不是同一套约定。**

和 FastAPI 的分工就一句：**人看见的在 Next.js，规则和真相在 FastAPI / MySQL。**

---

## 基础用法

### 建项目

```bash
npx create-next-app@latest wine-web
cd wine-web
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。接口若在 8000，页面在 3000，这是两个程序。

常用目录（App Router）：

| 文件                           | 网址 / 作用                    |
| ---------------------------- | -------------------------- |
| `app/page.tsx`               | `/` 首页                     |
| `app/products/page.tsx`      | `/products` 列表             |
| `app/products/[id]/page.tsx` | `/products/42` 详情，`id` 是变量 |
| `app/layout.tsx`             | 所有页面的外壳（导航、字体）             |
| `app/loading.tsx`            | 这一段还在取数据时显示的样子             |
| `app/error.tsx`              | 出错时的样子                     |
| `.env.local`                 | 本地密钥和接口地址，不要提交到 Git        |

### 默认在服务器上跑：Server Component

`app/` 里的组件**默认是服务器组件**：只在服务器跑，可以藏接口地址，也可以直接 `fetch` FastAPI。浏览器拿不到这份源码里的密钥。

```tsx
// app/products/page.tsx
async function getProducts() {
  const res = await fetch(`${process.env.API_URL}/products?status=on`, {
    cache: "no-store", // 每次打开都问最新的，适合后台列表
  });
  if (!res.ok) throw new Error("列表失败");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <ul>
      {products.map((p: { id: number; name: string }) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

`API_URL=http://127.0.0.1:8000` 写在 `.env.local`，**不要**加 `NEXT_PUBLIC_` 前缀。没有这个前缀的变量只在服务器存在。

Docker 里 Next 服务连 FastAPI，写服务名：`http://api:8000`，不要写 `localhost`。见 [Docker](../docker/Docker.md)。

### 必须加 `'use client'` 的时候

下面这些只能在浏览器跑，文件第一行写 `'use client'`：

- 点击、输入、`useState` / `useEffect`
- `EventSource` 接 SSE
- 选文件上传、本地预览

```tsx
// app/products/[id]/buy-button.tsx
"use client";

import { useState } from "react";

export function BuyButton({ id }: { id: number }) {
  const [pending, setPending] = useState(false);

  async function buy() {
    setPending(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: id, amount: 1 }),
    });
    setPending(false);
  }

  return <button onClick={buy} disabled={pending}>购买</button>;
}
```

注意：浏览器里的 `fetch` 走的是用户的电脑，地址必须是浏览器能访问的，比如 `http://localhost:8000`。所以这种变量才用 `NEXT_PUBLIC_API_URL`。

两种调用对比：

| | 服务器组件里 fetch | 浏览器里 fetch |
|---|---|---|
| 变量 | `API_URL`（不公开） | `NEXT_PUBLIC_API_URL` |
| CORS | 没有跨域问题 | FastAPI 要开 CORS |
| 适合 | 列表、详情首屏 | 点击购买、上传、SSE |

能在服务器取的，就不要绕到浏览器再取一遍。密钥、内部地址只放服务器。

### 动态路由

`app/products/[id]/page.tsx`：

```tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`${process.env.API_URL}/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return <p>没有这个商品</p>;
  const p = await res.json();
  return <h1>{p.name}</h1>;
}
```

文件夹名 `[id]` 就是占位符。访问 `/products/42`，`id` 就是 `"42"`。

### 环境变量，千万别把密码公开

| 写法 | 谁看得见 |
|---|---|
| `API_URL` / `DATABASE_URL` | 只有服务器 |
| `NEXT_PUBLIC_API_URL` | 打包进浏览器，用户打开开发者工具就能看到 |

MySQL 密码、Redis 地址、模型 API Key **永远不要** `NEXT_PUBLIC_`。页面需要它们时，让 FastAPI 在服务器用，页面只拿结果。

---

## 常用场景

**商品列表 / 详情。** 服务器组件 `fetch` FastAPI。首屏 HTML 里已经有名字和价格，不必先白屏再转圈。价格、库存以接口为准，不要写死在页面里。

**购买按钮。** 小的 `'use client'` 组件，点了 `POST /orders`。成功、没货（看 409 / 400）、被限流（429）分别提示。不要在按钮里写 SQL。

**生成详情打字机。** 客户端组件用 `EventSource`（浏览器自带的 SSE 客户端）：

```tsx
"use client";

import { useState } from "react";

export function GenButton({ id }: { id: number }) {
  const [text, setText] = useState("");

  function start() {
    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}/gen/stream`
    );
    es.onmessage = (e) => {
      if (e.data === "[DONE]") es.close();
      else setText((t) => t + e.data);
    };
    es.onerror = () => es.close();
  }

  return (
    <>
      <button onClick={start}>生成详情</button>
      <p>{text}</p>
    </>
  );
}
```

SSE 必须在浏览器里接，所以这个组件是 Client。接口怎么推，见 [FastAPI](../fastapi/FastAPI.md)。

**RAG 上传。** `<input type="file">` 放在 Client 组件里。用 `FormData` `POST /rag/files`。大文件不要先转成 Base64 塞进 JSON。进度条用 `xhr` 或支持进度的库；上传成功后页面只展示 MySQL 里的状态（解析中 / 完成），切片在后端做。

**登录门禁。** 登录接口在 FastAPI，成功后把 httpOnly cookie 种下（JS 偷不到，比 `localStorage` 存 token 稳）。Next.js 的 `middleware.ts` 可以拦「没登录就进后台」，但**真假仍以 FastAPI 校验为准**，页面门禁只是少一次跳转。

**不要用 Next.js Route Handler 当主后端。** `app/api/.../route.ts` 能写接口，练手可以。主业务（下单、RAG、生成）放 FastAPI，Python 生态接模型和 MySQL 更顺，也避免密钥进前端仓库。

---

## 不用 Next.js 的痛点，以及怎么解决

**纯 Vite + React，每个页面自己 `useEffect` 拉数据。** 首屏是空的，搜索引擎也看不见商品名。列表和详情改成服务器组件里 `fetch`，HTML 直接带数据。

**整个项目第一行都是 `'use client'`。** 等于没用上服务器组件，密钥更容易漏，包也更大。默认服务器，只有按钮、输入、SSE 才拆成 Client 小组件。

**页面里写 `mysql.query`。** 数据库密码会进前端构建。页面只打 FastAPI。

**浏览器 `fetch('http://127.0.0.1:8000')` CORS 报错。** FastAPI 加 CORS；或者改成服务器组件 fetch（不经过浏览器）。开发时两种都会用到：首屏走服务器，点击走浏览器。

**`NEXT_PUBLIC_` 把模型 Key 写进去了。** 用户打开源码就能抄走。Key 只放 FastAPI 所在机器的环境变量。

**SSE 用普通 `fetch` 然后 `res.json()`。** 会等全部结束才有结果，没有打字机。用 `EventSource`，或 `fetch` + `res.body.getReader()` 逐块读。

**大 PDF 先读成字符串再 POST JSON。** 内存和体积都炸。`FormData` 直传文件。

**hydration 报错（服务器 HTML 和浏览器对不上）。** 常见原因：服务器和浏览器时间、随机数不一致，或把只能在浏览器用的 `window` 写进了服务器组件。依赖 `window` 的逻辑放进 `'use client'`，或 `useEffect` 里再跑。

一条判断标准：这是 **给人看、要点的**，放 Next.js；这是 **规则、校验、落盘**，放 FastAPI / MySQL。

---

## 常见面试题

**App Router 和 Pages Router 有什么不同？**

Pages 是旧的 `pages/` 目录，默认在服务器渲染页面组件。App Router 是 `app/`，默认 Server Component，可以在服务器把数据取完再输出 HTML，用 `'use client'` 点名哪些要进浏览器。新项目用 App Router。

**什么是 Server Component？为什么默认用它？**

只在服务器跑的 React 组件，可以安全地用内部地址 `fetch` FastAPI，不会把密钥打进 JS 包。没有点击、没有输入的展示页都该是它。

**SSR / SSG / CSR 人话怎么说？**

- CSR：浏览器先下载空壳再拉数据（传统 SPA）
- SSR：每次请求在服务器现拼 HTML（商品详情、后台列表用 `cache: "no-store"`）
- SSG：构建时就拼好静态 HTML（几乎不变的介绍页）

Next.js 里这些是按页面、按 `fetch` 缓存策略来选的，不是全站只能选一个。

**为什么不能把 MySQL 密码放 `NEXT_PUBLIC_`？**

带这个前缀的变量会进浏览器。密码、内部 Redis 地址、模型 Key 只放服务器环境变量，由 FastAPI 使用。

**页面调 FastAPI，CORS 什么时候会出现？**

只有**浏览器**从一个源（3000）去打另一个源（8000）才会。服务器组件在 Node 里 fetch 8000，没有 CORS。所以首屏走服务器，按钮走浏览器时才要 FastAPI 开 CORS。

**SSE 为什么要 `'use client'`？**

`EventSource` 是浏览器 API，连接要挂在用户电脑上才能把字一个个画出来。服务器组件跑完就结束，不能替用户挂着这条长连接。

**Next.js 能不能当后端？什么时候不要？**

能，Route Handler 可以写接口。下单、RAG、调模型这些主业务更适合 FastAPI：校验、文档、Python 库、和 MySQL 事务都在那边。Next.js 当页面和 BFF（偶尔聚合一下）即可。
