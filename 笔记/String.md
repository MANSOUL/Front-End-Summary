# String
JavaScript String API

### 属性：

**获取字符串长度**
> ```
> var str = 'Hello World!';
> console.log(str.length); //12
> ```

### 方法：

**获取单个字符**
第一种方法，使用`charAt(index)`
> ```
> var str = 'Hello World!'
> console.log(str.charAt(0)) //H
> ```

第二种方法，使用数值索引
> ```
> var str = 'Hello World!'
> console.log(str[1]) //e
> ```	

**获取单个字符的unicode编码**
第一种方法，使用`charCodeAt(index)`
> ```
> var str = 'Hello World!'
> console.log(str.charAt(0)) //72
> ```

**字符串比较**
第一种方法，使用比较操作符`> < >= <=`
>
```
var a = 'a',b = 'b'
if(a > b) {
	console.log('a>b')
}else if(a < b){
	console.log('a<b')
}else{
	console.log('a==b')
}
```

第二种方法，使用`localeCompare(str)`
>
```
var a = 'a',b = 'b',c = 'a'
a.localeCompare(b) // -1
b.localeCompare(a) //1
a.localeCompare(c) //0
```

**字符串拼接**
第一种方法，使用`+`运算符
>
```
var a = 'Hello',b=' World!'
var c = a + b
console.log(c)   //Hello World!
```

第二种方法，使用`concat(str)`
>
```
var a = 'Hello',b=' World!'
var c = a.concat(b)
console.log(c)   //Hello World!
```

**返回首个被查找到的一段字符串的位置**
使用`indexOf(str)`
>
```
var a = 'Hello'
console.log(a.indexOf(l))   //2
```

**返回最后一个被查找到的一段字符串的位置**
使用`lastIndexOf(str)`
>
```
var a = 'Hello'
console.log(a.indexOf(l))   //3
```

**使用正则表达式与字符串比较**
`match(reg)`
>
```
var str = 'name=kgh,name=jack'
str.match(/name=([^,]+)/g) //["name=kgh", "name=jack"]
str.match(/name=([^,]+)/)  //["name=kgh", "kgh", index: 0, input: "name=kgh,name=jack"]
/name=([^,]+)/.exec('name=kgh,name=jack') //["name=kgh", "kgh", index: 0, input: "name=kgh,name=jack"]
```

**字符串替换**
`replace(reg|str,newSubStr|function)`
example1,使用str
>
```
var str = 'abc123@#$'
str.replace('123','$$')  					//"abc$@#$"       ($$)插入一个$
str.replace('123','$&')  					//"abc123@#$"	  ($&)插入匹配的子串
str.replace('123','$`')  					//"abcabc@#$"	  ($``)插入匹配到的子串左边的内容
str.replace('123','$\'') 					//"abc@#$@#$"	  ($'')插入匹配到的子串右边的内容
str.replace(/([^\d]*)(\d*)([^\w]*)/,'$2') 	//"123"           ($n)如果第一个参数是正则，插入第n个括号匹配到的内容
```

example2,使用reg
>
```
var str = 'abc123@#$'
var replacer = function(match,p1,p2,p3,offset,string){
	console.log(match)               //abc123@#$       ->      $&
	console.log(p1)                  //abc             ->      $1
	console.log(p2)                  //123             ->      $2
	console.log(p3)                  //@#$             ->      $3
	console.log(offset)              //0
	console.log(string)              //abc123@#$
	return p1 + '-' + p2 + '-' + p3
}
str.replace(/([^\d]*)(\d*)([^\w]*)/,replacer)
str = 'abc123@#$123'
str.replace(/(\d+)/g,function(match,p1,offset,str){
	console.log(match);
	console.log(p1);
	console.log(offset);
	console.log(str);
	return 456
})                                  //abc456@#$456
```

**截取字符串**
`slice(beginIndex[,endIndex])`,从beginIndex截取至endIndex,将新字符串返回，不改变原字符串(包前不包后)
>
```
var str = 'Hello World!'
str.slice(0,1)             //H
str.slice(0,-1)            //Hello World
str.slice(1)               //ello World!
str.slice(-1)              //!
```

`substr(beginIndex[,length])`,返回从beginIndex开始指定长度的字符串
>
```
var str = 'Hello World!'
str.substr(0,1)             //H
str.substr(1,2)            //el
str.substr(1)               //ello World!
```

`substring(beginIndex[,endIndex])`,与slice相似但有以下规则

- 任一参数小于0或为NaN,被当作0处理
- 任一参数大于length,被当作length处理（slice也是如此）
- beginIndex大于endIndex时,两者值替换

**将字符串分割成子串数组**
`split(seperate[,limit])`,seperate用来分割字符串的字符（串），limit限制返回的片段数量
>
```
var str = 'Hello World!'
str.split(' ')          //['Hello','World!']
str.split(' ',1)        //['Hello']
```

**将字符串转化为大写**
`toUpperCase()`
>
```
var str = 'Hello World!'
str.toUpperCase()         //HELLO WORLD!
```

**将字符串转化为小写**
`toLowerCase()`
>
```
var str = 'Hello World!'
str.toLowerCase()         //hello world!
```

**去除字符串两侧空格**
`trim()`
>
```
var str = ' Hello World! '
str.trim()         //Hello World!
```