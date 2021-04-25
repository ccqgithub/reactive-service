var RSReact=function(e,t,r){"use strict";function o(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var s=o(r);const n={logLevel:"error",log:(e,t="info")=>{console&&console[t]&&console[t](e)}},c=(e,t="info",r=!0)=>{if(!r)return;const o=["info","warn","error","never"];o.indexOf(n.logLevel)>o.indexOf(t)||n.log(e,t)},i=Symbol("empty");class u{constructor(){this.$_disposers=[]}beforeDispose(e){this.$_disposers.push(e)}dispose(){this.$_disposers.forEach((e=>{e()}))}}class a{constructor(e,t){this._desc=e,this.factory=t?.factory}toString(){return`InjectionToken: ${this._desc}`}}class f{constructor(e=[],t=null){this.parent=null,this.records=new Map,this.parent=t,e.forEach((e=>{let t=null;if("object"==typeof e){const r=e,o=["useValue","useClass","useExisiting","useFactory"];let s=0;o.forEach((e=>{void 0!==r[e]&&s++})),s>1&&c(`These keys [${o.join(",")}] can only use one, other will be ignored!`,"warn");const{useValue:n,...i}=r;t={...i,value:n}}else if("function"==typeof e&&"function"==typeof e.prototype.constructor){t={provide:e,useClass:e}}if(!t)throw c(e),new Error("Error provider onfig!");if(!(void 0!==t.value||t.useClass||t.useExisiting||t.useFactory||t.provide instanceof a&&t.useFactory))throw c(e),new Error("Error provider onfig!");this.records.set(t.provide,t)}))}isProvided(e){return!!this.records.has(e)||!!this.parent&&this.parent.isProvided(e)}get(e,t){const r=this.records.get(e);let o=null;if(r?(void 0===r.value&&this.$_initRecord(r),o=r.value||null):this.parent&&(o=this.parent.get(e)),!o&&!t?.optional)throw new Error("Service not be provided, and not optional!");return o}$_initRecord(e){const t={useService:(e,t)=>this.get(e,t)};e.provide instanceof a&&e.provide.factory&&(e.value=e.provide.factory(t)),e.useClass?e.value=new e.useClass(t):e.useExisiting?e.value=this.get(e.useExisiting):e.useFactory&&(e.value=e.useFactory(t))}dispose(){for(const[,e]of this.records){if(!e.value)return;e.dispose?e.dispose(e.value):"function"==typeof e.value.dispose&&e.value.dispose()}this.parent=null,this.records.clear()}}
/** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
var l="function"==typeof Symbol&&Symbol.for,p=l?Symbol.for("react.element"):60103,y=l?Symbol.for("react.portal"):60106,d=l?Symbol.for("react.fragment"):60107,b=l?Symbol.for("react.strict_mode"):60108,h=l?Symbol.for("react.profiler"):60114,v=l?Symbol.for("react.provider"):60109,m=l?Symbol.for("react.context"):60110,$=l?Symbol.for("react.async_mode"):60111,S=l?Symbol.for("react.concurrent_mode"):60111,g=l?Symbol.for("react.forward_ref"):60112,w=l?Symbol.for("react.suspense"):60113,E=l?Symbol.for("react.suspense_list"):60120,j=l?Symbol.for("react.memo"):60115,x=l?Symbol.for("react.lazy"):60116,O=l?Symbol.for("react.block"):60121,C=l?Symbol.for("react.fundamental"):60117,P=l?Symbol.for("react.responder"):60118,R=l?Symbol.for("react.scope"):60119;function _(e){if("object"==typeof e&&null!==e){var t=e.$$typeof;switch(t){case p:switch(e=e.type){case $:case S:case d:case h:case b:case w:return e;default:switch(e=e&&e.$$typeof){case m:case g:case x:case j:case v:return e;default:return t}}case y:return t}}}function F(e){return _(e)===S}var M,T={AsyncMode:$,ConcurrentMode:S,ContextConsumer:m,ContextProvider:v,Element:p,ForwardRef:g,Fragment:d,Lazy:x,Memo:j,Portal:y,Profiler:h,StrictMode:b,Suspense:w,isAsyncMode:function(e){return F(e)||_(e)===$},isConcurrentMode:F,isContextConsumer:function(e){return _(e)===m},isContextProvider:function(e){return _(e)===v},isElement:function(e){return"object"==typeof e&&null!==e&&e.$$typeof===p},isForwardRef:function(e){return _(e)===g},isFragment:function(e){return _(e)===d},isLazy:function(e){return _(e)===x},isMemo:function(e){return _(e)===j},isPortal:function(e){return _(e)===y},isProfiler:function(e){return _(e)===h},isStrictMode:function(e){return _(e)===b},isSuspense:function(e){return _(e)===w},isValidElementType:function(e){return"string"==typeof e||"function"==typeof e||e===d||e===S||e===h||e===b||e===w||e===E||"object"==typeof e&&null!==e&&(e.$$typeof===x||e.$$typeof===j||e.$$typeof===v||e.$$typeof===m||e.$$typeof===g||e.$$typeof===C||e.$$typeof===P||e.$$typeof===R||e.$$typeof===O)},typeOf:_},k=(function(e){e.exports=T}(M={exports:{}},M.exports),M.exports),N={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},D={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},B={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},I={};function L(e){return k.isMemo(e)?B:I[e.$$typeof]||N}I[k.ForwardRef]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},I[k.Memo]=B;var V=Object.defineProperty,z=Object.getOwnPropertyNames,A=Object.getOwnPropertySymbols,G=Object.getOwnPropertyDescriptor,W=Object.getPrototypeOf,q=Object.prototype;var H=function e(t,r,o){if("string"!=typeof r){if(q){var s=W(r);s&&s!==q&&e(t,s,o)}var n=z(r);A&&(n=n.concat(A(r)));for(var c=L(t),i=L(r),u=0;u<n.length;++u){var a=n[u];if(!(D[a]||o&&o[a]||i&&i[a]||c&&c[a])){var f=G(r,a);try{V(t,a,f)}catch(d){}}}}return t};const J=r.createContext(new f),K=e=>{const t=r.useContext(J),{providers:o=[],children:n}=e,c=new f(o,t);return s.createElement(J.Provider,{value:c},n)};function Q(){const e=r.useContext(J);return r.useCallback(((t,r)=>e.get(t,r)),[e])}return e.Disposable=u,e.InjectionToken=a,e.Injector=f,e.Service=class extends u{constructor(e={}){super(),this.displayName="",this.$$={},this.$={};const r=e.state||{};Object.keys(r).forEach((e=>{this.$$[e]=new t.BehaviorSubject(r[e])}));(e.actions||[]).forEach((e=>{this.$[e]=new t.Subject})),Object.keys(this.$$).forEach((e=>{this.subscribe(this.$$[e],{next:t=>{c(`[Service ${this.displayName}]: set new state [${e}].`,"info"),c(t,"info")}})})),Object.keys(this.$).forEach((e=>{this.subscribe(this.$[e],{next:t=>{c(`[Service ${this.displayName}]: receive new action [${e}].`,"info"),c(t,"info")}})}))}get state(){const e={};return Object.keys(this.$$).forEach((r=>{const o=this.$$[r];o instanceof t.BehaviorSubject&&(e[r]=o.value)})),e}subscribe(e,...t){const r=e.subscribe(...t);this.beforeDispose((()=>{r.unsubscribe()}))}},e.ServiceConsumer=e=>{const t=r.useContext(J);return"function"==typeof e.children?e.children({getService:(e,r)=>t.get(e,r)}):e.children},e.ServiceInjector=K,e.config=e=>{Object.keys(e).forEach((t=>{t in n&&void 0!==e[t]&&(n[t]=e[t])}))},e.debug=c,e.empty=i,e.useBehavior=function(e){if(!(e instanceof t.BehaviorSubject))throw new Error("The useBehaviorState can only use with BehaviorSubject!");const[o,s]=r.useState(e.value);return r.useEffect((()=>{const t=e.subscribe({next:e=>s(e)});return()=>{t.unsubscribe()}}),[e]),o},e.useGetService=Q,e.useListenValue=function(e,t){const o=r.useRef(t);o.current=t,r.useEffect((()=>{o.current(e)}),[e])},e.useObservable=function(e,t){const[o,s]=r.useState(t);return r.useEffect((()=>{const t=e.subscribe({next:e=>s(e)});return()=>{t.unsubscribe()}}),[e]),o},e.useObservableError=function(e,o=!1){const[s,n]=r.useState(null);return r.useEffect((()=>{if(e instanceof t.Subject&&o&&e.hasError)return;const r=e.subscribe({error:e=>{n(e)}});return()=>{r.unsubscribe()}}),[e,o]),s},e.useRSRef=function(e){const[t,o]=r.useState(e);return{get current(){return t},set current(e){o(e)}}},e.useService=(e,t)=>Q()(e,t),e.useValueRef=function(e){const t=r.useRef(e);return t.current=e,{get current(){return t.current},set current(e){throw new Error("Can not set value to this ref of useRSWatchRef!")}}},e.withInjector=e=>t=>{const o="withInjector("+(t.displayName||t.name)+")",n=r.forwardRef(((r,o)=>s.createElement(K,{providers:e.providers},s.createElement(t,Object.assign({ref:o},r)))));return n.displayName=o,H(n,t)},Object.defineProperty(e,"__esModule",{value:!0}),e}({},rxjs,React);
