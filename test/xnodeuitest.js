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