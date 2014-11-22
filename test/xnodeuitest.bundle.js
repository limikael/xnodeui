(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
(function() {
	/**
	 * The basic xnode class.
	 * It sets the underlying node element by calling
	 * document.createElement
	 */
	function XNode(type, content) {
		this.node = document.createElement(type);

		if (content !== undefined)
			this.node.innerHTML = content;
	}

	/**
	 * This method creates an extended class using
	 * the XNode class defined above.
	 */
	function createExtendedXNodeElement(elementType, content) {
		var f = function(content) {
			XNode.call(this, elementType, content);
		};

		f.prototype = Object.create(XNode.prototype);
		f.prototype.constructor = f;

		return f;
	}

	/**
	 * Create a read only property that returns the
	 * value of the corresponding property of the
	 * underlying node object.
	 */
	function createXNodeReadOnlyProperty(propertyName) {
		Object.defineProperty(XNode.prototype, propertyName, {
			get: function() {
				return this.node[propertyName];
			}
		});
	}

	/**
	 * Create a read write property that operates on
	 * the corresponding property of the underlying
	 * node object.
	 */
	function createXNodeReadWriteProperty(propertyName) {
		Object.defineProperty(XNode.prototype, propertyName, {
			get: function() {
				return this.node[propertyName];
			},

			set: function(value) {
				this.node[propertyName] = value;
			}
		});
	}

	/**
	 * Create a method that routes the call through, down
	 * to the same method on the underlying node object.
	 */
	function createXNodeMethod(methodName) {
		XNode.prototype[methodName] = function() {
			return this.node[methodName].apply(this.node, arguments);
		}
	}

	/**
	 * Modify the Node.property function, so that it accepts
	 * XNode objects. All XNode objects will be changed to
	 * the underlying node objects, and the corresponding
	 * method will be called.
	 */
	function createNodeToXNodeMethodWrapper(methodName) {
		var originalFunction = Node.prototype[methodName];

		Node.prototype[methodName] = function() {
			for (var a in arguments) {
				if (arguments[a] instanceof XNode)
					arguments[a] = arguments[a].node;
			}

			return originalFunction.apply(this, arguments);
		}
	}

	/**
	 * Set up read only properties.
	 */
	createXNodeReadOnlyProperty("style");

	/**
	 * Set up read/write properties.
	 */
	createXNodeReadWriteProperty("innerHTML");
	createXNodeReadWriteProperty("href");
	createXNodeReadWriteProperty("id");

	/**
	 * Set up methods to be routed to the underlying node object.
	 */
	createXNodeMethod("appendChild");
	createXNodeMethod("removeChild");
	createXNodeMethod("addEventListener");
	createXNodeMethod("removeEventListener");

	/**
	 * Set up methods on Node.property.
	 */
	createNodeToXNodeMethodWrapper("appendChild");
	createNodeToXNodeMethodWrapper("removeChild");

	/**
	 * Create event listener aliases.
	 */
	XNode.prototype.on = XNode.prototype.addEventListener;
	XNode.prototype.off = XNode.prototype.removeEventListener;

	/**
	 * Work both as a npm module and standalone.
	 */
	var target;

	if (typeof module !== "undefined" && module.exports) {
		target = {};
		module.exports = target;
	} else {
		xnode = {};
		target = xnode;
	}

	/**
	 * Create extended classes.
	 */
	target.Div = createExtendedXNodeElement("div");
	target.Button = createExtendedXNodeElement("button");
	target.Ul = createExtendedXNodeElement("ul");
	target.Li = createExtendedXNodeElement("li");
	target.A = createExtendedXNodeElement("a");
})();
},{}],3:[function(require,module,exports){
var xnode = require("xnode");
var inherits = require("inherits");
var xnodeui = {};

/**
 * Create a class that extends a jquery ui widget.
 * @method createExtendedXNodeUIElement
 */
function createExtendedXNodeUIElement(jqueryuiType, baseClass) {
	if (!baseClass)
		baseClass = xnode.Div;

	function cls() {
		baseClass.call(this);

		switch (jqueryuiType) {
			case "tabs":
				this.ul = new xnode.Ul();
				break;
		}

		this.jqueryuiType = jqueryuiType;
		this.jqueryElement = $(this.node);
		this.jqueryElement[this.jqueryuiType]();
	}

	inherits(cls, baseClass);

	cls.prototype.addEventListener = function(e, f) {
		xnode.Div.prototype.addEventListener.call(this, e, f);
		this.jqueryElement.on(e, f);
	}

	cls.prototype.removeEventListener = function(e, f) {
		xnode.Div.prototype.removeEventListener.call(this, e, f);
		this.jqueryElement.off(e, f);
	}

	cls.prototype.on = cls.prototype.addEventListener;
	cls.prototype.off = cls.prototype.removeEventListener;

	return cls;
}

/**
 * Create a property on an extended jquery ui class.
 * @method createXNodeUIProperty
 */
function createXNodeUIProperty(cls, prototypeName) {
	Object.defineProperty(cls.prototype, prototypeName, {
		get: function() {
			return this.jqueryElement[this.jqueryuiType]("option", prototypeName)
		},

		set: function(value) {
			this.jqueryElement[this.jqueryuiType]("option", prototypeName, value)
		}
	});
}

/**
 * Create a method on an extended jquery ui class.
 * @method createXNodeUIMethod
 */
function createXNodeUIMethod(cls, methodName) {
	cls.prototype[methodName] = function() {
		if (arguments.length == 0)
			return this.jqueryElement[this.jqueryuiType](methodName);

		else if (arguments.length == 1)
			return this.jqueryElement[this.jqueryuiType](methodName, arguments[0]);

		else if (arguments.length == 2)
			return this.jqueryElement[this.jqueryuiType](methodName, arguments[0], arguments[1]);

		else
			throw new Error("that many arguments?");
	}
}

/**
 * Button class.
 * @class xnodeui.Button
 */
xnodeui.Button = createExtendedXNodeUIElement("button", xnode.Button);

createXNodeUIProperty(xnodeui.Button, "disabled");
createXNodeUIProperty(xnodeui.Button, "icons");
createXNodeUIProperty(xnodeui.Button, "label");
createXNodeUIProperty(xnodeui.Button, "text");

createXNodeUIMethod(xnodeui.Button, "destroy");
createXNodeUIMethod(xnodeui.Button, "disable");
createXNodeUIMethod(xnodeui.Button, "enable");
createXNodeUIMethod(xnodeui.Button, "instance");
createXNodeUIMethod(xnodeui.Button, "option");
createXNodeUIMethod(xnodeui.Button, "refresh");
createXNodeUIMethod(xnodeui.Button, "widget");

/**
 * Slider class.
 * @class xnodeui.Slider
 */
xnodeui.Slider = createExtendedXNodeUIElement("slider");

createXNodeUIProperty(xnodeui.Slider, "animate");
createXNodeUIProperty(xnodeui.Slider, "disabled");
createXNodeUIProperty(xnodeui.Slider, "max");
createXNodeUIProperty(xnodeui.Slider, "min");
createXNodeUIProperty(xnodeui.Slider, "orientation");
createXNodeUIProperty(xnodeui.Slider, "range");
createXNodeUIProperty(xnodeui.Slider, "step");
createXNodeUIProperty(xnodeui.Slider, "value");
createXNodeUIProperty(xnodeui.Slider, "values");

createXNodeUIMethod(xnodeui.Slider, "destroy");
createXNodeUIMethod(xnodeui.Slider, "disable");
createXNodeUIMethod(xnodeui.Slider, "enable");
createXNodeUIMethod(xnodeui.Slider, "instance");
createXNodeUIMethod(xnodeui.Slider, "option");
createXNodeUIMethod(xnodeui.Slider, "widget");

// These shadows properties, so let's leave them out.
//createXNodeUIMethod(xnodeui.Slider, "value");
//createXNodeUIMethod(xnodeui.Slider, "values");

/**
 * Accordion class.
 * @class Accordion
 */
xnodeui.Accordion = createExtendedXNodeUIElement("accordion");

createXNodeUIProperty(xnodeui.Accordion, "active");
createXNodeUIProperty(xnodeui.Accordion, "animate");
createXNodeUIProperty(xnodeui.Accordion, "collapsible");
createXNodeUIProperty(xnodeui.Accordion, "disabled");
createXNodeUIProperty(xnodeui.Accordion, "event");
createXNodeUIProperty(xnodeui.Accordion, "header");
createXNodeUIProperty(xnodeui.Accordion, "heightStyle");
createXNodeUIProperty(xnodeui.Accordion, "icons");

createXNodeUIMethod(xnodeui.Accordion, "destroy");
createXNodeUIMethod(xnodeui.Accordion, "disable");
createXNodeUIMethod(xnodeui.Accordion, "enable");
createXNodeUIMethod(xnodeui.Accordion, "instance");
createXNodeUIMethod(xnodeui.Accordion, "option");
createXNodeUIMethod(xnodeui.Accordion, "refresh");
createXNodeUIMethod(xnodeui.Accordion, "widget")

/**
 * Tabs class.
 * @class xnodeui.Tabs
 */
xnodeui.Tabs = createExtendedXNodeUIElement("tabs");

createXNodeUIProperty(xnodeui.Tabs, "active");
createXNodeUIProperty(xnodeui.Tabs, "collapsible");
createXNodeUIProperty(xnodeui.Tabs, "disabled");
createXNodeUIProperty(xnodeui.Tabs, "event");
createXNodeUIProperty(xnodeui.Tabs, "heightStyle");
createXNodeUIProperty(xnodeui.Tabs, "hide");
createXNodeUIProperty(xnodeui.Tabs, "show");

createXNodeUIMethod(xnodeui.Tabs, "destroy");
createXNodeUIMethod(xnodeui.Tabs, "disable");
createXNodeUIMethod(xnodeui.Tabs, "enable");
createXNodeUIMethod(xnodeui.Tabs, "instance");
createXNodeUIMethod(xnodeui.Tabs, "load");
createXNodeUIMethod(xnodeui.Tabs, "option");
createXNodeUIMethod(xnodeui.Tabs, "refresh");
createXNodeUIMethod(xnodeui.Tabs, "widget")

module.exports = xnodeui;
},{"inherits":1,"xnode":2}],4:[function(require,module,exports){
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
},{"../src/xnodeui":3,"xnode":2}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIihmdW5jdGlvbigpIHtcblx0LyoqXG5cdCAqIFRoZSBiYXNpYyB4bm9kZSBjbGFzcy5cblx0ICogSXQgc2V0cyB0aGUgdW5kZXJseWluZyBub2RlIGVsZW1lbnQgYnkgY2FsbGluZ1xuXHQgKiBkb2N1bWVudC5jcmVhdGVFbGVtZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBYTm9kZSh0eXBlLCBjb250ZW50KSB7XG5cdFx0dGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuXHRcdGlmIChjb250ZW50ICE9PSB1bmRlZmluZWQpXG5cdFx0XHR0aGlzLm5vZGUuaW5uZXJIVE1MID0gY29udGVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGFuIGV4dGVuZGVkIGNsYXNzIHVzaW5nXG5cdCAqIHRoZSBYTm9kZSBjbGFzcyBkZWZpbmVkIGFib3ZlLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoZWxlbWVudFR5cGUsIGNvbnRlbnQpIHtcblx0XHR2YXIgZiA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcblx0XHRcdFhOb2RlLmNhbGwodGhpcywgZWxlbWVudFR5cGUsIGNvbnRlbnQpO1xuXHRcdH07XG5cblx0XHRmLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoWE5vZGUucHJvdG90eXBlKTtcblx0XHRmLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGY7XG5cblx0XHRyZXR1cm4gZjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIG9ubHkgcHJvcGVydHkgdGhhdCByZXR1cm5zIHRoZVxuXHQgKiB2YWx1ZSBvZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvZiB0aGVcblx0ICogdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlUmVhZE9ubHlQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoWE5vZGUucHJvdG90eXBlLCBwcm9wZXJ0eU5hbWUsIHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm5vZGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIHdyaXRlIHByb3BlcnR5IHRoYXQgb3BlcmF0ZXMgb25cblx0ICogdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgb2YgdGhlIHVuZGVybHlpbmdcblx0ICogbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KHByb3BlcnR5TmFtZSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShYTm9kZS5wcm90b3R5cGUsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHR0aGlzLm5vZGVbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG1ldGhvZCB0aGF0IHJvdXRlcyB0aGUgY2FsbCB0aHJvdWdoLCBkb3duXG5cdCAqIHRvIHRoZSBzYW1lIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlTWV0aG9kKG1ldGhvZE5hbWUpIHtcblx0XHRYTm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm5vZGVbbWV0aG9kTmFtZV0uYXBwbHkodGhpcy5ub2RlLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZnkgdGhlIE5vZGUucHJvcGVydHkgZnVuY3Rpb24sIHNvIHRoYXQgaXQgYWNjZXB0c1xuXHQgKiBYTm9kZSBvYmplY3RzLiBBbGwgWE5vZGUgb2JqZWN0cyB3aWxsIGJlIGNoYW5nZWQgdG9cblx0ICogdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3RzLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmdcblx0ICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKG1ldGhvZE5hbWUpIHtcblx0XHR2YXIgb3JpZ2luYWxGdW5jdGlvbiA9IE5vZGUucHJvdG90eXBlW21ldGhvZE5hbWVdO1xuXG5cdFx0Tm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdGZvciAodmFyIGEgaW4gYXJndW1lbnRzKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbYV0gaW5zdGFuY2VvZiBYTm9kZSlcblx0XHRcdFx0XHRhcmd1bWVudHNbYV0gPSBhcmd1bWVudHNbYV0ubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9yaWdpbmFsRnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHVwIHJlYWQgb25seSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0Y3JlYXRlWE5vZGVSZWFkT25seVByb3BlcnR5KFwic3R5bGVcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCByZWFkL3dyaXRlIHByb3BlcnRpZXMuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaW5uZXJIVE1MXCIpO1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaHJlZlwiKTtcblx0Y3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShcImlkXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgbWV0aG9kcyB0byBiZSByb3V0ZWQgdG8gdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcInJlbW92ZUNoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFkZEV2ZW50TGlzdGVuZXJcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIG1ldGhvZHMgb24gTm9kZS5wcm9wZXJ0eS5cblx0ICovXG5cdGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIoXCJyZW1vdmVDaGlsZFwiKTtcblxuXHQvKipcblx0ICogQ3JlYXRlIGV2ZW50IGxpc3RlbmVyIGFsaWFzZXMuXG5cdCAqL1xuXHRYTm9kZS5wcm90b3R5cGUub24gPSBYTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0WE5vZGUucHJvdG90eXBlLm9mZiA9IFhOb2RlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBXb3JrIGJvdGggYXMgYSBucG0gbW9kdWxlIGFuZCBzdGFuZGFsb25lLlxuXHQgKi9cblx0dmFyIHRhcmdldDtcblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdHRhcmdldCA9IHt9O1xuXHRcdG1vZHVsZS5leHBvcnRzID0gdGFyZ2V0O1xuXHR9IGVsc2Uge1xuXHRcdHhub2RlID0ge307XG5cdFx0dGFyZ2V0ID0geG5vZGU7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGV4dGVuZGVkIGNsYXNzZXMuXG5cdCAqL1xuXHR0YXJnZXQuRGl2ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRhcmdldC5CdXR0b24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImJ1dHRvblwiKTtcblx0dGFyZ2V0LlVsID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJ1bFwiKTtcblx0dGFyZ2V0LkxpID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJsaVwiKTtcblx0dGFyZ2V0LkEgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImFcIik7XG59KSgpOyIsInZhciB4bm9kZSA9IHJlcXVpcmUoXCJ4bm9kZVwiKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoXCJpbmhlcml0c1wiKTtcbnZhciB4bm9kZXVpID0ge307XG5cbi8qKlxuICogQ3JlYXRlIGEgY2xhc3MgdGhhdCBleHRlbmRzIGEganF1ZXJ5IHVpIHdpZGdldC5cbiAqIEBtZXRob2QgY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudFxuICovXG5mdW5jdGlvbiBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KGpxdWVyeXVpVHlwZSwgYmFzZUNsYXNzKSB7XG5cdGlmICghYmFzZUNsYXNzKVxuXHRcdGJhc2VDbGFzcyA9IHhub2RlLkRpdjtcblxuXHRmdW5jdGlvbiBjbHMoKSB7XG5cdFx0YmFzZUNsYXNzLmNhbGwodGhpcyk7XG5cblx0XHRzd2l0Y2ggKGpxdWVyeXVpVHlwZSkge1xuXHRcdFx0Y2FzZSBcInRhYnNcIjpcblx0XHRcdFx0dGhpcy51bCA9IG5ldyB4bm9kZS5VbCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHR0aGlzLmpxdWVyeXVpVHlwZSA9IGpxdWVyeXVpVHlwZTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQgPSAkKHRoaXMubm9kZSk7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXSgpO1xuXHR9XG5cblx0aW5oZXJpdHMoY2xzLCBiYXNlQ2xhc3MpO1xuXG5cdGNscy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUsIGYpIHtcblx0XHR4bm9kZS5EaXYucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIuY2FsbCh0aGlzLCBlLCBmKTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQub24oZSwgZik7XG5cdH1cblxuXHRjbHMucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlLCBmKSB7XG5cdFx0eG5vZGUuRGl2LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyLmNhbGwodGhpcywgZSwgZik7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50Lm9mZihlLCBmKTtcblx0fVxuXG5cdGNscy5wcm90b3R5cGUub24gPSBjbHMucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdGNscy5wcm90b3R5cGUub2ZmID0gY2xzLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdHJldHVybiBjbHM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcHJvcGVydHkgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJUHJvcGVydHlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSVByb3BlcnR5KGNscywgcHJvdG90eXBlTmFtZSkge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xzLnByb3RvdHlwZSwgcHJvdG90eXBlTmFtZSwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShcIm9wdGlvblwiLCBwcm90b3R5cGVOYW1lKVxuXHRcdH0sXG5cblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKFwib3B0aW9uXCIsIHByb3RvdHlwZU5hbWUsIHZhbHVlKVxuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbWV0aG9kIG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSU1ldGhvZFxuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJTWV0aG9kKGNscywgbWV0aG9kTmFtZSkge1xuXHRjbHMucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMClcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUpO1xuXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSwgYXJndW1lbnRzWzBdKTtcblxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMilcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcblxuXHRcdGVsc2Vcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInRoYXQgbWFueSBhcmd1bWVudHM/XCIpO1xuXHR9XG59XG5cbi8qKlxuICogQnV0dG9uIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuQnV0dG9uXG4gKi9cbnhub2RldWkuQnV0dG9uID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImJ1dHRvblwiLCB4bm9kZS5CdXR0b24pO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwiZGlzYWJsZWRcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwiaWNvbnNcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwibGFiZWxcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwidGV4dFwiKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJkZXN0cm95XCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJkaXNhYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJlbmFibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcImluc3RhbmNlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJvcHRpb25cIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcInJlZnJlc2hcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcIndpZGdldFwiKTtcblxuLyoqXG4gKiBTbGlkZXIgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5TbGlkZXJcbiAqL1xueG5vZGV1aS5TbGlkZXIgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwic2xpZGVyXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwiYW5pbWF0ZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJkaXNhYmxlZFwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJtYXhcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwibWluXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcIm9yaWVudGF0aW9uXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcInJhbmdlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcInN0ZXBcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwidmFsdWVcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwidmFsdWVzXCIpO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImRlc3Ryb3lcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImRpc2FibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImVuYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5TbGlkZXIsIFwiaW5zdGFuY2VcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcIm9wdGlvblwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5TbGlkZXIsIFwid2lkZ2V0XCIpO1xuXG4vLyBUaGVzZSBzaGFkb3dzIHByb3BlcnRpZXMsIHNvIGxldCdzIGxlYXZlIHRoZW0gb3V0LlxuLy9jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcInZhbHVlXCIpO1xuLy9jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcInZhbHVlc1wiKTtcblxuLyoqXG4gKiBBY2NvcmRpb24gY2xhc3MuXG4gKiBAY2xhc3MgQWNjb3JkaW9uXG4gKi9cbnhub2RldWkuQWNjb3JkaW9uID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImFjY29yZGlvblwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImFjdGl2ZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkFjY29yZGlvbiwgXCJhbmltYXRlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImNvbGxhcHNpYmxlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImRpc2FibGVkXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImV2ZW50XCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImhlYWRlclwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkFjY29yZGlvbiwgXCJoZWlnaHRTdHlsZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkFjY29yZGlvbiwgXCJpY29uc1wiKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJkZXN0cm95XCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJkaXNhYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJlbmFibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQWNjb3JkaW9uLCBcImluc3RhbmNlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJvcHRpb25cIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQWNjb3JkaW9uLCBcInJlZnJlc2hcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQWNjb3JkaW9uLCBcIndpZGdldFwiKVxuXG4vKipcbiAqIFRhYnMgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5UYWJzXG4gKi9cbnhub2RldWkuVGFicyA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJ0YWJzXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5UYWJzLCBcImFjdGl2ZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlRhYnMsIFwiY29sbGFwc2libGVcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5UYWJzLCBcImRpc2FibGVkXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuVGFicywgXCJldmVudFwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlRhYnMsIFwiaGVpZ2h0U3R5bGVcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5UYWJzLCBcImhpZGVcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5UYWJzLCBcInNob3dcIik7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5UYWJzLCBcImRlc3Ryb3lcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuVGFicywgXCJkaXNhYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlRhYnMsIFwiZW5hYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlRhYnMsIFwiaW5zdGFuY2VcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuVGFicywgXCJsb2FkXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlRhYnMsIFwib3B0aW9uXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlRhYnMsIFwicmVmcmVzaFwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5UYWJzLCBcIndpZGdldFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHhub2RldWk7IiwidmFyIHhub2RlID0gcmVxdWlyZShcInhub2RlXCIpO1xudmFyIHhub2RldWkgPSByZXF1aXJlKFwiLi4vc3JjL3hub2RldWlcIik7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG5cdHZhciBkID0gbmV3IHhub2RlLkRpdigpO1xuXG5cdGQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdGQuc3R5bGUubGVmdCA9IFwiMTBweFwiO1xuXHRkLnN0eWxlLnJpZ2h0ID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUudG9wID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUuYm90dG9tID0gXCIxMHB4XCI7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZCk7XG5cblx0dmFyIGEgPSBuZXcgeG5vZGV1aS5BY2NvcmRpb24oKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG9cIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJzb21lIGNvbnRlbnQuLi48YnIvPmJsYWxhYmxcIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJoZWxsbyAyXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwic29tZSBtb3JlIGNvbnRlbnQuLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPlwiKSk7XG5cblx0YS5oZWlnaHRTdHlsZSA9IFwiZmlsbFwiO1xuXHRhLmNvbGxhcHNpYmxlID0gZmFsc2U7XG5cblx0ZC5hcHBlbmRDaGlsZChhKTtcblx0YS5yZWZyZXNoKCk7XG5cblx0Lyp2YXIgdCA9IG5ldyB4bm9kZXVpLlRhYnMoKTtcblxuXHR0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHR0LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuXHR0LnN0eWxlLmxlZnQgPSBcIjBcIjtcblx0dC5zdHlsZS5yaWdodCA9IFwiMFwiO1xuXG5cdC8vdmFyIHVsPW5ldyB4bm9kZS5VbCgpO1xuXHR0LnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNmcmFnbWVudDEnPjxzcGFuPnRlc3Q8L3NwYW4+PC9hPlwiKSk7XG5cdHQudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2ZyYWdtZW50Mic+PHNwYW4+dGVzdDwvc3Bhbj48L2E+XCIpKTtcblxuXHR2YXIgYztcblx0YyA9IG5ldyB4bm9kZS5EaXYoXCJoZWxsb1wiKTtcblx0Yy5pZCA9IFwiZnJhZ21lbnQxXCI7XG5cdHQuYXBwZW5kQ2hpbGQoYyk7XG5cblx0YyA9IG5ldyB4bm9kZS5EaXYoXCJoZWxsbyBhZ2FpblwiKTtcblx0Yy5pZCA9IFwiZnJhZ21lbnQyXCI7XG5cdHQuYXBwZW5kQ2hpbGQoYyk7XG5cblx0dC5qcXVlcnlFbGVtZW50LnRhYnMoXCJyZWZyZXNoXCIpO1xuXHRkLmFwcGVuZENoaWxkKHQpO1xuXG5cdHQub3B0aW9uKFwiYWN0aXZlXCIsIDEpOyovXG5cblx0Ly92YXIgYiA9IG5ldyB4bm9kZXVpLkJ1dHRvbigpO1xuXG5cdC8vXHRiLmlubmVySFRNTD1cImhlbGxvXCI7XG5cblx0Ly9iLmxhYmVsID0gXCJIZWxsb1wiO1xuXHQvKlx0Y29uc29sZS5sb2coXCJsYWJlbDogXCIgKyBiLmxhYmVsKTtcblxuXHRiLmRpc2FibGVkID0gdHJ1ZTsqL1xuXG5cdC8vXHRiLmRpc2FibGUoKTtcblxuXHQvL1x0Y29uc29sZS5sb2coYi5sYWJlbCk7XG5cdC8vXHRiLmxhYmVsPVwiSGVsbG8gd29ybGRcIjtcblx0Ly9cdGIub3B0aW9uKFwibGFiZWxcIiwgXCJoZWxsb1wiKTtcblx0LypcdGQuYXBwZW5kQ2hpbGQoYik7XG5cblx0dmFyIHM9bmV3IHhub2RldWkuU2xpZGVyKCk7XG5cblx0cy5vbihcInNsaWRlXCIsZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coXCJzbGlkZWNoYW5nZVwiKTtcblx0fSkqL1xuXG5cdC8qXHRzLmpxdWVyeUVsZW1lbnQub24oXCJzbGlkZWNoYW5nZVwiLGZ1bmN0aW9uKCkge1xuXHRcdGNvbnNvbGUubG9nKFwiY2hhbmdlXCIpO1xuXHR9KTsqL1xuXG5cdC8qXHRzLm9uKFwiY2hhbmdlXCIsZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coXCJjaGFuZ2VcIik7XG5cdH0pOyovXG5cblx0ZC5hcHBlbmRDaGlsZChzKTtcbn0pOyJdfQ==
