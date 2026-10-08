!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter

var OUTPUT_TAB = "ETNIC_FrameworkBA";
Repository.EnsureOutputVisible(OUTPUT_TAB);
function Log(message) {
    Repository.WriteOutput(OUTPUT_TAB, String(message), 0);
}
var chartOutput = function (message) { Log("[CHECK CHART] " + message); };
try {
    Log("[CHECK TABLE] Debut");
    // Resolve every target before writing anything.
    var table = FrameworkBA_CheckTableWriter.findOnDiagram(
        theDiagram, "_CHECK — Détail des résultats");
    var actions = FrameworkBA_CheckTableWriter.findOnDiagram(
        theDiagram, "Actions recommandées");
    var anomalies = FrameworkBA_CheckTableWriter.findOnDiagram(
        theDiagram, "Répartition des anomalies");
    var result = FrameworkBA_CheckSnapshotCollector.collect(
        "{352E69B8-D782-43F7-8B62-27CFC437013D}",
        "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}",
        {
            diagramGuidsWithoutSnapshot: [
                "{F3504F31-1749-4640-8C4B-2EFC294168B7}"
            ],
            output: function (message) { Log("[CHECK COLLECT] " + message); }
        });
    // Save all payloads before notifying EA: one shared result, no collection on chart reload.
    var tableUpdate = FrameworkBA_CheckTableWriter.write(table.ElementGUID, result, {
        refresh: false, output: function (message) { Log("[CHECK TABLE] " + message); }
    });
    var actionsUpdate = FrameworkBA_CheckChartWriter.renderActions(actions.ElementGUID, result, {
        refresh: false, output: chartOutput
    });
    var issuesUpdate = FrameworkBA_CheckChartWriter.renderIssues(anomalies.ElementGUID, result, {
        refresh: false, output: chartOutput
    });
    if (tableUpdate.changed) Repository.AdviseElementChange(table.ElementID);
    if (actionsUpdate.changed) Repository.AdviseElementChange(actions.ElementID);
    if (issuesUpdate.changed) Repository.AdviseElementChange(anomalies.ElementID);
    Log("[CHECK TABLE] Fin");
} catch (error) {
    Log("[CHECK TABLE] Erreur=" + error.message);
}
