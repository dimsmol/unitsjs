# units

Module-like system with two step initialization.

Units provides an ability to add number of component instances to a set and then call init function on each of them with guarantee that all other components are instantiated.

Can also be used on client side using [browserify](https://github.com/substack/node-browserify) or similar tool.

## Example

```js
var units = new UnitSet();

var LogicA = function () {
};

LogicA.prototype.unitInit = function (units) {
	// all units are instantiated at this point
	// getting components we're depended on
	this.db = units.require('db');
	this.logicB = units.require('logic.b');
};

units.add('db', new Db(someDbArgs));
units.add('settings', new Settings('/path/to/project/root/or/something'));
units.add('logic.a', new LogicA());
units.add('logic.b', new LogicB());
units.add('facade', new Facade());

units.init(); // calls unitInit() function of every unit internally
```

## Parent units

UnitSet can be added to other UnitSet which will be it's parent. On getting keys, lookup will be performed locally first, then on parent UnitSet. All child units will be added directly to parent and inited by parent as well.

```js
var units = new UnitSet();

units.add('db', new Db());

var childUnits = new UnitSet();
childUnits.add('logic.a', new LogicA());
childUnits.add('logic.b', new LogicB());

units.addSet(childUnits);

childUnits.get('db'); // will try to find 'db' in childUnits, then in units
```

## UnitSet methods

* alias(key, dstKey) - sets alias for key: dstKey will be obtained instead of key on get() and require() calls
* add(key, unit) - adds unit under key specified
* expose(key, obj) - like add(key, obj), but unitInit() will not be called on this unit (so, unit may omit unitInit() implementation), used to expose constant or any object without unitInit() method as a unit
* addInitRequired(key, unit) - like add(key, obj), but will ensure that unitInit() is called on that unit when it's being got by get() or require(), for units that are unusable unless inited
* addSet(key, units) - makes units child UnitSet, adds all child units to itself under key specified
	* units has a unit with key '~', it will be added directly under key specified, instead of key+'.~'
* joinSet(units) - add all units of UnitSet specified to self, without any extra magic
* get(key) - gets unit under key specified, tries parent if no unit found and parent is present, takes into account aliases
* require(key) - calls get() internally and returns result if not null, otherwise throws an error
* init() - calls unitInit() method on all added units except added with opt_skipInit=true

## Unit

Unit class is actually an interface.
You can inherit it to make obvious that your subclass is Unit.
But you can also just implement unitInit() without inheriting Unit.

## License

MIT
