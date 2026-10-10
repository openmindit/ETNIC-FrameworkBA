const vm = require("vm"), assert = require("assert"), fs = require("fs"), path = require("path");
const source = fs.readFileSync(process.argv[2] || path.join(__dirname, "../FrameworkBA_TestInspectRootCheck.js"), "utf8");
function run(snapshot) {
 const lines = [];
 const tag = { Name: "ETNIC_Check_Result", Value: "<memo>", Notes: JSON.stringify(snapshot) };
 const root = { Name: "Analysis", PackageGUID: "{ROOT}", Element: { TaggedValues: { Count: 1, Refresh() {}, GetAt() { return tag; } } } };
 vm.runInNewContext(source, { Repository: { GetTreeSelectedPackage() { return root; }, WriteOutput(tab, message) { lines.push(message); } } });
 return lines.join("\n");
}
const snapshot = { scope: "ROOT", rootGuid: "{root}", success: true, checkedAt: "date", objects: {}, ruleResults: [], issues: [
 {scope:"GLOBAL",severity:"ERROR",objectGuids:["A","B"]},
 {scope:"LOCAL",severity:"WARNING",objectGuid:"A"},
 {severity:"ERROR",objectGuid:"{ROOT}"}
]};
const logs = run(snapshot);
assert(logs.includes("GLOBAL=1 | LOCAL=1 | Sans portee=1 | Propre ROOT par GUID=1 | ERROR=2 | WARNING=1"));
assert(run({...snapshot, scope:"PACKAGE"}).includes("Erreur="));
assert(run({...snapshot, success:false}).includes("incomplet"));
console.log("ROOT validation, scope/ownership counters and failed CHECK rejection: OK");
