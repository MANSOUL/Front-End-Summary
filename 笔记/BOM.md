# BOM(Browser Object Model)

浏览器对象模型几个重要的对象

- [Window](#window)
- [Screen](#screen)
- [Location](#location)
- [History](#history)
- [Navigator](#navigator)

### Window {name=window}
window对象表示浏览器窗口，是浏览器Javasript的全局对象。
**属性：**
```
window.innerWidth          //浏览器窗口的内部宽度
window.innerHeight         //浏览器窗口的内部高度

／**
 * 获取浏览器宽高的兼容性写法
 *／
 function obtainWH() {
 	var w = window.innerWidth
 		|| document.documentElement.clientWidth
 		|| document.body.clientWidth;
 	var h = window.innerHeight
 		|| document.documentElement.clientHeight
 		|| document.body.clientHeight;
 }
```
**方法：**
```
window.open(url,target)    //打开一个新的链接,默认在一个新的标签中打开链接
window.close()             //关闭当前窗口
window.moveTo(x,y)         //移动当前窗口
window.resizeTo(w,h)       //调整当前窗口大小
```

### Screen {name=screen}
screen对象包含了屏幕相关信息。
**属性：**
```
screen.width               //屏幕的实际宽度
screen.height 	           //屏幕的实际高度
screen.availHeight         //屏幕可用高度，不包含浏览器导航条高度
screen.availWidth          //屏幕可用宽度
screen.availLeft
screen.availTop
screen.colorDepth          //目标设备或缓冲器上的调色板的比特深度
screen.pixelDepth          //屏幕的颜色分辨率
screen.orientation         //旋转对象 {angel,onchange,type}

/**
 * 监听屏幕旋转
 */
function bindOrientationChange() {
	screen.orientaion.onchange = function(){
		console.log(this.type) //landscape-primary,portrait-primary
	}
}
```

### Location {name=location}
用于获取当前页面地址，并将浏览器重定向到新的页面
**属性：**
```
location.hash             //当前URL的hash值，http://www.example.com#one hash:one
location.host             //URL的主机名和端口
location.hostname         //URL的主机名
location.href             //完整的URL
location.origin           //协议和主机名
location.port             //端口
location.protocol         //使用的协议
location.search           //URL的查询部分

/**
 * 获取URL某个查询值
 */
function obtainSearch(name) {
	var search = window.location.search.substr(1);
	var reg = new RegExp(name+'=([^&|.]+)')
	var matches = search.match(reg);
	if(matches){
		return matches[1]
	}
	return null;
}
```
**方法：**
```
location.assign(url)        //载入一个新的文档
location.reload()           //重新加载新的文档
location.replace()          //使用新文档替换当前文档,当前文档不会计入历史记录，所以无法返回
```
### History {name=history}
包含了用户所访问过的URL
**属性：**
```
history.length             //历史列表的网址数量

//---NEW API---
history.state              //如果不是通过pushState加载的页面，state===null
```
**方法：**
```
history.back()             //加载history列表的前一个URL
history.forword()          //加载history列表的后一个URL
history.go()               //加载history列表的某一个具体URL

//---NEW API---开发无刷新页面
history.pushState(state,title,url)         //state相关状态信息，title，url不能跨域
history.replaceState(state,title,url)      //
```

### Navigator {name=navigator}
包含了浏览器的相关信息
**属性：**
```
navigator.appCodeName         //浏览器代码名
navigator.appName 		      //浏览器名称
navigator.appVersion          //平台和版本信息
navigator.cookieEnabled       //是否启用了Cookie
navigator.platform            //操作系统平台
navigator.userAgent           //客户机发给服务器的user-agent头的值
```