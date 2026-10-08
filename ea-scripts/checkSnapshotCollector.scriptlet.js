!INC ETNIC_FrameworkBA.checkSnapshotCollector

try {
    Session.Output("[CHECK COLLECT] Debut");
    var checkResult = ETNIC_CheckSnapshotCollector.collect(
        "{352E69B8-D782-43F7-8B62-27CFC437013D}",
        "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}",
        {
            // Confirmed foreign diagram: the framework does not plan a snapshot.
            diagramGuidsWithoutSnapshot: [
                "{F3504F31-1749-4640-8C4B-2EFC294168B7}"
            ]
        }
    );
    Session.Output("[CHECK COLLECT] Fin");
} catch (error) {
    Session.Output("[CHECK COLLECT] Erreur=" + error.message);
}
