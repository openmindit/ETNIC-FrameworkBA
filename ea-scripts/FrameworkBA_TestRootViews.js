!INC ETNIC_FrameworkBA.FrameworkBA_CheckRootViews

// NORMAL JavaScript test. Select the analysis ROOT; no writes or chart refresh.
function FrameworkBA_TestRootViews()
{
    function log(message) { Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK ROOT VIEWS] " + message, 0); }
    try {
        var root = Repository.GetTreeSelectedPackage();
        if (!root || !root.Element) throw new Error("Selectionnez le dossier racine de l'analyse.");
        root.Element.TaggedValues.Refresh();
        var raw = null;
        for (var i = 0; i < root.Element.TaggedValues.Count; i++) {
            var tag = root.Element.TaggedValues.GetAt(i);
            if (String(tag.Name) !== "ETNIC_Check_Result") continue;
            if (raw !== null) throw new Error("Tag ETNIC_Check_Result duplique.");
            raw = String(tag.Value === "<memo>" || tag.Value === "" ? tag.Notes : tag.Value);
        }
        if (!raw) throw new Error("Executez CHECK ROOT avant ce test.");
        var views = FrameworkBA_CheckRootViews.partition(JSON.parse(raw), root.PackageGUID);
        log("Debut | Root=" + root.Name + " | Date=" + views.checkedAt);
        log("ROOT_LOCAL=" + JSON.stringify(FrameworkBA_CheckRootViews.counts(views.rootLocal)));
        log("LOCAL packages conserve dans ROOT=" + JSON.stringify(FrameworkBA_CheckRootViews.counts(views.packageLocal)));
        log("GLOBAL=" + JSON.stringify(FrameworkBA_CheckRootViews.counts(views.global)));
        log("Non resolues=" + views.unresolved.length);
        log("Synthese CHECK Analyse=" + JSON.stringify(views.analysisSummary));
        log("Packages references=" + views.packageGuids.length);
        log("Fin");
    } catch (error) { log("Erreur=" + error.message); }
}
FrameworkBA_TestRootViews();
