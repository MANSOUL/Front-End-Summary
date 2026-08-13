# Redux
## 相关概念
Redux是一种新型的前端“架构模式”。经常和 React.js 一并提出，如果要使用 React.js 基本都要伴随着 Redux 和 React.js 结合的库 React-redux。

要注意的是，Redux 和 React-redux 并不是同一个东西。Redux 是一种架构模式（Flux 架构的一种变种），它不关注你到底用什么库，你可以把它应用到 React 和 Vue，甚至跟 jQuery 结合都没有问题。而 React-redux 就是把 Redux 这种架构模式和 React.js 结合起来的一个库，就是 Redux 架构在 React.js 中的体现
。

可以这么理解，Redux就是一个用于共享状态管理的工具，就是一个保存了许多数据的js。既然说到共享状态管理，在不引入Redux时，我们通常会这么做：
1. 共享状态不就是指有一些状态需要被的多个组件所共用吗？并且这个状态还会需要被改变。那我们直接把这个状态放在这些下级组件所共有的祖先组件就行了，然后通过将改变状态的函数通过props传递给下级组件就行了。如果层级不深的话，这样做是可行的。但是往往我们的组件层级都会达到3、4层甚至更多。这个时候通过props方式来调用或者改变状态就会变得非常繁杂。

2. 可以使用上下文，但是官方不推荐。原因大概是使用context修改共享状态太容易了，基本无门槛。修改了状态很难追溯到源头，导致维护和调试变得复杂“。
所以对于Redux的作用可以归纳为：
1. 不容易的修改共享状态
2. 有门槛的修改共享状态
3. 高调（大张旗鼓的调用修改reducer）的修改共享状态
4. 使修改状态容易被追溯


在实现Redux之前，先了解几个跟Redux相关的概念：
1. Provider
2. createStore
3. connect
4. store(subscriber、getState、dispatch)
上述概念各自的作用：
1. Provider:用于提共享状态的一个纯组件而已
2. createStore: 用于创建store即包含了共享状态和dispatch的对象
3. connect: 用于将普通组件改造成能接收并且修改共享状态的一个纯函数
4. store: 只是一个名字真正重要的是括号中的东西。subscriber：订阅者模式中的订阅者，用于添加回调函数。getState：对外公共方法，用于提供共享状态。dispatch：用于修改共享状态。

## 编码实现
创建`redux.js`、`react-redux.js`。
编辑`redux.js`：
```javascript
/**
* 用于创建store
* @param reducer 用户自己创建的reducer
*/
function createStore(reducer) {
    var state = null;
    var listeners = [];
    //dispatch用于派发事件，action包含type和用户自定义的状态信息
    var dispatch = function(action) {
        //更新共享状态
        state = reducer(state,action);
        //派发监听事件
        listeners.forEach(function(listener) {
            listener();
        });
    };
    //订阅者模式，用于实现共享状态更新后，通知React进行更新
    var subscriber = function(listener) {
        listeners.push(listener);
    };
    //用于提供state
    var getState = function() {
        return state;
    };
    //首次调用，用于初始化共享状态的值
    dispatch();
    return {
        dispatch: dispatch,
        subscriber: subscriber,
        getState: getState
    };
}
export default createStore;
```
`react-redux.js`:
```
import React,{Component} from 'react';
import PropTypes from 'prop-types';

/**
* Provider只是一个用于提供上下文的组件
*/
export class Provider extends Component {

    static childContextTypes = {
        store: PropTypes.object
    }

    getChildContext() {
        return {
            store: this.props.store
        }
    }

    render() {
        return (
            <div>{this.props.children}</div>
        )
    }
}
/**
* connect接收用户自定义的mapStateToProps，mapDispatchToProps
* mapStateToProps，mapDispatchToProps用于将state及dispatch以用户自定义的方式提供。
*/
export var connect = function(mapStateToProps,mapDispatchToProps) {
    return function(WrapperComponent) {
        class ConnectComponent extends Component {

            static contextTypes = {
                store: PropTypes.object
            }

            constructor(props) {
                super(props);
                this.state = {
                    allProps: {}
                }
            }

            componentWillMount() {
                //添加监听函数，用于在共享状态改变之后调用以使组件更新
                this.context.store.subscriber(()=>this.updateProps());
                //初始调用，以使组件获取共享状态的初始值
                this.updateProps();
            }

            updateProps() {
                var store = this.context.store;
                //通过mapStateToProps,mapDispatchToProps来分发共享状态
                var stateProps = mapStateToProps?mapStateToProps(store.getState()):{};
                var dispatchProps = mapDispatchToProps?mapDispatchToProps(store.dispatch):{};
                this.setState({
                    allProps: {
                        ...this.props,
                        ...stateProps,
                        ...dispatchProps
                    }
                });
            }

            render() {
                //将用户需要的共享状态和上级传入的属性、修改状态的事件以props的形式传递
                return (<WrapperComponent {...this.state.allProps}/>)
            }
        }
        return ConnectComponent;
    }
}
```
接下来可以像使用react-redux一样使用它们，但是并不完全包含官方Redux所具备的功能。实际上redux和react-redux的实现比这个要复杂的多，例如可以使用中间件等。