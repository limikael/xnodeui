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
	target.Option = createExtendedXNodeElement("option");
	target.Select = createExtendedXNodeElement("select");
	target.Input = createExtendedXNodeElement("input");

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

/**
 * Progressbar class.
 * @class xnodeui.Progressbar
 */
xnodeui.Progressbar = createExtendedXNodeUIElement("progressbar");

createXNodeUIProperties(xnodeui.Progressbar, [
	"disabled", "max", "value"
]);

createXNodeUIMethods(xnodeui.Progressbar, [
	"destroy", "disable", "enable", "instance",
	"option", "widget" /*, "value"*/
]);

/**
 * Selectmenu class.
 * @class xnodeui.Selectmenu
 */
xnodeui.Selectmenu = createExtendedXNodeUIElement("selectmenu", xnode.Select);

createXNodeUIProperties(xnodeui.Selectmenu, [
	"appendTo", "disabled", "icons", "position",
	"width"
]);

createXNodeUIMethods(xnodeui.Selectmenu, [
	"close", "destroy", "disable", "enable",
	"instance", "menuWidget", "open", "option",
	"refresh", "widget"
]);

/**
 * Spinner class.
 * @class xnodeui.Spinner
 */
xnodeui.Spinner = createExtendedXNodeUIElement("spinner", xnode.Input);

createXNodeUIProperties(xnodeui.Spinner, [
	"culture", "disabled", "icons", "incremental",
	"max", "min", "numberFormat", "page",
	"step"
]);

createXNodeUIMethods(xnodeui.Spinner, [
	"destroy", "disable", "enable", "instance",
	"isValid", "option", "pageDown", "pageUp",
	"stepDown", "stepUp", "value", "widget"
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
	menu.style.width = "200px";

	menu.appendChild(new xnode.Li("hello"));
	menu.appendChild(new xnode.Li("hello 2"));
	menu.appendChild(new xnode.Li("hello 3"));
	menu.appendChild(new xnode.Li("hello 4"));

	var sub = new xnode.Li("has sub");
	menu.appendChild(sub);

	var subul = new xnode.Ul();
	subul.style.width = "200px";
	sub.appendChild(subul);

	subul.appendChild(new xnode.Li("sub"));
	subul.appendChild(new xnode.Li("sub 2"));
	subul.appendChild(new xnode.Li("sub 3"));
	subul.appendChild(new xnode.Li("sub 4"));

	tab.appendChild(menu);

	menu.refresh();

	return tab;
}

function createProgressbarTab() {
	var tab = new xnode.Div();
	tab.id = "progressbar";

	var progressbar = new xnodeui.Progressbar();

	progressbar.value = 50;
	progressbar.max = 100;

	tab.appendChild(progressbar);

	var inprogressbar = new xnodeui.Progressbar();

	inprogressbar.style.marginTop = "10px";
	inprogressbar.value = false;

	tab.appendChild(inprogressbar);

	return tab;
}

function createSelectmenuTab() {
	var tab = new xnode.Div();
	tab.id = "selectmenu";

	var selectmenu = new xnodeui.Selectmenu();

	selectmenu.style.width = "200px";

	selectmenu.appendChild(new xnode.Option("hello"));
	selectmenu.appendChild(new xnode.Option("world"));

	//selectmenu.open();

	tab.appendChild(selectmenu);

	selectmenu.style.display = "block";
	selectmenu.refresh();

	return tab;
}

function createSpinnerTab() {
	var tab = new xnode.Div();
	tab.id = "spinner";

	var spinner = new xnodeui.Spinner();

	tab.appendChild(spinner);

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

	tabs.ul.appendChild(new xnode.Li("<a href='#accordion'><span>Accordion</span></a>"));
	var accordion = createAccordionTab();
	tabs.appendChild(accordion);

	tabs.ul.appendChild(new xnode.Li("<a href='#buttons'><span>Buttons</span></a>"));
	tabs.appendChild(createButtonsTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#datepicker'><span>Datepicker</span></a>"));
	tabs.appendChild(createDatepickerTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#dialog'><span>Dialog</span></a>"));
	tabs.appendChild(createDialogTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#menu'><span>Menu</span></a>"));
	tabs.appendChild(createMenuTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#progressbar'><span>Progressbar</span></a>"));
	tabs.appendChild(createProgressbarTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#selectmenu'><span>Selectmenu</span></a>"));
	tabs.appendChild(createSelectmenuTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#sliders'><span>Sliders</span></a>"));
	tabs.appendChild(createSlidersTab());

	tabs.ul.appendChild(new xnode.Li("<a href='#spinner'><span>Spinner</span></a>"));
	tabs.appendChild(createSpinnerTab());

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy94bm9kZS9zcmMveG5vZGUuanMiLCJzcmMveG5vZGV1aS5qcyIsInRlc3QveG5vZGV1aXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIihmdW5jdGlvbigpIHtcblx0LyoqXG5cdCAqIFRoZSBiYXNpYyB4bm9kZSBjbGFzcy5cblx0ICogSXQgc2V0cyB0aGUgdW5kZXJseWluZyBub2RlIGVsZW1lbnQgYnkgY2FsbGluZ1xuXHQgKiBkb2N1bWVudC5jcmVhdGVFbGVtZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBYTm9kZSh0eXBlLCBjb250ZW50KSB7XG5cdFx0dGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuXHRcdGlmIChjb250ZW50ICE9PSB1bmRlZmluZWQpXG5cdFx0XHR0aGlzLm5vZGUuaW5uZXJIVE1MID0gY29udGVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGFuIGV4dGVuZGVkIGNsYXNzIHVzaW5nXG5cdCAqIHRoZSBYTm9kZSBjbGFzcyBkZWZpbmVkIGFib3ZlLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoZWxlbWVudFR5cGUsIGNvbnRlbnQpIHtcblx0XHR2YXIgZiA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcblx0XHRcdFhOb2RlLmNhbGwodGhpcywgZWxlbWVudFR5cGUsIGNvbnRlbnQpO1xuXHRcdH07XG5cblx0XHRmLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoWE5vZGUucHJvdG90eXBlKTtcblx0XHRmLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGY7XG5cblx0XHRyZXR1cm4gZjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIG9ubHkgcHJvcGVydHkgdGhhdCByZXR1cm5zIHRoZVxuXHQgKiB2YWx1ZSBvZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvZiB0aGVcblx0ICogdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlUmVhZE9ubHlQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoWE5vZGUucHJvdG90eXBlLCBwcm9wZXJ0eU5hbWUsIHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm5vZGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZWFkIHdyaXRlIHByb3BlcnR5IHRoYXQgb3BlcmF0ZXMgb25cblx0ICogdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgb2YgdGhlIHVuZGVybHlpbmdcblx0ICogbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KHByb3BlcnR5TmFtZSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShYTm9kZS5wcm90b3R5cGUsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubm9kZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHR0aGlzLm5vZGVbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG1ldGhvZCB0aGF0IHJvdXRlcyB0aGUgY2FsbCB0aHJvdWdoLCBkb3duXG5cdCAqIHRvIHRoZSBzYW1lIG1ldGhvZCBvbiB0aGUgdW5kZXJseWluZyBub2RlIG9iamVjdC5cblx0ICovXG5cdGZ1bmN0aW9uIGNyZWF0ZVhOb2RlTWV0aG9kKG1ldGhvZE5hbWUpIHtcblx0XHRYTm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLm5vZGVbbWV0aG9kTmFtZV0uYXBwbHkodGhpcy5ub2RlLCBhcmd1bWVudHMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZnkgdGhlIE5vZGUucHJvcGVydHkgZnVuY3Rpb24sIHNvIHRoYXQgaXQgYWNjZXB0c1xuXHQgKiBYTm9kZSBvYmplY3RzLiBBbGwgWE5vZGUgb2JqZWN0cyB3aWxsIGJlIGNoYW5nZWQgdG9cblx0ICogdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3RzLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmdcblx0ICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZVRvWE5vZGVNZXRob2RXcmFwcGVyKG1ldGhvZE5hbWUpIHtcblx0XHR2YXIgb3JpZ2luYWxGdW5jdGlvbiA9IE5vZGUucHJvdG90eXBlW21ldGhvZE5hbWVdO1xuXG5cdFx0Tm9kZS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdGZvciAodmFyIGEgaW4gYXJndW1lbnRzKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbYV0gaW5zdGFuY2VvZiBYTm9kZSlcblx0XHRcdFx0XHRhcmd1bWVudHNbYV0gPSBhcmd1bWVudHNbYV0ubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9yaWdpbmFsRnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHVwIHJlYWQgb25seSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0Y3JlYXRlWE5vZGVSZWFkT25seVByb3BlcnR5KFwic3R5bGVcIik7XG5cblx0LyoqXG5cdCAqIFNldCB1cCByZWFkL3dyaXRlIHByb3BlcnRpZXMuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaW5uZXJIVE1MXCIpO1xuXHRjcmVhdGVYTm9kZVJlYWRXcml0ZVByb3BlcnR5KFwiaHJlZlwiKTtcblx0Y3JlYXRlWE5vZGVSZWFkV3JpdGVQcm9wZXJ0eShcImlkXCIpO1xuXG5cdC8qKlxuXHQgKiBTZXQgdXAgbWV0aG9kcyB0byBiZSByb3V0ZWQgdG8gdGhlIHVuZGVybHlpbmcgbm9kZSBvYmplY3QuXG5cdCAqL1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcInJlbW92ZUNoaWxkXCIpO1xuXHRjcmVhdGVYTm9kZU1ldGhvZChcImFkZEV2ZW50TGlzdGVuZXJcIik7XG5cdGNyZWF0ZVhOb2RlTWV0aG9kKFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiKTtcblxuXHQvKipcblx0ICogU2V0IHVwIG1ldGhvZHMgb24gTm9kZS5wcm9wZXJ0eS5cblx0ICovXG5cdGNyZWF0ZU5vZGVUb1hOb2RlTWV0aG9kV3JhcHBlcihcImFwcGVuZENoaWxkXCIpO1xuXHRjcmVhdGVOb2RlVG9YTm9kZU1ldGhvZFdyYXBwZXIoXCJyZW1vdmVDaGlsZFwiKTtcblxuXHQvKipcblx0ICogQ3JlYXRlIGV2ZW50IGxpc3RlbmVyIGFsaWFzZXMuXG5cdCAqL1xuXHRYTm9kZS5wcm90b3R5cGUub24gPSBYTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0WE5vZGUucHJvdG90eXBlLm9mZiA9IFhOb2RlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBXb3JrIGJvdGggYXMgYSBucG0gbW9kdWxlIGFuZCBzdGFuZGFsb25lLlxuXHQgKi9cblx0dmFyIHRhcmdldDtcblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdHRhcmdldCA9IHt9O1xuXHRcdG1vZHVsZS5leHBvcnRzID0gdGFyZ2V0O1xuXHR9IGVsc2Uge1xuXHRcdHhub2RlID0ge307XG5cdFx0dGFyZ2V0ID0geG5vZGU7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGV4dGVuZGVkIGNsYXNzZXMuXG5cdCAqL1xuXHR0YXJnZXQuRGl2ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRhcmdldC5CdXR0b24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImJ1dHRvblwiKTtcblx0dGFyZ2V0LlVsID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJ1bFwiKTtcblx0dGFyZ2V0LkxpID0gY3JlYXRlRXh0ZW5kZWRYTm9kZUVsZW1lbnQoXCJsaVwiKTtcblx0dGFyZ2V0LkEgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImFcIik7XG5cdHRhcmdldC5PcHRpb24gPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcIm9wdGlvblwiKTtcblx0dGFyZ2V0LlNlbGVjdCA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVFbGVtZW50KFwic2VsZWN0XCIpO1xuXHR0YXJnZXQuSW5wdXQgPSBjcmVhdGVFeHRlbmRlZFhOb2RlRWxlbWVudChcImlucHV0XCIpO1xuXG59KSgpOyIsInZhciB4bm9kZSA9IHJlcXVpcmUoXCJ4bm9kZVwiKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoXCJpbmhlcml0c1wiKTtcbnZhciB4bm9kZXVpID0ge307XG5cbi8qKlxuICogQ3JlYXRlIGEgY2xhc3MgdGhhdCBleHRlbmRzIGEganF1ZXJ5IHVpIHdpZGdldC5cbiAqIEBtZXRob2QgY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudFxuICovXG5mdW5jdGlvbiBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KGpxdWVyeXVpVHlwZSwgYmFzZUNsYXNzKSB7XG5cdGlmICghYmFzZUNsYXNzKVxuXHRcdGJhc2VDbGFzcyA9IHhub2RlLkRpdjtcblxuXHRmdW5jdGlvbiBjbHMoKSB7XG5cdFx0YmFzZUNsYXNzLmNhbGwodGhpcyk7XG5cblx0XHRzd2l0Y2ggKGpxdWVyeXVpVHlwZSkge1xuXHRcdFx0Y2FzZSBcInRhYnNcIjpcblx0XHRcdFx0dGhpcy51bCA9IG5ldyB4bm9kZS5VbCgpO1xuXHRcdFx0XHR0aGlzLmFwcGVuZENoaWxkKHRoaXMudWwpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHR0aGlzLmpxdWVyeXVpVHlwZSA9IGpxdWVyeXVpVHlwZTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQgPSAkKHRoaXMubm9kZSk7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXSgpO1xuXHR9XG5cblx0aW5oZXJpdHMoY2xzLCBiYXNlQ2xhc3MpO1xuXG5cdGNscy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUsIGYpIHtcblx0XHR4bm9kZS5EaXYucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIuY2FsbCh0aGlzLCBlLCBmKTtcblx0XHR0aGlzLmpxdWVyeUVsZW1lbnQub24oZSwgZik7XG5cdH1cblxuXHRjbHMucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlLCBmKSB7XG5cdFx0eG5vZGUuRGl2LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyLmNhbGwodGhpcywgZSwgZik7XG5cdFx0dGhpcy5qcXVlcnlFbGVtZW50Lm9mZihlLCBmKTtcblx0fVxuXG5cdGNscy5wcm90b3R5cGUub24gPSBjbHMucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdGNscy5wcm90b3R5cGUub2ZmID0gY2xzLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG5cdHJldHVybiBjbHM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcHJvcGVydHkgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJUHJvcGVydHlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSVByb3BlcnR5KGNscywgcHJvdG90eXBlTmFtZSkge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xzLnByb3RvdHlwZSwgcHJvdG90eXBlTmFtZSwge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShcIm9wdGlvblwiLCBwcm90b3R5cGVOYW1lKVxuXHRcdH0sXG5cblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmpxdWVyeUVsZW1lbnRbdGhpcy5qcXVlcnl1aVR5cGVdKFwib3B0aW9uXCIsIHByb3RvdHlwZU5hbWUsIHZhbHVlKVxuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIHNldmVyYWwgcHJvcHJ0aWVzIG9uIGFuIGV4dGVuZGVkIGpxdWVyeSB1aSBjbGFzcy5cbiAqIEBtZXRob2QgY3JlYXRlWE5vZGVVSVByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoY2xzLCBwcm9wcnR5TmFtZXMpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcnR5TmFtZXMubGVuZ3RoOyBpKyspXG5cdFx0Y3JlYXRlWE5vZGVVSVByb3BlcnR5KGNscywgcHJvcHJ0eU5hbWVzW2ldKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBtZXRob2Qgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJTWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVhOb2RlVUlNZXRob2QoY2xzLCBtZXRob2ROYW1lKSB7XG5cdGNscy5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSk7XG5cblx0XHRlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpXG5cdFx0XHRyZXR1cm4gdGhpcy5qcXVlcnlFbGVtZW50W3RoaXMuanF1ZXJ5dWlUeXBlXShtZXRob2ROYW1lLCBhcmd1bWVudHNbMF0pO1xuXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKVxuXHRcdFx0cmV0dXJuIHRoaXMuanF1ZXJ5RWxlbWVudFt0aGlzLmpxdWVyeXVpVHlwZV0obWV0aG9kTmFtZSwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuXG5cdFx0ZWxzZVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidGhhdCBtYW55IGFyZ3VtZW50cz9cIik7XG5cdH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBtZXRob2Qgb24gYW4gZXh0ZW5kZWQganF1ZXJ5IHVpIGNsYXNzLlxuICogQG1ldGhvZCBjcmVhdGVYTm9kZVVJTWV0aG9kc1xuICovXG5mdW5jdGlvbiBjcmVhdGVYTm9kZVVJTWV0aG9kcyhjbHMsIG1ldGhvZE5hbWVzKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbWV0aG9kTmFtZXMubGVuZ3RoOyBpKyspXG5cdFx0Y3JlYXRlWE5vZGVVSU1ldGhvZChjbHMsIG1ldGhvZE5hbWVzW2ldKTtcbn1cblxuLyoqXG4gKiBBY2NvcmRpb24gY2xhc3MuXG4gKiBAY2xhc3MgQWNjb3JkaW9uXG4gKi9cbnhub2RldWkuQWNjb3JkaW9uID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImFjY29yZGlvblwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5BY2NvcmRpb24sIFtcblx0XCJhY3RpdmVcIiwgXCJhbmltYXRlXCIsIFwiY29sbGFwc2libGVcIiwgXCJkaXNhYmxlZFwiLFxuXHRcImV2ZW50XCIsIFwiaGVhZGVyXCIsIFwiaGVpZ2h0U3R5bGVcIiwgXCJpY29uc1wiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5BY2NvcmRpb24sIFtcblx0XCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImluc3RhbmNlXCIsXG5cdFwib3B0aW9uXCIsIFwicmVmcmVzaFwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBBdXRvY29tcGxldGUgY2xhc3MuXG4gKiBAY2xhc3MgQXV0b2NvbXBsZXRlXG4gKi9cbnhub2RldWkuQXV0b2NvbXBsZXRlID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImF1dG9jb21wbGV0ZVwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5BdXRvY29tcGxldGUsIFtcblx0XCJhcHBlbmRUb1wiLCBcImF1dG9Gb2N1c1wiLCBcImRlbGF5XCIsIFwiZGlzYWJsZWRcIixcblx0XCJtaW5MZW5ndGhcIiwgXCJwb3NpdGlvblwiLCBcInNvdXJjZVwiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5BdXRvY29tcGxldGUsIFtcblx0XCJjbG9zZVwiLCBcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsXG5cdFwiaW5zdGFuY2VcIiwgXCJvcHRpb25cIiwgXCJzZWFyY2hcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogQnV0dG9uIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuQnV0dG9uXG4gKi9cbnhub2RldWkuQnV0dG9uID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImJ1dHRvblwiLCB4bm9kZS5CdXR0b24pO1xuXG5jcmVhdGVYTm9kZVVJUHJvcGVydGllcyh4bm9kZXVpLkJ1dHRvbiwgW1xuXHRcImRpc2FibGVkXCIsIFwiaWNvbnNcIiwgXCJsYWJlbFwiLCBcInRleHRcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuQnV0dG9uLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcIm9wdGlvblwiLCBcInJlZnJlc2hcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogQnV0dG9uc2V0IGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuQnV0dG9uc2V0XG4gKi9cbnhub2RldWkuQnV0dG9uc2V0ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImJ1dHRvbnNldFwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5CdXR0b25zZXQsIFtcblx0XCJkaXNhYmxlZFwiLCBcIml0ZW1zXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLkF1dG9jb21wbGV0ZSwgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiaW5zdGFuY2VcIixcblx0XCJvcHRpb25cIiwgXCJyZWZyZXNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIFNsaWRlciBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLlNsaWRlclxuICovXG54bm9kZXVpLlNsaWRlciA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJzbGlkZXJcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuU2xpZGVyLCBbXG5cdFwiYW5pbWF0ZVwiLCBcImRpc2FibGVkXCIsIFwibWF4XCIsIFwibWluXCIsXG5cdFwib3JpZW50YXRpb25cIiwgXCJyYW5nZVwiLCBcInN0ZXBcIiwgXCJ2YWx1ZVwiLFxuXHRcInZhbHVlc1wiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5TbGlkZXIsIFtcblx0XCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImluc3RhbmNlXCIsXG5cdFwib3B0aW9uXCIsIFwid2lkZ2V0XCIgLyosIFwidmFsdWVcIiwgXCJ2YWx1ZXNcIiAqL1xuXSk7XG5cbi8qKlxuICogVGFicyBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLlRhYnNcbiAqL1xueG5vZGV1aS5UYWJzID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcInRhYnNcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuVGFicywgW1xuXHRcImFjdGl2ZVwiLCBcImNvbGxhcHNpYmxlXCIsIFwiZGlzYWJsZWRcIiwgXCJldmVudFwiLFxuXHRcImhlaWdodFN0eWxlXCIsIFwiaGlkZVwiLCBcInNob3dcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuVGFicywgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiaW5zdGFuY2VcIixcblx0XCJsb2FkXCIsIFwib3B0aW9uXCIsIFwicmVmcmVzaFwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBEYXRlcGlja2VyIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuRGF0ZXBpY2tlclxuICovXG54bm9kZXVpLkRhdGVwaWNrZXIgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwiZGF0ZXBpY2tlclwiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5EYXRlcGlja2VyLCBbXG5cdFwiYWx0RmllbGRcIiwgXCJhbHRGb3JtYXRcIiwgXCJhcHBlbmRUZXh0XCIsIFwiYXV0b1NpemVcIixcblx0XCJiZWZvcmVTaG93XCIsIFwiYmVmb3JlU2hvd0RheVwiLCBcImJ1dHRvbkltYWdlXCIsIFwiYnV0dG9uSW1hZ2VPbmx5XCIsXG5cdFwiYnV0dG9uVGV4dFwiLCBcImNhbGN1bGF0ZVdlZWtcIiwgXCJjaGFuZ2VNb250aFwiLCBcImNoYW5nZVllYXJcIixcblx0XCJjbG9zZVRleHRcIiwgXCJjb25zdHJhaW5JbnB1dFwiLCBcImN1cnJlbnRUZXh0XCIsIFwiZGF0ZUZvcm1hdFwiLFxuXHRcImRheU5hbWVzXCIsIFwiZGF5TmFtZXNNaW5cIiwgXCJkYXlOYW1lc1Nob3J0XCIsIFwiZGVmYXVsdERhdGVcIixcblx0XCJkdXJhdGlvblwiLCBcImZpcnN0RGF5XCIsIFwiZ290b0N1cnJlbnRcIiwgXCJoaWRlSWZOb1ByZXZOZXh0XCIsXG5cdFwiaXNSVExcIiwgXCJtYXhEYXRlXCIsIFwibWluRGF0ZVwiLCBcIm1vbnRoTmFtZXNcIixcblx0XCJtb250aE5hbWVzU2hvcnRcIiwgXCJuYXZpZ2F0aW9uQXNEYXRlRm9ybWF0XCIsIFwibmV4dFRleHRcIixcblx0XCJudW1iZXJPZk1vbnRoc1wiLCBcIm9uQ2hhbmdlTW9udGhZZWFyXCIsXG5cdFwib25DbG9zZVwiLCBcIm9uU2VsZWN0XCIsIFwicHJldlRleHRcIiwgXCJzZWxlY3RPdGhlck1vbnRoc1wiLFxuXHRcInNob3J0WWVhckN1dG9mZlwiLCBcInNob3dBbmltXCIsIFwic2hvd0J1dHRvblBhbmVsXCIsIFwic2hvd0N1cnJlbnRBdFBvc1wiLFxuXHRcInNob3dNb250aEFmdGVyWWVhclwiLCBcInNob3dPblwiLCBcInNob3dPcHRpb25zXCIsIFwic2hvd090aGVyTW9udGhzXCIsXG5cdFwic2hvd1dlZWtcIiwgXCJzdGVwTW9udGhzXCIsIFwid2Vla0hlYWRlclwiLCBcInllYXJSYW5nZVwiLFxuXHRcInllYXJTdWZmaXhcIlxuXSk7XG5cbmNyZWF0ZVhOb2RlVUlNZXRob2RzKHhub2RldWkuRGF0ZXBpY2tlciwgW1xuXHRcImRlc3Ryb3lcIiwgXCJkaWFsb2dcIiwgXCJnZXREYXRlXCIsIFwiaGlkZVwiLFxuXHRcImlzRGlzYWJsZWRcIiwgXCJvcHRpb25cIiwgXCJyZWZyZXNoXCIsIFwic2V0RGF0ZVwiLFxuXHRcInNob3dcIiwgXCJ3aWRnZXRcIlxuXSk7XG5cbi8qKlxuICogRGlhbG9nIGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuRGlhbG9nXG4gKi9cbnhub2RldWkuRGlhbG9nID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcImRpYWxvZ1wiKTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5EaWFsb2csIFtcblx0XCJhcHBlbmRUb1wiLCBcImF1dG9PcGVuXCIsIFwiYnV0dG9uc1wiLCBcImNsb3NlT25Fc2NhcGVcIixcblx0XCJjbG9zZVRleHRcIiwgXCJkaWFsb2dDbGFzc1wiLCBcImRyYWdnYWJsZVwiLCBcImhlaWdodFwiLFxuXHRcImhpZGVcIiwgXCJtYXhIZWlnaHRcIiwgXCJtYXhXaWR0aFwiLCBcIm1pbkhlaWdodFwiLFxuXHRcIm1pbldpZHRoXCIsIFwibW9kYWxcIiwgXCJwb3NpdGlvblwiLCBcInJlc2l6YWJsZVwiLFxuXHRcInNob3dcIiwgXCJ0aXRsZVwiLCBcIndpZHRoXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLkRpYWxvZywgW1xuXHRcImNsb3NlXCIsIFwiZGVzdHJveVwiLCBcImluc3RhbmNlXCIsIFwiaXNPcGVuXCIsXG5cdFwibW92ZVRvVG9wXCIsIFwib3BlblwiLCBcIm9wdGlvblwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBNZW51IGNsYXNzLlxuICogQGNsYXNzIHhub2RldWkuTWVudVxuICovXG54bm9kZXVpLk1lbnUgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwibWVudVwiLCB4bm9kZS5VbCk7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuTWVudSwgW1xuXHRcImRpc2FibGVkXCIsIFwiaWNvbnNcIiwgXCJpdGVtc1wiLCBcIm1lbnVzXCIsXG5cdFwicG9zaXRpb25cIiwgXCJyb2xlXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLk1lbnUsIFtcblx0XCJibHVyXCIsIFwiY29sbGFwc2VcIiwgXCJjb2xsYXBzZUFsbFwiLCBcImRlc3Ryb3lcIixcblx0XCJkaXNhYmxlXCIsIFwiZW5hYmxlXCIsIFwiZXhwYW5kXCIsIFwiZm9jdXNcIixcblx0XCJpbnN0YW5jZVwiLCBcImlzRmlyc3RJdGVtXCIsIFwiaXNMYXN0SXRlbVwiLCBcIm5leHRcIixcblx0XCJuZXh0UGFnZVwiLCBcIm9wdGlvblwiLCBcInByZXZpb3VzXCIsIFwicHJldmlvdXNQYWdlXCIsXG5cdFwicmVmcmVzaFwiLCBcInNlbGVjdFwiLCBcIndpZGdldFwiXG5dKTtcblxuLyoqXG4gKiBQcm9ncmVzc2JhciBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLlByb2dyZXNzYmFyXG4gKi9cbnhub2RldWkuUHJvZ3Jlc3NiYXIgPSBjcmVhdGVFeHRlbmRlZFhOb2RlVUlFbGVtZW50KFwicHJvZ3Jlc3NiYXJcIik7XG5cbmNyZWF0ZVhOb2RlVUlQcm9wZXJ0aWVzKHhub2RldWkuUHJvZ3Jlc3NiYXIsIFtcblx0XCJkaXNhYmxlZFwiLCBcIm1heFwiLCBcInZhbHVlXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLlByb2dyZXNzYmFyLCBbXG5cdFwiZGVzdHJveVwiLCBcImRpc2FibGVcIiwgXCJlbmFibGVcIiwgXCJpbnN0YW5jZVwiLFxuXHRcIm9wdGlvblwiLCBcIndpZGdldFwiIC8qLCBcInZhbHVlXCIqL1xuXSk7XG5cbi8qKlxuICogU2VsZWN0bWVudSBjbGFzcy5cbiAqIEBjbGFzcyB4bm9kZXVpLlNlbGVjdG1lbnVcbiAqL1xueG5vZGV1aS5TZWxlY3RtZW51ID0gY3JlYXRlRXh0ZW5kZWRYTm9kZVVJRWxlbWVudChcInNlbGVjdG1lbnVcIiwgeG5vZGUuU2VsZWN0KTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5TZWxlY3RtZW51LCBbXG5cdFwiYXBwZW5kVG9cIiwgXCJkaXNhYmxlZFwiLCBcImljb25zXCIsIFwicG9zaXRpb25cIixcblx0XCJ3aWR0aFwiXG5dKTtcblxuY3JlYXRlWE5vZGVVSU1ldGhvZHMoeG5vZGV1aS5TZWxlY3RtZW51LCBbXG5cdFwiY2xvc2VcIiwgXCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLFxuXHRcImluc3RhbmNlXCIsIFwibWVudVdpZGdldFwiLCBcIm9wZW5cIiwgXCJvcHRpb25cIixcblx0XCJyZWZyZXNoXCIsIFwid2lkZ2V0XCJcbl0pO1xuXG4vKipcbiAqIFNwaW5uZXIgY2xhc3MuXG4gKiBAY2xhc3MgeG5vZGV1aS5TcGlubmVyXG4gKi9cbnhub2RldWkuU3Bpbm5lciA9IGNyZWF0ZUV4dGVuZGVkWE5vZGVVSUVsZW1lbnQoXCJzcGlubmVyXCIsIHhub2RlLklucHV0KTtcblxuY3JlYXRlWE5vZGVVSVByb3BlcnRpZXMoeG5vZGV1aS5TcGlubmVyLCBbXG5cdFwiY3VsdHVyZVwiLCBcImRpc2FibGVkXCIsIFwiaWNvbnNcIiwgXCJpbmNyZW1lbnRhbFwiLFxuXHRcIm1heFwiLCBcIm1pblwiLCBcIm51bWJlckZvcm1hdFwiLCBcInBhZ2VcIixcblx0XCJzdGVwXCJcbl0pO1xuXG5jcmVhdGVYTm9kZVVJTWV0aG9kcyh4bm9kZXVpLlNwaW5uZXIsIFtcblx0XCJkZXN0cm95XCIsIFwiZGlzYWJsZVwiLCBcImVuYWJsZVwiLCBcImluc3RhbmNlXCIsXG5cdFwiaXNWYWxpZFwiLCBcIm9wdGlvblwiLCBcInBhZ2VEb3duXCIsIFwicGFnZVVwXCIsXG5cdFwic3RlcERvd25cIiwgXCJzdGVwVXBcIiwgXCJ2YWx1ZVwiLCBcIndpZGdldFwiXG5dKTtcblxubW9kdWxlLmV4cG9ydHMgPSB4bm9kZXVpOyIsInZhciB4bm9kZSA9IHJlcXVpcmUoXCJ4bm9kZVwiKTtcbnZhciB4bm9kZXVpID0gcmVxdWlyZShcIi4uL3NyYy94bm9kZXVpXCIpO1xuXG5mdW5jdGlvbiBjcmVhdGVCdXR0b25zVGFiKCkge1xuXHR2YXIgdGFiID0gbmV3IHhub2RlLkRpdigpO1xuXHR0YWIuaWQgPSBcImJ1dHRvbnNcIjtcblxuXHR2YXIgYnV0dG9uID0gbmV3IHhub2RldWkuQnV0dG9uKCk7XG5cdGJ1dHRvbi5sYWJlbCA9IFwiVGVzdGluZ1wiO1xuXHR0YWIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcblxuXHR2YXIgZGlzYWJsZWQgPSBuZXcgeG5vZGV1aS5CdXR0b24oKTtcblx0ZGlzYWJsZWQubGFiZWwgPSBcIkRpc2FibGVkXCI7XG5cdGRpc2FibGVkLmRpc2FibGUoKTtcblx0dGFiLmFwcGVuZENoaWxkKGRpc2FibGVkKTtcblxuXHRyZXR1cm4gdGFiO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTbGlkZXJzVGFiKCkge1xuXHR2YXIgdGFiID0gbmV3IHhub2RlLkRpdigpO1xuXHR0YWIuaWQgPSBcInNsaWRlcnNcIjtcblxuXHR2YXIgc2xpZGVyID0gbmV3IHhub2RldWkuU2xpZGVyKCk7XG5cblx0dGFiLmFwcGVuZENoaWxkKHNsaWRlcik7XG5cblx0cmV0dXJuIHRhYjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQWNjb3JkaW9uVGFiKCkge1xuXHR2YXIgYSA9IG5ldyB4bm9kZXVpLkFjY29yZGlvbigpO1xuXHRhLmlkID0gXCJhY2NvcmRpb25cIjtcblxuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJoZWxsb1wiKSk7XG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcInNvbWUgY29udGVudC4uLjxici8+YmxhbGFibFwiKSk7XG5cdGEuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcImhlbGxvIDJcIikpO1xuXHRhLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5EaXYoXCJzb21lIG1vcmUgY29udGVudC4uLjxici8+YmxhbGFibCBhbmQgc28gb24uLi48YnIvPmJsYWxhYmwgYW5kIHNvIG9uLi4uPGJyLz5ibGFsYWJsIGFuZCBzbyBvbi4uLjxici8+XCIpKTtcblxuXHRhLmhlaWdodFN0eWxlID0gXCJmaWxsXCI7XG5cdGEuY29sbGFwc2libGUgPSBmYWxzZTtcblxuXHRhLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHRhLnN0eWxlLnRvcCA9IFwiNDBweFwiO1xuXHRhLnN0eWxlLmJvdHRvbSA9IFwiMTBweFwiO1xuXHRhLnN0eWxlLmxlZnQgPSBcIjBcIjtcblx0YS5zdHlsZS5yaWdodCA9IFwiMFwiO1xuXG5cdHJldHVybiBhO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEYXRlcGlja2VyVGFiKCkge1xuXHR2YXIgdGFiID0gbmV3IHhub2RlLkRpdigpO1xuXHR0YWIuaWQgPSBcImRhdGVwaWNrZXJcIjtcblxuXHR2YXIgZGF0ZXBpY2tlciA9IG5ldyB4bm9kZXVpLkRhdGVwaWNrZXIoKTtcblxuXHR0YWIuYXBwZW5kQ2hpbGQoZGF0ZXBpY2tlcik7XG5cblx0cmV0dXJuIHRhYjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGlhbG9nVGFiKCkge1xuXHR2YXIgdGFiID0gbmV3IHhub2RlLkRpdigpO1xuXHR0YWIuaWQgPSBcImRpYWxvZ1wiO1xuXG5cdHZhciBkaWFsb2cgPSBuZXcgeG5vZGV1aS5EaWFsb2coKTtcblx0ZGlhbG9nLnRpdGxlID0gXCJIZWxsbyBXb3JsZFwiO1xuXHRkaWFsb2cuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkRpdihcImhlbGxvIHdvcmxkXCIpKTtcblx0ZGlhbG9nLm1vZGFsID0gdHJ1ZTtcblx0ZGlhbG9nLmNsb3NlKCk7XG5cblx0dmFyIGJ1dHRvbiA9IG5ldyB4bm9kZXVpLkJ1dHRvbigpO1xuXHRidXR0b24ubGFiZWwgPSBcIk9wZW4gZGlhbG9nXCI7XG5cdHRhYi5hcHBlbmRDaGlsZChidXR0b24pO1xuXG5cdGJ1dHRvbi5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuXHRcdGRpYWxvZy5vcGVuKCk7XG5cdH0pXG5cblx0cmV0dXJuIHRhYjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWVudVRhYigpIHtcblx0dmFyIHRhYiA9IG5ldyB4bm9kZS5EaXYoKTtcblx0dGFiLmlkID0gXCJtZW51XCI7XG5cblx0dmFyIG1lbnUgPSBuZXcgeG5vZGV1aS5NZW51KCk7XG5cdG1lbnUuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XG5cblx0bWVudS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJoZWxsb1wiKSk7XG5cdG1lbnUuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiaGVsbG8gMlwiKSk7XG5cdG1lbnUuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiaGVsbG8gM1wiKSk7XG5cdG1lbnUuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiaGVsbG8gNFwiKSk7XG5cblx0dmFyIHN1YiA9IG5ldyB4bm9kZS5MaShcImhhcyBzdWJcIik7XG5cdG1lbnUuYXBwZW5kQ2hpbGQoc3ViKTtcblxuXHR2YXIgc3VidWwgPSBuZXcgeG5vZGUuVWwoKTtcblx0c3VidWwuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XG5cdHN1Yi5hcHBlbmRDaGlsZChzdWJ1bCk7XG5cblx0c3VidWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwic3ViXCIpKTtcblx0c3VidWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwic3ViIDJcIikpO1xuXHRzdWJ1bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCJzdWIgM1wiKSk7XG5cdHN1YnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcInN1YiA0XCIpKTtcblxuXHR0YWIuYXBwZW5kQ2hpbGQobWVudSk7XG5cblx0bWVudS5yZWZyZXNoKCk7XG5cblx0cmV0dXJuIHRhYjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvZ3Jlc3NiYXJUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwicHJvZ3Jlc3NiYXJcIjtcblxuXHR2YXIgcHJvZ3Jlc3NiYXIgPSBuZXcgeG5vZGV1aS5Qcm9ncmVzc2JhcigpO1xuXG5cdHByb2dyZXNzYmFyLnZhbHVlID0gNTA7XG5cdHByb2dyZXNzYmFyLm1heCA9IDEwMDtcblxuXHR0YWIuYXBwZW5kQ2hpbGQocHJvZ3Jlc3NiYXIpO1xuXG5cdHZhciBpbnByb2dyZXNzYmFyID0gbmV3IHhub2RldWkuUHJvZ3Jlc3NiYXIoKTtcblxuXHRpbnByb2dyZXNzYmFyLnN0eWxlLm1hcmdpblRvcCA9IFwiMTBweFwiO1xuXHRpbnByb2dyZXNzYmFyLnZhbHVlID0gZmFsc2U7XG5cblx0dGFiLmFwcGVuZENoaWxkKGlucHJvZ3Jlc3NiYXIpO1xuXG5cdHJldHVybiB0YWI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlbGVjdG1lbnVUYWIoKSB7XG5cdHZhciB0YWIgPSBuZXcgeG5vZGUuRGl2KCk7XG5cdHRhYi5pZCA9IFwic2VsZWN0bWVudVwiO1xuXG5cdHZhciBzZWxlY3RtZW51ID0gbmV3IHhub2RldWkuU2VsZWN0bWVudSgpO1xuXG5cdHNlbGVjdG1lbnUuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XG5cblx0c2VsZWN0bWVudS5hcHBlbmRDaGlsZChuZXcgeG5vZGUuT3B0aW9uKFwiaGVsbG9cIikpO1xuXHRzZWxlY3RtZW51LmFwcGVuZENoaWxkKG5ldyB4bm9kZS5PcHRpb24oXCJ3b3JsZFwiKSk7XG5cblx0Ly9zZWxlY3RtZW51Lm9wZW4oKTtcblxuXHR0YWIuYXBwZW5kQ2hpbGQoc2VsZWN0bWVudSk7XG5cblx0c2VsZWN0bWVudS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXHRzZWxlY3RtZW51LnJlZnJlc2goKTtcblxuXHRyZXR1cm4gdGFiO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTcGlubmVyVGFiKCkge1xuXHR2YXIgdGFiID0gbmV3IHhub2RlLkRpdigpO1xuXHR0YWIuaWQgPSBcInNwaW5uZXJcIjtcblxuXHR2YXIgc3Bpbm5lciA9IG5ldyB4bm9kZXVpLlNwaW5uZXIoKTtcblxuXHR0YWIuYXBwZW5kQ2hpbGQoc3Bpbm5lcik7XG5cblx0cmV0dXJuIHRhYjtcbn1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cblx0dmFyIGQgPSBuZXcgeG5vZGUuRGl2KCk7XG5cblx0ZC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0ZC5zdHlsZS5sZWZ0ID0gXCIxMHB4XCI7XG5cdGQuc3R5bGUucmlnaHQgPSBcIjEwcHhcIjtcblx0ZC5zdHlsZS50b3AgPSBcIjEwcHhcIjtcblx0ZC5zdHlsZS5ib3R0b20gPSBcIjEwcHhcIjtcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkKTtcblxuXHR2YXIgdGFicyA9IG5ldyB4bm9kZXVpLlRhYnMoKTtcblxuXHR0YWJzLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHR0YWJzLnN0eWxlLnRvcCA9IFwiMFwiO1xuXHR0YWJzLnN0eWxlLmJvdHRvbSA9IFwiMFwiO1xuXHR0YWJzLnN0eWxlLmxlZnQgPSBcIjBcIjtcblx0dGFicy5zdHlsZS5yaWdodCA9IFwiMFwiO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2FjY29yZGlvbic+PHNwYW4+QWNjb3JkaW9uPC9zcGFuPjwvYT5cIikpO1xuXHR2YXIgYWNjb3JkaW9uID0gY3JlYXRlQWNjb3JkaW9uVGFiKCk7XG5cdHRhYnMuYXBwZW5kQ2hpbGQoYWNjb3JkaW9uKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNidXR0b25zJz48c3Bhbj5CdXR0b25zPC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZUJ1dHRvbnNUYWIoKSk7XG5cblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjZGF0ZXBpY2tlcic+PHNwYW4+RGF0ZXBpY2tlcjwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVEYXRlcGlja2VyVGFiKCkpO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI2RpYWxvZyc+PHNwYW4+RGlhbG9nPC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZURpYWxvZ1RhYigpKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNtZW51Jz48c3Bhbj5NZW51PC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZU1lbnVUYWIoKSk7XG5cblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjcHJvZ3Jlc3NiYXInPjxzcGFuPlByb2dyZXNzYmFyPC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZVByb2dyZXNzYmFyVGFiKCkpO1xuXG5cdHRhYnMudWwuYXBwZW5kQ2hpbGQobmV3IHhub2RlLkxpKFwiPGEgaHJlZj0nI3NlbGVjdG1lbnUnPjxzcGFuPlNlbGVjdG1lbnU8L3NwYW4+PC9hPlwiKSk7XG5cdHRhYnMuYXBwZW5kQ2hpbGQoY3JlYXRlU2VsZWN0bWVudVRhYigpKTtcblxuXHR0YWJzLnVsLmFwcGVuZENoaWxkKG5ldyB4bm9kZS5MaShcIjxhIGhyZWY9JyNzbGlkZXJzJz48c3Bhbj5TbGlkZXJzPC9zcGFuPjwvYT5cIikpO1xuXHR0YWJzLmFwcGVuZENoaWxkKGNyZWF0ZVNsaWRlcnNUYWIoKSk7XG5cblx0dGFicy51bC5hcHBlbmRDaGlsZChuZXcgeG5vZGUuTGkoXCI8YSBocmVmPScjc3Bpbm5lcic+PHNwYW4+U3Bpbm5lcjwvc3Bhbj48L2E+XCIpKTtcblx0dGFicy5hcHBlbmRDaGlsZChjcmVhdGVTcGlubmVyVGFiKCkpO1xuXG5cdGQuYXBwZW5kQ2hpbGQodGFicyk7XG5cdHRhYnMucmVmcmVzaCgpO1xuXHR0YWJzLmFjdGl2ZSA9IDA7XG5cblx0YWNjb3JkaW9uLnJlZnJlc2goKTtcblxuXHQkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuXHRcdC8vdGFicy5yZWZyZXNoKCk7XG5cdFx0YWNjb3JkaW9uLnJlZnJlc2goKTtcblx0fSk7XG59KTsiXX0=
