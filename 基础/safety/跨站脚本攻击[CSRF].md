### 跨站请求伪造（CSRF）

跨站请求伪造是指攻击者在其他的网站，利用浏览器在发生请求时会自动携带 `cookie` 信息这一机制，使得服务器误认为攻击是请求来自真实用户而执行相关操作，从而产生安全问题。攻击者虽然可以利用 `cookie` 但却无法获取 `cookie`。

一个典型的跨站请求伪造攻击如下：

1. 用户登陆了 `shopping.com`，之后用户信息被保存于 `cookie` 中。
2. 诱惑受害者打开攻击者的网站 `attack.com`。
3. `attack.com` 向 `shopping.com?do=xxx` 发送请求：`shopping.com?do=xxx` ，浏览器默认携带上 `shopping.com` 的 Cookie。
4. 服务端校验Cookie中的用户凭证，确认用户凭证有效，误认为是受害者发送的请求。
5. `shopping.com` 以受害者的名义执行了 `xxx` 行为。
6. 攻击完成，攻击者在受害者不知情的情况下，使得 `shopping.com` 执行了攻击者定义的行为。

#### 攻击类型

##### GET 类型

GET 类型的攻击非常简单，只需要受害者访问，带有类似如下标签的任意网站即可。

```html
<img src="shopping.com?withdraw=xxx&to=xxx">
```

##### POST 类型

POST 类型虽然门槛稍高，但是仍不复杂，用户通过访问带有类似如下表单的网站即可发起攻击。

```html
<form action="shopping.com" method="POST">
    <input type="hidden" name="withdraw" value="xxx">
    <input type="hidden" name="to" value="xxx">
</form>
<script type="text/javascript">
    document.forms[0].submit()
</script>
```

##### 链接类型

链接类型相比于前面两种攻击，需要用户点击链接才会触发。

```html
<a href="shopping.com?withdraw=xxx&to=xxx">
    性感荷官在线等你，还不快来！！！
</a>
```

#### 防范措施

针对上面几种攻击类型，以及CSRF的特点：

- CSRF通常发生在第三方网站。
- CSRF攻击者无法获取到Cookie，仅仅是利用。

我们可以使用如下防范措施：

- 包含用户行为的重要操作，不使用 `GET` 请求。
- 同源检测
- CSRF Token
- 双重 Cookie 验证
- Samesite Cookieshou

##### 同源检测

浏览器在发生请求通常会在请求头中携带 `Referer`  和 `Origin` 头，用于标识请求的来源。由于CSRF通常发生在第三方域名中，因此可以通过检测这两个请求头来阻止一些CSRF攻击。

##### CSRF Token

CSRF攻击利用的是浏览器会自动发送Cookie中携带的用户凭证，从而误认为攻击行来源于真实用户。因此可以在发送请求时通过携带不存在于Cookie中唯一的标识来辨别攻击是否来源于真实用户。

其具体操作流程如下：
1. 在用户打开页面是将CSRF Token输出至页面。
2. 发送请求时携带上这个。
3. 服务端验证Token，之后再进行相关操作。

相关实现代码如下：

```html
<form action="shopping.com" method="POST">
    <input type="input" name="withdraw" value="xxx">
    <input type="input" name="to" value="xxx">
    <!-- 由服务端输出到页面的csrf token -->
    <input type="hidden" name="scrftoken" value="xxxxx">
</form>
```

另外，如一些银行类网站再进行转账时会要求用户再次输入密码，这种方式原理如Token相似，但相对来说安全性更高。

##### 双重 Cookie 验证

使用会话方式来存储 `CSRF Token` 略显繁琐，因此还可以通过攻击者只是利用 `Cookie` 而无法获取 `Cookie` 这一特点，将 `Token` 保存到 `Cookie` 中，在请求时将此 `Token` 取出拼接到URL上。

具体操作如下：
1. 用户访问页面时将 Token 输出到 Cookie 中。
2. 请求时通过 JS 取出 Cookie，并拼接到请求 URL， 如 `shopping.com?csrftoken=xxxx`。
3. 服务端比较 Cookie 中的 Token 以及 URL 上的 Token 是否相同。
4. 验证有效后，进行相关操作。

##### Samesite Cookie

`Samesite Cookie` 是 `Cookie` 的一个属性，用于标识此 Cookie 是 “同站Cookie”，拥有三个属性值：

- Samesite=Strict：严格模式，表示此Cookie在人格情况下都不能作为第三方Cookie。
- Samesite=Lax：宽松模式，表示多数情况下也不能作为第三方Cookie，若是导航到此网站时则可以。
- Samesite=None：Chrome 计划将Lax变为默认设置。这时，网站可以选择显式关闭SameSite属性，将其设为None。不过，前提是必须同时设置Secure属性（Cookie 只能通过 HTTPS 协议发送），否则无效。

