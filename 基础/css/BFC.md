## BFC是什么？

BFC也叫块级格式化上下文（Block format context）,它是页面上可视CSS渲染的一部分，是块盒子布局过程发生的区域，也是浮动元素与其他元素的交互的区域。

## BFC有什么用？

- 清除浮动
- 浮动塌陷
- 外边距合并

## 如何形成BFC？

- 根元素
- 浮动元素（float不为none）
- 绝对定位元素 (position: absolute|fixed)
- 行内块元素（diaplay: inline-block）
- overflow不为visible
- 弹性布局或网格布局的子元素
- display: flow-root