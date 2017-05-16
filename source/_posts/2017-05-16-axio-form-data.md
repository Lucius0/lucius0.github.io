---
layout: post
title:  "axio-form data问题"
date:   2017-05-16
categories: front-end
permalink: /archivers/axio-form-data
tags: [javascript, axio]
---

今日在用`axio`请求数据时，遇到一个问题，即`post`时，data为对象，但是在请求时的请求数据一直是`request payload`，而不是我想要的`form data`，并且请求体为表单形式，即`a=1&b=2&c=3`。

```js
axios({
	url: `${API.URL}`,
    method: 'post',
    data,
    responseType: 'json',
    withCredentials: true
}).then(res => {}).catch(err => {});
```

![](/images/javascript/js-25.jpeg)

![](/images/javascript/js-26.jpeg)

**解决方案1：**

在node环境中可以使用`qs`模块的`qs.stringify(data)`来处理，即

```js
var qs = require('qs');
axios({
	...
	headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	data: qs.stringify(data)
});
```

**解决方案2：**

在非node环境下可以使用`axios`的一个请求配置项`transformRequest`，即

```js
axios({
  ...
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  transformRequest: [(data) => {
    let ret = '';
    for (const it in data) {
      if (Object.prototype.hasOwnProperty.call(data, it)) {
        ret = `${ret + encodeURIComponent(it)}=${encodeURIComponent(data[it])}&`;
      }
    }
    return ret;
  }],
}).then(res => {}).catch(err => {});
```
![](/images/javascript/js-27.jpeg)

![](/images/javascript/js-28.jpeg)

**总结：**

`headers: { 'Content-Type': 'application/x-www-form-urlencoded' }`是将请求类型`request payload`转换成`form data`。而`qs`模块跟`transformRequest`则是将对象格式`{a: '1', b: '2', c: '3'}`转为表单格式`a=1&b=2&c=3`。

axios：[https://www.awesomes.cn/repo/mzabriskie/axios](https://www.awesomes.cn/repo/mzabriskie/axios)

