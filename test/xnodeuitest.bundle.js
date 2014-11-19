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

/*
 * Base widget class.
 */
function XNodeUIBaseWidget(jqueryuiType, content) {
	xnode.Div.call(this);

	if (content)
		this.appendChild(content);

	this.jqueryuiType = jqueryuiType;
	this.jqueryElement = $(this.node);
	this.jqueryElement[this.jqueryuiType]();
}

inherits(XNodeUIBaseWidget, xnode.Div);

/**
 * Create a class that extends a jquery ui widget.
 * @method createExtendedXNodeUIElement
 */
function createExtendedXNodeUIElement(jqueryuiType) {
	function cls() {
		XNodeUIBaseWidget.call(this, jqueryuiType);
	}

	inherits(cls, XNodeUIBaseWidget);

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
 */
xnodeui.Button = createExtendedXNodeUIElement("button");

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
createXNodeUIMethod(xnodeui.Slider, "value");
/*createXNodeUIMethod(xnodeui.Slider, "values");*/
createXNodeUIMethod(xnodeui.Slider, "widget");

/**
 * Accordion class.
 * @class Accordion
 */
xnodeui.Accordion = function() {
	XNodeUIBaseWidget.call(this, "accordion");
}

inherits(xnodeui.Accordion, XNodeUIBaseWidget);

/**
 * Button class.
 * @class xnodeui.Button
 */
/*xnodeui.Button = function() {
	XNodeUIBaseWidget.call(this, "button");
}

inherits(xnodeui.Button, XNodeUIBaseWidget);*/

/**
 * Slider class.
 * @class xnodeui.Slider
 */
xnodeui.Slider = function() {
	XNodeUIBaseWidget.call(this, "slider");
}

inherits(xnodeui.Slider, XNodeUIBaseWidget);

/**
 * Tabs class.
 * @class xnodeui.Tabs
 */
xnodeui.Tabs = function() {
	this.ul = new xnode.Ul();

	XNodeUIBaseWidget.call(this, "tabs", this.ul);
}

inherits(xnodeui.Tabs, XNodeUIBaseWidget);


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
	d.style.bottom = "100px";
	document.body.appendChild(d);

	/* var a = new xnodeui.Accordion();
	a.appendChild(new xnode.Div("hello"));
	a.appendChild(new xnode.Div("some content...<br/>blalabl"));
	a.appendChild(new xnode.Div("hello 2"));
	a.appendChild(new xnode.Div("some more content...<br/>blalabl and so on...<br/>blalabl and so on...<br/>blalabl and so on...<br/>"));

	a.option("heightStyle", "fill");
	a.option("collapsible", false);

	d.appendChild(a);
	a.jqueryElement.accordion("refresh");*/

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

	var b = new xnodeui.Button("hello");

	//	b.innerHTML="hello";

	b.label = "Hello";
/*	console.log("label: " + b.label);

	b.disabled = true;*/

	//	b.disable();

	//	console.log(b.label);
	//	b.label="Hello world";
	//	b.option("label", "hello");
	d.appendChild(b);
});
},{"../src/xnodeui":3,"xnode":2}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIihmdW5jdGlvbigpIHtcblx0LyoqXG5cdCAqIFRoZSBiYXNpYyB4bm9kZSBjbGFzcy5cblx0ICogSXQgc2V0cyB0aGUgdW5kZXJseWluZyBub2RlIGVsZW1lbnQgYnkgY2FsbGluZ1xuXHQgKiBkb2N1bWVudC5jcmVhdGVFbGVtZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBYTm9kZSh0eXBlLCBjb250ZW50KSB7XG5cdFx0dGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuXHRcdGlmIChjb250ZW50ICE9PSB1bmRlZmluZWQpXG5cdFx0XHR0aGlzLm5vZGUuaW5uZXJIVE1MID0gY29udGVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGFuIGV4dGVuZGVkIGNsYXNzIHVzaW5nXG5cdCAqIHRoZSBYTm9kZSBjbGFzcyBkZWZpbmVkIGFib3ZlLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoZWxlbWVudFR5cGUsIGNvbnRlbnQpIHtcblx0XHR2YXIgZiA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcblx0XHRcdFhOb2RlLmNhbGwodGhpcywgZWxlbWVudFR5cGUsIGNvbnRlbnQpO1xuXHRcdH07XG5cblx0XHRmLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoWE5vZGUucHJvdG90eXBlKTtcblx0XHRmLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGY7XG5cblx0XHRyZXR1cm4gZjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIG9ubHkgcHJvcGVydHkgdGhhdCByZXR1cm5zIHRoZVxuXHQgKiB2YWx1ZSBvZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvZiB0aGVcblx0ICogdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlUmVhZE9ubHlQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoWE5vZGUucHJvdG90eXBlLCBwcm9wZXJ0eU5hbWUsIHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm5vZGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIHdyaXRlIHByb3BlcnR5IHRoYXQgb3BlcmF0ZXMgb25cblx0ICogdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgb2YgdGhlIHVuZGVybHlpbmdcblx0ICogbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KHByb3BlcnR5TmFtZSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShYTm9kZS5wcm90b3R5cGUsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHR0aGlzLm5vZGVbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG1ldGhvZCB0aGF0IHJvdXRlcyB0aGUgY2FsbCB0aHJvdWdoLCBkb3duXG5cdCAqIHRvIHRoZSBzYW1lIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlTWV0aG9kKG1ldGhvZE5hbWUpIHtcblx0XHRYTm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm5vZGVbbWV0aG9kTmFtZV0uYXBwbHkodGhpcy5ub2RlLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZnkgdGhlIE5vZGUucHJvcGVydHkgZnVuY3Rpb24sIHNvIHRoYXQgaXQgYWNjZXB0c1xuXHQgKiBYTm9kZSBvYmplY3RzLiBBbGwgWE5vZGUgb2JqZWN0cyB3aWxsIGJlIGNoYW5nZWQgdG9cblx0ICogdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3RzLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmdcblx0ICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKG1ldGhvZE5hbWUpIHtcblx0XHR2YXIgb3JpZ2luYWxGdW5jdGlvbiA9IE5vZGUucHJvdG90eXBlW21ldGhvZE5hbWVdO1xuXG5cdFx0Tm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdGZvciAodmFyIGEgaW4gYXJndW1lbnRzKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbYV0gaW5zdGFuY2VvZiBYTm9kZSlcblx0XHRcdFx0XHRhcmd1bWVudHNbYV0gPSBhcmd1bWVudHNbYV0ubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9yaWdpbmFsRnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHVwIHJlYWQgb25seSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0Y3JlYXRlWE5vZGVSZWFkT25seVByb3BlcnR5KFwic3R5bGVcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCByZWFkL3dyaXRlIHByb3BlcnRpZXMuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaW5uZXJIVE1MXCIpO1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaHJlZlwiKTtcblx0Y3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShcImlkXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgbWV0aG9kcyB0byBiZSByb3V0ZWQgdG8gdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcInJlbW92ZUNoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFkZEV2ZW50TGlzdGVuZXJcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIG1ldGhvZHMgb24gTm9kZS5wcm9wZXJ0eS5cblx0ICovXG5cdGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIoXCJyZW1vdmVDaGlsZFwiKTtcblxuXHQvKipcblx0ICogQ3JlYXRlIGV2ZW50IGxpc3RlbmVyIGFsaWFzZXMuXG5cdCAqL1xuXHRYTm9kZS5wcm90b3R5cGUub24gPSBYTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0WE5vZGUucHJvdG90eXBlLm9mZiA9IFhOb2RlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBXb3JrIGJvdGggYXMgYSBucG0gbW9kdWxlIGFuZCBzdGFuZGFsb25lLlxuXHQgKi9cblx0dmFyIHRhcmdldDtcblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdHRhcmdldCA9IHt9O1xuXHRcdG1vZHVsZS5leHBvcnRzID0gdGFyZ2V0O1xuXHR9IGVsc2Uge1xuXHRcdHhub2RlID0ge307XG5cdFx0dGFyZ2V0ID0geG5vZGU7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGV4dGVuZGVkIGNsYXNzZXMuXG5cdCAqL1xuXHR0YXJnZXQuRGl2ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRhcmdldC5CdXR0b24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImJ1dHRvblwiKTtcblx0dGFyZ2V0LlVsID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJ1bFwiKTtcblx0dGFyZ2V0LkxpID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJsaVwiKTtcblx0dGFyZ2V0LkEgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImFcIik7XG59KSgpOyIsInZhciB4bm9kZSA9IHJlcXVpcmUoXCJ4bm9kZVwiKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoXCJpbmhlcml0c1wiKTtcbnZhciB4bm9kZXVpID0ge307XG5cbi8qXG4gKiBCYXNlIHdpZGdldCBjbGFzcy5cbiAqL1xuZnVuY3Rpb24gWE5vZGVVSUJhc2VXaWRnZXQoanF1ZXJ5dWlUeXBlLCBjb250ZW50KSB7XG5cdHhub2RlLkRpdi5jYWxsKHRoaXMpO1xuXG5cdGlmIChjb250ZW50KVxuXHRcdHRoaXMuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cblx0dGhpcy5qcXVlcnl1aVR5cGUgPSBqcXVlcnl1aVR5cGU7XG5cdHRoaXMuanF1ZXJ5RWxlbWVudCA9ICQodGhpcy5ub2RlKTtcblx0dGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXSgpO1xufVxuXG5pbmhlcml0cyhYTm9kZVVJQmFzZVdpZGdldCwgeG5vZGUuRGl2KTtcblxuLyoqXG4gKiBDcmVhdGUgYSBjbGFzcyB0aGF0IGV4dGVuZHMgYSBqcXVlcnkgdWkgd2lkZ2V0LlxuICogQG1ldGhvZCBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoanF1ZXJ5dWlUeXBlKSB7XG5cdGZ1bmN0aW9uIGNscygpIHtcblx0XHRYTm9kZVVJQmFzZVdpZGdldC5jYWxsKHRoaXMsIGpxdWVyeXVpVHlwZSk7XG5cdH1cblxuXHRpbmhlcml0cyhjbHMsIFhOb2RlVUlCYXNlV2lkZ2V0KTtcblxuXHRyZXR1cm4gY2xzO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHByb3BlcnR5IG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSVByb3BlcnR5XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhOb2RlVUlQcm9wZXJ0eShjbHMsIHByb3RvdHlwZU5hbWUpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNscy5wcm90b3R5cGUsIHByb3RvdHlwZU5hbWUsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0oXCJvcHRpb25cIiwgcHJvdG90eXBlTmFtZSlcblx0XHR9LFxuXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShcIm9wdGlvblwiLCBwcm90b3R5cGVOYW1lLCB2YWx1ZSlcblx0XHR9XG5cdH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1ldGhvZCBvbiBhbiBleHRlbmRlZCBqcXVlcnkgdWkgY2xhc3MuXG4gKiBAbWV0aG9kIGNyZWF0ZVhOb2RlVUlNZXRob2RcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSU1ldGhvZChjbHMsIG1ldGhvZE5hbWUpIHtcblx0Y2xzLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApXG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShtZXRob2ROYW1lKTtcblxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSlcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUsIGFyZ3VtZW50c1swXSk7XG5cblx0XHRlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpXG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShtZXRob2ROYW1lLCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG5cblx0XHRlbHNlXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ0aGF0IG1hbnkgYXJndW1lbnRzP1wiKTtcblx0fVxufVxuXG4vKipcbiAqIEJ1dHRvbiBjbGFzcy5cbiAqL1xueG5vZGV1aS5CdXR0b24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiYnV0dG9uXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwiZGlzYWJsZWRcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwiaWNvbnNcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwibGFiZWxcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b24sIFwidGV4dFwiKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJkZXN0cm95XCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJkaXNhYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJlbmFibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcImluc3RhbmNlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJvcHRpb25cIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcInJlZnJlc2hcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcIndpZGdldFwiKTtcblxuLyoqXG4gKiBTbGlkZXIgY2xhc3MuXG4gKi9cbnhub2RldWkuU2xpZGVyID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcInNsaWRlclwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcImFuaW1hdGVcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwiZGlzYWJsZWRcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwibWF4XCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcIm1pblwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJvcmllbnRhdGlvblwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJyYW5nZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJzdGVwXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcInZhbHVlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcInZhbHVlc1wiKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlNsaWRlciwgXCJkZXN0cm95XCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlNsaWRlciwgXCJkaXNhYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlNsaWRlciwgXCJlbmFibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImluc3RhbmNlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlNsaWRlciwgXCJvcHRpb25cIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcInZhbHVlXCIpO1xuLypjcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcInZhbHVlc1wiKTsqL1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLlNsaWRlciwgXCJ3aWRnZXRcIik7XG5cbi8qKlxuICogQWNjb3JkaW9uIGNsYXNzLlxuICogQGNsYXNzIEFjY29yZGlvblxuICovXG54bm9kZXVpLkFjY29yZGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRYTm9kZVVJQmFzZVdpZGdldC5jYWxsKHRoaXMsIFwiYWNjb3JkaW9uXCIpO1xufVxuXG5pbmhlcml0cyh4bm9kZXVpLkFjY29yZGlvbiwgWE5vZGVVSUJhc2VXaWRnZXQpO1xuXG4vKipcbiAqIEJ1dHRvbiBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLkJ1dHRvblxuICovXG4vKnhub2RldWkuQnV0dG9uID0gZnVuY3Rpb24oKSB7XG5cdFhOb2RlVUlCYXNlV2lkZ2V0LmNhbGwodGhpcywgXCJidXR0b25cIik7XG59XG5cbmluaGVyaXRzKHhub2RldWkuQnV0dG9uLCBYTm9kZVVJQmFzZVdpZGdldCk7Ki9cblxuLyoqXG4gKiBTbGlkZXIgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5TbGlkZXJcbiAqL1xueG5vZGV1aS5TbGlkZXIgPSBmdW5jdGlvbigpIHtcblx0WE5vZGVVSUJhc2VXaWRnZXQuY2FsbCh0aGlzLCBcInNsaWRlclwiKTtcbn1cblxuaW5oZXJpdHMoeG5vZGV1aS5TbGlkZXIsIFhOb2RlVUlCYXNlV2lkZ2V0KTtcblxuLyoqXG4gKiBUYWJzIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuVGFic1xuICovXG54bm9kZXVpLlRhYnMgPSBmdW5jdGlvbigpIHtcblx0dGhpcy51bCA9IG5ldyB4bm9kZS5VbCgpO1xuXG5cdFhOb2RlVUlCYXNlV2lkZ2V0LmNhbGwodGhpcywgXCJ0YWJzXCIsIHRoaXMudWwpO1xufVxuXG5pbmhlcml0cyh4bm9kZXVpLlRhYnMsIFhOb2RlVUlCYXNlV2lkZ2V0KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHhub2RldWk7IiwidmFyIHhub2RlID0gcmVxdWlyZShcInhub2RlXCIpO1xudmFyIHhub2RldWkgPSByZXF1aXJlKFwiLi4vc3JjL3hub2RldWlcIik7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG5cdHZhciBkID0gbmV3IHhub2RlLkRpdigpO1xuXG5cdGQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdGQuc3R5bGUubGVmdCA9IFwiMTBweFwiO1xuXHRkLnN0eWxlLnJpZ2h0ID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUudG9wID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUuYm90dG9tID0gXCIxMDBweFwiO1xuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGQpO1xuXG5cdC8qIHZhciBhID0gbmV3IHhub2RldWkuQWNjb3JkaW9uKCk7XG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcImhlbGxvXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwic29tZSBjb250ZW50Li4uPGJyLz5ibGFsYWJsXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG8gMlwiKSk7XG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcInNvbWUgbW9yZSBjb250ZW50Li4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5cIikpO1xuXG5cdGEub3B0aW9uKFwiaGVpZ2h0U3R5bGVcIiwgXCJmaWxsXCIpO1xuXHRhLm9wdGlvbihcImNvbGxhcHNpYmxlXCIsIGZhbHNlKTtcblxuXHRkLmFwcGVuZENoaWxkKGEpO1xuXHRhLmpxdWVyeUVsZW1lbnQuYWNjb3JkaW9uKFwicmVmcmVzaFwiKTsqL1xuXG5cdC8qdmFyIHQgPSBuZXcgeG5vZGV1aS5UYWJzKCk7XG5cblx0dC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0dC5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcblx0dC5zdHlsZS5sZWZ0ID0gXCIwXCI7XG5cdHQuc3R5bGUucmlnaHQgPSBcIjBcIjtcblxuXHQvL3ZhciB1bD1uZXcgeG5vZGUuVWwoKTtcblx0dC51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjZnJhZ21lbnQxJz48c3Bhbj50ZXN0PC9zcGFuPjwvYT5cIikpO1xuXHR0LnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNmcmFnbWVudDInPjxzcGFuPnRlc3Q8L3NwYW4+PC9hPlwiKSk7XG5cblx0dmFyIGM7XG5cdGMgPSBuZXcgeG5vZGUuRGl2KFwiaGVsbG9cIik7XG5cdGMuaWQgPSBcImZyYWdtZW50MVwiO1xuXHR0LmFwcGVuZENoaWxkKGMpO1xuXG5cdGMgPSBuZXcgeG5vZGUuRGl2KFwiaGVsbG8gYWdhaW5cIik7XG5cdGMuaWQgPSBcImZyYWdtZW50MlwiO1xuXHR0LmFwcGVuZENoaWxkKGMpO1xuXG5cdHQuanF1ZXJ5RWxlbWVudC50YWJzKFwicmVmcmVzaFwiKTtcblx0ZC5hcHBlbmRDaGlsZCh0KTtcblxuXHR0Lm9wdGlvbihcImFjdGl2ZVwiLCAxKTsqL1xuXG5cdHZhciBiID0gbmV3IHhub2RldWkuQnV0dG9uKFwiaGVsbG9cIik7XG5cblx0Ly9cdGIuaW5uZXJIVE1MPVwiaGVsbG9cIjtcblxuXHRiLmxhYmVsID0gXCJIZWxsb1wiO1xuLypcdGNvbnNvbGUubG9nKFwibGFiZWw6IFwiICsgYi5sYWJlbCk7XG5cblx0Yi5kaXNhYmxlZCA9IHRydWU7Ki9cblxuXHQvL1x0Yi5kaXNhYmxlKCk7XG5cblx0Ly9cdGNvbnNvbGUubG9nKGIubGFiZWwpO1xuXHQvL1x0Yi5sYWJlbD1cIkhlbGxvIHdvcmxkXCI7XG5cdC8vXHRiLm9wdGlvbihcImxhYmVsXCIsIFwiaGVsbG9cIik7XG5cdGQuYXBwZW5kQ2hpbGQoYik7XG59KTsiXX0=
