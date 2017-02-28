# JSliteAjaxDeferred

首先感谢[JSLite](https://github.com/JSLite/JSLite)实现了对JQuery以及zepto的精简,本项目是依据zepto对JSLite的修改,该项目属于玩票性质,后期不会维护以及更新
基本api可[点我去api文档](http://jslite.io/)
## 修改1：

对比zepto的on方法进行了修改，实现事件委托(this对象已转移到委托的子元素上)
```
html

<ul id="app">
	<li>我是第一个</li>
	<li>我是第二个</li>
	<li>我是第三个</li>
	<li>我是第四个</li>
	<li>我是第五个</li>
</ul>

JS

$("#app").on("click","li",function(){
	console.log($(this).html());//输出 我是第X个
});
```
## 修改2：

对比zepto的ajax()方法修改了JSLite方法,使其可以捕捉到请求的错误,并去除其他方法只留$.ajax()方法,不能使用jsonp跨域,并将zepto的callbacks模块和Deferred模块拿来进行简单修改,使ajax()支持链式回调,方法与zepto相同

```
function getMessages(url){
	return $.ajax({
		url:url,
		method:"get",
	})
}
getMessages("https://api.myjson.com/bins/w7ou")
.done(function(res){
	console.log(res.app);
})
.fail(function(resq){
	console.log(resq.status+" "+resq.statusText)
})
.always(function(res){
	console.log(res)
})
```


#另外在dist文件夹中有个fastclick.js项目

该fastclick根据网上提的主要三个bug(都是input)进行了修改

如果想使用原生方法，在绑定的元素上添加类名.needsclick

如果点击跳转的页面相同位置也是跳转事件,请保证在>300ms跳转(或者加一个300ms的透明遮罩)

```
/*增加对input标签的判断选择,解决iphone中select点击闪退的bug,input[type="date"] 无法触发问题*/
/*fastclick用于解决300ms延迟,如果出现其他问题可尝试添加类名.needsclick*/
/*使用方法：
if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

或者(JQuery)
$(function() {
    FastClick.attach(document.body);
});

或者(requireJS or CommonJS)
var attachFastClick = require('fastclick');
attachFastClick(document.body);
*/
```