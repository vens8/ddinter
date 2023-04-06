/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 *
 * Version: 5.9.2 (2021-09-08)
 */
(function () {
    'use strict';

    var typeOf$1 = function (x) {
      if (x === null) {
        return 'null';
      }
      if (x === undefined) {
        return 'undefined';
      }
      var t = typeof x;
      if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
        return 'array';
      }
      if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
        return 'string';
      }
      return t;
    };
    var isEquatableType = function (x) {
      return [
        'undefined',
        'boolean',
        'number',
        'string',
        'function',
        'xml',
        'null'
      ].indexOf(x) !== -1;
    };

    var sort$1 = function (xs, compareFn) {
      var clone = Array.prototype.slice.call(xs);
      return clone.sort(compareFn);
    };

    var contramap = function (eqa, f) {
      return eq$2(function (x, y) {
        return eqa.eq(f(x), f(y));
      });
    };
    var eq$2 = function (f) {
      return { eq: f };
    };
    var tripleEq = eq$2(function (x, y) {
      return x === y;
    });
    var eqString = tripleEq;
    var eqArray = function (eqa) {
      return eq$2(function (x, y) {
        if (x.length !== y.length) {
          return false;
        }
        var len = x.length;
        for (var i = 0; i < len; i++) {
          if (!eqa.eq(x[i], y[i])) {
            return false;
          }
        }
        return true;
      });
    };
    var eqSortedArray = function (eqa, compareFn) {
      return contramap(eqArray(eqa), function (xs) {
        return sort$1(xs, compareFn);
      });
    };
    var eqRecord = function (eqa) {
      return eq$2(function (x, y) {
        var kx = Object.keys(x);
        var ky = Object.keys(y);
        if (!eqSortedArray(eqString).eq(kx, ky)) {
          return false;
        }
        var len = kx.length;
        for (var i = 0; i < len; i++) {
          var q = kx[i];
          if (!eqa.eq(x[q], y[q])) {
            return false;
          }
        }
        return true;
      });
    };
    var eqAny = eq$2(function (x, y) {
      if (x === y) {
        return true;
      }
      var tx = typeOf$1(x);
      var ty = typeOf$1(y);
      if (tx !== ty) {
        return false;
      }
      if (isEquatableType(tx)) {
        return x === y;
      } else if (tx === 'array') {
        return eqArray(eqAny).eq(x, y);
      } else if (tx === 'object') {
        return eqRecord(eqAny).eq(x, y);
      }
      return false;
    });

    var typeOf = function (x) {
      var t = typeof x;
      if (x === null) {
        return 'null';
      } else if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
        return 'array';
      } else if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
        return 'string';
      } else {
        return t;
      }
    };
    var isType$1 = function (type) {
      return function (value) {
        return typeOf(value) === type;
      };
    };
    var isSimpleType = function (type) {
      return function (value) {
        return typeof value === type;
      };
    };
    var eq$1 = function (t) {
      return function (a) {
        return t === a;
      };
    };
    var isString$1 = isType$1('string');
    var isObject = isType$1('object');
    var isArray$1 = isType$1('array');
    var isNull = eq$1(null);
    var isBoolean = isSimpleType('boolean');
    var isUndefined = eq$1(undefined);
    var isNullable = function (a) {
      return a === null || a === undefined;
    };
    var isNonNullable = function (a) {
      return !isNullable(a);
    };
    var isFunction = isSimpleType('function');
    var isNumber = isSimpleType('number');

    var noop = function () {
    };
    var compose = function (fa, fb) {
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return fa(fb.apply(null, args));
      };
    };
    var compose1 = function (fbc, fab) {
      return function (a) {
        return fbc(fab(a));
      };
    };
    var constant = function (value) {
      return function () {
        return value;
      };
    };
    var identity = function (x) {
      return x;
    };
    var tripleEquals = function (a, b) {
      return a === b;
    };
    function curry(fn) {
      var initialArgs = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        initialArgs[_i - 1] = arguments[_i];
      }
      return function () {
        var restArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          restArgs[_i] = arguments[_i];
        }
        var all = initialArgs.concat(restArgs);
        return fn.apply(null, all);
      };
    }
    var not = function (f) {
      return function (t) {
        return !f(t);
      };
    };
    var die = function (msg) {
      return function () {
        throw new Error(msg);
      };
    };
    var apply = function (f) {
      return f();
    };
    var call = function (f) {
      f();
    };
    var never = constant(false);
    var always = constant(true);

    var none = function () {
      return NONE;
    };
    var NONE = function () {
      var call = function (thunk) {
        return thunk();
      };
      var id = identity;
      var me = {
        fold: function (n, _s) {
          return n();
        },
        isSome: never,
        isNone: always,
        getOr: id,
        getOrThunk: call,
        getOrDie: function (msg) {
          throw new Error(msg || 'error: getOrDie called on none.');
        },
        getOrNull: constant(null),
        getOrUndefined: constant(undefined),
        or: id,
        orThunk: call,
        map: none,
        each: noop,
        bind: none,
        exists: never,
        forall: always,
        filter: function () {
          return none();
        },
        toArray: function () {
          return [];
        },
        toString: constant('none()')
      };
      return me;
    }();
    var some = function (a) {
      var constant_a = constant(a);
      var self = function () {
        return me;
      };
      var bind = function (f) {
        return f(a);
      };
      var me = {
        fold: function (n, s) {
          return s(a);
        },
        isSome: always,
        isNone: never,
        getOr: constant_a,
        getOrThunk: constant_a,
        getOrDie: constant_a,
        getOrNull: constant_a,
        getOrUndefined: constant_a,
        or: self,
        orThunk: self,
        map: function (f) {
          return some(f(a));
        },
        each: function (f) {
          f(a);
        },
        bind: bind,
        exists: bind,
        forall: bind,
        filter: function (f) {
          return f(a) ? me : NONE;
        },
        toArray: function () {
          return [a];
        },
        toString: function () {
          return 'some(' + a + ')';
        }
      };
      return me;
    };
    var from$1 = function (value) {
      return value === null || value === undefined ? NONE : some(value);
    };
    var Optional = {
      some: some,
      none: none,
      from: from$1
    };

    var nativeSlice = Array.prototype.slice;
    var nativeIndexOf = Array.prototype.indexOf;
    var nativePush = Array.prototype.push;
    var rawIndexOf = function (ts, t) {
      return nativeIndexOf.call(ts, t);
    };
    var indexOf$2 = function (xs, x) {
      var r = rawIndexOf(xs, x);
      return r === -1 ? Optional.none() : Optional.some(r);
    };
    var contains$3 = function (xs, x) {
      return rawIndexOf(xs, x) > -1;
    };
    var exists = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          return true;
        }
      }
      return false;
    };
    var map$3 = function (xs, f) {
      var len = xs.length;
      var r = new Array(len);
      for (var i = 0; i < len; i++) {
        var x = xs[i];
        r[i] = f(x, i);
      }
      return r;
    };
    var each$k = function (xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i);
      }
    };
    var eachr = function (xs, f) {
      for (var i = xs.length - 1; i >= 0; i--) {
        var x = xs[i];
        f(x, i);
      }
    };
    var partition = function (xs, pred) {
      var pass = [];
      var fail = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        var arr = pred(x, i) ? pass : fail;
        arr.push(x);
      }
      return {
        pass: pass,
        fail: fail
      };
    };
    var filter$4 = function (xs, pred) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          r.push(x);
        }
      }
      return r;
    };
    var foldr = function (xs, f, acc) {
      eachr(xs, function (x, i) {
        acc = f(acc, x, i);
      });
      return acc;
    };
    var foldl = function (xs, f, acc) {
      each$k(xs, function (x, i) {
        acc = f(acc, x, i);
      });
      return acc;
    };
    var findUntil$1 = function (xs, pred, until) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          return Optional.some(x);
        } else if (until(x, i)) {
          break;
        }
      }
      return Optional.none();
    };
    var find$3 = function (xs, pred) {
      return findUntil$1(xs, pred, never);
    };
    var findIndex$2 = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          return Optional.some(i);
        }
      }
      return Optional.none();
    };
    var flatten = function (xs) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; ++i) {
        if (!isArray$1(xs[i])) {
          throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
        }
        nativePush.apply(r, xs[i]);
      }
      return r;
    };
    var bind = function (xs, f) {
      return flatten(map$3(xs, f));
    };
    var forall = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; ++i) {
        var x = xs[i];
        if (pred(x, i) !== true) {
          return false;
        }
      }
      return true;
    };
    var reverse = function (xs) {
      var r = nativeSlice.call(xs, 0);
      r.reverse();
      return r;
    };
    var difference = function (a1, a2) {
      return filter$4(a1, function (x) {
        return !contains$3(a2, x);
      });
    };
    var mapToObject = function (xs, f) {
      var r = {};
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        r[String(x)] = f(x, i);
      }
      return r;
    };
    var sort = function (xs, comparator) {
      var copy = nativeSlice.call(xs, 0);
      copy.sort(comparator);
      return copy;
    };
    var get$a = function (xs, i) {
      return i >= 0 && i < xs.length ? Optional.some(xs[i]) : Optional.none();
    };
    var head = function (xs) {
      return get$a(xs, 0);
    };
    var last$2 = function (xs) {
      return get$a(xs, xs.length - 1);
    };
    var from = isFunction(Array.from) ? Array.from : function (x) {
      return nativeSlice.call(x);
    };
    var findMap = function (arr, f) {
      for (var i = 0; i < arr.length; i++) {
        var r = f(arr[i], i);
        if (r.isSome()) {
          return r;
        }
      }
      return Optional.none();
    };

    var keys = Object.keys;
    var hasOwnProperty$1 = Object.hasOwnProperty;
    var each$j = function (obj, f) {
      var props = keys(obj);
      for (var k = 0, len = props.length; k < len; k++) {
        var i = props[k];
        var x = obj[i];
        f(x, i);
      }
    };
    var map$2 = function (obj, f) {
      return tupleMap(obj, function (x, i) {
        return {
          k: i,
          v: f(x, i)
        };
      });
    };
    var tupleMap = function (obj, f) {
      var r = {};
      each$j(obj, function (x, i) {
        var tuple = f(x, i);
        r[tuple.k] = tuple.v;
      });
      return r;
    };
    var objAcc = function (r) {
      return function (x, i) {
        r[i] = x;
      };
    };
    var internalFilter = function (obj, pred, onTrue, onFalse) {
      var r = {};
      each$j(obj, function (x, i) {
        (pred(x, i) ? onTrue : onFalse)(x, i);
      });
      return r;
    };
    var bifilter = function (obj, pred) {
      var t = {};
      var f = {};
      internalFilter(obj, pred, objAcc(t), objAcc(f));
      return {
        t: t,
        f: f
      };
    };
    var filter$3 = function (obj, pred) {
      var t = {};
      internalFilter(obj, pred, objAcc(t), noop);
      return t;
    };
    var mapToArray = function (obj, f) {
      var r = [];
      each$j(obj, function (value, name) {
        r.push(f(value, name));
      });
      return r;
    };
    var values = function (obj) {
      return mapToArray(obj, identity);
    };
    var get$9 = function (obj, key) {
      return has$2(obj, key) ? Optional.from(obj[key]) : Optional.none();
    };
    var has$2 = function (obj, key) {
      return hasOwnProperty$1.call(obj, key);
    };
    var hasNonNullableKey = function (obj, key) {
      return has$2(obj, key) && obj[key] !== undefined && obj[key] !== null;
    };
    var equal$1 = function (a1, a2, eq) {
      if (eq === void 0) {
        eq = eqAny;
      }
      return eqRecord(eq).eq(a1, a2);
    };

    var isArray = Array.isArray;
    var toArray$1 = function (obj) {
      if (!isArray(obj)) {
        var array = [];
        for (var i = 0, l = obj.length; i < l; i++) {
          array[i] = obj[i];
        }
        return array;
      } else {
        return obj;
      }
    };
    var each$i = function (o, cb, s) {
      var n, l;
      if (!o) {
        return false;
      }
      s = s || o;
      if (o.length !== undefined) {
        for (n = 0, l = o.length; n < l; n++) {
          if (cb.call(s, o[n], n, o) === false) {
            return false;
          }
        }
      } else {
        for (n in o) {
          if (has$2(o, n)) {
            if (cb.call(s, o[n], n, o) === false) {
              return false;
            }
          }
        }
      }
      return true;
    };
    var map$1 = function (array, callback) {
      var out = [];
      each$i(array, function (item, index) {
        out.push(callback(item, index, array));
      });
      return out;
    };
    var filter$2 = function (a, f) {
      var o = [];
      each$i(a, function (v, index) {
        if (!f || f(v, index, a)) {
          o.push(v);
        }
      });
      return o;
    };
    var indexOf$1 = function (a, v) {
      if (a) {
        for (var i = 0, l = a.length; i < l; i++) {
          if (a[i] === v) {
            return i;
          }
        }
      }
      return -1;
    };
    var reduce = function (collection, iteratee, accumulator, thisArg) {
      var acc = isUndefined(accumulator) ? collection[0] : accumulator;
      for (var i = 0; i < collection.length; i++) {
        acc = iteratee.call(thisArg, acc, collection[i], i);
      }
      return acc;
    };
    var findIndex$1 = function (array, predicate, thisArg) {
      var i, l;
      for (i = 0, l = array.length; i < l; i++) {
        if (predicate.call(thisArg, array[i], i, array)) {
          return i;
        }
      }
      return -1;
    };
    var last$1 = function (collection) {
      return collection[collection.length - 1];
    };

    var __assign = function () {
      __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
      var t = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === 'function')
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t[p[i]] = s[p[i]];
        }
      return t;
    }
    function __spreadArray(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    }

    var cached = function (f) {
      var called = false;
      var r;
      return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (!called) {
          called = true;
          r = f.apply(null, args);
        }
        return r;
      };
    };

    var DeviceType = function (os, browser, userAgent, mediaMatch) {
      var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
      var isiPhone = os.isiOS() && !isiPad;
      var isMobile = os.isiOS() || os.isAndroid();
      var isTouch = isMobile || mediaMatch('(pointer:coarse)');
      var isTablet = isiPad || !isiPhone && isMobile && mediaMatch('(min-device-width:768px)');
      var isPhone = isiPhone || isMobile && !isTablet;
      var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
      var isDesktop = !isPhone && !isTablet && !iOSwebview;
      return {
        isiPad: constant(isiPad),
        isiPhone: constant(isiPhone),
        isTablet: constant(isTablet),
        isPhone: constant(isPhone),
        isTouch: constant(isTouch),
        isAndroid: os.isAndroid,
        isiOS: os.isiOS,
        isWebView: constant(iOSwebview),
        isDesktop: constant(isDesktop)
      };
    };

    var firstMatch = function (regexes, s) {
      for (var i = 0; i < regexes.length; i++) {
        var x = regexes[i];
        if (x.test(s)) {
          return x;
        }
      }
      return undefined;
    };
    var find$2 = function (regexes, agent) {
      var r = firstMatch(regexes, agent);
      if (!r) {
        return {
          major: 0,
          minor: 0
        };
      }
      var group = function (i) {
        return Number(agent.replace(r, '$' + i));
      };
      return nu$4(group(1), group(2));
    };
    var detect$3 = function (versionRegexes, agent) {
      var cleanedAgent = String(agent).toLowerCase();
      if (versionRegexes.length === 0) {
        return unknown$2();
      }
      return find$2(versionRegexes, cleanedAgent);
    };
    var unknown$2 = function () {
      return nu$4(0, 0);
    };
    var nu$4 = function (major, minor) {
      return {
        major: major,
        minor: minor
      };
    };
    var Version = {
      nu: nu$4,
      detect: detect$3,
      unknown: unknown$2
    };

    var detectBrowser$1 = function (browsers, userAgentData) {
      return findMap(userAgentData.brands, function (uaBrand) {
        var lcBrand = uaBrand.brand.toLowerCase();
        return find$3(browsers, function (browser) {
          var _a;
          return lcBrand === ((_a = browser.brand) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        }).map(function (info) {
          return {
            current: info.name,
            version: Version.nu(parseInt(uaBrand.version, 10), 0)
          };
        });
      });
    };

    var detect$2 = function (candidates, userAgent) {
      var agent = String(userAgent).toLowerCase();
      return find$3(candidates, function (candidate) {
        return candidate.search(agent);
      });
    };
    var detectBrowser = function (browsers, userAgent) {
      return detect$2(browsers, userAgent).map(function (browser) {
        var version = Version.detect(browser.versionRegexes, userAgent);
        return {
          current: browser.name,
          version: version
        };
      });
    };
    var detectOs = function (oses, userAgent) {
      return detect$2(oses, userAgent).map(function (os) {
        var version = Version.detect(os.versionRegexes, userAgent);
        return {
          current: os.name,
          version: version
        };
      });
    };

    var removeFromStart = function (str, numChars) {
      return str.substring(numChars);
    };

    var checkRange = function (str, substr, start) {
      return substr === '' || str.length >= substr.length && str.substr(start, start + substr.length) === substr;
    };
    var removeLeading = function (str, prefix) {
      return startsWith(str, prefix) ? removeFromStart(str, prefix.length) : str;
    };
    var contains$2 = function (str, substr) {
      return str.indexOf(substr) !== -1;
    };
    var startsWith = function (str, prefix) {
      return checkRange(str, prefix, 0);
    };
    var blank = function (r) {
      return function (s) {
        return s.replace(r, '');
      };
    };
    var trim$4 = blank(/^\s+|\s+$/g);
    var lTrim = blank(/^\s+/g);
    var rTrim = blank(/\s+$/g);
    var isNotEmpty = function (s) {
      return s.length > 0;
    };
    var isEmpty$3 = function (s) {
      return !isNotEmpty(s);
    };

    var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
    var checkContains = function (target) {
      return function (uastring) {
        return contains$2(uastring, target);
      };
    };
    var browsers = [
      {
        name: 'Edge',
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: function (uastring) {
          return contains$2(uastring, 'edge/') && contains$2(uastring, 'chrome') && contains$2(uastring, 'safari') && contains$2(uastring, 'applewebkit');
        }
      },
      {
        name: 'Chrome',
        brand: 'Chromium',
        versionRegexes: [
          /.*?chrome\/([0-9]+)\.([0-9]+).*/,
          normalVersionRegex
        ],
        search: function (uastring) {
          return contains$2(uastring, 'chrome') && !contains$2(uastring, 'chromeframe');
        }
      },
      {
        name: 'IE',
        versionRegexes: [
          /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
          /.*?rv:([0-9]+)\.([0-9]+).*/
        ],
        search: function (uastring) {
          return contains$2(uastring, 'msie') || contains$2(uastring, 'trident');
        }
      },
      {
        name: 'Opera',
        versionRegexes: [
          normalVersionRegex,
          /.*?opera\/([0-9]+)\.([0-9]+).*/
        ],
        search: checkContains('opera')
      },
      {
        name: 'Firefox',
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search: checkContains('firefox')
      },
      {
        name: 'Safari',
        versionRegexes: [
          normalVersionRegex,
          /.*?cpu os ([0-9]+)_([0-9]+).*/
        ],
        search: function (uastring) {
          return (contains$2(uastring, 'safari') || contains$2(uastring, 'mobile/')) && contains$2(uastring, 'applewebkit');
        }
      }
    ];
    var oses = [
      {
        name: 'Windows',
        search: checkContains('win'),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: 'iOS',
        search: function (uastring) {
          return contains$2(uastring, 'iphone') || contains$2(uastring, 'ipad');
        },
        versionRegexes: [
          /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
          /.*cpu os ([0-9]+)_([0-9]+).*/,
          /.*cpu iphone os ([0-9]+)_([0-9]+).*/
        ]
      },
      {
        name: 'Android',
        search: checkContains('android'),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: 'OSX',
        search: checkContains('mac os x'),
        versionRegexes: [/.*?mac\ os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      {
        name: 'Linux',
        search: checkContains('linux'),
        versionRegexes: []
      },
      {
        name: 'Solaris',
        search: checkContains('sunos'),
        versionRegexes: []
      },
      {
        name: 'FreeBSD',
        search: checkContains('freebsd'),
        versionRegexes: []
      },
      {
        name: 'ChromeOS',
        search: checkContains('cros'),
        versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/]
      }
    ];
    var PlatformInfo = {
      browsers: constant(browsers),
      oses: constant(oses)
    };

    var edge = 'Edge';
    var chrome = 'Chrome';
    var ie$1 = 'IE';
    var opera = 'Opera';
    var firefox = 'Firefox';
    var safari = 'Safari';
    var unknown$1 = function () {
      return nu$3({
        current: undefined,
        version: Version.unknown()
      });
    };
    var nu$3 = function (info) {
      var current = info.current;
      var version = info.version;
      var isBrowser = function (name) {
        return function () {
          return current === name;
        };
      };
      return {
        current: current,
        version: version,
        isEdge: isBrowser(edge),
        isChrome: isBrowser(chrome),
        isIE: isBrowser(ie$1),
        isOpera: isBrowser(opera),
        isFirefox: isBrowser(firefox),
        isSafari: isBrowser(safari)
      };
    };
    var Browser = {
      unknown: unknown$1,
      nu: nu$3,
      edge: constant(edge),
      chrome: constant(chrome),
      ie: constant(ie$1),
      opera: constant(opera),
      firefox: constant(firefox),
      safari: constant(safari)
    };

    var windows = 'Windows';
    var ios = 'iOS';
    var android = 'Android';
    var linux = 'Linux';
    var osx = 'OSX';
    var solaris = 'Solaris';
    var freebsd = 'FreeBSD';
    var chromeos = 'ChromeOS';
    var unknown = function () {
      return nu$2({
        current: undefined,
        version: Version.unknown()
      });
    };
    var nu$2 = function (info) {
      var current = info.current;
      var version = info.version;
      var isOS = function (name) {
        return function () {
          return current === name;
        };
      };
      return {
        current: current,
        version: version,
        isWindows: isOS(windows),
        isiOS: isOS(ios),
        isAndroid: isOS(android),
        isOSX: isOS(osx),
        isLinux: isOS(linux),
        isSolaris: isOS(solaris),
        isFreeBSD: isOS(freebsd),
        isChromeOS: isOS(chromeos)
      };
    };
    var OperatingSystem = {
      unknown: unknown,
      nu: nu$2,
      windows: constant(windows),
      ios: constant(ios),
      android: constant(android),
      linux: constant(linux),
      osx: constant(osx),
      solaris: constant(solaris),
      freebsd: constant(freebsd),
      chromeos: constant(chromeos)
    };

    var detect$1 = function (userAgent, userAgentDataOpt, mediaMatch) {
      var browsers = PlatformInfo.browsers();
      var oses = PlatformInfo.oses();
      var browser = userAgentDataOpt.bind(function (userAgentData) {
        return detectBrowser$1(browsers, userAgentData);
      }).orThunk(function () {
        return detectBrowser(browsers, userAgent);
      }).fold(Browser.unknown, Browser.nu);
      var os = detectOs(oses, userAgent).fold(OperatingSystem.unknown, OperatingSystem.nu);
      var deviceType = DeviceType(os, browser, userAgent, mediaMatch);
      return {
        browser: browser,
        os: os,
        deviceType: deviceType
      };
    };
    var PlatformDetection = { detect: detect$1 };

    var mediaMatch = function (query) {
      return window.matchMedia(query).matches;
    };
    var platform$2 = cached(function () {
      return PlatformDetection.detect(navigator.userAgent, Optional.from(navigator.userAgentData), mediaMatch);
    });
    var detect = function () {
      return platform$2();
    };

    var userAgent = navigator.userAgent;
    var platform$1 = detect();
    var browser$4 = platform$1.browser;
    var os = platform$1.os;
    var deviceType = platform$1.deviceType;
    var webkit = /WebKit/.test(userAgent) && !browser$4.isEdge();
    var fileApi = 'FormData' in window && 'FileReader' in window && 'URL' in window && !!URL.createObjectURL;
    var windowsPhone = userAgent.indexOf('Windows Phone') !== -1;
    var Env = {
      opera: browser$4.isOpera(),
      webkit: webkit,
      ie: browser$4.isIE() || browser$4.isEdge() ? browser$4.version.major : false,
      gecko: browser$4.isFirefox(),
      mac: os.isOSX() || os.isiOS(),
      iOS: deviceType.isiPad() || deviceType.isiPhone(),
      android: os.isAndroid(),
      contentEditable: true,
      transparentSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      caretAfter: true,
      range: window.getSelection && 'Range' in window,
      documentMode: browser$4.isIE() ? document.documentMode || 7 : 10,
      fileApi: fileApi,
      ceFalse: true,
      cacheSuffix: null,
      container: null,
      experimentalShadowDom: false,
      canHaveCSP: !browser$4.isIE(),
      desktop: deviceType.isDesktop(),
      windowsPhone: windowsPhone,
      browser: {
        current: browser$4.current,
        version: browser$4.version,
        isChrome: browser$4.isChrome,
        isEdge: browser$4.isEdge,
        isFirefox: browser$4.isFirefox,
        isIE: browser$4.isIE,
        isOpera: browser$4.isOpera,
        isSafari: browser$4.isSafari
      },
      os: {
        current: os.current,
        version: os.version,
        isAndroid: os.isAndroid,
        isChromeOS: os.isChromeOS,
        isFreeBSD: os.isFreeBSD,
        isiOS: os.isiOS,
        isLinux: os.isLinux,
        isOSX: os.isOSX,
        isSolaris: os.isSolaris,
        isWindows: os.isWindows
      },
      deviceType: {
        isDesktop: deviceType.isDesktop,
        isiPad: deviceType.isiPad,
        isiPhone: deviceType.isiPhone,
        isPhone: deviceType.isPhone,
        isTablet: deviceType.isTablet,
        isTouch: deviceType.isTouch,
        isWebView: deviceType.isWebView
      }
    };

    var whiteSpaceRegExp$2 = /^\s*|\s*$/g;
    var trim$3 = function (str) {
      return str === null || str === undefined ? '' : ('' + str).replace(whiteSpaceRegExp$2, '');
    };
    var is$3 = function (obj, type) {
      if (!type) {
        return obj !== undefined;
      }
      if (type === 'array' && isArray(obj)) {
        return true;
      }
      return typeof obj === type;
    };
    var makeMap$4 = function (items, delim, map) {
      var i;
      items = items || [];
      delim = delim || ',';
      if (typeof items === 'string') {
        items = items.split(delim);
      }
      map = map || {};
      i = items.length;
      while (i--) {
        map[items[i]] = {};
      }
      return map;
    };
    var hasOwnProperty = has$2;
    var create$9 = function (s, p, root) {
      var self = this;
      var sp, scn, c, de = 0;
      s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
      var cn = s[3].match(/(^|\.)(\w+)$/i)[2];
      var ns = self.createNS(s[3].replace(/\.\w+$/, ''), root);
      if (ns[cn]) {
        return;
      }
      if (s[2] === 'static') {
        ns[cn] = p;
        if (this.onCreate) {
          this.onCreate(s[2], s[3], ns[cn]);
        }
        return;
      }
      if (!p[cn]) {
        p[cn] = function () {
        };
        de = 1;
      }
      ns[cn] = p[cn];
      self.extend(ns[cn].prototype, p);
      if (s[5]) {
        sp = self.resolve(s[5]).prototype;
        scn = s[5].match(/\.(\w+)$/i)[1];
        c = ns[cn];
        if (de) {
          ns[cn] = function () {
            return sp[scn].apply(this, arguments);
          };
        } else {
          ns[cn] = function () {
            this.parent = sp[scn];
            return c.apply(this, arguments);
          };
        }
        ns[cn].prototype[cn] = ns[cn];
        self.each(sp, function (f, n) {
          ns[cn].prototype[n] = sp[n];
        });
        self.each(p, function (f, n) {
          if (sp[n]) {
            ns[cn].prototype[n] = function () {
              this.parent = sp[n];
              return f.apply(this, arguments);
            };
          } else {
            if (n !== cn) {
              ns[cn].prototype[n] = f;
            }
          }
        });
      }
      self.each(p.static, function (f, n) {
        ns[cn][n] = f;
      });
    };
    var extend$6 = function (obj) {
      var exts = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        exts[_i - 1] = arguments[_i];
      }
      for (var i = 0; i < exts.length; i++) {
        var ext = exts[i];
        for (var name_1 in ext) {
          if (has$2(ext, name_1)) {
            var value = ext[name_1];
            if (value !== undefined) {
              obj[name_1] = value;
            }
          }
        }
      }
      return obj;
    };
    var walk$3 = function (o, f, n, s) {
      s = s || this;
      if (o) {
        if (n) {
          o = o[n];
        }
        each$i(o, function (o, i) {
          if (f.call(s, o, i, n) === false) {
            return false;
          }
          walk$3(o, f, n, s);
        });
      }
    };
    var createNS = function (n, o) {
      var i, v;
      o = o || window;
      n = n.split('.');
      for (i = 0; i < n.length; i++) {
        v = n[i];
        if (!o[v]) {
          o[v] = {};
        }
        o = o[v];
      }
      return o;
    };
    var resolve$3 = function (n, o) {
      var i, l;
      o = o || window;
      n = n.split('.');
      for (i = 0, l = n.length; i < l; i++) {
        o = o[n[i]];
        if (!o) {
          break;
        }
      }
      return o;
    };
    var explode$4 = function (s, d) {
      if (!s || is$3(s, 'array')) {
        return s;
      }
      return map$1(s.split(d || ','), trim$3);
    };
    var _addCacheSuffix = function (url) {
      var cacheSuffix = Env.cacheSuffix;
      if (cacheSuffix) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + cacheSuffix;
      }
      return url;
    };
    var Tools = {
      trim: trim$3,
      isArray: isArray,
      is: is$3,
      toArray: toArray$1,
      makeMap: makeMap$4,
      each: each$i,
      map: map$1,
      grep: filter$2,
      inArray: indexOf$1,
      hasOwn: hasOwnProperty,
      extend: extend$6,
      create: create$9,
      walk: walk$3,
      createNS: createNS,
      resolve: resolve$3,
      explode: explode$4,
      _addCacheSuffix: _addCacheSuffix
    };

    var fromHtml$1 = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      if (!div.hasChildNodes() || div.childNodes.length > 1) {
        console.error('HTML does not have a single root node', html);
        throw new Error('HTML must have a single root node');
      }
      return fromDom$2(div.childNodes[0]);
    };
    var fromTag = function (tag, scope) {
      var doc = scope || document;
      var node = doc.createElement(tag);
      return fromDom$2(node);
    };
    var fromText = function (text, scope) {
      var doc = scope || document;
      var node = doc.createTextNode(text);
      return fromDom$2(node);
    };
    var fromDom$2 = function (node) {
      if (node === null || node === undefined) {
        throw new Error('Node cannot be null or undefined');
      }
      return { dom: node };
    };
    var fromPoint$1 = function (docElm, x, y) {
      return Optional.from(docElm.dom.elementFromPoint(x, y)).map(fromDom$2);
    };
    var SugarElement = {
      fromHtml: fromHtml$1,
      fromTag: fromTag,
      fromText: fromText,
      fromDom: fromDom$2,
      fromPoint: fromPoint$1
    };

    var toArray = function (target, f) {
      var r = [];
      var recurse = function (e) {
        r.push(e);
        return f(e);
      };
      var cur = f(target);
      do {
        cur = cur.bind(recurse);
      } while (cur.isSome());
      return r;
    };

    var compareDocumentPosition = function (a, b, match) {
      return (a.compareDocumentPosition(b) & match) !== 0;
    };
    var documentPositionContainedBy = function (a, b) {
      return compareDocumentPosition(a, b, Node.DOCUMENT_POSITION_CONTAINED_BY);
    };

    var COMMENT = 8;
    var DOCUMENT = 9;
    var DOCUMENT_FRAGMENT = 11;
    var ELEMENT = 1;
    var TEXT = 3;

    var is$2 = function (element, selector) {
      var dom = element.dom;
      if (dom.nodeType !== ELEMENT) {
        return false;
      } else {
        var elem = dom;
        if (elem.matches !== undefined) {
          return elem.matches(selector);
        } else if (elem.msMatchesSelector !== undefined) {
          return elem.msMatchesSelector(selector);
        } else if (elem.webkitMatchesSelector !== undefined) {
          return elem.webkitMatchesSelector(selector);
        } else if (elem.mozMatchesSelector !== undefined) {
          return elem.mozMatchesSelector(selector);
        } else {
          throw new Error('Browser lacks native selectors');
        }
      }
    };
    var bypassSelector = function (dom) {
      return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT && dom.nodeType !== DOCUMENT_FRAGMENT || dom.childElementCount === 0;
    };
    var all = function (selector, scope) {
      var base = scope === undefined ? document : scope.dom;
      return bypassSelector(base) ? [] : map$3(base.querySelectorAll(selector), SugarElement.fromDom);
    };
    var one = function (selector, scope) {
      var base = scope === undefined ? document : scope.dom;
      return bypassSelector(base) ? Optional.none() : Optional.from(base.querySelector(selector)).map(SugarElement.fromDom);
    };

    var eq = function (e1, e2) {
      return e1.dom === e2.dom;
    };
    var regularContains = function (e1, e2) {
      var d1 = e1.dom;
      var d2 = e2.dom;
      return d1 === d2 ? false : d1.contains(d2);
    };
    var ieContains = function (e1, e2) {
      return documentPositionContainedBy(e1.dom, e2.dom);
    };
    var contains$1 = function (e1, e2) {
      return detect().browser.isIE() ? ieContains(e1, e2) : regularContains(e1, e2);
    };

    typeof window !== 'undefined' ? window : Function('return this;')();

    var name = function (element) {
      var r = element.dom.nodeName;
      return r.toLowerCase();
    };
    var type = function (element) {
      return element.dom.nodeType;
    };
    var isType = function (t) {
      return function (element) {
        return type(element) === t;
      };
    };
    var isComment$1 = function (element) {
      return type(element) === COMMENT || name(element) === '#comment';
    };
    var isElement$6 = isType(ELEMENT);
    var isText$8 = isType(TEXT);
    var isDocument$2 = isType(DOCUMENT);
    var isDocumentFragment$1 = isType(DOCUMENT_FRAGMENT);
    var isTag = function (tag) {
      return function (e) {
        return isElement$6(e) && name(e) === tag;
      };
    };

    var owner$1 = function (element) {
      return SugarElement.fromDom(element.dom.ownerDocument);
    };
    var documentOrOwner = function (dos) {
      return isDocument$2(dos) ? dos : owner$1(dos);
    };
    var documentElement = function (element) {
      return SugarElement.fromDom(documentOrOwner(element).dom.documentElement);
    };
    var defaultView = function (element) {
      return SugarElement.fromDom(documentOrOwner(element).dom.defaultView);
    };
    var parent = function (element) {
      return Optional.from(element.dom.parentNode).map(SugarElement.fromDom);
    };
    var parents$1 = function (element, isRoot) {
      var stop = isFunction(isRoot) ? isRoot : never;
      var dom = element.dom;
      var ret = [];
      while (dom.parentNode !== null && dom.parentNode !== undefined) {
        var rawParent = dom.parentNode;
        var p = SugarElement.fromDom(rawParent);
        ret.push(p);
        if (stop(p) === true) {
          break;
        } else {
          dom = rawParent;
        }
      }
      return ret;
    };
    var siblings = function (element) {
      var filterSelf = function (elements) {
        return filter$4(elements, function (x) {
          return !eq(element, x);
        });
      };
      return parent(element).map(children).map(filterSelf).getOr([]);
    };
    var prevSibling = function (element) {
      return Optional.from(element.dom.previousSibling).map(SugarElement.fromDom);
    };
    var nextSibling = function (element) {
      return Optional.from(element.dom.nextSibling).map(SugarElement.fromDom);
    };
    var prevSiblings = function (element) {
      return reverse(toArray(element, prevSibling));
    };
    var nextSiblings = function (element) {
      return toArray(element, nextSibling);
    };
    var children = function (element) {
      return map$3(element.dom.childNodes, SugarElement.fromDom);
    };
    var child$1 = function (element, index) {
      var cs = element.dom.childNodes;
      return Optional.from(cs[index]).map(SugarElement.fromDom);
    };
    var firstChild = function (element) {
      return child$1(element, 0);
    };
    var lastChild = function (element) {
      return child$1(element, element.dom.childNodes.length - 1);
    };
    var childNodesCount = function (element) {
      return element.dom.childNodes.length;
    };

    var getHead = function (doc) {
      var b = doc.dom.head;
      if (b === null || b === undefined) {
        throw new Error('Head is not available yet');
      }
      return SugarElement.fromDom(b);
    };

    var isShadowRoot = function (dos) {
      return isDocumentFragment$1(dos) && isNonNullable(dos.dom.host);
    };
    var supported = isFunction(Element.prototype.attachShadow) && isFunction(Node.prototype.getRootNode);
    var isSupported$1 = constant(supported);
    var getRootNode = supported ? function (e) {
      return SugarElement.fromDom(e.dom.getRootNode());
    } : documentOrOwner;
    var getStyleContainer = function (dos) {
      return isShadowRoot(dos) ? dos : getHead(documentOrOwner(dos));
    };
    var getShadowRoot = function (e) {
      var r = getRootNode(e);
      return isShadowRoot(r) ? Optional.some(r) : Optional.none();
    };
    var getShadowHost = function (e) {
      return SugarElement.fromDom(e.dom.host);
    };
    var getOriginalEventTarget = function (event) {
      if (isSupported$1() && isNonNullable(event.target)) {
        var el = SugarElement.fromDom(event.target);
        if (isElement$6(el) && isOpenShadowHost(el)) {
          if (event.composed && event.composedPath) {
            var composedPath = event.composedPath();
            if (composedPath) {
              return head(composedPath);
            }
          }
        }
      }
      return Optional.from(event.target);
    };
    var isOpenShadowHost = function (element) {
      return isNonNullable(element.dom.shadowRoot);
    };

    var before$4 = function (marker, element) {
      var parent$1 = parent(marker);
      parent$1.each(function (v) {
        v.dom.insertBefore(element.dom, marker.dom);
      });
    };
    var after$3 = function (marker, element) {
      var sibling = nextSibling(marker);
      sibling.fold(function () {
        var parent$1 = parent(marker);
        parent$1.each(function (v) {
          append$1(v, element);
        });
      }, function (v) {
        before$4(v, element);
      });
    };
    var prepend = function (parent, element) {
      var firstChild$1 = firstChild(parent);
      firstChild$1.fold(function () {
        append$1(parent, element);
      }, function (v) {
        parent.dom.insertBefore(element.dom, v.dom);
      });
    };
    var append$1 = function (parent, element) {
      parent.dom.appendChild(element.dom);
    };
    var wrap$3 = function (element, wrapper) {
      before$4(element, wrapper);
      append$1(wrapper, element);
    };

    var before$3 = function (marker, elements) {
      each$k(elements, function (x) {
        before$4(marker, x);
      });
    };
    var append = function (parent, elements) {
      each$k(elements, function (x) {
        append$1(parent, x);
      });
    };

    var empty = function (element) {
      element.dom.textContent = '';
      each$k(children(element), function (rogue) {
        remove$7(rogue);
      });
    };
    var remove$7 = function (element) {
      var dom = element.dom;
      if (dom.parentNode !== null) {
        dom.parentNode.removeChild(dom);
      }
    };
    var unwrap = function (wrapper) {
      var children$1 = children(wrapper);
      if (children$1.length > 0) {
        before$3(wrapper, children$1);
      }
      remove$7(wrapper);
    };

    var inBody = function (element) {
      var dom = isText$8(element) ? element.dom.parentNode : element.dom;
      if (dom === undefined || dom === null || dom.ownerDocument === null) {
        return false;
      }
      var doc = dom.ownerDocument;
      return getShadowRoot(SugarElement.fromDom(dom)).fold(function () {
        return doc.body.contains(dom);
      }, compose1(inBody, getShadowHost));
    };

    var r = function (left, top) {
      var translate = function (x, y) {
        return r(left + x, top + y);
      };
      return {
        left: left,
        top: top,
        translate: translate
      };
    };
    var SugarPosition = r;

    var boxPosition = function (dom) {
      var box = dom.getBoundingClientRect();
      return SugarPosition(box.left, box.top);
    };
    var firstDefinedOrZero = function (a, b) {
      if (a !== undefined) {
        return a;
      } else {
        return b !== undefined ? b : 0;
      }
    };
    var absolute = function (element) {
      var doc = element.dom.ownerDocument;
      var body = doc.body;
      var win = doc.defaultView;
      var html = doc.documentElement;
      if (body === element.dom) {
        return SugarPosition(body.offsetLeft, body.offsetTop);
      }
      var scrollTop = firstDefinedOrZero(win === null || win === void 0 ? void 0 : win.pageYOffset, html.scrollTop);
      var scrollLeft = firstDefinedOrZero(win === null || win === void 0 ? void 0 : win.pageXOffset, html.scrollLeft);
      var clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
      var clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);
      return viewport(element).translate(scrollLeft - clientLeft, scrollTop - clientTop);
    };
    var viewport = function (element) {
      var dom = element.dom;
      var doc = dom.ownerDocument;
      var body = doc.body;
      if (body === dom) {
        return SugarPosition(body.offsetLeft, body.offsetTop);
      }
      if (!inBody(element)) {
        return SugarPosition(0, 0);
      }
      return boxPosition(dom);
    };

    var get$8 = function (_DOC) {
      var doc = _DOC !== undefined ? _DOC.dom : document;
      var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
      var y = doc.body.scrollTop || doc.documentElement.scrollTop;
      return SugarPosition(x, y);
    };
    var to = function (x, y, _DOC) {
      var doc = _DOC !== undefined ? _DOC.dom : document;
      var win = doc.defaultView;
      if (win) {
        win.scrollTo(x, y);
      }
    };
    var intoView = function (element, alignToTop) {
      var isSafari = detect().browser.isSafari();
      if (isSafari && isFunction(element.dom.scrollIntoViewIfNeeded)) {
        element.dom.scrollIntoViewIfNeeded(false);
      } else {
        element.dom.scrollIntoView(alignToTop);
      }
    };

    var get$7 = function (_win) {
      var win = _win === undefined ? window : _win;
      return Optional.from(win['visualViewport']);
    };
    var bounds = function (x, y, width, height) {
      return {
        x: x,
        y: y,
        width: width,
        height: height,
        right: x + width,
        bottom: y + height
      };
    };
    var getBounds = function (_win) {
      var win = _win === undefined ? window : _win;
      var doc = win.document;
      var scroll = get$8(SugarElement.fromDom(doc));
      return get$7(win).fold(function () {
        var html = win.document.documentElement;
        var width = html.clientWidth;
        var height = html.clientHeight;
        return bounds(scroll.left, scroll.top, width, height);
      }, function (visualViewport) {
        return bounds(Math.max(visualViewport.pageLeft, scroll.left), Math.max(visualViewport.pageTop, scroll.top), visualViewport.width, visualViewport.height);
      });
    };

    var isNodeType = function (type) {
      return function (node) {
        return !!node && node.nodeType === type;
      };
    };
    var isRestrictedNode = function (node) {
      return !!node && !Object.getPrototypeOf(node);
    };
    var isElement$5 = isNodeType(1);
    var matchNodeNames = function (names) {
      var lowercasedNames = names.map(function (s) {
        return s.toLowerCase();
      });
      return function (node) {
        if (node && node.nodeName) {
          var nodeName = node.nodeName.toLowerCase();
          return contains$3(lowercasedNames, nodeName);
        }
        return false;
      };
    };
    var matchStyleValues = function (name, values) {
      var items = values.toLowerCase().split(' ');
      return function (node) {
        if (isElement$5(node)) {
          for (var i = 0; i < items.length; i++) {
            var computed = node.ownerDocument.defaultView.getComputedStyle(node, null);
            var cssValue = computed ? computed.getPropertyValue(name) : null;
            if (cssValue === items[i]) {
              return true;
            }
          }
        }
        return false;
      };
    };
    var hasAttribute = function (attrName) {
      return function (node) {
        return isElement$5(node) && node.hasAttribute(attrName);
      };
    };
    var hasAttributeValue = function (attrName, attrValue) {
      return function (node) {
        return isElement$5(node) && node.getAttribute(attrName) === attrValue;
      };
    };
    var isBogus$2 = function (node) {
      return isElement$5(node) && node.hasAttribute('data-mce-bogus');
    };
    var isBogusAll$1 = function (node) {
      return isElement$5(node) && node.getAttribute('data-mce-bogus') === 'all';
    };
    var isTable$3 = function (node) {
      return isElement$5(node) && node.tagName === 'TABLE';
    };
    var hasContentEditableState = function (value) {
      return function (node) {
        if (isElement$5(node)) {
          if (node.contentEditable === value) {
            return true;
          }
          if (node.getAttribute('data-mce-contenteditable') === value) {
            return true;
          }
        }
        return false;
      };
    };
    var isTextareaOrInput = matchNodeNames([
      'textarea',
      'input'
    ]);
    var isText$7 = isNodeType(3);
    var isComment = isNodeType(8);
    var isDocument$1 = isNodeType(9);
    var isDocumentFragment = isNodeType(11);
    var isBr$5 = matchNodeNames(['br']);
    var isImg = matchNodeNames(['img']);
    var isContentEditableTrue$4 = hasContentEditableState('true');
    var isContentEditableFalse$b = hasContentEditableState('false');
    var isTableCell$5 = matchNodeNames([
      'td',
      'th'
    ]);
    var isMedia$2 = matchNodeNames([
      'video',
      'audio',
      'object',
      'embed'
    ]);

    var is$1 = function (lhs, rhs, comparator) {
      if (comparator === void 0) {
        comparator = tripleEquals;
      }
      return lhs.exists(function (left) {
        return comparator(left, rhs);
      });
    };
    var cat = function (arr) {
      var r = [];
      var push = function (x) {
        r.push(x);
      };
      for (var i = 0; i < arr.length; i++) {
        arr[i].each(push);
      }
      return r;
    };
    var lift2 = function (oa, ob, f) {
      return oa.isSome() && ob.isSome() ? Optional.some(f(oa.getOrDie(), ob.getOrDie())) : Optional.none();
    };
    var lift3 = function (oa, ob, oc, f) {
      return oa.isSome() && ob.isSome() && oc.isSome() ? Optional.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie())) : Optional.none();
    };
    var someIf = function (b, a) {
      return b ? Optional.some(a) : Optional.none();
    };

    var isSupported = function (dom) {
      return dom.style !== undefined && isFunction(dom.style.getPropertyValue);
    };

    var rawSet = function (dom, key, value) {
      if (isString$1(value) || isBoolean(value) || isNumber(value)) {
        dom.setAttribute(key, value + '');
      } else {
        console.error('Invalid call to Attribute.set. Key ', key, ':: Value ', value, ':: Element ', dom);
        throw new Error('Attribute value was not simple');
      }
    };
    var set$1 = function (element, key, value) {
      rawSet(element.dom, key, value);
    };
    var setAll$1 = function (element, attrs) {
      var dom = element.dom;
      each$j(attrs, function (v, k) {
        rawSet(dom, k, v);
      });
    };
    var get$6 = function (element, key) {
      var v = element.dom.getAttribute(key);
      return v === null ? undefined : v;
    };
    var getOpt = function (element, key) {
      return Optional.from(get$6(element, key));
    };
    var has$1 = function (element, key) {
      var dom = element.dom;
      return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
    };
    var remove$6 = function (element, key) {
      element.dom.removeAttribute(key);
    };
    var clone$3 = function (element) {
      return foldl(element.dom.attributes, function (acc, attr) {
        acc[attr.name] = attr.value;
        return acc;
      }, {});
    };

    var internalSet = function (dom, property, value) {
      if (!isString$1(value)) {
        console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
        throw new Error('CSS value must be a string: ' + value);
      }
      if (isSupported(dom)) {
        dom.style.setProperty(property, value);
      }
    };
    var setAll = function (element, css) {
      var dom = element.dom;
      each$j(css, function (v, k) {
        internalSet(dom, k, v);
      });
    };
    var get$5 = function (element, property) {
      var dom = element.dom;
      var styles = window.getComputedStyle(dom);
      var r = styles.getPropertyValue(property);
      return r === '' && !inBody(element) ? getUnsafeProperty(dom, property) : r;
    };
    var getUnsafeProperty = function (dom, property) {
      return isSupported(dom) ? dom.style.getPropertyValue(property) : '';
    };
    var getRaw = function (element, property) {
      var dom = element.dom;
      var raw = getUnsafeProperty(dom, property);
      return Optional.from(raw).filter(function (r) {
        return r.length > 0;
      });
    };
    var getAllRaw = function (element) {
      var css = {};
      var dom = element.dom;
      if (isSupported(dom)) {
        for (var i = 0; i < dom.style.length; i++) {
          var ruleName = dom.style.item(i);
          css[ruleName] = dom.style[ruleName];
        }
      }
      return css;
    };
    var reflow = function (e) {
      return e.dom.offsetWidth;
    };

    var browser$3 = detect().browser;
    var firstElement = function (nodes) {
      return find$3(nodes, isElement$6);
    };
    var getTableCaptionDeltaY = function (elm) {
      if (browser$3.isFirefox() && name(elm) === 'table') {
        return firstElement(children(elm)).filter(function (elm) {
          return name(elm) === 'caption';
        }).bind(function (caption) {
          return firstElement(nextSiblings(caption)).map(function (body) {
            var bodyTop = body.dom.offsetTop;
            var captionTop = caption.dom.offsetTop;
            var captionHeight = caption.dom.offsetHeight;
            return bodyTop <= captionTop ? -captionHeight : 0;
          });
        }).getOr(0);
      } else {
        return 0;
      }
    };
    var hasChild = function (elm, child) {
      return elm.children && contains$3(elm.children, child);
    };
    var getPos = function (body, elm, rootElm) {
      var x = 0, y = 0;
      var doc = body.ownerDocument;
      rootElm = rootElm ? rootElm : body;
      if (elm) {
        if (rootElm === body && elm.getBoundingClientRect && get$5(SugarElement.fromDom(body), 'position') === 'static') {
          var pos = elm.getBoundingClientRect();
          x = pos.left + (doc.documentElement.scrollLeft || body.scrollLeft) - doc.documentElement.clientLeft;
          y = pos.top + (doc.documentElement.scrollTop || body.scrollTop) - doc.documentElement.clientTop;
          return {
            x: x,
            y: y
          };
        }
        var offsetParent = elm;
        while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType && !hasChild(offsetParent, rootElm)) {
          var castOffsetParent = offsetParent;
          x += castOffsetParent.offsetLeft || 0;
          y += castOffsetParent.offsetTop || 0;
          offsetParent = castOffsetParent.offsetParent;
        }
        offsetParent = elm.parentNode;
        while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType && !hasChild(offsetParent, rootElm)) {
          x -= offsetParent.scrollLeft || 0;
          y -= offsetParent.scrollTop || 0;
          offsetParent = offsetParent.parentNode;
        }
        y += getTableCaptionDeltaY(SugarElement.fromDom(elm));
      }
      return {
        x: x,
        y: y
      };
    };

    var exports$1 = {}, module$1 = { exports: exports$1 };
    (function (define, exports, module, require) {
      (function (f) {
        if (typeof exports === 'object' && typeof module !== 'undefined') {
          module.exports = f();
        } else if (typeof define === 'function' && define.amd) {
          define([], f);
        } else {
          var g;
          if (typeof window !== 'undefined') {
            g = window;
          } else if (typeof global !== 'undefined') {
            g = global;
          } else if (typeof self !== 'undefined') {
            g = self;
          } else {
            g = this;
          }
          g.EphoxContactWrapper = f();
        }
      }(function () {
        return function () {
          function r(e, n, t) {
            function o(i, f) {
              if (!n[i]) {
                if (!e[i]) {
                  var c = 'function' == typeof require && require;
                  if (!f && c)
                    return c(i, !0);
                  if (u)
                    return u(i, !0);
                  var a = new Error('Cannot find module \'' + i + '\'');
                  throw a.code = 'MODULE_NOT_FOUND', a;
                }
                var p = n[i] = { exports: {} };
                e[i][0].call(p.exports, function (r) {
                  var n = e[i][1][r];
                  return o(n || r);
                }, p, p.exports, r, e, n, t);
              }
              return n[i].exports;
            }
            for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++)
              o(t[i]);
            return o;
          }
          return r;
        }()({
          1: [
            function (require, module, exports) {
              var process = module.exports = {};
              var cachedSetTimeout;
              var cachedClearTimeout;
              function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
              }
              function defaultClearTimeout() {
                throw new Error('clearTimeout has not been defined');
              }
              (function () {
                try {
                  if (typeof setTimeout === 'function') {
                    cachedSetTimeout = setTimeout;
                  } else {
                    cachedSetTimeout = defaultSetTimout;
                  }
                } catch (e) {
                  cachedSetTimeout = defaultSetTimout;
                }
                try {
                  if (typeof clearTimeout === 'function') {
                    cachedClearTimeout = clearTimeout;
                  } else {
                    cachedClearTimeout = defaultClearTimeout;
                  }
                } catch (e) {
                  cachedClearTimeout = defaultClearTimeout;
                }
              }());
              function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                  return setTimeout(fun, 0);
                }
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                  cachedSetTimeout = setTimeout;
                  return setTimeout(fun, 0);
                }
                try {
                  return cachedSetTimeout(fun, 0);
                } catch (e) {
                  try {
                    return cachedSetTimeout.call(null, fun, 0);
                  } catch (e) {
                    return cachedSetTimeout.call(this, fun, 0);
                  }
                }
              }
              function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                  return clearTimeout(marker);
                }
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                  cachedClearTimeout = clearTimeout;
                  return clearTimeout(marker);
                }
                try {
                  return cachedClearTimeout(marker);
                } catch (e) {
                  try {
                    return cachedClearTimeout.call(null, marker);
                  } catch (e) {
                    return cachedClearTimeout.call(this, marker);
                  }
                }
              }
              var queue = [];
              var draining = false;
              var currentQueue;
              var queueIndex = -1;
              function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                  return;
                }
                draining = false;
                if (currentQueue.length) {
                  queue = currentQueue.concat(queue);
                } else {
                  queueIndex = -1;
                }
                if (queue.length) {
                  drainQueue();
                }
              }
              function drainQueue() {
                if (draining) {
                  return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;
                var len = queue.length;
                while (len) {
                  currentQueue = queue;
                  queue = [];
                  while (++queueIndex < len) {
                    if (currentQueue) {
                      currentQueue[queueIndex].run();
                    }
                  }
                  queueIndex = -1;
                  len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
              }
              process.nextTick = function (fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                  for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                  }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                  runTimeout(drainQueue);
                }
              };
              function Item(fun, array) {
                this.fun = fun;
                this.array = array;
              }
              Item.prototype.run = function () {
                this.fun.apply(null, this.array);
              };
              process.title = 'browser';
              process.browser = true;
              process.env = {};
              process.argv = [];
              process.version = '';
              process.versions = {};
              function noop() {
              }
              process.on = noop;
              process.addListener = noop;
              process.once = noop;
              process.off = noop;
              process.removeListener = noop;
              process.removeAllListeners = noop;
              process.emit = noop;
              process.prependListener = noop;
              process.prependOnceListener = noop;
              process.listeners = function (name) {
                return [];
              };
              process.binding = function (name) {
                throw new Error('process.binding is not supported');
              };
              process.cwd = function () {
                return '/';
              };
              process.chdir = function (dir) {
                throw new Error('process.chdir is not supported');
              };
              process.umask = function () {
                return 0;
              };
            },
            {}
          ],
          2: [
            function (require, module, exports) {
              (function (setImmediate) {
                (function (root) {
                  var setTimeoutFunc = setTimeout;
                  function noop() {
                  }
                  function bind(fn, thisArg) {
                    return function () {
                      fn.apply(thisArg, arguments);
                    };
                  }
                  function Promise(fn) {
                    if (typeof this !== 'object')
                      throw new TypeError('Promises must be constructed via new');
                    if (typeof fn !== 'function')
                      throw new TypeError('not a function');
                    this._state = 0;
                    this._handled = false;
                    this._value = undefined;
                    this._deferreds = [];
                    doResolve(fn, this);
                  }
                  function handle(self, deferred) {
                    while (self._state === 3) {
                      self = self._value;
                    }
                    if (self._state === 0) {
                      self._deferreds.push(deferred);
                      return;
                    }
                    self._handled = true;
                    Promise._immediateFn(function () {
                      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
                      if (cb === null) {
                        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                        return;
                      }
                      var ret;
                      try {
                        ret = cb(self._value);
                      } catch (e) {
                        reject(deferred.promise, e);
                        return;
                      }
                      resolve(deferred.promise, ret);
                    });
                  }
                  function resolve(self, newValue) {
                    try {
                      if (newValue === self)
                        throw new TypeError('A promise cannot be resolved with itself.');
                      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                        var then = newValue.then;
                        if (newValue instanceof Promise) {
                          self._state = 3;
                          self._value = newValue;
                          finale(self);
                          return;
                        } else if (typeof then === 'function') {
                          doResolve(bind(then, newValue), self);
                          return;
                        }
                      }
                      self._state = 1;
                      self._value = newValue;
                      finale(self);
                    } catch (e) {
                      reject(self, e);
                    }
                  }
                  function reject(self, newValue) {
                    self._state = 2;
                    self._value = newValue;
                    finale(self);
                  }
                  function finale(self) {
                    if (self._state === 2 && self._deferreds.length === 0) {
                      Promise._immediateFn(function () {
                        if (!self._handled) {
                          Promise._unhandledRejectionFn(self._value);
                        }
                      });
                    }
                    for (var i = 0, len = self._deferreds.length; i < len; i++) {
                      handle(self, self._deferreds[i]);
                    }
                    self._deferreds = null;
                  }
                  function Handler(onFulfilled, onRejected, promise) {
                    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
                    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
                    this.promise = promise;
                  }
                  function doResolve(fn, self) {
                    var done = false;
                    try {
                      fn(function (value) {
                        if (done)
                          return;
                        done = true;
                        resolve(self, value);
                      }, function (reason) {
                        if (done)
                          return;
                        done = true;
                        reject(self, reason);
                      });
                    } catch (ex) {
                      if (done)
                        return;
                      done = true;
                      reject(self, ex);
                    }
                  }
                  Promise.prototype['catch'] = function (onRejected) {
                    return this.then(null, onRejected);
                  };
                  Promise.prototype.then = function (onFulfilled, onRejected) {
                    var prom = new this.constructor(noop);
                    handle(this, new Handler(onFulfilled, onRejected, prom));
                    return prom;
                  };
                  Promise.all = function (arr) {
                    var args = Array.prototype.slice.call(arr);
                    return new Promise(function (resolve, reject) {
                      if (args.length === 0)
                        return resolve([]);
                      var remaining = args.length;
                      function res(i, val) {
                        try {
                          if (val && (typeof val === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                              then.call(val, function (val) {
                                res(i, val);
                              }, reject);
                              return;
                            }
                          }
                          args[i] = val;
                          if (--remaining === 0) {
                            resolve(args);
                          }
                        } catch (ex) {
                          reject(ex);
                        }
                      }
                      for (var i = 0; i < args.length; i++) {
                        res(i, args[i]);
                      }
                    });
                  };
                  Promise.resolve = function (value) {
                    if (value && typeof value === 'object' && value.constructor === Promise) {
                      return value;
                    }
                    return new Promise(function (resolve) {
                      resolve(value);
                    });
                  };
                  Promise.reject = function (value) {
                    return new Promise(function (resolve, reject) {
                      reject(value);
                    });
                  };
                  Promise.race = function (values) {
                    return new Promise(function (resolve, reject) {
                      for (var i = 0, len = values.length; i < len; i++) {
                        values[i].then(resolve, reject);
                      }
                    });
                  };
                  Promise._immediateFn = typeof setImmediate === 'function' ? function (fn) {
                    setImmediate(fn);
                  } : function (fn) {
                    setTimeoutFunc(fn, 0);
                  };
                  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
                    if (typeof console !== 'undefined' && console) {
                      console.warn('Possible Unhandled Promise Rejection:', err);
                    }
                  };
                  Promise._setImmediateFn = function _setImmediateFn(fn) {
                    Promise._immediateFn = fn;
                  };
                  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
                    Promise._unhandledRejectionFn = fn;
                  };
                  if (typeof module !== 'undefined' && module.exports) {
                    module.exports = Promise;
                  } else if (!root.Promise) {
                    root.Promise = Promise;
                  }
                }(this));
              }.call(this, require('timers').setImmediate));
            },
            { 'timers': 3 }
          ],
          3: [
            function (require, module, exports) {
              (function (setImmediate, clearImmediate) {
                var nextTick = require('process/browser.js').nextTick;
                var apply = Function.prototype.apply;
                var slice = Array.prototype.slice;
                var immediateIds = {};
                var nextImmediateId = 0;
                exports.setTimeout = function () {
                  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
                };
                exports.setInterval = function () {
                  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
                };
                exports.clearTimeout = exports.clearInterval = function (timeout) {
                  timeout.close();
                };
                function Timeout(id, clearFn) {
                  this._id = id;
                  this._clearFn = clearFn;
                }
                Timeout.prototype.unref = Timeout.prototype.ref = function () {
                };
                Timeout.prototype.close = function () {
                  this._clearFn.call(window, this._id);
                };
                exports.enroll = function (item, msecs) {
                  clearTimeout(item._idleTimeoutId);
                  item._idleTimeout = msecs;
                };
                exports.unenroll = function (item) {
                  clearTimeout(item._idleTimeoutId);
                  item._idleTimeout = -1;
                };
                exports._unrefActive = exports.active = function (item) {
                  clearTimeout(item._idleTimeoutId);
                  var msecs = item._idleTimeout;
                  if (msecs >= 0) {
                    item._idleTimeoutId = setTimeout(function onTimeout() {
                      if (item._onTimeout)
                        item._onTimeout();
                    }, msecs);
                  }
                };
                exports.setImmediate = typeof setImmediate === 'function' ? setImmediate : function (fn) {
                  var id = nextImmediateId++;
                  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
                  immediateIds[id] = true;
                  nextTick(function onNextTick() {
                    if (immediateIds[id]) {
                      if (args) {
                        fn.apply(null, args);
                      } else {
                        fn.call(null);
                      }
                      exports.clearImmediate(id);
                    }
                  });
                  return id;
                };
                exports.clearImmediate = typeof clearImmediate === 'function' ? clearImmediate : function (id) {
                  delete immediateIds[id];
                };
              }.call(this, require('timers').setImmediate, require('timers').clearImmediate));
            },
            {
              'process/browser.js': 1,
              'timers': 3
            }
          ],
          4: [
            function (require, module, exports) {
              var promisePolyfill = require('promise-polyfill');
              var Global = function () {
                if (typeof window !== 'undefined') {
                  return window;
                } else {
                  return Function('return this;')();
                }
              }();
              module.exports = { boltExport: Global.Promise || promisePolyfill };
            },
            { 'promise-polyfill': 2 }
          ]
        }, {}, [4])(4);
      }));
    }(undefined, exports$1, module$1, undefined));
    var Promise$1 = module$1.exports.boltExport;

    var nu$1 = function (baseFn) {
      var data = Optional.none();
      var callbacks = [];
      var map = function (f) {
        return nu$1(function (nCallback) {
          get(function (data) {
            nCallback(f(data));
          });
        });
      };
      var get = function (nCallback) {
        if (isReady()) {
          call(nCallback);
        } else {
          callbacks.push(nCallback);
        }
      };
      var set = function (x) {
        if (!isReady()) {
          data = Optional.some(x);
          run(callbacks);
          callbacks = [];
        }
      };
      var isReady = function () {
        return data.isSome();
      };
      var run = function (cbs) {
        each$k(cbs, call);
      };
      var call = function (cb) {
        data.each(function (x) {
          setTimeout(function () {
            cb(x);
          }, 0);
        });
      };
      baseFn(set);
      return {
        get: get,
        map: map,
        isReady: isReady
      };
    };
    var pure$1 = function (a) {
      return nu$1(function (callback) {
        callback(a);
      });
    };
    var LazyValue = {
      nu: nu$1,
      pure: pure$1
    };

    var errorReporter = function (err) {
      setTimeout(function () {
        throw err;
      }, 0);
    };
    var make = function (run) {
      var get = function (callback) {
        run().then(callback, errorReporter);
      };
      var map = function (fab) {
        return make(function () {
          return run().then(fab);
        });
      };
      var bind = function (aFutureB) {
        return make(function () {
          return run().then(function (v) {
            return aFutureB(v).toPromise();
          });
        });
      };
      var anonBind = function (futureB) {
        return make(function () {
          return run().then(function () {
            return futureB.toPromise();
          });
        });
      };
      var toLazy = function () {
        return LazyValue.nu(get);
      };
      var toCached = function () {
        var cache = null;
        return make(function () {
          if (cache === null) {
            cache = run();
          }
          return cache;
        });
      };
      var toPromise = run;
      return {
        map: map,
        bind: bind,
        anonBind: anonBind,
        toLazy: toLazy,
        toCached: toCached,
        toPromise: toPromise,
        get: get
      };
    };
    var nu = function (baseFn) {
      return make(function () {
        return new Promise$1(baseFn);
      });
    };
    var pure = function (a) {
      return make(function () {
        return Promise$1.resolve(a);
      });
    };
    var Future = {
      nu: nu,
      pure: pure
    };

    var par$1 = function (asyncValues, nu) {
      return nu(function (callback) {
        var r = [];
        var count = 0;
        var cb = function (i) {
          return function (value) {
            r[i] = value;
            count++;
            if (count >= asyncValues.length) {
              callback(r);
            }
          };
        };
        if (asyncValues.length === 0) {
          callback([]);
        } else {
          each$k(asyncValues, function (asyncValue, i) {
            asyncValue.get(cb(i));
          });
        }
      });
    };

    var par = function (futures) {
      return par$1(futures, Future.nu);
    };

    var value$1 = function (o) {
      var or = function (_opt) {
        return value$1(o);
      };
      var orThunk = function (_f) {
        return value$1(o);
      };
      var map = function (f) {
        return value$1(f(o));
      };
      var mapError = function (_f) {
        return value$1(o);
      };
      var each = function (f) {
        f(o);
      };
      var bind = function (f) {
        return f(o);
      };
      var fold = function (_, onValue) {
        return onValue(o);
      };
      var exists = function (f) {
        return f(o);
      };
      var forall = function (f) {
        return f(o);
      };
      var toOptional = function () {
        return Optional.some(o);
      };
      return {
        isValue: always,
        isError: never,
        getOr: constant(o),
        getOrThunk: constant(o),
        getOrDie: constant(o),
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        mapError: mapError,
        each: each,
        bind: bind,
        exists: exists,
        forall: forall,
        toOptional: toOptional
      };
    };
    var error = function (message) {
      var getOrThunk = function (f) {
        return f();
      };
      var getOrDie = function () {
        return die(String(message))();
      };
      var or = identity;
      var orThunk = function (f) {
        return f();
      };
      var map = function (_f) {
        return error(message);
      };
      var mapError = function (f) {
        return error(f(message));
      };
      var bind = function (_f) {
        return error(message);
      };
      var fold = function (onError, _) {
        return onError(message);
      };
      return {
        isValue: never,
        isError: always,
        getOr: identity,
        getOrThunk: getOrThunk,
        getOrDie: getOrDie,
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        mapError: mapError,
        each: noop,
        bind: bind,
        exists: never,
        forall: always,
        toOptional: Optional.none
      };
    };
    var fromOption = function (opt, err) {
      return opt.fold(function () {
        return error(err);
      }, value$1);
    };
    var Result = {
      value: value$1,
      error: error,
      fromOption: fromOption
    };

    var generate$1 = function (cases) {
      if (!isArray$1(cases)) {
        throw new Error('cases must be an array');
      }
      if (cases.length === 0) {
        throw new Error('there must be at least one case');
      }
      var constructors = [];
      var adt = {};
      each$k(cases, function (acase, count) {
        var keys$1 = keys(acase);
        if (keys$1.length !== 1) {
          throw new Error('one and only one name per case');
        }
        var key = keys$1[0];
        var value = acase[key];
        if (adt[key] !== undefined) {
          throw new Error('duplicate key detected:' + key);
        } else if (key === 'cata') {
          throw new Error('cannot have a case named cata (sorry)');
        } else if (!isArray$1(value)) {
          throw new Error('case arguments must be an array');
        }
        constructors.push(key);
        adt[key] = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          var argLength = args.length;
          if (argLength !== value.length) {
            throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
          }
          var match = function (branches) {
            var branchKeys = keys(branches);
            if (constructors.length !== branchKeys.length) {
              throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
            }
            var allReqd = forall(constructors, function (reqKey) {
              return contains$3(branchKeys, reqKey);
            });
            if (!allReqd) {
              throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));
            }
            return branches[key].apply(null, args);
          };
          return {
            fold: function () {
              var foldArgs = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                foldArgs[_i] = arguments[_i];
              }
              if (foldArgs.length !== cases.length) {
                throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + foldArgs.length);
              }
              var target = foldArgs[count];
              return target.apply(null, args);
            },
            match: match,
            log: function (label) {
              console.log(label, {
                constructors: constructors,
                constructor: key,
                params: args
              });
            }
          };
        };
      });
      return adt;
    };
    var Adt = { generate: generate$1 };

    Adt.generate([
      {
        bothErrors: [
          'error1',
          'error2'
        ]
      },
      {
        firstError: [
          'error1',
          'value2'
        ]
      },
      {
        secondError: [
          'value1',
          'error2'
        ]
      },
      {
        bothValues: [
          'value1',
          'value2'
        ]
      }
    ]);
    var unite = function (result) {
      return result.fold(identity, identity);
    };

    function ClosestOrAncestor (is, ancestor, scope, a, isRoot) {
      if (is(scope, a)) {
        return Optional.some(scope);
      } else if (isFunction(isRoot) && isRoot(scope)) {
        return Optional.none();
      } else {
        return ancestor(scope, a, isRoot);
      }
    }

    var ancestor$3 = function (scope, predicate, isRoot) {
      var element = scope.dom;
      var stop = isFunction(isRoot) ? isRoot : never;
      while (element.parentNode) {
        element = element.parentNode;
        var el = SugarElement.fromDom(element);
        if (predicate(el)) {
          return Optional.some(el);
        } else if (stop(el)) {
          break;
        }
      }
      return Optional.none();
    };
    var closest$3 = function (scope, predicate, isRoot) {
      var is = function (s, test) {
        return test(s);
      };
      return ClosestOrAncestor(is, ancestor$3, scope, predicate, isRoot);
    };
    var sibling$2 = function (scope, predicate) {
      var element = scope.dom;
      if (!element.parentNode) {
        return Optional.none();
      }
      return child(SugarElement.fromDom(element.parentNode), function (x) {
        return !eq(scope, x) && predicate(x);
      });
    };
    var child = function (scope, predicate) {
      var pred = function (node) {
        return predicate(SugarElement.fromDom(node));
      };
      var result = find$3(scope.dom.childNodes, pred);
      return result.map(SugarElement.fromDom);
    };

    var ancestor$2 = function (scope, selector, isRoot) {
      return ancestor$3(scope, function (e) {
        return is$2(e, selector);
      }, isRoot);
    };
    var descendant = function (scope, selector) {
      return one(selector, scope);
    };
    var closest$2 = function (scope, selector, isRoot) {
      var is = function (element, selector) {
        return is$2(element, selector);
      };
      return ClosestOrAncestor(is, ancestor$2, scope, selector, isRoot);
    };

    var promise = function () {
      var bind = function (fn, thisArg) {
        return function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          fn.apply(thisArg, args);
        };
      };
      var isArray = Array.isArray || function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
      };
      var Promise = function (fn) {
        if (typeof this !== 'object') {
          throw new TypeError('Promises must be constructed via new');
        }
        if (typeof fn !== 'function') {
          throw new TypeError('not a function');
        }
        this._state = null;
        this._value = null;
        this._deferreds = [];
        doResolve(fn, bind(resolve, this), bind(reject, this));
      };
      var asap = Promise.immediateFn || typeof setImmediate === 'function' && setImmediate || function (fn) {
        return setTimeout(fn, 1);
      };
      function handle(deferred) {
        var me = this;
        if (this._state === null) {
          this._deferreds.push(deferred);
          return;
        }
        asap(function () {
          var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
          if (cb === null) {
            (me._state ? deferred.resolve : deferred.reject)(me._value);
            return;
          }
          var ret;
          try {
            ret = cb(me._value);
          } catch (e) {
            deferred.reject(e);
            return;
          }
          deferred.resolve(ret);
        });
      }
      function resolve(newValue) {
        try {
          if (newValue === this) {
            throw new TypeError('A promise cannot be resolved with itself.');
          }
          if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
              doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
              return;
            }
          }
          this._state = true;
          this._value = newValue;
          finale.call(this);
        } catch (e) {
          reject.call(this, e);
        }
      }
      function reject(newValue) {
        this._state = false;
        this._value = newValue;
        finale.call(this);
      }
      function finale() {
        for (var i = 0, len = this._deferreds.length; i < len; i++) {
          handle.call(this, this._deferreds[i]);
        }
        this._deferreds = null;
      }
      function Handler(onFulfilled, onRejected, resolve, reject) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
      }
      var doResolve = function (fn, onFulfilled, onRejected) {
        var done = false;
        try {
          fn(function (value) {
            if (done) {
              return;
            }
            done = true;
            onFulfilled(value);
          }, function (reason) {
            if (done) {
              return;
            }
            done = true;
            onRejected(reason);
          });
        } catch (ex) {
          if (done) {
            return;
          }
          done = true;
          onRejected(ex);
        }
      };
      Promise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
      };
      Promise.prototype.then = function (onFulfilled, onRejected) {
        var me = this;
        return new Promise(function (resolve, reject) {
          handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
        });
      };
      Promise.all = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          values[_i] = arguments[_i];
        }
        var args = Array.prototype.slice.call(values.length === 1 && isArray(values[0]) ? values[0] : values);
        return new Promise(function (resolve, reject) {
          if (args.length === 0) {
            return resolve([]);
          }
          var remaining = args.length;
          var res = function (i, val) {
            try {
              if (val && (typeof val === 'object' || typeof val === 'function')) {
                var then = val.then;
                if (typeof then === 'function') {
                  then.call(val, function (val) {
                    res(i, val);
                  }, reject);
                  return;
                }
              }
              args[i] = val;
              if (--remaining === 0) {
                resolve(args);
              }
            } catch (ex) {
              reject(ex);
            }
          };
          for (var i = 0; i < args.length; i++) {
            res(i, args[i]);
          }
        });
      };
      Promise.resolve = function (value) {
        if (value && typeof value === 'object' && value.constructor === Promise) {
          return value;
        }
        return new Promise(function (resolve) {
          resolve(value);
        });
      };
      Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
          reject(value);
        });
      };
      Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
          for (var i = 0, len = values.length; i < len; i++) {
            values[i].then(resolve, reject);
          }
        });
      };
      return Promise;
    };
    var promiseObj = window.Promise ? window.Promise : promise();

    var requestAnimationFramePromise;
    var requestAnimationFrame = function (callback, element) {
      var requestAnimationFrameFunc = window.requestAnimationFrame;
      var vendors = [
        'ms',
        'moz',
        'webkit'
      ];
      var featurefill = function (cb) {
        window.setTimeout(cb, 0);
      };
      for (var i = 0; i < vendors.length && !requestAnimationFrameFunc; i++) {
        requestAnimationFrameFunc = window[vendors[i] + 'RequestAnimationFrame'];
      }
      if (!requestAnimationFrameFunc) {
        requestAnimationFrameFunc = featurefill;
      }
      requestAnimationFrameFunc(callback, element);
    };
    var wrappedSetTimeout = function (callback, time) {
      if (typeof time !== 'number') {
        time = 0;
      }
      return setTimeout(callback, time);
    };
    var wrappedSetInterval = function (callback, time) {
      if (typeof time !== 'number') {
        time = 1;
      }
      return setInterval(callback, time);
    };
    var wrappedClearTimeout = function (id) {
      return clearTimeout(id);
    };
    var wrappedClearInterval = function (id) {
      return clearInterval(id);
    };
    var debounce = function (callback, time) {
      var timer;
      var func = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        clearTimeout(timer);
        timer = wrappedSetTimeout(function () {
          callback.apply(this, args);
        }, time);
      };
      func.stop = function () {
        clearTimeout(timer);
      };
      return func;
    };
    var Delay = {
      requestAnimationFrame: function (callback, element) {
        if (requestAnimationFramePromise) {
          requestAnimationFramePromise.then(callback);
          return;
        }
        requestAnimationFramePromise = new promiseObj(function (resolve) {
          if (!element) {
            element = document.body;
          }
          requestAnimationFrame(resolve, element);
        }).then(callback);
      },
      setTimeout: wrappedSetTimeout,
      setInterval: wrappedSetInterval,
      setEditorTimeout: function (editor, callback, time) {
        return wrappedSetTimeout(function () {
          if (!editor.removed) {
            callback();
          }
        }, time);
      },
      setEditorInterval: function (editor, callback, time) {
        var timer = wrappedSetInterval(function () {
          if (!editor.removed) {
            callback();
          } else {
            clearInterval(timer);
          }
        }, time);
        return timer;
      },
      debounce: debounce,
      throttle: debounce,
      clearInterval: wrappedClearInterval,
      clearTimeout: wrappedClearTimeout
    };

    var StyleSheetLoader = function (documentOrShadowRoot, settings) {
      if (settings === void 0) {
        settings = {};
      }
      var idCount = 0;
      var loadedStates = {};
      var edos = SugarElement.fromDom(documentOrShadowRoot);
      var doc = documentOrOwner(edos);
      var maxLoadTime = settings.maxLoadTime || 5000;
      var _setReferrerPolicy = function (referrerPolicy) {
        settings.referrerPolicy = referrerPolicy;
      };
      var addStyle = function (element) {
        append$1(getStyleContainer(edos), element);
      };
      var removeStyle = function (id) {
        var styleContainer = getStyleContainer(edos);
        descendant(styleContainer, '#' + id).each(remove$7);
      };
      var getOrCreateState = function (url) {
        return get$9(loadedStates, url).getOrThunk(function () {
          return {
            id: 'mce-u' + idCount++,
            passed: [],
            failed: [],
            count: 0
          };
        });
      };
      var load = function (url, success, failure) {
        var link;
        var urlWithSuffix = Tools._addCacheSuffix(url);
        var state = getOrCreateState(urlWithSuffix);
        loadedStates[urlWithSuffix] = state;
        state.count++;
        var resolve = function (callbacks, status) {
          var i = callbacks.length;
          while (i--) {
            callbacks[i]();
          }
          state.status = status;
          state.passed = [];
          state.failed = [];
          if (link) {
            link.onload = null;
            link.onerror = null;
            link = null;
          }
        };
        var passed = function () {
          return resolve(state.passed, 2);
        };
        var failed = function () {
          return resolve(state.failed, 3);
        };
        var wait = function (testCallback, waitCallback) {
          if (!testCallback()) {
            if (Date.now() - startTime < maxLoadTime) {
              Delay.setTimeout(waitCallback);
            } else {
              failed();
            }
          }
        };
        var waitForWebKitLinkLoaded = function () {
          wait(function () {
            var styleSheets = documentOrShadowRoot.styleSheets;
            var i = styleSheets.length;
            while (i--) {
              var styleSheet = styleSheets[i];
              var owner = styleSheet.ownerNode;
              if (owner && owner.id === link.id) {
                passed();
                return true;
              }
            }
            return false;
          }, waitForWebKitLinkLoaded);
        };
        if (success) {
          state.passed.push(success);
        }
        if (failure) {
          state.failed.push(failure);
        }
        if (state.status === 1) {
          return;
        }
        if (state.status === 2) {
          passed();
          return;
        }
        if (state.status === 3) {
          failed();
          return;
        }
        state.status = 1;
        var linkElem = SugarElement.fromTag('link', doc.dom);
        setAll$1(linkElem, {
          rel: 'stylesheet',
          type: 'text/css',
          id: state.id
        });
        var startTime = Date.now();
        if (settings.contentCssCors) {
          set$1(linkElem, 'crossOrigin', 'anonymous');
        }
        if (settings.referrerPolicy) {
          set$1(linkElem, 'referrerpolicy', settings.referrerPolicy);
        }
        link = linkElem.dom;
        link.onload = waitForWebKitLinkLoaded;
        link.onerror = failed;
        addStyle(linkElem);
        set$1(linkElem, 'href', urlWithSuffix);
      };
      var loadF = function (url) {
        return Future.nu(function (resolve) {
          load(url, compose(resolve, constant(Result.value(url))), compose(resolve, constant(Result.error(url))));
        });
      };
      var loadAll = function (urls, success, failure) {
        par(map$3(urls, loadF)).get(function (result) {
          var parts = partition(result, function (r) {
            return r.isValue();
          });
          if (parts.fail.length > 0) {
            failure(parts.fail.map(unite));
          } else {
            success(parts.pass.map(unite));
          }
        });
      };
      var unload = function (url) {
        var urlWithSuffix = Tools._addCacheSuffix(url);
        get$9(loadedStates, urlWithSuffix).each(function (state) {
          var count = --state.count;
          if (count === 0) {
            delete loadedStates[urlWithSuffix];
            removeStyle(state.id);
          }
        });
      };
      var unloadAll = function (urls) {
        each$k(urls, function (url) {
          unload(url);
        });
      };
      return {
        load: load,
        loadAll: loadAll,
        unload: unload,
        unloadAll: unloadAll,
        _setReferrerPolicy: _setReferrerPolicy
      };
    };

    var create$8 = function () {
      var map = new WeakMap();
      var forElement = function (referenceElement, settings) {
        var root = getRootNode(referenceElement);
        var rootDom = root.dom;
        return Optional.from(map.get(rootDom)).getOrThunk(function () {
          var sl = StyleSheetLoader(rootDom, settings);
          map.set(rootDom, sl);
          return sl;
        });
      };
      return { forElement: forElement };
    };
    var instance = create$8();

    var DomTreeWalker = function () {
      function DomTreeWalker(startNode, rootNode) {
        this.node = startNode;
        this.rootNode = rootNode;
        this.current = this.current.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.prev2 = this.prev2.bind(this);
      }
      DomTreeWalker.prototype.current = function () {
        return this.node;
      };
      DomTreeWalker.prototype.next = function (shallow) {
        this.node = this.findSibling(this.node, 'firstChild', 'nextSibling', shallow);
        return this.node;
      };
      DomTreeWalker.prototype.prev = function (shallow) {
        this.node = this.findSibling(this.node, 'lastChild', 'previousSibling', shallow);
        return this.node;
      };
      DomTreeWalker.prototype.prev2 = function (shallow) {
        this.node = this.findPreviousNode(this.node, 'lastChild', 'previousSibling', shallow);
        return this.node;
      };
      DomTreeWalker.prototype.findSibling = function (node, startName, siblingName, shallow) {
        var sibling, parent;
        if (node) {
          if (!shallow && node[startName]) {
            return node[startName];
          }
          if (node !== this.rootNode) {
            sibling = node[siblingName];
            if (sibling) {
              return sibling;
            }
            for (parent = node.parentNode; parent && parent !== this.rootNode; parent = parent.parentNode) {
              sibling = parent[siblingName];
              if (sibling) {
                return sibling;
              }
            }
          }
        }
      };
      DomTreeWalker.prototype.findPreviousNode = function (node, startName, siblingName, shallow) {
        var sibling, parent, child;
        if (node) {
          sibling = node[siblingName];
          if (this.rootNode && sibling === this.rootNode) {
            return;
          }
          if (sibling) {
            if (!shallow) {
              for (child = sibling[startName]; child; child = child[startName]) {
                if (!child[startName]) {
                  return child;
                }
              }
            }
            return sibling;
          }
          parent = node.parentNode;
          if (parent && parent !== this.rootNode) {
            return parent;
          }
        }
      };
      return DomTreeWalker;
    }();

    var blocks = [
      'article',
      'aside',
      'details',
      'div',
      'dt',
      'figcaption',
      'footer',
      'form',
      'fieldset',
      'header',
      'hgroup',
      'html',
      'main',
      'nav',
      'section',
      'summary',
      'body',
      'p',
      'dl',
      'multicol',
      'dd',
      'figure',
      'address',
      'center',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'listing',
      'xmp',
      'pre',
      'plaintext',
      'menu',
      'dir',
      'ul',
      'ol',
      'li',
      'hr',
      'table',
      'tbody',
      'thead',
      'tfoot',
      'th',
      'tr',
      'td',
      'caption'
    ];
    var tableCells = [
      'td',
      'th'
    ];
    var tableSections = [
      'thead',
      'tbody',
      'tfoot'
    ];
    var textBlocks = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'div',
      'address',
      'pre',
      'form',
      'blockquote',
      'center',
      'dir',
      'fieldset',
      'header',
      'footer',
      'article',
      'section',
      'hgroup',
      'aside',
      'nav',
      'figure'
    ];
    var headings = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ];
    var listItems$1 = [
      'li',
      'dd',
      'dt'
    ];
    var lists = [
      'ul',
      'ol',
      'dl'
    ];
    var wsElements = [
      'pre',
      'script',
      'textarea',
      'style'
    ];
    var lazyLookup = function (items) {
      var lookup;
      return function (node) {
        lookup = lookup ? lookup : mapToObject(items, always);
        return has$2(lookup, name(node));
      };
    };
    var isHeading = lazyLookup(headings);
    var isBlock$2 = lazyLookup(blocks);
    var isTable$2 = function (node) {
      return name(node) === 'table';
    };
    var isInline$1 = function (node) {
      return isElement$6(node) && !isBlock$2(node);
    };
    var isBr$4 = function (node) {
      return isElement$6(node) && name(node) === 'br';
    };
    var isTextBlock$2 = lazyLookup(textBlocks);
    var isList = lazyLookup(lists);
    var isListItem = lazyLookup(listItems$1);
    var isTableSection = lazyLookup(tableSections);
    var isTableCell$4 = lazyLookup(tableCells);
    var isWsPreserveElement = lazyLookup(wsElements);

    var ancestor$1 = function (scope, selector, isRoot) {
      return ancestor$2(scope, selector, isRoot).isSome();
    };

    var zeroWidth = '\uFEFF';
    var nbsp = '\xA0';
    var isZwsp$1 = function (char) {
      return char === zeroWidth;
    };
    var removeZwsp = function (s) {
      return s.replace(/\uFEFF/g, '');
    };

    var ZWSP$1 = zeroWidth;
    var isZwsp = isZwsp$1;
    var trim$2 = removeZwsp;

    var isElement$4 = isElement$5;
    var isText$6 = isText$7;
    var isCaretContainerBlock$1 = function (node) {
      if (isText$6(node)) {
        node = node.parentNode;
      }
      return isElement$4(node) && node.hasAttribute('data-mce-caret');
    };
    var isCaretContainerInline = function (node) {
      return isText$6(node) && isZwsp(node.data);
    };
    var isCaretContainer$2 = function (node) {
      return isCaretContainerBlock$1(node) || isCaretContainerInline(node);
    };
    var hasContent = function (node) {
      return node.firstChild !== node.lastChild || !isBr$5(node.firstChild);
    };
    var insertInline$1 = function (node, before) {
      var doc = node.ownerDocument;
      var textNode = doc.createTextNode(ZWSP$1);
      var parentNode = node.parentNode;
      if (!before) {
        var sibling = node.nextSibling;
        if (isText$6(sibling)) {
          if (isCaretContainer$2(sibling)) {
            return sibling;
          }
          if (startsWithCaretContainer$1(sibling)) {
            sibling.splitText(1);
            return sibling;
          }
        }
        if (node.nextSibling) {
          parentNode.insertBefore(textNode, node.nextSibling);
        } else {
          parentNode.appendChild(textNode);
        }
      } else {
        var sibling = node.previousSibling;
        if (isText$6(sibling)) {
          if (isCaretContainer$2(sibling)) {
            return sibling;
          }
          if (endsWithCaretContainer$1(sibling)) {
            return sibling.splitText(sibling.data.length - 1);
          }
        }
        parentNode.insertBefore(textNode, node);
      }
      return textNode;
    };
    var isBeforeInline = function (pos) {
      var container = pos.container();
      if (!isText$7(container)) {
        return false;
      }
      return container.data.charAt(pos.offset()) === ZWSP$1 || pos.isAtStart() && isCaretContainerInline(container.previousSibling);
    };
    var isAfterInline = function (pos) {
      var container = pos.container();
      if (!isText$7(container)) {
        return false;
      }
      return container.data.charAt(pos.offset() - 1) === ZWSP$1 || pos.isAtEnd() && isCaretContainerInline(container.nextSibling);
    };
    var createBogusBr = function () {
      var br = document.createElement('br');
      br.setAttribute('data-mce-bogus', '1');
      return br;
    };
    var insertBlock$1 = function (blockName, node, before) {
      var doc = node.ownerDocument;
      var blockNode = doc.createElement(blockName);
      blockNode.setAttribute('data-mce-caret', before ? 'before' : 'after');
      blockNode.setAttribute('data-mce-bogus', 'all');
      blockNode.appendChild(createBogusBr());
      var parentNode = node.parentNode;
      if (!before) {
        if (node.nextSibling) {
          parentNode.insertBefore(blockNode, node.nextSibling);
        } else {
          parentNode.appendChild(blockNode);
        }
      } else {
        parentNode.insertBefore(blockNode, node);
      }
      return blockNode;
    };
    var startsWithCaretContainer$1 = function (node) {
      return isText$6(node) && node.data[0] === ZWSP$1;
    };
    var endsWithCaretContainer$1 = function (node) {
      return isText$6(node) && node.data[node.data.length - 1] === ZWSP$1;
    };
    var trimBogusBr = function (elm) {
      var brs = elm.getElementsByTagName('br');
      var lastBr = brs[brs.length - 1];
      if (isBogus$2(lastBr)) {
        lastBr.parentNode.removeChild(lastBr);
      }
    };
    var showCaretContainerBlock = function (caretContainer) {
      if (caretContainer && caretContainer.hasAttribute('data-mce-caret')) {
        trimBogusBr(caretContainer);
        caretContainer.removeAttribute('data-mce-caret');
        caretContainer.removeAttribute('data-mce-bogus');
        caretContainer.removeAttribute('style');
        caretContainer.removeAttribute('_moz_abspos');
        return caretContainer;
      }
      return null;
    };
    var isRangeInCaretContainerBlock = function (range) {
      return isCaretContainerBlock$1(range.startContainer);
    };

    var isContentEditableTrue$3 = isContentEditableTrue$4;
    var isContentEditableFalse$a = isContentEditableFalse$b;
    var isBr$3 = isBr$5;
    var isText$5 = isText$7;
    var isInvalidTextElement = matchNodeNames([
      'script',
      'style',
      'textarea'
    ]);
    var isAtomicInline = matchNodeNames([
      'img',
      'input',
      'textarea',
      'hr',
      'iframe',
      'video',
      'audio',
      'object',
      'embed'
    ]);
    var isTable$1 = matchNodeNames(['table']);
    var isCaretContainer$1 = isCaretContainer$2;
    var isCaretCandidate$3 = function (node) {
      if (isCaretContainer$1(node)) {
        return false;
      }
      if (isText$5(node)) {
        return !isInvalidTextElement(node.parentNode);
      }
      return isAtomicInline(node) || isBr$3(node) || isTable$1(node) || isNonUiContentEditableFalse(node);
    };
    var isUnselectable = function (node) {
      return isElement$5(node) && node.getAttribute('unselectable') === 'true';
    };
    var isNonUiContentEditableFalse = function (node) {
      return isUnselectable(node) === false && isContentEditableFalse$a(node);
    };
    var isInEditable = function (node, root) {
      for (node = node.parentNode; node && node !== root; node = node.parentNode) {
        if (isNonUiContentEditableFalse(node)) {
          return false;
        }
        if (isContentEditableTrue$3(node)) {
          return true;
        }
      }
      return true;
    };
    var isAtomicContentEditableFalse = function (node) {
      if (!isNonUiContentEditableFalse(node)) {
        return false;
      }
      return foldl(from(node.getElementsByTagName('*')), function (result, elm) {
        return result || isContentEditableTrue$3(elm);
      }, false) !== true;
    };
    var isAtomic$1 = function (node) {
      return isAtomicInline(node) || isAtomicContentEditableFalse(node);
    };
    var isEditableCaretCandidate$1 = function (node, root) {
      return isCaretCandidate$3(node) && isInEditable(node, root);
    };

    var whiteSpaceRegExp$1 = /^[ \t\r\n]*$/;
    var isWhitespaceText = function (text) {
      return whiteSpaceRegExp$1.test(text);
    };

    var hasWhitespacePreserveParent = function (node, rootNode) {
      var rootElement = SugarElement.fromDom(rootNode);
      var startNode = SugarElement.fromDom(node);
      return ancestor$1(startNode, 'pre,code', curry(eq, rootElement));
    };
    var isWhitespace = function (node, rootNode) {
      return isText$7(node) && isWhitespaceText(node.data) && hasWhitespacePreserveParent(node, rootNode) === false;
    };
    var isNamedAnchor = function (node) {
      return isElement$5(node) && node.nodeName === 'A' && !node.hasAttribute('href') && (node.hasAttribute('name') || node.hasAttribute('id'));
    };
    var isContent$1 = function (node, rootNode) {
      return isCaretCandidate$3(node) && isWhitespace(node, rootNode) === false || isNamedAnchor(node) || isBookmark(node);
    };
    var isBookmark = hasAttribute('data-mce-bookmark');
    var isBogus$1 = hasAttribute('data-mce-bogus');
    var isBogusAll = hasAttributeValue('data-mce-bogus', 'all');
    var isEmptyNode = function (targetNode, skipBogus) {
      var brCount = 0;
      if (isContent$1(targetNode, targetNode)) {
        return false;
      } else {
        var node = targetNode.firstChild;
        if (!node) {
          return true;
        }
        var walker = new DomTreeWalker(node, targetNode);
        do {
          if (skipBogus) {
            if (isBogusAll(node)) {
              node = walker.next(true);
              continue;
            }
            if (isBogus$1(node)) {
              node = walker.next();
              continue;
            }
          }
          if (isBr$5(node)) {
            brCount++;
            node = walker.next();
            continue;
          }
          if (isContent$1(node, targetNode)) {
            return false;
          }
          node = walker.next();
        } while (node);
        return brCount <= 1;
      }
    };
    var isEmpty$2 = function (elm, skipBogus) {
      if (skipBogus === void 0) {
        skipBogus = true;
      }
      return isEmptyNode(elm.dom, skipBogus);
    };

    var isSpan = function (node) {
      return node.nodeName.toLowerCase() === 'span';
    };
    var isInlineContent = function (node, root) {
      return isNonNullable(node) && (isContent$1(node, root) || isInline$1(SugarElement.fromDom(node)));
    };
    var surroundedByInlineContent = function (node, root) {
      var prev = new DomTreeWalker(node, root).prev(false);
      var next = new DomTreeWalker(node, root).next(false);
      var prevIsInline = isUndefined(prev) || isInlineContent(prev, root);
      var nextIsInline = isUndefined(next) || isInlineContent(next, root);
      return prevIsInline && nextIsInline;
    };
    var isBookmarkNode$2 = function (node) {
      return isSpan(node) && node.getAttribute('data-mce-type') === 'bookmark';
    };
    var isKeepTextNode = function (node, root) {
      return isText$7(node) && node.data.length > 0 && surroundedByInlineContent(node, root);
    };
    var isKeepElement = function (node) {
      return isElement$5(node) ? node.childNodes.length > 0 : false;
    };
    var isDocument = function (node) {
      return isDocumentFragment(node) || isDocument$1(node);
    };
    var trimNode = function (dom, node, root) {
      var rootNode = root || node;
      if (isElement$5(node) && isBookmarkNode$2(node)) {
        return node;
      }
      var children = node.childNodes;
      for (var i = children.length - 1; i >= 0; i--) {
        trimNode(dom, children[i], rootNode);
      }
      if (isElement$5(node)) {
        var currentChildren = node.childNodes;
        if (currentChildren.length === 1 && isBookmarkNode$2(currentChildren[0])) {
          node.parentNode.insertBefore(currentChildren[0], node);
        }
      }
      if (!isDocument(node) && !isContent$1(node, rootNode) && !isKeepElement(node) && !isKeepTextNode(node, rootNode)) {
        dom.remove(node);
      }
      return node;
    };

    var makeMap$3 = Tools.makeMap;
    var attrsCharsRegExp = /[&<>\"\u0060\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var textCharsRegExp = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var rawCharsRegExp = /[<>&\"\']/g;
    var entityRegExp = /&#([a-z0-9]+);?|&([a-z0-9]+);/gi;
    var asciiMap = {
      128: '\u20AC',
      130: '\u201A',
      131: '\u0192',
      132: '\u201E',
      133: '\u2026',
      134: '\u2020',
      135: '\u2021',
      136: '\u02c6',
      137: '\u2030',
      138: '\u0160',
      139: '\u2039',
      140: '\u0152',
      142: '\u017d',
      145: '\u2018',
      146: '\u2019',
      147: '\u201C',
      148: '\u201D',
      149: '\u2022',
      150: '\u2013',
      151: '\u2014',
      152: '\u02DC',
      153: '\u2122',
      154: '\u0161',
      155: '\u203A',
      156: '\u0153',
      158: '\u017e',
      159: '\u0178'
    };
    var baseEntities = {
      '"': '&quot;',
      '\'': '&#39;',
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '`': '&#96;'
    };
    var reverseEntities = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': '\''
    };
    var nativeDecode = function (text) {
      var elm = SugarElement.fromTag('div').dom;
      elm.innerHTML = text;
      return elm.textContent || elm.innerText || text;
    };
    var buildEntitiesLookup = function (items, radix) {
      var i, chr, entity;
      var lookup = {};
      if (items) {
        items = items.split(',');
        radix = radix || 10;
        for (i = 0; i < items.length; i += 2) {
          chr = String.fromCharCode(parseInt(items[i], radix));
          if (!baseEntities[chr]) {
            entity = '&' + items[i + 1] + ';';
            lookup[chr] = entity;
            lookup[entity] = chr;
          }
        }
        return lookup;
      }
    };
    var namedEntities = buildEntitiesLookup('50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' + '5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' + '5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' + '5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' + '68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' + '6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' + '6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' + '75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' + '7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' + '7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' + 'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' + 'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' + 't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' + 'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' + 'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' + '81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' + '8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' + '8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' + '8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' + '8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' + 'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' + 'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' + 'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' + '80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' + '811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);
    var encodeRaw = function (text, attr) {
      return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
        return baseEntities[chr] || chr;
      });
    };
    var encodeAllRaw = function (text) {
      return ('' + text).replace(rawCharsRegExp, function (chr) {
        return baseEntities[chr] || chr;
      });
    };
    var encodeNumeric = function (text, attr) {
      return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
        if (chr.length > 1) {
          return '&#' + ((chr.charCodeAt(0) - 55296) * 1024 + (chr.charCodeAt(1) - 56320) + 65536) + ';';
        }
        return baseEntities[chr] || '&#' + chr.charCodeAt(0) + ';';
      });
    };
    var encodeNamed = function (text, attr, entities) {
      entities = entities || namedEntities;
      return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
        return baseEntities[chr] || entities[chr] || chr;
      });
    };
    var getEncodeFunc = function (name, entities) {
      var entitiesMap = buildEntitiesLookup(entities) || namedEntities;
      var encodeNamedAndNumeric = function (text, attr) {
        return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
          if (baseEntities[chr] !== undefined) {
            return baseEntities[chr];
          }
          if (entitiesMap[chr] !== undefined) {
            return entitiesMap[chr];
          }
          if (chr.length > 1) {
            return '&#' + ((chr.charCodeAt(0) - 55296) * 1024 + (chr.charCodeAt(1) - 56320) + 65536) + ';';
          }
          return '&#' + chr.charCodeAt(0) + ';';
        });
      };
      var encodeCustomNamed = function (text, attr) {
        return encodeNamed(text, attr, entitiesMap);
      };
      var nameMap = makeMap$3(name.replace(/\+/g, ','));
      if (nameMap.named && nameMap.numeric) {
        return encodeNamedAndNumeric;
      }
      if (nameMap.named) {
        if (entities) {
          return encodeCustomNamed;
        }
        return encodeNamed;
      }
      if (nameMap.numeric) {
        return encodeNumeric;
      }
      return encodeRaw;
    };
    var decode = function (text) {
      return text.replace(entityRegExp, function (all, numeric) {
        if (numeric) {
          if (numeric.charAt(0).toLowerCase() === 'x') {
            numeric = parseInt(numeric.substr(1), 16);
          } else {
            numeric = parseInt(numeric, 10);
          }
          if (numeric > 65535) {
            numeric -= 65536;
            return String.fromCharCode(55296 + (numeric >> 10), 56320 + (numeric & 1023));
          }
          return asciiMap[numeric] || String.fromCharCode(numeric);
        }
        return reverseEntities[all] || namedEntities[all] || nativeDecode(all);
      });
    };
    var Entities = {
      encodeRaw: encodeRaw,
      encodeAllRaw: encodeAllRaw,
      encodeNumeric: encodeNumeric,
      encodeNamed: encodeNamed,
      getEncodeFunc: getEncodeFunc,
      decode: decode
    };

    var mapCache = {}, dummyObj = {};
    var makeMap$2 = Tools.makeMap, each$h = Tools.each, extend$5 = Tools.extend, explode$3 = Tools.explode, inArray$2 = Tools.inArray;
    var split$1 = function (items, delim) {
      items = Tools.trim(items);
      return items ? items.split(delim || ' ') : [];
    };
    var compileSchema = function (type) {
      var schema = {};
      var globalAttributes, blockContent;
      var phrasingContent, flowContent, html4BlockContent, html4PhrasingContent;
      var add = function (name, attributes, children) {
        var ni, attributesOrder, element;
        var arrayToMap = function (array, obj) {
          var map = {};
          var i, l;
          for (i = 0, l = array.length; i < l; i++) {
            map[array[i]] = obj || {};
          }
          return map;
        };
        children = children || [];
        attributes = attributes || '';
        if (typeof children === 'string') {
          children = split$1(children);
        }
        var names = split$1(name);
        ni = names.length;
        while (ni--) {
          attributesOrder = split$1([
            globalAttributes,
            attributes
          ].join(' '));
          element = {
            attributes: arrayToMap(attributesOrder),
            attributesOrder: attributesOrder,
            children: arrayToMap(children, dummyObj)
          };
          schema[names[ni]] = element;
        }
      };
      var addAttrs = function (name, attributes) {
        var ni, schemaItem, i, l;
        var names = split$1(name);
        ni = names.length;
        var attrs = split$1(attributes);
        while (ni--) {
          schemaItem = schema[names[ni]];
          for (i = 0, l = attrs.length; i < l; i++) {
            schemaItem.attributes[attrs[i]] = {};
            schemaItem.attributesOrder.push(attrs[i]);
          }
        }
      };
      if (mapCache[type]) {
        return mapCache[type];
      }
      globalAttributes = 'id accesskey class dir lang style tabindex title role';
      blockContent = 'address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul';
      phrasingContent = 'a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd ' + 'label map noscript object q s samp script select small span strong sub sup ' + 'textarea u var #text #comment';
      if (type !== 'html4') {
        globalAttributes += ' contenteditable contextmenu draggable dropzone ' + 'hidden spellcheck translate';
        blockContent += ' article aside details dialog figure main header footer hgroup section nav';
        phrasingContent += ' audio canvas command datalist mark meter output picture ' + 'progress time wbr video ruby bdi keygen';
      }
      if (type !== 'html5-strict') {
        globalAttributes += ' xml:lang';
        html4PhrasingContent = 'acronym applet basefont big font strike tt';
        phrasingContent = [
          phrasingContent,
          html4PhrasingContent
        ].join(' ');
        each$h(split$1(html4PhrasingContent), function (name) {
          add(name, '', phrasingContent);
        });
        html4BlockContent = 'center dir isindex noframes';
        blockContent = [
          blockContent,
          html4BlockContent
        ].join(' ');
        flowContent = [
          blockContent,
          phrasingContent
        ].join(' ');
        each$h(split$1(html4BlockContent), function (name) {
          add(name, '', flowContent);
        });
      }
      flowContent = flowContent || [
        blockContent,
        phrasingContent
      ].join(' ');
      add('html', 'manifest', 'head body');
      add('head', '', 'base command link meta noscript script style title');
      add('title hr noscript br');
      add('base', 'href target');
      add('link', 'href rel media hreflang type sizes hreflang');
      add('meta', 'name http-equiv content charset');
      add('style', 'media type scoped');
      add('script', 'src async defer type charset');
      add('body', 'onafterprint onbeforeprint onbeforeunload onblur onerror onfocus ' + 'onhashchange onload onmessage onoffline ononline onpagehide onpageshow ' + 'onpopstate onresize onscroll onstorage onunload', flowContent);
      add('address dt dd div caption', '', flowContent);
      add('h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn', '', phrasingContent);
      add('blockquote', 'cite', flowContent);
      add('ol', 'reversed start type', 'li');
      add('ul', '', 'li');
      add('li', 'value', flowContent);
      add('dl', '', 'dt dd');
      add('a', 'href target rel media hreflang type', phrasingContent);
      add('q', 'cite', phrasingContent);
      add('ins del', 'cite datetime', flowContent);
      add('img', 'src sizes srcset alt usemap ismap width height');
      add('iframe', 'src name width height', flowContent);
      add('embed', 'src type width height');
      add('object', 'data type typemustmatch name usemap form width height', [
        flowContent,
        'param'
      ].join(' '));
      add('param', 'name value');
      add('map', 'name', [
        flowContent,
        'area'
      ].join(' '));
      add('area', 'alt coords shape href target rel media hreflang type');
      add('table', 'border', 'caption colgroup thead tfoot tbody tr' + (type === 'html4' ? ' col' : ''));
      add('colgroup', 'span', 'col');
      add('col', 'span');
      add('tbody thead tfoot', '', 'tr');
      add('tr', '', 'td th');
      add('td', 'colspan rowspan headers', flowContent);
      add('th', 'colspan rowspan headers scope abbr', flowContent);
      add('form', 'accept-charset action autocomplete enctype method name novalidate target', flowContent);
      add('fieldset', 'disabled form name', [
        flowContent,
        'legend'
      ].join(' '));
      add('label', 'form for', phrasingContent);
      add('input', 'accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate ' + 'formtarget height list max maxlength min multiple name pattern readonly required size src step type value width');
      add('button', 'disabled form formaction formenctype formmethod formnovalidate formtarget name type value', type === 'html4' ? flowContent : phrasingContent);
      add('select', 'disabled form multiple name required size', 'option optgroup');
      add('optgroup', 'disabled label', 'option');
      add('option', 'disabled label selected value');
      add('textarea', 'cols dirname disabled form maxlength name readonly required rows wrap');
      add('menu', 'type label', [
        flowContent,
        'li'
      ].join(' '));
      add('noscript', '', flowContent);
      if (type !== 'html4') {
        add('wbr');
        add('ruby', '', [
          phrasingContent,
          'rt rp'
        ].join(' '));
        add('figcaption', '', flowContent);
        add('mark rt rp summary bdi', '', phrasingContent);
        add('canvas', 'width height', flowContent);
        add('video', 'src crossorigin poster preload autoplay mediagroup loop ' + 'muted controls width height buffered', [
          flowContent,
          'track source'
        ].join(' '));
        add('audio', 'src crossorigin preload autoplay mediagroup loop muted controls ' + 'buffered volume', [
          flowContent,
          'track source'
        ].join(' '));
        add('picture', '', 'img source');
        add('source', 'src srcset type media sizes');
        add('track', 'kind src srclang label default');
        add('datalist', '', [
          phrasingContent,
          'option'
        ].join(' '));
        add('article section nav aside main header footer', '', flowContent);
        add('hgroup', '', 'h1 h2 h3 h4 h5 h6');
        add('figure', '', [
          flowContent,
          'figcaption'
        ].join(' '));
        add('time', 'datetime', phrasingContent);
        add('dialog', 'open', flowContent);
        add('command', 'type label icon disabled checked radiogroup command');
        add('output', 'for form name', phrasingContent);
        add('progress', 'value max', phrasingContent);
        add('meter', 'value min max low high optimum', phrasingContent);
        add('details', 'open', [
          flowContent,
          'summary'
        ].join(' '));
        add('keygen', 'autofocus challenge disabled form keytype name');
      }
      if (type !== 'html5-strict') {
        addAttrs('script', 'language xml:space');
        addAttrs('style', 'xml:space');
        addAttrs('object', 'declare classid code codebase codetype archive standby align border hspace vspace');
        addAttrs('embed', 'align name hspace vspace');
        addAttrs('param', 'valuetype type');
        addAttrs('a', 'charset name rev shape coords');
        addAttrs('br', 'clear');
        addAttrs('applet', 'codebase archive code object alt name width height align hspace vspace');
        addAttrs('img', 'name longdesc align border hspace vspace');
        addAttrs('iframe', 'longdesc frameborder marginwidth marginheight scrolling align');
        addAttrs('font basefont', 'size color face');
        addAttrs('input', 'usemap align');
        addAttrs('select');
        addAttrs('textarea');
        addAttrs('h1 h2 h3 h4 h5 h6 div p legend caption', 'align');
        addAttrs('ul', 'type compact');
        addAttrs('li', 'type');
        addAttrs('ol dl menu dir', 'compact');
        addAttrs('pre', 'width xml:space');
        addAttrs('hr', 'align noshade size width');
        addAttrs('isindex', 'prompt');
        addAttrs('table', 'summary width frame rules cellspacing cellpadding align bgcolor');
        addAttrs('col', 'width align char charoff valign');
        addAttrs('colgroup', 'width align char charoff valign');
        addAttrs('thead', 'align char charoff valign');
        addAttrs('tr', 'align char charoff valign bgcolor');
        addAttrs('th', 'axis align char charoff valign nowrap bgcolor width height');
        addAttrs('form', 'accept');
        addAttrs('td', 'abbr axis scope align char charoff valign nowrap bgcolor width height');
        addAttrs('tfoot', 'align char charoff valign');
        addAttrs('tbody', 'align char charoff valign');
        addAttrs('area', 'nohref');
        addAttrs('body', 'background bgcolor text link vlink alink');
      }
      if (type !== 'html4') {
        addAttrs('input button select textarea', 'autofocus');
        addAttrs('input textarea', 'placeholder');
        addAttrs('a', 'download');
        addAttrs('link script img', 'crossorigin');
        addAttrs('img', 'loading');
        addAttrs('iframe', 'sandbox seamless allowfullscreen loading');
      }
      each$h(split$1('a form meter progress dfn'), function (name) {
        if (schema[name]) {
          delete schema[name].children[name];
        }
      });
      delete schema.caption.children.table;
      delete schema.script;
      mapCache[type] = schema;
      return schema;
    };
    var compileElementMap = function (value, mode) {
      var styles;
      if (value) {
        styles = {};
        if (typeof value === 'string') {
          value = { '*': value };
        }
        each$h(value, function (value, key) {
          styles[key] = styles[key.toUpperCase()] = mode === 'map' ? makeMap$2(value, /[, ]/) : explode$3(value, /[, ]/);
        });
      }
      return styles;
    };
    var Schema = function (settings) {
      var elements = {};
      var children = {};
      var patternElements = [];
      var customElementsMap = {}, specialElements = {};
      var createLookupTable = function (option, defaultValue, extendWith) {
        var value = settings[option];
        if (!value) {
          value = mapCache[option];
          if (!value) {
            value = makeMap$2(defaultValue, ' ', makeMap$2(defaultValue.toUpperCase(), ' '));
            value = extend$5(value, extendWith);
            mapCache[option] = value;
          }
        } else {
          value = makeMap$2(value, /[, ]/, makeMap$2(value.toUpperCase(), /[, ]/));
        }
        return value;
      };
      settings = settings || {};
      var schemaItems = compileSchema(settings.schema);
      if (settings.verify_html === false) {
        settings.valid_elements = '*[*]';
      }
      var validStyles = compileElementMap(settings.valid_styles);
      var invalidStyles = compileElementMap(settings.invalid_styles, 'map');
      var validClasses = compileElementMap(settings.valid_classes, 'map');
      var whiteSpaceElementsMap = createLookupTable('whitespace_elements', 'pre script noscript style textarea video audio iframe object code');
      var selfClosingElementsMap = createLookupTable('self_closing_elements', 'colgroup dd dt li option p td tfoot th thead tr');
      var shortEndedElementsMap = createLookupTable('short_ended_elements', 'area base basefont br col frame hr img input isindex link ' + 'meta param embed source wbr track');
      var boolAttrMap = createLookupTable('boolean_attributes', 'checked compact declare defer disabled ismap multiple nohref noresize ' + 'noshade nowrap readonly selected autoplay loop controls');
      var nonEmptyOrMoveCaretBeforeOnEnter = 'td th iframe video audio object script code';
      var nonEmptyElementsMap = createLookupTable('non_empty_elements', nonEmptyOrMoveCaretBeforeOnEnter + ' pre', shortEndedElementsMap);
      var moveCaretBeforeOnEnterElementsMap = createLookupTable('move_caret_before_on_enter_elements', nonEmptyOrMoveCaretBeforeOnEnter + ' table', shortEndedElementsMap);
      var textBlockElementsMap = createLookupTable('text_block_elements', 'h1 h2 h3 h4 h5 h6 p div address pre form ' + 'blockquote center dir fieldset header footer article section hgroup aside main nav figure');
      var blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' + 'th tr td li ol ul caption dl dt dd noscript menu isindex option ' + 'datalist select optgroup figcaption details summary', textBlockElementsMap);
      var textInlineElementsMap = createLookupTable('text_inline_elements', 'span strong b em i font strike u var cite ' + 'dfn code mark q sup sub samp');
      each$h((settings.special || 'script noscript iframe noframes noembed title style textarea xmp').split(' '), function (name) {
        specialElements[name] = new RegExp('</' + name + '[^>]*>', 'gi');
      });
      var patternToRegExp = function (str) {
        return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
      };
      var addValidElements = function (validElements) {
        var ei, el, ai, al, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder, prefix, outputName, globalAttributes, globalAttributesOrder, value;
        var elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)])?$/, attrRuleRegExp = /^([!\-])?(\w+[\\:]:\w+|[^=:<]+)?(?:([=:<])(.*))?$/, hasPatternsRegExp = /[*?+]/;
        if (validElements) {
          var validElementsArr = split$1(validElements, ',');
          if (elements['@']) {
            globalAttributes = elements['@'].attributes;
            globalAttributesOrder = elements['@'].attributesOrder;
          }
          for (ei = 0, el = validElementsArr.length; ei < el; ei++) {
            matches = elementRuleRegExp.exec(validElementsArr[ei]);
            if (matches) {
              prefix = matches[1];
              elementName = matches[2];
              outputName = matches[3];
              attrData = matches[5];
              attributes = {};
              attributesOrder = [];
              element = {
                attributes: attributes,
                attributesOrder: attributesOrder
              };
              if (prefix === '#') {
                element.paddEmpty = true;
              }
              if (prefix === '-') {
                element.removeEmpty = true;
              }
              if (matches[4] === '!') {
                element.removeEmptyAttrs = true;
              }
              if (globalAttributes) {
                each$j(globalAttributes, function (value, key) {
                  attributes[key] = value;
                });
                attributesOrder.push.apply(attributesOrder, globalAttributesOrder);
              }
              if (attrData) {
                attrData = split$1(attrData, '|');
                for (ai = 0, al = attrData.length; ai < al; ai++) {
                  matches = attrRuleRegExp.exec(attrData[ai]);
                  if (matches) {
                    attr = {};
                    attrType = matches[1];
                    attrName = matches[2].replace(/[\\:]:/g, ':');
                    prefix = matches[3];
                    value = matches[4];
                    if (attrType === '!') {
                      element.attributesRequired = element.attributesRequired || [];
                      element.attributesRequired.push(attrName);
                      attr.required = true;
                    }
                    if (attrType === '-') {
                      delete attributes[attrName];
                      attributesOrder.splice(inArray$2(attributesOrder, attrName), 1);
                      continue;
                    }
                    if (prefix) {
                      if (prefix === '=') {
                        element.attributesDefault = element.attributesDefault || [];
                        element.attributesDefault.push({
                          name: attrName,
                          value: value
                        });
                        attr.defaultValue = value;
                      }
                      if (prefix === ':') {
                        element.attributesForced = element.attributesForced || [];
                        element.attributesForced.push({
                          name: attrName,
                          value: value
                        });
                        attr.forcedValue = value;
                      }
                      if (prefix === '<') {
                        attr.validValues = makeMap$2(value, '?');
                      }
                    }
                    if (hasPatternsRegExp.test(attrName)) {
                      element.attributePatterns = element.attributePatterns || [];
                      attr.pattern = patternToRegExp(attrName);
                      element.attributePatterns.push(attr);
                    } else {
                      if (!attributes[attrName]) {
                        attributesOrder.push(attrName);
                      }
                      attributes[attrName] = attr;
                    }
                  }
                }
              }
              if (!globalAttributes && elementName === '@') {
                globalAttributes = attributes;
                globalAttributesOrder = attributesOrder;
              }
              if (outputName) {
                element.outputName = elementName;
                elements[outputName] = element;
              }
              if (hasPatternsRegExp.test(elementName)) {
                element.pattern = patternToRegExp(elementName);
                patternElements.push(element);
              } else {
                elements[elementName] = element;
              }
            }
          }
        }
      };
      var setValidElements = function (validElements) {
        elements = {};
        patternElements = [];
        addValidElements(validElements);
        each$h(schemaItems, function (element, name) {
          children[name] = element.children;
        });
      };
      var addCustomElements = function (customElements) {
        var customElementRegExp = /^(~)?(.+)$/;
        if (customElements) {
          mapCache.text_block_elements = mapCache.block_elements = null;
          each$h(split$1(customElements, ','), function (rule) {
            var matches = customElementRegExp.exec(rule), inline = matches[1] === '~', cloneName = inline ? 'span' : 'div', name = matches[2];
            children[name] = children[cloneName];
            customElementsMap[name] = cloneName;
            if (!inline) {
              blockElementsMap[name.toUpperCase()] = {};
              blockElementsMap[name] = {};
            }
            if (!elements[name]) {
              var customRule = elements[cloneName];
              customRule = extend$5({}, customRule);
              delete customRule.removeEmptyAttrs;
              delete customRule.removeEmpty;
              elements[name] = customRule;
            }
            each$h(children, function (element, elmName) {
              if (element[cloneName]) {
                children[elmName] = element = extend$5({}, children[elmName]);
                element[name] = element[cloneName];
              }
            });
          });
        }
      };
      var addValidChildren = function (validChildren) {
        var childRuleRegExp = /^([+\-]?)([A-Za-z0-9_\-.\u00b7\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u037d\u037f-\u1fff\u200c-\u200d\u203f-\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]+)\[([^\]]+)]$/;
        mapCache[settings.schema] = null;
        if (validChildren) {
          each$h(split$1(validChildren, ','), function (rule) {
            var matches = childRuleRegExp.exec(rule);
            var parent, prefix;
            if (matches) {
              prefix = matches[1];
              if (prefix) {
                parent = children[matches[2]];
              } else {
                parent = children[matches[2]] = { '#comment': {} };
              }
              parent = children[matches[2]];
              each$h(split$1(matches[3], '|'), function (child) {
                if (prefix === '-') {
                  delete parent[child];
                } else {
                  parent[child] = {};
                }
              });
            }
          });
        }
      };
      var getElementRule = function (name) {
        var element = elements[name], i;
        if (element) {
          return element;
        }
        i = patternElements.length;
        while (i--) {
          element = patternElements[i];
          if (element.pattern.test(name)) {
            return element;
          }
        }
      };
      if (!settings.valid_elements) {
        each$h(schemaItems, function (element, name) {
          elements[name] = {
            attributes: element.attributes,
            attributesOrder: element.attributesOrder
          };
          children[name] = element.children;
        });
        if (settings.schema !== 'html5') {
          each$h(split$1('strong/b em/i'), function (item) {
            var items = split$1(item, '/');
            elements[items[1]].outputName = items[0];
          });
        }
        each$h(split$1('ol ul sub sup blockquote span font a table tbody strong em b i'), function (name) {
          if (elements[name]) {
            elements[name].removeEmpty = true;
          }
        });
        each$h(split$1('p h1 h2 h3 h4 h5 h6 th td pre div address caption li'), function (name) {
          elements[name].paddEmpty = true;
        });
        each$h(split$1('span'), function (name) {
          elements[name].removeEmptyAttrs = true;
        });
      } else {
        setValidElements(settings.valid_elements);
      }
      addCustomElements(settings.custom_elements);
      addValidChildren(settings.valid_children);
      addValidElements(settings.extended_valid_elements);
      addValidChildren('+ol[ul|ol],+ul[ul|ol]');
      each$h({
        dd: 'dl',
        dt: 'dl',
        li: 'ul ol',
        td: 'tr',
        th: 'tr',
        tr: 'tbody thead tfoot',
        tbody: 'table',
        thead: 'table',
        tfoot: 'table',
        legend: 'fieldset',
        area: 'map',
        param: 'video audio object'
      }, function (parents, item) {
        if (elements[item]) {
          elements[item].parentsRequired = split$1(parents);
        }
      });
      if (settings.invalid_elements) {
        each$h(explode$3(settings.invalid_elements), function (item) {
          if (elements[item]) {
            delete elements[item];
          }
        });
      }
      if (!getElementRule('span')) {
        addValidElements('span[!data-mce-type|*]');
      }
      var getValidStyles = constant(validStyles);
      var getInvalidStyles = constant(invalidStyles);
      var getValidClasses = constant(validClasses);
      var getBoolAttrs = constant(boolAttrMap);
      var getBlockElements = constant(blockElementsMap);
      var getTextBlockElements = constant(textBlockElementsMap);
      var getTextInlineElements = constant(textInlineElementsMap);
      var getShortEndedElements = constant(shortEndedElementsMap);
      var getSelfClosingElements = constant(selfClosingElementsMap);
      var getNonEmptyElements = constant(nonEmptyElementsMap);
      var getMoveCaretBeforeOnEnterElements = constant(moveCaretBeforeOnEnterElementsMap);
      var getWhiteSpaceElements = constant(whiteSpaceElementsMap);
      var getSpecialElements = constant(specialElements);
      var isValidChild = function (name, child) {
        var parent = children[name.toLowerCase()];
        return !!(parent && parent[child.toLowerCase()]);
      };
      var isValid = function (name, attr) {
        var attrPatterns, i;
        var rule = getElementRule(name);
        if (rule) {
          if (attr) {
            if (rule.attributes[attr]) {
              return true;
            }
            attrPatterns = rule.attributePatterns;
            if (attrPatterns) {
              i = attrPatterns.length;
              while (i--) {
                if (attrPatterns[i].pattern.test(name)) {
                  return true;
                }
              }
            }
          } else {
            return true;
          }
        }
        return false;
      };
      var getCustomElements = constant(customElementsMap);
      return {
        children: children,
        elements: elements,
        getValidStyles: getValidStyles,
        getValidClasses: getValidClasses,
        getBlockElements: getBlockElements,
        getInvalidStyles: getInvalidStyles,
        getShortEndedElements: getShortEndedElements,
        getTextBlockElements: getTextBlockElements,
        getTextInlineElements: getTextInlineElements,
        getBoolAttrs: getBoolAttrs,
        getElementRule: getElementRule,
        getSelfClosingElements: getSelfClosingElements,
        getNonEmptyElements: getNonEmptyElements,
        getMoveCaretBeforeOnEnterElements: getMoveCaretBeforeOnEnterElements,
        getWhiteSpaceElements: getWhiteSpaceElements,
        getSpecialElements: getSpecialElements,
        isValidChild: isValidChild,
        isValid: isValid,
        getCustomElements: getCustomElements,
        addValidElements: addValidElements,
        setValidElements: setValidElements,
        addCustomElements: addCustomElements,
        addValidChildren: addValidChildren
      };
    };

    var toHex = function (match, r, g, b) {
      var hex = function (val) {
        val = parseInt(val, 10).toString(16);
        return val.length > 1 ? val : '0' + val;
      };
      return '#' + hex(r) + hex(g) + hex(b);
    };
    var Styles = function (settings, schema) {
      var _this = this;
      var rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi;
      var urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi;
      var styleRegExp = /\s*([^:]+):\s*([^;]+);?/g;
      var trimRightRegExp = /\s+$/;
      var i;
      var encodingLookup = {};
      var validStyles;
      var invalidStyles;
      var invisibleChar = zeroWidth;
      settings = settings || {};
      if (schema) {
        validStyles = schema.getValidStyles();
        invalidStyles = schema.getInvalidStyles();
      }
      var encodingItems = ('\\" \\\' \\; \\: ; : ' + invisibleChar).split(' ');
      for (i = 0; i < encodingItems.length; i++) {
        encodingLookup[encodingItems[i]] = invisibleChar + i;
        encodingLookup[invisibleChar + i] = encodingItems[i];
      }
      return {
        toHex: function (color) {
          return color.replace(rgbRegExp, toHex);
        },
        parse: function (css) {
          var styles = {};
          var matches, name, value, isEncoded;
          var urlConverter = settings.url_converter;
          var urlConverterScope = settings.url_converter_scope || _this;
          var compress = function (prefix, suffix, noJoin) {
            var top = styles[prefix + '-top' + suffix];
            if (!top) {
              return;
            }
            var right = styles[prefix + '-right' + suffix];
            if (!right) {
              return;
            }
            var bottom = styles[prefix + '-bottom' + suffix];
            if (!bottom) {
              return;
            }
            var left = styles[prefix + '-left' + suffix];
            if (!left) {
              return;
            }
            var box = [
              top,
              right,
              bottom,
              left
            ];
            i = box.length - 1;
            while (i--) {
              if (box[i] !== box[i + 1]) {
                break;
              }
            }
            if (i > -1 && noJoin) {
              return;
            }
            styles[prefix + suffix] = i === -1 ? box[0] : box.join(' ');
            delete styles[prefix + '-top' + suffix];
            delete styles[prefix + '-right' + suffix];
            delete styles[prefix + '-bottom' + suffix];
            delete styles[prefix + '-left' + suffix];
          };
          var canCompress = function (key) {
            var value = styles[key], i;
            if (!value) {
              return;
            }
            value = value.split(' ');
            i = value.length;
            while (i--) {
              if (value[i] !== value[0]) {
                return false;
              }
            }
            styles[key] = value[0];
            return true;
          };
          var compress2 = function (target, a, b, c) {
            if (!canCompress(a)) {
              return;
            }
            if (!canCompress(b)) {
              return;
            }
            if (!canCompress(c)) {
              return;
            }
            styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
            delete styles[a];
            delete styles[b];
            delete styles[c];
          };
          var encode = function (str) {
            isEncoded = true;
            return encodingLookup[str];
          };
          var decode = function (str, keepSlashes) {
            if (isEncoded) {
              str = str.replace(/\uFEFF[0-9]/g, function (str) {
                return encodingLookup[str];
              });
            }
            if (!keepSlashes) {
              str = str.replace(/\\([\'\";:])/g, '$1');
            }
            return str;
          };
          var decodeSingleHexSequence = function (escSeq) {
            return String.fromCharCode(parseInt(escSeq.slice(1), 16));
          };
          var decodeHexSequences = function (value) {
            return value.replace(/\\[0-9a-f]+/gi, decodeSingleHexSequence);
          };
          var processUrl = function (match, url, url2, url3, str, str2) {
            str = str || str2;
            if (str) {
              str = decode(str);
              return '\'' + str.replace(/\'/g, '\\\'') + '\'';
            }
            url = decode(url || url2 || url3);
            if (!settings.allow_script_urls) {
              var scriptUrl = url.replace(/[\s\r\n]+/g, '');
              if (/(java|vb)script:/i.test(scriptUrl)) {
                return '';
              }
              if (!settings.allow_svg_data_urls && /^data:image\/svg/i.test(scriptUrl)) {
                return '';
              }
            }
            if (urlConverter) {
              url = urlConverter.call(urlConverterScope, url, 'style');
            }
            return 'url(\'' + url.replace(/\'/g, '\\\'') + '\')';
          };
          if (css) {
            css = css.replace(/[\u0000-\u001F]/g, '');
            css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function (str) {
              return str.replace(/[;:]/g, encode);
            });
            while (matches = styleRegExp.exec(css)) {
              styleRegExp.lastIndex = matches.index + matches[0].length;
              name = matches[1].replace(trimRightRegExp, '').toLowerCase();
              value = matches[2].replace(trimRightRegExp, '');
              if (name && value) {
                name = decodeHexSequences(name);
                value = decodeHexSequences(value);
                if (name.indexOf(invisibleChar) !== -1 || name.indexOf('"') !== -1) {
                  continue;
                }
                if (!settings.allow_script_urls && (name === 'behavior' || /expression\s*\(|\/\*|\*\//.test(value))) {
                  continue;
                }
                if (name === 'font-weight' && value === '700') {
                  value = 'bold';
                } else if (name === 'color' || name === 'background-color') {
                  value = value.toLowerCase();
                }
                value = value.replace(rgbRegExp, toHex);
                value = value.replace(urlOrStrRegExp, processUrl);
                styles[name] = isEncoded ? decode(value, true) : value;
              }
            }
            compress('border', '', true);
            compress('border', '-width');
            compress('border', '-color');
            compress('border', '-style');
            compress('padding', '');
            compress('margin', '');
            compress2('border', 'border-width', 'border-style', 'border-color');
            if (styles.border === 'medium none') {
              delete styles.border;
            }
            if (styles['border-image'] === 'none') {
              delete styles['border-image'];
            }
          }
          return styles;
        },
        serialize: function (styles, elementName) {
          var css = '';
          var serializeStyles = function (name) {
            var value;
            var styleList = validStyles[name];
            if (styleList) {
              for (var i_1 = 0, l = styleList.length; i_1 < l; i_1++) {
                name = styleList[i_1];
                value = styles[name];
                if (value) {
                  css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
                }
              }
            }
          };
          var isValid = function (name, elementName) {
            var styleMap = invalidStyles['*'];
            if (styleMap && styleMap[name]) {
              return false;
            }
            styleMap = invalidStyles[elementName];
            return !(styleMap && styleMap[name]);
          };
          if (elementName && validStyles) {
            serializeStyles('*');
            serializeStyles(elementName);
          } else {
            each$j(styles, function (value, name) {
              if (value && (!invalidStyles || isValid(name, elementName))) {
                css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
              }
            });
          }
          return css;
        }
      };
    };

    var deprecated = {
      keyLocation: true,
      layerX: true,
      layerY: true,
      returnValue: true,
      webkitMovementX: true,
      webkitMovementY: true,
      keyIdentifier: true,
      mozPressure: true
    };
    var isNativeEvent = function (event) {
      return event instanceof Event || isFunction(event.initEvent);
    };
    var hasIsDefaultPrevented = function (event) {
      return event.isDefaultPrevented === always || event.isDefaultPrevented === never;
    };
    var needsNormalizing = function (event) {
      return isNullable(event.preventDefault) || isNativeEvent(event);
    };
    var clone$2 = function (originalEvent, data) {
      var event = data !== null && data !== void 0 ? data : {};
      for (var name_1 in originalEvent) {
        if (!has$2(deprecated, name_1)) {
          event[name_1] = originalEvent[name_1];
        }
      }
      if (isNonNullable(event.composedPath)) {
        event.composedPath = function () {
          return originalEvent.composedPath();
        };
      }
      return event;
    };
    var normalize$3 = function (type, originalEvent, fallbackTarget, data) {
      var _a;
      var event = clone$2(originalEvent, data);
      event.type = type;
      if (isNullable(event.target)) {
        event.target = (_a = event.srcElement) !== null && _a !== void 0 ? _a : fallbackTarget;
      }
      if (needsNormalizing(originalEvent)) {
        event.preventDefault = function () {
          event.defaultPrevented = true;
          event.isDefaultPrevented = always;
          if (isFunction(originalEvent.preventDefault)) {
            originalEvent.preventDefault();
          } else if (isNativeEvent(originalEvent)) {
            originalEvent.returnValue = false;
          }
        };
        event.stopPropagation = function () {
          event.cancelBubble = true;
          event.isPropagationStopped = always;
          if (isFunction(originalEvent.stopPropagation)) {
            originalEvent.stopPropagation();
          } else if (isNativeEvent(originalEvent)) {
            originalEvent.cancelBubble = true;
          }
        };
        event.stopImmediatePropagation = function () {
          event.isImmediatePropagationStopped = always;
          event.stopPropagation();
        };
        if (!hasIsDefaultPrevented(event)) {
          event.isDefaultPrevented = event.defaultPrevented === true ? always : never;
          event.isPropagationStopped = event.cancelBubble === true ? always : never;
          event.isImmediatePropagationStopped = never;
        }
      }
      return event;
    };

    var eventExpandoPrefix = 'mce-data-';
    var mouseEventRe = /^(?:mouse|contextmenu)|click/;
    var addEvent = function (target, name, callback, capture) {
      if (target.addEventListener) {
        target.addEventListener(name, callback, capture || false);
      } else if (target.attachEvent) {
        target.attachEvent('on' + name, callback);
      }
    };
    var removeEvent = function (target, name, callback, capture) {
      if (target.removeEventListener) {
        target.removeEventListener(name, callback, capture || false);
      } else if (target.detachEvent) {
        target.detachEvent('on' + name, callback);
      }
    };
    var isMouseEvent = function (event) {
      return isNonNullable(event) && mouseEventRe.test(event.type);
    };
    var fix = function (originalEvent, data) {
      var event = normalize$3(originalEvent.type, originalEvent, document, data);
      if (isMouseEvent(originalEvent) && isUndefined(originalEvent.pageX) && !isUndefined(originalEvent.clientX)) {
        var eventDoc = event.target.ownerDocument || document;
        var doc = eventDoc.documentElement;
        var body = eventDoc.body;
        var mouseEvent = event;
        mouseEvent.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
        mouseEvent.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
      }
      if (isUndefined(event.metaKey)) {
        event.metaKey = false;
      }
      return event;
    };
    var bindOnReady = function (win, callback, eventUtils) {
      var doc = win.document, event = { type: 'ready' };
      if (eventUtils.domLoaded) {
        callback(event);
        return;
      }
      var isDocReady = function () {
        return doc.readyState === 'complete' || doc.readyState === 'interactive' && doc.body;
      };
      var readyHandler = function () {
        removeEvent(win, 'DOMContentLoaded', readyHandler);
        removeEvent(win, 'load', readyHandler);
        if (!eventUtils.domLoaded) {
          eventUtils.domLoaded = true;
          callback(event);
        }
        win = null;
      };
      if (isDocReady()) {
        readyHandler();
      } else {
        addEvent(win, 'DOMContentLoaded', readyHandler);
      }
      if (!eventUtils.domLoaded) {
        addEvent(win, 'load', readyHandler);
      }
    };
    var EventUtils = function () {
      function EventUtils() {
        this.domLoaded = false;
        this.events = {};
        this.count = 1;
        this.expando = eventExpandoPrefix + (+new Date()).toString(32);
        this.hasMouseEnterLeave = 'onmouseenter' in document.documentElement;
        this.hasFocusIn = 'onfocusin' in document.documentElement;
        this.count = 1;
      }
      EventUtils.prototype.bind = function (target, names, callback, scope) {
        var self = this;
        var id, callbackList, i, name, fakeName, nativeHandler, capture;
        var win = window;
        var defaultNativeHandler = function (evt) {
          self.executeHandlers(fix(evt || win.event), id);
        };
        if (!target || target.nodeType === 3 || target.nodeType === 8) {
          return;
        }
        if (!target[self.expando]) {
          id = self.count++;
          target[self.expando] = id;
          self.events[id] = {};
        } else {
          id = target[self.expando];
        }
        scope = scope || target;
        var namesList = names.split(' ');
        i = namesList.length;
        while (i--) {
          name = namesList[i];
          nativeHandler = defaultNativeHandler;
          fakeName = capture = false;
          if (name === 'DOMContentLoaded') {
            name = 'ready';
          }
          if (self.domLoaded && name === 'ready' && target.readyState === 'complete') {
            callback.call(scope, fix({ type: name }));
            continue;
          }
          if (!self.hasMouseEnterLeave) {
            fakeName = self.mouseEnterLeave[name];
            if (fakeName) {
              nativeHandler = function (evt) {
                var current = evt.currentTarget;
                var related = evt.relatedTarget;
                if (related && current.contains) {
                  related = current.contains(related);
                } else {
                  while (related && related !== current) {
                    related = related.parentNode;
                  }
                }
                if (!related) {
                  evt = fix(evt || win.event);
                  evt.type = evt.type === 'mouseout' ? 'mouseleave' : 'mouseenter';
                  evt.target = current;
                  self.executeHandlers(evt, id);
                }
              };
            }
          }
          if (!self.hasFocusIn && (name === 'focusin' || name === 'focusout')) {
            capture = true;
            fakeName = name === 'focusin' ? 'focus' : 'blur';
            nativeHandler = function (evt) {
              evt = fix(evt || win.event);
              evt.type = evt.type === 'focus' ? 'focusin' : 'focusout';
              self.executeHandlers(evt, id);
            };
          }
          callbackList = self.events[id][name];
          if (!callbackList) {
            self.events[id][name] = callbackList = [{
                func: callback,
                scope: scope
              }];
            callbackList.fakeName = fakeName;
            callbackList.capture = capture;
            callbackList.nativeHandler = nativeHandler;
            if (name === 'ready') {
              bindOnReady(target, nativeHandler, self);
            } else {
              addEvent(target, fakeName || name, nativeHandler, capture);
            }
          } else {
            if (name === 'ready' && self.domLoaded) {
              callback(fix({ type: name }));
            } else {
              callbackList.push({
                func: callback,
                scope: scope
              });
            }
          }
        }
        target = callbackList = null;
        return callback;
      };
      EventUtils.prototype.unbind = function (target, names, callback) {
        var callbackList, i, ci, name, eventMap;
        if (!target || target.nodeType === 3 || target.nodeType === 8) {
          return this;
        }
        var id = target[this.expando];
        if (id) {
          eventMap = this.events[id];
          if (names) {
            var namesList = names.split(' ');
            i = namesList.length;
            while (i--) {
              name = namesList[i];
              callbackList = eventMap[name];
              if (callbackList) {
                if (callback) {
                  ci = callbackList.length;
                  while (ci--) {
                    if (callbackList[ci].func === callback) {
                      var nativeHandler = callbackList.nativeHandler;
                      var fakeName = callbackList.fakeName, capture = callbackList.capture;
                      callbackList = callbackList.slice(0, ci).concat(callbackList.slice(ci + 1));
                      callbackList.nativeHandler = nativeHandler;
                      callbackList.fakeName = fakeName;
                      callbackList.capture = capture;
                      eventMap[name] = callbackList;
                    }
                  }
                }
                if (!callback || callbackList.length === 0) {
                  delete eventMap[name];
                  removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
                }
              }
            }
          } else {
            each$j(eventMap, function (callbackList, name) {
              removeEvent(target, callbackList.fakeName || name, callbackList.nativeHandler, callbackList.capture);
            });
            eventMap = {};
          }
          for (name in eventMap) {
            if (has$2(eventMap, name)) {
              return this;
            }
          }
          delete this.events[id];
          try {
            delete target[this.expando];
          } catch (ex) {
            target[this.expando] = null;
          }
        }
        return this;
      };
      EventUtils.prototype.fire = function (target, name, args) {
        var id;
        if (!target || target.nodeType === 3 || target.nodeType === 8) {
          return this;
        }
        var event = fix({
          type: name,
          target: target
        }, args);
        do {
          id = target[this.expando];
          if (id) {
            this.executeHandlers(event, id);
          }
          target = target.parentNode || target.ownerDocument || target.defaultView || target.parentWindow;
        } while (target && !event.isPropagationStopped());
        return this;
      };
      EventUtils.prototype.clean = function (target) {
        var i, children;
        if (!target || target.nodeType === 3 || target.nodeType === 8) {
          return this;
        }
        if (target[this.expando]) {
          this.unbind(target);
        }
        if (!target.getElementsByTagName) {
          target = target.document;
        }
        if (target && target.getElementsByTagName) {
          this.unbind(target);
          children = target.getElementsByTagName('*');
          i = children.length;
          while (i--) {
            target = children[i];
            if (target[this.expando]) {
              this.unbind(target);
            }
          }
        }
        return this;
      };
      EventUtils.prototype.destroy = function () {
        this.events = {};
      };
      EventUtils.prototype.cancel = function (e) {
        if (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        return false;
      };
      EventUtils.prototype.executeHandlers = function (evt, id) {
        var container = this.events[id];
        var callbackList = container && container[evt.type];
        if (callbackList) {
          for (var i = 0, l = callbackList.length; i < l; i++) {
            var callback = callbackList[i];
            if (callback && callback.func.call(callback.scope, evt) === false) {
              evt.preventDefault();
            }
            if (evt.isImmediatePropagationStopped()) {
              return;
            }
          }
        }
      };
      EventUtils.Event = new EventUtils();
      return EventUtils;
    }();

    var support, Expr, getText, isXML, tokenize, compile, select$1, outermostContext, sortInput, hasDuplicate, setDocument, document$1, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = 'sizzle' + -new Date(), preferredDoc = window.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), sortOrder = function (a, b) {
        if (a === b) {
          hasDuplicate = true;
        }
        return 0;
      }, strundefined = typeof undefined, MAX_NEGATIVE = 1 << 31, hasOwn = {}.hasOwnProperty, arr = [], pop = arr.pop, push_native = arr.push, push$1 = arr.push, slice$1 = arr.slice, indexOf = arr.indexOf || function (elem) {
        var i = 0, len = this.length;
        for (; i < len; i++) {
          if (this[i] === elem) {
            return i;
          }
        }
        return -1;
      }, booleans = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped', whitespace = '[\\x20\\t\\r\\n\\f]', identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+', attributes = '\\[' + whitespace + '*(' + identifier + ')(?:' + whitespace + '*([*^$|!~]?=)' + whitespace + '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)"|(' + identifier + '))|)' + whitespace + '*\\]', pseudos = ':(' + identifier + ')(?:\\((' + '(\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)")|' + '((?:\\\\.|[^\\\\()[\\]]|' + attributes + ')*)|' + '.*' + ')\\)|)', rtrim = new RegExp('^' + whitespace + '+|((?:^|[^\\\\])(?:\\\\.)*)' + whitespace + '+$', 'g'), rcomma = new RegExp('^' + whitespace + '*,' + whitespace + '*'), rcombinators = new RegExp('^' + whitespace + '*([>+~]|' + whitespace + ')' + whitespace + '*'), rattributeQuotes = new RegExp('=' + whitespace + '*([^\\]\'"]*?)' + whitespace + '*\\]', 'g'), rpseudo = new RegExp(pseudos), ridentifier = new RegExp('^' + identifier + '$'), matchExpr = {
        ID: new RegExp('^#(' + identifier + ')'),
        CLASS: new RegExp('^\\.(' + identifier + ')'),
        TAG: new RegExp('^(' + identifier + '|[*])'),
        ATTR: new RegExp('^' + attributes),
        PSEUDO: new RegExp('^' + pseudos),
        CHILD: new RegExp('^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' + whitespace + '*(even|odd|(([+-]|)(\\d*)n|)' + whitespace + '*(?:([+-]|)' + whitespace + '*(\\d+)|))' + whitespace + '*\\)|)', 'i'),
        bool: new RegExp('^(?:' + booleans + ')$', 'i'),
        needsContext: new RegExp('^' + whitespace + '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' + whitespace + '*((?:-\\d)?\\d*)' + whitespace + '*\\)|)(?=[^-]|$)', 'i')
      }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr$1 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, rescape = /'|\\/g, runescape = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig'), funescape = function (_, escaped, escapedWhitespace) {
        var high = '0x' + escaped - 65536;
        return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
      };
    try {
      push$1.apply(arr = slice$1.call(preferredDoc.childNodes), preferredDoc.childNodes);
      arr[preferredDoc.childNodes.length].nodeType;
    } catch (e) {
      push$1 = {
        apply: arr.length ? function (target, els) {
          push_native.apply(target, slice$1.call(els));
        } : function (target, els) {
          var j = target.length, i = 0;
          while (target[j++] = els[i++]) {
          }
          target.length = j - 1;
        }
      };
    }
    var Sizzle = function (selector, context, results, seed) {
      var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
      if ((context ? context.ownerDocument || context : preferredDoc) !== document$1) {
        setDocument(context);
      }
      context = context || document$1;
      results = results || [];
      if (!selector || typeof selector !== 'string') {
        return results;
      }
      if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
        return [];
      }
      if (documentIsHTML && !seed) {
        if (match = rquickExpr$1.exec(selector)) {
          if (m = match[1]) {
            if (nodeType === 9) {
              elem = context.getElementById(m);
              if (elem && elem.parentNode) {
                if (elem.id === m) {
                  results.push(elem);
                  return results;
                }
              } else {
                return results;
              }
            } else {
              if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                results.push(elem);
                return results;
              }
            }
          } else if (match[2]) {
            push$1.apply(results, context.getElementsByTagName(selector));
            return results;
          } else if ((m = match[3]) && support.getElementsByClassName) {
            push$1.apply(results, context.getElementsByClassName(m));
            return results;
          }
        }
        if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
          nid = old = expando;
          newContext = context;
          newSelector = nodeType === 9 && selector;
          if (nodeType === 1 && context.nodeName.toLowerCase() !== 'object') {
            groups = tokenize(selector);
            if (old = context.getAttribute('id')) {
              nid = old.replace(rescape, '\\$&');
            } else {
              context.setAttribute('id', nid);
            }
            nid = '[id=\'' + nid + '\'] ';
            i = groups.length;
            while (i--) {
              groups[i] = nid + toSelector(groups[i]);
            }
            newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
            newSelector = groups.join(',');
          }
          if (newSelector) {
            try {
              push$1.apply(results, newContext.querySelectorAll(newSelector));
              return results;
            } catch (qsaError) {
            } finally {
              if (!old) {
                context.removeAttribute('id');
              }
            }
          }
        }
      }
      return select$1(selector.replace(rtrim, '$1'), context, results, seed);
    };
    function createCache() {
      var keys = [];
      function cache(key, value) {
        if (keys.push(key + ' ') > Expr.cacheLength) {
          delete cache[keys.shift()];
        }
        return cache[key + ' '] = value;
      }
      return cache;
    }
    function markFunction(fn) {
      fn[expando] = true;
      return fn;
    }
    function siblingCheck(a, b) {
      var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
      if (diff) {
        return diff;
      }
      if (cur) {
        while (cur = cur.nextSibling) {
          if (cur === b) {
            return -1;
          }
        }
      }
      return a ? 1 : -1;
    }
    function createInputPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === type;
      };
    }
    function createButtonPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === 'input' || name === 'button') && elem.type === type;
      };
    }
    function createPositionalPseudo(fn) {
      return markFunction(function (argument) {
        argument = +argument;
        return markFunction(function (seed, matches) {
          var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length;
          while (i--) {
            if (seed[j = matchIndexes[i]]) {
              seed[j] = !(matches[j] = seed[j]);
            }
          }
        });
      });
    }
    function testContext(context) {
      return context && typeof context.getElementsByTagName !== strundefined && context;
    }
    support = Sizzle.support = {};
    isXML = Sizzle.isXML = function (elem) {
      var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      return documentElement ? documentElement.nodeName !== 'HTML' : false;
    };
    setDocument = Sizzle.setDocument = function (node) {
      var hasCompare, doc = node ? node.ownerDocument || node : preferredDoc, parent = doc.defaultView;
      function getTop(win) {
        try {
          return win.top;
        } catch (ex) {
        }
        return null;
      }
      if (doc === document$1 || doc.nodeType !== 9 || !doc.documentElement) {
        return document$1;
      }
      document$1 = doc;
      docElem = doc.documentElement;
      documentIsHTML = !isXML(doc);
      if (parent && parent !== getTop(parent)) {
        if (parent.addEventListener) {
          parent.addEventListener('unload', function () {
            setDocument();
          }, false);
        } else if (parent.attachEvent) {
          parent.attachEvent('onunload', function () {
            setDocument();
          });
        }
      }
      support.attributes = true;
      support.getElementsByTagName = true;
      support.getElementsByClassName = rnative.test(doc.getElementsByClassName);
      support.getById = true;
      Expr.find.ID = function (id, context) {
        if (typeof context.getElementById !== strundefined && documentIsHTML) {
          var m = context.getElementById(id);
          return m && m.parentNode ? [m] : [];
        }
      };
      Expr.filter.ID = function (id) {
        var attrId = id.replace(runescape, funescape);
        return function (elem) {
          return elem.getAttribute('id') === attrId;
        };
      };
      Expr.find.TAG = support.getElementsByTagName ? function (tag, context) {
        if (typeof context.getElementsByTagName !== strundefined) {
          return context.getElementsByTagName(tag);
        }
      } : function (tag, context) {
        var elem, tmp = [], i = 0, results = context.getElementsByTagName(tag);
        if (tag === '*') {
          while (elem = results[i++]) {
            if (elem.nodeType === 1) {
              tmp.push(elem);
            }
          }
          return tmp;
        }
        return results;
      };
      Expr.find.CLASS = support.getElementsByClassName && function (className, context) {
        if (documentIsHTML) {
          return context.getElementsByClassName(className);
        }
      };
      rbuggyMatches = [];
      rbuggyQSA = [];
      support.disconnectedMatch = true;
      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join('|'));
      rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join('|'));
      hasCompare = rnative.test(docElem.compareDocumentPosition);
      contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
      } : function (a, b) {
        if (b) {
          while (b = b.parentNode) {
            if (b === a) {
              return true;
            }
          }
        }
        return false;
      };
      sortOrder = hasCompare ? function (a, b) {
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }
        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
        if (compare) {
          return compare;
        }
        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
        if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
          if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
            return -1;
          }
          if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
            return 1;
          }
          return sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
        }
        return compare & 4 ? -1 : 1;
      } : function (a, b) {
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }
        var cur, i = 0, aup = a.parentNode, bup = b.parentNode, ap = [a], bp = [b];
        if (!aup || !bup) {
          return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
        } else if (aup === bup) {
          return siblingCheck(a, b);
        }
        cur = a;
        while (cur = cur.parentNode) {
          ap.unshift(cur);
        }
        cur = b;
        while (cur = cur.parentNode) {
          bp.unshift(cur);
        }
        while (ap[i] === bp[i]) {
          i++;
        }
        return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
      };
      return doc;
    };
    Sizzle.matches = function (expr, elements) {
      return Sizzle(expr, null, null, elements);
    };
    Sizzle.matchesSelector = function (elem, expr) {
      if ((elem.ownerDocument || elem) !== document$1) {
        setDocument(elem);
      }
      expr = expr.replace(rattributeQuotes, '=\'$1\']');
      if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
        try {
          var ret = matches.call(elem, expr);
          if (ret || support.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
            return ret;
          }
        } catch (e) {
        }
      }
      return Sizzle(expr, document$1, null, [elem]).length > 0;
    };
    Sizzle.contains = function (context, elem) {
      if ((context.ownerDocument || context) !== document$1) {
        setDocument(context);
      }
      return contains(context, elem);
    };
    Sizzle.attr = function (elem, name) {
      if ((elem.ownerDocument || elem) !== document$1) {
        setDocument(elem);
      }
      var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
      return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
    };
    Sizzle.error = function (msg) {
      throw new Error('Syntax error, unrecognized expression: ' + msg);
    };
    Sizzle.uniqueSort = function (results) {
      var elem, duplicates = [], j = 0, i = 0;
      hasDuplicate = !support.detectDuplicates;
      sortInput = !support.sortStable && results.slice(0);
      results.sort(sortOrder);
      if (hasDuplicate) {
        while (elem = results[i++]) {
          if (elem === results[i]) {
            j = duplicates.push(i);
          }
        }
        while (j--) {
          results.splice(duplicates[j], 1);
        }
      }
      sortInput = null;
      return results;
    };
    getText = Sizzle.getText = function (elem) {
      var node, ret = '', i = 0, nodeType = elem.nodeType;
      if (!nodeType) {
        while (node = elem[i++]) {
          ret += getText(node);
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        if (typeof elem.textContent === 'string') {
          return elem.textContent;
        } else {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      }
      return ret;
    };
    Expr = Sizzle.selectors = {
      cacheLength: 50,
      createPseudo: markFunction,
      match: matchExpr,
      attrHandle: {},
      find: {},
      relative: {
        '>': {
          dir: 'parentNode',
          first: true
        },
        ' ': { dir: 'parentNode' },
        '+': {
          dir: 'previousSibling',
          first: true
        },
        '~': { dir: 'previousSibling' }
      },
      preFilter: {
        ATTR: function (match) {
          match[1] = match[1].replace(runescape, funescape);
          match[3] = (match[3] || match[4] || match[5] || '').replace(runescape, funescape);
          if (match[2] === '~=') {
            match[3] = ' ' + match[3] + ' ';
          }
          return match.slice(0, 4);
        },
        CHILD: function (match) {
          match[1] = match[1].toLowerCase();
          if (match[1].slice(0, 3) === 'nth') {
            if (!match[3]) {
              Sizzle.error(match[0]);
            }
            match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === 'even' || match[3] === 'odd'));
            match[5] = +(match[7] + match[8] || match[3] === 'odd');
          } else if (match[3]) {
            Sizzle.error(match[0]);
          }
          return match;
        },
        PSEUDO: function (match) {
          var excess, unquoted = !match[6] && match[2];
          if (matchExpr.CHILD.test(match[0])) {
            return null;
          }
          if (match[3]) {
            match[2] = match[4] || match[5] || '';
          } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(')', unquoted.length - excess) - unquoted.length)) {
            match[0] = match[0].slice(0, excess);
            match[2] = unquoted.slice(0, excess);
          }
          return match.slice(0, 3);
        }
      },
      filter: {
        TAG: function (nodeNameSelector) {
          var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
          return nodeNameSelector === '*' ? function () {
            return true;
          } : function (elem) {
            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
          };
        },
        CLASS: function (className) {
          var pattern = classCache[className + ' '];
          return pattern || (pattern = new RegExp('(^|' + whitespace + ')' + className + '(' + whitespace + '|$)')) && classCache(className, function (elem) {
            return pattern.test(typeof elem.className === 'string' && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute('class') || '');
          });
        },
        ATTR: function (name, operator, check) {
          return function (elem) {
            var result = Sizzle.attr(elem, name);
            if (result == null) {
              return operator === '!=';
            }
            if (!operator) {
              return true;
            }
            result += '';
            return operator === '=' ? result === check : operator === '!=' ? result !== check : operator === '^=' ? check && result.indexOf(check) === 0 : operator === '*=' ? check && result.indexOf(check) > -1 : operator === '$=' ? check && result.slice(-check.length) === check : operator === '~=' ? (' ' + result + ' ').indexOf(check) > -1 : operator === '|=' ? result === check || result.slice(0, check.length + 1) === check + '-' : false;
          };
        },
        CHILD: function (type, what, argument, first, last) {
          var simple = type.slice(0, 3) !== 'nth', forward = type.slice(-4) !== 'last', ofType = what === 'of-type';
          return first === 1 && last === 0 ? function (elem) {
            return !!elem.parentNode;
          } : function (elem, context, xml) {
            var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? 'nextSibling' : 'previousSibling', parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
            if (parent) {
              if (simple) {
                while (dir) {
                  node = elem;
                  while (node = node[dir]) {
                    if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                      return false;
                    }
                  }
                  start = dir = type === 'only' && !start && 'nextSibling';
                }
                return true;
              }
              start = [forward ? parent.firstChild : parent.lastChild];
              if (forward && useCache) {
                outerCache = parent[expando] || (parent[expando] = {});
                cache = outerCache[type] || [];
                nodeIndex = cache[0] === dirruns && cache[1];
                diff = cache[0] === dirruns && cache[2];
                node = nodeIndex && parent.childNodes[nodeIndex];
                while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                  if (node.nodeType === 1 && ++diff && node === elem) {
                    outerCache[type] = [
                      dirruns,
                      nodeIndex,
                      diff
                    ];
                    break;
                  }
                }
              } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                diff = cache[1];
              } else {
                while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                  if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                    if (useCache) {
                      (node[expando] || (node[expando] = {}))[type] = [
                        dirruns,
                        diff
                      ];
                    }
                    if (node === elem) {
                      break;
                    }
                  }
                }
              }
              diff -= last;
              return diff === first || diff % first === 0 && diff / first >= 0;
            }
          };
        },
        PSEUDO: function (pseudo, argument) {
          var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error('unsupported pseudo: ' + pseudo);
          if (fn[expando]) {
            return fn(argument);
          }
          if (fn.length > 1) {
            args = [
              pseudo,
              pseudo,
              '',
              argument
            ];
            return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
              var idx, matched = fn(seed, argument), i = matched.length;
              while (i--) {
                idx = indexOf.call(seed, matched[i]);
                seed[idx] = !(matches[idx] = matched[i]);
              }
            }) : function (elem) {
              return fn(elem, 0, args);
            };
          }
          return fn;
        }
      },
      pseudos: {
        not: markFunction(function (selector) {
          var input = [], results = [], matcher = compile(selector.replace(rtrim, '$1'));
          return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
            var elem, unmatched = matcher(seed, null, xml, []), i = seed.length;
            while (i--) {
              if (elem = unmatched[i]) {
                seed[i] = !(matches[i] = elem);
              }
            }
          }) : function (elem, context, xml) {
            input[0] = elem;
            matcher(input, null, xml, results);
            input[0] = null;
            return !results.pop();
          };
        }),
        has: markFunction(function (selector) {
          return function (elem) {
            return Sizzle(selector, elem).length > 0;
          };
        }),
        contains: markFunction(function (text) {
          text = text.replace(runescape, funescape);
          return function (elem) {
            return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
          };
        }),
        lang: markFunction(function (lang) {
          if (!ridentifier.test(lang || '')) {
            Sizzle.error('unsupported lang: ' + lang);
          }
          lang = lang.replace(runescape, funescape).toLowerCase();
          return function (elem) {
            var elemLang;
            do {
              if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute('xml:lang') || elem.getAttribute('lang')) {
                elemLang = elemLang.toLowerCase();
                return elemLang === lang || elemLang.indexOf(lang + '-') === 0;
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);
            return false;
          };
        }),
        target: function (elem) {
          var hash = window.location && window.location.hash;
          return hash && hash.slice(1) === elem.id;
        },
        root: function (elem) {
          return elem === docElem;
        },
        focus: function (elem) {
          return elem === document$1.activeElement && (!document$1.hasFocus || document$1.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },
        enabled: function (elem) {
          return elem.disabled === false;
        },
        disabled: function (elem) {
          return elem.disabled === true;
        },
        checked: function (elem) {
          var nodeName = elem.nodeName.toLowerCase();
          return nodeName === 'input' && !!elem.checked || nodeName === 'option' && !!elem.selected;
        },
        selected: function (elem) {
          if (elem.parentNode) {
            elem.parentNode.selectedIndex;
          }
          return elem.selected === true;
        },
        empty: function (elem) {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }
          return true;
        },
        parent: function (elem) {
          return !Expr.pseudos.empty(elem);
        },
        header: function (elem) {
          return rheader.test(elem.nodeName);
        },
        input: function (elem) {
          return rinputs.test(elem.nodeName);
        },
        button: function (elem) {
          var name = elem.nodeName.toLowerCase();
          return name === 'input' && elem.type === 'button' || name === 'button';
        },
        text: function (elem) {
          var attr;
          return elem.nodeName.toLowerCase() === 'input' && elem.type === 'text' && ((attr = elem.getAttribute('type')) == null || attr.toLowerCase() === 'text');
        },
        first: createPositionalPseudo(function () {
          return [0];
        }),
        last: createPositionalPseudo(function (matchIndexes, length) {
          return [length - 1];
        }),
        eq: createPositionalPseudo(function (matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument];
        }),
        even: createPositionalPseudo(function (matchIndexes, length) {
          var i = 0;
          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),
        odd: createPositionalPseudo(function (matchIndexes, length) {
          var i = 1;
          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),
        lt: createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;
          for (; --i >= 0;) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),
        gt: createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;
          for (; ++i < length;) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        })
      }
    };
    Expr.pseudos.nth = Expr.pseudos.eq;
    each$k([
      'radio',
      'checkbox',
      'file',
      'password',
      'image'
    ], function (i) {
      Expr.pseudos[i] = createInputPseudo(i);
    });
    each$k([
      'submit',
      'reset'
    ], function (i) {
      Expr.pseudos[i] = createButtonPseudo(i);
    });
    function setFilters() {
    }
    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();
    tokenize = Sizzle.tokenize = function (selector, parseOnly) {
      var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + ' '];
      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }
      soFar = selector;
      groups = [];
      preFilters = Expr.preFilter;
      while (soFar) {
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            soFar = soFar.slice(match[0].length) || soFar;
          }
          groups.push(tokens = []);
        }
        matched = false;
        if (match = rcombinators.exec(soFar)) {
          matched = match.shift();
          tokens.push({
            value: matched,
            type: match[0].replace(rtrim, ' ')
          });
          soFar = soFar.slice(matched.length);
        }
        for (type in Expr.filter) {
          if (!Expr.filter.hasOwnProperty(type)) {
            continue;
          }
          if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
            matched = match.shift();
            tokens.push({
              value: matched,
              type: type,
              matches: match
            });
            soFar = soFar.slice(matched.length);
          }
        }
        if (!matched) {
          break;
        }
      }
      return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
    };
    function toSelector(tokens) {
      var i = 0, len = tokens.length, selector = '';
      for (; i < len; i++) {
        selector += tokens[i].value;
      }
      return selector;
    }
    function addCombinator(matcher, combinator, base) {
      var dir = combinator.dir, checkNonElements = base && dir === 'parentNode', doneName = done++;
      return combinator.first ? function (elem, context, xml) {
        while (elem = elem[dir]) {
          if (elem.nodeType === 1 || checkNonElements) {
            return matcher(elem, context, xml);
          }
        }
      } : function (elem, context, xml) {
        var oldCache, outerCache, newCache = [
            dirruns,
            doneName
          ];
        if (xml) {
          while (elem = elem[dir]) {
            if (elem.nodeType === 1 || checkNonElements) {
              if (matcher(elem, context, xml)) {
                return true;
              }
            }
          }
        } else {
          while (elem = elem[dir]) {
            if (elem.nodeType === 1 || checkNonElements) {
              outerCache = elem[expando] || (elem[expando] = {});
              if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                return newCache[2] = oldCache[2];
              } else {
                outerCache[dir] = newCache;
                if (newCache[2] = matcher(elem, context, xml)) {
                  return true;
                }
              }
            }
          }
        }
      };
    }
    function elementMatcher(matchers) {
      return matchers.length > 1 ? function (elem, context, xml) {
        var i = matchers.length;
        while (i--) {
          if (!matchers[i](elem, context, xml)) {
            return false;
          }
        }
        return true;
      } : matchers[0];
    }
    function multipleContexts(selector, contexts, results) {
      var i = 0, len = contexts.length;
      for (; i < len; i++) {
        Sizzle(selector, contexts[i], results);
      }
      return results;
    }
    function condense(unmatched, map, filter, context, xml) {
      var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = map != null;
      for (; i < len; i++) {
        if (elem = unmatched[i]) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);
            if (mapped) {
              map.push(i);
            }
          }
        }
      }
      return newUnmatched;
    }
    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
      if (postFilter && !postFilter[expando]) {
        postFilter = setMatcher(postFilter);
      }
      if (postFinder && !postFinder[expando]) {
        postFinder = setMatcher(postFinder, postSelector);
      }
      return markFunction(function (seed, results, context, xml) {
        var temp, i, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || '*', context.nodeType ? [context] : context, []), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
        if (matcher) {
          matcher(matcherIn, matcherOut, context, xml);
        }
        if (postFilter) {
          temp = condense(matcherOut, postMap);
          postFilter(temp, [], context, xml);
          i = temp.length;
          while (i--) {
            if (elem = temp[i]) {
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
            }
          }
        }
        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              temp = [];
              i = matcherOut.length;
              while (i--) {
                if (elem = matcherOut[i]) {
                  temp.push(matcherIn[i] = elem);
                }
              }
              postFinder(null, matcherOut = [], temp, xml);
            }
            i = matcherOut.length;
            while (i--) {
              if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {
                seed[temp] = !(results[temp] = elem);
              }
            }
          }
        } else {
          matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
          if (postFinder) {
            postFinder(null, results, matcherOut, xml);
          } else {
            push$1.apply(results, matcherOut);
          }
        }
      });
    }
    function matcherFromTokens(tokens) {
      var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[' '], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function (elem) {
          return elem === checkContext;
        }, implicitRelative, true), matchAnyContext = addCombinator(function (elem) {
          return indexOf.call(checkContext, elem) > -1;
        }, implicitRelative, true), matchers = [function (elem, context, xml) {
            var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
            checkContext = null;
            return ret;
          }];
      for (; i < len; i++) {
        if (matcher = Expr.relative[tokens[i].type]) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
          if (matcher[expando]) {
            j = ++i;
            for (; j < len; j++) {
              if (Expr.relative[tokens[j].type]) {
                break;
              }
            }
            return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === ' ' ? '*' : '' })).replace(rtrim, '$1'), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
          }
          matchers.push(matcher);
        }
      }
      return elementMatcher(matchers);
    }
    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function (seed, context, xml, results, outermost) {
          var elem, j, matcher, matchedCount = 0, i = '0', unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find.TAG('*', outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
          if (outermost) {
            outermostContext = context !== document$1 && context;
          }
          for (; i !== len && (elem = elems[i]) != null; i++) {
            if (byElement && elem) {
              j = 0;
              while (matcher = elementMatchers[j++]) {
                if (matcher(elem, context, xml)) {
                  results.push(elem);
                  break;
                }
              }
              if (outermost) {
                dirruns = dirrunsUnique;
              }
            }
            if (bySet) {
              if (elem = !matcher && elem) {
                matchedCount--;
              }
              if (seed) {
                unmatched.push(elem);
              }
            }
          }
          matchedCount += i;
          if (bySet && i !== matchedCount) {
            j = 0;
            while (matcher = setMatchers[j++]) {
              matcher(unmatched, setMatched, context, xml);
            }
            if (seed) {
              if (matchedCount > 0) {
                while (i--) {
                  if (!(unmatched[i] || setMatched[i])) {
                    setMatched[i] = pop.call(results);
                  }
                }
              }
              setMatched = condense(setMatched);
            }
            push$1.apply(results, setMatched);
            if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
              Sizzle.uniqueSort(results);
            }
          }
          if (outermost) {
            dirruns = dirrunsUnique;
            outermostContext = contextBackup;
          }
          return unmatched;
        };
      return bySet ? markFunction(superMatcher) : superMatcher;
    }
    compile = Sizzle.compile = function (selector, match) {
      var i, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + ' '];
      if (!cached) {
        if (!match) {
          match = tokenize(selector);
        }
        i = match.length;
        while (i--) {
          cached = matcherFromTokens(match[i]);
          if (cached[expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        }
        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
        cached.selector = selector;
      }
      return cached;
    };
    select$1 = Sizzle.select = function (selector, context, results, seed) {
      var i, tokens, token, type, find, compiled = typeof selector === 'function' && selector, match = !seed && tokenize(selector = compiled.selector || selector);
      results = results || [];
      if (match.length === 1) {
        tokens = match[0] = match[0].slice(0);
        if (tokens.length > 2 && (token = tokens[0]).type === 'ID' && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
          context = (Expr.find.ID(token.matches[0].replace(runescape, funescape), context) || [])[0];
          if (!context) {
            return results;
          } else if (compiled) {
            context = context.parentNode;
          }
          selector = selector.slice(tokens.shift().value.length);
        }
        i = matchExpr.needsContext.test(selector) ? 0 : tokens.length;
        while (i--) {
          token = tokens[i];
          if (Expr.relative[type = token.type]) {
            break;
          }
          if (find = Expr.find[type]) {
            if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
              tokens.splice(i, 1);
              selector = seed.length && toSelector(tokens);
              if (!selector) {
                push$1.apply(results, seed);
                return results;
              }
              break;
            }
          }
        }
      }
      (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
      return results;
    };
    support.sortStable = expando.split('').sort(sortOrder).join('') === expando;
    support.detectDuplicates = !!hasDuplicate;
    setDocument();
    support.sortDetached = true;

    var doc = document;
    var push = Array.prototype.push;
    var slice = Array.prototype.slice;
    var rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
    var Event$1 = EventUtils.Event;
    var skipUniques = Tools.makeMap('children,contents,next,prev');
    var isDefined = function (obj) {
      return typeof obj !== 'undefined';
    };
    var isString = function (obj) {
      return typeof obj === 'string';
    };
    var isWindow = function (obj) {
      return obj && obj === obj.window;
    };
    var createFragment$1 = function (html, fragDoc) {
      fragDoc = fragDoc || doc;
      var container = fragDoc.createElement('div');
      var frag = fragDoc.createDocumentFragment();
      container.innerHTML = html;
      var node;
      while (node = container.firstChild) {
        frag.appendChild(node);
      }
      return frag;
    };
    var domManipulate = function (targetNodes, sourceItem, callback, reverse) {
      var i;
      if (isString(sourceItem)) {
        sourceItem = createFragment$1(sourceItem, getElementDocument(targetNodes[0]));
      } else if (sourceItem.length && !sourceItem.nodeType) {
        sourceItem = DomQuery.makeArray(sourceItem);
        if (reverse) {
          for (i = sourceItem.length - 1; i >= 0; i--) {
            domManipulate(targetNodes, sourceItem[i], callback, reverse);
          }
        } else {
          for (i = 0; i < sourceItem.length; i++) {
            domManipulate(targetNodes, sourceItem[i], callback, reverse);
          }
        }
        return targetNodes;
      }
      if (sourceItem.nodeType) {
        i = targetNodes.length;
        while (i--) {
          callback.call(targetNodes[i], sourceItem);
        }
      }
      return targetNodes;
    };
    var hasClass = function (node, className) {
      return node && className && (' ' + node.className + ' ').indexOf(' ' + className + ' ') !== -1;
    };
    var wrap$2 = function (elements, wrapper, all) {
      var lastParent, newWrapper;
      wrapper = DomQuery(wrapper)[0];
      elements.each(function () {
        var self = this;
        if (!all || lastParent !== self.parentNode) {
          lastParent = self.parentNode;
          newWrapper = wrapper.cloneNode(false);
          self.parentNode.insertBefore(newWrapper, self);
          newWrapper.appendChild(self);
        } else {
          newWrapper.appendChild(self);
        }
      });
      return elements;
    };
    var numericCssMap = Tools.makeMap('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom', ' ');
    var booleanMap = Tools.makeMap('checked compact declare defer disabled ismap multiple nohref noshade nowrap readonly selected', ' ');
    var propFix = {
      for: 'htmlFor',
      class: 'className',
      readonly: 'readOnly'
    };
    var cssFix = { float: 'cssFloat' };
    var attrHooks = {}, cssHooks = {};
    var DomQueryConstructor = function (selector, context) {
      return new DomQuery.fn.init(selector, context);
    };
    var inArray$1 = function (item, array) {
      var i;
      if (array.indexOf) {
        return array.indexOf(item);
      }
      i = array.length;
      while (i--) {
        if (array[i] === item) {
          return i;
        }
      }
      return -1;
    };
    var whiteSpaceRegExp = /^\s*|\s*$/g;
    var trim$1 = function (str) {
      return str === null || str === undefined ? '' : ('' + str).replace(whiteSpaceRegExp, '');
    };
    var each$g = function (obj, callback) {
      var length, key, i, value;
      if (obj) {
        length = obj.length;
        if (length === undefined) {
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              value = obj[key];
              if (callback.call(value, key, value) === false) {
                break;
              }
            }
          }
        } else {
          for (i = 0; i < length; i++) {
            value = obj[i];
            if (callback.call(value, i, value) === false) {
              break;
            }
          }
        }
      }
      return obj;
    };
    var grep$2 = function (array, callback) {
      var out = [];
      each$g(array, function (i, item) {
        if (callback(item, i)) {
          out.push(item);
        }
      });
      return out;
    };
    var getElementDocument = function (element) {
      if (!element) {
        return doc;
      }
      if (element.nodeType === 9) {
        return element;
      }
      return element.ownerDocument;
    };
    DomQueryConstructor.fn = DomQueryConstructor.prototype = {
      constructor: DomQueryConstructor,
      selector: '',
      context: null,
      length: 0,
      init: function (selector, context) {
        var self = this;
        var match, node;
        if (!selector) {
          return self;
        }
        if (selector.nodeType) {
          self.context = self[0] = selector;
          self.length = 1;
          return self;
        }
        if (context && context.nodeType) {
          self.context = context;
        } else {
          if (context) {
            return DomQuery(selector).attr(context);
          }
          self.context = context = document;
        }
        if (isString(selector)) {
          self.selector = selector;
          if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3) {
            match = [
              null,
              selector,
              null
            ];
          } else {
            match = rquickExpr.exec(selector);
          }
          if (match) {
            if (match[1]) {
              node = createFragment$1(selector, getElementDocument(context)).firstChild;
              while (node) {
                push.call(self, node);
                node = node.nextSibling;
              }
            } else {
              node = getElementDocument(context).getElementById(match[2]);
              if (!node) {
                return self;
              }
              if (node.id !== match[2]) {
                return self.find(selector);
              }
              self.length = 1;
              self[0] = node;
            }
          } else {
            return DomQuery(context).find(selector);
          }
        } else {
          this.add(selector, false);
        }
        return self;
      },
      toArray: function () {
        return Tools.toArray(this);
      },
      add: function (items, sort) {
        var self = this;
        var nodes, i;
        if (isString(items)) {
          return self.add(DomQuery(items));
        }
        if (sort !== false) {
          nodes = DomQuery.unique(self.toArray().concat(DomQuery.makeArray(items)));
          self.length = nodes.length;
          for (i = 0; i < nodes.length; i++) {
            self[i] = nodes[i];
          }
        } else {
          push.apply(self, DomQuery.makeArray(items));
        }
        return self;
      },
      attr: function (name, value) {
        var self = this;
        var hook;
        if (typeof name === 'object') {
          each$g(name, function (name, value) {
            self.attr(name, value);
          });
        } else if (isDefined(value)) {
          this.each(function () {
            var hook;
            if (this.nodeType === 1) {
              hook = attrHooks[name];
              if (hook && hook.set) {
                hook.set(this, value);
                return;
              }
              if (value === null) {
                this.removeAttribute(name, 2);
              } else {
                this.setAttribute(name, value, 2);
              }
            }
          });
        } else {
          if (self[0] && self[0].nodeType === 1) {
            hook = attrHooks[name];
            if (hook && hook.get) {
              return hook.get(self[0], name);
            }
            if (booleanMap[name]) {
              return self.prop(name) ? name : undefined;
            }
            value = self[0].getAttribute(name, 2);
            if (value === null) {
              value = undefined;
            }
          }
          return value;
        }
        return self;
      },
      removeAttr: function (name) {
        return this.attr(name, null);
      },
      prop: function (name, value) {
        var self = this;
        name = propFix[name] || name;
        if (typeof name === 'object') {
          each$g(name, function (name, value) {
            self.prop(name, value);
          });
        } else if (isDefined(value)) {
          this.each(function () {
            if (this.nodeType === 1) {
              this[name] = value;
            }
          });
        } else {
          if (self[0] && self[0].nodeType && name in self[0]) {
            return self[0][name];
          }
          return value;
        }
        return self;
      },
      css: function (name, value) {
        var self = this;
        var elm, hook;
        var camel = function (name) {
          return name.replace(/-(\D)/g, function (a, b) {
            return b.toUpperCase();
          });
        };
        var dashed = function (name) {
          return name.replace(/[A-Z]/g, function (a) {
            return '-' + a;
          });
        };
        if (typeof name === 'object') {
          each$g(name, function (name, value) {
            self.css(name, value);
          });
        } else {
          if (isDefined(value)) {
            name = camel(name);
            if (typeof value === 'number' && !numericCssMap[name]) {
              value = value.toString() + 'px';
            }
            self.each(function () {
              var style = this.style;
              hook = cssHooks[name];
              if (hook && hook.set) {
                hook.set(this, value);
                return;
              }
              try {
                this.style[cssFix[name] || name] = value;
              } catch (ex) {
              }
              if (value === null || value === '') {
                if (style.removeProperty) {
                  style.removeProperty(dashed(name));
                } else {
                  style.removeAttribute(name);
                }
              }
            });
          } else {
            elm = self[0];
            hook = cssHooks[name];
            if (hook && hook.get) {
              return hook.get(elm);
            }
            if (elm.ownerDocument.defaultView) {
              try {
                return elm.ownerDocument.defaultView.getComputedStyle(elm, null).getPropertyValue(dashed(name));
              } catch (ex) {
                return undefined;
              }
            } else if (elm.currentStyle) {
              return elm.currentStyle[camel(name)];
            } else {
              return '';
            }
          }
        }
        return self;
      },
      remove: function () {
        var self = this;
        var node, i = this.length;
        while (i--) {
          node = self[i];
          Event$1.clean(node);
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
        return this;
      },
      empty: function () {
        var self = this;
        var node, i = this.length;
        while (i--) {
          node = self[i];
          while (node.firstChild) {
            node.removeChild(node.firstChild);
          }
        }
        return this;
      },
      html: function (value) {
        var self = this;
        var i;
        if (isDefined(value)) {
          i = self.length;
          try {
            while (i--) {
              self[i].innerHTML = value;
            }
          } catch (ex) {
            DomQuery(self[i]).empty().append(value);
          }
          return self;
        }
        return self[0] ? self[0].innerHTML : '';
      },
      text: function (value) {
        var self = this;
        var i;
        if (isDefined(value)) {
          i = self.length;
          while (i--) {
            if ('innerText' in self[i]) {
              self[i].innerText = value;
            } else {
              self[0].textContent = value;
            }
          }
          return self;
        }
        return self[0] ? self[0].innerText || self[0].textContent : '';
      },
      append: function () {
        return domManipulate(this, arguments, function (node) {
          if (this.nodeType === 1 || this.host && this.host.nodeType === 1) {
            this.appendChild(node);
          }
        });
      },
      prepend: function () {
        return domManipulate(this, arguments, function (node) {
          if (this.nodeType === 1 || this.host && this.host.nodeType === 1) {
            this.insertBefore(node, this.firstChild);
          }
        }, true);
      },
      before: function () {
        var self = this;
        if (self[0] && self[0].parentNode) {
          return domManipulate(self, arguments, function (node) {
            this.parentNode.insertBefore(node, this);
          });
        }
        return self;
      },
      after: function () {
        var self = this;
        if (self[0] && self[0].parentNode) {
          return domManipulate(self, arguments, function (node) {
            this.parentNode.insertBefore(node, this.nextSibling);
          }, true);
        }
        return self;
      },
      appendTo: function (val) {
        DomQuery(val).append(this);
        return this;
      },
      prependTo: function (val) {
        DomQuery(val).prepend(this);
        return this;
      },
      replaceWith: function (content) {
        return this.before(content).remove();
      },
      wrap: function (content) {
        return wrap$2(this, content);
      },
      wrapAll: function (content) {
        return wrap$2(this, content, true);
      },
      wrapInner: function (content) {
        this.each(function () {
          DomQuery(this).contents().wrapAll(content);
        });
        return this;
      },
      unwrap: function () {
        return this.parent().each(function () {
          DomQuery(this).replaceWith(this.childNodes);
        });
      },
      clone: function () {
        var result = [];
        this.each(function () {
          result.push(this.cloneNode(true));
        });
        return DomQuery(result);
      },
      addClass: function (className) {
        return this.toggleClass(className, true);
      },
      removeClass: function (className) {
        return this.toggleClass(className, false);
      },
      toggleClass: function (className, state) {
        var self = this;
        if (typeof className !== 'string') {
          return self;
        }
        if (className.indexOf(' ') !== -1) {
          each$g(className.split(' '), function () {
            self.toggleClass(this, state);
          });
        } else {
          self.each(function (index, node) {
            var classState = hasClass(node, className);
            if (classState !== state) {
              var existingClassName = node.className;
              if (classState) {
                node.className = trim$1((' ' + existingClassName + ' ').replace(' ' + className + ' ', ' '));
              } else {
                node.className += existingClassName ? ' ' + className : className;
              }
            }
          });
        }
        return self;
      },
      hasClass: function (className) {
        return hasClass(this[0], className);
      },
      each: function (callback) {
        return each$g(this, callback);
      },
      on: function (name, callback) {
        return this.each(function () {
          Event$1.bind(this, name, callback);
        });
      },
      off: function (name, callback) {
        return this.each(function () {
          Event$1.unbind(this, name, callback);
        });
      },
      trigger: function (name) {
        return this.each(function () {
          if (typeof name === 'object') {
            Event$1.fire(this, name.type, name);
          } else {
            Event$1.fire(this, name);
          }
        });
      },
      show: function () {
        return this.css('display', '');
      },
      hide: function () {
        return this.css('display', 'none');
      },
      slice: function () {
        return DomQuery(slice.apply(this, arguments));
      },
      eq: function (index) {
        return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
      },
      first: function () {
        return this.eq(0);
      },
      last: function () {
        return this.eq(-1);
      },
      find: function (selector) {
        var i, l;
        var ret = [];
        for (i = 0, l = this.length; i < l; i++) {
          DomQuery.find(selector, this[i], ret);
        }
        return DomQuery(ret);
      },
      filter: function (selector) {
        if (typeof selector === 'function') {
          return DomQuery(grep$2(this.toArray(), function (item, i) {
            return selector(i, item);
          }));
        }
        return DomQuery(DomQuery.filter(selector, this.toArray()));
      },
      closest: function (selector) {
        var result = [];
        if (selector instanceof DomQuery) {
          selector = selector[0];
        }
        this.each(function (i, node) {
          while (node) {
            if (typeof selector === 'string' && DomQuery(node).is(selector)) {
              result.push(node);
              break;
            } else if (node === selector) {
              result.push(node);
              break;
            }
            node = node.parentNode;
          }
        });
        return DomQuery(result);
      },
      offset: function (offset) {
        var elm, doc, docElm;
        var x = 0, y = 0, pos;
        if (!offset) {
          elm = this[0];
          if (elm) {
            doc = elm.ownerDocument;
            docElm = doc.documentElement;
            if (elm.getBoundingClientRect) {
              pos = elm.getBoundingClientRect();
              x = pos.left + (docElm.scrollLeft || doc.body.scrollLeft) - docElm.clientLeft;
              y = pos.top + (docElm.scrollTop || doc.body.scrollTop) - docElm.clientTop;
            }
          }
          return {
            left: x,
            top: y
          };
        }
        return this.css(offset);
      },
      push: push,
      sort: Array.prototype.sort,
      splice: Array.prototype.splice
    };
    Tools.extend(DomQueryConstructor, {
      extend: Tools.extend,
      makeArray: function (object) {
        if (isWindow(object) || object.nodeType) {
          return [object];
        }
        return Tools.toArray(object);
      },
      inArray: inArray$1,
      isArray: Tools.isArray,
      each: each$g,
      trim: trim$1,
      grep: grep$2,
      find: Sizzle,
      expr: Sizzle.selectors,
      unique: Sizzle.uniqueSort,
      text: Sizzle.getText,
      contains: Sizzle.contains,
      filter: function (expr, elems, not) {
        var i = elems.length;
        if (not) {
          expr = ':not(' + expr + ')';
        }
        while (i--) {
          if (elems[i].nodeType !== 1) {
            elems.splice(i, 1);
          }
        }
        if (elems.length === 1) {
          elems = DomQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [];
        } else {
          elems = DomQuery.find.matches(expr, elems);
        }
        return elems;
      }
    });
    var dir = function (el, prop, until) {
      var matched = [];
      var cur = el[prop];
      if (typeof until !== 'string' && until instanceof DomQuery) {
        until = until[0];
      }
      while (cur && cur.nodeType !== 9) {
        if (until !== undefined) {
          if (cur === until) {
            break;
          }
          if (typeof until === 'string' && DomQuery(cur).is(until)) {
            break;
          }
        }
        if (cur.nodeType === 1) {
          matched.push(cur);
        }
        cur = cur[prop];
      }
      return matched;
    };
    var sibling$1 = function (node, siblingName, nodeType, until) {
      var result = [];
      if (until instanceof DomQuery) {
        until = until[0];
      }
      for (; node; node = node[siblingName]) {
        if (nodeType && node.nodeType !== nodeType) {
          continue;
        }
        if (until !== undefined) {
          if (node === until) {
            break;
          }
          if (typeof until === 'string' && DomQuery(node).is(until)) {
            break;
          }
        }
        result.push(node);
      }
      return result;
    };
    var firstSibling = function (node, siblingName, nodeType) {
      for (node = node[siblingName]; node; node = node[siblingName]) {
        if (node.nodeType === nodeType) {
          return node;
        }
      }
      return null;
    };
    each$g({
      parent: function (node) {
        var parent = node.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
      },
      parents: function (node) {
        return dir(node, 'parentNode');
      },
      next: function (node) {
        return firstSibling(node, 'nextSibling', 1);
      },
      prev: function (node) {
        return firstSibling(node, 'previousSibling', 1);
      },
      children: function (node) {
        return sibling$1(node.firstChild, 'nextSibling', 1);
      },
      contents: function (node) {
        return Tools.toArray((node.nodeName === 'iframe' ? node.contentDocument || node.contentWindow.document : node).childNodes);
      }
    }, function (name, fn) {
      DomQueryConstructor.fn[name] = function (selector) {
        var self = this;
        var result = [];
        self.each(function () {
          var nodes = fn.call(result, this, selector, result);
          if (nodes) {
            if (DomQuery.isArray(nodes)) {
              result.push.apply(result, nodes);
            } else {
              result.push(nodes);
            }
          }
        });
        if (this.length > 1) {
          if (!skipUniques[name]) {
            result = DomQuery.unique(result);
          }
          if (name.indexOf('parents') === 0) {
            result = result.reverse();
          }
        }
        var wrappedResult = DomQuery(result);
        if (selector) {
          return wrappedResult.filter(selector);
        }
        return wrappedResult;
      };
    });
    each$g({
      parentsUntil: function (node, until) {
        return dir(node, 'parentNode', until);
      },
      nextUntil: function (node, until) {
        return sibling$1(node, 'nextSibling', 1, until).slice(1);
      },
      prevUntil: function (node, until) {
        return sibling$1(node, 'previousSibling', 1, until).slice(1);
      }
    }, function (name, fn) {
      DomQueryConstructor.fn[name] = function (selector, filter) {
        var self = this;
        var result = [];
        self.each(function () {
          var nodes = fn.call(result, this, selector, result);
          if (nodes) {
            if (DomQuery.isArray(nodes)) {
              result.push.apply(result, nodes);
            } else {
              result.push(nodes);
            }
          }
        });
        if (this.length > 1) {
          result = DomQuery.unique(result);
          if (name.indexOf('parents') === 0 || name === 'prevUntil') {
            result = result.reverse();
          }
        }
        var wrappedResult = DomQuery(result);
        if (filter) {
          return wrappedResult.filter(filter);
        }
        return wrappedResult;
      };
    });
    DomQueryConstructor.fn.is = function (selector) {
      return !!selector && this.filter(selector).length > 0;
    };
    DomQueryConstructor.fn.init.prototype = DomQueryConstructor.fn;
    DomQueryConstructor.overrideDefaults = function (callback) {
      var defaults;
      var sub = function (selector, context) {
        defaults = defaults || callback();
        if (arguments.length === 0) {
          selector = defaults.element;
        }
        if (!context) {
          context = defaults.context;
        }
        return new sub.fn.init(selector, context);
      };
      DomQuery.extend(sub, this);
      return sub;
    };
    DomQueryConstructor.attrHooks = attrHooks;
    DomQueryConstructor.cssHooks = cssHooks;
    var DomQuery = DomQueryConstructor;

    var each$f = Tools.each;
    var grep$1 = Tools.grep;
    var isIE = Env.ie;
    var simpleSelectorRe = /^([a-z0-9],?)+$/i;
    var setupAttrHooks = function (styles, settings, getContext) {
      var keepValues = settings.keep_values;
      var keepUrlHook = {
        set: function ($elm, value, name) {
          if (settings.url_converter) {
            value = settings.url_converter.call(settings.url_converter_scope || getContext(), value, name, $elm[0]);
          }
          $elm.attr('data-mce-' + name, value).attr(name, value);
        },
        get: function ($elm, name) {
          return $elm.attr('data-mce-' + name) || $elm.attr(name);
        }
      };
      var attrHooks = {
        style: {
          set: function ($elm, value) {
            if (value !== null && typeof value === 'object') {
              $elm.css(value);
              return;
            }
            if (keepValues) {
              $elm.attr('data-mce-style', value);
            }
            if (value !== null && typeof value === 'string') {
              $elm.removeAttr('style');
              $elm.css(styles.parse(value));
            } else {
              $elm.attr('style', value);
            }
          },
          get: function ($elm) {
            var value = $elm.attr('data-mce-style') || $elm.attr('style');
            value = styles.serialize(styles.parse(value), $elm[0].nodeName);
            return value;
          }
        }
      };
      if (keepValues) {
        attrHooks.href = attrHooks.src = keepUrlHook;
      }
      return attrHooks;
    };
    var updateInternalStyleAttr = function (styles, $elm) {
      var rawValue = $elm.attr('style');
      var value = styles.serialize(styles.parse(rawValue), $elm[0].nodeName);
      if (!value) {
        value = null;
      }
      $elm.attr('data-mce-style', value);
    };
    var findNodeIndex = function (node, normalized) {
      var idx = 0, lastNodeType, nodeType;
      if (node) {
        for (lastNodeType = node.nodeType, node = node.previousSibling; node; node = node.previousSibling) {
          nodeType = node.nodeType;
          if (normalized && nodeType === 3) {
            if (nodeType === lastNodeType || !node.nodeValue.length) {
              continue;
            }
          }
          idx++;
          lastNodeType = nodeType;
        }
      }
      return idx;
    };
    var DOMUtils = function (doc, settings) {
      if (settings === void 0) {
        settings = {};
      }
      var addedStyles = {};
      var win = window;
      var files = {};
      var counter = 0;
      var stdMode = true;
      var boxModel = true;
      var styleSheetLoader = instance.forElement(SugarElement.fromDom(doc), {
        contentCssCors: settings.contentCssCors,
        referrerPolicy: settings.referrerPolicy
      });
      var boundEvents = [];
      var schema = settings.schema ? settings.schema : Schema({});
      var styles = Styles({
        url_converter: settings.url_converter,
        url_converter_scope: settings.url_converter_scope
      }, settings.schema);
      var events = settings.ownEvents ? new EventUtils() : EventUtils.Event;
      var blockElementsMap = schema.getBlockElements();
      var $ = DomQuery.overrideDefaults(function () {
        return {
          context: doc,
          element: self.getRoot()
        };
      });
      var isBlock = function (node) {
        if (typeof node === 'string') {
          return !!blockElementsMap[node];
        } else if (node) {
          var type = node.nodeType;
          if (type) {
            return !!(type === 1 && blockElementsMap[node.nodeName]);
          }
        }
        return false;
      };
      var get = function (elm) {
        return elm && doc && isString$1(elm) ? doc.getElementById(elm) : elm;
      };
      var $$ = function (elm) {
        return $(typeof elm === 'string' ? get(elm) : elm);
      };
      var getAttrib = function (elm, name, defaultVal) {
        var hook, value;
        var $elm = $$(elm);
        if ($elm.length) {
          hook = attrHooks[name];
          if (hook && hook.get) {
            value = hook.get($elm, name);
          } else {
            value = $elm.attr(name);
          }
        }
        if (typeof value === 'undefined') {
          value = defaultVal || '';
        }
        return value;
      };
      var getAttribs = function (elm) {
        var node = get(elm);
        if (!node) {
          return [];
        }
        return node.attributes;
      };
      var setAttrib = function (elm, name, value) {
        if (value === '') {
          value = null;
        }
        var $elm = $$(elm);
        var originalValue = $elm.attr(name);
        if (!$elm.length) {
          return;
        }
        var hook = attrHooks[name];
        if (hook && hook.set) {
          hook.set($elm, value, name);
        } else {
          $elm.attr(name, value);
        }
        if (originalValue !== value && settings.onSetAttrib) {
          settings.onSetAttrib({
            attrElm: $elm,
            attrName: name,
            attrValue: value
          });
        }
      };
      var clone = function (node, deep) {
        if (!isIE || node.nodeType !== 1 || deep) {
          return node.cloneNode(deep);
        } else {
          var clone_1 = doc.createElement(node.nodeName);
          each$f(getAttribs(node), function (attr) {
            setAttrib(clone_1, attr.nodeName, getAttrib(node, attr.nodeName));
          });
          return clone_1;
        }
      };
      var getRoot = function () {
        return settings.root_element || doc.body;
      };
      var getViewPort = function (argWin) {
        var vp = getBounds(argWin);
        return {
          x: vp.x,
          y: vp.y,
          w: vp.width,
          h: vp.height
        };
      };
      var getPos$1 = function (elm, rootElm) {
        return getPos(doc.body, get(elm), rootElm);
      };
      var setStyle = function (elm, name, value) {
        var $elm = isString$1(name) ? $$(elm).css(name, value) : $$(elm).css(name);
        if (settings.update_styles) {
          updateInternalStyleAttr(styles, $elm);
        }
      };
      var setStyles = function (elm, stylesArg) {
        var $elm = $$(elm).css(stylesArg);
        if (settings.update_styles) {
          updateInternalStyleAttr(styles, $elm);
        }
      };
      var getStyle = function (elm, name, computed) {
        var $elm = $$(elm);
        if (computed) {
          return $elm.css(name);
        }
        name = name.replace(/-(\D)/g, function (a, b) {
          return b.toUpperCase();
        });
        if (name === 'float') {
          name = Env.browser.isIE() ? 'styleFloat' : 'cssFloat';
        }
        return $elm[0] && $elm[0].style ? $elm[0].style[name] : undefined;
      };
      var getSize = function (elm) {
        var w, h;
        elm = get(elm);
        w = getStyle(elm, 'width');
        h = getStyle(elm, 'height');
        if (w.indexOf('px') === -1) {
          w = 0;
        }
        if (h.indexOf('px') === -1) {
          h = 0;
        }
        return {
          w: parseInt(w, 10) || elm.offsetWidth || elm.clientWidth,
          h: parseInt(h, 10) || elm.offsetHeight || elm.clientHeight
        };
      };
      var getRect = function (elm) {
        elm = get(elm);
        var pos = getPos$1(elm);
        var size = getSize(elm);
        return {
          x: pos.x,
          y: pos.y,
          w: size.w,
          h: size.h
        };
      };
      var is = function (elm, selector) {
        var i;
        if (!elm) {
          return false;
        }
        if (!Array.isArray(elm)) {
          if (selector === '*') {
            return elm.nodeType === 1;
          }
          if (simpleSelectorRe.test(selector)) {
            var selectors = selector.toLowerCase().split(/,/);
            var elmName = elm.nodeName.toLowerCase();
            for (i = selectors.length - 1; i >= 0; i--) {
              if (selectors[i] === elmName) {
                return true;
              }
            }
            return false;
          }
          if (elm.nodeType && elm.nodeType !== 1) {
            return false;
          }
        }
        var elms = !Array.isArray(elm) ? [elm] : elm;
        return Sizzle(selector, elms[0].ownerDocument || elms[0], null, elms).length > 0;
      };
      var getParents = function (elm, selector, root, collect) {
        var result = [];
        var selectorVal;
        var node = get(elm);
        collect = collect === undefined;
        root = root || (getRoot().nodeName !== 'BODY' ? getRoot().parentNode : null);
        if (Tools.is(selector, 'string')) {
          selectorVal = selector;
          if (selector === '*') {
            selector = function (node) {
              return node.nodeType === 1;
            };
          } else {
            selector = function (node) {
              return is(node, selectorVal);
            };
          }
        }
        while (node) {
          if (node === root || isNullable(node.nodeType) || isDocument$1(node) || isDocumentFragment(node)) {
            break;
          }
          if (!selector || typeof selector === 'function' && selector(node)) {
            if (collect) {
              result.push(node);
            } else {
              return [node];
            }
          }
          node = node.parentNode;
        }
        return collect ? result : null;
      };
      var getParent = function (node, selector, root) {
        var parents = getParents(node, selector, root, false);
        return parents && parents.length > 0 ? parents[0] : null;
      };
      var _findSib = function (node, selector, name) {
        var func = selector;
        if (node) {
          if (typeof selector === 'string') {
            func = function (node) {
              return is(node, selector);
            };
          }
          for (node = node[name]; node; node = node[name]) {
            if (typeof func === 'function' && func(node)) {
              return node;
            }
          }
        }
        return null;
      };
      var getNext = function (node, selector) {
        return _findSib(node, selector, 'nextSibling');
      };
      var getPrev = function (node, selector) {
        return _findSib(node, selector, 'previousSibling');
      };
      var select = function (selector, scope) {
        return Sizzle(selector, get(scope) || settings.root_element || doc, []);
      };
      var run = function (elm, func, scope) {
        var result;
        var node = typeof elm === 'string' ? get(elm) : elm;
        if (!node) {
          return false;
        }
        if (Tools.isArray(node) && (node.length || node.length === 0)) {
          result = [];
          each$f(node, function (elm, i) {
            if (elm) {
              result.push(func.call(scope, typeof elm === 'string' ? get(elm) : elm, i));
            }
          });
          return result;
        }
        var context = scope ? scope : this;
        return func.call(context, node);
      };
      var setAttribs = function (elm, attrs) {
        $$(elm).each(function (i, node) {
          each$f(attrs, function (value, name) {
            setAttrib(node, name, value);
          });
        });
      };
      var setHTML = function (elm, html) {
        var $elm = $$(elm);
        if (isIE) {
          $elm.each(function (i, target) {
            if (target.canHaveHTML === false) {
              return;
            }
            while (target.firstChild) {
              target.removeChild(target.firstChild);
            }
            try {
              target.innerHTML = '<br>' + html;
              target.removeChild(target.firstChild);
            } catch (ex) {
              DomQuery('<div></div>').html('<br>' + html).contents().slice(1).appendTo(target);
            }
            return html;
          });
        } else {
          $elm.html(html);
        }
      };
      var add = function (parentElm, name, attrs, html, create) {
        return run(parentElm, function (parentElm) {
          var newElm = typeof name === 'string' ? doc.createElement(name) : name;
          setAttribs(newElm, attrs);
          if (html) {
            if (typeof html !== 'string' && html.nodeType) {
              newElm.appendChild(html);
            } else if (typeof html === 'string') {
              setHTML(newElm, html);
            }
          }
          return !create ? parentElm.appendChild(newElm) : newElm;
        });
      };
      var create = function (name, attrs, html) {
        return add(doc.createElement(name), name, attrs, html, true);
      };
      var decode = Entities.decode;
      var encode = Entities.encodeAllRaw;
      var createHTML = function (name, attrs, html) {
        var outHtml = '', key;
        outHtml += '<' + name;
        for (key in attrs) {
          if (hasNonNullableKey(attrs, key)) {
            outHtml += ' ' + key + '="' + encode(attrs[key]) + '"';
          }
        }
        if (typeof html !== 'undefined') {
          return outHtml + '>' + html + '</' + name + '>';
        }
        return outHtml + ' />';
      };
      var createFragment = function (html) {
        var node;
        var container = doc.createElement('div');
        var frag = doc.createDocumentFragment();
        frag.appendChild(container);
        if (html) {
          container.innerHTML = html;
        }
        while (node = container.firstChild) {
          frag.appendChild(node);
        }
        frag.removeChild(container);
        return frag;
      };
      var remove = function (node, keepChildren) {
        var $node = $$(node);
        if (keepChildren) {
          $node.each(function () {
            var child;
            while (child = this.firstChild) {
              if (child.nodeType === 3 && child.data.length === 0) {
                this.removeChild(child);
              } else {
                this.parentNode.insertBefore(child, this);
              }
            }
          }).remove();
        } else {
          $node.remove();
        }
        return $node.length > 1 ? $node.toArray() : $node[0];
      };
      var removeAllAttribs = function (e) {
        return run(e, function (e) {
          var i;
          var attrs = e.attributes;
          for (i = attrs.length - 1; i >= 0; i--) {
            e.removeAttributeNode(attrs.item(i));
          }
        });
      };
      var parseStyle = function (cssText) {
        return styles.parse(cssText);
      };
      var serializeStyle = function (stylesArg, name) {
        return styles.serialize(stylesArg, name);
      };
      var addStyle = function (cssText) {
        var head, styleElm;
        if (self !== DOMUtils.DOM && doc === document) {
          if (addedStyles[cssText]) {
            return;
          }
          addedStyles[cssText] = true;
        }
        styleElm = doc.getElementById('mceDefaultStyles');
        if (!styleElm) {
          styleElm = doc.createElement('style');
          styleElm.id = 'mceDefaultStyles';
          styleElm.type = 'text/css';
          head = doc.getElementsByTagName('head')[0];
          if (head.firstChild) {
            head.insertBefore(styleElm, head.firstChild);
          } else {
            head.appendChild(styleElm);
          }
        }
        if (styleElm.styleSheet) {
          styleElm.styleSheet.cssText += cssText;
        } else {
          styleElm.appendChild(doc.createTextNode(cssText));
        }
      };
      var loadCSS = function (urls) {
        if (!urls) {
          urls = '';
        }
        each$k(urls.split(','), function (url) {
          files[url] = true;
          styleSheetLoader.load(url, noop);
        });
      };
      var toggleClass = function (elm, cls, state) {
        $$(elm).toggleClass(cls, state).each(function () {
          if (this.className === '') {
            DomQuery(this).attr('class', null);
          }
        });
      };
      var addClass = function (elm, cls) {
        $$(elm).addClass(cls);
      };
      var removeClass = function (elm, cls) {
        toggleClass(elm, cls, false);
      };
      var hasClass = function (elm, cls) {
        return $$(elm).hasClass(cls);
      };
      var show = function (elm) {
        $$(elm).show();
      };
      var hide = function (elm) {
        $$(elm).hide();
      };
      var isHidden = function (elm) {
        return $$(elm).css('display') === 'none';
      };
      var uniqueId = function (prefix) {
        return (!prefix ? 'mce_' : prefix) + counter++;
      };
      var getOuterHTML = function (elm) {
        var node = typeof elm === 'string' ? get(elm) : elm;
        return isElement$5(node) ? node.outerHTML : DomQuery('<div></div>').append(DomQuery(node).clone()).html();
      };
      var setOuterHTML = function (elm, html) {
        $$(elm).each(function () {
          try {
            if ('outerHTML' in this) {
              this.outerHTML = html;
              return;
            }
          } catch (ex) {
          }
          remove(DomQuery(this).html(html), true);
        });
      };
      var insertAfter = function (node, reference) {
        var referenceNode = get(reference);
        return run(node, function (node) {
          var parent = referenceNode.parentNode;
          var nextSibling = referenceNode.nextSibling;
          if (nextSibling) {
            parent.insertBefore(node, nextSibling);
          } else {
            parent.appendChild(node);
          }
          return node;
        });
      };
      var replace = function (newElm, oldElm, keepChildren) {
        return run(oldElm, function (oldElm) {
          if (Tools.is(oldElm, 'array')) {
            newElm = newElm.cloneNode(true);
          }
          if (keepChildren) {
            each$f(grep$1(oldElm.childNodes), function (node) {
              newElm.appendChild(node);
            });
          }
          return oldElm.parentNode.replaceChild(newElm, oldElm);
        });
      };
      var rename = function (elm, name) {
        var newElm;
        if (elm.nodeName !== name.toUpperCase()) {
          newElm = create(name);
          each$f(getAttribs(elm), function (attrNode) {
            setAttrib(newElm, attrNode.nodeName, getAttrib(elm, attrNode.nodeName));
          });
          replace(newElm, elm, true);
        }
        return newElm || elm;
      };
      var findCommonAncestor = function (a, b) {
        var ps = a, pe;
        while (ps) {
          pe = b;
          while (pe && ps !== pe) {
            pe = pe.parentNode;
          }
          if (ps === pe) {
            break;
          }
          ps = ps.parentNode;
        }
        if (!ps && a.ownerDocument) {
          return a.ownerDocument.documentElement;
        }
        return ps;
      };
      var toHex = function (rgbVal) {
        return styles.toHex(Tools.trim(rgbVal));
      };
      var isNonEmptyElement = function (node) {
        if (isElement$5(node)) {
          var isNamedAnchor = node.nodeName.toLowerCase() === 'a' && !getAttrib(node, 'href') && getAttrib(node, 'id');
          if (getAttrib(node, 'name') || getAttrib(node, 'data-mce-bookmark') || isNamedAnchor) {
            return true;
          }
        }
        return false;
      };
      var isEmpty = function (node, elements) {
        var type, name, brCount = 0;
        if (isNonEmptyElement(node)) {
          return false;
        }
        node = node.firstChild;
        if (node) {
          var walker = new DomTreeWalker(node, node.parentNode);
          var whitespace = schema ? schema.getWhiteSpaceElements() : {};
          elements = elements || (schema ? schema.getNonEmptyElements() : null);
          do {
            type = node.nodeType;
            if (isElement$5(node)) {
              var bogusVal = node.getAttribute('data-mce-bogus');
              if (bogusVal) {
                node = walker.next(bogusVal === 'all');
                continue;
              }
              name = node.nodeName.toLowerCase();
              if (elements && elements[name]) {
                if (name === 'br') {
                  brCount++;
                  node = walker.next();
                  continue;
                }
                return false;
              }
              if (isNonEmptyElement(node)) {
                return false;
              }
            }
            if (type === 8) {
              return false;
            }
            if (type === 3 && !isWhitespaceText(node.nodeValue)) {
              return false;
            }
            if (type === 3 && node.parentNode && whitespace[node.parentNode.nodeName] && isWhitespaceText(node.nodeValue)) {
              return false;
            }
            node = walker.next();
          } while (node);
        }
        return brCount <= 1;
      };
      var createRng = function () {
        return doc.createRange();
      };
      var split = function (parentElm, splitElm, replacementElm) {
        var range = createRng();
        var beforeFragment;
        var afterFragment;
        var parentNode;
        if (parentElm && splitElm) {
          range.setStart(parentElm.parentNode, findNodeIndex(parentElm));
          range.setEnd(splitElm.parentNode, findNodeIndex(splitElm));
          beforeFragment = range.extractContents();
          range = createRng();
          range.setStart(splitElm.parentNode, findNodeIndex(splitElm) + 1);
          range.setEnd(parentElm.parentNode, findNodeIndex(parentElm) + 1);
          afterFragment = range.extractContents();
          parentNode = parentElm.parentNode;
          parentNode.insertBefore(trimNode(self, beforeFragment), parentElm);
          if (replacementElm) {
            parentNode.insertBefore(replacementElm, parentElm);
          } else {
            parentNode.insertBefore(splitElm, parentElm);
          }
          parentNode.insertBefore(trimNode(self, afterFragment), parentElm);
          remove(parentElm);
          return replacementElm || splitElm;
        }
      };
      var bind = function (target, name, func, scope) {
        if (Tools.isArray(target)) {
          var i = target.length;
          var rv = [];
          while (i--) {
            rv[i] = bind(target[i], name, func, scope);
          }
          return rv;
        }
        if (settings.collect && (target === doc || target === win)) {
          boundEvents.push([
            target,
            name,
            func,
            scope
          ]);
        }
        var output = events.bind(target, name, func, scope || self);
        return output;
      };
      var unbind = function (target, name, func) {
        if (Tools.isArray(target)) {
          var i = target.length;
          var rv = [];
          while (i--) {
            rv[i] = unbind(target[i], name, func);
          }
          return rv;
        } else {
          if (boundEvents.length > 0 && (target === doc || target === win)) {
            var i = boundEvents.length;
            while (i--) {
              var item = boundEvents[i];
              if (target === item[0] && (!name || name === item[1]) && (!func || func === item[2])) {
                events.unbind(item[0], item[1], item[2]);
              }
            }
          }
          return events.unbind(target, name, func);
        }
      };
      var fire = function (target, name, evt) {
        return events.fire(target, name, evt);
      };
      var getContentEditable = function (node) {
        if (node && isElement$5(node)) {
          var contentEditable = node.getAttribute('data-mce-contenteditable');
          if (contentEditable && contentEditable !== 'inherit') {
            return contentEditable;
          }
          return node.contentEditable !== 'inherit' ? node.contentEditable : null;
        } else {
          return null;
        }
      };
      var getContentEditableParent = function (node) {
        var root = getRoot();
        var state = null;
        for (; node && node !== root; node = node.parentNode) {
          state = getContentEditable(node);
          if (state !== null) {
            break;
          }
        }
        return state;
      };
      var destroy = function () {
        if (boundEvents.length > 0) {
          var i = boundEvents.length;
          while (i--) {
            var item = boundEvents[i];
            events.unbind(item[0], item[1], item[2]);
          }
        }
        each$j(files, function (_, url) {
          styleSheetLoader.unload(url);
          delete files[url];
        });
        if (Sizzle.setDocument) {
          Sizzle.setDocument();
        }
      };
      var isChildOf = function (node, parent) {
        if (!isIE) {
          return node === parent || parent.contains(node);
        } else {
          while (node) {
            if (parent === node) {
              return true;
            }
            node = node.parentNode;
          }
          return false;
        }
      };
      var dumpRng = function (r) {
        return 'startContainer: ' + r.startContainer.nodeName + ', startOffset: ' + r.startOffset + ', endContainer: ' + r.endContainer.nodeName + ', endOffset: ' + r.endOffset;
      };
      var self = {
        doc: doc,
        settings: settings,
        win: win,
        files: files,
        stdMode: stdMode,
        boxModel: boxModel,
        styleSheetLoader: styleSheetLoader,
        boundEvents: boundEvents,
        styles: styles,
        schema: schema,
        events: events,
        isBlock: isBlock,
        $: $,
        $$: $$,
        root: null,
        clone: clone,
        getRoot: getRoot,
        getViewPort: getViewPort,
        getRect: getRect,
        getSize: getSize,
        getParent: getParent,
        getParents: getParents,
        get: get,
        getNext: getNext,
        getPrev: getPrev,
        select: select,
        is: is,
        add: add,
        create: create,
        createHTML: createHTML,
        createFragment: createFragment,
        remove: remove,
        setStyle: setStyle,
        getStyle: getStyle,
        setStyles: setStyles,
        removeAllAttribs: removeAllAttribs,
        setAttrib: setAttrib,
        setAttribs: setAttribs,
        getAttrib: getAttrib,
        getPos: getPos$1,
        parseStyle: parseStyle,
        serializeStyle: serializeStyle,
        addStyle: addStyle,
        loadCSS: loadCSS,
        addClass: addClass,
        removeClass: removeClass,
        hasClass: hasClass,
        toggleClass: toggleClass,
        show: show,
        hide: hide,
        isHidden: isHidden,
        uniqueId: uniqueId,
        setHTML: setHTML,
        getOuterHTML: getOuterHTML,
        setOuterHTML: setOuterHTML,
        decode: decode,
        encode: encode,
        insertAfter: insertAfter,
        replace: replace,
        rename: rename,
        findCommonAncestor: findCommonAncestor,
        toHex: toHex,
        run: run,
        getAttribs: getAttribs,
        isEmpty: isEmpty,
        createRng: createRng,
        nodeIndex: findNodeIndex,
        split: split,
        bind: bind,
        unbind: unbind,
        fire: fire,
        getContentEditable: getContentEditable,
        getContentEditableParent: getContentEditableParent,
        destroy: destroy,
        isChildOf: isChildOf,
        dumpRng: dumpRng
      };
      var attrHooks = setupAttrHooks(styles, settings, constant(self));
      return self;
    };
    DOMUtils.DOM = DOMUtils(document);
    DOMUtils.nodeIndex = findNodeIndex;

    var DOM$a = DOMUtils.DOM;
    var each$e = Tools.each, grep = Tools.grep;
    var QUEUED = 0;
    var LOADING = 1;
    var LOADED = 2;
    var FAILED = 3;
    var ScriptLoader = function () {
      function ScriptLoader(settings) {
        if (settings === void 0) {
          settings = {};
        }
        this.states = {};
        this.queue = [];
        this.scriptLoadedCallbacks = {};
        this.queueLoadedCallbacks = [];
        this.loading = 0;
        this.settings = settings;
      }
      ScriptLoader.prototype._setReferrerPolicy = function (referrerPolicy) {
        this.settings.referrerPolicy = referrerPolicy;
      };
      ScriptLoader.prototype.loadScript = function (url, success, failure) {
        var dom = DOM$a;
        var elm;
        var cleanup = function () {
          dom.remove(id);
          if (elm) {
            elm.onerror = elm.onload = elm = null;
          }
        };
        var done = function () {
          cleanup();
          success();
        };
        var error = function () {
          cleanup();
          if (isFunction(failure)) {
            failure();
          } else {
            if (typeof console !== 'undefined' && console.log) {
              console.log('Failed to load script: ' + url);
            }
          }
        };
        var id = dom.uniqueId();
        elm = document.createElement('script');
        elm.id = id;
        elm.type = 'text/javascript';
        elm.src = Tools._addCacheSuffix(url);
        if (this.settings.referrerPolicy) {
          dom.setAttrib(elm, 'referrerpolicy', this.settings.referrerPolicy);
        }
        elm.onload = done;
        elm.onerror = error;
        (document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
      };
      ScriptLoader.prototype.isDone = function (url) {
        return this.states[url] === LOADED;
      };
      ScriptLoader.prototype.markDone = function (url) {
        this.states[url] = LOADED;
      };
      ScriptLoader.prototype.add = function (url, success, scope, failure) {
        var state = this.states[url];
        this.queue.push(url);
        if (state === undefined) {
          this.states[url] = QUEUED;
        }
        if (success) {
          if (!this.scriptLoadedCallbacks[url]) {
            this.scriptLoadedCallbacks[url] = [];
          }
          this.scriptLoadedCallbacks[url].push({
            success: success,
            failure: failure,
            scope: scope || this
          });
        }
      };
      ScriptLoader.prototype.load = function (url, success, scope, failure) {
        return this.add(url, success, scope, failure);
      };
      ScriptLoader.prototype.remove = function (url) {
        delete this.states[url];
        delete this.scriptLoadedCallbacks[url];
      };
      ScriptLoader.prototype.loadQueue = function (success, scope, failure) {
        this.loadScripts(this.queue, success, scope, failure);
      };
      ScriptLoader.prototype.loadScripts = function (scripts, success, scope, failure) {
        var self = this;
        var failures = [];
        var execCallbacks = function (name, url) {
          each$e(self.scriptLoadedCallbacks[url], function (callback) {
            if (isFunction(callback[name])) {
              callback[name].call(callback.scope);
            }
          });
          self.scriptLoadedCallbacks[url] = undefined;
        };
        self.queueLoadedCallbacks.push({
          success: success,
          failure: failure,
          scope: scope || this
        });
        var loadScripts = function () {
          var loadingScripts = grep(scripts);
          scripts.length = 0;
          each$e(loadingScripts, function (url) {
            if (self.states[url] === LOADED) {
              execCallbacks('success', url);
              return;
            }
            if (self.states[url] === FAILED) {
              execCallbacks('failure', url);
              return;
            }
            if (self.states[url] !== LOADING) {
              self.states[url] = LOADING;
              self.loading++;
              self.loadScript(url, function () {
                self.states[url] = LOADED;
                self.loading--;
                execCallbacks('success', url);
                loadScripts();
              }, function () {
                self.states[url] = FAILED;
                self.loading--;
                failures.push(url);
                execCallbacks('failure', url);
                loadScripts();
              });
            }
          });
          if (!self.loading) {
            var notifyCallbacks = self.queueLoadedCallbacks.slice(0);
            self.queueLoadedCallbacks.length = 0;
            each$e(notifyCallbacks, function (callback) {
              if (failures.length === 0) {
                if (isFunction(callback.success)) {
                  callback.success.call(callback.scope);
                }
              } else {
                if (isFunction(callback.failure)) {
                  callback.failure.call(callback.scope, failures);
                }
              }
            });
          }
        };
        loadScripts();
      };
      ScriptLoader.ScriptLoader = new ScriptLoader();
      return ScriptLoader;
    }();

    var Cell = function (initial) {
      var value = initial;
      var get = function () {
        return value;
      };
      var set = function (v) {
        value = v;
      };
      return {
        get: get,
        set: set
      };
    };

    var isRaw = function (str) {
      return isObject(str) && has$2(str, 'raw');
    };
    var isTokenised = function (str) {
      return isArray$1(str) && str.length > 1;
    };
    var data = {};
    var currentCode = Cell('en');
    var getLanguageData = function () {
      return get$9(data, currentCode.get());
    };
    var getData = function () {
      return map$2(data, function (value) {
        return __assign({}, value);
      });
    };
    var setCode = function (newCode) {
      if (newCode) {
        currentCode.set(newCode);
      }
    };
    var getCode = function () {
      return currentCode.get();
    };
    var add$4 = function (code, items) {
      var langData = data[code];
      if (!langData) {
        data[code] = langData = {};
      }
      each$j(items, function (translation, name) {
        langData[name.toLowerCase()] = translation;
      });
    };
    var translate = function (text) {
      var langData = getLanguageData().getOr({});
      var toString = function (obj) {
        if (isFunction(obj)) {
          return Object.prototype.toString.call(obj);
        }
        return !isEmpty(obj) ? '' + obj : '';
      };
      var isEmpty = function (text) {
        return text === '' || text === null || text === undefined;
      };
      var getLangData = function (text) {
        var textstr = toString(text);
        return get$9(langData, textstr.toLowerCase()).map(toString).getOr(textstr);
      };
      var removeContext = function (str) {
        return str.replace(/{context:\w+}$/, '');
      };
      if (isEmpty(text)) {
        return '';
      }
      if (isRaw(text)) {
        return toString(text.raw);
      }
      if (isTokenised(text)) {
        var values_1 = text.slice(1);
        var substitued = getLangData(text[0]).replace(/\{([0-9]+)\}/g, function ($1, $2) {
          return has$2(values_1, $2) ? toString(values_1[$2]) : $1;
        });
        return removeContext(substitued);
      }
      return removeContext(getLangData(text));
    };
    var isRtl$1 = function () {
      return getLanguageData().bind(function (items) {
        return get$9(items, '_dir');
      }).exists(function (dir) {
        return dir === 'rtl';
      });
    };
    var hasCode = function (code) {
      return has$2(data, code);
    };
    var I18n = {
      getData: getData,
      setCode: setCode,
      getCode: getCode,
      add: add$4,
      translate: translate,
      isRtl: isRtl$1,
      hasCode: hasCode
    };

    var AddOnManager = function () {
      var items = [];
      var urls = {};
      var lookup = {};
      var _listeners = [];
      var runListeners = function (name, state) {
        var matchedListeners = filter$4(_listeners, function (listener) {
          return listener.name === name && listener.state === state;
        });
        each$k(matchedListeners, function (listener) {
          return listener.callback();
        });
      };
      var get = function (name) {
        if (lookup[name]) {
          return lookup[name].instance;
        }
        return undefined;
      };
      var dependencies = function (name) {
        var result;
        if (lookup[name]) {
          result = lookup[name].dependencies;
        }
        return result || [];
      };
      var requireLangPack = function (name, languages) {
        if (AddOnManager.languageLoad !== false) {
          waitFor(name, function () {
            var language = I18n.getCode();
            var wrappedLanguages = ',' + (languages || '') + ',';
            if (!language || languages && wrappedLanguages.indexOf(',' + language + ',') === -1) {
              return;
            }
            ScriptLoader.ScriptLoader.add(urls[name] + '/langs/' + language + '.js');
          }, 'loaded');
        }
      };
      var add = function (id, addOn, dependencies) {
        var addOnConstructor = addOn;
        items.push(addOnConstructor);
        lookup[id] = {
          instance: addOnConstructor,
          dependencies: dependencies
        };
        runListeners(id, 'added');
        return addOnConstructor;
      };
      var remove = function (name) {
        delete urls[name];
        delete lookup[name];
      };
      var createUrl = function (baseUrl, dep) {
        if (typeof dep === 'object') {
          return dep;
        }
        return typeof baseUrl === 'string' ? {
          prefix: '',
          resource: dep,
          suffix: ''
        } : {
          prefix: baseUrl.prefix,
          resource: dep,
          suffix: baseUrl.suffix
        };
      };
      var addComponents = function (pluginName, scripts) {
        var pluginUrl = urls[pluginName];
        each$k(scripts, function (script) {
          ScriptLoader.ScriptLoader.add(pluginUrl + '/' + script);
        });
      };
      var loadDependencies = function (name, addOnUrl, success, scope) {
        var deps = dependencies(name);
        each$k(deps, function (dep) {
          var newUrl = createUrl(addOnUrl, dep);
          load(newUrl.resource, newUrl, undefined, undefined);
        });
        if (success) {
          if (scope) {
            success.call(scope);
          } else {
            success.call(ScriptLoader);
          }
        }
      };
      var load = function (name, addOnUrl, success, scope, failure) {
        if (urls[name]) {
          return;
        }
        var urlString = typeof addOnUrl === 'string' ? addOnUrl : addOnUrl.prefix + addOnUrl.resource + addOnUrl.suffix;
        if (urlString.indexOf('/') !== 0 && urlString.indexOf('://') === -1) {
          urlString = AddOnManager.baseURL + '/' + urlString;
        }
        urls[name] = urlString.substring(0, urlString.lastIndexOf('/'));
        var done = function () {
          runListeners(name, 'loaded');
          loadDependencies(name, addOnUrl, success, scope);
        };
        if (lookup[name]) {
          done();
        } else {
          ScriptLoader.ScriptLoader.add(urlString, done, scope, failure);
        }
      };
      var waitFor = function (name, callback, state) {
        if (state === void 0) {
          state = 'added';
        }
        if (has$2(lookup, name) && state === 'added') {
          callback();
        } else if (has$2(urls, name) && state === 'loaded') {
          callback();
        } else {
          _listeners.push({
            name: name,
            state: state,
            callback: callback
          });
        }
      };
      return {
        items: items,
        urls: urls,
        lookup: lookup,
        _listeners: _listeners,
        get: get,
        dependencies: dependencies,
        requireLangPack: requireLangPack,
        add: add,
        remove: remove,
        createUrl: createUrl,
        addComponents: addComponents,
        load: load,
        waitFor: waitFor
      };
    };
    AddOnManager.languageLoad = true;
    AddOnManager.baseURL = '';
    AddOnManager.PluginManager = AddOnManager();
    AddOnManager.ThemeManager = AddOnManager();

    var singleton = function (doRevoke) {
      var subject = Cell(Optional.none());
      var revoke = function () {
        return subject.get().each(doRevoke);
      };
      var clear = function () {
        revoke();
        subject.set(Optional.none());
      };
      var isSet = function () {
        return subject.get().isSome();
      };
      var get = function () {
        return subject.get();
      };
      var set = function (s) {
        revoke();
        subject.set(Optional.some(s));
      };
      return {
        clear: clear,
        isSet: isSet,
        get: get,
        set: set
      };
    };
    var value = function () {
      var subject = singleton(noop);
      var on = function (f) {
        return subject.get().each(f);
      };
      return __assign(__assign({}, subject), { on: on });
    };

    var first = function (fn, rate) {
      var timer = null;
      var cancel = function () {
        if (!isNull(timer)) {
          clearTimeout(timer);
          timer = null;
        }
      };
      var throttle = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (isNull(timer)) {
          timer = setTimeout(function () {
            timer = null;
            fn.apply(null, args);
          }, rate);
        }
      };
      return {
        cancel: cancel,
        throttle: throttle
      };
    };
    var last = function (fn, rate) {
      var timer = null;
      var cancel = function () {
        if (!isNull(timer)) {
          clearTimeout(timer);
          timer = null;
        }
      };
      var throttle = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        cancel();
        timer = setTimeout(function () {
          timer = null;
          fn.apply(null, args);
        }, rate);
      };
      return {
        cancel: cancel,
        throttle: throttle
      };
    };

    var read$4 = function (element, attr) {
      var value = get$6(element, attr);
      return value === undefined || value === '' ? [] : value.split(' ');
    };
    var add$3 = function (element, attr, id) {
      var old = read$4(element, attr);
      var nu = old.concat([id]);
      set$1(element, attr, nu.join(' '));
      return true;
    };
    var remove$5 = function (element, attr, id) {
      var nu = filter$4(read$4(element, attr), function (v) {
        return v !== id;
      });
      if (nu.length > 0) {
        set$1(element, attr, nu.join(' '));
      } else {
        remove$6(element, attr);
      }
      return false;
    };

    var supports = function (element) {
      return element.dom.classList !== undefined;
    };
    var get$4 = function (element) {
      return read$4(element, 'class');
    };
    var add$2 = function (element, clazz) {
      return add$3(element, 'class', clazz);
    };
    var remove$4 = function (element, clazz) {
      return remove$5(element, 'class', clazz);
    };

    var add$1 = function (element, clazz) {
      if (supports(element)) {
        element.dom.classList.add(clazz);
      } else {
        add$2(element, clazz);
      }
    };
    var cleanClass = function (element) {
      var classList = supports(element) ? element.dom.classList : get$4(element);
      if (classList.length === 0) {
        remove$6(element, 'class');
      }
    };
    var remove$3 = function (element, clazz) {
      if (supports(element)) {
        var classList = element.dom.classList;
        classList.remove(clazz);
      } else {
        remove$4(element, clazz);
      }
      cleanClass(element);
    };
    var has = function (element, clazz) {
      return supports(element) && element.dom.classList.contains(clazz);
    };

    var descendants$1 = function (scope, predicate) {
      var result = [];
      each$k(children(scope), function (x) {
        if (predicate(x)) {
          result = result.concat([x]);
        }
        result = result.concat(descendants$1(x, predicate));
      });
      return result;
    };

    var descendants = function (scope, selector) {
      return all(selector, scope);
    };

    var annotation = constant('mce-annotation');
    var dataAnnotation = constant('data-mce-annotation');
    var dataAnnotationId = constant('data-mce-annotation-uid');

    var identify = function (editor, annotationName) {
      var rng = editor.selection.getRng();
      var start = SugarElement.fromDom(rng.startContainer);
      var root = SugarElement.fromDom(editor.getBody());
      var selector = annotationName.fold(function () {
        return '.' + annotation();
      }, function (an) {
        return '[' + dataAnnotation() + '="' + an + '"]';
      });
      var newStart = child$1(start, rng.startOffset).getOr(start);
      var closest = closest$2(newStart, selector, function (n) {
        return eq(n, root);
      });
      var getAttr = function (c, property) {
        if (has$1(c, property)) {
          return Optional.some(get$6(c, property));
        } else {
          return Optional.none();
        }
      };
      return closest.bind(function (c) {
        return getAttr(c, '' + dataAnnotationId()).bind(function (uid) {
          return getAttr(c, '' + dataAnnotation()).map(function (name) {
            var elements = findMarkers(editor, uid);
            return {
              uid: uid,
              name: name,
              elements: elements
            };
          });
        });
      });
    };
    var isAnnotation = function (elem) {
      return isElement$6(elem) && has(elem, annotation());
    };
    var findMarkers = function (editor, uid) {
      var body = SugarElement.fromDom(editor.getBody());
      return descendants(body, '[' + dataAnnotationId() + '="' + uid + '"]');
    };
    var findAll = function (editor, name) {
      var body = SugarElement.fromDom(editor.getBody());
      var markers = descendants(body, '[' + dataAnnotation() + '="' + name + '"]');
      var directory = {};
      each$k(markers, function (m) {
        var uid = get$6(m, dataAnnotationId());
        var nodesAlready = get$9(directory, uid).getOr([]);
        directory[uid] = nodesAlready.concat([m]);
      });
      return directory;
    };

    var setup$n = function (editor, _registry) {
      var changeCallbacks = Cell({});
      var initData = function () {
        return {
          listeners: [],
          previous: value()
        };
      };
      var withCallbacks = function (name, f) {
        updateCallbacks(name, function (data) {
          f(data);
          return data;
        });
      };
      var updateCallbacks = function (name, f) {
        var callbackMap = changeCallbacks.get();
        var data = get$9(callbackMap, name).getOrThunk(initData);
        var outputData = f(data);
        callbackMap[name] = outputData;
        changeCallbacks.set(callbackMap);
      };
      var fireCallbacks = function (name, uid, elements) {
        withCallbacks(name, function (data) {
          each$k(data.listeners, function (f) {
            return f(true, name, {
              uid: uid,
              nodes: map$3(elements, function (elem) {
                return elem.dom;
              })
            });
          });
        });
      };
      var fireNoAnnotation = function (name) {
        withCallbacks(name, function (data) {
          each$k(data.listeners, function (f) {
            return f(false, name);
          });
        });
      };
      var onNodeChange = last(function () {
        var callbackMap = changeCallbacks.get();
        var annotations = sort(keys(callbackMap));
        each$k(annotations, function (name) {
          updateCallbacks(name, function (data) {
            var prev = data.previous.get();
            identify(editor, Optional.some(name)).fold(function () {
              if (prev.isSome()) {
                fireNoAnnotation(name);
                data.previous.clear();
              }
            }, function (_a) {
              var uid = _a.uid, name = _a.name, elements = _a.elements;
              if (!is$1(prev, uid)) {
                fireCallbacks(name, uid, elements);
                data.previous.set(uid);
              }
            });
            return {
              previous: data.previous,
              listeners: data.listeners
            };
          });
        });
      }, 30);
      editor.on('remove', function () {
        onNodeChange.cancel();
      });
      editor.on('NodeChange', function () {
        onNodeChange.throttle();
      });
      var addListener = function (name, f) {
        updateCallbacks(name, function (data) {
          return {
            previous: data.previous,
            listeners: data.listeners.concat([f])
          };
        });
      };
      return { addListener: addListener };
    };

    var setup$m = function (editor, registry) {
      var identifyParserNode = function (span) {
        return Optional.from(span.attr(dataAnnotation())).bind(registry.lookup);
      };
      editor.on('init', function () {
        editor.serializer.addNodeFilter('span', function (spans) {
          each$k(spans, function (span) {
            identifyParserNode(span).each(function (settings) {
              if (settings.persistent === false) {
                span.unwrap();
              }
            });
          });
        });
      });
    };

    var create$7 = function () {
      var annotations = {};
      var register = function (name, settings) {
        annotations[name] = {
          name: name,
          settings: settings
        };
      };
      var lookup = function (name) {
        return get$9(annotations, name).map(function (a) {
          return a.settings;
        });
      };
      return {
        register: register,
        lookup: lookup
      };
    };

    var unique = 0;
    var generate = function (prefix) {
      var date = new Date();
      var time = date.getTime();
      var random = Math.floor(Math.random() * 1000000000);
      unique++;
      return prefix + '_' + random + unique + String(time);
    };

    var add = function (element, classes) {
      each$k(classes, function (x) {
        add$1(element, x);
      });
    };

    var fromHtml = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      return children(SugarElement.fromDom(div));
    };
    var fromDom$1 = function (nodes) {
      return map$3(nodes, SugarElement.fromDom);
    };

    var get$3 = function (element) {
      return element.dom.innerHTML;
    };
    var set = function (element, content) {
      var owner = owner$1(element);
      var docDom = owner.dom;
      var fragment = SugarElement.fromDom(docDom.createDocumentFragment());
      var contentElements = fromHtml(content, docDom);
      append(fragment, contentElements);
      empty(element);
      append$1(element, fragment);
    };

    var clone$1 = function (original, isDeep) {
      return SugarElement.fromDom(original.dom.cloneNode(isDeep));
    };
    var shallow = function (original) {
      return clone$1(original, false);
    };
    var deep$1 = function (original) {
      return clone$1(original, true);
    };

    var TextWalker = function (startNode, rootNode, isBoundary) {
      if (isBoundary === void 0) {
        isBoundary = never;
      }
      var walker = new DomTreeWalker(startNode, rootNode);
      var walk = function (direction) {
        var next;
        do {
          next = walker[direction]();
        } while (next && !isText$7(next) && !isBoundary(next));
        return Optional.from(next).filter(isText$7);
      };
      return {
        current: function () {
          return Optional.from(walker.current()).filter(isText$7);
        },
        next: function () {
          return walk('next');
        },
        prev: function () {
          return walk('prev');
        },
        prev2: function () {
          return walk('prev2');
        }
      };
    };

    var TextSeeker = function (dom, isBoundary) {
      var isBlockBoundary = isBoundary ? isBoundary : function (node) {
        return dom.isBlock(node) || isBr$5(node) || isContentEditableFalse$b(node);
      };
      var walk = function (node, offset, walker, process) {
        if (isText$7(node)) {
          var newOffset = process(node, offset, node.data);
          if (newOffset !== -1) {
            return Optional.some({
              container: node,
              offset: newOffset
            });
          }
        }
        return walker().bind(function (next) {
          return walk(next.container, next.offset, walker, process);
        });
      };
      var backwards = function (node, offset, process, root) {
        var walker = TextWalker(node, root, isBlockBoundary);
        return walk(node, offset, function () {
          return walker.prev().map(function (prev) {
            return {
              container: prev,
              offset: prev.length
            };
          });
        }, process).getOrNull();
      };
      var forwards = function (node, offset, process, root) {
        var walker = TextWalker(node, root, isBlockBoundary);
        return walk(node, offset, function () {
          return walker.next().map(function (next) {
            return {
              container: next,
              offset: 0
            };
          });
        }, process).getOrNull();
      };
      return {
        backwards: backwards,
        forwards: forwards
      };
    };

    var round$2 = Math.round;
    var clone = function (rect) {
      if (!rect) {
        return {
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0
        };
      }
      return {
        left: round$2(rect.left),
        top: round$2(rect.top),
        bottom: round$2(rect.bottom),
        right: round$2(rect.right),
        width: round$2(rect.width),
        height: round$2(rect.height)
      };
    };
    var collapse = function (rect, toStart) {
      rect = clone(rect);
      if (toStart) {
        rect.right = rect.left;
      } else {
        rect.left = rect.left + rect.width;
        rect.right = rect.left;
      }
      rect.width = 0;
      return rect;
    };
    var isEqual = function (rect1, rect2) {
      return rect1.left === rect2.left && rect1.top === rect2.top && rect1.bottom === rect2.bottom && rect1.right === rect2.right;
    };
    var isValidOverflow = function (overflowY, rect1, rect2) {
      return overflowY >= 0 && overflowY <= Math.min(rect1.height, rect2.height) / 2;
    };
    var isAbove$1 = function (rect1, rect2) {
      var halfHeight = Math.min(rect2.height / 2, rect1.height / 2);
      if (rect1.bottom - halfHeight < rect2.top) {
        return true;
      }
      if (rect1.top > rect2.bottom) {
        return false;
      }
      return isValidOverflow(rect2.top - rect1.bottom, rect1, rect2);
    };
    var isBelow$1 = function (rect1, rect2) {
      if (rect1.top > rect2.bottom) {
        return true;
      }
      if (rect1.bottom < rect2.top) {
        return false;
      }
      return isValidOverflow(rect2.bottom - rect1.top, rect1, rect2);
    };
    var containsXY = function (rect, clientX, clientY) {
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    };

    var clamp$2 = function (value, min, max) {
      return Math.min(Math.max(value, min), max);
    };

    var getSelectedNode = function (range) {
      var startContainer = range.startContainer, startOffset = range.startOffset;
      if (startContainer.hasChildNodes() && range.endOffset === startOffset + 1) {
        return startContainer.childNodes[startOffset];
      }
      return null;
    };
    var getNode$1 = function (container, offset) {
      if (isElement$5(container) && container.hasChildNodes()) {
        var childNodes = container.childNodes;
        var safeOffset = clamp$2(offset, 0, childNodes.length - 1);
        return childNodes[safeOffset];
      } else {
        return container;
      }
    };
    var getNodeUnsafe = function (container, offset) {
      if (offset < 0 && isElement$5(container) && container.hasChildNodes()) {
        return undefined;
      } else {
        return getNode$1(container, offset);
      }
    };

    var extendingChars = new RegExp('[\u0300-\u036f\u0483-\u0487\u0488-\u0489\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u0610-\u061a' + '\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7-\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0' + '\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e3-\u0902\u093a\u093c' + '\u0941-\u0948\u094d\u0951-\u0957\u0962-\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2-\u09e3' + '\u0a01-\u0a02\u0a3c\u0a41-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a70-\u0a71\u0a75\u0a81-\u0a82\u0abc' + '\u0ac1-\u0ac5\u0ac7-\u0ac8\u0acd\u0ae2-\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57' + '\u0b62-\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c00\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56' + '\u0c62-\u0c63\u0c81\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc-\u0ccd\u0cd5-\u0cd6\u0ce2-\u0ce3\u0d01\u0d3e\u0d41-\u0d44' + '\u0d4d\u0d57\u0d62-\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9' + '\u0ebb-\u0ebc\u0ec8-\u0ecd\u0f18-\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86-\u0f87\u0f8d-\u0f97' + '\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039-\u103a\u103d-\u103e\u1058-\u1059\u105e-\u1060\u1071-\u1074' + '\u1082\u1085-\u1086\u108d\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17b4-\u17b5' + '\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193b\u1a17-\u1a18' + '\u1a1b\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1ab0-\u1abd\u1ABE\u1b00-\u1b03\u1b34' + '\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80-\u1b81\u1ba2-\u1ba5\u1ba8-\u1ba9\u1bab-\u1bad\u1be6\u1be8-\u1be9' + '\u1bed\u1bef-\u1bf1\u1c2c-\u1c33\u1c36-\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1cf4\u1cf8-\u1cf9' + '\u1dc0-\u1df5\u1dfc-\u1dff\u200c-\u200d\u20d0-\u20dc\u20DD-\u20E0\u20e1\u20E2-\u20E4\u20e5-\u20f0\u2cef-\u2cf1' + '\u2d7f\u2de0-\u2dff\u302a-\u302d\u302e-\u302f\u3099-\u309a\ua66f\uA670-\uA672\ua674-\ua67d\ua69e-\ua69f\ua6f0-\ua6f1' + '\ua802\ua806\ua80b\ua825-\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc' + '\ua9e5\uaa29-\uaa2e\uaa31-\uaa32\uaa35-\uaa36\uaa43\uaa4c\uaa7c\uaab0\uaab2-\uaab4\uaab7-\uaab8\uaabe-\uaabf\uaac1' + '\uaaec-\uaaed\uaaf6\uabe5\uabe8\uabed\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\uff9e-\uff9f]');
    var isExtendingChar = function (ch) {
      return typeof ch === 'string' && ch.charCodeAt(0) >= 768 && extendingChars.test(ch);
    };

    var or = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return function (x) {
        for (var i = 0; i < args.length; i++) {
          if (args[i](x)) {
            return true;
          }
        }
        return false;
      };
    };
    var and = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return function (x) {
        for (var i = 0; i < args.length; i++) {
          if (!args[i](x)) {
            return false;
          }
        }
        return true;
      };
    };

    var isElement$3 = isElement$5;
    var isCaretCandidate$2 = isCaretCandidate$3;
    var isBlock$1 = matchStyleValues('display', 'block table');
    var isFloated = matchStyleValues('float', 'left right');
    var isValidElementCaretCandidate = and(isElement$3, isCaretCandidate$2, not(isFloated));
    var isNotPre = not(matchStyleValues('white-space', 'pre pre-line pre-wrap'));
    var isText$4 = isText$7;
    var isBr$2 = isBr$5;
    var nodeIndex$1 = DOMUtils.nodeIndex;
    var resolveIndex$1 = getNodeUnsafe;
    var createRange$1 = function (doc) {
      return 'createRange' in doc ? doc.createRange() : DOMUtils.DOM.createRng();
    };
    var isWhiteSpace$1 = function (chr) {
      return chr && /[\r\n\t ]/.test(chr);
    };
    var isRange = function (rng) {
      return !!rng.setStart && !!rng.setEnd;
    };
    var isHiddenWhiteSpaceRange = function (range) {
      var container = range.startContainer;
      var offset = range.startOffset;
      if (isWhiteSpace$1(range.toString()) && isNotPre(container.parentNode) && isText$7(container)) {
        var text = container.data;
        if (isWhiteSpace$1(text[offset - 1]) || isWhiteSpace$1(text[offset + 1])) {
          return true;
        }
      }
      return false;
    };
    var getBrClientRect = function (brNode) {
      var doc = brNode.ownerDocument;
      var rng = createRange$1(doc);
      var nbsp$1 = doc.createTextNode(nbsp);
      var parentNode = brNode.parentNode;
      parentNode.insertBefore(nbsp$1, brNode);
      rng.setStart(nbsp$1, 0);
      rng.setEnd(nbsp$1, 1);
      var clientRect = clone(rng.getBoundingClientRect());
      parentNode.removeChild(nbsp$1);
      return clientRect;
    };
    var getBoundingClientRectWebKitText = function (rng) {
      var sc = rng.startContainer;
      var ec = rng.endContainer;
      var so = rng.startOffset;
      var eo = rng.endOffset;
      if (sc === ec && isText$7(ec) && so === 0 && eo === 1) {
        var newRng = rng.cloneRange();
        newRng.setEndAfter(ec);
        return getBoundingClientRect$1(newRng);
      } else {
        return null;
      }
    };
    var isZeroRect = function (r) {
      return r.left === 0 && r.right === 0 && r.top === 0 && r.bottom === 0;
    };
    var getBoundingClientRect$1 = function (item) {
      var clientRect;
      var clientRects = item.getClientRects();
      if (clientRects.length > 0) {
        clientRect = clone(clientRects[0]);
      } else {
        clientRect = clone(item.getBoundingClientRect());
      }
      if (!isRange(item) && isBr$2(item) && isZeroRect(clientRect)) {
        return getBrClientRect(item);
      }
      if (isZeroRect(clientRect) && isRange(item)) {
        return getBoundingClientRectWebKitText(item);
      }
      return clientRect;
    };
    var collapseAndInflateWidth = function (clientRect, toStart) {
      var newClientRect = collapse(clientRect, toStart);
      newClientRect.width = 1;
      newClientRect.right = newClientRect.left + 1;
      return newClientRect;
    };
    var getCaretPositionClientRects = function (caretPosition) {
      var clientRects = [];
      var addUniqueAndValidRect = function (clientRect) {
        if (clientRect.height === 0) {
          return;
        }
        if (clientRects.length > 0) {
          if (isEqual(clientRect, clientRects[clientRects.length - 1])) {
            return;
          }
        }
        clientRects.push(clientRect);
      };
      var addCharacterOffset = function (container, offset) {
        var range = createRange$1(container.ownerDocument);
        if (offset < container.data.length) {
          if (isExtendingChar(container.data[offset])) {
            return clientRects;
          }
          if (isExtendingChar(container.data[offset - 1])) {
            range.setStart(container, offset);
            range.setEnd(container, offset + 1);
            if (!isHiddenWhiteSpaceRange(range)) {
              addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(range), false));
              return clientRects;
            }
          }
        }
        if (offset > 0) {
          range.setStart(container, offset - 1);
          range.setEnd(container, offset);
          if (!isHiddenWhiteSpaceRange(range)) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(range), false));
          }
        }
        if (offset < container.data.length) {
          range.setStart(container, offset);
          range.setEnd(container, offset + 1);
          if (!isHiddenWhiteSpaceRange(range)) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(range), true));
          }
        }
      };
      var container = caretPosition.container();
      var offset = caretPosition.offset();
      if (isText$4(container)) {
        addCharacterOffset(container, offset);
        return clientRects;
      }
      if (isElement$3(container)) {
        if (caretPosition.isAtEnd()) {
          var node = resolveIndex$1(container, offset);
          if (isText$4(node)) {
            addCharacterOffset(node, node.data.length);
          }
          if (isValidElementCaretCandidate(node) && !isBr$2(node)) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(node), false));
          }
        } else {
          var node = resolveIndex$1(container, offset);
          if (isText$4(node)) {
            addCharacterOffset(node, 0);
          }
          if (isValidElementCaretCandidate(node) && caretPosition.isAtEnd()) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(node), false));
            return clientRects;
          }
          var beforeNode = resolveIndex$1(caretPosition.container(), caretPosition.offset() - 1);
          if (isValidElementCaretCandidate(beforeNode) && !isBr$2(beforeNode)) {
            if (isBlock$1(beforeNode) || isBlock$1(node) || !isValidElementCaretCandidate(node)) {
              addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(beforeNode), false));
            }
          }
          if (isValidElementCaretCandidate(node)) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect$1(node), true));
          }
        }
      }
      return clientRects;
    };
    var CaretPosition = function (container, offset, clientRects) {
      var isAtStart = function () {
        if (isText$4(container)) {
          return offset === 0;
        }
        return offset === 0;
      };
      var isAtEnd = function () {
        if (isText$4(container)) {
          return offset >= container.data.length;
        }
        return offset >= container.childNodes.length;
      };
      var toRange = function () {
        var range = createRange$1(container.ownerDocument);
        range.setStart(container, offset);
        range.setEnd(container, offset);
        return range;
      };
      var getClientRects = function () {
        if (!clientRects) {
          clientRects = getCaretPositionClientRects(CaretPosition(container, offset));
        }
        return clientRects;
      };
      var isVisible = function () {
        return getClientRects().length > 0;
      };
      var isEqual = function (caretPosition) {
        return caretPosition && container === caretPosition.container() && offset === caretPosition.offset();
      };
      var getNode = function (before) {
        return resolveIndex$1(container, before ? offset - 1 : offset);
      };
      return {
        container: constant(container),
        offset: constant(offset),
        toRange: toRange,
        getClientRects: getClientRects,
        isVisible: isVisible,
        isAtStart: isAtStart,
        isAtEnd: isAtEnd,
        isEqual: isEqual,
        getNode: getNode
      };
    };
    CaretPosition.fromRangeStart = function (range) {
      return CaretPosition(range.startContainer, range.startOffset);
    };
    CaretPosition.fromRangeEnd = function (range) {
      return CaretPosition(range.endContainer, range.endOffset);
    };
    CaretPosition.after = function (node) {
      return CaretPosition(node.parentNode, nodeIndex$1(node) + 1);
    };
    CaretPosition.before = function (node) {
      return CaretPosition(node.parentNode, nodeIndex$1(node));
    };
    CaretPosition.isAbove = function (pos1, pos2) {
      return lift2(head(pos2.getClientRects()), last$2(pos1.getClientRects()), isAbove$1).getOr(false);
    };
    CaretPosition.isBelow = function (pos1, pos2) {
      return lift2(last$2(pos2.getClientRects()), head(pos1.getClientRects()), isBelow$1).getOr(false);
    };
    CaretPosition.isAtStart = function (pos) {
      return pos ? pos.isAtStart() : false;
    };
    CaretPosition.isAtEnd = function (pos) {
      return pos ? pos.isAtEnd() : false;
    };
    CaretPosition.isTextPosition = function (pos) {
      return pos ? isText$7(pos.container()) : false;
    };
    CaretPosition.isElementPosition = function (pos) {
      return CaretPosition.isTextPosition(pos) === false;
    };

    var trimEmptyTextNode$1 = function (dom, node) {
      if (isText$7(node) && node.data.length === 0) {
        dom.remove(node);
      }
    };
    var insertNode = function (dom, rng, node) {
      rng.insertNode(node);
      trimEmptyTextNode$1(dom, node.previousSibling);
      trimEmptyTextNode$1(dom, node.nextSibling);
    };
    var insertFragment = function (dom, rng, frag) {
      var firstChild = Optional.from(frag.firstChild);
      var lastChild = Optional.from(frag.lastChild);
      rng.insertNode(frag);
      firstChild.each(function (child) {
        return trimEmptyTextNode$1(dom, child.previousSibling);
      });
      lastChild.each(function (child) {
        return trimEmptyTextNode$1(dom, child.nextSibling);
      });
    };
    var rangeInsertNode = function (dom, rng, node) {
      if (isDocumentFragment(node)) {
        insertFragment(dom, rng, node);
      } else {
        insertNode(dom, rng, node);
      }
    };

    var isText$3 = isText$7;
    var isBogus = isBogus$2;
    var nodeIndex = DOMUtils.nodeIndex;
    var normalizedParent = function (node) {
      var parentNode = node.parentNode;
      if (isBogus(parentNode)) {
        return normalizedParent(parentNode);
      }
      return parentNode;
    };
    var getChildNodes = function (node) {
      if (!node) {
        return [];
      }
      return reduce(node.childNodes, function (result, node) {
        if (isBogus(node) && node.nodeName !== 'BR') {
          result = result.concat(getChildNodes(node));
        } else {
          result.push(node);
        }
        return result;
      }, []);
    };
    var normalizedTextOffset = function (node, offset) {
      while (node = node.previousSibling) {
        if (!isText$3(node)) {
          break;
        }
        offset += node.data.length;
      }
      return offset;
    };
    var equal = function (a) {
      return function (b) {
        return a === b;
      };
    };
    var normalizedNodeIndex = function (node) {
      var nodes, index;
      nodes = getChildNodes(normalizedParent(node));
      index = findIndex$1(nodes, equal(node), node);
      nodes = nodes.slice(0, index + 1);
      var numTextFragments = reduce(nodes, function (result, node, i) {
        if (isText$3(node) && isText$3(nodes[i - 1])) {
          result++;
        }
        return result;
      }, 0);
      nodes = filter$2(nodes, matchNodeNames([node.nodeName]));
      index = findIndex$1(nodes, equal(node), node);
      return index - numTextFragments;
    };
    var createPathItem = function (node) {
      var name;
      if (isText$3(node)) {
        name = 'text()';
      } else {
        name = node.nodeName.toLowerCase();
      }
      return name + '[' + normalizedNodeIndex(node) + ']';
    };
    var parentsUntil$1 = function (root, node, predicate) {
      var parents = [];
      for (node = node.parentNode; node !== root; node = node.parentNode) {
        if (predicate && predicate(node)) {
          break;
        }
        parents.push(node);
      }
      return parents;
    };
    var create$6 = function (root, caretPosition) {
      var container, offset, path = [], outputOffset, childNodes, parents;
      container = caretPosition.container();
      offset = caretPosition.offset();
      if (isText$3(container)) {
        outputOffset = normalizedTextOffset(container, offset);
      } else {
        childNodes = container.childNodes;
        if (offset >= childNodes.length) {
          outputOffset = 'after';
          offset = childNodes.length - 1;
        } else {
          outputOffset = 'before';
        }
        container = childNodes[offset];
      }
      path.push(createPathItem(container));
      parents = parentsUntil$1(root, container);
      parents = filter$2(parents, not(isBogus$2));
      path = path.concat(map$1(parents, function (node) {
        return createPathItem(node);
      }));
      return path.reverse().join('/') + ',' + outputOffset;
    };
    var resolvePathItem = function (node, name, index) {
      var nodes = getChildNodes(node);
      nodes = filter$2(nodes, function (node, index) {
        return !isText$3(node) || !isText$3(nodes[index - 1]);
      });
      nodes = filter$2(nodes, matchNodeNames([name]));
      return nodes[index];
    };
    var findTextPosition = function (container, offset) {
      var node = container, targetOffset = 0, dataLen;
      while (isText$3(node)) {
        dataLen = node.data.length;
        if (offset >= targetOffset && offset <= targetOffset + dataLen) {
          container = node;
          offset = offset - targetOffset;
          break;
        }
        if (!isText$3(node.nextSibling)) {
          container = node;
          offset = dataLen;
          break;
        }
        targetOffset += dataLen;
        node = node.nextSibling;
      }
      if (isText$3(container) && offset > container.data.length) {
        offset = container.data.length;
      }
      return CaretPosition(container, offset);
    };
    var resolve$2 = function (root, path) {
      var offset;
      if (!path) {
        return null;
      }
      var parts = path.split(',');
      var paths = parts[0].split('/');
      offset = parts.length > 1 ? parts[1] : 'before';
      var container = reduce(paths, function (result, value) {
        var match = /([\w\-\(\)]+)\[([0-9]+)\]/.exec(value);
        if (!match) {
          return null;
        }
        if (match[1] === 'text()') {
          match[1] = '#text';
        }
        return resolvePathItem(result, match[1], parseInt(match[2], 10));
      }, root);
      if (!container) {
        return null;
      }
      if (!isText$3(container)) {
        if (offset === 'after') {
          offset = nodeIndex(container) + 1;
        } else {
          offset = nodeIndex(container);
        }
        return CaretPosition(container.parentNode, offset);
      }
      return findTextPosition(container, parseInt(offset, 10));
    };

    var isContentEditableFalse$9 = isContentEditableFalse$b;
    var getNormalizedTextOffset = function (trim, container, offset) {
      var node, trimmedOffset;
      trimmedOffset = trim(container.data.slice(0, offset)).length;
      for (node = container.previousSibling; node && isText$7(node); node = node.previousSibling) {
        trimmedOffset += trim(node.data).length;
      }
      return trimmedOffset;
    };
    var getPoint = function (dom, trim, normalized, rng, start) {
      var container = rng[start ? 'startContainer' : 'endContainer'];
      var offset = rng[start ? 'startOffset' : 'endOffset'];
      var point = [];
      var childNodes, after = 0;
      var root = dom.getRoot();
      if (isText$7(container)) {
        point.push(normalized ? getNormalizedTextOffset(trim, container, offset) : offset);
      } else {
        childNodes = container.childNodes;
        if (offset >= childNodes.length && childNodes.length) {
          after = 1;
          offset = Math.max(0, childNodes.length - 1);
        }
        point.push(dom.nodeIndex(childNodes[offset], normalized) + after);
      }
      for (; container && container !== root; container = container.parentNode) {
        point.push(dom.nodeIndex(container, normalized));
      }
      return point;
    };
    var getLocation = function (trim, selection, normalized, rng) {
      var dom = selection.dom, bookmark = {};
      bookmark.start = getPoint(dom, trim, normalized, rng, true);
      if (!selection.isCollapsed()) {
        bookmark.end = getPoint(dom, trim, normalized, rng, false);
      }
      if (isRangeInCaretContainerBlock(rng)) {
        bookmark.isFakeCaret = true;
      }
      return bookmark;
    };
    var findIndex = function (dom, name, element) {
      var count = 0;
      Tools.each(dom.select(name), function (node) {
        if (node.getAttribute('data-mce-bogus') === 'all') {
          return;
        }
        if (node === element) {
          return false;
        }
        count++;
      });
      return count;
    };
    var moveEndPoint$1 = function (rng, start) {
      var container, offset, childNodes;
      var prefix = start ? 'start' : 'end';
      container = rng[prefix + 'Container'];
      offset = rng[prefix + 'Offset'];
      if (isElement$5(container) && container.nodeName === 'TR') {
        childNodes = container.childNodes;
        container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
        if (container) {
          offset = start ? 0 : container.childNodes.length;
          rng['set' + (start ? 'Start' : 'End')](container, offset);
        }
      }
    };
    var normalizeTableCellSelection = function (rng) {
      moveEndPoint$1(rng, true);
      moveEndPoint$1(rng, false);
      return rng;
    };
    var findSibling = function (node, offset) {
      var sibling;
      if (isElement$5(node)) {
        node = getNode$1(node, offset);
        if (isContentEditableFalse$9(node)) {
          return node;
        }
      }
      if (isCaretContainer$2(node)) {
        if (isText$7(node) && isCaretContainerBlock$1(node)) {
          node = node.parentNode;
        }
        sibling = node.previousSibling;
        if (isContentEditableFalse$9(sibling)) {
          return sibling;
        }
        sibling = node.nextSibling;
        if (isContentEditableFalse$9(sibling)) {
          return sibling;
        }
      }
    };
    var findAdjacentContentEditableFalseElm = function (rng) {
      return findSibling(rng.startContainer, rng.startOffset) || findSibling(rng.endContainer, rng.endOffset);
    };
    var getOffsetBookmark = function (trim, normalized, selection) {
      var element = selection.getNode();
      var name = element ? element.nodeName : null;
      var rng = selection.getRng();
      if (isContentEditableFalse$9(element) || name === 'IMG') {
        return {
          name: name,
          index: findIndex(selection.dom, name, element)
        };
      }
      var sibling = findAdjacentContentEditableFalseElm(rng);
      if (sibling) {
        name = sibling.tagName;
        return {
          name: name,
          index: findIndex(selection.dom, name, sibling)
        };
      }
      return getLocation(trim, selection, normalized, rng);
    };
    var getCaretBookmark = function (selection) {
      var rng = selection.getRng();
      return {
        start: create$6(selection.dom.getRoot(), CaretPosition.fromRangeStart(rng)),
        end: create$6(selection.dom.getRoot(), CaretPosition.fromRangeEnd(rng))
      };
    };
    var getRangeBookmark = function (selection) {
      return { rng: selection.getRng() };
    };
    var createBookmarkSpan = function (dom, id, filled) {
      var args = {
        'data-mce-type': 'bookmark',
        id: id,
        'style': 'overflow:hidden;line-height:0px'
      };
      return filled ? dom.create('span', args, '&#xFEFF;') : dom.create('span', args);
    };
    var getPersistentBookmark = function (selection, filled) {
      var dom = selection.dom;
      var rng = selection.getRng();
      var id = dom.uniqueId();
      var collapsed = selection.isCollapsed();
      var element = selection.getNode();
      var name = element.nodeName;
      if (name === 'IMG') {
        return {
          name: name,
          index: findIndex(dom, name, element)
        };
      }
      var rng2 = normalizeTableCellSelection(rng.cloneRange());
      if (!collapsed) {
        rng2.collapse(false);
        var endBookmarkNode = createBookmarkSpan(dom, id + '_end', filled);
        rangeInsertNode(dom, rng2, endBookmarkNode);
      }
      rng = normalizeTableCellSelection(rng);
      rng.collapse(true);
      var startBookmarkNode = createBookmarkSpan(dom, id + '_start', filled);
      rangeInsertNode(dom, rng, startBookmarkNode);
      selection.moveToBookmark({
        id: id,
        keep: true
      });
      return { id: id };
    };
    var getBookmark$2 = function (selection, type, normalized) {
      if (type === 2) {
        return getOffsetBookmark(trim$2, normalized, selection);
      } else if (type === 3) {
        return getCaretBookmark(selection);
      } else if (type) {
        return getRangeBookmark(selection);
      } else {
        return getPersistentBookmark(selection, false);
      }
    };
    var getUndoBookmark = curry(getOffsetBookmark, identity, true);

    var DOM$9 = DOMUtils.DOM;
    var defaultPreviewStyles = 'font-family font-size font-weight font-style text-decoration text-transform color background-color border border-radius outline text-shadow';
    var getBodySetting = function (editor, name, defaultValue) {
      var value = editor.getParam(name, defaultValue);
      if (value.indexOf('=') !== -1) {
        var bodyObj = editor.getParam(name, '', 'hash');
        return get$9(bodyObj, editor.id).getOr(defaultValue);
      } else {
        return value;
      }
    };
    var getIframeAttrs = function (editor) {
      return editor.getParam('iframe_attrs', {});
    };
    var getDocType = function (editor) {
      return editor.getParam('doctype', '<!DOCTYPE html>');
    };
    var getDocumentBaseUrl = function (editor) {
      return editor.getParam('document_base_url', '');
    };
    var getBodyId = function (editor) {
      return getBodySetting(editor, 'body_id', 'tinymce');
    };
    var getBodyClass = function (editor) {
      return getBodySetting(editor, 'body_class', '');
    };
    var getContentSecurityPolicy = function (editor) {
      return editor.getParam('content_security_policy', '');
    };
    var shouldPutBrInPre$1 = function (editor) {
      return editor.getParam('br_in_pre', true);
    };
    var getForcedRootBlock = function (editor) {
      if (editor.getParam('force_p_newlines', false)) {
        return 'p';
      }
      var block = editor.getParam('forced_root_block', 'p');
      if (block === false) {
        return '';
      } else if (block === true) {
        return 'p';
      } else {
        return block;
      }
    };
    var getForcedRootBlockAttrs = function (editor) {
      return editor.getParam('forced_root_block_attrs', {});
    };
    var getBrNewLineSelector = function (editor) {
      return editor.getParam('br_newline_selector', '.mce-toc h2,figcaption,caption');
    };
    var getNoNewLineSelector = function (editor) {
      return editor.getParam('no_newline_selector', '');
    };
    var shouldKeepStyles = function (editor) {
      return editor.getParam('keep_styles', true);
    };
    var shouldEndContainerOnEmptyBlock = function (editor) {
      return editor.getParam('end_container_on_empty_block', false);
    };
    var getFontStyleValues = function (editor) {
      return Tools.explode(editor.getParam('font_size_style_values', 'xx-small,x-small,small,medium,large,x-large,xx-large'));
    };
    var getFontSizeClasses = function (editor) {
      return Tools.explode(editor.getParam('font_size_classes', ''));
    };
    var getImagesDataImgFilter = function (editor) {
      return editor.getParam('images_dataimg_filter', always, 'function');
    };
    var isAutomaticUploadsEnabled = function (editor) {
      return editor.getParam('automatic_uploads', true, 'boolean');
    };
    var shouldReuseFileName = function (editor) {
      return editor.getParam('images_reuse_filename', false, 'boolean');
    };
    var shouldReplaceBlobUris = function (editor) {
      return editor.getParam('images_replace_blob_uris', true, 'boolean');
    };
    var getIconPackName = function (editor) {
      return editor.getParam('icons', '', 'string');
    };
    var getIconsUrl = function (editor) {
      return editor.getParam('icons_url', '', 'string');
    };
    var getImageUploadUrl = function (editor) {
      return editor.getParam('images_upload_url', '', 'string');
    };
    var getImageUploadBasePath = function (editor) {
      return editor.getParam('images_upload_base_path', '', 'string');
    };
    var getImagesUploadCredentials = function (editor) {
      return editor.getParam('images_upload_credentials', false, 'boolean');
    };
    var getImagesUploadHandler = function (editor) {
      return editor.getParam('images_upload_handler', null, 'function');
    };
    var shouldUseContentCssCors = function (editor) {
      return editor.getParam('content_css_cors', false, 'boolean');
    };
    var getReferrerPolicy = function (editor) {
      return editor.getParam('referrer_policy', '', 'string');
    };
    var getLanguageCode = function (editor) {
      return editor.getParam('language', 'en', 'string');
    };
    var getLanguageUrl = function (editor) {
      return editor.getParam('language_url', '', 'string');
    };
    var shouldIndentUseMargin = function (editor) {
      return editor.getParam('indent_use_margin', false);
    };
    var getIndentation = function (editor) {
      return editor.getParam('indentation', '40px', 'string');
    };
    var getContentCss = function (editor) {
      var contentCss = editor.getParam('content_css');
      if (isString$1(contentCss)) {
        return map$3(contentCss.split(','), trim$4);
      } else if (isArray$1(contentCss)) {
        return contentCss;
      } else if (contentCss === false || editor.inline) {
        return [];
      } else {
        return ['default'];
      }
    };
    var getFontCss = function (editor) {
      var fontCss = editor.getParam('font_css', []);
      return isArray$1(fontCss) ? fontCss : map$3(fontCss.split(','), trim$4);
    };
    var getDirectionality = function (editor) {
      return editor.getParam('directionality', I18n.isRtl() ? 'rtl' : undefined);
    };
    var getInlineBoundarySelector = function (editor) {
      return editor.getParam('inline_boundaries_selector', 'a[href],code,.mce-annotation', 'string');
    };
    var getObjectResizing = function (editor) {
      var selector = editor.getParam('object_resizing');
      if (selector === false || Env.iOS) {
        return false;
      } else {
        return isString$1(selector) ? selector : 'table,img,figure.image,div,video,iframe';
      }
    };
    var getResizeImgProportional = function (editor) {
      return editor.getParam('resize_img_proportional', true, 'boolean');
    };
    var getPlaceholder = function (editor) {
      return editor.getParam('placeholder', DOM$9.getAttrib(editor.getElement(), 'placeholder'), 'string');
    };
    var getEventRoot = function (editor) {
      return editor.getParam('event_root');
    };
    var getServiceMessage = function (editor) {
      return editor.getParam('service_message');
    };
    var getTheme = function (editor) {
      return editor.getParam('theme');
    };
    var shouldValidate = function (editor) {
      return editor.getParam('validate');
    };
    var isInlineBoundariesEnabled = function (editor) {
      return editor.getParam('inline_boundaries') !== false;
    };
    var getFormats = function (editor) {
      return editor.getParam('formats');
    };
    var getPreviewStyles = function (editor) {
      var style = editor.getParam('preview_styles', defaultPreviewStyles);
      if (isString$1(style)) {
        return style;
      } else {
        return '';
      }
    };
    var canFormatEmptyLines = function (editor) {
      return editor.getParam('format_empty_lines', false, 'boolean');
    };
    var getCustomUiSelector = function (editor) {
      return editor.getParam('custom_ui_selector', '', 'string');
    };
    var getThemeUrl = function (editor) {
      return editor.getParam('theme_url');
    };
    var isInline = function (editor) {
      return editor.getParam('inline');
    };
    var hasHiddenInput = function (editor) {
      return editor.getParam('hidden_input');
    };
    var shouldPatchSubmit = function (editor) {
      return editor.getParam('submit_patch');
    };
    var isEncodingXml = function (editor) {
      return editor.getParam('encoding') === 'xml';
    };
    var shouldAddFormSubmitTrigger = function (editor) {
      return editor.getParam('add_form_submit_trigger');
    };
    var shouldAddUnloadTrigger = function (editor) {
      return editor.getParam('add_unload_trigger');
    };
    var hasForcedRootBlock = function (editor) {
      return getForcedRootBlock(editor) !== '';
    };
    var getCustomUndoRedoLevels = function (editor) {
      return editor.getParam('custom_undo_redo_levels', 0, 'number');
    };
    var shouldDisableNodeChange = function (editor) {
      return editor.getParam('disable_nodechange');
    };
    var isReadOnly$1 = function (editor) {
      return editor.getParam('readonly');
    };
    var hasContentCssCors = function (editor) {
      return editor.getParam('content_css_cors');
    };
    var getPlugins = function (editor) {
      return editor.getParam('plugins', '', 'string');
    };
    var getExternalPlugins$1 = function (editor) {
      return editor.getParam('external_plugins');
    };
    var shouldBlockUnsupportedDrop = function (editor) {
      return editor.getParam('block_unsupported_drop', true, 'boolean');
    };
    var isVisualAidsEnabled = function (editor) {
      return editor.getParam('visual', true, 'boolean');
    };
    var getVisualAidsTableClass = function (editor) {
      return editor.getParam('visual_table_class', 'mce-item-table', 'string');
    };
    var getVisualAidsAnchorClass = function (editor) {
      return editor.getParam('visual_anchor_class', 'mce-item-anchor', 'string');
    };
    var getIframeTitle = function (editor) {
      return editor.getParam('iframe_aria_text', 'Rich Text Area. Press ALT-0 for help.', 'string');
    };

    var isElement$2 = isElement$5;
    var isText$2 = isText$7;
    var removeNode$1 = function (node) {
      var parentNode = node.parentNode;
      if (parentNode) {
        parentNode.removeChild(node);
      }
    };
    var trimCount = function (text) {
      var trimmedText = trim$2(text);
      return {
        count: text.length - trimmedText.length,
        text: trimmedText
      };
    };
    var deleteZwspChars = function (caretContainer) {
      var idx;
      while ((idx = caretContainer.data.lastIndexOf(ZWSP$1)) !== -1) {
        caretContainer.deleteData(idx, 1);
      }
    };
    var removeUnchanged = function (caretContainer, pos) {
      remove$2(caretContainer);
      return pos;
    };
    var removeTextAndReposition = function (caretContainer, pos) {
      var before = trimCount(caretContainer.data.substr(0, pos.offset()));
      var after = trimCount(caretContainer.data.substr(pos.offset()));
      var text = before.text + after.text;
      if (text.length > 0) {
        deleteZwspChars(caretContainer);
        return CaretPosition(caretContainer, pos.offset() - before.count);
      } else {
        return pos;
      }
    };
    var removeElementAndReposition = function (caretContainer, pos) {
      var parentNode = pos.container();
      var newPosition = indexOf$2(from(parentNode.childNodes), caretContainer).map(function (index) {
        return index < pos.offset() ? CaretPosition(parentNode, pos.offset() - 1) : pos;
      }).getOr(pos);
      remove$2(caretContainer);
      return newPosition;
    };
    var removeTextCaretContainer = function (caretContainer, pos) {
      return isText$2(caretContainer) && pos.container() === caretContainer ? removeTextAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);
    };
    var removeElementCaretContainer = function (caretContainer, pos) {
      return pos.container() === caretContainer.parentNode ? removeElementAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);
    };
    var removeAndReposition = function (container, pos) {
      return CaretPosition.isTextPosition(pos) ? removeTextCaretContainer(container, pos) : removeElementCaretContainer(container, pos);
    };
    var remove$2 = function (caretContainerNode) {
      if (isElement$2(caretContainerNode) && isCaretContainer$2(caretContainerNode)) {
        if (hasContent(caretContainerNode)) {
          caretContainerNode.removeAttribute('data-mce-caret');
        } else {
          removeNode$1(caretContainerNode);
        }
      }
      if (isText$2(caretContainerNode)) {
        deleteZwspChars(caretContainerNode);
        if (caretContainerNode.data.length === 0) {
          removeNode$1(caretContainerNode);
        }
      }
    };

    var browser$2 = detect().browser;
    var isContentEditableFalse$8 = isContentEditableFalse$b;
    var isMedia$1 = isMedia$2;
    var isTableCell$3 = isTableCell$5;
    var inlineFakeCaretSelector = '*[contentEditable=false],video,audio,embed,object';
    var getAbsoluteClientRect = function (root, element, before) {
      var clientRect = collapse(element.getBoundingClientRect(), before);
      var scrollX;
      var scrollY;
      if (root.tagName === 'BODY') {
        var docElm = root.ownerDocument.documentElement;
        scrollX = root.scrollLeft || docElm.scrollLeft;
        scrollY = root.scrollTop || docElm.scrollTop;
      } else {
        var rootRect = root.getBoundingClientRect();
        scrollX = root.scrollLeft - rootRect.left;
        scrollY = root.scrollTop - rootRect.top;
      }
      clientRect.left += scrollX;
      clientRect.right += scrollX;
      clientRect.top += scrollY;
      clientRect.bottom += scrollY;
      clientRect.width = 1;
      var margin = element.offsetWidth - element.clientWidth;
      if (margin > 0) {
        if (before) {
          margin *= -1;
        }
        clientRect.left += margin;
        clientRect.right += margin;
      }
      return clientRect;
    };
    var trimInlineCaretContainers = function (root) {
      var fakeCaretTargetNodes = descendants(SugarElement.fromDom(root), inlineFakeCaretSelector);
      for (var i = 0; i < fakeCaretTargetNodes.length; i++) {
        var node = fakeCaretTargetNodes[i].dom;
        var sibling = node.previousSibling;
        if (endsWithCaretContainer$1(sibling)) {
          var data = sibling.data;
          if (data.length === 1) {
            sibling.parentNode.removeChild(sibling);
          } else {
            sibling.deleteData(data.length - 1, 1);
          }
        }
        sibling = node.nextSibling;
        if (startsWithCaretContainer$1(sibling)) {
          var data = sibling.data;
          if (data.length === 1) {
            sibling.parentNode.removeChild(sibling);
          } else {
            sibling.deleteData(0, 1);
          }
        }
      }
    };
    var FakeCaret = function (editor, root, isBlock, hasFocus) {
      var lastVisualCaret = value();
      var cursorInterval;
      var caretContainerNode;
      var rootBlock = getForcedRootBlock(editor);
      var caretBlock = rootBlock.length > 0 ? rootBlock : 'p';
      var show = function (before, element) {
        var rng;
        hide();
        if (isTableCell$3(element)) {
          return null;
        }
        if (isBlock(element)) {
          caretContainerNode = insertBlock$1(caretBlock, element, before);
          var clientRect = getAbsoluteClientRect(root, element, before);
          DomQuery(caretContainerNode).css('top', clientRect.top);
          var caret = DomQuery('<div class="mce-visual-caret" data-mce-bogus="all"></div>').css(__assign({}, clientRect)).appendTo(root)[0];
          lastVisualCaret.set({
            caret: caret,
            element: element,
            before: before
          });
          if (before) {
            DomQuery(caret).addClass('mce-visual-caret-before');
          }
          startBlink();
          rng = element.ownerDocument.createRange();
          rng.setStart(caretContainerNode, 0);
          rng.setEnd(caretContainerNode, 0);
        } else {
          caretContainerNode = insertInline$1(element, before);
          rng = element.ownerDocument.createRange();
          if (isInlineFakeCaretTarget(caretContainerNode.nextSibling)) {
            rng.setStart(caretContainerNode, 0);
            rng.setEnd(caretContainerNode, 0);
          } else {
            rng.setStart(caretContainerNode, 1);
            rng.setEnd(caretContainerNode, 1);
          }
          return rng;
        }
        return rng;
      };
      var hide = function () {
        trimInlineCaretContainers(root);
        if (caretContainerNode) {
          remove$2(caretContainerNode);
          caretContainerNode = null;
        }
        lastVisualCaret.on(function (caretState) {
          DomQuery(caretState.caret).remove();
          lastVisualCaret.clear();
        });
        if (cursorInterval) {
          Delay.clearInterval(cursorInterval);
          cursorInterval = undefined;
        }
      };
      var startBlink = function () {
        cursorInterval = Delay.setInterval(function () {
          if (hasFocus()) {
            DomQuery('div.mce-visual-caret', root).toggleClass('mce-visual-caret-hidden');
          } else {
            DomQuery('div.mce-visual-caret', root).addClass('mce-visual-caret-hidden');
          }
        }, 500);
      };
      var reposition = function () {
        lastVisualCaret.on(function (caretState) {
          var clientRect = getAbsoluteClientRect(root, caretState.element, caretState.before);
          DomQuery(caretState.caret).css(__assign({}, clientRect));
        });
      };
      var destroy = function () {
        return Delay.clearInterval(cursorInterval);
      };
      var getCss = function () {
        return '.mce-visual-caret {' + 'position: absolute;' + 'background-color: black;' + 'background-color: currentcolor;' + '}' + '.mce-visual-caret-hidden {' + 'display: none;' + '}' + '*[data-mce-caret] {' + 'position: absolute;' + 'left: -1000px;' + 'right: auto;' + 'top: 0;' + 'margin: 0;' + 'padding: 0;' + '}';
      };
      return {
        show: show,
        hide: hide,
        getCss: getCss,
        reposition: reposition,
        destroy: destroy
      };
    };
    var isFakeCaretTableBrowser = function () {
      return browser$2.isIE() || browser$2.isEdge() || browser$2.isFirefox();
    };
    var isInlineFakeCaretTarget = function (node) {
      return isContentEditableFalse$8(node) || isMedia$1(node);
    };
    var isFakeCaretTarget = function (node) {
      return isInlineFakeCaretTarget(node) || isTable$3(node) && isFakeCaretTableBrowser();
    };

    var isContentEditableFalse$7 = isContentEditableFalse$b;
    var isMedia = isMedia$2;
    var isBlockLike = matchStyleValues('display', 'block table table-cell table-caption list-item');
    var isCaretContainer = isCaretContainer$2;
    var isCaretContainerBlock = isCaretContainerBlock$1;
    var isElement$1 = isElement$5;
    var isCaretCandidate$1 = isCaretCandidate$3;
    var isForwards = function (direction) {
      return direction > 0;
    };
    var isBackwards = function (direction) {
      return direction < 0;
    };
    var skipCaretContainers = function (walk, shallow) {
      var node;
      while (node = walk(shallow)) {
        if (!isCaretContainerBlock(node)) {
          return node;
        }
      }
      return null;
    };
    var findNode$1 = function (node, direction, predicateFn, rootNode, shallow) {
      var walker = new DomTreeWalker(node, rootNode);
      var isCefOrCaretContainer = isContentEditableFalse$7(node) || isCaretContainerBlock(node);
      if (isBackwards(direction)) {
        if (isCefOrCaretContainer) {
          node = skipCaretContainers(walker.prev.bind(walker), true);
          if (predicateFn(node)) {
            return node;
          }
        }
        while (node = skipCaretContainers(walker.prev.bind(walker), shallow)) {
          if (predicateFn(node)) {
            return node;
          }
        }
      }
      if (isForwards(direction)) {
        if (isCefOrCaretContainer) {
          node = skipCaretContainers(walker.next.bind(walker), true);
          if (predicateFn(node)) {
            return node;
          }
        }
        while (node = skipCaretContainers(walker.next.bind(walker), shallow)) {
          if (predicateFn(node)) {
            return node;
          }
        }
      }
      return null;
    };
    var getParentBlock$2 = function (node, rootNode) {
      while (node && node !== rootNode) {
        if (isBlockLike(node)) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };
    var isInSameBlock = function (caretPosition1, caretPosition2, rootNode) {
      return getParentBlock$2(caretPosition1.container(), rootNode) === getParentBlock$2(caretPosition2.container(), rootNode);
    };
    var getChildNodeAtRelativeOffset = function (relativeOffset, caretPosition) {
      if (!caretPosition) {
        return null;
      }
      var container = caretPosition.container();
      var offset = caretPosition.offset();
      if (!isElement$1(container)) {
        return null;
      }
      return container.childNodes[offset + relativeOffset];
    };
    var beforeAfter = function (before, node) {
      var range = node.ownerDocument.createRange();
      if (before) {
        range.setStartBefore(node);
        range.setEndBefore(node);
      } else {
        range.setStartAfter(node);
        range.setEndAfter(node);
      }
      return range;
    };
    var isNodesInSameBlock = function (root, node1, node2) {
      return getParentBlock$2(node1, root) === getParentBlock$2(node2, root);
    };
    var lean = function (left, root, node) {
      var siblingName = left ? 'previousSibling' : 'nextSibling';
      while (node && node !== root) {
        var sibling = node[siblingName];
        if (isCaretContainer(sibling)) {
          sibling = sibling[siblingName];
        }
        if (isContentEditableFalse$7(sibling) || isMedia(sibling)) {
          if (isNodesInSameBlock(root, sibling, node)) {
            return sibling;
          }
          break;
        }
        if (isCaretCandidate$1(sibling)) {
          break;
        }
        node = node.parentNode;
      }
      return null;
    };
    var before$2 = curry(beforeAfter, true);
    var after$2 = curry(beforeAfter, false);
    var normalizeRange = function (direction, root, range) {
      var node;
      var leanLeft = curry(lean, true, root);
      var leanRight = curry(lean, false, root);
      var container = range.startContainer;
      var offset = range.startOffset;
      if (isCaretContainerBlock$1(container)) {
        if (!isElement$1(container)) {
          container = container.parentNode;
        }
        var location_1 = container.getAttribute('data-mce-caret');
        if (location_1 === 'before') {
          node = container.nextSibling;
          if (isFakeCaretTarget(node)) {
            return before$2(node);
          }
        }
        if (location_1 === 'after') {
          node = container.previousSibling;
          if (isFakeCaretTarget(node)) {
            return after$2(node);
          }
        }
      }
      if (!range.collapsed) {
        return range;
      }
      if (isText$7(container)) {
        if (isCaretContainer(container)) {
          if (direction === 1) {
            node = leanRight(container);
            if (node) {
              return before$2(node);
            }
            node = leanLeft(container);
            if (node) {
              return after$2(node);
            }
          }
          if (direction === -1) {
            node = leanLeft(container);
            if (node) {
              return after$2(node);
            }
            node = leanRight(container);
            if (node) {
              return before$2(node);
            }
          }
          return range;
        }
        if (endsWithCaretContainer$1(container) && offset >= container.data.length - 1) {
          if (direction === 1) {
            node = leanRight(container);
            if (node) {
              return before$2(node);
            }
          }
          return range;
        }
        if (startsWithCaretContainer$1(container) && offset <= 1) {
          if (direction === -1) {
            node = leanLeft(container);
            if (node) {
              return after$2(node);
            }
          }
          return range;
        }
        if (offset === container.data.length) {
          node = leanRight(container);
          if (node) {
            return before$2(node);
          }
          return range;
        }
        if (offset === 0) {
          node = leanLeft(container);
          if (node) {
            return after$2(node);
          }
          return range;
        }
      }
      return range;
    };
    var getRelativeCefElm = function (forward, caretPosition) {
      return Optional.from(getChildNodeAtRelativeOffset(forward ? 0 : -1, caretPosition)).filter(isContentEditableFalse$7);
    };
    var getNormalizedRangeEndPoint = function (direction, root, range) {
      var normalizedRange = normalizeRange(direction, root, range);
      if (direction === -1) {
        return CaretPosition.fromRangeStart(normalizedRange);
      }
      return CaretPosition.fromRangeEnd(normalizedRange);
    };
    var getElementFromPosition = function (pos) {
      return Optional.from(pos.getNode()).map(SugarElement.fromDom);
    };
    var getElementFromPrevPosition = function (pos) {
      return Optional.from(pos.getNode(true)).map(SugarElement.fromDom);
    };
    var getVisualCaretPosition = function (walkFn, caretPosition) {
      while (caretPosition = walkFn(caretPosition)) {
        if (caretPosition.isVisible()) {
          return caretPosition;
        }
      }
      return caretPosition;
    };
    var isMoveInsideSameBlock = function (from, to) {
      var inSameBlock = isInSameBlock(from, to);
      if (!inSameBlock && isBr$5(from.getNode())) {
        return true;
      }
      return inSameBlock;
    };

    var HDirection;
    (function (HDirection) {
      HDirection[HDirection['Backwards'] = -1] = 'Backwards';
      HDirection[HDirection['Forwards'] = 1] = 'Forwards';
    }(HDirection || (HDirection = {})));
    var isContentEditableFalse$6 = isContentEditableFalse$b;
    var isText$1 = isText$7;
    var isElement = isElement$5;
    var isBr$1 = isBr$5;
    var isCaretCandidate = isCaretCandidate$3;
    var isAtomic = isAtomic$1;
    var isEditableCaretCandidate = isEditableCaretCandidate$1;
    var getParents$3 = function (node, root) {
      var parents = [];
      while (node && node !== root) {
        parents.push(node);
        node = node.parentNode;
      }
      return parents;
    };
    var nodeAtIndex = function (container, offset) {
      if (container.hasChildNodes() && offset < container.childNodes.length) {
        return container.childNodes[offset];
      }
      return null;
    };
    var getCaretCandidatePosition = function (direction, node) {
      if (isForwards(direction)) {
        if (isCaretCandidate(node.previousSibling) && !isText$1(node.previousSibling)) {
          return CaretPosition.before(node);
        }
        if (isText$1(node)) {
          return CaretPosition(node, 0);
        }
      }
      if (isBackwards(direction)) {
        if (isCaretCandidate(node.nextSibling) && !isText$1(node.nextSibling)) {
          return CaretPosition.after(node);
        }
        if (isText$1(node)) {
          return CaretPosition(node, node.data.length);
        }
      }
      if (isBackwards(direction)) {
        if (isBr$1(node)) {
          return CaretPosition.before(node);
        }
        return CaretPosition.after(node);
      }
      return CaretPosition.before(node);
    };
    var moveForwardFromBr = function (root, nextNode) {
      var nextSibling = nextNode.nextSibling;
      if (nextSibling && isCaretCandidate(nextSibling)) {
        if (isText$1(nextSibling)) {
          return CaretPosition(nextSibling, 0);
        } else {
          return CaretPosition.before(nextSibling);
        }
      } else {
        return findCaretPosition$1(HDirection.Forwards, CaretPosition.after(nextNode), root);
      }
    };
    var findCaretPosition$1 = function (direction, startPos, root) {
      var node;
      var nextNode;
      var innerNode;
      var caretPosition;
      if (!isElement(root) || !startPos) {
        return null;
      }
      if (startPos.isEqual(CaretPosition.after(root)) && root.lastChild) {
        caretPosition = CaretPosition.after(root.lastChild);
        if (isBackwards(direction) && isCaretCandidate(root.lastChild) && isElement(root.lastChild)) {
          return isBr$1(root.lastChild) ? CaretPosition.before(root.lastChild) : caretPosition;
        }
      } else {
        caretPosition = startPos;
      }
      var container = caretPosition.container();
      var offset = caretPosition.offset();
      if (isText$1(container)) {
        if (isBackwards(direction) && offset > 0) {
          return CaretPosition(container, --offset);
        }
        if (isForwards(direction) && offset < container.length) {
          return CaretPosition(container, ++offset);
        }
        node = container;
      } else {
        if (isBackwards(direction) && offset > 0) {
          nextNode = nodeAtIndex(container, offset - 1);
          if (isCaretCandidate(nextNode)) {
            if (!isAtomic(nextNode)) {
              innerNode = findNode$1(nextNode, direction, isEditableCaretCandidate, nextNode);
              if (innerNode) {
                if (isText$1(innerNode)) {
                  return CaretPosition(innerNode, innerNode.data.length);
                }
                return CaretPosition.after(innerNode);
              }
            }
            if (isText$1(nextNode)) {
              return CaretPosition(nextNode, nextNode.data.length);
            }
            return CaretPosition.before(nextNode);
          }
        }
        if (isForwards(direction) && offset < container.childNodes.length) {
          nextNode = nodeAtIndex(container, offset);
          if (isCaretCandidate(nextNode)) {
            if (isBr$1(nextNode)) {
              return moveForwardFromBr(root, nextNode);
            }
            if (!isAtomic(nextNode)) {
              innerNode = findNode$1(nextNode, direction, isEditableCaretCandidate, nextNode);
              if (innerNode) {
                if (isText$1(innerNode)) {
                  return CaretPosition(innerNode, 0);
                }
                return CaretPosition.before(innerNode);
              }
            }
            if (isText$1(nextNode)) {
              return CaretPosition(nextNode, 0);
            }
            return CaretPosition.after(nextNode);
          }
        }
        node = nextNode ? nextNode : caretPosition.getNode();
      }
      if (isForwards(direction) && caretPosition.isAtEnd() || isBackwards(direction) && caretPosition.isAtStart()) {
        node = findNode$1(node, direction, always, root, true);
        if (isEditableCaretCandidate(node, root)) {
          return getCaretCandidatePosition(direction, node);
        }
      }
      nextNode = findNode$1(node, direction, isEditableCaretCandidate, root);
      var rootContentEditableFalseElm = last$1(filter$4(getParents$3(container, root), isContentEditableFalse$6));
      if (rootContentEditableFalseElm && (!nextNode || !rootContentEditableFalseElm.contains(nextNode))) {
        if (isForwards(direction)) {
          caretPosition = CaretPosition.after(rootContentEditableFalseElm);
        } else {
          caretPosition = CaretPosition.before(rootContentEditableFalseElm);
        }
        return caretPosition;
      }
      if (nextNode) {
        return getCaretCandidatePosition(direction, nextNode);
      }
      return null;
    };
    var CaretWalker = function (root) {
      return {
        next: function (caretPosition) {
          return findCaretPosition$1(HDirection.Forwards, caretPosition, root);
        },
        prev: function (caretPosition) {
          return findCaretPosition$1(HDirection.Backwards, caretPosition, root);
        }
      };
    };

    var walkToPositionIn = function (forward, root, start) {
      var position = forward ? CaretPosition.before(start) : CaretPosition.after(start);
      return fromPosition(forward, root, position);
    };
    var afterElement = function (node) {
      return isBr$5(node) ? CaretPosition.before(node) : CaretPosition.after(node);
    };
    var isBeforeOrStart = function (position) {
      if (CaretPosition.isTextPosition(position)) {
        return position.offset() === 0;
      } else {
        return isCaretCandidate$3(position.getNode());
      }
    };
    var isAfterOrEnd = function (position) {
      if (CaretPosition.isTextPosition(position)) {
        var container = position.container();
        return position.offset() === container.data.length;
      } else {
        return isCaretCandidate$3(position.getNode(true));
      }
    };
    var isBeforeAfterSameElement = function (from, to) {
      return !CaretPosition.isTextPosition(from) && !CaretPosition.isTextPosition(to) && from.getNode() === to.getNode(true);
    };
    var isAtBr = function (position) {
      return !CaretPosition.isTextPosition(position) && isBr$5(position.getNode());
    };
    var shouldSkipPosition = function (forward, from, to) {
      if (forward) {
        return !isBeforeAfterSameElement(from, to) && !isAtBr(from) && isAfterOrEnd(from) && isBeforeOrStart(to);
      } else {
        return !isBeforeAfterSameElement(to, from) && isBeforeOrStart(from) && isAfterOrEnd(to);
      }
    };
    var fromPosition = function (forward, root, pos) {
      var walker = CaretWalker(root);
      return Optional.from(forward ? walker.next(pos) : walker.prev(pos));
    };
    var navigate = function (forward, root, from) {
      return fromPosition(forward, root, from).bind(function (to) {
        if (isInSameBlock(from, to, root) && shouldSkipPosition(forward, from, to)) {
          return fromPosition(forward, root, to);
        } else {
          return Optional.some(to);
        }
      });
    };
    var navigateIgnore = function (forward, root, from, ignoreFilter) {
      return navigate(forward, root, from).bind(function (pos) {
        return ignoreFilter(pos) ? navigateIgnore(forward, root, pos, ignoreFilter) : Optional.some(pos);
      });
    };
    var positionIn = function (forward, element) {
      var startNode = forward ? element.firstChild : element.lastChild;
      if (isText$7(startNode)) {
        return Optional.some(CaretPosition(startNode, forward ? 0 : startNode.data.length));
      } else if (startNode) {
        if (isCaretCandidate$3(startNode)) {
          return Optional.some(forward ? CaretPosition.before(startNode) : afterElement(startNode));
        } else {
          return walkToPositionIn(forward, element, startNode);
        }
      } else {
        return Optional.none();
      }
    };
    var nextPosition = curry(fromPosition, true);
    var prevPosition = curry(fromPosition, false);
    var firstPositionIn = curry(positionIn, true);
    var lastPositionIn = curry(positionIn, false);

    var CARET_ID$1 = '_mce_caret';
    var isCaretNode = function (node) {
      return isElement$5(node) && node.id === CARET_ID$1;
    };
    var getParentCaretContainer = function (body, node) {
      while (node && node !== body) {
        if (node.id === CARET_ID$1) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };

    var isStringPathBookmark = function (bookmark) {
      return isString$1(bookmark.start);
    };
    var isRangeBookmark = function (bookmark) {
      return has$2(bookmark, 'rng');
    };
    var isIdBookmark = function (bookmark) {
      return has$2(bookmark, 'id');
    };
    var isIndexBookmark = function (bookmark) {
      return has$2(bookmark, 'name');
    };
    var isPathBookmark = function (bookmark) {
      return Tools.isArray(bookmark.start);
    };

    var addBogus = function (dom, node) {
      if (isElement$5(node) && dom.isBlock(node) && !node.innerHTML && !Env.ie) {
        node.innerHTML = '<br data-mce-bogus="1" />';
      }
      return node;
    };
    var resolveCaretPositionBookmark = function (dom, bookmark) {
      var pos;
      var rng = dom.createRng();
      pos = resolve$2(dom.getRoot(), bookmark.start);
      rng.setStart(pos.container(), pos.offset());
      pos = resolve$2(dom.getRoot(), bookmark.end);
      rng.setEnd(pos.container(), pos.offset());
      return rng;
    };
    var insertZwsp = function (node, rng) {
      var textNode = node.ownerDocument.createTextNode(ZWSP$1);
      node.appendChild(textNode);
      rng.setStart(textNode, 0);
      rng.setEnd(textNode, 0);
    };
    var isEmpty$1 = function (node) {
      return node.hasChildNodes() === false;
    };
    var tryFindRangePosition = function (node, rng) {
      return lastPositionIn(node).fold(never, function (pos) {
        rng.setStart(pos.container(), pos.offset());
        rng.setEnd(pos.container(), pos.offset());
        return true;
      });
    };
    var padEmptyCaretContainer = function (root, node, rng) {
      if (isEmpty$1(node) && getParentCaretContainer(root, node)) {
        insertZwsp(node, rng);
        return true;
      } else {
        return false;
      }
    };
    var setEndPoint = function (dom, start, bookmark, rng) {
      var point = bookmark[start ? 'start' : 'end'];
      var i, node, offset, children;
      var root = dom.getRoot();
      if (point) {
        offset = point[0];
        for (node = root, i = point.length - 1; i >= 1; i--) {
          children = node.childNodes;
          if (padEmptyCaretContainer(root, node, rng)) {
            return true;
          }
          if (point[i] > children.length - 1) {
            if (padEmptyCaretContainer(root, node, rng)) {
              return true;
            }
            return tryFindRangePosition(node, rng);
          }
          node = children[point[i]];
        }
        if (node.nodeType === 3) {
          offset = Math.min(point[0], node.nodeValue.length);
        }
        if (node.nodeType === 1) {
          offset = Math.min(point[0], node.childNodes.length);
        }
        if (start) {
          rng.setStart(node, offset);
        } else {
          rng.setEnd(node, offset);
        }
      }
      return true;
    };
    var isValidTextNode = function (node) {
      return isText$7(node) && node.data.length > 0;
    };
    var restoreEndPoint = function (dom, suffix, bookmark) {
      var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev;
      var keep = bookmark.keep;
      var container, offset;
      if (marker) {
        node = marker.parentNode;
        if (suffix === 'start') {
          if (!keep) {
            idx = dom.nodeIndex(marker);
          } else {
            if (marker.hasChildNodes()) {
              node = marker.firstChild;
              idx = 1;
            } else if (isValidTextNode(marker.nextSibling)) {
              node = marker.nextSibling;
              idx = 0;
            } else if (isValidTextNode(marker.previousSibling)) {
              node = marker.previousSibling;
              idx = marker.previousSibling.data.length;
            } else {
              node = marker.parentNode;
              idx = dom.nodeIndex(marker) + 1;
            }
          }
          container = node;
          offset = idx;
        } else {
          if (!keep) {
            idx = dom.nodeIndex(marker);
          } else {
            if (marker.hasChildNodes()) {
              node = marker.firstChild;
              idx = 1;
            } else if (isValidTextNode(marker.previousSibling)) {
              node = marker.previousSibling;
              idx = marker.previousSibling.data.length;
            } else {
              node = marker.parentNode;
              idx = dom.nodeIndex(marker);
            }
          }
          container = node;
          offset = idx;
        }
        if (!keep) {
          prev = marker.previousSibling;
          next = marker.nextSibling;
          Tools.each(Tools.grep(marker.childNodes), function (node) {
            if (isText$7(node)) {
              node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
            }
          });
          while (marker = dom.get(bookmark.id + '_' + suffix)) {
            dom.remove(marker, true);
          }
          if (prev && next && prev.nodeType === next.nodeType && isText$7(prev) && !Env.opera) {
            idx = prev.nodeValue.length;
            prev.appendData(next.nodeValue);
            dom.remove(next);
            container = prev;
            offset = idx;
          }
        }
        return Optional.some(CaretPosition(container, offset));
      } else {
        return Optional.none();
      }
    };
    var resolvePaths = function (dom, bookmark) {
      var rng = dom.createRng();
      if (setEndPoint(dom, true, bookmark, rng) && setEndPoint(dom, false, bookmark, rng)) {
        return Optional.some(rng);
      } else {
        return Optional.none();
      }
    };
    var resolveId = function (dom, bookmark) {
      var startPos = restoreEndPoint(dom, 'start', bookmark);
      var endPos = restoreEndPoint(dom, 'end', bookmark);
      return lift2(startPos, endPos.or(startPos), function (spos, epos) {
        var rng = dom.createRng();
        rng.setStart(addBogus(dom, spos.container()), spos.offset());
        rng.setEnd(addBogus(dom, epos.container()), epos.offset());
        return rng;
      });
    };
    var resolveIndex = function (dom, bookmark) {
      return Optional.from(dom.select(bookmark.name)[bookmark.index]).map(function (elm) {
        var rng = dom.createRng();
        rng.selectNode(elm);
        return rng;
      });
    };
    var resolve$1 = function (selection, bookmark) {
      var dom = selection.dom;
      if (bookmark) {
        if (isPathBookmark(bookmark)) {
          return resolvePaths(dom, bookmark);
        } else if (isStringPathBookmark(bookmark)) {
          return Optional.some(resolveCaretPositionBookmark(dom, bookmark));
        } else if (isIdBookmark(bookmark)) {
          return resolveId(dom, bookmark);
        } else if (isIndexBookmark(bookmark)) {
          return resolveIndex(dom, bookmark);
        } else if (isRangeBookmark(bookmark)) {
          return Optional.some(bookmark.rng);
        }
      }
      return Optional.none();
    };

    var getBookmark$1 = function (selection, type, normalized) {
      return getBookmark$2(selection, type, normalized);
    };
    var moveToBookmark = function (selection, bookmark) {
      resolve$1(selection, bookmark).each(function (rng) {
        selection.setRng(rng);
      });
    };
    var isBookmarkNode$1 = function (node) {
      return isElement$5(node) && node.tagName === 'SPAN' && node.getAttribute('data-mce-type') === 'bookmark';
    };

    var is = function (expected) {
      return function (actual) {
        return expected === actual;
      };
    };
    var isNbsp = is(nbsp);
    var isWhiteSpace = function (chr) {
      return chr !== '' && ' \f\n\r\t\x0B'.indexOf(chr) !== -1;
    };
    var isContent = function (chr) {
      return !isWhiteSpace(chr) && !isNbsp(chr);
    };

    var isNode = function (node) {
      return !!node.nodeType;
    };
    var isInlineBlock = function (node) {
      return node && /^(IMG)$/.test(node.nodeName);
    };
    var moveStart = function (dom, selection, rng) {
      var offset = rng.startOffset;
      var container = rng.startContainer;
      if (container === rng.endContainer) {
        if (isInlineBlock(container.childNodes[offset])) {
          return;
        }
      }
      if (isElement$5(container)) {
        var nodes = container.childNodes;
        var walker = void 0;
        if (offset < nodes.length) {
          container = nodes[offset];
          walker = new DomTreeWalker(container, dom.getParent(container, dom.isBlock));
        } else {
          container = nodes[nodes.length - 1];
          walker = new DomTreeWalker(container, dom.getParent(container, dom.isBlock));
          walker.next(true);
        }
        for (var node = walker.current(); node; node = walker.next()) {
          if (isText$7(node) && !isWhiteSpaceNode$1(node)) {
            rng.setStart(node, 0);
            selection.setRng(rng);
            return;
          }
        }
      }
    };
    var getNonWhiteSpaceSibling = function (node, next, inc) {
      if (node) {
        var nextName = next ? 'nextSibling' : 'previousSibling';
        for (node = inc ? node : node[nextName]; node; node = node[nextName]) {
          if (isElement$5(node) || !isWhiteSpaceNode$1(node)) {
            return node;
          }
        }
      }
    };
    var isTextBlock$1 = function (editor, name) {
      if (isNode(name)) {
        name = name.nodeName;
      }
      return !!editor.schema.getTextBlockElements()[name.toLowerCase()];
    };
    var isValid = function (ed, parent, child) {
      return ed.schema.isValidChild(parent, child);
    };
    var isWhiteSpaceNode$1 = function (node, allowSpaces) {
      if (allowSpaces === void 0) {
        allowSpaces = false;
      }
      if (isNonNullable(node) && isText$7(node)) {
        var data = allowSpaces ? node.data.replace(/ /g, '\xA0') : node.data;
        return isWhitespaceText(data);
      } else {
        return false;
      }
    };
    var isEmptyTextNode$1 = function (node) {
      return isNonNullable(node) && isText$7(node) && node.length === 0;
    };
    var replaceVars = function (value, vars) {
      if (isFunction(value)) {
        value = value(vars);
      } else if (isNonNullable(vars)) {
        value = value.replace(/%(\w+)/g, function (str, name) {
          return vars[name] || str;
        });
      }
      return value;
    };
    var isEq$5 = function (str1, str2) {
      str1 = str1 || '';
      str2 = str2 || '';
      str1 = '' + (str1.nodeName || str1);
      str2 = '' + (str2.nodeName || str2);
      return str1.toLowerCase() === str2.toLowerCase();
    };
    var normalizeStyleValue = function (dom, value, name) {
      if (name === 'color' || name === 'backgroundColor') {
        value = dom.toHex(value);
      }
      if (name === 'fontWeight' && value === 700) {
        value = 'bold';
      }
      if (name === 'fontFamily') {
        value = value.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
      }
      return '' + value;
    };
    var getStyle = function (dom, node, name) {
      return normalizeStyleValue(dom, dom.getStyle(node, name), name);
    };
    var getTextDecoration = function (dom, node) {
      var decoration;
      dom.getParent(node, function (n) {
        decoration = dom.getStyle(n, 'text-decoration');
        return decoration && decoration !== 'none';
      });
      return decoration;
    };
    var getParents$2 = function (dom, node, selector) {
      return dom.getParents(node, selector, dom.getRoot());
    };
    var isVariableFormatName = function (editor, formatName) {
      var hasVariableValues = function (format) {
        var isVariableValue = function (val) {
          return val.length > 1 && val.charAt(0) === '%';
        };
        return exists([
          'styles',
          'attributes'
        ], function (key) {
          return get$9(format, key).exists(function (field) {
            var fieldValues = isArray$1(field) ? field : values(field);
            return exists(fieldValues, isVariableValue);
          });
        });
      };
      return exists(editor.formatter.get(formatName), hasVariableValues);
    };
    var areSimilarFormats = function (editor, formatName, otherFormatName) {
      var validKeys = [
        'inline',
        'block',
        'selector',
        'attributes',
        'styles',
        'classes'
      ];
      var filterObj = function (format) {
        return filter$3(format, function (_, key) {
          return exists(validKeys, function (validKey) {
            return validKey === key;
          });
        });
      };
      return exists(editor.formatter.get(formatName), function (fmt1) {
        var filteredFmt1 = filterObj(fmt1);
        return exists(editor.formatter.get(otherFormatName), function (fmt2) {
          var filteredFmt2 = filterObj(fmt2);
          return equal$1(filteredFmt1, filteredFmt2);
        });
      });
    };
    var isBlockFormat = function (format) {
      return hasNonNullableKey(format, 'block');
    };
    var isSelectorFormat = function (format) {
      return hasNonNullableKey(format, 'selector');
    };
    var isInlineFormat = function (format) {
      return hasNonNullableKey(format, 'inline');
    };
    var isMixedFormat = function (format) {
      return isSelectorFormat(format) && isInlineFormat(format) && is$1(get$9(format, 'mixed'), true);
    };
    var shouldExpandToSelector = function (format) {
      return isSelectorFormat(format) && format.expand !== false && !isInlineFormat(format);
    };

    var isBookmarkNode = isBookmarkNode$1;
    var getParents$1 = getParents$2;
    var isWhiteSpaceNode = isWhiteSpaceNode$1;
    var isTextBlock = isTextBlock$1;
    var isBogusBr = function (node) {
      return isBr$5(node) && node.getAttribute('data-mce-bogus') && !node.nextSibling;
    };
    var findParentContentEditable = function (dom, node) {
      var parent = node;
      while (parent) {
        if (isElement$5(parent) && dom.getContentEditable(parent)) {
          return dom.getContentEditable(parent) === 'false' ? parent : node;
        }
        parent = parent.parentNode;
      }
      return node;
    };
    var walkText = function (start, node, offset, predicate) {
      var str = node.data;
      for (var i = offset; start ? i >= 0 : i < str.length; start ? i-- : i++) {
        if (predicate(str.charAt(i))) {
          return start ? i + 1 : i;
        }
      }
      return -1;
    };
    var findSpace = function (start, node, offset) {
      return walkText(start, node, offset, function (c) {
        return isNbsp(c) || isWhiteSpace(c);
      });
    };
    var findContent = function (start, node, offset) {
      return walkText(start, node, offset, isContent);
    };
    var findWordEndPoint = function (dom, body, container, offset, start, includeTrailingSpaces) {
      var lastTextNode;
      var rootNode = dom.getParent(container, dom.isBlock) || body;
      var walk = function (container, offset, pred) {
        var textSeeker = TextSeeker(dom);
        var walker = start ? textSeeker.backwards : textSeeker.forwards;
        return Optional.from(walker(container, offset, function (text, textOffset) {
          if (isBookmarkNode(text.parentNode)) {
            return -1;
          } else {
            lastTextNode = text;
            return pred(start, text, textOffset);
          }
        }, rootNode));
      };
      var spaceResult = walk(container, offset, findSpace);
      return spaceResult.bind(function (result) {
        return includeTrailingSpaces ? walk(result.container, result.offset + (start ? -1 : 0), findContent) : Optional.some(result);
      }).orThunk(function () {
        return lastTextNode ? Optional.some({
          container: lastTextNode,
          offset: start ? 0 : lastTextNode.length
        }) : Optional.none();
      });
    };
    var findSelectorEndPoint = function (dom, formatList, rng, container, siblingName) {
      if (isText$7(container) && isEmpty$3(container.data) && container[siblingName]) {
        container = container[siblingName];
      }
      var parents = getParents$1(dom, container);
      for (var i = 0; i < parents.length; i++) {
        for (var y = 0; y < formatList.length; y++) {
          var curFormat = formatList[y];
          if (isNonNullable(curFormat.collapsed) && curFormat.collapsed !== rng.collapsed) {
            continue;
          }
          if (isSelectorFormat(curFormat) && dom.is(parents[i], curFormat.selector)) {
            return parents[i];
          }
        }
      }
      return container;
    };
    var findBlockEndPoint = function (editor, formatList, container, siblingName) {
      var node = container;
      var dom = editor.dom;
      var root = dom.getRoot();
      var format = formatList[0];
      if (isBlockFormat(format) && !format.wrapper) {
        node = dom.getParent(container, format.block, root);
      }
      if (!node) {
        var scopeRoot = dom.getParent(container, 'LI,TD,TH');
        node = dom.getParent(isText$7(container) ? container.parentNode : container, function (node) {
          return node !== root && isTextBlock(editor, node);
        }, scopeRoot);
      }
      if (node && isBlockFormat(format) && format.wrapper) {
        node = getParents$1(dom, node, 'ul,ol').reverse()[0] || node;
      }
      if (!node) {
        node = container;
        while (node[siblingName] && !dom.isBlock(node[siblingName])) {
          node = node[siblingName];
          if (isEq$5(node, 'br')) {
            break;
          }
        }
      }
      return node || container;
    };
    var isAtBlockBoundary$1 = function (dom, root, container, siblingName) {
      var parent = container.parentNode;
      if (isNonNullable(container[siblingName])) {
        return false;
      } else if (parent === root || isNullable(parent) || dom.isBlock(parent)) {
        return true;
      } else {
        return isAtBlockBoundary$1(dom, root, parent, siblingName);
      }
    };
    var findParentContainer = function (dom, formatList, container, offset, start) {
      var parent = container;
      var siblingName = start ? 'previousSibling' : 'nextSibling';
      var root = dom.getRoot();
      if (isText$7(container) && !isWhiteSpaceNode(container)) {
        if (start ? offset > 0 : offset < container.data.length) {
          return container;
        }
      }
      while (true) {
        if (!formatList[0].block_expand && dom.isBlock(parent)) {
          return parent;
        }
        for (var sibling = parent[siblingName]; sibling; sibling = sibling[siblingName]) {
          var allowSpaces = isText$7(sibling) && !isAtBlockBoundary$1(dom, root, sibling, siblingName);
          if (!isBookmarkNode(sibling) && !isBogusBr(sibling) && !isWhiteSpaceNode(sibling, allowSpaces)) {
            return parent;
          }
        }
        if (parent === root || parent.parentNode === root) {
          container = parent;
          break;
        }
        parent = parent.parentNode;
      }
      return container;
    };
    var isSelfOrParentBookmark = function (container) {
      return isBookmarkNode(container.parentNode) || isBookmarkNode(container);
    };
    var expandRng = function (editor, rng, formatList, includeTrailingSpace) {
      if (includeTrailingSpace === void 0) {
        includeTrailingSpace = false;
      }
      var startContainer = rng.startContainer, startOffset = rng.startOffset, endContainer = rng.endContainer, endOffset = rng.endOffset;
      var dom = editor.dom;
      var format = formatList[0];
      if (isElement$5(startContainer) && startContainer.hasChildNodes()) {
        startContainer = getNode$1(startContainer, startOffset);
        if (isText$7(startContainer)) {
          startOffset = 0;
        }
      }
      if (isElement$5(endContainer) && endContainer.hasChildNodes()) {
        endContainer = getNode$1(endContainer, rng.collapsed ? endOffset : endOffset - 1);
        if (isText$7(endContainer)) {
          endOffset = endContainer.nodeValue.length;
        }
      }
      startContainer = findParentContentEditable(dom, startContainer);
      endContainer = findParentContentEditable(dom, endContainer);
      if (isSelfOrParentBookmark(startContainer)) {
        startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
        if (rng.collapsed) {
          startContainer = startContainer.previousSibling || startContainer;
        } else {
          startContainer = startContainer.nextSibling || startContainer;
        }
        if (isText$7(startContainer)) {
          startOffset = rng.collapsed ? startContainer.length : 0;
        }
      }
      if (isSelfOrParentBookmark(endContainer)) {
        endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
        if (rng.collapsed) {
          endContainer = endContainer.nextSibling || endContainer;
        } else {
          endContainer = endContainer.previousSibling || endContainer;
        }
        if (isText$7(endContainer)) {
          endOffset = rng.collapsed ? 0 : endContainer.length;
        }
      }
      if (rng.collapsed) {
        var startPoint = findWordEndPoint(dom, editor.getBody(), startContainer, startOffset, true, includeTrailingSpace);
        startPoint.each(function (_a) {
          var container = _a.container, offset = _a.offset;
          startContainer = container;
          startOffset = offset;
        });
        var endPoint = findWordEndPoint(dom, editor.getBody(), endContainer, endOffset, false, includeTrailingSpace);
        endPoint.each(function (_a) {
          var container = _a.container, offset = _a.offset;
          endContainer = container;
          endOffset = offset;
        });
      }
      if (isInlineFormat(format) || format.block_expand) {
        if (!isInlineFormat(format) || (!isText$7(startContainer) || startOffset === 0)) {
          startContainer = findParentContainer(dom, formatList, startContainer, startOffset, true);
        }
        if (!isInlineFormat(format) || (!isText$7(endContainer) || endOffset === endContainer.nodeValue.length)) {
          endContainer = findParentContainer(dom, formatList, endContainer, endOffset, false);
        }
      }
      if (shouldExpandToSelector(format)) {
        startContainer = findSelectorEndPoint(dom, formatList, rng, startContainer, 'previousSibling');
        endContainer = findSelectorEndPoint(dom, formatList, rng, endContainer, 'nextSibling');
      }
      if (isBlockFormat(format) || isSelectorFormat(format)) {
        startContainer = findBlockEndPoint(editor, formatList, startContainer, 'previousSibling');
        endContainer = findBlockEndPoint(editor, formatList, endContainer, 'nextSibling');
        if (isBlockFormat(format)) {
          if (!dom.isBlock(startContainer)) {
            startContainer = findParentContainer(dom, formatList, startContainer, startOffset, true);
          }
          if (!dom.isBlock(endContainer)) {
            endContainer = findParentContainer(dom, formatList, endContainer, endOffset, false);
          }
        }
      }
      if (isElement$5(startContainer)) {
        startOffset = dom.nodeIndex(startContainer);
        startContainer = startContainer.parentNode;
      }
      if (isElement$5(endContainer)) {
        endOffset = dom.nodeIndex(endContainer) + 1;
        endContainer = endContainer.parentNode;
      }
      return {
        startContainer: startContainer,
        startOffset: startOffset,
        endContainer: endContainer,
        endOffset: endOffset
      };
    };

    var walk$2 = function (dom, rng, callback) {
      var startOffset = rng.startOffset;
      var startContainer = getNode$1(rng.startContainer, startOffset);
      var endOffset = rng.endOffset;
      var endContainer = getNode$1(rng.endContainer, endOffset - 1);
      var exclude = function (nodes) {
        var firstNode = nodes[0];
        if (isText$7(firstNode) && firstNode === startContainer && startOffset >= firstNode.data.length) {
          nodes.splice(0, 1);
        }
        var lastNode = nodes[nodes.length - 1];
        if (endOffset === 0 && nodes.length > 0 && lastNode === endContainer && isText$7(lastNode)) {
          nodes.splice(nodes.length - 1, 1);
        }
        return nodes;
      };
      var collectSiblings = function (node, name, endNode) {
        var siblings = [];
        for (; node && node !== endNode; node = node[name]) {
          siblings.push(node);
        }
        return siblings;
      };
      var findEndPoint = function (node, root) {
        return dom.getParent(node, function (node) {
          return node.parentNode === root;
        }, root);
      };
      var walkBoundary = function (startNode, endNode, next) {
        var siblingName = next ? 'nextSibling' : 'previousSibling';
        for (var node = startNode, parent_1 = node.parentNode; node && node !== endNode; node = parent_1) {
          parent_1 = node.parentNode;
          var siblings_1 = collectSiblings(node === startNode ? node : node[siblingName], siblingName);
          if (siblings_1.length) {
            if (!next) {
              siblings_1.reverse();
            }
            callback(exclude(siblings_1));
          }
        }
      };
      if (startContainer === endContainer) {
        return callback(exclude([startContainer]));
      }
      var ancestor = dom.findCommonAncestor(startContainer, endContainer);
      if (dom.isChildOf(startContainer, endContainer)) {
        return walkBoundary(startContainer, ancestor, true);
      }
      if (dom.isChildOf(endContainer, startContainer)) {
        return walkBoundary(endContainer, ancestor);
      }
      var startPoint = findEndPoint(startContainer, ancestor) || startContainer;
      var endPoint = findEndPoint(endContainer, ancestor) || endContainer;
      walkBoundary(startContainer, startPoint, true);
      var siblings = collectSiblings(startPoint === startContainer ? startPoint : startPoint.nextSibling, 'nextSibling', endPoint === endContainer ? endPoint.nextSibling : endPoint);
      if (siblings.length) {
        callback(exclude(siblings));
      }
      walkBoundary(endContainer, endPoint);
    };

    var getRanges = function (selection) {
      var ranges = [];
      if (selection) {
        for (var i = 0; i < selection.rangeCount; i++) {
          ranges.push(selection.getRangeAt(i));
        }
      }
      return ranges;
    };
    var getSelectedNodes = function (ranges) {
      return bind(ranges, function (range) {
        var node = getSelectedNode(range);
        return node ? [SugarElement.fromDom(node)] : [];
      });
    };
    var hasMultipleRanges = function (selection) {
      return getRanges(selection).length > 1;
    };

    var getCellsFromRanges = function (ranges) {
      return filter$4(getSelectedNodes(ranges), isTableCell$4);
    };
    var getCellsFromElement = function (elm) {
      return descendants(elm, 'td[data-mce-selected],th[data-mce-selected]');
    };
    var getCellsFromElementOrRanges = function (ranges, element) {
      var selectedCells = getCellsFromElement(element);
      return selectedCells.length > 0 ? selectedCells : getCellsFromRanges(ranges);
    };
    var getCellsFromEditor = function (editor) {
      return getCellsFromElementOrRanges(getRanges(editor.selection.getSel()), SugarElement.fromDom(editor.getBody()));
    };
    var getClosestTable = function (cell, isRoot) {
      return ancestor$2(cell, 'table', isRoot);
    };

    var getStartNode = function (rng) {
      var sc = rng.startContainer, so = rng.startOffset;
      if (isText$7(sc)) {
        return so === 0 ? Optional.some(SugarElement.fromDom(sc)) : Optional.none();
      } else {
        return Optional.from(sc.childNodes[so]).map(SugarElement.fromDom);
      }
    };
    var getEndNode = function (rng) {
      var ec = rng.endContainer, eo = rng.endOffset;
      if (isText$7(ec)) {
        return eo === ec.data.length ? Optional.some(SugarElement.fromDom(ec)) : Optional.none();
      } else {
        return Optional.from(ec.childNodes[eo - 1]).map(SugarElement.fromDom);
      }
    };
    var getFirstChildren = function (node) {
      return firstChild(node).fold(constant([node]), function (child) {
        return [node].concat(getFirstChildren(child));
      });
    };
    var getLastChildren$1 = function (node) {
      return lastChild(node).fold(constant([node]), function (child) {
        if (name(child) === 'br') {
          return prevSibling(child).map(function (sibling) {
            return [node].concat(getLastChildren$1(sibling));
          }).getOr([]);
        } else {
          return [node].concat(getLastChildren$1(child));
        }
      });
    };
    var hasAllContentsSelected = function (elm, rng) {
      return lift2(getStartNode(rng), getEndNode(rng), function (startNode, endNode) {
        var start = find$3(getFirstChildren(elm), curry(eq, startNode));
        var end = find$3(getLastChildren$1(elm), curry(eq, endNode));
        return start.isSome() && end.isSome();
      }).getOr(false);
    };
    var moveEndPoint = function (dom, rng, node, start) {
      var root = node, walker = new DomTreeWalker(node, root);
      var moveCaretBeforeOnEnterElementsMap = filter$3(dom.schema.getMoveCaretBeforeOnEnterElements(), function (_, name) {
        return !contains$3([
          'td',
          'th',
          'table'
        ], name.toLowerCase());
      });
      do {
        if (isText$7(node) && Tools.trim(node.nodeValue).length !== 0) {
          if (start) {
            rng.setStart(node, 0);
          } else {
            rng.setEnd(node, node.nodeValue.length);
          }
          return;
        }
        if (moveCaretBeforeOnEnterElementsMap[node.nodeName]) {
          if (start) {
            rng.setStartBefore(node);
          } else {
            if (node.nodeName === 'BR') {
              rng.setEndBefore(node);
            } else {
              rng.setEndAfter(node);
            }
          }
          return;
        }
      } while (node = start ? walker.next() : walker.prev());
      if (root.nodeName === 'BODY') {
        if (start) {
          rng.setStart(root, 0);
        } else {
          rng.setEnd(root, root.childNodes.length);
        }
      }
    };
    var hasAnyRanges = function (editor) {
      var sel = editor.selection.getSel();
      return sel && sel.rangeCount > 0;
    };
    var runOnRanges = function (editor, executor) {
      var fakeSelectionNodes = getCellsFromEditor(editor);
      if (fakeSelectionNodes.length > 0) {
        each$k(fakeSelectionNodes, function (elem) {
          var node = elem.dom;
          var fakeNodeRng = editor.dom.createRng();
          fakeNodeRng.setStartBefore(node);
          fakeNodeRng.setEndAfter(node);
          executor(fakeNodeRng, true);
        });
      } else {
        executor(editor.selection.getRng(), false);
      }
    };
    var preserve = function (selection, fillBookmark, executor) {
      var bookmark = getPersistentBookmark(selection, fillBookmark);
      executor(bookmark);
      selection.moveToBookmark(bookmark);
    };

    var NodeValue = function (is, name) {
      var get = function (element) {
        if (!is(element)) {
          throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
        }
        return getOption(element).getOr('');
      };
      var getOption = function (element) {
        return is(element) ? Optional.from(element.dom.nodeValue) : Optional.none();
      };
      var set = function (element, value) {
        if (!is(element)) {
          throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
        }
        element.dom.nodeValue = value;
      };
      return {
        get: get,
        getOption: getOption,
        set: set
      };
    };

    var api$1 = NodeValue(isText$8, 'text');
    var get$2 = function (element) {
      return api$1.get(element);
    };

    var isZeroWidth = function (elem) {
      return isText$8(elem) && get$2(elem) === ZWSP$1;
    };
    var context = function (editor, elem, wrapName, nodeName) {
      return parent(elem).fold(function () {
        return 'skipping';
      }, function (parent) {
        if (nodeName === 'br' || isZeroWidth(elem)) {
          return 'valid';
        } else if (isAnnotation(elem)) {
          return 'existing';
        } else if (isCaretNode(elem.dom)) {
          return 'caret';
        } else if (!isValid(editor, wrapName, nodeName) || !isValid(editor, name(parent), wrapName)) {
          return 'invalid-child';
        } else {
          return 'valid';
        }
      });
    };

    var applyWordGrab = function (editor, rng) {
      var r = expandRng(editor, rng, [{ inline: 'span' }]);
      rng.setStart(r.startContainer, r.startOffset);
      rng.setEnd(r.endContainer, r.endOffset);
      editor.selection.setRng(rng);
    };
    var makeAnnotation = function (eDoc, _a, annotationName, decorate) {
      var _b = _a.uid, uid = _b === void 0 ? generate('mce-annotation') : _b, data = __rest(_a, ['uid']);
      var master = SugarElement.fromTag('span', eDoc);
      add$1(master, annotation());
      set$1(master, '' + dataAnnotationId(), uid);
      set$1(master, '' + dataAnnotation(), annotationName);
      var _c = decorate(uid, data), _d = _c.attributes, attributes = _d === void 0 ? {} : _d, _e = _c.classes, classes = _e === void 0 ? [] : _e;
      setAll$1(master, attributes);
      add(master, classes);
      return master;
    };
    var annotate = function (editor, rng, annotationName, decorate, data) {
      var newWrappers = [];
      var master = makeAnnotation(editor.getDoc(), data, annotationName, decorate);
      var wrapper = value();
      var finishWrapper = function () {
        wrapper.clear();
      };
      var getOrOpenWrapper = function () {
        return wrapper.get().getOrThunk(function () {
          var nu = shallow(master);
          newWrappers.push(nu);
          wrapper.set(nu);
          return nu;
        });
      };
      var processElements = function (elems) {
        each$k(elems, processElement);
      };
      var processElement = function (elem) {
        var ctx = context(editor, elem, 'span', name(elem));
        switch (ctx) {
        case 'invalid-child': {
            finishWrapper();
            var children$1 = children(elem);
            processElements(children$1);
            finishWrapper();
            break;
          }
        case 'valid': {
            var w = getOrOpenWrapper();
            wrap$3(elem, w);
            break;
          }
        }
      };
      var processNodes = function (nodes) {
        var elems = map$3(nodes, SugarElement.fromDom);
        processElements(elems);
      };
      walk$2(editor.dom, rng, function (nodes) {
        finishWrapper();
        processNodes(nodes);
      });
      return newWrappers;
    };
    var annotateWithBookmark = function (editor, name, settings, data) {
      editor.undoManager.transact(function () {
        var selection = editor.selection;
        var initialRng = selection.getRng();
        var hasFakeSelection = getCellsFromEditor(editor).length > 0;
        if (initialRng.collapsed && !hasFakeSelection) {
          applyWordGrab(editor, initialRng);
        }
        if (selection.getRng().collapsed && !hasFakeSelection) {
          var wrapper = makeAnnotation(editor.getDoc(), data, name, settings.decorate);
          set(wrapper, nbsp);
          selection.getRng().insertNode(wrapper.dom);
          selection.select(wrapper.dom);
        } else {
          preserve(selection, false, function () {
            runOnRanges(editor, function (selectionRng) {
              annotate(editor, selectionRng, name, settings.decorate, data);
            });
          });
        }
      });
    };

    var Annotator = function (editor) {
      var registry = create$7();
      setup$m(editor, registry);
      var changes = setup$n(editor);
      return {
        register: function (name, settings) {
          registry.register(name, settings);
        },
        annotate: function (name, data) {
          registry.lookup(name).each(function (settings) {
            annotateWithBookmark(editor, name, settings, data);
          });
        },
        annotationChanged: function (name, callback) {
          changes.addListener(name, callback);
        },
        remove: function (name) {
          identify(editor, Optional.some(name)).each(function (_a) {
            var elements = _a.elements;
            each$k(elements, unwrap);
          });
        },
        getAll: function (name) {
          var directory = findAll(editor, name);
          return map$2(directory, function (elems) {
            return map$3(elems, function (elem) {
              return elem.dom;
            });
          });
        }
      };
    };

    var BookmarkManager = function (selection) {
      return {
        getBookmark: curry(getBookmark$1, selection),
        moveToBookmark: curry(moveToBookmark, selection)
      };
    };
    BookmarkManager.isBookmarkNode = isBookmarkNode$1;

    var getContentEditableRoot$1 = function (root, node) {
      while (node && node !== root) {
        if (isContentEditableTrue$4(node) || isContentEditableFalse$b(node)) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };

    var isXYWithinRange = function (clientX, clientY, range) {
      if (range.collapsed) {
        return false;
      }
      if (Env.browser.isIE() && range.startOffset === range.endOffset - 1 && range.startContainer === range.endContainer) {
        var elm = range.startContainer.childNodes[range.startOffset];
        if (isElement$5(elm)) {
          return exists(elm.getClientRects(), function (rect) {
            return containsXY(rect, clientX, clientY);
          });
        }
      }
      return exists(range.getClientRects(), function (rect) {
        return containsXY(rect, clientX, clientY);
      });
    };

    var firePreProcess = function (editor, args) {
      return editor.fire('PreProcess', args);
    };
    var firePostProcess = function (editor, args) {
      return editor.fire('PostProcess', args);
    };
    var fireRemove = function (editor) {
      return editor.fire('remove');
    };
    var fireDetach = function (editor) {
      return editor.fire('detach');
    };
    var fireSwitchMode = function (editor, mode) {
      return editor.fire('SwitchMode', { mode: mode });
    };
    var fireObjectResizeStart = function (editor, target, width, height, origin) {
      editor.fire('ObjectResizeStart', {
        target: target,
        width: width,
        height: height,
        origin: origin
      });
    };
    var fireObjectResized = function (editor, target, width, height, origin) {
      editor.fire('ObjectResized', {
        target: target,
        width: width,
        height: height,
        origin: origin
      });
    };
    var firePreInit = function (editor) {
      return editor.fire('PreInit');
    };
    var firePostRender = function (editor) {
      return editor.fire('PostRender');
    };
    var fireInit = function (editor) {
      return editor.fire('Init');
    };
    var firePlaceholderToggle = function (editor, state) {
      return editor.fire('PlaceholderToggle', { state: state });
    };
    var fireError = function (editor, errorType, error) {
      return editor.fire(errorType, error);
    };
    var fireFormatApply = function (editor, format, node, vars) {
      return editor.fire('FormatApply', {
        format: format,
        node: node,
        vars: vars
      });
    };
    var fireFormatRemove = function (editor, format, node, vars) {
      return editor.fire('FormatRemove', {
        format: format,
        node: node,
        vars: vars
      });
    };

    var VK = {
      BACKSPACE: 8,
      DELETE: 46,
      DOWN: 40,
      ENTER: 13,
      LEFT: 37,
      RIGHT: 39,
      SPACEBAR: 32,
      TAB: 9,
      UP: 38,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      END: 35,
      HOME: 36,
      modifierPressed: function (e) {
        return e.shiftKey || e.ctrlKey || e.altKey || VK.metaKeyPressed(e);
      },
      metaKeyPressed: function (e) {
        return Env.mac ? e.metaKey : e.ctrlKey && !e.altKey;
      }
    };

    var isContentEditableFalse$5 = isContentEditableFalse$b;
    var ControlSelection = function (selection, editor) {
      var elementSelectionAttr = 'data-mce-selected';
      var dom = editor.dom, each = Tools.each;
      var selectedElm, selectedElmGhost, resizeHelper, selectedHandle, resizeBackdrop;
      var startX, startY, selectedElmX, selectedElmY, startW, startH, ratio, resizeStarted;
      var width, height;
      var editableDoc = editor.getDoc(), rootDocument = document;
      var abs = Math.abs, round = Math.round, rootElement = editor.getBody();
      var startScrollWidth, startScrollHeight;
      var resizeHandles = {
        nw: [
          0,
          0,
          -1,
          -1
        ],
        ne: [
          1,
          0,
          1,
          -1
        ],
        se: [
          1,
          1,
          1,
          1
        ],
        sw: [
          0,
          1,
          -1,
          1
        ]
      };
      var isImage = function (elm) {
        return elm && (elm.nodeName === 'IMG' || editor.dom.is(elm, 'figure.image'));
      };
      var isMedia = function (elm) {
        return isMedia$2(elm) || dom.hasClass(elm, 'mce-preview-object');
      };
      var isEventOnImageOutsideRange = function (evt, range) {
        if (evt.type === 'longpress' || evt.type.indexOf('touch') === 0) {
          var touch = evt.touches[0];
          return isImage(evt.target) && !isXYWithinRange(touch.clientX, touch.clientY, range);
        } else {
          return isImage(evt.target) && !isXYWithinRange(evt.clientX, evt.clientY, range);
        }
      };
      var contextMenuSelectImage = function (evt) {
        var target = evt.target;
        if (isEventOnImageOutsideRange(evt, editor.selection.getRng()) && !evt.isDefaultPrevented()) {
          editor.selection.select(target);
        }
      };
      var getResizeTargets = function (elm) {
        if (dom.is(elm, 'figure.image')) {
          return [elm.querySelector('img')];
        } else if (dom.hasClass(elm, 'mce-preview-object') && isNonNullable(elm.firstElementChild)) {
          return [
            elm,
            elm.firstElementChild
          ];
        } else {
          return [elm];
        }
      };
      var isResizable = function (elm) {
        var selector = getObjectResizing(editor);
        if (!selector) {
          return false;
        }
        if (elm.getAttribute('data-mce-resize') === 'false') {
          return false;
        }
        if (elm === editor.getBody()) {
          return false;
        }
        if (dom.hasClass(elm, 'mce-preview-object')) {
          return is$2(SugarElement.fromDom(elm.firstElementChild), selector);
        } else {
          return is$2(SugarElement.fromDom(elm), selector);
        }
      };
      var createGhostElement = function (elm) {
        if (isMedia(elm)) {
          return dom.create('img', { src: Env.transparentSrc });
        } else {
          return elm.cloneNode(true);
        }
      };
      var setSizeProp = function (element, name, value) {
        if (isNonNullable(value)) {
          var targets = getResizeTargets(element);
          each$k(targets, function (target) {
            if (target.style[name] || !editor.schema.isValid(target.nodeName.toLowerCase(), name)) {
              dom.setStyle(target, name, value);
            } else {
              dom.setAttrib(target, name, '' + value);
            }
          });
        }
      };
      var setGhostElmSize = function (ghostElm, width, height) {
        setSizeProp(ghostElm, 'width', width);
        setSizeProp(ghostElm, 'height', height);
      };
      var resizeGhostElement = function (e) {
        var deltaX, deltaY, proportional;
        var resizeHelperX, resizeHelperY;
        deltaX = e.screenX - startX;
        deltaY = e.screenY - startY;
        width = deltaX * selectedHandle[2] + startW;
        height = deltaY * selectedHandle[3] + startH;
        width = width < 5 ? 5 : width;
        height = height < 5 ? 5 : height;
        if ((isImage(selectedElm) || isMedia(selectedElm)) && getResizeImgProportional(editor) !== false) {
          proportional = !VK.modifierPressed(e);
        } else {
          proportional = VK.modifierPressed(e);
        }
        if (proportional) {
          if (abs(deltaX) > abs(deltaY)) {
            height = round(width * ratio);
            width = round(height / ratio);
          } else {
            width = round(height / ratio);
            height = round(width * ratio);
          }
        }
        setGhostElmSize(selectedElmGhost, width, height);
        resizeHelperX = selectedHandle.startPos.x + deltaX;
        resizeHelperY = selectedHandle.startPos.y + deltaY;
        resizeHelperX = resizeHelperX > 0 ? resizeHelperX : 0;
        resizeHelperY = resizeHelperY > 0 ? resizeHelperY : 0;
        dom.setStyles(resizeHelper, {
          left: resizeHelperX,
          top: resizeHelperY,
          display: 'block'
        });
        resizeHelper.innerHTML = width + ' &times; ' + height;
        if (selectedHandle[2] < 0 && selectedElmGhost.clientWidth <= width) {
          dom.setStyle(selectedElmGhost, 'left', selectedElmX + (startW - width));
        }
        if (selectedHandle[3] < 0 && selectedElmGhost.clientHeight <= height) {
          dom.setStyle(selectedElmGhost, 'top', selectedElmY + (startH - height));
        }
        deltaX = rootElement.scrollWidth - startScrollWidth;
        deltaY = rootElement.scrollHeight - startScrollHeight;
        if (deltaX + deltaY !== 0) {
          dom.setStyles(resizeHelper, {
            left: resizeHelperX - deltaX,
            top: resizeHelperY - deltaY
          });
        }
        if (!resizeStarted) {
          fireObjectResizeStart(editor, selectedElm, startW, startH, 'corner-' + selectedHandle.name);
          resizeStarted = true;
        }
      };
      var endGhostResize = function () {
        var wasResizeStarted = resizeStarted;
        resizeStarted = false;
        if (wasResizeStarted) {
          setSizeProp(selectedElm, 'width', width);
          setSizeProp(selectedElm, 'height', height);
        }
        dom.unbind(editableDoc, 'mousemove', resizeGhostElement);
        dom.unbind(editableDoc, 'mouseup', endGhostResize);
        if (rootDocument !== editableDoc) {
          dom.unbind(rootDocument, 'mousemove', resizeGhostElement);
          dom.unbind(rootDocument, 'mouseup', endGhostResize);
        }
        dom.remove(selectedElmGhost);
        dom.remove(resizeHelper);
        dom.remove(resizeBackdrop);
        showResizeRect(selectedElm);
        if (wasResizeStarted) {
          fireObjectResized(editor, selectedElm, width, height, 'corner-' + selectedHandle.name);
          dom.setAttrib(selectedElm, 'style', dom.getAttrib(selectedElm, 'style'));
        }
        editor.nodeChanged();
      };
      var showResizeRect = function (targetElm) {
        unbindResizeHandleEvents();
        var position = dom.getPos(targetElm, rootElement);
        var selectedElmX = position.x;
        var selectedElmY = position.y;
        var rect = targetElm.getBoundingClientRect();
        var targetWidth = rect.width || rect.right - rect.left;
        var targetHeight = rect.height || rect.bottom - rect.top;
        if (selectedElm !== targetElm) {
          hideResizeRect();
          selectedElm = targetElm;
          width = height = 0;
        }
        var e = editor.fire('ObjectSelected', { target: targetElm });
        var selectedValue = dom.getAttrib(selectedElm, elementSelectionAttr, '1');
        if (isResizable(targetElm) && !e.isDefaultPrevented()) {
          each(resizeHandles, function (handle, name) {
            var handleElm;
            var startDrag = function (e) {
              var target = getResizeTargets(selectedElm)[0];
              startX = e.screenX;
              startY = e.screenY;
              startW = target.clientWidth;
              startH = target.clientHeight;
              ratio = startH / startW;
              selectedHandle = handle;
              selectedHandle.name = name;
              selectedHandle.startPos = {
                x: targetWidth * handle[0] + selectedElmX,
                y: targetHeight * handle[1] + selectedElmY
              };
              startScrollWidth = rootElement.scrollWidth;
              startScrollHeight = rootElement.scrollHeight;
              resizeBackdrop = dom.add(rootElement, 'div', { class: 'mce-resize-backdrop' });
              dom.setStyles(resizeBackdrop, {
                position: 'fixed',
                left: '0',
                top: '0',
                width: '100%',
                height: '100%'
              });
              selectedElmGhost = createGhostElement(selectedElm);
              dom.addClass(selectedElmGhost, 'mce-clonedresizable');
              dom.setAttrib(selectedElmGhost, 'data-mce-bogus', 'all');
              selectedElmGhost.contentEditable = 'false';
              dom.setStyles(selectedElmGhost, {
                left: selectedElmX,
                top: selectedElmY,
                margin: 0
              });
              setGhostElmSize(selectedElmGhost, targetWidth, targetHeight);
              selectedElmGhost.removeAttribute(elementSelectionAttr);
              rootElement.appendChild(selectedElmGhost);
              dom.bind(editableDoc, 'mousemove', resizeGhostElement);
              dom.bind(editableDoc, 'mouseup', endGhostResize);
              if (rootDocument !== editableDoc) {
                dom.bind(rootDocument, 'mousemove', resizeGhostElement);
                dom.bind(rootDocument, 'mouseup', endGhostResize);
              }
              resizeHelper = dom.add(rootElement, 'div', {
                'class': 'mce-resize-helper',
                'data-mce-bogus': 'all'
              }, startW + ' &times; ' + startH);
            };
            handleElm = dom.get('mceResizeHandle' + name);
            if (handleElm) {
              dom.remove(handleElm);
            }
            handleElm = dom.add(rootElement, 'div', {
              'id': 'mceResizeHandle' + name,
              'data-mce-bogus': 'all',
              'class': 'mce-resizehandle',
              'unselectable': true,
              'style': 'cursor:' + name + '-resize; margin:0; padding:0'
            });
            if (Env.ie === 11) {
              handleElm.contentEditable = false;
            }
            dom.bind(handleElm, 'mousedown', function (e) {
              e.stopImmediatePropagation();
              e.preventDefault();
              startDrag(e);
            });
            handle.elm = handleElm;
            dom.setStyles(handleElm, {
              left: targetWidth * handle[0] + selectedElmX - handleElm.offsetWidth / 2,
              top: targetHeight * handle[1] + selectedElmY - handleElm.offsetHeight / 2
            });
          });
        } else {
          hideResizeRect();
        }
        if (!dom.getAttrib(selectedElm, elementSelectionAttr)) {
          selectedElm.setAttribute(elementSelectionAttr, selectedValue);
        }
      };
      var hideResizeRect = function () {
        unbindResizeHandleEvents();
        if (selectedElm) {
          selectedElm.removeAttribute(elementSelectionAttr);
        }
        each$j(resizeHandles, function (value, name) {
          var handleElm = dom.get('mceResizeHandle' + name);
          if (handleElm) {
            dom.unbind(handleElm);
            dom.remove(handleElm);
          }
        });
      };
      var updateResizeRect = function (e) {
        var startElm, controlElm;
        var isChildOrEqual = function (node, parent) {
          if (node) {
            do {
              if (node === parent) {
                return true;
              }
            } while (node = node.parentNode);
          }
        };
        if (resizeStarted || editor.removed) {
          return;
        }
        each(dom.select('img[data-mce-selected],hr[data-mce-selected]'), function (img) {
          img.removeAttribute(elementSelectionAttr);
        });
        controlElm = e.type === 'mousedown' ? e.target : selection.getNode();
        controlElm = dom.$(controlElm).closest('table,img,figure.image,hr,video,span.mce-preview-object')[0];
        if (isChildOrEqual(controlElm, rootElement)) {
          disableGeckoResize();
          startElm = selection.getStart(true);
          if (isChildOrEqual(startElm, controlElm) && isChildOrEqual(selection.getEnd(true), controlElm)) {
            showResizeRect(controlElm);
            return;
          }
        }
        hideResizeRect();
      };
      var isWithinContentEditableFalse = function (elm) {
        return isContentEditableFalse$5(getContentEditableRoot$1(editor.getBody(), elm));
      };
      var unbindResizeHandleEvents = function () {
        each$j(resizeHandles, function (handle) {
          if (handle.elm) {
            dom.unbind(handle.elm);
            delete handle.elm;
          }
        });
      };
      var disableGeckoResize = function () {
        try {
          editor.getDoc().execCommand('enableObjectResizing', false, 'false');
        } catch (ex) {
        }
      };
      editor.on('init', function () {
        disableGeckoResize();
        if (Env.browser.isIE() || Env.browser.isEdge()) {
          editor.on('mousedown click', function (e) {
            var target = e.target, nodeName = target.nodeName;
            if (!resizeStarted && /^(TABLE|IMG|HR)$/.test(nodeName) && !isWithinContentEditableFalse(target)) {
              if (e.button !== 2) {
                editor.selection.select(target, nodeName === 'TABLE');
              }
              if (e.type === 'mousedown') {
                editor.nodeChanged();
              }
            }
          });
          var handleMSControlSelect_1 = function (e) {
            var delayedSelect = function (node) {
              Delay.setEditorTimeout(editor, function () {
                return editor.selection.select(node);
              });
            };
            if (isWithinContentEditableFalse(e.target) || isMedia$2(e.target)) {
              e.preventDefault();
              delayedSelect(e.target);
              return;
            }
            if (/^(TABLE|IMG|HR)$/.test(e.target.nodeName)) {
              e.preventDefault();
              if (e.target.tagName === 'IMG') {
                delayedSelect(e.target);
              }
            }
          };
          dom.bind(rootElement, 'mscontrolselect', handleMSControlSelect_1);
          editor.on('remove', function () {
            return dom.unbind(rootElement, 'mscontrolselect', handleMSControlSelect_1);
          });
        }
        var throttledUpdateResizeRect = Delay.throttle(function (e) {
          if (!editor.composing) {
            updateResizeRect(e);
          }
        });
        editor.on('nodechange ResizeEditor ResizeWindow ResizeContent drop FullscreenStateChanged', throttledUpdateResizeRect);
        editor.on('keyup compositionend', function (e) {
          if (selectedElm && selectedElm.nodeName === 'TABLE') {
            throttledUpdateResizeRect(e);
          }
        });
        editor.on('hide blur', hideResizeRect);
        editor.on('contextmenu longpress', contextMenuSelectImage, true);
      });
      editor.on('remove', unbindResizeHandleEvents);
      var destroy = function () {
        selectedElm = selectedElmGhost = resizeBackdrop = null;
      };
      return {
        isResizable: isResizable,
        showResizeRect: showResizeRect,
        hideResizeRect: hideResizeRect,
        updateResizeRect: updateResizeRect,
        destroy: destroy
      };
    };

    var hasCeProperty = function (node) {
      return isContentEditableTrue$4(node) || isContentEditableFalse$b(node);
    };
    var findParent$1 = function (node, rootNode, predicate) {
      while (node && node !== rootNode) {
        if (predicate(node)) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };
    var findClosestIeRange = function (clientX, clientY, doc) {
      var rects;
      var element = doc.elementFromPoint(clientX, clientY);
      var rng = doc.body.createTextRange();
      if (!element || element.tagName === 'HTML') {
        element = doc.body;
      }
      rng.moveToElementText(element);
      rects = Tools.toArray(rng.getClientRects());
      rects = rects.sort(function (a, b) {
        a = Math.abs(Math.max(a.top - clientY, a.bottom - clientY));
        b = Math.abs(Math.max(b.top - clientY, b.bottom - clientY));
        return a - b;
      });
      if (rects.length > 0) {
        clientY = (rects[0].bottom + rects[0].top) / 2;
        try {
          rng.moveToPoint(clientX, clientY);
          rng.collapse(true);
          return rng;
        } catch (ex) {
        }
      }
      return null;
    };
    var moveOutOfContentEditableFalse = function (rng, rootNode) {
      var parentElement = rng && rng.parentElement ? rng.parentElement() : null;
      return isContentEditableFalse$b(findParent$1(parentElement, rootNode, hasCeProperty)) ? null : rng;
    };
    var fromPoint = function (clientX, clientY, doc) {
      var rng, point;
      var pointDoc = doc;
      if (pointDoc.caretPositionFromPoint) {
        point = pointDoc.caretPositionFromPoint(clientX, clientY);
        if (point) {
          rng = doc.createRange();
          rng.setStart(point.offsetNode, point.offset);
          rng.collapse(true);
        }
      } else if (pointDoc.caretRangeFromPoint) {
        rng = pointDoc.caretRangeFromPoint(clientX, clientY);
      } else if (pointDoc.body.createTextRange) {
        rng = pointDoc.body.createTextRange();
        try {
          rng.moveToPoint(clientX, clientY);
          rng.collapse(true);
        } catch (ex) {
          rng = findClosestIeRange(clientX, clientY, doc);
        }
        return moveOutOfContentEditableFalse(rng, doc.body);
      }
      return rng;
    };

    var isEq$4 = function (rng1, rng2) {
      return rng1 && rng2 && (rng1.startContainer === rng2.startContainer && rng1.startOffset === rng2.startOffset) && (rng1.endContainer === rng2.endContainer && rng1.endOffset === rng2.endOffset);
    };

    var findParent = function (node, rootNode, predicate) {
      while (node && node !== rootNode) {
        if (predicate(node)) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };
    var hasParent$1 = function (node, rootNode, predicate) {
      return findParent(node, rootNode, predicate) !== null;
    };
    var hasParentWithName = function (node, rootNode, name) {
      return hasParent$1(node, rootNode, function (node) {
        return node.nodeName === name;
      });
    };
    var isTable = function (node) {
      return node && node.nodeName === 'TABLE';
    };
    var isTableCell$2 = function (node) {
      return node && /^(TD|TH|CAPTION)$/.test(node.nodeName);
    };
    var isCeFalseCaretContainer = function (node, rootNode) {
      return isCaretContainer$2(node) && hasParent$1(node, rootNode, isCaretNode) === false;
    };
    var hasBrBeforeAfter = function (dom, node, left) {
      var walker = new DomTreeWalker(node, dom.getParent(node.parentNode, dom.isBlock) || dom.getRoot());
      while (node = walker[left ? 'prev' : 'next']()) {
        if (isBr$5(node)) {
          return true;
        }
      }
    };
    var isPrevNode = function (node, name) {
      return node.previousSibling && node.previousSibling.nodeName === name;
    };
    var hasContentEditableFalseParent = function (body, node) {
      while (node && node !== body) {
        if (isContentEditableFalse$b(node)) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    };
    var findTextNodeRelative = function (dom, isAfterNode, collapsed, left, startNode) {
      var lastInlineElement;
      var body = dom.getRoot();
      var node;
      var nonEmptyElementsMap = dom.schema.getNonEmptyElements();
      var parentBlockContainer = dom.getParent(startNode.parentNode, dom.isBlock) || body;
      if (left && isBr$5(startNode) && isAfterNode && dom.isEmpty(parentBlockContainer)) {
        return Optional.some(CaretPosition(startNode.parentNode, dom.nodeIndex(startNode)));
      }
      var walker = new DomTreeWalker(startNode, parentBlockContainer);
      while (node = walker[left ? 'prev' : 'next']()) {
        if (dom.getContentEditableParent(node) === 'false' || isCeFalseCaretContainer(node, body)) {
          return Optional.none();
        }
        if (isText$7(node) && node.nodeValue.length > 0) {
          if (hasParentWithName(node, body, 'A') === false) {
            return Optional.some(CaretPosition(node, left ? node.nodeValue.length : 0));
          }
          return Optional.none();
        }
        if (dom.isBlock(node) || nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
          return Optional.none();
        }
        lastInlineElement = node;
      }
      if (collapsed && lastInlineElement) {
        return Optional.some(CaretPosition(lastInlineElement, 0));
      }
      return Optional.none();
    };
    var normalizeEndPoint = function (dom, collapsed, start, rng) {
      var container, offset;
      var body = dom.getRoot();
      var node;
      var directionLeft, normalized = false;
      container = rng[(start ? 'start' : 'end') + 'Container'];
      offset = rng[(start ? 'start' : 'end') + 'Offset'];
      var isAfterNode = isElement$5(container) && offset === container.childNodes.length;
      var nonEmptyElementsMap = dom.schema.getNonEmptyElements();
      directionLeft = start;
      if (isCaretContainer$2(container)) {
        return Optional.none();
      }
      if (isElement$5(container) && offset > container.childNodes.length - 1) {
        directionLeft = false;
      }
      if (isDocument$1(container)) {
        container = body;
        offset = 0;
      }
      if (container === body) {
        if (directionLeft) {
          node = container.childNodes[offset > 0 ? offset - 1 : 0];
          if (node) {
            if (isCaretContainer$2(node)) {
              return Optional.none();
            }
            if (nonEmptyElementsMap[node.nodeName] || isTable(node)) {
              return Optional.none();
            }
          }
        }
        if (container.hasChildNodes()) {
          offset = Math.min(!directionLeft && offset > 0 ? offset - 1 : offset, container.childNodes.length - 1);
          container = container.childNodes[offset];
          offset = isText$7(container) && isAfterNode ? container.data.length : 0;
          if (!collapsed && container === body.lastChild && isTable(container)) {
            return Optional.none();
          }
          if (hasContentEditableFalseParent(body, container) || isCaretContainer$2(container)) {
            return Optional.none();
          }
          if (container.hasChildNodes() && isTable(container) === false) {
            node = container;
            var walker = new DomTreeWalker(container, body);
            do {
              if (isContentEditableFalse$b(node) || isCaretContainer$2(node)) {
                normalized = false;
                break;
              }
              if (isText$7(node) && node.nodeValue.length > 0) {
                offset = directionLeft ? 0 : node.nodeValue.length;
                container = node;
                normalized = true;
                break;
              }
              if (nonEmptyElementsMap[node.nodeName.toLowerCase()] && !isTableCell$2(node)) {
                offset = dom.nodeIndex(node);
                container = node.parentNode;
                if (!directionLeft) {
                  offset++;
                }
                normalized = true;
                break;
              }
            } while (node = directionLeft ? walker.next() : walker.prev());
          }
        }
      }
      if (collapsed) {
        if (isText$7(container) && offset === 0) {
          findTextNodeRelative(dom, isAfterNode, collapsed, true, container).each(function (pos) {
            container = pos.container();
            offset = pos.offset();
            normalized = true;
          });
        }
        if (isElement$5(container)) {
          node = container.childNodes[offset];
          if (!node) {
            node = container.childNodes[offset - 1];
          }
          if (node && isBr$5(node) && !isPrevNode(node, 'A') && !hasBrBeforeAfter(dom, node, false) && !hasBrBeforeAfter(dom, node, true)) {
            findTextNodeRelative(dom, isAfterNode, collapsed, true, node).each(function (pos) {
              container = pos.container();
              offset = pos.offset();
              normalized = true;
            });
          }
        }
      }
      if (directionLeft && !collapsed && isText$7(container) && offset === container.nodeValue.length) {
        findTextNodeRelative(dom, isAfterNode, collapsed, false, container).each(function (pos) {
          container = pos.container();
          offset = pos.offset();
          normalized = true;
        });
      }
      return normalized ? Optional.some(CaretPosition(container, offset)) : Optional.none();
    };
    var normalize$2 = function (dom, rng) {
      var collapsed = rng.collapsed, normRng = rng.cloneRange();
      var startPos = CaretPosition.fromRangeStart(rng);
      normalizeEndPoint(dom, collapsed, true, normRng).each(function (pos) {
        if (!collapsed || !CaretPosition.isAbove(startPos, pos)) {
          normRng.setStart(pos.container(), pos.offset());
        }
      });
      if (!collapsed) {
        normalizeEndPoint(dom, collapsed, false, normRng).each(function (pos) {
          normRng.setEnd(pos.container(), pos.offset());
        });
      }
      if (collapsed) {
        normRng.collapse(true);
      }
      return isEq$4(rng, normRng) ? Optional.none() : Optional.some(normRng);
    };

    var splitText = function (node, offset) {
      return node.splitText(offset);
    };
    var split = function (rng) {
      var startContainer = rng.startContainer, startOffset = rng.startOffset, endContainer = rng.endContainer, endOffset = rng.endOffset;
      if (startContainer === endContainer && isText$7(startContainer)) {
        if (startOffset > 0 && startOffset < startContainer.nodeValue.length) {
          endContainer = splitText(startContainer, startOffset);
          startContainer = endContainer.previousSibling;
          if (endOffset > startOffset) {
            endOffset = endOffset - startOffset;
            startContainer = endContainer = splitText(endContainer, endOffset).previousSibling;
            endOffset = endContainer.nodeValue.length;
            startOffset = 0;
          } else {
            endOffset = 0;
          }
        }
      } else {
        if (isText$7(startContainer) && startOffset > 0 && startOffset < startContainer.nodeValue.length) {
          startContainer = splitText(startContainer, startOffset);
          startOffset = 0;
        }
        if (isText$7(endContainer) && endOffset > 0 && endOffset < endContainer.nodeValue.length) {
          endContainer = splitText(endContainer, endOffset).previousSibling;
          endOffset = endContainer.nodeValue.length;
        }
      }
      return {
        startContainer: startContainer,
        startOffset: startOffset,
        endContainer: endContainer,
        endOffset: endOffset
      };
    };

    var RangeUtils = function (dom) {
      var walk = function (rng, callback) {
        return walk$2(dom, rng, callback);
      };
      var split$1 = split;
      var normalize = function (rng) {
        return normalize$2(dom, rng).fold(never, function (normalizedRng) {
          rng.setStart(normalizedRng.startContainer, normalizedRng.startOffset);
          rng.setEnd(normalizedRng.endContainer, normalizedRng.endOffset);
          return true;
        });
      };
      return {
        walk: walk,
        split: split$1,
        normalize: normalize
      };
    };
    RangeUtils.compareRanges = isEq$4;
    RangeUtils.getCaretRangeFromPoint = fromPoint;
    RangeUtils.getSelectedNode = getSelectedNode;
    RangeUtils.getNode = getNode$1;

    var Dimension = function (name, getOffset) {
      var set = function (element, h) {
        if (!isNumber(h) && !h.match(/^[0-9]+$/)) {
          throw new Error(name + '.set accepts only positive integer values. Value was ' + h);
        }
        var dom = element.dom;
        if (isSupported(dom)) {
          dom.style[name] = h + 'px';
        }
      };
      var get = function (element) {
        var r = getOffset(element);
        if (r <= 0 || r === null) {
          var css = get$5(element, name);
          return parseFloat(css) || 0;
        }
        return r;
      };
      var getOuter = get;
      var aggregate = function (element, properties) {
        return foldl(properties, function (acc, property) {
          var val = get$5(element, property);
          var value = val === undefined ? 0 : parseInt(val, 10);
          return isNaN(value) ? acc : acc + value;
        }, 0);
      };
      var max = function (element, value, properties) {
        var cumulativeInclusions = aggregate(element, properties);
        var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
        return absoluteMax;
      };
      return {
        set: set,
        get: get,
        getOuter: getOuter,
        aggregate: aggregate,
        max: max
      };
    };

    var api = Dimension('height', function (element) {
      var dom = element.dom;
      return inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
    });
    var get$1 = function (element) {
      return api.get(element);
    };

    var walkUp = function (navigation, doc) {
      var frame = navigation.view(doc);
      return frame.fold(constant([]), function (f) {
        var parent = navigation.owner(f);
        var rest = walkUp(navigation, parent);
        return [f].concat(rest);
      });
    };
    var pathTo = function (element, navigation) {
      var d = navigation.owner(element);
      return walkUp(navigation, d);
    };

    var view = function (doc) {
      var _a;
      var element = doc.dom === document ? Optional.none() : Optional.from((_a = doc.dom.defaultView) === null || _a === void 0 ? void 0 : _a.frameElement);
      return element.map(SugarElement.fromDom);
    };
    var owner = function (element) {
      return documentOrOwner(element);
    };

    var Navigation = /*#__PURE__*/Object.freeze({
        __proto__: null,
        view: view,
        owner: owner
    });

    var find$1 = function (element) {
      var doc = SugarElement.fromDom(document);
      var scroll = get$8(doc);
      var frames = pathTo(element, Navigation);
      var offset = viewport(element);
      var r = foldr(frames, function (b, a) {
        var loc = viewport(a);
        return {
          left: b.left + loc.left,
          top: b.top + loc.top
        };
      }, {
        left: 0,
        top: 0
      });
      return SugarPosition(r.left + offset.left + scroll.left, r.top + offset.top + scroll.top);
    };

    var excludeFromDescend = function (element) {
      return name(element) === 'textarea';
    };
    var fireScrollIntoViewEvent = function (editor, data) {
      var scrollEvent = editor.fire('ScrollIntoView', data);
      return scrollEvent.isDefaultPrevented();
    };
    var fireAfterScrollIntoViewEvent = function (editor, data) {
      editor.fire('AfterScrollIntoView', data);
    };
    var descend = function (element, offset) {
      var children$1 = children(element);
      if (children$1.length === 0 || excludeFromDescend(element)) {
        return {
          element: element,
          offset: offset
        };
      } else if (offset < children$1.length && !excludeFromDescend(children$1[offset])) {
        return {
          element: children$1[offset],
          offset: 0
        };
      } else {
        var last = children$1[children$1.length - 1];
        if (excludeFromDescend(last)) {
          return {
            element: element,
            offset: offset
          };
        } else {
          if (name(last) === 'img') {
            return {
              element: last,
              offset: 1
            };
          } else if (isText$8(last)) {
            return {
              element: last,
              offset: get$2(last).length
            };
          } else {
            return {
              element: last,
              offset: children(last).length
            };
          }
        }
      }
    };
    var markerInfo = function (element, cleanupFun) {
      var pos = absolute(element);
      var height = get$1(element);
      return {
        element: element,
        bottom: pos.top + height,
        height: height,
        pos: pos,
        cleanup: cleanupFun
      };
    };
    var createMarker = function (element, offset) {
      var startPoint = descend(element, offset);
      var span = SugarElement.fromHtml('<span data-mce-bogus="all">' + ZWSP$1 + '</span>');
      before$4(startPoint.element, span);
      return markerInfo(span, function () {
        return remove$7(span);
      });
    };
    var elementMarker = function (element) {
      return markerInfo(SugarElement.fromDom(element), noop);
    };
    var withMarker = function (editor, f, rng, alignToTop) {
      preserveWith(editor, function (_s, _e) {
        return applyWithMarker(editor, f, rng, alignToTop);
      }, rng);
    };
    var withScrollEvents = function (editor, doc, f, marker, alignToTop) {
      var data = {
        elm: marker.element.dom,
        alignToTop: alignToTop
      };
      if (fireScrollIntoViewEvent(editor, data)) {
        return;
      }
      var scrollTop = get$8(doc).top;
      f(doc, scrollTop, marker, alignToTop);
      fireAfterScrollIntoViewEvent(editor, data);
    };
    var applyWithMarker = function (editor, f, rng, alignToTop) {
      var body = SugarElement.fromDom(editor.getBody());
      var doc = SugarElement.fromDom(editor.getDoc());
      reflow(body);
      var marker = createMarker(SugarElement.fromDom(rng.startContainer), rng.startOffset);
      withScrollEvents(editor, doc, f, marker, alignToTop);
      marker.cleanup();
    };
    var withElement = function (editor, element, f, alignToTop) {
      var doc = SugarElement.fromDom(editor.getDoc());
      withScrollEvents(editor, doc, f, elementMarker(element), alignToTop);
    };
    var preserveWith = function (editor, f, rng) {
      var startElement = rng.startContainer;
      var startOffset = rng.startOffset;
      var endElement = rng.endContainer;
      var endOffset = rng.endOffset;
      f(SugarElement.fromDom(startElement), SugarElement.fromDom(endElement));
      var newRng = editor.dom.createRng();
      newRng.setStart(startElement, startOffset);
      newRng.setEnd(endElement, endOffset);
      editor.selection.setRng(rng);
    };
    var scrollToMarker = function (marker, viewHeight, alignToTop, doc) {
      var pos = marker.pos;
      if (alignToTop) {
        to(pos.left, pos.top, doc);
      } else {
        var y = pos.top - viewHeight + marker.height;
        to(pos.left, y, doc);
      }
    };
    var intoWindowIfNeeded = function (doc, scrollTop, viewHeight, marker, alignToTop) {
      var viewportBottom = viewHeight + scrollTop;
      var markerTop = marker.pos.top;
      var markerBottom = marker.bottom;
      var largerThanViewport = markerBottom - markerTop >= viewHeight;
      if (markerTop < scrollTop) {
        scrollToMarker(marker, viewHeight, alignToTop !== false, doc);
      } else if (markerTop > viewportBottom) {
        var align = largerThanViewport ? alignToTop !== false : alignToTop === true;
        scrollToMarker(marker, viewHeight, align, doc);
      } else if (markerBottom > viewportBottom && !largerThanViewport) {
        scrollToMarker(marker, viewHeight, alignToTop === true, doc);
      }
    };
    var intoWindow = function (doc, scrollTop, marker, alignToTop) {
      var viewHeight = doc.dom.defaultView.innerHeight;
      intoWindowIfNeeded(doc, scrollTop, viewHeight, marker, alignToTop);
    };
    var intoFrame = function (doc, scrollTop, marker, alignToTop) {
      var frameViewHeight = doc.dom.defaultView.innerHeight;
      intoWindowIfNeeded(doc, scrollTop, frameViewHeight, marker, alignToTop);
      var op = find$1(marker.element);
      var viewportBounds = getBounds(window);
      if (op.top < viewportBounds.y) {
        intoView(marker.element, alignToTop !== false);
      } else if (op.top > viewportBounds.bottom) {
        intoView(marker.element, alignToTop === true);
      }
    };
    var rangeIntoWindow = function (editor, rng, alignToTop) {
      return withMarker(editor, intoWindow, rng, alignToTop);
    };
    var elementIntoWindow = function (editor, element, alignToTop) {
      return withElement(editor, element, intoWindow, alignToTop);
    };
    var rangeIntoFrame = function (editor, rng, alignToTop) {
      return withMarker(editor, intoFrame, rng, alignToTop);
    };
    var elementIntoFrame = function (editor, element, alignToTop) {
      return withElement(editor, element, intoFrame, alignToTop);
    };
    var scrollElementIntoView = function (editor, element, alignToTop) {
      var scroller = editor.inline ? elementIntoWindow : elementIntoFrame;
      scroller(editor, element, alignToTop);
    };
    var scrollRangeIntoView = function (editor, rng, alignToTop) {
      var scroller = editor.inline ? rangeIntoWindow : rangeIntoFrame;
      scroller(editor, rng, alignToTop);
    };

    var getDocument = function () {
      return SugarElement.fromDom(document);
    };

    var focus$1 = function (element) {
      return element.dom.focus();
    };
    var hasFocus$1 = function (element) {
      var root = getRootNode(element).dom;
      return element.dom === root.activeElement;
    };
    var active = function (root) {
      if (root === void 0) {
        root = getDocument();
      }
      return Optional.from(root.dom.activeElement).map(SugarElement.fromDom);
    };
    var search = function (element) {
      return active(getRootNode(element)).filter(function (e) {
        return element.dom.contains(e.dom);
      });
    };

    var create$5 = function (start, soffset, finish, foffset) {
      return {
        start: start,
        soffset: soffset,
        finish: finish,
        foffset: foffset
      };
    };
    var SimRange = { create: create$5 };

    var adt$1 = Adt.generate([
      { before: ['element'] },
      {
        on: [
          'element',
          'offset'
        ]
      },
      { after: ['element'] }
    ]);
    var cata = function (subject, onBefore, onOn, onAfter) {
      return subject.fold(onBefore, onOn, onAfter);
    };
    var getStart$2 = function (situ) {
      return situ.fold(identity, identity, identity);
    };
    var before$1 = adt$1.before;
    var on = adt$1.on;
    var after$1 = adt$1.after;
    var Situ = {
      before: before$1,
      on: on,
      after: after$1,
      cata: cata,
      getStart: getStart$2
    };

    var adt = Adt.generate([
      { domRange: ['rng'] },
      {
        relative: [
          'startSitu',
          'finishSitu'
        ]
      },
      {
        exact: [
          'start',
          'soffset',
          'finish',
          'foffset'
        ]
      }
    ]);
    var exactFromRange = function (simRange) {
      return adt.exact(simRange.start, simRange.soffset, simRange.finish, simRange.foffset);
    };
    var getStart$1 = function (selection) {
      return selection.match({
        domRange: function (rng) {
          return SugarElement.fromDom(rng.startContainer);
        },
        relative: function (startSitu, _finishSitu) {
          return Situ.getStart(startSitu);
        },
        exact: function (start, _soffset, _finish, _foffset) {
          return start;
        }
      });
    };
    var domRange = adt.domRange;
    var relative = adt.relative;
    var exact = adt.exact;
    var getWin = function (selection) {
      var start = getStart$1(selection);
      return defaultView(start);
    };
    var range = SimRange.create;
    var SimSelection = {
      domRange: domRange,
      relative: relative,
      exact: exact,
      exactFromRange: exactFromRange,
      getWin: getWin,
      range: range
    };

    var browser$1 = detect().browser;
    var clamp$1 = function (offset, element) {
      var max = isText$8(element) ? get$2(element).length : children(element).length + 1;
      if (offset > max) {
        return max;
      } else if (offset < 0) {
        return 0;
      }
      return offset;
    };
    var normalizeRng = function (rng) {
      return SimSelection.range(rng.start, clamp$1(rng.soffset, rng.start), rng.finish, clamp$1(rng.foffset, rng.finish));
    };
    var isOrContains = function (root, elm) {
      return !isRestrictedNode(elm.dom) && (contains$1(root, elm) || eq(root, elm));
    };
    var isRngInRoot = function (root) {
      return function (rng) {
        return isOrContains(root, rng.start) && isOrContains(root, rng.finish);
      };
    };
    var shouldStore = function (editor) {
      return editor.inline === true || browser$1.isIE();
    };
    var nativeRangeToSelectionRange = function (r) {
      return SimSelection.range(SugarElement.fromDom(r.startContainer), r.startOffset, SugarElement.fromDom(r.endContainer), r.endOffset);
    };
    var readRange = function (win) {
      var selection = win.getSelection();
      var rng = !selection || selection.rangeCount === 0 ? Optional.none() : Optional.from(selection.getRangeAt(0));
      return rng.map(nativeRangeToSelectionRange);
    };
    var getBookmark = function (root) {
      var win = defaultView(root);
      return readRange(win.dom).filter(isRngInRoot(root));
    };
    var validate = function (root, bookmark) {
      return Optional.from(bookmark).filter(isRngInRoot(root)).map(normalizeRng);
    };
    var bookmarkToNativeRng = function (bookmark) {
      var rng = document.createRange();
      try {
        rng.setStart(bookmark.start.dom, bookmark.soffset);
        rng.setEnd(bookmark.finish.dom, bookmark.foffset);
        return Optional.some(rng);
      } catch (_) {
        return Optional.none();
      }
    };
    var store = function (editor) {
      var newBookmark = shouldStore(editor) ? getBookmark(SugarElement.fromDom(editor.getBody())) : Optional.none();
      editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
    };
    var storeNative = function (editor, rng) {
      var root = SugarElement.fromDom(editor.getBody());
      var range = shouldStore(editor) ? Optional.from(rng) : Optional.none();
      var newBookmark = range.map(nativeRangeToSelectionRange).filter(isRngInRoot(root));
      editor.bookmark = newBookmark.isSome() ? newBookmark : editor.bookmark;
    };
    var getRng = function (editor) {
      var bookmark = editor.bookmark ? editor.bookmark : Optional.none();
      return bookmark.bind(function (x) {
        return validate(SugarElement.fromDom(editor.getBody()), x);
      }).bind(bookmarkToNativeRng);
    };
    var restore = function (editor) {
      getRng(editor).each(function (rng) {
        return editor.selection.setRng(rng);
      });
    };

    var isEditorUIElement$1 = function (elm) {
      var className = elm.className.toString();
      return className.indexOf('tox-') !== -1 || className.indexOf('mce-') !== -1;
    };
    var FocusManager = { isEditorUIElement: isEditorUIElement$1 };

    var isManualNodeChange = function (e) {
      return e.type === 'nodechange' && e.selectionChange;
    };
    var registerPageMouseUp = function (editor, throttledStore) {
      var mouseUpPage = function () {
        throttledStore.throttle();
      };
      DOMUtils.DOM.bind(document, 'mouseup', mouseUpPage);
      editor.on('remove', function () {
        DOMUtils.DOM.unbind(document, 'mouseup', mouseUpPage);
      });
    };
    var registerFocusOut = function (editor) {
      editor.on('focusout', function () {
        store(editor);
      });
    };
    var registerMouseUp = function (editor, throttledStore) {
      editor.on('mouseup touchend', function (_e) {
        throttledStore.throttle();
      });
    };
    var registerEditorEvents = function (editor, throttledStore) {
      var browser = detect().browser;
      if (browser.isIE()) {
        registerFocusOut(editor);
      } else {
        registerMouseUp(editor, throttledStore);
      }
      editor.on('keyup NodeChange', function (e) {
        if (!isManualNodeChange(e)) {
          store(editor);
        }
      });
    };
    var register$3 = function (editor) {
      var throttledStore = first(function () {
        store(editor);
      }, 0);
      editor.on('init', function () {
        if (editor.inline) {
          registerPageMouseUp(editor, throttledStore);
        }
        registerEditorEvents(editor, throttledStore);
      });
      editor.on('remove', function () {
        throttledStore.cancel();
      });
    };

    var documentFocusInHandler;
    var DOM$8 = DOMUtils.DOM;
    var isEditorUIElement = function (elm) {
      return FocusManager.isEditorUIElement(elm);
    };
    var isEditorContentAreaElement = function (elm) {
      var classList = elm.classList;
      if (classList !== undefined) {
        return classList.contains('tox-edit-area') || classList.contains('tox-edit-area__iframe') || classList.contains('mce-content-body');
      } else {
        return false;
      }
    };
    var isUIElement = function (editor, elm) {
      var customSelector = getCustomUiSelector(editor);
      var parent = DOM$8.getParent(elm, function (elm) {
        return isEditorUIElement(elm) || (customSelector ? editor.dom.is(elm, customSelector) : false);
      });
      return parent !== null;
    };
    var getActiveElement = function (editor) {
      try {
        var root = getRootNode(SugarElement.fromDom(editor.getElement()));
        return active(root).fold(function () {
          return document.body;
        }, function (x) {
          return x.dom;
        });
      } catch (ex) {
        return document.body;
      }
    };
    var registerEvents$1 = function (editorManager, e) {
      var editor = e.editor;
      register$3(editor);
      editor.on('focusin', function () {
        var focusedEditor = editorManager.focusedEditor;
        if (focusedEditor !== editor) {
          if (focusedEditor) {
            focusedEditor.fire('blur', { focusedEditor: editor });
          }
          editorManager.setActive(editor);
          editorManager.focusedEditor = editor;
          editor.fire('focus', { blurredEditor: focusedEditor });
          editor.focus(true);
        }
      });
      editor.on('focusout', function () {
        Delay.setEditorTimeout(editor, function () {
          var focusedEditor = editorManager.focusedEditor;
          if (!isUIElement(editor, getActiveElement(editor)) && focusedEditor === editor) {
            editor.fire('blur', { focusedEditor: null });
            editorManager.focusedEditor = null;
          }
        });
      });
      if (!documentFocusInHandler) {
        documentFocusInHandler = function (e) {
          var activeEditor = editorManager.activeEditor;
          if (activeEditor) {
            getOriginalEventTarget(e).each(function (target) {
              if (target.ownerDocument === document) {
                if (target !== document.body && !isUIElement(activeEditor, target) && editorManager.focusedEditor === activeEditor) {
                  activeEditor.fire('blur', { focusedEditor: null });
                  editorManager.focusedEditor = null;
                }
              }
            });
          }
        };
        DOM$8.bind(document, 'focusin', documentFocusInHandler);
      }
    };
    var unregisterDocumentEvents = function (editorManager, e) {
      if (editorManager.focusedEditor === e.editor) {
        editorManager.focusedEditor = null;
      }
      if (!editorManager.activeEditor) {
        DOM$8.unbind(document, 'focusin', documentFocusInHandler);
        documentFocusInHandler = null;
      }
    };
    var setup$l = function (editorManager) {
      editorManager.on('AddEditor', curry(registerEvents$1, editorManager));
      editorManager.on('RemoveEditor', curry(unregisterDocumentEvents, editorManager));
    };

    var getContentEditableHost = function (editor, node) {
      return editor.dom.getParent(node, function (node) {
        return editor.dom.getContentEditable(node) === 'true';
      });
    };
    var getCollapsedNode = function (rng) {
      return rng.collapsed ? Optional.from(getNode$1(rng.startContainer, rng.startOffset)).map(SugarElement.fromDom) : Optional.none();
    };
    var getFocusInElement = function (root, rng) {
      return getCollapsedNode(rng).bind(function (node) {
        if (isTableSection(node)) {
          return Optional.some(node);
        } else if (contains$1(root, node) === false) {
          return Optional.some(root);
        } else {
          return Optional.none();
        }
      });
    };
    var normalizeSelection$1 = function (editor, rng) {
      getFocusInElement(SugarElement.fromDom(editor.getBody()), rng).bind(function (elm) {
        return firstPositionIn(elm.dom);
      }).fold(function () {
        editor.selection.normalize();
        return;
      }, function (caretPos) {
        return editor.selection.setRng(caretPos.toRange());
      });
    };
    var focusBody = function (body) {
      if (body.setActive) {
        try {
          body.setActive();
        } catch (ex) {
          body.focus();
        }
      } else {
        body.focus();
      }
    };
    var hasElementFocus = function (elm) {
      return hasFocus$1(elm) || search(elm).isSome();
    };
    var hasIframeFocus = function (editor) {
      return editor.iframeElement && hasFocus$1(SugarElement.fromDom(editor.iframeElement));
    };
    var hasInlineFocus = function (editor) {
      var rawBody = editor.getBody();
      return rawBody && hasElementFocus(SugarElement.fromDom(rawBody));
    };
    var hasUiFocus = function (editor) {
      var dos = getRootNode(SugarElement.fromDom(editor.getElement()));
      return active(dos).filter(function (elem) {
        return !isEditorContentAreaElement(elem.dom) && isUIElement(editor, elem.dom);
      }).isSome();
    };
    var hasFocus = function (editor) {
      return editor.inline ? hasInlineFocus(editor) : hasIframeFocus(editor);
    };
    var hasEditorOrUiFocus = function (editor) {
      return hasFocus(editor) || hasUiFocus(editor);
    };
    var focusEditor = function (editor) {
      var selection = editor.selection;
      var body = editor.getBody();
      var rng = selection.getRng();
      editor.quirks.refreshContentEditable();
      if (editor.bookmark !== undefined && hasFocus(editor) === false) {
        getRng(editor).each(function (bookmarkRng) {
          editor.selection.setRng(bookmarkRng);
          rng = bookmarkRng;
        });
      }
      var contentEditableHost = getContentEditableHost(editor, selection.getNode());
      if (editor.$.contains(body, contentEditableHost)) {
        focusBody(contentEditableHost);
        normalizeSelection$1(editor, rng);
        activateEditor(editor);
        return;
      }
      if (!editor.inline) {
        if (!Env.opera) {
          focusBody(body);
        }
        editor.getWin().focus();
      }
      if (Env.gecko || editor.inline) {
        focusBody(body);
        normalizeSelection$1(editor, rng);
      }
      activateEditor(editor);
    };
    var activateEditor = function (editor) {
      return editor.editorManager.setActive(editor);
    };
    var focus = function (editor, skipFocus) {
      if (editor.removed) {
        return;
      }
      if (skipFocus) {
        activateEditor(editor);
      } else {
        focusEditor(editor);
      }
    };

    var getEndpointElement = function (root, rng, start, real, resolve) {
      var container = start ? rng.startContainer : rng.endContainer;
      var offset = start ? rng.startOffset : rng.endOffset;
      return Optional.from(container).map(SugarElement.fromDom).map(function (elm) {
        return !real || !rng.collapsed ? child$1(elm, resolve(elm, offset)).getOr(elm) : elm;
      }).bind(function (elm) {
        return isElement$6(elm) ? Optional.some(elm) : parent(elm).filter(isElement$6);
      }).map(function (elm) {
        return elm.dom;
      }).getOr(root);
    };
    var getStart = function (root, rng, real) {
      return getEndpointElement(root, rng, true, real, function (elm, offset) {
        return Math.min(childNodesCount(elm), offset);
      });
    };
    var getEnd = function (root, rng, real) {
      return getEndpointElement(root, rng, false, real, function (elm, offset) {
        return offset > 0 ? offset - 1 : offset;
      });
    };
    var skipEmptyTextNodes = function (node, forwards) {
      var orig = node;
      while (node && isText$7(node) && node.length === 0) {
        node = forwards ? node.nextSibling : node.previousSibling;
      }
      return node || orig;
    };
    var getNode = function (root, rng) {
      var elm, startContainer, endContainer;
      if (!rng) {
        return root;
      }
      startContainer = rng.startContainer;
      endContainer = rng.endContainer;
      var startOffset = rng.startOffset;
      var endOffset = rng.endOffset;
      elm = rng.commonAncestorContainer;
      if (!rng.collapsed) {
        if (startContainer === endContainer) {
          if (endOffset - startOffset < 2) {
            if (startContainer.hasChildNodes()) {
              elm = startContainer.childNodes[startOffset];
            }
          }
        }
        if (startContainer.nodeType === 3 && endContainer.nodeType === 3) {
          if (startContainer.length === startOffset) {
            startContainer = skipEmptyTextNodes(startContainer.nextSibling, true);
          } else {
            startContainer = startContainer.parentNode;
          }
          if (endOffset === 0) {
            endContainer = skipEmptyTextNodes(endContainer.previousSibling, false);
          } else {
            endContainer = endContainer.parentNode;
          }
          if (startContainer && startContainer === endContainer) {
            return startContainer;
          }
        }
      }
      if (elm && elm.nodeType === 3) {
        return elm.parentNode;
      }
      return elm;
    };
    var getSelectedBlocks = function (dom, rng, startElm, endElm) {
      var node;
      var selectedBlocks = [];
      var root = dom.getRoot();
      startElm = dom.getParent(startElm || getStart(root, rng, rng.collapsed), dom.isBlock);
      endElm = dom.getParent(endElm || getEnd(root, rng, rng.collapsed), dom.isBlock);
      if (startElm && startElm !== root) {
        selectedBlocks.push(startElm);
      }
      if (startElm && endElm && startElm !== endElm) {
        node = startElm;
        var walker = new DomTreeWalker(startElm, root);
        while ((node = walker.next()) && node !== endElm) {
          if (dom.isBlock(node)) {
            selectedBlocks.push(node);
          }
        }
      }
      if (endElm && startElm !== endElm && endElm !== root) {
        selectedBlocks.push(endElm);
      }
      return selectedBlocks;
    };
    var select = function (dom, node, content) {
      return Optional.from(node).map(function (node) {
        var idx = dom.nodeIndex(node);
        var rng = dom.createRng();
        rng.setStart(node.parentNode, idx);
        rng.setEnd(node.parentNode, idx + 1);
        if (content) {
          moveEndPoint(dom, rng, node, true);
          moveEndPoint(dom, rng, node, false);
        }
        return rng;
      });
    };

    var processRanges = function (editor, ranges) {
      return map$3(ranges, function (range) {
        var evt = editor.fire('GetSelectionRange', { range: range });
        return evt.range !== range ? evt.range : range;
      });
    };

    var typeLookup = {
      '#text': 3,
      '#comment': 8,
      '#cdata': 4,
      '#pi': 7,
      '#doctype': 10,
      '#document-fragment': 11
    };
    var walk$1 = function (node, root, prev) {
      var startName = prev ? 'lastChild' : 'firstChild';
      var siblingName = prev ? 'prev' : 'next';
      if (node[startName]) {
        return node[startName];
      }
      if (node !== root) {
        var sibling = node[siblingName];
        if (sibling) {
          return sibling;
        }
        for (var parent_1 = node.parent; parent_1 && parent_1 !== root; parent_1 = parent_1.parent) {
          sibling = parent_1[siblingName];
          if (sibling) {
            return sibling;
          }
        }
      }
    };
    var isEmptyTextNode = function (node) {
      if (!isWhitespaceText(node.value)) {
        return false;
      }
      var parentNode = node.parent;
      if (parentNode && (parentNode.name !== 'span' || parentNode.attr('style')) && /^[ ]+$/.test(node.value)) {
        return false;
      }
      return true;
    };
    var isNonEmptyElement = function (node) {
      var isNamedAnchor = node.name === 'a' && !node.attr('href') && node.attr('id');
      return node.attr('name') || node.attr('id') && !node.firstChild || node.attr('data-mce-bookmark') || isNamedAnchor;
    };
    var AstNode = function () {
      function AstNode(name, type) {
        this.name = name;
        this.type = type;
        if (type === 1) {
          this.attributes = [];
          this.attributes.map = {};
        }
      }
      AstNode.create = function (name, attrs) {
        var node = new AstNode(name, typeLookup[name] || 1);
        if (attrs) {
          each$j(attrs, function (value, attrName) {
            node.attr(attrName, value);
          });
        }
        return node;
      };
      AstNode.prototype.replace = function (node) {
        var self = this;
        if (node.parent) {
          node.remove();
        }
        self.insert(node, self);
        self.remove();
        return self;
      };
      AstNode.prototype.attr = function (name, value) {
        var self = this;
        var attrs;
        if (typeof name !== 'string') {
          if (name !== undefined && name !== null) {
            each$j(name, function (value, key) {
              self.attr(key, value);
            });
          }
          return self;
        }
        if (attrs = self.attributes) {
          if (value !== undefined) {
            if (value === null) {
              if (name in attrs.map) {
                delete attrs.map[name];
                var i = attrs.length;
                while (i--) {
                  if (attrs[i].name === name) {
                    attrs.splice(i, 1);
                    return self;
                  }
                }
              }
              return self;
            }
            if (name in attrs.map) {
              var i = attrs.length;
              while (i--) {
                if (attrs[i].name === name) {
                  attrs[i].value = value;
                  break;
                }
              }
            } else {
              attrs.push({
                name: name,
                value: value
              });
            }
            attrs.map[name] = value;
            return self;
          }
          return attrs.map[name];
        }
      };
      AstNode.prototype.clone = function () {
        var self = this;
        var clone = new AstNode(self.name, self.type);
        var selfAttrs;
        if (selfAttrs = self.attributes) {
          var cloneAttrs = [];
          cloneAttrs.map = {};
          for (var i = 0, l = selfAttrs.length; i < l; i++) {
            var selfAttr = selfAttrs[i];
            if (selfAttr.name !== 'id') {
              cloneAttrs[cloneAttrs.length] = {
                name: selfAttr.name,
                value: selfAttr.value
              };
              cloneAttrs.map[selfAttr.name] = selfAttr.value;
            }
          }
          clone.attributes = cloneAttrs;
        }
        clone.value = self.value;
        clone.shortEnded = self.shortEnded;
        return clone;
      };
      AstNode.prototype.wrap = function (wrapper) {
        var self = this;
        self.parent.insert(wrapper, self);
        wrapper.append(self);
        return self;
      };
      AstNode.prototype.unwrap = function () {
        var self = this;
        for (var node = self.firstChild; node;) {
          var next = node.next;
          self.insert(node, self, true);
          node = next;
        }
        self.remove();
      };
      AstNode.prototype.remove = function () {
        var self = this, parent = self.parent, next = self.next, prev = self.prev;
        if (parent) {
          if (parent.firstChild === self) {
            parent.firstChild = next;
            if (next) {
              next.prev = null;
            }
          } else {
            prev.next = next;
          }
          if (parent.lastChild === self) {
            parent.lastChild = prev;
            if (prev) {
              prev.next = null;
            }
          } else {
            next.prev = prev;
          }
          self.parent = self.next = self.prev = null;
        }
        return self;
      };
      AstNode.prototype.append = function (node) {
        var self = this;
        if (node.parent) {
          node.remove();
        }
        var last = self.lastChild;
        if (last) {
          last.next = node;
          node.prev = last;
          self.lastChild = node;
        } else {
          self.lastChild = self.firstChild = node;
        }
        node.parent = self;
        return node;
      };
      AstNode.prototype.insert = function (node, refNode, before) {
        if (node.parent) {
          node.remove();
        }
        var parent = refNode.parent || this;
        if (before) {
          if (refNode === parent.firstChild) {
            parent.firstChild = node;
          } else {
            refNode.prev.next = node;
          }
          node.prev = refNode.prev;
          node.next = refNode;
          refNode.prev = node;
        } else {
          if (refNode === parent.lastChild) {
            parent.lastChild = node;
          } else {
            refNode.next.prev = node;
          }
          node.next = refNode.next;
          node.prev = refNode;
          refNode.next = node;
        }
        node.parent = parent;
        return node;
      };
      AstNode.prototype.getAll = function (name) {
        var self = this;
        var collection = [];
        for (var node = self.firstChild; node; node = walk$1(node, self)) {
          if (node.name === name) {
            collection.push(node);
          }
        }
        return collection;
      };
      AstNode.prototype.children = function () {
        var self = this;
        var collection = [];
        for (var node = self.firstChild; node; node = node.next) {
          collection.push(node);
        }
        return collection;
      };
      AstNode.prototype.empty = function () {
        var self = this;
        if (self.firstChild) {
          var nodes = [];
          for (var node = self.firstChild; node; node = walk$1(node, self)) {
            nodes.push(node);
          }
          var i = nodes.length;
          while (i--) {
            var node = nodes[i];
            node.parent = node.firstChild = node.lastChild = node.next = node.prev = null;
          }
        }
        self.firstChild = self.lastChild = null;
        return self;
      };
      AstNode.prototype.isEmpty = function (elements, whitespace, predicate) {
        if (whitespace === void 0) {
          whitespace = {};
        }
        var self = this;
        var node = self.firstChild;
        if (isNonEmptyElement(self)) {
          return false;
        }
        if (node) {
          do {
            if (node.type === 1) {
              if (node.attr('data-mce-bogus')) {
                continue;
              }
              if (elements[node.name]) {
                return false;
              }
              if (isNonEmptyElement(node)) {
                return false;
              }
            }
            if (node.type === 8) {
              return false;
            }
            if (node.type === 3 && !isEmptyTextNode(node)) {
              return false;
            }
            if (node.type === 3 && node.parent && whitespace[node.parent.name] && isWhitespaceText(node.value)) {
              return false;
            }
            if (predicate && predicate(node)) {
              return false;
            }
          } while (node = walk$1(node, self));
        }
        return true;
      };
      AstNode.prototype.walk = function (prev) {
        return walk$1(this, null, prev);
      };
      return AstNode;
    }();

    var extractBase64DataUris = function (html) {
      var dataImageUri = /data:[^;]+;base64,([a-z0-9\+\/=\s]+)/gi;
      var chunks = [];
      var uris = {};
      var prefix = generate('img');
      var matches;
      var index = 0;
      var count = 0;
      while (matches = dataImageUri.exec(html)) {
        var uri = matches[0];
        var imageId = prefix + '_' + count++;
        uris[imageId] = uri;
        if (index < matches.index) {
          chunks.push(html.substr(index, matches.index - index));
        }
        chunks.push(imageId);
        index = matches.index + uri.length;
      }
      var re = new RegExp(prefix + '_[0-9]+', 'g');
      if (index === 0) {
        return {
          prefix: prefix,
          uris: uris,
          html: html,
          re: re
        };
      } else {
        if (index < html.length) {
          chunks.push(html.substr(index));
        }
        return {
          prefix: prefix,
          uris: uris,
          html: chunks.join(''),
          re: re
        };
      }
    };
    var restoreDataUris = function (html, result) {
      return html.replace(result.re, function (imageId) {
        return get$9(result.uris, imageId).getOr(imageId);
      });
    };
    var parseDataUri$1 = function (uri) {
      var matches = /data:([^;]+);base64,([a-z0-9\+\/=\s]+)/i.exec(uri);
      if (matches) {
        return Optional.some({
          type: matches[1],
          data: decodeURIComponent(matches[2])
        });
      } else {
        return Optional.none();
      }
    };

    var safeSvgDataUrlElements = [
      'img',
      'video'
    ];
    var filteredClobberElements = Tools.makeMap('button,fieldset,form,iframe,img,image,input,object,output,select,textarea');
    var isValidPrefixAttrName = function (name) {
      return name.indexOf('data-') === 0 || name.indexOf('aria-') === 0;
    };
    var blockSvgDataUris = function (allowSvgDataUrls, tagName) {
      var allowed = isNullable(allowSvgDataUrls) ? contains$3(safeSvgDataUrlElements, tagName) : allowSvgDataUrls;
      return !allowed;
    };
    var isInvalidUri = function (settings, uri, tagName) {
      if (settings.allow_html_data_urls) {
        return false;
      } else if (/^data:image\//i.test(uri)) {
        return blockSvgDataUris(settings.allow_svg_data_urls, tagName) && /^data:image\/svg\+xml/i.test(uri);
      } else {
        return /^data:/i.test(uri);
      }
    };
    var findMatchingEndTagIndex = function (schema, html, startIndex) {
      var startTagRegExp = /<([!?\/])?([A-Za-z0-9\-_:.]+)/g;
      var endTagRegExp = /(?:\s(?:[^'">]+(?:"[^"]*"|'[^']*'))*[^"'>]*(?:"[^">]*|'[^'>]*)?|\s*|\/)>/g;
      var shortEndedElements = schema.getShortEndedElements();
      var count = 1, index = startIndex;
      while (count !== 0) {
        startTagRegExp.lastIndex = index;
        while (true) {
          var startMatch = startTagRegExp.exec(html);
          if (startMatch === null) {
            return index;
          } else if (startMatch[1] === '!') {
            if (startsWith(startMatch[2], '--')) {
              index = findCommentEndIndex(html, false, startMatch.index + '!--'.length);
            } else {
              index = findCommentEndIndex(html, true, startMatch.index + 1);
            }
            break;
          } else {
            endTagRegExp.lastIndex = startTagRegExp.lastIndex;
            var endMatch = endTagRegExp.exec(html);
            if (isNull(endMatch) || endMatch.index !== startTagRegExp.lastIndex) {
              continue;
            }
            if (startMatch[1] === '/') {
              count -= 1;
            } else if (!has$2(shortEndedElements, startMatch[2])) {
              count += 1;
            }
            index = startTagRegExp.lastIndex + endMatch[0].length;
            break;
          }
        }
      }
      return index;
    };
    var isConditionalComment = function (html, startIndex) {
      return /^\s*\[if [\w\W]+\]>.*<!\[endif\](--!?)?>/.test(html.substr(startIndex));
    };
    var findCommentEndIndex = function (html, isBogus, startIndex) {
      if (startIndex === void 0) {
        startIndex = 0;
      }
      var lcHtml = html.toLowerCase();
      if (lcHtml.indexOf('[if ', startIndex) !== -1 && isConditionalComment(lcHtml, startIndex)) {
        var endIfIndex = lcHtml.indexOf('[endif]', startIndex);
        return lcHtml.indexOf('>', endIfIndex);
      } else {
        if (isBogus) {
          var endIndex = lcHtml.indexOf('>', startIndex);
          return endIndex !== -1 ? endIndex : lcHtml.length;
        } else {
          var endCommentRegexp = /--!?>/g;
          endCommentRegexp.lastIndex = startIndex;
          var match = endCommentRegexp.exec(html);
          return match ? match.index + match[0].length : lcHtml.length;
        }
      }
    };
    var checkBogusAttribute = function (regExp, attrString) {
      var matches = regExp.exec(attrString);
      if (matches) {
        var name_1 = matches[1];
        var value = matches[2];
        return typeof name_1 === 'string' && name_1.toLowerCase() === 'data-mce-bogus' ? value : null;
      } else {
        return null;
      }
    };
    var SaxParser = function (settings, schema) {
      var _a;
      if (schema === void 0) {
        schema = Schema();
      }
      settings = settings || {};
      var doc = (_a = settings.document) !== null && _a !== void 0 ? _a : document;
      var form = doc.createElement('form');
      if (settings.fix_self_closing !== false) {
        settings.fix_self_closing = true;
      }
      var comment = settings.comment ? settings.comment : noop;
      var cdata = settings.cdata ? settings.cdata : noop;
      var text = settings.text ? settings.text : noop;
      var start = settings.start ? settings.start : noop;
      var end = settings.end ? settings.end : noop;
      var pi = settings.pi ? settings.pi : noop;
      var doctype = settings.doctype ? settings.doctype : noop;
      var parseInternal = function (base64Extract, format) {
        if (format === void 0) {
          format = 'html';
        }
        var html = base64Extract.html;
        var matches, index = 0, value, endRegExp;
        var stack = [];
        var attrList, i, textData, name;
        var isInternalElement, isShortEnded;
        var elementRule, isValidElement, attr, attribsValue, validAttributesMap, validAttributePatterns;
        var attributesRequired, attributesDefault, attributesForced;
        var anyAttributesRequired, attrValue, idCount = 0;
        var decode = Entities.decode;
        var filteredUrlAttrs = Tools.makeMap('src,href,data,background,action,formaction,poster,xlink:href');
        var scriptUriRegExp = /((java|vb)script|mhtml):/i;
        var parsingMode = format === 'html' ? 0 : 1;
        var processEndTag = function (name) {
          var pos, i;
          pos = stack.length;
          while (pos--) {
            if (stack[pos].name === name) {
              break;
            }
          }
          if (pos >= 0) {
            for (i = stack.length - 1; i >= pos; i--) {
              name = stack[i];
              if (name.valid) {
                end(name.name);
              }
            }
            stack.length = pos;
          }
        };
        var processText = function (value, raw) {
          return text(restoreDataUris(value, base64Extract), raw);
        };
        var processComment = function (value) {
          if (value === '') {
            return;
          }
          if (value.charAt(0) === '>') {
            value = ' ' + value;
          }
          if (!settings.allow_conditional_comments && value.substr(0, 3).toLowerCase() === '[if') {
            value = ' ' + value;
          }
          comment(restoreDataUris(value, base64Extract));
        };
        var processAttr = function (value) {
          return restoreDataUris(value, base64Extract);
        };
        var processMalformedComment = function (value, startIndex) {
          var startTag = value || '';
          var isBogus = !startsWith(startTag, '--');
          var endIndex = findCommentEndIndex(html, isBogus, startIndex);
          value = html.substr(startIndex, endIndex - startIndex);
          processComment(isBogus ? startTag + value : value);
          return endIndex + 1;
        };
        var parseAttribute = function (tagName, name, value, val2, val3) {
          var attrRule, i;
          var trimRegExp = /[\s\u0000-\u001F]+/g;
          name = name.toLowerCase();
          value = processAttr(name in fillAttrsMap ? name : decode(value || val2 || val3 || ''));
          if (validate && !isInternalElement && isValidPrefixAttrName(name) === false) {
            attrRule = validAttributesMap[name];
            if (!attrRule && validAttributePatterns) {
              i = validAttributePatterns.length;
              while (i--) {
                attrRule = validAttributePatterns[i];
                if (attrRule.pattern.test(name)) {
                  break;
                }
              }
              if (i === -1) {
                attrRule = null;
              }
            }
            if (!attrRule) {
              return;
            }
            if (attrRule.validValues && !(value in attrRule.validValues)) {
              return;
            }
          }
          var isNameOrId = name === 'name' || name === 'id';
          if (isNameOrId && tagName in filteredClobberElements && (value in doc || value in form)) {
            return;
          }
          if (filteredUrlAttrs[name] && !settings.allow_script_urls) {
            var uri = value.replace(trimRegExp, '');
            try {
              uri = decodeURIComponent(uri);
            } catch (ex) {
              uri = unescape(uri);
            }
            if (scriptUriRegExp.test(uri)) {
              return;
            }
            if (isInvalidUri(settings, uri, tagName)) {
              return;
            }
          }
          if (isInternalElement && (name in filteredUrlAttrs || name.indexOf('on') === 0)) {
            return;
          }
          attrList.map[name] = value;
          attrList.push({
            name: name,
            value: value
          });
        };
        var tokenRegExp = new RegExp('<(?:' + '(?:!--([\\w\\W]*?)--!?>)|' + '(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + '(?:![Dd][Oo][Cc][Tt][Yy][Pp][Ee]([\\w\\W]*?)>)|' + '(?:!(--)?)|' + '(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + '(?:\\/([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)>)|' + '(?:([A-Za-z][A-Za-z0-9\\-_:.]*)(\\s(?:[^\'">]+(?:"[^"]*"|\'[^\']*\'))*[^"\'>]*(?:"[^">]*|\'[^\'>]*)?|\\s*|\\/)>)' + ')', 'g');
        var attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g;
        var shortEndedElements = schema.getShortEndedElements();
        var selfClosing = settings.self_closing_elements || schema.getSelfClosingElements();
        var fillAttrsMap = schema.getBoolAttrs();
        var validate = settings.validate;
        var removeInternalElements = settings.remove_internals;
        var fixSelfClosing = settings.fix_self_closing;
        var specialElements = schema.getSpecialElements();
        var processHtml = html + '>';
        while (matches = tokenRegExp.exec(processHtml)) {
          var matchText = matches[0];
          if (index < matches.index) {
            processText(decode(html.substr(index, matches.index - index)));
          }
          if (value = matches[7]) {
            value = value.toLowerCase();
            if (value.charAt(0) === ':') {
              value = value.substr(1);
            }
            processEndTag(value);
          } else if (value = matches[8]) {
            if (matches.index + matchText.length > html.length) {
              processText(decode(html.substr(matches.index)));
              index = matches.index + matchText.length;
              continue;
            }
            value = value.toLowerCase();
            if (value.charAt(0) === ':') {
              value = value.substr(1);
            }
            isShortEnded = value in shortEndedElements;
            if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value) {
              processEndTag(value);
            }
            var bogusValue = checkBogusAttribute(attrRegExp, matches[9]);
            if (bogusValue !== null) {
              if (bogusValue === 'all') {
                index = findMatchingEndTagIndex(schema, html, tokenRegExp.lastIndex);
                tokenRegExp.lastIndex = index;
                continue;
              }
              isValidElement = false;
            }
            if (!validate || (elementRule = schema.getElementRule(value))) {
              isValidElement = true;
              if (validate) {
                validAttributesMap = elementRule.attributes;
                validAttributePatterns = elementRule.attributePatterns;
              }
              if (attribsValue = matches[9]) {
                isInternalElement = attribsValue.indexOf('data-mce-type') !== -1;
                if (isInternalElement && removeInternalElements) {
                  isValidElement = false;
                }
                attrList = [];
                attrList.map = {};
                attribsValue.replace(attrRegExp, function (match, name, val, val2, val3) {
                  parseAttribute(value, name, val, val2, val3);
                  return '';
                });
              } else {
                attrList = [];
                attrList.map = {};
              }
              if (validate && !isInternalElement) {
                attributesRequired = elementRule.attributesRequired;
                attributesDefault = elementRule.attributesDefault;
                attributesForced = elementRule.attributesForced;
                anyAttributesRequired = elementRule.removeEmptyAttrs;
                if (anyAttributesRequired && !attrList.length) {
                  isValidElement = false;
                }
                if (attributesForced) {
                  i = attributesForced.length;
                  while (i--) {
                    attr = attributesForced[i];
                    name = attr.name;
                    attrValue = attr.value;
                    if (attrValue === '{$uid}') {
                      attrValue = 'mce_' + idCount++;
                    }
                    attrList.map[name] = attrValue;
                    attrList.push({
                      name: name,
                      value: attrValue
                    });
                  }
                }
                if (attributesDefault) {
                  i = attributesDefault.length;
                  while (i--) {
                    attr = attributesDefault[i];
                    name = attr.name;
                    if (!(name in attrList.map)) {
                      attrValue = attr.value;
                      if (attrValue === '{$uid}') {
                        attrValue = 'mce_' + idCount++;
                      }
                      attrList.map[name] = attrValue;
                      attrList.push({
                        name: name,
                        value: attrValue
                      });
                    }
                  }
                }
                if (attributesRequired) {
                  i = attributesRequired.length;
                  while (i--) {
                    if (attributesRequired[i] in attrList.map) {
                      break;
                    }
                  }
                  if (i === -1) {
                    isValidElement = false;
                  }
                }
                if (attr = attrList.map['data-mce-bogus']) {
                  if (attr === 'all') {
                    index = findMatchingEndTagIndex(schema, html, tokenRegExp.lastIndex);
                    tokenRegExp.lastIndex = index;
                    continue;
                  }
                  isValidElement = false;
                }
              }
              if (isValidElement) {
                start(value, attrList, isShortEnded);
              }
            } else {
              isValidElement = false;
            }
            if (endRegExp = specialElements[value]) {
              endRegExp.lastIndex = index = matches.index + matchText.length;
              if (matches = endRegExp.exec(html)) {
                if (isValidElement) {
                  textData = html.substr(index, matches.index - index);
                }
                index = matches.index + matches[0].length;
              } else {
                textData = html.substr(index);
                index = html.length;
              }
              if (isValidElement) {
                if (textData.length > 0) {
                  processText(textData, true);
                }
                end(value);
              }
              tokenRegExp.lastIndex = index;
              continue;
            }
            if (!isShortEnded) {
              if (!attribsValue || attribsValue.indexOf('/') !== attribsValue.length - 1) {
                stack.push({
                  name: value,
                  valid: isValidElement
                });
              } else if (isValidElement) {
                end(value);
              }
            }
          } else if (value = matches[1]) {
            processComment(value);
          } else if (value = matches[2]) {
            var isValidCdataSection = parsingMode === 1 || settings.preserve_cdata || stack.length > 0 && schema.isValidChild(stack[stack.length - 1].name, '#cdata');
            if (isValidCdataSection) {
              cdata(value);
            } else {
              index = processMalformedComment('', matches.index + 2);
              tokenRegExp.lastIndex = index;
              continue;
            }
          } else if (value = matches[3]) {
            doctype(value);
          } else if ((value = matches[4]) || matchText === '<!') {
            index = processMalformedComment(value, matches.index + matchText.length);
            tokenRegExp.lastIndex = index;
            continue;
          } else if (value = matches[5]) {
            if (parsingMode === 1) {
              pi(value, matches[6]);
            } else {
              index = processMalformedComment('?', matches.index + 2);
              tokenRegExp.lastIndex = index;
              continue;
            }
          }
          index = matches.index + matchText.length;
        }
        if (index < html.length) {
          processText(decode(html.substr(index)));
        }
        for (i = stack.length - 1; i >= 0; i--) {
          value = stack[i];
          if (value.valid) {
            end(value.name);
          }
        }
      };
      var parse = function (html, format) {
        if (format === void 0) {
          format = 'html';
        }
        parseInternal(extractBase64DataUris(html), format);
      };
      return { parse: parse };
    };
    SaxParser.findEndTag = findMatchingEndTagIndex;

    var trimHtml = function (tempAttrs, html) {
      var trimContentRegExp = new RegExp(['\\s?(' + tempAttrs.join('|') + ')="[^"]+"'].join('|'), 'gi');
      return html.replace(trimContentRegExp, '');
    };
    var trimInternal = function (serializer, html) {
      var bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
      var schema = serializer.schema;
      var content = trimHtml(serializer.getTempAttrs(), html);
      var shortEndedElements = schema.getShortEndedElements();
      var matches;
      while (matches = bogusAllRegExp.exec(content)) {
        var index = bogusAllRegExp.lastIndex;
        var matchLength = matches[0].length;
        var endTagIndex = void 0;
        if (shortEndedElements[matches[1]]) {
          endTagIndex = index;
        } else {
          endTagIndex = SaxParser.findEndTag(schema, content, index);
        }
        content = content.substring(0, index - matchLength) + content.substring(endTagIndex);
        bogusAllRegExp.lastIndex = index - matchLength;
      }
      return trim$2(content);
    };
    var trimExternal = trimInternal;

    var trimEmptyContents = function (editor, html) {
      var blockName = getForcedRootBlock(editor);
      var emptyRegExp = new RegExp('^(<' + blockName + '[^>]*>(&nbsp;|&#160;|\\s|\xA0|<br \\/>|)<\\/' + blockName + '>[\r\n]*|<br \\/>[\r\n]*)$');
      return html.replace(emptyRegExp, '');
    };
    var setupArgs$3 = function (args, format) {
      return __assign(__assign({}, args), {
        format: format,
        get: true,
        getInner: true
      });
    };
    var getContentFromBody = function (editor, args, format, body) {
      var defaultedArgs = setupArgs$3(args, format);
      var updatedArgs = args.no_events ? defaultedArgs : editor.fire('BeforeGetContent', defaultedArgs);
      var content;
      if (updatedArgs.format === 'raw') {
        content = Tools.trim(trimExternal(editor.serializer, body.innerHTML));
      } else if (updatedArgs.format === 'text') {
        content = editor.dom.isEmpty(body) ? '' : trim$2(body.innerText || body.textContent);
      } else if (updatedArgs.format === 'tree') {
        content = editor.serializer.serialize(body, updatedArgs);
      } else {
        content = trimEmptyContents(editor, editor.serializer.serialize(body, updatedArgs));
      }
      if (!contains$3([
          'text',
          'tree'
        ], updatedArgs.format) && !isWsPreserveElement(SugarElement.fromDom(body))) {
        updatedArgs.content = Tools.trim(content);
      } else {
        updatedArgs.content = content;
      }
      if (updatedArgs.no_events) {
        return updatedArgs.content;
      } else {
        return editor.fire('GetContent', updatedArgs).content;
      }
    };
    var getContentInternal = function (editor, args, format) {
      return Optional.from(editor.getBody()).fold(constant(args.format === 'tree' ? new AstNode('body', 11) : ''), function (body) {
        return getContentFromBody(editor, args, format, body);
      });
    };

    var each$d = Tools.each;
    var ElementUtils = function (dom) {
      var compare = function (node1, node2) {
        if (node1.nodeName !== node2.nodeName) {
          return false;
        }
        var getAttribs = function (node) {
          var attribs = {};
          each$d(dom.getAttribs(node), function (attr) {
            var name = attr.nodeName.toLowerCase();
            if (name.indexOf('_') !== 0 && name !== 'style' && name.indexOf('data-') !== 0) {
              attribs[name] = dom.getAttrib(node, name);
            }
          });
          return attribs;
        };
        var compareObjects = function (obj1, obj2) {
          var value, name;
          for (name in obj1) {
            if (has$2(obj1, name)) {
              value = obj2[name];
              if (typeof value === 'undefined') {
                return false;
              }
              if (obj1[name] !== value) {
                return false;
              }
              delete obj2[name];
            }
          }
          for (name in obj2) {
            if (has$2(obj2, name)) {
              return false;
            }
          }
          return true;
        };
        if (!compareObjects(getAttribs(node1), getAttribs(node2))) {
          return false;
        }
        if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style')))) {
          return false;
        }
        return !isBookmarkNode$1(node1) && !isBookmarkNode$1(node2);
      };
      return { compare: compare };
    };

    var makeMap$1 = Tools.makeMap;
    var Writer = function (settings) {
      var html = [];
      settings = settings || {};
      var indent = settings.indent;
      var indentBefore = makeMap$1(settings.indent_before || '');
      var indentAfter = makeMap$1(settings.indent_after || '');
      var encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
      var htmlOutput = settings.element_format === 'html';
      return {
        start: function (name, attrs, empty) {
          var i, l, attr, value;
          if (indent && indentBefore[name] && html.length > 0) {
            value = html[html.length - 1];
            if (value.length > 0 && value !== '\n') {
              html.push('\n');
            }
          }
          html.push('<', name);
          if (attrs) {
            for (i = 0, l = attrs.length; i < l; i++) {
              attr = attrs[i];
              html.push(' ', attr.name, '="', encode(attr.value, true), '"');
            }
          }
          if (!empty || htmlOutput) {
            html[html.length] = '>';
          } else {
            html[html.length] = ' />';
          }
          if (empty && indent && indentAfter[name] && html.length > 0) {
            value = html[html.length - 1];
            if (value.length > 0 && value !== '\n') {
              html.push('\n');
            }
          }
        },
        end: function (name) {
          var value;
          html.push('</', name, '>');
          if (indent && indentAfter[name] && html.length > 0) {
            value = html[html.length - 1];
            if (value.length > 0 && value !== '\n') {
              html.push('\n');
            }
          }
        },
        text: function (text, raw) {
          if (text.length > 0) {
            html[html.length] = raw ? text : encode(text);
          }
        },
        cdata: function (text) {
          html.push('<![CDATA[', text, ']]>');
        },
        comment: function (text) {
          html.push('<!--', text, '-->');
        },
        pi: function (name, text) {
          if (text) {
            html.push('<?', name, ' ', encode(text), '?>');
          } else {
            html.push('<?', name, '?>');
          }
          if (indent) {
            html.push('\n');
          }
        },
        doctype: function (text) {
          html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
        },
        reset: function () {
          html.length = 0;
        },
        getContent: function () {
          return html.join('').replace(/\n$/, '');
        }
      };
    };

    var HtmlSerializer = function (settings, schema) {
      if (schema === void 0) {
        schema = Schema();
      }
      var writer = Writer(settings);
      settings = settings || {};
      settings.validate = 'validate' in settings ? settings.validate : true;
      var serialize = function (node) {
        var validate = settings.validate;
        var handlers = {
          3: function (node) {
            writer.text(node.value, node.raw);
          },
          8: function (node) {
            writer.comment(node.value);
          },
          7: function (node) {
            writer.pi(node.name, node.value);
          },
          10: function (node) {
            writer.doctype(node.value);
          },
          4: function (node) {
            writer.cdata(node.value);
          },
          11: function (node) {
            if (node = node.firstChild) {
              do {
                walk(node);
              } while (node = node.next);
            }
          }
        };
        writer.reset();
        var walk = function (node) {
          var handler = handlers[node.type];
          if (!handler) {
            var name_1 = node.name;
            var isEmpty = node.shortEnded;
            var attrs = node.attributes;
            if (validate && attrs && attrs.length > 1) {
              var sortedAttrs = [];
              sortedAttrs.map = {};
              var elementRule = schema.getElementRule(node.name);
              if (elementRule) {
                for (var i = 0, l = elementRule.attributesOrder.length; i < l; i++) {
                  var attrName = elementRule.attributesOrder[i];
                  if (attrName in attrs.map) {
                    var attrValue = attrs.map[attrName];
                    sortedAttrs.map[attrName] = attrValue;
                    sortedAttrs.push({
                      name: attrName,
                      value: attrValue
                    });
                  }
                }
                for (var i = 0, l = attrs.length; i < l; i++) {
                  var attrName = attrs[i].name;
                  if (!(attrName in sortedAttrs.map)) {
                    var attrValue = attrs.map[attrName];
                    sortedAttrs.map[attrName] = attrValue;
                    sortedAttrs.push({
                      name: attrName,
                      value: attrValue
                    });
                  }
                }
                attrs = sortedAttrs;
              }
            }
            writer.start(node.name, attrs, isEmpty);
            if (!isEmpty) {
              if (node = node.firstChild) {
                do {
                  walk(node);
                } while (node = node.next);
              }
              writer.end(name_1);
            }
          } else {
            handler(node);
          }
        };
        if (node.type === 1 && !settings.inner) {
          walk(node);
        } else {
          handlers[11](node);
        }
        return writer.getContent();
      };
      return { serialize: serialize };
    };

    var nonInheritableStyles = new Set();
    (function () {
      var nonInheritableStylesArr = [
        'margin',
        'margin-left',
        'margin-right',
        'margin-top',
        'margin-bottom',
        'padding',
        'padding-left',
        'padding-right',
        'padding-top',
        'padding-bottom',
        'border',
        'border-width',
        'border-style',
        'border-color',
        'background',
        'background-attachment',
        'background-clip',
        'background-color',
        'background-image',
        'background-origin',
        'background-position',
        'background-repeat',
        'background-size',
        'float',
        'position',
        'left',
        'right',
        'top',
        'bottom',
        'z-index',
        'display',
        'transform',
        'width',
        'max-width',
        'min-width',
        'height',
        'max-height',
        'min-height',
        'overflow',
        'overflow-x',
        'overflow-y',
        'text-overflow',
        'vertical-align',
        'transition',
        'transition-delay',
        'transition-duration',
        'transition-property',
        'transition-timing-function'
      ];
      each$k(nonInheritableStylesArr, function (style) {
        nonInheritableStyles.add(style);
      });
    }());
    var shorthandStyleProps = [
      'font',
      'text-decoration',
      'text-emphasis'
    ];
    var getStyleProps = function (dom, node) {
      return keys(dom.parseStyle(dom.getAttrib(node, 'style')));
    };
    var isNonInheritableStyle = function (style) {
      return nonInheritableStyles.has(style);
    };
    var hasInheritableStyles = function (dom, node) {
      return forall(getStyleProps(dom, node), function (style) {
        return !isNonInheritableStyle(style);
      });
    };
    var getLonghandStyleProps = function (styles) {
      return filter$4(styles, function (style) {
        return exists(shorthandStyleProps, function (prop) {
          return startsWith(style, prop);
        });
      });
    };
    var hasStyleConflict = function (dom, node, parentNode) {
      var nodeStyleProps = getStyleProps(dom, node);
      var parentNodeStyleProps = getStyleProps(dom, parentNode);
      var valueMismatch = function (prop) {
        var nodeValue = dom.getStyle(node, prop);
        var parentValue = dom.getStyle(parentNode, prop);
        return isNotEmpty(nodeValue) && isNotEmpty(parentValue) && nodeValue !== parentValue;
      };
      return exists(nodeStyleProps, function (nodeStyleProp) {
        var propExists = function (props) {
          return exists(props, function (prop) {
            return prop === nodeStyleProp;
          });
        };
        if (!propExists(parentNodeStyleProps) && propExists(shorthandStyleProps)) {
          var longhandProps = getLonghandStyleProps(parentNodeStyleProps);
          return exists(longhandProps, valueMismatch);
        } else {
          return valueMismatch(nodeStyleProp);
        }
      });
    };

    var isChar = function (forward, predicate, pos) {
      return Optional.from(pos.container()).filter(isText$7).exists(function (text) {
        var delta = forward ? 0 : -1;
        return predicate(text.data.charAt(pos.offset() + delta));
      });
    };
    var isBeforeSpace = curry(isChar, true, isWhiteSpace);
    var isAfterSpace = curry(isChar, false, isWhiteSpace);
    var isEmptyText = function (pos) {
      var container = pos.container();
      return isText$7(container) && (container.data.length === 0 || isZwsp(container.data) && BookmarkManager.isBookmarkNode(container.parentNode));
    };
    var matchesElementPosition = function (before, predicate) {
      return function (pos) {
        return Optional.from(getChildNodeAtRelativeOffset(before ? 0 : -1, pos)).filter(predicate).isSome();
      };
    };
    var isImageBlock = function (node) {
      return isImg(node) && get$5(SugarElement.fromDom(node), 'display') === 'block';
    };
    var isCefNode = function (node) {
      return isContentEditableFalse$b(node) && !isBogusAll$1(node);
    };
    var isBeforeImageBlock = matchesElementPosition(true, isImageBlock);
    var isAfterImageBlock = matchesElementPosition(false, isImageBlock);
    var isBeforeMedia = matchesElementPosition(true, isMedia$2);
    var isAfterMedia = matchesElementPosition(false, isMedia$2);
    var isBeforeTable = matchesElementPosition(true, isTable$3);
    var isAfterTable = matchesElementPosition(false, isTable$3);
    var isBeforeContentEditableFalse = matchesElementPosition(true, isCefNode);
    var isAfterContentEditableFalse = matchesElementPosition(false, isCefNode);

    var getLastChildren = function (elm) {
      var children = [];
      var rawNode = elm.dom;
      while (rawNode) {
        children.push(SugarElement.fromDom(rawNode));
        rawNode = rawNode.lastChild;
      }
      return children;
    };
    var removeTrailingBr = function (elm) {
      var allBrs = descendants(elm, 'br');
      var brs = filter$4(getLastChildren(elm).slice(-1), isBr$4);
      if (allBrs.length === brs.length) {
        each$k(brs, remove$7);
      }
    };
    var fillWithPaddingBr = function (elm) {
      empty(elm);
      append$1(elm, SugarElement.fromHtml('<br data-mce-bogus="1">'));
    };
    var trimBlockTrailingBr = function (elm) {
      lastChild(elm).each(function (lastChild) {
        prevSibling(lastChild).each(function (lastChildPrevSibling) {
          if (isBlock$2(elm) && isBr$4(lastChild) && isBlock$2(lastChildPrevSibling)) {
            remove$7(lastChild);
          }
        });
      });
    };

    var dropLast = function (xs) {
      return xs.slice(0, -1);
    };
    var parentsUntil = function (start, root, predicate) {
      if (contains$1(root, start)) {
        return dropLast(parents$1(start, function (elm) {
          return predicate(elm) || eq(elm, root);
        }));
      } else {
        return [];
      }
    };
    var parents = function (start, root) {
      return parentsUntil(start, root, never);
    };
    var parentsAndSelf = function (start, root) {
      return [start].concat(parents(start, root));
    };

    var navigateIgnoreEmptyTextNodes = function (forward, root, from) {
      return navigateIgnore(forward, root, from, isEmptyText);
    };
    var getClosestBlock$1 = function (root, pos) {
      return find$3(parentsAndSelf(SugarElement.fromDom(pos.container()), root), isBlock$2);
    };
    var isAtBeforeAfterBlockBoundary = function (forward, root, pos) {
      return navigateIgnoreEmptyTextNodes(forward, root.dom, pos).forall(function (newPos) {
        return getClosestBlock$1(root, pos).fold(function () {
          return isInSameBlock(newPos, pos, root.dom) === false;
        }, function (fromBlock) {
          return isInSameBlock(newPos, pos, root.dom) === false && contains$1(fromBlock, SugarElement.fromDom(newPos.container()));
        });
      });
    };
    var isAtBlockBoundary = function (forward, root, pos) {
      return getClosestBlock$1(root, pos).fold(function () {
        return navigateIgnoreEmptyTextNodes(forward, root.dom, pos).forall(function (newPos) {
          return isInSameBlock(newPos, pos, root.dom) === false;
        });
      }, function (parent) {
        return navigateIgnoreEmptyTextNodes(forward, parent.dom, pos).isNone();
      });
    };
    var isAtStartOfBlock = curry(isAtBlockBoundary, false);
    var isAtEndOfBlock = curry(isAtBlockBoundary, true);
    var isBeforeBlock = curry(isAtBeforeAfterBlockBoundary, false);
    var isAfterBlock = curry(isAtBeforeAfterBlockBoundary, true);

    var isBr = function (pos) {
      return getElementFromPosition(pos).exists(isBr$4);
    };
    var findBr = function (forward, root, pos) {
      var parentBlocks = filter$4(parentsAndSelf(SugarElement.fromDom(pos.container()), root), isBlock$2);
      var scope = head(parentBlocks).getOr(root);
      return fromPosition(forward, scope.dom, pos).filter(isBr);
    };
    var isBeforeBr$1 = function (root, pos) {
      return getElementFromPosition(pos).exists(isBr$4) || findBr(true, root, pos).isSome();
    };
    var isAfterBr = function (root, pos) {
      return getElementFromPrevPosition(pos).exists(isBr$4) || findBr(false, root, pos).isSome();
    };
    var findPreviousBr = curry(findBr, false);
    var findNextBr = curry(findBr, true);

    var isInMiddleOfText = function (pos) {
      return CaretPosition.isTextPosition(pos) && !pos.isAtStart() && !pos.isAtEnd();
    };
    var getClosestBlock = function (root, pos) {
      var parentBlocks = filter$4(parentsAndSelf(SugarElement.fromDom(pos.container()), root), isBlock$2);
      return head(parentBlocks).getOr(root);
    };
    var hasSpaceBefore = function (root, pos) {
      if (isInMiddleOfText(pos)) {
        return isAfterSpace(pos);
      } else {
        return isAfterSpace(pos) || prevPosition(getClosestBlock(root, pos).dom, pos).exists(isAfterSpace);
      }
    };
    var hasSpaceAfter = function (root, pos) {
      if (isInMiddleOfText(pos)) {
        return isBeforeSpace(pos);
      } else {
        return isBeforeSpace(pos) || nextPosition(getClosestBlock(root, pos).dom, pos).exists(isBeforeSpace);
      }
    };
    var isPreValue = function (value) {
      return contains$3([
        'pre',
        'pre-wrap'
      ], value);
    };
    var isInPre = function (pos) {
      return getElementFromPosition(pos).bind(function (elm) {
        return closest$3(elm, isElement$6);
      }).exists(function (elm) {
        return isPreValue(get$5(elm, 'white-space'));
      });
    };
    var isAtBeginningOfBody = function (root, pos) {
      return prevPosition(root.dom, pos).isNone();
    };
    var isAtEndOfBody = function (root, pos) {
      return nextPosition(root.dom, pos).isNone();
    };
    var isAtLineBoundary = function (root, pos) {
      return isAtBeginningOfBody(root, pos) || isAtEndOfBody(root, pos) || isAtStartOfBlock(root, pos) || isAtEndOfBlock(root, pos) || isAfterBr(root, pos) || isBeforeBr$1(root, pos);
    };
    var needsToHaveNbsp = function (root, pos) {
      if (isInPre(pos)) {
        return false;
      } else {
        return isAtLineBoundary(root, pos) || hasSpaceBefore(root, pos) || hasSpaceAfter(root, pos);
      }
    };
    var needsToBeNbspLeft = function (root, pos) {
      if (isInPre(pos)) {
        return false;
      } else {
        return isAtStartOfBlock(root, pos) || isBeforeBlock(root, pos) || isAfterBr(root, pos) || hasSpaceBefore(root, pos);
      }
    };
    var leanRight = function (pos) {
      var container = pos.container();
      var offset = pos.offset();
      if (isText$7(container) && offset < container.data.length) {
        return CaretPosition(container, offset + 1);
      } else {
        return pos;
      }
    };
    var needsToBeNbspRight = function (root, pos) {
      if (isInPre(pos)) {
        return false;
      } else {
        return isAtEndOfBlock(root, pos) || isAfterBlock(root, pos) || isBeforeBr$1(root, pos) || hasSpaceAfter(root, pos);
      }
    };
    var needsToBeNbsp = function (root, pos) {
      return needsToBeNbspLeft(root, pos) || needsToBeNbspRight(root, leanRight(pos));
    };
    var isNbspAt = function (text, offset) {
      return isNbsp(text.charAt(offset));
    };
    var hasNbsp = function (pos) {
      var container = pos.container();
      return isText$7(container) && contains$2(container.data, nbsp);
    };
    var normalizeNbspMiddle = function (text) {
      var chars = text.split('');
      return map$3(chars, function (chr, i) {
        if (isNbsp(chr) && i > 0 && i < chars.length - 1 && isContent(chars[i - 1]) && isContent(chars[i + 1])) {
          return ' ';
        } else {
          return chr;
        }
      }).join('');
    };
    var normalizeNbspAtStart = function (root, node) {
      var text = node.data;
      var firstPos = CaretPosition(node, 0);
      if (isNbspAt(text, 0) && !needsToBeNbsp(root, firstPos)) {
        node.data = ' ' + text.slice(1);
        return true;
      } else {
        return false;
      }
    };
    var normalizeNbspInMiddleOfTextNode = function (node) {
      var text = node.data;
      var newText = normalizeNbspMiddle(text);
      if (newText !== text) {
        node.data = newText;
        return true;
      } else {
        return false;
      }
    };
    var normalizeNbspAtEnd = function (root, node) {
      var text = node.data;
      var lastPos = CaretPosition(node, text.length - 1);
      if (isNbspAt(text, text.length - 1) && !needsToBeNbsp(root, lastPos)) {
        node.data = text.slice(0, -1) + ' ';
        return true;
      } else {
        return false;
      }
    };
    var normalizeNbsps = function (root, pos) {
      return Optional.some(pos).filter(hasNbsp).bind(function (pos) {
        var container = pos.container();
        var normalized = normalizeNbspAtStart(root, container) || normalizeNbspInMiddleOfTextNode(container) || normalizeNbspAtEnd(root, container);
        return normalized ? Optional.some(pos) : Optional.none();
      });
    };
    var normalizeNbspsInEditor = function (editor) {
      var root = SugarElement.fromDom(editor.getBody());
      if (editor.selection.isCollapsed()) {
        normalizeNbsps(root, CaretPosition.fromRangeStart(editor.selection.getRng())).each(function (pos) {
          editor.selection.setRng(pos.toRange());
        });
      }
    };

    var normalizeContent = function (content, isStartOfContent, isEndOfContent) {
      var result = foldl(content, function (acc, c) {
        if (isWhiteSpace(c) || isNbsp(c)) {
          if (acc.previousCharIsSpace || acc.str === '' && isStartOfContent || acc.str.length === content.length - 1 && isEndOfContent) {
            return {
              previousCharIsSpace: false,
              str: acc.str + nbsp
            };
          } else {
            return {
              previousCharIsSpace: true,
              str: acc.str + ' '
            };
          }
        } else {
          return {
            previousCharIsSpace: false,
            str: acc.str + c
          };
        }
      }, {
        previousCharIsSpace: false,
        str: ''
      });
      return result.str;
    };
    var normalize$1 = function (node, offset, count) {
      if (count === 0) {
        return;
      }
      var elm = SugarElement.fromDom(node);
      var root = ancestor$3(elm, isBlock$2).getOr(elm);
      var whitespace = node.data.slice(offset, offset + count);
      var isEndOfContent = offset + count >= node.data.length && needsToBeNbspRight(root, CaretPosition(node, node.data.length));
      var isStartOfContent = offset === 0 && needsToBeNbspLeft(root, CaretPosition(node, 0));
      node.replaceData(offset, count, normalizeContent(whitespace, isStartOfContent, isEndOfContent));
    };
    var normalizeWhitespaceAfter = function (node, offset) {
      var content = node.data.slice(offset);
      var whitespaceCount = content.length - lTrim(content).length;
      normalize$1(node, offset, whitespaceCount);
    };
    var normalizeWhitespaceBefore = function (node, offset) {
      var content = node.data.slice(0, offset);
      var whitespaceCount = content.length - rTrim(content).length;
      normalize$1(node, offset - whitespaceCount, whitespaceCount);
    };
    var mergeTextNodes = function (prevNode, nextNode, normalizeWhitespace, mergeToPrev) {
      if (mergeToPrev === void 0) {
        mergeToPrev = true;
      }
      var whitespaceOffset = rTrim(prevNode.data).length;
      var newNode = mergeToPrev ? prevNode : nextNode;
      var removeNode = mergeToPrev ? nextNode : prevNode;
      if (mergeToPrev) {
        newNode.appendData(removeNode.data);
      } else {
        newNode.insertData(0, removeNode.data);
      }
      remove$7(SugarElement.fromDom(removeNode));
      if (normalizeWhitespace) {
        normalizeWhitespaceAfter(newNode, whitespaceOffset);
      }
      return newNode;
    };

    var needsReposition = function (pos, elm) {
      var container = pos.container();
      var offset = pos.offset();
      return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
    };
    var reposition = function (elm, pos) {
      return needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;
    };
    var beforeOrStartOf = function (node) {
      return isText$7(node) ? CaretPosition(node, 0) : CaretPosition.before(node);
    };
    var afterOrEndOf = function (node) {
      return isText$7(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);
    };
    var getPreviousSiblingCaretPosition = function (elm) {
      if (isCaretCandidate$3(elm.previousSibling)) {
        return Optional.some(afterOrEndOf(elm.previousSibling));
      } else {
        return elm.previousSibling ? lastPositionIn(elm.previousSibling) : Optional.none();
      }
    };
    var getNextSiblingCaretPosition = function (elm) {
      if (isCaretCandidate$3(elm.nextSibling)) {
        return Optional.some(beforeOrStartOf(elm.nextSibling));
      } else {
        return elm.nextSibling ? firstPositionIn(elm.nextSibling) : Optional.none();
      }
    };
    var findCaretPositionBackwardsFromElm = function (rootElement, elm) {
      var startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
      return prevPosition(rootElement, startPosition).fold(function () {
        return nextPosition(rootElement, CaretPosition.after(elm));
      }, Optional.some);
    };
    var findCaretPositionForwardsFromElm = function (rootElement, elm) {
      return nextPosition(rootElement, CaretPosition.after(elm)).fold(function () {
        return prevPosition(rootElement, CaretPosition.before(elm));
      }, Optional.some);
    };
    var findCaretPositionBackwards = function (rootElement, elm) {
      return getPreviousSiblingCaretPosition(elm).orThunk(function () {
        return getNextSiblingCaretPosition(elm);
      }).orThunk(function () {
        return findCaretPositionBackwardsFromElm(rootElement, elm);
      });
    };
    var findCaretPositionForward = function (rootElement, elm) {
      return getNextSiblingCaretPosition(elm).orThunk(function () {
        return getPreviousSiblingCaretPosition(elm);
      }).orThunk(function () {
        return findCaretPositionForwardsFromElm(rootElement, elm);
      });
    };
    var findCaretPosition = function (forward, rootElement, elm) {
      return forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);
    };
    var findCaretPosOutsideElmAfterDelete = function (forward, rootElement, elm) {
      return findCaretPosition(forward, rootElement, elm).map(curry(reposition, elm));
    };
    var setSelection$1 = function (editor, forward, pos) {
      pos.fold(function () {
        editor.focus();
      }, function (pos) {
        editor.selection.setRng(pos.toRange(), forward);
      });
    };
    var eqRawNode = function (rawNode) {
      return function (elm) {
        return elm.dom === rawNode;
      };
    };
    var isBlock = function (editor, elm) {
      return elm && has$2(editor.schema.getBlockElements(), name(elm));
    };
    var paddEmptyBlock = function (elm) {
      if (isEmpty$2(elm)) {
        var br = SugarElement.fromHtml('<br data-mce-bogus="1">');
        empty(elm);
        append$1(elm, br);
        return Optional.some(CaretPosition.before(br.dom));
      } else {
        return Optional.none();
      }
    };
    var deleteNormalized = function (elm, afterDeletePosOpt, normalizeWhitespace) {
      var prevTextOpt = prevSibling(elm).filter(isText$8);
      var nextTextOpt = nextSibling(elm).filter(isText$8);
      remove$7(elm);
      return lift3(prevTextOpt, nextTextOpt, afterDeletePosOpt, function (prev, next, pos) {
        var prevNode = prev.dom, nextNode = next.dom;
        var offset = prevNode.data.length;
        mergeTextNodes(prevNode, nextNode, normalizeWhitespace);
        return pos.container() === nextNode ? CaretPosition(prevNode, offset) : pos;
      }).orThunk(function () {
        if (normalizeWhitespace) {
          prevTextOpt.each(function (elm) {
            return normalizeWhitespaceBefore(elm.dom, elm.dom.length);
          });
          nextTextOpt.each(function (elm) {
            return normalizeWhitespaceAfter(elm.dom, 0);
          });
        }
        return afterDeletePosOpt;
      });
    };
    var isInlineElement = function (editor, element) {
      return has$2(editor.schema.getTextInlineElements(), name(element));
    };
    var deleteElement$2 = function (editor, forward, elm, moveCaret) {
      if (moveCaret === void 0) {
        moveCaret = true;
      }
      var afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom);
      var parentBlock = ancestor$3(elm, curry(isBlock, editor), eqRawNode(editor.getBody()));
      var normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos, isInlineElement(editor, elm));
      if (editor.dom.isEmpty(editor.getBody())) {
        editor.setContent('');
        editor.selection.setCursorLocation();
      } else {
        parentBlock.bind(paddEmptyBlock).fold(function () {
          if (moveCaret) {
            setSelection$1(editor, forward, normalizedAfterDeletePos);
          }
        }, function (paddPos) {
          if (moveCaret) {
            setSelection$1(editor, forward, Optional.some(paddPos));
          }
        });
      }
    };

    var isRootFromElement = function (root) {
      return function (cur) {
        return eq(root, cur);
      };
    };
    var getTableCells = function (table) {
      return descendants(table, 'td,th');
    };
    var getTableDetailsFromRange = function (rng, isRoot) {
      var getTable = function (node) {
        return getClosestTable(SugarElement.fromDom(node), isRoot);
      };
      var startTable = getTable(rng.startContainer);
      var endTable = getTable(rng.endContainer);
      var isStartInTable = startTable.isSome();
      var isEndInTable = endTable.isSome();
      var isSameTable = lift2(startTable, endTable, eq).getOr(false);
      var isMultiTable = !isSameTable && isStartInTable && isEndInTable;
      return {
        startTable: startTable,
        endTable: endTable,
        isStartInTable: isStartInTable,
        isEndInTable: isEndInTable,
        isSameTable: isSameTable,
        isMultiTable: isMultiTable
      };
    };

    var tableCellRng = function (start, end) {
      return {
        start: start,
        end: end
      };
    };
    var tableSelection = function (rng, table, cells) {
      return {
        rng: rng,
        table: table,
        cells: cells
      };
    };
    var deleteAction = Adt.generate([
      {
        singleCellTable: [
          'rng',
          'cell'
        ]
      },
      { fullTable: ['table'] },
      {
        partialTable: [
          'cells',
          'outsideDetails'
        ]
      },
      {
        multiTable: [
          'startTableCells',
          'endTableCells',
          'betweenRng'
        ]
      }
    ]);
    var getClosestCell$1 = function (container, isRoot) {
      return closest$2(SugarElement.fromDom(container), 'td,th', isRoot);
    };
    var isExpandedCellRng = function (cellRng) {
      return !eq(cellRng.start, cellRng.end);
    };
    var getTableFromCellRng = function (cellRng, isRoot) {
      return getClosestTable(cellRng.start, isRoot).bind(function (startParentTable) {
        return getClosestTable(cellRng.end, isRoot).bind(function (endParentTable) {
          return someIf(eq(startParentTable, endParentTable), startParentTable);
        });
      });
    };
    var isSingleCellTable = function (cellRng, isRoot) {
      return !isExpandedCellRng(cellRng) && getTableFromCellRng(cellRng, isRoot).exists(function (table) {
        var rows = table.dom.rows;
        return rows.length === 1 && rows[0].cells.length === 1;
      });
    };
    var getCellRng = function (rng, isRoot) {
      var startCell = getClosestCell$1(rng.startContainer, isRoot);
      var endCell = getClosestCell$1(rng.endContainer, isRoot);
      return lift2(startCell, endCell, tableCellRng);
    };
    var getCellRangeFromStartTable = function (isRoot) {
      return function (startCell) {
        return getClosestTable(startCell, isRoot).bind(function (table) {
          return last$2(getTableCells(table)).map(function (endCell) {
            return tableCellRng(startCell, endCell);
          });
        });
      };
    };
    var getCellRangeFromEndTable = function (isRoot) {
      return function (endCell) {
        return getClosestTable(endCell, isRoot).bind(function (table) {
          return head(getTableCells(table)).map(function (startCell) {
            return tableCellRng(startCell, endCell);
          });
        });
      };
    };
    var getTableSelectionFromCellRng = function (isRoot) {
      return function (cellRng) {
        return getTableFromCellRng(cellRng, isRoot).map(function (table) {
          return tableSelection(cellRng, table, getTableCells(table));
        });
      };
    };
    var getTableSelections = function (cellRng, selectionDetails, rng, isRoot) {
      if (rng.collapsed || !cellRng.forall(isExpandedCellRng)) {
        return Optional.none();
      } else if (selectionDetails.isSameTable) {
        var sameTableSelection = cellRng.bind(getTableSelectionFromCellRng(isRoot));
        return Optional.some({
          start: sameTableSelection,
          end: sameTableSelection
        });
      } else {
        var startCell = getClosestCell$1(rng.startContainer, isRoot);
        var endCell = getClosestCell$1(rng.endContainer, isRoot);
        var startTableSelection = startCell.bind(getCellRangeFromStartTable(isRoot)).bind(getTableSelectionFromCellRng(isRoot));
        var endTableSelection = endCell.bind(getCellRangeFromEndTable(isRoot)).bind(getTableSelectionFromCellRng(isRoot));
        return Optional.some({
          start: startTableSelection,
          end: endTableSelection
        });
      }
    };
    var getCellIndex = function (cells, cell) {
      return findIndex$2(cells, function (x) {
        return eq(x, cell);
      });
    };
    var getSelectedCells = function (tableSelection) {
      return lift2(getCellIndex(tableSelection.cells, tableSelection.rng.start), getCellIndex(tableSelection.cells, tableSelection.rng.end), function (startIndex, endIndex) {
        return tableSelection.cells.slice(startIndex, endIndex + 1);
      });
    };
    var isSingleCellTableContentSelected = function (optCellRng, rng, isRoot) {
      return optCellRng.exists(function (cellRng) {
        return isSingleCellTable(cellRng, isRoot) && hasAllContentsSelected(cellRng.start, rng);
      });
    };
    var unselectCells = function (rng, selectionDetails) {
      var startTable = selectionDetails.startTable, endTable = selectionDetails.endTable;
      var otherContentRng = rng.cloneRange();
      startTable.each(function (table) {
        return otherContentRng.setStartAfter(table.dom);
      });
      endTable.each(function (table) {
        return otherContentRng.setEndBefore(table.dom);
      });
      return otherContentRng;
    };
    var handleSingleTable = function (cellRng, selectionDetails, rng, isRoot) {
      return getTableSelections(cellRng, selectionDetails, rng, isRoot).bind(function (_a) {
        var start = _a.start, end = _a.end;
        return start.or(end);
      }).bind(function (tableSelection) {
        var isSameTable = selectionDetails.isSameTable;
        var selectedCells = getSelectedCells(tableSelection).getOr([]);
        if (isSameTable && tableSelection.cells.length === selectedCells.length) {
          return Optional.some(deleteAction.fullTable(tableSelection.table));
        } else if (selectedCells.length > 0) {
          if (isSameTable) {
            return Optional.some(deleteAction.partialTable(selectedCells, Optional.none()));
          } else {
            var otherContentRng = unselectCells(rng, selectionDetails);
            return Optional.some(deleteAction.partialTable(selectedCells, Optional.some(__assign(__assign({}, selectionDetails), { rng: otherContentRng }))));
          }
        } else {
          return Optional.none();
        }
      });
    };
    var handleMultiTable = function (cellRng, selectionDetails, rng, isRoot) {
      return getTableSelections(cellRng, selectionDetails, rng, isRoot).bind(function (_a) {
        var start = _a.start, end = _a.end;
        var startTableSelectedCells = start.bind(getSelectedCells).getOr([]);
        var endTableSelectedCells = end.bind(getSelectedCells).getOr([]);
        if (startTableSelectedCells.length > 0 && endTableSelectedCells.length > 0) {
          var otherContentRng = unselectCells(rng, selectionDetails);
          return Optional.some(deleteAction.multiTable(startTableSelectedCells, endTableSelectedCells, otherContentRng));
        } else {
          return Optional.none();
        }
      });
    };
    var getActionFromRange = function (root, rng) {
      var isRoot = isRootFromElement(root);
      var optCellRng = getCellRng(rng, isRoot);
      var selectionDetails = getTableDetailsFromRange(rng, isRoot);
      if (isSingleCellTableContentSelected(optCellRng, rng, isRoot)) {
        return optCellRng.map(function (cellRng) {
          return deleteAction.singleCellTable(rng, cellRng.start);
        });
      } else if (selectionDetails.isMultiTable) {
        return handleMultiTable(optCellRng, selectionDetails, rng, isRoot);
      } else {
        return handleSingleTable(optCellRng, selectionDetails, rng, isRoot);
      }
    };

    var freefallRtl = function (root) {
      var child = isComment$1(root) ? prevSibling(root) : lastChild(root);
      return child.bind(freefallRtl).orThunk(function () {
        return Optional.some(root);
      });
    };
    var cleanCells = function (cells) {
      return each$k(cells, function (cell) {
        remove$6(cell, 'contenteditable');
        fillWithPaddingBr(cell);
      });
    };
    var getOutsideBlock = function (editor, container) {
      return Optional.from(editor.dom.getParent(container, editor.dom.isBlock)).map(SugarElement.fromDom);
    };
    var handleEmptyBlock = function (editor, startInTable, emptyBlock) {
      emptyBlock.each(function (block) {
        if (startInTable) {
          remove$7(block);
        } else {
          fillWithPaddingBr(block);
          editor.selection.setCursorLocation(block.dom, 0);
        }
      });
    };
    var setCursorInCell = function (editor, cell) {
      var selectedCells = getCellsFromEditor(editor);
      editor.selection.setCursorLocation(cell.dom, 0);
      if (selectedCells.length > 1) {
        set$1(cell, 'data-mce-selected', '1');
      }
    };
    var emptySingleTableCells = function (editor, cells, outsideDetails) {
      cleanCells(cells);
      outsideDetails.map(function (_a) {
        var rng = _a.rng, isStartInTable = _a.isStartInTable;
        var outsideBlock = getOutsideBlock(editor, isStartInTable ? rng.endContainer : rng.startContainer);
        rng.deleteContents();
        handleEmptyBlock(editor, isStartInTable, outsideBlock.filter(isEmpty$2));
      });
      if (outsideDetails.forall(function (details) {
          return details.isStartInTable;
        })) {
        setCursorInCell(editor, cells[0]);
      } else {
        editor.selection.collapse(true);
      }
      return true;
    };
    var emptyMultiTableCells = function (editor, startTableCells, endTableCells, betweenRng) {
      cleanCells(startTableCells.concat(endTableCells));
      betweenRng.deleteContents();
      setCursorInCell(editor, startTableCells[0]);
      return true;
    };
    var deleteCellContents = function (editor, rng, cell) {
      rng.deleteContents();
      var lastNode = freefallRtl(cell).getOr(cell);
      var lastBlock = SugarElement.fromDom(editor.dom.getParent(lastNode.dom, editor.dom.isBlock));
      if (isEmpty$2(lastBlock)) {
        fillWithPaddingBr(lastBlock);
        editor.selection.setCursorLocation(lastBlock.dom, 0);
      }
      if (!eq(cell, lastBlock)) {
        var additionalCleanupNodes = is$1(parent(lastBlock), cell) ? [] : siblings(lastBlock);
        each$k(additionalCleanupNodes.concat(children(cell)), function (node) {
          if (!eq(node, lastBlock) && !contains$1(node, lastBlock)) {
            remove$7(node);
          }
        });
      }
      return true;
    };
    var deleteTableElement = function (editor, table) {
      deleteElement$2(editor, false, table);
      return true;
    };
    var deleteCellRange = function (editor, rootElm, rng) {
      return getActionFromRange(rootElm, rng).map(function (action) {
        return action.fold(curry(deleteCellContents, editor), curry(deleteTableElement, editor), curry(emptySingleTableCells, editor), curry(emptyMultiTableCells, editor));
      });
    };
    var deleteCaptionRange = function (editor, caption) {
      return emptyElement(editor, caption);
    };
    var deleteTableRange = function (editor, rootElm, rng, startElm) {
      return getParentCaption(rootElm, startElm).fold(function () {
        return deleteCellRange(editor, rootElm, rng);
      }, function (caption) {
        return deleteCaptionRange(editor, caption);
      }).getOr(false);
    };
    var deleteRange$2 = function (editor, startElm, selectedCells) {
      var rootNode = SugarElement.fromDom(editor.getBody());
      var rng = editor.selection.getRng();
      