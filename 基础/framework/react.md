## React 

### JSX 是什么？

JSX是一种用于表达XML等数据结构的一种书写方式，XML结构较为扁平且直观，而JSON数据格式能直接运行于JavaScript应用但相对XML不够直观，所以结构两者，便有了JSX语法。

### 生命周期

自React 16.3开始，组件生命周期经过了比较大的改动。

对未来即将移除的三个生命周期添加 `UNSAFE_` 前缀：

- UNSAFE_componentWillMount()
- UNSAFE_componentWilReceiveProps()
- UNSAFE_componentWillUpdate()

并添加上新的生命周期：

- getDerivedStateFromProps()
- getSnapshotBeforeUpdate()

![React 生命周期](../images/4.jpg)


### 为什么要引入新的生命周期

为 React 的新 `Fiber` 算法做铺垫，**Fiber算法为了更高效的提升应用性能引入了异步渲染模式，这意味着在render函数之前的生命周期函数都可能会执行多次**。原先总会有开发者在生命周期函数中做一些副作用动作，例如在 `componentWillMount` 中进行 `ajax` 请求。

所以为了限制开发者在旧生命周期中调用 `this.setState()` 做一些将产生副作用的操作，因此引入了两个静态生命周期函数来替代旧生命周期函数。


### memo, PureComponent

如果组件是纯组件（同样的属性值传入会渲染出同样的结果），那么你对这个组件的期望当然是当下一次接受了相同的属性值时会去重用上一次的渲染结果，而不是再一次渲染。

但 React 默认不会执行这一操作,就像下述例子一样：

```jsx
import React from "react";
import "./styles.css";

function Title({ title }) {
  return <h1>{title}</h1>
}

export default function App() {
  const [count, setCount] = React.useState(0)
  return (
    <div className="App">
      <Title title="Hello Counter!"/>
      <p>{ count }</p>
      <button onClick={() => setCount(count+1)}>+1</button>
    </div>
  );
}
```

么次点击 `+1 button` 都会重新去渲染 `Title` 组件，这显然不是我们想要的结果。若要达到我们的目的，可以使用 `React.memo`。

```jsx
import React from "react";

function Title({ title }) {
  return <h1>{title}</h1>
}

const MemoTitle = React.memo(Title)

export default function App() {
  const [count, setCount] = React.useState(0)
  return (
    <div className="App">
      <MemoTitle title="Hello Counter!"/>
      <p>{ count }</p>
      <button onClick={() => setCount(count+1)}>+1</button>
    </div>
  );
}
```

现在，无论点击多少次按钮，都只会沿用上一次的渲染结果。

`PureComponent` 与 `React.memo` 都可以达到记忆化效果，区别在于 `PureComponent` 适用于类组件，而 `React.memo` 适用于函数组件。

### Portals

`Portrals` API通常用于将组件挂载到独立的DOM元素上，一个比较常见的例子就是模态框。

```jsx
import React from "react";

class Modal extends React.Component {
    render() {
        return React.createPortal(
            <div className="modal"></div>,
            document.body
        )
    }
}
```

### Ref

`ref` 可以创建类组件实例或DOM元素的引用，之后对他们进行访问。

创建引用的方式: 

- React.createRef
- React.useRef
- 通过向 `ref` 属性传递函数

```jsx
import React from 'react';

class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.refTitle = React.createRef();
    }

    componentDidMount() {
        // ref.current => p
        console.log(this.refTitle.current);
    }

    render() {
        return (
            <p class="title" ref={this.refTitle}>Ref Demo</p>
        )
    }
}


function App () {
    const [refDemo, setRefDemo] = React.useRef(null)

    React.useEffect(() => {
        console.log(refDemo.current)
    })

    return (
        <div className="app">
            <Demo ref={refDemo}/>
        </div>
    )
}
```

### Suspence

`Suspence` 可以让组件在渲染之前“等待”某些东西。如今，Suspense仅支持一种用例：使用 `React.lazy` 动态加载组件。将来，它将支持其他用例，例如数据获取。

```jsx
const SomeComponent = React.lazy(() => import('./SomeComponent'));

function MyComponent() {
  return (
    // Displays <Spinner> until OtherComponent loads
    <React.Suspense fallback={<Spinner />}>
      <div>
        <SomeComponent />
      </div>
    </React.Suspense>
  );
}
```


### SSR

最初使用React书写的应用相对于原始应用，在SEO及首屏展示上都没有优势，由于React应用需要在JS下载并运行后才能渲染出真实的HTML结构，而不利于爬虫爬取，进而无法SEO优化。并且将会导致长时间的白屏，致使用户体验性降低。

好在借助于Node.js和React服务端渲染，这两个问题已经可以忽略不计了，前提是应用上服务端渲染。

对于React SSR，主要是借助于如下几个API实现。

1、`ReactDOM.hydrate()`

> 作用于 `render()` 一样，但是对于已经使用 `ReactDOMServer` 渲染出的HTML内容，只会为其添加事件监听。

2、`ReactDOMServer`

> 运行于Node服务端，用于将组件渲染为静态标记。

有如下几个方法：

**renderToString()**

> 将React元素渲染为HTML字符串，可以用这个方法在服务端生成HTML用于首屏优化和SEO。

> 如果在节点上调用了 `React.hydrate()`，React将仅会在这些已渲染的节点上添加事件。

**renderToStaticMarkup()**

> 和 `renderToString` 类似，但是不会渲染包含React内部所使用的额外的属性。可用于在React作为静态页面生成器的场景，使用这个方法可以省去一部分字节。

> 注意：使用这个方法渲染出的标记不具备交互性。

**renderToNodeStream**

> 作用同 `renderToString` 一样，不过不会将React元素渲染为字符串，而是一个可读流。

**renderToStaticNodeStream**

> 作用同 `renderToStaticMarkup` 一样，不过不会将React元素渲染为字符串，而是一个可读流。

### 组件通信

- 父子组件之间通过 `props`, `event prop` 通信
- 兄弟组件之间通过父组件作为桥梁通信
- 更深层的组件通过如果通过 `props` 通信，会导致许多组件需接收并处理很多无用的 `props`。因此可以通过 `context` 或第三方状态库通信。

### react router 原理

- `hash` 路由：通过改变路由上的hash值，并通过window监听 `hashchange` 变化实现
- `history` 模式：通过 `pushState`，`replaceState`及window监听 `popstate` 实现
- 虚拟路由：在非浏览器环境中通过内存模拟路由

### hooks

通过hooks能够在不编写class的情况下使用 React 状态等特性。

- hooks 使得复用状态逻辑成为可能
- 将组件中相互关联的部分拆分成更小的函数
- 在非class的情况下可以使用更多的React特性

#### 常用hook

**useState**

通过 `useState` 可以在函数组件中添加 state。`useState` 会返回元组：当前状态和更新状态的函数，`useState` 接收初始状态作为参数。

**useEffect**

`useEffect` 用于执行一些副作用动作，作用同于`componentDidMount`、`componentDidUpdate`、`componentWillUnmount`。

下面是一个使用 `useEffect` 制作的计时器：

```jsx
import React, { useState, useEffect } from 'react'

function Timer() {
  const [time, setTime] = useState(0)

  useEffect(()  => {
    const timer = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)
    
    // 返回的函数会在组件卸载时执行，可用于清理计时器等资源
    return () => {
      clearInterval(timer)
    }
    // 1、不传递第二个参数时useEffect在每次渲染后都会执行
    // 2、第二个参数传空数组，则只会在初次渲染后执行
    // 3、在参数数组中传入依赖，则在依赖值改变后会重新执行
  }, [])

  return (
    <div>
      Time: {time}
    </div>
  )
}
```

**useContext**

```jsx
const value = useContext(context)
```

接收 context 对象并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 `context.Provider` 的 `value` 属性决定。

**useReducer**

```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init)
```

接收一个形如 `(state, action) => newState` 的 reducer，并返回当前的 state 以及与其配套的 `dispatch` 方法。

在计算 state 逻辑较复杂或下一个 state 依赖于之前的 state 的情况下，比 `useState` 更实用。

**useMemo**

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

将创建函数和依赖数组作为参数传入，仅会在依赖项改变时才重新计算。用于优化避免每次渲染都进行高开销的计算。

**useCallback**

```jsx
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

作用类似于 `useMemo`，只是 `useCallback` 的返回值是一个记忆化函数，需要调用采取执行内部的逻辑。

**useRef**

```jsx
const refContainer = useRef(initialValue)
```

返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数，而返回的 ref 对象在组件的整个生命周期内保持不变。

最常见的例子就是用于访问子组件:

```jsx
function AuthFocusInput() {
  const refInput = useRef(null)
  useEffect(() => {
    refInput.current.focus()
  }, [])
  return (
    <input ref={refInput} type="text"/>
  )
}
```

**useImperativeHandle**

```jsx
useImperativeHandle(ref, createHandle, [deps])
```

可用于在使用 `ref` 时自定义暴露给父组件的实例值。应当与 `forwardRef` 一起使用：

```jsx
function FancyInput(props, ref) {
  const refInput = useRef(null)
  useImperativeHandle(ref, () => ({
    focus: refInput.current.focus()
  }))
  return <input ref={refInput}/>
}

FancyInput = forwardRef(FancyInput)
```

而在渲染 `<FancyInput ref={inputRef} />` 的父组件中则可以调用 `inputRef.current.focus()`。

**useLayoutEffect**

函数签名和 `useEffect` 相同，但是会在所有的 DOM 变更之后同步调用 effect，也就是在浏览器执行绘制之前就调用。

同 `useEffect` 比较来说，`useEffect` 异步运行并且是在更新绘制到屏幕之后，可以这样理解:

1、进行了一次更新
2、React 进行组件渲染
3、浏览器进行绘制
4、运行 `useEffect`

而 `useLayoutEffect` 同步执行并且是在浏览器执行绘制之前：

1、进行了一次更新
2、React 进行组件渲染
3、运行 `useLayoutEffect`
4、浏览器进行绘制

#### 自定义hook

通过自定义 hook，可以将组件逻辑提取到可重用的函数中。

例如定义一个受控组件，原来是这样写的：

```jsx
funciton CustomInput() {
  const [state, setState] = useState('')

  return <input type="text" value={state} onChange={e => setState(e.target.value)}/>
}
```

接下来可以将一部分逻辑抽离出来:

```jsx
function useInputValue(initialValue) {
  const [state, setState] = useState(initialValue)

  const setValue = e => {
    setState(e.target.value)
  }

  return [state, setValue]
}
```

接着可以修改原来的例子为：

```jsx
function CustomInput() {
  const [value, setValue] = useInputValue('')

  return <input type="" onChange={setValue}/>
}
```

通过封装后的 `useInputValue` 成为了可复用的组件逻辑。


### Virtual DOM

Virtual DOM 将UI以一种理想化的或者说是“虚拟化”的形式存储于内存当中，并通过 React DOM 等类库使之与真实 DOM 实现同步。

这种方式赋予了 React 声明式的 UI，使我们从属性操作、事件处理和手动 DOM 更新中解放出来。

#### React Fiber

Fiber 是 React 16 的新的协调引擎，主要目的是使得 React DOM可以进行增量式渲染。

#### Diffing 算法

通过比较 React 生成的新旧两颗 DOM 树之间的差异来判断如何高效的更新 UI，以保证当前 UI 与最新的树保持同步。在这个比较过程中有一些通用的解决方案，但即使是最优算法，他的复杂度任然是O(n^3) 。于是 React 在以下假设的基础上提出了一套 O(n) 的启发式算法：

1、两个不同类型的元素会产出不同的树；
2、开发者可以通过设置 key 属性，来告知哪些子元素在不同的渲染下是保持不变的。

首先从树的根节点进行比较，不同类型的根节点会有不同的形态。

**对比不同类型的元素**：当节点为不同类型的元素时，React 会拆卸原来的树并建立起新的树。

**对比同类型的元素**：当节点的类型相同时，React 会保留 DOM 节点，仅对比及更新有改变的属性。

**对比同类型的组件元素**：当组件更新时，组件实例会保持不变，因此可以在不同的渲染时保持 state 一致。React 将更新该组件实例的 props 以保持与最新的元素保持一致，并调用该实例的生命周期函数。

**对子组件进行递归**：递归 DOM 节点的子元素时，React 会同时遍历两个子元素的列表；在产生差异时生成一个 mutation。React 引入 `key` 属性来匹配原树上的子元素以及最新树上的子元素，来实现高效更新。
