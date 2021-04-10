var RSReact=function(e,t,r){"use strict";function n(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var o,i=n(r),s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};!function(e){!function(t){var r="object"==typeof s?s:"object"==typeof self?self:"object"==typeof this?this:Function("return this;")(),n=o(e);function o(e,t){return function(r,n){"function"!=typeof e[r]&&Object.defineProperty(e,r,{configurable:!0,writable:!0,value:n}),t&&t(r,n)}}void 0===r.Reflect?r.Reflect=e:n=o(r.Reflect,n),function(e){var t=Object.prototype.hasOwnProperty,r="function"==typeof Symbol,n=r&&void 0!==Symbol.toPrimitive?Symbol.toPrimitive:"@@toPrimitive",o=r&&void 0!==Symbol.iterator?Symbol.iterator:"@@iterator",i="function"==typeof Object.create,s={__proto__:[]}instanceof Array,u=!i&&!s,a={create:i?function(){return oe(Object.create(null))}:s?function(){return oe({__proto__:null})}:function(){return oe({})},has:u?function(e,r){return t.call(e,r)}:function(e,t){return t in e},get:u?function(e,r){return t.call(e,r)?e[r]:void 0}:function(e,t){return e[t]}},c=Object.getPrototypeOf(Function),f="object"==typeof process&&process.env&&"true"===process.env.REFLECT_METADATA_USE_MAP_POLYFILL,l=f||"function"!=typeof Map||"function"!=typeof Map.prototype.entries?te():Map,p=f||"function"!=typeof Set||"function"!=typeof Set.prototype.entries?re():Set,h=new(f||"function"!=typeof WeakMap?ne():WeakMap);function y(e,t,r,n){if(A(r)){if(!W(e))throw new TypeError;if(!Y(t))throw new TypeError;return $(e,t)}if(!W(e))throw new TypeError;if(!L(t))throw new TypeError;if(!L(n)&&!A(n)&&!N(n))throw new TypeError;return N(n)&&(n=void 0),O(e,t,r=U(r),n)}function d(e,t){function r(r,n){if(!L(r))throw new TypeError;if(!A(n)&&!q(n))throw new TypeError;M(e,t,r,n)}return r}function v(e,t,r,n){if(!L(r))throw new TypeError;return A(n)||(n=U(n)),M(e,t,r,n)}function w(e,t,r){if(!L(t))throw new TypeError;return A(r)||(r=U(r)),x(e,t,r)}function _(e,t,r){if(!L(t))throw new TypeError;return A(r)||(r=U(r)),T(e,t,r)}function m(e,t,r){if(!L(t))throw new TypeError;return A(r)||(r=U(r)),C(e,t,r)}function g(e,t,r){if(!L(t))throw new TypeError;return A(r)||(r=U(r)),P(e,t,r)}function E(e,t){if(!L(e))throw new TypeError;return A(t)||(t=U(t)),R(e,t)}function S(e,t){if(!L(e))throw new TypeError;return A(t)||(t=U(t)),I(e,t)}function j(e,t,r){if(!L(t))throw new TypeError;A(r)||(r=U(r));var n=k(t,r,!1);if(A(n))return!1;if(!n.delete(e))return!1;if(n.size>0)return!0;var o=h.get(t);return o.delete(r),o.size>0||h.delete(t),!0}function $(e,t){for(var r=e.length-1;r>=0;--r){var n=(0,e[r])(t);if(!A(n)&&!N(n)){if(!Y(n))throw new TypeError;t=n}}return t}function O(e,t,r,n){for(var o=e.length-1;o>=0;--o){var i=(0,e[o])(t,r,n);if(!A(i)&&!N(i)){if(!L(i))throw new TypeError;n=i}}return n}function k(e,t,r){var n=h.get(e);if(A(n)){if(!r)return;n=new l,h.set(e,n)}var o=n.get(t);if(A(o)){if(!r)return;o=new l,n.set(t,o)}return o}function x(e,t,r){if(T(e,t,r))return!0;var n=ee(t);return!N(n)&&x(e,n,r)}function T(e,t,r){var n=k(t,r,!1);return!A(n)&&K(n.has(e))}function C(e,t,r){if(T(e,t,r))return P(e,t,r);var n=ee(t);return N(n)?void 0:C(e,n,r)}function P(e,t,r){var n=k(t,r,!1);if(!A(n))return n.get(e)}function M(e,t,r,n){k(r,n,!0).set(e,t)}function R(e,t){var r=I(e,t),n=ee(e);if(null===n)return r;var o=R(n,t);if(o.length<=0)return r;if(r.length<=0)return o;for(var i=new p,s=[],u=0,a=r;u<a.length;u++){i.has(l=a[u])||(i.add(l),s.push(l))}for(var c=0,f=o;c<f.length;c++){var l;i.has(l=f[c])||(i.add(l),s.push(l))}return s}function I(e,t){var r=[],n=k(e,t,!1);if(A(n))return r;for(var o=J(n.keys()),i=0;;){var s=X(o);if(!s)return r.length=i,r;var u=Q(s);try{r[i]=u}catch(b){try{Z(o)}finally{throw b}}i++}}function F(e){if(null===e)return 1;switch(typeof e){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return null===e?1:6;default:return 6}}function A(e){return void 0===e}function N(e){return null===e}function D(e){return"symbol"==typeof e}function L(e){return"object"==typeof e?null!==e:"function"==typeof e}function z(e,t){switch(F(e)){case 0:case 1:case 2:case 3:case 4:case 5:return e}var r=3===t?"string":5===t?"number":"default",o=H(e,n);if(void 0!==o){var i=o.call(e,r);if(L(i))throw new TypeError;return i}return B(e,"default"===r?"number":r)}function B(e,t){if("string"===t){var r=e.toString;if(G(r))if(!L(o=r.call(e)))return o;if(G(n=e.valueOf))if(!L(o=n.call(e)))return o}else{var n;if(G(n=e.valueOf))if(!L(o=n.call(e)))return o;var o,i=e.toString;if(G(i))if(!L(o=i.call(e)))return o}throw new TypeError}function K(e){return!!e}function V(e){return""+e}function U(e){var t=z(e,3);return D(t)?t:V(t)}function W(e){return Array.isArray?Array.isArray(e):e instanceof Object?e instanceof Array:"[object Array]"===Object.prototype.toString.call(e)}function G(e){return"function"==typeof e}function Y(e){return"function"==typeof e}function q(e){switch(F(e)){case 3:case 4:return!0;default:return!1}}function H(e,t){var r=e[t];if(null!=r){if(!G(r))throw new TypeError;return r}}function J(e){var t=H(e,o);if(!G(t))throw new TypeError;var r=t.call(e);if(!L(r))throw new TypeError;return r}function Q(e){return e.value}function X(e){var t=e.next();return!t.done&&t}function Z(e){var t=e.return;t&&t.call(e)}function ee(e){var t=Object.getPrototypeOf(e);if("function"!=typeof e||e===c)return t;if(t!==c)return t;var r=e.prototype,n=r&&Object.getPrototypeOf(r);if(null==n||n===Object.prototype)return t;var o=n.constructor;return"function"!=typeof o||o===e?t:o}function te(){var e={},t=[],r=function(){function e(e,t,r){this._index=0,this._keys=e,this._values=t,this._selector=r}return e.prototype["@@iterator"]=function(){return this},e.prototype[o]=function(){return this},e.prototype.next=function(){var e=this._index;if(e>=0&&e<this._keys.length){var r=this._selector(this._keys[e],this._values[e]);return e+1>=this._keys.length?(this._index=-1,this._keys=t,this._values=t):this._index++,{value:r,done:!1}}return{value:void 0,done:!0}},e.prototype.throw=function(e){throw this._index>=0&&(this._index=-1,this._keys=t,this._values=t),e},e.prototype.return=function(e){return this._index>=0&&(this._index=-1,this._keys=t,this._values=t),{value:e,done:!0}},e}();return function(){function t(){this._keys=[],this._values=[],this._cacheKey=e,this._cacheIndex=-2}return Object.defineProperty(t.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),t.prototype.has=function(e){return this._find(e,!1)>=0},t.prototype.get=function(e){var t=this._find(e,!1);return t>=0?this._values[t]:void 0},t.prototype.set=function(e,t){var r=this._find(e,!0);return this._values[r]=t,this},t.prototype.delete=function(t){var r=this._find(t,!1);if(r>=0){for(var n=this._keys.length,o=r+1;o<n;o++)this._keys[o-1]=this._keys[o],this._values[o-1]=this._values[o];return this._keys.length--,this._values.length--,t===this._cacheKey&&(this._cacheKey=e,this._cacheIndex=-2),!0}return!1},t.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=e,this._cacheIndex=-2},t.prototype.keys=function(){return new r(this._keys,this._values,n)},t.prototype.values=function(){return new r(this._keys,this._values,i)},t.prototype.entries=function(){return new r(this._keys,this._values,s)},t.prototype["@@iterator"]=function(){return this.entries()},t.prototype[o]=function(){return this.entries()},t.prototype._find=function(e,t){return this._cacheKey!==e&&(this._cacheIndex=this._keys.indexOf(this._cacheKey=e)),this._cacheIndex<0&&t&&(this._cacheIndex=this._keys.length,this._keys.push(e),this._values.push(void 0)),this._cacheIndex},t}();function n(e,t){return e}function i(e,t){return t}function s(e,t){return[e,t]}}function re(){return function(){function e(){this._map=new l}return Object.defineProperty(e.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),e.prototype.has=function(e){return this._map.has(e)},e.prototype.add=function(e){return this._map.set(e,e),this},e.prototype.delete=function(e){return this._map.delete(e)},e.prototype.clear=function(){this._map.clear()},e.prototype.keys=function(){return this._map.keys()},e.prototype.values=function(){return this._map.values()},e.prototype.entries=function(){return this._map.entries()},e.prototype["@@iterator"]=function(){return this.keys()},e.prototype[o]=function(){return this.keys()},e}()}function ne(){var e=16,r=a.create(),n=o();return function(){function e(){this._key=o()}return e.prototype.has=function(e){var t=i(e,!1);return void 0!==t&&a.has(t,this._key)},e.prototype.get=function(e){var t=i(e,!1);return void 0!==t?a.get(t,this._key):void 0},e.prototype.set=function(e,t){return i(e,!0)[this._key]=t,this},e.prototype.delete=function(e){var t=i(e,!1);return void 0!==t&&delete t[this._key]},e.prototype.clear=function(){this._key=o()},e}();function o(){var e;do{e="@@WeakMap@@"+c()}while(a.has(r,e));return r[e]=!0,e}function i(e,r){if(!t.call(e,n)){if(!r)return;Object.defineProperty(e,n,{value:a.create()})}return e[n]}function s(e,t){for(var r=0;r<t;++r)e[r]=255*Math.random()|0;return e}function u(e){return"function"==typeof Uint8Array?"undefined"!=typeof crypto?crypto.getRandomValues(new Uint8Array(e)):"undefined"!=typeof msCrypto?msCrypto.getRandomValues(new Uint8Array(e)):s(new Uint8Array(e),e):s(new Array(e),e)}function c(){var t=u(e);t[6]=79&t[6]|64,t[8]=191&t[8]|128;for(var r="",n=0;n<e;++n){var o=t[n];4!==n&&6!==n&&8!==n||(r+="-"),o<16&&(r+="0"),r+=o.toString(16).toLowerCase()}return r}}function oe(e){return e.__=void 0,delete e.__,e}e("decorate",y),e("metadata",d),e("defineMetadata",v),e("hasMetadata",w),e("hasOwnMetadata",_),e("getMetadata",m),e("getOwnMetadata",g),e("getMetadataKeys",E),e("getOwnMetadataKeys",S),e("deleteMetadata",j)}(n)}()}(o||(o={}));const u={logLevel:"error",log:(e,t="info")=>{console&&console[t]&&console[t](e)}},a=(e,t="info",r=!0)=>{if(!r)return;const n=["info","warn","error","never"];n.indexOf(u.logLevel)>n.indexOf(t)||u.log(e,t)},c=Symbol("empty");class f{constructor(){this.$_disposers=[]}beforeDispose(e){this.$_disposers.push(e)}dispose(){this.$_disposers.forEach((e=>{e()}))}}class l{constructor(e,t){this._desc=e,this.factory=t?.factory}toString(){return`InjectionToken: ${this._desc}`}}const p=Symbol("inject:constructor:params");class h{constructor(e=[],t=null){this.parent=null,this.records=new Map,this.parent=t,e.forEach((e=>{let t=null;if("object"==typeof e){const r=e,n=["useValue","useClass","useExisiting","useFactory"];let o=0;n.forEach((e=>{void 0!==r[e]&&o++})),o>1&&a(`These keys [${n.join(",")}] can only use one, other will be ignored!`,"warn");const{useValue:i=null,...s}=r;t={...s,value:i}}else if("function"==typeof e&&"function"==typeof e.prototype.constructor){t={provide:e,useClass:e}}if(!t)throw a(e),new Error("Error provider onfig!");if(!(void 0!==t.value||t.useClass||t.useExisiting||t.useFactory||t.provide instanceof l&&t.useFactory))throw a(e),new Error("Error provider onfig!");this.records.set(t.provide,t)}))}isProvided(e){return!!this.records.has(e)||!!this.parent&&this.parent.isProvided(e)}get(e){const t=this.records.get(e);return t?(void 0===t.value&&this.$_initRecord(t),t.value||null):this.parent?this.parent.get(e):null}$_initRecord(e){if(e.provide instanceof l&&e.provide.factory){e.value=e.provide.factory(((t,r={})=>{const{optional:n}=r,o=this.get(t);if(!o&&!n)throw a(e),a(l),new Error("Can not find all deps in the DI tree when init the InjectionToken, please provide them before you use the InjectionToken's factory!");return o}))}if(e.useClass){const t=(Reflect.getOwnMetadata(p,e.useClass)||[]).map((t=>{if("object"!=typeof t)return;const{provide:r,optional:n}=t,o=this.get(r);if(!o&&!n)throw a(e),new Error("Can not find all deps in the DI tree when init the useClass, please provide them before you use the useClass!");return o}));e.value=new e.useClass(...t)}else if(e.useExisiting)e.value=this.get(e.useExisiting);else if(e.useFactory){e.value=e.useFactory(((t,r={})=>{const{optional:n}=r,o=this.get(t);if(!o&&!n)throw a(e),new Error("Can not find all deps in the DI tree when init the useFactory, please provide them before you use the useFactory!");return o}))}}dispose(){for(const[,e]of this.records){if(!e.value)return;e.dispose?e.dispose(e.value):"function"==typeof e.value.dispose&&e.value.dispose()}this.parent=null,this.records.clear()}}
/** @license React v16.13.1
	 * react-is.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
var y="function"==typeof Symbol&&Symbol.for,d=y?Symbol.for("react.element"):60103,v=y?Symbol.for("react.portal"):60106,b=y?Symbol.for("react.fragment"):60107,w=y?Symbol.for("react.strict_mode"):60108,_=y?Symbol.for("react.profiler"):60114,m=y?Symbol.for("react.provider"):60109,g=y?Symbol.for("react.context"):60110,E=y?Symbol.for("react.async_mode"):60111,S=y?Symbol.for("react.concurrent_mode"):60111,j=y?Symbol.for("react.forward_ref"):60112,$=y?Symbol.for("react.suspense"):60113,O=y?Symbol.for("react.suspense_list"):60120,k=y?Symbol.for("react.memo"):60115,x=y?Symbol.for("react.lazy"):60116,T=y?Symbol.for("react.block"):60121,C=y?Symbol.for("react.fundamental"):60117,P=y?Symbol.for("react.responder"):60118,M=y?Symbol.for("react.scope"):60119;function R(e){if("object"==typeof e&&null!==e){var t=e.$$typeof;switch(t){case d:switch(e=e.type){case E:case S:case b:case _:case w:case $:return e;default:switch(e=e&&e.$$typeof){case g:case j:case x:case k:case m:return e;default:return t}}case v:return t}}}function I(e){return R(e)===S}var F,A={AsyncMode:E,ConcurrentMode:S,ContextConsumer:g,ContextProvider:m,Element:d,ForwardRef:j,Fragment:b,Lazy:x,Memo:k,Portal:v,Profiler:_,StrictMode:w,Suspense:$,isAsyncMode:function(e){return I(e)||R(e)===E},isConcurrentMode:I,isContextConsumer:function(e){return R(e)===g},isContextProvider:function(e){return R(e)===m},isElement:function(e){return"object"==typeof e&&null!==e&&e.$$typeof===d},isForwardRef:function(e){return R(e)===j},isFragment:function(e){return R(e)===b},isLazy:function(e){return R(e)===x},isMemo:function(e){return R(e)===k},isPortal:function(e){return R(e)===v},isProfiler:function(e){return R(e)===_},isStrictMode:function(e){return R(e)===w},isSuspense:function(e){return R(e)===$},isValidElementType:function(e){return"string"==typeof e||"function"==typeof e||e===b||e===S||e===_||e===w||e===$||e===O||"object"==typeof e&&null!==e&&(e.$$typeof===x||e.$$typeof===k||e.$$typeof===m||e.$$typeof===g||e.$$typeof===j||e.$$typeof===C||e.$$typeof===P||e.$$typeof===M||e.$$typeof===T)},typeOf:R},N=(function(e){e.exports=A}(F={exports:{}},F.exports),F.exports),D={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},L={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},z={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},B={};function K(e){return N.isMemo(e)?z:B[e.$$typeof]||D}B[N.ForwardRef]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},B[N.Memo]=z;var V=Object.defineProperty,U=Object.getOwnPropertyNames,W=Object.getOwnPropertySymbols,G=Object.getOwnPropertyDescriptor,Y=Object.getPrototypeOf,q=Object.prototype;var H=function e(t,r,n){if("string"!=typeof r){if(q){var o=Y(r);o&&o!==q&&e(t,o,n)}var i=U(r);W&&(i=i.concat(W(r)));for(var s=K(t),u=K(r),a=0;a<i.length;++a){var c=i[a];if(!(L[c]||n&&n[c]||u&&u[c]||s&&s[c])){var f=G(r,c);try{V(t,c,f)}catch(b){}}}}return t};const J=r.createContext(new h),Q=e=>{const t=r.useContext(J),{providers:n=[],children:o}=e,s=new h(n,t);return i.createElement(J.Provider,{value:s},o)};function X(e){const[t,n]=r.useState(e);return{get value(){return t},set value(e){n(e)}}}function Z(e){const t=r.useRef(e);t.current=e;return{get value(){return t.current},set value(e){throw new Error("Can not set value to this ref of useRSWatchRef!")}}}function ee(){const e=r.useContext(J);return r.useCallback((t=>e.get(t)),[e])}function te(e){return ee()(e)}return e.Disposable=f,e.Inject=(e,t={})=>(r,n,o)=>{if(void 0!==n)throw new Error("The @inject decorator can only be used on consturctor parameters!");const i=Reflect.getOwnMetadata(p,r)||[];i[o]={provide:e,optional:!!t.optional},Reflect.defineMetadata(p,i,r)},e.InjectionToken=l,e.Injector=h,e.Service=class extends f{constructor(e={}){super(),this.displayName="",this.$$={},this.$={},this.displayName||(this.displayName=this.constructor.name,a(`[Service ${this.displayName}]: For better debugging, you'd better add an attribute 'displayName' to each service class.`,"warn"));const r=e.state||{};Object.keys(r).forEach((e=>{this.$$[e]=new t.BehaviorSubject(r[e])}));(e.actions||[]).forEach((e=>{this.$[e]=new t.Subject})),Object.keys(this.$$).forEach((e=>{this.subscribe(this.$$[e],{next:t=>{a(`[Service ${this.displayName}]: set new state [${e}].`,"info"),a(t,"info")}})})),Object.keys(this.$).forEach((e=>{this.subscribe(this.$[e],{next:t=>{a(`[Service ${this.displayName}]: receive new action [${e}].`,"info"),a(t,"info")}})}))}get state(){const e={};return Object.keys(this.$$).forEach((r=>{const n=this.$$[r];n instanceof t.BehaviorSubject&&(e[r]=n.value)})),e}subscribe(e,...t){const r=e.subscribe(...t);this.beforeDispose((()=>{r.unsubscribe()}))}},e.ServiceConsumer=e=>{const t=r.useContext(J);return"function"==typeof e.children?e.children({getService:(e,r={})=>{const{optional:n=!1}=r;if(!t.get(e)&&!n)throw a(e,"error"),new Error("Can not find the service, you provide it?")}}):e.children},e.ServiceInjector=Q,e.config=e=>{Object.keys(e).forEach((t=>{t in u&&void 0!==e[t]&&(u[t]=e[t])}))},e.debug=a,e.empty=c,e.useBehaviorRef=function(e){if(!(e instanceof t.BehaviorSubject))throw new Error("The useBehaviorState can only use with BehaviorSubject!");const n=X(e.value),o={get value(){return n.value},set value(e){throw new Error("Can not set value to this ref of useBehaviorRef!")}};return r.useEffect((()=>{const t=e.subscribe({next:e=>n.value=e});return()=>{t.unsubscribe()}}),[e,n]),o},e.useGetService=ee,e.useListener=function(e,t){const n=r.useRef(t);n.current=t,r.useEffect((()=>{n.current(e)}),[e])},e.useObservableError=function(e,n=!1){const o=X(null),i={get value(){return o.value},set value(e){throw new Error("Can not set value to this ref of useBehaviorRef!")}};return r.useEffect((()=>{if(e instanceof t.Subject&&n&&e.hasError)return;const r=e.subscribe({error:e=>{o.value=e}});return()=>{r.unsubscribe()}}),[e,n,o]),i},e.useObservableRef=function(e,t){const n=X(t),o={get value(){return n.value},set value(e){throw new Error("Can not set value to this ref of useObservableRef!")}};return r.useEffect((()=>{const t=e.subscribe({next:e=>n.value=e});return()=>{t.unsubscribe()}}),[e,n]),o},e.useRSRef=X,e.useRSValueRef=Z,e.useService=te,e.useServiceRef=function(e){return Z(te(e))},e.withInjector=e=>t=>{const n="withInjector("+(t.displayName||t.name)+")",o=r.forwardRef(((r,n)=>i.createElement(Q,{providers:e.providers},i.createElement(t,Object.assign({ref:n},r)))));return o.displayName=n,H(o,t)},Object.defineProperty(e,"__esModule",{value:!0}),e}({},rxjs,React);
