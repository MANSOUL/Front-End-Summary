## HTTP协议

### HTTP协议概述

超文本传输协议（Hypertext Transfer Protocol）是一种被设计成用于传输HTML文件等网络资源的通讯协议。

### HTTP协议的组成

#### 请求的组成

```
GET / HTTP/1.1
Host: google.com
Accept-Language: zh-cn
Connection：Keep-alive
Cache-Control: max-age=0
Accept: text/html
User-Agent: Mozilla/5.0
Referer: 
Accept-Encoding: gzip,deflate
Cookie: 
If-None-Match: "zfffd-fshfk"
If-Modified-Since: Wed，01 Sep 2004 13:24:52 GMT

name=jj&pwd=fej
```

由请求行（请求方法，请求路径，HTTP协议版本）、请求头、换行、请求体组成

#### 响应的组成

```
HTTP/1.1 200 OK
Date: 
Server: 
Last-Modified: 
ETag:
Content-Length:
Xontent-Type: 

{name: "",age: ""}
```

由状态行（协议版本号 状态码 状态信息）、响应头、换行、消息实体组成

### HTTP协议的基本性质

1. 简单的
2. 可扩展的
3. 无状态，无连接

### HTTP请求方法
1. GET：请求服务器发送某个资源
2. HEAD：与GET类似，但只返回头部不返回主体
3. PUT：请求服务器使用请求的主体部分新建一个文档，若此文档已存在则用此次请求的主体替代它
4. POST：用于向服务器输入数据
5. TRACE：用于诊断，验证请求是否如愿穿过了请求/响应链
6. OPTIONS：请求服务器告知其所支持的各种功能
7. DELETE：请求服务器删除指定的资源

### HTTP状态码及其含义
+ 1XX：信息状态码
    * 100 Continue：客服端应当继续发送请求。此临时响应用于通知客户端他的部分请求已被服务器接收，切未被拒绝。客户端应当继续发送请求的剩余部分，如果请求已完成，忽略这个请求。服务器必须在请求完成后向客户端发送一个最终响应。
    * 101 Switching Protocols：服务器已经理解了客户端的请求，并将通过Upgrade消息头通知客户端采用不同的协议完成这个请求。在发送完响应的最后的空行后，服务器将切换到Upgrade消息头中定义的那些协议
+  2XX：成功状态码
    *  200 OK：请求成功，请求所期望的响应头和数据体将随此响应返回
    *  201 Created：
    *  202 Accepted：
    *  203 Non-Authoritative Information：
    *  204 No Content：
    *  205 Reset Content：
    *  206 Partial Content：
+ 3XX：重定向
    * 300 Multiple Choices：
    * 301 Moved Permanently：永久重定向
    * 302 Found：临时重定向
    * 303 See Other：
    * 304 Not Modified：资源未修改
    * 305 Use Proxy：
    * 306 unused：
    * 307 Temporary Redirect: 
+ 4XX：客户端错误：
    * 400 Bad Request: 
    * 401 Unauthorized: 无权限访问
    * 402 Payment Required:
    * 403 Forbidden: 禁止访问
    * 404 Not Found: 请求的资源不存在
    * 405 Method Not Allowed:
    * 406 Not Accepetable:
    * 407 Proxy Authentication Required:
    * 408 Request Timeout:
    * 409 Conflict:
    * 410 Gone: 
    * 411 Length Required:
    * 412 Precondition Failed:
    * 413 Request Entity Too Large:
    * 414 Request-URI Too Long:
    * 415 Unsupported Media Type:
    * 416 Requested Range Not Satisfiable:
    * 417 Expectation Failed:
+ 5XX：服务器错误
    * 500 Internal Server Error: 服务器错误通常是服务端应用出错由代理返回
    * 501 Not Implemented:
    * 502 Bad Gateway: 错误网关，通常是应用程序挂了由代理返回
    * 503 Service Unavailable:
    * 504 Gateway Timeout:
    * 505 HTTP Version Not Supported:

### 实际应用

#### websocket 协议升级

websocket 采用http协议进行握手，首先发送一个GET请求

```
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

此处Upgrade和Connection请求头用于告诉服务器这个请求用于进行Websocket连接。

服务器收到请求后，如果确认可以进行websocket连接，则发送回如下报文。

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```
