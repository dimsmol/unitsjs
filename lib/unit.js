"use strict";
// actually, it's an interface
var Unit = function () {
};

Unit.prototype.unitIsInitRequired = false;

Unit.prototype.unitInit = function (units) {
};

Unit.prototype.unitGetInstance = function (unitInfo) {
	return this;
};


module.exports = Unit;
