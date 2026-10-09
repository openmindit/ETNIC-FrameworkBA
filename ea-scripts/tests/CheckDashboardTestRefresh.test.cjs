const fs = require("fs"), vm = require("vm"), assert = require("assert"), path = require("path");
const source = fs.readFileSync(process.argv[2] || path.join(__dirname, "../FrameworkBA_TestCreateCheckDashboard.js"), "utf8").replace(/^!INC.*$/gm, "");
function run(fail) {
 const events = [];
 const context = {
 Repository: {
  GetTreeSelectedPackage() { return { Name: "_Check_results", PackageGUID: "prototype" }; },
  GetDiagramByGuid() { return { DiagramID: 42 }; },
  WriteOutput() {},
  ReloadDiagram(id) { assert.equal(id, 42); events.push("reload"); },
  OpenDiagram(id) { assert.equal(id, 42); events.push("open"); }
 },
 FrameworkBA_CheckDashboardFactory: { create() { events.push("create"); return { diagramGuid: "diagram" }; } },
 FrameworkBA_CheckDashboard: { refresh() { events.push("prepare"); if (fail) throw new Error("Persistence failed"); } }
 };
 vm.runInNewContext(source, context);
 return events;
}
assert.deepEqual(run(false), ["create", "prepare", "reload", "open"]);
assert.deepEqual(run(true), ["create", "prepare"]);
console.log("Prepare before reload/open; failed preparation does not open: OK");
