const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(process.argv[2] || path.join(__dirname, "../FrameworkBA_CheckRootViews.js"), "utf8"), context);
const api = context.FrameworkBA_CheckRootViews;
const snapshot = { scope: "ROOT", schemaVersion: 2, storage: "DISTRIBUTED", success: true,
 rootGuid: "{ROOT}", checkedAt: "date", content: { packages: ["P"] }, analysisSummary: { errors: 158 },
 issues: [
 { scope: "LOCAL", objectGuid: "{ROOT}", affectedObjectGuid: "foreign", severity: "ERROR" },
 { scope: "LOCAL", scopeGuid: "{ROOT}", objectGuids: ["D1","D2"], severity: "ERROR" },
 { scope: "GLOBAL", objectGuid: "{ROOT}", objectGuids: ["A","B"], severity: "WARNING" },
 { scope: "LOCAL", scopeGuid: "{ROOT}", severity: "ERROR" }
 ] };
const before = JSON.stringify(snapshot);
const result = api.partition(snapshot, "root");
assert.equal(result.rootLocal.length, 1);
assert.equal(result.packageLocal.length, 1);
assert.equal(result.global.length, 1);
assert.equal(result.unresolved.length, 1);
assert.equal(api.counts(result.global).warnings, 1);
assert.equal(JSON.stringify(snapshot), before);
assert.throws(() => api.partition(snapshot, "other"), /incoherent/);
assert.throws(() => api.partition(Object.assign({},snapshot,{success:false}), "root"), /incoherent/);
console.log("ROOT views: ownership, grouped scopes, unresolved and read-only checks passed");
