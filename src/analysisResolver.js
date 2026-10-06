var addin = this;

return {

    // ========================================================
    // isValidAnalysisRoot
    //
    // Contrôle temporaire basé sur la convention de nommage.
    // Cette règle pourra plus tard être remplacée par un
    // Tagged Value ou un rôle Framework.
    // ========================================================

    isValidAnalysisRoot: function(rootPackage)
    {
        if (!rootPackage)
            return false;

        return addin.utils.startsWith(
            rootPackage.Name,
            addin.fbaConstants.ANALYSIS_ROOT_NAME_PREFIX
        );
    },


    // ========================================================
    // resolveViewPackage
    //
    // Résout :
    //
    // Root
    //   └── _Librairie
    //        └── _Vues
    //             └── <vue demandée>
    // ========================================================

    resolveViewPackage: function(
        rootPackage,
        targetViewPackageName)
    {
        if (!rootPackage)
            return null;


        if (!this.isValidAnalysisRoot(rootPackage))
        {
            addin.logger.error(
                "Root d'analyse non conforme"
                + " | Nom=" + rootPackage.Name
            );

            return null;
        }


        var libraryPackage =
            addin.repositoryService.findDirectChildPackageByNameIncludingTechnical(
                rootPackage,
                addin.fbaConstants.LIBRARY_PACKAGE_NAME
            );


        if (!libraryPackage)
            return null;


        var viewsPackage =
            addin.repositoryService.findDirectChildPackageByNameIncludingTechnical(
                libraryPackage,
                addin.fbaConstants.VIEWS_PACKAGE_NAME
            );


        if (!viewsPackage)
            return null;


        return addin.repositoryService.findDirectChildPackageByNameIncludingTechnical(
            viewsPackage,
            targetViewPackageName
        );
    }
};