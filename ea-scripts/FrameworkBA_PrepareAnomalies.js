!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter

/**
 * Normal EA JavaScript script; select the anomalies chart in the Browser.
 * Prepares its memo tag only. No GetChart, Redraw or refresh notification.
 * The GUIDs below belong to the Exigences test package.
 */
function PrepareAnomalies()
{
    function log(message) {
        Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK CHART DATA] " + message, 0);
    }
    try {
        log("Debut");
        var element = Repository.GetTreeSelectedObject();
        if (!element || String(element.Stereotype) !== "SSDynamicChart"
            || String(element.Name) !== "Répartition des anomalies")
            throw new Error("Sélectionner le DynamicChart Répartition des anomalies dans le navigateur.");
        var result = FrameworkBA_CheckSnapshotCollector.collect(
            "{352E69B8-D782-43F7-8B62-27CFC437013D}",
            "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}",
            {
                diagramGuidsWithoutSnapshot: [
                    "{F3504F31-1749-4640-8C4B-2EFC294168B7}"
                ],
                output: log
            }
        );
        var saved = FrameworkBA_CheckChartWriter.renderIssues(
            element.ElementGUID, result, { refresh: false, output: log }
        );
        log("Données vérifiées | Total=" + saved.data.total
            + " | Groupes=" + saved.data.items.length
            + " | Modifie=" + saved.changed);
        log("Fin");
    } catch (error) {
        log("Erreur=" + error.message);
    }
}

PrepareAnomalies();
