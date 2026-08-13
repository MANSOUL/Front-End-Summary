# react-intl API
react-intl是一个Yahoo公司出品的用于react app国际化的组件，提供了用于格式化日期、数字和字符串的API、复数和处理翻译。

## 使用示例
1. 首先新建语言包，en-US.json文件用于书写英文名词、zh-CN用于书写中文简体名词。
en-US.json文件示例：
```json
{
    "HELLO_WORLD": "Hello World!"
}
```
zh-CN.json文件示例:
```json
{
    "HELLO_WORLD": "你好 世界！"
}
```

2. 配置使用
react-intl使用方式类似于react-redux,同样在顶层提供了一个IntlProvider为下层组件提供数据。所以在将会用到国际化语言包配置的最顶层组件文件中配置使用IntlProvider。

```
import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider,FormattedMessage} from 'react-intl';

//导入语言包，路径为你语言包所在的路径
import enUS from './en-US.json';
import zhCN from './zh-CN.json';

class App extends Component {

    render() {
        return (
            <IntlProvider locale="en" messages={zhCN}>
                <FormattedMessage
                    id="HELLO_WORLD"
                />
            </IntlProvider>
        )
    }
}

ReactDOM.render(<App />,document.getElementById('app'))
```

不出意外，上面示例代码将渲染出`你好 世界！`。

## API
### <IntlProvider>
这个组件用于创建React树的i18n上下文。通常这个组件将包含整个APP的根组件，使的整个APP被包含在i18n上下文之中。
#### 配置属性:
```
type IntlConfig = {
    // 当前语言环境
    locale?: string,
    // 格式化对象
    formats?: object,
    // 语言包
    messages?: {[id: string]: string},
    // 默认语言环境
    defaultLocale?: string = 'en',
    // 默认格式化对象
    defaultFormats?: object = {},
    // 文本组件，用于设置默认的消息DOM结点类型
    textComponent? node = 'span',
};
```

#### Prop Types
```
props: IntlConfig & {
    children: ReactElement,
    initialNow?: any,
}
```
`IntlProvider`,只能接收一个子组件。

使用示例:
```
const App = ({importantDate}) => (
    <div>
        <FormattedDate
            value={importantDate}
            year='numeric'
            month='long'
            day='numeric'
            weekday='long'
        />
    </div>
);

ReactDOM.render(
    <IntlProvider locale={navigator.language}>
        <App importantDate={new Date(1459913574887)}/>
    </IntlProvider>,
    document.getElementById('container')
);
```
如果 `navigator.language` 是 "fr":
```
<div><span>mardi 5 avril 2016</span></div>
```

### <FormattedDate>
用于格式化日期，使用了[formatDate](https://github.com/yahoo/react-intl/wiki/API#formatdate)和[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)的API。

### Prop Types:
```
props: DateTimeFormatOptions & {
    value: any,
    format?: string,
    children?: (formattedDate: string) => ReactElement,
}
```
默认将格式化后的日期渲染至`<span>`。如果要自定义渲染的标签，可以用另一个React元素（推荐）包裹它，或者将函数作为其子组件传递。

### 使用示例:
```
<FormattedDate value={new Date(1459832991883)}/>
```
渲染后：
```
<span>4/5/2016</span>
```

### 带参数的示例：
```
<FormattedDate
  value={new Date(1459832991883)}
  year='numeric'
  month='long'
  day='2-digit'
/>
```
渲染后:
```
<span>April 05, 2016</span>
```

## <FormattedTime>
用于格式化时间，使用了[formatTime](https://github.com/yahoo/react-intl/wiki/API#formattime)和[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)的API

### 默认配置
```
{
    hour: 'numeric',
    minute: 'numeric'
}
```

### Prop Types
```
props: DateTimeFormatOptions & {
    value: any,
    format?: string,
    children?: (formattedDate: string) => ReactElement,
}
```
默认将格式化后的时间渲染至`<span>`。如果要自定义渲染的标签，可以用另一个React元素（推荐）包裹它，或者将函数作为其子组件传递。

### 使用示例:
```
<FormattedTime value={new Date(1459832991883)} />
```
渲染后:
```
<span>1:09 AM</span>
```

## <FormattedRelative>
用于格式化相对时间，使用了[formatRelative](https://github.com/yahoo/react-intl/wiki/API#formatrelative)的API并具有一下格式化参数:
```
type RelativeFormatOptions = {
    style?: 'best fit' | 'numeric' = 'best fit',
    units?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year',
};
```

### Prop Types
```
props: RelativeFormatOptions & {
    value: any,
    format?: string,
    updateInterval?: number,
    initialNow?: any,
    children?: (formattedDate: string) => ReactElement,
}
```
默认将格式化后的相对时间渲染至`<span>`，并且每十秒更新一次相对时间。如果要自定义渲染的标签，可以用另一个React元素（推荐）包裹它，或者将函数作为其子组件传递。

### 使用示例
```
<FormattedRelative value={Date.now()}/>
```
渲染后:
```html
<span>now</span>
```
10秒过后:
```html
<span>10 seconds ago</span>
```
60秒过后:
```html
<span>1 minute ago</span>
```

提示：如果需要自定义刷新时间，可以以毫秒的格式设置`updateInterval`。

## <FormattedNumber>
用于格式化数字表现形式，使用了[formatNumber](https://github.com/yahoo/react-intl/wiki/API#formatnumber)和[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)的API，具有如下格式化参数:
```
type NumberFormatOptions = {
    localeMatcher: 'best fit' | 'lookup' = 'best fit',

    style: 'decimal' | 'currency' | 'percent' = 'decimal',

    currency       : string,
    currencyDisplay: 'symbol' | 'code' | 'name' = 'symbol',

    useGrouping: boolean = true,

    minimumIntegerDigits    : number = 1,
    minimumFractionDigits   : number,
    maximumFractionDigits   : number,
    minimumSignificantDigits: number = 1,
    maximumSignificantDigits: number,
};
```

### Prop Types
```
props: NumberFormatOptions & {
    value: any,
    format?: string,
    children?: (formattedNumber: string) => ReactElement,
}
```
默认将格式化后的数字渲染至`<span>`。如果要自定义渲染的标签，可以用另一个React元素（推荐）包裹它，或者将函数作为其子组件传递。

### 使用示例:
```
<FormattedNumber value={1000}/>
```
渲染后:
```html
<span>1,000</span>
```

## <FormattedPlural>
用于复数渲染，使用了[formatPlural](https://github.com/yahoo/react-intl/wiki/API#formatplural)的API，具有如下选项:
```
type PluralFormatOptions = {
    style?: 'cardinal' | 'ordinal' = 'cardinal',
};
```

### Prop Types:
```
props: PluralFormatOptions & {
    value: any,

    other: ReactElement,
    zero?: ReactElement,
    one?: ReactElement,
    two?: ReactElement,
    few?: ReactElement,
    many?: ReactElement,

    children?: (formattedPlural: ReactElement) => ReactElement,
}
```

默认选取一个附属类别（zero, one, two, few, many, or other）,并将类别对应的值渲染至`<span>`。如果要自定义渲染的标签，可以用另一个React元素（推荐）包裹它，或者将函数作为其子组件传递。

### 使用示例
```
<FormattedPlural
    value={10}
    one='message'
    other='messages'
/>
```
渲染后:
```html
<span>messages</span>
```

## 字符串格式化组件
React Intl提供了两个组件用于格式化字符串：
- `<FormattedMessage>`
- `<FormattedHTMLMessage>`

`<FormattedMessage>`具有更好的富文本格式化能力并具有更高的性能，推荐使用`<FormattedMessage>`。如果要格式化的字符串中包含HTML,可以使用`<FormattedHTMLMessage>`。

### 消息语法
字符串/信息格式是基于[ICU Message Formatting](http://userguide.icu-project.org/formatparse/messages)的`ICU Message`语法的一个最重要的React Intl的特性。此消息语法允许定义简单到复杂的消息，并在运行时被翻译和格式化。

### 简单消息
```
Hello, {name}
```

### 复杂语法
```
Hello, {name}, you have {itemCount, plural,
    =0 {no items}
    one {# item}
    other {# items}
}.
```
参考文档: [消息语法指南](http://formatjs.io/guides/message-syntax/)

### 消息描述符
React Intl具有一个消息描述符的概念，用于定义应用程序的默认消息/字符串。`<FormattedMessage>`和`<FormattedHTMLMessage>`具有对应于消息描述符的属性。消息描述符适用于提供字符串/消息所需的数据，具有如下属性:
- `id`:唯一的，消息的标识符
- `description`:为翻译器如何在UI中使用而定义的上下文
- `defaultMessage`: 默认消息
```
type MessageDescriptor = {
    id: string,
    defaultMessage?: string,
    description?: string | object,
};
```

### 消息格式化失败回退
消息格式化API为格式化失败的情况提供了回退功能。以下是消息格式化回退算法：
1. 在id处查找并格式化已转换的消息，传递给`<IntlProvider>`。
2. 回退到格式化`defaultMessage`。
3. 回退到ID来源的翻译消息。
4. 回退到格式化`defaultMessage`源消息。
5. 回退到字面消息ID。

## <FormattedMessage>
使用[formatMessage](https://github.com/yahoo/react-intl/wiki/API#formatmessage) API，并具有相应的消息描述符的选项。

### Prop Types
```
props: MessageDescriptor & {
    values?: object,
    tagName?: string,
    children?: (...formattedMessage: Array<ReactElement>) => ReactElement,
}
```
默认将格式化后的字符串渲染至`<span>`。如果要自定义渲染的标签，可以用另一个React元素（推荐）包裹它，定义一个不同的`tagName`（如`div`），或者传递函数作为其子组件。

### 使用示例:
```
<FormattedMessage
    id='app.greeting'
    description='Greeting to welcome the user to the app'
    defaultMessage='Hello, {name}!'
    values={{
        name: 'Eric'
    }}
/>
```
渲染后:
```
<span>Hello, Eric!</span>
```

### 使用示例：（使用函数作为子组件传递）
```
<FormattedMessage id="title">
    {(txt) => (
        <H1>
            {txt}
        </H1>
    )}
</FormattedMessage>
```
渲染后:
```
<h1>Hello, Eric!</h1>
```

### 富文本格式化
`<FormattedMessage>`还支持富文本格式化，通过传递一个React组件给属性值`values`。而在消息中，需要一个简单的参数（例如{name}）;这里是一个例子：
```
<FormattedMessage
    id='app.greeting'
    description='Greeting to welcome the user to the app'
    defaultMessage='Hello, {name}!'
    values={{
        name: <b>Eric</b>
    }}
/>
```
渲染后：
```html
<span>Hello, <b>Eric</b>!</span>
```

## <FormattedHTMLMessage>
注意：此组件是为包含了HTML的外部字符串消息提供的，但不推荐使用。尽量使用`<FormattedMessage>`代替它。

这个组件使用了[formatHTMLMessage](https://github.com/yahoo/react-intl/wiki/API#formathtmlmessage) API并起具有和`<FormattedMessage>`一样的属性，但是能接受包含了HTML的消息。为了避免XSS攻击，所有字符串值都将被HTML转义，并且生成的格式化消息将通过dangerouslySetInnerHTML进行设置。这意味着值不能像<FormattedMessage>那样包含React元素，并且这个组件的性能会降低。

## Injection API
React Intl提供了通过`props`将必要的格式化API注入到React组件的API。当你的React组件需要将数据格式化为一个React元素不适合的字符串值时，应该使用它;例如，`title`或`aria`属性，或者为了在`componentDidMount`中产生副作用。

### injectIntl
```
function injectIntl(
    WrappedComponent: ReactClass,
    options?: {
        intlPropName?: string = 'intl',
        withRef?: boolean = false
    }
): ReactClass;
```

此函数是一个高阶组件（HOC）工厂，由react-intl包导出的。它会将传入的React组件与另一个React组件包装在一起，并通过`props`将必要的格式化的API注入到包装组件中。（与Flux实现中的connect-to-stores模式类似）

默认情况下，格式化的API将会通过`props.intl`的方式提供给被包裹的组件，但是能够通过重定义`options.intlPropName`的方式重写。prop的值将是下一节定义的intlShape类型。

```
import React, {PropTypes} from 'react';
import {injectIntl, intlShape, FormattedRelative} from 'react-intl';

const Component = ({date, intl}) => (
    <span title={intl.formatDate(date)}>
        <FormattedRelative value={date}/>
    </span>
);

Component.propTypes = {
    date: PropTypes.any.isRequired,
    intl: intlShape.isRequired,
};

export default injectIntl(Component);
```

### intlShape
```
type IntlConfig = {
    locale: string,
    formats: object,
    messages: {[id: string]: string},

    defaultLocale: string = 'en',
    defaultFormats: object = {},
};

type IntlFormat = {
    formatDate: (value: any, options?: object) => string,
    formatTime: (value: any, options?: object) => string,
    formatRelative: (value: any, options?: object) => string,
    formatNumber: (value: any, options?: object) => string,
    formatPlural: (value: any, options?: object) => string,
    formatMessage: (messageDescriptor: MessageDescriptor, values?: object) => string,
    formatHTMLMessage: (messageDescriptor: MessageDescriptor, values?: object) => string,
};

const intlShape: IntlConfig & IntlFormat & {now: () => number};
```

此函数提供了一个可以和`injectIntl​​`HOC工厂函数结合使用的对象形状[React属性验证器](http://facebook.github.io/react/docs/reusable-components.html#prop-validation)，由`react-intl`包导出。

上面的定义了通过`injectintl`注入到组件的东西，即`props.intl`对象看起来就像这样。它由三部分组成：
+ `IntlConfig`: 作为属性传递给父组件`<IntlProvider>`的元数据。
+ `IntlFormat`: 必要的格式化API。
+ `now`: 一个用户返回当前时间的函数