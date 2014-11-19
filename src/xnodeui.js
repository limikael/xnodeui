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