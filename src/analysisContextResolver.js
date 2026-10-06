var addin = this;


return {

	// ====================================================
	// resolvePackage
	//
	// Résout le contexte FrameworkBA à partir
	// d'un package sélectionné.
	//
	// Retourne :
	// - ANALYSIS_ROOT
	// - ANALYSIS_PACKAGE
	// - null si hors contexte FrameworkBA
	// ====================================================

	resolvePackage: function(targetPackage)
	{
		if (!targetPackage)
		{
			return null;
		}


		// ================================================
		// LE PACKAGE EST LUI-MEME LA RACINE
		// ================================================

		if (
			addin.analysisResolver
				.isValidAnalysisRoot(
					targetPackage
				)
		)
		{
			return {
				targetType:
					addin.fbaConstants
						.CONTEXT_ANALYSIS_ROOT,

				analysisRoot:
					targetPackage,

				targetPackage:
					targetPackage,

				targetElement:
					null,

				targetDiagram:
					null
			};
		}


		// ================================================
		// RECHERCHE DE LA RACINE D'ANALYSE
		// ================================================

		var analysisRoot =
			this._findAnalysisRoot(
				targetPackage
			);


		if (!analysisRoot)
		{
			addin.logger.warning(
				"Aucune racine d'analyse trouvée"
				+ " | Package="
				+ targetPackage.Name
				+ " | GUID="
				+ targetPackage.PackageGUID
			);

			return null;
		}


		// ================================================
		// PACKAGE INTERNE AU DOSSIER D'ANALYSE
		// ================================================

		return {
			targetType:
				addin.fbaConstants
					.CONTEXT_ANALYSIS_PACKAGE,

			analysisRoot:
				analysisRoot,

			targetPackage:
				targetPackage,

			targetElement:
				null,

			targetDiagram:
				null
		};
	},


	// ====================================================
	// _findAnalysisRoot
	//
	// Remonte la hiérarchie des packages jusqu'à trouver
	// la racine du dossier d'analyse.
	// ====================================================

	_findAnalysisRoot: function(startPackage)
	{
		if (!startPackage)
		{
			return null;
		}


		var currentPackage =
			startPackage;


		while (currentPackage)
		{
			if (
				addin.analysisResolver
					.isValidAnalysisRoot(
						currentPackage
					)
			)
			{
				return currentPackage;
			}


			if (
				!currentPackage.ParentID ||
				currentPackage.ParentID == 0
			)
			{
				break;
			}


			var parentPackage =
				addin.repositoryService
					.getPackageById(
						currentPackage.ParentID
					);


			if (!parentPackage)
			{
				addin.logger.error(
					"Impossible de résoudre le package parent"
					+ " | Package="
					+ currentPackage.Name
					+ " | ParentID="
					+ currentPackage.ParentID
				);

				return null;
			}


			currentPackage =
				parentPackage;
		}


		return null;
	}
};
