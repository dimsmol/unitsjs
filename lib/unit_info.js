"use strict";
var UnitInfo = function (unit, originalUnitSet, isInited, isInitRequired) {
	this.unit = unit;
	this.originalUnitSet = originalUnitSet;

	this.isInited = !!isInited;
	this.isInitRequired = !!isInitRequired;
};

UnitInfo.prototype.getPreparedUnit = function (forceInit) {
	if (forceInit || this.isInitRequired) {
		this.init();
	}
	return this.unit;
};

UnitInfo.prototype.init = function () {
	if (this.unit != null && !this.isInited) {
		this.unit.unitInit(this.originalUnitSet);
		this.isInited = true;
	}
};


module.exports = UnitInfo;
