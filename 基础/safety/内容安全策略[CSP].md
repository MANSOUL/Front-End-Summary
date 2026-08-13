## 内容安全策略

内容安全策略 (CSP)，是一个附加的安全层，相当于白名单制度，其主要目标就是减少和报告XSS攻击，CSP 通过明确告诉客户端，那些外部资源可以加载执行来减少和消除CSP。

#### CSP设置方式

- 通过相应头：Content-Security-Policy
- 通过 `<meta>` 设置 `<meta http-equiv="Cotent-Security-Polycy" content="">`

```
Content-Security-Policy: script-src 'self'; object-src 'none';
style-src cdn.example.org third-party.org; child-src https:
```

```
- 脚本：只信任当前域名
- <object>标签：不信任任何URL，即不加载任何资源
- 样式表：只信任cdn.example.org和third-party.org
- 框架（frame）：必须使用HTTPS协议加载
- 其他资源：没有限制
```

#### 选项

```  
- default-src: 设置各个选项的默认值
- script-src：外部脚本
- style-src：样式表
- img-src：图像
- media-src：媒体文件（音频和视频）
- font-src：字体文件
- object-src：插件（比如 Flash）
- child-src：框架
- frame-ancestors：嵌入的外部资源（比如<frame>、<iframe>、<embed>和<applet>）
- connect-src：HTTP 连接（通过 XHR、WebSockets、EventSource等）
- worker-src：worker脚本
- manifest-src：manifest 文件
- frame-ancestors：限制嵌入框架的网页
- base-uri：限制<base#href>
- form-action：限制<form#action>
- block-all-mixed-content：HTTPS 网页不得加载 HTTP 资源（浏览器已经默认开启）
- upgrade-insecure-requests：自动将网页上所有加载外部资源的 HTTP 链接换成 HTTPS 协议
- plugin-types：限制可以使用的插件格式
- sandbox：浏览器行为的限制，比如不能有弹出窗口等。
- report-uri /my_amazing_csp_report_parser;
```

#### 选项值

```
- 主机名：example.org，https://example.com:443
- 路径名：example.org/resources/js/
- 通配符：*.example.org，*://*.example.com:*（表示任意协议、任意子域名、任意端口）
- 协议名：https:、data:
- 关键字'self'：当前域名，需要加引号
- 关键字'none'：禁止加载任何外部资源，需要加引号
```

多个值用空格隔开，否则只会有第一次设置的值生效，如果不设置某个限制选项，就是默认允许任何值。

### CSP Report

CSP 上报JSON格式：

```json
{
  "csp-report": {
    "document-uri": "http://example.org/page.html",
    "referrer": "http://evil.example.com/",
    "blocked-uri": "http://evil.example.com/evil.js",
    "violated-directive": "script-src 'self' https://apis.google.com",
    "original-policy": "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
  }
}
```
