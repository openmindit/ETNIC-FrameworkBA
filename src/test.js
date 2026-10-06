
var addin = this;


return {
	
	run: function()
	{
		//this.testCheckPackageRuleContract();
	},

	// ====================================================
	// CONFIGURATION
	// ====================================================

	rootPackageGuid:
		"{BC43D8BA-5880-4985-8790-F82CA1740612}",


	// ====================================================
	// NOMS DES PACKAGES DE TEST
	// ====================================================

	packageTechnicalArtifact:
		"TEST - TechnicalArtifact",

	packageEnsureAttached:
		"TEST - EnsureArtifact Attached",

	packageEnsureCompatible:
		"TEST - EnsureArtifact Compatible",

	packageEnsureAmbiguity:
		"TEST - EnsureArtifact Ambiguity",

	packageEnsureCreation:
		"TEST - EnsureArtifact Creation",
		
	packageArtifactNumberRepair:
		"TEST - Artifact Number Repair",
	
	packageFindMatchingArtifact:
		"TEST - Find Matching Created Artifact",
		
	packageSynchronizePackages:
		"TEST - Synchronize Packages",
		
	packageEnsureLibrary:
		"TEST - Ensure Library",
		
	packageEnsureArtifactOnDiagram:
		"TEST - Ensure Artifact On Diagram",

	packageResolveDiagramType:
		"TEST - Resolve Diagram Type",
		
	packageEnsureAnalysisDiagram:
		"TEST - Ensure Analysis Diagram",
	
	packageLoadDiagramConfigs:
		"TEST - Load Diagram Configs",

	packageLoadDiagramArtifactDefinitions:
		"TEST - Load Diagram Artifact Definitions",
		
	packageLoadDiagramDefinitions:
		"TEST - Load Diagram Definitions",
	
	packageFindDiagramByName:
		"TEST - Find Diagram By Name",
	
	packageFindDiagramsByMetaType:
		"TEST - Find Diagrams By MetaType",
		
	packageResolveDiagramRegistry:
		"TEST - Resolve Diagram Registry",
		
	packageFindDiagramRegistryEntry:
		"TEST - Find Diagram Registry Entry",
		
	packageEnsureDiagramRegistryEntry:
		"TEST - Ensure Diagram Registry Entry",
		
	packageEnsureDiagramFromDefinition:
		"TEST - Ensure Diagram From Definition",
		
	packageFindDiagramRegistryEntriesBySourceGuid:
		"TEST - Find Registry Entries By Source",
	
	packageFindGeneratedDiagramsBySourceGuid:
		"TEST - Find Generated Diagrams By Source",
		
	packageFindGeneratedDiagramsForPackage:
		"TEST - Find Generated Diagrams For Package",
		
	packageHasPreExistingAnalysisContent:
		"TEST - Pre Existing Analysis Content",
		
	packageAnalysisPackageInitializationState:
		"TEST - Analysis Package Initialization State",
		
	packageFindDefinitionForPackage:
		"TEST - Find Definition For Package",
		
	packageCreateTechnicalDiagramFromDefinition:
		"TEST - Create Technical Diagram From Definition",
	
	packageUpdateDiagramRegistryHash:
		"TEST - Update Diagram Registry Hash",
		
	packageSynchronizeAnalysisContent:
		"TEST - Synchronize Analysis Content",
		
	packageInitializeAnalysisPackage:
		"TEST - Initialize Analysis Package",
		
	// ====================================================
	// _getRootPackage
	// ====================================================

	_getRootPackage: function()
	{
		var rootPackage =
			addin.repositoryService.getPackageByGuid(
				this.rootPackageGuid
			);


		if (!rootPackage)
		{
			addin.logger.error(
				"TEST | Package racine introuvable"
				+ " | GUID=" + this.rootPackageGuid
			);

			return null;
		}


		return rootPackage;
	},


	// ====================================================
	// _deleteChildPackage
	//
	// Supprime tous les packages directs portant
	// le nom demandé.
	// ====================================================

	_deleteChildPackage: function(
		parentPackage,
		packageName)
	{
		if (!parentPackage)
			return false;


		var deleted =
			false;


		for (
			var i = parentPackage.Packages.Count - 1;
			i >= 0;
			i--
		)
		{
			var childPackage =
				parentPackage.Packages.GetAt(i);


			if (!childPackage)
				continue;


			if (
				addin.utils.equalsIgnoreCase(
					childPackage.Name,
					packageName
				)
			)
			{
				addin.logger.info(
					"TEST | Suppression package"
					+ " | Nom=" + childPackage.Name
					+ " | GUID=" + childPackage.PackageGUID
				);


				parentPackage.Packages.DeleteAt(
					i,
					true
				);


				deleted =
					true;
			}
		}


		parentPackage.Packages.Refresh();


		if (deleted)
		{
			addin.logger.info(
				"TEST | Ancien package supprimé"
				+ " | Nom=" + packageName
			);
		}


		return true;
	},


	// ====================================================
	// _createFreshPackage
	//
	// Supprime l'ancien package puis en recrée un vide.
	// ====================================================

	_createFreshPackage: function(
		packageName)
	{
		var rootPackage =
			this._getRootPackage();


		if (!rootPackage)
			return null;


		// =================================================
		// SUPPRESSION DE L'ANCIEN PACKAGE
		// =================================================

		this._deleteChildPackage(
			rootPackage,
			packageName
		);


		// =================================================
		// RECHARGEMENT DU PACKAGE RACINE
		//
		// Important après modification de la collection EA.
		// =================================================

		rootPackage =
			addin.repositoryService.getPackageByGuid(
				this.rootPackageGuid
			);


		if (!rootPackage)
		{
			addin.logger.error(
				"TEST | Impossible de recharger le package racine"
				+ " | GUID=" + this.rootPackageGuid
			);

			return null;
		}


		rootPackage.Packages.Refresh();


		// =================================================
		// CREATION DU NOUVEAU PACKAGE
		// =================================================

		var testPackage =
			rootPackage.Packages.AddNew(
				packageName,
				""
			);


		if (!testPackage)
		{
			addin.logger.error(
				"TEST | Impossible de créer le package"
				+ " | Nom=" + packageName
			);

			return null;
		}


		if (!testPackage.Update())
		{
			addin.logger.error(
				"TEST | Impossible de sauvegarder le package"
				+ " | Nom=" + packageName
			);

			return null;
		}


		rootPackage.Packages.Refresh();


		addin.logger.info(
			"TEST | Package créé"
			+ " | Nom=" + testPackage.Name
			+ " | GUID=" + testPackage.PackageGUID
		);


		return testPackage;
	},

	_checkPackageStructure: function(
		parentPackage,
		definitions)
	{
		if (
			!parentPackage ||
			!definitions
		)
		{
			return false;
		}


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var definition =
				definitions[i];


			if (!definition)
			{
				continue;
			}


			var childPackage =
				addin.repositoryService
					.findDirectChildPackageByNameIncludingTechnical(
						parentPackage,
						definition.name
					);


			if (!childPackage)
			{
				addin.logger.error(
					"TEST | Package technique manquant"
					+ " | Parent=" + parentPackage.Name
					+ " | Nom=" + definition.name
				);

				return false;
			}


			var children =
				definition.children || [];


			if (
				children.length > 0 &&
				!this._checkPackageStructure(
					childPackage,
					children
				)
			)
			{
				return false;
			}
		}


		return true;
	},

	// ====================================================
	// _createElement
	// ====================================================

	_createElement: function(
		testPackage,
		elementName,
		elementType,
		stereotype)
	{
		if (!testPackage)
			return null;


		var element =
			testPackage.Elements.AddNew(
				elementName,
				elementType
			);


		if (!element)
		{
			addin.logger.error(
				"TEST | Impossible de créer l'élément"
				+ " | Nom=" + elementName
			);

			return null;
		}


		if (
			!addin.utils.isEmpty(
				stereotype
			)
		)
		{
			element.StereotypeEx =
				stereotype;
		}


		if (!element.Update())
		{
			addin.logger.error(
				"TEST | Impossible de sauvegarder l'élément"
				+ " | Nom=" + elementName
			);

			return null;
		}


		testPackage.Elements.Refresh();


		addin.logger.info(
			"TEST | Élément créé"
			+ " | Nom=" + element.Name
			+ " | Type=" + element.Type
			+ " | Stereo=" + element.StereotypeEx
			+ " | GUID=" + element.ElementGUID
		);


		return element;
	},


	// ====================================================
	// _getAnalysisDefinition
	// ====================================================

	_getAnalysisDefinition: function(
		definitionName)
	{
		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			if (
				addin.utils.equalsIgnoreCase(
					definitions[i].name,
					definitionName
				)
			)
			{
				return definitions[i];
			}
		}


		addin.logger.error(
			"TEST | Définition d'analyse introuvable"
			+ " | Nom=" + definitionName
		);


		return null;
	},


	// ====================================================
	// _getFirstArtifactDefinition
	// ====================================================

	_getFirstArtifactDefinition: function(
		analysisDefinition)
	{
		if (!analysisDefinition)
			return null;


		var definitions =
			addin.analysisStructureSynchronizer
				._loadArtifactDefinitions(
					analysisDefinition
				);


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			addin.logger.error(
				"TEST | Aucune définition d'artefact"
				+ " | Analysis="
				+ analysisDefinition.name
			);

			return null;
		}


		return definitions[0];
	},


	// ====================================================
	// _getBesoinsContext
	// ====================================================

	_getBesoinsContext: function()
	{
		var analysisDefinition =
			this._getAnalysisDefinition(
				"Besoins"
			);


		if (!analysisDefinition)
			return null;


		var artifactDefinition =
			this._getFirstArtifactDefinition(
				analysisDefinition
			);


		if (!artifactDefinition)
			return null;


		return {

			analysisDefinition:
				analysisDefinition,

			artifactDefinition:
				artifactDefinition
		};
	},


	// ====================================================
	// _testResult
	// ====================================================

	_testResult: function(
		testName,
		success,
		message)
	{
		return {

			name:
				testName,

			success:
				success,

			message:
				message || ""
		};
	},


	// ====================================================
	// 01
	// TEST _createTechnicalArtifact
	// ====================================================

	createTechnicalArtifact: function()
	{
		var testName =
			"createTechnicalArtifact";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageTechnicalArtifact
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		var context =
			this._getBesoinsContext();


		if (!context)
		{
			return this._testResult(
				testName,
				false,
				"Contexte Besoins introuvable"
			);
		}


		var countBefore =
			testPackage.Elements.Count;


		var artifact =
			addin.analysisStructureSynchronizer
				._createTechnicalArtifact(
					testPackage,
					context.analysisDefinition,
					context.artifactDefinition
				);


		testPackage.Elements.Refresh();


		if (!artifact)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Aucun artefact créé"
			);


			return this._testResult(
				testName,
				false,
				"Aucun artefact créé"
			);
		}


		var sourceGuid =
			addin.repositoryService.getTaggedValue(
				artifact,
				addin.fbaConstants
					.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
			);


		var technical =
			addin.repositoryService.getTaggedValue(
				artifact,
				addin.fbaConstants.TAG_TECHNICAL
			);


		var valid =
			testPackage.Elements.Count ==
				countBefore + 1
			&&
			addin.utils.startsWith(
				artifact.Name,
				addin.fbaConstants
					.TECHNICAL_NAME_PREFIX
			)
			&&
			addin.utils.equalsIgnoreCase(
				sourceGuid,
				context.artifactDefinition.prototypeGuid
			)
			&&
			addin.utils.equalsIgnoreCase(
				technical,
				"true"
			);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Nom=" + artifact.Name
				+ " | GUID=" + artifact.ElementGUID
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			""
		);
	},


	// ====================================================
	// 02
	// TEST _ensureArtifact
	// Artefact déjà rattaché
	// ====================================================

	ensureArtifactAttached: function()
	{
		var testName =
			"ensureArtifactAttached";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageEnsureAttached
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package non créé"
			);
		}


		var context =
			this._getBesoinsContext();


		if (!context)
		{
			return this._testResult(
				testName,
				false,
				"Contexte Besoins introuvable"
			);
		}


		// =================================================
		// SETUP
		// Création d'un artefact déjà rattaché.
		// =================================================

		var existingArtifact =
			addin.analysisStructureSynchronizer
				._createTechnicalArtifact(
					testPackage,
					context.analysisDefinition,
					context.artifactDefinition
				);


		if (!existingArtifact)
		{
			return this._testResult(
				testName,
				false,
				"Setup impossible"
			);
		}


		testPackage.Elements.Refresh();


		var countBefore =
			testPackage.Elements.Count;


		var guidBefore =
			existingArtifact.ElementGUID;


		// =================================================
		// TEST
		// =================================================

		var returnedArtifact =
			addin.analysisStructureSynchronizer
				._ensureArtifact(
					testPackage,
					context.analysisDefinition,
					context.artifactDefinition
				);


		testPackage.Elements.Refresh();


		var valid =
			returnedArtifact != null
			&&
			addin.utils.equalsIgnoreCase(
				returnedArtifact.ElementGUID,
				guidBefore
			)
			&&
			testPackage.Elements.Count ==
				countBefore;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Artefact existant réutilisé"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			""
		);
	},


	// ====================================================
	// 03
	// TEST _ensureArtifact
	// Un candidat compatible
	// ====================================================

	ensureArtifactCompatible: function()
	{
		var testName =
			"ensureArtifactCompatible";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageEnsureCompatible
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package non créé"
			);
		}


		var context =
			this._getBesoinsContext();


		if (!context)
		{
			return this._testResult(
				testName,
				false,
				"Contexte Besoins introuvable"
			);
		}


		// =================================================
		// SETUP
		// Création d'un élément compatible mais
		// volontairement non rattaché au métamodèle.
		// =================================================

		var candidate =
			this._createElement(
				testPackage,
				"Mon besoin existant",
				context.artifactDefinition.elementType,
				context.artifactDefinition.stereotype
			);


		if (!candidate)
		{
			return this._testResult(
				testName,
				false,
				"Candidat non créé"
			);
		}


		var guidBefore =
			candidate.ElementGUID;


		var countBefore =
			testPackage.Elements.Count;


		// =================================================
		// TEST
		// =================================================

		var returnedArtifact =
			addin.analysisStructureSynchronizer
				._ensureArtifact(
					testPackage,
					context.analysisDefinition,
					context.artifactDefinition
				);


		testPackage.Elements.Refresh();


		if (!returnedArtifact)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Aucun artefact retourné"
			);


			return this._testResult(
				testName,
				false,
				"Aucun artefact retourné"
			);
		}


		var sourceGuid =
			addin.repositoryService.getTaggedValue(
				returnedArtifact,
				addin.fbaConstants
					.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
			);


		var technical =
			addin.repositoryService.getTaggedValue(
				returnedArtifact,
				addin.fbaConstants.TAG_TECHNICAL
			);


		var valid =
			testPackage.Elements.Count ==
				countBefore
			&&
			addin.utils.equalsIgnoreCase(
				returnedArtifact.ElementGUID,
				guidBefore
			)
			&&
			addin.utils.equalsIgnoreCase(
				sourceGuid,
				context.artifactDefinition.prototypeGuid
			)
			&&
			addin.utils.equalsIgnoreCase(
				technical,
				"true"
			);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Artefact existant rattaché"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			""
		);
	},


	// ====================================================
	// 04
	// TEST _ensureArtifact
	// Plusieurs candidats compatibles
	// ====================================================

	ensureArtifactAmbiguity: function()
	{
		var testName =
			"ensureArtifactAmbiguity";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageEnsureAmbiguity
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package non créé"
			);
		}


		var context =
			this._getBesoinsContext();


		if (!context)
		{
			return this._testResult(
				testName,
				false,
				"Contexte Besoins introuvable"
			);
		}


		// =================================================
		// SETUP
		// Deux éléments compatibles non rattachés.
		// =================================================

		var candidateA =
			this._createElement(
				testPackage,
				"Besoin candidat A",
				context.artifactDefinition.elementType,
				context.artifactDefinition.stereotype
			);


		var candidateB =
			this._createElement(
				testPackage,
				"Besoin candidat B",
				context.artifactDefinition.elementType,
				context.artifactDefinition.stereotype
			);


		if (
			!candidateA ||
			!candidateB
		)
		{
			return this._testResult(
				testName,
				false,
				"Setup impossible"
			);
		}


		var countBefore =
			testPackage.Elements.Count;


		// =================================================
		// TEST
		// =================================================

		var returnedArtifact =
			addin.analysisStructureSynchronizer
				._ensureArtifact(
					testPackage,
					context.analysisDefinition,
					context.artifactDefinition
				);


		testPackage.Elements.Refresh();


		var sourceA =
			addin.repositoryService.getTaggedValue(
				candidateA,
				addin.fbaConstants
					.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
			);


		var sourceB =
			addin.repositoryService.getTaggedValue(
				candidateB,
				addin.fbaConstants
					.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
			);


		var valid =
			returnedArtifact == null
			&&
			testPackage.Elements.Count ==
				countBefore
			&&
			addin.utils.isEmpty(
				sourceA
			)
			&&
			addin.utils.isEmpty(
				sourceB
			);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Ambiguïté respectée"
				+ " | Aucun choix arbitraire"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			""
		);
	},


	// ====================================================
	// 05
	// TEST _ensureArtifact
	// Aucun candidat -> création
	// ====================================================

	ensureArtifactCreation: function()
	{
		var testName =
			"ensureArtifactCreation";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageEnsureCreation
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package non créé"
			);
		}


		var context =
			this._getBesoinsContext();


		if (!context)
		{
			return this._testResult(
				testName,
				false,
				"Contexte Besoins introuvable"
			);
		}


		// Package volontairement vide.

		var countBefore =
			testPackage.Elements.Count;


		var returnedArtifact =
			addin.analysisStructureSynchronizer
				._ensureArtifact(
					testPackage,
					context.analysisDefinition,
					context.artifactDefinition
				);


		testPackage.Elements.Refresh();


		if (!returnedArtifact)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Aucun artefact créé"
			);


			return this._testResult(
				testName,
				false,
				"Aucun artefact créé"
			);
		}


		var sourceGuid =
			addin.repositoryService.getTaggedValue(
				returnedArtifact,
				addin.fbaConstants
					.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
			);


		var technical =
			addin.repositoryService.getTaggedValue(
				returnedArtifact,
				addin.fbaConstants.TAG_TECHNICAL
			);


		var valid =
			testPackage.Elements.Count ==
				countBefore + 1
			&&
			addin.utils.equalsIgnoreCase(
				sourceGuid,
				context.artifactDefinition.prototypeGuid
			)
			&&
			addin.utils.equalsIgnoreCase(
				technical,
				"true"
			)
			&&
			!addin.utils.startsWith(
				returnedArtifact.Name,
				addin.fbaConstants
					.TECHNICAL_NAME_PREFIX
			);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Artefact créé"
				+ " | Nom=" + returnedArtifact.Name
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			""
		);
	},


	// ====================================================
	// RUN ALL
	// ====================================================

	runAll: function()
	{
		addin.logger.info(
			"========================================"
		);

		addin.logger.info(
			"FRAMEWORK BA - DEBUT DES TESTS"
		);

		addin.logger.info(
			"========================================"
		);


		var passed =
			0;

		var failed =
			0;

		var total =
			0;


		// =================================================
		// TEST 01
		// =================================================

		var r1 =
			this.createTechnicalArtifact();

		total++;

		if (
			r1 &&
			r1.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}


		// =================================================
		// TEST 02
		// =================================================

		var r2 =
			this.ensureArtifactAttached();

		total++;

		if (
			r2 &&
			r2.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}


		// =================================================
		// TEST 03
		// =================================================

		var r3 =
			this.ensureArtifactCompatible();

		total++;

		if (
			r3 &&
			r3.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}


		// =================================================
		// TEST 04
		// =================================================

		var r4 =
			this.ensureArtifactAmbiguity();

		total++;

		if (
			r4 &&
			r4.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}


		// =================================================
		// TEST 05
		// =================================================

		var r5 =
			this.ensureArtifactCreation();

		total++;

		if (
			r5 &&
			r5.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}


		var r6 =
			this.artifactNumberRepair();

		total++;

		if (
			r6 &&
			r6.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r7 =
		this.findMatchingCreatedArtifact();

		total++;

		if (
			r7 &&
			r7.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r8 =
			this.synchronizePackages();

		total++;

		if (
			r8 &&
			r8.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r9 =
			this.ensureLibrary();

		total++;

		if (
			r9 &&
			r9.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r10 =
			this.ensureArtifactOnDiagram();

		total++;

		if (
			r10 &&
			r10.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r11 =
			this.resolveDiagramType();

		total++;

		if (
			r11 &&
			r11.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r12 =
			this.ensureAnalysisDiagram();

		total++;

		if (
			r12 &&
			r12.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r13 =
			this.loadDefinitions();

		total++;

		if (
			r13 &&
			r13.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r14 =
			this.loadDiagramConfigs();

		total++;

		if (
			r14 &&
			r14.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r15 =
			this.loadDiagramArtifactDefinitions();

		total++;

		if (
			r15 &&
			r15.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r16 =
			this.loadDiagramDefinitions();

		total++;

		if (
			r16 &&
			r16.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r17 =
			this.isDiagramRequired();

		total++;

		if (
			r17 &&
			r17.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r18 =
			this.resolveEffectiveDiagramConfig();

		total++;

		if (
			r18 &&
			r18.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r19 =
			this.buildGeneratedDiagramName();

		total++;

		if (
			r19 &&
			r19.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r20 =
			this.isRequiredDiagram();

		total++;

		if (
			r20 &&
			r20.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r21 =
			this.findDiagramByName();

		total++;

		if (
			r21 &&
			r21.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r22 =
			this.findDiagramsByMetaType();

		total++;

		if (
			r22 &&
			r22.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r23 =
			this.resolveDiagramRegistryPackage();

		total++;

		if (
			r23 &&
			r23.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r24 =
			this.findDiagramRegistryEntryByGeneratedGuid();

		total++;

		if (
			r24 &&
			r24.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r25 =
			this.ensureDiagramRegistryEntry();

		total++;

		if (
			r25 &&
			r25.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r26 =
			this.ensureDiagramFromDefinition();

		total++;

		if (
			r26 &&
			r26.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r27 =
			this.findDiagramRegistryEntriesBySourceGuid();

		total++;

		if (
			r27 &&
			r27.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r28 =
			this.findGeneratedDiagramsBySourceGuid();

		total++;

		if (
			r28 &&
			r28.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r29 =
			this.findGeneratedDiagramsForPackage();

		total++;

		if (
			r29 &&
			r29.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r30 =
			this.hasPreExistingAnalysisContent();

		total++;

		if (
			r30 &&
			r30.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r31 =
			this.analysisPackageInitializationState();

		total++;

		if (
			r31 &&
			r31.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r32 =
			this.findDefinitionForPackage();

		total++;

		if (
			r32 &&
			r32.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r33 =
			this.createTechnicalDiagramFromDefinition();

		total++;

		if (
			r33 &&
			r33.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r34 =
			this.updateDiagramRegistryHash();

		total++;

		if (
			r34 &&
			r34.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r35 =
			this.synchronizeAnalysisContent();

		total++;

		if (
			r35 &&
			r35.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		
		var r36 =
			this.initializeAnalysisPackage();

		total++;

		if (
			r36 &&
			r36.success
		)
		{
			passed++;
		}
		else
		{
			failed++;
		}
		// =================================================
		// RESULTAT-FINAL
		// =================================================

		addin.logger.info(
			"========================================"
		);

		addin.logger.info(
			"FRAMEWORK BA - RESULTAT TESTS"
			+ " | OK=" + passed
			+ " | ECHEC=" + failed
			+ " | TOTAL=" + total
		);

		addin.logger.info(
			"========================================"
		);


		return {
			success:
				failed == 0,

			passed:
				passed,

			failed:
				failed,

			total:
				total
		};
	},
	
			
	artifactNumberRepair: function()
	{
		var testName =
			"artifactNumberRepair";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageArtifactNumberRepair
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package non créé"
			);
		}


		// ========================================================
		// SETUP
		//
		// BSN001 - Premier
		// BSN001 - Deuxième
		// BSN002 - Troisième
		//
		// Le numéro 001 est donc utilisé deux fois.
		// ========================================================

		var artifact1 =
			this._createElement(
				testPackage,
				"BSN001 - Premier",
				"Requirement",
				"LABN_Requirement"
			);


		var artifact2 =
			this._createElement(
				testPackage,
				"BSN001 - Deuxième",
				"Requirement",
				"LABN_Requirement"
			);


		var artifact3 =
			this._createElement(
				testPackage,
				"BSN002 - Troisième",
				"Requirement",
				"LABN_Requirement"
			);


		if (
			!artifact1 ||
			!artifact2 ||
			!artifact3
		)
		{
			return this._testResult(
				testName,
				false,
				"Setup impossible"
			);
		}


		// ========================================================
		// TEST 1
		// COMPTAGE
		// ========================================================

		var usage1 =
			addin.analysisStructureSynchronizer
				._countArtifactNumberUsage(
					testPackage,
					"BSN",
					1
				);


		var usage2 =
			addin.analysisStructureSynchronizer
				._countArtifactNumberUsage(
					testPackage,
					"BSN",
					2
				);


		addin.logger.info(
			"TEST countArtifactNumberUsage"
			+ " | BSN001=" + usage1
			+ " | BSN002=" + usage2
		);


		if (
			usage1 != 2 ||
			usage2 != 1
		)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Comptage incorrect"
			);


			return this._testResult(
				testName,
				false,
				"Comptage incorrect"
			);
		}


		// ========================================================
		// TEST 2
		// REPARATION DU DOUBLON
		//
		// Comme BSN001 et BSN002 existent déjà,
		// le prochain numéro doit être supérieur.
		// ========================================================

		var repaired =
			addin.analysisStructureSynchronizer
				._repairArtifactNumberIfNeeded(
					testPackage,
					artifact2,
					"BSN"
				);


		testPackage.Elements.Refresh();


		addin.logger.info(
			"TEST repairArtifactNumberIfNeeded"
			+ " | Result=" + repaired
			+ " | NouveauNom=" + artifact2.Name
		);


		if (!repaired)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Doublon non réparé"
			);


			return this._testResult(
				testName,
				false,
				"Doublon non réparé"
			);
		}


		// ========================================================
		// VERIFICATIONS
		//
		// On ne force PAS BSN003 dans le test :
		// le compteur FrameworkBA du package peut être supérieur.
		//
		// On vérifie les invariants métier.
		// ========================================================

		var repairedNumber =
			addin.analysisStructureSynchronizer
				._extractArtifactNumber(
					artifact2.Name,
					"BSN"
				);


		var repairedUsage =
			addin.analysisStructureSynchronizer
				._countArtifactNumberUsage(
					testPackage,
					"BSN",
					repairedNumber
				);


		var suffixPreserved =
			artifact2.Name.indexOf(
				" - Deuxième"
			) >= 0;


		var valid =
			repairedNumber > 0
			&&
			repairedNumber != 1
			&&
			repairedUsage == 1
			&&
			suffixPreserved;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Ancien=BSN001 - Deuxième"
				+ " | Nouveau=" + artifact2.Name
				+ " | UsageNouveauNumero="
				+ repairedUsage
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | NouveauNom=" + artifact2.Name
				+ " | Number=" + repairedNumber
				+ " | Usage=" + repairedUsage
				+ " | SuffixPreserved=" + suffixPreserved
			);
		}


		return this._testResult(
			testName,
			valid,
			""
		);
	},
		
	findMatchingCreatedArtifact: function()
	{
		var testName =
			"findMatchingCreatedArtifact";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageFindMatchingArtifact
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package non créé"
			);
		}


		// ========================================================
		// CONSTANTES DU SCENARIO
		// ========================================================

		var discriminatorTag =
			addin.fbaConstants
				.TAG_STEREOTYPE_DISCRIMINATOR;


		var expectedDiscriminator =
			"TEST_MATCH";


		// ========================================================
		// DEFINITION DU DIAGRAMME
		//
		// C'est ce que le diagramme demande.
		// ========================================================

		var diagramArtifactDefinition =
		{
			type:
				"Requirement",

			stereotype:
				"LABN_Requirement"
		};


		// ========================================================
		// DEFINITION CANONIQUE
		//
		// Une seule définition correspond à :
		//
		// Requirement + LABN_Requirement
		// ========================================================

		var taggedValues =
			{};


		taggedValues[
			discriminatorTag
		] =
			expectedDiscriminator;


		var canonicalDefinition =
		{
			elementType:
				"Requirement",

			stereotype:
				"LABN_Requirement",

			taggedValues:
				taggedValues
		};


		// Une autre définition volontairement différente.

		var otherDefinition =
		{
			elementType:
				"Class",

			stereotype:
				"LABN_BusinessObject",

			taggedValues:
				{}
		};


		var artifactDefinitions =
		[
			canonicalDefinition,
			otherDefinition
		];


		// ========================================================
		// CREATION DES ARTEFACTS
		//
		// 1. même Type/Stereo mais mauvais discriminant
		// 2. correspondance exacte
		// ========================================================

		var wrongArtifact =
			this._createElement(
				testPackage,
				"Requirement - Mauvais discriminant",
				"Requirement",
				"LABN_Requirement"
			);


		var matchingArtifact =
			this._createElement(
				testPackage,
				"Requirement - Correspondance exacte",
				"Requirement",
				"LABN_Requirement"
			);


		if (
			!wrongArtifact ||
			!matchingArtifact
		)
		{
			return this._testResult(
				testName,
				false,
				"Création des artefacts impossible"
			);
		}


		// ========================================================
		// TAG DU MAUVAIS CANDIDAT
		// ========================================================

		addin.repositoryService.setTaggedValue(
			wrongArtifact,
			discriminatorTag,
			"WRONG"
		);


		// ========================================================
		// TAG DU BON CANDIDAT
		// ========================================================

		addin.repositoryService.setTaggedValue(
			matchingArtifact,
			discriminatorTag,
			expectedDiscriminator
		);


		var createdArtifacts =
		[
			wrongArtifact,
			matchingArtifact
		];


		// ========================================================
		// TEST 1
		// CORRESPONDANCE EXACTE
		// ========================================================

		var found =
			addin.analysisStructureSynchronizer
				._findMatchingCreatedArtifact(
					createdArtifacts,
					diagramArtifactDefinition,
					artifactDefinitions
				);


		var exactMatchValid =
			found != null
			&&
			addin.utils.equalsIgnoreCase(
				found.ElementGUID,
				matchingArtifact.ElementGUID
			);


		addin.logger.info(
			"TEST findMatchingCreatedArtifact"
			+ " | ExactMatch="
			+ exactMatchValid
			+ " | Found="
			+ (
				found
					? found.Name
					: "<null>"
			)
		);


		if (!exactMatchValid)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Correspondance exacte non trouvée"
			);


			return this._testResult(
				testName,
				false,
				"Correspondance exacte non trouvée"
			);
		}


		// ========================================================
		// TEST 2
		// MAUVAIS DISCRIMINANT
		//
		// On ne fournit volontairement que le mauvais candidat.
		// Résultat attendu : null.
		// ========================================================

		var wrongOnly =
		[
			wrongArtifact
		];


		var notFound =
			addin.analysisStructureSynchronizer
				._findMatchingCreatedArtifact(
					wrongOnly,
					diagramArtifactDefinition,
					artifactDefinitions
				);


		var discriminatorValid =
			notFound == null;


		addin.logger.info(
			"TEST findMatchingCreatedArtifact"
			+ " | WrongDiscriminatorRejected="
			+ discriminatorValid
		);


		if (!discriminatorValid)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Mauvais discriminant accepté"
			);


			return this._testResult(
				testName,
				false,
				"Mauvais discriminant accepté"
			);
		}


		// ========================================================
		// TEST 3
		// DEFINITION CANONIQUE AMBIGUE
		//
		// Deux définitions possèdent exactement le même
		// Type + Stereotype.
		//
		// Résultat attendu : null.
		// ========================================================

		var secondTaggedValues =
			{};


		secondTaggedValues[
			discriminatorTag
		] =
			"OTHER";


		var secondCanonicalDefinition =
		{
			elementType:
				"Requirement",

			stereotype:
				"LABN_Requirement",

			taggedValues:
				secondTaggedValues
		};


		var ambiguousDefinitions =
		[
			canonicalDefinition,
			secondCanonicalDefinition
		];


		var ambiguousResult =
			addin.analysisStructureSynchronizer
				._findMatchingCreatedArtifact(
					createdArtifacts,
					diagramArtifactDefinition,
					ambiguousDefinitions
				);


		var ambiguityValid =
			ambiguousResult == null;


		addin.logger.info(
			"TEST findMatchingCreatedArtifact"
			+ " | AmbiguousDefinitionRejected="
			+ ambiguityValid
		);


		if (!ambiguityValid)
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Définition ambiguë acceptée"
			);


			return this._testResult(
				testName,
				false,
				"Définition canonique ambiguë acceptée"
			);
		}


		// ========================================================
		// RESULTAT GLOBAL
		// ========================================================

		addin.logger.info(
			"TEST " + testName + " OK"
			+ " | ExactMatch=true"
			+ " | WrongDiscriminatorRejected=true"
			+ " | AmbiguousDefinitionRejected=true"
		);


		return this._testResult(
			testName,
			true,
			""
		);
	},
		
	
	synchronizePackages: function()
	{
		var testName =
			"synchronizePackages";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		// ========================================================
		// PACKAGE DE TEST PROPRE
		// ========================================================

		var testPackage =
			this._createFreshPackage(
				this.packageSynchronizePackages
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// CHARGEMENT DES DEFINITIONS
		// ========================================================

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition chargée"
			);
		}


		var expectedCount =
			definitions.length;


		addin.logger.info(
			"TEST synchronizePackages"
			+ " | Definitions=" + expectedCount
		);


		// ========================================================
		// EXECUTION
		// ========================================================

		var result =
			addin.analysisStructureSynchronizer
				.synchronizePackages(
					testPackage
				);


		if (!result)
		{
			return this._testResult(
				testName,
				false,
				"synchronizePackages retourne false"
			);
		}


		testPackage.Packages.Refresh();


		// ========================================================
		// VERIFICATION DES PACKAGES
		//
		// On vérifie chaque définition individuellement.
		// C'est plus robuste qu'un simple Packages.Count.
		// ========================================================

		var foundCount =
			0;


		var missingCount =
			0;


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var definition =
				definitions[i];


			var foundPackage =
				addin.analysisStructureSynchronizer
					._findPackageBySourceGuid(
						testPackage,
						definition.guid
					);


			if (foundPackage)
			{
				foundCount++;
			}
			else
			{
				missingCount++;


				addin.logger.error(
					"TEST synchronizePackages"
					+ " | Package manquant"
					+ " | Definition=" + definition.name
					+ " | GUID=" + definition.guid
				);
			}
		}


		addin.logger.info(
			"TEST synchronizePackages"
			+ " | Expected=" + expectedCount
			+ " | Found=" + foundCount
			+ " | Missing=" + missingCount
		);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			result
			&&
			expectedCount > 0
			&&
			foundCount == expectedCount
			&&
			missingCount == 0;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Packages synchronisés="
				+ foundCount
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Expected=" + expectedCount
				+ " | Found=" + foundCount
				+ " | Missing=" + missingCount
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Structure incomplète"
		);
	},
		
	ensureLibrary: function()
	{
		var testName =
			"ensureLibrary";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		// ========================================================
		// CONFIGURATION
		// ========================================================

		if (
			!addin.fbaConstants.LIBRARY_STRUCTURE
		)
		{
			return this._testResult(
				testName,
				false,
				"LIBRARY_STRUCTURE non définie"
			);
		}


		// ========================================================
		// PACKAGE RACINE
		// ========================================================

		var testPackage =
			this._createFreshPackage(
				this.packageEnsureLibrary
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package racine non créé"
			);
		}


		// ========================================================
		// PREMIERE SYNCHRONISATION
		// ========================================================

		var library1 =
			addin.analysisStructureSynchronizer
				._ensureLibrary(
					testPackage
				);


		if (!library1)
		{
			return this._testResult(
				testName,
				false,
				"_ensureLibrary retourne null"
			);
		}


		addin.logger.info(
			"TEST ensureLibrary"
			+ " | Library=" + library1.Name
			+ " | GUID=" + library1.PackageGUID
		);


		// ========================================================
		// VERIFICATION STRUCTURE
		// ========================================================

		var structureValid =
			this._checkPackageStructure(
				library1,
				addin.fbaConstants.LIBRARY_STRUCTURE
			);


		addin.logger.info(
			"TEST ensureLibrary"
			+ " | StructureValid="
			+ structureValid
		);


		if (!structureValid)
		{
			return this._testResult(
				testName,
				false,
				"Structure technique incomplète"
			);
		}


		// ========================================================
		// TEST IDEMPOTENCE
		//
		// Une seconde synchronisation doit retourner exactement
		// la même librairie.
		// ========================================================

		var firstGuid =
			library1.PackageGUID;


		var library2 =
			addin.analysisStructureSynchronizer
				._ensureLibrary(
					testPackage
				);


		if (!library2)
		{
			return this._testResult(
				testName,
				false,
				"Deuxième synchronisation impossible"
			);
		}


		var sameLibrary =
			addin.utils.equalsIgnoreCase(
				firstGuid,
				library2.PackageGUID
			);


		addin.logger.info(
			"TEST ensureLibrary"
			+ " | FirstGUID=" + firstGuid
			+ " | SecondGUID=" + library2.PackageGUID
			+ " | SameLibrary=" + sameLibrary
		);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			structureValid &&
			sameLibrary;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Structure technique valide"
				+ " | Idempotence=true"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | StructureValid=" + structureValid
				+ " | SameLibrary=" + sameLibrary
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Librairie technique invalide"
		);
	},
		
	ensureArtifactOnDiagram: function()
	{
		var testName =
			"ensureArtifactOnDiagram";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		// ========================================================
		// PACKAGE
		// ========================================================

		var testPackage =
			this._createFreshPackage(
				this.packageEnsureArtifactOnDiagram
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// ARTEFACT
		// ========================================================

		var artifact =
			testPackage.Elements.AddNew(
				"TEST - Artefact diagramme",
				"Class"
			);


		if (
			!artifact ||
			!artifact.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Artefact de test non créé"
			);
		}


		testPackage.Elements.Refresh();


		// ========================================================
		// DIAGRAMME
		// ========================================================

		var diagram =
			testPackage.Diagrams.AddNew(
				"TEST - Diagramme",
				"Logical"
			);


		if (
			!diagram ||
			!diagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme de test non créé"
			);
		}


		testPackage.Diagrams.Refresh();


		addin.logger.info(
			"TEST ensureArtifactOnDiagram"
			+ " | Diagram=" + diagram.Name
			+ " | Artifact=" + artifact.Name
			+ " | Before=" + diagram.DiagramObjects.Count
		);


		// ========================================================
		// PREMIER AJOUT
		// ========================================================

		var result1 =
			addin.analysisStructureSynchronizer
				._ensureArtifactOnDiagram(
					diagram,
					artifact
				);


		diagram.DiagramObjects.Refresh();


		var countAfterFirst =
			diagram.DiagramObjects.Count;


		addin.logger.info(
			"TEST ensureArtifactOnDiagram"
			+ " | FirstResult=" + result1
			+ " | Count=" + countAfterFirst
		);


		// ========================================================
		// SECOND AJOUT
		//
		// Doit retrouver l'artefact existant et ne pas créer
		// un deuxième DiagramObject.
		// ========================================================

		var result2 =
			addin.analysisStructureSynchronizer
				._ensureArtifactOnDiagram(
					diagram,
					artifact
				);


		diagram.DiagramObjects.Refresh();


		var countAfterSecond =
			diagram.DiagramObjects.Count;


		// ========================================================
		// VERIFICATION ELEMENT ID
		// ========================================================

		var found =
			false;


		for (
			var i = 0;
			i < diagram.DiagramObjects.Count;
			i++
		)
		{
			var diagramObject =
				diagram.DiagramObjects.GetAt(i);


			if (
				diagramObject.ElementID ==
				artifact.ElementID
			)
			{
				found = true;
				break;
			}
		}


		addin.logger.info(
			"TEST ensureArtifactOnDiagram"
			+ " | SecondResult=" + result2
			+ " | Count=" + countAfterSecond
			+ " | Found=" + found
		);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			result1 &&
			result2 &&
			countAfterFirst == 1 &&
			countAfterSecond == 1 &&
			found;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Ajout=true"
				+ " | Idempotence=true"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | FirstResult=" + result1
				+ " | SecondResult=" + result2
				+ " | FirstCount=" + countAfterFirst
				+ " | SecondCount=" + countAfterSecond
				+ " | Found=" + found
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Ajout de l'artefact au diagramme invalide"
		);
	},
		
	resolveDiagramType: function()
	{
		var testName =
			"resolveDiagramType";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		// ========================================================
		// TYPE PAR DEFAUT
		// ========================================================

		var defaultType =
			addin.analysisStructureSynchronizer
				._getDefaultDiagramType(
					null
				);


		addin.logger.info(
			"TEST resolveDiagramType"
			+ " | DefaultType=" + defaultType
		);


		if (
			addin.utils.isEmpty(
				defaultType
			)
		)
		{
			return this._testResult(
				testName,
				false,
				"DEFAULT_ANALYSIS_DIAGRAM_TYPE vide"
			);
		}


		// ========================================================
		// CAS 1 : AUCUNE DEFINITION
		// ========================================================

		var typeWithoutDefinition =
			addin.analysisStructureSynchronizer
				._resolveDiagramType(
					null
				);


		// ========================================================
		// PACKAGE DE TEST
		// ========================================================

		var testPackage =
			this._createFreshPackage(
				this.packageResolveDiagramType
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// ELEMENT DE DEFINITION DE TEST
		// ========================================================

		var definitionElement =
			testPackage.Elements.AddNew(
				"TEST - Analysis Definition",
				"Class"
			);


		if (
			!definitionElement ||
			!definitionElement.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Élément de définition non créé"
			);
		}


		testPackage.Elements.Refresh();


		var analysisDefinition =
		{
			name:
				"TEST - Analysis Definition",

			element:
				definitionElement
		};


		// ========================================================
		// CAS 2 : ELEMENT SANS TAG
		// ========================================================

		var typeWithoutTag =
			addin.analysisStructureSynchronizer
				._resolveDiagramType(
					analysisDefinition
				);


		// ========================================================
		// CAS 3 : ELEMENT AVEC TAG
		// ========================================================

		var customType =
			"Use Case";


		var tagResult =
			addin.repositoryService
				.setTaggedValue(
					definitionElement,
					addin.fbaConstants.TAG_DIAGRAM_TYPE,
					customType
				);


		if (!tagResult)
		{
			return this._testResult(
				testName,
				false,
				"Impossible de créer TAG_DIAGRAM_TYPE"
			);
		}


		var typeWithTag =
			addin.analysisStructureSynchronizer
				._resolveDiagramType(
					analysisDefinition
				);


		// ========================================================
		// VERIFICATION
		// ========================================================

		var validWithoutDefinition =
			addin.utils.equalsIgnoreCase(
				typeWithoutDefinition,
				defaultType
			);


		var validWithoutTag =
			addin.utils.equalsIgnoreCase(
				typeWithoutTag,
				defaultType
			);


		var validWithTag =
			addin.utils.equalsIgnoreCase(
				typeWithTag,
				customType
			);


		addin.logger.info(
			"TEST resolveDiagramType"
			+ " | Null=" + typeWithoutDefinition
			+ " | NoTag=" + typeWithoutTag
			+ " | WithTag=" + typeWithTag
		);


		addin.logger.info(
			"TEST resolveDiagramType"
			+ " | NullOK=" + validWithoutDefinition
			+ " | NoTagOK=" + validWithoutTag
			+ " | WithTagOK=" + validWithTag
		);


		var valid =
			validWithoutDefinition &&
			validWithoutTag &&
			validWithTag;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Default=" + defaultType
				+ " | Custom=" + customType
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Résolution du type de diagramme invalide"
		);
	},
		
	ensureAnalysisDiagram: function()
	{
		var testName =
			"ensureAnalysisDiagram";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		// ========================================================
		// PACKAGE
		// ========================================================

		var testPackage =
			this._createFreshPackage(
				this.packageEnsureAnalysisDiagram
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// ELEMENT DE DEFINITION
		// ========================================================

		var definitionElement =
			testPackage.Elements.AddNew(
				"TEST - Definition Diagram",
				"Class"
			);


		if (
			!definitionElement ||
			!definitionElement.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Élément de définition non créé"
			);
		}


		testPackage.Elements.Refresh();


		// Nous imposons un type différent du défaut.
		// Cela vérifie également l'intégration avec
		// _resolveDiagramType().

		var expectedType =
			"Use Case";


		var tagResult =
			addin.repositoryService
				.setTaggedValue(
					definitionElement,
					addin.fbaConstants.TAG_DIAGRAM_TYPE,
					expectedType
				);


		if (!tagResult)
		{
			return this._testResult(
				testName,
				false,
				"Impossible de définir TAG_DIAGRAM_TYPE"
			);
		}


		var analysisDefinition =
		{
			name:
				"TEST - Diagramme Analyse",

			element:
				definitionElement
		};


		// ========================================================
		// PREMIERE EXECUTION
		// ========================================================

		var beforeCount =
			testPackage.Diagrams.Count;


		var diagram1 =
			addin.analysisStructureSynchronizer
				._ensureAnalysisDiagram(
					testPackage,
					analysisDefinition
				);


		testPackage.Diagrams.Refresh();


		var afterFirstCount =
			testPackage.Diagrams.Count;


		if (!diagram1)
		{
			return this._testResult(
				testName,
				false,
				"_ensureAnalysisDiagram retourne null"
			);
		}


		var firstGuid =
			diagram1.DiagramGUID;


		addin.logger.info(
			"TEST ensureAnalysisDiagram"
			+ " | Before=" + beforeCount
			+ " | AfterFirst=" + afterFirstCount
			+ " | Name=" + diagram1.Name
			+ " | Type=" + diagram1.Type
			+ " | GUID=" + firstGuid
		);


		// ========================================================
		// DEUXIEME EXECUTION
		//
		// Le même diagramme doit être retrouvé.
		// ========================================================

		var diagram2 =
			addin.analysisStructureSynchronizer
				._ensureAnalysisDiagram(
					testPackage,
					analysisDefinition
				);


		testPackage.Diagrams.Refresh();


		var afterSecondCount =
			testPackage.Diagrams.Count;


		if (!diagram2)
		{
			return this._testResult(
				testName,
				false,
				"Deuxième appel retourne null"
			);
		}


		var sameDiagram =
			addin.utils.equalsIgnoreCase(
				firstGuid,
				diagram2.DiagramGUID
			);


		var nameValid =
			addin.utils.equalsIgnoreCase(
				diagram1.Name,
				analysisDefinition.name
			);


		var typeValid =
			addin.utils.equalsIgnoreCase(
				diagram1.Type,
				expectedType
			);


		var countValid =
			beforeCount == 0 &&
			afterFirstCount == 1 &&
			afterSecondCount == 1;


		addin.logger.info(
			"TEST ensureAnalysisDiagram"
			+ " | AfterSecond=" + afterSecondCount
			+ " | SameDiagram=" + sameDiagram
			+ " | NameOK=" + nameValid
			+ " | TypeOK=" + typeValid
			+ " | CountOK=" + countValid
		);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			sameDiagram &&
			nameValid &&
			typeValid &&
			countValid;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Création=true"
				+ " | Type=" + expectedType
				+ " | Idempotence=true"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Synchronisation du diagramme d'analyse invalide"
		);
	},
		
	loadDefinitions: function()
	{
		var testName =
			"loadDefinitions";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var definitions =
			addin.analysisStructureSynchronizer
				.loadDefinitions();


		var count =
			definitions
				? definitions.length
				: 0;


		addin.logger.info(
			"TEST loadDefinitions"
			+ " | Definitions=" + count
		);


		var valid =
			definitions &&
			count == 29;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Definitions=" + count
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
				+ " | Definitions=" + count
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Nombre de définitions inattendu"
		);
	},
		
	
	loadDiagramConfigs: function()
	{
		var testName =
			"loadDiagramConfigs";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageLoadDiagramConfigs
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// CONFIG 1
		// ========================================================

		var config1 =
			testPackage.Elements.AddNew(
				"Config principale",
				"Class"
			);


		if (
			!config1 ||
			!config1.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Config 1 non créée"
			);
		}


		addin.repositoryService.setTaggedValue(
			config1,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			addin.fbaConstants.ROLE_DIAGRAM_CONFIG
		);


		addin.repositoryService.setTaggedValue(
			config1,
			addin.fbaConstants.TAG_IMPORTANT_LEVEL,
			"Obligatoire"
		);


		addin.repositoryService.setTaggedValue(
			config1,
			addin.fbaConstants.TAG_DIAGRAM_CONFIG_PRIORITY,
			"10"
		);


		addin.repositoryService.setTaggedValue(
			config1,
			addin.fbaConstants.TAG_DIAGRAM_CONFIG_DEFAULT,
			"true"
		);


		addin.repositoryService.setTaggedValue(
			config1,
			addin.fbaConstants.TAG_DIAGRAM_DEFAULT_NAME,
			"Vue principale"
		);


		addin.repositoryService.setTaggedValue(
			config1,
			addin.fbaConstants.TAG_DIAGRAM_NAME_PREFIX,
			"VUE"
		);


		// ========================================================
		// CONFIG 2
		//
		// Priorité volontairement invalide :
		// le résultat attendu est 0.
		// ========================================================

		var config2 =
			testPackage.Elements.AddNew(
				"Config secondaire",
				"Class"
			);


		if (
			!config2 ||
			!config2.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Config 2 non créée"
			);
		}


		addin.repositoryService.setTaggedValue(
			config2,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			addin.fbaConstants.ROLE_DIAGRAM_CONFIG
		);


		addin.repositoryService.setTaggedValue(
			config2,
			addin.fbaConstants.TAG_DIAGRAM_CONFIG_PRIORITY,
			"ABC"
		);


		addin.repositoryService.setTaggedValue(
			config2,
			addin.fbaConstants.TAG_DIAGRAM_CONFIG_DEFAULT,
			"false"
		);


		// ========================================================
		// ELEMENT NORMAL
		//
		// Il sera placé sur le diagramme mais doit être ignoré.
		// ========================================================

		var normalElement =
			testPackage.Elements.AddNew(
				"Artefact normal",
				"Class"
			);


		if (
			!normalElement ||
			!normalElement.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Élément normal non créé"
			);
		}


		testPackage.Elements.Refresh();


		// ========================================================
		// TEST _isDiagramConfig
		// ========================================================

		var configDetected =
			addin.analysisStructureSynchronizer
				._isDiagramConfig(
					config1
				);


		var normalRejected =
			!addin.analysisStructureSynchronizer
				._isDiagramConfig(
					normalElement
				);


		// ========================================================
		// DIAGRAMME
		// ========================================================

		var diagram =
			testPackage.Diagrams.AddNew(
				"TEST - Diagram Configs",
				"Logical"
			);


		if (
			!diagram ||
			!diagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme non créé"
			);
		}


		testPackage.Diagrams.Refresh();


		// Les trois éléments sont placés sur le diagramme.

		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				diagram,
				config1
			);


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				diagram,
				config2
			);


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				diagram,
				normalElement
			);


		// ========================================================
		// CHARGEMENT
		// ========================================================

		var configs =
			addin.analysisStructureSynchronizer
				._loadDiagramConfigs(
					diagram
				);


		var count =
			configs
				? configs.length
				: 0;


		addin.logger.info(
			"TEST loadDiagramConfigs"
			+ " | DiagramObjects=" + diagram.DiagramObjects.Count
			+ " | Configs=" + count
			+ " | ConfigDetected=" + configDetected
			+ " | NormalRejected=" + normalRejected
		);


		// ========================================================
		// CONTROLE DU CONTENU
		// ========================================================

		var config1Valid = false;
		var config2Valid = false;


		for (
			var i = 0;
			i < count;
			i++
		)
		{
			var config =
				configs[i];


			addin.logger.info(
				"TEST DiagramConfig"
				+ " | Name=" + config.name
				+ " | Priority=" + config.priority
				+ " | Default=" + config.isDefault
				+ " | DefaultName=" + config.defaultName
				+ " | Prefix=" + config.namePrefix
				+ " | Importance=" + config.importanceLevel
			);


			if (
				addin.utils.equalsIgnoreCase(
					config.guid,
					config1.ElementGUID
				)
			)
			{
				config1Valid =
					config.priority == 10 &&
					config.isDefault === true &&
					config.defaultName == "Vue principale" &&
					config.namePrefix == "VUE" &&
					config.importanceLevel == "Obligatoire";
			}


			if (
				addin.utils.equalsIgnoreCase(
					config.guid,
					config2.ElementGUID
				)
			)
			{
				config2Valid =
					config.priority == 0 &&
					config.isDefault === false;
			}
		}


		var valid =
			configDetected &&
			normalRejected &&
			count == 2 &&
			config1Valid &&
			config2Valid;


		addin.logger.info(
			"TEST loadDiagramConfigs"
			+ " | Config1OK=" + config1Valid
			+ " | Config2OK=" + config2Valid
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Configs=2"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Chargement des configurations de diagramme invalide"
		);
	},		
	
	
	loadDiagramArtifactDefinitions: function()
	{
		var testName =
			"loadDiagramArtifactDefinitions";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageLoadDiagramArtifactDefinitions
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// DIAGRAM CONFIG
		// ========================================================

		var config =
			testPackage.Elements.AddNew(
				"Config diagramme",
				"Class"
			);


		if (
			!config ||
			!config.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagram_Config non créé"
			);
		}


		addin.repositoryService.setTaggedValue(
			config,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			addin.fbaConstants.ROLE_DIAGRAM_CONFIG
		);


		// ========================================================
		// ARTEFACT 1
		// ========================================================

		var requirement =
			testPackage.Elements.AddNew(
				"Prototype besoin",
				"Requirement"
			);


		if (!requirement)
		{
			return this._testResult(
				testName,
				false,
				"Requirement non créé"
			);
		}


		requirement.StereotypeEx =
			"LABN_Requirement";


		if (!requirement.Update())
		{
			return this._testResult(
				testName,
				false,
				"Requirement non sauvegardé"
			);
		}


		// ========================================================
		// ARTEFACT 2
		// ========================================================

		var classElement =
			testPackage.Elements.AddNew(
				"Prototype métier",
				"Class"
			);


		if (!classElement)
		{
			return this._testResult(
				testName,
				false,
				"Class non créée"
			);
		}

		if (!classElement.Update())
		{
			return this._testResult(
				testName,
				false,
				"Class non sauvegardée"
			);
		}


		testPackage.Elements.Refresh();


		// ========================================================
		// DIAGRAMME
		// ========================================================

		var diagram =
			testPackage.Diagrams.AddNew(
				"TEST - Diagram Artifact Definitions",
				"Logical"
			);


		if (
			!diagram ||
			!diagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme non créé"
			);
		}


		testPackage.Diagrams.Refresh();


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				diagram,
				config
			);


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				diagram,
				requirement
			);


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				diagram,
				classElement
			);


		diagram.DiagramObjects.Refresh();


		// ========================================================
		// CHARGEMENT
		// ========================================================

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDiagramArtifactDefinitions(
					diagram
				);


		var count =
			definitions
				? definitions.length
				: 0;


		var requirementValid = false;
		var classValid = false;
		var configFound = false;


		for (
			var i = 0;
			i < count;
			i++
		)
		{
			var definition =
				definitions[i];


			addin.logger.info(
				"TEST DiagramArtifactDefinition"
				+ " | Name=" + definition.name
				+ " | Type=" + definition.type
				+ " | Stereo=" + definition.stereotype
				+ " | GUID=" + definition.guid
			);


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					config.ElementGUID
				)
			)
			{
				configFound = true;
			}


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					requirement.ElementGUID
				)
			)
			{
				requirementValid =
					definition.name == "Prototype besoin" &&
					definition.type == "Requirement" &&
					definition.stereotype == "LABN_Requirement";
			}


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					classElement.ElementGUID
				)
			)
			{
				classValid =
					definition.name == "Prototype métier" &&
					definition.type == "Class" &&
					definition.stereotype == "";
			}
		}


		var valid =
			diagram.DiagramObjects.Count == 3 &&
			count == 2 &&
			!configFound &&
			requirementValid &&
			classValid;


		addin.logger.info(
			"TEST loadDiagramArtifactDefinitions"
			+ " | DiagramObjects=" + diagram.DiagramObjects.Count
			+ " | Definitions=" + count
			+ " | ConfigExcluded=" + (!configFound)
			+ " | RequirementOK=" + requirementValid
			+ " | ClassOK=" + classValid
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Definitions=2"
				+ " | DiagramConfigExcluded=true"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Chargement des artefacts du diagramme invalide"
		);
	},
		
		
	loadDiagramDefinitions: function()
	{
		var testName =
			"loadDiagramDefinitions";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageLoadDiagramDefinitions
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// ELEMENT SOURCE
		// ========================================================

		var sourceElement =
			testPackage.Elements.AddNew(
				"Prototype analyse",
				"Class"
			);


		if (
			!sourceElement ||
			!sourceElement.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Élément source non créé"
			);
		}


		testPackage.Elements.Refresh();


		// ========================================================
		// CONFIGURATION
		// ========================================================

		var config =
			testPackage.Elements.AddNew(
				"Config diagramme",
				"Class"
			);


		if (
			!config ||
			!config.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagram_Config non créé"
			);
		}


		addin.repositoryService.setTaggedValue(
			config,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			addin.fbaConstants.ROLE_DIAGRAM_CONFIG
		);


		addin.repositoryService.setTaggedValue(
			config,
			addin.fbaConstants.TAG_IMPORTANT_LEVEL,
			"Obligatoire"
		);


		addin.repositoryService.setTaggedValue(
			config,
			addin.fbaConstants.TAG_DIAGRAM_CONFIG_PRIORITY,
			"10"
		);


		testPackage.Elements.Refresh();


		// ========================================================
		// 1. DIAGRAMME VALIDE
		// ========================================================

		var validDiagram =
			sourceElement.Diagrams.AddNew(
				"Diagramme valide",
				"Logical"
			);


		if (
			!validDiagram ||
			!validDiagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme valide non créé"
			);
		}


		sourceElement.Diagrams.Refresh();


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				validDiagram,
				config
			);


		// ========================================================
		// 2. DIAGRAMME SANS CONFIG
		// ========================================================

		var noConfigDiagram =
			sourceElement.Diagrams.AddNew(
				"Diagramme sans config",
				"Logical"
			);


		if (
			!noConfigDiagram ||
			!noConfigDiagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme sans config non créé"
			);
		}


		// ========================================================
		// 3. DIAGRAMME TECHNIQUE
		// ========================================================

		var technicalDiagram =
			sourceElement.Diagrams.AddNew(
				"_Diagramme technique",
				"Logical"
			);


		if (
			!technicalDiagram ||
			!technicalDiagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme technique non créé"
			);
		}


		sourceElement.Diagrams.Refresh();


		addin.analysisStructureSynchronizer
			._ensureArtifactOnDiagram(
				technicalDiagram,
				config
			);


		// ========================================================
		// CHARGEMENT
		// ========================================================

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDiagramDefinitions(
					sourceElement
				);


		var count =
			definitions
				? definitions.length
				: 0;


		var validDefinition = false;
		var technicalFound = false;
		var noConfigFound = false;


		for (
			var i = 0;
			i < count;
			i++
		)
		{
			var definition =
				definitions[i];


			addin.logger.info(
				"TEST DiagramDefinition"
				+ " | Name=" + definition.name
				+ " | Type=" + definition.type
				+ " | MetaType=" + definition.metaType
				+ " | Configs=" + definition.configs.length
				+ " | GUID=" + definition.guid
			);


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					validDiagram.DiagramGUID
				)
			)
			{
				validDefinition =
					definition.name == "Diagramme valide" &&
					definition.configs.length == 1;
			}


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					technicalDiagram.DiagramGUID
				)
			)
			{
				technicalFound = true;
			}


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					noConfigDiagram.DiagramGUID
				)
			)
			{
				noConfigFound = true;
			}
		}


		var valid =
			sourceElement.Diagrams.Count == 3 &&
			count == 1 &&
			validDefinition &&
			!technicalFound &&
			!noConfigFound;


		addin.logger.info(
			"TEST loadDiagramDefinitions"
			+ " | SourceDiagrams=" + sourceElement.Diagrams.Count
			+ " | Definitions=" + count
			+ " | ValidDiagramOK=" + validDefinition
			+ " | TechnicalExcluded=" + (!technicalFound)
			+ " | NoConfigExcluded=" + (!noConfigFound)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
				+ " | Definitions=1"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Chargement des définitions de diagrammes invalide"
		);
	},
		
	isDiagramRequired: function()
	{
		var testName =
			"isDiagramRequired";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// 1. NULL
		// ========================================================

		var nullResult =
			synchronizer._isDiagramRequired(
				null
			);


		// ========================================================
		// 2. SANS CONFIGS
		// ========================================================

		var noConfigsResult =
			synchronizer._isDiagramRequired(
				{
					name:
						"Sans configs"
				}
			);


		// ========================================================
		// 3. CONFIGS VIDES
		// ========================================================

		var emptyConfigsResult =
			synchronizer._isDiagramRequired(
				{
					name:
						"Configs vides",

					configs:
						[]
				}
			);


		// ========================================================
		// 4. RECOMMANDE
		// ========================================================

		var recommendedResult =
			synchronizer._isDiagramRequired(
				{
					name:
						"Recommandé",

					configs:
					[
						{
							importanceLevel:
								"Recommandé"
						}
					]
				}
			);


		// ========================================================
		// 5. OBLIGATOIRE
		// ========================================================

		var requiredResult =
			synchronizer._isDiagramRequired(
				{
					name:
						"Obligatoire",

					configs:
					[
						{
							importanceLevel:
								"Obligatoire"
						}
					]
				}
			);


		// ========================================================
		// 6. PLUSIEURS CONFIGS
		//
		// Une seule obligatoire suffit.
		// ========================================================

		var multipleResult =
			synchronizer._isDiagramRequired(
				{
					name:
						"Multiple",

					configs:
					[
						{
							importanceLevel:
								"Optionnel"
						},

						{
							importanceLevel:
								"Recommandé"
						},

						{
							importanceLevel:
								"Obligatoire"
						}
					]
				}
			);


		// ========================================================
		// 7. CASSE
		//
		// equalsIgnoreCase doit reconnaître la valeur.
		// ========================================================

		var caseInsensitiveResult =
			synchronizer._isDiagramRequired(
				{
					name:
						"Casse",

					configs:
					[
						{
							importanceLevel:
								"obligatoire"
						}
					]
				}
			);


		var valid =
			nullResult === false &&
			noConfigsResult === false &&
			emptyConfigsResult === false &&
			recommendedResult === false &&
			requiredResult === true &&
			multipleResult === true &&
			caseInsensitiveResult === true;


		addin.logger.info(
			"TEST isDiagramRequired"
			+ " | Null=" + nullResult
			+ " | NoConfigs=" + noConfigsResult
			+ " | Empty=" + emptyConfigsResult
			+ " | Recommended=" + recommendedResult
			+ " | Required=" + requiredResult
			+ " | Multiple=" + multipleResult
			+ " | CaseInsensitive=" + caseInsensitiveResult
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Détermination du caractère obligatoire invalide"
		);
	},
		
	resolveEffectiveDiagramConfig: function()
	{
		var testName =
			"resolveEffectiveDiagramConfig";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// 1. CAS INVALIDES
		// ========================================================

		var nullResult =
			synchronizer._resolveEffectiveDiagramConfig(
				null
			);


		var noConfigsResult =
			synchronizer._resolveEffectiveDiagramConfig(
				{
					name:
						"Sans configs"
				}
			);


		var emptyResult =
			synchronizer._resolveEffectiveDiagramConfig(
				{
					name:
						"Configs vides",

					configs:
						[]
				}
			);


		// ========================================================
		// 2. FUSION DE PLUSIEURS CONFIGURATIONS
		// ========================================================

		var diagramDefinition =
		{
			name:
				"Diagramme test",

			configs:
			[
				{
					guid:
						"{CONFIG-A}",

					name:
						"Config A",

					priority:
						10,

					importanceLevel:
						"Recommandé",

					defaultName:
						"",

					namePrefix:
						"OLD"
				},

				{
					guid:
						"{CONFIG-B}",

					name:
						"Config B",

					priority:
						20,

					importanceLevel:
						"",

					defaultName:
						"Processus",

					namePrefix:
						""
				},

				{
					guid:
						"{CONFIG-C}",

					name:
						"Config C",

					priority:
						30,

					importanceLevel:
						"Obligatoire",

					defaultName:
						"",

					namePrefix:
						""
				}
			]
		};


		var effective =
			synchronizer._resolveEffectiveDiagramConfig(
				diagramDefinition
			);


		var effectiveValid =
			effective &&
			effective.importanceLevel == "Obligatoire" &&
			effective.defaultName == "Processus" &&
			effective.namePrefix == "OLD" &&
			effective.priority == 30 &&
			effective.sourceConfigGuid == "{CONFIG-C}" &&
			effective.sourceConfigName == "Config C";


		// ========================================================
		// 3. PRIORITE NON NUMERIQUE
		//
		// Le source la transforme en 0.
		// ========================================================

		var invalidPriority =
			synchronizer._resolveEffectiveDiagramConfig(
				{
					name:
						"Priorité invalide",

					configs:
					[
						{
							guid:
								"{CONFIG-X}",

							name:
								"Config X",

							priority:
								"ABC",

							importanceLevel:
								"Optionnel",

							defaultName:
								"Test",

							namePrefix:
								"TST"
						}
					]
				}
			);


		var invalidPriorityValid =
			invalidPriority &&
			invalidPriority.priority == 0 &&
			invalidPriority.importanceLevel == "Optionnel" &&
			invalidPriority.defaultName == "Test" &&
			invalidPriority.namePrefix == "TST" &&
			invalidPriority.sourceConfigGuid == "{CONFIG-X}" &&
			invalidPriority.sourceConfigName == "Config X";


		var valid =
			nullResult === null &&
			noConfigsResult === null &&
			emptyResult === null &&
			effectiveValid &&
			invalidPriorityValid;


		addin.logger.info(
			"TEST resolveEffectiveDiagramConfig"
			+ " | Null=" + (nullResult === null)
			+ " | NoConfigs=" + (noConfigsResult === null)
			+ " | Empty=" + (emptyResult === null)
		);


		if (effective)
		{
			addin.logger.info(
				"TEST EffectiveConfig"
				+ " | Importance=" + effective.importanceLevel
				+ " | DefaultName=" + effective.defaultName
				+ " | Prefix=" + effective.namePrefix
				+ " | Priority=" + effective.priority
				+ " | Source=" + effective.sourceConfigName
			);
		}


		addin.logger.info(
			"TEST resolveEffectiveDiagramConfig"
			+ " | EffectiveOK=" + effectiveValid
			+ " | InvalidPriorityOK=" + invalidPriorityValid
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Résolution de la configuration effective invalide"
		);
	},
		
	buildGeneratedDiagramName: function()
	{
		var testName =
			"buildGeneratedDiagramName";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// CAS DE TEST
		// ========================================================

		var nullResult =
			synchronizer._buildGeneratedDiagramName(
				null
			);


		var emptyResult =
			synchronizer._buildGeneratedDiagramName(
				{
					namePrefix: "",
					defaultName: ""
				}
			);


		var prefixOnlyResult =
			synchronizer._buildGeneratedDiagramName(
				{
					namePrefix: "IAD",
					defaultName: ""
				}
			);


		var nameOnlyResult =
			synchronizer._buildGeneratedDiagramName(
				{
					namePrefix: "",
					defaultName: "Risques"
				}
			);


		var completeResult =
			synchronizer._buildGeneratedDiagramName(
				{
					namePrefix: "IAD",
					defaultName: "Risques"
				}
			);


		// Vérifie également le trim du source.

		var trimResult =
			synchronizer._buildGeneratedDiagramName(
				{
					namePrefix: "  PRO  ",
					defaultName: "  Processus  "
				}
			);


		var valid =
			nullResult == "" &&
			emptyResult == "" &&
			prefixOnlyResult == "IAD" &&
			nameOnlyResult == "Risques" &&
			completeResult == "IAD Risques" &&
			trimResult == "PRO Processus";


		addin.logger.info(
			"TEST buildGeneratedDiagramName"
			+ " | Null=[" + nullResult + "]"
			+ " | Empty=[" + emptyResult + "]"
			+ " | PrefixOnly=[" + prefixOnlyResult + "]"
			+ " | NameOnly=[" + nameOnlyResult + "]"
			+ " | Complete=[" + completeResult + "]"
			+ " | Trim=[" + trimResult + "]"
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Construction du nom de diagramme invalide"
		);
	},
		
	isRequiredDiagram: function()
	{
		var testName =
			"isRequiredDiagram";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var synchronizer =
			addin.analysisStructureSynchronizer;


		var nullResult =
			synchronizer._isRequiredDiagram(
				null
			);


		var emptyResult =
			synchronizer._isRequiredDiagram(
				{
					importanceLevel:
						""
				}
			);


		var optionalResult =
			synchronizer._isRequiredDiagram(
				{
					importanceLevel:
						"Optionnel"
				}
			);


		var recommendedResult =
			synchronizer._isRequiredDiagram(
				{
					importanceLevel:
						"Recommandé"
				}
			);


		var requiredResult =
			synchronizer._isRequiredDiagram(
				{
					importanceLevel:
						"Obligatoire"
				}
			);


		// Vérifie equalsIgnoreCase.

		var caseInsensitiveResult =
			synchronizer._isRequiredDiagram(
				{
					importanceLevel:
						"obligatoire"
				}
			);


		var valid =
			nullResult === false &&
			emptyResult === false &&
			optionalResult === false &&
			recommendedResult === false &&
			requiredResult === true &&
			caseInsensitiveResult === true;


		addin.logger.info(
			"TEST isRequiredDiagram"
			+ " | Null=" + nullResult
			+ " | Empty=" + emptyResult
			+ " | Optional=" + optionalResult
			+ " | Recommended=" + recommendedResult
			+ " | Required=" + requiredResult
			+ " | CaseInsensitive=" + caseInsensitiveResult
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Détermination du diagramme obligatoire invalide"
		);
	},
		
	findDiagramByName: function()
	{
		var testName =
			"findDiagramByName";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageFindDiagramByName
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// CREATION DES DIAGRAMMES
		// ========================================================

		var diagram1 =
			testPackage.Diagrams.AddNew(
				"IAD Risques",
				"Logical"
			);


		if (
			!diagram1 ||
			!diagram1.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme 1 non créé"
			);
		}


		var diagram2 =
			testPackage.Diagrams.AddNew(
				"PRO Processus",
				"Logical"
			);


		if (
			!diagram2 ||
			!diagram2.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme 2 non créé"
			);
		}


		testPackage.Diagrams.Refresh();


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// CAS INVALIDES
		// ========================================================

		var nullPackageResult =
			synchronizer._findDiagramByName(
				null,
				"IAD Risques"
			);


		var emptyNameResult =
			synchronizer._findDiagramByName(
				testPackage,
				""
			);


		// ========================================================
		// RECHERCHE EXACTE
		// ========================================================

		var exactResult =
			synchronizer._findDiagramByName(
				testPackage,
				"IAD Risques"
			);


		// ========================================================
		// RECHERCHE INSENSIBLE A LA CASSE
		// ========================================================

		var caseResult =
			synchronizer._findDiagramByName(
				testPackage,
				"iad risques"
			);


		// ========================================================
		// DIAGRAMME INEXISTANT
		// ========================================================

		var notFoundResult =
			synchronizer._findDiagramByName(
				testPackage,
				"Diagramme inexistant"
			);


		var exactValid =
			exactResult &&
			addin.utils.equalsIgnoreCase(
				exactResult.DiagramGUID,
				diagram1.DiagramGUID
			);


		var caseValid =
			caseResult &&
			addin.utils.equalsIgnoreCase(
				caseResult.DiagramGUID,
				diagram1.DiagramGUID
			);


		var valid =
			nullPackageResult === null &&
			emptyNameResult === null &&
			exactValid &&
			caseValid &&
			notFoundResult === null;


		addin.logger.info(
			"TEST findDiagramByName"
			+ " | NullPackage=" + (nullPackageResult === null)
			+ " | EmptyName=" + (emptyNameResult === null)
			+ " | Exact=" + exactValid
			+ " | CaseInsensitive=" + caseValid
			+ " | NotFound=" + (notFoundResult === null)
		);


		if (exactResult)
		{
			addin.logger.info(
				"TEST DiagramFound"
				+ " | Name=" + exactResult.Name
				+ " | GUID=" + exactResult.DiagramGUID
			);
		}


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Recherche du diagramme par nom invalide"
		);
	},
		
	findDiagramsByMetaType: function()
	{
		var testName =
			"findDiagramsByMetaType";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var testPackage =
			this._createFreshPackage(
				this.packageFindDiagramsByMetaType
			);


		if (!testPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package de test non créé"
			);
		}


		// ========================================================
		// RECUPERATION D'UN VRAI METATYPE DU METAMODELE
		// ========================================================

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();


		var targetMetaType =
			"";


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var definition =
				definitions[i];


			if (
				!definition ||
				!definition.element
			)
			{
				continue;
			}


			var diagrams =
				definition.element.Diagrams;


			for (
				var j = 0;
				j < diagrams.Count;
				j++
			)
			{
				var sourceDiagram =
					diagrams.GetAt(j);


				if (
					sourceDiagram &&
					!addin.utils.isEmpty(
						sourceDiagram.MetaType
					) &&
					addin.utils.startsWith(
						sourceDiagram.MetaType,
						"Labnaf"
					)
				)
				{
					targetMetaType =
						sourceDiagram.MetaType;

					break;
				}
			}


			if (
				!addin.utils.isEmpty(
					targetMetaType
				)
			)
			{
				break;
			}
		}


		if (
			addin.utils.isEmpty(
				targetMetaType
			)
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucun MetaType LABNAF trouvé"
			);
		}


		addin.logger.info(
			"TEST MetaType"
			+ " | MetaType=[" + targetMetaType + "]"
		);


		// ========================================================
		// CREATION DES DIAGRAMMES
		// ========================================================

		var diagram1 =
			testPackage.Diagrams.AddNew(
				"Diagramme MetaType 1",
				targetMetaType
			);


		if (
			!diagram1 ||
			!diagram1.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme 1 non créé"
			);
		}


		var diagram2 =
			testPackage.Diagrams.AddNew(
				"Diagramme MetaType 2",
				targetMetaType
			);


		if (
			!diagram2 ||
			!diagram2.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme 2 non créé"
			);
		}


		testPackage.Diagrams.Refresh();


		addin.logger.info(
			"TEST Created"
			+ " | Diagram1 MetaType=[" + diagram1.MetaType + "]"
			+ " | Diagram2 MetaType=[" + diagram2.MetaType + "]"
		);


		// ========================================================
		// RECHERCHE
		// ========================================================

		var synchronizer =
			addin.analysisStructureSynchronizer;


		var nullPackage =
			synchronizer._findDiagramsByMetaType(
				null,
				targetMetaType
			);


		var emptyMetaType =
			synchronizer._findDiagramsByMetaType(
				testPackage,
				""
			);


		var found =
			synchronizer._findDiagramsByMetaType(
				testPackage,
				targetMetaType
			);


		var foundCount =
			found
				? found.length
				: 0;


		var diagram1Found =
			false;

		var diagram2Found =
			false;


		for (
			var k = 0;
			k < foundCount;
			k++
		)
		{
			var foundDiagram =
				found[k];


			if (
				addin.utils.equalsIgnoreCase(
					foundDiagram.DiagramGUID,
					diagram1.DiagramGUID
				)
			)
			{
				diagram1Found =
					true;
			}


			if (
				addin.utils.equalsIgnoreCase(
					foundDiagram.DiagramGUID,
					diagram2.DiagramGUID
				)
			)
			{
				diagram2Found =
					true;
			}
		}


		var valid =
			nullPackage.length == 0 &&
			emptyMetaType.length == 0 &&
			foundCount == 2 &&
			diagram1Found &&
			diagram2Found;


		addin.logger.info(
			"TEST findDiagramsByMetaType"
			+ " | NullPackage=" + (nullPackage.length == 0)
			+ " | EmptyMetaType=" + (emptyMetaType.length == 0)
			+ " | Found=" + foundCount
			+ " | Diagram1=" + diagram1Found
			+ " | Diagram2=" + diagram2Found
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Recherche par MetaType invalide"
		);
	},
		
	resolveDiagramRegistryPackage: function()
	{
		var testName =
			"resolveDiagramRegistryPackage";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageResolveDiagramRegistry
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// CAS 1 : ROOT NULL
		// ========================================================

		var nullResult =
			synchronizer
				._resolveDiagramRegistryPackage(
					null
				);


		// ========================================================
		// CAS 2 : LIBRAIRIE ABSENTE
		// ========================================================

		var noLibraryResult =
			synchronizer
				._resolveDiagramRegistryPackage(
					rootPackage
				);


		// ========================================================
		// CREATION DE LA VRAIE STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		// ========================================================
		// CAS 3 : REGISTRE PRESENT
		// ========================================================

		var registryPackage =
			synchronizer
				._resolveDiagramRegistryPackage(
					rootPackage
				);


		var registryFound =
			registryPackage !== null;


		var registryNameOK =
			registryFound &&
			addin.utils.equalsIgnoreCase(
				registryPackage.Name,
				addin.fbaConstants
					.DIAGRAM_CONFIGS_PACKAGE_NAME
			);


		var parentOK =
			registryFound &&
			registryPackage.ParentID ==
				libraryPackage.PackageID;


		addin.logger.info(
			"TEST resolveDiagramRegistryPackage"
			+ " | NullRoot=" + (nullResult === null)
			+ " | NoLibrary=" + (noLibraryResult === null)
			+ " | RegistryFound=" + registryFound
			+ " | RegistryName=" + registryNameOK
			+ " | Parent=" + parentOK
		);


		if (registryFound)
		{
			addin.logger.info(
				"TEST Registry"
				+ " | Name=" + registryPackage.Name
				+ " | GUID=" + registryPackage.PackageGUID
				+ " | ParentID=" + registryPackage.ParentID
			);
		}


		var valid =
			nullResult === null &&
			noLibraryResult === null &&
			registryFound &&
			registryNameOK &&
			parentOK;


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Résolution du registre invalide"
		);
	},
		
	findDiagramRegistryEntryByGeneratedGuid: function()
	{
		var testName =
			"findDiagramRegistryEntryByGeneratedGuid";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageFindDiagramRegistryEntry
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// CREATION DE LA STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		var registryPackage =
			synchronizer
				._resolveDiagramRegistryPackage(
					rootPackage
				);


		if (!registryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Registre non résolu"
			);
		}


		// ========================================================
		// CREATION DE DEUX ENTREES
		// ========================================================

		var guid1 =
			"{11111111-1111-1111-1111-111111111111}";

		var guid2 =
			"{22222222-2222-2222-2222-222222222222}";


		var entry1 =
			registryPackage.Elements.AddNew(
				"TEST Registry Entry 1",
				"Class"
			);


		if (
			!entry1 ||
			!entry1.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Entrée 1 non créée"
			);
		}


		addin.repositoryService.setTaggedValue(
			entry1,
			addin.fbaConstants
				.TAG_GENERATED_DIAGRAM_GUID,
			guid1
		);


		var entry2 =
			registryPackage.Elements.AddNew(
				"TEST Registry Entry 2",
				"Class"
			);


		if (
			!entry2 ||
			!entry2.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Entrée 2 non créée"
			);
		}


		addin.repositoryService.setTaggedValue(
			entry2,
			addin.fbaConstants
				.TAG_GENERATED_DIAGRAM_GUID,
			guid2
		);


		registryPackage.Elements.Refresh();


		// ========================================================
		// TESTS
		// ========================================================

		var nullPackage =
			synchronizer
				._findDiagramRegistryEntryByGeneratedGuid(
					null,
					guid1
				);


		var emptyGuid =
			synchronizer
				._findDiagramRegistryEntryByGeneratedGuid(
					registryPackage,
					""
				);


		var found1 =
			synchronizer
				._findDiagramRegistryEntryByGeneratedGuid(
					registryPackage,
					guid1
				);


		var found2 =
			synchronizer
				._findDiagramRegistryEntryByGeneratedGuid(
					registryPackage,
					guid2
				);


		// Le source utilise equalsIgnoreCase().
		// On vérifie explicitement ce comportement.
		var lowerGuid =
			guid1.toLowerCase();


		var foundCaseInsensitive =
			synchronizer
				._findDiagramRegistryEntryByGeneratedGuid(
					registryPackage,
					lowerGuid
				);


		var notFound =
			synchronizer
				._findDiagramRegistryEntryByGeneratedGuid(
					registryPackage,
					"{99999999-9999-9999-9999-999999999999}"
				);


		// ========================================================
		// VALIDATION
		// ========================================================

		var entry1OK =
			found1 &&
			found1.ElementGUID ==
				entry1.ElementGUID;


		var entry2OK =
			found2 &&
			found2.ElementGUID ==
				entry2.ElementGUID;


		var caseInsensitiveOK =
			foundCaseInsensitive &&
			foundCaseInsensitive.ElementGUID ==
				entry1.ElementGUID;


		var valid =
			nullPackage === null &&
			emptyGuid === null &&
			entry1OK &&
			entry2OK &&
			caseInsensitiveOK &&
			notFound === null;


		addin.logger.info(
			"TEST findDiagramRegistryEntryByGeneratedGuid"
			+ " | NullPackage=" + (nullPackage === null)
			+ " | EmptyGuid=" + (emptyGuid === null)
			+ " | Entry1=" + entry1OK
			+ " | Entry2=" + entry2OK
			+ " | CaseInsensitive=" + caseInsensitiveOK
			+ " | NotFound=" + (notFound === null)
		);


		if (found1)
		{
			addin.logger.info(
				"TEST RegistryEntry"
				+ " | Name=" + found1.Name
				+ " | ElementGUID=" + found1.ElementGUID
				+ " | GeneratedGUID=" + guid1
			);
		}


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Recherche de l'entrée du registre invalide"
		);
	},
		
	ensureDiagramRegistryEntry: function()
	{
		var testName =
			"ensureDiagramRegistryEntry";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageEnsureDiagramRegistryEntry
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		var registryPackage =
			synchronizer
				._resolveDiagramRegistryPackage(
					rootPackage
				);


		if (!registryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Registre non résolu"
			);
		}


		// ========================================================
		// DIAGRAMME GENERE
		// ========================================================

		var generatedDiagram =
			rootPackage.Diagrams.AddNew(
				"TEST Generated Diagram",
				"Logical"
			);


		if (
			!generatedDiagram ||
			!generatedDiagram.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme de test non créé"
			);
		}


		rootPackage.Diagrams.Refresh();


		// ========================================================
		// DEFINITION SOURCE
		// ========================================================

		var sourceGuid =
			"{33333333-3333-3333-3333-333333333333}";


		var diagramDefinition =
		{
			guid: sourceGuid,
			name: "TEST Prototype Diagram"
		};


		// ========================================================
		// CAS INVALIDES
		// ========================================================

		var nullRoot =
			synchronizer._ensureDiagramRegistryEntry(
				null,
				generatedDiagram,
				diagramDefinition
			);


		var nullDiagram =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				null,
				diagramDefinition
			);


		var nullDefinition =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				generatedDiagram,
				null
			);


		// ========================================================
		// PREMIER APPEL
		// ========================================================

		var beforeCount =
			registryPackage.Elements.Count;


		var entry1 =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				generatedDiagram,
				diagramDefinition
			);


		registryPackage.Elements.Refresh();


		var afterFirstCount =
			registryPackage.Elements.Count;


		// ========================================================
		// SECOND APPEL
		// → DOIT RETROUVER LA MEME ENTREE
		// ========================================================

		var entry2 =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				generatedDiagram,
				diagramDefinition
			);


		registryPackage.Elements.Refresh();


		var afterSecondCount =
			registryPackage.Elements.Count;


		// ========================================================
		// TAGS
		// ========================================================

		var generatedGuidTag =
			entry1
				? addin.repositoryService.getTaggedValue(
					entry1,
					addin.fbaConstants
						.TAG_GENERATED_DIAGRAM_GUID
				)
				: "";


		var sourceGuidTag =
			entry1
				? addin.repositoryService.getTaggedValue(
					entry1,
					addin.fbaConstants
						.TAG_SOURCE_DIAGRAM_GUID
				)
				: "";


		var technicalTag =
			entry1
				? addin.repositoryService.getTaggedValue(
					entry1,
					addin.fbaConstants.TAG_TECHNICAL
				)
				: "";


		// ========================================================
		// VALIDATION
		// ========================================================

		var created =
			entry1 !== null &&
			afterFirstCount == beforeCount + 1;


		var sameEntry =
			entry1 &&
			entry2 &&
			entry1.ElementGUID ==
				entry2.ElementGUID;


		var idempotent =
			afterSecondCount ==
				afterFirstCount;


		var generatedGuidOK =
			addin.utils.equalsIgnoreCase(
				generatedGuidTag,
				generatedDiagram.DiagramGUID
			);


		var sourceGuidOK =
			addin.utils.equalsIgnoreCase(
				sourceGuidTag,
				sourceGuid
			);


		var technicalOK =
			addin.utils.equalsIgnoreCase(
				technicalTag,
				"true"
			);


		var valid =
			nullRoot === null &&
			nullDiagram === null &&
			nullDefinition === null &&
			created &&
			sameEntry &&
			idempotent &&
			generatedGuidOK &&
			sourceGuidOK &&
			technicalOK;


		addin.logger.info(
			"TEST ensureDiagramRegistryEntry"
			+ " | NullRoot=" + (nullRoot === null)
			+ " | NullDiagram=" + (nullDiagram === null)
			+ " | NullDefinition=" + (nullDefinition === null)
			+ " | Created=" + created
			+ " | SameEntry=" + sameEntry
			+ " | Idempotent=" + idempotent
			+ " | GeneratedGuid=" + generatedGuidOK
			+ " | SourceGuid=" + sourceGuidOK
			+ " | Technical=" + technicalOK
		);


		addin.logger.info(
			"TEST RegistryCount"
			+ " | Before=" + beforeCount
			+ " | AfterFirst=" + afterFirstCount
			+ " | AfterSecond=" + afterSecondCount
		);


		if (entry1)
		{
			addin.logger.info(
				"TEST RegistryEntry"
				+ " | Name=" + entry1.Name
				+ " | GUID=" + entry1.ElementGUID
				+ " | GeneratedGUID="
					+ generatedGuidTag
				+ " | SourceGUID="
					+ sourceGuidTag
				+ " | Technical="
					+ technicalTag
			);
		}


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Enregistrement du diagramme invalide"
		);
	},
		
	ensureDiagramFromDefinition: function()
	{
		var testName =
			"ensureDiagramFromDefinition";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageEnsureDiagramFromDefinition
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// LIBRAIRIE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		// ========================================================
		// PACKAGE D'ANALYSE
		// ========================================================

		var analysisPackage =
			rootPackage.Packages.AddNew(
				"TEST Analysis Package",
				""
			);


		if (
			!analysisPackage ||
			!analysisPackage.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Package d'analyse non créé"
			);
		}


		rootPackage.Packages.Refresh();


		// ========================================================
		// RECUPERATION D'UN VRAI DIAGRAMME PROTOTYPE
		// ========================================================

		var definitions =
			synchronizer._loadDefinitions();


		var diagramDefinition =
			null;


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var definition =
				definitions[i];


			if (
				!definition ||
				!definition.element
			)
			{
				continue;
			}


			var diagramDefinitions =
				synchronizer._loadDiagramDefinitions(
					definition.element
				);


			if (
				diagramDefinitions &&
				diagramDefinitions.length > 0
			)
			{
				diagramDefinition =
					diagramDefinitions[0];

				break;
			}
		}


		if (!diagramDefinition)
		{
			return this._testResult(
				testName,
				false,
				"Aucun diagramme prototype trouvé"
			);
		}


		addin.logger.info(
			"TEST Prototype"
			+ " | Name=" + diagramDefinition.name
			+ " | MetaType=[" + diagramDefinition.metaType + "]"
			+ " | GUID=" + diagramDefinition.guid
		);


		// ========================================================
		// CONFIGURATION EFFECTIVE
		// ========================================================

		var effectiveConfig =
		{
			importanceLevel:
				"Obligatoire",

			defaultName:
				"Diagramme généré",

			namePrefix:
				"TST",

			priority:
				10,

			sourceConfigGuid:
				"",

			sourceConfigName:
				"TEST"
		};


		// ========================================================
		// CAS INVALIDES
		// ========================================================

		var nullRoot =
			synchronizer._ensureDiagramFromDefinition(
				null,
				analysisPackage,
				diagramDefinition,
				effectiveConfig
			);


		var nullPackage =
			synchronizer._ensureDiagramFromDefinition(
				rootPackage,
				null,
				diagramDefinition,
				effectiveConfig
			);


		var nullDefinition =
			synchronizer._ensureDiagramFromDefinition(
				rootPackage,
				analysisPackage,
				null,
				effectiveConfig
			);


		// ========================================================
		// PREMIER APPEL
		// → AUCUN DIAGRAMME EXISTANT
		// → CREATION
		// ========================================================

		var beforeCount =
			analysisPackage.Diagrams.Count;


		var firstResult =
			synchronizer._ensureDiagramFromDefinition(
				rootPackage,
				analysisPackage,
				diagramDefinition,
				effectiveConfig
			);


		analysisPackage.Diagrams.Refresh();


		var afterFirstCount =
			analysisPackage.Diagrams.Count;


		var firstCreated =
			firstResult &&
			firstResult.length == 1 &&
			firstResult[0] &&
			firstResult[0].created === true &&
			firstResult[0].diagram != null;


		var createdDiagram =
			firstCreated
				? firstResult[0].diagram
				: null;


		// ========================================================
		// REGISTRE
		// ========================================================

		var registryPackage =
			synchronizer
				._resolveDiagramRegistryPackage(
					rootPackage
				);


		var registryEntry =
			createdDiagram
				? synchronizer
					._findDiagramRegistryEntryByGeneratedGuid(
						registryPackage,
						createdDiagram.DiagramGUID
					)
				: null;


		// ========================================================
		// SECOND APPEL
		// → LE DIAGRAMME EXISTE
		// → CONSERVATION
		// ========================================================

		var secondResult =
			synchronizer._ensureDiagramFromDefinition(
				rootPackage,
				analysisPackage,
				diagramDefinition,
				effectiveConfig
			);


		analysisPackage.Diagrams.Refresh();


		var afterSecondCount =
			analysisPackage.Diagrams.Count;


		var secondPreserved =
			secondResult &&
			secondResult.length == 1 &&
			secondResult[0] &&
			secondResult[0].created === false &&
			secondResult[0].diagram &&
			createdDiagram &&
			secondResult[0].diagram.DiagramGUID ==
				createdDiagram.DiagramGUID;


		// ========================================================
		// VALIDATION DU NOM ET DU METATYPE
		// ========================================================

		var nameOK =
			createdDiagram &&
			createdDiagram.Name ==
				"TST Diagramme généré";


		var metaTypeOK =
			createdDiagram &&
			addin.utils.trim(
				createdDiagram.MetaType
			) ==
			addin.utils.trim(
				diagramDefinition.metaType
			);


		var createdCountOK =
			afterFirstCount ==
				beforeCount + 1;


		var idempotent =
			afterSecondCount ==
				afterFirstCount;


		var registryOK =
			registryEntry !== null;


		var valid =
			nullRoot.length == 0 &&
			nullPackage.length == 0 &&
			nullDefinition.length == 0 &&
			firstCreated &&
			createdCountOK &&
			nameOK &&
			metaTypeOK &&
			registryOK &&
			secondPreserved &&
			idempotent;


		// ========================================================
		// LOG
		// ========================================================

		addin.logger.info(
			"TEST ensureDiagramFromDefinition"
			+ " | NullRoot=" + (nullRoot.length == 0)
			+ " | NullPackage=" + (nullPackage.length == 0)
			+ " | NullDefinition=" + (nullDefinition.length == 0)
			+ " | Created=" + firstCreated
			+ " | Name=" + nameOK
			+ " | MetaType=" + metaTypeOK
			+ " | Registry=" + registryOK
			+ " | Preserved=" + secondPreserved
			+ " | Idempotent=" + idempotent
		);


		addin.logger.info(
			"TEST DiagramCount"
			+ " | Before=" + beforeCount
			+ " | AfterFirst=" + afterFirstCount
			+ " | AfterSecond=" + afterSecondCount
		);


		if (createdDiagram)
		{
			addin.logger.info(
				"TEST GeneratedDiagram"
				+ " | Name=" + createdDiagram.Name
				+ " | Type=" + createdDiagram.Type
				+ " | MetaType=[" + createdDiagram.MetaType + "]"
				+ " | GUID=" + createdDiagram.DiagramGUID
			);
		}


		if (registryEntry)
		{
			addin.logger.info(
				"TEST RegistryEntry"
				+ " | Name=" + registryEntry.Name
				+ " | GUID=" + registryEntry.ElementGUID
			);
		}


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Synchronisation du diagramme invalide"
		);
	},
		
	findDiagramRegistryEntriesBySourceGuid: function()
	{
		var testName =
			"findDiagramRegistryEntriesBySourceGuid";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageFindDiagramRegistryEntriesBySourceGuid
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// REGISTRE
		// ========================================================

		synchronizer._ensureLibrary(
			rootPackage
		);


		var registryPackage =
			synchronizer._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (!registryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Registre non résolu"
			);
		}


		// ========================================================
		// DONNEES
		// ========================================================

		var sourceGuid1 =
			"{11111111-1111-1111-1111-111111111111}";

		var sourceGuid2 =
			"{22222222-2222-2222-2222-222222222222}";


		var entry1 =
			this._createElement(
				registryPackage,
				"TEST Registry Source 1A",
				"Class",
				""
			);


		var entry2 =
			this._createElement(
				registryPackage,
				"TEST Registry Source 1B",
				"Class",
				""
			);


		var entry3 =
			this._createElement(
				registryPackage,
				"TEST Registry Source 2",
				"Class",
				""
			);


		if (
			!entry1 ||
			!entry2 ||
			!entry3
		)
		{
			return this._testResult(
				testName,
				false,
				"Entrées de registre non créées"
			);
		}


		addin.repositoryService.setTaggedValue(
			entry1,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid1
		);


		addin.repositoryService.setTaggedValue(
			entry2,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid1
		);


		addin.repositoryService.setTaggedValue(
			entry3,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid2
		);


		// ========================================================
		// TESTS
		// ========================================================

		var nullPackage =
			synchronizer._findDiagramRegistryEntriesBySourceGuid(
				null,
				sourceGuid1
			);


		var emptyGuid =
			synchronizer._findDiagramRegistryEntriesBySourceGuid(
				registryPackage,
				""
			);


		var source1 =
			synchronizer._findDiagramRegistryEntriesBySourceGuid(
				registryPackage,
				sourceGuid1
			);


		var source2 =
			synchronizer._findDiagramRegistryEntriesBySourceGuid(
				registryPackage,
				sourceGuid2
			);


		var caseInsensitive =
			synchronizer._findDiagramRegistryEntriesBySourceGuid(
				registryPackage,
				sourceGuid1.toLowerCase()
			);


		var notFound =
			synchronizer._findDiagramRegistryEntriesBySourceGuid(
				registryPackage,
				"{99999999-9999-9999-9999-999999999999}"
			);


		// ========================================================
		// VERIFICATION DES IDENTITES
		// ========================================================

		var entry1Found =
			false;

		var entry2Found =
			false;


		for (
			var i = 0;
			i < source1.length;
			i++
		)
		{
			if (
				source1[i].ElementGUID ==
				entry1.ElementGUID
			)
			{
				entry1Found = true;
			}


			if (
				source1[i].ElementGUID ==
				entry2.ElementGUID
			)
			{
				entry2Found = true;
			}
		}


		var source1OK =
			source1.length == 2 &&
			entry1Found &&
			entry2Found;


		var source2OK =
			source2.length == 1 &&
			source2[0].ElementGUID ==
				entry3.ElementGUID;


		var caseInsensitiveOK =
			caseInsensitive.length == 2;


		var valid =
			nullPackage.length == 0 &&
			emptyGuid.length == 0 &&
			source1OK &&
			source2OK &&
			caseInsensitiveOK &&
			notFound.length == 0;


		// ========================================================
		// LOG
		// ========================================================

		addin.logger.info(
			"TEST findDiagramRegistryEntriesBySourceGuid"
			+ " | NullPackage=" + (nullPackage.length == 0)
			+ " | EmptyGuid=" + (emptyGuid.length == 0)
			+ " | Source1Count=" + source1.length
			+ " | Source2Count=" + source2.length
			+ " | Entry1=" + entry1Found
			+ " | Entry2=" + entry2Found
			+ " | CaseInsensitive=" + caseInsensitiveOK
			+ " | NotFound=" + (notFound.length == 0)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Recherche par SourceDiagramGUID invalide"
		);
	},
	
	findGeneratedDiagramsBySourceGuid: function()
	{
		var testName =
			"findGeneratedDiagramsBySourceGuid";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageFindGeneratedDiagramsBySourceGuid
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// LIBRAIRIE + REGISTRE
		// ========================================================

		synchronizer._ensureLibrary(
			rootPackage
		);


		var registryPackage =
			synchronizer._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (!registryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Registre non résolu"
			);
		}


		// ========================================================
		// DIAGRAMMES REELS
		// ========================================================

		var diagram1 =
			rootPackage.Diagrams.AddNew(
				"TEST Generated Diagram 1",
				"Logical"
			);


		var diagram2 =
			rootPackage.Diagrams.AddNew(
				"TEST Generated Diagram 2",
				"Logical"
			);


		if (
			!diagram1 ||
			!diagram1.Update() ||
			!diagram2 ||
			!diagram2.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagrammes de test non créés"
			);
		}


		rootPackage.Diagrams.Refresh();


		// ========================================================
		// SOURCE COMMUNE
		// ========================================================

		var sourceGuid =
			"{11111111-1111-1111-1111-111111111111}";


		// ========================================================
		// ENTREES VALIDES
		// ========================================================

		var entry1 =
			this._createElement(
				registryPackage,
				"TEST Registry Diagram 1",
				"Class",
				""
			);


		var entry2 =
			this._createElement(
				registryPackage,
				"TEST Registry Diagram 2",
				"Class",
				""
			);


		// ========================================================
		// ENTREE ORPHELINE
		// ========================================================

		var orphanEntry =
			this._createElement(
				registryPackage,
				"TEST Registry Orphan",
				"Class",
				""
			);


		// ========================================================
		// ENTREE SANS GENERATED GUID
		// ========================================================

		var emptyEntry =
			this._createElement(
				registryPackage,
				"TEST Registry Empty",
				"Class",
				""
			);


		if (
			!entry1 ||
			!entry2 ||
			!orphanEntry ||
			!emptyEntry
		)
		{
			return this._testResult(
				testName,
				false,
				"Entrées de registre non créées"
			);
		}


		// ========================================================
		// SOURCE GUID SUR LES 4 ENTREES
		// ========================================================

		addin.repositoryService.setTaggedValue(
			entry1,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid
		);

		addin.repositoryService.setTaggedValue(
			entry2,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid
		);

		addin.repositoryService.setTaggedValue(
			orphanEntry,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid
		);

		addin.repositoryService.setTaggedValue(
			emptyEntry,
			addin.fbaConstants.TAG_SOURCE_DIAGRAM_GUID,
			sourceGuid
		);


		// ========================================================
		// GENERATED GUID
		// ========================================================

		addin.repositoryService.setTaggedValue(
			entry1,
			addin.fbaConstants.TAG_GENERATED_DIAGRAM_GUID,
			diagram1.DiagramGUID
		);


		addin.repositoryService.setTaggedValue(
			entry2,
			addin.fbaConstants.TAG_GENERATED_DIAGRAM_GUID,
			diagram2.DiagramGUID
		);


		// GUID volontairement inexistant

		addin.repositoryService.setTaggedValue(
			orphanEntry,
			addin.fbaConstants.TAG_GENERATED_DIAGRAM_GUID,
			"{99999999-9999-9999-9999-999999999999}"
		);


		// emptyEntry ne reçoit volontairement aucun
		// GeneratedDiagramGUID.


		// ========================================================
		// EXECUTION
		// ========================================================

		var nullRoot =
			synchronizer._findGeneratedDiagramsBySourceGuid(
				null,
				sourceGuid
			);


		var emptyGuid =
			synchronizer._findGeneratedDiagramsBySourceGuid(
				rootPackage,
				""
			);


		var found =
			synchronizer._findGeneratedDiagramsBySourceGuid(
				rootPackage,
				sourceGuid
			);


		var notFound =
			synchronizer._findGeneratedDiagramsBySourceGuid(
				rootPackage,
				"{88888888-8888-8888-8888-888888888888}"
			);


		// ========================================================
		// VERIFICATION
		// ========================================================

		var diagram1Found =
			false;

		var diagram2Found =
			false;


		for (
			var i = 0;
			i < found.length;
			i++
		)
		{
			if (
				found[i].DiagramGUID ==
				diagram1.DiagramGUID
			)
			{
				diagram1Found = true;
			}


			if (
				found[i].DiagramGUID ==
				diagram2.DiagramGUID
			)
			{
				diagram2Found = true;
			}
		}


		var valid =
			nullRoot.length == 0 &&
			emptyGuid.length == 0 &&
			found.length == 2 &&
			diagram1Found &&
			diagram2Found &&
			notFound.length == 0;


		// ========================================================
		// LOG
		// ========================================================

		addin.logger.info(
			"TEST findGeneratedDiagramsBySourceGuid"
			+ " | NullRoot=" + (nullRoot.length == 0)
			+ " | EmptyGuid=" + (emptyGuid.length == 0)
			+ " | Found=" + found.length
			+ " | Diagram1=" + diagram1Found
			+ " | Diagram2=" + diagram2Found
			+ " | OrphanIgnored=" + (found.length == 2)
			+ " | NotFound=" + (notFound.length == 0)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Résolution des diagrammes générés invalide"
		);
	},
		
	findGeneratedDiagramsForPackage: function()
	{
		var testName =
			"findGeneratedDiagramsForPackage";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageFindGeneratedDiagramsForPackage
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// LIBRAIRIE
		// ========================================================

		synchronizer._ensureLibrary(
			rootPackage
		);


		var registryPackage =
			synchronizer._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (!registryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Registre non résolu"
			);
		}


		// ========================================================
		// DEUX PACKAGES D'ANALYSE
		// ========================================================

		var package1 =
			rootPackage.Packages.AddNew(
				"TEST Analysis Package 1",
				""
			);


		var package2 =
			rootPackage.Packages.AddNew(
				"TEST Analysis Package 2",
				""
			);


		if (
			!package1 ||
			!package1.Update() ||
			!package2 ||
			!package2.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Packages d'analyse non créés"
			);
		}


		rootPackage.Packages.Refresh();


		// ========================================================
		// MEME PROTOTYPE POUR LES TROIS DIAGRAMMES
		// ========================================================

		var sourceGuid =
			"{11111111-1111-1111-1111-111111111111}";


		// Deux diagrammes dans package1

		var diagram1 =
			package1.Diagrams.AddNew(
				"TEST Diagram P1-A",
				"Logical"
			);


		var diagram2 =
			package1.Diagrams.AddNew(
				"TEST Diagram P1-B",
				"Logical"
			);


		// Un diagramme dans package2

		var diagram3 =
			package2.Diagrams.AddNew(
				"TEST Diagram P2",
				"Logical"
			);


		if (
			!diagram1 ||
			!diagram1.Update() ||
			!diagram2 ||
			!diagram2.Update() ||
			!diagram3 ||
			!diagram3.Update()
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagrammes non créés"
			);
		}


		package1.Diagrams.Refresh();
		package2.Diagrams.Refresh();


		// ========================================================
		// ENREGISTREMENT DES TROIS DIAGRAMMES
		// ========================================================

		var diagramDefinition =
		{
			guid: sourceGuid,
			name: "TEST Prototype"
		};


		var entry1 =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				diagram1,
				diagramDefinition
			);


		var entry2 =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				diagram2,
				diagramDefinition
			);


		var entry3 =
			synchronizer._ensureDiagramRegistryEntry(
				rootPackage,
				diagram3,
				diagramDefinition
			);


		if (
			!entry1 ||
			!entry2 ||
			!entry3
		)
		{
			return this._testResult(
				testName,
				false,
				"Diagrammes non enregistrés"
			);
		}


		// ========================================================
		// CAS INVALIDES
		// ========================================================

		var nullRoot =
			synchronizer._findGeneratedDiagramsForPackage(
				null,
				package1,
				sourceGuid
			);


		var nullPackage =
			synchronizer._findGeneratedDiagramsForPackage(
				rootPackage,
				null,
				sourceGuid
			);


		var emptyGuid =
			synchronizer._findGeneratedDiagramsForPackage(
				rootPackage,
				package1,
				""
			);


		// ========================================================
		// RECHERCHE
		// ========================================================

		var found1 =
			synchronizer._findGeneratedDiagramsForPackage(
				rootPackage,
				package1,
				sourceGuid
			);


		var found2 =
			synchronizer._findGeneratedDiagramsForPackage(
				rootPackage,
				package2,
				sourceGuid
			);


		var notFound =
			synchronizer._findGeneratedDiagramsForPackage(
				rootPackage,
				package1,
				"{99999999-9999-9999-9999-999999999999}"
			);


		// ========================================================
		// VERIFICATION PACKAGE 1
		// ========================================================

		var diagram1Found = false;
		var diagram2Found = false;
		var diagram3InPackage1 = false;


		for (
			var i = 0;
			i < found1.length;
			i++
		)
		{
			if (
				found1[i].DiagramGUID ==
				diagram1.DiagramGUID
			)
			{
				diagram1Found = true;
			}


			if (
				found1[i].DiagramGUID ==
				diagram2.DiagramGUID
			)
			{
				diagram2Found = true;
			}


			if (
				found1[i].DiagramGUID ==
				diagram3.DiagramGUID
			)
			{
				diagram3InPackage1 = true;
			}
		}


		// ========================================================
		// VERIFICATION PACKAGE 2
		// ========================================================

		var package2OK =
			found2.length == 1 &&
			found2[0].DiagramGUID ==
				diagram3.DiagramGUID;


		var package1OK =
			found1.length == 2 &&
			diagram1Found &&
			diagram2Found &&
			!diagram3InPackage1;


		var valid =
			nullRoot.length == 0 &&
			nullPackage.length == 0 &&
			emptyGuid.length == 0 &&
			package1OK &&
			package2OK &&
			notFound.length == 0;


		// ========================================================
		// LOG
		// ========================================================

		addin.logger.info(
			"TEST findGeneratedDiagramsForPackage"
			+ " | NullRoot=" + (nullRoot.length == 0)
			+ " | NullPackage=" + (nullPackage.length == 0)
			+ " | EmptyGuid=" + (emptyGuid.length == 0)
			+ " | Package1Count=" + found1.length
			+ " | Package2Count=" + found2.length
			+ " | Diagram1=" + diagram1Found
			+ " | Diagram2=" + diagram2Found
			+ " | CrossPackageExcluded=" + (!diagram3InPackage1)
			+ " | Package2=" + package2OK
			+ " | NotFound=" + (notFound.length == 0)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Filtrage des diagrammes par package invalide"
		);
	},
		
		
	hasPreExistingAnalysisContent: function()
	{
		var testName =
			"hasPreExistingAnalysisContent";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageHasPreExistingAnalysisContent
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// 1. NULL
		// ========================================================

		var nullResult =
			synchronizer._hasPreExistingAnalysisContent(
				null
			);


		// ========================================================
		// 2. PACKAGE VIDE
		// ========================================================

		var emptyPackage =
			rootPackage.Packages.AddNew(
				"TEST Empty",
				""
			);

		emptyPackage.Update();


		var emptyResult =
			synchronizer._hasPreExistingAnalysisContent(
				emptyPackage
			);


		// ========================================================
		// 3. ELEMENT TECHNIQUE UNIQUEMENT
		// ========================================================

		var technicalPackage =
			rootPackage.Packages.AddNew(
				"TEST Technical Element",
				""
			);

		technicalPackage.Update();


		var technicalElement =
			this._createElement(
				technicalPackage,
				"_TEST Technical",
				"Class",
				""
			);


		addin.repositoryService.setTaggedValue(
			technicalElement,
			addin.fbaConstants.TAG_TECHNICAL,
			"true"
		);


		var technicalElementResult =
			synchronizer._hasPreExistingAnalysisContent(
				technicalPackage
			);


		// ========================================================
		// 4. ELEMENT METIER
		// ========================================================

		var businessElementPackage =
			rootPackage.Packages.AddNew(
				"TEST Business Element",
				""
			);

		businessElementPackage.Update();


		this._createElement(
			businessElementPackage,
			"Besoin existant",
			"Requirement",
			""
		);


		var businessElementResult =
			synchronizer._hasPreExistingAnalysisContent(
				businessElementPackage
			);


		// ========================================================
		// 5. DIAGRAMME
		// ========================================================

		var diagramPackage =
			rootPackage.Packages.AddNew(
				"TEST Diagram",
				""
			);

		diagramPackage.Update();


		var diagram =
			diagramPackage.Diagrams.AddNew(
				"Diagramme existant",
				"Logical"
			);

		diagram.Update();

		diagramPackage.Diagrams.Refresh();


		var diagramResult =
			synchronizer._hasPreExistingAnalysisContent(
				diagramPackage
			);


		// ========================================================
		// 6. SOUS-PACKAGE TECHNIQUE
		// ========================================================

		var technicalChildParent =
			rootPackage.Packages.AddNew(
				"TEST Technical Child",
				""
			);

		technicalChildParent.Update();


		var technicalChild =
			technicalChildParent.Packages.AddNew(
				"_Technique",
				""
			);

		technicalChild.Update();

		technicalChildParent.Packages.Refresh();

		var technicalChildResult =
			synchronizer._hasPreExistingAnalysisContent(
				technicalChildParent
			);


		// ========================================================
		// 7. SOUS-PACKAGE METIER
		// ========================================================

		var businessChildParent =
			rootPackage.Packages.AddNew(
				"TEST Business Child",
				""
			);

		businessChildParent.Update();


		var businessChild =
			businessChildParent.Packages.AddNew(
				"Sous-analyse",
				""
			);

		businessChild.Update();

		businessChildParent.Packages.Refresh();
		
		var businessChildResult =
			synchronizer._hasPreExistingAnalysisContent(
				businessChildParent
			);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			nullResult == false &&
			emptyResult == false &&
			technicalElementResult == false &&
			businessElementResult == true &&
			diagramResult == true &&
			technicalChildResult == false &&
			businessChildResult == true;


		addin.logger.info(
			"TEST hasPreExistingAnalysisContent"
			+ " | Null=" + nullResult
			+ " | Empty=" + emptyResult
			+ " | TechnicalElement=" + technicalElementResult
			+ " | BusinessElement=" + businessElementResult
			+ " | Diagram=" + diagramResult
			+ " | TechnicalChild=" + technicalChildResult
			+ " | BusinessChild=" + businessChildResult
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Détection du contenu préexistant invalide"
		);
	},
		
	analysisPackageInitializationState: function()
	{
		var testName =
			"analysisPackageInitializationState";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageAnalysisPackageInitializationState
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// NULL
		// ========================================================

		var stateNull =
			synchronizer._getAnalysisPackageInitializationState(
				null
			);


		// ========================================================
		// NOT_ASSOCIATED
		// ========================================================

		var packageNotAssociated =
			rootPackage.Packages.AddNew(
				"TEST Not Associated",
				""
			);

		packageNotAssociated.Update();


		var stateNotAssociated =
			synchronizer._getAnalysisPackageInitializationState(
				packageNotAssociated
			);


		// ========================================================
		// INITIALIZED
		// ========================================================

		var packageInitialized =
			rootPackage.Packages.AddNew(
				"TEST Initialized",
				""
			);

		packageInitialized.Update();


		addin.repositoryService.setTaggedValue(
			packageInitialized.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			"{11111111-1111-1111-1111-111111111111}"
		);


		addin.repositoryService.setTaggedValue(
			packageInitialized.Element,
			addin.fbaConstants.TAG_INITIALIZED,
			"true"
		);


		var stateInitialized =
			synchronizer._getAnalysisPackageInitializationState(
				packageInitialized
			);


		// ========================================================
		// INCOMPLETE
		// ========================================================

		var packageIncomplete =
			rootPackage.Packages.AddNew(
				"TEST Incomplete",
				""
			);

		packageIncomplete.Update();


		addin.repositoryService.setTaggedValue(
			packageIncomplete.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			"{22222222-2222-2222-2222-222222222222}"
		);


		addin.repositoryService.setTaggedValue(
			packageIncomplete.Element,
			addin.fbaConstants.TAG_INITIALIZED,
			"false"
		);


		var stateIncomplete =
			synchronizer._getAnalysisPackageInitializationState(
				packageIncomplete
			);


		// ========================================================
		// LEGACY
		//
		// SourceGUID présent mais aucun tag Initialized.
		// ========================================================

		var packageLegacy =
			rootPackage.Packages.AddNew(
				"TEST Legacy",
				""
			);

		packageLegacy.Update();


		addin.repositoryService.setTaggedValue(
			packageLegacy.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			"{33333333-3333-3333-3333-333333333333}"
		);


		var stateLegacy =
			synchronizer._getAnalysisPackageInitializationState(
				packageLegacy
			);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			stateNull == "NOT_ASSOCIATED" &&
			stateNotAssociated == "NOT_ASSOCIATED" &&
			stateInitialized == "INITIALIZED" &&
			stateIncomplete == "INCOMPLETE" &&
			stateLegacy == "LEGACY";


		addin.logger.info(
			"TEST analysisPackageInitializationState"
			+ " | Null=" + stateNull
			+ " | NotAssociated=" + stateNotAssociated
			+ " | Initialized=" + stateInitialized
			+ " | Incomplete=" + stateIncomplete
			+ " | Legacy=" + stateLegacy
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Etat d'initialisation incorrect"
		);
	},
		
	findDefinitionForPackage: function()
	{
		var testName =
			"findDefinitionForPackage";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageFindDefinitionForPackage
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		var definitions =
			synchronizer._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition disponible"
			);
		}


		var definition =
			definitions[0];


		// ========================================================
		// 1. NULL
		// ========================================================

		var nullResult =
			synchronizer.findDefinitionForPackage(
				null,
				definitions
			);


		// ========================================================
		// 2. RECHERCHE PAR NOM
		// ========================================================

		var packageByName =
			rootPackage.Packages.AddNew(
				definition.name,
				""
			);

		packageByName.Update();


		var byName =
			synchronizer.findDefinitionForPackage(
				packageByName,
				definitions
			);


		// ========================================================
		// 3. RECHERCHE PAR NOM - CASSE DIFFERENTE
		// ========================================================

		var packageByNameCase =
			rootPackage.Packages.AddNew(
				definition.name.toUpperCase(),
				""
			);

		packageByNameCase.Update();


		var byNameCase =
			synchronizer.findDefinitionForPackage(
				packageByNameCase,
				definitions
			);


		// ========================================================
		// 4. RECHERCHE PAR GUID
		//
		// Le nom est volontairement faux.
		// ========================================================

		var packageByGuid =
			rootPackage.Packages.AddNew(
				"TEST Nom volontairement incorrect",
				""
			);

		packageByGuid.Update();


		addin.repositoryService.setTaggedValue(
			packageByGuid.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			definition.guid
		);


		var byGuid =
			synchronizer.findDefinitionForPackage(
				packageByGuid,
				definitions
			);


		// ========================================================
		// 5. GUID INCONNU
		//
		// Même si le nom correspond, aucun fallback par nom
		// ne doit avoir lieu.
		// ========================================================

		var packageUnknownGuid =
			rootPackage.Packages.AddNew(
				definition.name,
				""
			);

		packageUnknownGuid.Update();


		addin.repositoryService.setTaggedValue(
			packageUnknownGuid.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			"{99999999-9999-9999-9999-999999999999}"
		);


		var unknownGuid =
			synchronizer.findDefinitionForPackage(
				packageUnknownGuid,
				definitions
			);


		// ========================================================
		// 6. NOM INCONNU
		// ========================================================

		var packageUnknownName =
			rootPackage.Packages.AddNew(
				"TEST Definition inexistante",
				""
			);

		packageUnknownName.Update();


		var unknownName =
			synchronizer.findDefinitionForPackage(
				packageUnknownName,
				definitions
			);


		// ========================================================
		// RESULTAT
		// ========================================================

		var byNameOK =
			byName &&
			addin.utils.equalsIgnoreCase(
				byName.guid,
				definition.guid
			);


		var byNameCaseOK =
			byNameCase &&
			addin.utils.equalsIgnoreCase(
				byNameCase.guid,
				definition.guid
			);


		var byGuidOK =
			byGuid &&
			addin.utils.equalsIgnoreCase(
				byGuid.guid,
				definition.guid
			);


		var valid =
			nullResult == null &&
			byNameOK &&
			byNameCaseOK &&
			byGuidOK &&
			unknownGuid == null &&
			unknownName == null;


		addin.logger.info(
			"TEST findDefinitionForPackage"
			+ " | Null=" + (nullResult == null)
			+ " | ByName=" + byNameOK
			+ " | ByNameCase=" + byNameCaseOK
			+ " | ByGuid=" + byGuidOK
			+ " | UnknownGuid=" + (unknownGuid == null)
			+ " | NoFallback=" + (unknownGuid == null)
			+ " | UnknownName=" + (unknownName == null)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Résolution de définition incorrecte"
		);
	},
		
	createTechnicalDiagramFromDefinition: function()
	{
		var testName =
			"createTechnicalDiagramFromDefinition";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		// ========================================================
		// ROOT DE TEST
		// ========================================================

		var rootPackage =
			this._createFreshPackage(
				this.packageCreateTechnicalDiagramFromDefinition
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// STRUCTURE TECHNIQUE NECESSAIRE AU REGISTRE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie technique non créée"
			);
		}


		// ========================================================
		// DEFINITIONS
		// ========================================================

		var definitions =
			synchronizer._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition d'analyse"
			);
		}


		var analysisDefinition =
			definitions[0];


		var diagramDefinitions =
			synchronizer._loadDiagramDefinitions(
				analysisDefinition.element
			);


		if (
			!diagramDefinitions ||
			diagramDefinitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition de diagramme"
			);
		}


		var diagramDefinition =
			diagramDefinitions[0];


		var effectiveConfig =
			synchronizer._resolveEffectiveDiagramConfig(
				diagramDefinition
			);


		if (!effectiveConfig)
		{
			return this._testResult(
				testName,
				false,
				"Configuration effective introuvable"
			);
		}


		// ========================================================
		// PACKAGE D'ANALYSE
		// ========================================================

		var analysisPackage =
			rootPackage.Packages.AddNew(
				analysisDefinition.name,
				""
			);


		if (!analysisPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package d'analyse non créé"
			);
		}


		analysisPackage.Update();

		rootPackage.Packages.Refresh();


		// ========================================================
		// 1. CAS NULL
		// ========================================================

		var nullResult =
			synchronizer._createTechnicalDiagramFromDefinition(
				null,
				analysisPackage,
				diagramDefinition,
				effectiveConfig
			);


		// ========================================================
		// 2. CREATION DU DIAGRAMME TECHNIQUE
		// ========================================================

		var createdDiagram =
			synchronizer._createTechnicalDiagramFromDefinition(
				rootPackage,
				analysisPackage,
				diagramDefinition,
				effectiveConfig
			);


		analysisPackage.Diagrams.Refresh();


		// ========================================================
		// 3. DIAGRAMME CREE
		// ========================================================

		var created =
			createdDiagram != null;


		// ========================================================
		// 4. NOM TECHNIQUE
		// ========================================================

		var technicalName =
			created &&
			addin.utils.startsWith(
				createdDiagram.Name,
				addin.fbaConstants.TECHNICAL_NAME_PREFIX
			);


		// ========================================================
		// 5. PACKAGE CORRECT
		// ========================================================

		var correctPackage =
			created &&
			createdDiagram.PackageID ==
				analysisPackage.PackageID;


		// ========================================================
		// 6. ENTREE DANS LE REGISTRE
		// ========================================================

		var registryEntry =
			null;


		var registryPackage =
			synchronizer._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (
			created &&
			registryPackage
		)
		{
			registryPackage.Elements.Refresh();


			registryEntry =
				synchronizer
					._findDiagramRegistryEntryByGeneratedGuid(
						registryPackage,
						createdDiagram.DiagramGUID
					);
		}


		var registryCreated =
			registryEntry != null;


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			nullResult == null &&
			created &&
			technicalName &&
			correctPackage &&
			registryCreated;


		addin.logger.info(
			"TEST createTechnicalDiagramFromDefinition"
			+ " | Null=" + (nullResult == null)
			+ " | Created=" + created
			+ " | TechnicalName=" + technicalName
			+ " | CorrectPackage=" + correctPackage
			+ " | RegistryCreated=" + registryCreated
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Création du diagramme technique incorrecte"
		);
	},
		
	updateDiagramRegistryHash: function()
	{
		var testName =
			"updateDiagramRegistryHash";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageUpdateDiagramRegistryHash
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		// ========================================================
		// DEFINITIONS
		// ========================================================

		var definitions =
			synchronizer._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition"
			);
		}


		var analysisDefinition =
			definitions[0];


		var diagramDefinitions =
			synchronizer._loadDiagramDefinitions(
				analysisDefinition.element
			);


		if (
			!diagramDefinitions ||
			diagramDefinitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition de diagramme"
			);
		}


		var diagramDefinition =
			diagramDefinitions[0];


		var effectiveConfig =
			synchronizer._resolveEffectiveDiagramConfig(
				diagramDefinition
			);


		if (!effectiveConfig)
		{
			return this._testResult(
				testName,
				false,
				"Configuration effective introuvable"
			);
		}


		// ========================================================
		// PACKAGE D'ANALYSE
		// ========================================================

		var analysisPackage =
			rootPackage.Packages.AddNew(
				analysisDefinition.name,
				""
			);


		analysisPackage.Update();

		rootPackage.Packages.Refresh();


		// ========================================================
		// DIAGRAMME TECHNIQUE + REGISTRE
		// ========================================================

		var diagram =
			synchronizer._createTechnicalDiagramFromDefinition(
				rootPackage,
				analysisPackage,
				diagramDefinition,
				effectiveConfig
			);


		if (!diagram)
		{
			return this._testResult(
				testName,
				false,
				"Diagramme technique non créé"
			);
		}


		// ========================================================
		// TEST DES PRIMITIVES
		// ========================================================

		var signature =
			synchronizer._buildDiagramStructureSignature(
				diagram
			);


		var hash =
			synchronizer._buildDiagramHash(
				diagram
			);


		var nullSignature =
			synchronizer._buildDiagramStructureSignature(
				null
			);


		var nullHash =
			synchronizer._buildDiagramHash(
				null
			);


		// ========================================================
		// MISE A JOUR DU REGISTRE
		// ========================================================

		var updated =
			synchronizer._updateDiagramRegistryHash(
				rootPackage,
				diagram
			);


		var registryPackage =
			synchronizer._resolveDiagramRegistryPackage(
				rootPackage
			);


		registryPackage.Elements.Refresh();


		var registryEntry =
			synchronizer._findDiagramRegistryEntryByGeneratedGuid(
				registryPackage,
				diagram.DiagramGUID
			);


		var storedHash =
			registryEntry
				? addin.repositoryService.getTaggedValue(
					registryEntry,
					addin.fbaConstants.TAG_DIAGRAM_HASH
				  )
				: "";


		// ========================================================
		// RESULTAT
		// ========================================================

		var signatureOK =
			!addin.utils.isEmpty(
				signature
			);


		var hashOK =
			!addin.utils.isEmpty(
				hash
			);


		var storedHashOK =
			addin.utils.equalsIgnoreCase(
				storedHash,
				hash
			);


		var valid =
			nullSignature == "" &&
			nullHash == "" &&
			signatureOK &&
			hashOK &&
			updated &&
			registryEntry != null &&
			storedHashOK;


		addin.logger.info(
			"TEST updateDiagramRegistryHash"
			+ " | NullSignature=" + (nullSignature == "")
			+ " | NullHash=" + (nullHash == "")
			+ " | Signature=" + signatureOK
			+ " | Hash=" + hashOK
			+ " | Updated=" + updated
			+ " | RegistryEntry=" + (registryEntry != null)
			+ " | StoredHash=" + storedHashOK
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Mise à jour du hash incorrecte"
		);
	},
		
	synchronizeAnalysisContent: function()
	{
		var testName =
			"synchronizeAnalysisContent";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageSynchronizeAnalysisContent
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		// ========================================================
		// DEFINITION D'ANALYSE
		// ========================================================

		var definitions =
			synchronizer._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition"
			);
		}


		var analysisDefinition =
			definitions[0];


		// ========================================================
		// PACKAGE D'ANALYSE
		// ========================================================

		var analysisPackage =
			rootPackage.Packages.AddNew(
				analysisDefinition.name,
				""
			);


		if (!analysisPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package d'analyse non créé"
			);
		}


		analysisPackage.Update();

		rootPackage.Packages.Refresh();


		// ========================================================
		// SYNCHRONISATION
		// ========================================================

		var synchronized =
			synchronizer._synchronizeAnalysisContent(
				rootPackage,
				analysisDefinition,
				analysisPackage
			);


		analysisPackage.Elements.Refresh();
		analysisPackage.Diagrams.Refresh();


		// ========================================================
		// DEFINITIONS ATTENDUES
		// ========================================================

		var artifactDefinitions =
			synchronizer._loadArtifactDefinitions(
				analysisDefinition
			);


		var diagramDefinitions =
			synchronizer._loadDiagramDefinitions(
				analysisDefinition.element
			);


		// ========================================================
		// COMPTAGE DES DIAGRAMMES OBLIGATOIRES
		// ========================================================

		var requiredDiagramCount = 0;


		for (
			var d = 0;
			d < diagramDefinitions.length;
			d++
		)
		{
			var effectiveConfig =
				synchronizer._resolveEffectiveDiagramConfig(
					diagramDefinitions[d]
				);


			if (
				effectiveConfig &&
				synchronizer._isRequiredDiagram(
					effectiveConfig
				)
			)
			{
				requiredDiagramCount++;
			}
		}


		// ========================================================
		// CONTROLES
		// ========================================================

		var artifactCountOK =
			analysisPackage.Elements.Count ==
				artifactDefinitions.length;


		var diagramCountOK =
			analysisPackage.Diagrams.Count ==
				requiredDiagramCount;


		// ========================================================
		// VERIFICATION DU REGISTRE ET DES HASH
		// ========================================================

		var registryPackage =
			synchronizer._resolveDiagramRegistryPackage(
				rootPackage
			);


		var registryOK =
			registryPackage != null;


		var hashesOK =
			true;


		if (registryPackage)
		{
			registryPackage.Elements.Refresh();


			for (
				var i = 0;
				i < analysisPackage.Diagrams.Count;
				i++
			)
			{
				var diagram =
					analysisPackage.Diagrams.GetAt(i);


				var registryEntry =
					synchronizer
						._findDiagramRegistryEntryByGeneratedGuid(
							registryPackage,
							diagram.DiagramGUID
						);


				if (!registryEntry)
				{
					registryOK = false;
					hashesOK = false;
					break;
				}


				var storedHash =
					addin.repositoryService.getTaggedValue(
						registryEntry,
						addin.fbaConstants.TAG_DIAGRAM_HASH
					);


				if (
					addin.utils.isEmpty(
						storedHash
					)
				)
				{
					hashesOK = false;
					break;
				}
			}
		}
		else
		{
			hashesOK = false;
		}


		// ========================================================
		// CAS INVALIDES
		// ========================================================

		var nullRoot =
			synchronizer._synchronizeAnalysisContent(
				null,
				analysisDefinition,
				analysisPackage
			);


		var nullDefinition =
			synchronizer._synchronizeAnalysisContent(
				rootPackage,
				null,
				analysisPackage
			);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			synchronized &&
			artifactCountOK &&
			diagramCountOK &&
			registryOK &&
			hashesOK &&
			nullRoot == false &&
			nullDefinition == false;


		addin.logger.info(
			"TEST synchronizeAnalysisContent"
			+ " | Synchronized=" + synchronized
			+ " | Artifacts="
				+ analysisPackage.Elements.Count
				+ "/" + artifactDefinitions.length
			+ " | ArtifactCount=" + artifactCountOK
			+ " | Diagrams="
				+ analysisPackage.Diagrams.Count
				+ "/" + requiredDiagramCount
			+ " | DiagramCount=" + diagramCountOK
			+ " | Registry=" + registryOK
			+ " | Hashes=" + hashesOK
			+ " | NullRoot=" + (nullRoot == false)
			+ " | NullDefinition=" + (nullDefinition == false)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Synchronisation du contenu d'analyse incorrecte"
		);
	},
		
	initializeAnalysisPackage: function()
	{
		var testName =
			"initializeAnalysisPackage";


		addin.logger.info(
			"----------------------------------------"
		);

		addin.logger.info(
			"RUN TEST | " + testName
		);


		var rootPackage =
			this._createFreshPackage(
				this.packageInitializeAnalysisPackage
			);


		if (!rootPackage)
		{
			return this._testResult(
				testName,
				false,
				"Root de test non créé"
			);
		}


		var synchronizer =
			addin.analysisStructureSynchronizer;


		// ========================================================
		// STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			synchronizer._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			return this._testResult(
				testName,
				false,
				"Librairie non créée"
			);
		}


		// ========================================================
		// DEFINITION
		// ========================================================

		var definitions =
			synchronizer._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			return this._testResult(
				testName,
				false,
				"Aucune définition"
			);
		}


		var definition =
			definitions[0];


		// ========================================================
		// PACKAGE VIDE NON INITIALISE
		// ========================================================

		var targetPackage =
			rootPackage.Packages.AddNew(
				definition.name,
				""
			);


		if (!targetPackage)
		{
			return this._testResult(
				testName,
				false,
				"Package cible non créé"
			);
		}


		targetPackage.Update();

		rootPackage.Packages.Refresh();


		var stateBefore =
			synchronizer._getAnalysisPackageInitializationState(
				targetPackage
			);


		// ========================================================
		// INITIALISATION
		// ========================================================

		var initialized =
			synchronizer.initializeAnalysisPackage(
				rootPackage,
				targetPackage
			);


		targetPackage.Elements.Refresh();
		targetPackage.Diagrams.Refresh();


		var stateAfter =
			synchronizer._getAnalysisPackageInitializationState(
				targetPackage
			);


		var sourceGuid =
			addin.repositoryService.getTaggedValue(
				targetPackage.Element,
				addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
			);


		var initializedTag =
			addin.repositoryService.getTaggedValue(
				targetPackage.Element,
				addin.fbaConstants.TAG_INITIALIZED
			);


		var sourceGuidOK =
			addin.utils.equalsIgnoreCase(
				sourceGuid,
				definition.guid
			);


		var initializedTagOK =
			addin.utils.equalsIgnoreCase(
				initializedTag,
				"true"
			);


		// ========================================================
		// IDEMPOTENCE
		//
		// Un second INITIALIZE doit faire SKIP.
		// Aucun nouvel artefact / diagramme.
		// ========================================================

		var elementCountBefore =
			targetPackage.Elements.Count;


		var diagramCountBefore =
			targetPackage.Diagrams.Count;


		var secondResult =
			synchronizer.initializeAnalysisPackage(
				rootPackage,
				targetPackage
			);


		targetPackage.Elements.Refresh();
		targetPackage.Diagrams.Refresh();


		var elementCountAfter =
			targetPackage.Elements.Count;


		var diagramCountAfter =
			targetPackage.Diagrams.Count;


		var idempotent =
			secondResult &&
			elementCountBefore == elementCountAfter &&
			diagramCountBefore == diagramCountAfter;


		// ========================================================
		// CAS INVALIDES
		// ========================================================

		var nullRoot =
			synchronizer.initializeAnalysisPackage(
				null,
				targetPackage
			);


		var nullPackage =
			synchronizer.initializeAnalysisPackage(
				rootPackage,
				null
			);


		// ========================================================
		// RESULTAT
		// ========================================================

		var valid =
			stateBefore == "NOT_ASSOCIATED" &&
			initialized &&
			stateAfter == "INITIALIZED" &&
			sourceGuidOK &&
			initializedTagOK &&
			idempotent &&
			nullRoot == false &&
			nullPackage == false;


		addin.logger.info(
			"TEST initializeAnalysisPackage"
			+ " | Before=" + stateBefore
			+ " | Initialized=" + initialized
			+ " | After=" + stateAfter
			+ " | SourceGuid=" + sourceGuidOK
			+ " | InitializedTag=" + initializedTagOK
			+ " | Idempotent=" + idempotent
			+ " | Elements="
				+ elementCountBefore
				+ "->" + elementCountAfter
			+ " | Diagrams="
				+ diagramCountBefore
				+ "->" + diagramCountAfter
			+ " | NullRoot=" + (nullRoot == false)
			+ " | NullPackage=" + (nullPackage == false)
		);


		if (valid)
		{
			addin.logger.info(
				"TEST " + testName + " OK"
			);
		}
		else
		{
			addin.logger.error(
				"TEST " + testName + " ECHEC"
			);
		}


		return this._testResult(
			testName,
			valid,
			valid
				? ""
				: "Initialisation du package incorrecte"
		);
	},
		
	testFindPackageBySourceGuidSQL: function()
	{
		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST SQL PACKAGE | Aucun package sélectionné"
			);

			return false;
		}


		var context =
			addin.analysisContextResolver.resolveContext(
				selectedPackage
			);


		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST SQL PACKAGE | ROOT introuvable"
			);

			return false;
		}


		var definitions =
			addin.analysisStructureSynchronizer._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			addin.logger.error(
				"TEST SQL PACKAGE | Aucune définition"
			);

			return false;
		}


		var definition =
			definitions[0];


		addin.logger.info(
			"TEST SQL PACKAGE"
			+ " | Definition=" + definition.name
			+ " | GUID=" + definition.guid
		);


		var start =
			new Date();


		var pkg =
			addin.repositoryService.findPackageBySourceGuidSQL(
				context.analysisRoot,
				definition.guid
			);


		var elapsed =
			new Date().getTime()
			- start.getTime();


		if (!pkg)
		{
			addin.logger.warning(
				"TEST SQL PACKAGE | Package non trouvé"
				+ " | GUID=" + definition.guid
				+ " | Temps=" + elapsed + " ms"
			);

			return true;
		}


		addin.logger.info(
			"TEST SQL PACKAGE = OK"
			+ " | Package=" + pkg.Name
			+ " | PackageID=" + pkg.PackageID
			+ " | Temps=" + elapsed + " ms"
		);


		return true;
	},
		
	testAnalysisPackageTagsSQL: function()
	{
		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST TAGS PACKAGE | Aucun package sélectionné"
			);

			return false;
		}


		var sql =
			"SELECT " +
			"o.Object_ID, " +
			"p.Package_ID, " +
			"p.Name AS Package_Name, " +
			"tv.Property AS Tag_Name, " +
			"tv.Value AS Tag_Value, " +
			"tv.Notes AS Tag_Notes " +

			"FROM t_object o " +

			"INNER JOIN t_package p " +
			"ON o.ea_guid = p.ea_guid " +

			"LEFT JOIN t_objectproperties tv " +
			"ON o.Object_ID = tv.Object_ID " +

			"WHERE p.ea_guid = " +
			addin.database.safeSQLString(
				selectedPackage.PackageGUID
			);


		var result =
			addin.database.query(sql);


		addin.logger.info(
			"TEST TAGS PACKAGE"
			+ " | Package=" + selectedPackage.Name
			+ " | Rows=" + result.Rows.length
		);


		for (var i = 0; i < result.Rows.length; i++)
		{
			var row = result.Rows[i];

			addin.logger.info(
				"TAG"
				+ " | Name=" + row.Tag_Name
				+ " | Value=" + row.Tag_Value
				+ " | Notes=" + row.Tag_Notes
			);
		}


		return true;
	},
	
	testArtifactDefinitionsSQL: function()
	{
		var start =
			new Date().getTime();

		var result =
			addin.repositoryService
				.getArtifactDefinitionsSQL();

		var elapsed =
			new Date().getTime() - start;

		if (!result)
		{
			addin.logger.error(
				"TEST SQL ARTIFACT DEFINITIONS = ECHEC"
			);

			return;
		}

		addin.logger.info(
			"TEST SQL ARTIFACT DEFINITIONS = OK"
			+ " | Rows=" + result.Rows.length
			+ " | Temps=" + elapsed + " ms"
		);

		for (
			var i = 0;
			i < result.Rows.length;
			i++
		)
		{
			var row =
				result.Rows[i];

			addin.logger.debug(
				"Artifact definition"
				+ " | Analysis=" + row.Analysis_Element
				+ " | Prototype=" + row.Prototype_Name
				+ " | Type=" + row.Prototype_Type
				+ " | Stereotype=" + row.Prototype_Stereotype
				+ " | Tag=" + row.Tag_Name
				+ " | Value=" + row.Tag_Value
			);
		}
	},
		
	testArtifactDefinitionsIndexSQL: function()
	{
		var start =
			new Date().getTime();

		var index =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();

		var elapsed =
			new Date().getTime() - start;

		var analysisCount = 0;
		var artifactCount = 0;

		for (var guid in index)
		{
			if (!index.hasOwnProperty(guid))
				continue;

			analysisCount++;

			artifactCount +=
				index[guid].length;
		}

		addin.logger.info(
			"TEST SQL ARTIFACT INDEX = OK"
			+ " | Analyses=" + analysisCount
			+ " | Artifacts=" + artifactCount
			+ " | Temps=" + elapsed + " ms"
		);
	},
		
		
	testAnalysisElementTagsIndexSQL: function()
	{
		var start =
			new Date().getTime();


		var index =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();


		var analysisCount = 0;
		var tagCount = 0;


		for (var guid in index)
		{
			if (!index.hasOwnProperty(guid))
				continue;

			analysisCount++;


			var tags =
				index[guid];


			for (var tagName in tags)
			{
				if (!tags.hasOwnProperty(tagName))
					continue;

				tagCount++;
			}
		}


		var elapsed =
			new Date().getTime() - start;


		addin.logger.info(
			"TEST SQL ANALYSIS TAG INDEX = OK"
			+ " | Analyses=" + analysisCount
			+ " | Tags=" + tagCount
			+ " | Temps=" + elapsed + " ms"
		);
	},
		
	testArtifactDefinitionExigencesSQL: function()
	{
		var targetGuid =
			addin.utils.normalizeGuid(
				"{37AF451E-1838-4adf-81ED-0C7BE0ED07B5}"
			);

		addin.logger.info(
			"===== TEST ARTIFACT DEFINITION SQL : EXIGENCES ====="
		);

		// --------------------------------------------------------
		// Chargement des index SQL
		// --------------------------------------------------------

		var artifactIndex =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();

		var analysisTagIndex =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();


		// --------------------------------------------------------
		// Recherche de l'élément Exigences
		// --------------------------------------------------------

		var analysisElement =
			addin.repositoryService
				.getElementByGuid(targetGuid);

		if (!analysisElement)
		{
			addin.logger.error(
				"TEST EXIGENCES = KO"
				+ " | Analysis Element introuvable"
				+ " | GUID=" + targetGuid
			);

			return;
		}


		addin.logger.info(
			"Analysis Element"
			+ " | Name=" + analysisElement.Name
			+ " | GUID=" + analysisElement.ElementGUID
		);


		// --------------------------------------------------------
		// Définitions d'artefacts trouvées par SQL
		// --------------------------------------------------------

		var definitions =
			artifactIndex[targetGuid];

		if (!definitions)
		{
			addin.logger.error(
				"TEST EXIGENCES = KO"
				+ " | Aucune définition d'artefact SQL"
			);

			return;
		}


		addin.logger.info(
			"Définitions SQL"
			+ " | Nombre=" + definitions.length
		);


		for (var i = 0; i < definitions.length; i++)
		{
			var definition = definitions[i];

			addin.logger.info(
				"SQL DEF #" + (i + 1)
				+ " | ConnectorID=" + definition.connectorId
				+ " | ConnectorGUID=" + definition.connectorGuid
				+ " | PrototypeID=" + definition.prototypeObjectId
				+ " | PrototypeGUID=" + definition.prototypeGuid
				+ " | PrototypeName=" + definition.prototypeName
				+ " | SQL Type=" + definition.prototypeType
				+ " | SQL Stereo=" + definition.prototypeStereotype
				+ " | Multiplicity=" + definition.multiplicity
			);


			// ----------------------------------------------------
			// Hydratation EA du prototype
			// ----------------------------------------------------

			var prototype =
				addin.repositoryService
					.getElementById(
						definition.prototypeObjectId
					);

			if (!prototype)
			{
				addin.logger.error(
					"Prototype EA introuvable"
					+ " | ObjectID="
					+ definition.prototypeObjectId
				);

				continue;
			}


			addin.logger.info(
				"EA PROTOTYPE"
				+ " | Name=" + prototype.Name
				+ " | Type=" + prototype.Type
				+ " | Stereotype=" + prototype.Stereotype
				+ " | StereotypeEx=" + prototype.StereotypeEx
				+ " | GUID=" + prototype.ElementGUID
			);


			// ----------------------------------------------------
			// Tags du connecteur Modeled by
			// ----------------------------------------------------

			var connectorTags =
				definition.connectorTags || {};

			for (var tagName in connectorTags)
			{
				if (!connectorTags.hasOwnProperty(tagName))
					continue;

				addin.logger.info(
					"CONNECTOR TAG"
					+ " | Name=" + tagName
					+ " | Value=" + connectorTags[tagName]
				);
			}
		}


		// --------------------------------------------------------
		// Tags de l'Analysis Element
		// --------------------------------------------------------

		var elementTags =
			analysisTagIndex[targetGuid] || {};

		for (var elementTagName in elementTags)
		{
			if (!elementTags.hasOwnProperty(elementTagName))
				continue;

			addin.logger.info(
				"ANALYSIS TAG"
				+ " | Name=" + elementTagName
				+ " | Value=" + elementTags[elementTagName]
			);
		}


		addin.logger.info(
			"===== FIN TEST ARTIFACT DEFINITION SQL : EXIGENCES ====="
		);
	},
	
	testLoadArtifactDefinitionsExigences: function()
	{
		var targetGuid =
			addin.utils.normalizeGuid(
				"{37AF451E-1838-4adf-81ED-0C7BE0ED07B5}"
			);

		addin.logger.info(
			"===== TEST LOAD ARTIFACT DEFINITIONS : EXIGENCES ====="
		);


		var analysisElement =
			addin.repositoryService
				.getElementByGuid(targetGuid);

		if (!analysisElement)
		{
			addin.logger.error(
				"Analysis Element Exigences introuvable"
			);

			return;
		}


		var artifactIndex =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();


		var analysisTagIndex =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();


		// Même structure que celle utilisée par le synchroniseur
		var analysisDefinition =
		{
			element: analysisElement,
			guid: analysisElement.ElementGUID,
			name: analysisElement.Name
		};


		var definitions =
			addin.analysisStructureSynchronizer
				._loadArtifactDefinitions(
					analysisDefinition,
					artifactIndex,
					analysisTagIndex
				);


		if (!definitions)
		{
			addin.logger.error(
				"_loadArtifactDefinitions retourne NULL"
			);

			return;
		}


		addin.logger.info(
			"Résultat _loadArtifactDefinitions"
			+ " | Nombre=" + definitions.length
		);


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var definition =
				definitions[i];


			addin.logger.info(
				"FINAL DEF #" + (i + 1)
				+ " | ElementType="
				+ definition.elementType
				+ " | Stereotype="
				+ definition.stereotype
				+ " | PrototypeGUID="
				+ definition.prototypeGuid
				+ " | ConnectorGUID="
				+ definition.connectorGuid
				+ " | Importance="
				+ definition.importanceLevel
				+ " | Multiplicity="
				+ definition.multiplicity
			);


			var discriminator = "";

			if (definition.taggedValues)
			{
				discriminator =
					definition.taggedValues[
						addin.fbaConstants
							.TAG_STEREOTYPE_DISCRIMINATOR
					];
			}


			addin.logger.info(
				"FINAL TAG"
				+ " | Discriminator="
				+ discriminator
			);


			if (definition.prototype)
			{
				addin.logger.info(
					"FINAL PROTOTYPE"
					+ " | Name="
					+ definition.prototype.Name
					+ " | Type="
					+ definition.prototype.Type
					+ " | Stereo="
					+ definition.prototype.StereotypeEx
				);
			}
			else
			{
				addin.logger.warning(
					"FINAL PROTOTYPE = NULL"
				);
			}
		}


		addin.logger.info(
			"===== FIN TEST LOAD ARTIFACT DEFINITIONS : EXIGENCES ====="
		);
	},
	
	testAnalysisPackageIndexSQL: function() 
	{
		var rootPackage;
		var index;
		var key;
		var count = 0;

		rootPackage = Repository.GetTreeSelectedPackage();

		if (!rootPackage) {
			addin.logger.error(
				"TEST PACKAGE INDEX SQL | Aucun package sélectionné"
			);
			return;
		}

		addin.logger.info(
			"===== TEST ANALYSIS PACKAGE INDEX SQL ====="
		);

		index =
			addin.repositoryService
				.getAnalysisPackageIndexSQL(rootPackage);

		for (key in index) {

			if (!index.hasOwnProperty(key)) {
				continue;
			}

			count++;

			addin.logger.info(
				"PACKAGE #" + count +
				" | Name=" + index[key].name +
				" | PackageID=" + index[key].packageId +
				" | PackageGUID=" + index[key].packageGuid +
				" | SourceGUID=" + index[key].sourceGuid
			);
		}

		addin.logger.info(
			"Résultat index packages | Nombre=" + count
		);

		addin.logger.info(
			"===== FIN TEST ANALYSIS PACKAGE INDEX SQL ====="
		);
	},
		
	testFindPackageFromIndex: function() 
	{
		var rootPackage;
		var definitions;
		var packageIndex;
		var testNames;
		var i;
		var j;
		var definition;
		var packageFound;

		rootPackage = Repository.GetTreeSelectedPackage();

		if (!rootPackage) {
			addin.logger.error(
				"TEST FIND PACKAGE FROM INDEX | Aucun package sélectionné"
			);
			return;
		}

		addin.logger.info(
			"===== TEST FIND PACKAGE FROM INDEX ====="
		);

		// Charge les définitions du métamodèle
		definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();

		// Charge UNE fois l'index SQL des packages
		packageIndex =
			addin.repositoryService
				.getAnalysisPackageIndexSQL(rootPackage);

		// Quelques cas représentatifs
		testNames = [
			"Besoins",
			"Exigences",
			"Processus",
			"Valeur métier"
		];

		for (i = 0; i < testNames.length; i++) {

			definition = null;

			// Recherche de la définition correspondante
			for (j = 0; j < definitions.length; j++) {

				if (
					addin.utils.equalsIgnoreCase(
						definitions[j].name,
						testNames[i]
					)
				) {
					definition = definitions[j];
					break;
				}
			}

			if (!definition) {

				addin.logger.error(
					"DEFINITION INTROUVABLE" +
					" | Name=" + testNames[i]
				);

				continue;
			}

			// Recherche via le nouvel index
			packageFound =
				addin.analysisStructureSynchronizer
					._findPackageFromIndex(
						packageIndex,
						definition
					);

			if (!packageFound) {

				addin.logger.error(
					"PACKAGE INTROUVABLE" +
					" | Definition=" + definition.name +
					" | SourceGUID=" + definition.guid
				);

				continue;
			}

			addin.logger.info(
				"PACKAGE TROUVE" +
				" | Definition=" + definition.name +
				" | Package=" + packageFound.Name +
				" | PackageID=" + packageFound.PackageID +
				" | PackageGUID=" + packageFound.PackageGUID +
				" | SourceGUID=" + definition.guid
			);
		}

		addin.logger.info(
			"===== FIN TEST FIND PACKAGE FROM INDEX ====="
		);
	},
		
	testAnalysisPackageIndexStructure: function() 
	{
		var rootPackage;
		var packageIndex;
		var key;
		var countGuid = 0;
		var countName = 0;

		rootPackage = Repository.GetTreeSelectedPackage();

		if (!rootPackage) {
			addin.logger.error(
				"TEST PACKAGE INDEX STRUCTURE | Aucun package sélectionné"
			);
			return;
		}

		addin.logger.info(
			"===== TEST PACKAGE INDEX STRUCTURE ====="
		);

		packageIndex =
			addin.repositoryService
				.getAnalysisPackageIndexSQL(rootPackage);

		if (!packageIndex) {
			addin.logger.error(
				"packageIndex = NULL"
			);
			return;
		}

		if (!packageIndex.bySourceGuid) {
			addin.logger.error(
				"packageIndex.bySourceGuid = NULL"
			);
		} else {

			for (key in packageIndex.bySourceGuid) {

				if (!packageIndex.bySourceGuid.hasOwnProperty(key)) {
					continue;
				}

				countGuid++;

				addin.logger.info(
					"GUID INDEX" +
					" | Key=" + key +
					" | Name=" +
						packageIndex.bySourceGuid[key].name +
					" | PackageID=" +
						packageIndex.bySourceGuid[key].packageId
				);
			}
		}

		if (!packageIndex.byName) {
			addin.logger.error(
				"packageIndex.byName = NULL"
			);
		} else {

			for (key in packageIndex.byName) {

				if (!packageIndex.byName.hasOwnProperty(key)) {
					continue;
				}

				countName++;
			}
		}

		addin.logger.info(
			"INDEX RESULT" +
			" | BySourceGuid=" + countGuid +
			" | ByName=" + countName
		);

		// Test direct avec le GUID connu de Besoins
		key = addin.utils.normalizeGuid(
			"{122D8FBD-657B-44e6-B09C-20919F507D28}"
		);

		addin.logger.info(
			"LOOKUP BESOINS" +
			" | NormalizedKey=" + key +
			" | Found=" +
			(
				packageIndex.bySourceGuid &&
				packageIndex.bySourceGuid[key]
					? "YES"
					: "NO"
			)
		);

		addin.logger.info(
			"===== FIN TEST PACKAGE INDEX STRUCTURE ====="
		);
	},
	
	testGetPackageFromIndex: function() 
	{
		var rootPackage;
		var packageIndex;
		var sourceGuid;
		var entry;
		var packageFound;

		rootPackage = Repository.GetTreeSelectedPackage();

		if (!rootPackage) {
			addin.logger.error(
				"TEST GET PACKAGE FROM INDEX | Aucun package sélectionné"
			);
			return;
		}

		addin.logger.info(
			"===== TEST GET PACKAGE FROM INDEX ====="
		);

		packageIndex =
			addin.repositoryService
				.getAnalysisPackageIndexSQL(rootPackage);

		sourceGuid = addin.utils.normalizeGuid(
			"{122D8FBD-657B-44e6-B09C-20919F507D28}"
		);

		entry = packageIndex.bySourceGuid[sourceGuid];

		if (!entry) {
			addin.logger.error(
				"ENTRY INTROUVABLE | SourceGUID=" + sourceGuid
			);
			return;
		}

		addin.logger.info(
			"ENTRY TROUVEE" +
			" | Name=" + entry.name +
			" | PackageID=" + entry.packageId +
			" | PackageGUID=" + entry.packageGuid
		);

		packageFound =
			addin.repositoryService.getPackageById(
				entry.packageId
			);

		if (!packageFound) {
			addin.logger.error(
				"EA PACKAGE INTROUVABLE" +
				" | PackageID=" + entry.packageId
			);
			return;
		}

		addin.logger.info(
			"EA PACKAGE TROUVE" +
			" | Name=" + packageFound.Name +
			" | PackageID=" + packageFound.PackageID +
			" | PackageGUID=" + packageFound.PackageGUID
		);

		addin.logger.info(
			"===== FIN TEST GET PACKAGE FROM INDEX ====="
		);
	},
		
	testCompleteAnalysisPackage: function()
	{
		addin.logger.info(
			"=== TEST COMPLETE ANALYSIS PACKAGE - BLOC 1 ==="
		);


		// ========================================================
		// 1. PACKAGE SELECTIONNE
		// ========================================================

		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST COMPLETE impossible : aucun package sélectionné"
			);

			return false;
		}


		addin.logger.info(
			"Package sélectionné"
			+ " | Name=" + selectedPackage.Name
			+ " | GUID=" + selectedPackage.PackageGUID
		);


		// ========================================================
		// 2. RESOLUTION DU CONTEXTE
		// ========================================================

		var context =
			addin.analysisContextResolver.resolvePackage(
				selectedPackage
			);


		if (!context)
		{
			addin.logger.error(
				"TEST COMPLETE impossible : contexte introuvable"
			);

			return false;
		}


		if (!context.analysisRoot)
		{
			addin.logger.error(
				"TEST COMPLETE impossible : ROOT d'analyse introuvable"
			);

			return false;
		}


		if (!context.targetPackage)
		{
			addin.logger.error(
				"TEST COMPLETE impossible : package cible introuvable"
			);

			return false;
		}


		addin.logger.info(
			"Contexte résolu"
			+ " | Root=" + context.analysisRoot.Name
			+ " | Target=" + context.targetPackage.Name
		);


		// ========================================================
		// 3. LE TEST PORTE SUR UN PACKAGE D'ANALYSE
		//
		// completeAnalysisPackage() ne doit pas recevoir le ROOT
		// comme package cible.
		// ========================================================

		if (
			addin.utils.equalsIgnoreCase(
				context.analysisRoot.PackageGUID,
				context.targetPackage.PackageGUID
			)
		)
		{
			addin.logger.error(
				"TEST COMPLETE PACKAGE impossible :"
				+ " le ROOT est sélectionné."
				+ " Sélectionner un package d'analyse"
				+ " (par exemple Exigences)."
			);

			return false;
		}


		// ========================================================
		// 4. APPEL DIRECT DU SYNCHRONIZER
		//
		// On teste volontairement completeAnalysisPackage()
		// directement, sans passer par frameworkBA.
		// ========================================================

		addin.logger.info(
			"Appel completeAnalysisPackage"
			+ " | Package=" + context.targetPackage.Name
		);


		var result =
			addin.analysisStructureSynchronizer.completeAnalysisPackage(
				context.analysisRoot,
				context.targetPackage
			);


		// ========================================================
		// 5. RESULTAT
		// ========================================================

		addin.logger.info(
			"=== RESULTAT TEST COMPLETE"
			+ " | Success=" + result
			+ " ==="
		);


		return result;
	},
	
	testCompleteAnalysisRoot: function()
	{
		addin.logger.info(
			"=== TEST COMPLETE ANALYSIS ROOT ==="
		);


		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné"
			);

			return false;
		}


		var context =
			addin.analysisContextResolver.resolvePackage(
				selectedPackage
			);


		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"Contexte d'analyse introuvable"
			);

			return false;
		}


		addin.logger.info(
			"Contexte ROOT résolu"
			+ " | Root=" + context.analysisRoot.Name
			+ " | GUID=" + context.analysisRoot.PackageGUID
		);


		var result =
			addin.analysisStructureSynchronizer.completeAnalysis(
				context.analysisRoot
			);


		addin.logger.info(
			"=== RESULTAT TEST COMPLETE ROOT"
			+ " | Success=" + result
			+ " ==="
		);


		return result;
	},
	
	testCheckAnalysisPackage: function()
	{
		addin.logger.info(
			"=== TEST CHECK ANALYSIS PACKAGE - BLOC 1 ==="
		);

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné."
			);
			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				selectedPackage
			);

		if (!context ||
			!context.analysisRoot ||
			!context.targetPackage)
		{
			addin.logger.error(
				"Contexte d'analyse invalide."
			);
			return false;
		}

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					context.targetPackage
				);

		addin.logger.info(
			"=== RESULTAT CHECK"
			+ " | Success=" + result.success
			+ " | Issues=" + result.issues.length
			+ " ==="
		);

		return result.success;
	},
		
	testCheckAnalysisRoot: function()
	{
		addin.logger.info(
			"=== TEST CHECK ANALYSIS ROOT - BLOC 1 ==="
		);

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné."
			);
			return false;
		}


		var context =
			addin.analysisContextResolver.resolvePackage(
				selectedPackage
			);


		if (!context ||
			!context.analysisRoot)
		{
			addin.logger.error(
				"Contexte d'analyse invalide."
			);

			return false;
		}


		addin.logger.info(
			"Root résolu"
			+ " | Root=" + context.analysisRoot.Name
		);


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					context.analysisRoot
				);


		addin.logger.info(
			"=== RESULTAT CHECK ROOT"
			+ " | Success=" + result.success
			+ " | PackagesChecked="
			+ result.summary.packagesChecked
			+ " | Issues="
			+ result.issues.length
			+ " ==="
		);


		return result.success;
	},
	
	testRepairAnalysisPackage: function()
	{
		addin.logger.info(
			"=== TEST REPAIR ANALYSIS PACKAGE ==="
		);


		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné"
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
			addin.logger.error(
				"Contexte d'analyse invalide"
			);

			return false;
		}


		var result =
			addin.analysisStructureSynchronizer
				.repairAnalysisPackage(
					context.analysisRoot,
					context.targetPackage
				);


		addin.logger.info(
			"=== RESULTAT REPAIR"
			+ " | Success="
			+ result
			+ " ==="
		);


		return result;
	},
		
	testRepairAnalysis: function()
	{
		addin.logger.info(
			"=== TEST REPAIR ANALYSIS ROOT ==="
		);


		// ========================================================
		// 1. PACKAGE SELECTIONNE
		// ========================================================

		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné"
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
				"Contexte d'analyse invalide"
			);

			return false;
		}


		// ========================================================
		// 3. REPAIR ROOT
		// ========================================================

		addin.logger.info(
			"Lancement REPAIR ROOT"
			+ " | Root=" + context.analysisRoot.Name
			+ " | GUID=" + context.analysisRoot.PackageGUID
		);


		var result =
			addin.analysisStructureSynchronizer
				.repairAnalysis(
					context.analysisRoot
				);


		// ========================================================
		// 4. RESULTAT
		// ========================================================

		addin.logger.info(
			"=== RESULTAT REPAIR ROOT"
			+ " | Success=" + result
			+ " ==="
		);


		return result;
	},
	
	testCheckPersistence: function()
	{
		addin.logger.info("=== TEST CHECK PERSISTENCE ===");

		var selectedPackage = Repository.GetTreeSelectedPackage();

		if (!selectedPackage || !selectedPackage.Element) {
			addin.logger.error("Aucun package sélectionné.");
			return false;
		}

		var issues = [
			{
				code: addin.fbaConstants.CHECK_ISSUE_ARTIFACT_NOTE_MISSING,
				severity: addin.fbaConstants.CHECK_SEVERITY_ERROR,
				action: addin.fbaConstants.CHECK_ACTION_NONE
			}
		];

		var result =
			addin.analysisStructureSynchronizer._persistCheckResult(
				selectedPackage.Element,
				issues
			);

		addin.logger.info(
			"TEST CHECK PERSISTENCE | Package=" +
			selectedPackage.Name +
			" | Success=" + result
		);

		return result;
	},
	
	testDiagramCheckPersistence: function()
	{
		addin.logger.info(
			"=== TEST DIAGRAM CHECK PERSISTENCE ==="
		);

		// ========================================================
		// PACKAGE SELECTIONNE
		// ========================================================

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné dans le Project Browser."
			);

			return false;
		}

		// ========================================================
		// CONTEXTE D'ANALYSE
		// ========================================================

		var context =
			addin.analysisContextResolver.resolveContext(
				selectedPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"Contexte d'analyse introuvable."
			);

			return false;
		}

		// ========================================================
		// DIAGRAMME DU PACKAGE
		// ========================================================

		if (
			!selectedPackage.Diagrams ||
			selectedPackage.Diagrams.Count === 0
		)
		{
			addin.logger.error(
				"Aucun diagramme dans le package"
				+ " | Package=" + selectedPackage.Name
			);

			return false;
		}

		var diagram =
			selectedPackage.Diagrams.GetAt(0);

		if (!diagram)
		{
			addin.logger.error(
				"Impossible de récupérer le diagramme."
			);

			return false;
		}

		addin.logger.info(
			"Diagramme sélectionné pour le test"
			+ " | Package=" + selectedPackage.Name
			+ " | Diagram=" + diagram.Name
			+ " | GUID=" + diagram.DiagramGUID
		);

		// ========================================================
		// ISSUE DE TEST
		// ========================================================

		var issues = [
			{
				code:
					addin.fbaConstants.CHECK_ISSUE_DIAGRAM_NOTE_MISSING,

				severity:
					addin.fbaConstants.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants.CHECK_ACTION_NONE
			}
		];

		// ========================================================
		// PERSISTENCE
		// ========================================================

		var result =
			addin.analysisStructureSynchronizer._persistDiagramCheckResult(
				context.analysisRoot,
				diagram,
				issues,
				null
			);

		addin.logger.info(
			"TEST DIAGRAM CHECK PERSISTENCE"
			+ " | Package=" + selectedPackage.Name
			+ " | Diagram=" + diagram.Name
			+ " | Success=" + result
		);

		return result;
	},
	
	testCheckResultStructure: function()
	{
		addin.logger.info(
			"=== TEST CHECK RESULT STRUCTURE ==="
		);

		// ========================================================
		// PACKAGE SELECTIONNE
		// ========================================================

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné dans le Project Browser."
			);

			return false;
		}

		// ========================================================
		// CONTEXTE
		// ========================================================

		var context =
			addin.analysisContextResolver.resolveContext(
				selectedPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"Contexte d'analyse introuvable."
			);

			return false;
		}

		// ========================================================
		// CHECK RESULT
		// ========================================================

		var result =
			addin.analysisStructureSynchronizer._createCheckResult(
				addin.fbaConstants.CONTEXT_ANALYSIS_ROOT,
				context.analysisRoot
			);

		if (!result)
		{
			addin.logger.error(
				"Impossible de créer le CheckResult."
			);

			return false;
		}

		// ========================================================
		// VALIDATION STRUCTURE
		// ========================================================

		addin.logger.info(
			"CheckResult créé"
			+ " | Scope=" + result.scope
			+ " | Root=" + result.root.name
			+ " | GUID=" + result.root.guid
			+ " | CheckedAt=" + result.checkedAt
		);

		addin.logger.info(
			"Summary"
			+ " | Errors=" + result.summary.errors
			+ " | Warnings=" + result.summary.warnings
			+ " | INIT=" + result.summary.init
			+ " | COMPLETE=" + result.summary.complete
			+ " | REPAIR=" + result.summary.repair
			+ " | NONE=" + result.summary.none
		);

		addin.logger.info(
			"Metrics packages"
			+ " | Expected=" + result.metrics.packages.expected
			+ " | Found=" + result.metrics.packages.found
			+ " | Missing=" + result.metrics.packages.missing
			+ " | Foreign=" + result.metrics.packages.foreign
		);

		addin.logger.info(
			"Metrics diagrams"
			+ " | Expected=" + result.metrics.diagrams.expected
			+ " | Found=" + result.metrics.diagrams.found
			+ " | Missing=" + result.metrics.diagrams.missing
			+ " | Foreign=" + result.metrics.diagrams.foreign
		);

		addin.logger.info(
			"Metrics artifacts"
			+ " | Expected=" + result.metrics.artifacts.expected
			+ " | Found=" + result.metrics.artifacts.found
			+ " | Missing=" + result.metrics.artifacts.missing
			+ " | Foreign=" + result.metrics.artifacts.foreign
		);

		addin.logger.info(
			"AnalysisElements="
			+ result.analysisElements.length
		);

		addin.logger.info(
			"=== TEST CHECK RESULT STRUCTURE OK ==="
		);

		return true;
	},
	
	testCheckAnalysisPackageHierarchy: function()
	{
		addin.logger.info(
			"=== TEST CHECK ANALYSIS PACKAGE HIERARCHY ==="
		);


		// ========================================================
		// 1. PACKAGE D'ANALYSE SELECTIONNE
		// ========================================================

		var analysisPackage =
			Repository.GetTreeSelectedPackage();


		if (!analysisPackage)
		{
			addin.logger.error(
				"TEST impossible : aucun package sélectionné"
			);

			return false;
		}


		addin.logger.info(
			"Package sélectionné"
			+ " | Package=" + analysisPackage.Name
			+ " | GUID=" + analysisPackage.PackageGUID
		);


		// ========================================================
		// 2. RECHERCHE DU ROOT D'ANALYSE
		// ========================================================

		var rootPackage =
			analysisPackage;


		while (
			rootPackage &&
			!addin.analysisResolver.isValidAnalysisRoot(
				rootPackage
			)
		)
		{
			if (
				!rootPackage.ParentID ||
				rootPackage.ParentID <= 0
			)
			{
				rootPackage = null;
				break;
			}


			rootPackage =
				addin.repositoryService.getPackageById(
					rootPackage.ParentID
				);
		}


		if (!rootPackage)
		{
			addin.logger.error(
				"TEST impossible : root d'analyse introuvable"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		addin.logger.info(
			"Root d'analyse"
			+ " | Root=" + rootPackage.Name
			+ " | GUID=" + rootPackage.PackageGUID
		);


		// ========================================================
		// 3. EXECUTION DU VRAI CHECK PACKAGE
		// ========================================================

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					rootPackage,
					analysisPackage
				);


		if (!result)
		{
			addin.logger.error(
				"TEST KO : aucun résultat retourné"
			);

			return false;
		}


		// ========================================================
		// 4. RESULTAT GLOBAL
		// ========================================================

		addin.logger.info(
			"CHECK RESULT"
			+ " | Success=" + result.success
			+ " | Scope=" + result.scope
			+ " | Issues=" + result.issues.length
			+ " | Errors=" + result.summary.errors
			+ " | Warnings=" + result.summary.warnings
		);


		addin.logger.info(
			"PACKAGE METRICS"
			+ " | Found=" + result.metrics.packages.found
			+ " | Compliant=" + result.metrics.packages.compliant
			+ " | NonCompliant="
			+ result.metrics.packages.nonCompliant
		);


		addin.logger.info(
			"ARTIFACT METRICS"
			+ " | Expected=" + result.metrics.artifacts.expected
			+ " | Found=" + result.metrics.artifacts.found
			+ " | Missing=" + result.metrics.artifacts.missing
		);


		addin.logger.info(
			"DIAGRAM METRICS"
			+ " | Expected=" + result.metrics.diagrams.expected
			+ " | Found=" + result.metrics.diagrams.found
			+ " | Missing=" + result.metrics.diagrams.missing
		);


		// ========================================================
		// 5. ANALYSIS ELEMENT
		// ========================================================

		if (
			!result.analysisElements ||
			result.analysisElements.length == 0
		)
		{
			addin.logger.error(
				"TEST KO : aucun Analysis Element dans le résultat"
			);

			return false;
		}


		var analysisElement =
			result.analysisElements[0];


		addin.logger.info(
			"ANALYSIS ELEMENT"
			+ " | Definition="
			+ analysisElement.definition.name
			+ " | DefinitionGUID="
			+ analysisElement.definition.guid
			+ " | Package="
			+ analysisElement.package.name
			+ " | Status="
			+ analysisElement.status
			+ " | Issues="
			+ analysisElement.issues.length
		);


		// ========================================================
		// 6. DIAGRAMMES
		// ========================================================

		addin.logger.info(
			"ANALYSIS ELEMENT DIAGRAMS="
			+ analysisElement.diagrams.length
		);


		for (
			var d = 0;
			d < analysisElement.diagrams.length;
			d++
		)
		{
			var diagramResult =
				analysisElement.diagrams[d];


			addin.logger.info(
				"DIAGRAM RESULT"
				+ " | DefinitionGUID="
				+ diagramResult.definition.guid
				+ " | ExpectedMetaType="
				+ diagramResult.definition.metaType
				+ " | Importance="
				+ diagramResult.definition.importance
				+ " | Found="
				+ diagramResult.found
				+ " | Status="
				+ diagramResult.status
				+ " | Issues="
				+ diagramResult.issues.length
			);


			addin.logger.info(
				"DIAGRAM INSTANCE"
				+ " | Name="
				+ diagramResult.diagram.name
				+ " | GUID="
				+ diagramResult.diagram.guid
				+ " | MetaType="
				+ diagramResult.diagram.metaType
			);


			addin.logger.info(
				"DIAGRAM RESULT METRICS"
				+ " | Found="
				+ diagramResult.metrics.diagrams.found
				+ " | Compliant="
				+ diagramResult.metrics.diagrams.compliant
				+ " | NonCompliant="
				+ diagramResult.metrics.diagrams.nonCompliant
				+ " | Missing="
				+ diagramResult.metrics.diagrams.missing
			);


			// ====================================================
			// 7. ARTEFACTS DU DIAGRAMME
			// ====================================================

			addin.logger.info(
				"DIAGRAM ARTIFACTS="
				+ diagramResult.artifacts.length
			);


			for (
				var a = 0;
				a < diagramResult.artifacts.length;
				a++
			)
			{
				var artifactResult =
					diagramResult.artifacts[a];


				addin.logger.info(
					"DIAGRAM ARTIFACT RESULT"
					+ " | Definition="
					+ artifactResult.definition.name
					+ " | DefinitionGUID="
					+ artifactResult.definition.guid
					+ " | Type="
					+ artifactResult.definition.type
					+ " | Stereo="
					+ artifactResult.definition.stereotype
					+ " | Found="
					+ artifactResult.found
					+ " | Status="
					+ artifactResult.status
					+ " | Issues="
					+ artifactResult.issues.length
				);


				addin.logger.info(
					"DIAGRAM ARTIFACT INSTANCE"
					+ " | Name="
					+ artifactResult.artifact.name
					+ " | GUID="
					+ artifactResult.artifact.guid
					+ " | Type="
					+ artifactResult.artifact.type
					+ " | Stereo="
					+ artifactResult.artifact.stereotype
				);
			}
		}


		// ========================================================
		// 8. VALIDATION DU TEST
		// ========================================================

		if (analysisElement.diagrams.length == 0)
		{
			addin.logger.error(
				"TEST KO : aucun diagramme dans la hiérarchie"
			);

			return false;
		}


		var firstDiagram =
			analysisElement.diagrams[0];


		if (
			!firstDiagram.artifacts ||
			firstDiagram.artifacts.length == 0
		)
		{
			addin.logger.error(
				"TEST KO : aucun artefact dans le diagramme"
			);

			return false;
		}


		addin.logger.info(
			"=== TEST CHECK ANALYSIS PACKAGE HIERARCHY OK ==="
		);


		return true;
	},
	
	
	testFindArtifactsOnDiagramMatchingDefinition: function()
	{
		addin.logger.info(
			"=== TEST FIND ARTIFACTS ON DIAGRAM MATCHING DEFINITION ==="
		);


		// ========================================================
		// 1. PACKAGE SELECTIONNE
		// ========================================================

		var analysisPackage =
			Repository.GetTreeSelectedPackage();


		if (!analysisPackage)
		{
			addin.logger.error(
				"TEST impossible : aucun package sélectionné"
			);

			return false;
		}


		addin.logger.info(
			"Package sélectionné"
			+ " | Package=" + analysisPackage.Name
			+ " | GUID=" + analysisPackage.PackageGUID
		);


		// ========================================================
		// 2. DEFINITIONS D'ANALYSE
		// ========================================================

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			addin.logger.error(
				"TEST impossible : aucune définition d'analyse"
			);

			return false;
		}


		// ========================================================
		// 3. DEFINITION CORRESPONDANT AU PACKAGE
		// ========================================================

		var analysisDefinition =
			addin.analysisStructureSynchronizer
				.findDefinitionForPackage(
					analysisPackage,
					definitions
				);


		if (!analysisDefinition)
		{
			addin.logger.error(
				"TEST impossible : définition d'analyse introuvable"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		addin.logger.info(
			"Définition d'analyse"
			+ " | Name=" + analysisDefinition.name
			+ " | GUID=" + analysisDefinition.guid
		);


		// ========================================================
		// 4. INDEX DES DEFINITIONS D'ARTEFACTS
		// ========================================================

		var artifactIndex =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();


		var analysisTagIndex =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();


		if (!artifactIndex)
		{
			artifactIndex = {};
		}


		if (!analysisTagIndex)
		{
			analysisTagIndex = {};
		}


		// ========================================================
		// 5. DEFINITIONS CANONIQUES D'ARTEFACTS
		// ========================================================

		var artifactDefinitions =
			addin.analysisStructureSynchronizer
				._loadArtifactDefinitions(
					analysisDefinition,
					artifactIndex,
					analysisTagIndex
				);


		if (!artifactDefinitions)
		{
			artifactDefinitions = [];
		}


		addin.logger.info(
			"Définitions d'artefacts"
			+ " | Count=" + artifactDefinitions.length
		);


		if (artifactDefinitions.length == 0)
		{
			addin.logger.error(
				"TEST impossible : aucune définition d'artefact"
			);

			return false;
		}


		// ========================================================
		// 6. DEFINITIONS DE DIAGRAMMES
		// ========================================================

		var diagramDefinitions =
			addin.analysisStructureSynchronizer
				._loadDiagramDefinitions(
					analysisDefinition.element
				);


		if (
			!diagramDefinitions ||
			diagramDefinitions.length == 0
		)
		{
			addin.logger.error(
				"TEST impossible : aucune définition de diagramme"
			);

			return false;
		}


		var diagramDefinition =
			diagramDefinitions[0];


		addin.logger.info(
			"Définition de diagramme"
			+ " | GUID=" + diagramDefinition.guid
			+ " | MetaType=" + diagramDefinition.metaType
		);


		// ========================================================
		// 7. DEFINITIONS D'ARTEFACTS ATTENDUES SUR LE DIAGRAMME
		// ========================================================

		var diagramArtifactDefinitions =
			addin.analysisStructureSynchronizer
				._loadDiagramArtifactDefinitions(
					diagramDefinition.diagram
				);


		if (
			!diagramArtifactDefinitions ||
			diagramArtifactDefinitions.length == 0
		)
		{
			addin.logger.error(
				"TEST impossible : aucun artefact attendu"
				+ " sur la définition du diagramme"
			);

			return false;
		}


		var diagramArtifactDefinition =
			diagramArtifactDefinitions[0];


		addin.logger.info(
			"Artefact attendu sur diagramme"
			+ " | Name=" + diagramArtifactDefinition.name
			+ " | Type=" + diagramArtifactDefinition.type
			+ " | Stereo=" + diagramArtifactDefinition.stereotype
			+ " | GUID=" + diagramArtifactDefinition.guid
		);


		// ========================================================
		// 8. RESOLUTION DE LA DEFINITION CANONIQUE
		// ========================================================

		var canonicalDefinitions =
			addin.analysisStructureSynchronizer
				._findCanonicalArtifactDefinitions(
					diagramArtifactDefinition,
					artifactDefinitions
				);


		if (!canonicalDefinitions)
		{
			canonicalDefinitions = [];
		}


		addin.logger.info(
			"Résolution canonique"
			+ " | Count=" + canonicalDefinitions.length
		);


		if (canonicalDefinitions.length == 0)
		{
			addin.logger.error(
				"TEST impossible : aucune définition canonique"
			);

			return false;
		}


		if (canonicalDefinitions.length > 1)
		{
			addin.logger.error(
				"TEST impossible : définition canonique ambiguë"
				+ " | Nombre=" + canonicalDefinitions.length
			);

			return false;
		}


		var canonicalArtifactDefinition =
			canonicalDefinitions[0];


		addin.logger.info(
			"Définition canonique"
			+ " | PrototypeGUID="
			+ canonicalArtifactDefinition.prototypeGuid
			+ " | Type="
			+ canonicalArtifactDefinition.elementType
			+ " | Stereo="
			+ canonicalArtifactDefinition.stereotype
		);


		// ========================================================
		// 9. RECHERCHE DU DIAGRAMME REEL DANS LE PACKAGE
		//
		// Pour ce test unitaire, pas besoin du registry ni du root.
		// On recherche le diagramme correspondant par MetaType.
		// ========================================================

		var diagram =
			null;


		var packageDiagrams =
			analysisPackage.Diagrams;


		for (
			var diagramIndex = 0;
			diagramIndex < packageDiagrams.Count;
			diagramIndex++
		)
		{
			var candidateDiagram =
				packageDiagrams.GetAt(
					diagramIndex
				);


			if (!candidateDiagram)
			{
				continue;
			}


			if (
				addin.utils.equalsIgnoreCase(
					addin.utils.trim(
						candidateDiagram.MetaType
					),
					addin.utils.trim(
						diagramDefinition.metaType
					)
				)
			)
			{
				diagram =
					candidateDiagram;

				break;
			}
		}


		if (!diagram)
		{
			addin.logger.error(
				"TEST impossible : diagramme réel introuvable"
				+ " | ExpectedMetaType="
				+ diagramDefinition.metaType
			);

			return false;
		}


		addin.logger.info(
			"Diagramme réel"
			+ " | Name=" + diagram.Name
			+ " | GUID=" + diagram.DiagramGUID
			+ " | MetaType=" + diagram.MetaType
		);


		// ========================================================
		// 10. RECHERCHE DES ARTEFACTS CORRESPONDANTS
		//     REELLEMENT PRESENTS SUR LE DIAGRAMME
		// ========================================================

		var matchingArtifacts =
			addin.analysisStructureSynchronizer
				._findArtifactsOnDiagramMatchingDefinition(
					diagram,
					canonicalArtifactDefinition,
					artifactDefinitions
				);


		if (!matchingArtifacts)
		{
			matchingArtifacts = [];
		}


		// ========================================================
		// 11. RESULTAT
		// ========================================================

		addin.logger.info(
			"DIAGRAM ARTIFACT MATCH"
			+ " | Diagram=" + diagram.Name
			+ " | Definition="
			+ diagramArtifactDefinition.name
			+ " | CanonicalGUID="
			+ canonicalArtifactDefinition.prototypeGuid
			+ " | Found="
			+ matchingArtifacts.length
		);


		for (
			var artifactIndexResult = 0;
			artifactIndexResult < matchingArtifacts.length;
			artifactIndexResult++
		)
		{
			var matchedArtifact =
				matchingArtifacts[
					artifactIndexResult
				];


			addin.logger.info(
				"MATCHED ARTIFACT"
				+ " | Name=" + matchedArtifact.Name
				+ " | GUID=" + matchedArtifact.ElementGUID
				+ " | Type=" + matchedArtifact.Type
				+ " | Stereo=" + matchedArtifact.StereotypeEx
			);
		}


		// ========================================================
		// 12. ASSERTION DU TEST
		// ========================================================

		if (matchingArtifacts.length != 1)
		{
			addin.logger.error(
				"TEST KO"
				+ " | Expected=1"
				+ " | Found=" + matchingArtifacts.length
			);

			return false;
		}


		addin.logger.info(
			"=== TEST FIND ARTIFACTS ON DIAGRAM MATCHING DEFINITION OK ==="
		);


		return true;
	},
		
	testCheckDiagramArtifacts: function()
	{
		addin.logger.info(
			"=== TEST CHECK DIAGRAM ARTIFACTS ==="
		);


		// ========================================================
		// 1. PACKAGE SELECTIONNE
		// ========================================================

		var analysisPackage =
			Repository.GetTreeSelectedPackage();


		if (!analysisPackage)
		{
			addin.logger.error(
				"TEST impossible : aucun package sélectionné"
			);

			return false;
		}


		// ========================================================
		// 2. DEFINITION DE L'ELEMENT D'ANALYSE
		// ========================================================

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();


		if (!definitions || definitions.length == 0)
		{
			addin.logger.error(
				"TEST impossible : aucune définition d'analyse"
			);

			return false;
		}


		var analysisDefinition =
			addin.analysisStructureSynchronizer
				.findDefinitionForPackage(
					analysisPackage,
					definitions
				);


		if (!analysisDefinition)
		{
			addin.logger.error(
				"TEST impossible : définition d'analyse introuvable"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		// ========================================================
		// 3. DEFINITIONS CANONIQUES DES ARTEFACTS
		// ========================================================

		var artifactIndex =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();


		var analysisTagIndex =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();


		if (!artifactIndex)
			artifactIndex = {};

		if (!analysisTagIndex)
			analysisTagIndex = {};


		var artifactDefinitions =
			addin.analysisStructureSynchronizer
				._loadArtifactDefinitions(
					analysisDefinition,
					artifactIndex,
					analysisTagIndex
				);


		if (!artifactDefinitions)
			artifactDefinitions = [];


		// ========================================================
		// 4. DEFINITION DU DIAGRAMME
		// ========================================================

		var diagramDefinitions =
			addin.analysisStructureSynchronizer
				._loadDiagramDefinitions(
					analysisDefinition.element
				);


		if (!diagramDefinitions || diagramDefinitions.length == 0)
		{
			addin.logger.error(
				"TEST impossible : aucune définition de diagramme"
			);

			return false;
		}


		var diagramDefinition =
			diagramDefinitions[0];


		// ========================================================
		// 5. TROUVER LE DIAGRAMME REEL
		// ========================================================

		var diagram = null;

		var packageDiagrams =
			analysisPackage.Diagrams;


		for (
			var diagramIndex = 0;
			diagramIndex < packageDiagrams.Count;
			diagramIndex++
		)
		{
			var candidateDiagram =
				packageDiagrams.GetAt(
					diagramIndex
				);


			if (!candidateDiagram)
				continue;


			if (
				addin.utils.equalsIgnoreCase(
					addin.utils.trim(
						candidateDiagram.MetaType
					),
					addin.utils.trim(
						diagramDefinition.metaType
					)
				)
			)
			{
				diagram =
					candidateDiagram;

				break;
			}
		}


		if (!diagram)
		{
			addin.logger.error(
				"TEST impossible : diagramme réel introuvable"
				+ " | MetaType="
				+ diagramDefinition.metaType
			);

			return false;
		}


		// ========================================================
		// 6. CREER LE RESULTAT DU DIAGRAMME
		// ========================================================

		var effectiveConfig =
		{
			importanceLevel:
				"Obligatoire"
		};


		var diagramCheckResult =
			addin.analysisStructureSynchronizer
				._createDiagramCheckResult(
					diagramDefinition,
					diagram,
					effectiveConfig
				);


		// ========================================================
		// 7. CHECK DES ARTEFACTS DU DIAGRAMME
		// ========================================================

		var success =
			addin.analysisStructureSynchronizer
				._checkDiagramArtifacts(
					diagram,
					diagramDefinition,
					diagramCheckResult,
					artifactDefinitions
				);


		if (!success)
		{
			addin.logger.error(
				"TEST KO : _checkDiagramArtifacts retourne false"
			);

			return false;
		}


		// ========================================================
		// 8. AFFICHAGE DU RESULTAT
		// ========================================================

		addin.logger.info(
			"DIAGRAM CHECK RESULT"
			+ " | Diagram=" + diagram.Name
			+ " | GUID=" + diagram.DiagramGUID
			+ " | Status=" + diagramCheckResult.status
			+ " | Artifacts="
			+ diagramCheckResult.artifacts.length
		);


		for (
			var i = 0;
			i < diagramCheckResult.artifacts.length;
			i++
		)
		{
			var artifactResult =
				diagramCheckResult.artifacts[i];


			addin.logger.info(
				"DIAGRAM ARTIFACT RESULT"
				+ " | Definition="
				+ artifactResult.definition.name
				+ " | DefinitionGUID="
				+ artifactResult.definition.guid
				+ " | Artifact="
				+ artifactResult.artifact.name
				+ " | ArtifactGUID="
				+ artifactResult.artifact.guid
				+ " | Found="
				+ artifactResult.found
				+ " | Status="
				+ artifactResult.status
				+ " | Issues="
				+ artifactResult.issues.length
			);
		}


		// ========================================================
		// 9. ASSERTION
		// ========================================================

		if (diagramCheckResult.artifacts.length != 1)
		{
			addin.logger.error(
				"TEST KO"
				+ " | ExpectedArtifacts=1"
				+ " | FoundArtifacts="
				+ diagramCheckResult.artifacts.length
			);

			return false;
		}


		var firstArtifact =
			diagramCheckResult.artifacts[0];


		if (!firstArtifact.found)
		{
			addin.logger.error(
				"TEST KO : artefact attendu mais non trouvé"
			);

			return false;
		}


		if (
			firstArtifact.status !=
			addin.fbaConstants.CHECK_STATUS_COMPLIANT
		)
		{
			addin.logger.error(
				"TEST KO"
				+ " | ExpectedStatus="
				+ addin.fbaConstants.CHECK_STATUS_COMPLIANT
				+ " | ActualStatus="
				+ firstArtifact.status
			);

			return false;
		}


		addin.logger.info(
			"=== TEST CHECK DIAGRAM ARTIFACTS OK ==="
		);


		return true;
	},
		
	testForeignArtifactsOnDiagram: function()
	{
		addin.logger.info(
			"=== TEST FOREIGN ARTIFACTS ON DIAGRAM ==="
		);


		var analysisPackage =
			Repository.GetTreeSelectedPackage();


		if (!analysisPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné."
			);

			return false;
		}


		// ====================================================
		// ROOT
		// ====================================================

		var rootPackage =
			analysisPackage;


		while (
			rootPackage &&
			!addin.analysisResolver.isValidAnalysisRoot(
				rootPackage
			)
		)
		{
			if (!rootPackage.ParentID)
			{
				rootPackage = null;
				break;
			}


			rootPackage =
				addin.repositoryService.getPackageById(
					rootPackage.ParentID
				);
		}


		if (!rootPackage)
		{
			addin.logger.error(
				"Root d'analyse introuvable."
			);

			return false;
		}


		// ====================================================
		// ANALYSIS DEFINITION
		// ====================================================

		var sourceAnalysisGuid =
			addin.repositoryService.getTaggedValue(
				analysisPackage.Element,
				addin.fbaConstants
					.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
			);


		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions();


		var analysisDefinition = null;


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			if (
				addin.utils.equalsIgnoreCase(
					definitions[i].guid,
					sourceAnalysisGuid
				)
			)
			{
				analysisDefinition =
					definitions[i];

				break;
			}
		}


		if (!analysisDefinition)
		{
			addin.logger.error(
				"Analysis Element introuvable."
			);

			return false;
		}


		// ====================================================
		// DEFINITIONS D'ARTEFACTS
		// ====================================================

		var artifactIndex =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();


		var analysisTagIndex =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();


		var artifactDefinitions =
			addin.analysisStructureSynchronizer
				._loadArtifactDefinitions(
					analysisDefinition,
					artifactIndex,
					analysisTagIndex
				);


		// ====================================================
		// DIAGRAMME
		// ====================================================

		var diagramDefinitions =
			addin.analysisStructureSynchronizer
				._loadDiagramDefinitions(
					analysisDefinition.element
				);


		if (
			!diagramDefinitions ||
			diagramDefinitions.length == 0
		)
		{
			addin.logger.error(
				"Aucune définition de diagramme."
			);

			return false;
		}


		var diagramDefinition =
			diagramDefinitions[0];


		var generatedDiagrams =
			addin.analysisStructureSynchronizer
				._findGeneratedDiagramsForPackage(
					rootPackage,
					analysisPackage,
					diagramDefinition.guid
				);


		if (
			!generatedDiagrams ||
			generatedDiagrams.length == 0
		)
		{
			addin.logger.error(
				"Diagramme Framework BA introuvable."
			);

			return false;
		}


		var diagram =
			generatedDiagrams[0];


		// ====================================================
		// DEFINITIONS AUTORISEES
		// ====================================================

		var allowedDefinitions =
			addin.analysisStructureSynchronizer
				._loadDiagramArtifactDefinitions(
					diagramDefinition.diagram
				);


		addin.logger.info(
			"Diagramme"
			+ " | Name=" + diagram.Name
			+ " | AllowedDefinitions="
			+ allowedDefinitions.length
		);


		// ====================================================
		// ARTEFACTS PRESENTS
		// ====================================================

		var diagramObjects =
			diagram.DiagramObjects;


		for (
			var d = 0;
			d < diagramObjects.Count;
			d++
		)
		{
			var diagramObject =
				diagramObjects.GetAt(d);


			var artifact =
				addin.repositoryService.getElementById(
					diagramObject.ElementID
				);


			if (!artifact)
				continue;


			var allowed =
				addin.analysisStructureSynchronizer
					._isArtifactAllowedOnDiagram(
						artifact,
						allowedDefinitions,
						artifactDefinitions
					);


			addin.logger.info(
				"DIAGRAM ARTIFACT"
				+ " | Name=" + artifact.Name
				+ " | GUID=" + artifact.ElementGUID
				+ " | Type=" + artifact.Type
				+ " | Stereo=" + artifact.StereotypeEx
				+ " | Allowed=" + allowed
			);
		}


		addin.logger.info(
			"=== TEST FOREIGN ARTIFACTS ON DIAGRAM OK ==="
		);


		return true;
	},
		
	testNoteRequirement: function()
	{
		var guid =
			"{1852D6E7-790B-47ce-8BDE-D208A4630D66}";

		var prototypeElement =
			addin.repositoryService.getElementByGuid(
				guid
			);

		if (!prototypeElement)
		{
			addin.logger.error(
				"Prototype Feature introuvable."
			);

			return false;
		}

		var requirement =
			addin.analysisStructureSynchronizer
				._getNoteRequirement(
					prototypeElement
				);

		addin.logger.info(
			"Prototype="
			+ prototypeElement.Name
			+ " | NoteRequirement="
			+ requirement
		);

		return true;
	},
	
	testArtifactNameParsing: function()
	{
		var tests = [
			"EXG004 - Exigence client",
			"_EXG004 - Exigence client",
			"EXG4 - Exigence client",
			"_EXG4 - Exigence client",
			"BSN012 - Besoin",
			"Exigence client",
			"",
			"_EXG004 Exigence client"
		];

		addin.logger.info(
			"=== TEST ARTIFACT NAME PARSING ==="
		);

		for (var i = 0; i < tests.length; i++)
		{
			var name = tests[i];

			var parsed =
				addin.analysisStructureSynchronizer
					._parseArtifactName(name);

			addin.logger.info(
				"Name=[" + name + "]"
				+ " | Technical=" + parsed.technical
				+ " | HasPrefix=" + parsed.hasPrefix
				+ " | Prefix=" + parsed.prefix
				+ " | HasNumber=" + parsed.hasNumber
				+ " | Number=" + parsed.number
				+ " | BusinessName=[" + parsed.businessName + "]"
				+ " | FormatValid=" + parsed.formatValid
			);
		}

		addin.logger.info(
			"=== FIN TEST ARTIFACT NAME PARSING ==="
		);
	},
		
	testArtifactExpectedPrefix: function()
	{
		var analysisPackage =
			Repository.GetTreeSelectedPackage();

		if (!analysisPackage)
		{
			addin.logger.error(
				"Aucun package sélectionné"
			);
			return;
		}

		var context =
			addin.analysisContextResolver
				.resolvePackage(
					analysisPackage
				);

		if (!context)
		{
			addin.logger.error(
				"Contexte d'analyse introuvable"
				+ " | Package=" + analysisPackage.Name
			);
			return;
		}

		var analysisRoot =
			context.analysisRoot;

		var definitions =
			addin.analysisStructureSynchronizer
				._loadDefinitions(
					analysisRoot
				);

		var definition =
			addin.analysisStructureSynchronizer
				.findDefinitionForPackage(
					analysisPackage,
					definitions
				);

		if (!definition)
		{
			addin.logger.error(
				"Définition d'analyse introuvable"
				+ " | Package=" + analysisPackage.Name
			);
			return;
		}

		var artifactIndex =
			addin.repositoryService
				.getArtifactDefinitionsIndexSQL();

		var analysisTagIndex =
			addin.repositoryService
				.getAnalysisElementTagsIndexSQL();

		var artifactDefinitions =
			addin.analysisStructureSynchronizer
				._loadArtifactDefinitions(
					definition,
					artifactIndex,
					analysisTagIndex
				);

		for (
			var i = 0;
			i < artifactDefinitions.length;
			i++
		)
		{
			var artifactDefinition =
				artifactDefinitions[i];

			var prefix =
				addin.analysisStructureSynchronizer
					._getArtifactExpectedPrefix(
						artifactDefinition
					);

			addin.logger.info(
				"ArtifactDefinition"
				+ " | Name=" + artifactDefinition.name
				+ " | GUID="
				+ artifactDefinition.prototypeGuid
				+ " | Prefix=" + prefix
			);
		}
	},
		
	testArtifactNameCheck: function()
	{
		addin.logger.info(
			"=== TEST ARTIFACT NAME CHECK ==="
		);


		// ========================================================
		// DEFINITION SIMULEE
		// ========================================================

		var artifactDefinition =
		{
			taggedValues: {}
		};

		artifactDefinition.taggedValues[
			addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
		] = "EXG";


		// ========================================================
		// CAS DE TEST
		// ========================================================

		var tests =
		[
			"EXG004 - Exigence client",
			"_EXG004 - Exigence client",
			"EXG4 - Exigence client",
			"_EXG4 - Exigence client",
			"BSN012 - Besoin",
			"Exigence client",
			""
		];


		for (var i = 0; i < tests.length; i++)
		{
			var name =
				tests[i];

			/*
			 * _checkArtifactName n'utilise actuellement
			 * que artifact.Name.
			 *
			 * Il n'est donc pas nécessaire de créer
			 * un véritable élément EA pour ce test.
			 */
			var artifact =
			{
				Name: name
			};


			var issues =
				addin.analysisStructureSynchronizer
					._checkArtifactName(
						artifact,
						artifactDefinition
					);


			var issueCode =
				issues.length > 0
					? issues[0].code
					: "OK";


			var action =
				issues.length > 0
					? issues[0].action
					: "";


			addin.logger.info(
				"Name=[" + name + "]"
				+ " | Issues=" + issues.length
				+ " | Code=" + issueCode
				+ " | Action=" + action
			);
		}


		addin.logger.info(
			"=== FIN TEST ARTIFACT NAME CHECK ==="
		);

		return true;
	},
		
	testDiagramContainsArtifact: function()
	{
		// ========================================================
		// ELEMENT SELECTIONNE DANS LE PROJECT BROWSER
		// ========================================================

		var artifact =
			Repository.GetTreeSelectedObject();

		if (!artifact)
		{
			addin.logger.error(
				"Aucun élément sélectionné dans le Project Browser"
			);

			return false;
		}

		if (!artifact.ElementID)
		{
			addin.logger.error(
				"L'objet sélectionné n'est pas un artefact"
			);

			return false;
		}

		// ========================================================
		// PACKAGE DE L'ARTEFACT
		// ========================================================

		var artifactPackage =
			addin.repositoryService.getPackageById(
				artifact.PackageID
			);

		if (!artifactPackage)
		{
			addin.logger.error(
				"Package de l'artefact introuvable"
				+ " | Artifact=" + artifact.Name
			);

			return false;
		}

		addin.logger.info(
			"TEST diagramContainsArtifact"
			+ " | Artifact=" + artifact.Name
			+ " | Package=" + artifactPackage.Name
		);

		// ========================================================
		// DIAGRAMMES DU PACKAGE
		// ========================================================

		var found = false;

		for (
			var i = 0;
			i < artifactPackage.Diagrams.Count;
			i++
		)
		{
			var diagram =
				artifactPackage.Diagrams.GetAt(i);

			var contains =
				addin.analysisStructureSynchronizer
					._diagramContainsArtifact(
						diagram,
						artifact
					);

			addin.logger.info(
				"Diagram usage"
				+ " | Diagram=" + diagram.Name
				+ " | Contains=" + contains
			);

			if (contains)
			{
				found = true;
			}
		}

		// ========================================================
		// RESULTAT
		// ========================================================

		addin.logger.info(
			"TEST diagramContainsArtifact terminé"
			+ " | Artifact=" + artifact.Name
			+ " | Found=" + found
		);

		return found;
	},
		
	testArtifactDiagramUsage: function()
	{
		var artifact =
			Repository.GetTreeSelectedObject();

		if (!artifact || !artifact.ElementID)
		{
			addin.logger.error(
				"Aucun artefact sélectionné dans le Project Browser"
			);

			return false;
		}

		var artifactPackage =
			addin.repositoryService.getPackageById(
				artifact.PackageID
			);

		if (!artifactPackage)
		{
			addin.logger.error(
				"Package de l'artefact introuvable"
				+ " | Artifact=" + artifact.Name
			);

			return false;
		}

		var businessUsage = false;
		var technicalUsage = false;

		for (
			var i = 0;
			i < artifactPackage.Diagrams.Count;
			i++
		)
		{
			var diagram =
				artifactPackage.Diagrams.GetAt(i);

			if (
				!addin.analysisStructureSynchronizer
					._diagramContainsArtifact(
						diagram,
						artifact
					)
			)
			{
				continue;
			}

			var technical =
				addin.analysisStructureSynchronizer
					._isTechnicalDiagram(
						diagram
					);

			if (technical)
			{
				technicalUsage = true;
			}
			else
			{
				businessUsage = true;
			}

			addin.logger.info(
				"Artifact diagram usage"
				+ " | Artifact=" + artifact.Name
				+ " | Diagram=" + diagram.Name
				+ " | Technical=" + technical
			);
		}

		addin.logger.info(
			"TEST artifactDiagramUsage terminé"
			+ " | Artifact=" + artifact.Name
			+ " | BusinessUsage=" + businessUsage
			+ " | TechnicalUsage=" + technicalUsage
		);

		return true;
	},
		
	testArtifactTechnicalName: function()
	{
		var artifact =
			Repository.GetTreeSelectedObject();

		if (!artifact || !artifact.ElementID)
		{
			addin.logger.error(
				"Aucun artefact sélectionné dans le Project Browser"
			);
			return false;
		}

		var artifactPackage =
			addin.repositoryService.getPackageById(
				artifact.PackageID
			);

		if (!artifactPackage)
		{
			addin.logger.error(
				"Package de l'artefact introuvable"
				+ " | Artifact=" + artifact.Name
			);
			return false;
		}

		var technicalPackage =
			addin.repositoryService.isTechnicalPackage(
				artifactPackage
			);

		var issues =
			addin.analysisStructureSynchronizer
				._checkArtifactTechnicalName(
					artifact,
					artifactPackage
				);

		addin.logger.info(
			"TEST artifactTechnicalName"
			+ " | Artifact=" + artifact.Name
			+ " | Package=" + artifactPackage.Name
			+ " | TechnicalPackage=" + technicalPackage
			+ " | Issues=" + issues.length
		);

		for (var i = 0; i < issues.length; i++)
		{
			addin.logger.info(
				"Issue"
				+ " | Code=" + issues[i].code
				+ " | Severity=" + issues[i].severity
				+ " | Action=" + issues[i].action
			);
		}

		return true;
	},
		
	testDiagramNamingRules: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var effectiveConfig = {
			prefix: "HRR"
		};

		var testCases = [
			{
				name: "HRR Exigences",
				expectedIssues: 0
			},
			{
				name: "HRR Exigences blabla",
				expectedIssues: 0
			},
			{
				name: "HRR blabla",
				expectedIssues: 0
			},
			{
				name: "HR Exigences",
				expectedIssues: 1
			},
			{
				name: "hrr Exigences",
				expectedIssues: 1
			},
			{
				name: "HRRExigences",
				expectedIssues: 1
			},
			{
				name: "HRR HRRExigences",
				expectedIssues: 0
			},
			{
				name: "HRR HRR Exigences",
				expectedIssues: 1
			},
			{
				name: "HRR HR Exigences",
				expectedIssues: 0
			},
			{
				name: "HRR Besoins",
				expectedIssues: 0
			},

			/*
			 * Variante technique :
			 * "_" ne fait pas partie du préfixe métier.
			 */
			{
				name: "_HRR Exigences",
				expectedIssues: 0
			},
			{
				name: "_hrr Exigences",
				expectedIssues: 1
			}
		];

		var passed = 0;
		var failed = 0;

		for (
			var i = 0;
			i < testCases.length;
			i++
		)
		{
			var testCase =
				testCases[i];

			var fakeDiagram = {
				Name: testCase.name
			};

			var issues =
				synchronizer._checkDiagramName(
					fakeDiagram,
					effectiveConfig
				);

			var actualIssues =
				issues ? issues.length : 0;

			var success =
				actualIssues ===
				testCase.expectedIssues;

			if (success)
			{
				passed++;
			}
			else
			{
				failed++;
			}

			addin.logger.info(
				"TEST diagram naming"
				+ " | Name=[" + testCase.name + "]"
				+ " | ExpectedIssues="
					+ testCase.expectedIssues
				+ " | ActualIssues="
					+ actualIssues
				+ " | Result="
					+ (success ? "PASS" : "FAIL")
			);

			/*
			 * En cas d'échec, afficher le diagnostic
			 * retourné par le CHECK.
			 */
			if (!success && issues)
			{
				for (
					var issueIndex = 0;
					issueIndex < issues.length;
					issueIndex++
				)
				{
					var issue =
						issues[issueIndex];

					addin.logger.warning(
						"TEST diagram naming issue"
						+ " | Name=[" + testCase.name + "]"
						+ " | Code=" + issue.code
						+ " | Reason=" + issue.reason
						+ " | Action=" + issue.action
					);
				}
			}
		}

		addin.logger.info(
			"TEST diagramNamingRules terminé"
			+ " | Total=" + testCases.length
			+ " | Passed=" + passed
			+ " | Failed=" + failed
		);

		return failed === 0;
	},
		
	testDiagramTechnicalName: function()
	{
		addin.logger.info(
			"TEST DIAGRAM TECHNICAL NAME"
		);

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST impossible | Aucun package sélectionné"
			);

			return false;
		}

		if (selectedPackage.Diagrams.Count == 0)
		{
			addin.logger.error(
				"TEST impossible"
				+ " | Aucun diagramme dans le package"
			);

			return false;
		}

		var diagram =
			selectedPackage.Diagrams.GetAt(0);

		var issues =
			addin.analysisStructureSynchronizer
				._checkDiagramTechnicalName(
					diagram,
					selectedPackage
				);

		addin.logger.info(
			"TEST DIAGRAM TECHNICAL NAME RESULT"
			+ " | Package=" + selectedPackage.Name
			+ " | TechnicalPackage="
			+ addin.repositoryService.isTechnicalPackage(
				selectedPackage
			)
			+ " | Diagram=" + diagram.Name
			+ " | Issues=" + issues.length
			+ (
				issues.length > 0
					? " | Issue=" + issues[0].code
						+ " | Severity=" + issues[0].severity
						+ " | Action=" + issues[0].action
					: ""
			)
		);

		return true;
	},
	
	testCheckObjectIndex: function()
	{
		addin.logger.info(
			"TEST CHECK OBJECT INDEX"
		);

		var result =
			addin.analysisStructureSynchronizer
				._createCheckResult(
					"TEST",
					null
				);

		var guid =
			"{11111111-1111-1111-1111-111111111111}";

		var first =
			addin.analysisStructureSynchronizer
				._registerCheckObject(
					result,
					guid,
					"DIAGRAM",
					"HRR Exigences",
					""
				);

		var second =
			addin.analysisStructureSynchronizer
				._getCheckObject(
					result,
					guid
				);

		var success =
			first != null &&
			second != null &&
			first === second &&
			second.objectType === "DIAGRAM" &&
			second.name === "HRR Exigences";

		addin.logger.info(
			"TEST CHECK OBJECT INDEX RESULT"
			+ " | Objects="
			+ Object.keys(result.objects).length
			+ " | Found="
			+ (second != null)
			+ " | SameInstance="
			+ (first === second)
			+ " | Type="
			+ (
				second
					? second.objectType
					: ""
			)
			+ " | Success="
			+ success
		);

		return success;
	},
	
	testCheckSnapshotPersistence: function()
	{
		addin.logger.info(
			"TEST CHECK SNAPSHOT PERSISTENCE"
		);

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST impossible"
				+ " | Aucun package sélectionné"
			);

			return false;
		}

		var root =
			addin.analysisContextResolver
				.resolvePackage(
					selectedPackage
				);

		if (
			!root ||
			!root.analysisRoot
		)
		{
			addin.logger.error(
				"TEST impossible"
				+ " | Root d'analyse introuvable"
			);

			return false;
		}

		var analysisRoot =
			root.analysisRoot;

		var result =
			addin.analysisStructureSynchronizer
				._createCheckResult(
					"TEST",
					analysisRoot
				);

		addin.analysisStructureSynchronizer
			._registerCheckObject(
				result,
				analysisRoot.PackageGUID,
				"ROOT",
				analysisRoot.Name,
				""
			);

		var persisted =
			addin.analysisStructureSynchronizer
				._persistCheckSnapshot(
					analysisRoot,
					result
				);

		var loaded =
			addin.analysisStructureSynchronizer
				._loadCheckSnapshot(
					analysisRoot
				);

		var success =
			persisted &&
			loaded != null &&
			loaded.version === result.version &&
			loaded.checkedAt === result.checkedAt &&
			loaded.root.guid === result.root.guid &&
			loaded.objects != null;

		addin.logger.info(
			"TEST CHECK SNAPSHOT PERSISTENCE RESULT"
			+ " | Persisted=" + persisted
			+ " | Loaded=" + (loaded != null)
			+ " | Version="
			+ (
				loaded
					? loaded.version
					: ""
			)
			+ " | CheckedAt="
			+ (
				loaded
					? loaded.checkedAt
					: ""
			)
			+ " | Objects="
			+ (
				loaded && loaded.objects
					? Object.keys(
						loaded.objects
					).length
					: 0
			)
			+ " | Success=" + success
		);

		return success;
	},
	
	testCheckSnapshotRawRead: function()
	{
		addin.logger.info(
			"TEST CHECK SNAPSHOT RAW READ"
		);

		var selectedPackage =
			Repository.GetTreeSelectedPackage();

		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST impossible | Aucun package sélectionné"
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
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST impossible | Root introuvable"
			);

			return false;
		}

		var root =
			context.analysisRoot;

		var rootElement =
			root.Element;

		var tagName =
			addin.fbaConstants.TAG_CHECK_RESULT;

		addin.logger.info(
			"TEST RAW"
			+ " | Root=" + root.Name
			+ " | ElementGUID=" + rootElement.ElementGUID
			+ " | Tag=" + tagName
			+ " | TaggedValues="
			+ rootElement.TaggedValues.Count
		);

		for (
			var i = 0;
			i < rootElement.TaggedValues.Count;
			i++
		)
		{
			var tv =
				rootElement.TaggedValues.GetAt(i);

			if (
				addin.utils.equalsIgnoreCase(
					tv.Name,
					tagName
				)
			)
			{
				addin.logger.info(
					"TEST RAW TAG FOUND"
					+ " | Name=" + tv.Name
					+ " | ValueLength="
					+ (
						tv.Value
							? String(tv.Value).length
							: 0
					)
					+ " | NotesLength="
					+ (
						tv.Notes
							? String(tv.Notes).length
							: 0
					)
					+ " | Value="
					+ String(tv.Value || "").substring(0, 100)
				);

				return true;
			}
		}

		addin.logger.warning(
			"TEST RAW TAG NOT FOUND"
			+ " | Tag=" + tagName
		);

		return false;
	},
	
	testCheckRealPackageObject: function()
	{
		addin.logger.info(
			"TEST CHECK REAL PACKAGE OBJECT"
		);

		var targetPackage =
			Repository.GetTreeSelectedPackage();

		if (!targetPackage)
		{
			addin.logger.error(
				"TEST impossible | Aucun package sélectionné"
			);

			return false;
		}

		var context =
			addin.analysisContextResolver
				.resolvePackage(
					targetPackage
				);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST impossible | Contexte d'analyse introuvable"
			);

			return false;
		}

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					targetPackage
				);

		var objectResult =
			addin.analysisStructureSynchronizer
				._getCheckObject(
					result,
					targetPackage.PackageGUID
				);
		
		var artifactCount = 0;

		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			if (
				result.objects[guid].objectType ===
				"ARTIFACT"
			)
			{
				artifactCount++;
			}
		}
		
		var diagramCount = 0;

		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			if (
				result.objects[guid].objectType ===
				"DIAGRAM"
			)
			{
				diagramCount++;
			}
		}
		
		var success =
			diagramCount > 0 &&
			artifactCount > 0 &&
			objectResult != null &&
			objectResult.objectType === "PACKAGE" &&
			objectResult.guid ===
				addin.utils.normalizeGuid(
					targetPackage.PackageGUID
				) &&
			objectResult.parentGuid ===
				addin.utils.normalizeGuid(
					context.analysisRoot.PackageGUID
				) &&
			!addin.utils.isEmpty(
				objectResult.checkedAt
			);

		addin.logger.info(
			"TEST CHECK REAL PACKAGE OBJECT RESULT"
			+ " | Package=" + targetPackage.Name
			+ " | Found=" + (objectResult != null)
			+ " | Type="
			+ (
				objectResult
					? objectResult.objectType
					: ""
			)
			+ " | ParentGuid="
			+ (
				objectResult
					? objectResult.parentGuid
					: ""
			)
			+ " | CheckedAt="
			+ (
				objectResult
					? objectResult.checkedAt
					: ""
			)
			+ " | Artifacts=" + artifactCount
			+ " | Diagrams=" + diagramCount
			+ " | Objects="
			+ Object.keys(
				result.objects || {}
			).length
			+ " | Success=" + success
		);

		return success;
	},
				
	testCheckObjectIssue: function()
	{
		addin.logger.info(
			"TEST CHECK OBJECT ISSUE"
		);

		var result =
			addin.analysisStructureSynchronizer
				._createCheckResult(
					"PACKAGE",
					null
				);

		var guid =
			"{11111111-2222-3333-4444-555555555555}";

		addin.analysisStructureSynchronizer
			._registerCheckObject(
				result,
				guid,
				"ARTIFACT",
				"EXG001 - Test",
				""
			);

		var issue = {
			code: "TEST_ISSUE",
			severity:
				addin.fbaConstants.CHECK_SEVERITY_ERROR,
			action:
				addin.fbaConstants.CHECK_ACTION_REPAIR,
			objectGuid: guid,
			objectType: "ARTIFACT",
			objectName: "EXG001 - Test"
		};

		addin.analysisStructureSynchronizer
			._registerCheckIssue(
				result,
				issue
			);

		var objectResult =
			addin.analysisStructureSynchronizer
				._getCheckObject(
					result,
					guid
				);

		var success =
			result.issues.length === 1 &&
			result.summary.errors === 1 &&
			result.summary.repair === 1 &&
			objectResult &&
			objectResult.issues.length === 1 &&
			objectResult.summary.errors === 1 &&
			objectResult.summary.warnings === 0;

		addin.logger.info(
			"TEST CHECK OBJECT ISSUE RESULT"
			+ " | GlobalIssues=" + result.issues.length
			+ " | GlobalErrors=" + result.summary.errors
			+ " | ObjectIssues="
				+ (
					objectResult
						? objectResult.issues.length
						: 0
				)
			+ " | ObjectErrors="
				+ (
					objectResult
						? objectResult.summary.errors
						: 0
				)
			+ " | Success=" + success
		);

		return success;
	},
	
	testCheckRealArtifactIssue: function()
	{
		addin.logger.info(
			"TEST CHECK REAL ARTIFACT ISSUE"
		);

		var targetPackage =
			Repository.GetTreeSelectedPackage();

		if (!targetPackage)
		{
			addin.logger.error(
				"TEST CHECK REAL ARTIFACT ISSUE"
				+ " | Aucun package sélectionné"
			);
			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				targetPackage
			);

		if (!context || !context.analysisRoot)
			return false;

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					targetPackage
				);

		var foundObject = null;

		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			var currentObject =
				result.objects[guid];

			if (
				currentObject.objectType === "ARTIFACT" &&
				currentObject.name === "_EXG004 - Exigence"
			)
			{
				foundObject = currentObject;
				break;
			}
		}

		var foundTechnicalIssue = false;

		if (foundObject)
		{
			for (
				var i = 0;
				i < foundObject.issues.length;
				i++
			)
			{
				if (
					foundObject.issues[i].code ===
					addin.fbaConstants
						.CHECK_ISSUE_ARTIFACT_TECHNICAL_NAME
				)
				{
					foundTechnicalIssue = true;
					break;
				}
			}
		}

		var success =
			foundObject != null &&
			foundTechnicalIssue &&
			foundObject.issues.length === 2 &&
			foundObject.summary.errors === 2;

		addin.logger.info(
			"TEST CHECK REAL ARTIFACT ISSUE RESULT"
			+ " | Found=" + (foundObject != null)
			+ " | Issues="
				+ (
					foundObject
						? foundObject.issues.length
						: 0
				)
			+ " | Errors="
				+ (
					foundObject
						? foundObject.summary.errors
						: 0
				)
			+ " | TechnicalIssue="
				+ foundTechnicalIssue
			+ " | Success=" + success
		);

		return success;
	},
	
	testCheckRealDiagramIssues: function()
	{
		addin.logger.info(
			"TEST CHECK REAL DIAGRAM ISSUES"
		);

		var targetPackage =
			Repository.GetTreeSelectedPackage();

		if (!targetPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				targetPackage
			);

		if (!context || !context.analysisRoot)
			return false;

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					targetPackage
				);

		var diagramObject = null;
		var valueObject = null;

		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			var objectResult =
				result.objects[guid];

			if (
				objectResult.objectType === "DIAGRAM" &&
				objectResult.name === "_HR Exigences"
			)
			{
				diagramObject = objectResult;
			}

			if (
				objectResult.objectType === "ARTIFACT" &&
				objectResult.name === "Value1"
			)
			{
				valueObject = objectResult;
			}
		}

		var success =
			diagramObject != null &&
			diagramObject.issues.length === 3 &&
			diagramObject.summary.errors === 3 &&
			valueObject != null &&
			valueObject.issues.length === 1 &&
			valueObject.summary.errors === 1 &&
			result.issues.length === 6 &&
			result.summary.errors === 6;

		addin.logger.info(
			"TEST CHECK REAL DIAGRAM ISSUES RESULT"
			+ " | DiagramFound=" + (diagramObject != null)
			+ " | DiagramIssues="
				+ (diagramObject ? diagramObject.issues.length : 0)
			+ " | DiagramErrors="
				+ (diagramObject ? diagramObject.summary.errors : 0)
			+ " | ValueFound=" + (valueObject != null)
			+ " | ValueIssues="
				+ (valueObject ? valueObject.issues.length : 0)
			+ " | ValueErrors="
				+ (valueObject ? valueObject.summary.errors : 0)
			+ " | GlobalIssues=" + result.issues.length
			+ " | GlobalErrors=" + result.summary.errors
			+ " | Success=" + success
		);

		return success;
	},
	
	testCheckPackageNotInitializedIssue: function()
	{
		addin.logger.info(
			"TEST CHECK PACKAGE NOT INITIALIZED ISSUE"
		);

		var targetPackage =
			Repository.GetTreeSelectedPackage();

		if (!targetPackage)
		{
			addin.logger.error(
				"TEST impossible | Aucun package sélectionné"
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				targetPackage
			);

		if (!context || !context.analysisRoot)
		{
			addin.logger.error(
				"TEST impossible | Contexte d'analyse introuvable"
			);

			return false;
		}

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					targetPackage
				);

		var packageObject =
			addin.analysisStructureSynchronizer
				._getCheckObject(
					result,
					targetPackage.PackageGUID
				);

		var foundIssue = false;

		if (packageObject)
		{
			for (
				var i = 0;
				i < packageObject.issues.length;
				i++
			)
			{
				if (
					packageObject.issues[i].code ===
					"ANALYSIS_ELEMENT_NOT_FOUND"
				)
				{
					foundIssue = true;
					break;
				}
			}
		}

		var success =
			packageObject != null &&
			foundIssue &&
			packageObject.issues.length === 1 &&
			packageObject.summary.errors === 1 &&
			packageObject.summary.warnings === 0 &&
			result.issues.length === 1 &&
			result.summary.errors === 1 &&
			result.summary.warnings === 0 &&
			result.summary.repair === 1;

		addin.logger.info(
			"TEST CHECK ANALYSIS ELEMENT NOT FOUND RESULT"
			+ " | Package=" + targetPackage.Name
			+ " | Found=" + (packageObject != null)
			+ " | IssueFound=" + foundIssue
			+ " | ObjectIssues="
				+ (packageObject ? packageObject.issues.length : 0)
			+ " | ObjectErrors="
				+ (packageObject ? packageObject.summary.errors : 0)
			+ " | ObjectWarnings="
				+ (packageObject ? packageObject.summary.warnings : 0)
			+ " | GlobalIssues=" + result.issues.length
			+ " | GlobalErrors=" + result.summary.errors
			+ " | GlobalWarnings=" + result.summary.warnings
			+ " | REPAIR=" + result.summary.repair
			+ " | Success=" + success
		);

		return success;
	},
		
	testCheckArtifactNamingIssue: function()
	{
		addin.logger.info(
			"TEST CHECK ARTIFACT NAMING ISSUE"
		);

		var targetPackage =
			Repository.GetTreeSelectedPackage();

		if (!targetPackage)
		{
			addin.logger.error(
				"TEST impossible | Aucun package sélectionné"
			);

			return false;
		}


		var context =
			addin.analysisContextResolver.resolvePackage(
				targetPackage
			);

		if (!context || !context.analysisRoot)
		{
			addin.logger.error(
				"TEST impossible | Contexte d'analyse introuvable"
			);

			return false;
		}


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					targetPackage
				);


		// ---------------------------------------------------------
		// Recherche de l'artefact de test
		// ---------------------------------------------------------

		var artifactObject = null;

		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			var objectResult =
				result.objects[guid];

			if (
				objectResult.objectType === "ARTIFACT" &&
				objectResult.name === "_BAD001 - Glossaire"
			)
			{
				artifactObject =
					objectResult;

				break;
			}
		}


		// ---------------------------------------------------------
		// Recherche de l'issue ARTIFACT_NAMING_INVALID
		// ---------------------------------------------------------

		var namingIssueFound = false;

		if (artifactObject)
		{
			for (
				var i = 0;
				i < artifactObject.issues.length;
				i++
			)
			{
				addin.logger.info(
					"TEST ARTIFACT ISSUE"
					+ " | Index=" + i
					+ " | Code=[" + artifactObject.issues[i].code + "]"
					+ " | Action=[" + artifactObject.issues[i].action + "]"
					+ " | Severity=[" + artifactObject.issues[i].severity + "]"
				);
				if (
					artifactObject.issues[i].code ===
					"ARTIFACT_PREFIX_INVALID"
				)
				{
					addin.logger.info(
						"TEST ARTIFACT NAMING MATCH"
						+ " | Code="
						+ artifactObject.issues[i].code
					);

					namingIssueFound = true;
					break;
				}
			}
		}


		// ---------------------------------------------------------
		// Validation
		//
		// _BAD001 - Glossaire doit actuellement porter :
		//
		// 1. ARTIFACT_NAMING_INVALID
		// 2. ARTIFACT_TECHNICAL_NAME
		// 3. ARTIFACT_NOTE_MISSING
		// ---------------------------------------------------------

		var success =
			artifactObject != null &&
			namingIssueFound &&
			artifactObject.issues.length === 3 &&
			artifactObject.summary.errors === 3;


		// ---------------------------------------------------------
		// Résultat
		// ---------------------------------------------------------

		addin.logger.info(
			"TEST CHECK ARTIFACT NAMING ISSUE RESULT"
			+ " | Package=" + targetPackage.Name
			+ " | Found="
				+ (artifactObject != null)
			+ " | NamingIssue="
				+ namingIssueFound
			+ " | ObjectIssues="
				+ (
					artifactObject
						? artifactObject.issues.length
						: 0
				)
			+ " | ObjectErrors="
				+ (
					artifactObject
						? artifactObject.summary.errors
						: 0
				)
			+ " | ObjectWarnings="
				+ (
					artifactObject
						? artifactObject.summary.warnings
						: 0
				)
			+ " | GlobalIssues="
				+ result.issues.length
			+ " | GlobalErrors="
				+ result.summary.errors
			+ " | GlobalWarnings="
				+ result.summary.warnings
			+ " | Success="
				+ success
		);


		return success;
	},
	
	testCheckMandatoryArtifactMissing: function()
	{
		addin.logger.info(
			"TEST CHECK MANDATORY ARTIFACT MISSING"
		);

		var targetPackage =
			Repository.GetTreeSelectedPackage();

		if (!targetPackage)
		{
			addin.logger.error(
				"TEST impossible | Aucun package sélectionné"
			);

			return false;
		}


		var context =
			addin.analysisContextResolver.resolvePackage(
				targetPackage
			);

		if (!context || !context.analysisRoot)
		{
			addin.logger.error(
				"TEST impossible | Contexte d'analyse introuvable"
			);

			return false;
		}


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					targetPackage
				);


		// ---------------------------------------------------------
		// Package contrôlé
		// ---------------------------------------------------------

		var packageObject =
			addin.analysisStructureSynchronizer
				._getCheckObject(
					result,
					targetPackage.PackageGUID
				);


		// ---------------------------------------------------------
		// Recherche de MANDATORY_ARTIFACT_MISSING
		// ---------------------------------------------------------

		var missingIssueFound = false;
		var missingIssueAction = "";

		if (packageObject)
		{
			for (
				var i = 0;
				i < packageObject.issues.length;
				i++
			)
			{
				var issue =
					packageObject.issues[i];

				if (
					issue.code ===
					"MANDATORY_ARTIFACT_MISSING"
				)
				{
					missingIssueFound = true;
					missingIssueAction =
						issue.action;

					break;
				}
			}
		}


		// ---------------------------------------------------------
		// Vérifier qu'aucun objet ARTIFACT fictif n'a été créé
		//
		// Un objet enregistré doit toujours avoir un GUID réel.
		// ---------------------------------------------------------

		var artifactWithoutGuid = false;
		var artifactObjects = 0;

		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			var objectResult =
				result.objects[guid];

			if (
				objectResult.objectType ===
				"ARTIFACT"
			)
			{
				artifactObjects++;

				if (
					addin.utils.isEmpty(
						objectResult.guid
					)
				)
				{
					artifactWithoutGuid = true;
				}
			}
		}


		// ---------------------------------------------------------
		// Validation
		// ---------------------------------------------------------

		var success =
			packageObject != null &&
			missingIssueFound &&
			missingIssueAction ===
				addin.fbaConstants.CHECK_ACTION_COMPLETE &&
			packageObject.summary.errors >= 1 &&
			result.summary.complete >= 1 &&
			!artifactWithoutGuid;


		// ---------------------------------------------------------
		// Résultat
		// ---------------------------------------------------------

		addin.logger.info(
			"TEST CHECK MANDATORY ARTIFACT MISSING RESULT"
			+ " | Package=" + targetPackage.Name
			+ " | PackageFound="
				+ (packageObject != null)
			+ " | MissingIssue="
				+ missingIssueFound
			+ " | Action="
				+ missingIssueAction
			+ " | PackageIssues="
				+ (
					packageObject
						? packageObject.issues.length
						: 0
				)
			+ " | PackageErrors="
				+ (
					packageObject
						? packageObject.summary.errors
						: 0
				)
			+ " | COMPLETE="
				+ result.summary.complete
			+ " | ArtifactObjects="
				+ artifactObjects
			+ " | ArtifactWithoutGuid="
				+ artifactWithoutGuid
			+ " | GlobalIssues="
				+ result.issues.length
			+ " | GlobalErrors="
				+ result.summary.errors
			+ " | Success="
				+ success
		);


		return success;
	},
	
	testNormalizeUniquenessName: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var value1 =
			synchronizer._normalizeUniquenessName(
				"EXG001 - Client"
			);

		var value2 =
			synchronizer._normalizeUniquenessName(
				"  exg001 - client  "
			);

		var value3 =
			synchronizer._normalizeUniquenessName(
				"_EXG001 - Client"
			);

		var success =
			value1 === value2 &&
			value1 !== value3;

		addin.logger.info(
			"TEST NORMALIZE UNIQUENESS NAME" +
			" | Value1=" + value1 +
			" | Value2=" + value2 +
			" | Value3=" + value3 +
			" | SameCaseInsensitive=" + (value1 === value2) +
			" | TechnicalDifferent=" + (value1 !== value3) +
			" | Success=" + success
		);

		return success;
	},
	
	testCreateUniquenessCandidate: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var candidate =
			synchronizer._createUniquenessCandidate(
				"{11111111-1111-1111-1111-111111111111}",
				"ARTIFACT",
				"  EXG001 - Client  ",
				"{22222222-2222-2222-2222-222222222222}",
				"{33333333-3333-3333-3333-333333333333}",
				"{44444444-4444-4444-4444-444444444444}"
			);

		var success =
			candidate != null &&
			candidate.objectType === "ARTIFACT" &&
			candidate.uniquenessName === "exg001 - client" &&
			candidate.parentGuid ===
				"{22222222-2222-2222-2222-222222222222}" &&
			candidate.analysisPackageGuid ===
				"{33333333-3333-3333-3333-333333333333}" &&
			candidate.analysisElementGuid ===
				"{44444444-4444-4444-4444-444444444444}";

		addin.logger.info(
			"TEST CREATE UNIQUENESS CANDIDATE" +
			" | Type=" + candidate.objectType +
			" | Name=" + candidate.name +
			" | Key=" + candidate.uniquenessName +
			" | ParentGuid=" + candidate.parentGuid +
			" | AnalysisPackageGuid=" + candidate.analysisPackageGuid +
			" | AnalysisElementGuid=" + candidate.analysisElementGuid +
			" | Success=" + success
		);

		return success;
	},
	
	testAnalysisPackagesSQL: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST ANALYSIS PACKAGES SQL | Aucun package sélectionné."
			);
			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (!context || !context.analysisRoot)
		{
			addin.logger.error(
				"TEST ANALYSIS PACKAGES SQL | ROOT introuvable."
			);
			return false;
		}

		var rows =
			addin.repositoryService.getAnalysisPackagesSQL(
				context.analysisRoot
			);
		
		addin.logger.info(
			"TEST ANALYSIS PACKAGES SQL" +
			" | Root=" + context.analysisRoot.Name +
			" | Packages=" + rows.length +
			" | Success=" + (rows.length > 0)
		);

		return rows.length > 0;
	},
		
	testAnalysisPackagesSQLDepth: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST ANALYSIS PACKAGES SQL DEPTH | Aucun package sélectionné."
			);
			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (!context || !context.analysisRoot)
		{
			addin.logger.error(
				"TEST ANALYSIS PACKAGES SQL DEPTH | ROOT introuvable."
			);
			return false;
		}

		var root =
			context.analysisRoot;

		var rows =
			addin.repositoryService.getAnalysisPackagesSQL(
				root
			);

		var byId = {};

		for (var i = 0; i < rows.length; i++)
		{
			byId[String(rows[i].PackageID)] =
				rows[i];
		}

		var maxDepth = 0;
		var level1 = 0;
		var level2 = 0;
		var level3Plus = 0;

		for (var j = 0; j < rows.length; j++)
		{
			var row =
				rows[j];

			var depth = 1;
			var parentId =
				String(row.ParentID || "0");

			while (
				parentId !== String(root.PackageID) &&
				byId[parentId]
			)
			{
				depth++;

				parentId =
					String(
						byId[parentId].ParentID || "0"
					);
			}

			if (depth > maxDepth)
				maxDepth = depth;

			if (depth === 1)
				level1++;
			else if (depth === 2)
				level2++;
			else
				level3Plus++;
		}

		var success =
			rows.length > 0 &&
			level1 > 0;

		addin.logger.info(
			"TEST ANALYSIS PACKAGES SQL DEPTH" +
			" | Root=" + root.Name +
			" | Total=" + rows.length +
			" | Level1=" + level1 +
			" | Level2=" + level2 +
			" | Level3Plus=" + level3Plus +
			" | MaxDepth=" + maxDepth +
			" | Success=" + success
		);

		return success;
	},
		
	testAnalysisUniquenessCandidatesSQL: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST UNIQUENESS CANDIDATES SQL | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST UNIQUENESS CANDIDATES SQL | ROOT introuvable."
			);

			return false;
		}

		var candidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var analysisPackages = 0;
		var technicalPackages = 0;

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			if (
				candidates[i].objectType ===
				"ANALYSIS_PACKAGE"
			)
			{
				analysisPackages++;
			}
			else if (
				candidates[i].objectType ===
				"TECHNICAL_PACKAGE"
			)
			{
				technicalPackages++;
			}
		}

		var success =
			candidates.length === 39 &&
			analysisPackages +
				technicalPackages ===
				candidates.length;

		addin.logger.info(
			"TEST UNIQUENESS CANDIDATES SQL" +
			" | Total=" + candidates.length +
			" | AnalysisPackages=" + analysisPackages +
			" | TechnicalPackages=" + technicalPackages +
			" | Success=" + success
		);

		return success;
	},
		
	testUniquenessCandidateParents: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST UNIQUENESS PARENTS | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST UNIQUENESS PARENTS | ROOT introuvable."
			);

			return false;
		}

		var candidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var missingParentGuid = 0;
		var directRootChildren = 0;

		var rootGuid =
			addin.utils.normalizeGuid(
				context.analysisRoot.PackageGUID
			);

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				addin.utils.isEmpty(
					candidate.parentGuid
				)
			)
			{
				missingParentGuid++;
			}

			if (
				candidate.parentGuid ===
				rootGuid
			)
			{
				directRootChildren++;
			}
		}

		var success =
			candidates.length === 39 &&
			missingParentGuid === 0 &&
			directRootChildren === 32;

		addin.logger.info(
			"TEST UNIQUENESS PARENTS" +
			" | Total=" + candidates.length +
			" | DirectRootChildren=" + directRootChildren +
			" | MissingParentGuid=" + missingParentGuid +
			" | Success=" + success
		);

		return success;
	},
		
	testDuplicateTechnicalPackages: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST DUPLICATE TECHNICAL PACKAGES | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST DUPLICATE TECHNICAL PACKAGES | ROOT introuvable."
			);

			return false;
		}

		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var candidates = [];

		for (
			var i = 0;
			i < rows.length;
			i++
		)
		{
			var row =
				rows[i];

			candidates.push(
				addin.analysisStructureSynchronizer
					._createUniquenessCandidate(
						row.guid,
						row.objectType,
						row.name,
						row.parentGuid,
						"",
						""
					)
			);
		}

		var duplicates =
			addin.analysisStructureSynchronizer
				._findDuplicateTechnicalPackages(
					candidates
				);

		var excess = 0;

		for (
			var j = 0;
			j < duplicates.length;
			j++
		)
		{
			excess +=
				duplicates[j].excess;
		}

		addin.logger.info(
			"TEST DUPLICATE TECHNICAL PACKAGES" +
			" | Candidates=" + candidates.length +
			" | Groups=" + duplicates.length +
			" | Excess=" + excess +
			" | Success=true"
		);

		return true;
	},
		
	testDuplicateAnalysisPackageNames: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST DUPLICATE ANALYSIS PACKAGE NAMES" +
				" | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST DUPLICATE ANALYSIS PACKAGE NAMES" +
				" | ROOT introuvable."
			);

			return false;
		}

		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var candidates = [];

		for (
			var i = 0;
			i < rows.length;
			i++
		)
		{
			var row =
				rows[i];

			candidates.push(
				addin.analysisStructureSynchronizer
					._createUniquenessCandidate(
						row.guid,
						row.objectType,
						row.name,
						row.parentGuid,
						"",
						""
					)
			);
		}

		var duplicates =
			addin.analysisStructureSynchronizer
				._findDuplicateAnalysisPackagesByName(
					candidates
				);

		var excess = 0;

		for (
			var j = 0;
			j < duplicates.length;
			j++
		)
		{
			excess +=
				duplicates[j].excess;
		}

		addin.logger.info(
			"TEST DUPLICATE ANALYSIS PACKAGE NAMES" +
			" | Candidates=" + candidates.length +
			" | Groups=" + duplicates.length +
			" | Excess=" + excess +
			" | Success=true"
		);

		return true;
	},
		
	testUniquenessAnalysisPackageOwnership: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST UNIQUENESS OWNERSHIP" +
				" | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST UNIQUENESS OWNERSHIP" +
				" | ROOT introuvable."
			);

			return false;
		}

		var candidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var analysisPackages = 0;
		var technicalPackages = 0;

		var technicalWithOwner = 0;
		var technicalWithoutOwner = 0;

		var invalidAnalysisOwner = 0;

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				candidate.objectType ===
				"ANALYSIS_PACKAGE"
			)
			{
				analysisPackages++;

				/*
				 * Un Analysis Package doit être
				 * son propre propriétaire.
				 */
				if (
					candidate.analysisPackageGuid !==
					candidate.guid
				)
				{
					invalidAnalysisOwner++;
				}
			}
			else if (
				candidate.objectType ===
				"TECHNICAL_PACKAGE"
			)
			{
				technicalPackages++;

				if (
					addin.utils.isEmpty(
						candidate.analysisPackageGuid
					)
				)
				{
					technicalWithoutOwner++;
				}
				else
				{
					technicalWithOwner++;
				}
			}
		}

		var success =
			candidates.length === 39 &&
			analysisPackages === 31 &&
			technicalPackages === 8 &&
			technicalWithOwner === 0 &&
			technicalWithoutOwner === 8 &&
			invalidAnalysisOwner === 0;

		addin.logger.info(
			"TEST UNIQUENESS OWNERSHIP" +
			" | Total=" + candidates.length +
			" | AnalysisPackages=" + analysisPackages +
			" | TechnicalPackages=" + technicalPackages +
			" | TechnicalWithOwner=" + technicalWithOwner +
			" | TechnicalWithoutOwner=" + technicalWithoutOwner +
			" | InvalidAnalysisOwner=" + invalidAnalysisOwner +
			" | Success=" + success
		);

		return success;
	},
		
	testTechnicalPackageParents: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var candidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				candidate.objectType !==
				"TECHNICAL_PACKAGE"
			)
				continue;

			var parent = null;

			for (
				var j = 0;
				j < candidates.length;
				j++
			)
			{
				if (
					candidates[j].guid ===
					candidate.parentGuid
				)
				{
					parent =
						candidates[j];

					break;
				}
			}

			addin.logger.info(
				"TECHNICAL PARENT" +
				" | Technical=" +
					candidate.name +
				" | Parent=" +
					(parent
						? parent.name
						: "[ROOT ou introuvable]") +
				" | ParentType=" +
					(parent
						? parent.objectType
						: "") +
				" | Owner=" +
					candidate.analysisPackageGuid
			);
		}

		return true;
	},
		
	testAnalysisArtifactsSQL: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST ANALYSIS ARTIFACTS SQL" +
				" | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST ANALYSIS ARTIFACTS SQL" +
				" | ROOT introuvable."
			);

			return false;
		}

		var rows =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var total = 0;
		var withoutGuid = 0;
		var withoutPackageId = 0;

		for (
			var i = 0;
			i < rows.length;
			i++
		)
		{
			var row =
				rows[i];

			total++;

			if (
				addin.utils.isEmpty(
					row.ObjectGUID
				)
			)
			{
				withoutGuid++;
			}

			if (
				addin.utils.isEmpty(
					row.PackageID
				)
			)
			{
				withoutPackageId++;
			}
		}

		var success =
			total > 0 &&
			withoutGuid === 0 &&
			withoutPackageId === 0;

		addin.logger.info(
			"TEST ANALYSIS ARTIFACTS SQL" +
			" | Total=" + total +
			" | WithoutGuid=" + withoutGuid +
			" | WithoutPackageId=" + withoutPackageId +
			" | Success=" + success
		);

		return success;
	},
		
	testArtifactAnalysisPackageOwnership: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifacts =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var withOwner = 0;
		var withoutOwner = 0;

		for (
			var i = 0;
			i < artifacts.length;
			i++
		)
		{
			var artifact =
				artifacts[i];

			var ownerGuid =
				addin.analysisStructureSynchronizer
					._findOwningAnalysisPackageGuid(
						artifact.PackageID,
						packageCandidates
					);

			if (
				addin.utils.isEmpty(
					ownerGuid
				)
			)
			{
				withoutOwner++;
			}
			else
			{
				withOwner++;
			}
		}

		var success =
			artifacts.length === 110 &&
			withOwner + withoutOwner ===
				artifacts.length;

		addin.logger.info(
			"TEST ARTIFACT OWNERSHIP" +
			" | Total=" + artifacts.length +
			" | WithOwner=" + withOwner +
			" | WithoutOwner=" + withoutOwner +
			" | Success=" + success
		);

		return success;
	},
		
	testAnalysisArtifactTypes: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var artifacts =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var types = {};

		for (
			var i = 0;
			i < artifacts.length;
			i++
		)
		{
			var row =
				artifacts[i];

			var type =
				addin.utils.trim(
					row.ObjectType
				);

			if (addin.utils.isEmpty(type))
				type = "[EMPTY]";

			if (!types[type])
				types[type] = 0;

			types[type]++;
		}

		addin.logger.info(
			"TEST ANALYSIS ARTIFACT TYPES" +
			" | Total=" + artifacts.length
		);

		for (var type in types)
		{
			if (!types.hasOwnProperty(type))
				continue;

			addin.logger.info(
				"OBJECT TYPE" +
				" | Type=" + type +
				" | Count=" + types[type]
			);
		}

		return true;
	},
		
	testOwnedAnalysisArtifactTypes: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifacts =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var types = {};
		var withOwner = 0;

		for (
			var i = 0;
			i < artifacts.length;
			i++
		)
		{
			var row =
				artifacts[i];

			var ownerGuid =
				addin.analysisStructureSynchronizer
					._findOwningAnalysisPackageGuid(
						row.PackageID,
						packageCandidates
					);

			if (
				addin.utils.isEmpty(
					ownerGuid
				)
			)
			{
				continue;
			}

			withOwner++;

			var type =
				addin.utils.trim(
					row.ObjectType
				);

			if (addin.utils.isEmpty(type))
				type = "[EMPTY]";

			if (!types[type])
				types[type] = 0;

			types[type]++;
		}

		addin.logger.info(
			"TEST OWNED ANALYSIS ARTIFACT TYPES" +
			" | WithOwner=" + withOwner
		);

		for (var type in types)
		{
			if (!types.hasOwnProperty(type))
				continue;

			addin.logger.info(
				"OWNED OBJECT TYPE" +
				" | Type=" + type +
				" | Count=" + types[type]
			);
		}

		return true;
	},
		
	testOwnedArtifactSourceTags: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifacts =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var withOwner = 0;
		var withSource = 0;
		var withoutSource = 0;

		for (
			var i = 0;
			i < artifacts.length;
			i++
		)
		{
			var row =
				artifacts[i];

			var ownerGuid =
				addin.analysisStructureSynchronizer
					._findOwningAnalysisPackageGuid(
						row.PackageID,
						packageCandidates
					);

			if (
				addin.utils.isEmpty(
					ownerGuid
				)
			)
			{
				continue;
			}

			withOwner++;

			var element =
				addin.repositoryService
					.getElementByGuid(
						row.ObjectGUID
					);

			if (!element)
			{
				withoutSource++;
				continue;
			}

			var sourceGuid =
				addin.repositoryService
					.getTaggedValue(
						element,
						addin.fbaConstants
							.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
					);

			if (
				addin.utils.isEmpty(
					sourceGuid
				)
			)
			{
				withoutSource++;
			}
			else
			{
				withSource++;
			}
		}

		var success =
			withOwner === 36 &&
			withSource + withoutSource ===
				withOwner;

		addin.logger.info(
			"TEST OWNED ARTIFACT SOURCE TAGS" +
			" | WithOwner=" + withOwner +
			" | WithSource=" + withSource +
			" | WithoutSource=" + withoutSource +
			" | Success=" + success
		);

		return success;
	},
		
	testArtifactUniquenessCandidates: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifactRows =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var candidates =
			addin.analysisStructureSynchronizer
				._createArtifactUniquenessCandidates(
					artifactRows,
					packageCandidates
				);

		var withoutGuid = 0;
		var withoutName = 0;
		var withoutOwner = 0;
		var wrongType = 0;

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				addin.utils.isEmpty(
					candidate.guid
				)
			)
				withoutGuid++;

			if (
				addin.utils.isEmpty(
					candidate.uniquenessName
				)
			)
				withoutName++;

			if (
				addin.utils.isEmpty(
					candidate.analysisPackageGuid
				)
			)
				withoutOwner++;

			if (
				candidate.objectType !==
				"ARTIFACT"
			)
				wrongType++;
		}

		var success =
			candidates.length === 36 &&
			withoutGuid === 0 &&
			withoutName === 0 &&
			withoutOwner === 0 &&
			wrongType === 0;

		addin.logger.info(
			"TEST ARTIFACT UNIQUENESS CANDIDATES" +
			" | Total=" + candidates.length +
			" | WithoutGuid=" + withoutGuid +
			" | WithoutName=" + withoutName +
			" | WithoutOwner=" + withoutOwner +
			" | WrongType=" + wrongType +
			" | Success=" + success
		);

		return success;
	},
		
	testDuplicateArtifacts: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifactRows =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var candidates =
			addin.analysisStructureSynchronizer
				._createArtifactUniquenessCandidates(
					artifactRows,
					packageCandidates
				);

		var duplicates =
			addin.analysisStructureSynchronizer
				._findDuplicateArtifacts(
					candidates
				);

		var localExcess = 0;
		var globalExcess = 0;

		for (
			var i = 0;
			i < duplicates.local.length;
			i++
		)
		{
			localExcess +=
				duplicates.local[i].excess;
		}

		for (
			var j = 0;
			j < duplicates.global.length;
			j++
		)
		{
			globalExcess +=
				duplicates.global[j].excess;
		}

		addin.logger.info(
			"TEST DUPLICATE ARTIFACTS" +
			" | Candidates=" + candidates.length +
			" | LocalGroups=" +
				duplicates.local.length +
			" | LocalExcess=" +
				localExcess +
			" | GlobalGroups=" +
				duplicates.global.length +
			" | GlobalExcess=" +
				globalExcess +
			" | Success=true"
		);

		return true;
	},
		
	testDuplicateArtifactsPositive: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var candidates = [];

		/*
		 * Deux artefacts de même nom
		 * dans le même Analysis Package.
		 *
		 * => 1 groupe LOCAL
		 */
		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{11111111-1111-1111-1111-111111111111}",
				"ARTIFACT",
				"EXG001 - Client",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{22222222-2222-2222-2222-222222222222}",
				"ARTIFACT",
				"  exg001 - client  ",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		/*
		 * Même nom dans un autre Analysis Package.
		 *
		 * => le même nom existe maintenant
		 *    dans deux Analysis Packages :
		 *    1 groupe GLOBAL.
		 */
		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{33333333-3333-3333-3333-333333333333}",
				"ARTIFACT",
				"EXG001 - CLIENT",
				"",
				"{BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB}",
				""
			)
		);

		/*
		 * Artefact différent :
		 * aucun doublon.
		 */
		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{44444444-4444-4444-4444-444444444444}",
				"ARTIFACT",
				"EXG002 - Commande",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		var duplicates =
			synchronizer._findDuplicateArtifacts(
				candidates
			);

		var localGroupCount =
			duplicates.local.length;

		var globalGroupCount =
			duplicates.global.length;

		var localObjectCount =
			localGroupCount > 0
				? duplicates.local[0].objects.length
				: 0;

		var globalObjectCount =
			globalGroupCount > 0
				? duplicates.global[0].objects.length
				: 0;

		var success =
			localGroupCount === 1 &&
			globalGroupCount === 1 &&
			localObjectCount === 2 &&
			globalObjectCount === 3;

		addin.logger.info(
			"TEST DUPLICATE ARTIFACTS POSITIVE" +
			" | Candidates=" + candidates.length +
			" | LocalGroups=" + localGroupCount +
			" | LocalObjects=" + localObjectCount +
			" | GlobalGroups=" + globalGroupCount +
			" | GlobalObjects=" + globalObjectCount +
			" | Success=" + success
		);

		return success;
	},
	
	testAnalysisDiagramsSQL: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
		{
			addin.logger.error(
				"TEST ANALYSIS DIAGRAMS SQL" +
				" | Aucun package sélectionné."
			);

			return false;
		}

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			addin.logger.error(
				"TEST ANALYSIS DIAGRAMS SQL" +
				" | ROOT introuvable."
			);

			return false;
		}

		var rows =
			addin.repositoryService
				.getAnalysisDiagramsSQL(
					context.analysisRoot
				);

		var withoutGuid = 0;
		var withoutPackageId = 0;

		for (
			var i = 0;
			i < rows.length;
			i++
		)
		{
			if (
				addin.utils.isEmpty(
					rows[i].DiagramGUID
				)
			)
			{
				withoutGuid++;
			}

			if (
				addin.utils.isEmpty(
					rows[i].PackageID
				)
			)
			{
				withoutPackageId++;
			}
		}

		var success =
			withoutGuid === 0 &&
			withoutPackageId === 0;

		addin.logger.info(
			"TEST ANALYSIS DIAGRAMS SQL" +
			" | Total=" + rows.length +
			" | WithoutGuid=" + withoutGuid +
			" | WithoutPackageId=" + withoutPackageId +
			" | Success=" + success
		);

		return success;
	},
		
	testDiagramAnalysisPackageOwnership: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var diagrams =
			addin.repositoryService
				.getAnalysisDiagramsSQL(
					context.analysisRoot
				);

		var withOwner = 0;
		var withoutOwner = 0;

		for (
			var i = 0;
			i < diagrams.length;
			i++
		)
		{
			var diagram =
				diagrams[i];

			var ownerGuid =
				addin.analysisStructureSynchronizer
					._findOwningAnalysisPackageGuid(
						diagram.PackageID,
						packageCandidates
					);

			if (
				addin.utils.isEmpty(
					ownerGuid
				)
			)
			{
				withoutOwner++;
			}
			else
			{
				withOwner++;
			}
		}

		var success =
			diagrams.length === 32 &&
			withOwner + withoutOwner ===
				diagrams.length;

		addin.logger.info(
			"TEST DIAGRAM OWNERSHIP" +
			" | Total=" + diagrams.length +
			" | WithOwner=" + withOwner +
			" | WithoutOwner=" + withoutOwner +
			" | Success=" + success
		);

		return success;
	},
		
	testDiagramUniquenessCandidates: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var diagramRows =
			addin.repositoryService
				.getAnalysisDiagramsSQL(
					context.analysisRoot
				);

		var candidates =
			addin.analysisStructureSynchronizer
				._createDiagramUniquenessCandidates(
					diagramRows,
					packageCandidates
				);

		var withoutGuid = 0;
		var withoutName = 0;
		var withoutOwner = 0;
		var wrongType = 0;

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				addin.utils.isEmpty(
					candidate.guid
				)
			)
				withoutGuid++;

			if (
				addin.utils.isEmpty(
					candidate.uniquenessName
				)
			)
				withoutName++;

			if (
				addin.utils.isEmpty(
					candidate.analysisPackageGuid
				)
			)
				withoutOwner++;

			if (
				candidate.objectType !==
				"DIAGRAM"
			)
				wrongType++;
		}

		var success =
			candidates.length === 31 &&
			withoutGuid === 0 &&
			withoutName === 0 &&
			withoutOwner === 0 &&
			wrongType === 0;

		addin.logger.info(
			"TEST DIAGRAM UNIQUENESS CANDIDATES" +
			" | Total=" + candidates.length +
			" | WithoutGuid=" + withoutGuid +
			" | WithoutName=" + withoutName +
			" | WithoutOwner=" + withoutOwner +
			" | WrongType=" + wrongType +
			" | Success=" + success
		);

		return success;
	},
		
	testDuplicateDiagrams: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var packageCandidates =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var diagramRows =
			addin.repositoryService
				.getAnalysisDiagramsSQL(
					context.analysisRoot
				);

		var candidates =
			addin.analysisStructureSynchronizer
				._createDiagramUniquenessCandidates(
					diagramRows,
					packageCandidates
				);

		var duplicates =
			addin.analysisStructureSynchronizer
				._findDuplicateDiagrams(
					candidates
				);

		var localExcess = 0;
		var globalExcess = 0;

		for (
			var i = 0;
			i < duplicates.local.length;
			i++
		)
		{
			localExcess +=
				duplicates.local[i].excess;
		}

		for (
			var j = 0;
			j < duplicates.global.length;
			j++
		)
		{
			globalExcess +=
				duplicates.global[j].excess;
		}

		addin.logger.info(
			"TEST DUPLICATE DIAGRAMS" +
			" | Candidates=" + candidates.length +
			" | LocalGroups=" +
				duplicates.local.length +
			" | LocalExcess=" +
				localExcess +
			" | GlobalGroups=" +
				duplicates.global.length +
			" | GlobalExcess=" +
				globalExcess +
			" | Success=true"
		);

		return true;
	},
		
	testDuplicateDiagramsPositive: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var candidates = [];

		/*
		 * Deux diagrammes de même nom
		 * dans le même Analysis Package.
		 *
		 * => 1 groupe LOCAL
		 */
		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{11111111-1111-1111-1111-111111111111}",
				"DIAGRAM",
				"Processus - Accueil",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{22222222-2222-2222-2222-222222222222}",
				"DIAGRAM",
				"  processus - accueil  ",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		/*
		 * Même nom dans un autre Analysis Package.
		 *
		 * => 1 groupe GLOBAL.
		 */
		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{33333333-3333-3333-3333-333333333333}",
				"DIAGRAM",
				"PROCESSUS - ACCUEIL",
				"",
				"{BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB}",
				""
			)
		);

		/*
		 * Diagramme différent.
		 */
		candidates.push(
			synchronizer._createUniquenessCandidate(
				"{44444444-4444-4444-4444-444444444444}",
				"DIAGRAM",
				"Processus - Validation",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		var duplicates =
			synchronizer._findDuplicateDiagrams(
				candidates
			);

		var localGroupCount =
			duplicates.local.length;

		var globalGroupCount =
			duplicates.global.length;

		var localObjectCount =
			localGroupCount > 0
				? duplicates.local[0].objects.length
				: 0;

		var globalObjectCount =
			globalGroupCount > 0
				? duplicates.global[0].objects.length
				: 0;

		var success =
			localGroupCount === 1 &&
			globalGroupCount === 1 &&
			localObjectCount === 2 &&
			globalObjectCount === 3;

		addin.logger.info(
			"TEST DUPLICATE DIAGRAMS POSITIVE" +
			" | Candidates=" + candidates.length +
			" | LocalGroups=" + localGroupCount +
			" | LocalObjects=" + localObjectCount +
			" | GlobalGroups=" + globalGroupCount +
			" | GlobalObjects=" + globalObjectCount +
			" | Success=" + success
		);

		return success;
	},
	
	testCreateDuplicateGroup: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var objects = [];

		objects.push(
			synchronizer._createUniquenessCandidate(
				"{11111111-1111-1111-1111-111111111111}",
				"ARTIFACT",
				"EXG001 - Client",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		objects.push(
			synchronizer._createUniquenessCandidate(
				"{22222222-2222-2222-2222-222222222222}",
				"ARTIFACT",
				"EXG001 - Client",
				"",
				"{BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB}",
				""
			)
		);

		objects.push(
			synchronizer._createUniquenessCandidate(
				"{33333333-3333-3333-3333-333333333333}",
				"ARTIFACT",
				"EXG001 - Client",
				"",
				"{CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC}",
				""
			)
		);

		var group =
			synchronizer._createDuplicateGroup(
				"GLOBAL",
				"ARTIFACT",
				"exg001 - client",
				objects
			);

		var success =
			group &&
			group.scope === "GLOBAL" &&
			group.objectType === "ARTIFACT" &&
			group.uniquenessName ===
				"exg001 - client" &&
			group.count === 3 &&
			group.excess === 2 &&
			group.objectGuids.length === 3;

		addin.logger.info(
			"TEST CREATE DUPLICATE GROUP" +
			" | Scope=" +
				(group ? group.scope : "") +
			" | Type=" +
				(group ? group.objectType : "") +
			" | Count=" +
				(group ? group.count : 0) +
			" | Excess=" +
				(group ? group.excess : 0) +
			" | ObjectGuids=" +
				(group
					? group.objectGuids.length
					: 0) +
			" | Success=" + success
		);

		return success;
	},
	
	testRegisterCheckIssueForObjects: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var guid1 =
			"{11111111-1111-1111-1111-111111111111}";

		var guid2 =
			"{22222222-2222-2222-2222-222222222222}";

		var guid3 =
			"{33333333-3333-3333-3333-333333333333}";

		guid1 =
			addin.utils.normalizeGuid(guid1);

		guid2 =
			addin.utils.normalizeGuid(guid2);

		guid3 =
			addin.utils.normalizeGuid(guid3);

		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};

		result.objects[guid1] = {
			guid: guid1,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[guid2] = {
			guid: guid2,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[guid3] = {
			guid: guid3,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		var issue = {
			code:
				"DUPLICATE_ARTIFACT_NAME",

			severity:
				"ERROR",

			scope:
				"GLOBAL",

			message:
				"Nom d'artefact dupliqué."
		};

		synchronizer
			._registerCheckIssueForObjects(
				result,
				issue,
				[
					guid1,
					guid2,
					guid3
				]
			);

		var success =
			result.issues.length === 1 &&
			result.summary.errors === 1 &&

			result.objects[guid1]
				.issues.length === 1 &&

			result.objects[guid2]
				.issues.length === 1 &&

			result.objects[guid3]
				.issues.length === 1 &&

			result.objects[guid1]
				.summary.errors === 1 &&

			result.objects[guid2]
				.summary.errors === 1 &&

			result.objects[guid3]
				.summary.errors === 1;

		addin.logger.info(
			"TEST REGISTER CHECK ISSUE FOR OBJECTS" +
			" | GlobalIssues=" +
				result.issues.length +
			" | GlobalErrors=" +
				result.summary.errors +
			" | Object1Issues=" +
				result.objects[guid1].issues.length +
			" | Object2Issues=" +
				result.objects[guid2].issues.length +
			" | Object3Issues=" +
				result.objects[guid3].issues.length +
			" | Success=" + success
		);

		return success;
	},
	
	testDuplicateCheckConstants: function()
	{
		var c =
			addin.fbaConstants;

		var success =
			c.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME ===
				"DUPLICATE_ANALYSIS_PACKAGE_NAME" &&

			c.CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME ===
				"DUPLICATE_TECHNICAL_PACKAGE_NAME" &&

			c.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME ===
				"DUPLICATE_ARTIFACT_NAME" &&

			c.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME ===
				"DUPLICATE_DIAGRAM_NAME" &&

			c.CHECK_ACTION_MANUAL_REVIEW ===
				"MANUAL_REVIEW";

		addin.logger.info(
			"TEST DUPLICATE CHECK CONSTANTS" +
			" | AnalysisPackage=" +
				c.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME +
			" | TechnicalPackage=" +
				c.CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME +
			" | Artifact=" +
				c.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME +
			" | Diagram=" +
				c.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME +
			" | Action=" +
				c.CHECK_ACTION_MANUAL_REVIEW +
			" | Success=" + success
		);

		return success;
	},
	
	testCreateDuplicateCheckIssue: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var objects = [];

		objects.push(
			synchronizer._createUniquenessCandidate(
				"{11111111-1111-1111-1111-111111111111}",
				"ARTIFACT",
				"EXG001 - Client",
				"",
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}",
				""
			)
		);

		objects.push(
			synchronizer._createUniquenessCandidate(
				"{22222222-2222-2222-2222-222222222222}",
				"ARTIFACT",
				"EXG001 - Client",
				"",
				"{BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB}",
				""
			)
		);

		var group =
			synchronizer._createDuplicateGroup(
				"GLOBAL",
				"ARTIFACT",
				"exg001 - client",
				objects
			);

		var issue =
			synchronizer._createDuplicateCheckIssue(
				group
			);

		var success =
			issue &&

			issue.code ===
				addin.fbaConstants
					.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME &&

			issue.severity === "ERROR" &&

			issue.action ===
				addin.fbaConstants
					.CHECK_ACTION_MANUAL_REVIEW &&

			issue.scope === "GLOBAL" &&

			issue.objectType === "ARTIFACT" &&

			issue.uniquenessName ===
				"exg001 - client" &&

			issue.count === 2 &&

			issue.excess === 1 &&

			issue.objectGuids.length === 2;

		addin.logger.info(
			"TEST CREATE DUPLICATE CHECK ISSUE" +
			" | Code=" +
				(issue ? issue.code : "") +
			" | Severity=" +
				(issue ? issue.severity : "") +
			" | Action=" +
				(issue ? issue.action : "") +
			" | Scope=" +
				(issue ? issue.scope : "") +
			" | Count=" +
				(issue ? issue.count : 0) +
			" | Excess=" +
				(issue ? issue.excess : 0) +
			" | ObjectGuids=" +
				(issue
					? issue.objectGuids.length
					: 0) +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckAnalysisUniqueness: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver.resolvePackage(
				currentPackage
			);

		if (
			!context ||
			!context.analysisRoot
		)
			return false;

		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};

		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);

		var success =
			executed === true &&
			result.issues.length === 0 &&
			result.summary.errors === 0 &&
			result.summary.warnings === 0;

		addin.logger.info(
			"TEST CHECK ANALYSIS UNIQUENESS" +
			" | Executed=" + executed +
			" | Issues=" +
				result.issues.length +
			" | Errors=" +
				result.summary.errors +
			" | Warnings=" +
				result.summary.warnings +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckUniquenessCandidatesArtifacts: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var packageA =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}"
			);

		var packageB =
			addin.utils.normalizeGuid(
				"{BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB}"
			);

		var guid1 =
			addin.utils.normalizeGuid(
				"{11111111-1111-1111-1111-111111111111}"
			);

		var guid2 =
			addin.utils.normalizeGuid(
				"{22222222-2222-2222-2222-222222222222}"
			);

		var guid3 =
			addin.utils.normalizeGuid(
				"{33333333-3333-3333-3333-333333333333}"
			);


		var artifactCandidates = [];

		artifactCandidates.push(
			synchronizer._createUniquenessCandidate(
				guid1,
				"ARTIFACT",
				"Client",
				"",
				packageA,
				""
			)
		);

		artifactCandidates.push(
			synchronizer._createUniquenessCandidate(
				guid2,
				"ARTIFACT",
				" client ",
				"",
				packageA,
				""
			)
		);

		artifactCandidates.push(
			synchronizer._createUniquenessCandidate(
				guid3,
				"ARTIFACT",
				"CLIENT",
				"",
				packageB,
				""
			)
		);


		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};


		result.objects[guid1] = {
			guid: guid1,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[guid2] = {
			guid: guid2,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[guid3] = {
			guid: guid3,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};


		var executed =
			synchronizer._checkUniquenessCandidates(
				[],
				artifactCandidates,
				[],
				result
			);


		var localIssues = 0;
		var globalIssues = 0;

		for (
			var i = 0;
			i < result.issues.length;
			i++
		)
		{
			var issue =
				result.issues[i];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME
			)
			{
				if (issue.scope === "LOCAL")
					localIssues++;

				if (issue.scope === "GLOBAL")
					globalIssues++;
			}
		}


		var success =
			executed === true &&

			result.issues.length === 2 &&
			result.summary.errors === 2 &&

			localIssues === 1 &&
			globalIssues === 1 &&

			result.objects[guid1]
				.issues.length === 2 &&

			result.objects[guid2]
				.issues.length === 2 &&

			result.objects[guid3]
				.issues.length === 1 &&

			result.objects[guid1]
				.summary.errors === 2 &&

			result.objects[guid2]
				.summary.errors === 2 &&

			result.objects[guid3]
				.summary.errors === 1;


		addin.logger.info(
			"TEST CHECK UNIQUENESS CANDIDATES ARTIFACTS" +
			" | Executed=" + executed +
			" | Issues=" +
				result.issues.length +
			" | Errors=" +
				result.summary.errors +
			" | Local=" +
				localIssues +
			" | Global=" +
				globalIssues +
			" | Object1=" +
				result.objects[guid1].issues.length +
			" | Object2=" +
				result.objects[guid2].issues.length +
			" | Object3=" +
				result.objects[guid3].issues.length +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckUniquenessCandidatesPackages: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var rootGuid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-0000-0000-0000-000000000000}"
			);

		var analysis1Guid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-1111-1111-1111-111111111111}"
			);

		var analysis2Guid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-2222-2222-2222-222222222222}"
			);

		var analysisAGuid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-3333-3333-3333-333333333333}"
			);

		var analysisBGuid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-4444-4444-4444-444444444444}"
			);

		var technical1Guid =
			addin.utils.normalizeGuid(
				"{BBBBBBBB-1111-1111-1111-111111111111}"
			);

		var technical2Guid =
			addin.utils.normalizeGuid(
				"{BBBBBBBB-2222-2222-2222-222222222222}"
			);

		var technical3Guid =
			addin.utils.normalizeGuid(
				"{BBBBBBBB-3333-3333-3333-333333333333}"
			);


		var packageCandidates = [];


		/*
		 * Doublon GLOBAL d'Analysis Package.
		 */
		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				analysis1Guid,
				"ANALYSIS_PACKAGE",
				"Besoins",
				rootGuid,
				analysis1Guid,
				""
			)
		);

		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				analysis2Guid,
				"ANALYSIS_PACKAGE",
				" besoins ",
				rootGuid,
				analysis2Guid,
				""
			)
		);


		/*
		 * Deux Analysis Packages servant de parents
		 * aux packages techniques.
		 */
		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				analysisAGuid,
				"ANALYSIS_PACKAGE",
				"Analyse A",
				rootGuid,
				analysisAGuid,
				""
			)
		);

		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				analysisBGuid,
				"ANALYSIS_PACKAGE",
				"Analyse B",
				rootGuid,
				analysisBGuid,
				""
			)
		);


		/*
		 * Doublon LOCAL :
		 * même nom + même parent direct.
		 */
		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				technical1Guid,
				"TECHNICAL_PACKAGE",
				"_Technique",
				analysisAGuid,
				analysisAGuid,
				""
			)
		);

		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				technical2Guid,
				"TECHNICAL_PACKAGE",
				"_TECHNIQUE",
				analysisAGuid,
				analysisAGuid,
				""
			)
		);


		/*
		 * Même nom mais autre parent :
		 * ce n'est PAS un doublon.
		 */
		packageCandidates.push(
			synchronizer._createUniquenessCandidate(
				technical3Guid,
				"TECHNICAL_PACKAGE",
				"_Technique",
				analysisBGuid,
				analysisBGuid,
				""
			)
		);


		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};


		/*
		 * Tous les vrais objets doivent être
		 * enregistrés pour tester le rattachement.
		 */
		for (
			var i = 0;
			i < packageCandidates.length;
			i++
		)
		{
			var candidate =
				packageCandidates[i];

			result.objects[candidate.guid] = {
				guid:
					candidate.guid,

				issues:
					[],

				summary: {
					errors: 0,
					warnings: 0
				}
			};
		}


		var executed =
			synchronizer._checkUniquenessCandidates(
				packageCandidates,
				[],
				[],
				result
			);


		var analysisPackageIssues = 0;
		var technicalPackageIssues = 0;

		for (
			var j = 0;
			j < result.issues.length;
			j++
		)
		{
			var issue =
				result.issues[j];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME
			)
			{
				analysisPackageIssues++;
			}

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME
			)
			{
				technicalPackageIssues++;
			}
		}


		var success =
			executed === true &&

			result.issues.length === 2 &&
			result.summary.errors === 2 &&

			analysisPackageIssues === 1 &&
			technicalPackageIssues === 1 &&

			result.objects[analysis1Guid]
				.issues.length === 1 &&

			result.objects[analysis2Guid]
				.issues.length === 1 &&

			result.objects[technical1Guid]
				.issues.length === 1 &&

			result.objects[technical2Guid]
				.issues.length === 1 &&

			/*
			 * Le troisième package technique
			 * porte le même nom mais possède
			 * un autre parent direct.
			 */
			result.objects[technical3Guid]
				.issues.length === 0;


		addin.logger.info(
			"TEST CHECK UNIQUENESS CANDIDATES PACKAGES" +
			" | Executed=" + executed +
			" | Issues=" +
				result.issues.length +
			" | Errors=" +
				result.summary.errors +
			" | AnalysisPackage=" +
				analysisPackageIssues +
			" | TechnicalPackage=" +
				technicalPackageIssues +
			" | TechnicalSameParent=" +
				result.objects[technical1Guid]
					.issues.length +
				"/" +
				result.objects[technical2Guid]
					.issues.length +
			" | TechnicalOtherParent=" +
				result.objects[technical3Guid]
					.issues.length +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckUniquenessCandidatesDiagrams: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var packageA =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA}"
			);

		var packageB =
			addin.utils.normalizeGuid(
				"{BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB}"
			);

		var guid1 =
			addin.utils.normalizeGuid(
				"{11111111-1111-1111-1111-111111111111}"
			);

		var guid2 =
			addin.utils.normalizeGuid(
				"{22222222-2222-2222-2222-222222222222}"
			);

		var guid3 =
			addin.utils.normalizeGuid(
				"{33333333-3333-3333-3333-333333333333}"
			);


		var diagramCandidates = [];

		diagramCandidates.push(
			synchronizer._createUniquenessCandidate(
				guid1,
				"DIAGRAM",
				"Processus",
				"",
				packageA,
				""
			)
		);

		diagramCandidates.push(
			synchronizer._createUniquenessCandidate(
				guid2,
				"DIAGRAM",
				" processus ",
				"",
				packageA,
				""
			)
		);

		diagramCandidates.push(
			synchronizer._createUniquenessCandidate(
				guid3,
				"DIAGRAM",
				"PROCESSUS",
				"",
				packageB,
				""
			)
		);


		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};


		result.objects[guid1] = {
			guid: guid1,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[guid2] = {
			guid: guid2,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[guid3] = {
			guid: guid3,
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			}
		};


		var executed =
			synchronizer._checkUniquenessCandidates(
				[],
				[],
				diagramCandidates,
				result
			);


		var localIssues = 0;
		var globalIssues = 0;

		for (
			var i = 0;
			i < result.issues.length;
			i++
		)
		{
			var issue =
				result.issues[i];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME
			)
			{
				if (issue.scope === "LOCAL")
					localIssues++;

				if (issue.scope === "GLOBAL")
					globalIssues++;
			}
		}


		var success =
			executed === true &&

			result.issues.length === 2 &&
			result.summary.errors === 2 &&

			localIssues === 1 &&
			globalIssues === 1 &&

			result.objects[guid1]
				.issues.length === 2 &&

			result.objects[guid2]
				.issues.length === 2 &&

			result.objects[guid3]
				.issues.length === 1;


		addin.logger.info(
			"TEST CHECK UNIQUENESS CANDIDATES DIAGRAMS" +
			" | Executed=" + executed +
			" | Issues=" +
				result.issues.length +
			" | Errors=" +
				result.summary.errors +
			" | Local=" +
				localIssues +
			" | Global=" +
				globalIssues +
			" | Object1=" +
				result.objects[guid1].issues.length +
			" | Object2=" +
				result.objects[guid2].issues.length +
			" | Object3=" +
				result.objects[guid3].issues.length +
			" | Success=" + success
		);

		return success;
	},
	
	testRegisterUniquenessPackageObjects: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;

		var rootGuid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-0000-0000-0000-000000000000}"
			);

		var analysisGuid =
			addin.utils.normalizeGuid(
				"{AAAAAAAA-1111-1111-1111-111111111111}"
			);

		var technicalGuid =
			addin.utils.normalizeGuid(
				"{BBBBBBBB-1111-1111-1111-111111111111}"
			);


		var analysisCandidate =
			synchronizer._createUniquenessCandidate(
				analysisGuid,
				"ANALYSIS_PACKAGE",
				"Besoins",
				rootGuid,
				analysisGuid,
				""
			);

		var technicalCandidate =
			synchronizer._createUniquenessCandidate(
				technicalGuid,
				"TECHNICAL_PACKAGE",
				"_Technique",
				analysisGuid,
				analysisGuid,
				""
			);


		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};


		/*
		 * Simulation d'un Analysis Package
		 * déjà enregistré par le CHECK.
		 */
		result.objects[analysisGuid] = {
			guid:
				analysisGuid,

			objectType:
				"PACKAGE",

			name:
				"Besoins",

			parentGuid:
				rootGuid,

			checkedAt:
				"ALREADY_REGISTERED",

			issues:
				[],

			summary: {
				errors: 0,
				warnings: 0
			}
		};


		var executed =
			synchronizer
				._registerUniquenessPackageObjects(
					result,
					[
						analysisCandidate,
						technicalCandidate
					]
				);


		var analysisObject =
			result.objects[
				analysisGuid
			];

		var technicalObject =
			result.objects[
				technicalGuid
			];


		var success =
			executed === true &&

			/*
			 * Les deux objets sont présents.
			 */
			Object.keys(
				result.objects
			).length === 2 &&

			/*
			 * L'objet existant n'a pas été remplacé.
			 */
			analysisObject &&
			analysisObject.checkedAt ===
				"ALREADY_REGISTERED" &&

			/*
			 * Le package technique a été ajouté.
			 */
			technicalObject &&
			technicalObject.guid ===
				technicalGuid &&

			technicalObject.objectType ===
				"PACKAGE" &&

			technicalObject.name ===
				"_Technique" &&

			technicalObject.parentGuid ===
				analysisGuid;


		addin.logger.info(
			"TEST REGISTER UNIQUENESS PACKAGE OBJECTS" +
			" | Executed=" + executed +
			" | Objects=" +
				Object.keys(
					result.objects
				).length +
			" | ExistingPreserved=" +
				(
					analysisObject &&
					analysisObject.checkedAt ===
						"ALREADY_REGISTERED"
				) +
			" | TechnicalRegistered=" +
				(
					technicalObject != null
				) +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckAnalysisUniquenessPackageRegistration: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(
					currentPackage
				);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			return false;
		}

		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};

		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var packageCount = 0;
		var technicalCount = 0;
		var analysisCount = 0;

		for (
			var guid in result.objects
		)
		{
			if (
				!result.objects.hasOwnProperty(
					guid
				)
			)
			{
				continue;
			}

			var checkObject =
				result.objects[guid];

			if (
				checkObject.objectType !==
					"PACKAGE"
			)
			{
				continue;
			}

			packageCount++;

			if (
				addin.utils.startsWith(
					checkObject.name,
					addin.fbaConstants
						.TECHNICAL_PACKAGE_PREFIX
				)
			)
			{
				technicalCount++;
			}
			else
			{
				analysisCount++;
			}
		}


		var success =
			executed === true &&
			packageCount === 39 &&
			analysisCount === 31 &&
			technicalCount === 8 &&
			result.issues.length === 0;


		addin.logger.info(
			"TEST CHECK UNIQUENESS PACKAGE REGISTRATION" +
			" | Executed=" + executed +
			" | Packages=" + packageCount +
			" | Analysis=" + analysisCount +
			" | Technical=" + technicalCount +
			" | Issues=" +
				result.issues.length +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckUniquenessObjectCoverage: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(
					currentPackage
				);

		if (
			!context ||
			!context.analysisRoot
		)
		{
			return false;
		}

		var rootPackage =
			context.analysisRoot;


		/*
		 * Snapshot produit par le CHECK réel.
		 */
		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					rootPackage
				);

		if (
			!result ||
			!result.objects
		)
		{
			return false;
		}


		/*
		 * Packages nécessaires pour déterminer
		 * le propriétaire des artefacts/diagrammes.
		 */
		var packageRows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					rootPackage
				);


		/*
		 * Artefacts concernés par les règles
		 * d'unicité.
		 */
		var artifactRows =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					rootPackage
				);

		var artifactCandidates =
			addin.analysisStructureSynchronizer
				._createArtifactUniquenessCandidates(
					artifactRows,
					packageRows
				);


		/*
		 * Diagrammes concernés par les règles
		 * d'unicité.
		 */
		var diagramRows =
			addin.repositoryService
				.getAnalysisDiagramsSQL(
					rootPackage
				);

		var diagramCandidates =
			addin.analysisStructureSynchronizer
				._createDiagramUniquenessCandidates(
					diagramRows,
					packageRows
				);


		var missingArtifacts = 0;
		var missingDiagrams = 0;


		for (
			var a = 0;
			a < artifactCandidates.length;
			a++
		)
		{
			var artifactGuid =
				artifactCandidates[a].guid;

			if (
				!result.objects[
					artifactGuid
				]
			)
			{
				missingArtifacts++;
			}
		}


		for (
			var d = 0;
			d < diagramCandidates.length;
			d++
		)
		{
			var diagramGuid =
				diagramCandidates[d].guid;

			if (
				!result.objects[
					diagramGuid
				]
			)
			{
				missingDiagrams++;
			}
		}


		var success =
			missingArtifacts === 0 &&
			missingDiagrams === 0;


		addin.logger.info(
			"TEST CHECK UNIQUENESS OBJECT COVERAGE" +
			" | Artifacts=" +
				artifactCandidates.length +
			" | MissingArtifacts=" +
				missingArtifacts +
			" | Diagrams=" +
				diagramCandidates.length +
			" | MissingDiagrams=" +
				missingDiagrams +
			" | CheckObjects=" +
				Object.keys(
					result.objects
				).length +
			" | Success=" +
				success
		);

		return success;
	},
	
	testCheckAnalysisUniquenessRealDuplicate: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result = {
			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			},

			objects: {}
		};


		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var duplicateIssues = 0;
		var localDuplicates = 0;
		var globalDuplicates = 0;
		var value1Issue = null;

		for (var i = 0; i < result.issues.length; i++)
		{
			var issue = result.issues[i];

			if (
				issue.code !==
				addin.fbaConstants
					.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME
			)
			{
				continue;
			}

			duplicateIssues++;

			if (issue.scope === "LOCAL")
				localDuplicates++;

			if (issue.scope === "GLOBAL")
				globalDuplicates++;

			if (
				issue.uniquenessName ===
				"value1"
			)
			{
				value1Issue = issue;
			}
		}


		var objectCount =
			value1Issue &&
			value1Issue.objectGuids
				? value1Issue.objectGuids.length
				: 0;


		var success =
			executed === true &&
			duplicateIssues === 1 &&
			localDuplicates === 1 &&
			globalDuplicates === 0 &&
			value1Issue !== null &&
			value1Issue.count === 2 &&
			value1Issue.excess === 1 &&
			objectCount === 2;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE VALUE1" +
			" | Executed=" + executed +
			" | DuplicateIssues=" + duplicateIssues +
			" | Local=" + localDuplicates +
			" | Global=" + globalDuplicates +
			" | Count=" +
				(value1Issue
					? value1Issue.count
					: 0) +
			" | Excess=" +
				(value1Issue
					? value1Issue.excess
					: 0) +
			" | Objects=" + objectCount +
			" | Success=" + success
		);

		return success;
	},
	
	testCheckAnalysisUniquenessRealDuplicateObjects: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					context.analysisRoot
				);

		var executed =
			result != null ;


		var value1Objects = [];

		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (!checkObject)
				continue;

			if (
				addin.utils.equalsIgnoreCase(
					checkObject.name,
					"Value1"
				)
			)
			{
				value1Objects.push(
					checkObject
				);
			}
		}


		var objectsWithTwoIssues = 0;
		var objectsWithOneIssue = 0;
		var invalidObjects = 0;


		for (
			var i = 0;
			i < value1Objects.length;
			i++
		)
		{
			var issueCount = 0;

			var objectIssues =
				value1Objects[i].issues || [];

			for (var j = 0; j < objectIssues.length; j++)
			{
				if (
					objectIssues[j].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME
				)
				{
					issueCount++;
				}
			}

			if (issueCount === 2)
				objectsWithTwoIssues++;

			else if (issueCount === 1)
				objectsWithOneIssue++;

			else
				invalidObjects++;
		}


		var success =
			executed === true &&
			value1Objects.length === 3 &&
			objectsWithTwoIssues === 2 &&
			objectsWithOneIssue === 1 &&
			invalidObjects === 0;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE VALUE1 OBJECTS" +
			" | Executed=" + executed +
			" | Objects=" + value1Objects.length +
			" | With2Issues=" + objectsWithTwoIssues +
			" | With1Issue=" + objectsWithOneIssue +
			" | Invalid=" + invalidObjects +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckAnalysisUniquenessRealDuplicateDiagrams: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result = {
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			},
			objects: {}
		};


		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var duplicateIssues = 0;
		var localDuplicates = 0;
		var globalDuplicates = 0;

		var localIssue = null;
		var globalIssue = null;


		for (var i = 0; i < result.issues.length; i++)
		{
			var issue = result.issues[i];

			if (
				issue.code !==
				addin.fbaConstants
					.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME
			)
				continue;

			if (
				issue.uniquenessName !==
				"test_duplicate_diagram"
			)
				continue;


			duplicateIssues++;


			if (issue.scope === "LOCAL")
			{
				localDuplicates++;
				localIssue = issue;
			}

			else if (issue.scope === "GLOBAL")
			{
				globalDuplicates++;
				globalIssue = issue;
			}
		}


		var localCount =
			localIssue
				? localIssue.count
				: 0;

		var localExcess =
			localIssue
				? localIssue.excess
				: 0;

		var localObjects =
			localIssue &&
			localIssue.objectGuids
				? localIssue.objectGuids.length
				: 0;


		var globalCount =
			globalIssue
				? globalIssue.count
				: 0;

		var globalExcess =
			globalIssue
				? globalIssue.excess
				: 0;

		var globalObjects =
			globalIssue &&
			globalIssue.objectGuids
				? globalIssue.objectGuids.length
				: 0;


		var success =
			executed === true &&

			duplicateIssues === 2 &&

			localDuplicates === 1 &&
			globalDuplicates === 1 &&

			localCount === 2 &&
			localExcess === 1 &&
			localObjects === 2 &&

			globalCount === 3 &&
			globalExcess === 2 &&
			globalObjects === 3;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE DIAGRAM" +

			" | Executed=" + executed +

			" | DuplicateIssues=" +
				duplicateIssues +

			" | Local=" +
				localDuplicates +

			" | LocalCount=" +
				localCount +

			" | LocalExcess=" +
				localExcess +

			" | LocalObjects=" +
				localObjects +

			" | Global=" +
				globalDuplicates +

			" | GlobalCount=" +
				globalCount +

			" | GlobalExcess=" +
				globalExcess +

			" | GlobalObjects=" +
				globalObjects +

			" | Success=" +
				success
		);


		return success;
	},
	
	testCheckAnalysisUniquenessRealDuplicateDiagramObjects: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					context.analysisRoot
				);

		var executed =
			result != null;


		var duplicateObjects = [];

		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (!checkObject)
				continue;

			if (
				addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_DUPLICATE_DIAGRAM"
				)
			)
			{
				duplicateObjects.push(
					checkObject
				);
			}
		}


		var objectsWithTwoIssues = 0;
		var objectsWithOneIssue = 0;
		var invalidObjects = 0;


		for (
			var i = 0;
			i < duplicateObjects.length;
			i++
		)
		{
			var issueCount = 0;

			var objectIssues =
				duplicateObjects[i].issues || [];

			for (
				var j = 0;
				j < objectIssues.length;
				j++
			)
			{
				if (
					objectIssues[j].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME
				)
				{
					issueCount++;
				}
			}


			if (issueCount === 2)
				objectsWithTwoIssues++;

			else if (issueCount === 1)
				objectsWithOneIssue++;

			else
				invalidObjects++;
		}


		var success =
			executed === true &&
			duplicateObjects.length === 3 &&
			objectsWithTwoIssues === 2 &&
			objectsWithOneIssue === 1 &&
			invalidObjects === 0;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE DIAGRAM OBJECTS" +
			" | Executed=" + executed +
			" | Objects=" + duplicateObjects.length +
			" | With2Issues=" + objectsWithTwoIssues +
			" | With1Issue=" + objectsWithOneIssue +
			" | Invalid=" + invalidObjects +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckAnalysisUniquenessDiagramRegistration: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result = {
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			},
			objects: {}
		};


		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var duplicateIssues = 0;
		var registeredObjects = 0;

		for (var i = 0; i < result.issues.length; i++)
		{
			var issue = result.issues[i];

			if (
				issue.code !==
				addin.fbaConstants
					.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME
			)
				continue;

			if (
				issue.uniquenessName !==
				"test_duplicate_diagram"
			)
				continue;

			duplicateIssues++;
		}


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				checkObject &&
				addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_DUPLICATE_DIAGRAM"
				)
			)
			{
				registeredObjects++;
			}
		}


		var success =
			executed === true &&
			duplicateIssues === 2 &&
			registeredObjects === 3;


		addin.logger.info(
			"TEST CHECK UNIQUENESS DIAGRAM REGISTRATION" +
			" | Executed=" + executed +
			" | DuplicateIssues=" + duplicateIssues +
			" | RegisteredObjects=" + registeredObjects +
			" | Success=" + success
		);


		return success;
	},
		
	testCheckAnalysisUniquenessArtifactRegistration: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result = {
			issues: [],
			summary: {
				errors: 0,
				warnings: 0
			},
			objects: {}
		};

		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);

		var candidateFound = false;
		var registeredObjects = 0;

		var artifactRows =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		var packageRows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifactCandidates =
			addin.analysisStructureSynchronizer
				._createArtifactUniquenessCandidates(
					artifactRows,
					packageRows
				);


		for (
			var i = 0;
			i < artifactCandidates.length;
			i++
		)
		{
			if (
				addin.utils.equalsIgnoreCase(
					artifactCandidates[i].name,
					"TEST_UNIQUENESS_ARTIFACT"
				)
			)
			{
				candidateFound = true;
				break;
			}
		}

		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				checkObject &&
				addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_UNIQUENESS_ARTIFACT"
				)
			)
			{
				registeredObjects++;
			}
		}


		var success =
			executed === true &&
			candidateFound === true &&
			registeredObjects === 1;


		addin.logger.info(
			"TEST CHECK UNIQUENESS ARTIFACT REGISTRATION" +
			" | Executed=" + executed +
			" | CandidateFound=" + candidateFound +
			" | RegisteredObjects=" + registeredObjects +
			" | Success=" + success
		);


		return success;
	},
		
	testCheckRealDuplicateArtifactObjects: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					context.analysisRoot
				);

		if (!result)
			return false;


		var objects = 0;
		var with2Issues = 0;
		var with1Issue = 0;
		var invalid = 0;


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				!checkObject ||
				!addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_UNIQUENESS_ARTIFACT"
				)
			)
				continue;


			objects++;


			var duplicateIssues = 0;

			for (
				var i = 0;
				i < checkObject.issues.length;
				i++
			)
			{
				if (
					checkObject.issues[i].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME
				)
				{
					duplicateIssues++;
				}
			}


			if (duplicateIssues === 2)
				with2Issues++;
			else if (duplicateIssues === 1)
				with1Issue++;
			else
				invalid++;
		}


		var success =
			objects === 3 &&
			with2Issues === 2 &&
			with1Issue === 1 &&
			invalid === 0;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE ARTIFACT OBJECTS" +
			" | Objects=" + objects +
			" | With2Issues=" + with2Issues +
			" | With1Issue=" + with1Issue +
			" | Invalid=" + invalid +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckRealDuplicateAnalysisPackageObjects: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					context.analysisRoot
				);

		if (!result)
			return false;


		var objects = 0;
		var withDuplicateIssue = 0;
		var invalid = 0;


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				!checkObject ||
				!addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_DUPLICATE_PACKAGE"
				)
			)
				continue;


			objects++;


			var duplicateIssues = 0;

			for (
				var i = 0;
				i < checkObject.issues.length;
				i++
			)
			{
				if (
					checkObject.issues[i].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME
				)
				{
					duplicateIssues++;
				}
			}


			if (duplicateIssues === 1)
				withDuplicateIssue++;
			else
				invalid++;
		}


		var globalIssues = 0;
		var count = 0;
		var excess = 0;


		for (var j = 0; j < result.issues.length; j++)
		{
			var issue =
				result.issues[j];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME &&
				issue.uniquenessName ===
					"test_duplicate_package"
			)
			{
				globalIssues++;
				count = issue.count;
				excess = issue.excess;
			}
		}


		var success =
			objects === 2 &&
			withDuplicateIssue === 2 &&
			invalid === 0 &&
			globalIssues === 1 &&
			count === 2 &&
			excess === 1;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE ANALYSIS PACKAGE" +
			" | Objects=" + objects +
			" | WithIssue=" + withDuplicateIssue +
			" | Invalid=" + invalid +
			" | GlobalIssues=" + globalIssues +
			" | Count=" + count +
			" | Excess=" + excess +
			" | Success=" + success
		);


		return success;
	},
	
	testRealAnalysisPackageClassification: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		rows = rows || [];

		var found = 0;


		for (var i = 0; i < rows.length; i++)
		{
			var row = rows[i];

			if (
				!addin.utils.equalsIgnoreCase(
					row.name,
					"TEST_DUPLICATE_PACKAGE"
				)
			)
				continue;

			found++;

			addin.logger.info(
				"TEST PACKAGE CLASSIFICATION" +
				" | Name=" + row.name +
				" | GUID=" + row.guid +
				" | ObjectType=" + row.objectType +
				" | ParentGuid=" + row.parentGuid +
				" | AnalysisPackageGuid=" +
					row.analysisPackageGuid
			);
		}


		addin.logger.info(
			"TEST REAL ANALYSIS PACKAGE CLASSIFICATION" +
			" | Found=" + found
		);


		return true;
	},
		
	testRealDuplicateAnalysisPackageDetector: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		rows = rows || [];


		var candidates = [];

		for (var i = 0; i < rows.length; i++)
		{
			var row = rows[i];

			var candidate =
				addin.analysisStructureSynchronizer
					._createUniquenessCandidate(
						row.guid,
						row.objectType,
						row.name,
						row.parentGuid,
						row.analysisPackageGuid,
						""
					);

			if (!candidate)
				continue;

			candidate.packageId =
				row.packageId;

			candidate.parentId =
				row.parentId;

			candidates.push(candidate);
		}


		var duplicates =
			addin.analysisStructureSynchronizer
				._findDuplicateAnalysisPackagesByName(
					candidates
				);

		duplicates = duplicates || [];


		var matchingGroups = 0;
		var count = 0;
		var excess = 0;
		var objects = 0;

		for (var d = 0; d < duplicates.length; d++)
		{
			var group = duplicates[d];

			if (
				group.uniquenessName !==
				"test_duplicate_package"
			)
				continue;

			matchingGroups++;

			count =
				group.count || 0;

			excess =
				group.excess || 0;

			objects =
				group.objects
					? group.objects.length
					: 0;
		}


		var success =
			matchingGroups === 1 &&
			count === 2 &&
			excess === 1 &&
			objects === 2;


		addin.logger.info(
			"TEST REAL DUPLICATE ANALYSIS PACKAGE DETECTOR" +
			" | Groups=" + matchingGroups +
			" | Count=" + count +
			" | Excess=" + excess +
			" | Objects=" + objects +
			" | Success=" + success
		);


		return success;
	},
	
	testRealDuplicateAnalysisPackageRegistration: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		rows = rows || [];


		var packageCandidates = [];

		for (var i = 0; i < rows.length; i++)
		{
			var row = rows[i];

			var candidate =
				addin.analysisStructureSynchronizer
					._createUniquenessCandidate(
						row.guid,
						row.objectType,
						row.name,
						row.parentGuid,
						row.analysisPackageGuid,
						""
					);

			if (!candidate)
				continue;

			candidate.packageId =
				row.packageId;

			candidate.parentId =
				row.parentId;

			packageCandidates.push(candidate);
		}


		var result = {
			issues: [],
			objects: {},
			summary: {
				errors: 0,
				warnings: 0
			}
		};


		/*
		 * Reproduit l'ordre réel de
		 * _checkAnalysisUniqueness().
		 */
		addin.analysisStructureSynchronizer
			._registerUniquenessPackageObjects(
				result,
				packageCandidates
			);


		var executed =
			addin.analysisStructureSynchronizer
				._checkUniquenessCandidates(
					packageCandidates,
					[],
					[],
					result
				);


		var objects = 0;
		var withIssue = 0;
		var globalIssues = 0;
		var count = 0;
		var excess = 0;


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				!checkObject ||
				!addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_DUPLICATE_PACKAGE"
				)
			)
				continue;

			objects++;

			for (var j = 0; j < checkObject.issues.length; j++)
			{
				if (
					checkObject.issues[j].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME
				)
				{
					withIssue++;
				}
			}
		}


		for (var k = 0; k < result.issues.length; k++)
		{
			var issue = result.issues[k];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME &&
				issue.uniquenessName ===
					"test_duplicate_package"
			)
			{
				globalIssues++;
				count = issue.count;
				excess = issue.excess;
			}
		}


		var success =
			executed === true &&
			objects === 2 &&
			withIssue === 2 &&
			globalIssues === 1 &&
			count === 2 &&
			excess === 1;


		addin.logger.info(
			"TEST REAL DUPLICATE ANALYSIS PACKAGE REGISTRATION" +
			" | Executed=" + executed +
			" | Objects=" + objects +
			" | WithIssue=" + withIssue +
			" | GlobalIssues=" + globalIssues +
			" | Count=" + count +
			" | Excess=" + excess +
			" | Success=" + success
		);


		return success;
	},
	
	testRealCheckAnalysisUniquenessPackages: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result = {
			issues: [],
			objects: {},
			summary: {
				errors: 0,
				warnings: 0
			}
		};


		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var objects = 0;
		var withIssue = 0;

		var globalIssues = 0;
		var count = 0;
		var excess = 0;


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				!checkObject ||
				!addin.utils.equalsIgnoreCase(
					checkObject.name,
					"TEST_DUPLICATE_PACKAGE"
				)
			)
				continue;

			objects++;


			for (
				var i = 0;
				i < checkObject.issues.length;
				i++
			)
			{
				if (
					checkObject.issues[i].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME
				)
				{
					withIssue++;
				}
			}
		}


		for (var j = 0; j < result.issues.length; j++)
		{
			var issue =
				result.issues[j];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME &&
				issue.uniquenessName ===
					"test_duplicate_package"
			)
			{
				globalIssues++;
				count = issue.count;
				excess = issue.excess;
			}
		}


		var success =
			executed === true &&
			objects === 2 &&
			withIssue === 2 &&
			globalIssues === 1 &&
			count === 2 &&
			excess === 1;


		addin.logger.info(
			"TEST REAL CHECK ANALYSIS UNIQUENESS PACKAGES" +
			" | Executed=" + executed +
			" | Objects=" + objects +
			" | WithIssue=" + withIssue +
			" | GlobalIssues=" + globalIssues +
			" | Count=" + count +
			" | Excess=" + excess +
			" | Success=" + success
		);


		return success;
	},
	
	testRealDuplicateTechnicalPackage: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		rows = rows || [];

		var candidates = [];

		for (var i = 0; i < rows.length; i++)
		{
			var row = rows[i];

			var candidate =
				addin.analysisStructureSynchronizer
					._createUniquenessCandidate(
						row.guid,
						row.objectType,
						row.name,
						row.parentGuid,
						row.analysisPackageGuid,
						""
					);

			if (!candidate)
				continue;

			candidate.packageId = row.packageId;
			candidate.parentId = row.parentId;

			candidates.push(candidate);
		}


		var duplicates =
			addin.analysisStructureSynchronizer
				._findDuplicateTechnicalPackages(
					candidates
				);

		duplicates = duplicates || [];


		var groups = 0;
		var count = 0;
		var excess = 0;
		var objects = 0;
		var scope = "";
		var parentGuid = "";


		for (var d = 0; d < duplicates.length; d++)
		{
			var group = duplicates[d];

			if (
				group.uniquenessName !==
				"_test_duplicate_technical"
			)
			{
				continue;
			}

			groups++;

			count =
				group.count || 0;

			excess =
				group.excess || 0;

			objects =
				group.objects
					? group.objects.length
					: 0;

			scope =
				group.scope || "";

			parentGuid =
				group.parentGuid || "";
		}


		var success =
			groups === 1 &&
			scope === "LOCAL" &&
			count === 2 &&
			excess === 1 &&
			objects === 2 &&
			!addin.utils.isEmpty(parentGuid);


		addin.logger.info(
			"TEST REAL DUPLICATE TECHNICAL PACKAGE" +
			" | Groups=" + groups +
			" | Scope=" + scope +
			" | Count=" + count +
			" | Excess=" + excess +
			" | Objects=" + objects +
			" | ParentGuid=" + parentGuid +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckRealDuplicateTechnicalPackageObjects: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysis(
					context.analysisRoot
				);

		if (!result)
			return false;


		var objects = 0;
		var withIssue = 0;
		var invalid = 0;

		var localIssues = 0;
		var count = 0;
		var excess = 0;


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			var checkObject =
				result.objects[objectGuid];

			if (
				!checkObject ||
				!addin.utils.equalsIgnoreCase(
					checkObject.name,
					"_TEST_DUPLICATE_TECHNICAL"
				)
			)
			{
				continue;
			}

			objects++;

			var duplicateIssues = 0;

			for (
				var i = 0;
				i < checkObject.issues.length;
				i++
			)
			{
				if (
					checkObject.issues[i].code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME
				)
				{
					duplicateIssues++;
				}
			}

			if (duplicateIssues === 1)
				withIssue++;

			else if (duplicateIssues !== 0)
				invalid++;
		}


		for (var j = 0; j < result.issues.length; j++)
		{
			var issue =
				result.issues[j];

			if (
				issue.code ===
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME &&
				issue.uniquenessName ===
					"_test_duplicate_technical"
			)
			{
				localIssues++;
				count = issue.count;
				excess = issue.excess;
			}
		}


		var success =
			objects === 3 &&
			withIssue === 2 &&
			invalid === 0 &&
			localIssues === 1 &&
			count === 2 &&
			excess === 1;


		addin.logger.info(
			"TEST CHECK REAL DUPLICATE TECHNICAL PACKAGE" +
			" | Objects=" + objects +
			" | WithIssue=" + withIssue +
			" | Invalid=" + invalid +
			" | LocalIssues=" + localIssues +
			" | Count=" + count +
			" | Excess=" + excess +
			" | Success=" + success
		);


		return success;
	},
	
	testFindPackageGuidById: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var rows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		rows = rows || [];

		var packageCandidates = [];

		for (var i = 0; i < rows.length; i++)
		{
			var row = rows[i];

			var candidate =
				addin.analysisStructureSynchronizer
					._createUniquenessCandidate(
						row.guid,
						row.objectType,
						row.name,
						row.parentGuid,
						row.analysisPackageGuid,
						""
					);

			if (!candidate)
				continue;

			candidate.packageId = row.packageId;
			candidate.parentId = row.parentId;

			packageCandidates.push(candidate);
		}


		var found = 0;
		var invalid = 0;

		for (var j = 0; j < packageCandidates.length; j++)
		{
			var expected =
				packageCandidates[j];

			var actualGuid =
				addin.analysisStructureSynchronizer
					._findPackageGuidById(
						expected.packageId,
						packageCandidates
					);

			if (
				addin.utils.equalsIgnoreCase(
					actualGuid,
					expected.guid
				)
			)
			{
				found++;
			}
			else
			{
				invalid++;
			}
		}


		/*
		 * Test négatif :
		 * un Package_ID inexistant doit retourner "".
		 */
		var missingGuid =
			addin.analysisStructureSynchronizer
				._findPackageGuidById(
					-999999,
					packageCandidates
				);

		var missingIsEmpty =
			addin.utils.isEmpty(missingGuid);


		var success =
			packageCandidates.length > 0 &&
			found === packageCandidates.length &&
			invalid === 0 &&
			missingIsEmpty;


		addin.logger.info(
			"TEST FIND PACKAGE GUID BY ID" +
			" | Candidates=" + packageCandidates.length +
			" | Found=" + found +
			" | Invalid=" + invalid +
			" | MissingIsEmpty=" + missingIsEmpty +
			" | Success=" + success
		);


		return success;
	},
	
	testArtifactUniquenessParentGuid: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var packageRows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var artifactRows =
			addin.repositoryService
				.getAnalysisArtifactsSQL(
					context.analysisRoot
				);

		packageRows = packageRows || [];
		artifactRows = artifactRows || [];


		var candidates =
			addin.analysisStructureSynchronizer
				._createArtifactUniquenessCandidates(
					artifactRows,
					packageRows
				);


		var withParent = 0;
		var missingParent = 0;
		var invalidParent = 0;


		for (var i = 0; i < candidates.length; i++)
		{
			var candidate = candidates[i];

			if (addin.utils.isEmpty(candidate.parentGuid))
			{
				missingParent++;
				continue;
			}

			withParent++;

			/*
			 * Vérifie que le parentGuid correspond réellement
			 * à l'un des packages du dossier.
			 */
			var found = false;

			for (var j = 0; j < packageRows.length; j++)
			{
				if (
					addin.utils.equalsIgnoreCase(
						candidate.parentGuid,
						packageRows[j].guid
					)
				)
				{
					found = true;
					break;
				}
			}

			if (!found)
				invalidParent++;
		}


		var success =
			candidates.length > 0 &&
			withParent === candidates.length &&
			missingParent === 0 &&
			invalidParent === 0;


		addin.logger.info(
			"TEST ARTIFACT UNIQUENESS PARENT GUID" +
			" | Candidates=" + candidates.length +
			" | WithParent=" + withParent +
			" | MissingParent=" + missingParent +
			" | InvalidParent=" + invalidParent +
			" | Success=" + success
		);


		return success;
	},
	
	testDiagramUniquenessParentGuid: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var packageRows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					context.analysisRoot
				);

		var diagramRows =
			addin.repositoryService
				.getAnalysisDiagramsSQL(
					context.analysisRoot
				);

		packageRows = packageRows || [];
		diagramRows = diagramRows || [];


		var candidates =
			addin.analysisStructureSynchronizer
				._createDiagramUniquenessCandidates(
					diagramRows,
					packageRows
				);


		var withParent = 0;
		var missingParent = 0;
		var invalidParent = 0;


		for (var i = 0; i < candidates.length; i++)
		{
			var candidate = candidates[i];

			if (addin.utils.isEmpty(candidate.parentGuid))
			{
				missingParent++;
				continue;
			}

			withParent++;

			var found = false;

			for (var j = 0; j < packageRows.length; j++)
			{
				if (
					addin.utils.equalsIgnoreCase(
						candidate.parentGuid,
						packageRows[j].guid
					)
				)
				{
					found = true;
					break;
				}
			}

			if (!found)
				invalidParent++;
		}


		var success =
			candidates.length > 0 &&
			withParent === candidates.length &&
			missingParent === 0 &&
			invalidParent === 0;


		addin.logger.info(
			"TEST DIAGRAM UNIQUENESS PARENT GUID" +
			" | Candidates=" + candidates.length +
			" | WithParent=" + withParent +
			" | MissingParent=" + missingParent +
			" | InvalidParent=" + invalidParent +
			" | Success=" + success
		);


		return success;
	},
	
	testAnalysisUniquenessRegression: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
		{
			issues: [],
			objects: {},
			summary:
			{
				errors: 0,
				warnings: 0,
				repair: 0,
				complete: 0,
				init: 0
			}
		};


		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var packageCount = 0;
		var artifactCount = 0;
		var diagramCount = 0;

		var invalidParent = 0;


		for (var guid in result.objects)
		{
			if (!result.objects.hasOwnProperty(guid))
				continue;

			var checkObject =
				result.objects[guid];

			if (!checkObject)
				continue;


			if (checkObject.objectType === "PACKAGE")
				packageCount++;

			else if (checkObject.objectType === "ARTIFACT")
				artifactCount++;

			else if (checkObject.objectType === "DIAGRAM")
				diagramCount++;


			/*
			 * Tous les objets enregistrés par le moteur
			 * d'unicité doivent maintenant avoir un parent.
			 *
			 * Exception : les packages directement sous ROOT
			 * ont bien un parentGuid : le GUID du ROOT.
			 */
			if (addin.utils.isEmpty(checkObject.parentGuid))
				invalidParent++;
		}


		var success =
			executed === true &&
			packageCount > 0 &&
			artifactCount > 0 &&
			diagramCount > 0 &&
			invalidParent === 0;


		addin.logger.info(
			"TEST ANALYSIS UNIQUENESS REGRESSION" +
			" | Executed=" + executed +
			" | Packages=" + packageCount +
			" | Artifacts=" + artifactCount +
			" | Diagrams=" + diagramCount +
			" | Issues=" + result.issues.length +
			" | Errors=" + result.summary.errors +
			" | InvalidParent=" + invalidParent +
			" | Success=" + success
		);


		return success;
	},
		
		
	testCheckMetricsInitialization: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		/*
		 * On ne lance volontairement PAS checkAnalysis(),
		 * car le CHECK ROOT complet est coûteux.
		 *
		 * Ce test valide uniquement le contrat de structure
		 * que nous venons d'introduire.
		 */
		var result =
		{
			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		var hasMetrics =
			result.metrics != null;

		var groupsValid =
			hasMetrics &&
			result.metrics.duplicates.groups === 0;

		var excessValid =
			hasMetrics &&
			result.metrics.duplicates.excess === 0;


		var success =
			hasMetrics &&
			groupsValid &&
			excessValid;


		addin.logger.info(
			"TEST CHECK METRICS INITIALIZATION" +
			" | HasMetrics=" + hasMetrics +
			" | DuplicateGroups=" +
				(hasMetrics ? result.metrics.duplicates.groups : "N/A") +
			" | DuplicateExcess=" +
				(hasMetrics ? result.metrics.duplicates.excess : "N/A") +
			" | Success=" + success
		);


		return success;
	},
	
	testDuplicateMetrics: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;


		var result =
		{
			issues: [],
			objects: {},

			summary:
			{
				errors: 0,
				warnings: 0
			},

			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		/*
		 * 3 artefacts :
		 *
		 * A1 + A2 dans Analysis Package A
		 * A3 dans Analysis Package B
		 *
		 * Cela produit :
		 *
		 * LOCAL  : A1 + A2 → excess 1
		 * GLOBAL : A1 + A2 + A3 → excess 2
		 *
		 * Total attendu :
		 * duplicateGroups = 2
		 * duplicateExcess = 3
		 */

		var artifacts =
		[
			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000001}",
				"ARTIFACT",
				"TEST_METRIC",
				"{20000000-0000-0000-0000-000000000001}",
				"{30000000-0000-0000-0000-000000000001}",
				""
			),

			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000002}",
				"ARTIFACT",
				" test_metric ",
				"{20000000-0000-0000-0000-000000000001}",
				"{30000000-0000-0000-0000-000000000001}",
				""
			),

			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000003}",
				"ARTIFACT",
				"TEST_METRIC",
				"{20000000-0000-0000-0000-000000000002}",
				"{30000000-0000-0000-0000-000000000002}",
				""
			)
		];


		/*
		 * Enregistrement des objets pour reproduire
		 * le fonctionnement réel du CHECK.
		 */
		synchronizer._registerUniquenessArtifactObjects(
			result,
			artifacts
		);


		var executed =
			synchronizer._checkUniquenessCandidates(
				[],
				artifacts,
				[],
				result
			);


		var success =
			executed === true &&
			result.metrics.duplicates.groups === 2 &&
			result.metrics.duplicates.excess === 3 &&
			result.issues.length === 2 &&
			result.summary.errors === 2;


		addin.logger.info(
			"TEST DUPLICATE METRICS" +
			" | Executed=" + executed +
			" | Groups=" +
				result.metrics.duplicates.groups +
			" | Excess=" +
				result.metrics.duplicates.excess +
			" | Issues=" +
				result.issues.length +
			" | Errors=" +
				result.summary.errors +
			" | Success=" + success
		);


		return success;
	},
	
	testRealDuplicateMetrics: function()
	{
		var currentPackage =
			Repository.GetTreeSelectedPackage();

		if (!currentPackage)
			return false;

		var context =
			addin.analysisContextResolver
				.resolvePackage(currentPackage);

		if (!context || !context.analysisRoot)
			return false;


		var result =
		{
			issues: [],
			objects: {},

			summary:
			{
				errors: 0,
				warnings: 0
			},

			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		var executed =
			addin.analysisStructureSynchronizer
				._checkAnalysisUniqueness(
					context.analysisRoot,
					result
				);


		var metricsConsistent =
			result.metrics.duplicates.groups ===
			result.issues.length;


		var excessValid =
			result.metrics.duplicates.excess >=
			result.metrics.duplicates.groups;


		var success =
			executed === true &&
			metricsConsistent &&
			excessValid;


		addin.logger.info(
			"TEST REAL DUPLICATE METRICS" +
			" | Executed=" + executed +
			" | Groups=" +
				result.metrics.duplicates.groups +
			" | Excess=" +
				result.metrics.duplicates.excess +
			" | Issues=" +
				result.issues.length +
			" | Errors=" +
				result.summary.errors +
			" | MetricsConsistent=" +
				metricsConsistent +
			" | ExcessValid=" +
				excessValid +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckMetricsContract: function()
	{
		var metrics =
		{
			objects:
			{
				packages: 0,
				artifacts: 0,
				diagrams: 0,
				total: 0
			},

			duplicates:
			{
				groups: 0,
				excess: 0
			}
		};


		var success =
			metrics.objects != null &&
			metrics.duplicates != null &&

			metrics.objects.packages === 0 &&
			metrics.objects.artifacts === 0 &&
			metrics.objects.diagrams === 0 &&
			metrics.objects.total === 0 &&

			metrics.duplicates.groups === 0 &&
			metrics.duplicates.excess === 0;


		addin.logger.info(
			"TEST CHECK METRICS CONTRACT" +
			" | Objects=" +
				(metrics.objects != null) +
			" | Duplicates=" +
				(metrics.duplicates != null) +
			" | Groups=" +
				metrics.duplicates.groups +
			" | Excess=" +
				metrics.duplicates.excess +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckObjectMetrics: function()
	{
		var result =
		{
			objects:
			{
				"{10000000-0000-0000-0000-000000000001}":
				{
					objectType: "PACKAGE"
				},

				"{10000000-0000-0000-0000-000000000002}":
				{
					objectType: "PACKAGE"
				},

				"{10000000-0000-0000-0000-000000000003}":
				{
					objectType: "ARTIFACT"
				},

				"{10000000-0000-0000-0000-000000000004}":
				{
					objectType: "ARTIFACT"
				},

				"{10000000-0000-0000-0000-000000000005}":
				{
					objectType: "ARTIFACT"
				},

				"{10000000-0000-0000-0000-000000000006}":
				{
					objectType: "DIAGRAM"
				}
			},

			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		var objectCount = 0;
		var packageObjectCount = 0;
		var artifactObjectCount = 0;
		var diagramObjectCount = 0;


		for (var objectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(objectGuid))
				continue;

			objectCount++;

			var checkObject =
				result.objects[objectGuid];

			if (!checkObject)
				continue;

			if (checkObject.objectType == "PACKAGE")
				packageObjectCount++;

			else if (checkObject.objectType == "ARTIFACT")
				artifactObjectCount++;

			else if (checkObject.objectType == "DIAGRAM")
				diagramObjectCount++;
		}


		result.metrics.objects.packages =
			packageObjectCount;

		result.metrics.objects.artifacts =
			artifactObjectCount;

		result.metrics.objects.diagrams =
			diagramObjectCount;

		result.metrics.objects.total =
			objectCount;


		var success =
			result.metrics.objects.packages === 2 &&
			result.metrics.objects.artifacts === 3 &&
			result.metrics.objects.diagrams === 1 &&
			result.metrics.objects.total === 6;


		addin.logger.info(
			"TEST CHECK OBJECT METRICS" +
			" | Packages=" +
				result.metrics.objects.packages +
			" | Artifacts=" +
				result.metrics.objects.artifacts +
			" | Diagrams=" +
				result.metrics.objects.diagrams +
			" | Total=" +
				result.metrics.objects.total +
			" | Success=" + success
		);


		return success;
	},
	
	testCheckRuleResultsContract: function()
	{
		var packageResult =
		{
			ruleResults:
			[
				{
					rule: "TEST_RULE_1",
					passed: true
				},

				{
					rule: "TEST_RULE_2",
					passed: false
				}
			]
		};


		var rootResult =
		{
			ruleResults: []
		};


		if (packageResult.ruleResults)
		{
			for (
				var r = 0;
				r < packageResult.ruleResults.length;
				r++
			)
			{
				rootResult.ruleResults.push(
					packageResult.ruleResults[r]
				);
			}
		}


		var success =
			rootResult.ruleResults != null &&
			rootResult.ruleResults.length === 2 &&
			rootResult.ruleResults[0].rule ===
				"TEST_RULE_1" &&
			rootResult.ruleResults[0].passed === true &&
			rootResult.ruleResults[1].rule ===
				"TEST_RULE_2" &&
			rootResult.ruleResults[1].passed === false;


		addin.logger.info(
			"TEST CHECK RULE RESULTS CONTRACT" +
			" | PackageResults=" +
				packageResult.ruleResults.length +
			" | RootResults=" +
				rootResult.ruleResults.length +
			" | FirstPassed=" +
				rootResult.ruleResults[0].passed +
			" | SecondPassed=" +
				rootResult.ruleResults[1].passed +
			" | Success=" + success
		);


		return success;
	},
	
	testCreateCheckRuleResult: function()
	{
		var ruleResult =
			addin.analysisStructureSynchronizer
				._createCheckRuleResult(
					"NAME_UNIQUENESS",
					"GLOBAL",
					"ARTIFACT",
					"{10000000-0000-0000-0000-000000000001}",
					"{20000000-0000-0000-0000-000000000001}",
					"Obligatoire",

					{
						maxOccurrences: 1
					},

					{
						occurrences: 3
					},

					false
				);


		var success =
			ruleResult != null &&

			ruleResult.rule ===
				"NAME_UNIQUENESS" &&

			ruleResult.scope ===
				"GLOBAL" &&

			ruleResult.objectType ===
				"ARTIFACT" &&

			ruleResult.analysisElementGuid ===
				"{10000000-0000-0000-0000-000000000001}" &&

			ruleResult.objectGuid ===
				"{20000000-0000-0000-0000-000000000001}" &&

			ruleResult.requirement ===
				"Obligatoire" &&

			ruleResult.expected.maxOccurrences === 1 &&

			ruleResult.actual.occurrences === 3 &&

			ruleResult.passed === false;


		addin.logger.info(
			"TEST CREATE CHECK RULE RESULT" +
			" | Rule=" +
				(ruleResult ? ruleResult.rule : "NULL") +
			" | Scope=" +
				(ruleResult ? ruleResult.scope : "NULL") +
			" | Expected=" +
				(ruleResult
					? ruleResult.expected.maxOccurrences
					: "NULL") +
			" | Actual=" +
				(ruleResult
					? ruleResult.actual.occurrences
					: "NULL") +
			" | Passed=" +
				(ruleResult
					? ruleResult.passed
					: "NULL") +
			" | Success=" + success
		);


		return success;
	},
	
	testNameUniquenessBusinessLogic: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;


		var result =
		{
			issues: [],
			objects: [],
			ruleResults: [],

			summary:
			{
				errors: 0,
				warnings: 0
			},

			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		var artifacts =
		[
			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000001}",
				"ARTIFACT",
				"TEST_RULE",
				"{20000000-0000-0000-0000-000000000001}",
				"{30000000-0000-0000-0000-000000000001}",
				""
			),

			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000002}",
				"ARTIFACT",
				" test_rule ",
				"{20000000-0000-0000-0000-000000000001}",
				"{30000000-0000-0000-0000-000000000001}",
				""
			),

			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000003}",
				"ARTIFACT",
				"TEST_RULE",
				"{20000000-0000-0000-0000-000000000002}",
				"{30000000-0000-0000-0000-000000000002}",
				""
			)
		];


		synchronizer._registerUniquenessArtifactObjects(
			result,
			artifacts
		);


		var executed =
			synchronizer._checkUniquenessCandidates(
				[],
				artifacts,
				[],
				result
			);


		var localResult = null;
		var globalResult = null;


		for (var i = 0; i < result.ruleResults.length; i++)
		{
			var ruleResult =
				result.ruleResults[i];

			if (
				ruleResult.rule === "NAME_UNIQUENESS" &&
				ruleResult.scope === "LOCAL"
			)
			{
				localResult = ruleResult;
			}

			else if (
				ruleResult.rule === "NAME_UNIQUENESS" &&
				ruleResult.scope === "GLOBAL"
			)
			{
				globalResult = ruleResult;
			}
		}


		var success =
			executed === true &&

			result.ruleResults.length === 2 &&

			localResult != null &&
			localResult.expected.maxOccurrences === 1 &&
			localResult.actual.occurrences === 2 &&
			localResult.actual.objectGuids.length === 2 &&
			localResult.passed === false &&

			globalResult != null &&
			globalResult.expected.maxOccurrences === 1 &&
			globalResult.actual.occurrences === 3 &&
			globalResult.actual.objectGuids.length === 3 &&
			globalResult.passed === false &&

			result.issues.length === 2 &&
			result.summary.errors === 2 &&

			result.metrics.duplicates.groups === 2 &&
			result.metrics.duplicates.excess === 3;


		addin.logger.info(
			"TEST NAME UNIQUENESS BUSINESS LOGIC" +
			" | Executed=" + executed +
			" | RuleResults=" +
				result.ruleResults.length +
			" | LocalActual=" +
				(localResult
					? localResult.actual.occurrences
					: "NULL") +
			" | GlobalActual=" +
				(globalResult
					? globalResult.actual.occurrences
					: "NULL") +
			" | Issues=" +
				result.issues.length +
			" | Groups=" +
				result.metrics.duplicates.groups +
			" | Excess=" +
				result.metrics.duplicates.excess +
			" | Success=" + success
		);


		return success;
	},
	
	testNameUniquenessRuleResults: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;


		var packageA =
			"{30000000-0000-0000-0000-000000000001}";

		var packageB =
			"{30000000-0000-0000-0000-000000000002}";


		var result =
		{
			issues: [],
			objects: {},
			ruleResults: [],

			summary:
			{
				errors: 0,
				warnings: 0
			},

			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		/*
		 * Analysis Package A :
		 *
		 * 2 artefacts de même nom
		 * => LOCAL échoue
		 */
		var artifactA1 =
			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000001}",
				"ARTIFACT",
				"TEST_RULE",
				"{20000000-0000-0000-0000-000000000001}",
				packageA,
				""
			);

		var artifactA2 =
			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000002}",
				"ARTIFACT",
				" test_rule ",
				"{20000000-0000-0000-0000-000000000001}",
				packageA,
				""
			);


		/*
		 * Analysis Package B :
		 *
		 * 1 artefact du même nom
		 * => LOCAL réussit
		 *
		 * Mais GLOBAL échoue puisque le même nom
		 * existe dans A et B.
		 */
		var artifactB1 =
			synchronizer._createUniquenessCandidate(
				"{10000000-0000-0000-0000-000000000003}",
				"ARTIFACT",
				"TEST_RULE",
				"{20000000-0000-0000-0000-000000000002}",
				packageB,
				""
			);


		var artifacts =
		[
			artifactA1,
			artifactA2,
			artifactB1
		];


		synchronizer._registerUniquenessArtifactObjects(
			result,
			artifacts
		);


		var executed =
			synchronizer._checkUniquenessCandidates(
				[],
				artifacts,
				[],
				result
			);


		// =====================================================
		// RECHERCHE DES 3 RULE RESULTS ATTENDUS
		// =====================================================

		var localA = null;
		var localB = null;
		var globalResult = null;


		for (
			var i = 0;
			i < result.ruleResults.length;
			i++
		)
		{
			var ruleResult =
				result.ruleResults[i];


			if (
				ruleResult.rule !== "NAME_UNIQUENESS" ||
				ruleResult.objectType !== "ARTIFACT"
			)
			{
				continue;
			}


			if (
				ruleResult.scope === "LOCAL" &&
				addin.utils.equalsIgnoreCase(
					ruleResult.scopeGuid,
					packageA
				)
			)
			{
				localA = ruleResult;
			}


			else if (
				ruleResult.scope === "LOCAL" &&
				addin.utils.equalsIgnoreCase(
					ruleResult.scopeGuid,
					packageB
				)
			)
			{
				localB = ruleResult;
			}


			else if (
				ruleResult.scope === "GLOBAL"
			)
			{
				globalResult = ruleResult;
			}
		}


		// =====================================================
		// VALIDATION METIER
		// =====================================================

		var localAValid =
			localA != null &&
			localA.scopeType ===
				"ANALYSIS_PACKAGE" &&
			localA.actual.checked === 2 &&
			localA.actual.duplicateGroups === 1 &&
			localA.actual.duplicateExcess === 1 &&
			localA.actual.duplicates.length === 1 &&
			localA.actual.duplicates[0].count === 2 &&
			localA.passed === false;


		var localBValid =
			localB != null &&
			localB.scopeType ===
				"ANALYSIS_PACKAGE" &&
			localB.actual.checked === 1 &&
			localB.actual.duplicateGroups === 0 &&
			localB.actual.duplicateExcess === 0 &&
			localB.actual.duplicates.length === 0 &&
			localB.passed === true;


		var globalValid =
			globalResult != null &&
			globalResult.scopeType ===
				"ANALYSIS_ROOT" &&
			globalResult.actual.checked === 3 &&
			globalResult.actual.duplicateGroups === 1 &&
			globalResult.actual.duplicateExcess === 2 &&
			globalResult.actual.duplicates.length === 1 &&
			globalResult.actual.duplicates[0].count === 3 &&
			globalResult.passed === false;


		var operationalValid =
			result.issues.length === 2 &&
			result.summary.errors === 2 &&
			result.metrics.duplicates.groups === 2 &&
			result.metrics.duplicates.excess === 3;


		var success =
			executed === true &&
			result.ruleResults.length === 3 &&
			localAValid &&
			localBValid &&
			globalValid &&
			operationalValid;


		addin.logger.info(
			"TEST NAME UNIQUENESS RULE RESULTS" +

			" | Executed=" + executed +

			" | RuleResults=" +
				result.ruleResults.length +

			" | LocalA=" +
				localAValid +

			" | LocalB=" +
				localBValid +

			" | Global=" +
				globalValid +

			" | Issues=" +
				result.issues.length +

			" | Groups=" +
				result.metrics.duplicates.groups +

			" | Excess=" +
				result.metrics.duplicates.excess +

			" | Success=" +
				success
		);


		return success;
	},
	
	testNameUniquenessBusinessRules: function()
	{
		var synchronizer =
			addin.analysisStructureSynchronizer;


		var analysisA =
			"{30000000-0000-0000-0000-000000000001}";

		var analysisB =
			"{30000000-0000-0000-0000-000000000002}";

		var technicalParentA =
			"{40000000-0000-0000-0000-000000000001}";

		var technicalParentB =
			"{40000000-0000-0000-0000-000000000002}";


		var result =
		{
			issues: [],
			objects: {},
			ruleResults: [],

			summary:
			{
				errors: 0,
				warnings: 0
			},

			metrics:
			{
				objects:
				{
					packages: 0,
					artifacts: 0,
					diagrams: 0,
					total: 0
				},

				duplicates:
				{
					groups: 0,
					excess: 0
				}
			}
		};


		// =====================================================
		// ANALYSIS PACKAGES
		// 2 packages de même nom => GLOBAL KO
		// =====================================================

		var analysisPackage1 =
			synchronizer._createUniquenessCandidate(
				"{50000000-0000-0000-0000-000000000001}",
				"ANALYSIS_PACKAGE",
				"Exigences",
				"",
				"",
				""
			);

		var analysisPackage2 =
			synchronizer._createUniquenessCandidate(
				"{50000000-0000-0000-0000-000000000002}",
				"ANALYSIS_PACKAGE",
				" exigences ",
				"",
				"",
				""
			);


		// =====================================================
		// TECHNICAL PACKAGES
		//
		// Parent A : 2 "_Technique" => LOCAL KO
		// Parent B : 1 "_Technique" => LOCAL OK
		// =====================================================

		var technical1 =
			synchronizer._createUniquenessCandidate(
				"{60000000-0000-0000-0000-000000000001}",
				"TECHNICAL_PACKAGE",
				"_Technique",
				technicalParentA,
				analysisA,
				""
			);

		var technical2 =
			synchronizer._createUniquenessCandidate(
				"{60000000-0000-0000-0000-000000000002}",
				"TECHNICAL_PACKAGE",
				"_Technique",
				technicalParentA,
				analysisA,
				""
			);

		var technical3 =
			synchronizer._createUniquenessCandidate(
				"{60000000-0000-0000-0000-000000000003}",
				"TECHNICAL_PACKAGE",
				"_Technique",
				technicalParentB,
				analysisB,
				""
			);


		var packages =
		[
			analysisPackage1,
			analysisPackage2,
			technical1,
			technical2,
			technical3
		];


		// =====================================================
		// ARTIFACTS
		//
		// A : 2 mêmes noms => LOCAL KO
		// B : 1 même nom   => LOCAL OK
		// GLOBAL           => KO
		// =====================================================

		var artifactA1 =
			synchronizer._createUniquenessCandidate(
				"{70000000-0000-0000-0000-000000000001}",
				"ARTIFACT",
				"Acteur",
				technicalParentA,
				analysisA,
				""
			);

		var artifactA2 =
			synchronizer._createUniquenessCandidate(
				"{70000000-0000-0000-0000-000000000002}",
				"ARTIFACT",
				" acteur ",
				technicalParentA,
				analysisA,
				""
			);

		var artifactB1 =
			synchronizer._createUniquenessCandidate(
				"{70000000-0000-0000-0000-000000000003}",
				"ARTIFACT",
				"ACTEUR",
				technicalParentB,
				analysisB,
				""
			);


		var artifacts =
		[
			artifactA1,
			artifactA2,
			artifactB1
		];


		// =====================================================
		// DIAGRAMS
		//
		// A : 2 mêmes noms => LOCAL KO
		// B : 1 même nom   => LOCAL OK
		// GLOBAL           => KO
		// =====================================================

		var diagramA1 =
			synchronizer._createUniquenessCandidate(
				"{80000000-0000-0000-0000-000000000001}",
				"DIAGRAM",
				"Vue métier",
				technicalParentA,
				analysisA,
				""
			);

		var diagramA2 =
			synchronizer._createUniquenessCandidate(
				"{80000000-0000-0000-0000-000000000002}",
				"DIAGRAM",
				" vue métier ",
				technicalParentA,
				analysisA,
				""
			);

		var diagramB1 =
			synchronizer._createUniquenessCandidate(
				"{80000000-0000-0000-0000-000000000003}",
				"DIAGRAM",
				"VUE MÉTIER",
				technicalParentB,
				analysisB,
				""
			);


		var diagrams =
		[
			diagramA1,
			diagramA2,
			diagramB1
		];


		// =====================================================
		// ENREGISTREMENT DES OBJETS
		// =====================================================

		synchronizer._registerUniquenessPackageObjects(
			result,
			packages
		);

		synchronizer._registerUniquenessArtifactObjects(
			result,
			artifacts
		);

		synchronizer._registerUniquenessDiagramObjects(
			result,
			diagrams
		);


		// =====================================================
		// EXECUTION
		// =====================================================

		var executed =
			synchronizer._checkUniquenessCandidates(
				packages,
				artifacts,
				diagrams,
				result
			);


		// =====================================================
		// VALIDATION DES RULE RESULTS
		// =====================================================

		var analysisGlobal = null;

		var technicalFailed = null;
		var technicalPassed = null;

		var artifactLocalFailed = null;
		var artifactLocalPassed = null;
		var artifactGlobal = null;

		var diagramLocalFailed = null;
		var diagramLocalPassed = null;
		var diagramGlobal = null;


		for (var i = 0; i < result.ruleResults.length; i++)
		{
			var rr =
				result.ruleResults[i];


			if (
				rr.objectType === "ANALYSIS_PACKAGE" &&
				rr.scope === "GLOBAL"
			)
			{
				analysisGlobal = rr;
			}


			else if (
				rr.objectType === "TECHNICAL_PACKAGE" &&
				rr.scope === "LOCAL"
			)
			{
				if (
					addin.utils.equalsIgnoreCase(
						rr.scopeGuid,
						technicalParentA
					)
				)
				{
					technicalFailed = rr;
				}
				else if (
					addin.utils.equalsIgnoreCase(
						rr.scopeGuid,
						technicalParentB
					)
				)
				{
					technicalPassed = rr;
				}
			}


			else if (
				rr.objectType === "ARTIFACT" &&
				rr.scope === "LOCAL"
			)
			{
				if (rr.actual.checked === 2)
					artifactLocalFailed = rr;
				else if (rr.actual.checked === 1)
					artifactLocalPassed = rr;
			}


			else if (
				rr.objectType === "ARTIFACT" &&
				rr.scope === "GLOBAL"
			)
			{
				artifactGlobal = rr;
			}


			else if (
				rr.objectType === "DIAGRAM" &&
				rr.scope === "LOCAL"
			)
			{
				if (rr.actual.checked === 2)
					diagramLocalFailed = rr;
				else if (rr.actual.checked === 1)
					diagramLocalPassed = rr;
			}


			else if (
				rr.objectType === "DIAGRAM" &&
				rr.scope === "GLOBAL"
			)
			{
				diagramGlobal = rr;
			}
		}


		var analysisValid =
			analysisGlobal != null &&
			analysisGlobal.actual.checked === 2 &&
			analysisGlobal.actual.duplicateGroups === 1 &&
			analysisGlobal.actual.duplicateExcess === 1 &&
			analysisGlobal.passed === false;


		var technicalValid =
			technicalFailed != null &&
			technicalPassed != null &&
			technicalFailed.actual.checked === 2 &&
			technicalFailed.actual.duplicateGroups === 1 &&
			technicalFailed.actual.duplicateExcess === 1 &&
			technicalFailed.passed === false &&
			technicalPassed.actual.checked === 1 &&
			technicalPassed.actual.duplicateGroups === 0 &&
			technicalPassed.passed === true;


		var artifactValid =
			artifactLocalFailed != null &&
			artifactLocalPassed != null &&
			artifactGlobal != null &&
			artifactLocalFailed.passed === false &&
			artifactLocalPassed.passed === true &&
			artifactGlobal.actual.checked === 3 &&
			artifactGlobal.actual.duplicateGroups === 1 &&
			artifactGlobal.actual.duplicateExcess === 2 &&
			artifactGlobal.passed === false;


		var diagramValid =
			diagramLocalFailed != null &&
			diagramLocalPassed != null &&
			diagramGlobal != null &&
			diagramLocalFailed.passed === false &&
			diagramLocalPassed.passed === true &&
			diagramGlobal.actual.checked === 3 &&
			diagramGlobal.actual.duplicateGroups === 1 &&
			diagramGlobal.actual.duplicateExcess === 2 &&
			diagramGlobal.passed === false;


		/*
		 * Groupes attendus :
		 *
		 * Analysis Package GLOBAL = 1
		 * Technical Package LOCAL = 1
		 * Artifact LOCAL          = 1
		 * Artifact GLOBAL         = 1
		 * Diagram LOCAL           = 1
		 * Diagram GLOBAL          = 1
		 *
		 * => 6 issues
		 *
		 * Excess :
		 * 1 + 1 + 1 + 2 + 1 + 2 = 8
		 */

		var operationalValid =
			result.issues.length === 6 &&
			result.summary.errors === 6 &&
			result.metrics.duplicates.groups === 6 &&
			result.metrics.duplicates.excess === 8;


		/*
		 * RuleResults attendus :
		 *
		 * Analysis Package GLOBAL = 1
		 * Technical LOCAL         = 2
		 * Artifact LOCAL          = 2
		 * Artifact GLOBAL         = 1
		 * Diagram LOCAL           = 2
		 * Diagram GLOBAL          = 1
		 *
		 * TOTAL = 9
		 */

		var success =
			executed === true &&
			result.ruleResults.length === 9 &&
			analysisValid &&
			technicalValid &&
			artifactValid &&
			diagramValid &&
			operationalValid;


		addin.logger.info(
			"TEST NAME UNIQUENESS BUSINESS RULES" +

			" | Executed=" + executed +

			" | RuleResults=" +
				result.ruleResults.length +

			" | Analysis=" +
				analysisValid +

			" | Technical=" +
				technicalValid +

			" | Artifact=" +
				artifactValid +

			" | Diagram=" +
				diagramValid +

			" | Issues=" +
				result.issues.length +

			" | Groups=" +
				result.metrics.duplicates.groups +

			" | Excess=" +
				result.metrics.duplicates.excess +

			" | Success=" +
				success
		);


		return success;
	},
	
	testCheckBusinessRules: function()
	{
		var executed = false;
		var success = true;

		var artifactPresence = false;
		var diagramPresence = false;
		var diagramArtifactPresence = false;
		var noteRequirement = false;
		var artifactLocation = false;
		var artifactAllowed = false;

		var invalidRuleResults = 0;
		var totalRuleResults = 0;
		
		var artifactNamingFound = false;
		var artifactTechnicalNamingFound = false;
		var diagramNamingFound = false;
		var diagramTechnicalNamingFound = false;


		// =====================================================
		// CONTEXTE
		// =====================================================

		var selectedPackage =
			Repository.GetTreeSelectedPackage();


		if (!selectedPackage)
		{
			addin.logger.error(
				"TEST CHECK BUSINESS RULES"
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
			addin.logger.error(
				"TEST CHECK BUSINESS RULES"
				+ " | Contexte d'analyse introuvable"
			);

			return false;
		}


		// Le test porte sur un Analysis Element.
		if (
			context.targetType !=
			addin.fbaConstants.CONTEXT_ANALYSIS_PACKAGE
		)
		{
			addin.logger.error(
				"TEST CHECK BUSINESS RULES"
				+ " | Sélectionner un package d'Analysis Element"
			);

			return false;
		}


		// =====================================================
		// EXECUTION DU VRAI CHECK
		// =====================================================

		var result =
			addin.analysisStructureSynchronizer
				.checkAnalysisPackage(
					context.analysisRoot,
					context.targetPackage
				);


		executed = true;


		if (!result)
		{
			addin.logger.error(
				"TEST CHECK BUSINESS RULES"
				+ " | Result=NULL"
			);

			return false;
		}


		var ruleResults =
			result.ruleResults || [];


		totalRuleResults =
			ruleResults.length;


		// =====================================================
		// VALIDATION DES RULE RESULTS
		// =====================================================

		for (
			var i = 0;
			i < ruleResults.length;
			i++
		)
		{
			var ruleResult =
				ruleResults[i];


			if (!ruleResult)
			{
				invalidRuleResults++;
				continue;
			}


			// -------------------------------------------------
			// Contrat commun
			// -------------------------------------------------

			if (
				addin.utils.isEmpty(
					ruleResult.rule
				) ||
				addin.utils.isEmpty(
					ruleResult.scope
				) ||
				addin.utils.isEmpty(
					ruleResult.scopeType
				) ||
				!ruleResult.expected ||
				!ruleResult.actual ||
				typeof ruleResult.passed != "boolean"
			)
			{
				invalidRuleResults++;
			}


			// -------------------------------------------------
			// 48A
			// -------------------------------------------------

			if (
				ruleResult.rule ==
				"ARTIFACT_PRESENCE"
			)
			{
				artifactPresence = true;

				if (
					ruleResult.objectType !=
						"ARTIFACT_DEFINITION" ||
					typeof ruleResult.actual.count ==
						"undefined"
				)
				{
					success = false;
				}
			}


			// -------------------------------------------------
			// 48B
			// -------------------------------------------------

			else if (
				ruleResult.rule ==
				"DIAGRAM_PRESENCE"
			)
			{
				diagramPresence = true;

				if (
					ruleResult.objectType !=
						"DIAGRAM_DEFINITION" ||
					typeof ruleResult.actual.found ==
						"undefined"
				)
				{
					success = false;
				}
			}


			// -------------------------------------------------
			// 48C
			// -------------------------------------------------

			else if (
				ruleResult.rule ==
				"DIAGRAM_ARTIFACT_PRESENCE"
			)
			{
				diagramArtifactPresence = true;

				if (
					ruleResult.objectType !=
						"ARTIFACT_DEFINITION" ||
					typeof ruleResult.actual.count ==
						"undefined" ||
					typeof ruleResult.actual.found ==
						"undefined"
				)
				{
					success = false;
				}
			}


			// -------------------------------------------------
			// 48D
			// -------------------------------------------------

			else if (
				ruleResult.rule ==
				"NOTE_REQUIREMENT"
			)
			{
				noteRequirement = true;

				if (
					typeof ruleResult.actual.present ==
						"undefined" ||
					typeof ruleResult.expected.requirement ==
						"undefined"
				)
				{
					success = false;
				}
			}


			// -------------------------------------------------
			// 48E.1
			// -------------------------------------------------

			else if (
				ruleResult.rule ==
				"ARTIFACT_LOCATION"
			)
			{
				artifactLocation = true;

				if (
					typeof ruleResult.expected.packageId ==
						"undefined" ||
					typeof ruleResult.actual.packageId ==
						"undefined"
				)
				{
					success = false;
				}
			}


			// -------------------------------------------------
			// 48E.2
			// -------------------------------------------------

			else if (
				ruleResult.rule ==
				"ARTIFACT_ALLOWED_ON_DIAGRAM"
			)
			{
				artifactAllowed = true;

				if (
					ruleResult.expected.allowed !== true ||
					typeof ruleResult.actual.allowed !=
						"boolean"
				)
				{
					success = false;
				}
			}
			
			if (ruleResult.rule === "ARTIFACT_NAMING")
			{
				artifactNamingFound = true;
			}

			if (ruleResult.rule === "ARTIFACT_TECHNICAL_NAMING")
			{
				artifactTechnicalNamingFound = true;
			}

			if (ruleResult.rule === "DIAGRAM_NAMING")
			{
				diagramNamingFound = true;
			}

			if (ruleResult.rule === "DIAGRAM_TECHNICAL_NAMING")
			{
				diagramTechnicalNamingFound = true;
			}
		}


		// =====================================================
		// RESULTAT GLOBAL
		// =====================================================

		if (invalidRuleResults > 0
			&& artifactNamingFound
			&& artifactTechnicalNamingFound
			&& diagramNamingFound
			&& diagramTechnicalNamingFound
		)
			success = false;


		/*
		 * IMPORTANT :
		 *
		 * On ne rend PAS le test invalide parce qu'une famille
		 * n'apparaît pas dans ce package.
		 *
		 * Par exemple ARTIFACT_LOCATION ou
		 * DIAGRAM_ARTIFACT_PRESENCE ne sont exécutées que si
		 * le métamodèle / contenu du package permet réellement
		 * l'exécution de cette règle.
		 *
		 * Ce test valide donc :
		 * - le vrai CHECK ;
		 * - le contrat des ruleResults réellement exécutés ;
		 * - les familles rencontrées.
		 */


		addin.logger.info(
			"TEST CHECK BUSINESS RULES"
			+ " | Executed=" + executed
			+ " | RuleResults=" + totalRuleResults
			+ " | ArtifactPresence=" + artifactPresence
			+ " | DiagramPresence=" + diagramPresence
			+ " | DiagramArtifactPresence=" + diagramArtifactPresence
			+ " | NoteRequirement=" + noteRequirement
			+ " | ArtifactLocation=" + artifactLocation
			+ " | ArtifactAllowed=" + artifactAllowed
			+ " | Invalid=" + invalidRuleResults
			+ " | Success=" + success,
			+ " | ArtifactNaming="
				+ artifactNamingFound

			+ " | ArtifactTechnicalNaming="
				+ artifactTechnicalNamingFound

			+ " | DiagramNaming="
				+ diagramNamingFound

			+ " | DiagramTechnicalNaming="
				+ diagramTechnicalNamingFound
			);


		return success;
	},
	
	testCheckAnalysisRoot: function()
	{
		
		try
		{
			var selectedPackage =
				Repository.GetTreeSelectedPackage();

			if (!selectedPackage)
			{
				addin.logger.error(
					"TEST CHECK ROOT"
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
				!context.analysisRoot
			)
			{
				addin.logger.error(
					"TEST CHECK ROOT"
					+ " | Contexte d'analyse introuvable"
				);

				return false;
			}


			var root =
				context.analysisRoot;


			var result =
				addin.analysisStructureSynchronizer
					.checkAnalysis(root);


			var ruleResults =
				result.ruleResults || [];

			var objects =
				result.objects || {};

			var multiplicityFound = false;
			var uniquenessFound = false;
			var invalidRuleResults = 0;


			for (
				var i = 0;
				i < ruleResults.length;
				i++
			)
			{
				var ruleResult =
					ruleResults[i];

				if (!ruleResult ||
					addin.utils.isEmpty(
						ruleResult.rule
					))
				{
					invalidRuleResults++;
					continue;
				}


				if (
					ruleResult.rule ==
					"ANALYSIS_ELEMENT_PACKAGE_MULTIPLICITY"
				)
				{
					multiplicityFound = true;
				}


				if (
					ruleResult.rule ==
					"NAME_UNIQUENESS"
				)
				{
					uniquenessFound = true;
				}
			}


			var objectCount = 0;

			for (var objectGuid in objects)
			{
				if (objects.hasOwnProperty(objectGuid))
				{
					objectCount++;
				}
			}


			var metricsValid =
				result.metrics &&
				result.metrics.objects &&
				result.metrics.objects.total ==
					objectCount;


			var success =
				multiplicityFound &&
				uniquenessFound &&
				invalidRuleResults == 0 &&
				metricsValid;


			addin.logger.info(
				"TEST CHECK ROOT"
				+ " | Executed=true"
				+ " | RuleResults="
					+ ruleResults.length
				+ " | Multiplicity="
					+ multiplicityFound
				+ " | Uniqueness="
					+ uniquenessFound
				+ " | Objects="
					+ objectCount
				+ " | MetricObjects="
					+ (
						result.metrics &&
						result.metrics.objects
							? result.metrics.objects.total
							: -1
					)
				+ " | Issues="
					+ (
						result.issues
							? result.issues.length
							: 0
					)
				+ " | Invalid="
					+ invalidRuleResults
				+ " | Success="
					+ success
			);


			return success;
		}
		catch (e)
		{
			addin.logger.error(
				"TEST CHECK ROOT"
				+ " | Exception="
				+ e.message
			);

			return false;
		}
	},
		
	testCheckPackageRuleContract: function()
	{
		try
		{
			var selectedPackage =
				Repository.GetTreeSelectedPackage();

			if (!selectedPackage)
			{
				addin.logger.error(
					"TEST CHECK PACKAGE RULE CONTRACT"
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
				!context.analysisRoot
			)
			{
				addin.logger.error(
					"TEST CHECK PACKAGE RULE CONTRACT"
					+ " | Contexte d'analyse introuvable"
				);

				return false;
			}


			var root =
				context.analysisRoot;


			var result =
				addin.analysisStructureSynchronizer
					.checkAnalysis(root);


			if (!result)
			{
				addin.logger.error(
					"TEST CHECK PACKAGE RULE CONTRACT"
					+ " | Result=NULL"
				);

				return false;
			}


			var ruleResults =
				result.ruleResults || [];


			var rules =
			{
				PACKAGE_RECOGNITION: 0,
				PACKAGE_INITIALIZATION: 0,
				ANALYSIS_ELEMENT_REFERENCE: 0
			};


			var invalid = 0;


			for (
				var i = 0;
				i < ruleResults.length;
				i++
			)
			{
				var ruleResult =
					ruleResults[i];


				if (!ruleResult)
					continue;


				if (
					rules[ruleResult.rule] === undefined
				)
				{
					continue;
				}


				rules[ruleResult.rule]++;


				// =============================================
				// CONTRAT COMMUN DES REGLES PACKAGE
				// =============================================

				if (
					ruleResult.scopeType !=
						"ANALYSIS_PACKAGE" ||
					ruleResult.objectType !=
						"PACKAGE"
				)
				{
					invalid++;
				}


				// =============================================
				// PACKAGE_INITIALIZATION
				// =============================================

				if (
					ruleResult.rule ==
						"PACKAGE_INITIALIZATION"
				)
				{
					if (
						!ruleResult.expected ||
						ruleResult.expected.initialized
							=== undefined ||
						!ruleResult.actual ||
						ruleResult.actual.initializationState
							=== undefined ||
						ruleResult.actual.initialized
							=== undefined
					)
					{
						invalid++;
					}
				}


				// =============================================
				// ANALYSIS_ELEMENT_REFERENCE
				// =============================================

				if (
					ruleResult.rule ==
						"ANALYSIS_ELEMENT_REFERENCE"
				)
				{
					if (
						!ruleResult.expected ||
						ruleResult.expected.existsInMetamodel
							=== undefined ||
						!ruleResult.actual ||
						ruleResult.actual
							.sourceAnalysisElementGuid
							=== undefined ||
						ruleResult.actual.found
							=== undefined
					)
					{
						invalid++;
					}
				}
			}


			var success =
				rules.PACKAGE_INITIALIZATION > 0 &&
				rules.ANALYSIS_ELEMENT_REFERENCE > 0 &&
				invalid == 0;


			addin.logger.info(
				"TEST CHECK PACKAGE RULE CONTRACT"
					+ " | Recognition="
					+ rules.PACKAGE_RECOGNITION
					+ " | Initialization="
					+ rules.PACKAGE_INITIALIZATION
					+ " | AnalysisElementReference="
					+ rules.ANALYSIS_ELEMENT_REFERENCE
					+ " | Invalid="
					+ invalid
					+ " | Success="
					+ success
			);


			return success;
		}
		catch (e)
		{
			addin.logger.error(
				"TEST CHECK PACKAGE RULE CONTRACT"
					+ " | Exception="
					+ e.message
			);

			return false;
		}
	},
}
