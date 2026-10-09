!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckRootViews
!INC ETNIC_FrameworkBA.FrameworkBA_CheckAnalysisCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboard

// NORMAL JavaScript test: select the dashboard diagram in the Project Browser.
// Reload only here, after all data writes; never from the Scriptlet.
function FrameworkBA_TestRefreshDashboard()
{
    function log(m) { Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK DASHBOARD TEST] " + m, 0); }
    try {
        if (Repository.GetTreeSelectedItemType() !== 8)
            throw new Error("Selectionnez le diagramme CHECK dans le Project Browser.");
        var diagram = Repository.GetTreeSelectedObject();
        if (!diagram || !diagram.DiagramID)
            throw new Error("Diagramme selectionne introuvable.");
        FrameworkBA_CheckDashboard.refresh(diagram, { output: log });
        log("Donnees preparees; rafraichissement du diagramme");
        Repository.ReloadDiagram(diagram.DiagramID);
        log("Fin");
    } catch (error) { log("Erreur=" + error.message); }
}
FrameworkBA_TestRefreshDashboard();
