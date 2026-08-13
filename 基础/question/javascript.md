### import 和 require 的区别

- import 可以选择性的导入一部分，但是 require 只能导入全部。
- import 可以异步导入，但是 require 只能同步。
- 最大的不同则在于import的导入是静态的，只需要解析JS代码就可以确定导出的是什么，而 commonJS 模块只有在运行的时候才能知道导出的是什么。