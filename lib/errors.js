"use strict";
var inherits = require('util').inherits;
var ErrorBase = require('nerr').ErrorBase;


var UnitsError = function () {
	ErrorBase.call(this);
};
inherits(UnitsError, ErrorBase);


var DuplicateUnit = function (key) {
	UnitsError.call(this);
	this.key = key;
};
inherits(DuplicateUnit, UnitsError);

DuplicateUnit.prototype.name = 'DuplicateUnit';

DuplicateUnit.prototype.getMessage = function () {
	return ['Duplicate unit "', this.key, '"'].join('');
};


var UnitRequired = function (key) {
	UnitsError.call(this);
	this.key = key;
};
inherits(UnitRequired, UnitsError);

UnitRequired.prototype.name = 'UnitRequired';

UnitRequired.prototype.getMessage = function () {
	return ['Unit "', this.key, '" is required'].join('');
};


var DuplicateChildUnitSet = function (key) {
	UnitsError.call(this);
	this.key = key;
};
inherits(DuplicateChildUnitSet, UnitsError);

DuplicateChildUnitSet.prototype.name = 'DuplicateChildUnitSet';

DuplicateChildUnitSet.prototype.getMessage = function () {
	return ['Duplicate child UnitSet "', this.key, '"'].join('');
};


var UnitAlreadyHasParent = function () {
	UnitsError.call(this);
};
inherits(UnitAlreadyHasParent, UnitsError);

UnitAlreadyHasParent.prototype.name = 'UnitAlreadyHasParent';

UnitAlreadyHasParent.prototype.getMessage = function () {
	return 'Unit already has parent';
};


module.exports = {
	UnitsError: UnitsError,
	DuplicateUnit: DuplicateUnit,
	UnitRequired: UnitRequired,
	DuplicateChildUnitSet: DuplicateChildUnitSet,
	UnitAlreadyHasParent: UnitAlreadyHasParent
};
