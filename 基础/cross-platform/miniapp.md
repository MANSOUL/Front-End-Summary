## 微信小程序

### 小程序历史

1. 微信开放一些API供内部使用，但被外部开发人员发现

```js
WeixinJSBridge.invoke('imagePreview', {
    current: '',
    urls: ['', '', '']
}, function callback(res) {

})
```

2. 2015年初，微信封装了开发工具包，称之为JS-SDK（拍摄、录音、语音识别、二维码、地图、支付、分享等）

```js
wx.previewImage({
    current: '',
    urls: ['', '', ''],
    success: () => {}
})
```

3. 微信为了提升移动网页都存在的问题：白屏、大量计算占用UI线程、Web页面跳转生硬

于是微信对Web资源离线存储，设计类似于HTML5的Application Cache，设计上规避了一些Application Cache的不足。

但是对于复杂应用还是会出现白屏，如果有大量CSS和JavaScript的执行时间过长导致占用UI线程，即使拥有离线存储，依然会白屏。

4. 设计出更好的系统

更快的加载、更强大的能力、原生的体验、易用且安全的微信数据开放、高效简单的开发

5. 小程序诞生

与普通网页的区别：开发方式（微信开发工具VS编辑器）、UI线程和渲染线程分离、无DOM/BOM。

### 小程序原理

- 通过 `JavaScript`, `wxss`, `wxml` 开发的单页面应用，并可以通过微信提供的接口调用各种原生功能。
- 数据驱动UI，UI和数据分开，UI的更新通过修改数据进行
- 分离UI线程和逻辑线程，通过JSBridge进行通信

### 项目配置文件 `app.json`

此文件配置项目页面，导航条样式等;

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/index"
  ],
  "window": {
    "navigationBarTitleText": "Demo"
  },
  "tabBar": {
    "list": [{
      "pagePath": "pages/index/index",
      "text": "首页"
    }, {
      "pagePath": "pages/logs/index",
      "text": "日志"
    }]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": true,
  "navigateToMiniProgramAppIdList": [
    "wxe5f52902cf4de896"
  ]
}
```

### 小程序生命周期

```js
Page({
  data: {
    text: "This is page data."
  },
  onLoad: function(options) {
    // 页面已加载：做一些初始化操作，可以在参数中获取打开当前页面路径中的参数
  },
  onShow: function() {
    // 页面显示/切入前台时触发
  },
  onReady: function() {
    // 页面初次渲染完成时触发：一个页面只会调用一次，代表页面已经准备妥当，可以和视图层进行交互
  },
  onHide: function() {
    // 页面隐藏/切入后台时触发： 如 navigateTo 或底部 tab 切换到其他页面，小程序切入后台等
  },
  onUnload: function() {
    // 页面卸载时触发：如 redirectTo 或 navigateBack 到其他页面时
  },
  onPullDownRefresh: function() {
    // 下拉刷新
  },
  onReachBottom: function() {
    // 上拉加载
  },
  onShareAppMessage: function () {
    // 用户点击右上角转发，获取自定义的分项数据
  },
  onPageScroll: function() {
    // 页面滚动时触发
  },
  onResize: function() {
    // 页面resize触发
  },
  onTabItemTap(item) {
    // 当前是 tab 页时，点击 tab 时触发
    console.log(item.index)
    console.log(item.pagePath)
    console.log(item.text)
  },
  // Event handler.
  viewTap: function() {
    this.setData({
      text: 'Set some data for updating view.'
    }, function() {
      // this is setData callback
    })
  },
  customData: {
    hi: 'MINA'
  }
})
```

**组件的生命周期**：

```js
Component({
    created() {
        // 在组件实例刚刚被创建时执行，注意此时不能调用 setData
    }, 
    attached() {
        // 在组件实例进入页面节点树时执行 
    },
    ready() {
        // 在组件布局完成后执行
    },
    moved() {
        // 在组件实例被移动到节点树另一个位置时执行
    },
    detached() {
        // 在组件实例被从页面节点树移除时执行
    }
})
```

### 小程序登录流程设计

![小程序登录流程](../images/5.jpg)

**前端**：

```js

App({
  login() {
    // 调用 wx.login 获取 code
    wx.login({
      success(res) {
        if (res.code) {
          // 获取code，通过code置换openid和session_key
          wx.request({
            url: 'xxx.com/wxlogin',
            method: 'POST',
            data: {
              code: res.code
            },
            success(res) {
              const {
                data,
                statusCode
              } = res;
              if (statusCode === 200 && data.success) {
                wx.setStorage({
                  key: 'token',
                  data: data.token
                });
              }
            }
          });
        }
      }
    });
  },
  onLaunch: function () {
    const that = this;
    if (!wx.getStorageSync('token')) {
      that.login();
    }
    else {
      // 检测session是否过期
      wx.checkSession({
        success() {
          // getSetting 检测获取用户是否授权
          wx.getSetting({
            success(res) {
              const authSetting = res.authSetting;
              if (authSetting['scope.userInfo']) {
                // 如果用户已授权，则获取用户信息
                wx.getUserInfo({
                  success(res) {
                    that.globalData.globalUser = res.userInfo;
                  }
                });
              }
            }
          });
        },
        fail() {
          that.login();
        }
      });
    }
  },
  globalData: {
    globalUser: null
  }
});
```

**后端**：

```js
router.post('/wxlogin', async ctx => {
  const { code } = ctx.request.body;
  // 通过code,app_id,app_secret置换openid和session_key
  const response = await got(`https://api.weixin.qq.com/sns/jscode2session?appid=&secret=&js_code=&grant_type=authorization_code`);
  const {session_key, openid, errcode} = JSON.parse(response.body);
});
```

### 获取用户信息；

```html
<button class="auth__button" open-type="getUserInfo" bindgetuserinfo="handleGetUserInfo">授权登录信息</button>
```

```js
Page({
  handleGetUserInfo(e) {
    this.setData({
      hasUserInfo: true,
      userInfo: e.detail.userInfo
    });
  }
})
```

### 页面跳转方式

- `wx.redirectTo`: 关闭当前页面，跳转到某个非tab页面的页面
- `wx.navigateTo`: 保留当前页面，跳转到某个非tab页面的页面
- `wx.navigateBack`: 关闭当前页面，返回上一页面或多级页面。可通过 `getCurrentPages()` 获取当前的页面栈，决定需要返回几层
- `wx.switchTab`: 跳转到tab页面，并关闭其它所有非tab页面
- `wx.reLaunch`: 关闭所有页面，打开到应用内的某个页面

### webview 跳回小程序

```js
wx.miniProgram.navigateTo({
  url: '/pages/index/index?xxx=xxx'
})

wx.miniProgram.switchTab({
  url: '/pages/index/index'
})
```

### onPageScroll注意事项

此方法调用频繁，不需要时可以去掉，不要保留空方法；尽量避免使用setData()，尽量减少setData()的使用频次。

### 小程序视图渲染结束回调

使用setData(data, callback)，在callback回调方法中添加后续操作代码

### bindtap和catchtap的区别

相同点：首先他们都是作为点击事件函数，就是点击时触发。
不同点：`bindtap` 不会阻止冒泡事件的，`catchtap` 阻止事件冒泡。