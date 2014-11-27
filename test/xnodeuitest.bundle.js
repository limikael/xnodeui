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
				this.appendChild(this.ul);
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
 * Create several proprties on an extended jquery ui class.
 * @method createXNodeUIProperties
 */
function createXNodeUIProperties(cls, proprtyNames) {
	for (var i = 0; i < proprtyNames.length; i++)
		createXNodeUIProperty(cls, proprtyNames[i]);
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
 * Create a method on an extended jquery ui class.
 * @method createXNodeUIMethods
 */
function createXNodeUIMethods(cls, methodNames) {
	for (var i = 0; i < methodNames.length; i++)
		createXNodeUIMethod(cls, methodNames[i]);
}

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
 * Autocomplete class.
 * @class Autocomplete
 */
xnodeui.Autocomplete = createExtendedXNodeUIElement("autocomplete");

createXNodeUIProperty(xnodeui.Autocomplete, "appendTo");
createXNodeUIProperty(xnodeui.Autocomplete, "autoFocus");
createXNodeUIProperty(xnodeui.Autocomplete, "delay");
createXNodeUIProperty(xnodeui.Autocomplete, "disabled");
createXNodeUIProperty(xnodeui.Autocomplete, "minLength");
createXNodeUIProperty(xnodeui.Autocomplete, "position");
createXNodeUIProperty(xnodeui.Autocomplete, "source");

createXNodeUIMethod(xnodeui.Autocomplete, "close");
createXNodeUIMethod(xnodeui.Autocomplete, "destroy");
createXNodeUIMethod(xnodeui.Autocomplete, "disable");
createXNodeUIMethod(xnodeui.Autocomplete, "enable");
createXNodeUIMethod(xnodeui.Autocomplete, "instance");
createXNodeUIMethod(xnodeui.Autocomplete, "option");
createXNodeUIMethod(xnodeui.Autocomplete, "search")
createXNodeUIMethod(xnodeui.Autocomplete, "widget")

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
 * Buttonset class.
 * @class xnodeui.Buttonset
 */
xnodeui.Buttonset = createExtendedXNodeUIElement("buttonset", xnode.Div);

createXNodeUIProperty(xnodeui.Buttonset, "disabled");
createXNodeUIProperty(xnodeui.Buttonset, "items");

createXNodeUIMethod(xnodeui.Autocomplete, "destroy");
createXNodeUIMethod(xnodeui.Autocomplete, "disable");
createXNodeUIMethod(xnodeui.Autocomplete, "enable");
createXNodeUIMethod(xnodeui.Autocomplete, "instance");
createXNodeUIMethod(xnodeui.Autocomplete, "option");
createXNodeUIMethod(xnodeui.Autocomplete, "refresh");
createXNodeUIMethod(xnodeui.Autocomplete, "widget");

/**
 * Buttonset class.
 * @class xnodeui.Buttonset
 */
xnodeui.Buttonset = createExtendedXNodeUIElement("buttonset", xnode.Div);

createXNodeUIProperties(xnodeui.Buttonset, [
	"disabled", "items"
]);

createXNodeUIMethod(xnodeui.Autocomplete, "destroy");
createXNodeUIMethod(xnodeui.Autocomplete, "disable");
createXNodeUIMethod(xnodeui.Autocomplete, "enable");
createXNodeUIMethod(xnodeui.Autocomplete, "instance");
createXNodeUIMethod(xnodeui.Autocomplete, "option");
createXNodeUIMethod(xnodeui.Autocomplete, "refresh");
createXNodeUIMethod(xnodeui.Autocomplete, "widget");

/**
 * Slider class.
 * @class xnodeui.Slider
 */
xnodeui.Slider = createExtendedXNodeUIElement("slider");

createXNodeUIProperties(xnodeui.Slider, [
	"animate", "disabled", "max", "min",
	"orientation", "range", "step", "value",
	"values"
]);

createXNodeUIMethods(xnodeui.Slider, [
	"destroy", "disable", "enable", "instance",
	"option", "widget" /*, "value", "values" */
]);

/**
 * Tabs class.
 * @class xnodeui.Tabs
 */
xnodeui.Tabs = createExtendedXNodeUIElement("tabs");

createXNodeUIProperties(xnodeui.Tabs, [
	"active", "collapsible", "disabled", "event",
	"heightStyle", "hide", "show"
]);

createXNodeUIMethods(xnodeui.Tabs, [
	"destroy", "disable", "enable", "instance",
	"load", "option", "refresh", "widget"
]);

module.exports = xnodeui;
},{"inherits":1,"xnode":2}],4:[function(require,module,exports){
var xnode = require("xnode");
var xnodeui = require("../src/xnodeui");

function createButtonsTab() {
	var tab = new xnode.Div();
	tab.id = "buttons";

	var button = new xnodeui.Button();
	button.label = "Testing";
	tab.appendChild(button);

	var disabled = new xnodeui.Button();
	disabled.label = "Disabled";
	disabled.disable();
	tab.appendChild(disabled);

	return tab;
}

function createSlidersTab() {
	var tab = new xnode.Div();
	tab.id = "sliders";

	var slider = new xnodeui.Slider();

	tab.appendChild(slider);

	return tab;
}

function createAccordionTab() {
	var a = new xnodeui.Accordion();
	a.id = "accordion";

	a.appendChild(new xnode.Div("hello"));
	a.appendChild(new xnode.Div("some content...<br/>blalabl"));
	a.appendChild(new xnode.Div("hello 2"));
	a.appendChild(new xnode.Div("some more content...<br/>blalabl and so on...<br/>blalabl and so on...<br/>blalabl and so on...<br/>"));

	a.heightStyle = "fill";
	a.collapsible = false;

	a.style.position = "absolute";
	a.style.top = "40px";
	a.style.bottom = "10px";
	a.style.left = "0";
	a.style.right = "0";

	return a;
}

$(document).ready(function() {

	var d = new xnode.Div();

	d.style.position = "absolute";
	d.style.left = "10px";
	d.style.right = "10px";
	d.style.top = "10px";
	d.style.bottom = "10px";
	document.body.appendChild(d);

	var tabs = new xnodeui.Tabs();

	tabs.style.position = "absolute";
	tabs.style.top = "0";
	tabs.style.bottom = "0";
	tabs.style.left = "0";
	tabs.style.right = "0";

	//var ul=new xnode.Ul();
	tabs.ul.appendChild(new xnode.Li("<a href='#buttons'><span>Buttons</span></a>"));
	tabs.appendChild(createButtonsTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#sliders'><span>Sliders</span></a>"));
	tabs.appendChild(createSlidersTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#accordion'><span>Accordion</span></a>"));
	var accordion = createAccordionTab();
	tabs.appendChild(accordion);

	d.appendChild(tabs);
	tabs.refresh();
	tabs.active = 0;

	accordion.refresh();

	$(window).resize(function() {
		//tabs.refresh();
		accordion.refresh();
	});
});
},{"../src/xnodeui":3,"xnode":2}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIihmdW5jdGlvbigpIHtcblx0LyoqXG5cdCAqIFRoZSBiYXNpYyB4bm9kZSBjbGFzcy5cblx0ICogSXQgc2V0cyB0aGUgdW5kZXJseWluZyBub2RlIGVsZW1lbnQgYnkgY2FsbGluZ1xuXHQgKiBkb2N1bWVudC5jcmVhdGVFbGVtZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBYTm9kZSh0eXBlLCBjb250ZW50KSB7XG5cdFx0dGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuXHRcdGlmIChjb250ZW50ICE9PSB1bmRlZmluZWQpXG5cdFx0XHR0aGlzLm5vZGUuaW5uZXJIVE1MID0gY29udGVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGFuIGV4dGVuZGVkIGNsYXNzIHVzaW5nXG5cdCAqIHRoZSBYTm9kZSBjbGFzcyBkZWZpbmVkIGFib3ZlLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoZWxlbWVudFR5cGUsIGNvbnRlbnQpIHtcblx0XHR2YXIgZiA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcblx0XHRcdFhOb2RlLmNhbGwodGhpcywgZWxlbWVudFR5cGUsIGNvbnRlbnQpO1xuXHRcdH07XG5cblx0XHRmLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoWE5vZGUucHJvdG90eXBlKTtcblx0XHRmLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGY7XG5cblx0XHRyZXR1cm4gZjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIG9ubHkgcHJvcGVydHkgdGhhdCByZXR1cm5zIHRoZVxuXHQgKiB2YWx1ZSBvZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvZiB0aGVcblx0ICogdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlUmVhZE9ubHlQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoWE5vZGUucHJvdG90eXBlLCBwcm9wZXJ0eU5hbWUsIHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm5vZGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIHdyaXRlIHByb3BlcnR5IHRoYXQgb3BlcmF0ZXMgb25cblx0ICogdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgb2YgdGhlIHVuZGVybHlpbmdcblx0ICogbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KHByb3BlcnR5TmFtZSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShYTm9kZS5wcm90b3R5cGUsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHR0aGlzLm5vZGVbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG1ldGhvZCB0aGF0IHJvdXRlcyB0aGUgY2FsbCB0aHJvdWdoLCBkb3duXG5cdCAqIHRvIHRoZSBzYW1lIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlTWV0aG9kKG1ldGhvZE5hbWUpIHtcblx0XHRYTm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm5vZGVbbWV0aG9kTmFtZV0uYXBwbHkodGhpcy5ub2RlLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZnkgdGhlIE5vZGUucHJvcGVydHkgZnVuY3Rpb24sIHNvIHRoYXQgaXQgYWNjZXB0c1xuXHQgKiBYTm9kZSBvYmplY3RzLiBBbGwgWE5vZGUgb2JqZWN0cyB3aWxsIGJlIGNoYW5nZWQgdG9cblx0ICogdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3RzLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmdcblx0ICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKG1ldGhvZE5hbWUpIHtcblx0XHR2YXIgb3JpZ2luYWxGdW5jdGlvbiA9IE5vZGUucHJvdG90eXBlW21ldGhvZE5hbWVdO1xuXG5cdFx0Tm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdGZvciAodmFyIGEgaW4gYXJndW1lbnRzKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbYV0gaW5zdGFuY2VvZiBYTm9kZSlcblx0XHRcdFx0XHRhcmd1bWVudHNbYV0gPSBhcmd1bWVudHNbYV0ubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9yaWdpbmFsRnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHVwIHJlYWQgb25seSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0Y3JlYXRlWE5vZGVSZWFkT25seVByb3BlcnR5KFwic3R5bGVcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCByZWFkL3dyaXRlIHByb3BlcnRpZXMuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaW5uZXJIVE1MXCIpO1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaHJlZlwiKTtcblx0Y3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShcImlkXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgbWV0aG9kcyB0byBiZSByb3V0ZWQgdG8gdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcInJlbW92ZUNoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFkZEV2ZW50TGlzdGVuZXJcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIG1ldGhvZHMgb24gTm9kZS5wcm9wZXJ0eS5cblx0ICovXG5cdGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIoXCJyZW1vdmVDaGlsZFwiKTtcblxuXHQvKipcblx0ICogQ3JlYXRlIGV2ZW50IGxpc3RlbmVyIGFsaWFzZXMuXG5cdCAqL1xuXHRYTm9kZS5wcm90b3R5cGUub24gPSBYTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0WE5vZGUucHJvdG90eXBlLm9mZiA9IFhOb2RlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBXb3JrIGJvdGggYXMgYSBucG0gbW9kdWxlIGFuZCBzdGFuZGFsb25lLlxuXHQgKi9cblx0dmFyIHRhcmdldDtcblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdHRhcmdldCA9IHt9O1xuXHRcdG1vZHVsZS5leHBvcnRzID0gdGFyZ2V0O1xuXHR9IGVsc2Uge1xuXHRcdHhub2RlID0ge307XG5cdFx0dGFyZ2V0ID0geG5vZGU7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGV4dGVuZGVkIGNsYXNzZXMuXG5cdCAqL1xuXHR0YXJnZXQuRGl2ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRhcmdldC5CdXR0b24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImJ1dHRvblwiKTtcblx0dGFyZ2V0LlVsID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJ1bFwiKTtcblx0dGFyZ2V0LkxpID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJsaVwiKTtcblx0dGFyZ2V0LkEgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImFcIik7XG59KSgpOyIsInZhciB4bm9kZSA9IHJlcXVpcmUoXCJ4bm9kZVwiKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoXCJpbmhlcml0c1wiKTtcbnZhciB4bm9kZXVpID0ge307XG5cbi8qKlxuICogQ3JlYXRlIGEgY2xhc3MgdGhhdCBleHRlbmRzIGEganF1ZXJ5IHVpIHdpZGdldC5cbiAqIEBtZXRob2QgY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudFxuICovXG5mdW5jdGlvbiBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KGpxdWVyeXVpVHlwZSwgYmFzZUNsYXNzKSB7XG5cdGlmICghYmFzZUNsYXNzKVxuXHRcdGJhc2VDbGFzcyA9IHhub2RlLkRpdjtcblxuXHRmdW5jdGlvbiBjbHMoKSB7XG5cdFx0YmFzZUNsYXNzLmNhbGwodGhpcyk7XG5cblx0XHRzd2l0Y2ggKGpxdWVyeXVpVHlwZSkge1xuXHRcdFx0Y2FzZSBcInRhYnNcIjpcblx0XHRcdFx0dGhpcy51bCA9IG5ldyB4bm9kZS5VbCgpO1xuXHRcdFx0XHR0aGlzLmFwcGVuZENoaWxkKHRoaXMudWwpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHR0aGlzLmpxdWVyeXVpVHlwZSA9IGpxdWVyeXVpVHlwZTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQgPSAkKHRoaXMubm9kZSk7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXSgpO1xuXHR9XG5cblx0aW5oZXJpdHMoY2xzLCBiYXNlQ2xhc3MpO1xuXG5cdGNscy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUsIGYpIHtcblx0XHR4bm9kZS5EaXYucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIuY2FsbCh0aGlzLCBlLCBmKTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQub24oZSwgZik7XG5cdH1cblxuXHRjbHMucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlLCBmKSB7XG5cdFx0eG5vZGUuRGl2LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyLmNhbGwodGhpcywgZSwgZik7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50Lm9mZihlLCBmKTtcblx0fVxuXG5cdGNscy5wcm90b3R5cGUub24gPSBjbHMucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdGNscy5wcm90b3R5cGUub2ZmID0gY2xzLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdHJldHVybiBjbHM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcHJvcGVydHkgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJUHJvcGVydHlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSVByb3BlcnR5KGNscywgcHJvdG90eXBlTmFtZSkge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xzLnByb3RvdHlwZSwgcHJvdG90eXBlTmFtZSwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShcIm9wdGlvblwiLCBwcm90b3R5cGVOYW1lKVxuXHRcdH0sXG5cblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKFwib3B0aW9uXCIsIHByb3RvdHlwZU5hbWUsIHZhbHVlKVxuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIHNldmVyYWwgcHJvcHJ0aWVzIG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSVByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoY2xzLCBwcm9wcnR5TmFtZXMpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcnR5TmFtZXMubGVuZ3RoOyBpKyspXG5cdFx0Y3JlYXRlWE5vZGVVSVByb3BlcnR5KGNscywgcHJvcHJ0eU5hbWVzW2ldKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBtZXRob2Qgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJTWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhOb2RlVUlNZXRob2QoY2xzLCBtZXRob2ROYW1lKSB7XG5cdGNscy5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSk7XG5cblx0XHRlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpXG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShtZXRob2ROYW1lLCBhcmd1bWVudHNbMF0pO1xuXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuXG5cdFx0ZWxzZVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidGhhdCBtYW55IGFyZ3VtZW50cz9cIik7XG5cdH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBtZXRob2Qgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJTWV0aG9kc1xuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJTWV0aG9kcyhjbHMsIG1ldGhvZE5hbWVzKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbWV0aG9kTmFtZXMubGVuZ3RoOyBpKyspXG5cdFx0Y3JlYXRlWE5vZGVVSU1ldGhvZChjbHMsIG1ldGhvZE5hbWVzW2ldKTtcbn1cblxuLyoqXG4gKiBBY2NvcmRpb24gY2xhc3MuXG4gKiBAY2xhc3MgQWNjb3JkaW9uXG4gKi9cbnhub2RldWkuQWNjb3JkaW9uID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImFjY29yZGlvblwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImFjdGl2ZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkFjY29yZGlvbiwgXCJhbmltYXRlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImNvbGxhcHNpYmxlXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImRpc2FibGVkXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImV2ZW50XCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQWNjb3JkaW9uLCBcImhlYWRlclwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkFjY29yZGlvbiwgXCJoZWlnaHRTdHlsZVwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkFjY29yZGlvbiwgXCJpY29uc1wiKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJkZXN0cm95XCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJkaXNhYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJlbmFibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQWNjb3JkaW9uLCBcImluc3RhbmNlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkFjY29yZGlvbiwgXCJvcHRpb25cIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQWNjb3JkaW9uLCBcInJlZnJlc2hcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQWNjb3JkaW9uLCBcIndpZGdldFwiKVxuXG4vKipcbiAqIEF1dG9jb21wbGV0ZSBjbGFzcy5cbiAqIEBjbGFzcyBBdXRvY29tcGxldGVcbiAqL1xueG5vZGV1aS5BdXRvY29tcGxldGUgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiYXV0b2NvbXBsZXRlXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiYXBwZW5kVG9cIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiYXV0b0ZvY3VzXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQXV0b2NvbXBsZXRlLCBcImRlbGF5XCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQXV0b2NvbXBsZXRlLCBcImRpc2FibGVkXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQXV0b2NvbXBsZXRlLCBcIm1pbkxlbmd0aFwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJwb3NpdGlvblwiKTtcbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0eSh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJzb3VyY2VcIik7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiY2xvc2VcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQXV0b2NvbXBsZXRlLCBcImRlc3Ryb3lcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQXV0b2NvbXBsZXRlLCBcImRpc2FibGVcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQXV0b2NvbXBsZXRlLCBcImVuYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiaW5zdGFuY2VcIik7XG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQXV0b2NvbXBsZXRlLCBcIm9wdGlvblwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwic2VhcmNoXCIpXG5jcmVhdGVYTm9kZVVJTWV0aG9kKHhub2RldWkuQXV0b2NvbXBsZXRlLCBcIndpZGdldFwiKVxuXG4vKipcbiAqIEJ1dHRvbiBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLkJ1dHRvblxuICovXG54bm9kZXVpLkJ1dHRvbiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJidXR0b25cIiwgeG5vZGUuQnV0dG9uKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQnV0dG9uLCBcImRpc2FibGVkXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQnV0dG9uLCBcImljb25zXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQnV0dG9uLCBcImxhYmVsXCIpO1xuY3JlYXRlWE5vZGVVSVByb3BlcnR5KHhub2RldWkuQnV0dG9uLCBcInRleHRcIik7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwiZGVzdHJveVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwiZGlzYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwiZW5hYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJpbnN0YW5jZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5CdXR0b24sIFwib3B0aW9uXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJyZWZyZXNoXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkJ1dHRvbiwgXCJ3aWRnZXRcIik7XG5cbi8qKlxuICogQnV0dG9uc2V0IGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuQnV0dG9uc2V0XG4gKi9cbnhub2RldWkuQnV0dG9uc2V0ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImJ1dHRvbnNldFwiLCB4bm9kZS5EaXYpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b25zZXQsIFwiZGlzYWJsZWRcIik7XG5jcmVhdGVYTm9kZVVJUHJvcGVydHkoeG5vZGV1aS5CdXR0b25zZXQsIFwiaXRlbXNcIik7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiZGVzdHJveVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiZGlzYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiZW5hYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJpbnN0YW5jZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwib3B0aW9uXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJyZWZyZXNoXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJ3aWRnZXRcIik7XG5cbi8qKlxuICogQnV0dG9uc2V0IGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuQnV0dG9uc2V0XG4gKi9cbnhub2RldWkuQnV0dG9uc2V0ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImJ1dHRvbnNldFwiLCB4bm9kZS5EaXYpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkJ1dHRvbnNldCwgW1xuXHRcImRpc2FibGVkXCIsIFwiaXRlbXNcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiZGVzdHJveVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiZGlzYWJsZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwiZW5hYmxlXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJpbnN0YW5jZVwiKTtcbmNyZWF0ZVhOb2RlVUlNZXRob2QoeG5vZGV1aS5BdXRvY29tcGxldGUsIFwib3B0aW9uXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJyZWZyZXNoXCIpO1xuY3JlYXRlWE5vZGVVSU1ldGhvZCh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgXCJ3aWRnZXRcIik7XG5cbi8qKlxuICogU2xpZGVyIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuU2xpZGVyXG4gKi9cbnhub2RldWkuU2xpZGVyID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcInNsaWRlclwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5TbGlkZXIsIFtcblx0XCJhbmltYXRlXCIsIFwiZGlzYWJsZWRcIiwgXCJtYXhcIiwgXCJtaW5cIixcblx0XCJvcmllbnRhdGlvblwiLCBcInJhbmdlXCIsIFwic3RlcFwiLCBcInZhbHVlXCIsXG5cdFwidmFsdWVzXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLlNsaWRlciwgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiaW5zdGFuY2VcIixcblx0XCJvcHRpb25cIiwgXCJ3aWRnZXRcIiAvKiwgXCJ2YWx1ZVwiLCBcInZhbHVlc1wiICovXG5dKTtcblxuLyoqXG4gKiBUYWJzIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuVGFic1xuICovXG54bm9kZXVpLlRhYnMgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwidGFic1wiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5UYWJzLCBbXG5cdFwiYWN0aXZlXCIsIFwiY29sbGFwc2libGVcIiwgXCJkaXNhYmxlZFwiLCBcImV2ZW50XCIsXG5cdFwiaGVpZ2h0U3R5bGVcIiwgXCJoaWRlXCIsIFwic2hvd1wiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5UYWJzLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcImxvYWRcIiwgXCJvcHRpb25cIiwgXCJyZWZyZXNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHhub2RldWk7IiwidmFyIHhub2RlID0gcmVxdWlyZShcInhub2RlXCIpO1xudmFyIHhub2RldWkgPSByZXF1aXJlKFwiLi4vc3JjL3hub2RldWlcIik7XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbnNUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwiYnV0dG9uc1wiO1xuXG5cdHZhciBidXR0b24gPSBuZXcgeG5vZGV1aS5CdXR0b24oKTtcblx0YnV0dG9uLmxhYmVsID0gXCJUZXN0aW5nXCI7XG5cdHRhYi5hcHBlbmRDaGlsZChidXR0b24pO1xuXG5cdHZhciBkaXNhYmxlZCA9IG5ldyB4bm9kZXVpLkJ1dHRvbigpO1xuXHRkaXNhYmxlZC5sYWJlbCA9IFwiRGlzYWJsZWRcIjtcblx0ZGlzYWJsZWQuZGlzYWJsZSgpO1xuXHR0YWIuYXBwZW5kQ2hpbGQoZGlzYWJsZWQpO1xuXG5cdHJldHVybiB0YWI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNsaWRlcnNUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwic2xpZGVyc1wiO1xuXG5cdHZhciBzbGlkZXIgPSBuZXcgeG5vZGV1aS5TbGlkZXIoKTtcblxuXHR0YWIuYXBwZW5kQ2hpbGQoc2xpZGVyKTtcblxuXHRyZXR1cm4gdGFiO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBY2NvcmRpb25UYWIoKSB7XG5cdHZhciBhID0gbmV3IHhub2RldWkuQWNjb3JkaW9uKCk7XG5cdGEuaWQgPSBcImFjY29yZGlvblwiO1xuXG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcImhlbGxvXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwic29tZSBjb250ZW50Li4uPGJyLz5ibGFsYWJsXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG8gMlwiKSk7XG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcInNvbWUgbW9yZSBjb250ZW50Li4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5cIikpO1xuXG5cdGEuaGVpZ2h0U3R5bGUgPSBcImZpbGxcIjtcblx0YS5jb2xsYXBzaWJsZSA9IGZhbHNlO1xuXG5cdGEuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdGEuc3R5bGUudG9wID0gXCI0MHB4XCI7XG5cdGEuc3R5bGUuYm90dG9tID0gXCIxMHB4XCI7XG5cdGEuc3R5bGUubGVmdCA9IFwiMFwiO1xuXHRhLnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG5cblx0cmV0dXJuIGE7XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG5cdHZhciBkID0gbmV3IHhub2RlLkRpdigpO1xuXG5cdGQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdGQuc3R5bGUubGVmdCA9IFwiMTBweFwiO1xuXHRkLnN0eWxlLnJpZ2h0ID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUudG9wID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUuYm90dG9tID0gXCIxMHB4XCI7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZCk7XG5cblx0dmFyIHRhYnMgPSBuZXcgeG5vZGV1aS5UYWJzKCk7XG5cblx0dGFicy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0dGFicy5zdHlsZS50b3AgPSBcIjBcIjtcblx0dGFicy5zdHlsZS5ib3R0b20gPSBcIjBcIjtcblx0dGFicy5zdHlsZS5sZWZ0ID0gXCIwXCI7XG5cdHRhYnMuc3R5bGUucmlnaHQgPSBcIjBcIjtcblxuXHQvL3ZhciB1bD1uZXcgeG5vZGUuVWwoKTtcblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjYnV0dG9ucyc+PHNwYW4+QnV0dG9uczwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVCdXR0b25zVGFiKCkpO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI3NsaWRlcnMnPjxzcGFuPlNsaWRlcnM8L3NwYW4+PC9hPlwiKSk7XG5cdHRhYnMuYXBwZW5kQ2hpbGQoY3JlYXRlU2xpZGVyc1RhYigpKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNhY2NvcmRpb24nPjxzcGFuPkFjY29yZGlvbjwvc3Bhbj48L2E+XCIpKTtcblx0dmFyIGFjY29yZGlvbiA9IGNyZWF0ZUFjY29yZGlvblRhYigpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGFjY29yZGlvbik7XG5cblx0ZC5hcHBlbmRDaGlsZCh0YWJzKTtcblx0dGFicy5yZWZyZXNoKCk7XG5cdHRhYnMuYWN0aXZlID0gMDtcblxuXHRhY2NvcmRpb24ucmVmcmVzaCgpO1xuXG5cdCQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG5cdFx0Ly90YWJzLnJlZnJlc2goKTtcblx0XHRhY2NvcmRpb24ucmVmcmVzaCgpO1xuXHR9KTtcbn0pOyJdfQ==
