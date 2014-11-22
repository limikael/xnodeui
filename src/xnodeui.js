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