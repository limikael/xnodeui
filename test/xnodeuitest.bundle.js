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

createXNodeUIProperties(xnodeui.Accordion, [
	"active", "animate", "collapsible", "disabled",
	"event", "header", "heightStyle", "icons"
]);

createXNodeUIMethods(xnodeui.Accordion, [
	"destroy", "disable", "enable", "instance",
	"option", "refresh", "widget"
]);

/**
 * Autocomplete class.
 * @class Autocomplete
 */
xnodeui.Autocomplete = createExtendedXNodeUIElement("autocomplete");

createXNodeUIProperties(xnodeui.Autocomplete, [
	"appendTo", "autoFocus", "delay", "disabled",
	"minLength", "position", "source"
]);

createXNodeUIMethods(xnodeui.Autocomplete, [
	"close", "destroy", "disable", "enable",
	"instance", "option", "search", "widget"
]);

/**
 * Button class.
 * @class xnodeui.Button
 */
xnodeui.Button = createExtendedXNodeUIElement("button", xnode.Button);

createXNodeUIProperties(xnodeui.Button, [
	"disabled", "icons", "label", "text"
]);

createXNodeUIMethods(xnodeui.Button, [
	"destroy", "disable", "enable", "instance",
	"option", "refresh", "widget"
]);

/**
 * Buttonset class.
 * @class xnodeui.Buttonset
 */
xnodeui.Buttonset = createExtendedXNodeUIElement("buttonset");

createXNodeUIProperties(xnodeui.Buttonset, [
	"disabled", "items"
]);

createXNodeUIMethods(xnodeui.Autocomplete, [
	"destroy", "disable", "enable", "instance",
	"option", "refresh", "widget"
]);

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

/**
 * Datepicker class.
 * @class xnodeui.Datepicker
 */
xnodeui.Datepicker = createExtendedXNodeUIElement("datepicker");

createXNodeUIProperties(xnodeui.Datepicker, [
	"altField", "altFormat", "appendText", "autoSize",
	"beforeShow", "beforeShowDay", "buttonImage", "buttonImageOnly",
	"buttonText", "calculateWeek", "changeMonth", "changeYear",
	"closeText", "constrainInput", "currentText", "dateFormat",
	"dayNames", "dayNamesMin", "dayNamesShort", "defaultDate",
	"duration", "firstDay", "gotoCurrent", "hideIfNoPrevNext",
	"isRTL", "maxDate", "minDate", "monthNames",
	"monthNamesShort", "navigationAsDateFormat", "nextText",
	"numberOfMonths", "onChangeMonthYear",
	"onClose", "onSelect", "prevText", "selectOtherMonths",
	"shortYearCutoff", "showAnim", "showButtonPanel", "showCurrentAtPos",
	"showMonthAfterYear", "showOn", "showOptions", "showOtherMonths",
	"showWeek", "stepMonths", "weekHeader", "yearRange",
	"yearSuffix"
]);

createXNodeUIMethods(xnodeui.Datepicker, [
	"destroy", "dialog", "getDate", "hide",
	"isDisabled", "option", "refresh", "setDate",
	"show", "widget"
]);

/**
 * Dialog class.
 * @class xnodeui.Dialog
 */
xnodeui.Dialog = createExtendedXNodeUIElement("dialog");

createXNodeUIProperties(xnodeui.Dialog, [
	"appendTo", "autoOpen", "buttons", "closeOnEscape",
	"closeText", "dialogClass", "draggable", "height",
	"hide", "maxHeight", "maxWidth", "minHeight",
	"minWidth", "modal", "position", "resizable",
	"show", "title", "width"
]);

createXNodeUIMethods(xnodeui.Dialog, [
	"close", "destroy", "instance", "isOpen",
	"moveToTop", "open", "option", "widget"
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

function createDatepickerTab() {
	var tab = new xnode.Div();
	tab.id = "datepicker";

	var datepicker = new xnodeui.Datepicker();

	tab.appendChild(datepicker);

	return tab;
}

function createDialogTab() {
	var tab = new xnode.Div();
	tab.id = "dialog";

	var dialog = new xnodeui.Dialog();
	dialog.title = "Hello World";
	dialog.appendChild(new xnode.Div("hello world"));
	dialog.modal = true;
	dialog.close();

	var button = new xnodeui.Button();
	button.label = "Open dialog";
	tab.appendChild(button);

	button.on("click", function() {
		dialog.open();
	})

	return tab;

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

	tabs.ul.appendChild(new xnode.Li("<a href='#datepicker'><span>Datepicker</span></a>"));
	tabs.appendChild(createDatepickerTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#dialog'><span>Dialog</span></a>"));
	tabs.appendChild(createDialogTab());

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiKGZ1bmN0aW9uKCkge1xuXHQvKipcblx0ICogVGhlIGJhc2ljIHhub2RlIGNsYXNzLlxuXHQgKiBJdCBzZXRzIHRoZSB1bmRlcmx5aW5nIG5vZGUgZWxlbWVudCBieSBjYWxsaW5nXG5cdCAqIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRcblx0ICovXG5cdGZ1bmN0aW9uIFhOb2RlKHR5cGUsIGNvbnRlbnQpIHtcblx0XHR0aGlzLm5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuXG5cdFx0aWYgKGNvbnRlbnQgIT09IHVuZGVmaW5lZClcblx0XHRcdHRoaXMubm9kZS5pbm5lckhUTUwgPSBjb250ZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYW4gZXh0ZW5kZWQgY2xhc3MgdXNpbmdcblx0ICogdGhlIFhOb2RlIGNsYXNzIGRlZmluZWQgYWJvdmUuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChlbGVtZW50VHlwZSwgY29udGVudCkge1xuXHRcdHZhciBmID0gZnVuY3Rpb24oY29udGVudCkge1xuXHRcdFx0WE5vZGUuY2FsbCh0aGlzLCBlbGVtZW50VHlwZSwgY29udGVudCk7XG5cdFx0fTtcblxuXHRcdGYucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShYTm9kZS5wcm90b3R5cGUpO1xuXHRcdGYucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZjtcblxuXHRcdHJldHVybiBmO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIHJlYWQgb25seSBwcm9wZXJ0eSB0aGF0IHJldHVybnMgdGhlXG5cdCAqIHZhbHVlIG9mIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IG9mIHRoZVxuXHQgKiB1bmRlcmx5aW5nIG5vZGUgb2JqZWN0LlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlWE5vZGVSZWFkT25seVByb3BlcnR5KHByb3BlcnR5TmFtZSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShYTm9kZS5wcm90b3R5cGUsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIHJlYWQgd3JpdGUgcHJvcGVydHkgdGhhdCBvcGVyYXRlcyBvblxuXHQgKiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvZiB0aGUgdW5kZXJseWluZ1xuXHQgKiBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkocHJvcGVydHlOYW1lKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFhOb2RlLnByb3RvdHlwZSwgcHJvcGVydHlOYW1lLCB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5ub2RlW3Byb3BlcnR5TmFtZV07XG5cdFx0XHR9LFxuXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbWV0aG9kIHRoYXQgcm91dGVzIHRoZSBjYWxsIHRocm91Z2gsIGRvd25cblx0ICogdG8gdGhlIHNhbWUgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG5vZGUgb2JqZWN0LlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlWE5vZGVNZXRob2QobWV0aG9kTmFtZSkge1xuXHRcdFhOb2RlLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMubm9kZVttZXRob2ROYW1lXS5hcHBseSh0aGlzLm5vZGUsIGFyZ3VtZW50cyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmeSB0aGUgTm9kZS5wcm9wZXJ0eSBmdW5jdGlvbiwgc28gdGhhdCBpdCBhY2NlcHRzXG5cdCAqIFhOb2RlIG9iamVjdHMuIEFsbCBYTm9kZSBvYmplY3RzIHdpbGwgYmUgY2hhbmdlZCB0b1xuXHQgKiB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdHMsIGFuZCB0aGUgY29ycmVzcG9uZGluZ1xuXHQgKiBtZXRob2Qgd2lsbCBiZSBjYWxsZWQuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIobWV0aG9kTmFtZSkge1xuXHRcdHZhciBvcmlnaW5hbEZ1bmN0aW9uID0gTm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV07XG5cblx0XHROb2RlLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Zm9yICh2YXIgYSBpbiBhcmd1bWVudHMpIHtcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1thXSBpbnN0YW5jZW9mIFhOb2RlKVxuXHRcdFx0XHRcdGFyZ3VtZW50c1thXSA9IGFyZ3VtZW50c1thXS5ub2RlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb3JpZ2luYWxGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdXAgcmVhZCBvbmx5IHByb3BlcnRpZXMuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZVJlYWRPbmx5UHJvcGVydHkoXCJzdHlsZVwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIHJlYWQvd3JpdGUgcHJvcGVydGllcy5cblx0ICovXG5cdGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkoXCJpbm5lckhUTUxcIik7XG5cdGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkoXCJocmVmXCIpO1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaWRcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCBtZXRob2RzIHRvIGJlIHJvdXRlZCB0byB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwiYXBwZW5kQ2hpbGRcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwicmVtb3ZlQ2hpbGRcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwiYWRkRXZlbnRMaXN0ZW5lclwiKTtcblx0Y3JlYXRlWE5vZGVNZXRob2QoXCJyZW1vdmVFdmVudExpc3RlbmVyXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgbWV0aG9kcyBvbiBOb2RlLnByb3BlcnR5LlxuXHQgKi9cblx0Y3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKFwiYXBwZW5kQ2hpbGRcIik7XG5cdGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihcInJlbW92ZUNoaWxkXCIpO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgZXZlbnQgbGlzdGVuZXIgYWxpYXNlcy5cblx0ICovXG5cdFhOb2RlLnByb3RvdHlwZS5vbiA9IFhOb2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuXHRYTm9kZS5wcm90b3R5cGUub2ZmID0gWE5vZGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cblx0LyoqXG5cdCAqIFdvcmsgYm90aCBhcyBhIG5wbSBtb2R1bGUgYW5kIHN0YW5kYWxvbmUuXG5cdCAqL1xuXHR2YXIgdGFyZ2V0O1xuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSB0YXJnZXQ7XG5cdH0gZWxzZSB7XG5cdFx0eG5vZGUgPSB7fTtcblx0XHR0YXJnZXQgPSB4bm9kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgZXh0ZW5kZWQgY2xhc3Nlcy5cblx0ICovXG5cdHRhcmdldC5EaXYgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImRpdlwiKTtcblx0dGFyZ2V0LkJ1dHRvbiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuXHR0YXJnZXQuVWwgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcInVsXCIpO1xuXHR0YXJnZXQuTGkgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImxpXCIpO1xuXHR0YXJnZXQuQSA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwiYVwiKTtcbn0pKCk7IiwidmFyIHhub2RlID0gcmVxdWlyZShcInhub2RlXCIpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZShcImluaGVyaXRzXCIpO1xudmFyIHhub2RldWkgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGUgYSBjbGFzcyB0aGF0IGV4dGVuZHMgYSBqcXVlcnkgdWkgd2lkZ2V0LlxuICogQG1ldGhvZCBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoanF1ZXJ5dWlUeXBlLCBiYXNlQ2xhc3MpIHtcblx0aWYgKCFiYXNlQ2xhc3MpXG5cdFx0YmFzZUNsYXNzID0geG5vZGUuRGl2O1xuXG5cdGZ1bmN0aW9uIGNscygpIHtcblx0XHRiYXNlQ2xhc3MuY2FsbCh0aGlzKTtcblxuXHRcdHN3aXRjaCAoanF1ZXJ5dWlUeXBlKSB7XG5cdFx0XHRjYXNlIFwidGFic1wiOlxuXHRcdFx0XHR0aGlzLnVsID0gbmV3IHhub2RlLlVsKCk7XG5cdFx0XHRcdHRoaXMuYXBwZW5kQ2hpbGQodGhpcy51bCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHRoaXMuanF1ZXJ5dWlUeXBlID0ganF1ZXJ5dWlUeXBlO1xuXHRcdHRoaXMuanF1ZXJ5RWxlbWVudCA9ICQodGhpcy5ub2RlKTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKCk7XG5cdH1cblxuXHRpbmhlcml0cyhjbHMsIGJhc2VDbGFzcyk7XG5cblx0Y2xzLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSwgZikge1xuXHRcdHhub2RlLkRpdi5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lci5jYWxsKHRoaXMsIGUsIGYpO1xuXHRcdHRoaXMuanF1ZXJ5RWxlbWVudC5vbihlLCBmKTtcblx0fVxuXG5cdGNscy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUsIGYpIHtcblx0XHR4bm9kZS5EaXYucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIuY2FsbCh0aGlzLCBlLCBmKTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQub2ZmKGUsIGYpO1xuXHR9XG5cblx0Y2xzLnByb3RvdHlwZS5vbiA9IGNscy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0Y2xzLnByb3RvdHlwZS5vZmYgPSBjbHMucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cblx0cmV0dXJuIGNscztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwcm9wZXJ0eSBvbiBhbiBleHRlbmRlZCBqcXVlcnkgdWkgY2xhc3MuXG4gKiBAbWV0aG9kIGNyZWF0ZVhOb2RlVUlQcm9wZXJ0eVxuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJUHJvcGVydHkoY2xzLCBwcm90b3R5cGVOYW1lKSB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbHMucHJvdG90eXBlLCBwcm90b3R5cGVOYW1lLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKFwib3B0aW9uXCIsIHByb3RvdHlwZU5hbWUpXG5cdFx0fSxcblxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0oXCJvcHRpb25cIiwgcHJvdG90eXBlTmFtZSwgdmFsdWUpXG5cdFx0fVxuXHR9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgc2V2ZXJhbCBwcm9wcnRpZXMgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJUHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJUHJvcGVydGllcyhjbHMsIHByb3BydHlOYW1lcykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHByb3BydHlOYW1lcy5sZW5ndGg7IGkrKylcblx0XHRjcmVhdGVYTm9kZVVJUHJvcGVydHkoY2xzLCBwcm9wcnR5TmFtZXNbaV0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1ldGhvZCBvbiBhbiBleHRlbmRlZCBqcXVlcnkgdWkgY2xhc3MuXG4gKiBAbWV0aG9kIGNyZWF0ZVhOb2RlVUlNZXRob2RcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSU1ldGhvZChjbHMsIG1ldGhvZE5hbWUpIHtcblx0Y2xzLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApXG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShtZXRob2ROYW1lKTtcblxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSlcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUsIGFyZ3VtZW50c1swXSk7XG5cblx0XHRlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpXG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShtZXRob2ROYW1lLCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG5cblx0XHRlbHNlXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ0aGF0IG1hbnkgYXJndW1lbnRzP1wiKTtcblx0fVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1ldGhvZCBvbiBhbiBleHRlbmRlZCBqcXVlcnkgdWkgY2xhc3MuXG4gKiBAbWV0aG9kIGNyZWF0ZVhOb2RlVUlNZXRob2RzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhOb2RlVUlNZXRob2RzKGNscywgbWV0aG9kTmFtZXMpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtZXRob2ROYW1lcy5sZW5ndGg7IGkrKylcblx0XHRjcmVhdGVYTm9kZVVJTWV0aG9kKGNscywgbWV0aG9kTmFtZXNbaV0pO1xufVxuXG4vKipcbiAqIEFjY29yZGlvbiBjbGFzcy5cbiAqIEBjbGFzcyBBY2NvcmRpb25cbiAqL1xueG5vZGV1aS5BY2NvcmRpb24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiYWNjb3JkaW9uXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkFjY29yZGlvbiwgW1xuXHRcImFjdGl2ZVwiLCBcImFuaW1hdGVcIiwgXCJjb2xsYXBzaWJsZVwiLCBcImRpc2FibGVkXCIsXG5cdFwiZXZlbnRcIiwgXCJoZWFkZXJcIiwgXCJoZWlnaHRTdHlsZVwiLCBcImljb25zXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLkFjY29yZGlvbiwgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiaW5zdGFuY2VcIixcblx0XCJvcHRpb25cIiwgXCJyZWZyZXNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIEF1dG9jb21wbGV0ZSBjbGFzcy5cbiAqIEBjbGFzcyBBdXRvY29tcGxldGVcbiAqL1xueG5vZGV1aS5BdXRvY29tcGxldGUgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiYXV0b2NvbXBsZXRlXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgW1xuXHRcImFwcGVuZFRvXCIsIFwiYXV0b0ZvY3VzXCIsIFwiZGVsYXlcIiwgXCJkaXNhYmxlZFwiLFxuXHRcIm1pbkxlbmd0aFwiLCBcInBvc2l0aW9uXCIsIFwic291cmNlXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgW1xuXHRcImNsb3NlXCIsIFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIixcblx0XCJpbnN0YW5jZVwiLCBcIm9wdGlvblwiLCBcInNlYXJjaFwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBCdXR0b24gY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5CdXR0b25cbiAqL1xueG5vZGV1aS5CdXR0b24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiYnV0dG9uXCIsIHhub2RlLkJ1dHRvbik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuQnV0dG9uLCBbXG5cdFwiZGlzYWJsZWRcIiwgXCJpY29uc1wiLCBcImxhYmVsXCIsIFwidGV4dFwiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5CdXR0b24sIFtcblx0XCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImluc3RhbmNlXCIsXG5cdFwib3B0aW9uXCIsIFwicmVmcmVzaFwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBCdXR0b25zZXQgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5CdXR0b25zZXRcbiAqL1xueG5vZGV1aS5CdXR0b25zZXQgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiYnV0dG9uc2V0XCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkJ1dHRvbnNldCwgW1xuXHRcImRpc2FibGVkXCIsIFwiaXRlbXNcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuQXV0b2NvbXBsZXRlLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcIm9wdGlvblwiLCBcInJlZnJlc2hcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogU2xpZGVyIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuU2xpZGVyXG4gKi9cbnhub2RldWkuU2xpZGVyID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcInNsaWRlclwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5TbGlkZXIsIFtcblx0XCJhbmltYXRlXCIsIFwiZGlzYWJsZWRcIiwgXCJtYXhcIiwgXCJtaW5cIixcblx0XCJvcmllbnRhdGlvblwiLCBcInJhbmdlXCIsIFwic3RlcFwiLCBcInZhbHVlXCIsXG5cdFwidmFsdWVzXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLlNsaWRlciwgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiaW5zdGFuY2VcIixcblx0XCJvcHRpb25cIiwgXCJ3aWRnZXRcIiAvKiwgXCJ2YWx1ZVwiLCBcInZhbHVlc1wiICovXG5dKTtcblxuLyoqXG4gKiBUYWJzIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuVGFic1xuICovXG54bm9kZXVpLlRhYnMgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwidGFic1wiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5UYWJzLCBbXG5cdFwiYWN0aXZlXCIsIFwiY29sbGFwc2libGVcIiwgXCJkaXNhYmxlZFwiLCBcImV2ZW50XCIsXG5cdFwiaGVpZ2h0U3R5bGVcIiwgXCJoaWRlXCIsIFwic2hvd1wiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5UYWJzLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcImxvYWRcIiwgXCJvcHRpb25cIiwgXCJyZWZyZXNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIERhdGVwaWNrZXIgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5EYXRlcGlja2VyXG4gKi9cbnhub2RldWkuRGF0ZXBpY2tlciA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJkYXRlcGlja2VyXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkRhdGVwaWNrZXIsIFtcblx0XCJhbHRGaWVsZFwiLCBcImFsdEZvcm1hdFwiLCBcImFwcGVuZFRleHRcIiwgXCJhdXRvU2l6ZVwiLFxuXHRcImJlZm9yZVNob3dcIiwgXCJiZWZvcmVTaG93RGF5XCIsIFwiYnV0dG9uSW1hZ2VcIiwgXCJidXR0b25JbWFnZU9ubHlcIixcblx0XCJidXR0b25UZXh0XCIsIFwiY2FsY3VsYXRlV2Vla1wiLCBcImNoYW5nZU1vbnRoXCIsIFwiY2hhbmdlWWVhclwiLFxuXHRcImNsb3NlVGV4dFwiLCBcImNvbnN0cmFpbklucHV0XCIsIFwiY3VycmVudFRleHRcIiwgXCJkYXRlRm9ybWF0XCIsXG5cdFwiZGF5TmFtZXNcIiwgXCJkYXlOYW1lc01pblwiLCBcImRheU5hbWVzU2hvcnRcIiwgXCJkZWZhdWx0RGF0ZVwiLFxuXHRcImR1cmF0aW9uXCIsIFwiZmlyc3REYXlcIiwgXCJnb3RvQ3VycmVudFwiLCBcImhpZGVJZk5vUHJldk5leHRcIixcblx0XCJpc1JUTFwiLCBcIm1heERhdGVcIiwgXCJtaW5EYXRlXCIsIFwibW9udGhOYW1lc1wiLFxuXHRcIm1vbnRoTmFtZXNTaG9ydFwiLCBcIm5hdmlnYXRpb25Bc0RhdGVGb3JtYXRcIiwgXCJuZXh0VGV4dFwiLFxuXHRcIm51bWJlck9mTW9udGhzXCIsIFwib25DaGFuZ2VNb250aFllYXJcIixcblx0XCJvbkNsb3NlXCIsIFwib25TZWxlY3RcIiwgXCJwcmV2VGV4dFwiLCBcInNlbGVjdE90aGVyTW9udGhzXCIsXG5cdFwic2hvcnRZZWFyQ3V0b2ZmXCIsIFwic2hvd0FuaW1cIiwgXCJzaG93QnV0dG9uUGFuZWxcIiwgXCJzaG93Q3VycmVudEF0UG9zXCIsXG5cdFwic2hvd01vbnRoQWZ0ZXJZZWFyXCIsIFwic2hvd09uXCIsIFwic2hvd09wdGlvbnNcIiwgXCJzaG93T3RoZXJNb250aHNcIixcblx0XCJzaG93V2Vla1wiLCBcInN0ZXBNb250aHNcIiwgXCJ3ZWVrSGVhZGVyXCIsIFwieWVhclJhbmdlXCIsXG5cdFwieWVhclN1ZmZpeFwiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5EYXRlcGlja2VyLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpYWxvZ1wiLCBcImdldERhdGVcIiwgXCJoaWRlXCIsXG5cdFwiaXNEaXNhYmxlZFwiLCBcIm9wdGlvblwiLCBcInJlZnJlc2hcIiwgXCJzZXREYXRlXCIsXG5cdFwic2hvd1wiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBEaWFsb2cgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5EaWFsb2dcbiAqL1xueG5vZGV1aS5EaWFsb2cgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiZGlhbG9nXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkRpYWxvZywgW1xuXHRcImFwcGVuZFRvXCIsIFwiYXV0b09wZW5cIiwgXCJidXR0b25zXCIsIFwiY2xvc2VPbkVzY2FwZVwiLFxuXHRcImNsb3NlVGV4dFwiLCBcImRpYWxvZ0NsYXNzXCIsIFwiZHJhZ2dhYmxlXCIsIFwiaGVpZ2h0XCIsXG5cdFwiaGlkZVwiLCBcIm1heEhlaWdodFwiLCBcIm1heFdpZHRoXCIsIFwibWluSGVpZ2h0XCIsXG5cdFwibWluV2lkdGhcIiwgXCJtb2RhbFwiLCBcInBvc2l0aW9uXCIsIFwicmVzaXphYmxlXCIsXG5cdFwic2hvd1wiLCBcInRpdGxlXCIsIFwid2lkdGhcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuRGlhbG9nLCBbXG5cdFwiY2xvc2VcIiwgXCJkZXN0cm95XCIsIFwiaW5zdGFuY2VcIiwgXCJpc09wZW5cIixcblx0XCJtb3ZlVG9Ub3BcIiwgXCJvcGVuXCIsIFwib3B0aW9uXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHhub2RldWk7IiwidmFyIHhub2RlID0gcmVxdWlyZShcInhub2RlXCIpO1xudmFyIHhub2RldWkgPSByZXF1aXJlKFwiLi4vc3JjL3hub2RldWlcIik7XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbnNUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwiYnV0dG9uc1wiO1xuXG5cdHZhciBidXR0b24gPSBuZXcgeG5vZGV1aS5CdXR0b24oKTtcblx0YnV0dG9uLmxhYmVsID0gXCJUZXN0aW5nXCI7XG5cdHRhYi5hcHBlbmRDaGlsZChidXR0b24pO1xuXG5cdHZhciBkaXNhYmxlZCA9IG5ldyB4bm9kZXVpLkJ1dHRvbigpO1xuXHRkaXNhYmxlZC5sYWJlbCA9IFwiRGlzYWJsZWRcIjtcblx0ZGlzYWJsZWQuZGlzYWJsZSgpO1xuXHR0YWIuYXBwZW5kQ2hpbGQoZGlzYWJsZWQpO1xuXG5cdHJldHVybiB0YWI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNsaWRlcnNUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwic2xpZGVyc1wiO1xuXG5cdHZhciBzbGlkZXIgPSBuZXcgeG5vZGV1aS5TbGlkZXIoKTtcblxuXHR0YWIuYXBwZW5kQ2hpbGQoc2xpZGVyKTtcblxuXHRyZXR1cm4gdGFiO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBY2NvcmRpb25UYWIoKSB7XG5cdHZhciBhID0gbmV3IHhub2RldWkuQWNjb3JkaW9uKCk7XG5cdGEuaWQgPSBcImFjY29yZGlvblwiO1xuXG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcImhlbGxvXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwic29tZSBjb250ZW50Li4uPGJyLz5ibGFsYWJsXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG8gMlwiKSk7XG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcInNvbWUgbW9yZSBjb250ZW50Li4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5cIikpO1xuXG5cdGEuaGVpZ2h0U3R5bGUgPSBcImZpbGxcIjtcblx0YS5jb2xsYXBzaWJsZSA9IGZhbHNlO1xuXG5cdGEuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdGEuc3R5bGUudG9wID0gXCI0MHB4XCI7XG5cdGEuc3R5bGUuYm90dG9tID0gXCIxMHB4XCI7XG5cdGEuc3R5bGUubGVmdCA9IFwiMFwiO1xuXHRhLnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG5cblx0cmV0dXJuIGE7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGVwaWNrZXJUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwiZGF0ZXBpY2tlclwiO1xuXG5cdHZhciBkYXRlcGlja2VyID0gbmV3IHhub2RldWkuRGF0ZXBpY2tlcigpO1xuXG5cdHRhYi5hcHBlbmRDaGlsZChkYXRlcGlja2VyKTtcblxuXHRyZXR1cm4gdGFiO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEaWFsb2dUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwiZGlhbG9nXCI7XG5cblx0dmFyIGRpYWxvZyA9IG5ldyB4bm9kZXVpLkRpYWxvZygpO1xuXHRkaWFsb2cudGl0bGUgPSBcIkhlbGxvIFdvcmxkXCI7XG5cdGRpYWxvZy5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG8gd29ybGRcIikpO1xuXHRkaWFsb2cubW9kYWwgPSB0cnVlO1xuXHRkaWFsb2cuY2xvc2UoKTtcblxuXHR2YXIgYnV0dG9uID0gbmV3IHhub2RldWkuQnV0dG9uKCk7XG5cdGJ1dHRvbi5sYWJlbCA9IFwiT3BlbiBkaWFsb2dcIjtcblx0dGFiLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cblx0YnV0dG9uLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0ZGlhbG9nLm9wZW4oKTtcblx0fSlcblxuXHRyZXR1cm4gdGFiO1xuXG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG5cdHZhciBkID0gbmV3IHhub2RlLkRpdigpO1xuXG5cdGQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdGQuc3R5bGUubGVmdCA9IFwiMTBweFwiO1xuXHRkLnN0eWxlLnJpZ2h0ID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUudG9wID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUuYm90dG9tID0gXCIxMHB4XCI7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZCk7XG5cblx0dmFyIHRhYnMgPSBuZXcgeG5vZGV1aS5UYWJzKCk7XG5cblx0dGFicy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0dGFicy5zdHlsZS50b3AgPSBcIjBcIjtcblx0dGFicy5zdHlsZS5ib3R0b20gPSBcIjBcIjtcblx0dGFicy5zdHlsZS5sZWZ0ID0gXCIwXCI7XG5cdHRhYnMuc3R5bGUucmlnaHQgPSBcIjBcIjtcblxuXHQvL3ZhciB1bD1uZXcgeG5vZGUuVWwoKTtcblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjYnV0dG9ucyc+PHNwYW4+QnV0dG9uczwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVCdXR0b25zVGFiKCkpO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI3NsaWRlcnMnPjxzcGFuPlNsaWRlcnM8L3NwYW4+PC9hPlwiKSk7XG5cdHRhYnMuYXBwZW5kQ2hpbGQoY3JlYXRlU2xpZGVyc1RhYigpKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNhY2NvcmRpb24nPjxzcGFuPkFjY29yZGlvbjwvc3Bhbj48L2E+XCIpKTtcblx0dmFyIGFjY29yZGlvbiA9IGNyZWF0ZUFjY29yZGlvblRhYigpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGFjY29yZGlvbik7XG5cblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjZGF0ZXBpY2tlcic+PHNwYW4+RGF0ZXBpY2tlcjwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVEYXRlcGlja2VyVGFiKCkpO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2RpYWxvZyc+PHNwYW4+RGlhbG9nPC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZURpYWxvZ1RhYigpKTtcblxuXHRkLmFwcGVuZENoaWxkKHRhYnMpO1xuXHR0YWJzLnJlZnJlc2goKTtcblx0dGFicy5hY3RpdmUgPSAwO1xuXG5cdGFjY29yZGlvbi5yZWZyZXNoKCk7XG5cblx0JCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcblx0XHQvL3RhYnMucmVmcmVzaCgpO1xuXHRcdGFjY29yZGlvbi5yZWZyZXNoKCk7XG5cdH0pO1xufSk7Il19
