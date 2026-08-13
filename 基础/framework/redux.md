# Redux

## createStore
作用：用于创建保存着整颗状态树的Redux store。

特性:
1. 调用`dispatch`是改变store中数据的唯一方法。
2. 在一个APP中只应该有一个store，可通过`combineReducers`方法来组合多个reducer成一个reducer。
3. 调用store中的`getState`函数获取state
4. 调用store中的`replaceReducer`可用新的reducer替换当前的reducer

源码：
```javascript
import isPlainObject from 'lodash/isPlainObject';
import $$observable from 'symbol-observable';

/**
 * 由Redux保留的私有action types。
 */
export const ActionTypes = {
    INIT: '@@redux/INIT'
};

/**
 * @param    {Function}     reducer        接收当前状态树和action作为参数，处理之后返回下一个状态树
 * @param    {any}     preloadedState 初始化状态。您可以选择指定它从通用应用程序中的服务器保存状态，或恢复以前序列化的用户会话。如果使用combineReducers来生成reducer，那么这个对象必须和与combineReducers的键结构保持相同的形状
 * @param    {Function}     enhancer       store增强器。可以选择使用第三方功能件如中间件、time travel、persistence等来增加store。目前唯一由Redux官方产出的增强器是`applyMiddleware()`.
 * @return   {Store}                    一个Redux store让你读取状态(state)、派发行为(dispatch actions)和订阅获取到状态变化(subscribe to changes)
 */
function createStore(reducer,preloadedState,enhancer) {
    //如果preloadedState是函数而enhancer是undefined，则将preloadedState和enhancer的值交换
    if(typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState;
        preloadedState = undefined;
    }

    if(typeof enhancer !== 'undefined') {
        // enhancer只能是undefined或function，否则将抛出错误
        if(typeof enhancer !== 'function') {
            throw new Error('Expected the enhancer to be a function');
        }

        // enhancer满足条件，交由enhancer来处理。可参考applyMiddleware实现方式
        return enhancer(createStore)(reducer, preloadedState);
    }

    // 在没有enhancer的情况下，reducer只能是function。否则将抛出错误
    if(typeof reducer !== function) {
        throw new Error('Expected the reducer to be a function');
    }

    // 重新定义一个引用至reducer
    let currentReducer = reducer;
    // 获取当前的state，为preloadedState或undefined
    let currentState = preloadedState;
    // 定义保存订阅者函数的数组
    let currentListeners = [];
    // 定义保存下一次订阅者函数（listner）的数据
    // 意义在于subscribe(listener)后会返回一个可取消订阅的unsubscribe。
    // 当调用dispatch时，会循环currentListener并执行每个listener。
    // 如果只有currentListeners，而在循环currenListeners时如果这时候恰好执行了unsubscibe将导致currenListeners发生变化，行为将变得不可预测。
    let nextListeners = currentListeners;
    // 标识reducer是否正在执行
    let isDispatching = false;

    /**
     * 保证nextListeners不指向currentListeners,
     * 避免nextListners的变化引起currentListners的变化
     */
    function ensureCanMutateNextListeners() {
        if(nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    }

    /**
     *  通过store管理的，用于读取状态树的函数
     * 
     * @return   {any}     应用程序的当前状态 
     */
    function getState() {
        return currentState;
    }

    /**
     * 添加一个监听变化的函数，当action派发时被调用，
     * @param    {Function}     listener 每一次dispatch都将被调用的回调函数
     * @return   {Function}              用于移除回调函数的函数
     */
    function subscribe(listener) {
        // 回调只能是函数
        if(typeof listener !== 'function') {
            throw new Error('Expected listener to be a function.');
        }
        // 定义订阅标识
        let isSubscribed = true;
        // 添加回调函数，并保证不会影响到currentListeners
        ensureCanMutateNextListeners();
        nextListeners.push(listener);

        return function unsubscribe() {
            // 已经将回调函数移除了，不再往下执行
            if(!isSubscribed) {
                return;
            }
            // 标识回调函数已被移除
            isSubscribed = false;
            // 移除回调函数，并保证不会影响到currentListeners
            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
        }
    }


    /**
     * 派发action，改变状态树的唯一途径
     * @param    {Object}     action 表示此次变化的纯对象
     * @return   {Object}            action原路返回
     */
    function dispatch(action) {
        // action不是纯对象，抛出错误
        if(!isPlainObject(action)) {
            throw new Error(
                'Actions must be plain object. ' +
                'Use custom middleware for async actions.'
            );
        }
        
        // action中没有type,抛出错误   
        if(typeof action.type === 'undefined') {
            throw new Error(
                'Actions may not have an undefined "type" property. ' +
                'Hava you misspelled a contant?'
            );
        }

        // 正在派发，抛出错误
        if(isDispatching) {
            throw new Error('Reducers may not dispatch actions.');   
        }

        // 调用reducer
        try {
            isDispatching = true;
            currentState = currentReducer(currentState, action);
        } finally {
            isDispatching = false;
        }

        // 执行订阅的函数      
        const listeners = currentListeners = nextListeners;
        for(let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }

        return action;
    }

    /**
     * 使用一个新的reducer替换当前reducer
     * @param    {Function}     nextReducer 用来替代当前reducer
     * @return   {void}         
     */
    function replaceReducer(nextReducer) {
        // ruducer只能是函数
        if(typeof nextReducer !== 'function') {
            throw new Error('Expected the nextReducer to be a function.');
        }
        
        // 替换当前reducer，并初始化state
        currentReducer = nextReducer;
        dispatch({type: ActionTypes.INIT});
    }

    /**
     * 没用到过，好像是测试用的
     */
    function observable() {
        const outerSubscribe = subscribe;
        return {
            subscribe(observer) {
                if(typeof observer !== 'object') {
                    throw new TypeError('Expected the observer to be an object.');
                }

                function observeState() {
                    if(observer.next) {
                        observer.next(getState());
                    }
                }

                observeState();
                const unsubscribe = outerSubscribe(observeState);
                return { unsubscribe };
            },

            [$$observable]() {
                return this;
            }
        }
    }

    // 初始化state
    dispatch({ type: ActionTypes.INIT });

    //返回一个打包了dispatch、subscribe、getState、replaceReducer的对象。
    return {
        dispatch,
        subscribe,
        getState,
        replaceReducer,
        [$$observable]: observable
    };
}
```