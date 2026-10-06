// Création du tab Framework BA
Repository.CreateOutputTab(
    this.fbaConstants.OUTPUT_TAB
);

// Logger
this.logger.show();

this.logger.clear();

this.test.run();

var currentUser = Repository.GetCurrentLoginUser(false); // true = nom de domaine/windows si sécurité désactivée
var targetUser = "elmzmo01@etnic.be"; // Identifiant de l'utilisateur cible

if (currentUser.toLowerCase() !== targetUser.toLowerCase()) {
	// Bloque l'initialisation pour les autres utilisateurs
	return "";
}

return "Addin JS Actif";