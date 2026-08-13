# React组件

## 理解JSX语法
### 使用HTML来描述数据
```html
<div class="info" id="content">
    <div class="name">XiaoMing</div>
    <div class="age">8</div>
</div>
```
### 使用JS来描述数据
```json
{
    tag: 'div',
    attrs: {className: 'info',id: 'content'},
    children: [
        {
            tag: 'div',
            attrs: {className: 'name'},
            children: ['XiaoMing']
        },{
            tag: 'div',
            attrs: {className: 'age'},
            children: ['8']
        }
    ]
}
```
使用HTML或JS同样可以用来描述数据。但是对比发现，使用JS来描述的数据相对来说更长且不清晰，于是React.js就把两者结合了一下，产生了JSX语法，使的HTML结构可以写在JS中。

## ES5 写法
### 创建组件
#### React.createClass
此方法接受一个配置对象，并返回一个创建后的React组件
```
var CountButton = React.createClass({
    //设置组件状态
    getInitialState: function() {
        return {
            count: 0
        };
    },
    // 设置props的类型
    propTypes: {
        name: React.PropTypes.string.isRequired,
    },
    // 设置props默认值
    getDefaultProps: function() {
        return {
            name: 'count button'
        };
    },
    handleClick: function() {
        this.setState({
            count: ++this.state.count
        });
    },
    render: function() {
        return <button onClick={this.handleClick}>Clicked Me!{this.state.count}Times,My Name is {this.props.name}</button>;
    }
});
```

#### React.createElement
实例化一个React组件
```
var countButtonElement = React.createElement(CountButton,null,null);

ReactDOM.render(countButtonElement,document.getElementById('app'));
```

## ES6
### 创建组件
```
import React,{Component} from 'react';
import PropTypes from 'prop-types';

class CountButton extends Component{
    // 设置props的类型
    static propTypes = {
        name: PropTypes.string.isRequired
    }

    // 设置props默认值
    static defaultProps = {
        name: 'count button'
    }

    constructor(props) {
        super(props);
        //设置组件状态
        this.state = {
            count: 0
        };
    }

    handleClick() {
        this.setState({
            count: ++this.state.count
        });
    }

    render() {
        return <button onClick={this.handleClick}>Clicked Me!{this.state.count}Times,My Name is {this.props.name}</button>;
    }
}
```

## 组件生命周期
|       组件名               |       描述                               |
| ------------------------- | --------------------------------------- |
|componentWillMount         |在渲染前调用,在客户端也在服务端              |
|componentDidMount          |在第一次渲染后调用，只在客户端                |
|componentWillReceiveProps  |在组件接收到一个新的prop时被调用              |
|shouldComponentUpdate      |可以在你确认不需要更新组件时使用,返回一个布尔值. |
|componentWillUpdate        |在组件接收到新的props或者state时被调用.       |
|componentDidUpdate         |在组件完成更新后立即调用                     |
|componentWillUnmount       |组件从 DOM 中移除的时候立刻被调用             |

初始化执行顺序：
componentWillMount -> componentDidMount

props更新执行顺序:
componentWillReceiveProps -> shouldComponentUpdate -> componentWillUpdate -> componentDidUpdate

state更新执行顺序:
shouldComponentUpdate -> componentWillUpdate -> componentDidUpdate
