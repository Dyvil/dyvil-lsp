"use strict";(self.webpackChunkweb=self.webpackChunkweb||[]).push([[345],{78345:(ce,L,x)=>{x.r(L),x.d(L,{Adapter:()=>v,CodeActionAdaptor:()=>z,DefinitionAdapter:()=>V,DiagnosticsAdapter:()=>K,FormatAdapter:()=>U,FormatHelper:()=>w,FormatOnTypeAdapter:()=>$,InlayHintsAdapter:()=>G,Kind:()=>l,LibFiles:()=>E,OccurrencesAdapter:()=>W,OutlineAdapter:()=>B,QuickInfoAdapter:()=>Z,ReferenceAdapter:()=>j,RenameAdapter:()=>J,SignatureHelpAdapter:()=>H,SuggestAdapter:()=>C,WorkerManager:()=>N,flattenDiagnosticMessageText:()=>F,getJavaScriptWorker:()=>ae,getTypeScriptWorker:()=>le,setupJavaScript:()=>oe,setupTypeScript:()=>ne});var _=x(17374),S=x(67519),Y=x(89982),q=x(811),I=Object.defineProperty,ee=Object.getOwnPropertyDescriptor,te=Object.getOwnPropertyNames,re=Object.prototype.hasOwnProperty,M=(t,e,r,s)=>{if(e&&"object"==typeof e||"function"==typeof e)for(let i of te(e))!re.call(t,i)&&i!==r&&I(t,i,{get:()=>e[i],enumerable:!(s=ee(e,i))||s.enumerable});return t},h=(t,e,r)=>(((t,e,r)=>{e in t?I(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r})(t,"symbol"!=typeof e?e+"":e,r),r),n={};M(n,Y,"default");var N=class{constructor(e,r){(0,S.Z)(this,"_configChangeListener",void 0),(0,S.Z)(this,"_updateExtraLibsToken",void 0),(0,S.Z)(this,"_extraLibsChangeListener",void 0),(0,S.Z)(this,"_worker",void 0),(0,S.Z)(this,"_client",void 0),this._modeId=e,this._defaults=r,this._worker=null,this._client=null,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker()),this._updateExtraLibsToken=0,this._extraLibsChangeListener=this._defaults.onDidExtraLibsChange(()=>this._updateExtraLibs())}dispose(){this._configChangeListener.dispose(),this._extraLibsChangeListener.dispose(),this._stopWorker()}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}_updateExtraLibs(){var e=this;return(0,_.Z)(function*(){if(!e._worker)return;const r=++e._updateExtraLibsToken,s=yield e._worker.getProxy();e._updateExtraLibsToken===r&&s.updateExtraLibs(e._defaults.getExtraLibs())})()}_getClient(){var e=this;return this._client||(this._client=(0,_.Z)(function*(){return e._worker=n.editor.createWebWorker({moduleId:"vs/language/typescript/tsWorker",label:e._modeId,keepIdleModels:!0,createData:{compilerOptions:e._defaults.getCompilerOptions(),extraLibs:e._defaults.getExtraLibs(),customWorkerPath:e._defaults.workerOptions.customWorkerPath,inlayHintsOptions:e._defaults.inlayHintsOptions}}),e._defaults.getEagerModelSync()?yield e._worker.withSyncedResources(n.editor.getModels().filter(r=>r.getLanguageId()===e._modeId).map(r=>r.uri)):yield e._worker.getProxy()})()),this._client}getLanguageServiceWorker(...e){var r=this;return(0,_.Z)(function*(){const s=yield r._getClient();return r._worker&&(yield r._worker.withSyncedResources(e)),s})()}},a={};function F(t,e,r=0){if("string"==typeof t)return t;if(void 0===t)return"";let s="";if(r){s+=e;for(let i=0;i<r;i++)s+="  "}if(s+=t.messageText,r++,t.next)for(const i of t.next)s+=F(i,e,r);return s}function k(t){return t?t.map(e=>e.text).join(""):""}a["lib.d.ts"]=!0,a["lib.dom.d.ts"]=!0,a["lib.dom.iterable.d.ts"]=!0,a["lib.es2015.collection.d.ts"]=!0,a["lib.es2015.core.d.ts"]=!0,a["lib.es2015.d.ts"]=!0,a["lib.es2015.generator.d.ts"]=!0,a["lib.es2015.iterable.d.ts"]=!0,a["lib.es2015.promise.d.ts"]=!0,a["lib.es2015.proxy.d.ts"]=!0,a["lib.es2015.reflect.d.ts"]=!0,a["lib.es2015.symbol.d.ts"]=!0,a["lib.es2015.symbol.wellknown.d.ts"]=!0,a["lib.es2016.array.include.d.ts"]=!0,a["lib.es2016.d.ts"]=!0,a["lib.es2016.full.d.ts"]=!0,a["lib.es2017.d.ts"]=!0,a["lib.es2017.full.d.ts"]=!0,a["lib.es2017.intl.d.ts"]=!0,a["lib.es2017.object.d.ts"]=!0,a["lib.es2017.sharedmemory.d.ts"]=!0,a["lib.es2017.string.d.ts"]=!0,a["lib.es2017.typedarrays.d.ts"]=!0,a["lib.es2018.asyncgenerator.d.ts"]=!0,a["lib.es2018.asynciterable.d.ts"]=!0,a["lib.es2018.d.ts"]=!0,a["lib.es2018.full.d.ts"]=!0,a["lib.es2018.intl.d.ts"]=!0,a["lib.es2018.promise.d.ts"]=!0,a["lib.es2018.regexp.d.ts"]=!0,a["lib.es2019.array.d.ts"]=!0,a["lib.es2019.d.ts"]=!0,a["lib.es2019.full.d.ts"]=!0,a["lib.es2019.object.d.ts"]=!0,a["lib.es2019.string.d.ts"]=!0,a["lib.es2019.symbol.d.ts"]=!0,a["lib.es2020.bigint.d.ts"]=!0,a["lib.es2020.d.ts"]=!0,a["lib.es2020.full.d.ts"]=!0,a["lib.es2020.intl.d.ts"]=!0,a["lib.es2020.promise.d.ts"]=!0,a["lib.es2020.sharedmemory.d.ts"]=!0,a["lib.es2020.string.d.ts"]=!0,a["lib.es2020.symbol.wellknown.d.ts"]=!0,a["lib.es2021.d.ts"]=!0,a["lib.es2021.full.d.ts"]=!0,a["lib.es2021.intl.d.ts"]=!0,a["lib.es2021.promise.d.ts"]=!0,a["lib.es2021.string.d.ts"]=!0,a["lib.es2021.weakref.d.ts"]=!0,a["lib.es5.d.ts"]=!0,a["lib.es6.d.ts"]=!0,a["lib.esnext.d.ts"]=!0,a["lib.esnext.full.d.ts"]=!0,a["lib.esnext.intl.d.ts"]=!0,a["lib.esnext.promise.d.ts"]=!0,a["lib.esnext.string.d.ts"]=!0,a["lib.esnext.weakref.d.ts"]=!0,a["lib.scripthost.d.ts"]=!0,a["lib.webworker.d.ts"]=!0,a["lib.webworker.importscripts.d.ts"]=!0,a["lib.webworker.iterable.d.ts"]=!0;var v=class{constructor(t){this._worker=t}_textSpanToRange(t,e){let r=t.getPositionAt(e.start),s=t.getPositionAt(e.start+e.length),{lineNumber:i,column:c}=r,{lineNumber:g,column:d}=s;return{startLineNumber:i,startColumn:c,endLineNumber:g,endColumn:d}}},E=class{constructor(e){(0,S.Z)(this,"_libFiles",void 0),(0,S.Z)(this,"_hasFetchedLibFiles",void 0),(0,S.Z)(this,"_fetchLibFilesPromise",void 0),this._worker=e,this._libFiles={},this._hasFetchedLibFiles=!1,this._fetchLibFilesPromise=null}isLibFile(e){return!(!e||0!==e.path.indexOf("/lib.")||!a[e.path.slice(1)])}getOrCreateModel(e){const r=n.Uri.parse(e),s=n.editor.getModel(r);if(s)return s;if(this.isLibFile(r)&&this._hasFetchedLibFiles)return n.editor.createModel(this._libFiles[r.path.slice(1)],"typescript",r);const i=q.typescriptDefaults.getExtraLibs()[e];return i?n.editor.createModel(i.content,"typescript",r):null}_containsLibFile(e){for(let r of e)if(this.isLibFile(r))return!0;return!1}fetchLibFilesIfNecessary(e){var r=this;return(0,_.Z)(function*(){!r._containsLibFile(e)||(yield r._fetchLibFiles())})()}_fetchLibFiles(){return this._fetchLibFilesPromise||(this._fetchLibFilesPromise=this._worker().then(e=>e.getLibFiles()).then(e=>{this._hasFetchedLibFiles=!0,this._libFiles=e})),this._fetchLibFilesPromise}},K=class extends v{constructor(e,r,s,i){super(i),(0,S.Z)(this,"_disposables",[]),(0,S.Z)(this,"_listener",Object.create(null)),this._libFiles=e,this._defaults=r,this._selector=s;const c=o=>{if(o.getLanguageId()!==s)return;const u=()=>{const{onlyVisible:m}=this._defaults.getDiagnosticsOptions();m?o.isAttachedToEditor()&&this._doValidate(o):this._doValidate(o)};let f;const p=o.onDidChangeContent(()=>{clearTimeout(f),f=window.setTimeout(u,500)}),b=o.onDidChangeAttached(()=>{const{onlyVisible:m}=this._defaults.getDiagnosticsOptions();m&&(o.isAttachedToEditor()?u():n.editor.setModelMarkers(o,this._selector,[]))});this._listener[o.uri.toString()]={dispose(){p.dispose(),b.dispose(),clearTimeout(f)}},u()},g=o=>{n.editor.setModelMarkers(o,this._selector,[]);const u=o.uri.toString();this._listener[u]&&(this._listener[u].dispose(),delete this._listener[u])};this._disposables.push(n.editor.onDidCreateModel(o=>c(o))),this._disposables.push(n.editor.onWillDisposeModel(g)),this._disposables.push(n.editor.onDidChangeModelLanguage(o=>{g(o.model),c(o.model)})),this._disposables.push({dispose(){for(const o of n.editor.getModels())g(o)}});const d=()=>{for(const o of n.editor.getModels())g(o),c(o)};this._disposables.push(this._defaults.onDidChange(d)),this._disposables.push(this._defaults.onDidExtraLibsChange(d)),n.editor.getModels().forEach(o=>c(o))}dispose(){this._disposables.forEach(e=>e&&e.dispose()),this._disposables=[]}_doValidate(e){var r=this;return(0,_.Z)(function*(){const s=yield r._worker(e.uri);if(e.isDisposed())return;const i=[],{noSyntaxValidation:c,noSemanticValidation:g,noSuggestionDiagnostics:d}=r._defaults.getDiagnosticsOptions();c||i.push(s.getSyntacticDiagnostics(e.uri.toString())),g||i.push(s.getSemanticDiagnostics(e.uri.toString())),d||i.push(s.getSuggestionDiagnostics(e.uri.toString()));const o=yield Promise.all(i);if(!o||e.isDisposed())return;const u=o.reduce((p,b)=>b.concat(p),[]).filter(p=>-1===(r._defaults.getDiagnosticsOptions().diagnosticCodesToIgnore||[]).indexOf(p.code)),f=u.map(p=>p.relatedInformation||[]).reduce((p,b)=>b.concat(p),[]).map(p=>p.file?n.Uri.parse(p.file.fileName):null);yield r._libFiles.fetchLibFilesIfNecessary(f),!e.isDisposed()&&n.editor.setModelMarkers(e,r._selector,u.map(p=>r._convertDiagnostics(e,p)))})()}_convertDiagnostics(e,r){const s=r.start||0,i=r.length||1,{lineNumber:c,column:g}=e.getPositionAt(s),{lineNumber:d,column:o}=e.getPositionAt(s+i),u=[];return r.reportsUnnecessary&&u.push(n.MarkerTag.Unnecessary),r.reportsDeprecated&&u.push(n.MarkerTag.Deprecated),{severity:this._tsDiagnosticCategoryToMarkerSeverity(r.category),startLineNumber:c,startColumn:g,endLineNumber:d,endColumn:o,message:F(r.messageText,"\n"),code:r.code.toString(),tags:u,relatedInformation:this._convertRelatedInformation(e,r.relatedInformation)}}_convertRelatedInformation(e,r){if(!r)return[];const s=[];return r.forEach(i=>{let c=e;if(i.file&&(c=this._libFiles.getOrCreateModel(i.file.fileName)),!c)return;const g=i.start||0,d=i.length||1,{lineNumber:o,column:u}=c.getPositionAt(g),{lineNumber:f,column:p}=c.getPositionAt(g+d);s.push({resource:c.uri,startLineNumber:o,startColumn:u,endLineNumber:f,endColumn:p,message:F(i.messageText,"\n")})}),s}_tsDiagnosticCategoryToMarkerSeverity(e){switch(e){case 1:return n.MarkerSeverity.Error;case 3:return n.MarkerSeverity.Info;case 0:return n.MarkerSeverity.Warning;case 2:return n.MarkerSeverity.Hint}return n.MarkerSeverity.Info}},C=class extends v{get triggerCharacters(){return["."]}provideCompletionItems(t,e,r,s){var i=this;return(0,_.Z)(function*(){const c=t.getWordUntilPosition(e),g=new n.Range(e.lineNumber,c.startColumn,e.lineNumber,c.endColumn),d=t.uri,o=t.getOffsetAt(e),u=yield i._worker(d);if(t.isDisposed())return;const f=yield u.getCompletionsAtPosition(d.toString(),o);return!f||t.isDisposed()?void 0:{suggestions:f.entries.map(b=>{let m=g;if(b.replacementSpan){const T=t.getPositionAt(b.replacementSpan.start),D=t.getPositionAt(b.replacementSpan.start+b.replacementSpan.length);m=new n.Range(T.lineNumber,T.column,D.lineNumber,D.column)}const A=[];return-1!==b.kindModifiers?.indexOf("deprecated")&&A.push(n.languages.CompletionItemTag.Deprecated),{uri:d,position:e,offset:o,range:m,label:b.name,insertText:b.name,sortText:b.sortText,kind:C.convertKind(b.kind),tags:A}})}})()}resolveCompletionItem(t,e){var r=this;return(0,_.Z)(function*(){const s=t,i=s.uri,c=s.position,g=s.offset,o=yield(yield r._worker(i)).getCompletionEntryDetails(i.toString(),g,s.label);return o?{uri:i,position:c,label:o.name,kind:C.convertKind(o.kind),detail:k(o.displayParts),documentation:{value:C.createDocumentationString(o)}}:s})()}static convertKind(t){switch(t){case l.primitiveType:case l.keyword:return n.languages.CompletionItemKind.Keyword;case l.variable:case l.localVariable:return n.languages.CompletionItemKind.Variable;case l.memberVariable:case l.memberGetAccessor:case l.memberSetAccessor:return n.languages.CompletionItemKind.Field;case l.function:case l.memberFunction:case l.constructSignature:case l.callSignature:case l.indexSignature:return n.languages.CompletionItemKind.Function;case l.enum:return n.languages.CompletionItemKind.Enum;case l.module:return n.languages.CompletionItemKind.Module;case l.class:return n.languages.CompletionItemKind.Class;case l.interface:return n.languages.CompletionItemKind.Interface;case l.warning:return n.languages.CompletionItemKind.File}return n.languages.CompletionItemKind.Property}static createDocumentationString(t){let e=k(t.documentation);if(t.tags)for(const r of t.tags)e+=`\n\n${R(r)}`;return e}};function R(t){let e=`*@${t.name}*`;if("param"===t.name&&t.text){const[r,...s]=t.text;e+=`\`${r.text}\``,s.length>0&&(e+=` \u2014 ${s.map(i=>i.text).join(" ")}`)}else Array.isArray(t.text)?e+=` \u2014 ${t.text.map(r=>r.text).join(" ")}`:t.text&&(e+=` \u2014 ${t.text}`);return e}var H=class X extends v{constructor(...e){super(...e),(0,S.Z)(this,"signatureHelpTriggerCharacters",["(",","])}static _toSignatureHelpTriggerReason(e){switch(e.triggerKind){case n.languages.SignatureHelpTriggerKind.TriggerCharacter:return e.triggerCharacter?e.isRetrigger?{kind:"retrigger",triggerCharacter:e.triggerCharacter}:{kind:"characterTyped",triggerCharacter:e.triggerCharacter}:{kind:"invoked"};case n.languages.SignatureHelpTriggerKind.ContentChange:return e.isRetrigger?{kind:"retrigger"}:{kind:"invoked"};default:return{kind:"invoked"}}}provideSignatureHelp(e,r,s,i){var c=this;return(0,_.Z)(function*(){const g=e.uri,d=e.getOffsetAt(r),o=yield c._worker(g);if(e.isDisposed())return;const u=yield o.getSignatureHelpItems(g.toString(),d,{triggerReason:X._toSignatureHelpTriggerReason(i)});if(!u||e.isDisposed())return;const f={activeSignature:u.selectedItemIndex,activeParameter:u.argumentIndex,signatures:[]};return u.items.forEach(p=>{const b={label:"",parameters:[]};b.documentation={value:k(p.documentation)},b.label+=k(p.prefixDisplayParts),p.parameters.forEach((m,A,T)=>{const D=k(m.displayParts),ue={label:D,documentation:{value:k(m.documentation)}};b.label+=D,b.parameters.push(ue),A<T.length-1&&(b.label+=k(p.separatorDisplayParts))}),b.label+=k(p.suffixDisplayParts),f.signatures.push(b)}),{value:f,dispose(){}}})()}},Z=class extends v{provideHover(t,e,r){var s=this;return(0,_.Z)(function*(){const i=t.uri,c=t.getOffsetAt(e),g=yield s._worker(i);if(t.isDisposed())return;const d=yield g.getQuickInfoAtPosition(i.toString(),c);if(!d||t.isDisposed())return;const o=k(d.documentation),u=d.tags?d.tags.map(p=>R(p)).join("  \n\n"):"",f=k(d.displayParts);return{range:s._textSpanToRange(t,d.textSpan),contents:[{value:"```typescript\n"+f+"\n```\n"},{value:o+(u?"\n\n"+u:"")}]}})()}},W=class extends v{provideDocumentHighlights(t,e,r){var s=this;return(0,_.Z)(function*(){const i=t.uri,c=t.getOffsetAt(e),g=yield s._worker(i);if(t.isDisposed())return;const d=yield g.getOccurrencesAtPosition(i.toString(),c);return d&&!t.isDisposed()?d.map(o=>({range:s._textSpanToRange(t,o.textSpan),kind:o.isWriteAccess?n.languages.DocumentHighlightKind.Write:n.languages.DocumentHighlightKind.Text})):void 0})()}},V=class extends v{constructor(t,e){super(e),this._libFiles=t}provideDefinition(t,e,r){var s=this;return(0,_.Z)(function*(){const i=t.uri,c=t.getOffsetAt(e),g=yield s._worker(i);if(t.isDisposed())return;const d=yield g.getDefinitionAtPosition(i.toString(),c);if(!d||t.isDisposed()||(yield s._libFiles.fetchLibFilesIfNecessary(d.map(u=>n.Uri.parse(u.fileName))),t.isDisposed()))return;const o=[];for(let u of d){const f=s._libFiles.getOrCreateModel(u.fileName);f&&o.push({uri:f.uri,range:s._textSpanToRange(f,u.textSpan)})}return o})()}},j=class extends v{constructor(t,e){super(e),this._libFiles=t}provideReferences(t,e,r,s){var i=this;return(0,_.Z)(function*(){const c=t.uri,g=t.getOffsetAt(e),d=yield i._worker(c);if(t.isDisposed())return;const o=yield d.getReferencesAtPosition(c.toString(),g);if(!o||t.isDisposed()||(yield i._libFiles.fetchLibFilesIfNecessary(o.map(f=>n.Uri.parse(f.fileName))),t.isDisposed()))return;const u=[];for(let f of o){const p=i._libFiles.getOrCreateModel(f.fileName);p&&u.push({uri:p.uri,range:i._textSpanToRange(p,f.textSpan)})}return u})()}},B=class extends v{provideDocumentSymbols(t,e){var r=this;return(0,_.Z)(function*(){const s=t.uri,i=yield r._worker(s);if(t.isDisposed())return;const c=yield i.getNavigationBarItems(s.toString());if(!c||t.isDisposed())return;const g=(o,u,f)=>{let p={name:u.text,detail:"",kind:y[u.kind]||n.languages.SymbolKind.Variable,range:r._textSpanToRange(t,u.spans[0]),selectionRange:r._textSpanToRange(t,u.spans[0]),tags:[]};if(f&&(p.containerName=f),u.childItems&&u.childItems.length>0)for(let b of u.childItems)g(o,b,p.name);o.push(p)};let d=[];return c.forEach(o=>g(d,o)),d})()}},l=class{};h(l,"unknown",""),h(l,"keyword","keyword"),h(l,"script","script"),h(l,"module","module"),h(l,"class","class"),h(l,"interface","interface"),h(l,"type","type"),h(l,"enum","enum"),h(l,"variable","var"),h(l,"localVariable","local var"),h(l,"function","function"),h(l,"localFunction","local function"),h(l,"memberFunction","method"),h(l,"memberGetAccessor","getter"),h(l,"memberSetAccessor","setter"),h(l,"memberVariable","property"),h(l,"constructorImplementation","constructor"),h(l,"callSignature","call"),h(l,"indexSignature","index"),h(l,"constructSignature","construct"),h(l,"parameter","parameter"),h(l,"typeParameter","type parameter"),h(l,"primitiveType","primitive type"),h(l,"label","label"),h(l,"alias","alias"),h(l,"const","const"),h(l,"let","let"),h(l,"warning","warning");var y=Object.create(null);y[l.module]=n.languages.SymbolKind.Module,y[l.class]=n.languages.SymbolKind.Class,y[l.enum]=n.languages.SymbolKind.Enum,y[l.interface]=n.languages.SymbolKind.Interface,y[l.memberFunction]=n.languages.SymbolKind.Method,y[l.memberVariable]=n.languages.SymbolKind.Property,y[l.memberGetAccessor]=n.languages.SymbolKind.Property,y[l.memberSetAccessor]=n.languages.SymbolKind.Property,y[l.variable]=n.languages.SymbolKind.Variable,y[l.const]=n.languages.SymbolKind.Variable,y[l.localVariable]=n.languages.SymbolKind.Variable,y[l.variable]=n.languages.SymbolKind.Variable,y[l.function]=n.languages.SymbolKind.Function,y[l.localFunction]=n.languages.SymbolKind.Function;var O,P,w=class extends v{static _convertOptions(t){return{ConvertTabsToSpaces:t.insertSpaces,TabSize:t.tabSize,IndentSize:t.tabSize,IndentStyle:2,NewLineCharacter:"\n",InsertSpaceAfterCommaDelimiter:!0,InsertSpaceAfterSemicolonInForStatements:!0,InsertSpaceBeforeAndAfterBinaryOperators:!0,InsertSpaceAfterKeywordsInControlFlowStatements:!0,InsertSpaceAfterFunctionKeywordForAnonymousFunctions:!0,InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis:!1,InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets:!1,InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces:!1,PlaceOpenBraceOnNewLineForControlBlocks:!1,PlaceOpenBraceOnNewLineForFunctions:!1}}_convertTextChanges(t,e){return{text:e.newText,range:this._textSpanToRange(t,e.span)}}},U=class extends w{provideDocumentRangeFormattingEdits(t,e,r,s){var i=this;return(0,_.Z)(function*(){const c=t.uri,g=t.getOffsetAt({lineNumber:e.startLineNumber,column:e.startColumn}),d=t.getOffsetAt({lineNumber:e.endLineNumber,column:e.endColumn}),o=yield i._worker(c);if(t.isDisposed())return;const u=yield o.getFormattingEditsForRange(c.toString(),g,d,w._convertOptions(r));return u&&!t.isDisposed()?u.map(f=>i._convertTextChanges(t,f)):void 0})()}},$=class extends w{get autoFormatTriggerCharacters(){return[";","}","\n"]}provideOnTypeFormattingEdits(t,e,r,s,i){var c=this;return(0,_.Z)(function*(){const g=t.uri,d=t.getOffsetAt(e),o=yield c._worker(g);if(t.isDisposed())return;const u=yield o.getFormattingEditsAfterKeystroke(g.toString(),d,r,w._convertOptions(s));return u&&!t.isDisposed()?u.map(f=>c._convertTextChanges(t,f)):void 0})()}},z=class extends w{provideCodeActions(t,e,r,s){var i=this;return(0,_.Z)(function*(){const c=t.uri,g=t.getOffsetAt({lineNumber:e.startLineNumber,column:e.startColumn}),d=t.getOffsetAt({lineNumber:e.endLineNumber,column:e.endColumn}),o=w._convertOptions(t.getOptions()),u=r.markers.filter(m=>m.code).map(m=>m.code).map(Number),f=yield i._worker(c);if(t.isDisposed())return;const p=yield f.getCodeFixesAtPosition(c.toString(),g,d,u,o);return!p||t.isDisposed()?{actions:[],dispose:()=>{}}:{actions:p.filter(m=>0===m.changes.filter(A=>A.isNewFile).length).map(m=>i._tsCodeFixActionToMonacoCodeAction(t,r,m)),dispose:()=>{}}})()}_tsCodeFixActionToMonacoCodeAction(t,e,r){const s=[];for(const c of r.changes)for(const g of c.textChanges)s.push({resource:t.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(t,g.span),text:g.newText}});return{title:r.description,edit:{edits:s},diagnostics:e.markers,kind:"quickfix"}}},J=class extends v{constructor(t,e){super(e),this._libFiles=t}provideRenameEdits(t,e,r,s){var i=this;return(0,_.Z)(function*(){const c=t.uri,g=c.toString(),d=t.getOffsetAt(e),o=yield i._worker(c);if(t.isDisposed())return;const u=yield o.getRenameInfo(g,d,{allowRenameOfImportPath:!1});if(!1===u.canRename)return{edits:[],rejectReason:u.localizedErrorMessage};if(void 0!==u.fileToRename)throw new Error("Renaming files is not supported.");const f=yield o.findRenameLocations(g,d,!1,!1,!1);if(!f||t.isDisposed())return;const p=[];for(const b of f){const m=i._libFiles.getOrCreateModel(b.fileName);if(!m)throw new Error(`Unknown file ${b.fileName}.`);p.push({resource:m.uri,versionId:void 0,textEdit:{range:i._textSpanToRange(m,b.textSpan),text:r}})}return{edits:p}})()}},G=class extends v{provideInlayHints(t,e,r){var s=this;return(0,_.Z)(function*(){const i=t.uri,c=i.toString(),g=t.getOffsetAt({lineNumber:e.startLineNumber,column:e.startColumn}),d=t.getOffsetAt({lineNumber:e.endLineNumber,column:e.endColumn}),o=yield s._worker(i);return t.isDisposed()?null:{hints:(yield o.provideInlayHints(c,g,d)).map(p=>({...p,label:p.text,position:t.getPositionAt(p.position),kind:s._convertHintKind(p.kind)})),dispose:()=>{}}})()}_convertHintKind(t){return"Parameter"===t?n.languages.InlayHintKind.Parameter:n.languages.InlayHintKind.Type}};function ne(t){P=Q(t,"typescript")}function oe(t){O=Q(t,"javascript")}function ae(){return new Promise((t,e)=>{if(!O)return e("JavaScript not registered!");t(O)})}function le(){return new Promise((t,e)=>{if(!P)return e("TypeScript not registered!");t(P)})}function Q(t,e){const r=new N(e,t),s=(...c)=>r.getLanguageServiceWorker(...c),i=new E(s);return n.languages.registerCompletionItemProvider(e,new C(s)),n.languages.registerSignatureHelpProvider(e,new H(s)),n.languages.registerHoverProvider(e,new Z(s)),n.languages.registerDocumentHighlightProvider(e,new W(s)),n.languages.registerDefinitionProvider(e,new V(i,s)),n.languages.registerReferenceProvider(e,new j(i,s)),n.languages.registerDocumentSymbolProvider(e,new B(s)),n.languages.registerDocumentRangeFormattingEditProvider(e,new U(s)),n.languages.registerOnTypeFormattingEditProvider(e,new $(s)),n.languages.registerCodeActionProvider(e,new z(s)),n.languages.registerRenameProvider(e,new J(i,s)),n.languages.registerInlayHintsProvider(e,new G(s)),new K(i,t,e,s),s}}}]);