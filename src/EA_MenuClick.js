// ============================================================
// EA_MenuClick
// ETNIC - Framework Business Analysis
//
// Rôle :
// - recevoir la commande du menu EA ;
// - déléguer la commande à la façade FrameworkBA.
//
// IMPORTANT :
// aucune logique métier FrameworkBA dans cette méthode.
// ============================================================


// ============================================================
// SECURITE
// ============================================================

var currentUser =
    Repository.GetCurrentLoginUser(false);


if (
    !currentUser ||
    currentUser.toLowerCase() !==
        "elmzmo01@etnic.be"
)
{
    return;
}

this.logger.clear();

// ============================================================
// NORMALISATION DE LA COMMANDE
// ============================================================

var command =
    ItemName.replace(
        /^\s+|\s+$/g,
        ""
    );


this.logger.info(
    "EA_MenuClick"
    + " | Command=[" + command + "]"
);


// ============================================================
// DOSSIER D'ANALYSE
// ============================================================

if (
    command == "Initialiser"
)
{
    this.frameworkBA.initializeAnalysis();

    return;
}


if (
    command == "Compléter"
)
{
    this.frameworkBA.completeAnalysis();

    return;
}


if (
    command == "Vérifier"
)
{
    this.frameworkBA.checkAnalysis();

    return;
}


if (
    command == "Réparer"
)
{
    this.frameworkBA.repairAnalysis();

    return;
}


// ============================================================
// LIVRABLES D'ANALYSE
// ============================================================

if (
    command == "Générer Décision"
)
{
    this.frameworkBA.generateDeliverable(
        "Décision"
    );

    return;
}


if (
    command == "Générer Cadrage"
)
{
    this.frameworkBA.generateDeliverable(
        "Cadrage"
    );

    return;
}


if (
    command == "Générer Réalisation"
)
{
    this.frameworkBA.generateDeliverable(
        "Réalisation"
    );

    return;
}


if (
    command == "Vérifier le livrable"
)
{
    this.frameworkBA.checkDeliverable();

    return;
}


// ============================================================
// AIDE
// ============================================================

if (
    command == "Aide"
)
{
    this.repositoryService.showInfo(
        "Framework BA\n\n"
        + "L'aide du Framework BA est actuellement "
        + "en cours de construction."
    );

    return;
}


// ============================================================
// A PROPOS
// ============================================================

if (
    command == "À propos"
)
{
    this.repositoryService.showInfo(
        "Framework BA\n\n"
        + "CC Architecture - Équipe BA\n\n"
        + "Version : 1.0\n"
        + "Date : 21/09/2026\n\n"
        + "ETNIC"
    );

    return;
}