!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboard

// _Check_Refresh: shared by every copied dashboard.
try {
    FrameworkBA_CheckDashboard.refresh(theDiagram);
} catch (error) {
    Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK DASHBOARD] Erreur=" + error.message, 0);
}
