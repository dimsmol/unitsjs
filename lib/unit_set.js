"use strict";
var errors = require('./errors');


var UnitSet = function () {
	this.parent = null;

	this.alias = {};
	this.units = {};
	this.skipInit = {};
	this.children = {};
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
		if (key in this.children) {
			throw new errors.DuplicateChildUnitSet(key);
		}
		this.children[key] = units;
	}
	else {
		this.childUnitSets.push(units);
	}
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

UnitSet.prototype.get = function (key, opt_local) {
	var dstKey = this.alias[key];
	if (dstKey) {
		key = dstKey;
	}
	var result = this.units[key];
	if (result == null && !opt_local && this.parent != null) {
		result = this.parent.get(key);
	}
	return result;
};

UnitSet.prototype.require = function (key, opt_local) {
	var unit = this.get(key, opt_local);
	if (unit == null) {
		throw new errors.UnitRequired(key);
	}
	return unit;
};

UnitSet.prototype.init = function () {
	var key;
	for (key in this.units) {
		if (!(key in this.skipInit)) {
			this.units[key].unitInit(this);
		}
	}
	var child;
	for (key in this.children) {
		child = this.children[key];
		child.init();
	}
	for (var i = 0; i < this.childUnitSets.length; i++) {
		child = this.childUnitSets[i];
		child.init();
	}
};


module.exports = UnitSet;
