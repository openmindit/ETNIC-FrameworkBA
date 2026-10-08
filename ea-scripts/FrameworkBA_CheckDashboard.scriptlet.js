!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter

// Refresh check result: data preparation only; each ConstructChart renders itself.
function RefreshCheckResult()
{
    function log(message) {
        Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK DASHBOARD] " + message, 0);
    }
    try {
        log("Debut");
        var foreignDiagramGuids = ["{F3504F31-1749-4640-8C4B-2EFC294168B7}"];
        var result = FrameworkBA_CheckSnapshotCollector.collect(
            "{352E69B8-D782-43F7-8B62-27CFC437013D}",
            "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}",
            {
                diagramGuidsWithoutSnapshot: foreignDiagramGuids,
                output: function (message) {
                    Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK COLLECT] " + message, 0);
                }
            }
        );
        var writer = FrameworkBA_CheckChartWriter;
        var definitions = [
            ["Conformité des artefacts et diagrammes", writer.prepareConformity(result, "ALL")],
            ["Conformité des artefacts", writer.prepareConformity(result, "ARTIFACT")],
            ["Conformité des diagrammes", writer.prepareConformity(result, "DIAGRAM")],
            ["Actions recommandées", writer.aggregate(result, "ACTIONS")],
            ["Répartition des anomalies", writer.aggregate(result, "ISSUES")],
            ["Classification des objets", writer.prepareClassification(result, "ALL",
                { foreignDiagramGuids: foreignDiagramGuids })],
            ["Classification des packages", writer.prepareClassification(result, "PACKAGE",
                { foreignDiagramGuids: foreignDiagramGuids })],
            ["Classification des artefacts", writer.prepareClassification(result, "ARTIFACT",
                { foreignDiagramGuids: foreignDiagramGuids })],
            ["Classification des diagrammes", writer.prepareClassification(result, "DIAGRAM",
                { foreignDiagramGuids: foreignDiagramGuids })]
        ];
        // Resolve all targets and prepare all data before any writes.
        var table = FrameworkBA_CheckTableWriter.findOnDiagram(
            theDiagram, "_CHECK — Détail des résultats");
        var targets = [];
        for (var i = 0; i < definitions.length; i++) {
            var target = FrameworkBA_CheckTableWriter.findOnDiagram(theDiagram, definitions[i][0]);
            if (String(target.Stereotype) !== "SSDynamicChart")
                throw new Error("La cible n’est pas un DynamicChart: " + target.Name);
            targets.push(target);
        }
        var tableUpdate = FrameworkBA_CheckTableWriter.write(table.ElementGUID, result,
            { refresh: false, output: log });
        var changed = 0;
        for (var j = 0; j < targets.length; j++) {
            var saved = writer.saveData(targets[j].ElementGUID, definitions[j][1],
                { refresh: false, output: log });
            if (saved.changed) changed++;
        }
        // Table notification only: chart notifications remain excluded from this EA test.
        if (tableUpdate.changed) Repository.AdviseElementChange(table.ElementID);
        log("Fin | Graphiques préparés=" + targets.length + " | Modifiés=" + changed);
    } catch (error) {
        log("Erreur=" + error.message);
    }
}

RefreshCheckResult();
