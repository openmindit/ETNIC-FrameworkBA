var addin = this;

var context = {

    rootGuid:
        addin.utils.normalizeGuid(rootGuid),

    rootElement: null,

    rootPackage: null,

    resolved: false,

    rootType: "",


    resolve: function()
    {
        this.rootElement = null;
        this.rootPackage = null;
        this.resolved = false;
        this.rootType = "";

        // ----------------------------------------------------
        // Tentative Element
        // ----------------------------------------------------

        var element =
            addin.repositoryService.getElementByGuid(
                this.rootGuid
            );

        if (element != null)
        {
            this.rootElement = element;
            this.rootType = "ELEMENT";
            this.resolved = true;

            return true;
        }


        // ----------------------------------------------------
        // Tentative Package
        // ----------------------------------------------------

        var pkg =
            addin.repositoryService.getPackageByGuid(
                this.rootGuid
            );

        if (pkg != null)
        {
            this.rootPackage = pkg;
            this.rootType = "PACKAGE";
            this.resolved = true;

            return true;
        }


        return false;
    },


    isElement: function()
    {
        return this.rootType === "ELEMENT";
    },


    isPackage: function()
    {
        return this.rootType === "PACKAGE";
    },


    getName: function()
    {
        if (this.rootElement)
            return this.rootElement.Name;

        if (this.rootPackage)
            return this.rootPackage.Name;

        return "";
    }

};

return context;