"use strict";
var UnitInfo = function (unit, originalUnitSet, isExposed, isInitRequired) {
	this.unit = unit;
	this.originalUnitSet = originalUnitSet;
	this.isExposed = isExposed;
	this.isInitRequired = !!isInitRequired;

	this.isInited = false;
};

UnitInfo.prototype.getPreparedUnit = function (forceInit) {
	var result = this.unit;
	if (!this.isExposed && this.unit != null) {
		if (!this.isInited && (forceInit || this.isInitRequired || this.unit.unitIsInitRequired)) {
			this.init();
		}
		if (this.unit.unitGetInstance) {
			result = this.unit.unitGetInstance(this);
		}
	}
	return result;
};

UnitInfo.prototype.init = function () {
	if (this.unit != null && !this.isInited && !this.isExposed && this.unit.unitInit != null) {
		this.isInited = true; // avoiding double-init if unitInit() somehow calls init() again
		this.unit.unitInit(this.originalUnitSet);
	}
};


module.exports = UnitInfo;
