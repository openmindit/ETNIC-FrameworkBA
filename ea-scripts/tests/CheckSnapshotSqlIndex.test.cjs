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


root.PackageID=1;a.PackageID=2;b.PackageID=3;
root.Element.ElementID=10;a.Element.ElementID=20;b.Element.ElementID=30;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
const carrierRows=[a.Element,b.Element,a.Elements.GetAt(0),a.Elements.GetAt(1)];
let queries=0;
function xmlRows(){return "<?xml version=\"1.0\"?><EADATA><Dataset_0><Data>"+carrierRows.map((e,i)=>{
 const tag=e.TaggedValues.GetAt(0);
 return "<Row><CarrierGuid>"+esc(e.ElementGUID)+"</CarrierGuid><CarrierName>"+esc(e.Name)+"</CarrierName><CheckValue>&lt;memo&gt;</CheckValue><CheckNotes>"+(i===1?"<![CDATA["+tag.Notes+"]]>":esc(tag.Notes))+"</CheckNotes></Row>";
}).join("")+"</Data></Dataset_0></EADATA>";}
function hierarchy(){return "<EADATA><Dataset_0><Data>"+[[1,0,"R"],[2,1,"A"],[3,1,"B"],[99,0,"OUTSIDE"]].map(([pid,parent,g])=>"<Row><PackageId>"+pid+"</PackageId><ParentId>"+parent+"</ParentId><PackageGuid>"+g+"</PackageGuid><PackageName>"+g+"</PackageName></Row>").join("")+"</Data></Dataset_0></EADATA>";}
repo.SQLQuery=function(q){queries++;assert.match(q,/^SELECT /);if(q.includes("FROM t_package"))return hierarchy();assert.match(q,/o.Package_ID IN \(1,2,3\)/);assert.match(q,/o.Object_ID IN \(10\)/);return xmlRows()};
const oldChildren=root.Packages;
Object.defineProperty(root,"Packages",{configurable:true,get(){throw new Error("COM hierarchy traversal")}});
reads=0;
const sqlIndex=api.buildIndex("R",{repository:repo,output(){}});
assert.equal(queries,2);assert.equal(reads,0,"SQL index must not refresh tagged value collections");
assert.equal(sqlIndex.mode,"SQL");assert.equal(sqlIndex.entries.length,4);
assert.equal(JSON.stringify(api.collect("A","R",{repository:repo,index:sqlIndex,output(){}})),JSON.stringify(regular));
const originalGet=repo.GetPackageByGuid, originalParent=repo.GetPackageByID;
repo.GetPackageByGuid=repo.GetPackageByID=()=>{throw new Error("Repeated EA package access")};
assert.equal(JSON.stringify(api.collect("A","R",{repository:repo,index:sqlIndex,output(){}})),JSON.stringify(regular));
assert.throws(()=>api.collect("OUTSIDE","R",{repository:repo,index:sqlIndex,output(){}}),/racine fournie/);
repo.GetPackageByGuid=originalGet;repo.GetPackageByID=originalParent;
a.Element.TaggedValues.GetAt(0).Notes=JSON.stringify({...as,object:{...as.object,name:"A &lt; literal <tag> & café 😀"}});
const special=api.buildIndex("R",{repository:repo,output(){}});
assert.equal(special.entries[0].snapshot.object.name,"A &lt; literal <tag> & café 😀");
repo.SQLQuery=()=>"SQL error";
assert.throws(()=>api.buildIndex("R",{repository:repo}),/Reponse SQL CHECK invalide/);
repo.SQLQuery=q=>q.includes("FROM t_package")?hierarchy():"<EADATA><Dataset_0><Data><Row><CarrierGuid>X</CarrierGuid><CheckNotes>bad JSON</CheckNotes></Row></Data></Dataset_0></EADATA>";
assert.throws(()=>api.buildIndex("R",{repository:repo}),/JSON CHECK invalide/);
repo.SQLQuery=q=>q.includes("FROM t_package")?hierarchy():"<EADATA><Dataset_0><Data/></Dataset_0></EADATA>";
assert.equal(api.buildIndex("R",{repository:repo}).entries.length,0);
console.log("SQL batch: two read-only queries, no tag refreshes, identical collection, memo/CDATA/entities preserved, invalid responses rejected");
