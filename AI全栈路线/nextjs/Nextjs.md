# Next.js

> 这篇按 **App Router**（`app/` 目录）写，这是新项目的默认方式。Pages Router（`pages/`）只在对照渲染模型时出现。
>
> 没见过的词第一次会用人话解释。建议先有一点 React（组件、`useState`、`props`），没有后端基础也能读。
>
> 读的顺序：是什么 → 基础 → 渲染和缓存原理 → 进阶 → 场景 → 痛点 → 面试题。原理那节最重要，前面的 API 都是为它服务的。

---

## 是什么，能做什么

React 负责「一块块 UI 怎么画」。它不管网址怎么对应文件、HTML 什么时候拼、密钥藏哪、图片怎么压缩。纯 React（Vite / CRA）默认是 **CSR**（客户端渲染）：浏览器先下载一个空壳 JS，再自己拉数据、再画出页面。首屏慢，搜索引擎也很难看到正文。

Next.js 是 Vercel 做的 React 框架，把网站缺的那一层补上：

1. **文件系统路由**：文件夹结构就是网址，不必自己维护一份路由表
2. **服务器上跑 React**：默认 **Server Component**（服务器组件），打开页面时可以在服务器取数、吐 HTML
3. **多种渲染**：同一项目里，有的页构建时生成，有的页每次请求现拼，有的页过期后再生成
4. **约定文件**：加载中、出错、404、布局，都有固定文件名
5. **构建期优化**：代码分割、图片、字体、打包时去掉用不到的服务器代码

它不是另一种 React，底层仍是 React。差别在：**组件默认在哪执行、数据默认怎么取、路由默认怎么组织。**

| 能做                  | 不要默认靠它做                    |
| ------------------- | -------------------------- |
| 站点、后台、文档、带 SEO 的内容页 | 替代数据库（数据真相仍在 DB）           |
| 服务端取数、流式渲染、BFF 聚合   | 替代消息队列、长时间后台任务             |
| `app/api` 写一些接口     | 复杂事务、多客户端共用的核心 API（可以另起后端） |
| 鉴权门禁、中间件改写请求        | 在浏览器里藏数据库密码                |

没有 Next.js，Vite + React 也能做页面。痛点是路由、首屏 HTML、SEO、密钥边界、缓存策略都要自己拼。有历史包袱的旧项目可以继续 Pages Router；**新项目用 App Router。**

---

## 基础用法

### 建项目

```bash
npx create-next-app@latest
cd 项目目录
npm run dev      # http://localhost:3000
npm run build    # 生产构建，看哪些路由是静态、哪些是动态
npm start        # 跑构建产物
```

向导里选 App Router、TypeScript。构建日志会打印每个路由是 `Static` 还是 `Dynamic`，这是后面理解 SSR/SSG 的第一手材料。

### 约定文件（App Router）

一个文件夹 = 一段 URL。真正决定「有没有这个页面」的是 `page.tsx`。

| 文件 | 作用 |
|---|---|
| `app/page.tsx` | `/` |
| `app/blog/page.tsx` | `/blog` |
| `app/blog/[slug]/page.tsx` | `/blog/hello`，`slug` 是变量 |
| `app/layout.tsx` | 这一段及其子路由的外壳，切子页时尽量保住，不会整页卸载 |
| `app/template.tsx` | 也是外壳，但每次导航都会重新挂载（要重置状态时用） |
| `app/loading.tsx` | 这一段在加载时的 UI，底层是 `Suspense` 的 fallback |
| `app/error.tsx` | 必须是 Client Component，接住这一段的渲染错误 |
| `app/not-found.tsx` | 调用 `notFound()` 或未匹配时 |
| `app/global-error.tsx` | 根布局都挂了时的最后兜底 |
| `app/route.ts` | 这个路径是 HTTP 接口，不是页面 |
| `app/default.tsx` | 平行路由的兜底槽 |
| `middleware.ts` | 放项目根（或 `src/` 根），请求进来、命中路由之前跑 |

特殊文件夹名：

| 写法 | 含义 |
|---|---|
| `[id]` | 一段动态参数 |
| `[...slug]` | 后面所有段，必有 |
| `[[...slug]]` | 可选捕获，`/docs` 和 `/docs/a/b` 都能进 |
| `(marketing)` | **路由组**，组织代码，不进 URL |
| `@modal` | **平行路由**，同一布局里多个槽同时渲染 |
| `_components` | 下划线前缀：不是路由 |

根 `layout.tsx` 必须有 `<html>` 和 `<body>`，全站只有这一处写。

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
```

### 动态路由拿参数

Next 15 起 `params`、`searchParams` 是 Promise，要 `await`。

```tsx
// app/blog/[slug]/page.tsx
export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  return <h1>{slug}</h1>;
}
```

生成「有哪些 slug 要在构建时预渲染」，用 `generateStaticParams`，对应 Pages 里的 `getStaticPaths`。

```tsx
export async function generateStaticParams() {
  return [{ slug: "hello" }, { slug: "next" }];
}
```

### 导航

```tsx
import Link from "next/link";
import { redirect, notFound, permanentRedirect } from "next/navigation";

<Link href="/blog/hello">文章</Link>

// 服务器组件里立刻换地址（没有回退按钮的那种跳转，适合没登录）
redirect("/login");
permanentRedirect("/new-url"); // 308

// 渲染时发现没有这份资源
notFound();
```

客户端里要用 `useRouter()`（`'use client'`）：`router.push` / `router.replace` / `router.refresh()`。`refresh` 不换 URL，只让当前路由在服务器上再拉一次数据，Server Action 之后常用。

`<Link>` 默认会预取进入视口的静态路由，所以点进去很快。动态路由、或你加了 `prefetch={false}`，就不会预取。

### 环境变量

| 写法 | 谁看得见 |
|---|---|
| `API_URL`、`DATABASE_URL` | 只有服务器（Server Component、Route Handler、Server Action） |
| `NEXT_PUBLIC_API_URL` | 打包进浏览器，用户打开源码就能看到 |

密钥、数据库地址、第三方 Admin Key **不要**加 `NEXT_PUBLIC_`。需要给浏览器用的，只暴露「浏览器真正能访问的那个 API 根路径」。

本地放 `.env.local`，不要进 Git。改环境变量通常要重启 `next dev`。

### 服务器组件和客户端组件

`app/` 里**默认是服务器组件**：只在服务器跑，可以 `async`，可以直接读文件、读密钥、`fetch` 内网。产物里不会带这份函数的源码。

浏览器里才能做的事，文件**第一行**写 `'use client'`：

- `useState` / `useEffect` / `useRef`
- `onClick`、受控输入
- `window` / `document` / `EventSource` / `localStorage`

规则：

1. **服务器组件可以 import 客户端组件**，反过来不行（客户端 bundle 拉不进服务器模块）。
2. 传给客户端组件的 props 必须能序列化：普通对象、字符串、数字可以；函数、Class、Date 要小心（Date 会变成字符串）。
3. 不要把整个页面标成 `'use client'`。把按钮、输入拆成小的客户端叶子，外壳继续当服务器组件。
4. `'use client'` 是**模块边界**：这个文件以及它 import 的本地模块，都会进客户端包。所以不要在 client 文件里 import 一个很重的、其实只该在服务器用的库。

```tsx
// app/like-button.tsx
"use client";

import { useState } from "react";

export function LikeButton() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

```tsx
// app/page.tsx  服务器组件，没有 "use client"
import { LikeButton } from "./like-button";

export default async function Page() {
  const data = await getData(); // 只在服务器跑
  return (
    <div>
      <p>{data.title}</p>
      <LikeButton />
    </div>
  );
}
```

---

## 渲染、缓存和原理

这是 Next 和「Vite + React」分道的地方。先分清三个经常被混在一起的词：

| 词 | 人话 |
|---|---|
| **CSR** | 浏览器拿到空壳 JS，自己取数、自己画 |
| **SSR** | **每个请求**在服务器把组件跑成 HTML，再发给浏览器 |
| **SSG** | **构建时**跑一遍，HTML 写到磁盘，请求只是把文件发出去 |
| **ISR** | 先当 SSG；过期后后台再生成，期间可以继续用旧 HTML |
| **RSC** | React Server Components：组件在服务器执行，把「UI 描述」发给客户端。它不是 SSR 的别名 |

RSC 解决的是「哪些组件的代码根本不用进浏览器」。SSR 解决的是「首屏 HTML 谁来拼」。两者经常一起出现：服务器跑 Server Component → 吐 HTML（SSR）+ 一份 RSC 载荷 → 浏览器只对标了 `'use client'` 的部分做 **hydration**（把已有 HTML 接上事件和 state）。

### 一次请求大概发生了什么

1. 请求进 Node（或 Edge）。`middleware.ts` 若匹配，先跑，可以改写 URL、设 cookie、直接返回。
2. 命中某个 `page.tsx`。从根 layout 往下渲染。遇到 `loading.tsx` / `Suspense`，可以先把外壳流出去。
3. 服务器组件在服务器执行完毕。客户端组件只被序列化成「占位 + 需要的 props」，它们的 JS 稍后由浏览器跑。
4. 响应里通常有：立刻能看的 HTML、RSC Flight 载荷（组件树的描述）、客户端 JS。
5. 浏览器画出 HTML，再跑客户端 JS，hydration。之后的 `<Link>` 切页，往往不再要整份 HTML，而是拉 RSC 载荷换一棵子树（这就是 App Router 的客户端导航）。

hydration 报错（「Text content does not match」）= 服务器吐出的 HTML 和浏览器第一轮渲染对不上。典型原因：用了 `Date.now()`、`Math.random()`、`window` 在服务器组件里，或本地和服务器时区不一致。依赖浏览器的值放进 `'use client'`，并且在 `useEffect` 之后再写到画面上。

### Pages Router 怎么实现三种模式

Pages 用「页面旁边的数据函数」决定整页怎么渲染。

**SSR**：`getServerSideProps`。构建不生成这页。每次请求跑函数，结果当 `props`。

```js
export async function getServerSideProps(ctx) {
  const data = await load(ctx.query.id);
  return { props: { data } };
}
```

**SSG**：`getStaticProps`。`next build` 时跑。动态路由再加 `getStaticPaths`。

```js
export async function getStaticPaths() {
  return { paths: [{ params: { id: "1" } }], fallback: false };
}
export async function getStaticProps() {
  return { props: { data: await load() } };
}
```

`fallback`：`false` 未列出的路径 404；`blocking` 第一次现拼再缓存；`true` 先给壳。

**ISR**：仍是 `getStaticProps`，多 `revalidate` 秒。过期后第一个请求拿到旧 HTML，Next 在后台重跑；之后才是新页。也可 `res.revalidate(path)` 主动重建。

```js
export async function getStaticProps() {
  return { props: { data: await load() }, revalidate: 60 };
}
```

Pages 基本是**整页三选一**。没有 RSC，组件默认都会进客户端 bundle（除非你自己拆）。

### App Router 怎么实现三种模式

没有 `getServerSideProps`。默认尽量静态；你用了「请求来了才知道的东西」，这条路由就变成动态。

**SSR（动态渲染）** 常见触发：

- `cookies()` / `headers()` / `draftMode()`
- 读请求期的 `searchParams`
- `fetch(url, { cache: "no-store" })` 或 `{ next: { revalidate: 0 } }`
- `export const dynamic = "force-dynamic"`
- `export const revalidate = 0`

请求来了才跑 Server Component。效果约等于 Pages 的 `getServerSideProps`，数据写在组件里，不经过 `props`。

**SSG（静态渲染）**：构建时把该路由的服务器组件跑完，结果放进 **Full Route Cache**。动态段用 `generateStaticParams` 列出 id。也可以 `export const dynamic = "force-static"` 强制静态（构建时拿不到真实 cookie）。

Next 15 起，`fetch` **默认不缓存**。想静态住，要显式：

```ts
await fetch(url, { cache: "force-cache" });
// 或
export const dynamic = "force-static";
```

**ISR**：给静态结果设寿命。

```ts
export const revalidate = 60; // 整条路由 60 秒

await fetch(url, { next: { revalidate: 60 } }); // 这一次 fetch
await fetch(url, { next: { tags: ["posts"] } });
```

到期行为与 Pages 相同：先旧后新（stale-while-revalidate）。主动失效：

```ts
import { revalidatePath, revalidateTag } from "next/cache";
revalidatePath("/blog");
revalidateTag("posts");
```

| | Pages | App |
|---|---|---|
| SSR | `getServerSideProps` | `cookies` / `no-store` / `force-dynamic` |
| SSG | `getStaticProps` + `getStaticPaths` | 构建时静态渲染 + `generateStaticParams` |
| ISR | `revalidate: 60` | `export const revalidate` 或 `fetch` 的 `next.revalidate` |
| 主动刷新 | `res.revalidate` | `revalidatePath` / `revalidateTag` |
| 数据放哪 | `props` | 组件里直接 `await` |

选型：和 cookie / 当前用户强相关 → SSR；几乎不变 → SSG；大家看同一份、过几分钟可以旧 → ISR。App 可以把「外壳静态、一块动态」拆开，靠 `Suspense`；Pages 很难做到这么细。

### 四层缓存（App Router 最容易踩的原理）

从里到外：

| 层 | 活多久 | 干什么 |
|---|---|---|
| **Request Memoization** | 一次请求内 | 同一 `fetch` 调用多次只打网络一次，避免 layout 和 page 重复取 |
| **Data Cache** | 跨请求、跨用户（存在服务器） | 被缓存的 `fetch` / `unstable_cache` 结果 |
| **Full Route Cache** | 跨请求 | 静态路由整页的 RSC 载荷 + HTML |
| **Router Cache** | 浏览器里，按用户 | 客户端导航过的页面片段，返回上一页很快 |

开发时你改代码立刻能看到，是因为 dev 基本绕过了 Data Cache / Full Route Cache。生产才会「为什么我改了 CMS，页面还是旧的」。

让缓存失效，要用对层：`cache: "no-store"` 影响 Data Cache；`dynamic = "force-dynamic"` 让路由不进 Full Route Cache；`router.refresh()` 动的是当前这一次的服务器树，也会让客户端 Router Cache 认为过期。

`cookies()` 一旦在渲染路径上被调用，Next 认为输出和用户有关，**整条路不能当全站静态页缓存**。这就是「我只是读了一下 cookie，页就变成 Dynamic」的原因。

### 部分预渲染（PPR，进阶）

想法：壳在构建时静态生成，`Suspense` 包住的洞请求时再补。开启后，静态壳和动态洞可以在同一路由共存。还在演进，用之前看当前 Next 大版本文档。对原理的意义是：App Router 的目标不是整页三选一，而是**按组件粒度**决定静态还是动态。

---

## 进阶用法

### 流式渲染和 `loading.tsx`

`loading.tsx` = 这一段自动包一层 `Suspense`。慢的取数不要堵住整页：外壳先出来，慢的块自己转圈。

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <h1>面板</h1>
      <Suspense fallback={<p>加载图表…</p>}>
        <Chart />
      </Suspense>
    </>
  );
}

async function Chart() {
  const data = await getSlowChart();
  return <pre>{JSON.stringify(data)}</pre>;
}
```

`Chart` 是服务器组件也可以。关键是它被 `Suspense` 边界隔开，Next 才能分段把 HTML 流给浏览器。

### Server Actions

把「提交表单」写成服务器上的函数，不必自己再开一个 POST 接口。文件或函数上标 `'use server'`。

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  await db.posts.create({ title }); // 只在服务器跑
  revalidatePath("/posts");
}
```

```tsx
// app/posts/new/page.tsx  可以是服务器组件
import { createPost } from "../actions";

export default function Page() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">发布</button>
    </form>
  );
}
```

原理简述：构建时这个函数被编成一个加密 ID。浏览器提交时 POST 到当前路由，带上这个 ID 和 FormData；服务器校验后来跑函数。所以：

- **不能把敏感逻辑的「能不能跑」只藏在前端。** 函数导出了，知道 ID 就能 POST。权限必须在 Action 里面查 session。
- 返回值要能序列化。
- 需要乐观更新、pending 状态时，客户端用 `useTransition` / `useFormStatus` / `useActionState`。

适合表单、增删改。长任务、给第三方的稳定 REST，仍用 Route Handler 或独立后端。

### Route Handler

`app/api/hello/route.ts`：

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(body, { status: 201 });
}
```

导出 `GET` `POST` `PUT` `PATCH` `DELETE` `HEAD` `OPTIONS`。需要读 cookie、设 cookie、流式响应都可以。默认跑 Node runtime；`export const runtime = "edge"` 改到 Edge（更快的冷启动，API 更少，没有完整 Node）。

WebHook、给移动端的 JSON、SSE、文件上传，用 Handler。页面表单优先 Action。

### Middleware

```ts
// middleware.ts  项目根
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token && req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

它跑在 **Edge**，在匹配到页面 / Handler **之前**。适合：跳转、改写路径、地理分流、读 cookie 做门禁。

不要在这里连数据库、跑重逻辑。没匹配的静态文件最好用 `matcher` 排除，否则每个图片请求都跑一次。**门禁不是鉴权**：middleware 能骗过跳转，真假仍要在 Server Component / Action / Handler 里再查一次。

### Metadata 和 SEO

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文档",
  description: "…",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title };
}
```

根 layout 的 `metadata` 是默认值，子路由可以覆盖。动态数据用 `generateMetadata`。另外还有 `sitemap.ts`、`robots.ts`、`opengraph-image.tsx` 这些约定文件。

### 图片和字体

```tsx
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

<Image src="/hero.png" alt="" width={800} height={400} />
```

`next/image` 会按设备切尺寸、懒加载、防止布局撑开。远程图片要把域名加到 `next.config` 的 `images.remotePatterns`。字体在构建时下载，减少布局跳动。

### 平行路由和拦截路由（知道能干什么即可）

- 平行路由 `@folder`：布局里多个 `children` 槽，例如 `@modal` 和主内容同时渲染。适合仪表盘多栏、模态框保背后页面。
- 拦截路由 `(.)photo`、`(..)photo`：在当前导航栈里「拦截」到另一条路由，硬刷新则走真正的页面。适合列表里点开图片模态，刷新后是独立图片页。

写法细、边角多，用到再查官方表。面试能说出「同一布局多槽」和「软导航拦截」就够。

---

## 常用场景

**内容站 / 文档 / 博客。** `generateStaticParams` + 默认静态，或 `revalidate` 做 ISR。Markdown / CMS 取数放在服务器组件。标题用 `generateMetadata`。

**和当前用户有关的后台。** `cookies()` 读 session，路由会动态渲染。列表 `cache: "no-store"`。权限不够 `redirect` / `notFound`。

**列表很少变、详情能接受几分钟延迟。** 列表 SSG，详情 ISR（`revalidate: 60` 或 tag）。CMS 发文后 `revalidateTag("posts")`。

**表单增删改。** Server Action + `<form action={fn}>`，结束 `revalidatePath`。需要立刻反馈再用 `useFormStatus`。

**给别的客户端 JSON、WebHook、SSE。** Route Handler。SSE 用 `ReadableStream` 推 `text/event-stream`；浏览器用 `EventSource` 接，接的那侧必须是客户端组件。

**登录门禁。** 登录接口种 **httpOnly cookie**（JS 读不到，比 `localStorage` 存 token 稳）。`middleware` 拦明显未登录的跳转；Server Action / Handler 里再验一次。

**BFF。** 浏览器不直打多个内部服务，由 Server Component 或 Route Handler 在服务器聚合。密钥留在服务器。

**何时不要把核心后端写在 Next。** 多端共用同一套 API、长时间任务、复杂事务、特定语言生态（例如 Python 模型）——独立后端更干净。Next 仍做页面和 BFF。

---

## 不用 Next.js 的痛点，以及怎么解决

**Vite SPA，首屏空白、SEO 差。** 展示页改成服务器组件取数，HTML 带正文。纯操作台、必须登录才看得见的后台，CSR 也可以，不必神化 SSR。

**整个 `app/` 第一行都是 `'use client'`。** RSC 形同虚设，包变大，密钥更容易漏。默认服务器，只把交互拆成叶子。

**改了数据页面还是旧的。** 生产有 Data Cache / Full Route Cache / Router Cache。写路径上要 `revalidatePath` / `revalidateTag`；读路径不要误用 `force-cache`。Next 15 默认 `fetch` 不缓存，Next 14 默认缓存，版本不同行为不同，先看构建日志里这条路由是 Static 还是 Dynamic。

**只读了一个 cookie，全页变成动态。** 把读 cookie 的逻辑缩到最小的动态子树，外面用 `Suspense` 隔开；能静态的壳不要放进同一个无边界组件。

**hydration mismatch。** 服务器和浏览器第一帧必须同一份 HTML。随机数、当前时间、`window` 相关 UI 放到客户端，并在 effect 后出现。

**`NEXT_PUBLIC_` 泄露密钥。** 能不公开就不公开。浏览器只拿它真正要打的那个公网 API。

**middleware 里连数据库。** Edge 限制多、超时短、每个请求都跑。middleware 只做分流和粗门禁。

**Server Action 里不鉴权。** 函数 ID 可被调用。权限查 session，不要以为「页面上没按钮」就是安全。

**客户端组件里 import 了 Node 的 `fs` / ORM。** 边界反了。数据访问放服务器文件，只把普通数据当 props 往下传。

一条判断标准：这是 **路由、HTML 什么时候拼、哪些 JS 进浏览器**，用 Next；这是 **长期数据、跨端 API、重活**，用数据库和真正的后端。

---

## 常见面试题

**App Router 和 Pages Router 的本质差别？**

目录约定不同，更关键的是执行模型：App 默认 Server Component，可以按组件决定代码在不在浏览器；Pages 是页面级数据函数 + 默认客户端组件。布局、loading、流式是 App 原生的。

**RSC 和 SSR 是一回事吗？**

不是。RSC = 组件在服务器执行、代码可以不进 bundle。SSR = 服务器输出 HTML。App Router 里两者常一起用：服务器跑 RSC，同时输出 HTML 做首屏。

**SSR / SSG / ISR 在两套路由里怎么实现？**

Pages：`getServerSideProps` / `getStaticProps` / `revalidate`。App：动态函数与 `no-store` 触发 SSR；构建时静态 + `generateStaticParams` 做 SSG；`revalidate` 或 `next.revalidate` 做 ISR。App 还可以 `revalidateTag`。

**为什么调用 `cookies()` 页面就不能静态？**

输出依赖这份请求的 cookie，不能拿「构建时那一份」给所有人用。Full Route Cache 不能收这条路由。

**四层缓存分别挡什么？**

请求内去重；跨请求的 `fetch` 结果；整页静态产出；浏览器里的客户端导航缓存。生产环境「页面不更新」多半卡在后三层。

**Server Action 安全吗？**

传输有加密 ID，但不是权限系统。必须在 Action 内鉴权。适合表单，不适合当对外稳定 API。

**middleware 能替代登录校验吗？**

不能。它能减少未登录用户进页，真数据仍要在服务器渲染或 Action 里校验。它还跑在 Edge，不适合重逻辑。

**什么必须 `'use client'`？**

状态、事件、浏览器 API。没有这些就留在服务器。`'use client'` 是模块边界，不是「这个函数是客户端」。

**hydration 是什么？失败会怎样？**

浏览器把已有 HTML 和 React 组件树接起来，复用 DOM，挂上事件。对不上就报 mismatch，常见于服务器/浏览器第一帧不一致。

**新项目为什么默认 App Router？**

嵌套布局、流式、RSC 减包、缓存和动态可以细到组件。Pages 不是错的，迁移成本大时不必为了新而迁。
