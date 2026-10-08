!INC ETNIC_FrameworkBA.FrameworkBA_CheckSnapshotCollector
!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter

try {
    Session.Output("[CHECK TABLE] Debut");
    var checkResult = FrameworkBA_CheckSnapshotCollector.collect(
        "{352E69B8-D782-43F7-8B62-27CFC437013D}",
        "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}",
        {
            diagramGuidsWithoutSnapshot: [
                "{F3504F31-1749-4640-8C4B-2EFC294168B7}"
            ]
        }
    );
    var checkTable = FrameworkBA_CheckTableWriter.findOnDiagram(
        theDiagram, "_CHECK — Détail des résultats"
    );
    FrameworkBA_CheckTableWriter.write(checkTable.ElementGUID, checkResult);
    Session.Output("[CHECK TABLE] Fin");
} catch (error) {
    Session.Output("[CHECK TABLE] Erreur=" + error.message);
}
