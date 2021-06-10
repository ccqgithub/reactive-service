var e,s;e=this,s=function(e,s){const t={logLevel:"error",log:(e,s="info")=>{console&&console[s]&&console[s](e)}},o=(e,s="info",o=!0)=>{if(!o)return;const i=["info","warn","error","never"];i.indexOf(t.logLevel)>i.indexOf(s)||t.log(e,s)};class i{constructor(){this.$_disposers=[]}beforeDispose(e){this.$_disposers.push(e)}dispose(){this.$_disposers.forEach((e=>{e()}))}}
/*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */class r{constructor(e,s){this._desc=e,this.factory=null==s?void 0:s.factory}toString(){return`InjectionToken: ${this._desc}`}}e.Disposable=i,e.InjectionToken=r,e.Injector=class{constructor(e=[],s=null){this.parent=null,this.records=new Map,this.parent=s,e.forEach((e=>{let s=null;if("object"==typeof e){const t=e,i=["useValue","useClass","useExisiting","useFactory"];let r=0;i.forEach((e=>{void 0!==t[e]&&r++})),r>1&&o(`These keys [${i.join(",")}] can only use one, other will be ignored!`,"warn");const{useValue:n}=t,c=function(e,s){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&s.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(o=Object.getOwnPropertySymbols(e);i<o.length;i++)s.indexOf(o[i])<0&&Object.prototype.propertyIsEnumerable.call(e,o[i])&&(t[o[i]]=e[o[i]])}return t}(t,["useValue"]);s=Object.assign(Object.assign({},c),{value:n})}else"function"==typeof e&&"function"==typeof e.prototype.constructor&&(s={provide:e,useClass:e});if(!s)throw o(e),new Error("Error provider onfig!");if(!(void 0!==s.value||s.useClass||s.useExisiting||s.useFactory||s.provide instanceof r&&s.useFactory))throw o(e),new Error("Error provider onfig!");this.records.set(s.provide,s)}))}isProvided(e){return!!this.records.has(e)||!!this.parent&&this.parent.isProvided(e)}get(e,s){const t=this.records.get(e);let o=null;if(t?(void 0===t.value&&this.$_initRecord(t),o=t.value||null):this.parent&&(o=this.parent.get(e,s)),!o&&!(null==s?void 0:s.optional))throw new Error("Service not be provided, and not optional!");return o}$_initRecord(e){const s={useService:(e,s)=>this.get(e,s)};e.provide instanceof r&&e.provide.factory&&(e.value=e.provide.factory(s)),e.useClass?e.value=new e.useClass(s):e.useExisiting?e.value=this.get(e.useExisiting):e.useFactory&&(e.value=e.useFactory(s))}dispose(){for(const[,e]of this.records){if(!e.value)return;e.dispose?e.dispose(e.value):"function"==typeof e.value.dispose&&e.value.dispose()}this.parent=null,this.records.clear()}},e.Service=class extends i{constructor(e={}){super(),this.displayName="",this.$$=new s.BehaviorSubject({}),this.$s={},this.$a={},this.$e={};const t=e.state||{};Object.keys(t).forEach((e=>{this.$s[e]=new s.BehaviorSubject(t[e])})),(e.actions||[]).forEach((e=>{this.$a[e]=new s.Subject})),(e.events||[]).forEach((e=>{this.$e[e]=new s.Subject})),Object.keys(this.$s).forEach((e=>{this.subscribe(this.$s[e],{next:s=>{this.$$.next(this.state),o(`[Service ${this.displayName}]: set new state [${e}].`,"info"),o(s,"info")}})})),Object.keys(this.$a).forEach((e=>{this.subscribe(this.$a[e],{next:s=>{o(`[Service ${this.displayName}]: receive new action [${e}].`,"info"),o(s,"info")}})})),Object.keys(this.$e).forEach((e=>{this.subscribe(this.$e[e],{next:s=>{o(`[Service ${this.displayName}]: emit new event [${e}].`,"info"),o(s,"info")}})}))}get state(){const e={};return Object.keys(this.$s).forEach((t=>{const o=this.$s[t];o instanceof s.BehaviorSubject&&(e[t]=o.value)})),e}subscribe(e,...s){const t=e.subscribe(...s);this.beforeDispose((()=>{t.unsubscribe()}))}},e.config=e=>{Object.keys(e).forEach((s=>{s in t&&void 0!==e[s]&&(t[s]=e[s])}))},e.debug=o,Object.defineProperty(e,"__esModule",{value:!0})},"object"==typeof exports&&"undefined"!=typeof module?s(exports,require("rxjs")):"function"==typeof define&&define.amd?define(["exports","rxjs"],s):s((e="undefined"!=typeof globalThis?globalThis:e||self).RSCore={},e.rxjs);
