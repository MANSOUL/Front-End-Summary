## 框架原理

### 模版解析

### JSX 语法

### 数据劫持

### 数据代理

### Diff 算法

同一个 list 里，React 只认「父节点相同、层级相同」的子节点，用 `key`（没有就用下标）判断是不是同一个节点，然后走一遍从左到右的贪心对齐。

先按新列表顺序扫。如果当前位置的旧节点和新节点 `key` + 类型都对上，就原地复用，继续往后。一旦对不上，就把剩下的旧节点丢进一张以 `key` 为索引的表。后面每个新节点都去这张表里找：找到就复用，找不到就新建；最后表里还剩的旧节点一律删除。

移动靠 `lastPlacedIndex` 判断：复用节点时，如果它在旧列表里的下标比上一个已放稳的节点还小，说明它被往前插了，需要移动；否则认为它还在原相对位置，不用动 DOM。所以 list Diff 的代价接近 O(n)，代价是它不会求最长递增子序列，只保证「尽量少动」，不保证全局最少移动。

### Fiber 算法

Fiber是React16引入的一种全新的数据结构，主要用来解决之前React递归遍历组件树，遍历无法中断，必须一步到底；而引入Fiber结构后便可现实`异步可中断渲染`、`时间切片`、`任务优先级`等解决方案。

Fiber是一种`链表结构`，通过return、child、sibling构成一整棵树，而链表通过循环深度优先遍历，则是可中断可恢复的；由于可中断的特性的，可能导致渲染执行到一半而屏幕也只更新到一半，所以引入了`双缓存`，`current`表现当前显示到屏幕的树，而`workInProgress`则是工作中的树，当渲染阶段完成，再切换指针指向WIP，一次到底，完成屏幕更新。

Fiber也是为后续实现Suspense和Concurrent Mode打下基础；

React做了一个Schedule（调度器）来实现时间切片，其内部通过MessageChannel实现：
1、Fiber链表：将渲染任务拆成一个个Fiber节点；
2、调度器：每一次工作只占用5ms；
3、MessageChannel：5ms一到，停止，将主线程让于用户点击或浏览器渲染；
4、恢复：等到主线程空出来后，从停下来的位置继续往前走。

```js
let wip = rootFiber
let deadline = 0 //执行截止时间

// 核心循环工作（在MessageChannel回调中执行）
function workLoop(_deadline) {
  deadline = _deadline
  // 执行一个Fiber节点（diff、打标记）
  while(wip !== null && shouldYield()) {
    wip = performUnitWork(wip)
  }

  if (wip !== null) {
    // 时间片用完了，但工作还没做完！
    // 请求下一个宏任务继续
    requestHostCallback(workLoop)
  } else {
    // 全部完成，进入提交阶段
    commitRoot()
  }
}
const channel = new MessageChannel()
const port = channel.port2
let scheduledHostCallback = null

channel.port1.onmessage = function() {
  scheduledHostCallback && scheduledHostCallback()
}

function requestHostCallback(callback) {
  scheduledHostCallback = callback
  port.postMessage(null)
}

// 判断是否该踩刹车了
function shouldYield() {
  // 情况1：时间片已超过5ms
  // 情况2:有更高优先级的任务插队了
  reutrn getCurrentTime() >= deadline || hasHigherPriorityTask()
}

function performUnitWork(wip) {
  // do some work

  // 返回子节点
  if (wip.child) {
    return wip.child
  }

  // 返回兄弟节点
  let nextFiber = wip
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.return
  }

  return null
}


```



