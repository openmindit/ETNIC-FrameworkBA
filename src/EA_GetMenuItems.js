// ============================================================
// EA_GetMenuItems
// ETNIC - Framework Business Analysis
// ============================================================


// ========================================================
// SECURITE / VISIBILITE
// ========================================================

var currentUser =
    Repository.GetCurrentLoginUser(false);

if (
    !currentUser ||
    currentUser.toLowerCase() !==
    "elmzmo01@etnic.be"
)
{
    return "";
}


// ========================================================
// MENU RACINE
// ========================================================

if (MenuName == "")
{
    return "-ETNIC - Business Analysis";
}


// ========================================================
// MENU PRINCIPAL
// ========================================================

if (
    MenuName ==
    "-ETNIC - Business Analysis"
)
{
    return [
        "Dossier d'analyse",
        "   Initialiser",
        "   Compléter",
        "   Vérifier",
        "   Réparer",
        "-",
        "Livrables d'analyse",
        "   Générer Décision",
        "   Générer Cadrage",
        "   Générer Réalisation",
        "   Vérifier le livrable",
		"-",
		"Valider l'analyse",
        "-",
        "Aide",
        "À propos"
    ];
}


return null;