var RSCore = (function (exports, rxjs) {
  'use strict';

  const configSettings = {
      logLevel: 'info' ,
      log: (msg, type = 'info') => {
          console && console[type] && console[type](msg);
      }
  };
  const config$1 = (args) => {
      const keys = Object.keys(args);
      keys.forEach((key) => {
          if (key in configSettings && typeof args[key] !== 'undefined') {
              configSettings[key] = args[key];
          }
      });
  };
  const debug = (msg, type = 'info', condition = true) => {
      if (!condition)
          return;
      const levels = ['info', 'warn', 'error', 'never'];
      if (levels.indexOf(configSettings.logLevel) > levels.indexOf(type))
          return;
      configSettings.log(msg, type);
  };
  const empty = Symbol('empty');

  class Disposable {
      constructor() {
          this.$_disposers = [];
      }
      beforeDispose(disposer) {
          this.$_disposers.push(disposer);
      }
      dispose() {
          this.$_disposers.forEach((disposer) => {
              disposer();
          });
      }
  }

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
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
      while(len) {
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
  function nextTick(fun) {
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
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var browser$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var Reflect$1;
  (function (Reflect) {
      // Metadata Proposal
      // https://rbuckton.github.io/reflect-metadata/
      (function (factory) {
          var root = typeof commonjsGlobal === "object" ? commonjsGlobal :
              typeof self === "object" ? self :
                  typeof this === "object" ? this :
                      Function("return this;")();
          var exporter = makeExporter(Reflect);
          if (typeof root.Reflect === "undefined") {
              root.Reflect = Reflect;
          }
          else {
              exporter = makeExporter(root.Reflect, exporter);
          }
          factory(exporter);
          function makeExporter(target, previous) {
              return function (key, value) {
                  if (typeof target[key] !== "function") {
                      Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                  }
                  if (previous)
                      previous(key, value);
              };
          }
      })(function (exporter) {
          var hasOwn = Object.prototype.hasOwnProperty;
          // feature test for Symbol support
          var supportsSymbol = typeof Symbol === "function";
          var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
          var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
          var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
          var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
          var downLevel = !supportsCreate && !supportsProto;
          var HashMap = {
              // create an object in dictionary mode (a.k.a. "slow" mode in v8)
              create: supportsCreate
                  ? function () { return MakeDictionary(Object.create(null)); }
                  : supportsProto
                      ? function () { return MakeDictionary({ __proto__: null }); }
                      : function () { return MakeDictionary({}); },
              has: downLevel
                  ? function (map, key) { return hasOwn.call(map, key); }
                  : function (map, key) { return key in map; },
              get: downLevel
                  ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                  : function (map, key) { return map[key]; },
          };
          // Load global or shim versions of Map, Set, and WeakMap
          var functionPrototype = Object.getPrototypeOf(Function);
          var usePolyfill = typeof browser$1 === "object" && browser$1.env && browser$1.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
          var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
          var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
          var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
          // [[Metadata]] internal slot
          // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
          var Metadata = new _WeakMap();
          /**
           * Applies a set of decorators to a property of a target object.
           * @param decorators An array of decorators.
           * @param target The target object.
           * @param propertyKey (Optional) The property key to decorate.
           * @param attributes (Optional) The property descriptor for the target key.
           * @remarks Decorators are applied in reverse order.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     Example = Reflect.decorate(decoratorsArray, Example);
           *
           *     // property (on constructor)
           *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
           *
           *     // property (on prototype)
           *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
           *
           *     // method (on constructor)
           *     Object.defineProperty(Example, "staticMethod",
           *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
           *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
           *
           *     // method (on prototype)
           *     Object.defineProperty(Example.prototype, "method",
           *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
           *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
           *
           */
          function decorate(decorators, target, propertyKey, attributes) {
              if (!IsUndefined(propertyKey)) {
                  if (!IsArray(decorators))
                      throw new TypeError();
                  if (!IsObject(target))
                      throw new TypeError();
                  if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                      throw new TypeError();
                  if (IsNull(attributes))
                      attributes = undefined;
                  propertyKey = ToPropertyKey(propertyKey);
                  return DecorateProperty(decorators, target, propertyKey, attributes);
              }
              else {
                  if (!IsArray(decorators))
                      throw new TypeError();
                  if (!IsConstructor(target))
                      throw new TypeError();
                  return DecorateConstructor(decorators, target);
              }
          }
          exporter("decorate", decorate);
          // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
          // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
          /**
           * A default metadata decorator factory that can be used on a class, class member, or parameter.
           * @param metadataKey The key for the metadata entry.
           * @param metadataValue The value for the metadata entry.
           * @returns A decorator function.
           * @remarks
           * If `metadataKey` is already defined for the target and target key, the
           * metadataValue for that key will be overwritten.
           * @example
           *
           *     // constructor
           *     @Reflect.metadata(key, value)
           *     class Example {
           *     }
           *
           *     // property (on constructor, TypeScript only)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         static staticProperty;
           *     }
           *
           *     // property (on prototype, TypeScript only)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         property;
           *     }
           *
           *     // method (on constructor)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         static staticMethod() { }
           *     }
           *
           *     // method (on prototype)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         method() { }
           *     }
           *
           */
          function metadata(metadataKey, metadataValue) {
              function decorator(target, propertyKey) {
                  if (!IsObject(target))
                      throw new TypeError();
                  if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                      throw new TypeError();
                  OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
              }
              return decorator;
          }
          exporter("metadata", metadata);
          /**
           * Define a unique metadata entry on the target.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param metadataValue A value that contains attached metadata.
           * @param target The target object on which to define metadata.
           * @param propertyKey (Optional) The property key for the target.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     Reflect.defineMetadata("custom:annotation", options, Example);
           *
           *     // property (on constructor)
           *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
           *
           *     // property (on prototype)
           *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
           *
           *     // method (on constructor)
           *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
           *
           *     // method (on prototype)
           *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
           *
           *     // decorator factory as metadata-producing annotation.
           *     function MyAnnotation(options): Decorator {
           *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
           *     }
           *
           */
          function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
          }
          exporter("defineMetadata", defineMetadata);
          /**
           * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.hasMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function hasMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryHasMetadata(metadataKey, target, propertyKey);
          }
          exporter("hasMetadata", hasMetadata);
          /**
           * Gets a value indicating whether the target object has the provided metadata key defined.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function hasOwnMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
          }
          exporter("hasOwnMetadata", hasOwnMetadata);
          /**
           * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function getMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryGetMetadata(metadataKey, target, propertyKey);
          }
          exporter("getMetadata", getMetadata);
          /**
           * Gets the metadata value for the provided metadata key on the target object.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getOwnMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function getOwnMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
          }
          exporter("getOwnMetadata", getOwnMetadata);
          /**
           * Gets the metadata keys defined on the target object or its prototype chain.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns An array of unique metadata keys.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getMetadataKeys(Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getMetadataKeys(Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getMetadataKeys(Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getMetadataKeys(Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getMetadataKeys(Example.prototype, "method");
           *
           */
          function getMetadataKeys(target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryMetadataKeys(target, propertyKey);
          }
          exporter("getMetadataKeys", getMetadataKeys);
          /**
           * Gets the unique metadata keys defined on the target object.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns An array of unique metadata keys.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getOwnMetadataKeys(Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
           *
           */
          function getOwnMetadataKeys(target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryOwnMetadataKeys(target, propertyKey);
          }
          exporter("getOwnMetadataKeys", getOwnMetadataKeys);
          /**
           * Deletes the metadata entry from the target object with the provided key.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns `true` if the metadata entry was found and deleted; otherwise, false.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.deleteMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function deleteMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return false;
              if (!metadataMap.delete(metadataKey))
                  return false;
              if (metadataMap.size > 0)
                  return true;
              var targetMetadata = Metadata.get(target);
              targetMetadata.delete(propertyKey);
              if (targetMetadata.size > 0)
                  return true;
              Metadata.delete(target);
              return true;
          }
          exporter("deleteMetadata", deleteMetadata);
          function DecorateConstructor(decorators, target) {
              for (var i = decorators.length - 1; i >= 0; --i) {
                  var decorator = decorators[i];
                  var decorated = decorator(target);
                  if (!IsUndefined(decorated) && !IsNull(decorated)) {
                      if (!IsConstructor(decorated))
                          throw new TypeError();
                      target = decorated;
                  }
              }
              return target;
          }
          function DecorateProperty(decorators, target, propertyKey, descriptor) {
              for (var i = decorators.length - 1; i >= 0; --i) {
                  var decorator = decorators[i];
                  var decorated = decorator(target, propertyKey, descriptor);
                  if (!IsUndefined(decorated) && !IsNull(decorated)) {
                      if (!IsObject(decorated))
                          throw new TypeError();
                      descriptor = decorated;
                  }
              }
              return descriptor;
          }
          function GetOrCreateMetadataMap(O, P, Create) {
              var targetMetadata = Metadata.get(O);
              if (IsUndefined(targetMetadata)) {
                  if (!Create)
                      return undefined;
                  targetMetadata = new _Map();
                  Metadata.set(O, targetMetadata);
              }
              var metadataMap = targetMetadata.get(P);
              if (IsUndefined(metadataMap)) {
                  if (!Create)
                      return undefined;
                  metadataMap = new _Map();
                  targetMetadata.set(P, metadataMap);
              }
              return metadataMap;
          }
          // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
          function OrdinaryHasMetadata(MetadataKey, O, P) {
              var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
              if (hasOwn)
                  return true;
              var parent = OrdinaryGetPrototypeOf(O);
              if (!IsNull(parent))
                  return OrdinaryHasMetadata(MetadataKey, parent, P);
              return false;
          }
          // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
          function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return false;
              return ToBoolean(metadataMap.has(MetadataKey));
          }
          // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
          function OrdinaryGetMetadata(MetadataKey, O, P) {
              var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
              if (hasOwn)
                  return OrdinaryGetOwnMetadata(MetadataKey, O, P);
              var parent = OrdinaryGetPrototypeOf(O);
              if (!IsNull(parent))
                  return OrdinaryGetMetadata(MetadataKey, parent, P);
              return undefined;
          }
          // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
          function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return undefined;
              return metadataMap.get(MetadataKey);
          }
          // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
          function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
              metadataMap.set(MetadataKey, MetadataValue);
          }
          // 3.1.6.1 OrdinaryMetadataKeys(O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
          function OrdinaryMetadataKeys(O, P) {
              var ownKeys = OrdinaryOwnMetadataKeys(O, P);
              var parent = OrdinaryGetPrototypeOf(O);
              if (parent === null)
                  return ownKeys;
              var parentKeys = OrdinaryMetadataKeys(parent, P);
              if (parentKeys.length <= 0)
                  return ownKeys;
              if (ownKeys.length <= 0)
                  return parentKeys;
              var set = new _Set();
              var keys = [];
              for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                  var key = ownKeys_1[_i];
                  var hasKey = set.has(key);
                  if (!hasKey) {
                      set.add(key);
                      keys.push(key);
                  }
              }
              for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                  var key = parentKeys_1[_a];
                  var hasKey = set.has(key);
                  if (!hasKey) {
                      set.add(key);
                      keys.push(key);
                  }
              }
              return keys;
          }
          // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
          function OrdinaryOwnMetadataKeys(O, P) {
              var keys = [];
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return keys;
              var keysObj = metadataMap.keys();
              var iterator = GetIterator(keysObj);
              var k = 0;
              while (true) {
                  var next = IteratorStep(iterator);
                  if (!next) {
                      keys.length = k;
                      return keys;
                  }
                  var nextValue = IteratorValue(next);
                  try {
                      keys[k] = nextValue;
                  }
                  catch (e) {
                      try {
                          IteratorClose(iterator);
                      }
                      finally {
                          throw e;
                      }
                  }
                  k++;
              }
          }
          // 6 ECMAScript Data Typ0es and Values
          // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
          function Type(x) {
              if (x === null)
                  return 1 /* Null */;
              switch (typeof x) {
                  case "undefined": return 0 /* Undefined */;
                  case "boolean": return 2 /* Boolean */;
                  case "string": return 3 /* String */;
                  case "symbol": return 4 /* Symbol */;
                  case "number": return 5 /* Number */;
                  case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                  default: return 6 /* Object */;
              }
          }
          // 6.1.1 The Undefined Type
          // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
          function IsUndefined(x) {
              return x === undefined;
          }
          // 6.1.2 The Null Type
          // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
          function IsNull(x) {
              return x === null;
          }
          // 6.1.5 The Symbol Type
          // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
          function IsSymbol(x) {
              return typeof x === "symbol";
          }
          // 6.1.7 The Object Type
          // https://tc39.github.io/ecma262/#sec-object-type
          function IsObject(x) {
              return typeof x === "object" ? x !== null : typeof x === "function";
          }
          // 7.1 Type Conversion
          // https://tc39.github.io/ecma262/#sec-type-conversion
          // 7.1.1 ToPrimitive(input [, PreferredType])
          // https://tc39.github.io/ecma262/#sec-toprimitive
          function ToPrimitive(input, PreferredType) {
              switch (Type(input)) {
                  case 0 /* Undefined */: return input;
                  case 1 /* Null */: return input;
                  case 2 /* Boolean */: return input;
                  case 3 /* String */: return input;
                  case 4 /* Symbol */: return input;
                  case 5 /* Number */: return input;
              }
              var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
              var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
              if (exoticToPrim !== undefined) {
                  var result = exoticToPrim.call(input, hint);
                  if (IsObject(result))
                      throw new TypeError();
                  return result;
              }
              return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
          }
          // 7.1.1.1 OrdinaryToPrimitive(O, hint)
          // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
          function OrdinaryToPrimitive(O, hint) {
              if (hint === "string") {
                  var toString_1 = O.toString;
                  if (IsCallable(toString_1)) {
                      var result = toString_1.call(O);
                      if (!IsObject(result))
                          return result;
                  }
                  var valueOf = O.valueOf;
                  if (IsCallable(valueOf)) {
                      var result = valueOf.call(O);
                      if (!IsObject(result))
                          return result;
                  }
              }
              else {
                  var valueOf = O.valueOf;
                  if (IsCallable(valueOf)) {
                      var result = valueOf.call(O);
                      if (!IsObject(result))
                          return result;
                  }
                  var toString_2 = O.toString;
                  if (IsCallable(toString_2)) {
                      var result = toString_2.call(O);
                      if (!IsObject(result))
                          return result;
                  }
              }
              throw new TypeError();
          }
          // 7.1.2 ToBoolean(argument)
          // https://tc39.github.io/ecma262/2016/#sec-toboolean
          function ToBoolean(argument) {
              return !!argument;
          }
          // 7.1.12 ToString(argument)
          // https://tc39.github.io/ecma262/#sec-tostring
          function ToString(argument) {
              return "" + argument;
          }
          // 7.1.14 ToPropertyKey(argument)
          // https://tc39.github.io/ecma262/#sec-topropertykey
          function ToPropertyKey(argument) {
              var key = ToPrimitive(argument, 3 /* String */);
              if (IsSymbol(key))
                  return key;
              return ToString(key);
          }
          // 7.2 Testing and Comparison Operations
          // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
          // 7.2.2 IsArray(argument)
          // https://tc39.github.io/ecma262/#sec-isarray
          function IsArray(argument) {
              return Array.isArray
                  ? Array.isArray(argument)
                  : argument instanceof Object
                      ? argument instanceof Array
                      : Object.prototype.toString.call(argument) === "[object Array]";
          }
          // 7.2.3 IsCallable(argument)
          // https://tc39.github.io/ecma262/#sec-iscallable
          function IsCallable(argument) {
              // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
              return typeof argument === "function";
          }
          // 7.2.4 IsConstructor(argument)
          // https://tc39.github.io/ecma262/#sec-isconstructor
          function IsConstructor(argument) {
              // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
              return typeof argument === "function";
          }
          // 7.2.7 IsPropertyKey(argument)
          // https://tc39.github.io/ecma262/#sec-ispropertykey
          function IsPropertyKey(argument) {
              switch (Type(argument)) {
                  case 3 /* String */: return true;
                  case 4 /* Symbol */: return true;
                  default: return false;
              }
          }
          // 7.3 Operations on Objects
          // https://tc39.github.io/ecma262/#sec-operations-on-objects
          // 7.3.9 GetMethod(V, P)
          // https://tc39.github.io/ecma262/#sec-getmethod
          function GetMethod(V, P) {
              var func = V[P];
              if (func === undefined || func === null)
                  return undefined;
              if (!IsCallable(func))
                  throw new TypeError();
              return func;
          }
          // 7.4 Operations on Iterator Objects
          // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
          function GetIterator(obj) {
              var method = GetMethod(obj, iteratorSymbol);
              if (!IsCallable(method))
                  throw new TypeError(); // from Call
              var iterator = method.call(obj);
              if (!IsObject(iterator))
                  throw new TypeError();
              return iterator;
          }
          // 7.4.4 IteratorValue(iterResult)
          // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
          function IteratorValue(iterResult) {
              return iterResult.value;
          }
          // 7.4.5 IteratorStep(iterator)
          // https://tc39.github.io/ecma262/#sec-iteratorstep
          function IteratorStep(iterator) {
              var result = iterator.next();
              return result.done ? false : result;
          }
          // 7.4.6 IteratorClose(iterator, completion)
          // https://tc39.github.io/ecma262/#sec-iteratorclose
          function IteratorClose(iterator) {
              var f = iterator["return"];
              if (f)
                  f.call(iterator);
          }
          // 9.1 Ordinary Object Internal Methods and Internal Slots
          // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
          // 9.1.1.1 OrdinaryGetPrototypeOf(O)
          // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
          function OrdinaryGetPrototypeOf(O) {
              var proto = Object.getPrototypeOf(O);
              if (typeof O !== "function" || O === functionPrototype)
                  return proto;
              // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
              // Try to determine the superclass constructor. Compatible implementations
              // must either set __proto__ on a subclass constructor to the superclass constructor,
              // or ensure each class has a valid `constructor` property on its prototype that
              // points back to the constructor.
              // If this is not the same as Function.[[Prototype]], then this is definately inherited.
              // This is the case when in ES6 or when using __proto__ in a compatible browser.
              if (proto !== functionPrototype)
                  return proto;
              // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
              var prototype = O.prototype;
              var prototypeProto = prototype && Object.getPrototypeOf(prototype);
              if (prototypeProto == null || prototypeProto === Object.prototype)
                  return proto;
              // If the constructor was not a function, then we cannot determine the heritage.
              var constructor = prototypeProto.constructor;
              if (typeof constructor !== "function")
                  return proto;
              // If we have some kind of self-reference, then we cannot determine the heritage.
              if (constructor === O)
                  return proto;
              // we have a pretty good guess at the heritage.
              return constructor;
          }
          // naive Map shim
          function CreateMapPolyfill() {
              var cacheSentinel = {};
              var arraySentinel = [];
              var MapIterator = /** @class */ (function () {
                  function MapIterator(keys, values, selector) {
                      this._index = 0;
                      this._keys = keys;
                      this._values = values;
                      this._selector = selector;
                  }
                  MapIterator.prototype["@@iterator"] = function () { return this; };
                  MapIterator.prototype[iteratorSymbol] = function () { return this; };
                  MapIterator.prototype.next = function () {
                      var index = this._index;
                      if (index >= 0 && index < this._keys.length) {
                          var result = this._selector(this._keys[index], this._values[index]);
                          if (index + 1 >= this._keys.length) {
                              this._index = -1;
                              this._keys = arraySentinel;
                              this._values = arraySentinel;
                          }
                          else {
                              this._index++;
                          }
                          return { value: result, done: false };
                      }
                      return { value: undefined, done: true };
                  };
                  MapIterator.prototype.throw = function (error) {
                      if (this._index >= 0) {
                          this._index = -1;
                          this._keys = arraySentinel;
                          this._values = arraySentinel;
                      }
                      throw error;
                  };
                  MapIterator.prototype.return = function (value) {
                      if (this._index >= 0) {
                          this._index = -1;
                          this._keys = arraySentinel;
                          this._values = arraySentinel;
                      }
                      return { value: value, done: true };
                  };
                  return MapIterator;
              }());
              return /** @class */ (function () {
                  function Map() {
                      this._keys = [];
                      this._values = [];
                      this._cacheKey = cacheSentinel;
                      this._cacheIndex = -2;
                  }
                  Object.defineProperty(Map.prototype, "size", {
                      get: function () { return this._keys.length; },
                      enumerable: true,
                      configurable: true
                  });
                  Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                  Map.prototype.get = function (key) {
                      var index = this._find(key, /*insert*/ false);
                      return index >= 0 ? this._values[index] : undefined;
                  };
                  Map.prototype.set = function (key, value) {
                      var index = this._find(key, /*insert*/ true);
                      this._values[index] = value;
                      return this;
                  };
                  Map.prototype.delete = function (key) {
                      var index = this._find(key, /*insert*/ false);
                      if (index >= 0) {
                          var size = this._keys.length;
                          for (var i = index + 1; i < size; i++) {
                              this._keys[i - 1] = this._keys[i];
                              this._values[i - 1] = this._values[i];
                          }
                          this._keys.length--;
                          this._values.length--;
                          if (key === this._cacheKey) {
                              this._cacheKey = cacheSentinel;
                              this._cacheIndex = -2;
                          }
                          return true;
                      }
                      return false;
                  };
                  Map.prototype.clear = function () {
                      this._keys.length = 0;
                      this._values.length = 0;
                      this._cacheKey = cacheSentinel;
                      this._cacheIndex = -2;
                  };
                  Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                  Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                  Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                  Map.prototype["@@iterator"] = function () { return this.entries(); };
                  Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                  Map.prototype._find = function (key, insert) {
                      if (this._cacheKey !== key) {
                          this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                      }
                      if (this._cacheIndex < 0 && insert) {
                          this._cacheIndex = this._keys.length;
                          this._keys.push(key);
                          this._values.push(undefined);
                      }
                      return this._cacheIndex;
                  };
                  return Map;
              }());
              function getKey(key, _) {
                  return key;
              }
              function getValue(_, value) {
                  return value;
              }
              function getEntry(key, value) {
                  return [key, value];
              }
          }
          // naive Set shim
          function CreateSetPolyfill() {
              return /** @class */ (function () {
                  function Set() {
                      this._map = new _Map();
                  }
                  Object.defineProperty(Set.prototype, "size", {
                      get: function () { return this._map.size; },
                      enumerable: true,
                      configurable: true
                  });
                  Set.prototype.has = function (value) { return this._map.has(value); };
                  Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                  Set.prototype.delete = function (value) { return this._map.delete(value); };
                  Set.prototype.clear = function () { this._map.clear(); };
                  Set.prototype.keys = function () { return this._map.keys(); };
                  Set.prototype.values = function () { return this._map.values(); };
                  Set.prototype.entries = function () { return this._map.entries(); };
                  Set.prototype["@@iterator"] = function () { return this.keys(); };
                  Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                  return Set;
              }());
          }
          // naive WeakMap shim
          function CreateWeakMapPolyfill() {
              var UUID_SIZE = 16;
              var keys = HashMap.create();
              var rootKey = CreateUniqueKey();
              return /** @class */ (function () {
                  function WeakMap() {
                      this._key = CreateUniqueKey();
                  }
                  WeakMap.prototype.has = function (target) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                      return table !== undefined ? HashMap.has(table, this._key) : false;
                  };
                  WeakMap.prototype.get = function (target) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                      return table !== undefined ? HashMap.get(table, this._key) : undefined;
                  };
                  WeakMap.prototype.set = function (target, value) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                      table[this._key] = value;
                      return this;
                  };
                  WeakMap.prototype.delete = function (target) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                      return table !== undefined ? delete table[this._key] : false;
                  };
                  WeakMap.prototype.clear = function () {
                      // NOTE: not a real clear, just makes the previous data unreachable
                      this._key = CreateUniqueKey();
                  };
                  return WeakMap;
              }());
              function CreateUniqueKey() {
                  var key;
                  do
                      key = "@@WeakMap@@" + CreateUUID();
                  while (HashMap.has(keys, key));
                  keys[key] = true;
                  return key;
              }
              function GetOrCreateWeakMapTable(target, create) {
                  if (!hasOwn.call(target, rootKey)) {
                      if (!create)
                          return undefined;
                      Object.defineProperty(target, rootKey, { value: HashMap.create() });
                  }
                  return target[rootKey];
              }
              function FillRandomBytes(buffer, size) {
                  for (var i = 0; i < size; ++i)
                      buffer[i] = Math.random() * 0xff | 0;
                  return buffer;
              }
              function GenRandomBytes(size) {
                  if (typeof Uint8Array === "function") {
                      if (typeof crypto !== "undefined")
                          return crypto.getRandomValues(new Uint8Array(size));
                      if (typeof msCrypto !== "undefined")
                          return msCrypto.getRandomValues(new Uint8Array(size));
                      return FillRandomBytes(new Uint8Array(size), size);
                  }
                  return FillRandomBytes(new Array(size), size);
              }
              function CreateUUID() {
                  var data = GenRandomBytes(UUID_SIZE);
                  // mark as random - RFC 4122 § 4.4
                  data[6] = data[6] & 0x4f | 0x40;
                  data[8] = data[8] & 0xbf | 0x80;
                  var result = "";
                  for (var offset = 0; offset < UUID_SIZE; ++offset) {
                      var byte = data[offset];
                      if (offset === 4 || offset === 6 || offset === 8)
                          result += "-";
                      if (byte < 16)
                          result += "0";
                      result += byte.toString(16).toLowerCase();
                  }
                  return result;
              }
          }
          // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
          function MakeDictionary(obj) {
              obj.__ = undefined;
              delete obj.__;
              return obj;
          }
      });
  })(Reflect$1 || (Reflect$1 = {}));

  class InjectionToken {
      constructor(desc, options) {
          this._desc = desc;
          this.factory = options?.factory;
      }
      toString() {
          return `InjectionToken: ${this._desc}`;
      }
  }

  const injectMetadataKey = Symbol('inject:constructor:params');
  /* class AppService {
    constructor(@Inject(MessageService, { optional: true }) messageService: MessageService) {
      console.log(messageService.getMessages());
    }
  } */
  const Inject = (provide, args = {}) => {
      return (target, propertyKey, parameterIndex) => {
          if (propertyKey !== undefined) {
              throw new Error('The @inject decorator can only be used on consturctor parameters!');
          }
          const existingParameters = Reflect.getOwnMetadata(injectMetadataKey, target) || [];
          existingParameters[parameterIndex] = {
              provide,
              optional: !!args.optional
          };
          Reflect.defineMetadata(injectMetadataKey, existingParameters, target);
      };
  };

  // service injector
  class Injector {
      constructor(providers = [], parent = null) {
          // parent injector
          this.parent = null;
          // 当前 injector 上的服务记录
          this.records = new Map();
          this.parent = parent;
          // provider records
          providers.forEach((provider) => {
              let record = null;
              if (typeof provider === 'object') {
                  // [{ provide, ...}]
                  const p = provider;
                  // check
                  const keys = ['useValue', 'useClass', 'useExisiting', 'useFactory'];
                  let apear = 0;
                  keys.forEach((key) => {
                      if (typeof p[key] !== 'undefined') {
                          apear++;
                      }
                  });
                  if (apear > 1) {
                      debug(`These keys [${keys.join(',')}] can only use one, other will be ignored!`, 'warn');
                  }
                  // normalize
                  const { useValue = null, ...rest } = p;
                  record = {
                      ...rest,
                      value: useValue
                  };
              }
              else if (typeof provider === 'function' &&
                  typeof provider.prototype.constructor ===
                      'function') {
                  // [class]
                  const p = provider;
                  record = {
                      provide: p,
                      useClass: p
                  };
              }
              if (!record) {
                  debug(provider);
                  throw new Error('Error provider onfig!');
              }
              const hasTokenFactory = record.provide instanceof InjectionToken && record.useFactory;
              if (typeof record.value === 'undefined' &&
                  !record.useClass &&
                  !record.useExisiting &&
                  !record.useFactory &&
                  !hasTokenFactory) {
                  debug(provider);
                  throw new Error('Error provider onfig!');
              }
              this.records.set(record.provide, record);
          });
      }
      isProvided(provide) {
          if (this.records.has(provide))
              return true;
          if (this.parent)
              return this.parent.isProvided(provide);
          return false;
      }
      get(provide) {
          const record = this.records.get(provide);
          // not register on self
          if (!record) {
              if (this.parent)
                  return this.parent.get(provide);
              return null;
          }
          // lazy init service
          if (typeof record.value === 'undefined') {
              this.$_initRecord(record);
          }
          return record.value || null;
      }
      $_initRecord(record) {
          // token 中的 factory 优先
          // injection token's default value
          if (record.provide instanceof InjectionToken && record.provide.factory) {
              const inject = (provide, opts = {}) => {
                  const { optional } = opts;
                  const service = this.get(provide);
                  if (!service && !optional) {
                      debug(record);
                      debug(InjectionToken);
                      throw new Error(`Can not find all deps in the DI tree when init the InjectionToken, please provide them before you use the InjectionToken's factory!`);
                  }
                  return service;
              };
              record.value = record.provide.factory(inject);
          }
          // use class
          if (record.useClass) {
              // find deps for the useClass
              const metadata = Reflect.getOwnMetadata(injectMetadataKey, record.useClass) || [];
              const deps = metadata.map((item) => {
                  if (typeof item !== 'object')
                      return undefined;
                  const { provide, optional } = item;
                  const service = this.get(provide);
                  if (!service && !optional) {
                      debug(record);
                      throw new Error(`Can not find all deps in the DI tree when init the useClass, please provide them before you use the useClass!`);
                  }
                  return service;
              });
              record.value = new record.useClass(...deps);
              return;
          }
          // alias: use exisiting
          if (record.useExisiting) {
              record.value = this.get(record.useExisiting);
              return;
          }
          // use factory
          if (record.useFactory) {
              const inject = (provide, opts = {}) => {
                  const { optional } = opts;
                  const service = this.get(provide);
                  if (!service && !optional) {
                      debug(record);
                      throw new Error(`Can not find all deps in the DI tree when init the useFactory, please provide them before you use the useFactory!`);
                  }
                  return service;
              };
              record.value = record.useFactory(inject);
          }
      }
      dispose() {
          for (const [, record] of this.records) {
              if (!record.value)
                  return;
              if (record.dispose) {
                  record.dispose(record.value);
              }
              else if (typeof record.value.dispose === 'function') {
                  record.value.dispose();
              }
          }
          this.parent = null;
          this.records.clear();
      }
  }

  // Service 服务基类
  /*
  type State = {
    user: User | null;
    message: any;
  }
  type Actions = {
    login: LoginParams;
    logout: undefined;
  };
  class AppService extends Service<State, Actions> {
    constructor() {
      super({
        state: {
          user: null
        },
        actions: ['login', 'logout']
      })

      // listen actions
      this.subscribe(
        this.$.login.pipe(
          map(v => v)
        ),
        {
          next: () => {},
          error: () => {}
        }
      )

      // send notifies
      this.$$.message.next('init');
    }
  }
  */
  class Service extends Disposable {
      constructor(args = {}) {
          super();
          // displayName, for debug
          this.displayName = '';
          // notify sources
          this.$$ = {};
          // actions
          this.$ = {};
          // init
          // displayName
          if (!this.displayName) {
              this.displayName = this.constructor.name;
              debug(`[Service ${this.displayName}]: For better debugging, you'd better add an attribute 'displayName' to each service class.`, 'warn');
          }
          // init state
          const initialState = (args.state || {});
          Object.keys(initialState).forEach((key) => {
              if (initialState[key] === undefined || initialState[key] === empty) {
                  this.$$[key] = new rxjs.Subject();
              }
              else {
                  this.$$[key] = new rxjs.BehaviorSubject(initialState[key]);
              }
          });
          // init actions
          const actions = args.actions || [];
          actions.forEach((key) => {
              this.$[key] = new rxjs.Subject();
          });
          // debug
          // debugs: update state
          Object.keys(this.$$).forEach((key) => {
              this.subscribe(this.$$[key], {
                  next: (v) => {
                      debug(`[Service ${this.displayName}]: set new state [${key}].`, 'info');
                      debug(v, 'info');
                  }
              });
          });
          // debugs: new action
          Object.keys(this.$).forEach((key) => {
              this.subscribe(this.$[key], {
                  next: (v) => {
                      debug(`[Service ${this.displayName}]: receive new action [${key}].`, 'info');
                      debug(v, 'info');
                  }
              });
          });
      }
      // state
      get state() {
          const state = {};
          Object.keys(this.$$).forEach((key) => {
              const source = this.$$[key];
              if (source instanceof rxjs.BehaviorSubject) {
                  state[key] = source.value;
              }
          });
          return state;
      }
      subscribe(ob, ...args) {
          const subscription = ob.subscribe(...args);
          this.beforeDispose(() => {
              subscription.unsubscribe();
          });
      }
  }

  exports.Disposable = Disposable;
  exports.Inject = Inject;
  exports.InjectionToken = InjectionToken;
  exports.Injector = Injector;
  exports.Service = Service;
  exports.config = config$1;
  exports.debug = debug;
  exports.empty = empty;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}, rxjs));
