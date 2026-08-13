### 概念
#### flex容器

设置元素的 `display` 为 `flex` 或 `inline-flex`，则其将成为flex布局的容器。

#### flex项目

若元素的父容器设置了flex布局，则其将成为flex项目。

#### 轴

假定flex容器中水平和垂直方向分别有两根轴线。则默认情况下，flex容器的水平方向为**主轴**，垂直方向为**交叉轴**。

### flex容器CSS属性:

- container
    + display: flex;
    + flex-direction: row | row-reverse | column | column-reverse;
    + flex-wrap: nowrap | wrap | wrap-reverse;
    + flex-flow: <flex-direction> || <flex-wrap>;
    + justify-content: flex-start | flex-end | center | space-between | space-around;
    + align-items: stretch | flex-start | flex-end | center | baseline;
    + align-content: stretch | flex-start | flex-end | center | space-between | space-around;

### flex项目的CSS属性：

- item
    + order: <integer>;
    + flex-grow: <number>;
    + flex-shrink: <number>;
    + flex-basis: auto | <length>;
    + flex: <flex-grow> || <flex-shrink> || <flex-basis>;
        * auto (1 1 auto)
        * none (0 0 auto)
    + align-self: auto | flex-start | flex-end | center | baseline | stretch;

### 容器属性详解

容器拥有下列属性

```css
flex-direction
flex-wrap
flex-flow
justify-content
align-items
align-content
```

#### flex-direction

flex-direction规定主轴的方向。

```css
.box {
    flex-direction: row | row-reverse | column | column-reverse;
}
```

取值范围：

```css
- row(默认): 主轴为水平方向，项目从main-start开始排列
- row-reverse: 主轴为水平方向，项目从main-end开始排列
- column: 主轴为垂直方向，项目从cross-start开始排列
- column-reverse: 主轴为垂直方向，项目从cross-end开始排列
```

#### flex-wrap

规定项目在轴线上排列时如果排列不下去该如何换行。

```css
.box {
    flex-wrap: nowrap | wrap | wrap-reverse;
}
```

取值范围

```css
- nowrap（默认）: 当项目放不下时，不进行换行
- wrap: 当项目放不下时换行，第一行在上面
- wrap-reverse: 当项目放不下时换行，第一行在下面
```

#### flex-flow

`flex-direction`和`flex-wrap`的缩写，默认值为`row nowrap`

```css
.box {
    flex-flow: row nowrap;
}
```

#### justify-content

规定项目在主轴上的对齐方式

```css
.box {
    justify-content: flex-start | flex-end | center | space-between | space-around;
}
```

取值范围：

```
- flex-start(默认值): 左对齐                         |. . .    |
- flex-end: 右对齐                                  |    . . .|
- center: 居中对齐                                  |  . . .  |
- space-between: 两端对齐，项目之间的间隔相等           |.   .   .|
- space-around: 项目两端的间隔相等                    | .  .  . |
```

#### align-items

规定项目在交叉轴上的对齐方式

```css
.box {
    align-items: flex-start | flex-end | center | baseline | stretch;
}
```

取值范围：

```
- flex-start: 交叉轴起点对齐
- flex-end: 交叉轴重点对齐
- center: 交叉轴中点对齐
- baseline: 项目基于第一行文字对齐
- stretch（默认值）: 项目如果没有设置高度或设置为auto，将被拉伸占满容器的高
```

#### align-content

定义项目多根轴线的对齐方式，如果只有一根轴线，则不生效

```css
.box {
    align-content: flex-start | flex-end | center | stretch | space-between | space-around;
}
```

取值范围：

```
- flex-start: 与交叉轴起点对齐
- flex-end: 与交叉轴终点对齐
- center: 与交叉轴中点对齐
- stretch（默认值）: 轴线占满交叉轴
- space-between: 与交叉轴两端对齐，轴的间隔相等
- space-around: 轴的上下间隔相等
```

### 项目属性

项目拥有下列属性：

```css
order
flex-grow 
flex-shrink
flex-basis
flex
align-self
```

#### order

定义项目的排列顺序。数值越小排列越前

```css
.item {
    order: <interger>;
}
```

#### flex-grow

定义项目的放大比例，默认为0，即即使存在剩余空间也不放大

```css
.item {
    flex-grow: <number>;
}
```

PS:假如有三个项目，它们的flex-grow都为1，则它们将等分生于空间，1/3，1/3，1/3。如果第一个项目flex-grow为2，2/4，1/4，1/4

#### flex-shrink

定义项目的缩小比例，默认为1，即如果空间不足，项目将缩小

```css
.item {
    flex-shrink: <number>;
}
```

为0时不缩小

