/**
 * Read-only partitioning of a distributed ROOT CHECK.
 * Local child groups remain separate from ROOT_LOCAL and GLOBAL.
 */
var FrameworkBA_CheckRootViews = (function () {
    function key(value) { return String(value || "").replace(/[{}]/g, "").toUpperCase(); }
    function array(value) { return Object.prototype.toString.call(value) === "[object Array]"; }
    function partition(snapshot, rootGuid) {
        if (!snapshot || snapshot.scope !== "ROOT" || snapshot.schemaVersion !== 2
            || snapshot.storage !== "DISTRIBUTED" || snapshot.success !== true
            || !key(rootGuid) || key(snapshot.rootGuid) !== key(rootGuid)
            || !array(snapshot.issues) || !snapshot.content || !array(snapshot.content.packages))
            throw new Error("Snapshot ROOT distribue absent ou incoherent.");
        var result = { rootLocal: [], packageLocal: [], global: [], unresolved: [],
            checkedAt: snapshot.checkedAt, packageGuids: snapshot.content.packages.slice(0),
            analysisSummary: snapshot.analysisSummary || {} };
        for (var i = 0; i < snapshot.issues.length; i++) {
            var issue = snapshot.issues[i];
            if (!issue) throw new Error("Anomalie ROOT invalide.");
            if (issue.scope === "GLOBAL") result.global.push(issue);
            else if (issue.scope !== "LOCAL") result.unresolved.push(issue);
            else {
                var owner = key(issue.diagramGuid || issue.objectGuid);
                // A group's scopeGuid is not its owner. Never assign it to ROOT by execution scope.
                if (owner === key(rootGuid)) result.rootLocal.push(issue);
                else if (owner || array(issue.objectGuids) && issue.objectGuids.length)
                    result.packageLocal.push(issue);
                else result.unresolved.push(issue);
            }
        }
        return result;
    }
    function counts(issues) {
        var result = { issues: issues.length, errors: 0, warnings: 0 };
        for (var i = 0; i < issues.length; i++) {
            if (issues[i].severity === "ERROR") result.errors++;
            if (issues[i].severity === "WARNING") result.warnings++;
        }
        return result;
    }
    return { partition: partition, counts: counts };
})();
