var addin = this;

return {

	_getOperationDefinitions: function()
	{
		var context =
			addin.operationContext;

		// ========================================================
		// HORS OPERATION
		// ========================================================

		if (!context)
		{
			return this._loadDefinitions();
		}


		// ========================================================
		// LAZY LOADING
		// ========================================================

		if (context.definitions === null)
		{
			context.definitions =
				this._loadDefinitions();
		}


		// ========================================================
		// CACHE OPERATION
		// ========================================================

		return context.definitions;
	},
		
	_getOperationArtifactDefinitionsIndex: function()
	{
		var context =
			addin.operationContext;

		// ========================================================
		// HORS OPERATION
		// ========================================================

		if (!context)
		{
			return addin.repositoryService
				.getArtifactDefinitionsIndexSQL();
		}


		// ========================================================
		// LAZY LOADING
		// ========================================================

		if (context.artifactDefinitionsIndex === null)
		{
			context.artifactDefinitionsIndex =
				addin.repositoryService
					.getArtifactDefinitionsIndexSQL();
		}


		// ========================================================
		// CACHE OPERATION
		// ========================================================

		return context.artifactDefinitionsIndex;
	},
		
	_getOperationAnalysisElementTagsIndex: function()
	{
		var context =
			addin.operationContext;

		// ========================================================
		// HORS OPERATION
		// ========================================================

		if (!context)
		{
			return addin.repositoryService
				.getAnalysisElementTagsIndexSQL();
		}


		// ========================================================
		// LAZY LOADING
		// ========================================================

		if (context.analysisElementTagsIndex === null)
		{
			context.analysisElementTagsIndex =
				addin.repositoryService
					.getAnalysisElementTagsIndexSQL();
		}


		// ========================================================
		// CACHE OPERATION
		// ========================================================

		return context.analysisElementTagsIndex;
	},
		
	_getOperationPackagesIndex: function(rootPackage)
	{
		var context =
			addin.operationContext;

		// ========================================================
		// HORS OPERATION
		// ========================================================

		if (!context)
		{
			return addin.repositoryService
				.getAnalysisPackageIndexSQL(
					rootPackage
				);
		}


		// ========================================================
		// LAZY LOADING
		// ========================================================

		if (context.packagesIndex === null)
		{
			context.packagesIndex =
				addin.repositoryService
					.getAnalysisPackageIndexSQL(
						rootPackage
					);
		}


		// ========================================================
		// CACHE OPERATION
		// ========================================================

		return context.packagesIndex;
	},
		
	_getOperationArtifactsIndex: function(rootPackage)
	{
		var context =
			addin.operationContext;

		// ========================================================
		// HORS OPERATION
		// ========================================================

		if (!context)
		{
			return addin.repositoryService
				.getAnalysisArtifactsSQL(
					rootPackage
				);
		}


		// ========================================================
		// LAZY LOADING
		// ========================================================

		if (context.artifactsIndex === null)
		{
			context.artifactsIndex =
				addin.repositoryService
					.getAnalysisArtifactsSQL(
						rootPackage
					);
		}


		// ========================================================
		// CACHE OPERATION
		// ========================================================

		return context.artifactsIndex;
	},

	_getOperationDiagramsIndex: function(rootPackage)
	{
		var context =
			addin.operationContext;

		// ========================================================
		// HORS OPERATION
		// ========================================================

		if (!context)
		{
			return addin.repositoryService
				.getAnalysisDiagramsSQL(
					rootPackage
				);
		}


		// ========================================================
		// LAZY LOADING
		// ========================================================

		if (context.diagramsIndex === null)
		{
			context.diagramsIndex =
				addin.repositoryService
					.getAnalysisDiagramsSQL(
						rootPackage
					);
		}


		// ========================================================
		// CACHE OPERATION
		// ========================================================

		return context.diagramsIndex;
	},
    // ========================================================
    // _loadDefinitions
    // ========================================================

    _loadDefinitions: function()
	{
		var result = [];

		addin.logger.info(
			"Chargement des éléments d'analyse"
			+ " | GUID=" + addin.fbaConstants.ANALYSIS_ELEMENTS_GUID
			+ " | Mode=SQL"
		);

		var sql =
			"SELECT " +
			"o.Object_ID, " +
			"o.Name AS Analysis_Element, " +
			"o.ea_guid AS Analysis_Element_GUID, " +
			"tvRole.Value AS Framework_Role, " +
			"tvCategory.Value AS Category, " +
			"tvImportance.Value AS Important_Level " +

			"FROM t_connector c " +

			"INNER JOIN t_object source " +
			"ON source.Object_ID = c.Start_Object_ID " +

			"INNER JOIN t_object o " +
			"ON o.Object_ID = c.End_Object_ID " +

			"LEFT JOIN t_objectproperties tvRole " +
			"ON tvRole.Object_ID = o.Object_ID " +
			"AND tvRole.Property = " +
			addin.database.safeSQLString(
				addin.fbaConstants.TAG_FRAMEWORK_ROLE
			) + " " +

			"LEFT JOIN t_objectproperties tvCategory " +
			"ON tvCategory.Object_ID = o.Object_ID " +
			"AND tvCategory.Property = " +
			addin.database.safeSQLString(
				addin.fbaConstants.TAG_CATEGORY
			) + " " +

			"LEFT JOIN t_connectortag tvImportance " +
			"ON tvImportance.ElementID = c.Connector_ID " +
			"AND tvImportance.Property = " +
			addin.database.safeSQLString(
				addin.fbaConstants.TAG_IMPORTANT_LEVEL
			) + " " +

			"WHERE source.ea_guid = " +
			addin.database.safeSQLString(
				addin.fbaConstants.ANALYSIS_ELEMENTS_GUID
			) + " " +

			"AND c.Connector_Type = 'Association' " +
			"AND c.Name = 'Defined by' " +

			"ORDER BY o.Name";

		var queryResult =
			addin.database.query(sql);

		if (!queryResult)
		{
			addin.logger.error(
				"Erreur chargement SQL des éléments d'analyse"
			);

			return result;
		}

		var known = {};

		for (
			var i = 0;
			i < queryResult.Rows.length;
			i++
		)
		{
			var row =
				queryResult.Rows[i];

			var guid =
				addin.utils.normalizeGuid(
					row.Analysis_Element_GUID
				);

			if (!guid)
				continue;

			// ====================================================
			// DOUBLON
			// ====================================================

			if (known[guid])
				continue;

			known[guid] = true;

			var role =
				addin.utils.trim(
					row.Framework_Role
				);

			// ====================================================
			// ROLE
			// ====================================================

			if (
				!addin.utils.equalsIgnoreCase(
					role,
					addin.fbaConstants.ROLE_ANALYSIS_OBJECT
				) &&
				!addin.utils.equalsIgnoreCase(
					role,
					addin.fbaConstants.ROLE_ANALYSIS_SUBJECT
				)
			)
			{
				continue;
			}

			// ====================================================
			// OBJET EA
			// ====================================================

			var element =
				addin.repositoryService.getElementById(
					Number(row.Object_ID)
				);

			if (!element)
			{
				addin.logger.warning(
					"Élément d'analyse SQL introuvable via EA"
					+ " | ObjectID=" + row.Object_ID
					+ " | GUID=" + guid
				);

				continue;
			}

			// ====================================================
			// DEFINITION
			// ====================================================

			var definition =
			{
				element:
					element,

				guid:
					element.ElementGUID,

				name:
					addin.utils.trim(
						row.Analysis_Element
					),

				role:
					role,

				category:
					addin.utils.trim(
						row.Category
					),

				importantLevel:
					addin.utils.trim(
						row.Important_Level
					)
			};

			result.push(
				definition
			);

			addin.logger.debug(
				"Élément d'analyse"
				+ " | Nom=" + definition.name
				+ " | Role=" + definition.role
				+ " | Category=" + definition.category
				+ " | ImportantLevel=" + definition.importantLevel
				+ " | GUID=" + definition.guid
			);
		}

		addin.logger.info(
			"Éléments d'analyse chargés"
			+ " | Nombre=" + result.length
			+ " | Mode=SQL"
		);

		return result;
	},


    // ========================================================
	// _loadArtifactDefinitions
	//
	// Charge les définitions d'artefacts d'un objet d'analyse
	// à partir des index SQL préchargés.
	//
	// Les index sont chargés une seule fois par synchronisation.
	//
	// Contrat de sortie identique à l'ancienne implémentation.
	// ========================================================

	_loadArtifactDefinitions: function(
		analysisDefinition,
		artifactIndex,
		analysisTagIndex
	)
	{
		var result = [];


		// =====================================================
		// VALIDATION
		// =====================================================

		if (
			!analysisDefinition ||
			!analysisDefinition.element
		)
		{
			return result;
		}


		var analysisElement =
			analysisDefinition.element;


		var analysisGuid =
			addin.utils.normalizeGuid(
				analysisDefinition.guid ||
				analysisElement.ElementGUID
			);


		if (!analysisGuid)
		{
			return result;
		}


		// =====================================================
		// DEFINITIONS SQL
		// =====================================================

		var definitions = [];

		if (
			artifactIndex &&
			artifactIndex[analysisGuid]
		)
		{
			definitions =
				artifactIndex[analysisGuid];
		}


		if (definitions.length == 0)
		{
			return result;
		}


		// =====================================================
		// TAGS DE L'ANALYSIS ELEMENT
		// =====================================================

		var elementTags = {};

		if (
			analysisTagIndex &&
			analysisTagIndex[analysisGuid]
		)
		{
			elementTags =
				analysisTagIndex[analysisGuid];
		}


		// =====================================================
		// DEFINITIONS D'ARTEFACTS
		// =====================================================

		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var sqlDefinition =
				definitions[i];


			// =================================================
			// CONNECTEUR EA
			//
			// On conserve l'objet EA pour maintenir exactement
			// le contrat de sortie actuel.
			// =================================================

			var connector = null;

			try
			{
				connector =
					Repository.GetConnectorByID(
						sqlDefinition.connectorId
					);
			}
			catch (e)
			{
				connector = null;
			}


			if (!connector)
			{
				addin.logger.warning(
					"Connecteur de définition d'artefact introuvable"
					+ " | Analyse=" + analysisElement.Name
					+ " | ConnectorID="
					+ sqlDefinition.connectorId
					+ " | ConnectorGUID="
					+ sqlDefinition.connectorGuid
				);

				continue;
			}


			// =================================================
			// PROTOTYPE EA
			// =================================================

			var artifactPrototype =
				addin.repositoryService.getElementById(
					sqlDefinition.prototypeObjectId
				);


			if (!artifactPrototype)
			{
				addin.logger.warning(
					"Prototype d'artefact introuvable"
					+ " | Analyse=" + analysisElement.Name
					+ " | ConnectorGUID="
					+ sqlDefinition.connectorGuid
				);

				continue;
			}


			// =================================================
			// TAGS
			//
			// Element UNION Connector
			// Connector prioritaire.
			// =================================================

			var connectorTags =
				sqlDefinition.connectorTags || {};


			var effectiveTags =
				addin.repositoryService.mergeTaggedValues(
					elementTags,
					connectorTags
				);


			var importanceLevel =
				addin.utils.trim(
					connectorTags[
						addin.fbaConstants.TAG_IMPORTANT_LEVEL
					]
				);


			var multiplicity =
				addin.utils.trim(
					sqlDefinition.multiplicity
				);


			// =================================================
			// RESULTAT
			//
			// Même contrat que l'ancienne implémentation.
			// =================================================

			result.push(
				{
					connector:
						connector,

					connectorGuid:
						connector.ConnectorGUID,

					prototype:
						artifactPrototype,

					prototypeGuid:
						artifactPrototype.ElementGUID,

					elementType:
						artifactPrototype.Type,

					stereotype:
						addin.utils.trim(
							artifactPrototype.StereotypeEx
						),

					importanceLevel:
						importanceLevel,

					multiplicity:
						multiplicity,

					taggedValues:
						effectiveTags
				}
			);


			addin.logger.debug(
				"Définition d'artefact chargée"
				+ " | Analyse=" + analysisElement.Name
				+ " | Type=" + artifactPrototype.Type
				+ " | Stereo=" + artifactPrototype.StereotypeEx
				+ " | Prototype=" + artifactPrototype.Name
				+ " | Importance=" + importanceLevel
				+ " | Multiplicity=" + multiplicity
				+ " | ConnectorGUID=" + connector.ConnectorGUID
				+ " | PrototypeGUID=" + artifactPrototype.ElementGUID
				+ " | Discriminator="
				+ addin.utils.trim(
					effectiveTags[
						addin.fbaConstants.TAG_STEREOTYPE_DISCRIMINATOR
					]
				)
				+ " | Prefix="
				+ addin.utils.trim(
					effectiveTags[
						addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
					]
				)
			);
		}


		return result;
	},


    // ========================================================
    // _findPackageBySourceGuid
    // ========================================================

    _findPackageBySourceGuid: function(
        parentPackage,
        sourceGuid)
    {
        if (
            !parentPackage ||
            addin.utils.isEmpty(
                sourceGuid
            )
        )
        {
            return null;
        }


        var packages =
            parentPackage.Packages;


        for (
            var i = 0;
            i < packages.Count;
            i++
        )
        {
            var current =
                packages.GetAt(i);


            if (
                !current ||
                !current.Element
            )
            {
                continue;
            }


            var currentSourceGuid =
                addin.repositoryService.getTaggedValue(
                    current.Element,
                    addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
                );


            if (
                addin.utils.equalsIgnoreCase(
                    currentSourceGuid,
                    sourceGuid
                )
            )
            {
                return current;
            }
        }


        return null;
    },


    // ========================================================
    // _findArtifactByDefinitionGuid
    // ========================================================

    _findArtifactByDefinitionGuid: function(
        analysisPackage,
        definitionGuid)
    {
        if (
            !analysisPackage ||
            addin.utils.isEmpty(
                definitionGuid
            )
        )
        {
            return null;
        }


        var elements =
            analysisPackage.Elements;


        for (
            var i = 0;
            i < elements.Count;
            i++
        )
        {
            var element =
                elements.GetAt(i);


            var sourceGuid =
                addin.repositoryService.getTaggedValue(
                    element,
                    addin.fbaConstants.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
                );


            if (
                addin.utils.equalsIgnoreCase(
                    sourceGuid,
                    definitionGuid
                )
            )
            {
                return element;
            }
        }


        return null;
    },


    // ========================================================
    // _buildGeneratedArtifactName
    //
    // Prefix=PRB / Discriminator=Problème
    //      -> PRB001 - Problème
    //
    // Prefix=KPI / Discriminator=Valeur & Mesure
    //      -> KPI001 - Valeur & Mesure
    // ========================================================

    _buildGeneratedArtifactName: function(
        analysisDefinition,
        artifactDefinition,
        artifactNumber)
    {
        var tags =
            artifactDefinition.taggedValues || {};


        var prefix =
            addin.utils.trim(
                tags[
                    addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
                ]
            );


        var discriminator =
            addin.utils.trim(
                tags[
                    addin.fbaConstants.TAG_STEREOTYPE_DISCRIMINATOR
                ]
            );


        var suffix =
            discriminator;


        if (
            addin.utils.isEmpty(
                suffix
            )
        )
        {
            suffix =
                analysisDefinition.name;
        }


        if (
            addin.utils.isEmpty(
                prefix
            )
        )
        {
            return suffix;
        }


        return prefix
            + this._formatArtifactNumber(
                artifactNumber
            )
            + " - "
            + suffix;
    },
	
	// ============================================================
	// _initializePackage
	//
	// Rattache un package existant à une définition du métamodèle.
	//
	// IMPORTANT :
	// cette méthode ne contrôle pas l'unicité.
	// Plusieurs packages peuvent être rattachés à la même
	// définition. Ce contrôle appartient à CHECK.
	// ============================================================

	_initializePackage: function(
		analysisPackage,
		definition)
	{
		if (
			!analysisPackage ||
			!analysisPackage.Element ||
			!definition
		)
		{
			return false;
		}


		// ========================================================
		// IDENTITE METAMODELE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			definition.guid
		);


		// ========================================================
		// ROLE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			definition.role
		);


		// ========================================================
		// CATEGORY
		// ========================================================

		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_CATEGORY,
			definition.category
		);


		// ========================================================
		// IMPORTANCE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_IMPORTANT_LEVEL,
			definition.importantLevel
		);


		addin.logger.info(
			"Package d'analyse initialisé"
			+ " | Package=" + analysisPackage.Name
			+ " | PackageGUID=" + analysisPackage.PackageGUID
			+ " | Definition=" + definition.name
			+ " | SourceGUID=" + definition.guid
			+ " | Role=" + definition.role
			+ " | Category=" + definition.category
			+ " | ImportantLevel=" + definition.importantLevel
		);


		return true;
	},


	// ============================================================
	// _ensurePackage
	// ============================================================

	_ensurePackage: function(
		parentPackage,
		definition)
	{
		if (
			!parentPackage ||
			!definition
		)
		{
			return null;
		}


		var analysisPackage =
			this._findPackageBySourceGuid(
				parentPackage,
				definition.guid
			);


		// ========================================================
		// CREATION
		// ========================================================

		if (!analysisPackage)
		{
			addin.logger.info(
				"Création package d'analyse"
				+ " | Nom=" + definition.name
				+ " | Role=" + definition.role
				+ " | Category=" + definition.category
			);


			analysisPackage =
				parentPackage.Packages.AddNew(
					definition.name,
					""
				);


			if (!analysisPackage)
			{
				addin.logger.error(
					"Impossible de créer le package"
					+ " | Nom=" + definition.name
				);

				return null;
			}


			if (
				!analysisPackage.Update()
			)
			{
				addin.logger.error(
					"Impossible de sauvegarder le package"
					+ " | Nom=" + definition.name
				);

				return null;
			}


			//parentPackage.Packages.Refresh();
		}


		// ========================================================
		// SYNCHRONISATION DU NOM
		// ========================================================

		if (
			analysisPackage.Name !=
			definition.name
		)
		{
			addin.logger.info(
				"Renommage package d'analyse"
				+ " | Ancien=" + analysisPackage.Name
				+ " | Nouveau=" + definition.name
			);


			analysisPackage.Name =
				definition.name;


			analysisPackage.Update();
		}


		// ========================================================
		// TAGGED VALUES
		// ========================================================

		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			definition.guid
		);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			definition.role
		);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_CATEGORY,
			definition.category
		);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_IMPORTANT_LEVEL,
			definition.importantLevel
		);


		addin.logger.debug(
			"Package d'analyse synchronisé"
			+ " | Nom=" + analysisPackage.Name
			+ " | PackageGUID=" + analysisPackage.PackageGUID
			+ " | SourceGUID=" + definition.guid
			+ " | Role=" + definition.role
			+ " | Category=" + definition.category
			+ " | ImportantLevel=" + definition.importantLevel
		);


		return analysisPackage;
	},
	
	// ============================================================
	// _extractArtifactNumber
	// ============================================================

	_extractArtifactNumber: function(
		artifactName,
		prefix)
	{
		artifactName =
			addin.utils.trim(
				artifactName
			);

		prefix =
			addin.utils.trim(
				prefix
			);


		if (
			addin.utils.isEmpty(artifactName) ||
			addin.utils.isEmpty(prefix)
		)
		{
			return 0;
		}


		var upperName =
			artifactName.toUpperCase();

		var upperPrefix =
			prefix.toUpperCase();


		if (
			upperName.indexOf(
				upperPrefix
			) != 0
		)
		{
			return 0;
		}


		var remainder =
			artifactName.substring(
				prefix.length
			);


		var numberText =
			"";


		for (
			var i = 0;
			i < remainder.length;
			i++
		)
		{
			var character =
				remainder.charAt(i);


			if (
				character >= "0" &&
				character <= "9"
			)
			{
				numberText +=
					character;
			}
			else
			{
				break;
			}
		}


		if (
			addin.utils.isEmpty(
				numberText
			)
		)
		{
			return 0;
		}


		var number =
			parseInt(
				numberText,
				10
			);


		if (
			isNaN(number) ||
			number <= 0
		)
		{
			return 0;
		}


		return number;
	},


	// ============================================================
	// _scanMaxArtifactNumber
	// ============================================================

	_scanMaxArtifactNumber: function(
		analysisPackage,
		prefix)
	{
		if (
			!analysisPackage ||
			addin.utils.isEmpty(prefix)
		)
		{
			return 0;
		}


		var maxNumber =
			0;


		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			var number =
				this._extractArtifactNumber(
					element.Name,
					prefix
				);


			if (
				number > maxNumber
			)
			{
				maxNumber =
					number;
			}
		}


		return maxNumber;
	},
		
	_incrementCheckSummary: function(summary, issue)
	{
		if (!summary || !issue)
			return;
		
		if (typeof summary.errors !== "number")
			summary.errors = 0;

		if (typeof summary.warnings !== "number")
			summary.warnings = 0;

		if (typeof summary.init !== "number")
			summary.init = 0;

		if (typeof summary.complete !== "number")
			summary.complete = 0;

		if (typeof summary.repair !== "number")
			summary.repair = 0;

		if (typeof summary.manualComplete !== "number")
			summary.manualComplete = 0;

		if (typeof summary.manualRemove !== "number")
			summary.manualRemove = 0;

		if (typeof summary.manualMove !== "number")
			summary.manualMove = 0;

		if (typeof summary.makeTechnical !== "number")
			summary.makeTechnical = 0;
		
		if (typeof summary.makeBusiness !== "number")
			summary.makeBusiness = 0;

		if (typeof summary.manualReview !== "number")
			summary.manualReview = 0;

		// =====================================================
		// SEVERITE
		// =====================================================

		if (
			issue.severity ==
			addin.fbaConstants.CHECK_SEVERITY_ERROR
		)
		{
			summary.errors++;
		}
		else if (
			issue.severity ==
			addin.fbaConstants.CHECK_SEVERITY_WARNING
		)
		{
			summary.warnings++;
		}


		// =====================================================
		// ACTION
		// =====================================================

		switch (issue.action)
		{
			case addin.fbaConstants.CHECK_ACTION_INIT:
				summary.init++;
				break;

			case addin.fbaConstants.CHECK_ACTION_COMPLETE:
				summary.complete++;
				break;

			case addin.fbaConstants.CHECK_ACTION_REPAIR:
				summary.repair++;
				break;

			case addin.fbaConstants.CHECK_ACTION_MANUAL_COMPLETE:
				summary.manualComplete++;
				break;

			case addin.fbaConstants.CHECK_ACTION_MANUAL_REMOVE:
				summary.manualRemove++;
				break;

			case addin.fbaConstants.CHECK_ACTION_MANUAL_MOVE:
				summary.manualMove++;
				break;

			case addin.fbaConstants.CHECK_ACTION_MAKE_TECHNICAL:
				summary.makeTechnical++;
				break;
			
			case addin.fbaConstants.CHECK_ACTION_MAKE_BUSINESS:
				summary.makeBusiness++;
				break;

			case addin.fbaConstants.CHECK_ACTION_MANUAL_REVIEW:
				summary.manualReview++;
				break;

			default:
				addin.logger.warning(
					"CHECK issue avec action inconnue"
					+ " | Code=" + (issue.code || "")
					+ " | Action=" + (issue.action || "")
				);

				break;
		}
	},

	_getNoteRequirement: function(definitionElement)
	{
		if (!definitionElement)
			return addin.fbaConstants.NOTE_REQUIREMENT_OPTIONAL;

		var value =
			addin.repositoryService.getTaggedValue(
				definitionElement,
				addin.fbaConstants.TAG_NOTE_REQUIREMENT
			);

		value = addin.utils.trim(value);

		if (
			addin.utils.equalsIgnoreCase(
				value,
				addin.fbaConstants.NOTE_REQUIREMENT_MANDATORY
			)
		)
		{
			return addin.fbaConstants.NOTE_REQUIREMENT_MANDATORY;
		}

		if (
			addin.utils.equalsIgnoreCase(
				value,
				addin.fbaConstants.NOTE_REQUIREMENT_RECOMMENDED
			)
		)
		{
			return addin.fbaConstants.NOTE_REQUIREMENT_RECOMMENDED;
		}

		return addin.fbaConstants.NOTE_REQUIREMENT_OPTIONAL;
	},


	_hasNote: function(element)
	{
		if (!element)
			return false;

		return !addin.utils.isEmpty(
			element.Notes
		);
	},


	_getNoteMissingSeverity: function(noteRequirement)
	{
		if (
			addin.utils.equalsIgnoreCase(
				noteRequirement,
				addin.fbaConstants.NOTE_REQUIREMENT_MANDATORY
			)
		)
		{
			return addin.fbaConstants.CHECK_SEVERITY_ERROR;
		}

		if (
			addin.utils.equalsIgnoreCase(
				noteRequirement,
				addin.fbaConstants.NOTE_REQUIREMENT_RECOMMENDED
			)
		)
		{
			return addin.fbaConstants.CHECK_SEVERITY_WARNING;
		}

		return "";
	},

	// ============================================================
	// _getArtifactCounterTagName
	// ============================================================

	_getArtifactCounterTagName: function(prefix)
	{
		prefix =
			addin.utils.trim(
				prefix
			);


		if (
			addin.utils.isEmpty(
				prefix
			)
		)
		{
			return "";
		}


		return addin.fbaConstants.TAG_LAST_ARTIFACT_NUMBER_PREFIX
			+ prefix;
	},


	// ============================================================
	// _getLastArtifactNumber
	//
	// Retourne le plus grand numéro connu entre :
	//
	// - le Tagged Value du package
	// - les artefacts réellement présents
	//
	// Répare le Tagged Value si nécessaire.
	// ============================================================

	_getLastArtifactNumber: function(
		analysisPackage,
		prefix)
	{
		if (
			!analysisPackage ||
			!analysisPackage.Element ||
			addin.utils.isEmpty(prefix)
		)
		{
			return 0;
		}


		var tagName =
			this._getArtifactCounterTagName(
				prefix
			);


		var tagValue =
			addin.repositoryService.getTaggedValue(
				analysisPackage.Element,
				tagName
			);


		var storedNumber =
			0;


		if (
			!addin.utils.isEmpty(
				tagValue
			)
		)
		{
			storedNumber =
				parseInt(
					tagValue,
					10
				);


			if (
				isNaN(storedNumber) ||
				storedNumber < 0
			)
			{
				storedNumber =
					0;
			}
		}


		// ========================================================
		// MODELE REEL
		// ========================================================

		var scannedNumber =
			this._scanMaxArtifactNumber(
				analysisPackage,
				prefix
			);


		var lastNumber =
			storedNumber;


		if (
			scannedNumber >
			lastNumber
		)
		{
			lastNumber =
				scannedNumber;
		}


		// ========================================================
		// AUTO-REPARATION
		// ========================================================

		if (
			addin.utils.isEmpty(tagValue) ||
			storedNumber != lastNumber
		)
		{
			addin.repositoryService.setTaggedValue(
				analysisPackage.Element,
				tagName,
				String(lastNumber)
			);


			addin.logger.debug(
				"Compteur d'artefact initialisé/réparé"
				+ " | Package=" + analysisPackage.Name
				+ " | Prefix=" + prefix
				+ " | Number=" + lastNumber
			);
		}


		return lastNumber;
	},


	// ============================================================
	// _isArtifactNumberUsed
	// ============================================================

	_isArtifactNumberUsed: function(
		analysisPackage,
		prefix,
		number)
	{
		if (
			!analysisPackage ||
			addin.utils.isEmpty(prefix) ||
			number <= 0
		)
		{
			return false;
		}


		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			var existingNumber =
				this._extractArtifactNumber(
					element.Name,
					prefix
				);


			if (
				existingNumber ==
				number
			)
			{
				return true;
			}
		}


		return false;
	},


	// ============================================================
	// _reserveNextArtifactNumber
	//
	// Retourne et réserve le prochain numéro disponible.
	//
	// Le compteur n'est jamais utilisé aveuglément :
	// le package est vérifié avant attribution.
	// ============================================================

	_reserveNextArtifactNumber: function(
		analysisPackage,
		prefix)
	{
		if (
			!analysisPackage ||
			!analysisPackage.Element ||
			addin.utils.isEmpty(prefix)
		)
		{
			return 0;
		}


		var lastNumber =
			this._getLastArtifactNumber(
				analysisPackage,
				prefix
			);


		var nextNumber =
			lastNumber + 1;


		// ========================================================
		// SECURITE ANTI-COLLISION
		// ========================================================

		while (
			this._isArtifactNumberUsed(
				analysisPackage,
				prefix,
				nextNumber
			)
		)
		{
			nextNumber++;
		}


		var tagName =
			this._getArtifactCounterTagName(
				prefix
			);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			tagName,
			String(nextNumber)
		);


		addin.logger.debug(
			"Numéro d'artefact réservé"
			+ " | Package=" + analysisPackage.Name
			+ " | Prefix=" + prefix
			+ " | Number=" + nextNumber
		);


		return nextNumber;
	},


	// ============================================================
	// _formatArtifactNumber
	// ============================================================

	_formatArtifactNumber: function(number)
	{
		var value =
			String(number);


		while (
			value.length < 3
		)
		{
			value =
				"0" + value;
		}


		return value;
	},
	
	// ============================================================
	// _createTechnicalArtifact
	//
	// Crée explicitement une nouvelle instance technique
	// d'un artefact défini par le métamodèle.
	//
	// IMPORTANT :
	// - aucune recherche d'artefact existant ;
	// - aucun rattachement d'un artefact analyste ;
	// - une nouvelle instance est toujours créée.
	//
	// Cette primitive peut donc être utilisée pour construire
	// le contenu initial d'un nouveau diagramme technique.
	// ============================================================

	_createTechnicalArtifact: function(
		analysisPackage,
		analysisDefinition,
		artifactDefinition)
	{
		if (
			!analysisPackage ||
			!analysisDefinition ||
			!artifactDefinition
		)
		{
			return null;
		}


		var tags =
			artifactDefinition.taggedValues || {};


		// ========================================================
		// NUMEROTATION
		// ========================================================

		var prefix =
			addin.utils.trim(
				tags[
					addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
				]
			);


		var artifactNumber =
			0;


		if (
			!addin.utils.isEmpty(
				prefix
			)
		)
		{
			artifactNumber =
				this._reserveNextArtifactNumber(
					analysisPackage,
					prefix
				);
		}


		var artifactName =
			this._buildGeneratedArtifactName(
				analysisDefinition,
				artifactDefinition,
				artifactNumber
			);


		// ========================================================
		// CREATION
		// ========================================================

		addin.logger.info(
			"Création artefact technique"
			+ " | Package=" + analysisPackage.Name
			+ " | Nom=" + artifactName
			+ " | Type=" + artifactDefinition.elementType
			+ " | Stereo=" + artifactDefinition.stereotype
		);


		if (
			!addin.utils.startsWith(
				artifactName,
				addin.fbaConstants.TECHNICAL_NAME_PREFIX
			)
		)
		{
			artifactName =
				addin.fbaConstants.TECHNICAL_NAME_PREFIX
				+ artifactName;
		}


		var artifact =
			analysisPackage.Elements.AddNew(
				artifactName,
				artifactDefinition.elementType
			);


		if (!artifact)
		{
			addin.logger.error(
				"Impossible de créer l'artefact technique"
				+ " | Nom=" + artifactName
			);

			return null;
		}


		// ========================================================
		// STEREOTYPE
		// ========================================================

		if (
			!addin.utils.isEmpty(
				artifactDefinition.stereotype
			)
		)
		{
			artifact.StereotypeEx =
				artifactDefinition.stereotype;
		}


		if (!artifact.Update())
		{
			addin.logger.error(
				"Impossible de sauvegarder l'artefact technique"
				+ " | Nom=" + artifactName
			);

			return null;
		}


		analysisPackage.Elements.Refresh();


		// ========================================================
		// TAGS DU METAMODELE
		// ========================================================

		addin.repositoryService.applyTaggedValues(
			artifact,
			artifactDefinition.taggedValues,
			[]
		);


		// ========================================================
		// IDENTITE / ETAT FRAMEWORK
		// ========================================================

		if (
			!addin.utils.isEmpty(
				artifactDefinition.prototypeGuid
			)
		)
		{
			addin.repositoryService.setTaggedValue(
				artifact,
				addin.fbaConstants.TAG_SOURCE_ARTIFACT_DEFINITION_GUID,
				artifactDefinition.prototypeGuid
			);
		}


		addin.repositoryService.setTaggedValue(
			artifact,
			addin.fbaConstants.TAG_TECHNICAL,
			"true"
		);


		addin.logger.info(
			"Artefact technique créé"
			+ " | Nom=" + artifact.Name
			+ " | GUID=" + artifact.ElementGUID
			+ " | DefinitionGUID="
			+ artifactDefinition.prototypeGuid
		);


		return artifact;
	},
		
	// ============================================================
	// _findArtifactsByTypeAndStereotype
	// ============================================================

	_findArtifactsByTypeAndStereotype: function(
		analysisPackage,
		elementType,
		stereotype)
	{
		var result = [];


		if (
			!analysisPackage ||
			addin.utils.isEmpty(elementType)
		)
		{
			return result;
		}


		var expectedType =
			addin.utils.trim(
				elementType
			);


		var expectedStereotype =
			addin.utils.trim(
				stereotype
			);


		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			if (!element)
				continue;


			var currentType =
				addin.utils.trim(
					element.Type
				);


			var currentStereotype =
				addin.utils.trim(
					element.StereotypeEx
				);


			if (
				!addin.utils.equalsIgnoreCase(
					currentType,
					expectedType
				)
			)
			{
				continue;
			}


			if (
				!addin.utils.equalsIgnoreCase(
					currentStereotype,
					expectedStereotype
				)
			)
			{
				continue;
			}


			addin.logger.debug(
				"Diagnostic artefact compatible"
				+ " | TargetPackage=" + analysisPackage.Name
				+ " | TargetPackageID=" + analysisPackage.PackageID
				+ " | TargetPackageGUID=" + analysisPackage.PackageGUID
				+ " | Element=" + element.Name
				+ " | ElementID=" + element.ElementID
				+ " | ElementGUID=" + element.ElementGUID
				+ " | ElementPackageID=" + element.PackageID
			);


			result.push(
				element
			);
		}


		return result;
	},


	// ============================================================
	// _findUnattachedCompatibleArtifacts
	//
	// Recherche les artefacts compatibles avec une définition
	// mais qui ne sont pas encore rattachés à une définition
	// d'artefact du métamodèle.
	// ============================================================

	_findUnattachedCompatibleArtifacts: function(
		analysisPackage,
		artifactDefinition)
	{
		var result = [];


		if (
			!analysisPackage ||
			!artifactDefinition
		)
		{
			return result;
		}


		var compatibleArtifacts =
			this._findArtifactsByTypeAndStereotype(
				analysisPackage,
				artifactDefinition.elementType,
				artifactDefinition.stereotype
			);


		for (
			var i = 0;
			i < compatibleArtifacts.length;
			i++
		)
		{
			var artifact =
				compatibleArtifacts[i];


			var sourceDefinitionGuid =
				addin.repositoryService.getTaggedValue(
					artifact,
					addin.fbaConstants
						.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
				);


			if (
				addin.utils.isEmpty(
					sourceDefinitionGuid
				)
			)
			{
				result.push(
					artifact
				);
			}
		}


		return result;
	},
		
	// ============================================================
	// _ensureArtifact
	//
	// Ordre de résolution :
	//
	// 1. Recherche par DefinitionGUID
	//
	// 2. Recherche d'un artefact compatible non rattaché
	//    Type + StereotypeEx
	//
	//    - 1 candidat  → rattachement
	//    - >1 candidat → ambiguïté, aucune sélection automatique
	//
	// 3. Aucun candidat → création
	// ============================================================

	_ensureArtifact: function(
		analysisPackage,
		analysisDefinition,
		artifactDefinition)
	{
		if (
			!analysisPackage ||
			!analysisDefinition ||
			!artifactDefinition
		)
		{
			return null;
		}


		// ========================================================
		// 1. RECHERCHE PAR DEFINITION DU METAMODELE
		// ========================================================

		var artifact =
			this._findArtifactByDefinitionGuid(
				analysisPackage,
				artifactDefinition.prototypeGuid
			);


		if (artifact)
		{
			addin.logger.debug(
				"Artefact déjà rattaché au métamodèle"
				+ " | Package=" + analysisPackage.Name
				+ " | Nom=" + artifact.Name
				+ " | GUID=" + artifact.ElementGUID
				+ " | DefinitionGUID="
				+ artifactDefinition.prototypeGuid
			);
		}


		// ========================================================
		// 2. RECHERCHE D'UN ARTEFACT EXISTANT COMPATIBLE
		// ========================================================

		if (!artifact)
		{
			var compatibleArtifacts =
				this._findUnattachedCompatibleArtifacts(
					analysisPackage,
					artifactDefinition
				);


			// ====================================================
			// UN SEUL CANDIDAT
			// → rattachement automatique
			// ====================================================

			if (
				compatibleArtifacts.length == 1
			)
			{
				artifact =
					compatibleArtifacts[0];


				addin.logger.info(
					"Artefact existant compatible détecté"
					+ " | Package=" + analysisPackage.Name
					+ " | Nom=" + artifact.Name
					+ " | Type=" + artifact.Type
					+ " | Stereo=" + artifact.StereotypeEx
					+ " | GUID=" + artifact.ElementGUID
				);


				addin.logger.info(
					"Rattachement de l'artefact existant"
					+ " au métamodèle"
					+ " | Nom=" + artifact.Name
					+ " | DefinitionGUID="
					+ artifactDefinition.prototypeGuid
				);
			}


			// ====================================================
			// PLUSIEURS CANDIDATS
			// → aucune sélection automatique
			// ====================================================

			else if (
				compatibleArtifacts.length > 1
			)
			{
				addin.logger.warning(
					"Plusieurs artefacts compatibles"
					+ " non rattachés détectés"
					+ " | Package=" + analysisPackage.Name
					+ " | Type=" + artifactDefinition.elementType
					+ " | Stereo=" + artifactDefinition.stereotype
					+ " | Nombre=" + compatibleArtifacts.length
				);


				for (
					var c = 0;
					c < compatibleArtifacts.length;
					c++
				)
				{
					addin.logger.debug(
						"Candidat au rattachement"
						+ " | Nom=" + compatibleArtifacts[c].Name
						+ " | GUID="
						+ compatibleArtifacts[c].ElementGUID
					);
				}


				return null;
			}
		}


		// ========================================================
		// 3. CREATION UNIQUEMENT SI AUCUN COMPATIBLE
		// ========================================================

		if (!artifact)
		{
			var tags =
				artifactDefinition.taggedValues || {};


			var prefix =
				addin.utils.trim(
					tags[
						addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
					]
				);


			var artifactNumber =
				0;


			if (
				!addin.utils.isEmpty(
					prefix
				)
			)
			{
				artifactNumber =
					this._reserveNextArtifactNumber(
						analysisPackage,
						prefix
					);
			}


			var artifactName =
				this._buildGeneratedArtifactName(
					analysisDefinition,
					artifactDefinition,
					artifactNumber
				);


			addin.logger.info(
				"Création artefact d'analyse"
				+ " | Package=" + analysisPackage.Name
				+ " | Nom=" + artifactName
				+ " | Prefix=" + prefix
				+ " | Number=" + artifactNumber
				+ " | Type=" + artifactDefinition.elementType
				+ " | Stereo=" + artifactDefinition.stereotype
			);


			artifact =
				analysisPackage.Elements.AddNew(
					artifactName,
					artifactDefinition.elementType
				);


			if (!artifact)
			{
				addin.logger.error(
					"Impossible de créer l'artefact"
					+ " | Nom=" + artifactName
				);

				return null;
			}


			if (
				!addin.utils.isEmpty(
					artifactDefinition.stereotype
				)
			)
			{
				artifact.StereotypeEx =
					artifactDefinition.stereotype;
			}


			if (!artifact.Update())
			{
				addin.logger.error(
					"Impossible de sauvegarder l'artefact"
					+ " | Nom=" + artifactName
				);

				return null;
			}


			analysisPackage.Elements.Refresh();
		}


		// ========================================================
		// 4. TAGS DU METAMODELE
		// ========================================================

		addin.repositoryService.applyTaggedValues(
			artifact,
			artifactDefinition.taggedValues,
			[]
		);


		// ========================================================
		// 5. IDENTITE / RATTACHEMENT TECHNIQUE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			artifact,
			addin.fbaConstants
				.TAG_SOURCE_ARTIFACT_DEFINITION_GUID,
			artifactDefinition.prototypeGuid
		);


		addin.repositoryService.setTaggedValue(
			artifact,
			addin.fbaConstants.TAG_TECHNICAL,
			"true"
		);


		addin.logger.debug(
			"Artefact d'analyse synchronisé"
			+ " | Package=" + analysisPackage.Name
			+ " | Nom=" + artifact.Name
			+ " | GUID=" + artifact.ElementGUID
			+ " | DefinitionGUID="
			+ artifactDefinition.prototypeGuid
		);


		return artifact;
	},
	
	_countArtifactNumberUsage: function(
		analysisPackage,
		prefix,
		number)
	{
		if (
			!analysisPackage ||
			addin.utils.isEmpty(prefix) ||
			number <= 0
		)
		{
			return 0;
		}


		var count =
			0;


		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			var existingNumber =
				this._extractArtifactNumber(
					element.Name,
					prefix
				);


			if (
				existingNumber ==
				number
			)
			{
				count++;
			}
		}


		return count;
	},
		
	_repairArtifactNumberIfNeeded: function(
		analysisPackage,
		artifact,
		prefix)
	{
		if (
			!analysisPackage ||
			!artifact ||
			addin.utils.isEmpty(prefix)
		)
		{
			return false;
		}


		var currentNumber =
			this._extractArtifactNumber(
				artifact.Name,
				prefix
			);


		// ========================================================
		// PAS DE NUMERO RECONNU
		//
		// L'analyste a éventuellement renommé volontairement
		// l'artefact : on ne touche à rien.
		// ========================================================

		if (
			currentNumber <= 0
		)
		{
			return false;
		}


		// ========================================================
		// COMPTAGE DES UTILISATIONS DU NUMERO
		// ========================================================

		var usageCount =
			this._countArtifactNumberUsage(
				analysisPackage,
				prefix,
				currentNumber
			);


		// Numéro unique : aucune correction.

		if (
			usageCount <= 1
		)
		{
			return false;
		}


		// ========================================================
		// NUMERO EN DOUBLON
		// ========================================================

		var nextNumber =
			this._reserveNextArtifactNumber(
				analysisPackage,
				prefix
			);


		if (
			nextNumber <= 0
		)
		{
			return false;
		}


		// ========================================================
		// CONSERVATION DU SUFFIXE
		//
		// BSN001 - Besoin
		// devient par exemple
		// BSN002 - Besoin
		// ========================================================

		var oldName =
			artifact.Name;


		var separatorPosition =
			oldName.indexOf(
				" - "
			);


		var suffix =
			"";


		if (
			separatorPosition >= 0
		)
		{
			suffix =
				oldName.substring(
					separatorPosition
				);
		}


		var newName =
			prefix
			+ this._formatArtifactNumber(
				nextNumber
			)
			+ suffix;


		artifact.Name =
			newName;


		if (
			!artifact.Update()
		)
		{
			addin.logger.error(
				"Impossible de renuméroter l'artefact"
				+ " | Ancien=" + oldName
				+ " | Nouveau=" + newName
			);

			return false;
		}


		analysisPackage.Elements.Refresh();


		addin.logger.info(
			"Numéro d'artefact corrigé"
			+ " | Package=" + analysisPackage.Name
			+ " | Ancien=" + oldName
			+ " | Nouveau=" + newName
			+ " | Prefix=" + prefix
			+ " | Number=" + nextNumber
		);


		return true;
	},
		
	_findMatchingCreatedArtifact: function(
		createdArtifacts,
		diagramArtifactDefinition,
		artifactDefinitions)
	{
		
		addin.logger.info(
			"DEBUG MATCH ARTIFACT"
			+ " | ExpectedType="
			+ diagramArtifactDefinition.type
			+ " | ExpectedStereo="
			+ diagramArtifactDefinition.stereotype
			+ " | ArtifactDefinitions="
			+ artifactDefinitions.length
		);

		for (
			var debugIndex = 0;
			debugIndex < artifactDefinitions.length;
			debugIndex++
		)
		{
			var debugDefinition =
				artifactDefinitions[debugIndex];

			addin.logger.info(
				"DEBUG MATCH DEF #" + (debugIndex + 1)
				+ " | Type="
				+ debugDefinition.elementType
				+ " | Stereo="
				+ debugDefinition.stereotype
				+ " | PrototypeGUID="
				+ debugDefinition.prototypeGuid
			);
		}
		
		
		if (
			!createdArtifacts ||
			!diagramArtifactDefinition ||
			!artifactDefinitions
		)
		{
			return null;
		}


		var expectedType =
			addin.utils.trim(
				diagramArtifactDefinition.type
			);


		var expectedStereotype =
			addin.utils.trim(
				diagramArtifactDefinition.stereotype
			);


		// ========================================================
		// DEFINITION CANONIQUE
		//
		// Le prototype du diagramme fournit :
		//
		//     Type + Stereotype
		//
		// Le discriminant provient de la définition d'artefact
		// "Modeled by" de l'objet d'analyse.
		// ========================================================

		var canonicalDefinition =
			null;


		var canonicalCount =
			0;


		for (
			var d = 0;
			d < artifactDefinitions.length;
			d++
		)
		{
			var artifactDefinition =
				artifactDefinitions[d];


			if (!artifactDefinition)
				continue;


			if (
				!addin.utils.equalsIgnoreCase(
					artifactDefinition.elementType,
					expectedType
				)
			)
			{
				continue;
			}


			if (
				!addin.utils.equalsIgnoreCase(
					artifactDefinition.stereotype,
					expectedStereotype
				)
			)
			{
				continue;
			}


			canonicalDefinition =
				artifactDefinition;


			canonicalCount++;
		}


		// ========================================================
		// DEFINITION ABSENTE OU AMBIGUE
		// ========================================================

		if (
			canonicalCount != 1 ||
			!canonicalDefinition
		)
		{
			addin.logger.warning(
				"Définition canonique d'artefact ambiguë ou absente"
				+ " | Type=" + expectedType
				+ " | Stereo=" + expectedStereotype
				+ " | Nombre=" + canonicalCount
			);


			return null;
		}


		// ========================================================
		// DISCRIMINANT ATTENDU
		// ========================================================

		var expectedDiscriminator =
			addin.utils.trim(
				canonicalDefinition.taggedValues[
					addin.fbaConstants
						.TAG_STEREOTYPE_DISCRIMINATOR
				]
			);


		// ========================================================
		// RECHERCHE DE L'ARTEFACT
		//
		// Identité sémantique complète :
		//
		// Type
		// + Stereotype
		// + Discriminator
		// ========================================================

		for (
			var i = 0;
			i < createdArtifacts.length;
			i++
		)
		{
			var artifact =
				createdArtifacts[i];


			if (!artifact)
				continue;


			var currentType =
				addin.utils.trim(
					artifact.Type
				);


			var currentStereotype =
				addin.utils.trim(
					artifact.StereotypeEx
				);


			var currentDiscriminator =
				addin.utils.trim(
					addin.repositoryService
						.getTaggedValue(
							artifact,
							addin.fbaConstants
								.TAG_STEREOTYPE_DISCRIMINATOR
						)
				);


			if (
				!addin.utils.equalsIgnoreCase(
					currentType,
					expectedType
				)
			)
			{
				continue;
			}


			if (
				!addin.utils.equalsIgnoreCase(
					currentStereotype,
					expectedStereotype
				)
			)
			{
				continue;
			}


			if (
				!addin.utils.equalsIgnoreCase(
					currentDiscriminator,
					expectedDiscriminator
				)
			)
			{
				continue;
			}


			addin.logger.debug(
				"Artefact technique correspondant trouvé"
				+ " | Nom=" + artifact.Name
				+ " | Type=" + currentType
				+ " | Stereo=" + currentStereotype
				+ " | Discriminator=" + currentDiscriminator
			);


			return artifact;
		}


		return null;
	},

	synchronizePackages: function(targetPackage)
	{
		if (!targetPackage)
		{
			addin.logger.error(
				"Package cible non renseigné."
			);

			return false;
		}


		addin.logger.info(
			"============================================================"
		);

		addin.logger.info(
			"Début génération structure d'analyse"
			+ " | Parent=" + targetPackage.Name
			+ " | GUID=" + targetPackage.PackageGUID
		);

		addin.logger.info(
			"============================================================"
		);


		var definitions =
			this._getOperationDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			addin.logger.warning(
				"Aucune définition d'analyse trouvée."
			);

			return true;
		}


		var count =
			0;


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			var definition =
				definitions[i];


			var analysisPackage =
				this._ensurePackage(
					targetPackage,
					definition
				);


			if (analysisPackage)
			{
				count++;
			}
		}


		targetPackage.Packages.Refresh();


		addin.logger.info(
			"Structure d'analyse synchronisée"
			+ " | Packages=" + count
		);


		addin.logger.info(
			"============================================================"
		);

		addin.logger.info(
			"Fin génération structure d'analyse"
		);

		addin.logger.info(
			"============================================================"
		);


		return true;
	},
	
	_ensureTechnicalPackage: function(
		parentPackage,
		packageDefinition)
	{
		if (
			!parentPackage ||
			!packageDefinition
		)
		{
			return null;
		}


		var currentPackage =
			addin.repositoryService
				.findDirectChildPackageByNameIncludingTechnical(
					parentPackage,
					packageDefinition.name
				);


		// ========================================================
		// CREATION
		// ========================================================

		if (!currentPackage)
		{
			addin.logger.info(
				"Création package technique"
				+ " | Parent=" + parentPackage.Name
				+ " | Nom=" + packageDefinition.name
			);


			currentPackage =
				parentPackage.Packages.AddNew(
					packageDefinition.name,
					""
				);


			if (!currentPackage)
			{
				addin.logger.error(
					"Impossible de créer le package technique"
					+ " | Nom=" + packageDefinition.name
				);

				return null;
			}


			if (!currentPackage.Update())
			{
				addin.logger.error(
					"Erreur Update package technique"
					+ " | Nom=" + packageDefinition.name
				);

				return null;
			}


			//parentPackage.Packages.Refresh();
		}


		// ========================================================
		// SOUS-PACKAGES
		// ========================================================

		var children =
			packageDefinition.children || [];


		for (
			var i = 0;
			i < children.length;
			i++
		)
		{
			this._ensureTechnicalPackage(
				currentPackage,
				children[i]
			);
		}


		return currentPackage;
	},
		
	_ensureLibrary: function(rootPackage)
	{
		if (!rootPackage)
		{
			return null;
		}


		var libraryPackage =
			addin.repositoryService
				.findDirectChildPackageByNameIncludingTechnical(
					rootPackage,
					addin.fbaConstants.LIBRARY_PACKAGE_NAME
				);


		// ========================================================
		// CREATION LIBRAIRIE
		// ========================================================

		if (!libraryPackage)
		{
			addin.logger.info(
				"Création de la librairie"
				+ " | Root=" + rootPackage.Name
			);


			libraryPackage =
				rootPackage.Packages.AddNew(
					addin.fbaConstants.LIBRARY_PACKAGE_NAME,
					""
				);


			if (!libraryPackage)
			{
				addin.logger.error(
					"Impossible de créer "
					+ addin.fbaConstants.LIBRARY_PACKAGE_NAME
				);

				return null;
			}


			if (!libraryPackage.Update())
			{
				addin.logger.error(
					"Erreur Update "
					+ addin.fbaConstants.LIBRARY_PACKAGE_NAME
				);

				return null;
			}


			//rootPackage.Packages.Refresh();
		}


		// ========================================================
		// STRUCTURE INTERNE
		// ========================================================

		for (
			var i = 0;
			i < addin.fbaConstants.LIBRARY_STRUCTURE.length;
			i++
		)
		{
			this._ensureTechnicalPackage(
				libraryPackage,
				addin.fbaConstants.LIBRARY_STRUCTURE[i]
			);
		}


		addin.logger.info(
			"Librairie synchronisée"
			+ " | Package=" + libraryPackage.Name
		);


		return libraryPackage;
	},
		
	_ensureArtifactOnDiagram: function(
		diagram,
		artifact)
	{
		if (
			!diagram ||
			!artifact
		)
		{
			return false;
		}


		var diagramObjects =
			diagram.DiagramObjects;


		// ========================================================
		// DEJA PRESENT
		// ========================================================

		for (
			var i = 0;
			i < diagramObjects.Count;
			i++
		)
		{
			var existing =
				diagramObjects.GetAt(i);


			if (
				existing.ElementID ==
				artifact.ElementID
			)
			{
				return true;
			}
		}


		// ========================================================
		// AJOUT
		// ========================================================

		var diagramObject =
			diagramObjects.AddNew(
				"",
				""
			);


		if (!diagramObject)
		{
			addin.logger.warning(
				"Impossible d'ajouter l'artefact au diagramme"
				+ " | Diagramme=" + diagram.Name
				+ " | Artefact=" + artifact.Name
			);

			return false;
		}


		diagramObject.ElementID =
			artifact.ElementID;


		if (!diagramObject.Update())
		{
			return false;
		}


		diagramObjects.Refresh();

		diagram.Update();


		addin.logger.debug(
			"Artefact ajouté au diagramme"
			+ " | Diagramme=" + diagram.Name
			+ " | Artefact=" + artifact.Name
		);


		return true;
	},
		
	_getDefaultDiagramType: function(
		analysisDefinition)
	{
		return addin.fbaConstants
			.DEFAULT_ANALYSIS_DIAGRAM_TYPE;
	},


	_resolveDiagramType: function(
		analysisDefinition)
	{
		if (
			!analysisDefinition ||
			!analysisDefinition.element
		)
		{
			return this._getDefaultDiagramType(
				analysisDefinition
			);
		}


		var diagramType =
			addin.repositoryService
				.getTaggedValue(
					analysisDefinition.element,
					addin.fbaConstants.TAG_DIAGRAM_TYPE
				);


		if (
			!addin.utils.isEmpty(
				diagramType
			)
		)
		{
			return diagramType;
		}


		return this._getDefaultDiagramType(
			analysisDefinition
		);
	},
		
	_ensureAnalysisDiagram: function(
		analysisPackage,
		analysisDefinition)
	{
		if (
			!analysisPackage ||
			!analysisDefinition
		)
		{
			return null;
		}


		var diagramName =
			analysisDefinition.name;


		var diagrams =
			analysisPackage.Diagrams;


		// ========================================================
		// EXISTANT
		// ========================================================

		for (
			var i = 0;
			i < diagrams.Count;
			i++
		)
		{
			var diagram =
				diagrams.GetAt(i);


			if (
				addin.utils.equalsIgnoreCase(
					diagram.Name,
					diagramName
				)
			)
			{
				return diagram;
			}
		}


		// ========================================================
		// CREATION
		// ========================================================

		var diagramType =
			this._resolveDiagramType(
				analysisDefinition
			);


		addin.logger.info(
			"Création diagramme d'analyse"
			+ " | Package=" + analysisPackage.Name
			+ " | Nom=" + diagramName
			+ " | Type=" + diagramType
		);


		var newDiagram =
			diagrams.AddNew(
				diagramName,
				diagramType
			);


		if (!newDiagram)
		{
			addin.logger.error(
				"Impossible de créer le diagramme"
				+ " | Nom=" + diagramName
				+ " | Type=" + diagramType
			);

			return null;
		}


		if (!newDiagram.Update())
		{
			addin.logger.error(
				"Impossible de sauvegarder le diagramme"
				+ " | Nom=" + diagramName
			);

			return null;
		}


		diagrams.Refresh();


		return newDiagram;
	},
		
	_isDiagramConfig: function(element)
	{
		if (!element)
		{
			return false;
		}


		var role =
			addin.repositoryService
				.getTaggedValue(
					element,
					addin.fbaConstants.TAG_FRAMEWORK_ROLE
				);


		return addin.utils.equalsIgnoreCase(
			role,
			addin.fbaConstants.ROLE_DIAGRAM_CONFIG
		);
	},
		
	_loadDiagramConfigs: function(diagram)
	{
		var result = [];


		if (!diagram)
		{
			return result;
		}


		var diagramObjects =
			diagram.DiagramObjects;


		for (
			var i = 0;
			i < diagramObjects.Count;
			i++
		)
		{
			var diagramObject =
				diagramObjects.GetAt(i);


			var element =
				addin.repositoryService
					.getElementById(
						diagramObject.ElementID
					);


			if (
				!this._isDiagramConfig(
					element
				)
			)
			{
				continue;
			}


			var importanceLevel =
				addin.repositoryService
					.getTaggedValue(
						element,
						addin.fbaConstants.TAG_IMPORTANT_LEVEL
					);


			var priority =
				addin.repositoryService
					.getTaggedValue(
						element,
						addin.fbaConstants.TAG_DIAGRAM_CONFIG_PRIORITY
					);


			var defaultValue =
				addin.repositoryService
					.getTaggedValue(
						element,
						addin.fbaConstants.TAG_DIAGRAM_CONFIG_DEFAULT
					);


			var defaultName =
				addin.repositoryService
					.getTaggedValue(
						element,
						addin.fbaConstants.TAG_DIAGRAM_DEFAULT_NAME
					);


			var namePrefix =
				addin.repositoryService
					.getTaggedValue(
						element,
						addin.fbaConstants.TAG_DIAGRAM_NAME_PREFIX
					);


			var priorityNumber =
				parseInt(
					priority,
					10
				);


			if (
				isNaN(
					priorityNumber
				)
			)
			{
				priorityNumber = 0;
			}


			result.push(
				{
					element:
						element,

					guid:
						element.ElementGUID,

					name:
						addin.utils.trim(
							element.Name
						),

					priority:
						priorityNumber,

					isDefault:
						addin.utils.equalsIgnoreCase(
							defaultValue,
							"true"
						),

					defaultName:
						addin.utils.trim(
							defaultName
						),

					namePrefix:
						addin.utils.trim(
							namePrefix
						),

					importanceLevel:
						addin.utils.trim(
							importanceLevel
						)
				}
			);
		}


		return result;
	},
		
		
	_loadDiagramArtifactDefinitions: function(sourceDiagram)
	{
		var result = [];


		if (!sourceDiagram)
		{
			return result;
		}


		var diagramObjects =
			sourceDiagram.DiagramObjects;


		for (
			var i = 0;
			i < diagramObjects.Count;
			i++
		)
		{
			var diagramObject =
				diagramObjects.GetAt(i);


			if (!diagramObject)
			{
				continue;
			}


			var element =
				addin.repositoryService
					.getElementById(
						diagramObject.ElementID
					);


			if (!element)
			{
				continue;
			}


			// ====================================================
			// CONFIGURATION DU DIAGRAMME
			// ====================================================

			if (
				this._isDiagramConfig(
					element
				)
			)
			{
				continue;
			}


			// ====================================================
			// DEFINITION D'ARTEFACT
			// ====================================================

			var definition =
			{
				element:
					element,

				guid:
					element.ElementGUID,

				name:
					addin.utils.trim(
						element.Name
					),

				type:
					addin.utils.trim(
						element.Type
					),

				stereotype:
					addin.utils.trim(
						element.StereotypeEx
					)
			};


			result.push(
				definition
			);


			addin.logger.debug(
				"Artefact autorisé sur diagramme"
				+ " | Diagramme=" + sourceDiagram.Name
				+ " | Prototype=" + definition.name
				+ " | Type=" + definition.type
				+ " | Stereo=" + definition.stereotype
				+ " | GUID=" + definition.guid
			);
		}


		addin.logger.debug(
			"Types d'artefacts du diagramme chargés"
			+ " | Diagramme=" + sourceDiagram.Name
			+ " | Nombre=" + result.length
		);


		return result;
	},
	
	_loadDiagramDefinitions: function(sourceElement)
	{
		var result = [];


		if (!sourceElement)
		{
			return result;
		}


		var diagrams =
			sourceElement.Diagrams;


		for (
			var i = 0;
			i < diagrams.Count;
			i++
		)
		{
			var diagram =
				diagrams.GetAt(i);


			// ====================================================
			// DIAGRAMME TECHNIQUE
			// ====================================================

			if (
				addin.utils.isTechnicalName(
					diagram.Name
				)
			)
			{
				continue;
			}


			var configs =
				this._loadDiagramConfigs(
					diagram
				);


			if (
				configs.length == 0
			)
			{
				addin.logger.error(
					"Diagramme du métamodèle sans Diagram_Config"
					+ " | Diagramme=" + diagram.Name
					+ " | GUID=" + diagram.DiagramGUID
				);

				continue;
			}


			result.push(
				{
					diagram:
						diagram,

					guid:
						diagram.DiagramGUID,

					name:
						addin.utils.trim(
							diagram.Name
						),

					type:
						diagram.Type,

					metaType:
						diagram.MetaType,

					configs:
						configs
				}
			);


			addin.logger.debug(
				"Définition de diagramme chargée"
				+ " | Diagramme=" + diagram.Name
				+ " | Type=" + diagram.Type
				+ " | MetaType=" + diagram.MetaType
				+ " | Configs=" + configs.length
				+ " | GUID=" + diagram.DiagramGUID
			);
		}


		return result;
	},
		
	_isDiagramRequired: function(diagramDefinition)
	{
		if (
			!diagramDefinition ||
			!diagramDefinition.configs
		)
		{
			return false;
		}


		for (
			var i = 0;
			i < diagramDefinition.configs.length;
			i++
		)
		{
			var config =
				diagramDefinition.configs[i];


			if (
				addin.utils.equalsIgnoreCase(
					config.importanceLevel,
					"Obligatoire"
				)
			)
			{
				return true;
			}
		}


		return false;
	},
		
	_resolveEffectiveDiagramConfig: function(diagramDefinition)
	{
		if (
			!diagramDefinition ||
			!diagramDefinition.configs ||
			diagramDefinition.configs.length == 0
		)
		{
			addin.logger.debug(
				"Aucune configuration effective de diagramme"
				+ " | Diagramme="
				+ (
					diagramDefinition
						? diagramDefinition.name
						: ""
				)
			);

			return null;
		}


		var configs =
			diagramDefinition.configs;


		var effectiveConfig =
		{
			importanceLevel:
				"",

			defaultName:
				"",

			namePrefix:
				"",
			
			noteRequirement:
				addin.fbaConstants.NOTE_REQUIREMENT_OPTIONAL,

			priority:
				null,

			sourceConfigGuid:
				"",

			sourceConfigName:
				""
		};


		var importancePriority =
			-1;

		var defaultNamePriority =
			-1;

		var namePrefixPriority =
			-1;


		for (
			var i = 0;
			i < configs.length;
			i++
		)
		{
			var config =
				configs[i];


			if (!config)
			{
				continue;
			}


			var priority =
				parseInt(
					config.priority,
					10
				);


			if (
				isNaN(
					priority
				)
			)
			{
				priority = 0;
			}


			// ====================================================
			// IMPORTANCE
			// ====================================================

			if (
				!addin.utils.isEmpty(
					config.importanceLevel
				) &&
				priority > importancePriority
			)
			{
				effectiveConfig.importanceLevel =
					addin.utils.trim(
						config.importanceLevel
					);

				importancePriority =
					priority;
			}


			// ====================================================
			// NOM PAR DEFAUT
			// ====================================================

			if (
				!addin.utils.isEmpty(
					config.defaultName
				) &&
				priority > defaultNamePriority
			)
			{
				effectiveConfig.defaultName =
					addin.utils.trim(
						config.defaultName
					);

				defaultNamePriority =
					priority;
			}


			// ====================================================
			// PREFIXE
			// ====================================================

			if (
				!addin.utils.isEmpty(
					config.namePrefix
				) &&
				priority > namePrefixPriority
			)
			{
				effectiveConfig.namePrefix =
					addin.utils.trim(
						config.namePrefix
					);

				namePrefixPriority =
					priority;
			}


			// ====================================================
			// CONFIG PRINCIPALE
			// ====================================================

			if (
				effectiveConfig.priority === null ||
				priority > effectiveConfig.priority
			)
			{
				effectiveConfig.priority =
					priority;

				effectiveConfig.sourceConfigGuid =
					config.guid;

				effectiveConfig.sourceConfigName =
					config.name;


				// ------------------------------------------------
				// NOTE REQUIREMENT
				//
				// Propriété portée directement par le DGC retenu.
				// ------------------------------------------------

				var configElement =
					addin.repositoryService.getElementByGuid(
						config.guid
					);


				effectiveConfig.noteRequirement =
					this._getNoteRequirement(
						configElement
					);
			}
		}


		addin.logger.info(
			"Configuration effective de diagramme"
			+ " | Diagramme=" + diagramDefinition.name
			+ " | Importance=" + effectiveConfig.importanceLevel
			+ " | DefaultName=" + effectiveConfig.defaultName
			+ " | Prefix=" + effectiveConfig.namePrefix
			+ " | NoteRequirement=" + effectiveConfig.noteRequirement
			+ " | Priority=" + effectiveConfig.priority
			+ " | SourceConfig=" + effectiveConfig.sourceConfigName
		);


		return effectiveConfig;
	},
		
	_buildGeneratedDiagramName: function(effectiveConfig)
	{
		if (!effectiveConfig)
		{
			return "";
		}


		var prefix =
			addin.utils.trim(
				effectiveConfig.namePrefix
			);


		var defaultName =
			addin.utils.trim(
				effectiveConfig.defaultName
			);


		if (
			addin.utils.isEmpty(prefix) &&
			addin.utils.isEmpty(defaultName)
		)
		{
			return "";
		}


		if (
			addin.utils.isEmpty(prefix)
		)
		{
			return defaultName;
		}


		if (
			addin.utils.isEmpty(defaultName)
		)
		{
			return prefix;
		}


		return (
			prefix
			+ " "
			+ defaultName
		);
	},
		
	_isRequiredDiagram: function(effectiveConfig)
	{
		if (!effectiveConfig)
		{
			return false;
		}


		return addin.utils.equalsIgnoreCase(
			effectiveConfig.importanceLevel,
			"Obligatoire"
		);
	},
		
	_findDiagramByName: function(
		analysisPackage,
		diagramName)
	{
		if (
			!analysisPackage ||
			addin.utils.isEmpty(diagramName)
		)
		{
			return null;
		}


		var diagrams =
			analysisPackage.Diagrams;


		for (
			var i = 0;
			i < diagrams.Count;
			i++
		)
		{
			var diagram =
				diagrams.GetAt(i);


			if (
				diagram &&
				addin.utils.equalsIgnoreCase(
					diagram.Name,
					diagramName
				)
			)
			{
				return diagram;
			}
		}


		return null;
	},
		
	_findDiagramsByMetaType: function(
		targetPackage,
		metaType)
	{
		var result = [];


		if (
			!targetPackage ||
			addin.utils.isEmpty(metaType)
		)
		{
			return result;
		}


		for (
			var i = 0;
			i < targetPackage.Diagrams.Count;
			i++
		)
		{
			var diagram =
				targetPackage.Diagrams.GetAt(i);


			if (!diagram)
			{
				continue;
			}


			var diagramMetaType =
				addin.utils.trim(
					diagram.MetaType
				);


			if (
				diagramMetaType ==
				addin.utils.trim(metaType)
			)
			{
				addin.logger.debug(
					"Diagnostic diagramme compatible"
					+ " | TargetPackage=" + targetPackage.Name
					+ " | TargetPackageID=" + targetPackage.PackageID
					+ " | TargetPackageGUID=" + targetPackage.PackageGUID
					+ " | Diagram=" + diagram.Name
					+ " | DiagramID=" + diagram.DiagramID
					+ " | DiagramGUID=" + diagram.DiagramGUID
					+ " | DiagramPackageID=" + diagram.PackageID
				);


				result.push(
					diagram
				);
			}
		}


		return result;
	},
	
	_resolveDiagramRegistryPackage: function(
		rootPackage)
	{
		if (!rootPackage)
		{
			return null;
		}


		var libraryPackage =
			addin.repositoryService
				.findDirectChildPackageByNameIncludingTechnical(
					rootPackage,
					addin.fbaConstants.LIBRARY_PACKAGE_NAME
				);


		if (!libraryPackage)
		{
			addin.logger.warning(
				"Librairie introuvable"
				+ " | Root=" + rootPackage.Name
			);

			return null;
		}


		var registryPackage =
			addin.repositoryService
				.findDirectChildPackageByNameIncludingTechnical(
					libraryPackage,
					addin.fbaConstants.DIAGRAM_CONFIGS_PACKAGE_NAME
				);


		if (!registryPackage)
		{
			addin.logger.warning(
				"Registre des diagrammes introuvable"
				+ " | Library=" + libraryPackage.Name
			);

			return null;
		}


		return registryPackage;
	},
		
	_findDiagramRegistryEntryByGeneratedGuid: function(
		registryPackage,
		generatedDiagramGuid,
		registryIndex)
	{
		if (
			addin.utils.isEmpty(
				generatedDiagramGuid
			)
		)
		{
			return null;
		}


		var normalizedGuid =
			addin.utils.trim(
				generatedDiagramGuid
			).toLowerCase();


		// ========================================================
		// INDEX MEMOIRE
		// ========================================================

		if (
			registryIndex &&
			registryIndex.byGeneratedGuid &&
			registryIndex.byGeneratedGuid[
				normalizedGuid
			]
		)
		{
			return registryIndex.byGeneratedGuid[
				normalizedGuid
			];
		}


		// ========================================================
		// FALLBACK HISTORIQUE
		// ========================================================

		if (!registryPackage)
		{
			return null;
		}


		var elements =
			registryPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			if (!element)
			{
				continue;
			}


			var currentGuid =
				addin.repositoryService.getTaggedValue(
					element,
					addin.fbaConstants
						.TAG_GENERATED_DIAGRAM_GUID
				);


			if (
				addin.utils.equalsIgnoreCase(
					currentGuid,
					generatedDiagramGuid
				)
			)
			{
				return element;
			}
		}


		return null;
	},
		
	_repairDiagramName: function(diagram, effectiveConfig)
	{
		var issues = this._checkDiagramName(diagram, effectiveConfig);
		if (!issues || issues.length === 0)
			return true;

		var prefix = addin.utils.trim(effectiveConfig.namePrefix || "");
		var oldName = diagram.Name;
		var name = addin.utils.trim(oldName || "");
		var technicalMarker = "";

		if (name.charAt(0) === "_")
		{
			technicalMarker = "_";
			name = addin.utils.trim(name.substring(1));
		}

		// Retirer uniquement les occurrences initiales du préfixe connu.
		// Le libellé métier et le marqueur technique sont conservés.
		while (
			name.toLowerCase() === prefix.toLowerCase() ||
			name.substring(0, prefix.length + 1).toLowerCase() ===
				(prefix + " ").toLowerCase()
		)
		{
			name = addin.utils.trim(name.substring(prefix.length));
		}

		diagram.Name = technicalMarker + prefix + " " + name;

		if (!diagram.Update())
		{
			diagram.Name = oldName;
			addin.logger.error("REPAIR nom de diagramme en échec | DiagramGUID=" + diagram.DiagramGUID);
			return false;
		}

		addin.logger.info(
			"Nom de diagramme réparé"
			+ " | DiagramGUID=" + diagram.DiagramGUID
			+ " | Before=" + oldName
			+ " | After=" + diagram.Name
		);

		return true;
	},

	_repairDiagramRegistryEntries: function(rootPackage, analysisPackage, registryIndex)
	{
		if (!rootPackage || !analysisPackage || !analysisPackage.Element)
			return false;

		var sourceGuid = addin.utils.trim(addin.repositoryService.getTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
		));

		var definitions = this._getOperationDefinitions();
		var analysisDefinition = null;

		for (var i = 0; i < definitions.length; i++)
		{
			if (definitions[i] && addin.utils.equalsIgnoreCase(definitions[i].guid, sourceGuid))
			{
				analysisDefinition = definitions[i];
				break;
			}
		}

		if (!analysisDefinition || !analysisDefinition.element)
			return false;

		var diagramDefinitions = this._loadDiagramDefinitions(analysisDefinition.element);
		var recognizedDiagramGuids = {};
		var repairedCount = 0;
		var registryPackage = registryIndex && registryIndex.registryPackage
			? registryIndex.registryPackage
			: this._resolveDiagramRegistryPackage(rootPackage);

		if (!registryPackage)
			return false;

		analysisPackage.Diagrams.Refresh();

		for (var d = 0; d < diagramDefinitions.length; d++)
		{
			var diagramDefinition = diagramDefinitions[d];
			if (!diagramDefinition) continue;

			var effectiveConfig = this._resolveEffectiveDiagramConfig(diagramDefinition);
			if (!effectiveConfig) return false;

			for (var j = 0; j < analysisPackage.Diagrams.Count; j++)
			{
				var diagram = analysisPackage.Diagrams.GetAt(j);
				if (!diagram) continue;

				var diagramGuid = addin.utils.normalizeGuid(diagram.DiagramGUID);
				if (recognizedDiagramGuids[diagramGuid]) continue;

				if (!addin.utils.equalsIgnoreCase(
					addin.utils.trim(diagram.MetaType),
					addin.utils.trim(diagramDefinition.metaType)
				)) continue;

				recognizedDiagramGuids[diagramGuid] = true;

				if (!this._repairDiagramName(diagram, effectiveConfig))
					return false;

				var entry = this._findDiagramRegistryEntryByGeneratedGuid(
					registryPackage,
					diagram.DiagramGUID,
					registryIndex
				);

				if (entry)
				{
					var expectedRegistryName = this._getDiagramRegistryName(diagram);
					if (entry.Name !== expectedRegistryName)
					{
						var oldRegistryName = entry.Name;
						entry.Name = expectedRegistryName;
						if (!entry.Update())
						{
							entry.Name = oldRegistryName;
							addin.logger.error("REPAIR nom DGC en échec | DGCGUID=" + entry.ElementGUID);
							return false;
						}
						addin.logger.info(
							"Nom DGC synchronisé"
							+ " | DiagramGUID=" + diagram.DiagramGUID
							+ " | DGCGUID=" + entry.ElementGUID
							+ " | Name=" + entry.Name
						);
					}
					continue;
				}

				entry = this._ensureDiagramRegistryEntry(
					rootPackage,
					diagram,
					diagramDefinition,
					registryIndex
				);

				if (!entry)
				return false;

				repairedCount++;

				addin.logger.info(
					"DGC d'instance réparé"
					+ " | Package=" + analysisPackage.Name
					+ " | Diagram=" + diagram.Name
					+ " | DiagramGUID=" + diagram.DiagramGUID
					+ " | DGC=" + entry.Name
					+ " | DGCGUID=" + entry.ElementGUID
				);
			}
		}

		addin.logger.info(
			"REPAIR DGC terminé"
			+ " | Package=" + analysisPackage.Name
			+ " | Created=" + repairedCount
		);

		return true;
	},

	_getDiagramRegistryName: function(diagram)
	{
		var name = addin.utils.trim(diagram ? diagram.Name : "");
		return name.charAt(0) === "_" ? name : "_" + name;
	},

	_ensureDiagramRegistryEntry: function(
		rootPackage,
		generatedDiagram,
		diagramDefinition,
		registryIndex)
	{
		if (
			!rootPackage ||
			!generatedDiagram ||
			!diagramDefinition
		)
		{
			return null;
		}
		
		var registryPackage = null;


		if (
			registryIndex &&
			registryIndex.registryPackage
		)
		{
			registryPackage =
				registryIndex.registryPackage;
		}
		else
		{
			registryPackage =
				this._resolveDiagramRegistryPackage(
					rootPackage
				);
		}
		
		if (!registryPackage)
		{
			return null;
		}

		var generatedDiagramGuid =
			addin.utils.trim(
				generatedDiagram.DiagramGUID
			);


		var sourceDiagramGuid =
			addin.utils.trim(
				diagramDefinition.guid
			);


		if (
			addin.utils.isEmpty(
				generatedDiagramGuid
			) ||
			addin.utils.isEmpty(
				sourceDiagramGuid
			)
		)
		{
			addin.logger.warning(
				"Impossible d'enregistrer le diagramme"
				+ " | GeneratedGUID=" + generatedDiagramGuid
				+ " | SourceGUID=" + sourceDiagramGuid
			);

			return null;
		}


		// ========================================================
		// REGISTRE
		// ========================================================

		var registryPackage =
			this._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (!registryPackage)
		{
			return null;
		}


		// ========================================================
		// ENTREE EXISTANTE
		// ========================================================

		var registryEntry =
			this._findDiagramRegistryEntryByGeneratedGuid(
				registryPackage,
				generatedDiagramGuid,
				registryIndex
			);


		if (registryEntry)
		{
			
			addin.logger.debug(
				"Diagramme déjà enregistré"
				+ " | Diagramme=" + generatedDiagram.Name
				+ " | GeneratedGUID=" + generatedDiagramGuid
				+ " | RegistryElement=" + registryEntry.Name
				+ " | RegistryElementGUID=" + registryEntry.ElementGUID
			);
			
			this._addDiagramRegistryEntryToIndex(
				registryIndex,
				registryEntry,
				generatedDiagramGuid,
				sourceDiagramGuid
			);

			return registryEntry;
		}


		// ========================================================
		// CREATION
		// ========================================================

		addin.logger.info(
			"Création entrée registre diagramme"
			+ " | Diagramme=" + generatedDiagram.Name
			+ " | GeneratedGUID=" + generatedDiagramGuid
			+ " | SourceGUID=" + sourceDiagramGuid
		);


		registryEntry =
			registryPackage.Elements.AddNew(
				this._getDiagramRegistryName(generatedDiagram),
				addin.fbaConstants
					.DIAGRAM_REGISTRY_ELEMENT_TYPE
			);


		if (!registryEntry)
		{
			addin.logger.error(
				"Impossible de créer l'entrée du registre"
				+ " | Diagramme=" + generatedDiagram.Name
			);

			return null;
		}


		if (
			!addin.utils.isEmpty(
				addin.fbaConstants
					.DIAGRAM_REGISTRY_STEREOTYPE
			)
		)
		{
			registryEntry.StereotypeEx =
				addin.fbaConstants
					.DIAGRAM_REGISTRY_STEREOTYPE;
		}


		if (!registryEntry.Update())
		{
			addin.logger.error(
				"Impossible de sauvegarder l'entrée du registre"
				+ " | Diagramme=" + generatedDiagram.Name
			);

			return null;
		}


		//registryPackage.Elements.Refresh();


		// ========================================================
		// IDENTITE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			registryEntry,
			addin.fbaConstants
				.TAG_GENERATED_DIAGRAM_GUID,
			generatedDiagramGuid
		);


		addin.repositoryService.setTaggedValue(
			registryEntry,
			addin.fbaConstants
				.TAG_SOURCE_DIAGRAM_GUID,
			sourceDiagramGuid
		);


		addin.repositoryService.setTaggedValue(
			registryEntry,
			addin.fbaConstants.TAG_TECHNICAL,
			"true"
		);


		addin.logger.info(
			"Diagramme enregistré"
			+ " | Diagramme=" + generatedDiagram.Name
			+ " | GeneratedGUID=" + generatedDiagramGuid
			+ " | SourceGUID=" + sourceDiagramGuid
			+ " | RegistryElementGUID=" + registryEntry.ElementGUID
		);


		return registryEntry;
	},
	
	_ensureDiagramFromDefinition: function(
		rootPackage,
		analysisPackage,
		diagramDefinition,
		effectiveConfig)
	{
		var result = [];


		if (
			!rootPackage ||
			!analysisPackage ||
			!diagramDefinition
		)
		{
			return result;
		}


		// ========================================================
		// RECHERCHE DES DIAGRAMMES EXISTANTS
		// ========================================================

		var existingDiagrams =
			this._findDiagramsByMetaType(
				analysisPackage,
				diagramDefinition.metaType
			);


		if (
			existingDiagrams.length > 0
		)
		{
			addin.logger.info(
				"Diagramme existant détecté"
				+ " | Package=" + analysisPackage.Name
				+ " | MetaType=" + diagramDefinition.metaType
				+ " | Nombre=" + existingDiagrams.length
			);


			for (
				var i = 0;
				i < existingDiagrams.length;
				i++
			)
			{
				var existingDiagram =
					existingDiagrams[i];


				addin.logger.debug(
					"Diagramme existant préservé"
					+ " | Nom=" + existingDiagram.Name
					+ " | Type=" + existingDiagram.Type
					+ " | MetaType=" + existingDiagram.MetaType
					+ " | GUID=" + existingDiagram.DiagramGUID
				);


				result.push(
					{
						diagram: existingDiagram,
						created: false
					}
				);
			}


			return result;
		}


		// ========================================================
		// AUCUN DIAGRAMME EXISTANT
		// → CREATION
		// ========================================================

		var diagramName =
			this._buildGeneratedDiagramName(
				effectiveConfig
			);


		if (
			addin.utils.isEmpty(
				diagramName
			)
		)
		{
			diagramName =
				diagramDefinition.name;
		}


		var creationType =
			diagramDefinition.metaType;


		if (
			addin.utils.isEmpty(
				creationType
			)
		)
		{
			addin.logger.error(
				"Impossible de créer le diagramme"
				+ " | Package=" + analysisPackage.Name
				+ " | Prototype=" + diagramDefinition.name
				+ " | MetaType vide"
			);

			return result;
		}


		addin.logger.info(
			"Création du diagramme technique"
			+ " | Package=" + analysisPackage.Name
			+ " | Nom=" + diagramName
			+ " | MetaType=" + creationType
		);


		var generatedDiagram =
			analysisPackage.Diagrams.AddNew(
				diagramName,
				creationType
			);


		if (!generatedDiagram)
		{
			addin.logger.error(
				"Impossible de créer le diagramme"
				+ " | Package=" + analysisPackage.Name
				+ " | Nom=" + diagramName
				+ " | MetaType=" + creationType
			);

			return result;
		}


		if (!generatedDiagram.Update())
		{
			addin.logger.error(
				"Impossible de sauvegarder le diagramme"
				+ " | Package=" + analysisPackage.Name
				+ " | Nom=" + diagramName
			);

			return result;
		}


		//analysisPackage.Diagrams.Refresh();


		// ========================================================
		// RELECTURE EA
		// ========================================================

		var createdDiagram =
			null;


		try
		{
			createdDiagram =
				Repository.GetDiagramByID(
					generatedDiagram.DiagramID
				);
		}
		catch (e)
		{
			createdDiagram =
				generatedDiagram;
		}


		if (!createdDiagram)
		{
			createdDiagram =
				generatedDiagram;
		}


		addin.logger.info(
			"Diagramme technique créé"
			+ " | Nom=" + createdDiagram.Name
			+ " | Type=" + createdDiagram.Type
			+ " | MetaType=" + createdDiagram.MetaType
			+ " | GUID=" + createdDiagram.DiagramGUID
		);


		// ========================================================
		// ASSOCIATION AU PROTOTYPE
		//
		// Seulement pour le diagramme que FrameworkBA vient
		// lui-même de créer.
		// ========================================================

		this._ensureDiagramRegistryEntry(
			rootPackage,
			createdDiagram,
			diagramDefinition,
			diagramRegistryIndex
		);


		result.push(
			{
				diagram: createdDiagram,
				created: true
			}
		);


		return result;
	},
			
	_findDiagramRegistryEntriesBySourceGuid: function(
		registryPackage,
		sourceDiagramGuid,
		registryIndex)
	{
		var result = [];


		if (
			addin.utils.isEmpty(
				sourceDiagramGuid
			)
		)
		{
			return result;
		}


		var normalizedGuid =
			addin.utils.trim(
				sourceDiagramGuid
			).toLowerCase();


		// ========================================================
		// INDEX MEMOIRE
		// ========================================================

		if (
			registryIndex &&
			registryIndex.bySourceGuid
		)
		{
			return (
				registryIndex.bySourceGuid[
					normalizedGuid
				] || []
			);
		}


		// ========================================================
		// FALLBACK HISTORIQUE
		// ========================================================

		if (!registryPackage)
		{
			return result;
		}


		var elements =
			registryPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			if (!element)
			{
				continue;
			}


			var currentSourceGuid =
				addin.repositoryService.getTaggedValue(
					element,
					addin.fbaConstants
						.TAG_SOURCE_DIAGRAM_GUID
				);


			if (
				addin.utils.equalsIgnoreCase(
					currentSourceGuid,
					sourceDiagramGuid
				)
			)
			{
				result.push(
					element
				);
			}
		}


		return result;
	},
	
	
	_findGeneratedDiagramsBySourceGuid: function(
		rootPackage,
		sourceDiagramGuid)
	{
		var result = [];


		if (
			!rootPackage ||
			addin.utils.isEmpty(
				sourceDiagramGuid
			)
		)
		{
			return result;
		}


		var registryPackage =
			this._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (!registryPackage)
		{
			return result;
		}


		var registryEntries =
			this._findDiagramRegistryEntriesBySourceGuid(
				registryPackage,
				sourceDiagramGuid
			);


		for (
			var i = 0;
			i < registryEntries.length;
			i++
		)
		{
			var registryEntry =
				registryEntries[i];


			var generatedDiagramGuid =
				addin.repositoryService.getTaggedValue(
					registryEntry,
					addin.fbaConstants.TAG_GENERATED_DIAGRAM_GUID
				);


			if (
				addin.utils.isEmpty(
					generatedDiagramGuid
				)
			)
			{
				continue;
			}


			var diagram =
				addin.repositoryService.getDiagramByGuid(
					generatedDiagramGuid
				);


			if (!diagram)
			{
				addin.logger.debug(
					"Diagramme enregistré introuvable"
					+ " | GeneratedGUID=" + generatedDiagramGuid
					+ " | SourceGUID=" + sourceDiagramGuid
				);

				continue;
			}


			result.push(
				diagram
			);
		}


		return result;
	},
		
		
	_findGeneratedDiagramsForPackage: function(
		rootPackage,
		analysisPackage,
		sourceDiagramGuid)
	{
		var result = [];


		if (
			!rootPackage ||
			!analysisPackage ||
			addin.utils.isEmpty(
				sourceDiagramGuid
			)
		)
		{
			return result;
		}


		var generatedDiagrams =
			this._findGeneratedDiagramsBySourceGuid(
				rootPackage,
				sourceDiagramGuid
			);


		for (
			var i = 0;
			i < generatedDiagrams.length;
			i++
		)
		{
			var diagram =
				generatedDiagrams[i];


			if (!diagram)
			{
				continue;
			}


			if (
				diagram.PackageID ==
				analysisPackage.PackageID
			)
			{
				addin.logger.debug(
					"Diagramme Framework résolu"
					+ " | Package=" + analysisPackage.Name
					+ " | PackageGUID=" + analysisPackage.PackageGUID
					+ " | Diagramme=" + diagram.Name
					+ " | DiagramGUID=" + diagram.DiagramGUID
					+ " | SourceDiagramGUID=" + sourceDiagramGuid
				);


				result.push(
					diagram
				);
			}
		}


		return result;
	},
		
	// ============================================================
	// _findArtifactsMatchingDefinition
	//
	// Retourne tous les artefacts du package possédant
	// l'identité sémantique attendue.
	//
	// Lecture seule.
	// ============================================================

	_findArtifactsMatchingDefinition: function(
		analysisPackage,
		artifactDefinition,
		artifactDefinitions
	)
	{
		var result = [];


		if (
			!analysisPackage ||
			!artifactDefinition
		)
		{
			return result;
		}


		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var artifact =
				elements.GetAt(i);


			if (!artifact)
			{
				continue;
			}


			if (
				this._artifactMatchesFullDefinition(
					artifact,
					artifactDefinition,
					artifactDefinitions
				)
			)
			{
				result.push(
					artifact
				);
			}
		}


		return result;
	},
		
		
	// ============================================================
	// _artifactMatchesDefinitionPrefix
	//
	// Vérifie si le nom d'un artefact correspond au préfixe
	// défini par ETNIC_Artifact_Name_Prefix.
	//
	// Le "_" technique ne fait pas partie du préfixe métier.
	// ============================================================

	_artifactMatchesDefinitionPrefix: function(
		artifact,
		artifactDefinition
	)
	{
		if (
			!artifact ||
			!artifactDefinition
		)
		{
			return false;
		}


		var tags =
			artifactDefinition.taggedValues || {};


		var prefix =
			addin.utils.trim(
				tags[
					addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
				]
			);


		if (
			addin.utils.isEmpty(
				prefix
			)
		)
		{
			return false;
		}


		var artifactName =
			addin.utils.trim(
				artifact.Name
			);


		if (
			addin.utils.isEmpty(
				artifactName
			)
		)
		{
			return false;
		}


		// Le "_" technique ne fait pas partie
		// du préfixe métier.
		if (
			addin.utils.startsWith(
				artifactName,
				addin.fbaConstants.TECHNICAL_NAME_PREFIX
			)
		)
		{
			artifactName =
				artifactName.substring(
					addin.fbaConstants
						.TECHNICAL_NAME_PREFIX.length
				);
		}


		return addin.utils.startsWith(
			artifactName,
			prefix
		);
	},
		
	_hasPreExistingAnalysisContent: function(
		analysisPackage)
	{
		if (!analysisPackage)
		{
			return false;
		}


		// ========================================================
		// ELEMENTS
		// ========================================================

		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			if (!element)
			{
				continue;
			}


			var technicalValue =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						element,
						addin.fbaConstants.TAG_TECHNICAL
					)
				);


			if (
				addin.utils.equalsIgnoreCase(
					technicalValue,
					"true"
				)
			)
			{
				continue;
			}


			addin.logger.debug(
				"Contenu préexistant détecté"
				+ " | Package=" + analysisPackage.Name
				+ " | Type=ELEMENT"
				+ " | Nom=" + element.Name
				+ " | GUID=" + element.ElementGUID
			);


			return true;
		}


		// ========================================================
		// DIAGRAMMES
		//
		// Un diagramme n'ayant pas de Tagged Values,
		// tout diagramme déjà présent avant INITIALIZE est
		// considéré comme contenu préexistant.
		// ========================================================

		var diagrams =
			analysisPackage.Diagrams;


		for (
			var d = 0;
			d < diagrams.Count;
			d++
		)
		{
			var diagram =
				diagrams.GetAt(d);


			if (!diagram)
			{
				continue;
			}


			addin.logger.debug(
				"Contenu préexistant détecté"
				+ " | Package=" + analysisPackage.Name
				+ " | Type=DIAGRAM"
				+ " | Nom=" + diagram.Name
				+ " | GUID=" + diagram.DiagramGUID
			);


			return true;
		}


		// ========================================================
		// SOUS-PACKAGES
		//
		// Les packages techniques "_" sont ignorés.
		// ========================================================

		var packages =
			analysisPackage.Packages;


		for (
			var p = 0;
			p < packages.Count;
			p++
		)
		{
			var childPackage =
				packages.GetAt(p);


			if (!childPackage)
			{
				continue;
			}


			if (
				addin.utils.isTechnicalName(
					childPackage.Name
				)
			)
			{
				continue;
			}


			addin.logger.debug(
				"Contenu préexistant détecté"
				+ " | Package=" + analysisPackage.Name
				+ " | Type=PACKAGE"
				+ " | Nom=" + childPackage.Name
				+ " | GUID=" + childPackage.PackageGUID
			);


			return true;
		}


		return false;
	},
		
		
	// ============================================================
	// _definitionRequiresPrefixDiscrimination
	//
	// Détermine si le Prefix doit être utilisé pour distinguer
	// une définition d'artefact.
	//
	// Le Prefix devient discriminant uniquement lorsqu'au moins
	// deux définitions partagent :
	//
	// Type + Stereotype + Discriminator
	// ============================================================

	_definitionRequiresPrefixDiscrimination: function(
		artifactDefinition,
		artifactDefinitions
	)
	{
		if (
			!artifactDefinition ||
			!artifactDefinitions
		)
		{
			return false;
		}


		var definitionTags =
			artifactDefinition.taggedValues || {};


		var expectedType =
			addin.utils.trim(
				artifactDefinition.elementType
			);


		var expectedStereotype =
			addin.utils.trim(
				artifactDefinition.stereotype
			);


		var expectedDiscriminator =
			addin.utils.trim(
				definitionTags[
					addin.fbaConstants.TAG_STEREOTYPE_DISCRIMINATOR
				]
			);


		var count = 0;


		for (
			var i = 0;
			i < artifactDefinitions.length;
			i++
		)
		{
			var otherDefinition =
				artifactDefinitions[i];


			if (!otherDefinition)
			{
				continue;
			}


			var otherTags =
				otherDefinition.taggedValues || {};


			var otherType =
				addin.utils.trim(
					otherDefinition.elementType
				);


			var otherStereotype =
				addin.utils.trim(
					otherDefinition.stereotype
				);


			var otherDiscriminator =
				addin.utils.trim(
					otherTags[
						addin.fbaConstants.TAG_STEREOTYPE_DISCRIMINATOR
					]
				);


			if (
				addin.utils.equalsIgnoreCase(
					otherType,
					expectedType
				) &&
				addin.utils.equalsIgnoreCase(
					otherStereotype,
					expectedStereotype
				) &&
				addin.utils.equalsIgnoreCase(
					otherDiscriminator,
					expectedDiscriminator
				)
			)
			{
				count++;


				if (count > 1)
				{
					return true;
				}
			}
		}


		return false;
	},
		
		
	// ============================================================
	// _artifactMatchesFullDefinition
	//
	// Vérifie si un artefact correspond à une définition.
	//
	// Identité sémantique de base :
	// Type + Stereotype + Discriminator
	//
	// Le Prefix n'est utilisé que lorsque plusieurs définitions
	// partagent la même identité sémantique de base.
	// ============================================================

	_artifactMatchesFullDefinition: function(
		artifact,
		artifactDefinition,
		artifactDefinitions
	)
	{
		if (
			!artifact ||
			!artifactDefinition
		)
		{
			return false;
		}


		var definitionTags =
			artifactDefinition.taggedValues || {};


		// ========================================================
		// 1. TYPE
		// ========================================================

		var expectedType =
			addin.utils.trim(
				artifactDefinition.elementType
			);


		var actualType =
			addin.utils.trim(
				artifact.Type
			);


		if (
			!addin.utils.equalsIgnoreCase(
				actualType,
				expectedType
			)
		)
		{
			return false;
		}


		// ========================================================
		// 2. STEREOTYPE
		// ========================================================

		var expectedStereotype =
			addin.utils.trim(
				artifactDefinition.stereotype
			);


		var actualStereotype =
			addin.utils.trim(
				artifact.StereotypeEx
			);


		if (
			!addin.utils.equalsIgnoreCase(
				actualStereotype,
				expectedStereotype
			)
		)
		{
			return false;
		}


		// ========================================================
		// 3. DISCRIMINATOR
		// ========================================================

		var expectedDiscriminator =
			addin.utils.trim(
				definitionTags[
					addin.fbaConstants.TAG_STEREOTYPE_DISCRIMINATOR
				]
			);


		var actualDiscriminator =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					artifact,
					addin.fbaConstants.TAG_STEREOTYPE_DISCRIMINATOR
				)
			);


		if (
			!addin.utils.equalsIgnoreCase(
				actualDiscriminator,
				expectedDiscriminator
			)
		)
		{
			return false;
		}


		// ========================================================
		// 4. PREFIX
		//
		// Le préfixe ne devient discriminant que lorsque plusieurs
		// définitions possèdent la même identité :
		//
		// Type + Stereotype + Discriminator
		// ========================================================

		if (
			!this._definitionRequiresPrefixDiscrimination(
				artifactDefinition,
				artifactDefinitions
			)
		)
		{
			return true;
		}


		return this._artifactMatchesDefinitionPrefix(
			artifact,
			artifactDefinition
		);
	},
		
	
	// ============================================================
	// _findArtifactsAssociatedToDefinition
	//
	// Retourne tous les artefacts dont :
	//
	// ETNIC_Source_Artifact_Definition_GUID
	//
	// correspond au GUID de la définition.
	//
	// Lecture seule.
	// ============================================================

	_findArtifactsAssociatedToDefinition: function(
		analysisPackage,
		definitionGuid
	)
	{
		var result = [];


		if (
			!analysisPackage ||
			addin.utils.isEmpty(
				definitionGuid
			)
		)
		{
			return result;
		}


		var elements =
			analysisPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var artifact =
				elements.GetAt(i);


			if (!artifact)
			{
				continue;
			}


			var sourceDefinitionGuid =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						artifact,
						addin.fbaConstants.TAG_SOURCE_ARTIFACT_DEFINITION_GUID
					)
				);


			if (
				addin.utils.equalsIgnoreCase(
					sourceDefinitionGuid,
					definitionGuid
				)
			)
			{
				result.push(
					artifact
				);
			}
		}


		return result;
	},
		
	
	// ============================================================
	// _findArtifactDefinitionByGuid
	//
	// Recherche une définition d'artefact à partir du GUID
	// du prototype d'artefact.
	//
	// ETNIC_Source_Artifact_Definition_GUID référence
	// le GUID du prototype et non le GUID du connecteur
	// "Modeled by".
	//
	// Lecture seule.
	// ============================================================

	_findArtifactDefinitionByGuid: function(
		artifactDefinitions,
		definitionGuid
	)
	{
		if (
			!artifactDefinitions ||
			addin.utils.isEmpty(
				definitionGuid
			)
		)
		{
			return null;
		}


		for (
			var i = 0;
			i < artifactDefinitions.length;
			i++
		)
		{
			var definition =
				artifactDefinitions[i];


			if (!definition)
			{
				continue;
			}


			if (
				addin.utils.equalsIgnoreCase(
					definition.prototypeGuid,
					definitionGuid
				)
			)
			{
				return definition;
			}
		}


		return null;
	},
		
	_getAnalysisPackageInitializationState: function(
		analysisPackage)
	{
		if (!analysisPackage)
		{
			return "NOT_ASSOCIATED";
		}


		var packageElement =
			analysisPackage.Element;


		if (!packageElement)
		{
			return "NOT_ASSOCIATED";
		}


		var sourceGuid =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					packageElement,
					addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
				)
			);


		if (!sourceGuid)
		{
			return "NOT_ASSOCIATED";
		}


		var initializedValue =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					packageElement,
					addin.fbaConstants.TAG_INITIALIZED
				)
			);


		if (
			addin.utils.equalsIgnoreCase(
				initializedValue,
				"true"
			)
		)
		{
			return "INITIALIZED";
		}


		if (
			addin.utils.equalsIgnoreCase(
				initializedValue,
				"false"
			)
		)
		{
			return "INCOMPLETE";
		}


		// SourceGUID existant mais nouveau tag absent :
		// état hérité d'une ancienne version du Framework.
		return "LEGACY";
	},
		
	findDefinitionForPackage: function(
		targetPackage,
		definitions)
	{
		if (
			!targetPackage ||
			!targetPackage.Element
		)
		{
			return null;
		}


		if (!definitions)
		{
			definitions =
				this._getOperationDefinitions();
		}


		// ========================================================
		// 1. PACKAGE DEJA RATTACHE
		// ========================================================

		var sourceGuid =
			addin.repositoryService.getTaggedValue(
				targetPackage.Element,
				addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
			);


		if (
			!addin.utils.isEmpty(
				sourceGuid
			)
		)
		{
			for (
				var i = 0;
				i < definitions.length;
				i++
			)
			{
				if (
					addin.utils.equalsIgnoreCase(
						definitions[i].guid,
						sourceGuid
					)
				)
				{
					return definitions[i];
				}
			}


			return null;
		}


		// ========================================================
		// 2. PACKAGE NON RATTACHE
		//
		// Recherche par nom.
		// Plusieurs packages peuvent donc correspondre
		// à la même définition.
		// ========================================================

		var packageName =
			addin.utils.trim(
				targetPackage.Name
			);


		for (
			var j = 0;
			j < definitions.length;
			j++
		)
		{
			if (
				addin.utils.equalsIgnoreCase(
					definitions[j].name,
					packageName
				)
			)
			{
				return definitions[j];
			}
		}


		return null;
	},
		
	_createTechnicalDiagramFromDefinition: function(
		rootPackage,
		analysisPackage,
		diagramDefinition,
		effectiveConfig,
		diagramRegistryIndex)
	{
		if (
			!rootPackage ||
			!analysisPackage ||
			!diagramDefinition
		)
		{
			return null;
		}


		var diagramName =
			this._buildGeneratedDiagramName(
				effectiveConfig
			);


		// --------------------------------------------------------
		// NOM TECHNIQUE
		// --------------------------------------------------------

		if (
			!addin.utils.startsWith(
				diagramName,
				addin.fbaConstants.TECHNICAL_NAME_PREFIX
			)
		)
		{
			diagramName =
				addin.fbaConstants.TECHNICAL_NAME_PREFIX
				+ diagramName;
		}


		if (
			addin.utils.isEmpty(
				diagramName
			)
		)
		{
			diagramName =
				diagramDefinition.name;
		}


		var creationType =
			addin.utils.trim(
				diagramDefinition.metaType
			);


		if (
			addin.utils.isEmpty(
				creationType
			)
		)
		{
			addin.logger.error(
				"Impossible de créer le diagramme technique"
				+ " | Package=" + analysisPackage.Name
				+ " | Prototype=" + diagramDefinition.name
				+ " | MetaType vide"
			);

			return null;
		}


		addin.logger.info(
			"Création diagramme technique"
			+ " | Package=" + analysisPackage.Name
			+ " | Nom=" + diagramName
			+ " | MetaType=" + creationType
		);


		var generatedDiagram =
			analysisPackage.Diagrams.AddNew(
				diagramName,
				creationType
			);


		if (!generatedDiagram)
		{
			addin.logger.error(
				"Impossible de créer le diagramme technique"
				+ " | Package=" + analysisPackage.Name
				+ " | Nom=" + diagramName
			);

			return null;
		}


		if (!generatedDiagram.Update())
		{
			addin.logger.error(
				"Impossible de sauvegarder le diagramme technique"
				+ " | Package=" + analysisPackage.Name
				+ " | Nom=" + diagramName
			);

			return null;
		}


		//analysisPackage.Diagrams.Refresh();


		// ========================================================
		// RELECTURE EA
		// ========================================================

		var createdDiagram =
			null;


		try
		{
			createdDiagram =
				Repository.GetDiagramByID(
					generatedDiagram.DiagramID
				);
		}
		catch (e)
		{
			createdDiagram =
				generatedDiagram;
		}


		if (!createdDiagram)
		{
			createdDiagram =
				generatedDiagram;
		}


		// ========================================================
		// CONFIGURATION / ASSOCIATION TECHNIQUE
		// ========================================================

		this._ensureDiagramRegistryEntry(
			rootPackage,
			createdDiagram,
			diagramDefinition,
			diagramRegistryIndex
		);


		addin.logger.info(
			"Diagramme technique créé"
			+ " | Nom=" + createdDiagram.Name
			+ " | GUID=" + createdDiagram.DiagramGUID
			+ " | PrototypeGUID=" + diagramDefinition.guid
		);


		return createdDiagram;
	},
	
	_buildDiagramStructureSignature: function(diagram)
	{
		if (!diagram)
			return "";


		var parts = [];


		parts.push(
			"D:" +
			addin.utils.trim(
				diagram.DiagramGUID
			)
		);


		// ========================================================
		// ELEMENTS
		// ========================================================

		var elementGuids = [];

		var diagramObjects =
			diagram.DiagramObjects;


		for (
			var i = 0;
			i < diagramObjects.Count;
			i++
		)
		{
			var diagramObject =
				diagramObjects.GetAt(i);


			if (!diagramObject)
				continue;


			var element =
				addin.repositoryService.getElementById(
					diagramObject.ElementID
				);


			if (!element)
				continue;


			var elementGuid =
				addin.utils.trim(
					element.ElementGUID
				);


			if (
				!addin.utils.isEmpty(
					elementGuid
				)
			)
			{
				elementGuids.push(
					elementGuid.toLowerCase()
				);
			}
		}


		elementGuids.sort();


		for (
			var e = 0;
			e < elementGuids.length;
			e++
		)
		{
			parts.push(
				"E:" + elementGuids[e]
			);
		}


		// ========================================================
		// CONNECTEURS
		// ========================================================

		var connectorGuids = [];

		var diagramLinks =
			diagram.DiagramLinks;


		for (
			var j = 0;
			j < diagramLinks.Count;
			j++
		)
		{
			var diagramLink =
				diagramLinks.GetAt(j);


			if (!diagramLink)
				continue;


			var connector = null;


			try
			{
				connector =
					Repository.GetConnectorByID(
						diagramLink.ConnectorID
					);
			}
			catch (e1)
			{
				connector = null;
			}


			if (!connector)
				continue;


			var connectorGuid =
				addin.utils.trim(
					connector.ConnectorGUID
				);


			if (
				!addin.utils.isEmpty(
					connectorGuid
				)
			)
			{
				connectorGuids.push(
					connectorGuid.toLowerCase()
				);
			}
		}


		connectorGuids.sort();


		for (
			var c = 0;
			c < connectorGuids.length;
			c++
		)
		{
			parts.push(
				"C:" + connectorGuids[c]
			);
		}


		return parts.join("|");
	},


	_hashString: function(value)
	{
		var text =
			String(value || "");

		var hash = 0;


		for (
			var i = 0;
			i < text.length;
			i++
		)
		{
			hash =
				(
					(hash << 5) -
					hash
				) +
				text.charCodeAt(i);

			hash =
				hash | 0;
		}


		return String(hash);
	},


	_buildDiagramHash: function(diagram)
	{
		var signature =
			this._buildDiagramStructureSignature(
				diagram
			);


		if (
			addin.utils.isEmpty(
				signature
			)
		)
		{
			return "";
		}


		return this._hashString(
			signature
		);
	},


	_updateDiagramRegistryHash: function(
		rootPackage,
		diagram,
		registryIndex)
	{
		if (
			!rootPackage ||
			!diagram
		)
		{
			return false;
		}


		var diagramGuid =
			addin.utils.trim(
				diagram.DiagramGUID
			);


		if (
			addin.utils.isEmpty(
				diagramGuid
			)
		)
		{
			return false;
		}


		// ========================================================
		// REGISTRE
		// ========================================================

		var registryPackage = null;


		if (
			registryIndex &&
			registryIndex.registryPackage
		)
		{
			registryPackage =
				registryIndex.registryPackage;
		}
		else
		{
			registryPackage =
				this._resolveDiagramRegistryPackage(
					rootPackage
				);
		}


		if (!registryPackage)
		{
			addin.logger.warning(
				"Impossible de mettre à jour le hash du diagramme"
				+ " | Diagramme=" + diagram.Name
				+ " | Registre introuvable"
			);

			return false;
		}


		// ========================================================
		// ENTREE DU DIAGRAMME
		// ========================================================

		var registryEntry =
			this._findDiagramRegistryEntryByGeneratedGuid(
				registryPackage,
				diagramGuid,
				registryIndex
			);


		if (!registryEntry)
		{
			addin.logger.warning(
				"Impossible de mettre à jour le hash du diagramme"
				+ " | Diagramme=" + diagram.Name
				+ " | DiagramGUID=" + diagramGuid
				+ " | Entrée registre introuvable"
			);

			return false;
		}


		// ========================================================
		// HASH
		// ========================================================

		var diagramHash =
			this._buildDiagramHash(
				diagram
			);


		if (
			addin.utils.isEmpty(
				diagramHash
			)
		)
		{
			addin.logger.warning(
				"Hash de diagramme vide"
				+ " | Diagramme=" + diagram.Name
				+ " | DiagramGUID=" + diagramGuid
			);

			return false;
		}


		addin.repositoryService.setTaggedValue(
			registryEntry,
			addin.fbaConstants.TAG_DIAGRAM_HASH,
			diagramHash
		);


		addin.logger.debug(
			"Hash diagramme enregistré"
			+ " | Diagramme=" + diagram.Name
			+ " | DiagramGUID=" + diagramGuid
			+ " | Hash=" + diagramHash
		);


		return true;
	},
		
	
	_createDiagramArtifactCheckResult: function(
		diagramArtifactDefinition,
		artifact)
	{
		return {
			definition: {
				guid:
					diagramArtifactDefinition
						? diagramArtifactDefinition.guid
						: "",

				name:
					diagramArtifactDefinition
						? diagramArtifactDefinition.name
						: "",

				type:
					diagramArtifactDefinition
						? diagramArtifactDefinition.type
						: "",

				stereotype:
					diagramArtifactDefinition
						? diagramArtifactDefinition.stereotype
						: ""
			},

			artifact: {
				guid:
					artifact
						? artifact.ElementGUID
						: "",

				name:
					artifact
						? artifact.Name
						: "",

				type:
					artifact
						? artifact.Type
						: "",

				stereotype:
					artifact
						? artifact.StereotypeEx
						: ""
			},

			found:
				artifact != null,

			status:
				artifact
					? addin.fbaConstants.CHECK_STATUS_COMPLIANT
					: addin.fbaConstants.CHECK_STATUS_NON_COMPLIANT,

			issues: []
		};
	},
		
		
	_synchronizeAnalysisContent: function(
		rootPackage,
		analysisDefinition,
		analysisPackage,
		artifactIndex,
		analysisTagIndex,
		diagramRegistryIndex)
	{
		if (
			!rootPackage ||
			!analysisDefinition
		)
		{
			return false;
		}


		// ========================================================
		// PACKAGE CIBLE
		// ========================================================

		if (!analysisPackage)
		{
			analysisPackage =
				this._findPackageBySourceGuid(
					rootPackage,
					analysisDefinition.guid
				);
		}


		if (!analysisPackage)
		{
			addin.logger.warning(
				"Package d'analyse introuvable"
				+ " | Analyse=" + analysisDefinition.name
			);

			return false;
		}


		addin.logger.info(
			"Construction du contenu technique initial"
			+ " | Analyse=" + analysisDefinition.name
			+ " | Package=" + analysisPackage.Name
			+ " | PackageGUID=" + analysisPackage.PackageGUID
		);


		// ========================================================
		// 1. DEFINITIONS D'ARTEFACTS
		// ========================================================

		var artifactDefinitions =
			this._loadArtifactDefinitions(
				analysisDefinition,
				artifactIndex,
				analysisTagIndex
			);


		addin.logger.debug(
			"Définitions d'artefacts"
			+ " | Analyse=" + analysisDefinition.name
			+ " | Nombre=" + artifactDefinitions.length
		);


		// ========================================================
		// 2. CREATION DES ARTEFACTS TECHNIQUES
		//
		// IMPORTANT :
		// nous conservons la liste exacte des artefacts créés
		// pendant CETTE exécution.
		// ========================================================

		var createdArtifacts = [];


		for (
			var a = 0;
			a < artifactDefinitions.length;
			a++
		)
		{
			var createdArtifact =
				this._createTechnicalArtifact(
					analysisPackage,
					analysisDefinition,
					artifactDefinitions[a]
				);


			if (createdArtifact)
			{
				createdArtifacts.push(
					createdArtifact
				);
			}
		}


		// ========================================================
		// 3. DEFINITIONS DE DIAGRAMMES
		// ========================================================

		var diagramDefinitions =
			this._loadDiagramDefinitions(
				analysisDefinition.element
			);


		addin.logger.info(
			"Diagrammes du métamodèle chargés"
			+ " | Objet=" + analysisDefinition.name
			+ " | Nombre=" + diagramDefinitions.length
		);


		// ========================================================
		// 4. DIAGRAMMES TECHNIQUES OBLIGATOIRES
		// ========================================================

		for (
			var d = 0;
			d < diagramDefinitions.length;
			d++
		)
		{
			var diagramDefinition =
				diagramDefinitions[d];


			var effectiveConfig =
				this._resolveEffectiveDiagramConfig(
					diagramDefinition
				);


			if (!effectiveConfig)
			{
				addin.logger.warning(
					"Configuration effective introuvable"
					+ " | Objet=" + analysisDefinition.name
					+ " | Diagramme=" + diagramDefinition.name
				);

				continue;
			}


			if (
				!this._isRequiredDiagram(
					effectiveConfig
				)
			)
			{
				addin.logger.info(
					"Diagramme non généré automatiquement"
					+ " | Objet=" + analysisDefinition.name
					+ " | Diagramme=" + diagramDefinition.name
					+ " | Importance=" + effectiveConfig.importanceLevel
				);

				continue;
			}


			// ====================================================
			// CREATION EXPLICITE
			//
			// Aucune recherche d'un diagramme analyste existant.
			// ====================================================

			var createdDiagram =
				this._createTechnicalDiagramFromDefinition(
					rootPackage,
					analysisPackage,
					diagramDefinition,
					effectiveConfig,
					diagramRegistryIndex
				);


			if (!createdDiagram)
			{
				continue;
			}


			// ====================================================
			// 5. ARTEFACTS ATTENDUS SUR LE DIAGRAMME
			// ====================================================

			var diagramArtifactDefinitions =
				this._loadDiagramArtifactDefinitions(
					diagramDefinition.diagram,
					artifactDefinitions
				);


			addin.logger.debug(
				"Artefacts du diagramme prototype"
				+ " | Diagramme=" + diagramDefinition.name
				+ " | Nombre=" + diagramArtifactDefinitions.length
			);


			// ====================================================
			// 6. RESOLUTION PARMI LES ARTEFACTS CREES
			// ====================================================

			for (
				var p = 0;
				p < diagramArtifactDefinitions.length;
				p++
			)
			{
				var diagramArtifactDefinition =
					diagramArtifactDefinitions[p];


				var matchingArtifact =
					this._findMatchingCreatedArtifact(
						createdArtifacts,
						diagramArtifactDefinition,
						artifactDefinitions
					);


				if (matchingArtifact)
				{
					this._ensureArtifactOnDiagram(
						createdDiagram,
						matchingArtifact
					);
				}
				else
				{
					addin.logger.warning(
						"Aucun artefact technique créé correspondant"
						+ " | Diagramme=" + createdDiagram.Name
						+ " | Type=" + diagramArtifactDefinition.type
						+ " | Stereo=" + diagramArtifactDefinition.stereotype
					);
				}
			}


			// ====================================================
			// 7. HASH FINAL
			//
			// IMPORTANT :
			// le hash est calculé APRES construction du diagramme.
			// ====================================================

			this._updateDiagramRegistryHash(
				rootPackage,
				createdDiagram,
				diagramRegistryIndex
			);
		}


		return true;
	},
		
	_findPackageFromIndex: function(
		packageIndex,
		definition
	)
	{
		var sourceGuid;
		var normalizedName;
		var entry;

		if (!packageIndex || !definition)
		{
			return null;
		}

		// ========================================================
		// 1. SOURCE GUID
		// ========================================================

		sourceGuid =
			addin.utils.normalizeGuid(
				definition.guid
			);

		if (
			sourceGuid &&
			packageIndex.bySourceGuid[sourceGuid]
		)
		{
			entry =
				packageIndex.bySourceGuid[sourceGuid];

			// Package créé/chargé pendant cette exécution
			if (entry.packageObject)
			{
				return entry.packageObject;
			}

			// Package provenant de l'index SQL initial
			return addin.repositoryService.getPackageById(
				entry.packageId
			);
		}


		// ========================================================
		// 2. FALLBACK NOM
		// ========================================================

		normalizedName =
			addin.utils.trim(
				definition.name
			).toLowerCase();

		if (
			normalizedName &&
			packageIndex.byName[normalizedName]
		)
		{
			entry =
				packageIndex.byName[normalizedName];

			// Respect de la règle historique :
			// fallback par nom uniquement sans Source GUID.
			if (!entry.sourceGuid)
			{
				if (entry.packageObject)
				{
					return entry.packageObject;
				}

				return addin.repositoryService.getPackageById(
					entry.packageId
				);
			}
		}

		return null;
	},
		
	_addPackageToIndex: function(
		packageIndex,
		packageObject,
		definition
	)
	{
		var sourceGuid;
		var packageName;
		var entry;

		if (!packageIndex || !packageObject || !definition)
		{
			return;
		}

		sourceGuid =
			addin.utils.normalizeGuid(
				definition.guid
			);

		packageName =
			addin.utils.trim(
				packageObject.Name
			).toLowerCase();

		entry = {
			packageId: packageObject.PackageID,
			packageGuid: packageObject.PackageGUID,
			name: packageObject.Name,
			sourceGuid: sourceGuid,

			// Objet EA déjà disponible
			packageObject: packageObject
		};

		if (sourceGuid)
		{
			packageIndex.bySourceGuid[sourceGuid] = entry;
		}

		if (packageName)
		{
			packageIndex.byName[packageName] = entry;
		}
	},
		
	_loadDiagramRegistryIndex: function(rootPackage)
	{
		var index =
		{
			registryPackage: null,
			byGeneratedGuid: {},
			bySourceGuid: {}
		};


		var registryPackage =
			this._resolveDiagramRegistryPackage(
				rootPackage
			);


		if (!registryPackage)
		{
			return index;
		}


		index.registryPackage =
			registryPackage;


		var elements =
			registryPackage.Elements;


		for (
			var i = 0;
			i < elements.Count;
			i++
		)
		{
			var element =
				elements.GetAt(i);


			if (!element)
			{
				continue;
			}


			var generatedGuid =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						element,
						addin.fbaConstants
							.TAG_GENERATED_DIAGRAM_GUID
					)
				);


			var sourceGuid =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						element,
						addin.fbaConstants
							.TAG_SOURCE_DIAGRAM_GUID
					)
				);


			if (
				!addin.utils.isEmpty(
					generatedGuid
				)
			)
			{
				index.byGeneratedGuid[
					generatedGuid.toLowerCase()
				] = element;
			}


			if (
				!addin.utils.isEmpty(
					sourceGuid
				)
			)
			{
				var sourceKey =
					sourceGuid.toLowerCase();


				if (
					!index.bySourceGuid[
						sourceKey
					]
				)
				{
					index.bySourceGuid[
						sourceKey
					] = [];
				}


				index.bySourceGuid[
					sourceKey
				].push(
					element
				);
			}
		}


		addin.logger.info(
			"Index registre diagrammes chargé"
			+ " | Entrées="
			+ elements.Count
		);


		return index;
	},
		
	_addDiagramRegistryEntryToIndex: function(
		registryIndex,
		registryEntry,
		generatedDiagramGuid,
		sourceDiagramGuid)
	{
		if (
			!registryIndex ||
			!registryEntry
		)
		{
			return;
		}


		var generatedGuid =
			addin.utils.trim(
				generatedDiagramGuid
			);


		var sourceGuid =
			addin.utils.trim(
				sourceDiagramGuid
			);


		if (
			!addin.utils.isEmpty(
				generatedGuid
			)
		)
		{
			registryIndex.byGeneratedGuid[
				generatedGuid.toLowerCase()
			] = registryEntry;
		}


		if (
			!addin.utils.isEmpty(
				sourceGuid
			)
		)
		{
			var sourceKey =
				sourceGuid.toLowerCase();


			if (
				!registryIndex.bySourceGuid[
					sourceKey
				]
			)
			{
				registryIndex.bySourceGuid[
					sourceKey
				] = [];
			}


			registryIndex.bySourceGuid[
				sourceKey
			].push(
				registryEntry
			);
		}
	},
		
	loadDefinitions: function()
	{
		return this._loadDefinitions();
	},
		
	initializeAnalysisPackage: function(
		analysisRoot,
		targetPackage,
		definitions,
		artifactIndex,
		analysisTagIndex,
		diagramRegistryIndex)
	{
		if (
			!analysisRoot ||
			!targetPackage
		)
		{
			return false;
		}


		addin.logger.info(
			"Initialisation package d'analyse"
			+ " | Package=" + targetPackage.Name
		);


		// ========================================================
		// 0. ETAT D'INITIALISATION
		// ========================================================

		var initializationState =
			this._getAnalysisPackageInitializationState(
				targetPackage
			);


		var diagnosticSourceGuid =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					targetPackage.Element,
					addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
				)
			);


		var diagnosticInitialized =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					targetPackage.Element,
					addin.fbaConstants.TAG_INITIALIZED
				)
			);


		addin.logger.debug(
			"Etat initialisation package"
			+ " | Package=" + targetPackage.Name
			+ " | PackageGUID=" + targetPackage.PackageGUID
			+ " | State=" + initializationState
			+ " | SourceGUID=" + diagnosticSourceGuid
			+ " | Initialized=" + diagnosticInitialized
		);


		// --------------------------------------------------------
		// PACKAGE DEJA INITIALISE
		// --------------------------------------------------------

		if (initializationState == "INITIALIZED")
		{
			var initializedSourceGuid =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						targetPackage.Element,
						addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
					)
				);


			addin.logger.info(
				"Package d'analyse déjà initialisé"
				+ " | Package=" + targetPackage.Name
				+ " | SourceGUID=" + initializedSourceGuid
				+ " | Initialized=true"
				+ " | Action=SKIP"
			);


			return true;
		}


		// --------------------------------------------------------
		// ETAT LEGACY
		// --------------------------------------------------------

		if (initializationState == "LEGACY")
		{
			var legacySourceGuid =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						targetPackage.Element,
						addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
					)
				);


			addin.logger.warning(
				"Package d'analyse issu d'une version antérieure du Framework"
				+ " | Package=" + targetPackage.Name
				+ " | SourceGUID=" + legacySourceGuid
				+ " | Initialized=<absent>"
				+ " | Action=SKIP"
			);


			return true;
		}


		// --------------------------------------------------------
		// INITIALISATION INCOMPLETE
		// --------------------------------------------------------

		if (initializationState == "INCOMPLETE")
		{
			var incompleteSourceGuid =
				addin.utils.trim(
					addin.repositoryService.getTaggedValue(
						targetPackage.Element,
						addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
					)
				);


			addin.logger.warning(
				"Initialisation FrameworkBA incomplète détectée"
				+ " | Package=" + targetPackage.Name
				+ " | SourceGUID=" + incompleteSourceGuid
				+ " | Initialized=false"
				+ " | Action=STOP"
			);


			return false;
		}


		// ========================================================
		// 1. CONTENU PREEXISTANT
		// ========================================================

		var hasPreExistingContent =
			this._hasPreExistingAnalysisContent(
				targetPackage
			);


		if (hasPreExistingContent)
		{
			addin.logger.warning(
				"Le package contient déjà du contenu"
				+ " | Package=" + targetPackage.Name
				+ " | INITIALIZE nécessite l'accord de l'analyste"
			);


			var message =
				"Le package \""
				+ targetPackage.Name
				+ "\" contient déjà du contenu."
				+ "\n\n"
				+ "L'initialisation conservera intégralement "
				+ "le contenu existant et ajoutera les éléments "
				+ "techniques proposés par FrameworkBA."
				+ "\n\n"
				+ "Voulez-vous poursuivre l'initialisation ?";


			var answer =
				addin.repositoryService.confirm(
					message
				);


			if (!answer)
			{
				addin.logger.info(
					"Initialisation annulée par l'analyste"
					+ " | Package=" + targetPackage.Name
					+ " | Action=CANCEL"
				);


				return true;
			}


			addin.logger.info(
				"Initialisation autorisée par l'analyste"
				+ " | Package=" + targetPackage.Name
				+ " | Action=CONTINUE"
			);
		}


		// ========================================================
		// 2. DEFINITION DU METAMODELE
		// ========================================================

		if (!definitions)
		{
			definitions =
				this._getOperationDefinitions();
		}
		
		var definition =
			this.findDefinitionForPackage(
				targetPackage,
				definitions
			);


		if (!definition)
		{
			addin.logger.warning(
				"Aucune définition du métamodèle"
				+ " ne correspond au package"
				+ " | Package=" + targetPackage.Name
			);


			return false;
		}


		addin.logger.info(
			"Définition d'analyse identifiée"
			+ " | Package=" + targetPackage.Name
			+ " | Definition=" + definition.name
			+ " | SourceGUID=" + definition.guid
		);
		
		if (!artifactIndex)
		{
			artifactIndex =
				this._getOperationArtifactDefinitionsIndex();
		}


		if (!analysisTagIndex)
		{
			analysisTagIndex =
				this._getOperationAnalysisElementTagsIndex();
		}


		// ========================================================
		// 3. RATTACHEMENT DU PACKAGE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			targetPackage.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			definition.guid
		);


		addin.repositoryService.setTaggedValue(
			targetPackage.Element,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			definition.role
		);


		addin.repositoryService.setTaggedValue(
			targetPackage.Element,
			addin.fbaConstants.TAG_CATEGORY,
			definition.category
		);


		addin.repositoryService.setTaggedValue(
			targetPackage.Element,
			addin.fbaConstants.TAG_IMPORTANT_LEVEL,
			definition.importantLevel
		);


		// ========================================================
		// 4. INITIALISATION EN COURS
		// ========================================================

		addin.repositoryService.setTaggedValue(
			targetPackage.Element,
			addin.fbaConstants.TAG_INITIALIZED,
			"false"
		);


		addin.logger.info(
			"Package rattaché au métamodèle"
			+ " | Package=" + targetPackage.Name
			+ " | Role=" + definition.role
			+ " | Category=" + definition.category
			+ " | ImportantLevel=" + definition.importantLevel
			+ " | Initialized=false"
		);


		// ========================================================
		// 5. CONSTRUCTION DU CONTENU INITIAL
		// ========================================================

		var contentResult =
			this._synchronizeAnalysisContent(
				analysisRoot,
				definition,
				targetPackage,
				artifactIndex,
				analysisTagIndex,
				diagramRegistryIndex
			);


		if (!contentResult)
		{
			addin.logger.error(
				"Échec de construction du contenu initial"
				+ " | Package=" + targetPackage.Name
				+ " | SourceGUID=" + definition.guid
				+ " | Initialized=false"
			);


			return false;
		}


		// ========================================================
		// 6. INITIALISATION TERMINEE
		// ========================================================

		addin.repositoryService.setTaggedValue(
			targetPackage.Element,
			addin.fbaConstants.TAG_INITIALIZED,
			"true"
		);


		addin.logger.info(
			"Package d'analyse initialisé"
			+ " | Package=" + targetPackage.Name
			+ " | SourceGUID=" + definition.guid
			+ " | Initialized=true"
		);


		return true;
	},
	
	_getCheckStatus: function(issues)
	{
		if (!issues || issues.length === 0) {
			return addin.fbaConstants.CHECK_STATUS_COMPLIANT;
		}

		for (var i = 0; i < issues.length; i++) {
			if (issues[i].severity === addin.fbaConstants.CHECK_SEVERITY_ERROR) {
				return addin.fbaConstants.CHECK_STATUS_NON_COMPLIANT;
			}
		}

		return addin.fbaConstants.CHECK_STATUS_COMPLIANT;
	},

	_getCheckAction: function(issues)
	{
		// Aucun problème = aucune action corrective.
		if (!issues || issues.length === 0)
		{
			return "";
		}

		/*
		 * V1 :
		 * on ne définit pas encore de priorité artificielle entre
		 * les différentes actions correctives.
		 *
		 * On prend la première action réellement portée
		 * par le diagnostic.
		 */
		for (var i = 0; i < issues.length; i++)
		{
			var action = issues[i].action;

			if (action)
			{
				return action;
			}
		}

		/*
		 * Situation anormale :
		 * il existe au moins une issue mais aucune action.
		 *
		 * On ne fabrique pas artificiellement une action NONE.
		 * Le CHECK doit normalement garantir qu'une issue
		 * possède toujours une action.
		 */
		addin.logger.warning(
			"CHECK issue(s) sans action corrective"
			+ " | Issues=" + issues.length
		);

		return "";
	},

	_getCheckIssuesValue: function(issues)
	{
		if (!issues || issues.length === 0) {
			return "";
		}

		var codes = [];

		for (var i = 0; i < issues.length; i++) {
			var code = issues[i].code;

			if (!code) {
				continue;
			}

			// Evite d'inscrire deux fois le même code.
			var exists = false;

			for (var j = 0; j < codes.length; j++) {
				if (codes[j] === code) {
					exists = true;
					break;
				}
			}

			if (!exists) {
				codes.push(code);
			}
		}

		return codes.join(";");
	},
	
	_persistCheckResult: function(object, checkResult)
    {
        var previous = addin.checkInvalidationSuppressed;
        addin.checkInvalidationSuppressed = true;
        try
        {
            return this.persistCheckResultWithoutInvalidation(object, checkResult);
        }
        finally
        {
            addin.checkInvalidationSuppressed = previous;
        }
    },

    persistCheckResultWithoutInvalidation: function(element, issues)
	{
		if (!element)
		{
			return false;
		}

		issues = issues || [];

		var status =
			this._getCheckStatus(issues);

		var action =
			this._getCheckAction(issues);

		var issueValue =
			this._getCheckIssuesValue(issues);

		var checkDate =
			addin.utils.formatFrenchDateTime(
				new Date()
			);

		addin.repositoryService.setTaggedValue(
			element,
			addin.fbaConstants.TAG_CHECK_STATUS,
			status
		);

		addin.repositoryService.setTaggedValue(
			element,
			addin.fbaConstants.TAG_CHECK_DATE,
			checkDate
		);

		addin.repositoryService.setTaggedValue(
			element,
			addin.fbaConstants.TAG_CHECK_ISSUES,
			issueValue
		);

		addin.repositoryService.setTaggedValue(
			element,
			addin.fbaConstants.TAG_CHECK_ACTION,
			action
		);

		return true;
	},
	
	_persistDiagramCheckResult: function(
		rootPackage,
		diagram,
		issues,
		registryIndex)
	{
		if (
			!rootPackage ||
			!diagram
		)
		{
			return false;
		}

		issues = issues || [];

		var diagramGuid =
			addin.utils.trim(
				diagram.DiagramGUID
			);

		if (
			addin.utils.isEmpty(
				diagramGuid
			)
		)
		{
			return false;
		}

		// ========================================================
		// REGISTRE
		// ========================================================

		var registryPackage = null;

		if (
			registryIndex &&
			registryIndex.registryPackage
		)
		{
			registryPackage =
				registryIndex.registryPackage;
		}
		else
		{
			registryPackage =
				this._resolveDiagramRegistryPackage(
					rootPackage
				);
		}

		if (!registryPackage)
		{
			addin.logger.warning(
				"Impossible d'enregistrer le résultat CHECK du diagramme"
				+ " | Diagramme=" + diagram.Name
				+ " | Registre introuvable"
			);

			return false;
		}

		// ========================================================
		// ENTREE DU DIAGRAMME
		// ========================================================

		var registryEntry =
			this._findDiagramRegistryEntryByGeneratedGuid(
				registryPackage,
				diagramGuid,
				registryIndex
			);

		if (!registryEntry)
		{
			addin.logger.warning(
				"Impossible d'enregistrer le résultat CHECK du diagramme"
				+ " | Diagramme=" + diagram.Name
				+ " | DiagramGUID=" + diagramGuid
				+ " | Entrée registre introuvable"
			);

			return false;
		}

		// ========================================================
		// CHECK
		// ========================================================

		return this._persistCheckResult(
			registryEntry,
			issues
		);
	},
	
	
	_createCheckMetrics: function()
	{
		return {
			packages: {
				expected: 0,
				found: 0,
				compliant: 0,
				nonCompliant: 0,
				missing: 0,
				foreign: 0,
				duplicateGroups: 0,
				duplicateExcess: 0
			},

			diagrams: {
				expected: 0,
				found: 0,
				compliant: 0,
				nonCompliant: 0,
				missing: 0,
				foreign: 0,

				withNote: 0,
				withoutNote: 0,

				namingValid: 0,
				namingInvalid: 0,

				duplicateGroups: 0,
				duplicateExcess: 0
			},

			artifacts: {
				expected: 0,
				found: 0,
				compliant: 0,
				nonCompliant: 0,
				missing: 0,
				foreign: 0,

				withNote: 0,
				withoutNote: 0,

				namingValid: 0,
				namingInvalid: 0,

				duplicateGroups: 0,
				duplicateExcess: 0
			}
		};
	},
			
	_createCheckResult: function(scope, rootPackage)
	{
		return {
			version:
				addin.fbaConstants.CHECK_RESULT_VERSION,
			
			success: true,

			scope: scope,

			checkedAt:
				addin.utils.formatFrenchDateTime(
					new Date()
				),

			root: {
				guid:
					rootPackage
						? rootPackage.PackageGUID
						: "",

				name:
					rootPackage
						? rootPackage.Name
						: ""
			},

			issues: [],

			summary: {
				errors: 0,
				warnings: 0,
				
				init: 0,
				complete: 0,
				repair: 0,
				
				manualComplete: 0,
				manualRemove: 0,
				manualMove: 0,
				makeTechnical: 0,
				makeBusiness: 0,
				manualReview: 0
			},

			metrics:
				this._createCheckMetrics(),
			
			objects: {},
			
			ruleResults: [],
			
		};
	},		
	
	_createDiagramCheckResult: function(
		diagramDefinition,
		diagram,
		effectiveConfig)
	{
		return {
			definition: {
				guid:
					diagramDefinition
						? diagramDefinition.guid
						: "",

				metaType:
					diagramDefinition
						? diagramDefinition.metaType
						: "",

				importance:
					effectiveConfig &&
					effectiveConfig.importanceLevel
						? effectiveConfig.importanceLevel
						: "Obligatoire"
			},

			diagram: {
				guid:
					diagram
						? diagram.DiagramGUID
						: "",

				name:
					diagram
						? diagram.Name
						: "",

				metaType:
					diagram
						? diagram.MetaType
						: ""
			},

			found:
				diagram != null,

			status:
				diagram
					? addin.fbaConstants.CHECK_STATUS_COMPLIANT
					: addin.fbaConstants.CHECK_STATUS_NON_COMPLIANT,

			issues: [],

			metrics:
				this._createCheckMetrics(),

			artifacts: []
		};
	},
				
	_registerCheckObject: function(
		result,
		guid,
		objectType,
		name,
		parentGuid
	)
	{
		if (
			!result ||
			!result.objects ||
			addin.utils.isEmpty(guid)
		)
		{
			return null;
		}

		var normalizedGuid =
			addin.utils.normalizeGuid(
				guid
			);

		/*
		 * L'objet existe déjà :
		 * on retourne toujours la même instance.
		 */
		if (result.objects[normalizedGuid])
		{
			return result.objects[normalizedGuid];
		}

		var objectResult = {
			guid: normalizedGuid,

			objectType:
				objectType || "",

			name:
				name || "",

			parentGuid:
				addin.utils.isEmpty(parentGuid)
					? ""
					: addin.utils.normalizeGuid(
						parentGuid
					),
			
			checkedAt:
				result.checkedAt,

			issues: [],

			summary: {
				errors: 0,
				warnings: 0
			}
		};

		result.objects[normalizedGuid] =
			objectResult;

		return objectResult;
	},
			
	
	_getCheckObject: function(
		result,
		guid
	)
	{
		if (
			!result ||
			!result.objects ||
			addin.utils.isEmpty(guid)
		)
		{
			return null;
		}

		var normalizedGuid =
			addin.utils.normalizeGuid(
				guid
			);

		return result.objects[normalizedGuid]
			|| null;
	},
		
	_normalizeUniquenessName: function(name)
	{
		if (name == null)
			return "";

		return addin.utils.trim(
			String(name)
		).toLowerCase();
	},
		
	_createUniquenessCandidate: function(
		guid,
		objectType,
		name,
		parentGuid,
		analysisPackageGuid,
		analysisElementGuid
	)
	{
		if (addin.utils.isEmpty(guid))
			return null;

		return {
			guid: addin.utils.normalizeGuid(guid),

			objectType: objectType || "",

			name: name || "",

			uniquenessName:
				this._normalizeUniquenessName(name),

			parentGuid:
				addin.utils.isEmpty(parentGuid)
					? ""
					: addin.utils.normalizeGuid(parentGuid),

			analysisPackageGuid:
				addin.utils.isEmpty(analysisPackageGuid)
					? ""
					: addin.utils.normalizeGuid(analysisPackageGuid),

			analysisElementGuid:
				addin.utils.isEmpty(analysisElementGuid)
					? ""
					: addin.utils.normalizeGuid(analysisElementGuid)
		};
	},

	_createArtifactUniquenessCandidates: function(
		artifactRows,
		packageCandidates
	)
	{
		var result = [];

		artifactRows =
			artifactRows || [];

		packageCandidates =
			packageCandidates || [];

		for (
			var i = 0;
			i < artifactRows.length;
			i++
		)
		{
			var row =
				artifactRows[i];

			/*
			 * Les lignes t_object représentant les packages
			 * ne sont jamais des artefacts d'analyse.
			 */
			if (
				addin.utils.equalsIgnoreCase(
					row.ObjectType,
					"Package"
				)
			)
			{
				continue;
			}

			var analysisPackageGuid =
				this._findOwningAnalysisPackageGuid(
					row.PackageID,
					packageCandidates
				);

			/*
			 * Un objet situé dans la structure technique
			 * du ROOT (_Librairie, _Vues, etc.)
			 * ne participe pas à l'unicité des artefacts
			 * des Analysis Elements.
			 */
			if (
				addin.utils.isEmpty(
					analysisPackageGuid
				)
			)
			{
				continue;
			}

			var parentGuid =
				this._findPackageGuidById(
					row.PackageID,
					packageCandidates
				);

			var candidate =
				this._createUniquenessCandidate(
					row.ObjectGUID,
					"ARTIFACT",
					row.ObjectName,
					parentGuid,
					analysisPackageGuid,
					""
				);

			if (candidate)
				result.push(candidate);
		}

		return result;
	},
	
	_createDiagramUniquenessCandidates: function(
		diagramRows,
		packageCandidates
	)
	{
		var result = [];

		diagramRows =
			diagramRows || [];

		packageCandidates =
			packageCandidates || [];

		for (
			var i = 0;
			i < diagramRows.length;
			i++
		)
		{
			var row =
				diagramRows[i];

			var analysisPackageGuid =
				this._findOwningAnalysisPackageGuid(
					row.PackageID,
					packageCandidates
				);

			/*
			 * Un diagramme situé dans la structure
			 * technique du ROOT ne participe pas
			 * à l'unicité des diagrammes d'analyse.
			 */
			if (
				addin.utils.isEmpty(
					analysisPackageGuid
				)
			)
			{
				continue;
			}

			var parentGuid =
				this._findPackageGuidById(
					row.PackageID,
					packageCandidates
				);

			var candidate =
				this._createUniquenessCandidate(
					row.DiagramGUID,
					"DIAGRAM",
					row.DiagramName,
					parentGuid,
					analysisPackageGuid,
					""
				);

			if (candidate)
				result.push(candidate);
		}

		return result;
	},
		
	_findDuplicateArtifacts: function(candidates)
	{
		candidates =
			candidates || [];

		var localGroups = {};
		var globalGroups = {};

		var localDuplicates = [];
		var globalDuplicates = [];

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				!candidate ||
				candidate.objectType !== "ARTIFACT" ||
				addin.utils.isEmpty(
					candidate.uniquenessName
				) ||
				addin.utils.isEmpty(
					candidate.analysisPackageGuid
				)
			)
			{
				continue;
			}

			/*
			 * LOCAL
			 *
			 * Même nom dans le même Analysis Package,
			 * y compris dans ses éventuels
			 * sous-packages techniques.
			 */
			var localKey =
				candidate.analysisPackageGuid +
				"|" +
				candidate.uniquenessName;

			if (!localGroups[localKey])
				localGroups[localKey] = [];

			localGroups[localKey].push(
				candidate
			);


			/*
			 * GLOBAL
			 *
			 * Regroupement initial uniquement par nom.
			 */
			var globalKey =
				candidate.uniquenessName;

			if (!globalGroups[globalKey])
				globalGroups[globalKey] = [];

			globalGroups[globalKey].push(
				candidate
			);
		}


		/*
		 * Doublons LOCAL.
		 */
		for (var localKey in localGroups)
		{
			if (
				!localGroups.hasOwnProperty(
					localKey
				)
			)
				continue;

			var localMembers =
				localGroups[localKey];

			if (localMembers.length <= 1)
				continue;

			localDuplicates.push({
				scope:
					"LOCAL",

				objectType:
					"ARTIFACT",

				uniquenessName:
					localMembers[0]
						.uniquenessName,

				analysisPackageGuid:
					localMembers[0]
						.analysisPackageGuid,

				count:
					localMembers.length,

				excess:
					localMembers.length - 1,

				objects:
					localMembers
			});
		}


		/*
		 * Doublons GLOBAL.
		 *
		 * Il faut au moins deux Analysis Packages
		 * différents pour constituer un doublon global.
		 */
		for (var globalKey in globalGroups)
		{
			if (
				!globalGroups.hasOwnProperty(
					globalKey
				)
			)
				continue;

			var globalMembers =
				globalGroups[globalKey];

			var packages = {};
			var packageCount = 0;

			for (
				var j = 0;
				j < globalMembers.length;
				j++
			)
			{
				var packageGuid =
					globalMembers[j]
						.analysisPackageGuid;

				if (!packages[packageGuid])
				{
					packages[packageGuid] =
						true;

					packageCount++;
				}
			}

			if (packageCount <= 1)
				continue;

			globalDuplicates.push({
				scope:
					"GLOBAL",

				objectType:
					"ARTIFACT",

				uniquenessName:
					globalKey,

				analysisPackageCount:
					packageCount,

				count:
					globalMembers.length,

				excess:
					globalMembers.length - 1,

				objects:
					globalMembers
			});
		}

		return {
			local:
				localDuplicates,

			global:
				globalDuplicates
		};
	},
	
	_findDuplicateDiagrams: function(candidates)
	{
		candidates =
			candidates || [];

		var localGroups = {};
		var globalGroups = {};

		var localDuplicates = [];
		var globalDuplicates = [];

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				!candidate ||
				candidate.objectType !== "DIAGRAM" ||
				addin.utils.isEmpty(
					candidate.uniquenessName
				) ||
				addin.utils.isEmpty(
					candidate.analysisPackageGuid
				)
			)
			{
				continue;
			}

			/*
			 * LOCAL :
			 * même nom dans le même Analysis Package.
			 */
			var localKey =
				candidate.analysisPackageGuid +
				"|" +
				candidate.uniquenessName;

			if (!localGroups[localKey])
				localGroups[localKey] = [];

			localGroups[localKey].push(
				candidate
			);


			/*
			 * GLOBAL :
			 * regroupement par nom dans tout
			 * le Dossier d'analyse.
			 */
			var globalKey =
				candidate.uniquenessName;

			if (!globalGroups[globalKey])
				globalGroups[globalKey] = [];

			globalGroups[globalKey].push(
				candidate
			);
		}


		/*
		 * Doublons LOCAL.
		 */
		for (var localKey in localGroups)
		{
			if (
				!localGroups.hasOwnProperty(
					localKey
				)
			)
				continue;

			var localMembers =
				localGroups[localKey];

			if (localMembers.length <= 1)
				continue;

			localDuplicates.push({
				scope:
					"LOCAL",

				objectType:
					"DIAGRAM",

				uniquenessName:
					localMembers[0]
						.uniquenessName,

				analysisPackageGuid:
					localMembers[0]
						.analysisPackageGuid,

				count:
					localMembers.length,

				excess:
					localMembers.length - 1,

				objects:
					localMembers
			});
		}


		/*
		 * Doublons GLOBAL :
		 * le même nom doit apparaître dans au moins
		 * deux Analysis Packages différents.
		 */
		for (var globalKey in globalGroups)
		{
			if (
				!globalGroups.hasOwnProperty(
					globalKey
				)
			)
				continue;

			var globalMembers =
				globalGroups[globalKey];

			var packages = {};
			var packageCount = 0;

			for (
				var j = 0;
				j < globalMembers.length;
				j++
			)
			{
				var packageGuid =
					globalMembers[j]
						.analysisPackageGuid;

				if (!packages[packageGuid])
				{
					packages[packageGuid] =
						true;

					packageCount++;
				}
			}

			if (packageCount <= 1)
				continue;

			globalDuplicates.push({
				scope:
					"GLOBAL",

				objectType:
					"DIAGRAM",

				uniquenessName:
					globalKey,

				analysisPackageCount:
					packageCount,

				count:
					globalMembers.length,

				excess:
					globalMembers.length - 1,

				objects:
					globalMembers
			});
		}

		return {
			local:
				localDuplicates,

			global:
				globalDuplicates
		};
	},
			
	_createDuplicateGroup: function(
		scope,
		objectType,
		uniquenessName,
		objects
	)
	{
		objects =
			objects || [];

		if (
			addin.utils.isEmpty(scope) ||
			addin.utils.isEmpty(objectType) ||
			addin.utils.isEmpty(uniquenessName) ||
			objects.length <= 1
		)
		{
			return null;
		}

		var objectGuids = [];

		for (
			var i = 0;
			i < objects.length;
			i++
		)
		{
			if (
				!objects[i] ||
				addin.utils.isEmpty(
					objects[i].guid
				)
			)
			{
				continue;
			}

			objectGuids.push(
				addin.utils.normalizeGuid(
					objects[i].guid
				)
			);
		}

		if (objectGuids.length <= 1)
			return null;

		return {
			scope:
				scope,

			objectType:
				objectType,

			uniquenessName:
				uniquenessName,

			count:
				objectGuids.length,

			excess:
				objectGuids.length - 1,

			objectGuids:
				objectGuids
		};
	},
			
	_createDuplicateCheckIssue: function(
		duplicateGroup
	)
	{
		if (!duplicateGroup)
			return null;

		var code = "";
		var label = "";

		switch (duplicateGroup.objectType)
		{
			case "ANALYSIS_PACKAGE":

				code =
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ANALYSIS_PACKAGE_NAME;

				label =
					"Package d'analyse";

				break;


			case "TECHNICAL_PACKAGE":

				code =
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_TECHNICAL_PACKAGE_NAME;

				label =
					"Package technique";

				break;


			case "ARTIFACT":

				code =
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_ARTIFACT_NAME;

				label =
					"Artefact";

				break;


			case "DIAGRAM":

				code =
					addin.fbaConstants
						.CHECK_ISSUE_DUPLICATE_DIAGRAM_NAME;

				label =
					"Diagramme";

				break;


			default:

				return null;
		}


		return {
			code:
				code,

			severity:
				"ERROR",

			action:
				addin.fbaConstants
					.CHECK_ACTION_MANUAL_REVIEW,

			scope:
				duplicateGroup.scope,

			objectType:
				duplicateGroup.objectType,

			uniquenessName:
				duplicateGroup.uniquenessName,

			count:
				duplicateGroup.count,

			excess:
				duplicateGroup.excess,

			objectGuids:
				duplicateGroup.objectGuids,

			message:
				label +
				" dupliqué : '" +
				duplicateGroup.uniquenessName +
				"' (" +
				duplicateGroup.count +
				" occurrences, portée " +
				duplicateGroup.scope +
				")."
		};
	},
	
	_checkUniquenessCandidates: function(
		packageCandidates,
		artifactCandidates,
		diagramCandidates,
		result
	)
	{
		if (!result)
			return false;

		packageCandidates =
			packageCandidates || [];

		artifactCandidates =
			artifactCandidates || [];

		diagramCandidates =
			diagramCandidates || [];


		var technicalDuplicates =
			this._findDuplicateTechnicalPackages(
				packageCandidates
			);

		var analysisPackageDuplicates =
			this._findDuplicateAnalysisPackagesByName(
				packageCandidates
			);

		var artifactDuplicates =
			this._findDuplicateArtifacts(
				artifactCandidates
			);

		var diagramDuplicates =
			this._findDuplicateDiagrams(
				diagramCandidates
			);


		var synchronizer = this;

		var registerGroup = function(group)
		{
			var duplicateGroup =
				synchronizer._createDuplicateGroup(
					group.scope,
					group.objectType,
					group.uniquenessName,
					group.objects
				);

			if (!duplicateGroup)
				return;

			// =====================================================
			// ISSUE OPERATIONNELLE
			// =====================================================

			var issue =
				synchronizer._createDuplicateCheckIssue(
					duplicateGroup
				);

			if (!issue)
				return;


			var registered =
				synchronizer._registerCheckIssueForObjects(
					result,
					issue,
					duplicateGroup.objectGuids
				);


			// =====================================================
			// METRIQUES
			// =====================================================

			if (
				registered === true &&
				result.metrics &&
				result.metrics.duplicates
			)
			{
				result.metrics.duplicates.groups++;

				result.metrics.duplicates.excess +=
					duplicateGroup.excess;
			}
		};
			
		// =====================================================
		// RULE RESULTS - ARTIFACT / LOCAL
		// =====================================================

		if (result.ruleResults)
		{
			var artifactsByAnalysisPackage = {};

			for (var a = 0; a < artifactCandidates.length; a++)
			{
				var artifactCandidate =
					artifactCandidates[a];

				if (
					!artifactCandidate ||
					addin.utils.isEmpty(
						artifactCandidate.analysisPackageGuid
					)
				)
				{
					continue;
				}

				var analysisPackageGuid =
					addin.utils.normalizeGuid(
						artifactCandidate.analysisPackageGuid
					);

				if (!artifactsByAnalysisPackage[analysisPackageGuid])
				{
					artifactsByAnalysisPackage[
						analysisPackageGuid
					] = [];
				}

				artifactsByAnalysisPackage[
					analysisPackageGuid
				].push(
					artifactCandidate
				);
			}


			for (
				var localAnalysisPackageGuid
				in artifactsByAnalysisPackage
			)
			{
				if (
					!artifactsByAnalysisPackage.hasOwnProperty(
						localAnalysisPackageGuid
					)
				)
				{
					continue;
				}


				var localCandidates =
					artifactsByAnalysisPackage[
						localAnalysisPackageGuid
					];


				var localDuplicateGroups = [];

				for (
					var alr = 0;
					alr < artifactDuplicates.local.length;
					alr++
				)
				{
					var localGroup =
						artifactDuplicates.local[alr];

					if (
						localGroup.objects &&
						localGroup.objects.length > 0 &&
						addin.utils.equalsIgnoreCase(
							localGroup.objects[0]
								.analysisPackageGuid,
							localAnalysisPackageGuid
						)
					)
					{
						localDuplicateGroups.push(
							localGroup
						);
					}
				}


				var localRuleResult =
					this._createNameUniquenessRuleResult(
						"LOCAL",
						"ANALYSIS_PACKAGE",
						localAnalysisPackageGuid,
						"ARTIFACT",
						"",
						localCandidates,
						localDuplicateGroups
					);

				if (localRuleResult)
				{
					result.ruleResults.push(
						localRuleResult
					);
				}
			}


			// =================================================
			// RULE RESULT - ARTIFACT / GLOBAL
			// =================================================

			var globalArtifactRuleResult =
				this._createNameUniquenessRuleResult(
					"GLOBAL",
					"ANALYSIS_ROOT",
					"",
					"ARTIFACT",
					"",
					artifactCandidates,
					artifactDuplicates.global
				);

			if (globalArtifactRuleResult)
			{
				result.ruleResults.push(
					globalArtifactRuleResult
				);
			}
			
			// =====================================================
			// RULE RESULTS - DIAGRAM / LOCAL
			// =====================================================

			var diagramsByAnalysisPackage = {};

			for (var d = 0; d < diagramCandidates.length; d++)
			{
				var diagramCandidate =
					diagramCandidates[d];

				if (
					!diagramCandidate ||
					addin.utils.isEmpty(
						diagramCandidate.analysisPackageGuid
					)
				)
				{
					continue;
				}

				var diagramAnalysisPackageGuid =
					addin.utils.normalizeGuid(
						diagramCandidate.analysisPackageGuid
					);

				if (!diagramsByAnalysisPackage[
					diagramAnalysisPackageGuid
				])
				{
					diagramsByAnalysisPackage[
						diagramAnalysisPackageGuid
					] = [];
				}

				diagramsByAnalysisPackage[
					diagramAnalysisPackageGuid
				].push(
					diagramCandidate
				);
			}


			for (
				var localDiagramPackageGuid
				in diagramsByAnalysisPackage
			)
			{
				if (
					!diagramsByAnalysisPackage.hasOwnProperty(
						localDiagramPackageGuid
					)
				)
				{
					continue;
				}

				var localDiagramCandidates =
					diagramsByAnalysisPackage[
						localDiagramPackageGuid
					];


				var localDiagramDuplicates = [];

				for (
					var dlr = 0;
					dlr < diagramDuplicates.local.length;
					dlr++
				)
				{
					var localDiagramGroup =
						diagramDuplicates.local[dlr];

					if (
						localDiagramGroup.objects &&
						localDiagramGroup.objects.length > 0 &&
						addin.utils.equalsIgnoreCase(
							localDiagramGroup.objects[0]
								.analysisPackageGuid,
							localDiagramPackageGuid
						)
					)
					{
						localDiagramDuplicates.push(
							localDiagramGroup
						);
					}
				}


				var localDiagramRuleResult =
					this._createNameUniquenessRuleResult(
						"LOCAL",
						"ANALYSIS_PACKAGE",
						localDiagramPackageGuid,
						"DIAGRAM",
						"",
						localDiagramCandidates,
						localDiagramDuplicates
					);

				if (localDiagramRuleResult)
				{
					result.ruleResults.push(
						localDiagramRuleResult
					);
				}
			}


			// =====================================================
			// RULE RESULT - DIAGRAM / GLOBAL
			// =====================================================

			var globalDiagramRuleResult =
				this._createNameUniquenessRuleResult(
					"GLOBAL",
					"ANALYSIS_ROOT",
					"",
					"DIAGRAM",
					"",
					diagramCandidates,
					diagramDuplicates.global
				);

			if (globalDiagramRuleResult)
			{
				result.ruleResults.push(
					globalDiagramRuleResult
				);
			}
			
			// =====================================================
			// RULE RESULTS - TECHNICAL PACKAGE / LOCAL
			// =====================================================

			var technicalPackagesByParent = {};

			for (var tp = 0; tp < packageCandidates.length; tp++)
			{
				var technicalCandidate =
					packageCandidates[tp];

				if (
					!technicalCandidate ||
					technicalCandidate.objectType !==
						"TECHNICAL_PACKAGE" ||
					addin.utils.isEmpty(
						technicalCandidate.parentGuid
					)
				)
				{
					continue;
				}


				var technicalParentGuid =
					addin.utils.normalizeGuid(
						technicalCandidate.parentGuid
					);


				if (!technicalPackagesByParent[
					technicalParentGuid
				])
				{
					technicalPackagesByParent[
						technicalParentGuid
					] = [];
				}


				technicalPackagesByParent[
					technicalParentGuid
				].push(
					technicalCandidate
				);
			}


			for (
				var parentGuid
				in technicalPackagesByParent
			)
			{
				if (
					!technicalPackagesByParent.hasOwnProperty(
						parentGuid
					)
				)
				{
					continue;
				}


				var localTechnicalCandidates =
					technicalPackagesByParent[
						parentGuid
					];


				var localTechnicalDuplicates = [];

				for (
					var tpr = 0;
					tpr < technicalDuplicates.length;
					tpr++
				)
				{
					if (
						addin.utils.equalsIgnoreCase(
							technicalDuplicates[tpr]
								.parentGuid,
							parentGuid
						)
					)
					{
						localTechnicalDuplicates.push(
							technicalDuplicates[tpr]
						);
					}
				}


				var technicalRuleResult =
					this._createNameUniquenessRuleResult(
						"LOCAL",
						"PACKAGE",
						parentGuid,
						"TECHNICAL_PACKAGE",
						"",
						localTechnicalCandidates,
						localTechnicalDuplicates
					);


				if (technicalRuleResult)
				{
					result.ruleResults.push(
						technicalRuleResult
					);
				}
			}
			
			// =====================================================
			// RULE RESULT - ANALYSIS PACKAGE / GLOBAL
			// =====================================================

			var analysisPackageCandidates = [];

			for (var ap = 0; ap < packageCandidates.length; ap++)
			{
				if (
					packageCandidates[ap] &&
					packageCandidates[ap].objectType ===
						"ANALYSIS_PACKAGE"
				)
				{
					analysisPackageCandidates.push(
						packageCandidates[ap]
					);
				}
			}


			var globalAnalysisPackageRuleResult =
				this._createNameUniquenessRuleResult(
					"GLOBAL",
					"ANALYSIS_ROOT",
					"",
					"ANALYSIS_PACKAGE",
					"",
					analysisPackageCandidates,
					analysisPackageDuplicates
				);

			if (globalAnalysisPackageRuleResult)
			{
				result.ruleResults.push(
					globalAnalysisPackageRuleResult
				);
			}
		}
		
		

		for (
			var t = 0;
			t < technicalDuplicates.length;
			t++
		)
		{
			registerGroup(
				technicalDuplicates[t]
			);
		}


		for (
			var p = 0;
			p < analysisPackageDuplicates.length;
			p++
		)
		{
			registerGroup(
				analysisPackageDuplicates[p]
			);
		}


		for (
			var al = 0;
			al < artifactDuplicates.local.length;
			al++
		)
		{
			registerGroup(
				artifactDuplicates.local[al]
			);
		}

		for (
			var ag = 0;
			ag < artifactDuplicates.global.length;
			ag++
		)
		{
			registerGroup(
				artifactDuplicates.global[ag]
			);
		}


		for (
			var dl = 0;
			dl < diagramDuplicates.local.length;
			dl++
		)
		{
			registerGroup(
				diagramDuplicates.local[dl]
			);
		}

		for (
			var dg = 0;
			dg < diagramDuplicates.global.length;
			dg++
		)
		{
			registerGroup(
				diagramDuplicates.global[dg]
			);
		}

		return true;
	},
	
	_registerUniquenessPackageObjects: function(
		result,
		packageCandidates
	)
	{
		if (
			!result ||
			!result.objects
		)
		{
			return false;
		}

		packageCandidates =
			packageCandidates || [];

		for (
			var i = 0;
			i < packageCandidates.length;
			i++
		)
		{
			var candidate =
				packageCandidates[i];

			if (
				!candidate ||
				addin.utils.isEmpty(
					candidate.guid
				)
			)
			{
				continue;
			}

			var guid =
				addin.utils.normalizeGuid(
					candidate.guid
				);

			/*
			 * Ne jamais remplacer un objet déjà
			 * enregistré par le CHECK.
			 */
			if (result.objects[guid])
				continue;

			this._registerCheckObject(
				result,
				guid,
				"PACKAGE",
				candidate.name,
				candidate.parentGuid
			);
		}

		return true;
	},
		
	_registerUniquenessDiagramObjects: function(
		result,
		diagramCandidates
	)
	{
		if (!result || !result.objects)
			return false;

		diagramCandidates =
			diagramCandidates || [];


		for (
			var i = 0;
			i < diagramCandidates.length;
			i++
		)
		{
			var candidate =
				diagramCandidates[i];

			if (
				!candidate ||
				addin.utils.isEmpty(candidate.guid)
			)
				continue;


			var guid =
				addin.utils.normalizeGuid(
					candidate.guid
				);


			/*
			 * Ne jamais remplacer un diagramme
			 * déjà enregistré par le CHECK.
			 */
			if (result.objects[guid])
				continue;


			this._registerCheckObject(
				result,
				guid,
				"DIAGRAM",
				candidate.name,
				candidate.parentGuid
			);
		}


		return true;
	},
		
	_registerUniquenessArtifactObjects: function(
		result,
		artifactCandidates
	)
	{
		if (!result || !result.objects)
			return false;

		artifactCandidates =
			artifactCandidates || [];


		for (
			var i = 0;
			i < artifactCandidates.length;
			i++
		)
		{
			var candidate =
				artifactCandidates[i];

			if (
				!candidate ||
				addin.utils.isEmpty(candidate.guid)
			)
				continue;


			var guid =
				addin.utils.normalizeGuid(
					candidate.guid
				);


			/*
			 * Ne jamais remplacer un artefact
			 * déjà enregistré par le CHECK.
			 */
			if (result.objects[guid])
				continue;


			this._registerCheckObject(
				result,
				guid,
				"ARTIFACT",
				candidate.name,
				candidate.parentGuid
			);
		}


		return true;
	},
		
	_checkAnalysisUniqueness: function(
		rootPackage,
		result
	)
	{
		if (
			!rootPackage ||
			!result
		)
		{
			return false;
		}

		/*
		 * 1. Packages du Dossier d'analyse.
		 */
		var packageRows =
			addin.repositoryService
				.getAnalysisUniquenessCandidatesSQL(
					rootPackage
				);

		var packageCandidates = [];

		for (
			var i = 0;
			i < packageRows.length;
			i++
		)
		{
			var row =
				packageRows[i];

			var candidate =
				this._createUniquenessCandidate(
					row.guid,
					row.objectType,
					row.name,
					row.parentGuid,
					row.analysisPackageGuid,
					""
				);

			/*
			 * Informations nécessaires aux règles
			 * propres aux packages.
			 */
			if (candidate)
			{
				candidate.packageId =
					row.packageId;

				candidate.parentId =
					row.parentId;

				packageCandidates.push(
					candidate
				);
			}
		}
		
		/*
		 * Enregistre dans le snapshot CHECK
		 * les packages qui n'y figurent pas encore,
		 * notamment les packages techniques.
		 *
		 * Les Analysis Packages déjà enregistrés
		 * par le CHECK sont conservés tels quels.
		 */
		this._registerUniquenessPackageObjects(
			result,
			packageCandidates
		);


		/*
		 * 2. Artefacts.
		 */
		var artifactRows =
			this._getOperationArtifactsIndex(
				rootPackage
			);

		var artifactCandidates =
			this._createArtifactUniquenessCandidates(
				artifactRows,
				packageRows
			);
			
		this._registerUniquenessArtifactObjects(
			result,
			artifactCandidates
		);


		/*
		 * 3. Diagrammes.
		 */
		var diagramRows =
			 this._getOperationDiagramsIndex(
				rootPackage
			);

		var diagramCandidates =
			this._createDiagramUniquenessCandidates(
				diagramRows,
				packageRows
			);
			
		this._registerUniquenessDiagramObjects(
			result,
			diagramCandidates
		);

		return this._checkUniquenessCandidates(
			packageCandidates,
			artifactCandidates,
			diagramCandidates,
			result
		);
		
	},
	
	_findPackageGuidById: function(
		packageId,
		packageCandidates
	)
	{
		if (packageId == null || !packageCandidates)
			return "";

		var targetPackageId =
			String(packageId);

		for (var i = 0; i < packageCandidates.length; i++)
		{
			var candidate =
				packageCandidates[i];

			if (!candidate)
				continue;

			if (
				String(candidate.packageId) ===
				targetPackageId
			)
			{
				if (addin.utils.isEmpty(candidate.guid))
					return "";

				return addin.utils.normalizeGuid(
					candidate.guid
				);
			}
		}

		return "";
	},
			
	_findOwningAnalysisPackageGuid: function(
		packageId,
		packageCandidates
	)
	{
		if (
			packageId == null ||
			!packageCandidates
		)
		{
			return "";
		}

		var byPackageId = {};

		for (
			var i = 0;
			i < packageCandidates.length;
			i++
		)
		{
			var candidate =
				packageCandidates[i];

			byPackageId[
				String(candidate.packageId)
			] =
				candidate;
		}

		var current =
			byPackageId[
				String(packageId)
			];

		while (current)
		{
			/*
			 * Si le package courant appartient déjà
			 * à un Analysis Package, cette information
			 * est notre référence métier.
			 */
			if (
				!addin.utils.isEmpty(
					current.analysisPackageGuid
				)
			)
			{
				return current.analysisPackageGuid;
			}

			/*
			 * Sinon on remonte au parent.
			 *
			 * Cela couvre notamment la branche
			 * technique du ROOT (_Librairie),
			 * qui finira naturellement sans owner.
			 */
			if (
				!current.parentId ||
				Number(current.parentId) === 0
			)
			{
				break;
			}

			current =
				byPackageId[
					String(current.parentId)
				];
		}

		return "";
	},
	
	_findDuplicateTechnicalPackages: function(candidates)
	{
		var groups = {};
		var duplicates = [];

		candidates =
			candidates || [];

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				!candidate ||
				candidate.objectType !==
					"TECHNICAL_PACKAGE"
			)
			{
				continue;
			}

			var uniquenessName =
				this._normalizeUniquenessName(
					candidate.name
				);

			if (
				addin.utils.isEmpty(
					uniquenessName
				) ||
				addin.utils.isEmpty(
					candidate.parentGuid
				)
			)
			{
				continue;
			}

			/*
			 * Règle :
			 * même parent direct + même nom normalisé.
			 */
			var key =
				candidate.parentGuid +
				"|" +
				uniquenessName;

			if (!groups[key])
				groups[key] = [];

			groups[key].push(
				candidate
			);
		}

		for (var key in groups)
		{
			if (
				!groups.hasOwnProperty(key)
			)
			{
				continue;
			}

			var members =
				groups[key];

			if (members.length <= 1)
				continue;

			duplicates.push({
				scope:
					"LOCAL",

				objectType:
					"TECHNICAL_PACKAGE",

				uniquenessName:
					this._normalizeUniquenessName(
						members[0].name
					),

				parentGuid:
					members[0].parentGuid,

				count:
					members.length,

				excess:
					members.length - 1,

				objects:
					members
			});
		}

		return duplicates;
	},
		
	_findDuplicateAnalysisPackagesByName: function(candidates)
	{
		var groups = {};
		var duplicates = [];

		candidates =
			candidates || [];

		for (
			var i = 0;
			i < candidates.length;
			i++
		)
		{
			var candidate =
				candidates[i];

			if (
				!candidate ||
				candidate.objectType !==
					"ANALYSIS_PACKAGE"
			)
			{
				continue;
			}

			var uniquenessName =
				this._normalizeUniquenessName(
					candidate.name
				);

			if (
				addin.utils.isEmpty(
					uniquenessName
				)
			)
			{
				continue;
			}

			/*
			 * Règle :
			 * le nom d'un package représentant un
			 * Analysis Element est unique dans
			 * l'ensemble du Dossier d'analyse.
			 *
			 * Le parent n'intervient donc pas dans la clé.
			 */
			if (!groups[uniquenessName])
			{
				groups[uniquenessName] =
					[];
			}

			groups[
				uniquenessName
			].push(
				candidate
			);
		}

		for (
			var uniquenessName in groups
		)
		{
			if (
				!groups.hasOwnProperty(
					uniquenessName
				)
			)
			{
				continue;
			}

			var members =
				groups[
					uniquenessName
				];

			if (members.length <= 1)
				continue;

			duplicates.push({
				scope:
					"GLOBAL",

				objectType:
					"ANALYSIS_PACKAGE",

				uniquenessName:
					uniquenessName,

				count:
					members.length,

				excess:
					members.length - 1,

				objects:
					members
			});
		}

		return duplicates;
	},
		
	_registerCheckIssue: function(
		result,
		issue
	)
	{
		if (!result || !issue)
			return false;

		result.issues.push(issue);

		this._incrementCheckSummary(
			result.summary,
			issue
		);

		// Une règle de diagramme reste portée par ce diagramme.
		// objectGuid peut identifier l'artefact concerné par l'action,
		// sans désigner le propriétaire du résultat CHECK.
		var ownerGuid = !addin.utils.isEmpty(issue.diagramGuid)
			? issue.diagramGuid
			: issue.objectGuid;

		var objectResult = this._getCheckObject(result, ownerGuid);
		if (!objectResult)
			return true;

		objectResult.issues.push(issue);

		if (issue.severity === addin.fbaConstants.CHECK_SEVERITY_ERROR)
			objectResult.summary.errors++;
		else if (issue.severity === addin.fbaConstants.CHECK_SEVERITY_WARNING)
			objectResult.summary.warnings++;

		return true;
	},
		
	_checkRuleBelongsToObject: function(ruleResult, objectGuid)
	{
		if (!ruleResult || addin.utils.isEmpty(objectGuid))
			return false;

		// Une règle exécutée sur un diagramme reste dans son snapshot,
		// même lorsque l'objet examiné est un artefact représenté.
		var ownerGuid =
			addin.utils.equalsIgnoreCase(ruleResult.scopeType, "DIAGRAM")
				? ruleResult.scopeGuid
				: ruleResult.objectGuid;

		return !addin.utils.isEmpty(ownerGuid) &&
			addin.utils.equalsIgnoreCase(ownerGuid, objectGuid);
	},

	_createCheckRuleResult: function(
		rule,
		scope,
		scopeType,
		scopeGuid,
		objectType,
		analysisElementGuid,
		objectGuid,
		requirement,
		expected,
		actual,
		passed
	)
	{
		if (addin.utils.isEmpty(rule))
			return null;

		return {
			rule:
				String(rule),

			scope:
				scope || "",

			scopeType:
				scopeType || "",

			scopeGuid:
				addin.utils.isEmpty(scopeGuid)
					? ""
					: addin.utils.normalizeGuid(
						scopeGuid
					),

			objectType:
				objectType || "",

			analysisElementGuid:
				addin.utils.isEmpty(analysisElementGuid)
					? ""
					: addin.utils.normalizeGuid(
						analysisElementGuid
					),

			objectGuid:
				addin.utils.isEmpty(objectGuid)
					? ""
					: addin.utils.normalizeGuid(
						objectGuid
					),

			requirement:
				requirement || "",

			expected:
				expected || {},

			actual:
				actual || {},

			passed:
				passed === true
		};
	},
	
	
	_createNameUniquenessRuleResult: function(
		scope,
		scopeType,
		scopeGuid,
		objectType,
		analysisElementGuid,
		candidates,
		duplicateGroups
	)
	{
		candidates =
			candidates || [];

		duplicateGroups =
			duplicateGroups || [];


		var duplicates = [];
		var duplicateExcess = 0;


		for (
			var i = 0;
			i < duplicateGroups.length;
			i++
		)
		{
			var group =
				duplicateGroups[i];

			if (!group)
				continue;


			var canonicalGroup =
				this._createDuplicateGroup(
					group.scope,
					group.objectType,
					group.uniquenessName,
					group.objects
				);


			if (!canonicalGroup)
				continue;


			duplicates.push({
				name:
					canonicalGroup.uniquenessName,

				count:
					canonicalGroup.count,

				excess:
					canonicalGroup.excess,

				objectGuids:
					canonicalGroup.objectGuids
			});


			duplicateExcess +=
				canonicalGroup.excess;
		}


		return this._createCheckRuleResult(
			"NAME_UNIQUENESS",

			scope,
			scopeType,
			scopeGuid,

			objectType,

			analysisElementGuid,

			"",

			"",

			{
				maxOccurrences: 1
			},

			{
				checked:
					candidates.length,

				duplicateGroups:
					duplicates.length,

				duplicateExcess:
					duplicateExcess,

				duplicates:
					duplicates
			},

			duplicates.length === 0
		);
	},
		
	_registerCheckIssueForObjects: function(
		result,
		issue,
		objectGuids
	)
	{
		if (
			!result ||
			!issue
		)
		{
			return false;
		}

		objectGuids =
			objectGuids || [];

		/*
		 * 1. Enregistrement GLOBAL :
		 *    une seule fois.
		 */
		result.issues.push(
			issue
		);

		// Count severity and action once per group; object references do not add counts.
		this._incrementCheckSummary(result.summary, issue);

		/*
		 * 2. Référencement sur chacun des
		 *    vrais objets concernés.
		 *
		 *    Aucun nouvel ajout dans result.issues
		 *    et aucun nouvel incrément du summary global.
		 */
		var registered = {};

		for (
			var i = 0;
			i < objectGuids.length;
			i++
		)
		{
			var guid =
				addin.utils.normalizeGuid(
					objectGuids[i]
				);

			/*
			 * Évite de rattacher deux fois l'issue
			 * au même objet si le tableau contient
			 * accidentellement deux fois le GUID.
			 */
			if (
				addin.utils.isEmpty(guid) ||
				registered[guid]
			)
			{
				continue;
			}

			registered[guid] =
				true;

			var checkObject =
				this._getCheckObject(
					result,
					guid
				);

			if (!checkObject)
				continue;

			checkObject.issues.push(
				issue
			);

			if (
				issue.severity === "ERROR"
			)
			{
				checkObject.summary.errors++;
			}
			else if (
				issue.severity === "WARNING"
			)
			{
				checkObject.summary.warnings++;
			}
		}

		return true;
	},
		
		
	_createArtifactCheckResult: function(
		artifactDefinition,
		artifact)
	{
		return {
			definition: {
				guid:
					artifactDefinition
						? artifactDefinition.prototypeGuid
						: "",

				type:
					artifactDefinition
						? artifactDefinition.elementType
						: "",

				stereotype:
					artifactDefinition
						? artifactDefinition.stereotype
						: "",

				importance:
					artifactDefinition
						? artifactDefinition.importanceLevel
						: "",

				multiplicity:
					artifactDefinition &&
					artifactDefinition.multiplicity
						? artifactDefinition.multiplicity
						: ""
			},

			artifact: {
				guid:
					artifact
						? artifact.ElementGUID
						: "",

				name:
					artifact
						? artifact.Name
						: "",

				type:
					artifact
						? artifact.Type
						: "",

				stereotype:
					artifact
						? artifact.Stereotype
						: ""
			},

			found:
				artifact != null,

			status:
				artifact
					? addin.fbaConstants.CHECK_STATUS_COMPLIANT
					: addin.fbaConstants.CHECK_STATUS_NON_COMPLIANT,

			issues: []
		};
	},
	
	_getDiagramCheckArtifactDefinitions: function(localDefinitions, diagramDefinitions, checkResult)
	{
		var definitions = localDefinitions.slice(0);
		var needsExternalDefinitions = false;

		for (var i = 0; i < diagramDefinitions.length; i++)
		{
			var found = false;
			for (var j = 0; j < definitions.length; j++)
			{
				if (addin.utils.equalsIgnoreCase(
					definitions[j].prototypeGuid, diagramDefinitions[i].guid))
				{
					found = true;
					break;
				}
			}
			if (!found) needsExternalDefinitions = true;
		}

		if (!needsExternalDefinitions)
			return definitions;

		// Cache limité à ce CHECK : aucun état conservé entre deux contrôles.
		var candidates = checkResult
			? checkResult.diagramArtifactDefinitionsCache
			: null;

		if (!candidates)
		{
			candidates = [];
			var analysisDefinitions = this._getOperationDefinitions();
			var artifactIndex = this._getOperationArtifactDefinitionsIndex();
			var tagIndex = this._getOperationAnalysisElementTagsIndex();

			for (var a = 0; a < analysisDefinitions.length; a++)
			{
				var loadedDefinitions = this._loadArtifactDefinitions(
					analysisDefinitions[a], artifactIndex, tagIndex);
				for (var loadedIndex = 0; loadedIndex < loadedDefinitions.length; loadedIndex++)
					candidates.push(loadedDefinitions[loadedIndex]);
			}

			if (checkResult)
				Object.defineProperty(checkResult, "diagramArtifactDefinitionsCache", {
					value: candidates,
					enumerable: false,
					configurable: true
				});
		}

		{
			for (var c = 0; c < candidates.length; c++)
			{
				var exists = false;
				for (var d = 0; d < definitions.length; d++)
				{
					if (addin.utils.equalsIgnoreCase(
						definitions[d].connectorGuid, candidates[c].connectorGuid))
					{
						exists = true;
						break;
					}
				}
				if (!exists) definitions.push(candidates[c]);
			}
		}
		return definitions;
	},

	_findCanonicalArtifactDefinitions: function(
		diagramArtifactDefinition,
		artifactDefinitions)
	{
		var result = [];

		if (
			!diagramArtifactDefinition ||
			!artifactDefinitions
		)
		{
			return result;
		}


		// Le prototype du diagramme source fournit l'identité de référence.
		for (var exactIndex = 0; exactIndex < artifactDefinitions.length; exactIndex++)
		{
			var exactDefinition = artifactDefinitions[exactIndex];
			if (exactDefinition && addin.utils.equalsIgnoreCase(
				exactDefinition.prototypeGuid, diagramArtifactDefinition.guid))
			{
				result.push(exactDefinition);
			}
		}
		if (result.length > 0)
			return result;

		for (
			var i = 0;
			i < artifactDefinitions.length;
			i++
		)
		{
			var candidateDefinition =
				artifactDefinitions[i];


			if (!candidateDefinition)
			{
				continue;
			}


			if (
				addin.utils.equalsIgnoreCase(
					candidateDefinition.elementType,
					diagramArtifactDefinition.type
				) &&
				addin.utils.equalsIgnoreCase(
					candidateDefinition.stereotype,
					diagramArtifactDefinition.stereotype
				)
			)
			{
				result.push(
					candidateDefinition
				);
			}
		}


		return result;
	},
		
	
	_findArtifactsOnDiagramMatchingDefinition: function(
		diagram,
		canonicalArtifactDefinition,
		artifactDefinitions)
	{
		var result = [];

		if (
			!diagram ||
			!canonicalArtifactDefinition
		)
		{
			return result;
		}


		var diagramObjects =
			diagram.DiagramObjects;


		if (!diagramObjects)
		{
			return result;
		}


		for (
			var i = 0;
			i < diagramObjects.Count;
			i++
		)
		{
			var diagramObject =
				diagramObjects.GetAt(i);


			if (!diagramObject)
			{
				continue;
			}


			var artifact =
				addin.repositoryService.getElementById(
					diagramObject.ElementID
				);


			if (!artifact)
			{
				continue;
			}


			if (
				this._artifactMatchesFullDefinition(
					artifact,
					canonicalArtifactDefinition,
					artifactDefinitions
				)
			)
			{
				result.push(
					artifact
				);
			}
		}


		return result;
	},
		
		
	_checkDiagramNote: function(
		diagram,
		diagramDefinition,
		effectiveConfig,
		diagramCheckResult,
		checkResult
	)
	{
		if (
			!diagram ||
			!diagramDefinition ||
			!effectiveConfig ||
			!diagramCheckResult
		)
		{
			return;
		}


		var noteRequirement =
			effectiveConfig.noteRequirement ||
			addin.fbaConstants.NOTE_REQUIREMENT_OPTIONAL;


		var diagramHasNote =
			this._hasNote(
				diagram
			);


		addin.logger.info(
			"CHECK NOTE diagramme"
			+ " | Diagram=" + diagram.Name
			+ " | ConfigGUID=" + effectiveConfig.sourceConfigGuid
			+ " | Config=" + effectiveConfig.sourceConfigName
			+ " | Requirement=" + noteRequirement
			+ " | HasNote=" + diagramHasNote
		);


		// =====================================================
		// 48D - RULE RESULT
		// NOTE REQUIREMENT - DIAGRAM
		// =====================================================

		if (
			checkResult &&
			checkResult.ruleResults
		)
		{
			var diagramNotePassed = true;


			if (
				addin.utils.equalsIgnoreCase(
					noteRequirement,
					"Obligatoire"
				) &&
				!diagramHasNote
			)
			{
				diagramNotePassed = false;
			}


			var diagramNoteRuleResult =
				this._createCheckRuleResult(
					"NOTE_REQUIREMENT",

					"LOCAL",
					"DIAGRAM",
					diagram.DiagramGUID,

					"DIAGRAM",

					"",

					diagram.DiagramGUID,

					noteRequirement,

					{
						requirement:
							noteRequirement
					},

					{
						present:
							diagramHasNote
					},

					diagramNotePassed
				);


			if (diagramNoteRuleResult)
			{
				checkResult.ruleResults.push(
					diagramNoteRuleResult
				);
			}
		}


		// =====================================================
		// METRIQUE NOTE
		// =====================================================

		if (diagramHasNote)
		{
			diagramCheckResult
				.metrics.diagrams.withNote++;
			
			checkResult
				.metrics.diagrams.withNote++;

			return;
		}


		diagramCheckResult
			.metrics.diagrams.withoutNote++;
		
		checkResult
			.metrics.diagrams.withoutNote++;


		// =====================================================
		// EXIGENCE DE NOTE DU DGC EFFECTIF
		// =====================================================

		var noteSeverity =
			this._getNoteMissingSeverity(
				noteRequirement
			);


		// Optionnel / aucune contrainte
		if (noteSeverity === "")
			return;


		// =====================================================
		// ISSUE
		// =====================================================

		var issue =
		{
			code:
				addin.fbaConstants
					.CHECK_ISSUE_DIAGRAM_NOTE_MISSING,

			severity:
				noteSeverity,

			action:
				addin.fbaConstants
					.CHECK_ACTION_MANUAL_COMPLETE,

			objectType:
				"DIAGRAM",

			objectGuid:
				diagram.DiagramGUID,

			objectName:
				diagram.Name,

			diagramDefinitionGuid:
				diagramDefinition.guid,

			diagramMetaType:
				diagramDefinition.metaType,

			diagramConfigGuid:
				effectiveConfig.sourceConfigGuid,

			noteRequirement:
				noteRequirement,

			message:
				"La Note du diagramme est absente "
				+ "alors que le métamodèle la définit comme "
				+ noteRequirement
				+ "."
		};


		diagramCheckResult.issues.push(
			issue
		);


		addin.logger.warning(
			"Note de diagramme absente"
			+ " | Diagram="
			+ diagram.Name
			+ " | Requirement="
			+ noteRequirement
			+ " | Severity="
			+ noteSeverity
			+ " | Action=MANUAL_COMPLETE"
		);
	},
		
	_checkDiagramArtifacts: function(
		diagram,
		diagramDefinition,
		diagramCheckResult,
		artifactDefinitions,
		checkResult)
	{
		if (
			!diagram ||
			!diagramDefinition ||
			!diagramCheckResult
		)
		{
			return false;
		}


		if (!diagramCheckResult.artifacts)
		{
			diagramCheckResult.artifacts = [];
		}


		// ========================================================
		// 1. ARTEFACTS ATTENDUS SUR LE DIAGRAMME
		// ========================================================

		var diagramArtifactDefinitions =
			this._loadDiagramArtifactDefinitions(
				diagramDefinition.diagram
			);


		if (!diagramArtifactDefinitions)
		{
			diagramArtifactDefinitions = [];
		}


		var localArtifactDefinitions = artifactDefinitions || [];
		artifactDefinitions = this._getDiagramCheckArtifactDefinitions(
			localArtifactDefinitions, diagramArtifactDefinitions, checkResult);

		addin.logger.debug(
			"CHECK artefacts diagramme"
			+ " | Diagram=" + diagram.Name
			+ " | Expected="
			+ diagramArtifactDefinitions.length
		);


		// ========================================================
		// 2. POUR CHAQUE DEFINITION ATTENDUE
		// ========================================================

		for (
			var i = 0;
			i < diagramArtifactDefinitions.length;
			i++
		)
		{
			var diagramArtifactDefinition =
				diagramArtifactDefinitions[i];


			// ----------------------------------------------------
			// Résolution vers la définition canonique
			// ----------------------------------------------------

			var canonicalDefinitions =
				this._findCanonicalArtifactDefinitions(
					diagramArtifactDefinition,
					artifactDefinitions
				);


			if (!canonicalDefinitions)
			{
				canonicalDefinitions = [];
			}


			// ----------------------------------------------------
			// Aucun mapping canonique
			// ----------------------------------------------------

			if (canonicalDefinitions.length == 0)
			{
				addin.logger.warning(
					"Définition canonique introuvable"
					+ " | Diagram=" + diagram.Name
					+ " | Artifact="
					+ diagramArtifactDefinition.name
					+ " | Type="
					+ diagramArtifactDefinition.type
					+ " | Stereo="
					+ diagramArtifactDefinition.stereotype
				);

				continue;
			}


			// ----------------------------------------------------
			// Mapping ambigu
			// ----------------------------------------------------

			if (canonicalDefinitions.length > 1)
			{
				addin.logger.warning(
					"Définition canonique ambiguë"
					+ " | Diagram=" + diagram.Name
					+ " | Artifact="
					+ diagramArtifactDefinition.name
					+ " | Count="
					+ canonicalDefinitions.length
				);

				continue;
			}


			var canonicalArtifactDefinition =
				canonicalDefinitions[0];


			// ====================================================
			// 3. ARTEFACTS REELS PRESENTS SUR LE DIAGRAMME
			// ====================================================

			var matchingArtifacts =
				this._findArtifactsOnDiagramMatchingDefinition(
					diagram,
					canonicalArtifactDefinition,
					artifactDefinitions
				);


			if (!matchingArtifacts)
			{
				matchingArtifacts = [];
			}


			// ====================================================
			// 48C - RULE RESULT
			// DIAGRAM ARTIFACT PRESENCE
			// ====================================================

			if (
				checkResult &&
				checkResult.ruleResults
			)
			{
				var diagramArtifactPresenceRuleResult =
					this._createCheckRuleResult(
						"DIAGRAM_ARTIFACT_PRESENCE",

						"LOCAL",
						"DIAGRAM",
						diagram.DiagramGUID,

						"ARTIFACT_DEFINITION",

						"",

						canonicalArtifactDefinition.prototypeGuid,

						"Obligatoire",

						{
							min: 1
						},

						{
							count:
								matchingArtifacts.length,

							found:
								matchingArtifacts.length > 0
						},

						matchingArtifacts.length > 0
					);


				if (diagramArtifactPresenceRuleResult)
				{
					checkResult.ruleResults.push(
						diagramArtifactPresenceRuleResult
					);
				}
			}


			// ====================================================
			// 4. AUCUN ARTEFACT TROUVE
			// ====================================================


			// ====================================================
			// 4. AUCUN ARTEFACT TROUVE
			// ====================================================

			if (matchingArtifacts.length == 0)
			{
				var missingArtifactResult =
					this._createDiagramArtifactCheckResult(
						diagramArtifactDefinition,
						null
					);


				var missingArtifactIssue = {

					code:
						addin.fbaConstants
							.CHECK_ISSUE_MANDATORY_DIAGRAM_ARTIFACT_MISSING,

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_ERROR,

					action:
						addin.fbaConstants
							.CHECK_ACTION_MANUAL_COMPLETE,

					objectType:
						"DIAGRAM_ARTIFACT",

					objectGuid:
						"",

					objectName:
						"",

					diagramGuid:
						diagram.DiagramGUID,

					diagramName:
						diagram.Name,

					diagramArtifactDefinitionGuid:
						diagramArtifactDefinition.guid,

					artifactType:
						diagramArtifactDefinition.type,

					stereotype:
						diagramArtifactDefinition.stereotype,

					message:
						"Un artefact attendu est absent du diagramme."
				};


				missingArtifactResult.issues.push(
					missingArtifactIssue
				);


				diagramCheckResult.issues.push(
					missingArtifactIssue
				);


				diagramCheckResult.artifacts.push(
					missingArtifactResult
				);


				addin.logger.warning(
					"Artefact attendu absent du diagramme"
					+ " | Diagram=" + diagram.Name
					+ " | Definition="
					+ diagramArtifactDefinition.name
					+ " | Type="
					+ diagramArtifactDefinition.type
					+ " | Stereo="
					+ diagramArtifactDefinition.stereotype
					+ " | Action="
					+ addin.fbaConstants.CHECK_ACTION_MANUAL_COMPLETE
				);


				continue;
			}

			// ====================================================
			// 5. ARTEFACT(S) ATTENDU(S) TROUVE(S)
			// ====================================================

			for (
				var artifactIndex = 0;
				artifactIndex < matchingArtifacts.length;
				artifactIndex++
			)
			{
				var artifact =
					matchingArtifacts[artifactIndex];


				var artifactResult =
					this._createDiagramArtifactCheckResult(
						diagramArtifactDefinition,
						artifact
					);
				
				var belongsToCurrentAnalysis = false;
				for (var localIndex = 0; localIndex < localArtifactDefinitions.length; localIndex++)
				{
					if (addin.utils.equalsIgnoreCase(
						localArtifactDefinitions[localIndex].prototypeGuid,
						canonicalArtifactDefinition.prototypeGuid))
					{
						belongsToCurrentAnalysis = true;
						break;
					}
				}

				// ====================================================
				// 48E.1 - RULE RESULT
				// ARTIFACT LOCATION
				// ====================================================

				if (
					checkResult &&
					checkResult.ruleResults
				)
				{
					var artifactLocationPassed =
						!belongsToCurrentAnalysis ||
						artifact.PackageID == diagram.PackageID;


					var artifactLocationRuleResult =
						this._createCheckRuleResult(
							"ARTIFACT_LOCATION",

							"LOCAL",
							"DIAGRAM",
							diagram.DiagramGUID,

							"ARTIFACT",

							"",

							artifact.ElementGUID,

							"",

							{
								packageId:
									diagram.PackageID
							},

							{
								packageId:
									artifact.PackageID
							},

							artifactLocationPassed
						);


					if (artifactLocationRuleResult)
					{
						checkResult.ruleResults.push(
							artifactLocationRuleResult
						);
					}
				}

				// ------------------------------------------------
				// 5.1 VERIFICATION DU CONTEXTE DU PACKAGE
				// ------------------------------------------------

				if (belongsToCurrentAnalysis && artifact.PackageID != diagram.PackageID)
				{
					var artifactParentPackage =
						addin.repositoryService.getPackageById(
							artifact.PackageID
						);

					var artifactParentGuid =
						artifactParentPackage
							? artifactParentPackage.PackageGUID
							: "";

					this._registerCheckObject(
						checkResult,
						artifact.ElementGUID,
						"ARTIFACT",
						artifact.Name,
						artifactParentGuid
					);
					
					var foreignContextIssue = {

						code:
							addin.fbaConstants
								.CHECK_ISSUE_FOREIGN_ARTIFACT,

						severity:
							addin.fbaConstants
								.CHECK_SEVERITY_ERROR,

						action:
							addin.fbaConstants
								.CHECK_ACTION_MANUAL_MOVE,

						objectType:
							"ARTIFACT",

						objectGuid:
							artifact.ElementGUID,

						objectName:
							artifact.Name,

						diagramGuid:
							diagram.DiagramGUID,

						diagramName:
							diagram.Name,

						artifactType:
							artifact.Type,

						stereotype:
							artifact.StereotypeEx,

						reason:
							"OUTSIDE_ANALYSIS_PACKAGE",

						artifactPackageId:
							artifact.PackageID,

						expectedPackageId:
							diagram.PackageID,

						message:
							"Un artefact présent dans le diagramme "
							+ "appartient à un autre package."
					};


					artifactResult.issues.push(
						foreignContextIssue
					);


					artifactResult.status =
						addin.fbaConstants
							.CHECK_STATUS_NON_COMPLIANT;


					diagramCheckResult.issues.push(
						foreignContextIssue
					);


					addin.logger.warning(
						"Artefact hors contexte détecté sur diagramme"
						+ " | Diagram=" + diagram.Name
						+ " | Artifact=" + artifact.Name
						+ " | GUID=" + artifact.ElementGUID
						+ " | PackageID=" + artifact.PackageID
						+ " | ExpectedPackageID=" + diagram.PackageID
						+ " | Action="
						+ addin.fbaConstants.CHECK_ACTION_MANUAL_MOVE
					);
				}


				diagramCheckResult.artifacts.push(
					artifactResult
				);


				addin.logger.debug(
					"Artefact attendu trouvé sur diagramme"
					+ " | Diagram=" + diagram.Name
					+ " | Artifact=" + artifact.Name
					+ " | GUID=" + artifact.ElementGUID
					+ " | Status=" + artifactResult.status
				);
			}

			// ========================================================
			// 6. ARTEFACTS NON AUTORISES PRESENTS SUR LE DIAGRAMME
			// ========================================================

			var diagramObjects =
				diagram.DiagramObjects;


			for (
				var objectIndex = 0;
				objectIndex < diagramObjects.Count;
				objectIndex++
			)
			{
				var diagramObject =
					diagramObjects.GetAt(objectIndex);


				if (!diagramObject)
					continue;


				var diagramArtifact =
					addin.repositoryService.getElementById(
						diagramObject.ElementID
					);


				if (!diagramArtifact)
					continue;


				// ----------------------------------------------------
				// Vérifie si l'artefact appartient à au moins une
				// définition autorisée par le diagramme
				// ----------------------------------------------------

				var artifactAllowed =
					this._isArtifactAllowedOnDiagram(
						diagramArtifact,
						diagramArtifactDefinitions,
						artifactDefinitions
					);
				
				// ====================================================
				// 48E.2 - RULE RESULT
				// ARTIFACT ALLOWED ON DIAGRAM
				// ====================================================

				if (
					checkResult &&
					checkResult.ruleResults
				)
				{
					var artifactAllowedRuleResult =
						this._createCheckRuleResult(
							"ARTIFACT_ALLOWED_ON_DIAGRAM",

							"LOCAL",
							"DIAGRAM",
							diagram.DiagramGUID,

							"ARTIFACT",

							"",

							diagramArtifact.ElementGUID,

							"",

							{
								allowed:
									true
							},

							{
								allowed:
									artifactAllowed
							},

							artifactAllowed === true
						);


					if (artifactAllowedRuleResult)
					{
						checkResult.ruleResults.push(
							artifactAllowedRuleResult
						);
					}
				}

				// ----------------------------------------------------
				// Artefact autorisé
				//
				// Le contrôle de son appartenance au package attendu
				// est déjà effectué dans la section 5.
				// ----------------------------------------------------

				if (artifactAllowed)
					continue;


				// ====================================================
				// 6.1 ARTEFACT NON AUTORISE
				// ====================================================
				var artifactParentPackage =
					addin.repositoryService.getPackageById(
						diagramArtifact.PackageID
					);

				var artifactParentGuid =
					artifactParentPackage
						? artifactParentPackage.PackageGUID
						: "";

				this._registerCheckObject(
					checkResult,
					diagramArtifact.ElementGUID,
					"ARTIFACT",
					diagramArtifact.Name,
					artifactParentGuid
				);
				
				var foreignArtifactResult = {

					definition: {
						guid: "",
						name: "",
						type: "",
						stereotype: ""
					},

					artifact: {
						guid:
							diagramArtifact.ElementGUID,

						name:
							diagramArtifact.Name,

						type:
							diagramArtifact.Type,

						stereotype:
							diagramArtifact.StereotypeEx
					},

					found: true,

					status:
						addin.fbaConstants
							.CHECK_STATUS_NON_COMPLIANT,

					issues: []
				};


				var foreignArtifactIssue = {

					code:
						addin.fbaConstants
							.CHECK_ISSUE_FOREIGN_ARTIFACT,

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_ERROR,

					action:
						addin.fbaConstants
							.CHECK_ACTION_MANUAL_REMOVE,

					objectType:
						"ARTIFACT",

					objectGuid:
						diagramArtifact.ElementGUID,

					objectName:
						diagramArtifact.Name,

					diagramGuid:
						diagram.DiagramGUID,

					diagramName:
						diagram.Name,

					artifactType:
						diagramArtifact.Type,

					stereotype:
						diagramArtifact.StereotypeEx,

					reason:
						"NOT_ALLOWED_ON_DIAGRAM",

					message:
						"Un artefact présent dans le diagramme "
						+ "n'est pas autorisé par sa définition."
				};


				// ----------------------------------------------------
				// Issue portée par l'artefact
				// ----------------------------------------------------

				foreignArtifactResult.issues.push(
					foreignArtifactIssue
				);


				// ----------------------------------------------------
				// Issue remontée au diagramme
				// ----------------------------------------------------

				diagramCheckResult.issues.push(
					foreignArtifactIssue
				);


				// ----------------------------------------------------
				// Artefact étranger visible dans la hiérarchie
				// ----------------------------------------------------

				diagramCheckResult.artifacts.push(
					foreignArtifactResult
				);


				// ----------------------------------------------------
				// Métriques
				// ----------------------------------------------------

				diagramCheckResult.metrics.artifacts.found++;

				diagramCheckResult.metrics.artifacts.foreign++;

				diagramCheckResult.metrics.artifacts.nonCompliant++;


				// ----------------------------------------------------
				// Log
				// ----------------------------------------------------

				addin.logger.warning(
					"Artefact non autorisé détecté sur diagramme"
					+ " | Diagram=" + diagram.Name
					+ " | Artifact=" + diagramArtifact.Name
					+ " | GUID=" + diagramArtifact.ElementGUID
					+ " | Type=" + diagramArtifact.Type
					+ " | Stereo=" + diagramArtifact.StereotypeEx
					+ " | Reason=NOT_ALLOWED_ON_DIAGRAM"
					+ " | Action="
					+ addin.fbaConstants.CHECK_ACTION_MANUAL_REMOVE
				);
			}
		}

		return true;
	},
		
		
	_isArtifactAllowedOnDiagram: function(
		artifact,
		diagramArtifactDefinitions,
		artifactDefinitions)
	{
		if (!artifact)
			return false;

		if (!diagramArtifactDefinitions)
			diagramArtifactDefinitions = [];

		if (!artifactDefinitions)
			artifactDefinitions = [];


		// ====================================================
		// 1. PARCOURIR LES DEFINITIONS AUTORISEES DU DIAGRAMME
		// ====================================================

		for (
			var i = 0;
			i < diagramArtifactDefinitions.length;
			i++
		)
		{
			var diagramArtifactDefinition =
				diagramArtifactDefinitions[i];


			if (!diagramArtifactDefinition)
				continue;


			// ------------------------------------------------
			// Résolution vers la définition canonique
			// ------------------------------------------------

			var canonicalDefinitions =
				this._findCanonicalArtifactDefinitions(
					diagramArtifactDefinition,
					artifactDefinitions
				);


			if (!canonicalDefinitions)
				canonicalDefinitions = [];


			// Une définition ambiguë ou inexistante
			// ne permet pas de déclarer l'artefact conforme.

			if (canonicalDefinitions.length != 1)
				continue;


			var canonicalArtifactDefinition =
				canonicalDefinitions[0];


			// ------------------------------------------------
			// Vérification sémantique de l'artefact
			// ------------------------------------------------

			if (
				this._artifactMatchesFullDefinition(
					artifact,
					canonicalArtifactDefinition,
					artifactDefinitions
				)
			)
			{
				return true;
			}
		}


		return false;
	},
	
		
	_parseArtifactName: function(name)
	{
		var result = {
			originalName: name || "",
			technical: false,
			hasPrefix: false,
			prefix: "",
			hasNumber: false,
			number: null,
			businessName: "",
			formatValid: false
		};

		var value = addin.utils.trim(name || "");

		if (value === "")
		{
			return result;
		}

		// Le "_" est le marqueur technique Framework BA.
		// Il ne fait pas partie du préfixe métier.
		if (value.charAt(0) === "_")
		{
			result.technical = true;
			value = addin.utils.trim(
				value.substring(1)
			);
		}

		/*
		 * Extraction souple :
		 *
		 * EXG004 - Exigence
		 * EXG4 - Exigence
		 * EXG004 Exigence
		 *
		 * doivent tous permettre d'identifier EXG et le numéro.
		 */
		var prefixMatch =
			/^([A-Za-z]+)([0-9]+)(.*)$/.exec(value);

		if (prefixMatch)
		{
			result.hasPrefix = true;
			result.prefix =
				prefixMatch[1].toUpperCase();

			result.hasNumber = true;
			result.number =
				parseInt(prefixMatch[2], 10);

			var remainder =
				addin.utils.trim(prefixMatch[3]);

			// Retire le séparateur s'il existe.
			if (remainder.indexOf("-") === 0)
			{
				remainder =
					addin.utils.trim(
						remainder.substring(1)
					);
			}

			result.businessName = remainder;
		}

		/*
		 * Validation stricte du format canonique.
		 *
		 * EXG004 - Exigence
		 */
		result.formatValid =
			/^[A-Za-z]+[0-9]{3} - .+$/.test(value);

		return result;
	},
		
	
	_getArtifactExpectedPrefix: function(artifactDefinition)
	{
		if (!artifactDefinition)
		{
			return "";
		}

		var tags =
			artifactDefinition.taggedValues || {};

		var prefix =
			addin.utils.trim(
				tags[
					addin.fbaConstants.TAG_ARTIFACT_NAME_PREFIX
				]
			);

		/*
		 * Le préfixe métier ne contient jamais
		 * le marqueur technique "_".
		 *
		 * Par sécurité, si le métamodèle contient "_EXG",
		 * on normalise en "EXG".
		 */
		while (
			!addin.utils.isEmpty(prefix) &&
			prefix.charAt(0) === "_"
		)
		{
			prefix =
				addin.utils.trim(
					prefix.substring(1)
				);
		}

		return prefix.toUpperCase();
	},
	
	_checkArtifactName: function(
		artifact,
		artifactDefinition)
	{
		var issues = [];

		if (
			!artifact ||
			!artifactDefinition
		)
		{
			return issues;
		}


		var expectedPrefix =
			this._getArtifactExpectedPrefix(
				artifactDefinition
			);


		/*
		 * Pas de règle de préfixe définie
		 * dans le métamodèle :
		 * aucun contrôle de nommage.
		 */
		if (
			addin.utils.isEmpty(
				expectedPrefix
			)
		)
		{
			return issues;
		}


		var parsed =
			this._parseArtifactName(
				artifact.Name
			);


		// ========================================================
		// PREFIXE ABSENT
		// ========================================================

		if (!parsed.hasPrefix)
		{
			issues.push(
				{
					code:
						addin.fbaConstants
							.CHECK_ISSUE_ARTIFACT_PREFIX_MISSING,

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_ERROR,

					action:
						addin.fbaConstants
							.CHECK_ACTION_REPAIR,

					expectedPrefix:
						expectedPrefix,

					actualName:
						artifact.Name
				}
			);

			return issues;
		}


		// ========================================================
		// PREFIXE INCORRECT
		// ========================================================

		if (
			!addin.utils.equalsIgnoreCase(
				parsed.prefix,
				expectedPrefix
			)
		)
		{
			issues.push(
				{
					code:
						addin.fbaConstants
							.CHECK_ISSUE_ARTIFACT_PREFIX_INVALID,

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_ERROR,

					action:
						addin.fbaConstants
							.CHECK_ACTION_REPAIR,

					expectedPrefix:
						expectedPrefix,

					actualPrefix:
						parsed.prefix,

					actualName:
						artifact.Name
				}
			);

			return issues;
		}


		// ========================================================
		// FORMAT NON CANONIQUE
		// ========================================================

		if (!parsed.formatValid)
		{
			issues.push(
				{
					code:
						addin.fbaConstants
							.CHECK_ISSUE_ARTIFACT_NAMING_INVALID,

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_ERROR,

					action:
						addin.fbaConstants
							.CHECK_ACTION_REPAIR,

					expectedPrefix:
						expectedPrefix,

					actualName:
						artifact.Name
				}
			);
		}


		return issues;
	},
		
	_diagramContainsArtifact: function(
		diagram,
		artifact
	)
	{
		if (!diagram || !artifact)
		{
			return false;
		}

		var diagramObjects =
			diagram.DiagramObjects;

		for (
			var i = 0;
			i < diagramObjects.Count;
			i++
		)
		{
			var diagramObject =
				diagramObjects.GetAt(i);

			if (
				diagramObject.ElementID ==
				artifact.ElementID
			)
			{
				return true;
			}
		}

		return false;
	},
		
	_checkArtifactBusinessName: function(
		artifact,
		artifactDefinition
	)
	{
		var issues = [];

		if (!artifact || !artifactDefinition)
		{
			return issues;
		}

		var expectedPrefix =
			this._getArtifactExpectedPrefix(
				artifactDefinition
			);

		/*
		 * Pas de préfixe défini dans le métamodèle :
		 * aucune règle de nommage Framework BA à contrôler.
		 */
		if (addin.utils.isEmpty(expectedPrefix))
		{
			return issues;
		}

		var parsed =
			this._parseArtifactName(
				artifact.Name
			);

		// ========================================================
		// 1. PREFIXE ABSENT
		// ========================================================

		if (!parsed.hasPrefix)
		{
			issues.push({
				code:
					addin.fbaConstants
						.CHECK_ISSUE_ARTIFACT_PREFIX_MISSING,

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_REPAIR,

				artifactGuid:
					artifact.ElementGUID,

				artifactName:
					artifact.Name,

				expectedPrefix:
					expectedPrefix
			});

			return issues;
		}

		// ========================================================
		// 2. PREFIXE INCORRECT
		// ========================================================

		if (
			!addin.utils.equalsIgnoreCase(
				parsed.prefix,
				expectedPrefix
			)
		)
		{
			issues.push({
				code:
					addin.fbaConstants
						.CHECK_ISSUE_ARTIFACT_PREFIX_INVALID,

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_REPAIR,

				artifactGuid:
					artifact.ElementGUID,

				artifactName:
					artifact.Name,

				actualPrefix:
					parsed.prefix,

				expectedPrefix:
					expectedPrefix
			});

			return issues;
		}

		// ========================================================
		// 3. FORMAT INCORRECT
		// ========================================================

		if (!parsed.formatValid)
		{
			issues.push({
				code:
					addin.fbaConstants
						.CHECK_ISSUE_ARTIFACT_NAMING_INVALID,

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_REPAIR,

				artifactGuid:
					artifact.ElementGUID,

				artifactName:
					artifact.Name,

				actualPrefix:
					parsed.prefix,

				expectedPrefix:
					expectedPrefix,

				number:
					parsed.number,

				businessName:
					parsed.businessName
			});
		}

		return issues;
	},
		
	_isTechnicalDiagram: function(diagram)
	{
		if (!diagram)
		{
			return false;
		}

		return addin.utils.isTechnicalName(
			diagram.Name
		);
	},
		
	_checkArtifactTechnicalName: function(
		artifact,
		analysisPackage
	)
	{
		var issues = [];

		if (!artifact || !analysisPackage)
		{
			return issues;
		}

		var parsed =
			this._parseArtifactName(
				artifact.Name
			);

		if (!parsed.technical)
		{
			return issues;
		}

		/*
		 * Un artefact technique est autorisé
		 * dans un package technique.
		 */
		if (
			addin.repositoryService
				.isTechnicalPackage(
					analysisPackage
				)
		)
		{
			return issues;
		}

		/*
		 * Artefact marqué technique dans
		 * un package modèle.
		 */
		issues.push({
			code:
				addin.fbaConstants
					.CHECK_ISSUE_ARTIFACT_TECHNICAL_NAME,

			severity:
				addin.fbaConstants
					.CHECK_SEVERITY_ERROR,

			action:
				addin.fbaConstants
					.CHECK_ACTION_MAKE_BUSINESS,

			objectGuid:
				artifact.ElementGUID,

			objectName:
				artifact.Name,

			packageGuid:
				analysisPackage.PackageGUID,

			packageName:
				analysisPackage.Name
		});

		return issues;
	},
	
	_checkDiagramName: function(
		diagram,
		effectiveConfig
	)
	{
		var issues = [];

		if (!diagram || !effectiveConfig)
		{
			return issues;
		}

		var expectedPrefix =
			addin.utils.trim(
				effectiveConfig.namePrefix || ""
			);

		if (addin.utils.isEmpty(expectedPrefix))
		{
			return issues;
		}

		var actualName =
			addin.utils.trim(
				diagram.Name || ""
			);

		/*
		 * "_" est le marqueur technique.
		 * Il ne fait pas partie du nom métier.
		 */
		if (
			actualName.length > 0 &&
			actualName.charAt(0) === "_"
		)
		{
			actualName =
				addin.utils.trim(
					actualName.substring(1)
				);
		}

		/*
		 * Règle 1 :
		 * le nom doit commencer exactement par
		 *
		 * <PREFIX><espace>
		 *
		 * Comparaison volontairement sensible
		 * à la casse.
		 */
		var requiredStart =
			expectedPrefix + " ";

		if (
			actualName.indexOf(
				requiredStart
			) !== 0
		)
		{
			issues.push({
				code:
					addin.fbaConstants
						.CHECK_ISSUE_DIAGRAM_NAMING_INVALID,

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_REPAIR,

				expectedPrefix:
					expectedPrefix,

				actualName:
					diagram.Name,

				reason:
					"PREFIX_INVALID"
			});

			return issues;
		}

		/*
		 * Règle 2 :
		 * le préfixe ne peut pas être répété
		 * immédiatement comme token autonome.
		 *
		 * HRR HRR Exigences -> invalide
		 * HRR HRRExigences  -> valide
		 * HRR HR Exigences  -> valide
		 */
		var remainder =
			actualName.substring(
				requiredStart.length
			);

		var duplicatedPrefix =
			expectedPrefix + " ";

		if (
			remainder.indexOf(
				duplicatedPrefix
			) === 0
		)
		{
			issues.push({
				code:
					addin.fbaConstants
						.CHECK_ISSUE_DIAGRAM_NAMING_INVALID,

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_REPAIR,

				expectedPrefix:
					expectedPrefix,

				actualName:
					diagram.Name,

				reason:
					"PREFIX_DUPLICATED"
			});
		}

		return issues;
	},
		
	_checkDiagramTechnicalName: function(
		diagram,
		analysisPackage
	)
	{
		var issues = [];

		if (!diagram || !analysisPackage)
		{
			return issues;
		}

		var diagramName =
			addin.utils.trim(
				diagram.Name || ""
			);

		/*
		 * Un diagramme dont le nom commence par "_"
		 * est un diagramme technique Framework BA.
		 */
		if (
			diagramName.length == 0 ||
			diagramName.charAt(0) !== "_"
		)
		{
			return issues;
		}

		/*
		 * Un diagramme technique est autorisé
		 * dans un package technique.
		 */
		if (
			addin.repositoryService.isTechnicalPackage(
				analysisPackage
			)
		)
		{
			return issues;
		}

		/*
		 * Diagramme technique dans un package modèle.
		 */
		issues.push({
			code:
				addin.fbaConstants
					.CHECK_ISSUE_DIAGRAM_TECHNICAL_NAME,

			severity:
				addin.fbaConstants
					.CHECK_SEVERITY_ERROR,

			action:
				addin.fbaConstants
					.CHECK_ACTION_MAKE_BUSINESS,

			objectGuid:
				diagram.DiagramGUID,

			objectName:
				diagram.Name,

			packageGuid:
				analysisPackage.PackageGUID,

			packageName:
				analysisPackage.Name
		});

		return issues;
	},
	
	hash: function(object)
	{
		if (!object)
			return "";

		var modified = null;

		/*
		 * EA.Diagram n'expose pas ModifiedDate de manière fiable
		 * via l'Automation Interface utilisée par le Model-Based Add-In.
		 * La valeur de référence est donc lue directement dans t_diagram.
		 */
		if (!addin.utils.isEmpty(object.DiagramGUID))
		{
			modified =
				addin.database.getFieldValueString(
					"ModifiedDate",
					"t_diagram",
					"ea_guid = "
						+ addin.database.safeSQLString(
							object.DiagramGUID
						)
				);
		}
		else
		{
			modified =
				object.Modified;

			if (
				modified == null &&
				object.Element
			)
			{
				modified =
					object.Element.Modified;
			}
		}

		var value =
			modified == null
				? ""
				: String(modified);

		if (!addin.utils.isEmpty(object.DiagramGUID))
		{
			// Diagram.Update() peut renommer sans changer ModifiedDate.
			// JSON évite les ambiguïtés de concaténation des champs.
			value = JSON.stringify([value, String(object.Name || "")]);
		}

		/*
		 * Diagrammes : ModifiedDate et nom exact.
		 * Autres objets : Modified.
		 *
		 * Le CHECK et la consolidation ne connaissent pas cette
		 * stratégie. Elle pourra donc évoluer ici sans modifier
		 * le contrat de persistance.
		 */
		var hash = 2166136261;

		for (
			var i = 0;
			i < value.length;
			i++
		)
		{
			hash ^= value.charCodeAt(i);

			hash +=
				(hash << 1) +
				(hash << 4) +
				(hash << 7) +
				(hash << 8) +
				(hash << 24);
		}

		return (
			"00000000" +
			(hash >>> 0).toString(16)
		).slice(-8).toUpperCase();
	},


	persistCheckResult: function(
		object,
		checkResult
	)
	{
		if (!object || !checkResult)
			return false;

		var targetElement = null;
		var objectGuid = "";

		if (!addin.utils.isEmpty(object.ElementGUID))
		{
			targetElement = object;
			objectGuid = object.ElementGUID;
		}
		else if (
			!addin.utils.isEmpty(object.PackageGUID) &&
			object.Element
		)
		{
			targetElement = object.Element;
			objectGuid = object.PackageGUID;
		}

		if (
			!targetElement &&
			addin.utils.isEmpty(object.DiagramGUID)
		)
		{
			addin.logger.warning(
				"Persistance CHECK non supportée pour l'objet reçu"
			);

			return false;
		}

		/*
		 * Un Diagram EA ne porte pas directement le Tagged Value CHECK.
		 * Son résultat est persisté sur le DGC effectif qui le configure.
		 * Le hash reste calculé sur le diagramme contrôlé.
		 */
		if (!addin.utils.isEmpty(object.DiagramGUID))
		{
			objectGuid = object.DiagramGUID;
		}

		var normalizedGuid =
			addin.utils.normalizeGuid(
				objectGuid
			);

		var objectResult =
			checkResult.objects
				? checkResult.objects[normalizedGuid]
				: null;

		if (!objectResult)
		{
			addin.logger.warning(
				"Résultat CHECK objet introuvable"
				+ " | GUID=" + objectGuid
			);

			return false;
		}

		if (!addin.utils.isEmpty(object.DiagramGUID))
		{
			if (addin.utils.isEmpty(objectResult.checkStorageGuid))
			{
				addin.logger.warning(
					"Persistance CHECK diagramme impossible"
					+ " | DGC introuvable"
					+ " | Diagram=" + object.Name
					+ " | GUID=" + object.DiagramGUID
				);

				return false;
			}

			targetElement =
				addin.repositoryService.getElementByGuid(
					objectResult.checkStorageGuid
				);

			if (!targetElement)
			{
				addin.logger.warning(
					"Persistance CHECK diagramme impossible"
					+ " | DGC=" + objectResult.checkStorageGuid
					+ " | Diagram=" + object.Name
				);

				return false;
			}
		}

		var objectRuleResults = [];
		var ruleResults =
			checkResult.ruleResults || [];

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
				this._checkRuleBelongsToObject(
					ruleResult,
					objectGuid
				)
			)
			{
				objectRuleResults.push(
					ruleResult
				);
			}
		}

		var snapshot = {
			schemaVersion: 1,
			scope:
				objectResult.objectType || "",
			checkedAt:
				checkResult.checkedAt || "",
			sourceHash:
				this.hash(object),
			status:
				this._getCheckStatus(
					objectResult.issues || []
				),
			object: {
				guid:
					objectResult.guid || normalizedGuid,
				type:
					objectResult.objectType || "",
				name:
					objectResult.name || "",
				parentGuid:
					objectResult.parentGuid || ""
			},
			issues:
				objectResult.issues || [],
			ruleResults:
				objectRuleResults
		};

		/*
		 * Le snapshot PACKAGE porte la composition observée pendant
		 * ce CHECK. Elle permettra à la consolidation de détecter
		 * ajout / suppression / déplacement sans relancer les règles.
		 * Les métriques sont un cache dérivé, jamais la source de vérité.
		 */
		if (objectResult.objectType == "PACKAGE")
		{
			var artifactGuids = [];
			var diagramGuids = [];
			var diagramsWithoutSnapshot = [];
			var checkedObjects = checkResult.objects || {};

			for (var checkedGuid in checkedObjects)
			{
				if (!checkedObjects.hasOwnProperty(checkedGuid))
					continue;

				var checkedObject = checkedObjects[checkedGuid];

				if (!checkedObject)
					continue;

				if (checkedObject.objectType == "ARTIFACT")
				{
					if (!addin.utils.equalsIgnoreCase(checkedObject.parentGuid, objectGuid))
						continue;
					artifactGuids.push(checkedObject.guid);
				}
				else if (checkedObject.objectType == "DIAGRAM")
				{
					diagramGuids.push(checkedObject.guid);
                    var diagramIssues = checkedObject.issues || [];
                    for (var foreignIssueIndex = 0; foreignIssueIndex < diagramIssues.length; foreignIssueIndex++) {
                        if (diagramIssues[foreignIssueIndex].code !== "DIAGRAM_NOT_IN_METAMODEL") continue;
                        // Foreign diagrams have no generated DGC. Preserve their CHECK issues
                        // in the PACKAGE snapshot rather than requiring a diagram snapshot.
                        diagramsWithoutSnapshot.push({
                            guid: checkedObject.guid,
                            name: checkedObject.name,
                            reason: "DIAGRAM_NOT_IN_METAMODEL",
                            issues: diagramIssues
                        });
                        break;
                    }
				}
			}

			artifactGuids.sort();
			diagramGuids.sort();

			snapshot.content = {
				artifacts: artifactGuids,
				diagrams: diagramGuids,
                diagramsWithoutSnapshot: diagramsWithoutSnapshot
			};

			snapshot.metrics =
				checkResult.metrics || this._createCheckMetrics();
		}

		var json =
			JSON.stringify(snapshot);

		var success =
			addin.repositoryService.setTaggedValueMemo(
				targetElement,
				addin.fbaConstants.TAG_CHECK_RESULT,
				json
			);

		if (!success)
			return false;

		var persistedJson =
			addin.repositoryService.getTaggedValueMemo(
				targetElement,
				addin.fbaConstants.TAG_CHECK_RESULT
			);

		var identical =
			persistedJson === json;

		addin.logger.info(
			"Vérification CHECK objet"
			+ " | Type=" + snapshot.scope
			+ " | Name=" + snapshot.object.name
			+ " | GUID=" + snapshot.object.guid
			+ " | ExpectedSize=" + json.length
			+ " | PersistedSize="
			+ (persistedJson ? persistedJson.length : 0)
			+ " | Identical=" + identical
		);

		if (!identical)
		{
			addin.logger.error(
				"Persistance CHECK objet incomplète"
				+ " | Type=" + snapshot.scope
				+ " | Name=" + snapshot.object.name
				+ " | GUID=" + snapshot.object.guid
			);

			return false;
		}

		if (!addin.frameworkBA._setCheckRequired(targetElement, false))
        {
            addin.logger.error("Indicateur CHECK non réinitialisé | GUID=" + objectGuid);
            return false;
        }

		addin.logger.info(
			"CHECK objet persisté"
			+ " | Type=" + snapshot.scope
			+ " | Name=" + snapshot.object.name
			+ " | GUID=" + snapshot.object.guid
			+ " | Status=" + snapshot.status
			+ " | SourceHash=" + snapshot.sourceHash
			+ " | Size=" + json.length
		);

		return true;
	},


	loadCheckResult: function(object)
	{
		if (!object)
			return null;

		var targetElement = null;

		if (!addin.utils.isEmpty(object.ElementGUID))
		{
			targetElement = object;
		}
		else if (
			!addin.utils.isEmpty(object.PackageGUID) &&
			object.Element
		)
		{
			targetElement = object.Element;
		}

		if (!targetElement)
			return null;

		try
		{
			var json =
				addin.repositoryService.getTaggedValueMemo(
					targetElement,
					addin.fbaConstants.TAG_CHECK_RESULT
				);

			if (addin.utils.isEmpty(json))
				return null;

			return JSON.parse(json);
		}
		catch (e)
		{
			addin.logger.error(
				"Erreur lecture résultat CHECK objet"
				+ " | Error=" + e.message
			);

			return null;
		}
	},


	_persistCheckSnapshot: function(object, checkResult)
    {
        var previous = addin.checkInvalidationSuppressed;
        addin.checkInvalidationSuppressed = true;
        try
        {
            return this._persistCheckSnapshotWithoutInvalidation(object, checkResult);
        }
        finally
        {
            addin.checkInvalidationSuppressed = previous;
        }
    },

    _persistCheckSnapshotWithoutInvalidation: function(
		rootPackage,
		checkResult
	)
	{
		if (!rootPackage || !checkResult)
		{
			return false;
		}

		try
		{
			var rootElement =
				rootPackage.Element;

			if (!rootElement)
			{
				addin.logger.error(
					"Persistance CHECK impossible"
					+ " | Root sans Element"
				);

				return false;
			}

			// Older runtime callers can omit checkedAt. Persist a usable ROOT date.
            if (checkResult.scope === "ROOT" &&
                (typeof checkResult.checkedAt !== "string" || !checkResult.checkedAt.replace(/\s/g, "")))
            {
                checkResult.checkedAt = addin.utils.formatFrenchDateTime(new Date());
                if (typeof checkResult.checkedAt !== "string" || !checkResult.checkedAt.replace(/\s/g, ""))
                    throw new Error("Date CHECK ROOT indisponible.");
            }

			var json =
				JSON.stringify(
					checkResult
				);

			var success =
				addin.repositoryService.setTaggedValueMemo(
					rootElement,
					addin.fbaConstants.TAG_CHECK_RESULT,
					json
				);

			if (!success)
			{
				addin.logger.error(
					"Persistance snapshot CHECK impossible"
					+ " | Root=" + rootPackage.Name
				);

				return false;
			}
			
			var reloadedRootElement =
				Repository.GetElementByGuid(
					rootElement.ElementGUID
				);

			var persistedJson =
				addin.repositoryService.getTaggedValueMemo(
					reloadedRootElement,
					addin.fbaConstants.TAG_CHECK_RESULT
				);

			addin.logger.info(
				"Vérification snapshot CHECK"
				+ " | ExpectedSize=" + json.length
				+ " | PersistedSize=" + persistedJson.length
				+ " | Identical=" + (persistedJson === json)
			);

			if (persistedJson !== json)
                return false;

            // Un CHECK de package ne réinitialise jamais le root.
            if (checkResult.scope === "ROOT" && checkResult.success &&
                !addin.frameworkBA._setCheckRequired(rootElement, false))
                return false;

			addin.logger.info(
				"Snapshot CHECK persisté"
				+ " | Root=" + rootPackage.Name
				+ " | Scope=" + checkResult.scope
				+ " | CheckedAt=" + checkResult.checkedAt
				+ " | Objects="
				+ Object.keys(
					checkResult.objects || {}
				).length
				+ " | Size=" + json.length
			);

			return true;
		}
		catch (e)
		{
			addin.logger.error(
				"Erreur persistance snapshot CHECK"
				+ " | Root=" + rootPackage.Name
				+ " | Error=" + e.message
			);

			return false;
		}
	},
		
	_loadCheckSnapshot: function(
		rootPackage
	)
	{
		if (!rootPackage)
		{
			return null;
		}

		try
		{
			var rootElement =
				rootPackage.Element;

			if (!rootElement)
			{
				return null;
			}

			var json =
				addin.repositoryService.getTaggedValueMemo(
					rootElement,
					addin.fbaConstants.TAG_CHECK_RESULT
				);

			if (addin.utils.isEmpty(json))
			{
				return null;
			}

			var result =
				JSON.parse(json);

			return result;
		}
		catch (e)
		{
			addin.logger.error(
				"Erreur lecture snapshot CHECK"
				+ " | Root=" + rootPackage.Name
				+ " | Error=" + e.message
			);

			return null;
		}
	},
	

	// ============================================================
	// synchronize
	//
	// Initialise la structure complète d'une analyse depuis
	// le package racine.
	//
	// PRINCIPES :
	//
	// PASS 1
	// - traite les packages métier déjà présents ;
	// - les packages manuels reconnus passent par
	//   initializeAnalysisPackage().
	//
	// PASS 2
	// - crée les packages manquants ;
	// - les packages nouvellement créés passent également par
	//   initializeAnalysisPackage().
	//
	// IMPORTANT :
	// initializeAnalysisPackage() reste l'unique primitive
	// d'initialisation d'un package d'analyse.
	// ============================================================

	synchronize: function(rootPackage)
	{
		// ========================================================
		// 0. CONTEXTE
		// ========================================================

		if (!rootPackage)
		{
			addin.logger.error(
				"Package racine d'analyse non défini"
			);

			return false;
		}


		addin.logger.info(
			"Initialisation structure d'analyse"
			+ " | Root=" + rootPackage.Name
		);


		// ========================================================
		// 1. ROOT
		// ========================================================

		if (rootPackage.Element)
		{
			addin.repositoryService.setTaggedValue(
				rootPackage.Element,
				addin.fbaConstants.TAG_FRAMEWORK_ROLE,
				addin.fbaConstants.ROLE_ANALYSIS_ROOT
			);
		}


		// ========================================================
		// 2. STRUCTURE TECHNIQUE
		// ========================================================

		var libraryPackage =
			this._ensureLibrary(
				rootPackage
			);


		if (!libraryPackage)
		{
			addin.logger.error(
				"Impossible d'initialiser la librairie technique"
				+ " | Root=" + rootPackage.Name
			);

			return false;
		}


		// ========================================================
		// 3. DEFINITIONS DU METAMODELE
		// ========================================================

		var definitions =
			this._getOperationDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			addin.logger.warning(
				"Aucune définition d'analyse trouvée."
			);

			return true;
		}


		// ========================================================
		// 3.1 INDEX SQL
		//
		// Chargés UNE SEULE FOIS pour toute la synchronisation.
		// ========================================================

		var artifactIndex =
			this._getOperationArtifactDefinitionsIndex();


		var analysisTagIndex =
			this._getOperationAnalysisElementTagsIndex();


		var packageIndex =
			 this._getOperationPackagesIndex(
					rootPackage
				);

		var diagramRegistryIndex =
			this._loadDiagramRegistryIndex(
				rootPackage
			);
	
		addin.logger.info(
			"Index SQL du métamodèle chargés"
		);


		// ========================================================
		// 4. PASS 1
		//
		// Traite les packages déjà présents.
		//
		// - technique       -> IGNORE
		// - initialisé      -> SKIP
		// - legacy          -> SKIP
		// - incomplet       -> SKIP
		// - manuel reconnu  -> INITIALIZE
		// - manuel inconnu  -> IGNORE
		// ========================================================

		var packages =
			rootPackage.Packages;


		for (
			var i = 0;
			i < packages.Count;
			i++
		)
		{
			var currentPackage =
				packages.GetAt(i);


			if (
				!currentPackage ||
				!currentPackage.Element
			)
			{
				continue;
			}


			// ----------------------------------------------------
			// PACKAGE TECHNIQUE
			// ----------------------------------------------------

			if (
				addin.utils.isTechnicalName(
					currentPackage.Name
				)
			)
			{
				continue;
			}


			// ----------------------------------------------------
			// ETAT FRAMEWORK
			// ----------------------------------------------------

			var initializationState =
				this._getAnalysisPackageInitializationState(
					currentPackage
				);


			// ----------------------------------------------------
			// DEJA INITIALISE
			// ----------------------------------------------------

			if (
				initializationState ==
				"INITIALIZED"
			)
			{
				addin.logger.debug(
					"Package déjà initialisé"
					+ " | Package=" + currentPackage.Name
					+ " | State=INITIALIZED"
					+ " | Action=SKIP"
				);

				continue;
			}


			// ----------------------------------------------------
			// LEGACY
			// ----------------------------------------------------

			if (
				initializationState ==
				"LEGACY"
			)
			{
				addin.logger.warning(
					"Package FrameworkBA historique détecté"
					+ " | Package=" + currentPackage.Name
					+ " | State=LEGACY"
					+ " | Action=SKIP"
				);

				continue;
			}


			// ----------------------------------------------------
			// INITIALISATION INCOMPLETE
			// ----------------------------------------------------

			if (
				initializationState ==
				"INCOMPLETE"
			)
			{
				addin.logger.warning(
					"Initialisation FrameworkBA incomplète détectée"
					+ " | Package=" + currentPackage.Name
					+ " | State=INCOMPLETE"
					+ " | Action=SKIP"
				);

				continue;
			}


			// ----------------------------------------------------
			// PACKAGE NON ASSOCIE
			// ----------------------------------------------------

			var definition =
				this.findDefinitionForPackage(
					currentPackage,
					definitions
				);


			if (!definition)
			{
				addin.logger.debug(
					"Package non reconnu par le métamodèle"
					+ " | Package=" + currentPackage.Name
					+ " | Action=IGNORE"
				);

				continue;
			}


			addin.logger.info(
				"Package manuel reconnu"
				+ " | Package=" + currentPackage.Name
				+ " | Definition=" + definition.name
				+ " | Action=INITIALIZE"
			);


			// ----------------------------------------------------
			// INITIALISATION
			// ----------------------------------------------------

			var initializeResult =
				this.initializeAnalysisPackage(
					rootPackage,
					currentPackage,
					definitions,
					artifactIndex,
					analysisTagIndex
				);


			if (!initializeResult)
			{
				addin.logger.error(
					"Échec d'initialisation du package"
					+ " | Package=" + currentPackage.Name
				);
			}


			// ----------------------------------------------------
			// MISE A JOUR INDEX
			//
			// Le package manuel vient éventuellement de recevoir
			// son Source GUID pendant l'initialisation.
			// ----------------------------------------------------

			if (initializeResult)
			{
				this._addPackageToIndex(
					packageIndex,
					currentPackage,
					definition
				);
			}
		}


		// rootPackage.Packages.Refresh();


		// ========================================================
		// 5. PASS 2
		//
		// Pour chaque définition :
		//
		// existe-t-il au moins un package associé ?
		//
		// OUI -> SKIP
		// NON -> CREATE + INITIALIZE
		// ========================================================

		for (
			var j = 0;
			j < definitions.length;
			j++
		)
		{
			var definitionToCheck =
				definitions[j];


			if (!definitionToCheck)
			{
				continue;
			}


			// ----------------------------------------------------
			// RECHERCHE VIA INDEX
			// ----------------------------------------------------

			var existingPackage =
				this._findPackageFromIndex(
					packageIndex,
					definitionToCheck
				);


			if (existingPackage)
			{
				addin.logger.debug(
					"Définition déjà représentée"
					+ " | Definition=" + definitionToCheck.name
					+ " | Package=" + existingPackage.Name
					+ " | Action=SKIP"
				);

				continue;
			}


			// ----------------------------------------------------
			// DEFINITION ABSENTE
			// ----------------------------------------------------

			addin.logger.info(
				"Définition non représentée"
				+ " | Definition=" + definitionToCheck.name
				+ " | Action=CREATE"
			);


			var newPackage =
				rootPackage.Packages.AddNew(
					definitionToCheck.name,
					""
				);


			if (!newPackage)
			{
				addin.logger.error(
					"Impossible de créer le package"
					+ " | Definition=" + definitionToCheck.name
				);

				continue;
			}


			if (!newPackage.Update())
			{
				addin.logger.error(
					"Impossible de sauvegarder le package"
					+ " | Definition=" + definitionToCheck.name
				);

				continue;
			}


			// ----------------------------------------------------
			// INDEXATION IMMEDIATE
			//
			// Evite toute nouvelle recherche dans
			// rootPackage.Packages.
			// ----------------------------------------------------

			this._addPackageToIndex(
				packageIndex,
				newPackage,
				definitionToCheck
			);


			addin.logger.info(
				"Package d'analyse créé"
				+ " | Package=" + newPackage.Name
				+ " | PackageGUID=" + newPackage.PackageGUID
				+ " | Action=INITIALIZE"
			);


			// ----------------------------------------------------
			// INITIALISATION DU PACKAGE CREE
			//
			// UN SEUL appel.
			// ----------------------------------------------------

			var newPackageInitializeResult =
				this.initializeAnalysisPackage(
					rootPackage,
					newPackage,
					definitions,
					artifactIndex,
					analysisTagIndex
				);


			if (!newPackageInitializeResult)
			{
				addin.logger.error(
					"Échec d'initialisation du package créé"
					+ " | Package=" + newPackage.Name
					+ " | Definition=" + definitionToCheck.name
				);
			}


			// Refresh uniquement après la création/initialisation.
			//rootPackage.Packages.Refresh();
		}


		// ========================================================
		// 6. FIN
		// ========================================================

		rootPackage.Packages.Refresh();


		addin.logger.info(
			"Initialisation structure d'analyse terminée"
			+ " | Root=" + rootPackage.Name
		);


		return true;
	},
		
		
	// ============================================================
	// completeAnalysisPackage
	//
	// Complète un package d'analyse déjà INITIALIZED.
	//
	// Principe fondamental :
	// COMPLETE complète ce qui manque mais ne modifie jamais
	// le contenu existant de l'analyste.
	// ============================================================

	completeAnalysisPackage: function(
		rootPackage,
		analysisPackage
	)
	{
		// ========================================================
		// 1. VALIDATION DU CONTEXTE
		// ========================================================

		if (
			!rootPackage ||
			!analysisPackage
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : contexte incomplet"
			);

			return false;
		}


		addin.logger.info(
			"COMPLETE package"
			+ " | Package=" + analysisPackage.Name
			+ " | GUID=" + analysisPackage.PackageGUID
		);


		// ========================================================
		// 2. ETAT D'INITIALISATION
		// ========================================================

		var initializationState =
			this._getAnalysisPackageInitializationState(
				analysisPackage
			);
		
		var validInitializationState =
			initializationState == "NOT_ASSOCIATED"
			|| initializationState == "LEGACY"
			|| initializationState == "INCOMPLETE"
			|| initializationState == "INITIALIZED";

		var initializationStateRuleResult =
			this._createCheckRuleResult(
				"PACKAGE_INITIALIZATION_STATE",
				"LOCAL",
				"ANALYSIS_PACKAGE",
				analysisPackage.PackageGUID,
				"PACKAGE",
				"",
				analysisPackage.PackageGUID,
				"",
				{
					validStates: [
						"NOT_ASSOCIATED",
						"LEGACY",
						"INCOMPLETE",
						"INITIALIZED"
					]
				},
				{
					state: initializationState || ""
				},
				validInitializationState
			);

		if (initializationStateRuleResult)
		{
			result.ruleResults.push(
				initializationStateRuleResult
			);
		}


		if (
			initializationState ==
			"NOT_ASSOCIATED"
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : package non associé"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		if (
			initializationState ==
			"LEGACY"
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : package LEGACY"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		if (
			initializationState ==
			"INCOMPLETE"
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : initialisation incomplète"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		if (
			initializationState !=
			"INITIALIZED"
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : état inattendu"
				+ " | Package=" + analysisPackage.Name
				+ " | State=" + initializationState
			);

			return false;
		}


		// ========================================================
		// 3. ELEMENT DU PACKAGE
		// ========================================================

		var packageElement =
			analysisPackage.Element;


		if (!packageElement)
		{
			addin.logger.error(
				"COMPLETE impossible : élément du package introuvable"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		// ========================================================
		// 4. SOURCE ANALYSIS ELEMENT GUID
		// ========================================================

		var sourceAnalysisGuid =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					packageElement,
					addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
				)
			);


		if (
			addin.utils.isEmpty(
				sourceAnalysisGuid
			)
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : définition source absente"
				+ " | Package=" + analysisPackage.Name
			);

			return false;
		}


		// ========================================================
		// 5. DEFINITIONS DU METAMODELE
		// ========================================================

		var definitions =
			this._getOperationDefinitions();


		if (
			!definitions ||
			definitions.length == 0
		)
		{
			addin.logger.warning(
				"COMPLETE impossible : aucune définition d'analyse"
			);

			return false;
		}


		// ========================================================
		// 6. RESOLUTION DE LA DEFINITION D'ANALYSE
		// ========================================================

		var analysisDefinition =
			null;


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


			if (
				addin.utils.equalsIgnoreCase(
					definition.guid,
					sourceAnalysisGuid
				)
			)
			{
				analysisDefinition =
					definition;

				break;
			}
		}


		if (!analysisDefinition)
		{
			addin.logger.warning(
				"COMPLETE impossible : définition d'analyse introuvable"
				+ " | Package=" + analysisPackage.Name
				+ " | SourceGUID=" + sourceAnalysisGuid
			);

			return false;
		}


		addin.logger.debug(
			"Définition d'analyse résolue"
			+ " | Package=" + analysisPackage.Name
			+ " | Analyse=" + analysisDefinition.name
			+ " | GUID=" + analysisDefinition.guid
		);


		// ========================================================
		// 7. ELEMENT SOURCE
		// ========================================================

		var sourceElement =
			analysisDefinition.element;


		if (!sourceElement)
		{
			addin.logger.error(
				"COMPLETE impossible : Analysis Element introuvable"
				+ " | Analyse=" + analysisDefinition.name
			);

			return false;
		}


		// ========================================================
		// 8. INDEX SQL DES DEFINITIONS D'ARTEFACTS
		// ========================================================

		var artifactIndex =
			this._getOperationArtifactDefinitionsIndex();


		var analysisTagIndex =
			this._getOperationAnalysisElementTagsIndex();


		if (!artifactIndex)
		{
			artifactIndex = {};
		}


		if (!analysisTagIndex)
		{
			analysisTagIndex = {};
		}


		addin.logger.debug(
			"Index SQL chargés pour COMPLETE"
			+ " | Package=" + analysisPackage.Name
		);


		// ========================================================
		// 9. DEFINITIONS D'ARTEFACTS
		// ========================================================

		var artifactDefinitions =
			this._loadArtifactDefinitions(
				analysisDefinition,
				artifactIndex,
				analysisTagIndex
			);


		if (!artifactDefinitions)
		{
			artifactDefinitions = [];
		}


		addin.logger.debug(
			"Définitions d'artefacts chargées"
			+ " | Package=" + analysisPackage.Name
			+ " | Analyse=" + analysisDefinition.name
			+ " | Count=" + artifactDefinitions.length
		);


		// ========================================================
		// 10. COMPLETION DES ARTEFACTS
		// ========================================================

		for (
			var artifactDefinitionIndex = 0;
			artifactDefinitionIndex < artifactDefinitions.length;
			artifactDefinitionIndex++
		)
		{
			var artifactDefinition =
				artifactDefinitions[artifactDefinitionIndex];


			if (!artifactDefinition)
			{
				continue;
			}


			var matchingArtifacts =
				this._findArtifactsMatchingDefinition(
					analysisPackage,
					artifactDefinition,
					artifactDefinitions
				);


			if (
				matchingArtifacts &&
				matchingArtifacts.length > 0
			)
			{
				addin.logger.debug(
					"Artefact déjà présent"
					+ " | Package=" + analysisPackage.Name
					+ " | Prototype=" + artifactDefinition.prototype.Name
					+ " | Nombre=" + matchingArtifacts.length
				);

				continue;
			}


			addin.logger.info(
				"Artefact manquant"
				+ " | Package=" + analysisPackage.Name
				+ " | Prototype=" + artifactDefinition.prototype.Name
				+ " | Type=" + artifactDefinition.elementType
				+ " | Stereo=" + artifactDefinition.stereotype
			);


			var createdArtifact =
				this._createTechnicalArtifact(
					analysisPackage,
					analysisDefinition,
					artifactDefinition
				);


			if (!createdArtifact)
			{
				addin.logger.warning(
					"Création de l'artefact impossible"
					+ " | Package=" + analysisPackage.Name
					+ " | Prototype=" + artifactDefinition.prototype.Name
				);

				continue;
			}


			addin.logger.info(
				"Artefact créé par COMPLETE"
				+ " | Package=" + analysisPackage.Name
				+ " | Artifact=" + createdArtifact.Name
				+ " | GUID=" + createdArtifact.ElementGUID
			);
		}


		// ========================================================
		// 11. DEFINITIONS DE DIAGRAMMES
		// ========================================================

		var diagramDefinitions =
			this._loadDiagramDefinitions(
				sourceElement
			);


		if (!diagramDefinitions)
		{
			diagramDefinitions = [];
		}


		addin.logger.info(
			"Définitions de diagrammes chargées"
			+ " | Package=" + analysisPackage.Name
			+ " | Count=" + diagramDefinitions.length
		);


		// ========================================================
		// 12. COMPLETION DES DIAGRAMMES OBLIGATOIRES
		// ========================================================

		for (
			var diagramDefinitionIndex = 0;
			diagramDefinitionIndex < diagramDefinitions.length;
			diagramDefinitionIndex++
		)
		{
			var diagramDefinition =
				diagramDefinitions[diagramDefinitionIndex];


			if (!diagramDefinition)
			{
				continue;
			}


			// ====================================================
			// CONFIGURATION EFFECTIVE
			// ====================================================

			var effectiveConfig =
				this._resolveEffectiveDiagramConfig(
					diagramDefinition
				);


			if (!effectiveConfig)
			{
				addin.logger.warning(
					"Configuration effective du diagramme introuvable"
					+ " | Package=" + analysisPackage.Name
					+ " | DiagramDefinitionGUID="
					+ diagramDefinition.guid
				);

				continue;
			}


			// ====================================================
			// UNIQUEMENT LES DIAGRAMMES OBLIGATOIRES
			// ====================================================

			if (
				!this._isRequiredDiagram(
					effectiveConfig
				)
			)
			{
				addin.logger.debug(
					"Diagramme non obligatoire ignoré par COMPLETE"
					+ " | Package=" + analysisPackage.Name
					+ " | DefinitionGUID=" + diagramDefinition.guid
				);

				continue;
			}


			// ====================================================
			// DIAGRAMME FRAMEWORK BA DEJA EXISTANT
			// ====================================================

			var generatedDiagrams =
				this._findGeneratedDiagramsForPackage(
					rootPackage,
					analysisPackage,
					diagramDefinition.guid
				);


			if (
				generatedDiagrams &&
				generatedDiagrams.length > 0
			)
			{
				addin.logger.info(
					"Diagramme obligatoire déjà présent"
					+ " | Package=" + analysisPackage.Name
					+ " | DefinitionGUID=" + diagramDefinition.guid
					+ " | Nombre=" + generatedDiagrams.length
				);

				// IMPORTANT :
				// un diagramme existant n'est jamais complété
				// ou modifié par COMPLETE.
				continue;
			}


			// ====================================================
			// DIAGRAMME ANALYSTE COMPATIBLE
			// ====================================================

			var compatibleDiagramFound =
				false;


			var diagrams =
				analysisPackage.Diagrams;


			for (
				var diagramIndex = 0;
				diagramIndex < diagrams.Count;
				diagramIndex++
			)
			{
				var currentDiagram =
					diagrams.GetAt(
						diagramIndex
					);


				if (!currentDiagram)
				{
					continue;
				}


				if (
					addin.utils.equalsIgnoreCase(
						addin.utils.trim(
							currentDiagram.MetaType
						),
						addin.utils.trim(
							diagramDefinition.metaType
						)
					)
				)
				{
					compatibleDiagramFound =
						true;


					addin.logger.info(
						"Diagramme obligatoire couvert par un diagramme existant"
						+ " | Package=" + analysisPackage.Name
						+ " | Diagram=" + currentDiagram.Name
						+ " | MetaType=" + currentDiagram.MetaType
					);


					break;
				}
			}


			if (compatibleDiagramFound)
			{
				continue;
			}


			// ====================================================
			// DIAGRAMME OBLIGATOIRE MANQUANT
			// ====================================================

			addin.logger.info(
				"Diagramme obligatoire manquant"
				+ " | Package=" + analysisPackage.Name
				+ " | DefinitionGUID=" + diagramDefinition.guid
				+ " | MetaType=" + diagramDefinition.metaType
			);


			// ====================================================
			// CREATION DU NOUVEAU DIAGRAMME
			// ====================================================

			var newDiagram =
				this._createTechnicalDiagramFromDefinition(
					rootPackage,
					analysisPackage,
					diagramDefinition,
					effectiveConfig
				);


			if (!newDiagram)
			{
				addin.logger.warning(
					"Création du diagramme impossible"
					+ " | Package=" + analysisPackage.Name
					+ " | DefinitionGUID=" + diagramDefinition.guid
				);

				continue;
			}


			addin.logger.info(
				"Diagramme créé par COMPLETE"
				+ " | Package=" + analysisPackage.Name
				+ " | Diagram=" + newDiagram.Name
				+ " | GUID=" + newDiagram.DiagramGUID
				+ " | MetaType=" + newDiagram.MetaType
			);


			// ====================================================
			// 13. DEFINITIONS D'ARTEFACTS DU NOUVEAU DIAGRAMME
			//
			// ATTENTION :
			// ce bloc reste volontairement DANS la boucle.
			// Il ne s'exécute que pour un diagramme venant
			// réellement d'être créé.
			// ====================================================

			var diagramArtifactDefinitions =
				this._loadDiagramArtifactDefinitions(
					diagramDefinition.diagram,
					artifactDefinitions
				);


			if (!diagramArtifactDefinitions)
			{
				diagramArtifactDefinitions = [];
			}


			addin.logger.info(
				"Définitions d'artefacts du diagramme chargées"
				+ " | Diagram=" + newDiagram.Name
				+ " | Count=" + diagramArtifactDefinitions.length
			);


			// ====================================================
			// 14. COMPLETION DU CONTENU DU NOUVEAU DIAGRAMME
			// ====================================================

			for (
				var diagramArtifactIndex = 0;
				diagramArtifactIndex < diagramArtifactDefinitions.length;
				diagramArtifactIndex++
			)
			{
				var diagramArtifactDefinition =
					diagramArtifactDefinitions[diagramArtifactIndex];


				if (!diagramArtifactDefinition)
				{
					continue;
				}


				// ==================================================
				// RECHERCHE DE LA DEFINITION CANONIQUE
				// ==================================================

				var canonicalDefinitions =
					this._findCanonicalArtifactDefinitions(
						diagramArtifactDefinition,
						artifactDefinitions
					);


				// ==================================================
				// AUCUNE DEFINITION CANONIQUE
				// ==================================================

				if (canonicalDefinitions.length == 0)
				{
					addin.logger.warning(
						"Aucune définition canonique pour l'artefact du diagramme"
						+ " | Diagram=" + newDiagram.Name
						+ " | Type=" + diagramArtifactDefinition.type
						+ " | Stereo=" + diagramArtifactDefinition.stereotype
					);

					continue;
				}


				// ==================================================
				// DEFINITION CANONIQUE AMBIGUE
				// ==================================================

				if (canonicalDefinitions.length > 1)
				{
					addin.logger.warning(
						"Définition canonique ambiguë pour l'artefact du diagramme"
						+ " | Diagram=" + newDiagram.Name
						+ " | Type=" + diagramArtifactDefinition.type
						+ " | Stereo=" + diagramArtifactDefinition.stereotype
						+ " | Nombre=" + canonicalDefinitions.length
					);

					continue;
				}


				var canonicalArtifactDefinition =
					canonicalDefinitions[0];


				// ==================================================
				// ARTEFACTS ASSOCIES A LA DEFINITION
				// ==================================================

				var associatedArtifacts =
					this._findArtifactsAssociatedToDefinition(
						analysisPackage,
						canonicalArtifactDefinition.prototypeGuid
					);


				var matchingTechnicalArtifacts = [];


				for (
					var associatedIndex = 0;
					associatedIndex < associatedArtifacts.length;
					associatedIndex++
				)
				{
					var candidateArtifact =
						associatedArtifacts[associatedIndex];


					if (!candidateArtifact)
					{
						continue;
					}


					var technicalValue =
						addin.utils.trim(
							addin.repositoryService.getTaggedValue(
								candidateArtifact,
								addin.fbaConstants.TAG_TECHNICAL
							)
						);


					if (
						!addin.utils.equalsIgnoreCase(
							technicalValue,
							"true"
						)
					)
					{
						continue;
					}


					if (
						this._artifactMatchesFullDefinition(
							candidateArtifact,
							canonicalArtifactDefinition,
							artifactDefinitions
						)
					)
					{
						matchingTechnicalArtifacts.push(
							candidateArtifact
						);
					}
				}


				// ==================================================
				// PLUSIEURS CANDIDATS = AMBIGUITE
				// ==================================================

				if (matchingTechnicalArtifacts.length > 1)
				{
					addin.logger.warning(
						"Plusieurs artefacts techniques compatibles"
						+ " | Diagram=" + newDiagram.Name
						+ " | DefinitionGUID="
						+ canonicalArtifactDefinition.prototypeGuid
						+ " | Nombre=" + matchingTechnicalArtifacts.length
					);

					continue;
				}


				var diagramArtifact =
					null;


				// ==================================================
				// REUTILISATION D'UN ARTEFACT EXISTANT
				// ==================================================

				if (matchingTechnicalArtifacts.length == 1)
				{
					diagramArtifact =
						matchingTechnicalArtifacts[0];


					addin.logger.info(
						"Artefact technique réutilisé pour le diagramme"
						+ " | Diagram=" + newDiagram.Name
						+ " | Artifact=" + diagramArtifact.Name
						+ " | GUID=" + diagramArtifact.ElementGUID
					);
				}


				// ==================================================
				// SINON CREATION
				// ==================================================

				if (!diagramArtifact)
				{
					diagramArtifact =
						this._createTechnicalArtifact(
							analysisPackage,
							analysisDefinition,
							canonicalArtifactDefinition
						);


					if (!diagramArtifact)
					{
						addin.logger.warning(
							"Création de l'artefact du diagramme impossible"
							+ " | Diagram=" + newDiagram.Name
							+ " | DefinitionGUID="
							+ canonicalArtifactDefinition.prototypeGuid
						);

						continue;
					}


					addin.logger.info(
						"Artefact technique créé pour le diagramme"
						+ " | Diagram=" + newDiagram.Name
						+ " | Artifact=" + diagramArtifact.Name
						+ " | GUID=" + diagramArtifact.ElementGUID
					);
				}


				// ==================================================
				// PLACEMENT SUR LE NOUVEAU DIAGRAMME
				// ==================================================

				this._ensureArtifactOnDiagram(
					newDiagram,
					diagramArtifact
				);


				addin.logger.info(
					"Artefact placé sur le diagramme"
					+ " | Diagram=" + newDiagram.Name
					+ " | Artifact=" + diagramArtifact.Name
				);
			}


			// ====================================================
			// 15. HASH DU NOUVEAU DIAGRAMME
			//
			// Toujours à l'intérieur de la boucle :
			// newDiagram existe nécessairement ici.
			// ====================================================

			this._updateDiagramRegistryHash(
				rootPackage,
				newDiagram
			);


			addin.logger.info(
				"Nouveau diagramme complété"
				+ " | Diagram=" + newDiagram.Name
				+ " | ArtifactDefinitions="
				+ diagramArtifactDefinitions.length
			);
		}


		// ========================================================
		// 16. FIN COMPLETE PACKAGE
		//
		// Ici nous sommes sortis de la boucle des diagrammes.
		// Aucun accès à newDiagram / diagramDefinition.
		// ========================================================

		addin.logger.info(
			"COMPLETE terminé"
			+ " | Package=" + analysisPackage.Name
			+ " | ArtifactDefinitions=" + artifactDefinitions.length
			+ " | DiagramDefinitions=" + diagramDefinitions.length
		);


		return true;
	},
	
	
	completeAnalysis: function(rootPackage)
	{
		// ========================================================
		// 0. CONTEXTE
		// ========================================================

		if (!rootPackage)
		{
			addin.logger.error(
				"COMPLETE ROOT impossible : package racine non défini"
			);

			return false;
		}


		addin.logger.info(
			"COMPLETE structure d'analyse"
			+ " | Root=" + rootPackage.Name
		);


		// ========================================================
		// 1. PACKAGES DU DOSSIER D'ANALYSE
		//
		// Même périmètre que synchronize() :
		// uniquement les enfants directs du ROOT.
		// ========================================================

		var packages =
			rootPackage.Packages;


		var completedCount = 0;
		var skippedCount = 0;
		var errorCount = 0;


		// ========================================================
		// 2. PARCOURS
		// ========================================================

		for (
			var i = 0;
			i < packages.Count;
			i++
		)
		{
			var currentPackage =
				packages.GetAt(i);


			if (
				!currentPackage ||
				!currentPackage.Element
			)
			{
				continue;
			}


			// ====================================================
			// PACKAGE TECHNIQUE
			// ====================================================

			if (
				addin.utils.isTechnicalName(
					currentPackage.Name
				)
			)
			{
				addin.logger.debug(
					"Package technique ignoré par COMPLETE"
					+ " | Package=" + currentPackage.Name
				);

				skippedCount++;

				continue;
			}


			// ====================================================
			// ETAT FRAMEWORK BA
			// ====================================================

			var initializationState =
				this._getAnalysisPackageInitializationState(
					currentPackage
				);


			// ====================================================
			// PACKAGE INITIALIZED
			// ====================================================

			if (
				initializationState ==
				"INITIALIZED"
			)
			{
				addin.logger.info(
					"COMPLETE package depuis ROOT"
					+ " | Package=" + currentPackage.Name
				);


				var completeResult =
					this.completeAnalysisPackage(
						rootPackage,
						currentPackage
					);


				if (completeResult)
				{
					completedCount++;
				}
				else
				{
					errorCount++;

					addin.logger.error(
						"Échec COMPLETE package"
						+ " | Package=" + currentPackage.Name
					);
				}


				continue;
			}


			// ====================================================
			// LEGACY
			// ====================================================

			if (
				initializationState ==
				"LEGACY"
			)
			{
				addin.logger.warning(
					"Package FrameworkBA historique ignoré par COMPLETE"
					+ " | Package=" + currentPackage.Name
					+ " | State=LEGACY"
					+ " | Action=SKIP"
				);

				skippedCount++;

				continue;
			}


			// ====================================================
			// INITIALISATION INCOMPLETE
			// ====================================================

			if (
				initializationState ==
				"INCOMPLETE"
			)
			{
				addin.logger.warning(
					"Package FrameworkBA incomplet ignoré par COMPLETE"
					+ " | Package=" + currentPackage.Name
					+ " | State=INCOMPLETE"
					+ " | Action=SKIP"
				);

				skippedCount++;

				continue;
			}


			// ====================================================
			// PACKAGE NON ASSOCIE
			//
			// COMPLETE ne tente pas de l'initialiser.
			// C'est la responsabilité de INITIALIZE.
			// ====================================================

			addin.logger.debug(
				"Package non associé ignoré par COMPLETE"
				+ " | Package=" + currentPackage.Name
				+ " | State=" + initializationState
				+ " | Action=IGNORE"
			);


			skippedCount++;
		}

		// ========================================================
		// 3. FIN
		// ========================================================
		
		addin.logger.info(
			"COMPLETE structure d'analyse terminé"
			+ " | Root=" + rootPackage.Name
			+ " | Completed=" + completedCount
			+ " | Skipped=" + skippedCount
			+ " | Errors=" + errorCount
		);


		return (
			errorCount == 0
		);
	},
		
	checkAnalysisPackage: function(rootPackage, analysisPackage)
	{
		var result =
			this._createCheckResult(
				"PACKAGE",
				rootPackage
			);


		// =========================================================
		// 0. VALIDATION DU CONTEXTE
		// =========================================================

		if (!rootPackage)
		{
			result.success = false;

			addin.logger.error(
				"CHECK package impossible"
				+ " | Root=NULL"
			);

			return result;
		}


		if (!analysisPackage ||
			!analysisPackage.Element)
		{
			result.success = false;

			addin.logger.error(
				"CHECK package impossible"
				+ " | Package invalide"
			);

			return result;
		}


		var packageResult =
			this._registerCheckObject(
				result,
				analysisPackage.PackageGUID,
				"PACKAGE",
				analysisPackage.Name,
				rootPackage
					? rootPackage.PackageGUID
					: ""
			);


		addin.logger.info(
			"CHECK package d'analyse"
			+ " | Package=" + analysisPackage.Name
		);


		// =========================================================
		// 1. ETAT D'INITIALISATION FRAMEWORK BA
		// =========================================================

		var initializationState =
			this._getAnalysisPackageInitializationState(
				analysisPackage
			);

		result.metrics.packages.found++;
		
		// ---------------------------------------------------------
		// 1.1 PACKAGE NON ASSOCIE
		// ---------------------------------------------------------

		if (initializationState == "NOT_ASSOCIATED")
		{
			var definitions =
				this._getOperationDefinitions();


			var recognizedDefinition =
				this.findDefinitionForPackage(
					analysisPackage,
					definitions
				);
			
			var packageRecognitionRuleResult =
				this._createCheckRuleResult(
					"PACKAGE_RECOGNITION",
					"LOCAL",
					"ANALYSIS_PACKAGE",
					analysisPackage.PackageGUID,
					"PACKAGE",
					recognizedDefinition
						? recognizedDefinition.guid
						: "",
					analysisPackage.PackageGUID,
					"",
					{
						recognizedByMetamodel: true
					},
					{
						recognized:
							recognizedDefinition
								? true
								: false,

						initializationState:
							initializationState
					},
					recognizedDefinition
						? true
						: false
				);

			if (packageRecognitionRuleResult)
			{
				result.ruleResults.push(
					packageRecognitionRuleResult
				);
			}


			// -----------------------------------------------------
			// Package reconnu par le métamodèle
			// -----------------------------------------------------

			if (recognizedDefinition)
			{
				var packageInitializationRuleResult =
					this._createCheckRuleResult(
						"PACKAGE_INITIALIZATION",
						"LOCAL",
						"ANALYSIS_PACKAGE",
						analysisPackage.PackageGUID,
						"PACKAGE",
						recognizedDefinition.guid,
						analysisPackage.PackageGUID,
						"",
						{
							initialized: true
						},
						{
							initializationState:
								initializationState,

							initialized: false
						},
						false
					);

				if (packageInitializationRuleResult)
				{
					result.ruleResults.push(
						packageInitializationRuleResult
					);
				}

				var packageNotInitializedIssue =
				{
					code:
						"PACKAGE_NOT_INITIALIZED",

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_ERROR,

					action:
						addin.fbaConstants
							.CHECK_ACTION_INIT,

					objectType:
						"PACKAGE",

					objectGuid:
						analysisPackage.PackageGUID,

					objectName:
						analysisPackage.Name,

					analysisElementGuid:
						recognizedDefinition.guid,

					message:
						"Le package correspond à un Analysis Element "
						+ "du métamodèle mais n'est pas initialisé."
				};


				this._registerCheckIssue(
					result,
					packageNotInitializedIssue
				);


				addin.logger.warning(
					"Package reconnu mais non initialisé"
					+ " | Package=" + analysisPackage.Name
					+ " | Definition=" + recognizedDefinition.name
					+ " | Action=INIT"
				);
			}

			// -----------------------------------------------------
			// Package libre / non reconnu
			// -----------------------------------------------------

			else
			{
				var packageNotRecognizedIssue =
				{
					code:
						"PACKAGE_NOT_RECOGNIZED",

					severity:
						addin.fbaConstants
							.CHECK_SEVERITY_WARNING,

					action:
						addin.fbaConstants
							.CHECK_ACTION_MANUAL_REVIEW,

					objectType:
						"PACKAGE",

					objectGuid:
						analysisPackage.PackageGUID,

					objectName:
						analysisPackage.Name,

					message:
						"Le package n'est pas reconnu "
						+ "par le métamodèle."
				};


				this._registerCheckIssue(
					result,
					packageNotRecognizedIssue
				);


				addin.logger.warning(
					"Package non reconnu par le métamodèle"
					+ " | Package=" + analysisPackage.Name
					+ " | Action="
					+ addin.fbaConstants
						.CHECK_ACTION_MANUAL_REVIEW
				);
			}
		}


		// ---------------------------------------------------------
		// 1.2 PACKAGE LEGACY
		// ---------------------------------------------------------

		else if (initializationState == "LEGACY")
		{
			var packageLegacyInitializationRuleResult =
				this._createCheckRuleResult(
					"PACKAGE_INITIALIZATION",
					"LOCAL",
					"ANALYSIS_PACKAGE",
					analysisPackage.PackageGUID,
					"PACKAGE",
					"",
					analysisPackage.PackageGUID,
					"",
					{
						initialized: true
					},
					{
						initializationState: initializationState,
						initialized: false
					},
					false
				);

			if (packageLegacyInitializationRuleResult)
			{
				result.ruleResults.push(
					packageLegacyInitializationRuleResult
				);
			}
			var legacyIssue =
			{
				code:
					"PACKAGE_LEGACY_INITIALIZATION",

				severity:
					"ERROR",

				action:
					"REPAIR",

				objectType:
					"PACKAGE",

				objectGuid:
					analysisPackage.PackageGUID,

				objectName:
					analysisPackage.Name,

				message:
					"Le package utilise une initialisation "
					+ "Framework BA historique."
			};


			this._registerCheckIssue(
				result,
				legacyIssue
			);


			addin.logger.warning(
				"Package FrameworkBA historique détecté"
				+ " | Package=" + analysisPackage.Name
				+ " | State=LEGACY"
				+ " | Action=REPAIR"
			);
		}


		// ---------------------------------------------------------
		// 1.3 INITIALISATION INCOMPLETE
		// ---------------------------------------------------------

		else if (initializationState == "INCOMPLETE")
		{
			var packageIncompleteInitializationRuleResult =
				this._createCheckRuleResult(
					"PACKAGE_INITIALIZATION",
					"LOCAL",
					"ANALYSIS_PACKAGE",
					analysisPackage.PackageGUID,
					"PACKAGE",
					"",
					analysisPackage.PackageGUID,
					"",
					{
						initialized: true
					},
					{
						initializationState: initializationState,
						initialized: false
					},
					false
				);

			if (packageIncompleteInitializationRuleResult)
			{
				result.ruleResults.push(
					packageIncompleteInitializationRuleResult
				);
			}
			var incompleteIssue =
			{
				code:
					"PACKAGE_INCOMPLETE_INITIALIZATION",

				severity:
					"ERROR",

				action:
					"REPAIR",

				objectType:
					"PACKAGE",

				objectGuid:
					analysisPackage.PackageGUID,

				objectName:
					analysisPackage.Name,

				message:
					"L'initialisation Framework BA "
					+ "du package est incomplète."
			};


			this._registerCheckIssue(
				result,
				incompleteIssue
			);


			addin.logger.warning(
				"Initialisation FrameworkBA incomplète"
				+ " | Package=" + analysisPackage.Name
				+ " | State=INCOMPLETE"
				+ " | Action=REPAIR"
			);
		}


		// ---------------------------------------------------------
		// 1.4 ETAT INCONNU
		// ---------------------------------------------------------

		else if (initializationState != "INITIALIZED")
		{
			var unknownInitializationStateIssue =
			{
				code:
					"PACKAGE_UNKNOWN_INITIALIZATION_STATE",

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_MANUAL_REVIEW,

				objectType:
					"PACKAGE",

				objectGuid:
					analysisPackage.PackageGUID,

				objectName:
					analysisPackage.Name,

				initializationState:
					initializationState,

				message:
					"L'état d'initialisation Framework BA "
					+ "du package est inconnu."
			};


			this._registerCheckIssue(
				result,
				unknownInitializationStateIssue
			);


			addin.logger.warning(
				"Etat d'initialisation FrameworkBA inconnu"
				+ " | Package=" + analysisPackage.Name
				+ " | State=" + initializationState
				+ " | Action="
				+ addin.fbaConstants
					.CHECK_ACTION_MANUAL_REVIEW
			);
		}


		// =========================================================
		// 2. CONTROLES D'UN PACKAGE INITIALISE
		// =========================================================

		if (initializationState == "INITIALIZED")
		{
			var packageInitializedRuleResult =
				this._createCheckRuleResult(
					"PACKAGE_INITIALIZATION",
					"LOCAL",
					"ANALYSIS_PACKAGE",
					analysisPackage.PackageGUID,
					"PACKAGE",
					"",
					analysisPackage.PackageGUID,
					"",
					{
						initialized: true
					},
					{
						initializationState: initializationState,
						initialized: true
					},
					true
				);

			if (packageInitializedRuleResult)
			{
				result.ruleResults.push(
					packageInitializedRuleResult
				);
			}
			// -----------------------------------------------------
			// 2.1 ANALYSIS ELEMENT SOURCE
			// -----------------------------------------------------

			var sourceAnalysisGuid =
				addin.repositoryService.getTaggedValue(
					analysisPackage.Element,
					addin.fbaConstants
						.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
				);


			var analysisDefinitions =
				this._getOperationDefinitions();


			var analysisDefinition = null;


			for (
				var d = 0;
				d < analysisDefinitions.length;
				d++
			)
			{
				var candidateDefinition =
					analysisDefinitions[d];


				if (!candidateDefinition)
					continue;


				if (
					addin.utils.equalsIgnoreCase(
						candidateDefinition.guid,
						sourceAnalysisGuid
					)
				)
				{
					analysisDefinition =
						candidateDefinition;

					break;
				}
			}

			var analysisElementReferenceRuleResult =
				this._createCheckRuleResult(
					"ANALYSIS_ELEMENT_REFERENCE",
					"LOCAL",
					"ANALYSIS_PACKAGE",
					analysisPackage.PackageGUID,
					"PACKAGE",
					sourceAnalysisGuid || "",
					analysisPackage.PackageGUID,
					"",
					{
						existsInMetamodel: true
					},
					{
						sourceAnalysisElementGuid:
							sourceAnalysisGuid || "",

						found:
							analysisDefinition
								? true
								: false
					},
					analysisDefinition
						? true
						: false
				);

			if (analysisElementReferenceRuleResult)
			{
				result.ruleResults.push(
					analysisElementReferenceRuleResult
				);
			}

			// -----------------------------------------------------
			// 2.2 ANALYSIS ELEMENT INTROUVABLE
			// -----------------------------------------------------

			if (!analysisDefinition)
			{
				var analysisElementNotFoundIssue =
				{
					code:
						"ANALYSIS_ELEMENT_NOT_FOUND",

					severity:
						"ERROR",

					action:
						"REPAIR",

					objectType:
						"PACKAGE",

					objectGuid:
						analysisPackage.PackageGUID,

					objectName:
						analysisPackage.Name,

					sourceAnalysisElementGuid:
						sourceAnalysisGuid || "",

					message:
						"L'Analysis Element associé au package "
						+ "n'existe plus dans le métamodèle."
				};


				this._registerCheckIssue(
					result,
					analysisElementNotFoundIssue
				);


				addin.logger.warning(
					"Analysis Element associé introuvable"
					+ " | Package=" + analysisPackage.Name
					+ " | AnalysisElementGUID="
					+ (sourceAnalysisGuid || "")
					+ " | Action=REPAIR"
				);
			}


			// =====================================================
			// 3. CONTROLES DEPENDANT DE L'ANALYSIS ELEMENT
			// =====================================================

			else
			{
				// -------------------------------------------------
				// 3.1 INDEX DES DEFINITIONS D'ARTEFACTS
				// -------------------------------------------------

				var artifactIndex =
					this._getOperationArtifactDefinitionsIndex();


				var analysisTagIndex =
					this._getOperationAnalysisElementTagsIndex();


				if (!artifactIndex)
					artifactIndex = {};


				if (!analysisTagIndex)
					analysisTagIndex = {};


				var artifactDefinitions =
					this._loadArtifactDefinitions(
						analysisDefinition,
						artifactIndex,
						analysisTagIndex
					);


				addin.logger.info(
					"CHECK artefacts"
					+ " | Package=" + analysisPackage.Name
					+ " | Definitions="
					+ artifactDefinitions.length
				);


				// =================================================
				// 4. ARTEFACTS
				// =================================================
				
				var recognizedArtifactGuids = {};

				for (
					var a = 0;
					a < artifactDefinitions.length;
					a++
				)
				{
					var artifactDefinition =
						artifactDefinitions[a];


					result.metrics.artifacts.expected++;
					
					var matchingArtifacts =
						this._findArtifactsMatchingDefinition(
							analysisPackage,
							artifactDefinition,
							artifactDefinitions
						);


					var matchingArtifactCount =
						matchingArtifacts
							? matchingArtifacts.length
							: 0;


					// =====================================================
					// 48A - RULE RESULT
					// ARTIFACT PRESENCE / MULTIPLICITY
					// =====================================================

					if (result.ruleResults)
					{
						var artifactMultiplicity =
							artifactDefinition.multiplicity || "";

						var artifactMinimum = null;
						var artifactMaximum = null;


						if (!addin.utils.isEmpty(
								artifactMultiplicity
							))
						{
							var multiplicityParts =
								String(
									artifactMultiplicity
								).split("..");


							if (multiplicityParts.length === 1)
							{
								var exactMultiplicity =
									parseInt(
										multiplicityParts[0],
										10
									);


								if (!isNaN(exactMultiplicity))
								{
									artifactMinimum =
										exactMultiplicity;

									artifactMaximum =
										exactMultiplicity;
								}
							}

							else if (
								multiplicityParts.length === 2
							)
							{
								var minimumMultiplicity =
									parseInt(
										multiplicityParts[0],
										10
									);


								if (!isNaN(minimumMultiplicity))
								{
									artifactMinimum =
										minimumMultiplicity;
								}


								if (
									multiplicityParts[1] !== "*" &&
									multiplicityParts[1] !== ""
								)
								{
									var maximumMultiplicity =
										parseInt(
											multiplicityParts[1],
											10
										);


									if (!isNaN(maximumMultiplicity))
									{
										artifactMaximum =
											maximumMultiplicity;
									}
								}
							}
						}


						var artifactPresencePassed = true;


						if (
							artifactMinimum !== null &&
							matchingArtifactCount <
								artifactMinimum
						)
						{
							artifactPresencePassed = false;
						}


						if (
							artifactMaximum !== null &&
							matchingArtifactCount >
								artifactMaximum
						)
						{
							artifactPresencePassed = false;
						}


						var artifactPresenceRuleResult =
							this._createCheckRuleResult(
								"ARTIFACT_PRESENCE",

								"LOCAL",
								"ANALYSIS_PACKAGE",
								analysisPackage.PackageGUID,

								"ARTIFACT_DEFINITION",

								analysisDefinition.guid,

								artifactDefinition.prototypeGuid,

								artifactDefinition.importanceLevel || "",

								{
									multiplicity:
										artifactMultiplicity,

									min:
										artifactMinimum,

									max:
										artifactMaximum
								},

								{
									count:
										matchingArtifactCount
								},

								artifactPresencePassed
							);


						if (artifactPresenceRuleResult)
						{
							result.ruleResults.push(
								artifactPresenceRuleResult
							);
						}
					}


					// -------------------------------------------------
					// Artefacts trouvés
					// -------------------------------------------------

					if (matchingArtifactCount > 0)
					{
						result.metrics.artifacts.found +=
							matchingArtifactCount;

						// =====================================================
						// CHECK NOTE DES ARTEFACTS TROUVES
						// =====================================================

						var prototypeElement =
							addin.repositoryService
								.getElementByGuid(
									artifactDefinition.prototypeGuid
								);


						var noteRequirement =
							this._getNoteRequirement(
								prototypeElement
							);


						for (
							var artifactIndex = 0;
							artifactIndex <
								matchingArtifacts.length;
							artifactIndex++
						)
						{
							var matchingArtifact =
								matchingArtifacts[
									artifactIndex
								];


							if (!matchingArtifact)
								continue;

							recognizedArtifactGuids[
								addin.utils.normalizeGuid(
									matchingArtifact.ElementGUID
								)
							] = true;
							// =====================================================
							// ENREGISTREMENT DE L'ARTEFACT
							// =====================================================

							var artifactResult =
								this._registerCheckObject(
									result,
									matchingArtifact.ElementGUID,
									"ARTIFACT",
									matchingArtifact.Name,
									analysisPackage.PackageGUID
								);


							// =====================================================
							// CHECK NOMMAGE DE L'ARTEFACT
							// =====================================================

							var namingIssues =
								this._checkArtifactName(
									matchingArtifact,
									artifactDefinition
								);
							
							var artifactNamingRuleResult =
								this._createCheckRuleResult(
									"ARTIFACT_NAMING",
									"LOCAL",
									"ARTIFACT",
									matchingArtifact.ElementGUID,
									"ARTIFACT",
									analysisDefinition.guid,
									matchingArtifact.ElementGUID,
									"",
									{
										prefix:
											artifactDefinition.prefix || ""
									},
									{
										name:
											matchingArtifact.Name,

										issueCount:
											namingIssues
												? namingIssues.length
												: 0
									},
									!namingIssues ||
									namingIssues.length === 0
								);

							if (artifactNamingRuleResult)
							{
								result.ruleResults.push(
									artifactNamingRuleResult
								);
							}

							if (
								namingIssues &&
								namingIssues.length > 0
							)
							{
								result.metrics.artifacts
									.namingInvalid++;


								for (
									var namingIssueIndex = 0;
									namingIssueIndex <
										namingIssues.length;
									namingIssueIndex++
								)
								{
									var namingIssue =
										namingIssues[
											namingIssueIndex
										];


									namingIssue.objectType =
										"ARTIFACT";

									namingIssue.objectGuid =
										matchingArtifact
											.ElementGUID;

									namingIssue.objectName =
										matchingArtifact.Name;

									namingIssue.analysisElementGuid =
										analysisDefinition.guid;

									namingIssue.artifactDefinitionGuid =
										artifactDefinition
											.prototypeGuid;

									namingIssue.artifactType =
										artifactDefinition
											.elementType;

									namingIssue.stereotype =
										artifactDefinition
											.stereotype;


									this._registerCheckIssue(
										result,
										namingIssue
									);


									addin.logger.warning(
										"Nommage d'artefact non conforme"
										+ " | Package="
										+ analysisPackage.Name
										+ " | Artefact="
										+ matchingArtifact.Name
										+ " | Issue="
										+ namingIssue.code
										+ " | Action="
										+ namingIssue.action
									);
								}
							}
							else
							{
								result.metrics.artifacts
									.namingValid++;

							}


							// ========================================================
							// CHECK - TECHNICAL ARTIFACT IN MODEL PACKAGE
							// ========================================================

							var technicalNameIssues =
								this._checkArtifactTechnicalName(
									matchingArtifact,
									analysisPackage
								);
							
							var artifactTechnicalNamingRuleResult =
								this._createCheckRuleResult(
									"ARTIFACT_TECHNICAL_NAMING",
									"LOCAL",
									"ARTIFACT",
									matchingArtifact.ElementGUID,
									"ARTIFACT",
									analysisDefinition.guid,
									matchingArtifact.ElementGUID,
									"",
									{
										technicalPackage:
											addin.repositoryService
												.isTechnicalPackage(
													analysisPackage
												)
									},
									{
										name:
											matchingArtifact.Name,

										technicalName:
											addin.utils.isTechnicalName(
												matchingArtifact.Name
											),

										issueCount:
											technicalNameIssues
												? technicalNameIssues.length
												: 0
									},
									!technicalNameIssues ||
									technicalNameIssues.length === 0
								);

							if (artifactTechnicalNamingRuleResult)
							{
								result.ruleResults.push(
									artifactTechnicalNamingRuleResult
								);
							}


							if (
								technicalNameIssues &&
								technicalNameIssues.length > 0
							)
							{
								for (
									var technicalIssueIndex = 0;
									technicalIssueIndex <
										technicalNameIssues.length;
									technicalIssueIndex++
								)
								{
									var technicalIssue =
										technicalNameIssues[
											technicalIssueIndex
										];


									technicalIssue.objectType =
										"ARTIFACT";

									technicalIssue.objectGuid =
										matchingArtifact
											.ElementGUID;

									technicalIssue.objectName =
										matchingArtifact.Name;

									technicalIssue.analysisElementGuid =
										analysisDefinition.guid;

									technicalIssue.artifactDefinitionGuid =
										artifactDefinition
											.prototypeGuid;

									technicalIssue.artifactType =
										artifactDefinition
											.elementType;

									technicalIssue.stereotype =
										artifactDefinition
											.stereotype;


									this._registerCheckIssue(
										result,
										technicalIssue
									);


									addin.logger.warning(
										"Artefact technique dans un package modèle"
										+ " | Package="
										+ analysisPackage.Name
										+ " | Artefact="
										+ matchingArtifact.Name
										+ " | Issue="
										+ technicalIssue.code
										+ " | Action="
										+ technicalIssue.action
									);
								}
							}


							// -------------------------------------------------
							// Note présente
							// -------------------------------------------------

							addin.logger.info(
								"CHECK NOTE artefact"
								+ " | ArtifactDefinitionGUID="
								+ artifactDefinition.prototypeGuid
								+ " | Prototype="
								+ (
									prototypeElement
										? prototypeElement.Name
										: "<NULL>"
								)
								+ " | Requirement="
								+ noteRequirement
								+ " | MatchingArtifacts="
								+ matchingArtifacts.length
							);


							var artifactHasNote =
								this._hasNote(
									matchingArtifact
								);


							// =====================================================
							// 48D - RULE RESULT
							// NOTE REQUIREMENT - ARTIFACT
							// =====================================================

							if (result.ruleResults)
							{
								var artifactNotePassed = true;


								if (
									addin.utils.equalsIgnoreCase(
										noteRequirement,
										"Obligatoire"
									) &&
									!artifactHasNote
								)
								{
									artifactNotePassed = false;
								}


								var artifactNoteRuleResult =
									this._createCheckRuleResult(
										"NOTE_REQUIREMENT",

										"LOCAL",
										"ARTIFACT",
										matchingArtifact.ElementGUID,

										"ARTIFACT",

										analysisDefinition.guid,

										matchingArtifact.ElementGUID,

										noteRequirement || "",

										{
											requirement:
												noteRequirement || ""
										},

										{
											present:
												artifactHasNote
										},

										artifactNotePassed
									);


								if (artifactNoteRuleResult)
								{
									result.ruleResults.push(
										artifactNoteRuleResult
									);
								}
							}


							// -------------------------------------------------
							// Note présente
							// -------------------------------------------------

							if (artifactHasNote)
							{
								result.metrics.artifacts.withNote++;
							}
							else
							{
								// -------------------------------------------------
								// Note absente
								// -------------------------------------------------

								result.metrics.artifacts
									.withoutNote++;

								var noteSeverity =
									this._getNoteMissingSeverity(
										noteRequirement
									);

								// Optionnel / aucune contrainte
								if (noteSeverity !== "")
								{
									var noteIssue =
									{
										code:
											addin.fbaConstants
												.CHECK_ISSUE_ARTIFACT_NOTE_MISSING,

										severity:
											noteSeverity,

										action:
											addin.fbaConstants
												.CHECK_ACTION_MANUAL_COMPLETE,

										objectType:
											"ARTIFACT",

										objectGuid:
											matchingArtifact
												.ElementGUID,

										objectName:
											matchingArtifact.Name,

										analysisElementGuid:
											analysisDefinition.guid,

										artifactDefinitionGuid:
											artifactDefinition
												.prototypeGuid,

										artifactType:
											artifactDefinition
												.elementType,

										stereotype:
											artifactDefinition
												.stereotype,

										noteRequirement:
											noteRequirement,

										message:
											"La Note de l'artefact est absente "
											+ "alors que le métamodèle la définit comme "
											+ noteRequirement
											+ "."
									};


									this._registerCheckIssue(
										result,
										noteIssue
									);


									addin.logger.warning(
										"Note d'artefact absente"
										+ " | Package="
										+ analysisPackage.Name
										+ " | Artefact="
										+ matchingArtifact.Name
										+ " | Requirement="
										+ noteRequirement
										+ " | Severity="
										+ noteSeverity
										+ " | Action=MANUAL_COMPLETE"
									);
								}
							}
							
							// =====================================================
							// STATUT DE CONFORMITE DE L'ARTEFACT
							// =====================================================

							var artifactStatus =
								this._getCheckStatus(
									artifactResult
										? artifactResult.issues
										: []
								);

							if (
								artifactStatus ==
								addin.fbaConstants
									.CHECK_STATUS_NON_COMPLIANT
							)
							{
								result.metrics.artifacts
									.nonCompliant++;
							}
							else
							{
								result.metrics.artifacts
									.compliant++;
							}
						}
					}


					// ---------------------------------------------
					// Artefact obligatoire absent
					// ---------------------------------------------

					if (
						(!matchingArtifacts ||
						 matchingArtifacts.length == 0) &&

						addin.utils.equalsIgnoreCase(
							artifactDefinition.importanceLevel,
							"Obligatoire"
						)
					)
					{
						result.metrics.artifacts.missing++;
						
						var mandatoryArtifactMissingIssue =
						{
							code:
								"MANDATORY_ARTIFACT_MISSING",

							severity:
								addin.fbaConstants
									.CHECK_SEVERITY_ERROR,

							action:
								addin.fbaConstants
									.CHECK_ACTION_COMPLETE,

							objectType:
								"PACKAGE",

							objectGuid:
								analysisPackage.PackageGUID,

							objectName:
								analysisPackage.Name,

							analysisElementGuid:
								analysisDefinition.guid,

							artifactDefinitionGuid:
								artifactDefinition
									.prototypeGuid,

							artifactType:
								artifactDefinition
									.elementType,

							stereotype:
								artifactDefinition
									.stereotype,

							importance:
								artifactDefinition
									.importanceLevel,

							message:
								"Un type d'artefact obligatoire "
								+ "est absent du package."
						};


						this._registerCheckIssue(
							result,
							mandatoryArtifactMissingIssue
						);


						addin.logger.warning(
							"Artefact obligatoire manquant"
							+ " | Package="
							+ analysisPackage.Name
							+ " | Type="
							+ artifactDefinition.elementType
							+ " | Stereotype="
							+ artifactDefinition.stereotype
							+ " | Importance="
							+ artifactDefinition.importanceLevel
							+ " | Action=COMPLETE"
						);


						continue;
					}


					addin.logger.debug(
						"Artefact attendu"
						+ " | Package="
						+ analysisPackage.Name
						+ " | DefinitionGUID="
						+ artifactDefinition.prototypeGuid
						+ " | Importance="
						+ artifactDefinition.importanceLevel
						+ " | Nombre="
						+ (
							matchingArtifacts
								? matchingArtifacts.length
								: 0
						)
					);
				}
				
				// =====================================================
				// ARTEFACTS NON RECONNUS PAR LE METAMODELE
				// =====================================================

				var packageElements =
					analysisPackage.Elements;

				for (
					var foreignIndex = 0;
					foreignIndex < packageElements.Count;
					foreignIndex++
				)
				{
					var foreignArtifact =
						packageElements.GetAt(
							foreignIndex
						);

					if (!foreignArtifact)
						continue;

					var foreignGuid =
						addin.utils.normalizeGuid(
							foreignArtifact.ElementGUID
						);

					if (
						recognizedArtifactGuids[
							foreignGuid
						]
					)
					{
						continue;
					}

					result.metrics.artifacts
						.foreign++;
					// =====================================================
					// ENREGISTREMENT DE L'ARTEFACT FOREIGN
					// =====================================================

					this._registerCheckObject(
						result,
						foreignArtifact.ElementGUID,
						"ARTIFACT",
						foreignArtifact.Name,
						analysisPackage.PackageGUID
					);


					// =====================================================
					// NON-CONFORMITE AU METAMODELE
					// =====================================================

					var foreignArtifactIssue =
					{
						code:
							"ARTIFACT_NOT_IN_METAMODEL",

						severity:
							addin.fbaConstants
								.CHECK_SEVERITY_ERROR,

						action:
							addin.fbaConstants
								.CHECK_ACTION_MANUAL_REVIEW,

						objectType:
							"ARTIFACT",

						objectGuid:
							foreignArtifact.ElementGUID,

						objectName:
							foreignArtifact.Name,

						analysisElementGuid:
							analysisDefinition.guid,

						message:
							"L'artefact présent dans le package ne correspond "
							+ "à aucune définition d'artefact du métamodèle."
					};


					this._registerCheckIssue(
						result,
						foreignArtifactIssue
					);
				}


				// =================================================
				// 5. DIAGRAMMES OBLIGATOIRES
				// =================================================

				var diagramDefinitions =
					this._loadDiagramDefinitions(
						analysisDefinition.element
					);


				addin.logger.info(
					"CHECK diagrammes"
					+ " | Package="
					+ analysisPackage.Name
					+ " | Definitions="
					+ diagramDefinitions.length
				);

				var recognizedDiagramGuids = {};
				
				for (
					var g = 0;
					g < diagramDefinitions.length;
					g++
				)
				{
					var diagramDefinition =
						diagramDefinitions[g];


					var effectiveConfig =
						this._resolveEffectiveDiagramConfig(
							diagramDefinition
						);

					result.metrics.diagrams.expected++;
					
					var diagramCheckResult =
						this._createDiagramCheckResult(
							diagramDefinition,
							null,
							effectiveConfig
						);

					var diagramImportance =
						effectiveConfig
							? effectiveConfig.importanceLevel
							: "";


					// ---------------------------------------------
					// Diagramme Framework BA existant
					// ---------------------------------------------

					var generatedDiagrams =
						this._findGeneratedDiagramsForPackage(
							rootPackage,
							analysisPackage,
							diagramDefinition.guid
						);


					if (
						generatedDiagrams &&
						generatedDiagrams.length > 0
					)
					{
						for (
							var generatedIndex = 0;
							generatedIndex < generatedDiagrams.length;
							generatedIndex++
						)
						{
							var recognizedGeneratedDiagram =
								generatedDiagrams[
									generatedIndex
								];

							if (!recognizedGeneratedDiagram)
								continue;

							recognizedDiagramGuids[
								addin.utils.normalizeGuid(
									recognizedGeneratedDiagram
										.DiagramGUID
								)
							] = true;
						}
						
						var compatibleNonGeneratedCount = 0;

						analysisPackage.Diagrams.Refresh();

						for (
							var presenceDiagramIndex = 0;
							presenceDiagramIndex < analysisPackage.Diagrams.Count;
							presenceDiagramIndex++
						)
						{
							var presenceCandidateDiagram =
								analysisPackage.Diagrams.GetAt(
									presenceDiagramIndex
								);

							if (!presenceCandidateDiagram)
								continue;

							var presenceCandidateGuid =
								addin.utils.normalizeGuid(
									presenceCandidateDiagram.DiagramGUID
								);

							if (
								!recognizedDiagramGuids[
									presenceCandidateGuid
								] &&
								addin.utils.equalsIgnoreCase(
									presenceCandidateDiagram.MetaType,
									diagramDefinition.metaType
								)
							)
							{
								compatibleNonGeneratedCount++;
							}
						}

						// =====================================================
						// 48B.1 - RULE RESULT
						// DIAGRAM PRESENCE - FRAMEWORK BA
						// =====================================================

						if (result.ruleResults)
						{
							var generatedDiagramPresenceRuleResult =
								this._createCheckRuleResult(
									"DIAGRAM_PRESENCE",

									"LOCAL",
									"ANALYSIS_PACKAGE",
									analysisPackage.PackageGUID,

									"DIAGRAM_DEFINITION",

									analysisDefinition.guid,

									diagramDefinition.guid,

									diagramImportance,

									{
										required:
											addin.utils.equalsIgnoreCase(
												diagramImportance,
												"Obligatoire"
											),

										recommended:
											addin.utils.equalsIgnoreCase(
												diagramImportance,
												"Recommandé"
											)
									},

									{
										count:
											generatedDiagrams.length
											+ compatibleNonGeneratedCount,

										found:
											true
									},

									true
								);


							if (
								generatedDiagramPresenceRuleResult
							)
							{
								result.ruleResults.push(
									generatedDiagramPresenceRuleResult
								);
							}
						}


						for (
							var generatedCheckIndex = 0;
							generatedCheckIndex < generatedDiagrams.length;
							generatedCheckIndex++
						)
						{
							var generatedDiagram =
								generatedDiagrams[
									generatedCheckIndex
								];

							if (!generatedDiagram)
								continue;

							result.metrics.diagrams.found++;

							diagramCheckResult =
								this._createDiagramCheckResult(
									diagramDefinition,
									generatedDiagram,
									effectiveConfig
								);

						var generatedDiagramObjectResult =
							this._registerCheckObject(
								result,
								generatedDiagram.DiagramGUID,
								"DIAGRAM",
								generatedDiagram.Name,
								analysisPackage.PackageGUID
							);

						


						diagramCheckResult.diagram.guid =
							generatedDiagram.DiagramGUID;

						diagramCheckResult.diagram.name =
							generatedDiagram.Name;

						diagramCheckResult.diagram.metaType =
							generatedDiagram.MetaType;

						diagramCheckResult.found = true;

						diagramCheckResult.status =
							addin.fbaConstants
								.CHECK_STATUS_COMPLIANT;

						diagramCheckResult
							.metrics.diagrams.found = 1;


						// ========================================================
						// CHECK - DIAGRAM NAMING
						// ========================================================

						var diagramNamingIssues =
							this._checkDiagramName(
								generatedDiagram,
								effectiveConfig
							);
						
						var diagramNamingRuleResult =
							this._createCheckRuleResult(
								"DIAGRAM_NAMING",
								"LOCAL",
								"DIAGRAM",
								generatedDiagram.DiagramGUID,
								"DIAGRAM",
								analysisDefinition.guid,
								generatedDiagram.DiagramGUID,
								"",
								{
									prefix:
										effectiveConfig.prefix || ""
								},
								{
									name:
										generatedDiagram.Name,

									issueCount:
										diagramNamingIssues
											? diagramNamingIssues.length
											: 0
								},
								!diagramNamingIssues ||
								diagramNamingIssues.length === 0
							);

						if (diagramNamingRuleResult)
						{
							result.ruleResults.push(
								diagramNamingRuleResult
							);
						}


						if (
							diagramNamingIssues &&
							diagramNamingIssues.length > 0
						)
						{
							result.metrics.diagrams
								.namingInvalid++;
							
							diagramCheckResult
								.metrics.diagrams
								.namingInvalid++;

							for (
								var diagramNamingIssueIndex = 0;
								diagramNamingIssueIndex <
									diagramNamingIssues.length;
								diagramNamingIssueIndex++
							)
							{
								var diagramNamingIssue =
									diagramNamingIssues[
										diagramNamingIssueIndex
									];

								diagramNamingIssue.objectType =
									"DIAGRAM";

								diagramNamingIssue.objectGuid =
									generatedDiagram
										.DiagramGUID;

								diagramNamingIssue.objectName =
									generatedDiagram.Name;

								diagramNamingIssue.analysisElementGuid =
									analysisDefinition.guid;

								diagramNamingIssue.diagramDefinitionGuid =
									diagramDefinition.guid;

								diagramCheckResult.issues.push(
									diagramNamingIssue
								);

								addin.logger.warning(
									"Nommage de diagramme non conforme"
									+ " | Package="
									+ analysisPackage.Name
									+ " | Diagram="
									+ generatedDiagram.Name
									+ " | ExpectedPrefix="
									+ diagramNamingIssue
										.expectedPrefix
									+ " | Reason="
									+ diagramNamingIssue.reason
									+ " | Action="
									+ diagramNamingIssue.action
								);
							}
						}
						else
						{
							diagramCheckResult
								.metrics.diagrams
								.namingValid++;

							result.metrics.diagrams
								.namingValid++;

						}


						// ========================================================
						// CHECK - TECHNICAL DIAGRAM IN MODEL PACKAGE
						// ========================================================

						var diagramTechnicalIssues =
							this._checkDiagramTechnicalName(
								generatedDiagram,
								analysisPackage
							);

						var diagramTechnicalNamingRuleResult =
							this._createCheckRuleResult(
								"DIAGRAM_TECHNICAL_NAMING",
								"LOCAL",
								"DIAGRAM",
								generatedDiagram.DiagramGUID,
								"DIAGRAM",
								analysisDefinition.guid,
								generatedDiagram.DiagramGUID,
								"",
								{
									technicalPackage:
										addin.repositoryService
											.isTechnicalPackage(
												analysisPackage
											)
								},
								{
									name:
										generatedDiagram.Name,

									technicalName:
										addin.utils.isTechnicalName(
											generatedDiagram.Name
										),

									issueCount:
										diagramTechnicalIssues
											? diagramTechnicalIssues.length
											: 0
								},
								!diagramTechnicalIssues ||
								diagramTechnicalIssues.length === 0
							);

						if (diagramTechnicalNamingRuleResult)
						{
							result.ruleResults.push(
								diagramTechnicalNamingRuleResult
							);
						}
						if (
							diagramTechnicalIssues &&
							diagramTechnicalIssues.length > 0
						)
						{
							for (
								var diagramTechnicalIssueIndex = 0;
								diagramTechnicalIssueIndex <
									diagramTechnicalIssues.length;
								diagramTechnicalIssueIndex++
							)
							{
								var diagramTechnicalIssue =
									diagramTechnicalIssues[
										diagramTechnicalIssueIndex
									];


								diagramTechnicalIssue.objectType =
									"DIAGRAM";

								diagramTechnicalIssue.analysisElementGuid =
									analysisDefinition.guid;

								diagramTechnicalIssue.diagramDefinitionGuid =
									diagramDefinition.guid;

								
								diagramCheckResult.issues.push(
									diagramTechnicalIssue
								);


								addin.logger.warning(
									"Diagramme technique dans un package modèle"
									+ " | Package="
									+ analysisPackage.Name
									+ " | Diagram="
									+ generatedDiagram.Name
									+ " | Issue="
									+ diagramTechnicalIssue.code
									+ " | Action="
									+ diagramTechnicalIssue.action
								);
							}
						}


						// =========================================
						// CHECK NOTE ET ARTEFACTS DU DIAGRAMME
						// =========================================

						this._checkDiagramNote(
							generatedDiagram,
							diagramDefinition,
							effectiveConfig,
							diagramCheckResult,
							result
						);


						this._checkDiagramArtifacts(
							generatedDiagram,
							diagramDefinition,
							diagramCheckResult,
							artifactDefinitions,
							result
						);


						// =========================================
						// PROPAGATION DES ISSUES DU DIAGRAMME
						// =========================================

						if (
							diagramCheckResult.issues &&
							diagramCheckResult.issues.length > 0
						)
						{
							for (
								var issueIndex = 0;
								issueIndex <
									diagramCheckResult
										.issues.length;
								issueIndex++
							)
							{
								var diagramIssue =
									diagramCheckResult
										.issues[
											issueIndex
										];


								this._registerCheckIssue(
									result,
									diagramIssue
								);
							}
						}
						
						// =========================================
						// DETERMINATION DE LA CONFORMITE
						// =========================================

						diagramCheckResult.status =
							this._getCheckStatus(
								diagramCheckResult.issues
							);

						// =========================================
						// METRIQUES DE CONFORMITE DU DIAGRAMME
						// =========================================

						if (
							diagramCheckResult.status ==
							addin.fbaConstants
								.CHECK_STATUS_NON_COMPLIANT
						)
						{
							diagramCheckResult
								.metrics.diagrams
								.compliant = 0;

							diagramCheckResult
								.metrics.diagrams
								.nonCompliant = 1;

							result.metrics.diagrams
								.nonCompliant++;

						}
						else
						{
							diagramCheckResult
								.metrics.diagrams
								.compliant = 1;

							result.metrics.diagrams
								.compliant++;

						}

							addin.logger.debug(
								"Diagramme Framework BA présent"
								+ " | Package="
								+ analysisPackage.Name
								+ " | Diagram="
								+ generatedDiagram.Name
								+ " | DefinitionGUID="
								+ diagramDefinition.guid
								+ " | Artifacts="
								+ diagramCheckResult
									.artifacts.length
							);
						}

					}


					// ---------------------------------------------
					// Diagramme analyste compatible
					// ---------------------------------------------

					var existingDiagram = null;
					var existingDiagrams = [];

					analysisPackage.Diagrams.Refresh();


					for (
						var e = 0;
						e < analysisPackage.Diagrams.Count;
						e++
					)
					{
						var candidateDiagram =
							analysisPackage.Diagrams.GetAt(e);


						if (!candidateDiagram)
							continue;


						var candidateDiagramGuid =
							addin.utils.normalizeGuid(
								candidateDiagram.DiagramGUID
							);

						if (
							!recognizedDiagramGuids[
								candidateDiagramGuid
							] &&
							addin.utils.equalsIgnoreCase(
								candidateDiagram.MetaType,
								diagramDefinition.metaType
							)
						)
						{
							existingDiagrams.push(
								candidateDiagram
							);
													
							recognizedDiagramGuids[
								addin.utils.normalizeGuid(
									candidateDiagram.DiagramGUID
								)
							] = true;

							if (!existingDiagram)
							{
								existingDiagram =
									candidateDiagram;
							}
						}
					}


					if (existingDiagrams.length > 0)
					{
						// =====================================================
						// 48B.2 - RULE RESULT
						// DIAGRAM PRESENCE - ANALYSTE
						// Une seule règle de présence par définition
						// =====================================================

						if (
							result.ruleResults &&
							(!generatedDiagrams || generatedDiagrams.length === 0)
						)
						{
							var existingDiagramPresenceRuleResult =
								this._createCheckRuleResult(
									"DIAGRAM_PRESENCE",

									"LOCAL",
									"ANALYSIS_PACKAGE",
									analysisPackage.PackageGUID,

									"DIAGRAM_DEFINITION",

									analysisDefinition.guid,

									diagramDefinition.guid,

									diagramImportance,

									{
										required:
											addin.utils.equalsIgnoreCase(
												diagramImportance,
												"Obligatoire"
											),

										recommended:
											addin.utils.equalsIgnoreCase(
												diagramImportance,
												"Recommandé"
											)
									},

									{
										count:
											existingDiagrams.length,

										found: true
									},

									true
								);

							if (existingDiagramPresenceRuleResult)
							{
								result.ruleResults.push(
									existingDiagramPresenceRuleResult
								);
							}
							
						}


						// =====================================================
						// CONTROLE DE CHAQUE DIAGRAMME EXISTANT
						// =====================================================

						for (
							var existingDiagramIndex = 0;
							existingDiagramIndex < existingDiagrams.length;
							existingDiagramIndex++
						)
						{
							existingDiagram =
								existingDiagrams[
									existingDiagramIndex
								];

							diagramCheckResult =
								this._createDiagramCheckResult(
									diagramDefinition,
									null,
									effectiveConfig
								);


							var existingDiagramObjectResult =
								this._registerCheckObject(
									result,
									existingDiagram.DiagramGUID,
									"DIAGRAM",
									existingDiagram.Name,
									analysisPackage.PackageGUID
								);

							


							addin.logger.info(
								"TEST CHECK DIAGRAM BRANCH"
								+ " | Branch=EXISTING"
								+ " | Diagram="
								+ existingDiagram.Name
							);

							recognizedDiagramGuids[
								addin.utils.normalizeGuid(
									existingDiagram.DiagramGUID
								)
							] = true;

							diagramCheckResult.diagram.guid =
								existingDiagram.DiagramGUID;

							diagramCheckResult.diagram.name =
								existingDiagram.Name;

							diagramCheckResult.diagram.metaType =
								existingDiagram.MetaType;

							diagramCheckResult.found = true;

							diagramCheckResult.status =
								addin.fbaConstants
									.CHECK_STATUS_COMPLIANT;

							diagramCheckResult
								.metrics.diagrams.found = 1;


							// ========================================================
							// CHECK - DIAGRAM NAMING
							// ========================================================
							
							result.metrics.diagrams.found++;
							
							var diagramNamingIssues =
								this._checkDiagramName(
									existingDiagram,
									effectiveConfig
								);


							if (
								diagramNamingIssues &&
								diagramNamingIssues.length > 0
							)
							{
								result.metrics.diagrams
									.namingInvalid++;
								
								diagramCheckResult
									.metrics.diagrams
									.namingInvalid++;

								for (
									var diagramNamingIssueIndex = 0;
									diagramNamingIssueIndex <
										diagramNamingIssues.length;
									diagramNamingIssueIndex++
								)
								{
									var diagramNamingIssue =
										diagramNamingIssues[
											diagramNamingIssueIndex
										];


									diagramNamingIssue.objectType =
										"DIAGRAM";

									diagramNamingIssue.objectGuid =
										existingDiagram
											.DiagramGUID;

									diagramNamingIssue.objectName =
										existingDiagram.Name;

									diagramNamingIssue.analysisElementGuid =
										analysisDefinition.guid;

									diagramNamingIssue.diagramDefinitionGuid =
										diagramDefinition.guid;

									diagramCheckResult.issues.push(
										diagramNamingIssue
									);


									addin.logger.warning(
										"Nommage de diagramme non conforme"
										+ " | Package="
										+ analysisPackage.Name
										+ " | Diagram="
										+ existingDiagram.Name
										+ " | ExpectedPrefix="
										+ diagramNamingIssue
											.expectedPrefix
										+ " | Reason="
										+ diagramNamingIssue.reason
										+ " | Action="
										+ diagramNamingIssue.action
									);
								}
							}
							else
							{
								diagramCheckResult
									.metrics.diagrams
									.namingValid++;

								result.metrics.diagrams
									.namingValid++;

							}


							// ========================================================
							// CHECK - TECHNICAL DIAGRAM IN MODEL PACKAGE
							// ========================================================

							var diagramTechnicalIssues =
								this._checkDiagramTechnicalName(
									existingDiagram,
									analysisPackage
								);


							if (
								diagramTechnicalIssues &&
								diagramTechnicalIssues.length > 0
							)
							{
								for (
									var diagramTechnicalIssueIndex = 0;
									diagramTechnicalIssueIndex <
										diagramTechnicalIssues.length;
									diagramTechnicalIssueIndex++
								)
								{
									var diagramTechnicalIssue =
										diagramTechnicalIssues[
											diagramTechnicalIssueIndex
										];


									diagramTechnicalIssue.objectType =
										"DIAGRAM";

									diagramTechnicalIssue.analysisElementGuid =
										analysisDefinition.guid;

									diagramTechnicalIssue.diagramDefinitionGuid =
										diagramDefinition.guid;


									diagramCheckResult.issues.push(
										diagramTechnicalIssue
									);

									addin.logger.warning(
										"Diagramme technique dans un package modèle"
										+ " | Package="
										+ analysisPackage.Name
										+ " | Diagram="
										+ existingDiagram.Name
										+ " | Issue="
										+ diagramTechnicalIssue.code
										+ " | Action="
										+ diagramTechnicalIssue.action
									);
								}
							}


							// =========================================
							// CHECK NOTE ET ARTEFACTS DU DIAGRAMME
							// =========================================

							this._checkDiagramNote(
								existingDiagram,
								diagramDefinition,
								effectiveConfig,
								diagramCheckResult,
								result
							);


							this._checkDiagramArtifacts(
								existingDiagram,
								diagramDefinition,
								diagramCheckResult,
								artifactDefinitions,
								result
							);


							// =========================================
							// PROPAGATION DES ISSUES DU DIAGRAMME
							// =========================================

							if (
								diagramCheckResult.issues &&
								diagramCheckResult.issues.length > 0
							)
							{
								for (
									var issueIndex = 0;
									issueIndex <
										diagramCheckResult
											.issues.length;
									issueIndex++
								)
								{
									var diagramIssue =
										diagramCheckResult
											.issues[
												issueIndex
											];


									this._registerCheckIssue(
										result,
										diagramIssue
									);
								}
							}
							
							// =========================================
							// DETERMINATION DE LA CONFORMITE
							// =========================================

							diagramCheckResult.status =
								this._getCheckStatus(
									diagramCheckResult.issues
								);
							// =========================================
							// METRIQUES DE CONFORMITE DU DIAGRAMME
							// =========================================

							if (
								diagramCheckResult.status ==
								addin.fbaConstants
									.CHECK_STATUS_NON_COMPLIANT
							)
							{
								diagramCheckResult
									.metrics.diagrams
									.compliant = 0;

								diagramCheckResult
									.metrics.diagrams
									.nonCompliant = 1;

								result.metrics.diagrams
									.nonCompliant++;

							}
							else
							{
								diagramCheckResult
									.metrics.diagrams
									.nonCompliant = 0;
								
								diagramCheckResult
									.metrics.diagrams
									.compliant = 1;

								result.metrics.diagrams
									.compliant++;

							}

							addin.logger.debug(
								"Diagramme obligatoire couvert"
								+ " | Package="
								+ analysisPackage.Name
								+ " | Diagram="
								+ existingDiagram.Name
								+ " | MetaType="
								+ existingDiagram.MetaType
								+ " | Artifacts="
								+ diagramCheckResult
									.artifacts.length
							);



						}

						// Tous les diagrammes correspondants ont été contrôlés.
						// On passe à la définition de diagramme suivante.
						continue;
					}


					// Un diagramme enregistré couvre déjà cette définition.
					// Les diagrammes analyste compatibles ont aussi été contrôlés.
					if (generatedDiagrams && generatedDiagrams.length > 0)
					{
						continue;
					}


					// ---------------------------------------------
					// Diagramme obligatoire absent
					// ---------------------------------------------
					
					// ---------------------------------------------
					// Diagramme absent - selon importance
					// ---------------------------------------------

					// Optionnel absent : autorisé, aucune anomalie
					if (
						addin.utils.equalsIgnoreCase(
							diagramImportance,
							"Optionnel"
						)
					)
					{
						continue;
					}
					
					// Obligatoire / Recommandé absent
					var diagramMissingSeverity =
						addin.utils.equalsIgnoreCase(
							diagramImportance,
							"Recommandé"
						)
							? addin.fbaConstants.CHECK_SEVERITY_WARNING
							: addin.fbaConstants.CHECK_SEVERITY_ERROR;

					var diagramMissingAction =
						addin.utils.equalsIgnoreCase(
							diagramImportance,
							"Recommandé"
						)
							? addin.fbaConstants.CHECK_ACTION_MANUAL_REVIEW
							: addin.fbaConstants.CHECK_ACTION_COMPLETE;

					// =====================================================
					// 48B.3 - RULE RESULT
					// DIAGRAM PRESENCE - ABSENT
					// =====================================================

					if (result.ruleResults)
					{
						var missingDiagramPresenceRuleResult =
							this._createCheckRuleResult(
								"DIAGRAM_PRESENCE",

								"LOCAL",
								"ANALYSIS_PACKAGE",
								analysisPackage.PackageGUID,

								"DIAGRAM_DEFINITION",

								analysisDefinition.guid,

								diagramDefinition.guid,

								diagramImportance,
								{
									required:
										addin.utils.equalsIgnoreCase(
											diagramImportance,
											"Obligatoire"
										),

									recommended:
										addin.utils.equalsIgnoreCase(
											diagramImportance,
											"Recommandé"
										)
								},

								{
									count: 0,
									found: false
								},

								false
							);


						if (
							missingDiagramPresenceRuleResult
						)
						{
							result.ruleResults.push(
								missingDiagramPresenceRuleResult
							);
						}
					}


					result.metrics.diagrams.missing++;

					var missingDiagramIssue =
					{
						code:
							"MANDATORY_DIAGRAM_MISSING",

						severity:
							diagramMissingSeverity,

						action:
							diagramMissingAction,

						objectType:
							"PACKAGE",

						objectGuid:
							analysisPackage.PackageGUID,

						objectName:
							analysisPackage.Name,

						analysisElementGuid:
							analysisDefinition.guid,

						diagramDefinitionGuid:
							diagramDefinition.guid,

						diagramMetaType:
							diagramDefinition.metaType,

						importance:
							diagramImportance,

						message:
							"Un diagramme "
							+ diagramImportance.toLowerCase()
							+ " est absent du package."
					};


					this._registerCheckIssue(
						result,
						missingDiagramIssue
					);


					diagramCheckResult.issues.push(
						missingDiagramIssue
					);


					diagramCheckResult
						.metrics.diagrams.missing = 1;

					if (
						diagramMissingSeverity ==
						addin.fbaConstants.CHECK_SEVERITY_ERROR
					)
					{
						diagramCheckResult
							.metrics.diagrams.nonCompliant = 1;
					}

					addin.logger.warning(
						"Diagramme manquant"
						+ " | Package="
						+ analysisPackage.Name
						+ " | DefinitionGUID="
						+ diagramDefinition.guid
						+ " | MetaType="
						+ diagramDefinition.metaType
						+ " | Importance="
						+ diagramImportance
						+ " | Severity="
						+ diagramMissingSeverity
						+ " | Action="
						+ diagramMissingAction
					);
				}
				addin.logger.info(
					"TEST CHECK DIAGRAM RECOGNIZED"
					+ " | Package="
					+ analysisPackage.Name
					+ " | Count="
					+ Object.keys(
						recognizedDiagramGuids
					).length
				);
				
				// =====================================================
				// DIAGRAMMES NON RECONNUS PAR LE METAMODELE
				// =====================================================

				analysisPackage.Diagrams.Refresh();

				for (
					var foreignDiagramIndex = 0;
					foreignDiagramIndex <
						analysisPackage.Diagrams.Count;
					foreignDiagramIndex++
				)
				{
					var foreignDiagram =
						analysisPackage.Diagrams.GetAt(
							foreignDiagramIndex
						);

					if (!foreignDiagram)
						continue;


					var foreignDiagramGuid =
						addin.utils.normalizeGuid(
							foreignDiagram.DiagramGUID
						);


					if (
						recognizedDiagramGuids[
							foreignDiagramGuid
						]
					)
					{
						continue;
					}

					result.metrics.diagrams.foreign++;
					
					this._registerCheckObject(
						result,
						foreignDiagram.DiagramGUID,
						"DIAGRAM",
						foreignDiagram.Name,
						analysisPackage.PackageGUID
					);
					
					this._registerCheckIssue(
						result,
						{
							code: "DIAGRAM_NOT_IN_METAMODEL",
							severity:
								addin.fbaConstants
									.CHECK_SEVERITY_ERROR,
							action:
								addin.fbaConstants
									.CHECK_ACTION_MANUAL_REVIEW,
							objectType: "DIAGRAM",
							objectGuid:
								foreignDiagram.DiagramGUID,
							objectName:
								foreignDiagram.Name,
							analysisElementGuid:
								analysisDefinition.guid,
							message:
								"Le diagramme présent dans le package ne correspond "
								+ "à aucune définition de diagramme du métamodèle."
						}
					);
					
					addin.logger.warning(
						"TEST CHECK FOREIGN DIAGRAM"
						+ " | Package="
						+ analysisPackage.Name
						+ " | Diagram="
						+ foreignDiagram.Name
						+ " | MetaType="
						+ foreignDiagram.MetaType
						+ " | GUID="
						+ foreignDiagram.DiagramGUID
					);
				}
			}
		}


		// =====================================================
		// METRIQUES LOCALES - DOUBLONS D'ARTEFACTS RECONNUS
		// =====================================================

		if (
			result.metrics &&
			result.metrics.artifacts &&
			typeof recognizedArtifactGuids !== "undefined"
		)
		{
			var localArtifactUniquenessCandidates = [];

			analysisPackage.Elements.Refresh();

			for (
				var localDuplicateArtifactIndex = 0;
				localDuplicateArtifactIndex < analysisPackage.Elements.Count;
				localDuplicateArtifactIndex++
			)
			{
				var localDuplicateArtifact =
					analysisPackage.Elements.GetAt(
						localDuplicateArtifactIndex
					);

				if (!localDuplicateArtifact)
					continue;

				var localDuplicateArtifactGuid =
					addin.utils.normalizeGuid(
						localDuplicateArtifact.ElementGUID
					);

				if (
					!recognizedArtifactGuids[
						localDuplicateArtifactGuid
					]
				)
				{
					continue;
				}

				var localArtifactDuplicateCandidate =
					this._createUniquenessCandidate(
						localDuplicateArtifact.ElementGUID,
						"ARTIFACT",
						localDuplicateArtifact.Name,
						analysisPackage.PackageGUID,
						analysisPackage.PackageGUID,
						""
					);

				if (localArtifactDuplicateCandidate)
				{
					localArtifactUniquenessCandidates.push(
						localArtifactDuplicateCandidate
					);
				}
			}

			var localArtifactDuplicates =
				this._findDuplicateArtifacts(
					localArtifactUniquenessCandidates
				);

			if (
				localArtifactDuplicates &&
				localArtifactDuplicates.local
			)
			{
				result.metrics.artifacts.duplicateGroups =
					localArtifactDuplicates.local.length;

				var localArtifactDuplicateExcess = 0;

				for (
					var localArtifactDuplicateGroupIndex = 0;
					localArtifactDuplicateGroupIndex < localArtifactDuplicates.local.length;
					localArtifactDuplicateGroupIndex++
				)
				{
					var localArtifactDuplicateGroup =
						localArtifactDuplicates.local[
							localArtifactDuplicateGroupIndex
						];

					if (!localArtifactDuplicateGroup)
						continue;

					localArtifactDuplicateExcess +=
						localArtifactDuplicateGroup.excess || 0;
				}

				result.metrics.artifacts.duplicateExcess =
					localArtifactDuplicateExcess;
			}
		}


		// =====================================================
		// METRIQUES LOCALES - DOUBLONS DE DIAGRAMMES RECONNUS
		// =====================================================

		if (
			result.metrics &&
			result.metrics.diagrams &&
			typeof recognizedDiagramGuids !== "undefined"
		)
		{
			var localDiagramUniquenessCandidates = [];

			analysisPackage.Diagrams.Refresh();

			for (
				var localDuplicateDiagramIndex = 0;
				localDuplicateDiagramIndex < analysisPackage.Diagrams.Count;
				localDuplicateDiagramIndex++
			)
			{
				var localDuplicateDiagram =
					analysisPackage.Diagrams.GetAt(
						localDuplicateDiagramIndex
					);

				if (!localDuplicateDiagram)
					continue;

				var localDuplicateDiagramGuid =
					addin.utils.normalizeGuid(
						localDuplicateDiagram.DiagramGUID
					);

				if (
					!recognizedDiagramGuids[
						localDuplicateDiagramGuid
					]
				)
				{
					continue;
				}

				var localDuplicateCandidate =
					this._createUniquenessCandidate(
						localDuplicateDiagram.DiagramGUID,
						"DIAGRAM",
						localDuplicateDiagram.Name,
						analysisPackage.PackageGUID,
						analysisPackage.PackageGUID,
						""
					);

				if (localDuplicateCandidate)
				{
					localDiagramUniquenessCandidates.push(
						localDuplicateCandidate
					);
				}
			}

			var localDiagramDuplicates =
				this._findDuplicateDiagrams(
					localDiagramUniquenessCandidates
				);

			if (
				localDiagramDuplicates &&
				localDiagramDuplicates.local
			)
			{
				result.metrics.diagrams.duplicateGroups =
					localDiagramDuplicates.local.length;

				var localDiagramDuplicateExcess = 0;

				for (
					var localDuplicateGroupIndex = 0;
					localDuplicateGroupIndex < localDiagramDuplicates.local.length;
					localDuplicateGroupIndex++
				)
				{
					var localDiagramDuplicateGroup =
						localDiagramDuplicates.local[
							localDuplicateGroupIndex
						];

					if (!localDiagramDuplicateGroup)
						continue;

					localDiagramDuplicateExcess +=
						localDiagramDuplicateGroup.excess || 0;
				}

				result.metrics.diagrams.duplicateExcess =
					localDiagramDuplicateExcess;
			}
		}


		// =====================================================
		// PERSISTANCE DISTRIBUEE - ARTEFACTS
		//
		// Première étape de la migration : le résultat global
		// reste inchangé, mais chaque artefact contrôlé reçoit
		// également son propre snapshot CHECK.
		// =====================================================

		for (var checkedObjectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(checkedObjectGuid))
				continue;

			var checkedObject =
				result.objects[checkedObjectGuid];

			if (
				!checkedObject ||
				checkedObject.objectType != "ARTIFACT"
			)
			{
				continue;
			}

			var checkedArtifact =
				addin.repositoryService.getElementByGuid(
					checkedObject.guid
				);

			if (!checkedArtifact)
			{
				result.success = false;

				addin.logger.error(
					"Persistance CHECK artefact impossible"
					+ " | GUID=" + checkedObject.guid
				);

				continue;
			}

			// Le CHECK de ce package ne remplace pas le résultat local
			// d'un artefact appartenant à un autre package.
			if (checkedArtifact.PackageID != analysisPackage.PackageID)
			{
				addin.logger.info(
					"Snapshot artefact externe préservé"
					+ " | Artifact=" + checkedArtifact.Name
					+ " | GUID=" + checkedArtifact.ElementGUID
				);
				continue;
			}

			if (
				!this.persistCheckResult(
					checkedArtifact,
					result
				)
			)
			{
				result.success = false;

				addin.logger.error(
					"Persistance CHECK artefact échouée"
					+ " | Artifact=" + checkedArtifact.Name
					+ " | GUID=" + checkedArtifact.ElementGUID
				);
			}
		}


		// =====================================================
		// RESOLUTION DGC D'INSTANCE - DIAGRAMMES RECONNUS
		// ETNIC_Generated_Diagram_GUID = DiagramGUID.
		// =====================================================

		var checkDiagramRegistryPackage =
			this._resolveDiagramRegistryPackage(
				rootPackage
			);

		for (var storageDiagramGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(storageDiagramGuid))
				continue;

			var storageDiagramObject =
				result.objects[storageDiagramGuid];

			if (
				!storageDiagramObject ||
				storageDiagramObject.objectType != "DIAGRAM" ||
				!recognizedDiagramGuids[addin.utils.normalizeGuid(storageDiagramObject.guid)]
			)
			{
				continue;
			}

			var storageDiagram =
				addin.repositoryService.getDiagramByGuid(
					storageDiagramObject.guid
				);

			if (!storageDiagram)
				continue;

			var diagramRegistryEntry =
				this._findDiagramRegistryEntryByGeneratedGuid(
					checkDiagramRegistryPackage,
					storageDiagram.DiagramGUID
				);

			if (diagramRegistryEntry)
			{
				storageDiagramObject.checkStorageGuid =
					diagramRegistryEntry.ElementGUID;

				addin.logger.info(
					"DGC d'instance résolu"
					+ " | Diagram=" + storageDiagram.Name
					+ " | DiagramGUID=" + storageDiagram.DiagramGUID
					+ " | DGC=" + diagramRegistryEntry.Name
					+ " | DGCGUID=" + diagramRegistryEntry.ElementGUID
				);

				continue;
			}

			var diagramRegistryMissingIssue =
			{
				code:
					addin.fbaConstants
						.CHECK_ISSUE_DIAGRAM_REGISTRY_MISSING,

				severity:
					addin.fbaConstants
						.CHECK_SEVERITY_ERROR,

				action:
					addin.fbaConstants
						.CHECK_ACTION_REPAIR,

				objectType:
					"DIAGRAM",

				objectGuid:
					storageDiagram.DiagramGUID,

				objectName:
					storageDiagram.Name,

				packageGuid:
					analysisPackage.PackageGUID,

				message:
					"Le diagramme reconnu par le métamodèle "
					+ "ne possède pas de DGC d'instance associé "
					+ "par ETNIC_Generated_Diagram_GUID."
			};

			this._registerCheckIssue(
				result,
				diagramRegistryMissingIssue
			);

			addin.logger.warning(
				"DGC d'instance manquant"
				+ " | Diagram=" + storageDiagram.Name
				+ " | DiagramGUID=" + storageDiagram.DiagramGUID
				+ " | Action=REPAIR"
			);
		}


		// =====================================================
		// PERSISTANCE DISTRIBUEE - DIAGRAMMES RECONNUS
		// Le DGC d'instance porte le snapshot du diagramme.
		// =====================================================

		for (var checkedDiagramGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(checkedDiagramGuid))
				continue;

			var checkedDiagramObject =
				result.objects[checkedDiagramGuid];

			if (
				!checkedDiagramObject ||
				checkedDiagramObject.objectType != "DIAGRAM" ||
				addin.utils.isEmpty(checkedDiagramObject.checkStorageGuid)
			)
			{
				continue;
			}

			var checkedDiagram =
				addin.repositoryService.getDiagramByGuid(
					checkedDiagramObject.guid
				);

			if (!checkedDiagram)
			{
				result.success = false;
				addin.logger.error(
					"Persistance CHECK diagramme impossible"
					+ " | GUID=" + checkedDiagramObject.guid
				);
				continue;
			}

			if (!this.persistCheckResult(checkedDiagram, result))
			{
				result.success = false;
				addin.logger.error(
					"Persistance CHECK diagramme échouée"
					+ " | Diagram=" + checkedDiagram.Name
					+ " | GUID=" + checkedDiagram.DiagramGUID
				);
			}
		}


		// =====================================================
		// STATUT DE CONFORMITE DU PACKAGE
		// =====================================================

		var packageStatus =
			this._getCheckStatus(
				packageResult
					? packageResult.issues
					: []
			);

		if (
			packageStatus ==
			addin.fbaConstants
				.CHECK_STATUS_NON_COMPLIANT
		)
		{
			result.metrics.packages
				.nonCompliant++;
		}
		else
		{
			result.metrics.packages
				.compliant++;
		}


		// =====================================================
		// PERSISTANCE DISTRIBUEE - PACKAGE
		// =====================================================

		if (!this.persistCheckResult(analysisPackage, result))
		{
			result.success = false;

			addin.logger.error(
				"Persistance CHECK package échouée"
				+ " | Package=" + analysisPackage.Name
				+ " | GUID=" + analysisPackage.PackageGUID
			);
		}


		// =========================================================
		// 6. FIN
		// =========================================================

		addin.logger.info(
			"CHECK package terminé"
			+ " | Package=" + analysisPackage.Name
			+ " | Issues=" + result.issues.length
			+ " | Errors=" + result.summary.errors
			+ " | Warnings=" + result.summary.warnings
			+ " | INIT=" + result.summary.init
			+ " | COMPLETE=" + result.summary.complete
			+ " | REPAIR=" + result.summary.repair
			+ " | MANUAL_COMPLETE="
			+ result.summary.manualComplete
			+ " | MANUAL_REMOVE="
			+ result.summary.manualRemove
			+ " | MANUAL_MOVE="
			+ result.summary.manualMove
			+ " | MAKE_TECHNICAL="
			+ result.summary.makeTechnical
			+ " | MAKE_BUSINESS="
			+ result.summary.makeBusiness
			+ " | MANUAL_REVIEW="
			+ result.summary.manualReview
		);
		
		addin.logger.info(
			"TEST CHECK METRICS"
			+ " | Package=" + analysisPackage.Name

			+ " | Diagrams.Expected="
			+ result.metrics.diagrams.expected

			+ " | Diagrams.Found="
			+ result.metrics.diagrams.found

			+ " | Diagrams.Compliant="
			+ result.metrics.diagrams.compliant

			+ " | Diagrams.NonCompliant="
			+ result.metrics.diagrams.nonCompliant

			+ " | Diagrams.Missing="
			+ result.metrics.diagrams.missing

			+ " | Diagrams.Foreign="
			+ result.metrics.diagrams.foreign

			+ " | Diagrams.WithNote="
			+ result.metrics.diagrams.withNote

			+ " | Diagrams.WithoutNote="
			+ result.metrics.diagrams.withoutNote

			+ " | Diagrams.NamingValid="
			+ result.metrics.diagrams.namingValid

			+ " | Diagrams.NamingInvalid="
			+ result.metrics.diagrams.namingInvalid

			+ " | Diagrams.DuplicateGroups="
			+ result.metrics.diagrams.duplicateGroups

			+ " | Diagrams.DuplicateExcess="
			+ result.metrics.diagrams.duplicateExcess
			
			+ " | Artifacts.Expected="
			+ result.metrics.artifacts.expected

			+ " | Artifacts.Found="
			+ result.metrics.artifacts.found

			+ " | Artifacts.Compliant="
			+ result.metrics.artifacts.compliant

			+ " | Artifacts.NonCompliant="
			+ result.metrics.artifacts.nonCompliant

			+ " | Artifacts.Missing="
			+ result.metrics.artifacts.missing

			+ " | Artifacts.Foreign="
			+ result.metrics.artifacts.foreign

			+ " | Artifacts.WithNote="
			+ result.metrics.artifacts.withNote

			+ " | Artifacts.WithoutNote="
			+ result.metrics.artifacts.withoutNote

			+ " | Artifacts.NamingValid="
			+ result.metrics.artifacts.namingValid

			+ " | Artifacts.NamingInvalid="
			+ result.metrics.artifacts.namingInvalid

			+ " | Artifacts.DuplicateGroups="
			+ result.metrics.artifacts.duplicateGroups

			+ " | Artifacts.DuplicateExcess="
			+ result.metrics.artifacts.duplicateExcess
			
		);


		return result;
	},

		
	checkAnalysis: function(rootPackage)
	{
		var result = {
			success: true,
			scope: "ROOT",
			
			checkedAt:
				addin.utils.formatFrenchDateTime(
					new Date()
				),

			rootGuid:
				rootPackage
					? rootPackage.PackageGUID
					: "",

			rootName:
				rootPackage
					? rootPackage.Name
					: "",

			issues: [],
			
			objects: {},
			
			ruleResults: [],

			summary: {
				errors: 0,
				warnings: 0,

				init: 0,
				complete: 0,
				repair: 0,

				manualComplete: 0,
				manualRemove: 0,
				manualMove: 0,
				makeTechnical: 0,
				makeBusiness: 0,
				manualReview: 0,
				
				packagesChecked: 0,
				packagesSkipped: 0
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


		// =========================================================
		// 0. CONTEXTE
		// =========================================================

		if (!rootPackage)
		{
			result.success = false;

			addin.logger.error(
				"CHECK structure d'analyse impossible"
				+ " | Root=NULL"
			);

			return result;
		}


		addin.logger.info(
			"CHECK structure d'analyse"
			+ " | Root=" + rootPackage.Name
		);


		// =========================================================
		// 1. PACKAGES
		// =========================================================

		var packages =
			rootPackage.Packages;


		// Index :
		// AnalysisElementGUID -> packages associés
		var packagesByAnalysisElement = {};


		for (
			var i = 0;
			i < packages.Count;
			i++
		)
		{
			var currentPackage =
				packages.GetAt(i);


			// -----------------------------------------------------
			// Package invalide
			// -----------------------------------------------------

			if (!currentPackage ||
				!currentPackage.Element)
			{
				result.summary.packagesSkipped++;
				continue;
			}


			// -----------------------------------------------------
			// Package technique
			// -----------------------------------------------------

			if (addin.utils.isTechnicalName(
					currentPackage.Name
				))
			{
				result.summary.packagesSkipped++;

				addin.logger.debug(
					"Package technique ignoré"
					+ " | Package=" + currentPackage.Name
				);

				continue;
			}


			// =====================================================
			// 1.1 INDEXATION DES ASSOCIATIONS
			// =====================================================

			var initializationState =
				this._getAnalysisPackageInitializationState(
					currentPackage
				);


			if (initializationState == "INITIALIZED")
			{
				var sourceAnalysisGuid =
					addin.repositoryService.getTaggedValue(
						currentPackage.Element,
						addin.fbaConstants
							.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
					);


				if (sourceAnalysisGuid)
				{
					var normalizedAnalysisGuid =
						addin.utils.normalizeGuid(
							sourceAnalysisGuid
						);


					if (!packagesByAnalysisElement[
							normalizedAnalysisGuid
						])
					{
						packagesByAnalysisElement[
							normalizedAnalysisGuid
						] = [];
					}


					packagesByAnalysisElement[
						normalizedAnalysisGuid
					].push(
						currentPackage
					);
				}
			}


			// =====================================================
			// 1.2 CHECK DU PACKAGE
			// =====================================================

			var packageResult =
				this.checkAnalysisPackage(
					rootPackage,
					currentPackage
				);


			result.summary.packagesChecked++;


			// -----------------------------------------------------
			// Aucun résultat
			// -----------------------------------------------------

			if (!packageResult)
			{
				result.success = false;

				addin.logger.error(
					"CHECK package sans résultat"
					+ " | Package=" + currentPackage.Name
				);

				continue;
			}


			// -----------------------------------------------------
			// Echec technique du CHECK package
			// -----------------------------------------------------

			if (!packageResult.success)
			{
				result.success = false;

				addin.logger.error(
					"Échec technique du CHECK package"
					+ " | Package=" + currentPackage.Name
				);
			}


			// =====================================================
			// 1.3 AGREGATION DES ISSUES
			// =====================================================

			if (packageResult.issues)
			{
				for (
					var j = 0;
					j < packageResult.issues.length;
					j++
				)
				{
					result.issues.push(
						packageResult.issues[j]
					);
				}
			}
			
			// =====================================================
			// 1.3.1 AGREGATION DES RULE RESULTS
			// =====================================================

			if (packageResult.ruleResults)
			{
				for (
					var r = 0;
					r < packageResult.ruleResults.length;
					r++
				)
				{
					result.ruleResults.push(
						packageResult.ruleResults[r]
					);
				}
			}

			// =====================================================
			// 1.4 AGREGATION DES OBJECTS
			// =====================================================

			if (packageResult.objects)
			{
				for (var objectGuid in packageResult.objects)
				{
					if (!packageResult.objects.hasOwnProperty(objectGuid))
						continue;

					var normalizedObjectGuid =
						addin.utils.normalizeGuid(
							objectGuid
						);

					if (!normalizedObjectGuid)
						continue;

					result.objects[normalizedObjectGuid] =
						packageResult.objects[objectGuid];
				}
			}
			
			// =====================================================
			// 1.5 AGREGATION DU SUMMARY
			// =====================================================
			
			if (packageResult.summary)
			{
				result.summary.errors +=
					packageResult.summary.errors;

				result.summary.warnings +=
					packageResult.summary.warnings;

				result.summary.init +=
					packageResult.summary.init;

				result.summary.complete +=
					packageResult.summary.complete;

				result.summary.repair +=
					packageResult.summary.repair;

				result.summary.manualComplete +=
					packageResult.summary.manualComplete;

				result.summary.manualRemove +=
					packageResult.summary.manualRemove;

				result.summary.manualMove +=
					packageResult.summary.manualMove;

				result.summary.makeTechnical +=
					packageResult.summary.makeTechnical;
					
				result.summary.makeBusiness += 
					packageResult.summary.makeBusiness;

				result.summary.manualReview +=
					packageResult.summary.manualReview;
			}
		}


		// =========================================================
		// 2. UNICITE
		//
		// Un Analysis Element ne doit être associé qu'à un seul
		// package d'analyse dans le dossier.
		// =========================================================

		for (
			var analysisGuid
			in packagesByAnalysisElement
		)
		{
			var associatedPackages =
				packagesByAnalysisElement[
					analysisGuid
				];
			
			var associatedPackageGuids = [];

			if (associatedPackages)
			{
				for (
					var ap = 0;
					ap < associatedPackages.length;
					ap++
				)
				{
					associatedPackageGuids.push(
						addin.utils.normalizeGuid(
							associatedPackages[ap].PackageGUID
						)
					);
				}
			}
			
			var multiplicityRuleResult =
				this._createCheckRuleResult(
					"ANALYSIS_ELEMENT_PACKAGE_MULTIPLICITY",
					"GLOBAL",
					"ANALYSIS_ROOT",
					rootPackage.PackageGUID,
					"PACKAGE",
					analysisGuid,
					"",
					"",
					{
						min: 0,
						max: 1
					},
					{
						count: associatedPackages
							? associatedPackages.length
							: 0,
						packageGuids:
							associatedPackageGuids
					},
					associatedPackages &&
					associatedPackages.length <= 1
				);

			if (multiplicityRuleResult)
			{
				result.ruleResults.push(
					multiplicityRuleResult
				);
			}

			if (!associatedPackages ||
				associatedPackages.length <= 1)
			{
				continue;
			}


			// -----------------------------------------------------
			// Construction de la liste des packages
			// -----------------------------------------------------

			var packageNames = "";


			for (
				var p = 0;
				p < associatedPackages.length;
				p++
			)
			{
				if (p > 0)
				{
					packageNames += ", ";
				}

				packageNames +=
					associatedPackages[p].Name;
			}


			// -----------------------------------------------------
			// Issue
			// -----------------------------------------------------

			var duplicateAnalysisElementPackageIssue =
			{
				code:
					"DUPLICATE_ANALYSIS_ELEMENT_PACKAGE",

				severity:
					"ERROR",

				action:
					"REPAIR",

				objectType:
					"PACKAGE",

				objectGuid:
					"",

				objectName:
					"",

				analysisElementGuid:
					analysisGuid,

				packageCount:
					associatedPackages.length,

				packageNames:
					packageNames,

				packageGuids:
					associatedPackageGuids,

				message:
					"Plusieurs packages sont associés "
					+ "au même Analysis Element."
			};


			this._registerCheckIssueForObjects(
				result,
				duplicateAnalysisElementPackageIssue,
				associatedPackageGuids
			);

			addin.logger.warning(
				"Plusieurs packages associés "
				+ "au même Analysis Element"
				+ " | AnalysisElementGUID="
				+ analysisGuid
				+ " | Packages="
				+ packageNames
				+ " | Count="
				+ associatedPackages.length
				+ " | Action=REPAIR"
			);
		}
		
		// =========================================================
		// 2.1 UNICITE DES NOMS
		//
		// Contrôle global du Dossier d'analyse :
		//
		// - Package d'analyse :
		//     nom unique dans tout le dossier
		//
		// - Package technique :
		//     nom unique parmi les packages techniques
		//     ayant le même parent direct
		//
		// - Artefact :
		//     unicité locale dans l'Analysis Element
		//     + unicité globale entre Analysis Elements
		//
		// - Diagramme :
		//     unicité locale dans l'Analysis Element
		//     + unicité globale entre Analysis Elements
		//
		// Ce contrôle reste au niveau ROOT car certaines
		// règles nécessitent la vision complète du dossier.
		// =========================================================

		this._checkAnalysisUniqueness(
			rootPackage,
			result
		);

		// =========================================================
		// 3. FIN
		// =========================================================

		var objectCount = 0;
		var packageObjectCount = 0;
		var artifactObjectCount = 0;
		var diagramObjectCount = 0;

		for (var testObjectGuid in result.objects)
		{
			if (!result.objects.hasOwnProperty(testObjectGuid))
				continue;

			objectCount++;

			var testObject =
				result.objects[testObjectGuid];

			if (!testObject)
				continue;

			if (testObject.objectType == "PACKAGE")
				packageObjectCount++;

			else if (testObject.objectType == "ARTIFACT")
				artifactObjectCount++;

			else if (testObject.objectType == "DIAGRAM")
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

		// =========================================================
		// 4. PERSISTENCE DU SNAPSHOT CHECK
		// =========================================================

		var snapshotPersisted =
			this._persistCheckSnapshot(
				rootPackage,
				result
			);

		if (!snapshotPersisted)
		{
			result.success = false;

			addin.logger.error(
				"CHECK terminé mais snapshot non persisté"
					+ " | Root="
					+ rootPackage.Name
			);
		}

		return result;
	},
	
	repairAnalysisPackage: function(
		analysisRoot,
		analysisPackage,
		definitions,
		artifactIndex,
		analysisTagIndex,
		diagramRegistryIndex)
	{
		// ========================================================
		// 0. CONTEXTE
		// ========================================================

		if (
			!analysisRoot ||
			!analysisPackage ||
			!analysisPackage.Element
		)
		{
			addin.logger.error(
				"REPAIR package impossible"
				+ " | Contexte invalide"
			);

			return false;
		}


		addin.logger.info(
			"Réparation du package d'analyse"
			+ " | Package=" + analysisPackage.Name
		);


		// ========================================================
		// 1. ETAT D'INITIALISATION
		// ========================================================

		var initializationState =
			this._getAnalysisPackageInitializationState(
				analysisPackage
			);


		addin.logger.info(
			"Etat du package avant REPAIR"
			+ " | Package=" + analysisPackage.Name
			+ " | State=" + initializationState
		);


		// --------------------------------------------------------
		// DEJA INITIALISE
		// --------------------------------------------------------

		if (initializationState == "INITIALIZED")
		{
			if (!this._repairDiagramRegistryEntries(analysisRoot, analysisPackage, diagramRegistryIndex))
			{
				addin.logger.error("REPAIR DGC en échec | Package=" + analysisPackage.Name);
				return false;
			}
			return true;
		}


		// --------------------------------------------------------
		// NON ASSOCIE
		//
		// Ce cas relève de INITIALIZE et non de REPAIR.
		// --------------------------------------------------------

		if (initializationState == "NOT_ASSOCIATED")
		{
			addin.logger.warning(
				"REPAIR non applicable"
				+ " | Package=" + analysisPackage.Name
				+ " | State=NOT_ASSOCIATED"
				+ " | Action=INIT"
			);

			return false;
		}


		// --------------------------------------------------------
		// ETAT NON SUPPORTE
		// --------------------------------------------------------

		if (
			initializationState != "LEGACY" &&
			initializationState != "INCOMPLETE"
		)
		{
			addin.logger.error(
				"REPAIR impossible"
				+ " | Package=" + analysisPackage.Name
				+ " | State=" + initializationState
			);

			return false;
		}


		// ========================================================
		// 2. SOURCE ANALYSIS ELEMENT
		//
		// IMPORTANT :
		// le SourceGUID existant constitue l'identité du package.
		//
		// On ne recherche PAS la définition par le nom du package.
		// L'analyste peut avoir renommé le package.
		// ========================================================

		var sourceGuid =
			addin.utils.trim(
				addin.repositoryService.getTaggedValue(
					analysisPackage.Element,
					addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
				)
			);


		if (!sourceGuid)
		{
			addin.logger.error(
				"REPAIR impossible"
				+ " | Package=" + analysisPackage.Name
				+ " | SourceGUID absent"
			);

			return false;
		}


		// ========================================================
		// 3. DEFINITIONS DU METAMODELE
		// ========================================================

		if (!definitions)
		{
			definitions =
				this._getOperationDefinitions();
		}


		var definition =
			null;


		for (
			var i = 0;
			i < definitions.length;
			i++
		)
		{
			if (
				addin.utils.equalsIgnoreCase(
					definitions[i].guid,
					sourceGuid
				)
			)
			{
				definition =
					definitions[i];

				break;
			}
		}


		if (!definition)
		{
			addin.logger.error(
				"REPAIR impossible"
				+ " | Package=" + analysisPackage.Name
				+ " | SourceGUID=" + sourceGuid
				+ " | Définition introuvable"
			);

			return false;
		}


		addin.logger.info(
			"Définition d'analyse retrouvée"
			+ " | Package=" + analysisPackage.Name
			+ " | Definition=" + definition.name
			+ " | SourceGUID=" + definition.guid
		);


		// ========================================================
		// 4. RESTAURATION DES METADONNEES FRAMEWORK
		//
		// Le SourceGUID est également réécrit avec la valeur
		// canonique provenant du métamodèle.
		// ========================================================

		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID,
			definition.guid
		);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_FRAMEWORK_ROLE,
			definition.role
		);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_CATEGORY,
			definition.category
		);


		addin.repositoryService.setTaggedValue(
			analysisPackage.Element,
			addin.fbaConstants.TAG_IMPORTANT_LEVEL,
			definition.importantLevel
		);


		// ========================================================
		// 5. REPARATION LEGACY
		//
		// LEGACY :
		//     SourceGUID présent
		//     TAG_INITIALIZED absent
		//
		// Cela signifie uniquement que le package provient d'une
		// ancienne version du Framework BA.
		//
		// Cela ne signifie PAS que son contenu est incomplet.
		//
		// Donc :
		//     - migration des métadonnées
		//     - Initialized=true
		//     - aucune création de contenu
		// ========================================================

		if (initializationState == "LEGACY")
		{
			addin.repositoryService.setTaggedValue(
				analysisPackage.Element,
				addin.fbaConstants.TAG_INITIALIZED,
				"true"
			);


			addin.logger.info(
				"Package LEGACY migré"
				+ " | Package=" + analysisPackage.Name
				+ " | SourceGUID=" + definition.guid
				+ " | Initialized=true"
				+ " | ContentModified=false"
			);


			return true;
		}


		// ========================================================
		// 6. REPARATION INITIALISATION INCOMPLETE
		//
		// INCOMPLETE :
		//     SourceGUID présent
		//     TAG_INITIALIZED=false
		//
		// Une initialisation a commencé mais ne s'est pas terminée.
		//
		// IMPORTANT :
		//
		// _synchronizeAnalysisContent() ne doit PAS être rappelée.
		// Cette méthode construit systématiquement le contenu
		// initial et pourrait donc créer des doublons.
		//
		// Nous utilisons completeAnalysisPackage(), qui sait
		// rechercher l'existant et créer uniquement ce qui manque.
		// ========================================================

		if (initializationState == "INCOMPLETE")
		{
			addin.logger.info(
				"Reprise d'une initialisation incomplète"
				+ " | Package=" + analysisPackage.Name
				+ " | SourceGUID=" + definition.guid
			);


			// ----------------------------------------------------
			// Passage temporaire à INITIALIZED
			//
			// completeAnalysisPackage() travaille uniquement
			// sur un package INITIALIZED.
			// ----------------------------------------------------

			addin.repositoryService.setTaggedValue(
				analysisPackage.Element,
				addin.fbaConstants.TAG_INITIALIZED,
				"true"
			);


			// ----------------------------------------------------
			// COMPLETE
			// ----------------------------------------------------

			var completeResult =
				this.completeAnalysisPackage(
					analysisRoot,
					analysisPackage
				);


			// ----------------------------------------------------
			// ECHEC
			//
			// On restaure explicitement l'état INCOMPLETE afin
			// qu'un prochain CHECK repropose REPAIR.
			// ----------------------------------------------------

			if (!completeResult)
			{
				addin.repositoryService.setTaggedValue(
					analysisPackage.Element,
					addin.fbaConstants.TAG_INITIALIZED,
					"false"
				);


				addin.logger.error(
					"REPAIR en échec"
					+ " | Package=" + analysisPackage.Name
					+ " | SourceGUID=" + definition.guid
					+ " | Initialized=false"
				);


				return false;
			}

			var objectCount = 0;
			var packageObjectCount = 0;
			var artifactObjectCount = 0;
			var diagramObjectCount = 0;

			for (var testObjectGuid in result.objects)
			{
				if (!result.objects.hasOwnProperty(testObjectGuid))
					continue;

				objectCount++;

				var testObject =
					result.objects[testObjectGuid];

				if (!testObject)
					continue;

				if (testObject.objectType == "PACKAGE")
					packageObjectCount++;

				else if (testObject.objectType == "ARTIFACT")
					artifactObjectCount++;

				else if (testObject.objectType == "DIAGRAM")
					diagramObjectCount++;
			}

			addin.logger.info(
				"TEST CHECK ROOT OBJECT INDEX"
				+ " | Objects=" + objectCount
				+ " | Packages=" + packageObjectCount
				+ " | Artifacts=" + artifactObjectCount
				+ " | Diagrams=" + diagramObjectCount
			);

			// ----------------------------------------------------
			// SUCCES
			// ----------------------------------------------------

			addin.logger.info(
				"Package INCOMPLETE réparé"
				+ " | Package=" + analysisPackage.Name
				+ " | SourceGUID=" + definition.guid
				+ " | Initialized=true"
			);


			return true;
		}

		

		// ========================================================
		// 7. SECURITE
		// ========================================================

		addin.logger.error(
			"REPAIR impossible"
			+ " | Package=" + analysisPackage.Name
			+ " | State=" + initializationState
		);


		return false;
	},
		
	repairAnalysis: function(
		rootPackage)
	{
		if (!rootPackage)
		{
			addin.logger.error(
				"REPAIR dossier impossible"
				+ " | Root absent"
			);

			return false;
		}


		addin.logger.info(
			"REPAIR structure d'analyse"
			+ " | Root=" + rootPackage.Name
			+ " | GUID=" + rootPackage.PackageGUID
		);


		// ========================================================
		// 1. DONNEES PARTAGEES
		// ========================================================

		var definitions =
			this._getOperationDefinitions();


		var artifactIndex =
			this._getOperationArtifactDefinitionsIndex();


		var analysisTagIndex =
			this._getOperationAnalysisElementTagsIndex();


		// ========================================================
		// 2. RESULTATS
		// ========================================================

		var repaired = 0;
		var skipped = 0;
		var errors = 0;


		// ========================================================
		// 3. PARCOURS DES PACKAGES
		// ========================================================

		var packages =
			rootPackage.Packages;


		for (
			var i = 0;
			i < packages.Count;
			i++
		)
		{
			var currentPackage =
				packages.GetAt(i);


			if (!currentPackage)
			{
				skipped++;
				continue;
			}


			// ----------------------------------------------------
			// PACKAGE TECHNIQUE
			// ----------------------------------------------------

			if (
				addin.repositoryService.isTechnicalPackage(
					currentPackage
				)
			)
			{
				skipped++;

				addin.logger.debug(
					"Package technique ignoré"
					+ " | Package=" + currentPackage.Name
					+ " | Action=SKIP"
				);

				continue;
			}


			// ----------------------------------------------------
			// ETAT
			// ----------------------------------------------------

			var initializationState =
				this._getAnalysisPackageInitializationState(
					currentPackage
				);


			// ----------------------------------------------------
			// LEGACY / INCOMPLETE
			// ----------------------------------------------------

			if (
				initializationState == "LEGACY" ||
				initializationState == "INCOMPLETE"
			)
			{
				var repairResult =
					this.repairAnalysisPackage(
						rootPackage,
						currentPackage,
						definitions,
						artifactIndex,
						analysisTagIndex
					);


				if (repairResult)
				{
					repaired++;
				}
				else
				{
					errors++;
				}


				continue;
			}


			// ----------------------------------------------------
			// AUTRES ETATS
			// ----------------------------------------------------

			skipped++;


			addin.logger.debug(
				"Package non concerné par REPAIR"
				+ " | Package=" + currentPackage.Name
				+ " | State=" + initializationState
				+ " | Action=SKIP"
			);
		}


		// ========================================================
		// 4. RESULTAT
		// ========================================================

		addin.logger.info(
			"REPAIR dossier terminé"
			+ " | Root=" + rootPackage.Name
			+ " | Repaired=" + repaired
			+ " | Skipped=" + skipped
			+ " | Errors=" + errors
		);


		return errors == 0;
	},

};