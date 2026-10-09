const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const ctx={};vm.createContext(ctx);
function load(name,local){vm.runInContext(fs.readFileSync(process.argv[2]?local:path.join(__dirname,"../"+name),"utf8"),ctx);}
load("FrameworkBA_CheckDashboard.js","analysis-dashboard.js");load("FrameworkBA_CheckChartWriter.js","analysis-chart.js");
ctx.FrameworkBA_CheckRootViews={counts(issues){return {errors:issues.filter(x=>x.severity==="ERROR").length,warnings:issues.filter(x=>x.severity==="WARNING").length}}};
const metrics={artifacts:{found:1,compliant:1,nonCompliant:0,foreign:0},diagrams:{found:0,compliant:0,nonCompliant:0,foreign:0}};
const part={packageGuid:"P",checkedAt:"date",metrics,summary:{referenced:2,expected:2,found:2,missing:0,notPlanned:0},issues:[],
 snapshots:[{scope:"PACKAGE",object:{guid:"P",type:"PACKAGE",name:"P"},issues:[],ruleResults:[{rule:"ANALYSIS_ELEMENT_REFERENCE",objectGuid:"P",actual:{found:true}}],content:{artifacts:["A"],diagrams:[]}},
 {scope:"ARTIFACT",object:{guid:"A",type:"ARTIFACT",name:"A"},issues:[],ruleResults:[{rule:"ARTIFACT_TECHNICAL_NAMING",objectGuid:"A",actual:{technicalName:false}}]}]};
const collected={rootGuid:"R",rootName:"Root",checkedAt:"date",missing:0,notPlanned:0,summaryMatchesRoot:true,summary:{errors:1,warnings:0},
 packages:[part],snapshots:part.snapshots,issues:[{objectGuid:"R",objectType:"PACKAGE",code:"ROOT_FOREIGN",severity:"ERROR",action:"MANUAL_REVIEW"}],detailIssues:[]};
const view=ctx.FrameworkBA_CheckDashboard.analysisView(collected);
assert.equal(view.summary.errors,1);assert.equal(view.detailIssues.length,0);
assert.equal(ctx.FrameworkBA_CheckChartWriter.aggregate(view,"ACTIONS").total,1);
assert.equal(ctx.FrameworkBA_CheckChartWriter.prepareConformity(view,"ALL").total,1);
const classification=ctx.FrameworkBA_CheckChartWriter.prepareClassification(view,"ALL");
assert.equal(classification.total,2);assert.equal(classification.items[1].count,2);
const texts=Object.fromEntries(ctx.FrameworkBA_CheckDashboard.buildSummary(view,ctx.FrameworkBA_CheckChartWriter));
assert.equal(texts._Summary_Error_Count,"1");
assert.equal(texts._Summary_Warning_Count,"0");
assert.throws(()=>ctx.FrameworkBA_CheckDashboard.analysisView(Object.assign({},collected,{summaryMatchesRoot:false})),/aucune ecriture/);
assert.equal(ctx.FrameworkBA_CheckChartWriter.prepareClassification(part,"ALL").total,2);
console.log("ANALYSIS: consolidated charts, root anomalies, global-only detail and PACKAGE classification regression passed");

const unknown={scope:"PACKAGE",object:{guid:"U",type:"PACKAGE",name:"Notes personnelles"},issues:[],ruleResults:[]};
const unknownPart={packageGuid:"U",summary:{missing:0},snapshots:[unknown],objectsWithoutSnapshot:[]};
assert.throws(()=>ctx.FrameworkBA_CheckChartWriter.prepareClassification(unknownPart,"PACKAGE"),/indéterminée/);
const unknownAnalysis={scope:"ANALYSIS",packages:[unknownPart],foreignPackageGuids:["{u}"],summary:{missing:0}};
assert.equal(ctx.FrameworkBA_CheckChartWriter.prepareClassification(unknownAnalysis,"PACKAGE").items[2].count,1);
collected.rootLocalIssues=[{code:"ROOT_FOREIGN_PACKAGE",affectedObjectGuid:"U"}];
assert.equal(ctx.FrameworkBA_CheckDashboard.analysisView(collected).foreignPackageGuids[0],"U");
console.log("ROOT foreign-package evidence classifies unknown packages without guessing");
