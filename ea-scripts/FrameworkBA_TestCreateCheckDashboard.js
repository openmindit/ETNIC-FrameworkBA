!INC ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter
!INC ETNIC_FrameworkBA.FrameworkBA_CheckDashboardFactory

// NORMAL SCRIPT. Select the whole prototype _Check_results in the Browser.
// These target/root GUIDs are the Exigences diagnostic fixture only.
try {
    var prototype = Repository.GetTreeSelectedPackage();
    if (!prototype || String(prototype.Name) !== "_Check_results")
        throw new Error("Selectionnez le dossier prototype _Check_results.");
    FrameworkBA_CheckDashboardFactory.create(
        prototype.PackageGUID,
        "{352E69B8-D782-43F7-8B62-27CFC437013D}",
        "{AEFC2EE0-638F-44EF-9B40-B3B23C20A3CA}"
    );
} catch (error) {
    Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK INIT] Erreur=" + error.message, 0);
}
