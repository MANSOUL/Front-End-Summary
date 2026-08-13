# XMLHttpRequest
XMLHttpRequest提供了一组用于客户端和服务器之间传输数据的API

### 从XMLHttpRequest接口来看：
```
[NoInterfaceObject]
interface XMLHttpRequestEventTarget: EventTarget {
    attribute EventHandler onloadstart;
    attribute EventHandler onprogress;
    attribute EventHandler onabort;
    attribute EventHandler onerror;
    attribute EventHandler onload;
    attribute EventHandler ontimeout;
    attribute EventHandler onloaded;
};

interface XMLHttpRequestUpload: XMLHttpRequestEventTarget {

};

enum XMLHttpRequestResponseType {
    "",
    "arraybuffer",
    "blob",
    "document",
    "json",
    "text"
};

[Constructor]
interface XMLHttpRequest: XMLHttpRequestEventTarget {
    //event handler
    attribute EventHandler onreadystatechange;

    //states
    const unsigned short UNSENT = 0;
    const unsigned short OPENED = 1;
    const unsigned short HEADERS_RECEIVED = 2;
    const unsigned short LOADING = 3;
    const unsigned short DONE = 4;
    readonly attribute unsigned short readyState;

    //request
    void open(ByteString method,[EnsureUTF16] DOMString url);
    void open(ByteString method,[EnsureUTF16] DOMString url,boolean async,optional [EnsureUTF16] DOMString? username = null,optional [EnsureUTF16] DOMString? password = null);
    void setRequestHeader(ByteString header,ByteString value);

    attribute unsigned lond timeout;
    attribute boolean withCredentials;
    readonly attribute XMLHttpRequestUpload upload;
    void send(optional (ArrayBufferView or Blob or [EnsureUTF16] DOMString or FormData)?data=null);

    //response
    ByteString?getResponseHeader(ByteString header);
    ByteString?getAllResponseHeader();
    void overrideMimeType(DOMString mime);
    
    readonly attribute unsigned short status;
    readonly attribute ByteString statusText;
    attribute XMLHttpRequestResponseType responseType;
    readonly attribute any response;
    readonly attribute DOMString responseText;
    readonly attribute Document? responseXML;
}
```
每一个XMLHttpRequest都有一个唯一的与之关联的XMLHttpRequestUpload对象
实例：
```
    var formData = new FormData();
    formData.append('name','Kuang');
    formData.append('password','Kuang')

    var xhr = new XMLHttpRequest();
    xhr.timeout = 300;
    xhr.responseType = 'json';
    xhr.open('POST',test.json',true);
    xhr.onreadystatechange = function() {
        if(this.readyState === this.DONE){
            if(this.status === 200 || this.status === 304){

            }
        }
    }
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(formData);
```

### XMLHttpRequest详解
#### 事件
实现XMLHttpRequestEventTarget的事件：
```
    onloadstart
    onprogress
    onabort
    onerror
    onload
    ontimeout
    onloaded
```
自身定义的事件：
```
    onreadystatechange
```

#### 状态
常量：
```
    UNSENT = 0
    OPENED = 1;
    HEADERS_RECEIVED = 2;
    LOADING = 3;
    DONE = 4;
```
`readyState`是一个只读属性可取以上五个常量的值，当readyState改变是将出发onreadystatechange事件。

#### request相关
**方法**：
`open()`打开一个请求
```
    open(method,url,async,[name],[password]);
    method: 请求方法POST，GET
    url: 请求地址
    async: 是否使用异步方式发起请求
```
`setRequestHeader()`设置请求头
```
    setRequestHeader(header,value);
    header: 请求头类型
    value: 请求头值
    采用追加方式设置
```
`send()`发起请求
```
    send(arraybuffer|blob|formdata|string);
    发起一个请求，可附带数据，发送query string时需要设置setRequestheader('Content-Type','application/x-www-form-urlencoded')
```
**属性**
```
    timeout             
    //设置请求超时时间
    withCredentials
    /*
    发起同域请求时，request header中会自动添加上cookie。而发送跨域请求时cookie并不会添加进request header
    
    造成这个问题的原因是：在CORS标准中做了规定，默认情况下，浏览器在发送跨域请求时，不能发送任何认证信息（credentials）如"cookies"和"HTTP authentication schemes"。除非xhr.withCredentials为true（xhr对象有一个属性叫withCredentials，默认值为false）。

    所以根本原因是cookies也是一种认证信息，在跨域请求中，client端必须手动设置xhr.withCredentials=true，且server端也必须允许request能携带认证信息（即response header中包含Access-Control-Allow-Credentials:true），这样浏览器才会自动将cookie加在request header中。

    另外，要特别注意一点，一旦跨域request能够携带认证信息，server端一定不能将Access-Control-Allow-Origin设置为*，而必须设置为请求页面的域名。
    *／
    upload
    //XMLHttpRequestUpload
    对象用户上传，实现了XMLHttpRequestEventTarget接口，故带有相应的事件处理
```

#### response相关
**方法：**
`getResponseHeader`获取某一请求头
```
    getResponseHeader(header);
    //返回特定请求头的值
```

`getAllResponseHeader`获取全部请求头
```
    getAllResponseHeader()
    //返回所有请求头组成的字符串
```
`overrideMimeType`

overrideMimeType是xhr level 1就有的方法，所以浏览器兼容性良好。这个方法的作用就是用来重写response的content-type，这样做有什么意义呢？比如：server 端给客户端返回了一份document或者是 xml文档，我们希望最终通过xhr.response拿到的就是一个DOM对象，那么就可以用xhr.overrideMimeType('text/xml; charset = utf-8')来实现。
获取图片的实例
```
    var xhr = new XMLHttpRequest();
    //向 server 端获取一张图片
    xhr.open('GET', '/path/to/image.png', true);

    // 这行是关键！
    //将响应数据按照纯文本格式来解析，字符集替换为用户自己定义的字符集
    xhr.overrideMimeType('text/plain; charset=x-user-defined');

    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4 && this.status == 200) {
        //通过 responseText 来获取图片文件对应的二进制字符串
        var binStr = this.responseText;
        //然后自己再想方法将逐个字节还原为二进制数据
        for (var i = 0, len = binStr.length; i < len; ++i) {
          var c = binStr.charCodeAt(i);
          //String.fromCharCode(c & 0xff);
          var byte = c & 0xff; 
        }
      }
    };

    xhr.send();
```
代码示例中xhr请求的是一张图片，通过将 response 的 content-type 改为'text/plain; charset=x-user-defined'，使得 xhr 以纯文本格式来解析接收到的blob 数据，最终用户通过this.responseText拿到的就是图片文件对应的二进制字符串，最后再将其转换为 blob 数据。

**属性：**
`status`
请求成功后的状态

`statusText`
请求成功后的状态文字

`responseType`
responseType是xhr level 2新增的属性，用来指定xhr.response的数据类型，目前还存在些兼容性问题，可以参考本文的【XMLHttpRequest的兼容性】这一小节。那么responseType可以设置为哪些格式呢，我简单做了一个表，如下：

| 值        | 数据类型           | 说明  |
| :-----------: |:-------------:| :-----:|
| ""      | String字符串 | 默认不设置responseType时 |
| text      | Sting字符串      |    |
| arraybuffer | ArrayBuffer对象      |     |
| blob | Blob对像      |     |
| formdata | FormData对象      |  FormData实例   |
| document | Document对象     |    希望返回XML格式数据时使用 |

下面是同样是获取一张图片的代码示例，相比xhr.overrideMimeType,用xhr.response来实现简单得多。
```
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/path/to/image.png', true);
    //可以将`xhr.responseType`设置为`"blob"`也可以设置为`" arrayBuffer"`
    //xhr.responseType = 'arrayBuffer';
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob = this.response;
        ...
      }
    };

    xhr.send();
```

`response`
返回与设置的responseType一致的数据
`responseText`
当responseType为`"text"`或`""`时才有此属性
`responseXML`
当responseType为`"text"`，`""`，`doument`时才有此属性



















