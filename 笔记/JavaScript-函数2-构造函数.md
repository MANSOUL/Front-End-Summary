在讲构造函数的时候先看看其他的编程语言是怎么做的:
*java*
```
class HelloWorld {
    public HelloWorld() {

    }
}
```
*typescript*
```
class HelloWorld {
    /**
     * 构造函数
     */
    public constructor() {

    }
}
```
反观JavaScript你会发现它就简单的多了，函数同时兼具类与构造函数两份职责，如下：
```
function HelloWorld() {

}
```
在JavaScript的构造函数中,通常我们将函数首字母大写，用以区分构造函数与普通函数。

#### 构造函数的实例化
与很多其他的编程语言类似，JavaScript生成对象也是通过`new`关键字
```
function Person(name,age) {
    this.name = name;
    this.age = age;
    this.speak = function() {
        console.log('my name is:'+this.name+',and i am '+this.age+' years old');
    }
}
var xm = new Person('xiaoming',10);
xm.speak();
```

**`new`关键字的机制**
在JavaScript中使用new关键字生成一个对象实例时，经过了以下几个步骤:
new关键字运行机制
1 创建了一个新的空对象,将this指向这个对象
2 设置这个新对象的__proto__属性，并将__proto__指向构造函数的原型对象
3 判断返回值，如果无返回值或返回值为`this`或返回值为非对象，则返回这个对象
```
function Person(name,age) {
    this.name = name;
    this.age = age;
}
Person.prototype.speak = function() {
    console.log('my name is:'+this.name+',and i am '+this.age+' years old');
}

function SuperMan(name,age) {
    Person.call(this,name,age);
}
var sm = new SuperMan('Clark Kent',20);
```
如上代码，所示，生成sm对象时一共经历了下面几个阶段：
1: var obj = {};this = obj;
2: this.name = name;this.age = age;
3: return obj;

**继承**
JavaScript基于原型继承，这里我们可以把原型看成是一个模版，而继承的东西则存在于这个模版当中，所以JavaScript的继承并不是拷贝，而是链接。想象一下有一串珠子`o-o-o-o-o`。它们被一条原型链连接了起来，位于最右端的珠子可以拿到位于它左面的珠子的属性和方法，但这个顺序是不可逆的（即不能自左向右）。

还是这个例子:
```
function Person(name,age) {
    this.name = name;
    this.age = age;
}
Person.prototype.speak = function() {
    console.log('my name is:'+this.name+',and i am '+this.age+' years old');
}

function SuperMan(name,age) {
    Person.call(this,name,age);
}
SuperMan.prototype = Object.create(Person.prototype);
SuperMan.prototype.constructor = SuperMan;
var sm = new SuperMan('Clark Kent',20);
sm.speak();
```
这里我们使用的是一种叫做“寄生组合的方式实现继承”，JavaScript实现继承的方式有很多种。只要理解了原型这个东西，要实现其他几种都是一样的套路。
下面说一下“寄生组合的方式实现继承”的几个重要的点：
- `prototype`这个属性就叫做原型，原型是一个对象，`prototype.constructor`指向构造函数
- `SuperMan.prototype = Object.create(Person.prototype)`这一句将`SuperMan`的原型指向了一个通过`Object.create`构造的`Person`的实例，目的是为了要继承`Person`中的方法
- `SuperMan.prototype.constructor = SuperMan`,这一句是将原型中的构造函数修改为`SuperMan`.未修改之前`constructor`指向`Person`
- `Person.call(this,name,age)`,这一句通过`call`方法继承Person的属性。
这样一来SuperMan便能继承Person的属性和方法。为什么使用这种继承方式，下次可以讲一下JavaScript的几种继承方法与对比，便能了解了。

**函数中的this指向**
JavaScript的`this`关键字一直都是个坑，想我当初也是被他伤害的体无完肤啊，谁叫我很久之前还做过java呢，说到java，那么我们就对比一下java中的this与JavaScript中的this吧。
- java中的this
在类中使用，就代表着这个类的实例，一般是不会变的（不知道我这样理解对不对，不对请见谅）
- JavaScript中的this
一句话，函数被谁调用`this`就指向谁

下面通过几个例子来讲一下:
```
function Person(name) {
    this.name = name;
    this.speak = function() {
        console.log('Hello,I am '+this.name);
    }
}
var xm = new Person('小明');
xm.speak();//Hello,I am 小明
```
这种方式应该是`this`关键字使用的经典场景了，`this`指向也是没什么疑问的。

```
var button = document.getElementById('button');
function Person(name) {
    this.name = name;
    this.speak = function() {
        console.log('Hello,I am '+this.name);
    }
}
var xm = new Person('小明');
button.onClick = xm.speak;
button.onClick();//Hello,I am undefined
```
再看看这个例子，我们有一个按钮，并且为按钮添加一个点击事件，恰巧这个事件函数就是xm.speak。当点击按钮时事件函数就会被调用。但是这里的`this.name`却为`undefined`，因为这里的`this`已经指向button了，而button中并没有`name`属性。所以始终记住:函数被谁调用`this`就指向谁.而这里调用这个函数的是button。


