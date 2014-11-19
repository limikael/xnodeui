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
 * Override addEventListener to also listen for component events.
 * @method addEventListener
 */
XNodeUIBaseWidget.prototype.addEventListener = function(e, f) {
	xnode.Div.prototype.addEventListener.call(this, e, f);
	this.jqueryElement.on(e, f);
}

/**
 * Override removeEventListener to also stop listening for component events.
 * @method removeEventListener
 */
XNodeUIBaseWidget.prototype.removeEventListener = function(e, f) {
	xnode.Div.prototype.removeEventListener.call(this, e, f);
	this.jqueryElement.off(e, f);
}

/*
 * Event listener function aliases.
 */
XNodeUIBaseWidget.prototype.on = XNodeUIBaseWidget.prototype.addEventListener;
XNodeUIBaseWidget.prototype.off = XNodeUIBaseWidget.prototype.removeEventListener;

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
createXNodeUIMethod(xnodeui.Slider, "widget");

// These shadows properties, so let's leave them out.
//createXNodeUIMethod(xnodeui.Slider, "value");
//createXNodeUIMethod(xnodeui.Slider, "values");

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

	var b = new xnodeui.Button();

	//	b.innerHTML="hello";

	b.label = "Hello";
/*	console.log("label: " + b.label);

	b.disabled = true;*/

	//	b.disable();

	//	console.log(b.label);
	//	b.label="Hello world";
	//	b.option("label", "hello");
	d.appendChild(b);

	var s=new xnodeui.Slider();

	s.on("slide",function() {
		console.log("slidechange");
	})

/*	s.jqueryElement.on("slidechange",function() {
		console.log("change");
	});*/

/*	s.on("change",function() {
		console.log("change");
	});*/

	d.appendChild(s);


});
},{"../src/xnodeui":3,"xnode":2}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiKGZ1bmN0aW9uKCkge1xuXHQvKipcblx0ICogVGhlIGJhc2ljIHhub2RlIGNsYXNzLlxuXHQgKiBJdCBzZXRzIHRoZSB1bmRlcmx5aW5nIG5vZGUgZWxlbWVudCBieSBjYWxsaW5nXG5cdCAqIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRcblx0ICovXG5cdGZ1bmN0aW9uIFhOb2RlKHR5cGUsIGNvbnRlbnQpIHtcblx0XHR0aGlzLm5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuXG5cdFx0aWYgKGNvbnRlbnQgIT09IHVuZGVmaW5lZClcblx0XHRcdHRoaXMubm9kZS5pbm5lckhUTUwgPSBjb250ZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYW4gZXh0ZW5kZWQgY2xhc3MgdXNpbmdcblx0ICogdGhlIFhOb2RlIGNsYXNzIGRlZmluZWQgYWJvdmUuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChlbGVtZW50VHlwZSwgY29udGVudCkge1xuXHRcdHZhciBmID0gZnVuY3Rpb24oY29udGVudCkge1xuXHRcdFx0WE5vZGUuY2FsbCh0aGlzLCBlbGVtZW50VHlwZSwgY29udGVudCk7XG5cdFx0fTtcblxuXHRcdGYucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShYTm9kZS5wcm90b3R5cGUpO1xuXHRcdGYucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZjtcblxuXHRcdHJldHVybiBmO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIHJlYWQgb25seSBwcm9wZXJ0eSB0aGF0IHJldHVybnMgdGhlXG5cdCAqIHZhbHVlIG9mIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IG9mIHRoZVxuXHQgKiB1bmRlcmx5aW5nIG5vZGUgb2JqZWN0LlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlWE5vZGVSZWFkT25seVByb3BlcnR5KHByb3BlcnR5TmFtZSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShYTm9kZS5wcm90b3R5cGUsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIHJlYWQgd3JpdGUgcHJvcGVydHkgdGhhdCBvcGVyYXRlcyBvblxuXHQgKiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvZiB0aGUgdW5kZXJseWluZ1xuXHQgKiBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkocHJvcGVydHlOYW1lKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFhOb2RlLnByb3RvdHlwZSwgcHJvcGVydHlOYW1lLCB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5ub2RlW3Byb3BlcnR5TmFtZV07XG5cdFx0XHR9LFxuXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbWV0aG9kIHRoYXQgcm91dGVzIHRoZSBjYWxsIHRocm91Z2gsIGRvd25cblx0ICogdG8gdGhlIHNhbWUgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG5vZGUgb2JqZWN0LlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlWE5vZGVNZXRob2QobWV0aG9kTmFtZSkge1xuXHRcdFhOb2RlLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMubm9kZVttZXRob2ROYW1lXS5hcHBseSh0aGlzLm5vZGUsIGFyZ3VtZW50cyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmeSB0aGUgTm9kZS5wcm9wZXJ0eSBmdW5jdGlvbiwgc28gdGhhdCBpdCBhY2NlcHRzXG5cdCAqIFhOb2RlIG9iamVjdHMuIEFsbCBYTm9kZSBvYmplY3RzIHdpbGwgYmUgY2hhbmdlZCB0b1xuXHQgKiB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdHMsIGFuZCB0aGUgY29ycmVzcG9uZGluZ1xuXHQgKiBtZXRob2Qgd2lsbCBiZSBjYWxsZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIobWV0aG9kTmFtZSkge1xuXHRcdHZhciBvcmlnaW5hbEZ1bmN0aW9uID0gTm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV07XG5cblx0XHROb2RlLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Zm9yICh2YXIgYSBpbiBhcmd1bWVudHMpIHtcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1thXSBpbnN0YW5jZW9mIFhOb2RlKVxuXHRcdFx0XHRcdGFyZ3VtZW50c1thXSA9IGFyZ3VtZW50c1thXS5ub2RlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb3JpZ2luYWxGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdXAgcmVhZCBvbmx5IHByb3BlcnRpZXMuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZVJlYWRPbmx5UHJvcGVydHkoXCJzdHlsZVwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIHJlYWQvd3JpdGUgcHJvcGVydGllcy5cblx0ICovXG5cdGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkoXCJpbm5lckhUTUxcIik7XG5cdGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkoXCJocmVmXCIpO1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaWRcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCBtZXRob2RzIHRvIGJlIHJvdXRlZCB0byB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwiYXBwZW5kQ2hpbGRcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwicmVtb3ZlQ2hpbGRcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwiYWRkRXZlbnRMaXN0ZW5lclwiKTtcblx0Y3JlYXRlWE5vZGVNZXRob2QoXCJyZW1vdmVFdmVudExpc3RlbmVyXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgbWV0aG9kcyBvbiBOb2RlLnByb3BlcnR5LlxuXHQgKi9cblx0Y3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKFwiYXBwZW5kQ2hpbGRcIik7XG5cdGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihcInJlbW92ZUNoaWxkXCIpO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgZXZlbnQgbGlzdGVuZXIgYWxpYXNlcy5cblx0ICovXG5cdFhOb2RlLnByb3RvdHlwZS5vbiA9IFhOb2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuXHRYTm9kZS5wcm90b3R5cGUub2ZmID0gWE5vZGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cblx0LyoqXG5cdCAqIFdvcmsgYm90aCBhcyBhIG5wbSBtb2R1bGUgYW5kIHN0YW5kYWxvbmUuXG5cdCAqL1xuXHR2YXIgdGFyZ2V0O1xuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSB0YXJnZXQ7XG5cdH0gZWxzZSB7XG5cdFx0eG5vZGUgPSB7fTtcblx0XHR0YXJnZXQgPSB4bm9kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgZXh0ZW5kZWQgY2xhc3Nlcy5cblx0ICovXG5cdHRhcmdldC5EaXYgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImRpdlwiKTtcblx0dGFyZ2V0LkJ1dHRvbiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuXHR0YXJnZXQuVWwgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcInVsXCIpO1xuXHR0YXJnZXQuTGkgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImxpXCIpO1xuXHR0YXJnZXQuQSA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwiYVwiKTtcbn0pKCk7IiwidmFyIHhub2RlID0gcmVxdWlyZShcInhub2RlXCIpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZShcImluaGVyaXRzXCIpO1xudmFyIHhub2RldWkgPSB7fTtcblxuLypcbiAqIEJhc2Ugd2lkZ2V0IGNsYXNzLlxuICovXG5mdW5jdGlvbiBYTm9kZVVJQmFzZVdpZGdldChqcXVlcnl1aVR5cGUsIGNvbnRlbnQpIHtcblx0eG5vZGUuRGl2LmNhbGwodGhpcyk7XG5cblx0aWYgKGNvbnRlbnQpXG5cdFx0dGhpcy5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuXHR0aGlzLmpxdWVyeXVpVHlwZSA9IGpxdWVyeXVpVHlwZTtcblx0dGhpcy5qcXVlcnlFbGVtZW50ID0gJCh0aGlzLm5vZGUpO1xuXHR0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKCk7XG59XG5cbmluaGVyaXRzKFhOb2RlVUlCYXNlV2lkZ2V0LCB4bm9kZS5EaXYpO1xuXG4vKipcbiAqIE92ZXJyaWRlIGFkZEV2ZW50TGlzdGVuZXIgdG8gYWxzbyBsaXN0ZW4gZm9yIGNvbXBvbmVudCBldmVudHMuXG4gKiBAbWV0aG9kIGFkZEV2ZW50TGlzdGVuZXJcbiAqL1xuWE5vZGVVSUJhc2VXaWRnZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlLCBmKSB7XG5cdHhub2RlLkRpdi5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lci5jYWxsKHRoaXMsIGUsIGYpO1xuXHR0aGlzLmpxdWVyeUVsZW1lbnQub24oZSwgZik7XG59XG5cbi8qKlxuICogT3ZlcnJpZGUgcmVtb3ZlRXZlbnRMaXN0ZW5lciB0byBhbHNvIHN0b3AgbGlzdGVuaW5nIGZvciBjb21wb25lbnQgZXZlbnRzLlxuICogQG1ldGhvZCByZW1vdmVFdmVudExpc3RlbmVyXG4gKi9cblhOb2RlVUlCYXNlV2lkZ2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSwgZikge1xuXHR4bm9kZS5EaXYucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIuY2FsbCh0aGlzLCBlLCBmKTtcblx0dGhpcy5qcXVlcnlFbGVtZW50Lm9mZihlLCBmKTtcbn1cblxuLypcbiAqIEV2ZW50IGxpc3RlbmVyIGZ1bmN0aW9uIGFsaWFzZXMuXG4gKi9cblhOb2RlVUlCYXNlV2lkZ2V0LnByb3RvdHlwZS5vbiA9IFhOb2RlVUlCYXNlV2lkZ2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuWE5vZGVVSUJhc2VXaWRnZXQucHJvdG90eXBlLm9mZiA9IFhOb2RlVUlCYXNlV2lkZ2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG4vKipcbiAqIENyZWF0ZSBhIGNsYXNzIHRoYXQgZXh0ZW5kcyBhIGpxdWVyeSB1aSB3aWRnZXQuXG4gKiBAbWV0aG9kIGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChqcXVlcnl1aVR5cGUpIHtcblx0ZnVuY3Rpb24gY2xzKCkge1xuXHRcdFhOb2RlVUlCYXNlV2lkZ2V0LmNhbGwodGhpcywganF1ZXJ5dWlUeXBlKTtcblx0fVxuXG5cdGluaGVyaXRzKGNscywgWE5vZGVVSUJhc2VXaWRnZXQpO1xuXG5cdHJldHVybiBjbHM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcHJvcGVydHkgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJUHJvcGVydHlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSVByb3BlcnR5KGNscywgcHJvdG90eXBlTmFtZSkge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xzLnByb3RvdHlwZSwgcHJvdG90eXBlTmFtZSwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShcIm9wdGlvblwiLCBwcm90b3R5cGVOYW1lKVxuXHRcdH0sXG5cblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKFwib3B0aW9uXCIsIHByb3RvdHlwZU5hbWUsIHZhbHVlKVxuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbWV0aG9kIG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSU1ldGhvZFxuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJTWV0aG9kKGNscywgbWV0aG9kTmFtZSkge1xuXHRjbHMucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMClcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUpO1xuXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSwgYXJndW1lbnRzWzBdKTtcblxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMilcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcblxuXHRcdGVsc2Vcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInRoYXQgbWFueSBhcmd1bWVudHM/XCIpO1xuXHR9XG59XG5cbi8qKlxuICogQnV0dG9uIGNsYXNzLlxuICovXG54bm9kZXVpLkJ1dHRvbiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJidXR0b25cIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkJ1dHRvbiwgXCJkaXNhYmxlZFwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkJ1dHRvbiwgXCJpY29uc1wiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkJ1dHRvbiwgXCJsYWJlbFwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkJ1dHRvbiwgXCJ0ZXh0XCIpO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcImRlc3Ryb3lcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcImRpc2FibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcImVuYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwiaW5zdGFuY2VcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQnV0dG9uLCBcIm9wdGlvblwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwicmVmcmVzaFwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwid2lkZ2V0XCIpO1xuXG4vKipcbiAqIFNsaWRlciBjbGFzcy5cbiAqL1xueG5vZGV1aS5TbGlkZXIgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwic2xpZGVyXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwiYW5pbWF0ZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJkaXNhYmxlZFwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLlNsaWRlciwgXCJtYXhcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwibWluXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcIm9yaWVudGF0aW9uXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcInJhbmdlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuU2xpZGVyLCBcInN0ZXBcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwidmFsdWVcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5TbGlkZXIsIFwidmFsdWVzXCIpO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImRlc3Ryb3lcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImRpc2FibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcImVuYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5TbGlkZXIsIFwiaW5zdGFuY2VcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcIm9wdGlvblwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5TbGlkZXIsIFwid2lkZ2V0XCIpO1xuXG4vLyBUaGVzZSBzaGFkb3dzIHByb3BlcnRpZXMsIHNvIGxldCdzIGxlYXZlIHRoZW0gb3V0LlxuLy9jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcInZhbHVlXCIpO1xuLy9jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuU2xpZGVyLCBcInZhbHVlc1wiKTtcblxuLyoqXG4gKiBBY2NvcmRpb24gY2xhc3MuXG4gKiBAY2xhc3MgQWNjb3JkaW9uXG4gKi9cbnhub2RldWkuQWNjb3JkaW9uID0gZnVuY3Rpb24oKSB7XG5cdFhOb2RlVUlCYXNlV2lkZ2V0LmNhbGwodGhpcywgXCJhY2NvcmRpb25cIik7XG59XG5cbmluaGVyaXRzKHhub2RldWkuQWNjb3JkaW9uLCBYTm9kZVVJQmFzZVdpZGdldCk7XG5cbi8qKlxuICogQnV0dG9uIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuQnV0dG9uXG4gKi9cbi8qeG5vZGV1aS5CdXR0b24gPSBmdW5jdGlvbigpIHtcblx0WE5vZGVVSUJhc2VXaWRnZXQuY2FsbCh0aGlzLCBcImJ1dHRvblwiKTtcbn1cblxuaW5oZXJpdHMoeG5vZGV1aS5CdXR0b24sIFhOb2RlVUlCYXNlV2lkZ2V0KTsqL1xuXG4vKipcbiAqIFRhYnMgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5UYWJzXG4gKi9cbnhub2RldWkuVGFicyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLnVsID0gbmV3IHhub2RlLlVsKCk7XG5cblx0WE5vZGVVSUJhc2VXaWRnZXQuY2FsbCh0aGlzLCBcInRhYnNcIiwgdGhpcy51bCk7XG59XG5cbmluaGVyaXRzKHhub2RldWkuVGFicywgWE5vZGVVSUJhc2VXaWRnZXQpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0geG5vZGV1aTsiLCJ2YXIgeG5vZGUgPSByZXF1aXJlKFwieG5vZGVcIik7XG52YXIgeG5vZGV1aSA9IHJlcXVpcmUoXCIuLi9zcmMveG5vZGV1aVwiKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cblx0dmFyIGQgPSBuZXcgeG5vZGUuRGl2KCk7XG5cblx0ZC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0ZC5zdHlsZS5sZWZ0ID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUucmlnaHQgPSBcIjEwcHhcIjtcblx0ZC5zdHlsZS50b3AgPSBcIjEwcHhcIjtcblx0ZC5zdHlsZS5ib3R0b20gPSBcIjEwMHB4XCI7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZCk7XG5cblx0LyogdmFyIGEgPSBuZXcgeG5vZGV1aS5BY2NvcmRpb24oKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG9cIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJzb21lIGNvbnRlbnQuLi48YnIvPmJsYWxhYmxcIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJoZWxsbyAyXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwic29tZSBtb3JlIGNvbnRlbnQuLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPlwiKSk7XG5cblx0YS5vcHRpb24oXCJoZWlnaHRTdHlsZVwiLCBcImZpbGxcIik7XG5cdGEub3B0aW9uKFwiY29sbGFwc2libGVcIiwgZmFsc2UpO1xuXG5cdGQuYXBwZW5kQ2hpbGQoYSk7XG5cdGEuanF1ZXJ5RWxlbWVudC5hY2NvcmRpb24oXCJyZWZyZXNoXCIpOyovXG5cblx0Lyp2YXIgdCA9IG5ldyB4bm9kZXVpLlRhYnMoKTtcblxuXHR0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHR0LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuXHR0LnN0eWxlLmxlZnQgPSBcIjBcIjtcblx0dC5zdHlsZS5yaWdodCA9IFwiMFwiO1xuXG5cdC8vdmFyIHVsPW5ldyB4bm9kZS5VbCgpO1xuXHR0LnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNmcmFnbWVudDEnPjxzcGFuPnRlc3Q8L3NwYW4+PC9hPlwiKSk7XG5cdHQudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2ZyYWdtZW50Mic+PHNwYW4+dGVzdDwvc3Bhbj48L2E+XCIpKTtcblxuXHR2YXIgYztcblx0YyA9IG5ldyB4bm9kZS5EaXYoXCJoZWxsb1wiKTtcblx0Yy5pZCA9IFwiZnJhZ21lbnQxXCI7XG5cdHQuYXBwZW5kQ2hpbGQoYyk7XG5cblx0YyA9IG5ldyB4bm9kZS5EaXYoXCJoZWxsbyBhZ2FpblwiKTtcblx0Yy5pZCA9IFwiZnJhZ21lbnQyXCI7XG5cdHQuYXBwZW5kQ2hpbGQoYyk7XG5cblx0dC5qcXVlcnlFbGVtZW50LnRhYnMoXCJyZWZyZXNoXCIpO1xuXHRkLmFwcGVuZENoaWxkKHQpO1xuXG5cdHQub3B0aW9uKFwiYWN0aXZlXCIsIDEpOyovXG5cblx0dmFyIGIgPSBuZXcgeG5vZGV1aS5CdXR0b24oKTtcblxuXHQvL1x0Yi5pbm5lckhUTUw9XCJoZWxsb1wiO1xuXG5cdGIubGFiZWwgPSBcIkhlbGxvXCI7XG4vKlx0Y29uc29sZS5sb2coXCJsYWJlbDogXCIgKyBiLmxhYmVsKTtcblxuXHRiLmRpc2FibGVkID0gdHJ1ZTsqL1xuXG5cdC8vXHRiLmRpc2FibGUoKTtcblxuXHQvL1x0Y29uc29sZS5sb2coYi5sYWJlbCk7XG5cdC8vXHRiLmxhYmVsPVwiSGVsbG8gd29ybGRcIjtcblx0Ly9cdGIub3B0aW9uKFwibGFiZWxcIiwgXCJoZWxsb1wiKTtcblx0ZC5hcHBlbmRDaGlsZChiKTtcblxuXHR2YXIgcz1uZXcgeG5vZGV1aS5TbGlkZXIoKTtcblxuXHRzLm9uKFwic2xpZGVcIixmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZyhcInNsaWRlY2hhbmdlXCIpO1xuXHR9KVxuXG4vKlx0cy5qcXVlcnlFbGVtZW50Lm9uKFwic2xpZGVjaGFuZ2VcIixmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZyhcImNoYW5nZVwiKTtcblx0fSk7Ki9cblxuLypcdHMub24oXCJjaGFuZ2VcIixmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZyhcImNoYW5nZVwiKTtcblx0fSk7Ki9cblxuXHRkLmFwcGVuZENoaWxkKHMpO1xuXG5cbn0pOyJdfQ==
