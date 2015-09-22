# Txbb.Scratch

同学帮帮 h5 刮刮卡组件，简洁、无依赖，支持 globals 和 amd 两种调用方式。

> 暂时只能用在移动端

<img src="screenshot.png" width="320"/>

## 使用方法

```html
<div id="J-Scratch"></div>
```

```javascript
var scratchInstance = Txbb.Scratch.attach(element, options);
```

### element
需要初始化的 **容器** 元素，canvas 元素会被添加进去。

```javascript
var scratchInstance = Txbb.Scratch.attach(document.querySelector('#J-Scratch'), options);
```

### options

- `bg` (type: String): canvas 所在容器的背景颜色
- `fg` (type: String): canvas 元素的颜色，即刮刮卡的颜色
- `middle` (type: String): 刮完奖之后显示的元素，可以是 html 也可以是纯字符串
- `size` (type: Number): 默认 20, 刮一下的半径
- `onEnd` (type: Function): 刮完奖的回调函数

### 实例方法

- reset: `scratchInstance.reset(options)` 重置刮刮卡，重置方法传入 `options` 可以改变实例化时的 `options`
