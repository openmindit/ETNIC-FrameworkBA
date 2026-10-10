const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2] || path.join(__dirname,"../FrameworkBA_CheckDashboard.js"),"utf8"),ctx);
let reads=0;
const items=[{ElementID:1},{ElementID:2},{ElementID:1},{ElementID:3}];
const diagram={DiagramObjects:{Count:items.length,GetAt(i){return items[i]}}};
const repo={GetElementByID(id){reads++;return {ElementID:id,Name:id===3?"duplicate":"target"+id}}};
const index=ctx.FrameworkBA_CheckDashboard.indexDiagram(diagram,repo);
for(let i=0;i<22;i++) assert.equal(index.find("target1").ElementID,1);
assert.equal(reads,3);assert.equal(index.reads,3);
assert.throws(()=>index.find("absent"),/absente/);
const dup=ctx.FrameworkBA_CheckDashboard.indexDiagram(diagram,{GetElementByID(id){return {Name:"same"}}});
assert.throws(()=>dup.find("same"),/Plusieurs/);
console.log("Dashboard targets: one read per distinct element, cached lookups, duplicate and missing targets checked");


let sqlReads=0,queries=0;
const sqlRepo={SQLQuery(q){queries++;assert.match(q,/WHERE d.Diagram_ID = 42$/);return "<EADATA><Dataset_0><Data><Row><TargetId>1</TargetId><TargetName>A &amp; B</TargetName></Row><Row><TargetId>1</TargetId><TargetName>A &amp; B</TargetName></Row><Row><TargetId>2</TargetId><TargetName>unused</TargetName></Row><Row><TargetId>3</TargetId><TargetName>same</TargetName></Row><Row><TargetId>4</TargetId><TargetName>same</TargetName></Row></Data></Dataset_0></EADATA>"},GetElementByID(id){sqlReads++;return {ElementID:id,Name:"A & B"}}};
const sqlIndex=ctx.FrameworkBA_CheckDashboard.indexDiagram({DiagramID:42},sqlRepo);
assert.equal(sqlReads,0);assert.equal(queries,1);
assert.equal(sqlIndex.find("A & B").ElementID,1);sqlIndex.find("A & B");assert.equal(sqlReads,1);assert.equal(sqlIndex.reads,1);
assert.throws(()=>sqlIndex.find("same"),/Plusieurs/);assert.throws(()=>sqlIndex.find("missing"),/absente/);
assert.equal(sqlReads,1,"unused and ambiguous elements must not load");
let refreshes=0;
const configTags=["TargetGuid","RootGuid","Scope","TemplateVersion"].map((n,i)=>({Name:"FrameworkBA_Check_"+n,Value:["P","R","PACKAGE","1"][i]}));
const configRepo={GetPackageByID(){return {Element:{TaggedValues:{Refresh(){refreshes++},Count:configTags.length,GetAt(i){return configTags[i]}}}}},GetPackageByGuid(){return {}}};
assert.equal(ctx.FrameworkBA_CheckDashboard.readConfiguration({PackageID:1},configRepo).scope,"PACKAGE");assert.equal(refreshes,1);
console.log("SQL targets: one query, lazy cached loads, duplicate/missing checks; configuration tags refreshed once");
