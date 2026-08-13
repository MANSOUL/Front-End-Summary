# CSS-Flex布局

## 一、Flex布局是什么
是Flexible Box的缩写，意为弹性布局
**将容器设置为flex**
```
	//块状元素
	.box{
		display: flex;
	}

	//行内元素
	.box{
		display: inline-flex;
	}
```
*！设置为flex布局后float，clear，vertical-align将失效*

## 二、基本概念
将设为flex布局的元素称之为容器，flex布局两个主要概念：主轴）(main-axis)、交叉轴(cross-axis)、项目(item)
>
主轴：
	默认在一个容器中，水平方向为主轴
交叉轴：
	默认在一个容器中，水平方向为交叉轴
项目：
	在容器中的单个元素，默认在主轴上排列

![flex-box](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071004.png)

## 三、容器的属性
容器拥有下列属性
```
- flex-direction
- flex-wrap
- flex-flow
- justify-content
- align-items
- align-content
```

### flex-direction
flex-direction规定主轴的方向。
```
.box {
	flex-direction: row | row-reverse | column | column-reverse;
}
```
取值范围：
```
- row(默认): 主轴为水平方向，项目从main-start开始排列
- row-reverse: 主轴为水平方向，项目从main-end开始排列
- column: 主轴为垂直方向，项目从cross-start开始排列
- column-reverse: 主轴为垂直方向，项目从cross-end开始排列
```

### flex-wrap
规定项目在轴线上排列时如果排列不下去该如何换行。
```
.box {
	flex-wrap: nowrap | wrap | wrap-reverse;
}
```
取值范围
```
- nowrap（默认）: 当项目放不下时，不进行换行
- wrap: 当项目放不下时换行，第一行在上面
- wrap-reverse: 当项目放不下时换行，第一行在下面
```

### flex-flow
`flex-direction`和`flex-wrap`的缩写，默认值为`row nowrap`
```
.box {
	flex-flow: row nowrap;
}
```

### justify-content
规定项目在主轴上的对齐方式
```
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

### align-items
规定项目在交叉轴上的对齐方式
```
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

### align-content
定义项目多根轴线的对齐方式，如果只有一根轴线，则不生效
```
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

## 四、项目的属性
项目拥有下列属性：
```
- order
- flex-grow 
- flex-shrink
- flex-basis
- flex
- align-self
```
### order
定义项目的排列顺序。数值越小排列越前
```
.item {
	order: <interger>;
}
```
![order](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071013.png)

### flex-grow
定义项目的放大比例，默认为0，即即使存在剩余空间也不放大
```
.item {
	flex-grow: <number>;
}
```
PS:假如有三个项目，它们的flex-grow都为1，则它们将等分生于空间，1/3，1/3，1/3。如果第一个项目flex-grow为2，2/4，1/4，1/4

### flex-shrink
定义项目的缩小比例，默认为1，即如果空间不足，项目将缩小
```
.item {
	flex-shrink: <number>;
}
```
为0时不缩小

### flex-basis
定义在分配多余空间之前，项目占据主轴的空间，默认为auto，即项目本来的大小
```
.item {
	flex-basis: <length> | auto;
}
```

### flex
`flex-grow`,`flex-shrink`,`flex-basis`的缩写
```
.item {
	flex: none | auto | [flex-grow flex-shrink flex-basis];
}
```
默认为`0 1 auto`,后两个属性为可选项。快捷值: `auto(1 1 auto)`,`none(0 0 auto)`

### align-self
定义单个元素的对齐方式，可覆盖align-items这个属性，默认值为auto,表示继承父元素的align-items属性
```
.items {
	align-self: auto | flex-start | flex-end | baseline | center | stretch;
}
```