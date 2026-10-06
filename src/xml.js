var addin = this;

return {

	createDOM: function()
	{
		var xmlDOM = null;
		var progId = "";
		var attempt = 0;

		while (xmlDOM == null)
		{
			switch (attempt++)
			{
				case 0:
					progId = "MSXML2.DOMDocument.6.0";
					break;

				case 1:
					progId = "MSXML2.DOMDocument.3.0";
					break;

				case 2:
					progId = "MSXML2.DOMDocument";
					break;

				case 3:
					progId = "MSXML2.DOMDocument.4.0";
					break;

				default:
					addin.logger.warning(
						"Impossible de créer un DOMDocument XML"
					);

					return null;
			}

			try
			{
				xmlDOM =
					new COMObject(
						progId
					);

				addin.logger.trace(
					"DOMDocument créé | ProgId=" +
					progId
				);
			}
			catch (e)
			{
				xmlDOM = null;
			}
		}

		xmlDOM.validateOnParse = false;
		xmlDOM.async = false;

		return xmlDOM;
	},


	parse: function(xmlDocument)
	{
		if (!xmlDocument)
			return null;

		var xmlDOM =
			this.createDOM();

		if (!xmlDOM)
			return null;

		var parsed =
			xmlDOM.loadXML(
				xmlDocument
			);

		if (!parsed)
		{
			addin.logger.warning(
				this.describeParseError(
					xmlDOM.parseError
				)
			);

			return null;
		}

		return xmlDOM;
	},


	describeParseError: function(parseError)
	{
		if (
			typeof(parseError) ==
			"undefined" ||
			parseError == null
		)
		{
			return "Erreur XML inconnue";
		}

		return "Erreur XML"
			+ " | Ligne=" + parseError.line
			+ " | Position=" + parseError.linepos
			+ " | Raison=" + parseError.reason;
	},
	
	testXML: function()
	{
		var xml =
			"<root>" +
				"<value>FrameworkBA</value>" +
			"</root>";

		var dom =
			addin.xml.parse(
				xml
			);

		if (!dom)
		{
			addin.logger.error(
				"TEST XML = ECHEC"
			);

			return false;
		}

		var node =
			dom.selectSingleNode(
				"//value"
			);

		if (!node)
		{
			addin.logger.error(
				"TEST XML = ECHEC | Node introuvable"
			);

			return false;
		}

		addin.logger.info(
			"TEST XML = OK"
			+ " | Value=" + node.text
		);

		return true;
	}
};
