# ES6-常用特性

## Class
ES5及之前的版本并没有明确类的概念，在ES6中添加了类。
类可以看作是一个语法糖，其中还加入了`extends`关键字用于类的继承，它们的功能使用ES5基本也都能实现。
**写法对比-ES5**
```javascript
function Animal(name,age) {
    this.name = name;
    this.age = age;
}

Animal.prototype.speak = function() {
    console.log('name is:'+this.name+',age is:'+this.age);
}

function Human(name,age,iq) {
    Animal.apply(this,arguments);
    this.iq = iq;
}

Human.prototype = new Animal();
Human.prototype.constructor = Human;
```
**写法对比-ES6**
```javascript
class Animal {
    constructor(name,age){
        this.name = name;
        this.age = age;
    }

    speak() {
        console.log('name is:'+this.name+',age is:'+this.age);
    }
}

class Human extends Animal {
    constructor(name,age,iq) {
        super(name,age);
    }
}
```
如上，分别为ES5和ES6写法的类的继承，ES6看起来更接近于传统面向对象语言，所以也比较好理解。但总的来说效果是一样的。

## Promise
JavaScript是一门基于事件驱动的单线程语言，正式由于这种设计，所以也因此导致了回调函数过深的问题。下面是一个ajax请求回调的例子：要使用某个请求，需要先获取上一个请求返回的数据作为本次请求的参数！
**写法对比-ES5**
```javascript
function request(url,callback,data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST',url,true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
        if(this.readyState === this.DONE && this.status === 200){
            var response = this.response;
            callback(response);
        }
    }
    xhr.send(data);
}

request('api/user',function(res){
    request('api/userinfo',function(res){
        //do something
    },'uid='+res.uid);
},'name=xxx&pwd=xxx');
```
**写法对比-ES6**
```javascript
function request(url,data) {
    var pro = new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        xhr.open('POST',url,true);
        xhr.responseType = 'json';
        xhr.onreadystatechange = function() {
            if(this.readyState === 4 && this.status === 200){
                var response = this.response;
                resolve(response);
            }
        }
        xhr.onerror = function(){
            reject();
        }
        xhr.send(data);
    });
    return pro;
}

request('api/user',data).then(function(res){
    return res.uid;
}).then(function(uid){
    return request('api/userinfo','uid='+uid);
}).then(function(res){
    //do something
});
```
对比，ES5与ES6 Promise的写法，乍一看并没有感觉`Promise`写法有多大的好处。但是当你的回调越来越多再来对比你就会发现ES5回调层级越来越深，导致代码阅读起来非常麻烦，但是`Promise`使用的链式写法却依然可以保持简洁。

## 模块语法
JavaScript一直没有模块体系。在ES6之前社区制定了Node.js使用的`CommonJS`到前端使用的`amd`模式`cmd`模式。
而在ES6标准的层面上模块功能也被正式引入，实现更加简单，并且完全可以取代`CommonJS`和`AMD`规范，在未来也将成为后端与前端通用的模块解决方案。
- `UserModel.js`
```javascript
class UserModel {
    getUserById(uid) {
        //查询
    }
}
// 导出
export default UserModel;
```

- `UserController.js`
```javascript
// 导入
import UserModel from 'models/UserModel';
class UserController {
    constructor() {
        this.userModel = new UserModel();
    }

    userInfo(uid) {
        this.userMode.getUserById(uid);
    }
}
```
如上，`export`用于规定对外的借口,`import`用于加载模块。
关于`export`和`import`的用法远不止上面例子所示。有兴趣可以自己查资料学习。

## 解构赋值
ES6允许按照一定模式，从数组或对象中提取值，并将值赋值给变量。
### 数组解构
例：为变量赋值
```javascript
var a = 1;
var b = 2;
var c = 3;
```
ES6可以写成：
```javascript
var [a,b,c] = [1,2,3];
```

### 对象的解构
获取到person对象中的name和age值
```javascript
var person = {
    name: 'XiaoMing',
    age: 8
};

// ES5
var name = person.name;
var age = person.age;

// ES6
var {name,age} = person;
```
解构还有更多使用方式，可以查资料学习。

## let和const

### `let`与`var`一样用于声明变量，但是引入了块级作用域。原来JavaScript中只有全局中作用域和函数作用域。
下面是一个经典的例子。
```javascript
for(var i = 1;i <= 5; i++) {
    setTimeout(function() {
        console.log(i);
    },0);
}
console.log(i);
```
上面的结果是输出:6个6。显然没有达到我们的预期.
接下来将`var`改为`let`：
```javascript
for(let i = 1;i <= 5; i++) {
    setTimeout(function() {
        console.log(i);
    },0);
}
console.log(i);
```
结果如下：
```
Uncaught ReferenceError: i is not defined
1
2
3
4
5
```
另外对于i,还有其他的新特性，如：不存在变量提升、暂时性死区、不允许在同一作用域中声明统一变量。

### const
`const`用于声明常量，但是仅限于基本变量如布尔值、数值、字符串。根本原因在于其不可变的不是变量的值不可改动，而是变量所指向的内存地址不可改动。

## 模版语法
想使用后端模版语法一样，ES6支持模版对象。
ES5中组合一段字符串:
```javascript
var name = 'Xiaoming';
var age = 8;
var description = 'My name is '+name+',my age is '+age+' years old';
```
ES6写法:
```javascript
var name = 'Xiaoming';
var age = 8;
var description = `My name is ${name},my age is ${age} years old`;
```

## 使用多行字符串
当我们在ES5中需要组合多行字符串时：
```javascript
var template = '<div>';
    template += '<div>{{name}}</div>';
    template += '<div>{{age}}</div>';
    template += '</div>';
```
ES6使用反引号写法
```javascript
var template = `<div>
                <div>{{name}}</div>
                <div>{{age}}</div>
                </div>`;
```

## 箭头函数
ES5中函数执行时，`this`指向函数调用者，对于新手来说对此常常产生困惑。ES6引入函数，将函数`this`指向定义函数时的上下文对象。

**普通函数写法**
```javascript
function Button() {
    this.name = 'Xiaoming';
    document.querySelector('button').onclick = function() {
        console.log(this.name);
    };
}
new Button();
```
如上,`this`为`HTMLButtonElement`,所以打印出name为`undefined`。

```javascript
function Button() {
    this.name = 'Xiaoming';
    document.querySelector('button').onclick = () => {
        console.log(this.name);
    };
}

new Button();
```
如上,`this`指向创建的button对象，所以打印出name为`Xiaoming`。
