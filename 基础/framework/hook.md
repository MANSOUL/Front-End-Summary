### Hook

- 让函数能拥有状态
- 使逻辑能够复用

### 常用hook

#### useState

向组件添加状态变量

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>Click {count} Time</button>
  )
}
```

#### useEffect

将组件与外部系统(网络等)同步；做一些副作用的事情，在函数组件中实现类组件的生命周期。

```jsx
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    // 在每次提交导致依赖项变更后，React 将首先使用旧值运行 cleanup 函数
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]);
  // ...
}
```

#### useLayoutEffect

在浏览器执行渲染之前执行，会阻塞浏览器渲染；用于需要通过或许DOM尺寸来动态设置DOM样式时使用。

```jsx
function ToolTip({ children }) {
  const refDiv = useRef(null)
  useLayoutEffect(() => {
    console.log(refDiv.current.getBoundingClientRect())
  }, [])

  return (
    <div ref={refDiv}>
      {children}
    </div>
  )
}
```

#### useContext

读取和订阅组件中的 context。

```jsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

function Page() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext value={{
      theme,
      setTheme
    }}>
      <div>
        <Header></Header>
        <Body></Body>
      </div>
    </ThemeContext>
  )
}

function Header() {
  const { theme } = useContext(ThemeContext)

  return (
    <div className={theme}>Header</div>
  )
}

function Body() {
  const { theme, setTheme } = useContext(ThemeContext)

  const handleClick = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button onClick={handleClick}></button>
  )
}

```

#### useRef

引用一个不需要渲染的值；通过ref操作DOM。

```jsx
function Timer() {
  const [date, setDate] = useState(Date.now())
  const refTimer = useRef(null)

  useEffect(() => {
    refTimer.current = setInterval(() => {
      setDate(Date.now())
    }, 1000)

    return () => {
      clearInterval(refTimer.current)
    }
  }, [])

  return (
    <div></div>
  )
}


function AutoFocus() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return (<input ref={inputRef}></input>)
}
```


#### useMemo

每次渲染的时候能够缓存计算的结果。

```jsx
import { useMemo } from 'react';

function TodoList({ todos, tab, theme }) {
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  // ...
}
```


#### useCallback

允许你在多次渲染中缓存函数; 返回一个缓存的函数，但并不执行。

```jsx
import { memo, useCallback } from 'react'

const ShippingForm = memo(function ShippingForm({ onSubmit }) {
  // ...
});

function ProductPage({ productId, theme }) {
  // 默认情况下, React重新渲染组件时，会渲染它的所有子组件
  // 不使用useCallback会导致每次生成一个新的handleSubmit函数
  // 从而导致onSubmit发生变化
  const handleSubmit = useCallback((orderDetails) => {
    post(`/product/${productId}/buy`, {
      orderDetails
    })
  }, [productId])


  return (
    <div className={theme}>
      <ShippingForm onSubmit={handleSubmit}/>
    </div>
  )
}
```
