/**
 * NORMAL EA JavaScript test: select the Note "_CHECK - Synthèse".
 * Formatting fixture only; it does not collect CHECK or modify the dashboard Scriptlet.
 * The values below are explicitly the Exigences test fixture, not a live calculation.
 * Writes Notes and verifies persistence; no refresh notification.
 */
function TestCheckSummaryNote()
{
    function log(message) {
        Repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK NOTE TEST] " + message, 0);
    }
    try {
        log("Debut");
        var element = Repository.GetTreeSelectedObject();
        if (!element || String(element.Type) !== "Note")
            throw new Error("Sélectionner un élément Note dans le navigateur, pas la CustomTable.");
        if (String(element.Name) !== "_CHECK - Synthèse")
            throw new Error("Nom attendu: _CHECK - Synthèse | Relu=" + element.Name);
        var original = String(element.Notes || "");
        var expected = [
            "<b>SYNTHÈSE CHECK — TEST DE FORMATAGE</b>",
            "<b>14 erreurs à traiter · 0 avertissement</b>",
            "",
            "<b>Périmètre :</b> Exigences",
            "<b>Dernier CHECK :</b> 08-10-2026 à 12:38",
            "<b>Objets référencés :</b> 9 — 1 package · 3 artefacts · 5 diagrammes",
            "<b>Conformité artefacts et diagrammes :</b> 1 conforme · 5 non conformes · 2 hors métamodèle",
            "<b>Snapshots :</b> 8/8 attendus · 1 diagramme sans snapshot prévu",
            "",
            "<i>Données de test fixes ; actualisation automatique à intégrer après validation.</i>"
        ].join("\r\n");
        log("Objet=" + element.Name + " | Type=" + element.Type);
        if (original !== expected) {
            element.Notes = expected;
            if (!element.Update()) throw new Error("Échec de sauvegarde de Notes.");
            log("Update=true");
        } else log("Modifie=false");
        var reloaded = Repository.GetElementByGuid(element.ElementGUID);
        if (!reloaded) throw new Error("Note introuvable après sauvegarde.");
        var actual = String(reloaded.Notes || "");
        log("Persistance identique=" + (actual === expected));
        log("Texte attendu présent=" + (actual.indexOf("14 erreurs à traiter") >= 0));
        log("Balisage gras présent=" + (actual.indexOf("<b>") >= 0));
        log("Notes relues=" + actual);
        if (actual.indexOf("14 erreurs à traiter") < 0)
            throw new Error("Texte du test absent après relecture.");
        log("Fin | Vérifier visuellement le rendu du gras et des retours à la ligne.");
    } catch (error) {
        log("Erreur=" + error.message);
    }
}

TestCheckSummaryNote();
