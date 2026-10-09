const fs = require("fs"), vm = require("vm"), assert = require("assert");
const source = fs.readFileSync(process.argv[2] || require("path").join(__dirname, "../FrameworkBA_CheckDashboardFactory.js"), "utf8");
const ctx = { FrameworkBA_CheckTableWriter: { write() { return { changed: true }; } } };
vm.createContext(ctx); vm.runInContext(source, ctx);
let seq=1, clones=0;
const all={};
function coll(a){return {Count:a.length,Refresh(){this.Count=a.length;},GetAt(i){return a[i];},AddNew(Name,Value){const t={Name,Value,Notes:"",Update(){return true;}};a.push(t);this.Count=a.length;return t;},array:a};}
function el(Name,Type,Stereotype,tags){const e={Name,Type,Stereotype:Stereotype||"",ElementID:seq++,ElementGUID:"E"+seq,Notes:"old",TaggedValues:coll([]),Update(){return true;}};all[e.ElementID]=e;for(const n of tags||[])e.TaggedValues.AddNew(n,"old");return e;}
const charts=["Conformity_All","Conformity_Artifacts","Conformity_Diagrams","Actions","Issues","Classification_All","Classification_Packages","Classification_Artifacts","Classification_Diagrams"];
const summaries=["Title","Check_Date","Error_Count","Warning_Count","Object_Count","Snapshot_Coverage","Snapshot_NotPlanned_Count","Conformity_Title","Compliant_Value","NonCompliant_Value","Foreign_Value","Scope"];
function pkg(id,guid,name){return {PackageID:id,PackageGUID:guid,Name:name,ParentID:0,Element:el(name,"Package"),Elements:coll([]),Diagrams:coll([]),Packages:coll([]),Update(){return true;}};}
function dashboard(id,guid){const p=pkg(id,guid,"_Check_results");const els=charts.map(n=>el("_Chart_"+n,"Artifact","SSDynamicChart",["FrameworkBA_CheckChart_Data"])).concat(summaries.map(n=>el("_Summary_"+n,"Text")),[el("_Detail_Table","Artifact","custom table",["data","dataFormat"]),el("_Check_Refresh","Artifact","Scriptlet")]);p.Elements=coll(els);p.Diagrams=coll([{Name:"_Check_Result_Diagram",DiagramID:id,DiagramGUID:"D"+id,PackageID:id,DiagramObjects:coll(els.map(e=>({ElementID:e.ElementID})))}]);return p;}
const prototype=dashboard(1,"PROTO"), root=pkg(2,"ROOT","Analysis"), target=pkg(3,"TARGET","Exigences");target.ParentID=2;const library=pkg(5,"LIBRARY","_Librairie");root.Packages.array.push(target,library);root.Packages.Refresh();
const packages=[prototype,root,target,library];
library.Packages.AddNew=function(name){const p=pkg(50,"CONTAINER",name);packages.push(p);this.array.push(p);this.Refresh();return p;};
prototype.Clone=function(){clones++;const p=dashboard(4,"COPY");p.ParentID=99;p.Update=function(){if(p.ParentID===50 && !packages.find(x=>x.PackageID===50).Packages.array.includes(p)){packages.find(x=>x.PackageID===50).Packages.array.push(p);}return true;};packages.push(p);return p;};
const repo={GetPackageByGuid(g){return packages.find(p=>p.PackageGUID===g);},GetPackageByID(id){return packages.find(p=>p.PackageID===id);},GetElementByID(id){return all[id];},WriteOutput(){}};
const api=ctx.FrameworkBA_CheckDashboardFactory;
let result=api.create("PROTO","TARGET","ROOT",{repository:repo});assert.equal(result.changed,true);assert.equal(clones,1);
const copy=repo.GetPackageByGuid("COPY");assert.equal(copy.ParentID,50);assert.equal(copy.Name,"_CHECK - Exigences");
assert.equal(copy.Element.TaggedValues.array.find(t=>t.Name==="FrameworkBA_Check_TargetGuid").Value,"TARGET");
for(const e of copy.Elements.array.filter(e=>e.Stereotype==="SSDynamicChart")){assert.equal(e.TaggedValues.array[0].Notes,"{}");}
result=api.create("PROTO","TARGET","ROOT",{repository:repo});assert.equal(result.changed,false);assert.equal(clones,1);
const old=pkg(60,'OLD','_Check_results'); packages.push(old);root.Packages.array.push(old);root.Packages.Refresh();
const destination=packages.find(p=>p.PackageID===50);destination.Packages.array.length=0;destination.Packages.Refresh();old.Packages.array.push(copy);old.Packages.Refresh();copy.ParentID=60;copy.Name='_CHECK — Exigences';
copy.Update=function(){for(const p of packages){let a=p.Packages.array;let at=a.indexOf(copy);if(at>=0)a.splice(at,1);p.Packages.Refresh();}const owner=repo.GetPackageByID(copy.ParentID);owner.Packages.array.push(copy);owner.Packages.Refresh();return true;};
result=api.create('PROTO','TARGET','ROOT',{repository:repo});assert.equal(result.changed,true);assert.equal(copy.ParentID,50);assert.equal(copy.Name,'_CHECK - Exigences');assert.equal(clones,1);
result=api.create('PROTO','TARGET','ROOT',{repository:repo});assert.equal(result.changed,false);assert.equal(clones,1);
const outside=el("External","Text");prototype.Diagrams.GetAt(0).DiagramObjects.array.push({ElementID:outside.ElementID});prototype.Diagrams.GetAt(0).DiagramObjects.Refresh();
assert.throws(()=>api.inspect(prototype,repo),/Reference externe/);
assert.equal(prototype.Elements.GetAt(0).TaggedValues.GetAt(0).Value,"old");
console.log("Clone configuration, independent elements, cache reset, existing instance reuse, external reference rejection, unchanged prototype: OK");

