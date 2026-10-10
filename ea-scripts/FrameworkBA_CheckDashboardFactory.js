/**
 * EA JavaScript library: ETNIC_FrameworkBA.FrameworkBA_CheckDashboardFactory.
 * Run from normal Scripting/INIT, never from a Scriptlet or ConstructChart.
 * Clone the whole prototype; preserve layout and scripts, reset cached results.
 */
var FrameworkBA_CheckDashboardFactory = (function () {
    var chartNames = ["_Chart_Conformity_All", "_Chart_Conformity_Artifacts", "_Chart_Conformity_Diagrams",
        "_Chart_Actions", "_Chart_Issues", "_Chart_Classification_All", "_Chart_Classification_Packages",
        "_Chart_Classification_Artifacts", "_Chart_Classification_Diagrams"];
    var summaryNames = ["_Summary_Title", "_Summary_Check_Date", "_Summary_Error_Count", "_Summary_Warning_Count",
        "_Summary_Object_Count", "_Summary_Snapshot_Coverage", "_Summary_Snapshot_NotPlanned_Count",
        "_Summary_Conformity_Title", "_Summary_Compliant_Value", "_Summary_NonCompliant_Value",
        "_Summary_Foreign_Value", "_Summary_Scope"];
    function key(v) { return String(v || "").replace(/[{}]/g, "").toUpperCase(); }
    function tag(element, name) {
        element.TaggedValues.Refresh();
        var found = null;
        for (var i = 0; i < element.TaggedValues.Count; i++) {
            var t = element.TaggedValues.GetAt(i);
            if (String(t.Name) !== name) continue;
            if (found) throw new Error("Tag duplique: " + name + " sur " + element.Name);
            found = t;
        }
        return found;
    }
    function read(element, name) {
        var t = tag(element, name);
        return t ? String(t.Value === "<memo>" ? t.Notes : t.Value || "") : "";
    }
    function set(element, name, value, memo) {
        var t = tag(element, name);
        if (!t) t = element.TaggedValues.AddNew(name, memo ? "<memo>" : value);
        if (!t) throw new Error("Creation du tag impossible: " + name + " sur " + element.Name);
        t.Value = memo ? "<memo>" : value;
        if (memo) t.Notes = value;
        if (!t.Update()) throw new Error("Tag non sauvegarde: " + name);
        if (read(element, name) !== value) throw new Error("Tag non persiste: " + name);
    }
    function inventory(pkg) {
        var packages = {}, elements = {}, diagrams = [];
        function elementTree(e) {
            elements[key(e.ElementGUID)] = e;
            if (e.Elements) for (var n = 0; n < e.Elements.Count; n++) elementTree(e.Elements.GetAt(n));
        }
        function visit(p) {
            packages[p.PackageID] = true;
            elementTree(p.Element);
            p.Elements.Refresh(); p.Diagrams.Refresh(); p.Packages.Refresh();
            for (var e = 0; e < p.Elements.Count; e++) elementTree(p.Elements.GetAt(e));
            for (var d = 0; d < p.Diagrams.Count; d++) diagrams.push(p.Diagrams.GetAt(d));
            for (var c = 0; c < p.Packages.Count; c++) visit(p.Packages.GetAt(c));
        }
        visit(pkg);
        return { packages: packages, elements: elements, diagrams: diagrams };
    }
    function inspect(pkg, repo) {
        var inv = inventory(pkg), diagram = null;
        for (var i = 0; i < inv.diagrams.length; i++) {
            var d = inv.diagrams[i];
            if (String(d.Name) !== "_Check_Result_Diagram") continue;
            if (diagram) throw new Error("Plusieurs diagrammes _Check_Result_Diagram.");
            diagram = d;
        }
        if (!diagram) throw new Error("Diagramme _Check_Result_Diagram absent.");
        // The common refresh reads configuration from the immediate diagram package.
        if (diagram.PackageID !== pkg.PackageID) throw new Error("Le diagramme CHECK doit etre directement dans le dossier prototype.");
        var byName = {};
        for (var j = 0; j < inv.diagrams.length; j++) {
            var current = inv.diagrams[j];
            current.DiagramObjects.Refresh();
            for (var o = 0; o < current.DiagramObjects.Count; o++) {
                var element = repo.GetElementByID(current.DiagramObjects.GetAt(o).ElementID);
                if (!element || !inv.elements[key(element.ElementGUID)])
                    throw new Error("Reference externe au prototype dans " + current.Name);
                if (current.DiagramID !== diagram.DiagramID) continue;
                var name = String(element.Name);
                if (byName[name] && key(byName[name].ElementGUID) !== key(element.ElementGUID))
                    throw new Error("Nom technique duplique sur le diagramme: " + name);
                byName[name] = element;
            }
        }
        function requireElement(name) {
            if (!byName[name]) throw new Error("Element absent du diagramme: " + name);
            return byName[name];
        }
        var table = requireElement("_Detail_Table");
        if (!tag(table, "data") || !tag(table, "dataFormat")) throw new Error("Tags de table incomplets.");
        var refresh = requireElement("_Check_Refresh");
        if (String(refresh.Stereotype) !== "Scriptlet") throw new Error("_Check_Refresh doit etre un Scriptlet.");
        for (var c = 0; c < chartNames.length; c++) {
            var chart = requireElement(chartNames[c]);
            if (String(chart.Stereotype) !== "SSDynamicChart") throw new Error("DynamicChart attendu: " + chart.Name);
            if (!tag(chart, "FrameworkBA_CheckChart_Data")) throw new Error("Tag de donnees absent: " + chart.Name);
        }
        for (var s = 0; s < summaryNames.length; s++) {
            var text = requireElement(summaryNames[s]);
            if (String(text.Type) !== "Text" && String(text.Type) !== "Note")
                throw new Error("Text ou Note attendu: " + text.Name);
        }
        return { inventory: inv, diagram: diagram, elements: byName, table: table };
    }
    function create(prototypeGuid, targetGuid, rootGuid, options) {
        options = options || {};
        var repo = options.repository || Repository;
        var log = options.output || function (m) { repo.WriteOutput("ETNIC_FrameworkBA", "[CHECK INIT] " + m, 0); };
        var prototype = repo.GetPackageByGuid(prototypeGuid), target = repo.GetPackageByGuid(targetGuid),
            root = repo.GetPackageByGuid(rootGuid);
        if (!prototype || !target || !root) throw new Error("Prototype, cible ou racine introuvable.");
        var ancestor = target, belongs = false;
        while (ancestor) {
            if (key(ancestor.PackageGUID) === key(prototypeGuid)) throw new Error("La cible ne peut pas appartenir au prototype.");
            if (key(ancestor.PackageGUID) === key(rootGuid)) belongs = true;
            ancestor = ancestor.ParentID ? repo.GetPackageByID(ancestor.ParentID) : null;
        }
        if (!belongs) throw new Error("Cible hors du dossier d'analyse.");
        var template = inspect(prototype, repo);
        // Reuse the framework technical library shown in the analysis root.
        var library = null, container = null, oldContainer = null, existing = [];
        root.Packages.Refresh();
        for (var p = 0; p < root.Packages.Count; p++) {
            var candidate = root.Packages.GetAt(p);
            if (String(candidate.Name) === "_Librairie" || String(candidate.Name) === "_librairies") {
                if (library) throw new Error("Plusieurs dossiers de librairies; cible ambigue.");
                library = candidate;
            }
            if (String(candidate.Name) === "_Check_results") {
                if (oldContainer) throw new Error("Plusieurs anciens dossiers _Check_results.");
                oldContainer = candidate;
            }
        }
        if (!library) throw new Error("Dossier technique _Librairie/_librairies absent de la racine.");
        library.Packages.Refresh();
        for (var lc = 0; lc < library.Packages.Count; lc++) {
            var bucket = library.Packages.GetAt(lc);
            if (String(bucket.Name) !== "_Check_results" && String(bucket.Name) !== "check_results") continue;
            if (container) throw new Error("Plusieurs dossiers check_results dans les librairies.");
            container = bucket;
        }
        function linkedInstances(bucket) {
            if (!bucket) return;
            bucket.Packages.Refresh();
            for (var x = 0; x < bucket.Packages.Count; x++) {
                var instance = bucket.Packages.GetAt(x);
                if (key(read(instance.Element, "FrameworkBA_Check_TargetGuid")) === key(targetGuid)) existing.push(instance);
            }
        }
        linkedInstances(container);
        linkedInstances(oldContainer);
        function destination() {
            if (!container) {
                container = library.Packages.AddNew("_Check_results", "");
                if (!container || !container.Update()) throw new Error("Creation du dossier check_results impossible.");
                library.Packages.Refresh();
            }
            return container;
        }
        if (existing.length > 1) throw new Error("Plusieurs dashboards pour la meme cible.");
        if (existing.length === 1) {
            var present = inspect(existing[0], repo);
            if (read(existing[0].Element, "FrameworkBA_Check_State") !== "READY"
                || key(read(existing[0].Element, "FrameworkBA_Check_RootGuid")) !== key(rootGuid)
                || read(existing[0].Element, "FrameworkBA_Check_Scope") !== "PACKAGE"
                || read(existing[0].Element, "FrameworkBA_Check_TemplateVersion") !== "1")
                throw new Error("Dashboard existant incomplet ou incoherent; COMPLETE/REPAIR requis.");
            var destinationPackage = destination();
            var migrated = existing[0].ParentID !== destinationPackage.PackageID
                || String(existing[0].Name) !== "_CHECK - " + target.Name;
            if (migrated) {
                existing[0].ParentID = destinationPackage.PackageID;
                existing[0].Name = "_CHECK - " + target.Name;
                if (!existing[0].Update()) throw new Error("Deplacement/renommage de l'instance impossible.");
                destinationPackage.Packages.Refresh();
                if (oldContainer) oldContainer.Packages.Refresh();
            }
            log("Existant | Dossier=" + existing[0].Name + " | Modifie=" + migrated);
            return { packageGuid: existing[0].PackageGUID, diagramGuid: present.diagram.DiagramGUID, changed: migrated };
        }
        log("Prototype valide | Graphiques=9 | Textes=12 | Cible=" + target.Name);
        var copy = null;
        try {
            copy = prototype.Clone();
            if (!copy || key(copy.PackageGUID) === key(prototype.PackageGUID)) throw new Error("Clone du package non disponible.");
            log("Clone cree | GUID=" + copy.PackageGUID);
            var copied = inspect(copy, repo);
            for (var elementGuid in copied.inventory.elements)
                if (Object.prototype.hasOwnProperty.call(template.inventory.elements, elementGuid))
                    throw new Error("Le clone partage un element du prototype.");
            for (var dg = 0; dg < copied.inventory.diagrams.length; dg++)
                for (var sd = 0; sd < template.inventory.diagrams.length; sd++)
                    if (key(copied.inventory.diagrams[dg].DiagramGUID) === key(template.inventory.diagrams[sd].DiagramGUID))
                        throw new Error("Le clone partage un diagramme du prototype.");
            copy.Name = "_CHECK - " + target.Name;
            if (!copy.Update()) throw new Error("Renommage du clone impossible.");
            set(copy.Element, "FrameworkBA_Check_TargetGuid", targetGuid, false);
            set(copy.Element, "FrameworkBA_Check_RootGuid", rootGuid, false);
            set(copy.Element, "FrameworkBA_Check_Scope", "PACKAGE", false);
            set(copy.Element, "FrameworkBA_Check_TemplateVersion", "1", false);
            set(copy.Element, "FrameworkBA_Check_State", "PREPARING", false);
            set(copy.Element, "FrameworkBA_Check_PrototypeGuid", prototypeGuid, false);
            set(copy.Element, "FrameworkBA_Check_DiagramGuidsWithoutSnapshot", "[]", false);
            set(copy.Element, "FrameworkBA_Check_ForeignDiagramGuids", "[]", false);
            // Clear cached data copied from a test instance; no rendering here.
            for (var ch = 0; ch < chartNames.length; ch++)
                set(copied.elements[chartNames[ch]], "FrameworkBA_CheckChart_Data", "{}", true);
            FrameworkBA_CheckTableWriter.write(copied.table.ElementGUID,
                { issues: [], objectsWithoutSnapshot: [], summary: { missing: 0 } },
                { repository: repo, refresh: false, output: log });
            for (var tx = 0; tx < summaryNames.length; tx++) {
                var e = copied.elements[summaryNames[tx]];
                e.Notes = summaryNames[tx] === "_Summary_Title" ? "SYNTHÈSE CHECK — " + target.Name : "—";
                if (!e.Update()) throw new Error("Reinitialisation texte impossible: " + e.Name);
            }
            destination();
            copy.ParentID = container.PackageID;
            if (!copy.Update()) throw new Error("Deplacement du clone impossible.");
            set(copy.Element, "FrameworkBA_Check_State", "READY", false);
            container.Packages.Refresh();
            log("Fin | Dossier=" + copy.Name + " | GUID=" + copy.PackageGUID + " | Modifie=true");
            return { packageGuid: copy.PackageGUID, diagramGuid: copied.diagram.DiagramGUID, changed: true };
        } catch (error) {
            if (copy) log("Copie incomplete conservee | GUID=" + copy.PackageGUID + " | Aucun nouvel essai automatique.");
            throw error;
        }
    }
    return { inspect: inspect, create: create };
})();
