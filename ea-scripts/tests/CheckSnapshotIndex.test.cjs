const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2] || path.join(__dirname,"../FrameworkBA_CheckSnapshotCollector.js"),"utf8"),ctx);
let reads=0;
function col(items){return {Count:items.length,GetAt(i){return items[i]},Refresh(){reads++}}}
function element(guid,snapshot){return {ElementGUID:guid,Name:guid,TaggedValues:col(snapshot?[{Name:"ETNIC_Check_Result",Value:"<memo>",Notes:JSON.stringify(snapshot)}]:[])}}
function pkg(guid,snapshot){return {PackageGUID:guid,Name:guid,ParentID:guid==="R"?0:1,Element:element(guid+"E",snapshot),Elements:col([]),Packages:col([])}}
function snapshot(guid){return {scope:"PACKAGE",object:{guid,type:"PACKAGE",name:guid},checkedAt:"date",issues:[],content:{artifacts:[],diagrams:[]},metrics:{}}}
const root=pkg("R",null),a=pkg("A",snapshot("A")),b=pkg("B",snapshot("B"));
const ds={scope:"DIAGRAM",object:{guid:"D",type:"DIAGRAM",name:"D"},checkedAt:"date",issues:[{code:"NOTE",severity:"ERROR"}]};
const art={scope:"ARTIFACT",object:{guid:"X",type:"ARTIFACT",name:"X"},checkedAt:"date",issues:[]};
const as=snapshot("A");as.content.artifacts=["X"];as.content.diagrams=["D","F"];as.content.diagramsWithoutSnapshot=[{guid:"F",name:"F",reason:"DIAGRAM_NOT_IN_METAMODEL",issues:[{code:"DIAGRAM_NOT_IN_METAMODEL",severity:"ERROR"}]}];
a.Element=element("AE",as);a.Elements=col([element("X",art),element("DGC",ds)]);
root.Packages=col([a,b]);
const repo={GetPackageByGuid(g){return {R:root,A:a,B:b}[g]},GetPackageByID(){return root},GetDiagramByGuid(){return {Name:"F"}}};
const api=ctx.FrameworkBA_CheckSnapshotCollector;
const regular=api.collect("A","R",{repository:repo,output(){}});
reads=0;let progress=[];
const index=api.buildIndex("R",{repository:repo,output(m){progress.push(m)}});
assert.equal(reads,5);const after=reads;
const indexed=api.collect("A","R",{repository:repo,index,output(){}});
api.collect("B","R",{repository:repo,index,output(){}});
assert.equal(reads,after,"indexed collections must not read tagged values again");
assert.equal(JSON.stringify(indexed),JSON.stringify(regular));
assert.equal(indexed.summary.notPlanned,1);assert.equal(indexed.summary.errors,2);
assert.equal(progress.length,4);
assert.throws(()=>api.collect("A","R",{repository:repo,index:Object.assign({},index,{rootGuid:"OTHER"}),output(){}}),/autre racine/);
console.log("One-pass index: identical data, diagram carriers and unplanned issues preserved, zero repeated tag reads");
