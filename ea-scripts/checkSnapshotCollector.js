/**
 * EA Scripting library: ETNIC_FrameworkBA.checkSnapshotCollector
 * Language: JavaScript (same language as the calling Scriptlet).
 * Read-only: no Update, dataFormat write, refresh, or automatic execution.
 */
var ETNIC_CheckSnapshotCollector = (function () {
    function guidKey(value) {
        return String(value || "").replace(/[{}]/g, "").toUpperCase();
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }

    function collect(packageGuid, rootGuid, options) {
        options = options || {};
        var repository = options.repository || Repository;
        var output = options.output || function (message) {
            Session.Output("[CHECK COLLECT] " + message);
        };
        var tagName = options.tagName || "ETNIC_Check_Result";
        var expected = {};
        var collected = {};
        var issues = [];
        var snapshots = [];
        var diagnostics = [];
        var noSnapshot = {};
        var objectsWithoutSnapshot = [];
        var declarations = options.diagramGuidsWithoutSnapshot || [];
        if (!isArray(declarations))
            throw new Error("diagramGuidsWithoutSnapshot doit etre un tableau.");
        for (var n = 0; n < declarations.length; n++)
            noSnapshot[guidKey(declarations[n])] = true;

        function diagnose(message) {
            diagnostics.push(message);
            output(message);
        }

        function readSnapshot(element) {
            element.TaggedValues.Refresh();
            for (var i = 0; i < element.TaggedValues.Count; i++) {
                var tag = element.TaggedValues.GetAt(i);
                if (String(tag.Name) !== tagName) continue;
                var raw = String(tag.Value || "");
                if (raw === "<memo>" || raw === "") raw = String(tag.Notes || "");
                if (/^\s*$/.test(raw)) return null;
                try {
                    return JSON.parse(raw);
                } catch (error) {
                    diagnose("JSON invalide | Support=" + element.Name
                        + " | Erreur=" + error.message);
                    return null;
                }
            }
            return null;
        }

        function expect(guid, type) {
            var key = guidKey(guid);
            if (!key) throw new Error("GUID vide dans le contenu du package.");
            if (expected[key] && expected[key].type !== type)
                throw new Error("GUID reference avec deux types: " + guid);
            expected[key] = { guid: guid, type: type };
        }

        function accept(snapshot, carrierName) {
            // ROOT uses another schema; unrelated snapshots are ignored.
            if (!snapshot || !snapshot.object) return;
            var key = guidKey(snapshot.object.guid);
            if (!expected[key] || collected[key]) return;
            var type = String(snapshot.object.type || snapshot.scope || "").toUpperCase();
            if (type !== expected[key].type) {
                diagnose("Type inattendu | Objet=" + snapshot.object.name
                    + " | Attendu=" + expected[key].type + " | Relu=" + type);
                return;
            }
            if (!isArray(snapshot.issues)) {
                diagnose("Issues absent ou invalide | Objet=" + snapshot.object.name);
                return;
            }
            collected[key] = true;
            snapshots.push(snapshot);
            output("Objet=" + snapshot.object.name + " | Type=" + type
                + " | Statut=" + snapshot.status + " | Date=" + snapshot.checkedAt
                + " | Anomalies=" + snapshot.issues.length + " | Support=" + carrierName);
            for (var j = 0; j < snapshot.issues.length; j++) {
                var issue = snapshot.issues[j] || {};
                var code = String(issue.code || issue.rule || "");
                issues.push({
                    objectGuid: snapshot.object.guid,
                    objectName: String(snapshot.object.name || ""),
                    objectType: type,
                    severity: String(issue.severity || "").toUpperCase(),
                    code: code,
                    message: String(issue.message || issue.description || code),
                    action: String(issue.action || ""),
                    rawIssue: issue
                });
            }
        }

        function visitPackage(pkg) {
            accept(readSnapshot(pkg.Element), pkg.Element.Name);
            // Includes technical elements that carry diagram snapshots.
            for (var e = 0; e < pkg.Elements.Count; e++) {
                var element = pkg.Elements.GetAt(e);
                accept(readSnapshot(element), element.Name);
            }
            for (var p = 0; p < pkg.Packages.Count; p++)
                visitPackage(pkg.Packages.GetAt(p));
        }

        var target = repository.GetPackageByGuid(packageGuid);
        var root = repository.GetPackageByGuid(rootGuid);
        if (!target || !root)
            throw new Error("Package cible ou dossier racine introuvable.");

        // Do not silently collect from an unrelated analysis root.
        var ancestor = target;
        var insideRoot = false;
        while (ancestor) {
            if (guidKey(ancestor.PackageGUID) === guidKey(root.PackageGUID)) {
                insideRoot = true;
                break;
            }
            if (!ancestor.ParentID) break;
            ancestor = repository.GetPackageByID(ancestor.ParentID);
        }
        if (!insideRoot)
            throw new Error("Le package cible ne se trouve pas dans la racine fournie.");

        var packageSnapshot = readSnapshot(target.Element);
        if (!packageSnapshot || !packageSnapshot.object || !packageSnapshot.content
            || guidKey(packageSnapshot.object.guid) !== guidKey(packageGuid))
            throw new Error("Snapshot PACKAGE absent, incoherent ou sans content.");

        var artifacts = packageSnapshot.content.artifacts;
        var diagrams = packageSnapshot.content.diagrams;
        if (!isArray(artifacts) || !isArray(diagrams))
            throw new Error("content.artifacts et content.diagrams doivent etre des tableaux.");

        expect(packageGuid, "PACKAGE");
        for (var a = 0; a < artifacts.length; a++) expect(artifacts[a], "ARTIFACT");
        for (var d = 0; d < diagrams.length; d++) expect(diagrams[d], "DIAGRAM");
        output("Package=" + target.Name + " | Date=" + packageSnapshot.checkedAt
            + " | Artefacts=" + artifacts.length + " | Diagrammes=" + diagrams.length);
        accept(packageSnapshot, target.Element.Name);
        visitPackage(root);

        // Only explicit declarations identify diagrams without a planned snapshot.
        // Aggregate foreign counts cannot identify individual GUIDs.
        for (var declaredKey in noSnapshot) {
            if (!Object.prototype.hasOwnProperty.call(noSnapshot, declaredKey)) continue;
            if (!expected[declaredKey] || expected[declaredKey].type !== "DIAGRAM")
                throw new Error("Diagramme sans snapshot non reference dans content: " + declaredKey);
        }
        var summary = { referenced: 0, notPlanned: 0, expected: 0, found: 0, missing: 0, issues: issues.length,
            errors: 0, warnings: 0 };
        for (var key in expected) {
            if (!Object.prototype.hasOwnProperty.call(expected, key)) continue;
            summary.referenced++;
            if (noSnapshot[key] && !collected[key]) {
                var diagram = repository.GetDiagramByGuid(expected[key].guid);
                if (diagram) {
                    summary.notPlanned++;
                    objectsWithoutSnapshot.push({ objectGuid: expected[key].guid,
                        objectType: "DIAGRAM", objectName: String(diagram.Name) });
                    output("Snapshot non prevu | Objet=" + diagram.Name
                        + " | Type=DIAGRAM | GUID=" + expected[key].guid);
                    continue;
                }
                diagnose("Diagramme declare sans snapshot introuvable | GUID=" + expected[key].guid);
            }
            summary.expected++;
            if (collected[key]) summary.found++;
            else {
                summary.missing++;
                diagnose("Snapshot manquant | Type=" + expected[key].type
                    + " | GUID=" + expected[key].guid);
            }
        }

        var typeOrder = { ARTIFACT: 0, DIAGRAM: 1, PACKAGE: 2 };
        var severityOrder = { ERROR: 0, WARNING: 1 };
        function compareText(a, b) { return a < b ? -1 : (a > b ? 1 : 0); }
        function severityRank(value) {
            return Object.prototype.hasOwnProperty.call(severityOrder, value)
                ? severityOrder[value] : 2;
        }
        issues.sort(function (a, b) {
            return typeOrder[a.objectType] - typeOrder[b.objectType]
                || compareText(a.objectName.toUpperCase(), b.objectName.toUpperCase())
                || compareText(guidKey(a.objectGuid), guidKey(b.objectGuid))
                || severityRank(a.severity) - severityRank(b.severity)
                || compareText(a.code, b.code);
        });
        for (var r = 0; r < issues.length; r++) {
            if (issues[r].severity === "ERROR") summary.errors++;
            if (issues[r].severity === "WARNING") summary.warnings++;
            output("  Objet=" + issues[r].objectName + " | Gravite=" + issues[r].severity
                + " | Code=" + issues[r].code + " | Anomalie=" + issues[r].message
                + " | Action=" + issues[r].action);
        }
        var metrics = packageSnapshot.metrics || {};
        output("Metriques package | Artefacts etrangers="
            + (metrics.artifacts ? metrics.artifacts.foreign : "?")
            + " | Diagrammes etrangers="
            + (metrics.diagrams ? metrics.diagrams.foreign : "?"));
        output("Bilan | Objets references=" + summary.referenced
            + " | Snapshots non prevus=" + summary.notPlanned + " | Snapshots=" + summary.found + "/" + summary.expected
            + " | Manquants=" + summary.missing + " | Anomalies=" + summary.issues
            + " | ERROR=" + summary.errors + " | WARNING=" + summary.warnings);
        return { packageGuid: packageGuid, checkedAt: packageSnapshot.checkedAt,
            snapshots: snapshots, issues: issues, summary: summary, diagnostics: diagnostics,
            metrics: metrics, objectsWithoutSnapshot: objectsWithoutSnapshot };
    }

    return { collect: collect };
})();
