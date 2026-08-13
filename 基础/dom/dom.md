## 文档对象模型

文档对象模型（Document Object Model，DOM）所提供的一系列API是React、Vue等框架的基础，对于操作元素它们都适用了DOM所提供的API。

<!-- 而这一些列 API 都被附加在 `document` 对象上。 -->

### 创建元素

- document.createElement(tagName)
    + 根据tagName创建相应的元素
- document.createTextNode(text)
    + 创建文本节点

### 添加操作

- element.appendChild(node)
    + 将节点添加为元素的最后一个字节点
- element.insertBefore(node, child)
    + 将节点插入到元素指定的子节点之前
- element.insertAdjacentElement(position, element)
    + 将元素（element）插入到指定位置（position），position可取值为[afterbegin|beforeend|beforebegin|afterend]
- element.insertAdjacentHTML(position, text)
    + 将HTML文本插入到指定位置（position），position可取值为[afterbegin|beforeend|beforebegin|afterend]
- element.insertAdjacentText(position, text)
    + 将文本插入到指定位置（position），position可取值为[afterbegin|beforeend|beforebegin|afterend]

### 删除操作

- element.removeChild(node)
    + 删除元素的指定子节点
- element.innerText = ''  
- element.textContent = ''  
- element.innerHTML = '' 
    + 删除所有子节点，置空元素

### 修改操作

- 添加子元素
    + 同上添加操作
- 删除子元素
    + 同上删除操作
- 属性操作
    + element.getAttribubte(name)：获取属性值
    + element.setAttribubte(name, value)：设置属性
    + element.removeAttribubte(name)：移除属性

### 查找操作

- document.getElementById(id)
    + 根据id获取单个元素
- document.getElementsByClassName(className)
    + 根据类名获取所有元素
- document.getElementsByTagName(tagName)
    + 根据标签名获取所有元素
- document.querySelector(selector)
    + 根据selector条件获取满足条件的第一个元素
- document.querySelectorAll(selector)
    + 根据selector条件获取满足条件的所有元素
- element.firstChild
    + 获取元素的第一个子节点
- element.lastChild
    + 获取元素的最后一个子节点
- element.previousElementSibling
    + 获取元素的前一个兄弟元素节点
- element.previousSibling
    + 获取元素的前一个兄弟节点
- element.nextElementSibling
    + 获取元素的下一个兄弟元素节点
- element.nextSibling
    + 获取元素的下一个兄弟节点
