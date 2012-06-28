"use strict";
var errors = require('./errors');


var UnitSet = function () {
	this.parent = null;

	this.alias = {};
	this.units = {};
	this.skipInit = {};
	this.inited = {};
	this.childUnitSetsMap = {};
	this.childUnitSets = [];
};

UnitSet.prototype._setParent = function (parent) {
	if (this.parent) {
		throw new errors.UnitAlreadyHasParent();
	}
	this.parent = parent;
};

UnitSet.prototype.alias = function (key, dstKey) {
	this.alias[key] = dstKey;
};

UnitSet.prototype.expose = function (key, obj) {
	this.add(key, obj, true);
};

UnitSet.prototype.add = function (key, unit, opt_skipInit) {
	if (key in this.units) {
		throw new errors.DuplicateUnit(key);
	}

	this.units[key] = unit;

	if (opt_skipInit) {
		this.skipInit[key] = true;
	}
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
		if (opt_init && !(key in this.inited)) {
			result.unitInit(this);
			this.inited[key] = true;
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
		if (!(key in this.skipInit) && !(key in this.inited)) {
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
