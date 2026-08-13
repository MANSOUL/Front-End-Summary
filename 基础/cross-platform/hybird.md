要设计混合框架主要需要解决一下几个问题：

- JavaScript 调用 APP
- APP 端调用 JavaScript

下面以安卓为例介绍。


### JavaScript 调用 APP

JavaScript 调用 APP 有几种方式：URL 拦截、prompt重写、java向webview注入接口。

#### URL拦截

`shouldOverrideUrlLoading` 能在webview加载URL的时候，提供给宿主应用控制是否加载URL的能力，方法返回 `true` 将中断加载。

如果需要使用 JavaScript 调用 Java 代码，可以定义合适的协议。在JavaScript中发起get请求，在 Java 代码做拦截解析后执行后续逻辑。

#### 注入接口

`addJavascriptInterface` 能直接向webview注入Java对象。

```java
 class JsObject {
    @JavascriptInterface
    public String toString() { return "injectedObject"; }
 }
 webview.getSettings().setJavaScriptEnabled(true);
 webView.addJavascriptInterface(new JsObject(), "injectedObject");
 webView.loadData("", "text/html", null);
 webView.loadUrl("javascript:alert(injectedObject.toString())");
```

注：这个方法在安卓4.2之前不安全，JavaScript能用它直接控制宿主应用。

#### 重写prompt

通过重写 Java `onJsPrompt`，能够在 JS 调用 `prompt` 时起到拦截作用，当 `onJsPrompt` 返回 `true`，将不会显示出默认的对话框。

如果需要使用 JavaScript 调用 Java 代码，可以定义合适的协议。在JavaScript中发起get请求，在 Java 代码做拦截解析后执行后续逻辑。

### App 调用 JavaScript

App 调用 JavaScript 有几种方式：loadUrl、 evaluateJavascript。

#### loadUrl

通过协议 `loadUrl('javascript:xxx')`，Java 能够执行 JavaScript 代码。

#### evaluateJavascript

不同于 `loadUrl`，`evaluateJavascript` 可以直接执行 JavaScript 代码而不需要添加协议头，并且能使用回调作为第二个参数，来接收 JavaScript 代码执行后返回的结果。


### 实现 JS-SDK 

Java 和 JavaScript 代码之间的通信，是 Hybird 应用的基础。接下来以微信为例，分析一下微信中所提供给网页的各类调用原生功能的API如何实现。

下面是微信提供的选择图片的API：

```js
wx.chooseImage({
  count: 1, // 默认9
  sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
  sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
  success: function (res) {
    var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
  }
});
```

此时我们先从上述的Java 和 JavaScript 相互调用中选择一种方式来实现这个功能：重写prompt、evaluateJavaScript。

#### 定义协议

Java 和 JavaScript 约定，以 `hybird:[method]?param=value&callback=xxxx` 这个协议方式进行通信。

因此需要在JavaScript 中添加如下方法：

```js
// js-sdk
const createHybirdProtocol = (method, queryString, callbackName) => {
    return `hybird:${method}?${queryString}&callback=${callbackName}`
}

const invokeHybird = (method, query, callback) => {
    let queryString = createQueryString(query)
    let callbackName = createCallback(method, callback)
    let invokeString = createHybirdProtocol(method, queryString, callbackName)
    window.prompt(invokeString)
}

const wx = {
    chooseImage: ({count, sizeType, sourceType, success}) => {
        invokeHybird('chooseImage', {
            count,
            sizeType,
            sourceType
        }, success)
    }
}
```

之后在Java中重写`onJsPrompt`，以及在获取到结果之后通过 `evaluateJavascript` 执行回调，传递结果。

```java
// 重写onJsPrompt
webView.setWebChromeClient(new WebChromeClient(){
    @Override
    public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
        // 解析url
        HybirdParserResult result = HybirdParser.parse(url);
        // 执行逻辑
        invokeHybirdFunc(result);
        return false;
    } 
});
```

执行回调。

```java
// 结果JSON序列化后传递给callback
webview.evaluateJavascript(result.callback + "(" + serializedResult + ")");
```