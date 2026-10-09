!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckRootViews
!INC ETNIC_FrameworkBA.FrameworkBA_CheckAnalysisCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboard

// NORMAL JavaScript test: open the configured dashboard, then execute.
// Reload only here, after all data writes; never from the Scriptlet.
function FrameworkBA_TestRefreshDashboard()
{
    function log(m) { Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK DASHBOARD TEST] " + m, 0); }
    try {
        var diagram = Repository.GetCurrentDiagram();
        if (!diagram) throw new Error("Ouvrez le diagramme CHECK a actualiser.");
        FrameworkBA_CheckDashboard.refresh(diagram, { output: log });
        log("Donnees preparees; rafraichissement du diagramme");
        Repository.ReloadDiagram(diagram.DiagramID);
        log("Fin");
    } catch (error) { log("Erreur=" + error.message); }
}
FrameworkBA_TestRefreshDashboard();
