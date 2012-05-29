"use strict";
var errors = require('./errors');


var UnitSet = function () {
	this.parent = null;

	this.units = {};
	this.skipInit = {};
	this.alias = {};
};

UnitSet.prototype.setParent = function (parent) {
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
	units.setParent(this);
	for (var k in units) {
		var keyToAdd = [key, k].join('.');
		this.add(keyToAdd, units[k], k in units.skipInit);
	}
};

UnitSet.prototype.get = function (key, opt_local) {
	var dstKey = this.alias[key];
	if (dstKey) {
		key = dstKey;
	}
	var result = this.units[key];
	if (result == null && !opt_local && this.parent != null) {
		result = this.parent.get(result);
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
	for (var key in this.units) {
		if (!(key in this.skipInit)) {
			this.units[key].unitInit(this);
		}
	}
};


module.exports = UnitSet;
