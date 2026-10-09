!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckRootViews
!INC ETNIC_FrameworkBA.FrameworkBA_CheckAnalysisCollector

// NORMAL JavaScript: select the analysis root after CHECK ROOT.
function FrameworkBA_TestAnalysisCollect()
{
    function log(m) { Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK ANALYSIS TEST] " + m, 0); }
    try {
        var root = Repository.GetTreeSelectedPackage();
        if (!root) throw new Error("Selectionnez la racine de l'analyse.");
        log("Debut");
        var result = FrameworkBA_CheckAnalysisCollector.collect(root.PackageGUID, { output: log });
        log("Detail Analyse | Anomalies globales=" + result.detailIssues.length);
        log("Fin | Synthese identique=" + result.summaryMatchesRoot);
    } catch (error) { log("Erreur=" + error.message); }
}
FrameworkBA_TestAnalysisCollect();
