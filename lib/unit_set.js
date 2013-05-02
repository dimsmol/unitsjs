"use strict";
var UnitInfo = require('./unit_info');


var UnitSet = function (opt_loader) {
	this.loader = opt_loader;
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
	return this.addInternal(key, this.unitInfoDict[srcKey]);
};

UnitSet.prototype.expose = function (key, unit) {
	return this.addInternal(key, new UnitInfo(unit, this, true));
};

UnitSet.prototype.addInitRequired = function (key, unit) {
	return this.addInternal(key, new UnitInfo(unit, this, false, true));
};

UnitSet.prototype.add = function (key, unit) {
	return this.addInternal(key, new UnitInfo(unit, this));
};

UnitSet.prototype.addInternal = function (key, unitInfo) {
	if (key in this.unitInfoDict) {
		throw new Error('UnitSet duplicate key: ' + key);
	}
	this.unitInfoDict[key] = unitInfo;
	return unitInfo;
};

UnitSet.prototype.joinSet = function (unitSet) {
	this.addSet(null, unitSet);
};

UnitSet.prototype.addSet = function (key, unitSet) {
	if (key && key in this.unitInfoDict) {
		throw new Error('UnitSet duplicate key: ' + key);
	}
	unitSet.setParent(this);
	var setUnitInfoDict = unitSet.unitInfoDict;
	for (var k in setUnitInfoDict) {
		var keyToAdd = this.getKeyForSet(key, k);
		this.addInternal(keyToAdd, setUnitInfoDict[k]);
	}
	if (key && !(key in this.unitInfoDict)) {
		this.unitInfoDict[key] = new UnitInfo(); // stub actually
	}
};

UnitSet.prototype.getKeyForSet = function (setKey, unitKey) {
	var result;
	if (unitKey == '~' && setKey) {
		result = setKey;
	}
	else if (!setKey) {
		result = unitKey;
	}
	else {
		result = [setKey, unitKey].join('.');
	}
	return result;
};

UnitSet.prototype.get = function (key, opt_local, opt_init) {
	var result = this.getLocal(key, opt_local, opt_init);
	if (result == null) {
		result = this.getFromLoader(key, opt_local, opt_init);
	}
	if (result == null) {
		result = this.getFromParent(key, opt_local, opt_init);
	}
	return result;
};

UnitSet.prototype.getLocal = function (key, opt_local, opt_init) {
	var result;
	var unitInfo = this.unitInfoDict[key];
	if (unitInfo != null) {
		result = unitInfo.getPreparedUnit(opt_init);
	}
	return result;
};

UnitSet.prototype.getFromLoader = function (key, opt_local, opt_init) {
	var result;
	if (this.loader != null) {
		var unitToAdd = this.loader.loadUnit(key, opt_local, opt_init);
		if (unitToAdd != null) {
			var unitInfo = this.add(key, unitToAdd);
			// at this point units are ready to use and already inited,
			// so we need inited one too
			result = unitInfo.getPreparedUnit(true);
		}
	}
	return result;
};

UnitSet.prototype.getFromParent = function (key, opt_local, opt_init) {
	var result;
	if (!opt_local && this.parent != null) {
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
