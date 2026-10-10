const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(process.argv[2] || path.join(__dirname,'../../src/analysisStructureSynchronizer.js'),'utf8');
const start=source.indexOf('_checkRootDirectContent: function'),end=source.indexOf('_buildCompactRootCheckSnapshot:',start);
const config={libraryName:'_Librairie',homeDiagramName:'TXT Accueil',homeDiagramType:'Logical',homeDiagramMetaType:'Labnaf - Common::Free Text'};
const addin={fbaConstants:{ANALYSIS_ROOT_CONTENT:config,TAG_SOURCE_ANALYSIS_ELEMENT_GUID:'source'},repositoryService:{getTaggedValue:e=>e.source}};
const api=vm.runInNewContext('({'+source.slice(start,end).trim().replace(/,$/,'')+'})',{addin});
api._getOperationDefinitions=()=>[{guid:'DEF'}];api._registerCheckIssue=(r,i)=>r.issues.push(i);api._createCheckRuleResult=(...a)=>({passed:a[10]});
function coll(a){return {Count:a.length,GetAt:i=>a[i]};}
const library={Name:'_Librairie'},analysis={Name:'Exigences',Element:{source:'{def}'}};
const home={Name:'TXT Accueil',Type:'Logical',StyleEx:'MDGDgm=Labnaf - Common::Free Text;Other=1;'};
function run(packages,elements,diagrams){const r={issues:[],ruleResults:[]};api._checkRootDirectContent({PackageGUID:'ROOT',Name:'Root',Packages:coll(packages),Elements:coll(elements),Diagrams:coll(diagrams)},r);return r;}
assert.equal(run([library,analysis],[],[home]).issues.length,0);
let r=run([library,analysis,{Name:'_Unknown',Element:{}}],[{Name:'Dashboard',ElementGUID:'E'}],[home,{Name:'Coverage',Type:'Logical',DiagramGUID:'D'}]);
assert.deepEqual(r.issues.map(i=>i.code),['ROOT_FOREIGN_PACKAGE','ROOT_FOREIGN_ELEMENT','ROOT_FOREIGN_DIAGRAM']);
assert(r.issues.every(i=>i.objectGuid==='ROOT' && i.scope==='LOCAL'));
assert(run([library],[],[{...home,StyleEx:'MDGDgm=Other;'}]).issues.some(i=>i.code==='ROOT_HOME_DIAGRAM_MISSING'));
assert(run([library],[],[home,home]).issues.some(i=>i.code==='ROOT_HOME_DIAGRAM_DUPLICATE'));
assert(run([library,library],[],[home]).issues.some(i=>i.code==='ROOT_LIBRARY_DUPLICATE'));
console.log('ROOT whitelist, MDG identity, local ownership, foreign technical objects and duplicates: OK');
