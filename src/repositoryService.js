var addin = this;

return {

    // ========================================================
    // Repository - Elements / Packages
    // ========================================================

    getElementByGuid: function(guid)
    {
        if (addin.utils.isEmpty(guid))
            return null;

        try
        {
            return Repository.GetElementByGuid(guid);
        }
        catch (e)
        {
            return null;
        }
    },


    getPackageByGuid: function(guid)
    {
        if (addin.utils.isEmpty(guid))
            return null;

        try
        {
            return Repository.GetPackageByGuid(guid);
        }
        catch (e)
        {
            return null;
        }
    },


    getPackageById: function(packageID)
    {
        if (!packageID || packageID <= 0)
            return null;

        try
        {
            return Repository.GetPackageByID(packageID);
        }
        catch (e)
        {
            return null;
        }
    },


    getElementById: function(objectID)
    {
        if (!objectID || objectID <= 0)
            return null;

        try
        {
            return Repository.GetElementByID(objectID);
        }
        catch (e)
        {
            return null;
        }
    },


    getPackageByElementId: function(elementID)
    {
        if (!elementID || elementID <= 0)
            return null;

        try
        {
            var element =
                Repository.GetElementByID(
                    elementID
                );

            if (!element)
                return null;

            return Repository.GetPackageByGuid(
                element.ElementGUID
            );
        }
        catch (e)
        {
            return null;
        }
    },


    // ========================================================
    // Diagrams
    // ========================================================

    getDiagramById: function(diagramID)
    {
        if (!diagramID || diagramID <= 0)
            return null;

        try
        {
            return Repository.GetDiagramByID(
                diagramID
            );
        }
        catch (e)
        {
            return null;
        }
    },


    getDiagramByGuid: function(guid)
    {
        if (addin.utils.isEmpty(guid))
            return null;

        try
        {
            return Repository.GetDiagramByGuid(
                guid
            );
        }
        catch (e)
        {
            return null;
        }
    },


    // ========================================================
    // Tagged Values - Element
    // ========================================================

    setTaggedValue: function(
        element,
        tagName,
        value)
    {
        if (
            !element ||
            addin.utils.isEmpty(tagName)
        )
        {
            return false;
        }

        try
        {
            var taggedValues =
                element.TaggedValues;

            var taggedValue =
                null;

            // Recherche d'un tag existant
            for (
                var i = 0;
                i < taggedValues.Count;
                i++
            )
            {
                var tv =
                    taggedValues.GetAt(i);

                if (
                    addin.utils.equalsIgnoreCase(
                        tv.Name,
                        tagName
                    )
                )
                {
                    taggedValue = tv;
                    break;
                }
            }

            // Création si nécessaire
            if (!taggedValue)
            {
                taggedValue =
                    taggedValues.AddNew(
                        tagName,
                        ""
                    );

                if (!taggedValue)
                    return false;
            }

            taggedValue.Value =
                value == null
                    ? ""
                    : String(value);

            taggedValue.Update();

            taggedValues.Refresh();

            return true;
        }
        catch (e)
        {
            var errorMessage =
                e && e.description
                    ? e.description
                    : String(e);

            addin.logger.error(
                "Impossible de mettre à jour le Tagged Value"
                + " | Tag=" + tagName
                + " | Error=" + errorMessage
            );

            return false;
        }
    },


    setTaggedValueMemo: function(
        element,
        tagName,
        value)
    {
        if (
            !element ||
            addin.utils.isEmpty(tagName)
        )
        {
            return false;
        }

        try
        {
            var taggedValues =
                element.TaggedValues;

            var taggedValue =
                null;

            for (
                var i = 0;
                i < taggedValues.Count;
                i++
            )
            {
                var tv =
                    taggedValues.GetAt(i);

                if (
                    addin.utils.equalsIgnoreCase(
                        tv.Name,
                        tagName
                    )
                )
                {
                    taggedValue = tv;
                    break;
                }
            }

            if (!taggedValue)
            {
                taggedValue =
                    taggedValues.AddNew(
                        tagName,
                        "<memo>"
                    );

                if (!taggedValue)
                    return false;
            }

            taggedValue.Value =
                "<memo>";

            taggedValue.Notes =
                value == null
                    ? ""
                    : String(value);

            var updated =
                taggedValue.Update();

            taggedValues.Refresh();

            return updated;
        }
        catch (e)
        {
            var errorMessage =
                e && e.description
                    ? e.description
                    : String(e);

            addin.logger.error(
                "Impossible de mettre à jour le Tagged Value Memo"
                + " | Tag=" + tagName
                + " | Error=" + errorMessage
            );

            return false;
        }
    },


    applyTaggedValues: function(
        element,
        taggedValues,
        exclusions)
    {
        if (
            !element ||
            !taggedValues
        )
        {
            return false;
        }

        exclusions =
            exclusions || [];

        for (
            var tagName in taggedValues
        )
        {
            if (
                !taggedValues.hasOwnProperty(
                    tagName
                )
            )
            {
                continue;
            }

            var excluded =
                false;

            for (
                var i = 0;
                i < exclusions.length;
                i++
            )
            {
                if (
                    addin.utils.equalsIgnoreCase(
                        tagName,
                        exclusions[i]
                    )
                )
                {
                    excluded = true;
                    break;
                }
            }

            if (excluded)
                continue;

            this.setTaggedValue(
                element,
                tagName,
                taggedValues[tagName]
            );
        }

        return true;
    },


    getTaggedValue: function(element, tagName)
    {
        if (
            !element ||
            addin.utils.isEmpty(tagName)
        )
        {
            return "";
        }

        var taggedValues =
            element.TaggedValues;

        for (
            var i = 0;
            i < taggedValues.Count;
            i++
        )
        {
            var tv =
                taggedValues.GetAt(i);

            if (
                addin.utils.equalsIgnoreCase(
                    tv.Name,
                    tagName
                )
            )
            {
                return addin.utils.trim(
                    tv.Value
                );
            }
        }

        return "";
    },


    getTaggedValueMemo: function(element, tagName)
    {
        if (
            !element ||
            addin.utils.isEmpty(tagName)
        )
        {
            return "";
        }

        var taggedValues =
            element.TaggedValues;

        for (
            var i = 0;
            i < taggedValues.Count;
            i++
        )
        {
            var tv =
                taggedValues.GetAt(i);

            if (
                !addin.utils.equalsIgnoreCase(
                    tv.Name,
                    tagName
                )
            )
            {
                continue;
            }

            if (
                addin.utils.equalsIgnoreCase(
                    tv.Value,
                    "<memo>"
                )
            )
            {
                return String(
                    tv.Notes || ""
                );
            }

            return String(
                tv.Value || ""
            );
        }

        return "";
    },


    getTaggedValues: function(element)
    {
        var result = {};

        if (!element)
            return result;

        var taggedValues =
            element.TaggedValues;

        for (
            var i = 0;
            i < taggedValues.Count;
            i++
        )
        {
            var tv =
                taggedValues.GetAt(i);

            if (
                !tv ||
                addin.utils.isEmpty(tv.Name)
            )
            {
                continue;
            }

            var value =
                tv.Value;

            if (
                addin.utils.equalsIgnoreCase(
                    value,
                    "<memo>"
                )
            )
            {
                value = tv.Notes;
            }

            result[
                addin.utils.trim(tv.Name)
            ] =
                value == null
                    ? ""
                    : String(value);
        }

        return result;
    },


    // ========================================================
    // Tagged Values - Connector
    // ========================================================

    getConnectorTaggedValue: function(
        connector,
        tagName)
    {
        if (
            !connector ||
            addin.utils.isEmpty(tagName)
        )
        {
            return "";
        }

        var taggedValues =
            connector.TaggedValues;

        for (
            var i = 0;
            i < taggedValues.Count;
            i++
        )
        {
            var tv =
                taggedValues.GetAt(i);

            if (
                addin.utils.equalsIgnoreCase(
                    tv.Name,
                    tagName
                )
            )
            {
                return addin.utils.trim(
                    tv.Value
                );
            }
        }

        return "";
    },


    getConnectorTaggedValues: function(connector)
    {
        var result = {};

        if (!connector)
            return result;

        var taggedValues =
            connector.TaggedValues;

        for (
            var i = 0;
            i < taggedValues.Count;
            i++
        )
        {
            var tv =
                taggedValues.GetAt(i);

            if (
                !tv ||
                addin.utils.isEmpty(tv.Name)
            )
            {
                continue;
            }

            var value =
                tv.Value;

            if (
                addin.utils.equalsIgnoreCase(
                    value,
                    "<memo>"
                )
            )
            {
                value = tv.Notes;
            }

            result[
                addin.utils.trim(tv.Name)
            ] =
                value == null
                    ? ""
                    : String(value);
        }

        return result;
    },


    mergeTaggedValues: function(
        baseTags,
        overrideTags)
    {
        var result = {};
        var key;

        baseTags =
            baseTags || {};

        overrideTags =
            overrideTags || {};

        for (key in baseTags)
        {
            if (
                baseTags.hasOwnProperty(key)
            )
            {
                result[key] =
                    baseTags[key];
            }
        }

        for (key in overrideTags)
        {
            if (
                overrideTags.hasOwnProperty(key)
            )
            {
                result[key] =
                    overrideTags[key];
            }
        }

        return result;
    },


    // ========================================================
    // Packages
    // ========================================================

    isTechnicalPackage: function(pkg)
    {
        if (!pkg)
            return false;

        return addin.utils.startsWith(
            pkg.Name,
            addin.fbaConstants.TECHNICAL_PACKAGE_PREFIX
        );
    },


    findDirectChildPackageByName: function(
        parentPackage,
        packageName)
    {
        if (
            !parentPackage ||
            addin.utils.isEmpty(packageName)
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
            var pkg =
                packages.GetAt(i);

            if (
                this.isTechnicalPackage(pkg)
            )
            {
                continue;
            }

            if (
                addin.utils.equalsIgnoreCase(
                    pkg.Name,
                    packageName
                )
            )
            {
                return pkg;
            }
        }

        return null;
    },


    findDirectChildPackageByNameIncludingTechnical:
    function(parentPackage, packageName)
    {
        if (
            !parentPackage ||
            addin.utils.isEmpty(packageName)
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
            var pkg =
                packages.GetAt(i);

            if (
                addin.utils.equalsIgnoreCase(
                    pkg.Name,
                    packageName
                )
            )
            {
                return pkg;
            }
        }

        return null;
    },


    // ========================================================
    // File system
    // ========================================================

    directoryExists: function(path)
    {
        if (addin.utils.isEmpty(path))
            return false;

        try
        {
            var fso =
                new COMObject(
                    "Scripting.FileSystemObject"
                );

            return fso.FolderExists(path);
        }
        catch (e)
        {
            var errorMessage =
                e && e.description
                    ? e.description
                    : String(e);

            addin.logger.error(
                "Impossible de vérifier le dossier"
                + " | Path=" + path
                + " | Error=" + errorMessage
            );

            return false;
        }
    },


    ensureDirectory: function(path, allowCreate)
    {
        if (addin.utils.isEmpty(path))
            return false;

        try
        {
            var fso =
                new COMObject(
                    "Scripting.FileSystemObject"
                );

            if (fso.FolderExists(path))
            {
                addin.logger.debug(
                    "Dossier de sortie existant"
                    + " | Path=" + path
                );

                return true;
            }

            if (!allowCreate)
            {
                addin.logger.warning(
                    "Dossier inexistant et création désactivée"
                    + " | Path=" + path
                );

                return false;
            }

            addin.logger.info(
                "Création du dossier"
                + " | Path=" + path
            );

            this._createDirectoryRecursive(
                fso,
                path
            );

            if (fso.FolderExists(path))
            {
                addin.logger.info(
                    "Dossier créé"
                    + " | Path=" + path
                );

                return true;
            }

            addin.logger.error(
                "Le dossier reste introuvable après création"
                + " | Path=" + path
            );

            return false;
        }
        catch (e)
        {
            var errorMessage =
                e && e.description
                    ? e.description
                    : String(e);

            addin.logger.error(
                "Impossible de créer ou vérifier le dossier"
                + " | Path=" + path
                + " | Error=" + errorMessage
            );

            return false;
        }
    },


    _createDirectoryRecursive: function(fso, path)
    {
        if (
            !fso ||
            addin.utils.isEmpty(path)
        )
        {
            return;
        }

        if (fso.FolderExists(path))
            return;

        var parentPath =
            fso.GetParentFolderName(path);

        if (
            !addin.utils.isEmpty(parentPath) &&
            !fso.FolderExists(parentPath)
        )
        {
            this._createDirectoryRecursive(
                fso,
                parentPath
            );
        }

        fso.CreateFolder(path);
    },


    // ========================================================
    // SQL - Packages d'analyse
    // ========================================================

    findPackageBySourceGuidSQL: function(
        rootPackage,
        sourceGuid)
    {
        if (!rootPackage || !sourceGuid)
            return null;

        var normalizedGuid =
            addin.utils.normalizeGuid(
                sourceGuid
            );

        if (!normalizedGuid)
            return null;

        var sql =
            "SELECT DISTINCT " +
            "p.Package_ID, " +
            "p.Name, " +
            "p.ea_guid " +

            "FROM t_package p " +

            "INNER JOIN t_object o " +
            "ON o.ea_guid = p.ea_guid " +

            "INNER JOIN t_objectproperties tv " +
            "ON tv.Object_ID = o.Object_ID " +

            "WHERE p.Parent_ID = " +
            rootPackage.PackageID + " " +

            "AND tv.Property = " +
            addin.database.safeSQLString(
                addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID
            ) + " " +

            "AND tv.Value = " +
            addin.database.safeSQLString(
                normalizedGuid
            );

        var result =
            addin.database.query(
                sql
            );

        if (
            !result ||
            result.Rows.length == 0
        )
        {
            return null;
        }

        if (result.Rows.length > 1)
        {
            addin.logger.warning(
                "Plusieurs packages associés à la même définition"
                + " | SourceGuid=" + normalizedGuid
                + " | Nombre=" + result.Rows.length
            );
        }

        var packageId =
            Number(
                result.Rows[0].Package_ID
            );

        if (!packageId)
            return null;

        return this.getPackageById(
            packageId
        );
    },


    getAnalysisPackageIndexSQL: function(rootPackage)
    {
        var result = {
            bySourceGuid: {},
            byName: {}
        };

        var rows;
        var i;
        var row;
        var entry;
        var sourceGuid;
        var normalizedName;
        var sql;

        if (!rootPackage)
        {
            return result;
        }

        sql =
            "SELECT " +
            "p.Package_ID, " +
            "p.Name AS Package_Name, " +
            "p.ea_guid AS Package_GUID, " +
            "op.Value AS Source_GUID " +

            "FROM t_package p " +

            "INNER JOIN t_object o " +
            "ON o.ea_guid = p.ea_guid " +

            "LEFT JOIN t_objectproperties op " +
            "ON op.Object_ID = o.Object_ID " +
            "AND op.Property = '" +
            addin.fbaConstants.TAG_SOURCE_ANALYSIS_ELEMENT_GUID +
            "' " +

            "WHERE p.Parent_ID = " +
            rootPackage.PackageID;

        rows =
            addin.database.query(
                sql
            ).Rows;

        for (
            i = 0;
            i < rows.length;
            i++
        )
        {
            row =
                rows[i];

            sourceGuid =
                addin.utils.normalizeGuid(
                    row.Source_GUID
                );

            normalizedName =
                addin.utils.trim(
                    row.Package_Name
                ).toLowerCase();

            entry = {
                packageId:
                    parseInt(
                        row.Package_ID,
                        10
                    ),

                packageGuid:
                    addin.utils.trim(
                        row.Package_GUID
                    ),

                name:
                    addin.utils.trim(
                        row.Package_Name
                    ),

                sourceGuid:
                    sourceGuid
            };

            if (sourceGuid)
            {
                result.bySourceGuid[
                    sourceGuid
                ] =
                    entry;
            }

            if (normalizedName)
            {
                result.byName[
                    normalizedName
                ] =
                    entry;
            }
        }

        addin.logger.debug(
            "Index SQL des packages d'analyse chargé"
            + " | Root=" + rootPackage.Name
            + " | Nombre=" + rows.length
        );

        return result;
    },


    /*
     * Retourne tous les packages descendants du ROOT.
     *
     * Une seule lecture SQL de t_package est effectuée.
     * Le sous-arbre est ensuite déterminé en mémoire.
     *
     * La profondeur n'est pas limitée.
     *
     * Le ROOT lui-même n'est pas inclus dans le résultat.
     */
    getAnalysisPackagesSQL: function(rootPackage)
    {
        if (!rootPackage)
            return [];

        var rootGuid =
            addin.utils.normalizeGuid(
                rootPackage.PackageGUID
            );

        if (addin.utils.isEmpty(rootGuid))
            return [];

        var sql =
            "SELECT " +
            "p.Package_ID AS PackageID, " +
            "p.ea_guid AS PackageGUID, " +
            "p.Name AS PackageName, " +
            "p.Parent_ID AS ParentID " +

            "FROM t_package p " +

            "ORDER BY p.Package_ID";

        var queryResult =
            addin.database.query(
                sql
            );

        var rows =
            queryResult.Rows;

        if (!rows)
            return [];

        var byParent = {};

        for (
            var i = 0;
            i < rows.length;
            i++
        )
        {
            var row =
                rows[i];

            var parentId =
                String(
                    row.ParentID || "0"
                );

            if (!byParent[parentId])
            {
                byParent[parentId] =
                    [];
            }

            byParent[
                parentId
            ].push(
                row
            );
        }

        var result = [];

        var queue = [
            String(
                rootPackage.PackageID
            )
        ];

        while (
            queue.length > 0
        )
        {
            var currentParentId =
                queue.shift();

            var children =
                byParent[
                    currentParentId
                ] || [];

            for (
                var j = 0;
                j < children.length;
                j++
            )
            {
                var child =
                    children[j];

                result.push(
                    child
                );

                queue.push(
                    String(
                        child.PackageID
                    )
                );
            }
        }

        return result;
    },

	getAnalysisUniquenessCandidatesSQL: function(rootPackage)
	{
		var result = [];

		if (!rootPackage)
			return result;

		var packages =
			this.getAnalysisPackagesSQL(
				rootPackage
			);

		var packageById = {};

		packageById[
			String(rootPackage.PackageID)
		] = {
			PackageID:
				rootPackage.PackageID,

			PackageGUID:
				rootPackage.PackageGUID,

			PackageName:
				rootPackage.Name,

			ParentID:
				0
		};

		for (
			var i = 0;
			i < packages.length;
			i++
		)
		{
			packageById[
				String(packages[i].PackageID)
			] =
				packages[i];
		}

		for (
			var j = 0;
			j < packages.length;
			j++
		)
		{
			var row =
				packages[j];

			var name =
				addin.utils.trim(
					row.PackageName
				);

			var isTechnical =
				addin.utils.startsWith(
					name,
					addin.fbaConstants.TECHNICAL_PACKAGE_PREFIX
				);

			var parent =
				packageById[
					String(row.ParentID)
				];

			/*
			 * Recherche de l'Analysis Package propriétaire.
			 *
			 * - Un ANALYSIS_PACKAGE est son propre propriétaire.
			 * - Pour un TECHNICAL_PACKAGE, on remonte ses parents
			 *   jusqu'au premier package non technique.
			 * - Si on atteint le ROOT sans Analysis Package,
			 *   analysisPackageGuid reste vide.
			 */

			var analysisPackageGuid = "";

			if (!isTechnical)
			{
				analysisPackageGuid =
					addin.utils.normalizeGuid(
						row.PackageGUID
					);
			}
			else
			{
				var ancestor =
					parent;

				while (
					ancestor &&
					Number(ancestor.PackageID) !==
						Number(rootPackage.PackageID)
				)
				{
					var ancestorName =
						addin.utils.trim(
							ancestor.PackageName
						);

					var ancestorIsTechnical =
						addin.utils.startsWith(
							ancestorName,
							addin.fbaConstants.TECHNICAL_PACKAGE_PREFIX
						);

					if (!ancestorIsTechnical)
					{
						analysisPackageGuid =
							addin.utils.normalizeGuid(
								ancestor.PackageGUID
							);

						break;
					}

					ancestor =
						packageById[
							String(
								ancestor.ParentID
							)
						];
				}
			}

			result.push({
				guid:
					addin.utils.normalizeGuid(
						row.PackageGUID
					),

				objectType:
					isTechnical
						? "TECHNICAL_PACKAGE"
						: "ANALYSIS_PACKAGE",

				name:
					name,

				parentGuid:
					parent
						? addin.utils.normalizeGuid(
							parent.PackageGUID
						)
						: "",

				parentId:
					Number(
						row.ParentID
					),

				packageId:
					Number(
						row.PackageID
					),

				analysisPackageGuid:
					analysisPackageGuid
			});
		}

		return result;
	},
	
    // ========================================================
    // SQL - Définitions d'artefacts
    // ========================================================

    getArtifactDefinitionsSQL: function()
    {
        var sql =
            "SELECT " +
            "ae.Object_ID AS Analysis_Object_ID, " +
            "ae.Name AS Analysis_Element, " +
            "ae.ea_guid AS Analysis_Element_GUID, " +

            "c.Connector_ID, " +
            "c.ea_guid AS Connector_GUID, " +
            "c.DestCard AS Multiplicity, " +

            "prototype.Object_ID AS Prototype_Object_ID, " +
            "prototype.Name AS Prototype_Name, " +
            "prototype.Object_Type AS Prototype_Type, " +
            "prototype.Stereotype AS Prototype_Stereotype, " +
            "prototype.ea_guid AS Prototype_GUID, " +

            "ct.Property AS Tag_Name, " +
            "ct.Value AS Tag_Value, " +
            "ct.Notes AS Tag_Notes " +

            "FROM t_connector definitionRelation " +

            "INNER JOIN t_object root " +
            "ON root.Object_ID = definitionRelation.Start_Object_ID " +

            "INNER JOIN t_object ae " +
            "ON ae.Object_ID = definitionRelation.End_Object_ID " +

            "INNER JOIN t_connector c " +
            "ON c.Start_Object_ID = ae.Object_ID " +

            "INNER JOIN t_object prototype " +
            "ON prototype.Object_ID = c.End_Object_ID " +

            "LEFT JOIN t_connectortag ct " +
            "ON ct.ElementID = c.Connector_ID " +

            "WHERE root.ea_guid = " +
            addin.database.safeSQLString(
                addin.fbaConstants.ANALYSIS_ELEMENTS_GUID
            ) + " " +

            "AND definitionRelation.Connector_Type = 'Association' " +
            "AND definitionRelation.Name = 'Defined by' " +

            "AND c.Connector_Type = " +
            addin.database.safeSQLString(
                addin.fbaConstants.ARTIFACT_RELATION_TYPE
            ) + " " +

            "AND c.Name = " +
            addin.database.safeSQLString(
                addin.fbaConstants.ARTIFACT_RELATION_NAME
            ) + " " +

            "ORDER BY " +
            "ae.Name, " +
            "prototype.Name, " +
            "ct.Property";

        return addin.database.query(
            sql
        );
    },


    getArtifactDefinitionsIndexSQL: function()
    {
        var queryResult =
            this.getArtifactDefinitionsSQL();

        var index = {};

        if (!queryResult)
            return index;

        var byConnector = {};

        for (
            var i = 0;
            i < queryResult.Rows.length;
            i++
        )
        {
            var row =
                queryResult.Rows[i];

            var analysisGuid =
                addin.utils.normalizeGuid(
                    row.Analysis_Element_GUID
                );

            var connectorId =
                Number(
                    row.Connector_ID
                );

            if (
                !analysisGuid ||
                !connectorId
            )
            {
                continue;
            }

            var connectorKey =
                analysisGuid +
                ":" +
                connectorId;

            var definition =
                byConnector[
                    connectorKey
                ];

            if (!definition)
            {
                definition =
                {
                    analysisElementGuid:
                        analysisGuid,

                    analysisElementId:
                        Number(
                            row.Analysis_Object_ID
                        ),

                    connectorId:
                        connectorId,

                    connectorGuid:
                        addin.utils.trim(
                            row.Connector_GUID
                        ),

                    prototypeObjectId:
                        Number(
                            row.Prototype_Object_ID
                        ),

                    prototypeGuid:
                        addin.utils.normalizeGuid(
                            row.Prototype_GUID
                        ),

                    prototypeName:
                        addin.utils.trim(
                            row.Prototype_Name
                        ),

                    prototypeType:
                        addin.utils.trim(
                            row.Prototype_Type
                        ),

                    prototypeStereotype:
                        addin.utils.trim(
                            row.Prototype_Stereotype
                        ),

                    multiplicity:
                        addin.utils.trim(
                            row.Multiplicity
                        ),

                    connectorTags:
                        {}
                };

                byConnector[
                    connectorKey
                ] =
                    definition;

                if (
                    !index[
                        analysisGuid
                    ]
                )
                {
                    index[
                        analysisGuid
                    ] =
                        [];
                }

                index[
                    analysisGuid
                ].push(
                    definition
                );
            }

            var tagName =
                addin.utils.trim(
                    row.Tag_Name
                );

            if (tagName)
            {
                definition.connectorTags[
                    tagName
                ] =
                    addin.utils.trim(
                        row.Tag_Value
                    );
            }
        }

        return index;
    },


    // ========================================================
    // SQL - Tags des éléments d'analyse
    // ========================================================

    /*
     * Version unique.
     *
     * L'ancienne définition en double de cette méthode
     * a été supprimée.
     */
    getAnalysisElementTagsIndexSQL: function()
    {
        var sql =
            "SELECT " +
            "ae.Object_ID AS Analysis_Object_ID, " +
            "ae.Name AS Analysis_Element, " +
            "ae.ea_guid AS Analysis_Element_GUID, " +
            "tv.Property AS Tag_Name, " +
            "tv.Value AS Tag_Value, " +
            "tv.Notes AS Tag_Notes " +

            "FROM t_connector definitionRelation " +

            "INNER JOIN t_object root " +
            "ON root.Object_ID = definitionRelation.Start_Object_ID " +

            "INNER JOIN t_object ae " +
            "ON ae.Object_ID = definitionRelation.End_Object_ID " +

            "LEFT JOIN t_objectproperties tv " +
            "ON tv.Object_ID = ae.Object_ID " +

            "WHERE root.ea_guid = " +
            addin.database.safeSQLString(
                addin.fbaConstants.ANALYSIS_ELEMENTS_GUID
            ) + " " +

            "AND definitionRelation.Connector_Type = 'Association' " +
            "AND definitionRelation.Name = 'Defined by' " +

            "ORDER BY ae.Name, tv.Property";

        var queryResult =
            addin.database.query(
                sql
            );

        var index = {};

        if (!queryResult)
        {
            addin.logger.error(
                "Erreur chargement SQL des tags des éléments d'analyse"
            );

            return index;
        }

        for (
            var i = 0;
            i < queryResult.Rows.length;
            i++
        )
        {
            var row =
                queryResult.Rows[i];

            var analysisGuid =
                addin.utils.normalizeGuid(
                    row.Analysis_Element_GUID
                );

            if (!analysisGuid)
                continue;

            if (!index[analysisGuid])
            {
                index[
                    analysisGuid
                ] =
                    {};
            }

            var tagName =
                addin.utils.trim(
                    row.Tag_Name
                );

            if (!tagName)
                continue;

            index[
                analysisGuid
            ][
                tagName
            ] =
                addin.utils.trim(
                    row.Tag_Value
                );
        }

        return index;
    },


    // ========================================================
    // SQL - Objets du Dossier d'analyse
    // ========================================================

    /*
     * Méthode déjà introduite.
     *
     * Elle est conservée pour le moment mais n'est pas
     * utilisée comme architecture définitive du contrôle
     * d'unicité.
     */
    getAnalysisArtifactsSQL: function(rootPackage)
    {
        if (!rootPackage)
            return [];

        var packages =
            this.getAnalysisPackagesSQL(
                rootPackage
            );

        if (
            !packages ||
            packages.length == 0
        )
        {
            return [];
        }

        var packageIds = [];

        /*
         * Le ROOT est inclus dans le périmètre.
         */
        packageIds.push(
            String(
                rootPackage.PackageID
            )
        );

        for (
            var i = 0;
            i < packages.length;
            i++
        )
        {
            packageIds.push(
                String(
                    packages[i].PackageID
                )
            );
        }

        var sql =
            "SELECT " +
            "o.Object_ID AS ObjectID, " +
            "o.ea_guid AS ObjectGUID, " +
            "o.Name AS ObjectName, " +
            "o.Object_Type AS ObjectType, " +
            "o.Stereotype AS Stereotype, " +
            "o.Package_ID AS PackageID " +

            "FROM t_object o " +

            "WHERE o.Package_ID IN (" +
            packageIds.join(",") +
            ") " +

            "ORDER BY " +
            "o.Package_ID, " +
            "o.Object_ID";

        var queryResult =
            addin.database.query(
                sql
            );

        return queryResult.Rows || [];
    },
	
	
	getAnalysisDiagramsSQL: function(rootPackage)
	{
		if (!rootPackage)
			return [];

		var packages =
			this.getAnalysisPackagesSQL(
				rootPackage
			);

		if (!packages)
			return [];

		var packageIds = [];

		/*
		 * Le ROOT est inclus explicitement.
		 */
		packageIds.push(
			String(rootPackage.PackageID)
		);

		for (
			var i = 0;
			i < packages.length;
			i++
		)
		{
			packageIds.push(
				String(packages[i].PackageID)
			);
		}

		var sql =
			"SELECT " +
			"d.Diagram_ID AS DiagramID, " +
			"d.ea_guid AS DiagramGUID, " +
			"d.Name AS DiagramName, " +
			"d.Diagram_Type AS DiagramType, " +
			"d.Package_ID AS PackageID " +
			"FROM t_diagram d " +
			"WHERE d.Package_ID IN (" +
			packageIds.join(",") +
			") " +
			"ORDER BY d.Package_ID, d.Diagram_ID";

		var queryResult =
			addin.database.query(
				sql
			);

		return queryResult.Rows || [];
	},

};