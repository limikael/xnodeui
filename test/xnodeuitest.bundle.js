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

/**
 * Menu class.
 * @class xnodeui.Menu
 */
xnodeui.Menu = createExtendedXNodeUIElement("menu", xnode.Ul);

createXNodeUIProperties(xnodeui.Menu, [
	"disabled", "icons", "items", "menus",
	"position", "role"
]);

createXNodeUIMethods(xnodeui.Menu, [
	"blur", "collapse", "collapseAll", "destroy",
	"disable", "enable", "expand", "focus",
	"instance", "isFirstItem", "isLastItem", "next",
	"nextPage", "option", "previous", "previousPage",
	"refresh", "select", "widget"
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

function createMenuTab() {
	var tab = new xnode.Div();
	tab.id = "menu";

	var menu = new xnodeui.Menu();
	menu.style.width="200px";

	menu.appendChild(new xnode.Li("hello"));
	menu.appendChild(new xnode.Li("hello 2"));
	menu.appendChild(new xnode.Li("hello 3"));
	menu.appendChild(new xnode.Li("hello 4"));

	var sub=new xnode.Li("has sub");
	menu.appendChild(sub);

	var subul=new xnode.Ul();
	subul.style.width="200px";
	sub.appendChild(subul);

	subul.appendChild(new xnode.Li("sub"));
	subul.appendChild(new xnode.Li("sub 2"));
	subul.appendChild(new xnode.Li("sub 3"));
	subul.appendChild(new xnode.Li("sub 4"));

	tab.appendChild(menu);

	menu.refresh();

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

	tabs.ul.appendChild(new xnode.Li("<a href='#menu'><span>Menu</span></a>"));
	tabs.appendChild(createMenuTab());

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIoZnVuY3Rpb24oKSB7XG5cdC8qKlxuXHQgKiBUaGUgYmFzaWMgeG5vZGUgY2xhc3MuXG5cdCAqIEl0IHNldHMgdGhlIHVuZGVybHlpbmcgbm9kZSBlbGVtZW50IGJ5IGNhbGxpbmdcblx0ICogZG9jdW1lbnQuY3JlYXRlRWxlbWVudFxuXHQgKi9cblx0ZnVuY3Rpb24gWE5vZGUodHlwZSwgY29udGVudCkge1xuXHRcdHRoaXMubm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG5cblx0XHRpZiAoY29udGVudCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0dGhpcy5ub2RlLmlubmVySFRNTCA9IGNvbnRlbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgY3JlYXRlcyBhbiBleHRlbmRlZCBjbGFzcyB1c2luZ1xuXHQgKiB0aGUgWE5vZGUgY2xhc3MgZGVmaW5lZCBhYm92ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KGVsZW1lbnRUeXBlLCBjb250ZW50KSB7XG5cdFx0dmFyIGYgPSBmdW5jdGlvbihjb250ZW50KSB7XG5cdFx0XHRYTm9kZS5jYWxsKHRoaXMsIGVsZW1lbnRUeXBlLCBjb250ZW50KTtcblx0XHR9O1xuXG5cdFx0Zi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFhOb2RlLnByb3RvdHlwZSk7XG5cdFx0Zi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBmO1xuXG5cdFx0cmV0dXJuIGY7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgcmVhZCBvbmx5IHByb3BlcnR5IHRoYXQgcmV0dXJucyB0aGVcblx0ICogdmFsdWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgb2YgdGhlXG5cdCAqIHVuZGVybHlpbmcgbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVYTm9kZVJlYWRPbmx5UHJvcGVydHkocHJvcGVydHlOYW1lKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFhOb2RlLnByb3RvdHlwZSwgcHJvcGVydHlOYW1lLCB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5ub2RlW3Byb3BlcnR5TmFtZV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgcmVhZCB3cml0ZSBwcm9wZXJ0eSB0aGF0IG9wZXJhdGVzIG9uXG5cdCAqIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IG9mIHRoZSB1bmRlcmx5aW5nXG5cdCAqIG5vZGUgb2JqZWN0LlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoWE5vZGUucHJvdG90eXBlLCBwcm9wZXJ0eU5hbWUsIHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm5vZGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdH0sXG5cblx0XHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdFx0dGhpcy5ub2RlW3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBtZXRob2QgdGhhdCByb3V0ZXMgdGhlIGNhbGwgdGhyb3VnaCwgZG93blxuXHQgKiB0byB0aGUgc2FtZSBtZXRob2Qgb24gdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVYTm9kZU1ldGhvZChtZXRob2ROYW1lKSB7XG5cdFx0WE5vZGUucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5ub2RlW21ldGhvZE5hbWVdLmFwcGx5KHRoaXMubm9kZSwgYXJndW1lbnRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW9kaWZ5IHRoZSBOb2RlLnByb3BlcnR5IGZ1bmN0aW9uLCBzbyB0aGF0IGl0IGFjY2VwdHNcblx0ICogWE5vZGUgb2JqZWN0cy4gQWxsIFhOb2RlIG9iamVjdHMgd2lsbCBiZSBjaGFuZ2VkIHRvXG5cdCAqIHRoZSB1bmRlcmx5aW5nIG5vZGUgb2JqZWN0cywgYW5kIHRoZSBjb3JyZXNwb25kaW5nXG5cdCAqIG1ldGhvZCB3aWxsIGJlIGNhbGxlZC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihtZXRob2ROYW1lKSB7XG5cdFx0dmFyIG9yaWdpbmFsRnVuY3Rpb24gPSBOb2RlLnByb3RvdHlwZVttZXRob2ROYW1lXTtcblxuXHRcdE5vZGUucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRmb3IgKHZhciBhIGluIGFyZ3VtZW50cykge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzW2FdIGluc3RhbmNlb2YgWE5vZGUpXG5cdFx0XHRcdFx0YXJndW1lbnRzW2FdID0gYXJndW1lbnRzW2FdLm5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvcmlnaW5hbEZ1bmN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB1cCByZWFkIG9ubHkgcHJvcGVydGllcy5cblx0ICovXG5cdGNyZWF0ZVhOb2RlUmVhZE9ubHlQcm9wZXJ0eShcInN0eWxlXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgcmVhZC93cml0ZSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0Y3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShcImlubmVySFRNTFwiKTtcblx0Y3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShcImhyZWZcIik7XG5cdGNyZWF0ZVhOb2RlUmVhZFdyaXRlUHJvcGVydHkoXCJpZFwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIG1ldGhvZHMgdG8gYmUgcm91dGVkIHRvIHRoZSB1bmRlcmx5aW5nIG5vZGUgb2JqZWN0LlxuXHQgKi9cblx0Y3JlYXRlWE5vZGVNZXRob2QoXCJhcHBlbmRDaGlsZFwiKTtcblx0Y3JlYXRlWE5vZGVNZXRob2QoXCJyZW1vdmVDaGlsZFwiKTtcblx0Y3JlYXRlWE5vZGVNZXRob2QoXCJhZGRFdmVudExpc3RlbmVyXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcInJlbW92ZUV2ZW50TGlzdGVuZXJcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCBtZXRob2RzIG9uIE5vZGUucHJvcGVydHkuXG5cdCAqL1xuXHRjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIoXCJhcHBlbmRDaGlsZFwiKTtcblx0Y3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKFwicmVtb3ZlQ2hpbGRcIik7XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBldmVudCBsaXN0ZW5lciBhbGlhc2VzLlxuXHQgKi9cblx0WE5vZGUucHJvdG90eXBlLm9uID0gWE5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFhOb2RlLnByb3RvdHlwZS5vZmYgPSBYTm9kZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuXHQvKipcblx0ICogV29yayBib3RoIGFzIGEgbnBtIG1vZHVsZSBhbmQgc3RhbmRhbG9uZS5cblx0ICovXG5cdHZhciB0YXJnZXQ7XG5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IHRhcmdldDtcblx0fSBlbHNlIHtcblx0XHR4bm9kZSA9IHt9O1xuXHRcdHRhcmdldCA9IHhub2RlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBleHRlbmRlZCBjbGFzc2VzLlxuXHQgKi9cblx0dGFyZ2V0LkRpdiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwiZGl2XCIpO1xuXHR0YXJnZXQuQnV0dG9uID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJidXR0b25cIik7XG5cdHRhcmdldC5VbCA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwidWxcIik7XG5cdHRhcmdldC5MaSA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwibGlcIik7XG5cdHRhcmdldC5BID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJhXCIpO1xufSkoKTsiLCJ2YXIgeG5vZGUgPSByZXF1aXJlKFwieG5vZGVcIik7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKFwiaW5oZXJpdHNcIik7XG52YXIgeG5vZGV1aSA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZSBhIGNsYXNzIHRoYXQgZXh0ZW5kcyBhIGpxdWVyeSB1aSB3aWRnZXQuXG4gKiBAbWV0aG9kIGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChqcXVlcnl1aVR5cGUsIGJhc2VDbGFzcykge1xuXHRpZiAoIWJhc2VDbGFzcylcblx0XHRiYXNlQ2xhc3MgPSB4bm9kZS5EaXY7XG5cblx0ZnVuY3Rpb24gY2xzKCkge1xuXHRcdGJhc2VDbGFzcy5jYWxsKHRoaXMpO1xuXG5cdFx0c3dpdGNoIChqcXVlcnl1aVR5cGUpIHtcblx0XHRcdGNhc2UgXCJ0YWJzXCI6XG5cdFx0XHRcdHRoaXMudWwgPSBuZXcgeG5vZGUuVWwoKTtcblx0XHRcdFx0dGhpcy5hcHBlbmRDaGlsZCh0aGlzLnVsKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0dGhpcy5qcXVlcnl1aVR5cGUgPSBqcXVlcnl1aVR5cGU7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50ID0gJCh0aGlzLm5vZGUpO1xuXHRcdHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0oKTtcblx0fVxuXG5cdGluaGVyaXRzKGNscywgYmFzZUNsYXNzKTtcblxuXHRjbHMucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlLCBmKSB7XG5cdFx0eG5vZGUuRGl2LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyLmNhbGwodGhpcywgZSwgZik7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50Lm9uKGUsIGYpO1xuXHR9XG5cblx0Y2xzLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSwgZikge1xuXHRcdHhub2RlLkRpdi5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lci5jYWxsKHRoaXMsIGUsIGYpO1xuXHRcdHRoaXMuanF1ZXJ5RWxlbWVudC5vZmYoZSwgZik7XG5cdH1cblxuXHRjbHMucHJvdG90eXBlLm9uID0gY2xzLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuXHRjbHMucHJvdG90eXBlLm9mZiA9IGNscy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuXHRyZXR1cm4gY2xzO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHByb3BlcnR5IG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSVByb3BlcnR5XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhOb2RlVUlQcm9wZXJ0eShjbHMsIHByb3RvdHlwZU5hbWUpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNscy5wcm90b3R5cGUsIHByb3RvdHlwZU5hbWUsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0oXCJvcHRpb25cIiwgcHJvdG90eXBlTmFtZSlcblx0XHR9LFxuXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShcIm9wdGlvblwiLCBwcm90b3R5cGVOYW1lLCB2YWx1ZSlcblx0XHR9XG5cdH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBzZXZlcmFsIHByb3BydGllcyBvbiBhbiBleHRlbmRlZCBqcXVlcnkgdWkgY2xhc3MuXG4gKiBAbWV0aG9kIGNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKGNscywgcHJvcHJ0eU5hbWVzKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHJ0eU5hbWVzLmxlbmd0aDsgaSsrKVxuXHRcdGNyZWF0ZVhOb2RlVUlQcm9wZXJ0eShjbHMsIHByb3BydHlOYW1lc1tpXSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbWV0aG9kIG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSU1ldGhvZFxuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJTWV0aG9kKGNscywgbWV0aG9kTmFtZSkge1xuXHRjbHMucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMClcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUpO1xuXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSwgYXJndW1lbnRzWzBdKTtcblxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMilcblx0XHRcdHJldHVybiB0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKG1ldGhvZE5hbWUsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcblxuXHRcdGVsc2Vcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInRoYXQgbWFueSBhcmd1bWVudHM/XCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbWV0aG9kIG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSU1ldGhvZHNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSU1ldGhvZHMoY2xzLCBtZXRob2ROYW1lcykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG1ldGhvZE5hbWVzLmxlbmd0aDsgaSsrKVxuXHRcdGNyZWF0ZVhOb2RlVUlNZXRob2QoY2xzLCBtZXRob2ROYW1lc1tpXSk7XG59XG5cbi8qKlxuICogQWNjb3JkaW9uIGNsYXNzLlxuICogQGNsYXNzIEFjY29yZGlvblxuICovXG54bm9kZXVpLkFjY29yZGlvbiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJhY2NvcmRpb25cIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuQWNjb3JkaW9uLCBbXG5cdFwiYWN0aXZlXCIsIFwiYW5pbWF0ZVwiLCBcImNvbGxhcHNpYmxlXCIsIFwiZGlzYWJsZWRcIixcblx0XCJldmVudFwiLCBcImhlYWRlclwiLCBcImhlaWdodFN0eWxlXCIsIFwiaWNvbnNcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuQWNjb3JkaW9uLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcIm9wdGlvblwiLCBcInJlZnJlc2hcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogQXV0b2NvbXBsZXRlIGNsYXNzLlxuICogQGNsYXNzIEF1dG9jb21wbGV0ZVxuICovXG54bm9kZXVpLkF1dG9jb21wbGV0ZSA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJhdXRvY29tcGxldGVcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuQXV0b2NvbXBsZXRlLCBbXG5cdFwiYXBwZW5kVG9cIiwgXCJhdXRvRm9jdXNcIiwgXCJkZWxheVwiLCBcImRpc2FibGVkXCIsXG5cdFwibWluTGVuZ3RoXCIsIFwicG9zaXRpb25cIiwgXCJzb3VyY2VcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuQXV0b2NvbXBsZXRlLCBbXG5cdFwiY2xvc2VcIiwgXCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLFxuXHRcImluc3RhbmNlXCIsIFwib3B0aW9uXCIsIFwic2VhcmNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIEJ1dHRvbiBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLkJ1dHRvblxuICovXG54bm9kZXVpLkJ1dHRvbiA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJidXR0b25cIiwgeG5vZGUuQnV0dG9uKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5CdXR0b24sIFtcblx0XCJkaXNhYmxlZFwiLCBcImljb25zXCIsIFwibGFiZWxcIiwgXCJ0ZXh0XCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLkJ1dHRvbiwgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiaW5zdGFuY2VcIixcblx0XCJvcHRpb25cIiwgXCJyZWZyZXNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIEJ1dHRvbnNldCBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLkJ1dHRvbnNldFxuICovXG54bm9kZXVpLkJ1dHRvbnNldCA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJidXR0b25zZXRcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuQnV0dG9uc2V0LCBbXG5cdFwiZGlzYWJsZWRcIiwgXCJpdGVtc1wiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5BdXRvY29tcGxldGUsIFtcblx0XCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImluc3RhbmNlXCIsXG5cdFwib3B0aW9uXCIsIFwicmVmcmVzaFwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBTbGlkZXIgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5TbGlkZXJcbiAqL1xueG5vZGV1aS5TbGlkZXIgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwic2xpZGVyXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLlNsaWRlciwgW1xuXHRcImFuaW1hdGVcIiwgXCJkaXNhYmxlZFwiLCBcIm1heFwiLCBcIm1pblwiLFxuXHRcIm9yaWVudGF0aW9uXCIsIFwicmFuZ2VcIiwgXCJzdGVwXCIsIFwidmFsdWVcIixcblx0XCJ2YWx1ZXNcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuU2xpZGVyLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcIm9wdGlvblwiLCBcIndpZGdldFwiIC8qLCBcInZhbHVlXCIsIFwidmFsdWVzXCIgKi9cbl0pO1xuXG4vKipcbiAqIFRhYnMgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5UYWJzXG4gKi9cbnhub2RldWkuVGFicyA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJ0YWJzXCIpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLlRhYnMsIFtcblx0XCJhY3RpdmVcIiwgXCJjb2xsYXBzaWJsZVwiLCBcImRpc2FibGVkXCIsIFwiZXZlbnRcIixcblx0XCJoZWlnaHRTdHlsZVwiLCBcImhpZGVcIiwgXCJzaG93XCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLlRhYnMsIFtcblx0XCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImluc3RhbmNlXCIsXG5cdFwibG9hZFwiLCBcIm9wdGlvblwiLCBcInJlZnJlc2hcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogRGF0ZXBpY2tlciBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLkRhdGVwaWNrZXJcbiAqL1xueG5vZGV1aS5EYXRlcGlja2VyID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImRhdGVwaWNrZXJcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuRGF0ZXBpY2tlciwgW1xuXHRcImFsdEZpZWxkXCIsIFwiYWx0Rm9ybWF0XCIsIFwiYXBwZW5kVGV4dFwiLCBcImF1dG9TaXplXCIsXG5cdFwiYmVmb3JlU2hvd1wiLCBcImJlZm9yZVNob3dEYXlcIiwgXCJidXR0b25JbWFnZVwiLCBcImJ1dHRvbkltYWdlT25seVwiLFxuXHRcImJ1dHRvblRleHRcIiwgXCJjYWxjdWxhdGVXZWVrXCIsIFwiY2hhbmdlTW9udGhcIiwgXCJjaGFuZ2VZZWFyXCIsXG5cdFwiY2xvc2VUZXh0XCIsIFwiY29uc3RyYWluSW5wdXRcIiwgXCJjdXJyZW50VGV4dFwiLCBcImRhdGVGb3JtYXRcIixcblx0XCJkYXlOYW1lc1wiLCBcImRheU5hbWVzTWluXCIsIFwiZGF5TmFtZXNTaG9ydFwiLCBcImRlZmF1bHREYXRlXCIsXG5cdFwiZHVyYXRpb25cIiwgXCJmaXJzdERheVwiLCBcImdvdG9DdXJyZW50XCIsIFwiaGlkZUlmTm9QcmV2TmV4dFwiLFxuXHRcImlzUlRMXCIsIFwibWF4RGF0ZVwiLCBcIm1pbkRhdGVcIiwgXCJtb250aE5hbWVzXCIsXG5cdFwibW9udGhOYW1lc1Nob3J0XCIsIFwibmF2aWdhdGlvbkFzRGF0ZUZvcm1hdFwiLCBcIm5leHRUZXh0XCIsXG5cdFwibnVtYmVyT2ZNb250aHNcIiwgXCJvbkNoYW5nZU1vbnRoWWVhclwiLFxuXHRcIm9uQ2xvc2VcIiwgXCJvblNlbGVjdFwiLCBcInByZXZUZXh0XCIsIFwic2VsZWN0T3RoZXJNb250aHNcIixcblx0XCJzaG9ydFllYXJDdXRvZmZcIiwgXCJzaG93QW5pbVwiLCBcInNob3dCdXR0b25QYW5lbFwiLCBcInNob3dDdXJyZW50QXRQb3NcIixcblx0XCJzaG93TW9udGhBZnRlclllYXJcIiwgXCJzaG93T25cIiwgXCJzaG93T3B0aW9uc1wiLCBcInNob3dPdGhlck1vbnRoc1wiLFxuXHRcInNob3dXZWVrXCIsIFwic3RlcE1vbnRoc1wiLCBcIndlZWtIZWFkZXJcIiwgXCJ5ZWFyUmFuZ2VcIixcblx0XCJ5ZWFyU3VmZml4XCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLkRhdGVwaWNrZXIsIFtcblx0XCJkZXN0cm95XCIsIFwiZGlhbG9nXCIsIFwiZ2V0RGF0ZVwiLCBcImhpZGVcIixcblx0XCJpc0Rpc2FibGVkXCIsIFwib3B0aW9uXCIsIFwicmVmcmVzaFwiLCBcInNldERhdGVcIixcblx0XCJzaG93XCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIERpYWxvZyBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLkRpYWxvZ1xuICovXG54bm9kZXVpLkRpYWxvZyA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJkaWFsb2dcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuRGlhbG9nLCBbXG5cdFwiYXBwZW5kVG9cIiwgXCJhdXRvT3BlblwiLCBcImJ1dHRvbnNcIiwgXCJjbG9zZU9uRXNjYXBlXCIsXG5cdFwiY2xvc2VUZXh0XCIsIFwiZGlhbG9nQ2xhc3NcIiwgXCJkcmFnZ2FibGVcIiwgXCJoZWlnaHRcIixcblx0XCJoaWRlXCIsIFwibWF4SGVpZ2h0XCIsIFwibWF4V2lkdGhcIiwgXCJtaW5IZWlnaHRcIixcblx0XCJtaW5XaWR0aFwiLCBcIm1vZGFsXCIsIFwicG9zaXRpb25cIiwgXCJyZXNpemFibGVcIixcblx0XCJzaG93XCIsIFwidGl0bGVcIiwgXCJ3aWR0aFwiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5EaWFsb2csIFtcblx0XCJjbG9zZVwiLCBcImRlc3Ryb3lcIiwgXCJpbnN0YW5jZVwiLCBcImlzT3BlblwiLFxuXHRcIm1vdmVUb1RvcFwiLCBcIm9wZW5cIiwgXCJvcHRpb25cIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogTWVudSBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLk1lbnVcbiAqL1xueG5vZGV1aS5NZW51ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcIm1lbnVcIiwgeG5vZGUuVWwpO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLk1lbnUsIFtcblx0XCJkaXNhYmxlZFwiLCBcImljb25zXCIsIFwiaXRlbXNcIiwgXCJtZW51c1wiLFxuXHRcInBvc2l0aW9uXCIsIFwicm9sZVwiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5NZW51LCBbXG5cdFwiYmx1clwiLCBcImNvbGxhcHNlXCIsIFwiY29sbGFwc2VBbGxcIiwgXCJkZXN0cm95XCIsXG5cdFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImV4cGFuZFwiLCBcImZvY3VzXCIsXG5cdFwiaW5zdGFuY2VcIiwgXCJpc0ZpcnN0SXRlbVwiLCBcImlzTGFzdEl0ZW1cIiwgXCJuZXh0XCIsXG5cdFwibmV4dFBhZ2VcIiwgXCJvcHRpb25cIiwgXCJwcmV2aW91c1wiLCBcInByZXZpb3VzUGFnZVwiLFxuXHRcInJlZnJlc2hcIiwgXCJzZWxlY3RcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbm1vZHVsZS5leHBvcnRzID0geG5vZGV1aTsiLCJ2YXIgeG5vZGUgPSByZXF1aXJlKFwieG5vZGVcIik7XG52YXIgeG5vZGV1aSA9IHJlcXVpcmUoXCIuLi9zcmMveG5vZGV1aVwiKTtcblxuZnVuY3Rpb24gY3JlYXRlQnV0dG9uc1RhYigpIHtcblx0dmFyIHRhYiA9IG5ldyB4bm9kZS5EaXYoKTtcblx0dGFiLmlkID0gXCJidXR0b25zXCI7XG5cblx0dmFyIGJ1dHRvbiA9IG5ldyB4bm9kZXVpLkJ1dHRvbigpO1xuXHRidXR0b24ubGFiZWwgPSBcIlRlc3RpbmdcIjtcblx0dGFiLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cblx0dmFyIGRpc2FibGVkID0gbmV3IHhub2RldWkuQnV0dG9uKCk7XG5cdGRpc2FibGVkLmxhYmVsID0gXCJEaXNhYmxlZFwiO1xuXHRkaXNhYmxlZC5kaXNhYmxlKCk7XG5cdHRhYi5hcHBlbmRDaGlsZChkaXNhYmxlZCk7XG5cblx0cmV0dXJuIHRhYjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2xpZGVyc1RhYigpIHtcblx0dmFyIHRhYiA9IG5ldyB4bm9kZS5EaXYoKTtcblx0dGFiLmlkID0gXCJzbGlkZXJzXCI7XG5cblx0dmFyIHNsaWRlciA9IG5ldyB4bm9kZXVpLlNsaWRlcigpO1xuXG5cdHRhYi5hcHBlbmRDaGlsZChzbGlkZXIpO1xuXG5cdHJldHVybiB0YWI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFjY29yZGlvblRhYigpIHtcblx0dmFyIGEgPSBuZXcgeG5vZGV1aS5BY2NvcmRpb24oKTtcblx0YS5pZCA9IFwiYWNjb3JkaW9uXCI7XG5cblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwiaGVsbG9cIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJzb21lIGNvbnRlbnQuLi48YnIvPmJsYWxhYmxcIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJoZWxsbyAyXCIpKTtcblx0YS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuRGl2KFwic29tZSBtb3JlIGNvbnRlbnQuLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPlwiKSk7XG5cblx0YS5oZWlnaHRTdHlsZSA9IFwiZmlsbFwiO1xuXHRhLmNvbGxhcHNpYmxlID0gZmFsc2U7XG5cblx0YS5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0YS5zdHlsZS50b3AgPSBcIjQwcHhcIjtcblx0YS5zdHlsZS5ib3R0b20gPSBcIjEwcHhcIjtcblx0YS5zdHlsZS5sZWZ0ID0gXCIwXCI7XG5cdGEuc3R5bGUucmlnaHQgPSBcIjBcIjtcblxuXHRyZXR1cm4gYTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGF0ZXBpY2tlclRhYigpIHtcblx0dmFyIHRhYiA9IG5ldyB4bm9kZS5EaXYoKTtcblx0dGFiLmlkID0gXCJkYXRlcGlja2VyXCI7XG5cblx0dmFyIGRhdGVwaWNrZXIgPSBuZXcgeG5vZGV1aS5EYXRlcGlja2VyKCk7XG5cblx0dGFiLmFwcGVuZENoaWxkKGRhdGVwaWNrZXIpO1xuXG5cdHJldHVybiB0YWI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURpYWxvZ1RhYigpIHtcblx0dmFyIHRhYiA9IG5ldyB4bm9kZS5EaXYoKTtcblx0dGFiLmlkID0gXCJkaWFsb2dcIjtcblxuXHR2YXIgZGlhbG9nID0gbmV3IHhub2RldWkuRGlhbG9nKCk7XG5cdGRpYWxvZy50aXRsZSA9IFwiSGVsbG8gV29ybGRcIjtcblx0ZGlhbG9nLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJoZWxsbyB3b3JsZFwiKSk7XG5cdGRpYWxvZy5tb2RhbCA9IHRydWU7XG5cdGRpYWxvZy5jbG9zZSgpO1xuXG5cdHZhciBidXR0b24gPSBuZXcgeG5vZGV1aS5CdXR0b24oKTtcblx0YnV0dG9uLmxhYmVsID0gXCJPcGVuIGRpYWxvZ1wiO1xuXHR0YWIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcblxuXHRidXR0b24ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcblx0XHRkaWFsb2cub3BlbigpO1xuXHR9KVxuXG5cdHJldHVybiB0YWI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1lbnVUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwibWVudVwiO1xuXG5cdHZhciBtZW51ID0gbmV3IHhub2RldWkuTWVudSgpO1xuXHRtZW51LnN0eWxlLndpZHRoPVwiMjAwcHhcIjtcblxuXHRtZW51LmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcImhlbGxvXCIpKTtcblx0bWVudS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJoZWxsbyAyXCIpKTtcblx0bWVudS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJoZWxsbyAzXCIpKTtcblx0bWVudS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJoZWxsbyA0XCIpKTtcblxuXHR2YXIgc3ViPW5ldyB4bm9kZS5MaShcImhhcyBzdWJcIik7XG5cdG1lbnUuYXBwZW5kQ2hpbGQoc3ViKTtcblxuXHR2YXIgc3VidWw9bmV3IHhub2RlLlVsKCk7XG5cdHN1YnVsLnN0eWxlLndpZHRoPVwiMjAwcHhcIjtcblx0c3ViLmFwcGVuZENoaWxkKHN1YnVsKTtcblxuXHRzdWJ1bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJzdWJcIikpO1xuXHRzdWJ1bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJzdWIgMlwiKSk7XG5cdHN1YnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcInN1YiAzXCIpKTtcblx0c3VidWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwic3ViIDRcIikpO1xuXG5cdHRhYi5hcHBlbmRDaGlsZChtZW51KTtcblxuXHRtZW51LnJlZnJlc2goKTtcblxuXHRyZXR1cm4gdGFiO1xufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuXHR2YXIgZCA9IG5ldyB4bm9kZS5EaXYoKTtcblxuXHRkLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHRkLnN0eWxlLmxlZnQgPSBcIjEwcHhcIjtcblx0ZC5zdHlsZS5yaWdodCA9IFwiMTBweFwiO1xuXHRkLnN0eWxlLnRvcCA9IFwiMTBweFwiO1xuXHRkLnN0eWxlLmJvdHRvbSA9IFwiMTBweFwiO1xuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGQpO1xuXG5cdHZhciB0YWJzID0gbmV3IHhub2RldWkuVGFicygpO1xuXG5cdHRhYnMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdHRhYnMuc3R5bGUudG9wID0gXCIwXCI7XG5cdHRhYnMuc3R5bGUuYm90dG9tID0gXCIwXCI7XG5cdHRhYnMuc3R5bGUubGVmdCA9IFwiMFwiO1xuXHR0YWJzLnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG5cblx0Ly92YXIgdWw9bmV3IHhub2RlLlVsKCk7XG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2J1dHRvbnMnPjxzcGFuPkJ1dHRvbnM8L3NwYW4+PC9hPlwiKSk7XG5cdHRhYnMuYXBwZW5kQ2hpbGQoY3JlYXRlQnV0dG9uc1RhYigpKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNzbGlkZXJzJz48c3Bhbj5TbGlkZXJzPC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZVNsaWRlcnNUYWIoKSk7XG5cblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjYWNjb3JkaW9uJz48c3Bhbj5BY2NvcmRpb248L3NwYW4+PC9hPlwiKSk7XG5cdHZhciBhY2NvcmRpb24gPSBjcmVhdGVBY2NvcmRpb25UYWIoKTtcblx0dGFicy5hcHBlbmRDaGlsZChhY2NvcmRpb24pO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2RhdGVwaWNrZXInPjxzcGFuPkRhdGVwaWNrZXI8L3NwYW4+PC9hPlwiKSk7XG5cdHRhYnMuYXBwZW5kQ2hpbGQoY3JlYXRlRGF0ZXBpY2tlclRhYigpKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNkaWFsb2cnPjxzcGFuPkRpYWxvZzwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVEaWFsb2dUYWIoKSk7XG5cblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjbWVudSc+PHNwYW4+TWVudTwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVNZW51VGFiKCkpO1xuXG5cdGQuYXBwZW5kQ2hpbGQodGFicyk7XG5cdHRhYnMucmVmcmVzaCgpO1xuXHR0YWJzLmFjdGl2ZSA9IDA7XG5cblx0YWNjb3JkaW9uLnJlZnJlc2goKTtcblxuXHQkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuXHRcdC8vdGFicy5yZWZyZXNoKCk7XG5cdFx0YWNjb3JkaW9uLnJlZnJlc2goKTtcblx0fSk7XG59KTsiXX0=
