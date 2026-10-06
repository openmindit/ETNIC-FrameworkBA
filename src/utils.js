var addin = this;

return {

    trim: function(value)
    {
        if (value == null)
            return "";

        return String(value).replace(/^\s+|\s+$/g, "");
    },


    startsWith: function(value, prefix)
    {
        value = String(value || "");
        prefix = String(prefix || "");

        return value.indexOf(prefix) === 0;
    },


    equalsIgnoreCase: function(value1, value2)
    {
        return this.trim(value1).toLowerCase() ===
               this.trim(value2).toLowerCase();
    },


    isEmpty: function(value)
    {
        return this.trim(value) === "";
    },


    normalizeGuid: function(guid)
    {
        return this.trim(guid).toUpperCase();
    },


    formatFrenchDateTime: function(date)
    {
        if (!date)
            date = new Date();

        function pad(value)
        {
            return value < 10
                ? "0" + value
                : String(value);
        }

        return (
            pad(date.getDate())
            + "-"
            + pad(date.getMonth() + 1)
            + "-"
            + date.getFullYear()
            + " - "
            + pad(date.getHours())
            + ":"
            + pad(date.getMinutes())
        );
    },


    removeAnalysisPrefix: function(value)
    {
        value = this.trim(value);

        var prefix = "BasAn -";

        if (
            value.toLowerCase().indexOf(
                prefix.toLowerCase()
            ) === 0
        )
        {
            value =
                this.trim(
                    value.substring(
                        prefix.length
                    )
                );
        }

        return value;
    },


    replaceTokenContent: function(
        rtf,
        tokenName,
        newValue)
    {
        if (rtf == null)
            return "";

        if (newValue == null)
            newValue = "";

        var token =
            "[[ETNIC:" + tokenName + "]]";

        addin.logger.debug(
            "replaceToken"
            + " | Token=" + token
            + " | Value=" + newValue
        );

        if (
            rtf.indexOf(token) < 0
        )
        {
            addin.logger.warning(
                "Token introuvable"
                + " | Token=" + token
            );

            return rtf;
        }

        // Remplace toutes les occurrences
        while (
            rtf.indexOf(token) >= 0
        )
        {
            rtf =
                rtf.replace(
                    token,
                    String(newValue)
                );
        }

        return rtf;
    },


    isTechnicalName: function(name)
    {
        name = this.trim(name);

        if (
            this.isEmpty(name) ||
            this.isEmpty(
                addin.fbaConstants.TECHNICAL_NAME_PREFIX
            )
        )
        {
            return false;
        }

        return (
            name.indexOf(
                addin.fbaConstants.TECHNICAL_NAME_PREFIX
            ) === 0
        );
    }

};