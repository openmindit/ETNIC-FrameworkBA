var addin = this;

return {

	// =====================================================
	// CONFIGURATION
	// =====================================================

	DBTYPE_EAP: 0,
	DBTYPE_MYSQL: 1,
	DBTYPE: 0,


	// =====================================================
	// safeSQLString
	//
	// Echappe une chaîne et ajoute les quotes SQL.
	//
	// Exemple :
	// O'Brien -> 'O''Brien'
	// =====================================================

	safeSQLString: function(value)
	{
		if (
			value === null ||
			typeof(value) == "undefined"
		)
		{
			return "NULL";
		}

		var text =
			String(value);

		text =
			text.replace(
				/'/g,
				"''"
			);

		return "'" + text + "'";
	},


	// =====================================================
	// getSQLDate
	// =====================================================

	getSQLDate: function(date)
	{
		if (!date)
			return "NULL";

		var delimiter = "#";

		if (
			this.DBTYPE ==
			this.DBTYPE_MYSQL
		)
		{
			delimiter = "'";
		}

		var sqlDate =
			delimiter
			+ date.getFullYear()
			+ "-"
			+ (date.getMonth() + 1)
			+ "-"
			+ date.getDate()
			+ " "
			+ date.getHours()
			+ ":"
			+ date.getMinutes()
			+ ":"
			+ date.getSeconds()
			+ delimiter;

		return sqlDate;
	},


	// =====================================================
	// query
	//
	// Exécute une requête SQL EA et retourne :
	//
	// {
	//     SQL: "...",
	//     Columns: [],
	//     Rows: []
	// }
	//
	// Equivalent adapté de DBSQLQueryToJSON().
	// =====================================================

	query: function(sql)
	{
		var resultSet = {
			SQL: sql,
			Columns: [],
			Rows: []
		};


		if (
			!sql ||
			String(sql).length == 0
		)
		{
			addin.logger.warning(
				"SQLQuery ignorée : requête vide"
			);

			return resultSet;
		}


		try
		{
			addin.logger.trace(
				"SQLQuery | SQL=" + sql
			);


			var xml =
				Repository.SQLQuery(
					sql
				);


			if (!xml)
			{
				addin.logger.debug(
					"SQLQuery sans résultat"
					+ " | SQL=" + sql
				);

				return resultSet;
			}


			var xmlDOM =
				addin.xml.parse(
					xml
				);


			if (!xmlDOM)
			{
				addin.logger.warning(
					"Impossible de parser le résultat SQL"
				);

				return resultSet;
			}


			var xmlRows =
				xmlDOM.documentElement.selectNodes(
					"//EADATA//Dataset_0//Data//Row"
				);


			if (!xmlRows)
				return resultSet;


			var rowCount = 0;

			var xmlRow =
				xmlRows.nextNode();


			while (xmlRow != null)
			{
				var row = {};

				var xmlColumns =
					xmlRow.childNodes;

				var xmlColumn =
					xmlColumns.nextNode();


				while (xmlColumn != null)
				{
					var columnName =
						xmlColumn.nodeName;

					row[columnName] =
						xmlColumn.text;


					// Première ligne :
					// construction de la liste des colonnes.

					if (rowCount == 0)
					{
						var exists =
							false;

						for (
							var c = 0;
							c < resultSet.Columns.length;
							c++
						)
						{
							if (
								resultSet.Columns[c] ==
								columnName
							)
							{
								exists = true;
								break;
							}
						}


						if (!exists)
						{
							resultSet.Columns.push(
								columnName
							);
						}
					}


					xmlColumn =
						xmlColumns.nextNode();
				}


				resultSet.Rows.push(
					row
				);

				rowCount++;


				xmlRow =
					xmlRows.nextNode();
			}


			addin.logger.trace(
				"SQLQuery terminée"
				+ " | Rows=" + resultSet.Rows.length
				+ " | Columns=" + resultSet.Columns.length
			);


			return resultSet;
		}
		catch (e)
		{
			var message =
				"";

			try
			{
				message =
					e.description ||
					e.message ||
					String(e);
			}
			catch (ignore)
			{
				message =
					"Erreur inconnue";
			}


			addin.logger.error(
				"Erreur SQLQuery"
				+ " | Error=" + message
				+ " | SQL=" + sql
			);


			return resultSet;
		}
	},


	// =====================================================
	// getFieldValueString
	//
	// Equivalent de DBGetFieldValueString().
	// =====================================================

	getFieldValueString: function(
		columnName,
		table,
		whereClause)
	{
		var sql =
			"SELECT "
			+ columnName
			+ " FROM "
			+ table;


		if (
			whereClause &&
			whereClause.length > 0
		)
		{
			sql +=
				" WHERE "
				+ whereClause;
		}


		var result =
			this.query(
				sql
			);


		if (
			result.Rows.length == 0
		)
		{
			return "";
		}


		var value =
			result.Rows[0][columnName];


		if (
			value === null ||
			typeof(value) == "undefined"
		)
		{
			return "";
		}


		return String(value);
	},


	// =====================================================
	// getFieldValueNumber
	//
	// Equivalent de DBGetFieldValueNumber().
	// =====================================================

	getFieldValueNumber: function(
		columnName,
		table,
		whereClause)
	{
		var value =
			this.getFieldValueString(
				columnName,
				table,
				whereClause
			);


		if (
			!value ||
			value.length == 0
		)
		{
			return 0;
		}


		return Number(value);
	},


	// =====================================================
	// getFieldValueArrayString
	//
	// Equivalent de DBGetFieldValueArrayString().
	// =====================================================

	getFieldValueArrayString: function(
		columnName,
		table,
		whereClause)
	{
		var values = [];


		var sql =
			"SELECT "
			+ columnName
			+ " FROM "
			+ table;


		if (
			whereClause &&
			whereClause.length > 0
		)
		{
			sql +=
				" WHERE "
				+ whereClause;
		}


		var result =
			this.query(
				sql
			);


		for (
			var i = 0;
			i < result.Rows.length;
			i++
		)
		{
			var value =
				result.Rows[i][columnName];


			if (
				value !== null &&
				typeof(value) != "undefined"
			)
			{
				values.push(
					String(value)
				);
			}
		}


		return values;
	},
		
	testDatabase: function()
	{
		var result =
			addin.database.query(
				"SELECT Package_ID, Name, ea_guid " +
				"FROM t_package"
			);


		addin.logger.info(
			"TEST DATABASE"
			+ " | Rows=" + result.Rows.length
			+ " | Columns=" + result.Columns.length
		);


		if (result.Rows.length > 0)
		{
			var row =
				result.Rows[0];


			addin.logger.info(
				"TEST DATABASE première ligne"
				+ " | Package_ID=" + row.Package_ID
				+ " | Name=" + row.Name
				+ " | GUID=" + row.ea_guid
			);
		}


		return true;
	}
};