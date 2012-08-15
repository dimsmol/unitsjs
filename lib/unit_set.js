"use strict";
var errors = require('./errors');


var UnitSet = function () {
	this.parent = null;

	this.units = {};
	this.childUnitSetsMap = {};
	this.childUnitSets = [];

	this.alias = {};

	this.skipInit = {};
	this.requireInit = {};

	this.origin = {};
	this.originKey = {};

	this.inited = {};
};

UnitSet.prototype._setParent = function (parent) {
	if (this.parent) {
		throw new errors.UnitAlreadyHasParent();
	}
	this.parent = parent;
};

UnitSet.prototype.getOrigin = function (key) {
	return this.origin[key] || this;
};

UnitSet.prototype.getOriginKey = function (key) {
	return this.originKey[key] || key;
};

UnitSet.prototype.alias = function (key, dstKey) {
	this.alias[key] = dstKey;
};

UnitSet.prototype.expose = function (key, obj) {
	this.add(key, obj);
	this.skipInit[key] = true;
};

UnitSet.prototype.addInitRequired = function (key, obj) {
	this.add(key, obj);
	this.requireInit[key] = true;
};

UnitSet.prototype.add = function (key, unit) {
	if (key in this.units) {
		throw new errors.DuplicateUnit(key);
	}
	this.units[key] = unit;
};

UnitSet.prototype.addSet = function (key, units) {
	if (key) {
		if (key in this.childUnitSetsMap) {
			throw new errors.DuplicateChildUnitSet(key);
		}
		this.childUnitSetsMap[key] = units;
	}
	this.childUnitSets.push(units);
	units._setParent(this);
	var unitsDict = units.units;
	for (var k in unitsDict) {
		var keyToAdd = key ? [key, k].join('.') : k;
		this.expose(keyToAdd, unitsDict[k]);
		this.origin[keyToAdd] = units.getOrigin(k);
		this.originKey[keyToAdd] = units.getOriginKey(k);
	}
};

UnitSet.prototype.joinSet = function (units) {
	var unitsDict = units.units;
	for (var k in unitsDict) {
		this.add(k, unitsDict[k], k in units.skipInit);
	}
};

UnitSet.prototype.get = function (key, opt_local, opt_init) {
	var dstKey = this.alias[key];
	if (dstKey) {
		key = dstKey;
	}
	var result = this.units[key];
	if (result != null) {
		var origin = this.getOrigin(key);
		var originKey = this.getOriginKey(key);
		if ((opt_init || origin.requireInit[originKey]) && !origin.inited[originKey]) {
			result.unitInit(origin);
			origin.inited[originKey] = true;
		}
	}
	else if (!opt_local && this.parent != null) {
		result = this.parent.get(key, opt_local, opt_init);
	}
	return result;
};

UnitSet.prototype.getInited = function (key, opt_local) {
	return this.get(key, opt_local, true);
};

UnitSet.prototype.require = function (key, opt_local, opt_init) {
	var unit = this.get(key, opt_local, opt_init);
	if (unit == null) {
		throw new errors.UnitRequired(key);
	}
	return unit;
};

UnitSet.prototype.requireInited = function (key, opt_local) {
	return this.require(key, opt_local, true);
};

UnitSet.prototype.init = function () {
	for (var key in this.units) {
		if (!this.skipInit[key] && !this.inited[key]) {
			this.units[key].unitInit(this);
			this.inited[key] = true;
		}
	}
	for (var i = 0; i < this.childUnitSets.length; i++) {
		var child = this.childUnitSets[i];
		child.init();
	}
};


module.exports = UnitSet;
