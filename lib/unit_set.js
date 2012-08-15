"use strict";
var UnitInfo = require('./unit_info');


var UnitSet = function () {
	this.parent = null;
	this.unitInfoDict = {};
};

UnitSet.prototype.setParent = function (parent) {
	if (this.parent) {
		throw new Error('UnitSet alredy has parent');
	}
	this.parent = parent;
};

UnitSet.prototype.alias = function (key, srcKey) {
	this.addInternal(key, this.unitInfoDict[srcKey]);
};

UnitSet.prototype.expose = function (key, unit) {
	this.addInternal(key, new UnitInfo(unit, this, true));
};

UnitSet.prototype.addInitRequired = function (key, unit) {
	this.addInternal(key, new UnitInfo(unit, this, false, true));
};

UnitSet.prototype.add = function (key, unit) {
	this.addInternal(key, new UnitInfo(unit, this));
};

UnitSet.prototype.addInternal = function (key, unitInfo) {
	if (key in this.unitInfoDict) {
		throw new Error('UnitSet duplicate key: ' + key);
	}
	this.unitInfoDict[key] = unitInfo;
};

UnitSet.prototype.addSet = function (key, unitSet) {
	if (key) {
		if (key in this.unitInfoDict) {
			throw new Error('UnitSet duplicate key: ' + key);
		}
		this.unitInfoDict[key] = new UnitInfo(); // stub actually
	}
	unitSet.setParent(this);
	var setUnitInfoDict = unitSet.unitInfoDict;
	for (var k in setUnitInfoDict) {
		var keyToAdd = key ? [key, k].join('.') : k;
		this.addInternal(keyToAdd, setUnitInfoDict[k]);
	}
};

UnitSet.prototype.get = function (key, opt_local, opt_init) {
	var result = null;
	var unitInfo = this.unitInfoDict[key];
	if (unitInfo != null) {
		result = unitInfo.getPreparedUnit(opt_init);
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
		throw new Error('Unit is required: ' + key);
	}
	return unit;
};

UnitSet.prototype.requireInited = function (key, opt_local) {
	return this.require(key, opt_local, true);
};

UnitSet.prototype.init = function () {
	for (var key in this.unitInfoDict) {
		this.unitInfoDict[key].init();
	}
};


module.exports = UnitSet;
