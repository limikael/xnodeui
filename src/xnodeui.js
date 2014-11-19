var xnode = require("xnode");
var inherits = require("inherits");
var xnodeui = {};

xnodeui.Button = function() {
	xnode.Button.call(this);

	$(this.node).button({label: "hello"});
}

inherits(xnodeui.Button, xnode.Button);

module.exports = xnodeui;