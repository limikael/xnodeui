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

/**
 * Tabs class.
 * @class xnodeui.Tabs
 */
xnodeui.Tabs = createExtendedXNodeUIElement("tabs");

module.exports = xnodeui;