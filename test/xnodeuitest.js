var xnode = require("xnode");
var xnodeui = require("../src/xnodeui");

$(document).ready(function() {

	var d = new xnode.Div();

	d.style.position = "absolute";
	d.style.left = "10px";
	d.style.right = "10px";
	d.style.top = "10px";
	d.style.bottom = "10px";
	document.body.appendChild(d);

	var a = new xnodeui.Accordion();
	a.appendChild(new xnode.Div("hello"));
	a.appendChild(new xnode.Div("some content...<br/>blalabl"));
	a.appendChild(new xnode.Div("hello 2"));
	a.appendChild(new xnode.Div("some more content...<br/>blalabl and so on...<br/>blalabl and so on...<br/>blalabl and so on...<br/>"));

	a.heightStyle = "fill";
	a.collapsible = false;

	d.appendChild(a);
	a.refresh();

	/*var t = new xnodeui.Tabs();

	t.style.position = "absolute";
	t.style.height = "100%";
	t.style.left = "0";
	t.style.right = "0";

	//var ul=new xnode.Ul();
	t.ul.appendChild(new xnode.Li("<a href='#fragment1'><span>test</span></a>"));
	t.ul.appendChild(new xnode.Li("<a href='#fragment2'><span>test</span></a>"));

	var c;
	c = new xnode.Div("hello");
	c.id = "fragment1";
	t.appendChild(c);

	c = new xnode.Div("hello again");
	c.id = "fragment2";
	t.appendChild(c);

	t.jqueryElement.tabs("refresh");
	d.appendChild(t);

	t.option("active", 1);*/

	//var b = new xnodeui.Button();

	//	b.innerHTML="hello";

	//b.label = "Hello";
	/*	console.log("label: " + b.label);

	b.disabled = true;*/

	//	b.disable();

	//	console.log(b.label);
	//	b.label="Hello world";
	//	b.option("label", "hello");
	/*	d.appendChild(b);

	var s=new xnodeui.Slider();

	s.on("slide",function() {
		console.log("slidechange");
	})*/

	/*	s.jqueryElement.on("slidechange",function() {
		console.log("change");
	});*/

	/*	s.on("change",function() {
		console.log("change");
	});*/

	d.appendChild(s);
});