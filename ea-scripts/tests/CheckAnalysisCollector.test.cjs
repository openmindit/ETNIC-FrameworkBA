const fs=require("node:fs"), vm=require("node:vm"), assert=require("node:assert/strict"), path=require("node:path");
const context={}; vm.createContext(context);
const base=process.argv[2] || path.join(__dirname,"..");
vm.runInContext(fs.readFileSync(path.join(base, process.argv[2] ? "root-views.js" : "FrameworkBA_CheckRootViews.js"),"utf8"),context);
vm.runInContext(fs.readFileSync(path.join(base, process.argv[2] ? "analysis-collector.js" : "FrameworkBA_CheckAnalysisCollector.js"),"utf8"),context);
const group={scope:"LOCAL",objectGuids:["D1","D2"],code:"DUPLICATE",severity:"ERROR"};
const root={scope:"ROOT",schemaVersion:2,storage:"DISTRIBUTED",success:true,rootGuid:"R",checkedAt:"date",
 content:{packages:["P"]},issues:[group],analysisSummary:{errors:2,warnings:0}};
const tags={Refresh(){},Count:1,GetAt(){return {Name:"ETNIC_Check_Result",Value:"<memo>",Notes:JSON.stringify(root)}}};
const repo={GetPackageByGuid(){return {Element:{TaggedValues:tags}}}};
context.FrameworkBA_CheckSnapshotCollector={};
function collectPackage(){return {checkedAt:"date",summary:{missing:0,notPlanned:0,found:3,expected:3},
 snapshots:[{checkedAt:"date",object:{guid:"P"}},{checkedAt:"date",object:{guid:"D1"}},{checkedAt:"date",object:{guid:"D2"}}],
 issues:[{objectGuid:"D1",severity:"ERROR",rawIssue:group},{objectGuid:"D2",severity:"ERROR",rawIssue:group},
 {objectGuid:"D1",severity:"ERROR",rawIssue:{code:"NOTE",severity:"ERROR"}}]};}
const options={repository:repo,collectPackage,output(){}};
const result=context.FrameworkBA_CheckAnalysisCollector.collect("R",options);
assert.equal(result.issues.length,2); assert.equal(result.summaryMatchesRoot,true);
assert.equal(result.detailIssues.length,0); assert.equal(result.snapshots.length,3);
assert.throws(()=>context.FrameworkBA_CheckAnalysisCollector.collect("R",Object.assign({},options,{collectPackage(){
 const r=collectPackage();r.checkedAt="other";return r;}})),/Dates CHECK/);
console.log("Analysis collection: mirrored groups counted once, real totals and mixed dates checked");
