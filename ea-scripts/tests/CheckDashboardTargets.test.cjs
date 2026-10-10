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

