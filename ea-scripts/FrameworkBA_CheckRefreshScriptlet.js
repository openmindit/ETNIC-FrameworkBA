!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckRootViews
!INC ETNIC_FrameworkBA.FrameworkBA_CheckAnalysisCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboard

// Scriptlet only. No individual chart notifications or recursive diagram reload.
if (typeof theDiagram !== "undefined" && theDiagram != null) {
    try {
        FrameworkBA_CheckDashboard.refresh(theDiagram, { notifyCharts: false });
    } catch (error) {
        Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK SCRIPTLET] Erreur=" + error.message, 0);
    }
} else {
    Repository.WriteOutput("ETNIC_FrameworkBA",
        "[CHECK SCRIPTLET] Ignore | Contexte diagramme absent", 0);
}
