!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboard
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboardFactory

// NORMAL TEST SCRIPT. Select the whole prototype _Check_results.
// Prepare data before opening/reloading the copied diagram.
try {
    var prototype = Repository.GetTreeSelectedPackage();
    if (!prototype || String(prototype.Name) !== "_Check_results")
        throw new Error("Selectionnez le dossier prototype _Check_results.");
    var instance = FrameworkBA_CheckDashboardFactory.create(
        prototype.PackageGUID,
        "{352E69B8-D782-43F7-8B62-27CFC437013D}",
        "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}"
    );
    var diagram = Repository.GetDiagramByGuid(instance.diagramGuid);
    if (!diagram) throw new Error("Diagramme copie introuvable.");
    FrameworkBA_CheckDashboard.refresh(diagram);
    Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK INIT] Donnees preparees | Refresh diagramme=" + diagram.DiagramID, 0);
    // One reload in normal Scripting context; no reload from a Scriptlet or event.
    Repository.ReloadDiagram(diagram.DiagramID);
    Repository.OpenDiagram(diagram.DiagramID);
} catch (error) {
    Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK INIT] Erreur=" + error.message, 0);
}
