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