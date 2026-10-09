var addin = this;


return {

    // L'indicateur signale un résultat potentiellement périmé.
    // Il ne modifie ni le snapshot, ni son statut de conformité.
    _setCheckRequired: function(element, required)
    {
        if (!element) return false;
        var tag = addin.fbaConstants.TAG_CHECK_REQUIRED;
        var value = required ? "true" : "false";
        if (addin.repositoryService.getTaggedValue(element, tag) === value)
            return true;

        var previous = addin.checkInvalidationSuppressed;
        addin.checkInvalidationSuppressed = true;
        try
        {
            if (!addin.repositoryService.setTaggedValue(element, tag, value))
                return false;
            return addin.repositoryService.getTaggedValue(element, tag) === value;
        }
        finally
        {
            addin.checkInvalidationSuppressed = previous;
        }
    },

    notifyContextItemModified: function(guid, objectType)
    {
        if (addin.checkInvalidationSuppressed) return false;
        var ignored = function(reason)
        {
            addin.logger.info("Invalidation CHECK ignorée | GUID=" + guid
                + " | ObjectType=" + objectType + " | Reason=" + reason);
            return false;
        };
        if (!guid) return ignored("GUID_EMPTY");
        var object = null;
        var targetPackage = null;
        var targetElement = null;
        var kind = "";

        try
        {
            if (objectType == addin.eaConstants.otPackage)
            {
                object = addin.repositoryService.getPackageByGuid(guid);
                targetPackage = object;
                targetElement = object ? object.Element : null;
                kind = "PACKAGE";
            }
            else if (objectType == addin.eaConstants.otElement)
            {
                object = addin.repositoryService.getElementByGuid(guid);
                if (!object) return ignored("OBJECT_NOT_FOUND");
                // EA peut notifier le Package par son Element.
                if (object.Type === "Package")
                {
                    targetPackage = addin.repositoryService.getPackageByElementId(object.ElementID);
                    object = targetPackage;
                    targetElement = targetPackage ? targetPackage.Element : null;
                    kind = "PACKAGE";
                }
                else
                {
                    targetPackage = addin.repositoryService.getPackageById(object.PackageID);
                    targetElement = object;
                    kind = "ARTIFACT";
                }
            }
            else if (objectType == addin.eaConstants.otDiagram)
            {
                object = addin.repositoryService.getDiagramByGuid(guid);
                targetPackage = object
                    ? addin.repositoryService.getPackageById(object.PackageID) : null;
                kind = "DIAGRAM";
            }
            else return ignored("OBJECT_TYPE_UNSUPPORTED");

            if (!object) return ignored("OBJECT_NOT_FOUND");
            if (!targetPackage) return ignored("PACKAGE_NOT_FOUND");
            if (addin.utils.isTechnicalName(object.Name))
                return ignored("TECHNICAL_OBJECT");
            if (addin.utils.isTechnicalName(targetPackage.Name))
                return ignored("TECHNICAL_PACKAGE");

            var root = addin.analysisContextResolver._findAnalysisRoot(targetPackage);
            if (!root || !root.Element) return ignored("ANALYSIS_ROOT_NOT_FOUND");

            if (kind === "DIAGRAM")
            {
                var synchronizer = addin.analysisStructureSynchronizer;
                var registry = synchronizer._resolveDiagramRegistryPackage(root);
                targetElement = synchronizer._findDiagramRegistryEntryByGeneratedGuid(
                    registry, object.DiagramGUID, null);
            }

            // Même sans DGC, le package et le root doivent être signalés.
            var success = true;
            if (targetElement)
                success = this._setCheckRequired(targetElement, true) && success;
            else
            {
                success = false;
                addin.logger.warning("Indicateur CHECK objet indisponible | Type="
                    + kind + " | GUID=" + guid);
            }

            if (kind !== "PACKAGE")
                success = this._setCheckRequired(targetPackage.Element, true) && success;
            if (root.PackageID !== targetPackage.PackageID || kind !== "PACKAGE")
                success = this._setCheckRequired(root.Element, true) && success;

            addin.logger.info("CHECK à renouveler | Type=" + kind
                + " | Name=" + object.Name + " | GUID=" + guid
                + " | Package=" + targetPackage.Name + " | Root=" + root.Name
                + " | Success=" + success);
            return success;
        }
        catch (e)
        {
            addin.logger.error("Invalidation CHECK en échec | GUID=" + guid
                + " | Error=" + (e.description || e.message || String(e)));
            return false;
        }
    },


	_beginOperation: function(operation, analysisRoot)
	{
		addin.operationContext =
		{
			operation: operation,
			analysisRoot: analysisRoot,

			definitions: null,
			artifactDefinitionsIndex: null,
			analysisElementTagsIndex: null,

			packagesIndex: null,
			artifactsIndex: null,
			diagramsIndex: null
		};

		return addin.operationContext;
	},
			
			
    // ========================================================
    // initializeAnalysis
    //
    // Initialise la cible sélectionnée.
    //
    // ANALYSIS_ROOT
    //      -> synchronize(root)
    //
    // ANALYSIS_PACKAGE
    //      -> initializeAnalysisPackage(root, package)
    // ========================================================

    _initializeCheckDashboards: function(context)
    {
        var root = context.analysisRoot;
        var prototypeGuid = addin.repositoryService.getTaggedValue(root.Element, "FrameworkBA_Check_PrototypeGuid")
            || addin.fbaConstants.CHECK_DASHBOARD_PROTOTYPE_GUID;
        if (!prototypeGuid)
        {
            addin.logger.warning("CHECK INIT ignore | Prototype non configure | Root=" + root.Name);
            return true;
        }
        if (!addin.checkDashboardFactory)
        {
            addin.logger.error("Module checkDashboardFactory absent de l'Add-In.");
            return false;
        }
        var sync = addin.analysisStructureSynchronizer;
        function ensurePackage(pkg)
        {
            // A cancelled INIT returns true too; do not create a dashboard for it.
            if (sync._getAnalysisPackageInitializationState(pkg) !== "INITIALIZED") return true;
            return addin.checkDashboardFactory.ensure(pkg, root);
        }
        if (context.targetType === addin.fbaConstants.CONTEXT_ANALYSIS_PACKAGE)
            return ensurePackage(context.targetPackage);
        var success = true;
        function visit(pkg)
        {
            pkg.Packages.Refresh();
            // Capture children before creating any technical result packages.
            var children = [];
            for (var i = 0; i < pkg.Packages.Count; i++) children.push(pkg.Packages.GetAt(i));
            for (var j = 0; j < children.length; j++)
            {
                var child = children[j];
                if (addin.utils.isTechnicalName(child.Name)) continue;
                if (!ensurePackage(child)) success = false;
                visit(child);
            }
        }
        visit(root);
        return success;
    },

    initializeAnalysis: function()
    {
        var selectedPackage =
            Repository.GetTreeSelectedPackage();


        if (!selectedPackage)
        {
            addin.logger.warning(
                "INITIALIZE impossible"
                + " | Aucun package sélectionné"
            );


            addin.repositoryService.showInfo(
                "Framework BA\n\n"
                + "Sélectionnez un dossier d'analyse "
                + "ou un package d'analyse."
            );


            return false;
        }


        // ----------------------------------------------------
        // RESOLUTION DU CONTEXTE
        // ----------------------------------------------------

        var context =
            addin.analysisContextResolver
                .resolvePackage(
                    selectedPackage
                );


        if (
            !context ||
            !context.analysisRoot
        )
        {
            addin.logger.warning(
                "INITIALIZE impossible"
                + " | Package="
                + selectedPackage.Name
                + " | Aucun dossier d'analyse trouvé"
            );


            addin.repositoryService.showInfo(
                "Framework BA\n\n"
                + "Le package sélectionné n'appartient pas "
                + "à un dossier d'analyse Framework BA."
            );


            return false;
        }
		
		this._beginOperation(
			addin.fbaConstants.COMMAND_INITIALIZE,
			context.analysisRoot
		);
		
        var result =
            false;


        // ----------------------------------------------------
        // ROOT
        // ----------------------------------------------------

        if (
            context.targetType ==
            addin.fbaConstants.CONTEXT_ANALYSIS_ROOT
        )
        {
            addin.logger.info(
                "Initialisation du dossier d'analyse"
                + " | Niveau=ROOT"
                + " | Root="
                + context.analysisRoot.Name
            );


            result =
                addin.analysisStructureSynchronizer
                    .synchronize(
                        context.analysisRoot
                    );
        }


        // ----------------------------------------------------
        // PACKAGE
        // ----------------------------------------------------

        else if (
            context.targetType ==
            addin.fbaConstants.CONTEXT_ANALYSIS_PACKAGE
        )
        {
            addin.logger.info(
                "Initialisation du package d'analyse"
                + " | Niveau=PACKAGE"
                + " | Root="
                + context.analysisRoot.Name
                + " | Package="
                + context.targetPackage.Name
            );


            result =
                addin.analysisStructureSynchronizer
                    .initializeAnalysisPackage(
                        context.analysisRoot,
                        context.targetPackage
                    );
        }


        // ----------------------------------------------------
        // CONTEXTE NON SUPPORTE
        // ----------------------------------------------------

        else
        {
            addin.logger.warning(
                "INITIALIZE impossible"
                + " | Contexte non supporté"
                + " | Type="
                + context.targetType
            );


            return false;
        }


        if (result)
            result = this._initializeCheckDashboards(context);

        // ----------------------------------------------------
        // REFRESH
        // ----------------------------------------------------

        if (result)
        {
			/*
            Repository.RefreshModelView(
                context.analysisRoot.PackageID
            );
			*/

            addin.logger.info(
                "INITIALIZE terminé"
                + " | Type="
                + context.targetType
                + " | Root="
                + context.analysisRoot.Name
            );
        }
        else
        {
            addin.logger.error(
                "INITIALIZE en échec"
                + " | Type="
                + context.targetType
                + " | Root="
                + context.analysisRoot.Name
            );
        }


        return result;
    },


    completeAnalysis: function()
	{
		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.warning(
				"COMPLETE impossible"
				+ " | Aucun package sélectionné"
			);

			return false;
		}


		var context =
			addin.analysisContextResolver
				.resolvePackage(
					selectedPackage
				);


		if (
			!context ||
			!context.analysisRoot ||
			!context.targetPackage
		)
		{
			addin.logger.warning(
				"COMPLETE impossible"
				+ " | Aucun contexte d'analyse"
				+ " | Package="
				+ selectedPackage.Name
			);

			return false;
		}
		
		this._beginOperation(
			addin.fbaConstants.COMMAND_COMPLETE,
			context.analysisRoot
		);

		// ========================================================
		// COMPLETE PACKAGE
		// ========================================================

		if (
			context.targetType ==
			addin.fbaConstants.CONTEXT_ANALYSIS_PACKAGE
		)
		{
			addin.logger.info(
				"Complétion du package d'analyse"
				+ " | Root="
				+ context.analysisRoot.Name
				+ " | Package="
				+ context.targetPackage.Name
			);


			var packageResult =
				addin.analysisStructureSynchronizer
					.completeAnalysisPackage(
						context.analysisRoot,
						context.targetPackage
					);


			if (packageResult)
			{
				/*
				Repository.RefreshModelView(
					context.targetPackage.PackageID
				);
				*/
			}


			return packageResult;
		}


		// ========================================================
		// COMPLETE ROOT
		// ========================================================

		if (
			context.targetType ==
			addin.fbaConstants.CONTEXT_ANALYSIS_ROOT
		)
		{
			addin.logger.info(
				"Complétion du dossier d'analyse"
				+ " | Root="
				+ context.analysisRoot.Name
			);


			var rootResult =
				addin.analysisStructureSynchronizer
					.completeAnalysis(
						context.analysisRoot
					);


			if (rootResult)
			{
				/*
				Repository.RefreshModelView(
					context.analysisRoot.PackageID
				);
				*/
			}


			return rootResult;
		}


		// ========================================================
		// CONTEXTE NON SUPPORTE
		// ========================================================

		addin.logger.warning(
			"COMPLETE non applicable"
			+ " | Type="
			+ context.targetType
			+ " | Cible="
			+ context.targetPackage.Name
		);


		return false;
	},


    // ========================================================
    // checkAnalysis
    //
    // PACKAGE
    //      -> checkAnalysisPackage()
    //
    // ROOT
    //      -> checkAnalysisModel()
    //
    // NON_CONFORME reste un résultat métier valide.
    // ========================================================

    checkAnalysis: function()
	{
		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		// ========================================================
		// 0. SELECTION
		// ========================================================

		if (!selectedPackage)
		{
			addin.logger.warning(
				"CHECK impossible"
				+ " | Aucun package sélectionné"
			);

			addin.repositoryService.showInfo(
				"Framework BA\n\n"
				+ "Sélectionnez un dossier d'analyse "
				+ "ou un package d'analyse."
			);

			return false;
		}


		// ========================================================
		// 1. RESOLUTION DU CONTEXTE
		// ========================================================

		var context =
			addin.analysisContextResolver
				.resolvePackage(
					selectedPackage
				);


		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.warning(
				"CHECK impossible"
				+ " | Package="
				+ selectedPackage.Name
				+ " | Aucun dossier d'analyse trouvé"
			);


			addin.repositoryService.showInfo(
				"Framework BA\n\n"
				+ "Le package sélectionné n'appartient pas "
				+ "à un dossier d'analyse Framework BA."
			);


			return false;
		}

		this._beginOperation(
			addin.fbaConstants.COMMAND_CHECK,
			context.analysisRoot
		);

		var checkResult =
			null;


		// ========================================================
		// 2. CHECK PACKAGE
		// ========================================================

		if (
			context.targetType ==
			addin.fbaConstants.CONTEXT_ANALYSIS_PACKAGE
		)
		{
			addin.logger.info(
				"Contrôle du package d'analyse"
				+ " | Niveau=PACKAGE"
				+ " | Root="
				+ context.analysisRoot.Name
				+ " | Package="
				+ context.targetPackage.Name
			);


			checkResult =
				addin.analysisStructureSynchronizer
					.checkAnalysisPackage(
						context.analysisRoot,
						context.targetPackage
					);
		}


		// ========================================================
		// 3. CHECK ROOT
		// ========================================================

		else if (
			context.targetType ==
			addin.fbaConstants.CONTEXT_ANALYSIS_ROOT
		)
		{
			addin.logger.info(
				"Contrôle du dossier d'analyse"
				+ " | Niveau=ROOT"
				+ " | Root="
				+ context.analysisRoot.Name
			);


			checkResult =
				addin.analysisStructureSynchronizer
					.checkAnalysis(
						context.analysisRoot
					);
		}


		// ========================================================
		// 4. CONTEXTE NON SUPPORTE
		// ========================================================

		else
		{
			addin.logger.warning(
				"CHECK impossible"
				+ " | Contexte non supporté"
				+ " | Type="
				+ context.targetType
			);


			return false;
		}


		// ========================================================
		// 5. RESULTAT TECHNIQUE
		// ========================================================

		if (!checkResult)
		{
			addin.logger.error(
				"CHECK en échec"
				+ " | Aucun résultat"
				+ " | Type="
				+ context.targetType
				+ " | Root="
				+ context.analysisRoot.Name
			);


			return false;
		}


		if (!checkResult.success)
		{
			addin.logger.error(
				"CHECK en échec technique"
				+ " | Scope="
				+ checkResult.scope
				+ " | Root="
				+ context.analysisRoot.Name
			);


			return false;
		}


		// ========================================================
		// 6. RESULTAT FONCTIONNEL
		//
		// Une non-conformité n'est PAS un échec technique.
		// ========================================================

		var issueCount =
			checkResult.issues
				? checkResult.issues.length
				: 0;


		var errorCount =
			checkResult.summary
				? checkResult.summary.errors
				: 0;


		var warningCount =
			checkResult.summary
				? checkResult.summary.warnings
				: 0;


		var initCount =
			checkResult.summary
				? checkResult.summary.init
				: 0;


		var completeCount =
			checkResult.summary
				? checkResult.summary.complete
				: 0;


		var repairCount =
			checkResult.summary
				? checkResult.summary.repair
				: 0;


		var manualCompleteCount =
			checkResult.summary
				? checkResult.summary.manualComplete
				: 0;


		var manualRemoveCount =
			checkResult.summary
				? checkResult.summary.manualRemove
				: 0;


		var manualMoveCount =
			checkResult.summary
				? checkResult.summary.manualMove
				: 0;


		var makeTechnicalCount =
			checkResult.summary
				? checkResult.summary.makeTechnical
				: 0;


		var makeBusinessCount =
			checkResult.summary
				? checkResult.summary.makeBusiness
				: 0;


		var manualReviewCount =
			checkResult.summary
				? checkResult.summary.manualReview
				: 0;


		addin.logger.info(
			"CHECK terminé"
			+ " | Scope="
			+ checkResult.scope
			+ " | Issues="
			+ issueCount
			+ " | Errors="
			+ errorCount
			+ " | Warnings="
			+ warningCount
			+ " | INIT="
			+ initCount
			+ " | COMPLETE="
			+ completeCount
			+ " | REPAIR="
			+ repairCount
			+ " | MANUAL_COMPLETE="
			+ manualCompleteCount
			+ " | MANUAL_REMOVE="
			+ manualRemoveCount
			+ " | MANUAL_MOVE="
			+ manualMoveCount
			+ " | MAKE_TECHNICAL="
			+ makeTechnicalCount
			+ " | MAKE_BUSINESS="
			+ makeBusinessCount
			+ " | MANUAL_REVIEW="
			+ manualReviewCount
		);


		// ========================================================
		// 7. SUCCES TECHNIQUE
		// ========================================================

		return true;
	},


    // ========================================================
    // repairAnalysis
    // ========================================================

	repairAnalysis: function()
	{
		addin.logger.info(
			"Réparation de l'analyse"
		);


		// ========================================================
		// 1. PACKAGE SELECTIONNE
		// ========================================================

		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.error(
				"REPAIR impossible"
				+ " | Aucun package sélectionné"
			);

			return false;
		}


		// ========================================================
		// 2. RESOLUTION DU CONTEXTE
		// ========================================================

		var context =
			addin.analysisContextResolver
				.resolvePackage(
					selectedPackage
				);


		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"REPAIR impossible"
				+ " | Contexte d'analyse introuvable"
			);

			return false;
		}


		this._beginOperation(
			addin.fbaConstants.COMMAND_REPAIR,
			context.analysisRoot
		);
		
		// ========================================================
		// 3. PACKAGE D'ANALYSE
		// ========================================================

		if (
			context.targetType ==
			addin.fbaConstants.CONTEXT_ANALYSIS_PACKAGE
		)
		{
			if (!context.targetPackage)
			{
				addin.logger.error(
					"REPAIR impossible"
					+ " | Package cible introuvable"
				);

				return false;
			}


			addin.logger.info(
				"Réparation du package d'analyse"
				+ " | Niveau=PACKAGE"
				+ " | Root=" + context.analysisRoot.Name
				+ " | Package=" + context.targetPackage.Name
			);


			var packageResult =
				addin.analysisStructureSynchronizer
					.repairAnalysisPackage(
						context.analysisRoot,
						context.targetPackage
					);


			if (!packageResult)
			{
				addin.logger.error(
					"REPAIR terminé avec échec"
					+ " | Niveau=PACKAGE"
					+ " | Package=" + context.targetPackage.Name
				);

				return false;
			}


			addin.logger.info(
				"REPAIR terminé"
				+ " | Niveau=PACKAGE"
				+ " | Package=" + context.targetPackage.Name
				+ " | Success=true"
			);


			return true;
		}


		// ========================================================
		// 4. DOSSIER D'ANALYSE
		// ========================================================

		if (
			context.targetType ==
			addin.fbaConstants.CONTEXT_ANALYSIS_ROOT
		)
		{
			addin.logger.info(
				"Réparation du dossier d'analyse"
				+ " | Niveau=ROOT"
				+ " | Root=" + context.analysisRoot.Name
			);


			var rootResult =
				addin.analysisStructureSynchronizer
					.repairAnalysis(
						context.analysisRoot
					);


			if (!rootResult)
			{
				addin.logger.error(
					"REPAIR terminé avec échec"
					+ " | Niveau=ROOT"
					+ " | Root=" + context.analysisRoot.Name
				);

				return false;
			}


			addin.logger.info(
				"REPAIR terminé"
				+ " | Niveau=ROOT"
				+ " | Root=" + context.analysisRoot.Name
				+ " | Success=true"
			);


			return true;
		}


		// ========================================================
		// 5. CONTEXTE NON SUPPORTE
		// ========================================================

		addin.logger.error(
			"REPAIR impossible"
			+ " | Type de contexte non supporté"
			+ " | TargetType=" + context.targetType
		);


		return false;
	},


    // ========================================================
    // checkDeliverable
    // ========================================================

    checkDeliverable: function()
    {
        addin.logger.warning(
            "CHECK DELIVERABLE"
            + " | Fonction non encore migrée"
        );


        return false;
    }
};