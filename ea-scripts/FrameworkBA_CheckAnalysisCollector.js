/**
 * Read-only analysis collection. Requires CheckRootViews and CheckSnapshotCollector.
 * No rendering, persistence or automatic execution.
 */
var FrameworkBA_CheckAnalysisCollector = (function () {
    function key(value) { return String(value || "").replace(/[{}]/g, "").toUpperCase(); }
    function canonical(value) {
        if (value === null || typeof value !== "object") return JSON.stringify(value);
        if (Object.prototype.toString.call(value) === "[object Array]") {
            var values = [];
            for (var i = 0; i < value.length; i++) values.push(canonical(value[i]));
            return "[" + values.join(",") + "]";
        }
        var names = [], fields = [];
        for (var n in value) if (Object.prototype.hasOwnProperty.call(value, n)) names.push(n);
        names.sort();
        for (var j = 0; j < names.length; j++)
            fields.push(JSON.stringify(names[j]) + ":" + canonical(value[names[j]]));
        return "{" + fields.join(",") + "}";
    }
    function collect(rootGuid, options) {
        options = options || {};
        var repo = options.repository || Repository;
        var output = options.output || function (m) { repo.WriteOutput("ETNIC_FrameworkBA", "[CHECK ANALYSIS] " + m, 0); };
        var root = repo.GetPackageByGuid(rootGuid);
        if (!root) throw new Error("Racine introuvable.");
        root.Element.TaggedValues.Refresh();
        var snapshot = null;
        for (var t = 0; t < root.Element.TaggedValues.Count; t++) {
            var tag = root.Element.TaggedValues.GetAt(t);
            if (String(tag.Name) !== "ETNIC_Check_Result") continue;
            if (snapshot) throw new Error("Tag ROOT duplique.");
            snapshot = JSON.parse(String(tag.Value === "<memo>" || tag.Value === "" ? tag.Notes : tag.Value));
        }
        var views = FrameworkBA_CheckRootViews.partition(snapshot, rootGuid);
        if (views.unresolved.length) throw new Error("Anomalies ROOT sans propriete resolue.");
        var issues = [], seen = {}, snapshots = [], snapshotSeen = {}, packages = [], missing = 0, notPlanned = 0;
        var observedDates = {};
        function observeDate(value, guid) {
            if (typeof value !== "string" || !value) throw new Error("Date CHECK absente: " + guid);
            observedDates["$" + value] = true;
        }
        observeDate(views.checkedAt, rootGuid);
        function add(issue, carrier) {
            var raw = issue.rawIssue || issue;
            // Mirrored group references share one descriptor, independent of their carrier.
            var owned = raw.objectGuid || raw.diagramGuid || raw.objectGuids && raw.objectGuids.length;
            var id = canonical(raw) + (owned ? "" : "|" + key(carrier));
            if (Object.prototype.hasOwnProperty.call(seen, id)) return;
            seen[id] = true;
            issues.push(issue);
        }
        for (var r = 0; r < snapshot.issues.length; r++) add(snapshot.issues[r], rootGuid);
        var collectPackage = options.collectPackage || FrameworkBA_CheckSnapshotCollector.collect;
        var index = null;
        if (!options.collectPackage)
            index = FrameworkBA_CheckSnapshotCollector.buildIndex(rootGuid, { repository: repo, output: output });
        var packageSeen = {};
        for (var p = 0; p < views.packageGuids.length; p++) {
            var guid = views.packageGuids[p], packageKey = key(guid);
            if (!packageKey || packageSeen[packageKey]) throw new Error("Reference package dupliquee ou vide.");
            packageSeen[packageKey] = true;
            var result = collectPackage(guid, rootGuid, { repository: repo, index: index, output: function () {} });
            // Each package CHECK receives its own timestamp during the ROOT run.
            observeDate(result.checkedAt, guid);
            packages.push(result);
            missing += result.summary.missing;
            notPlanned += result.summary.notPlanned;
            for (var i = 0; i < result.snapshots.length; i++) {
                var individual = result.snapshots[i], objectKey = key(individual.object.guid);
                observeDate(individual.checkedAt, individual.object.guid);
                if (snapshotSeen[objectKey]) continue;
                snapshotSeen[objectKey] = true;
                snapshots.push(individual);
            }
            for (var j = 0; j < result.issues.length; j++)
                add(result.issues[j], result.issues[j].objectGuid);
            output("Package=" + guid + " | Snapshots=" + result.summary.found + "/" + result.summary.expected
                + " | Anomalies avant deduplication=" + result.issues.length);
        }
        var dateCount = 0;
        for (var dateKey in observedDates) if (Object.prototype.hasOwnProperty.call(observedDates, dateKey)) dateCount++;
        output("Dates CHECK observees=" + dateCount + " | Des heures differentes sont normales pendant CHECK ROOT");
        var counts = FrameworkBA_CheckRootViews.counts(issues);
        var rootCounts = FrameworkBA_CheckRootViews.counts(views.rootLocal);
        var globalCounts = FrameworkBA_CheckRootViews.counts(views.global);
        var expected = views.analysisSummary;
        var identical = counts.errors === expected.errors && counts.warnings === expected.warnings;
        output("Bilan | Packages=" + packages.length + " | ERROR=" + counts.errors + " | WARNING=" + counts.warnings
            + " | ROOT_LOCAL=" + rootCounts.issues + " | GLOBAL=" + globalCounts.issues
            + " | Manquants=" + missing + " | Sans snapshot prevu=" + notPlanned + " | Synthese identique=" + identical);
        return { rootGuid: rootGuid, rootName: String(root.Name), checkedAt: views.checkedAt, packages: packages, snapshots: snapshots,
            issues: issues, detailIssues: views.global, rootLocalIssues: views.rootLocal,
            observedDateCount: dateCount, summary: counts, missing: missing, notPlanned: notPlanned, summaryMatchesRoot: identical };
    }
    return { collect: collect };
})();
