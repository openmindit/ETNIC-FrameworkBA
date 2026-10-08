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
        // Color tags are an EA rendering test, not browser HTML/CSS.
        // Empty lines provide spacing without assuming CSS line-height support.
        var expected = [
            '<font color="#1F4E79"><b>SYNTHÈSE CHECK — TEST DE FORMATAGE</b></font>',
            "",
            '<font color="#C00000"><b>14 erreurs à traiter</b></font>'
                + ' · <font color="#666666">0 avertissement</font>',
            "",
            '<font color="#1F4E79"><b>Périmètre :</b></font> Exigences',
            "",
            '<font color="#1F4E79"><b>Dernier CHECK :</b></font> 08-10-2026 à 12:38',
            "",
            '<font color="#1F4E79"><b>Objets référencés :</b></font>'
                + ' 9 — 1 package · 3 artefacts · 5 diagrammes',
            "",
            '<font color="#1F4E79"><b>Conformité artefacts et diagrammes :</b></font>'
                + ' <font color="#267326">1 conforme</font>'
                + ' · <font color="#C00000">5 non conformes</font>'
                + ' · <font color="#9C6500">2 hors métamodèle</font>',
            "",
            '<font color="#1F4E79"><b>Snapshots :</b></font> 8/8 attendus'
                + ' · <font color="#666666">1 diagramme sans snapshot prévu</font>',
            "",
            '<font color="#666666"><i>Données de test fixes ; actualisation automatique'
                + ' à intégrer après validation.</i></font>'
        ].join("\\r\\n");
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
        log("Fin | Vérifier visuellement le rendu du gras, des couleurs et des lignes espacées.");
    } catch (error) {
        log("Erreur=" + error.message);
    }
}

TestCheckSummaryNote();
