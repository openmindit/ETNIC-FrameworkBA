/**
 * NORMAL read-only test. Select the analysis ROOT package and run after CHECK ROOT.
 * Reports persisted scope/ownership without recomputing CHECK rules.
 */
function FrameworkBA_TestInspectRootCheck()
{
    function log(message) { Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK ROOT TEST] " + message, 0); }
    function key(value) { return String(value || "").replace(/[{}]/g, "").toUpperCase(); }
    try {
        var root = Repository.GetTreeSelectedPackage();
        if (!root || !root.Element) throw new Error("Selectionnez le dossier d'analyse ROOT.");
        root.Element.TaggedValues.Refresh();
        var raw = null;
        for (var t = 0; t < root.Element.TaggedValues.Count; t++) {
            var tag = root.Element.TaggedValues.GetAt(t);
            if (String(tag.Name) !== "ETNIC_Check_Result") continue;
            if (raw !== null) throw new Error("Tag ETNIC_Check_Result duplique.");
            raw = String(tag.Value === "<memo>" ? tag.Notes : tag.Value || "");
        }
        if (!raw) throw new Error("Snapshot absent : executez CHECK ROOT.");
        var snapshot = JSON.parse(raw);
        if (snapshot.scope !== "ROOT" || key(snapshot.rootGuid) !== key(root.PackageGUID))
            throw new Error("Le tag ne contient pas un CHECK ROOT correspondant au dossier selectionne.");
        if (snapshot.success !== true) throw new Error("CHECK ROOT incomplet ou en echec.");
        var issues = snapshot.issues || [], objects = snapshot.objects || {}, rules = snapshot.ruleResults || [];
        var counts = { GLOBAL: 0, LOCAL: 0, UNSPECIFIED: 0 }, errors = 0, warnings = 0, rootOwned = 0, objectCount = 0;
        log("Debut | Root=" + root.Name + " | GUID=" + root.PackageGUID + " | Date=" + snapshot.checkedAt);
        for (var guid in objects) {
            if (!Object.prototype.hasOwnProperty.call(objects, guid)) continue;
            objectCount++;
            if (key(guid) === key(root.PackageGUID)) log("Objet ROOT=" + JSON.stringify(objects[guid]));
        }
        for (var i = 0; i < issues.length; i++) {
            var issue = issues[i], scope = issue.scope === "GLOBAL" ? "GLOBAL" : issue.scope === "LOCAL" ? "LOCAL" : "UNSPECIFIED";
            counts[scope]++;
            if (issue.severity === "ERROR") errors++;
            if (issue.severity === "WARNING") warnings++;
            var owner = issue.diagramGuid || issue.objectGuid || "";
            if (key(owner) === key(root.PackageGUID)) rootOwned++;
            // Preserve full descriptors: scope alone is not sufficient to identify root-local ownership.
            log("Issue=" + JSON.stringify(issue));
        }
        for (var r = 0; r < rules.length; r++) {
            var rule = rules[r];
            if (rule.scope === "GLOBAL" || key(rule.objectGuid) === key(root.PackageGUID) || key(rule.scopeGuid) === key(root.PackageGUID))
                log("Regle ROOT/GLOBAL=" + JSON.stringify(rule));
        }
        log("Summary persiste=" + JSON.stringify(snapshot.summary || {}));
        log("Metrics persistees=" + JSON.stringify(snapshot.metrics || {}));
        log("Bilan | Objets=" + objectCount + " | Issues=" + issues.length + " | GLOBAL=" + counts.GLOBAL
            + " | LOCAL=" + counts.LOCAL + " | Sans portee=" + counts.UNSPECIFIED + " | Propre ROOT par GUID=" + rootOwned
            + " | ERROR=" + errors + " | WARNING=" + warnings);
        log("Fin");
    } catch (error) { log("Erreur=" + error.message); }
}
FrameworkBA_TestInspectRootCheck();
