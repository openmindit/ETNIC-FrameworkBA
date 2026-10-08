/**
 * EA JavaScript library: ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter.
 * First stage: real PACKAGE CHECK metrics for conformity pie charts.
 * Called only from a DynamicChart's ConstructChart(guid).
 * Include Local Scripts.ChartAutomation in the calling chart script.
 */
var FrameworkBA_CheckChartWriter = (function () {
    function key(value) {
        return String(value || "").replace(/[{}]/g, "").toUpperCase();
    }
    function readPackage(packageGuid, repository) {
        var pkg = repository.GetPackageByGuid(packageGuid);
        if (!pkg) throw new Error("Package CHECK introuvable: " + packageGuid);
        pkg.Element.TaggedValues.Refresh();
        for (var i = 0; i < pkg.Element.TaggedValues.Count; i++) {
            var tag = pkg.Element.TaggedValues.GetAt(i);
            if (String(tag.Name) !== "ETNIC_Check_Result") continue;
            var raw = String(tag.Value || "");
            if (raw === "<memo>" || raw === "") raw = String(tag.Notes || "");
            var snapshot = JSON.parse(raw);
            if (!snapshot || !snapshot.object || snapshot.scope !== "PACKAGE"
                || key(snapshot.object.guid) !== key(packageGuid) || !snapshot.metrics)
                throw new Error("Snapshot PACKAGE incoherent ou sans metrics.");
            return snapshot;
        }
        throw new Error("Snapshot CHECK absent sur " + pkg.Name);
    }
    function count(value, label) {
        if (typeof value !== "number" || !isFinite(value) || value < 0
            || Math.floor(value) !== value)
            throw new Error("Metrique absente ou invalide: " + label);
        return value;
    }
    function conformity(metrics, scope) {
        var scopes = scope === "ALL" ? ["artifacts", "diagrams"] :
            scope === "ARTIFACT" ? ["artifacts"] :
            scope === "DIAGRAM" ? ["diagrams"] : null;
        if (!scopes) throw new Error("Perimetre inconnu: " + scope);
        var result = { compliant: 0, nonCompliant: 0, foreign: 0, total: 0 };
        for (var i = 0; i < scopes.length; i++) {
            var m = metrics[scopes[i]];
            if (!m) throw new Error("Metriques absentes: " + scopes[i]);
            var compliant = count(m.compliant, scopes[i] + ".compliant");
            var nonCompliant = count(m.nonCompliant, scopes[i] + ".nonCompliant");
            var foreign = count(m.foreign, scopes[i] + ".foreign");
            var found = count(m.found, scopes[i] + ".found");
            if (compliant + nonCompliant !== found)
                throw new Error("Metriques incoherentes: compliant + nonCompliant != found pour " + scopes[i]);
            result.compliant += compliant;
            result.nonCompliant += nonCompliant;
            result.foreign += foreign;
        }
        // Foreign objects are separate from found in these PACKAGE metrics.
        result.total = result.compliant + result.nonCompliant + result.foreign;
        return result;
    }
    function label(name, value, total) {
        var percentage = total ? value * 100 / total : 0;
        return name + " : " + value + " ("
            + percentage.toFixed(1).replace(".", ",") + " %)";
    }
    function renderConformity(chartGuid, packageGuid, scope, options) {
        options = options || {};
        var repository = options.repository || Repository;
        var output = options.output || function (message) {
            repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK CHART] " + message, 0);
        };
        var snapshot = readPackage(packageGuid, repository);
        var values = conformity(snapshot.metrics, scope);
        var titles = {
            ALL: "Conformité des artefacts et diagrammes",
            ARTIFACT: "Conformité des artefacts",
            DIAGRAM: "Conformité des diagrammes"
        };
        var element = options.element || GetElementByGuid(chartGuid);
        if (!element) throw new Error("DynamicChart introuvable: " + chartGuid);
        var chart = element.GetChart();
        chart.SetChartType(2, 1, false, true);
        chart.Title = titles[scope] + " (" + values.total + " objets)";
        var series = chart.CreateSeries("Conformité");
        series.AddDataPoint3(label("Conformes", values.compliant, values.total), values.compliant);
        series.AddDataPoint3(label("Non conformes", values.nonCompliant, values.total), values.nonCompliant);
        series.AddDataPoint3(label("Étrangers", values.foreign, values.total), values.foreign);
        // Labels already carry counts/percentages. No ShowDataLabels/ShowLegend call.
        chart.Redraw();
        output("Graphique=" + element.Name + " | Package=" + snapshot.object.name
            + " | Date=" + snapshot.checkedAt + " | Perimetre=" + scope
            + " | Total=" + values.total + " | Conformes=" + values.compliant
            + " | Non conformes=" + values.nonCompliant + " | Etrangers=" + values.foreign);
        return values;
    }

    var DATA_TAG = "FrameworkBA_CheckChart_Data";
    var actionNames = {
        INIT: "Initialiser", INITIALIZE: "Initialiser", COMPLETE: "Compléter",
        REPAIR: "Exécuter Réparer", MANUAL_COMPLETE: "Compléter manuellement",
        MANUAL_REMOVE: "Supprimer manuellement",
        MANUAL_MOVE: "Déplacer vers le package attendu",
        MAKE_TECHNICAL: "Rendre technique", MAKE_BUSINESS: "Rendre métier",
        MANUAL_REVIEW: "Examiner manuellement"
    };
    var issueGroups = {
        ARTIFACT_NOTE_MISSING: "Note obligatoire absente",
        DIAGRAM_NOTE_MISSING: "Note obligatoire absente",
        ARTIFACT_TECHNICAL_NAME: "Nommage technique",
        DIAGRAM_TECHNICAL_NAME: "Nommage technique",
        MANDATORY_DIAGRAM_ARTIFACT_MISSING: "Artefact attendu absent du diagramme",
        FOREIGN_ARTIFACT: "Artefact d’un autre package",
        ARTIFACT_NOT_IN_METAMODEL: "Artefact hors métamodèle"
    };
    function own(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }
    function aggregate(result, kind) {
        if (!result || Object.prototype.toString.call(result.issues) !== "[object Array]")
            throw new Error("Resultat de collecte invalide.");
        if (kind !== "ACTIONS" && kind !== "ISSUES")
            throw new Error("Type de graphique inconnu: " + kind);
        var groups = {};
        for (var i = 0; i < result.issues.length; i++) {
            var issue = result.issues[i];
            var raw = String(kind === "ACTIONS" ? (issue.action || "") : (issue.code || ""));
            var names = kind === "ACTIONS" ? actionNames : issueGroups;
            var name = own(names, raw) ? names[raw] : raw ||
                (kind === "ACTIONS" ? "Action non renseignée" : "Code non renseigné");
            var groupKey = "$" + name;
            if (!own(groups, groupKey)) groups[groupKey] = { name: name, count: 0 };
            groups[groupKey].count++;
        }
        var items = [];
        for (var k in groups) if (own(groups, k)) items.push(groups[k]);
        items.sort(function (a, b) {
            return b.count - a.count || (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
        });
        return {
            schemaVersion: 1, kind: kind,
            title: kind === "ACTIONS" ? "Actions recommandées" : "Répartition des anomalies",
            packageGuid: String(result.packageGuid || ""),
            checkedAt: String(result.checkedAt || ""),
            missingSnapshots: result.summary ? result.summary.missing || 0 : 0,
            total: result.issues.length, items: items
        };
    }
    function findDataTag(element) {
        element.TaggedValues.Refresh();
        for (var i = 0; i < element.TaggedValues.Count; i++) {
            var tag = element.TaggedValues.GetAt(i);
            if (String(tag.Name) === DATA_TAG) return tag;
        }
        return null;
    }
    function readData(tag) {
        var raw = String(tag.Value || "");
        return JSON.parse(raw === "<memo>" || raw === "" ? String(tag.Notes || "") : raw);
    }
    function validateData(data) {
        if (!data || data.schemaVersion !== 1 ||
            (data.kind !== "ACTIONS" && data.kind !== "ISSUES") ||
            Object.prototype.toString.call(data.items) !== "[object Array]")
            throw new Error("Donnees du graphique invalides.");
        count(data.total, "total");
        var sum = 0;
        for (var i = 0; i < data.items.length; i++) {
            if (typeof data.items[i].name !== "string")
                throw new Error("Libelle de graphique invalide.");
            sum += count(data.items[i].count, "items.count");
        }
        if (sum !== data.total) throw new Error("Total de graphique incoherent.");
    }
    function saveAggregate(chartGuid, result, kind, options) {
        options = options || {};
        var repository = options.repository || Repository;
        var output = options.output || function (message) {
            repository.WriteOutput("ETNIC_FrameworkBA", "[CHECK CHART] " + message, 0);
        };
        var data = aggregate(result, kind);
        var element = repository.GetElementByGuid(chartGuid);
        if (!element) throw new Error("Graphique introuvable: " + chartGuid);
        if (String(element.Stereotype) !== "SSDynamicChart")
            throw new Error("L’element cible n’est pas un DynamicChart: " + element.Name);
        var tag = findDataTag(element);
        var json = JSON.stringify(data);
        var changed = true;
        if (tag) {
            try { changed = JSON.stringify(readData(tag)) !== json; } catch (ignore) {}
        }
        if (changed) {
            if (!tag) tag = element.TaggedValues.AddNew(DATA_TAG, "<memo>");
            tag.Value = "<memo>";
            tag.Notes = json;
            if (!tag.Update()) throw new Error("Echec sauvegarde des donnees du graphique.");
            var reloaded = repository.GetElementByGuid(chartGuid);
            var persisted = findDataTag(reloaded);
            if (!persisted || JSON.stringify(readData(persisted)) !== json)
                throw new Error("Donnees du graphique non persistées.");
            if (options.refresh !== false)
                repository.AdviseElementChange(element.ElementID);
        }
        output("Graphique=" + element.Name + " | Type=" + kind
            + " | Total=" + data.total + " | Groupes=" + data.items.length
            + " | Date=" + data.checkedAt + " | Modifie=" + changed);
        return { changed: changed, data: data };
    }
    function renderActions(chartGuid, result, options) {
        return saveAggregate(chartGuid, result, "ACTIONS", options);
    }
    function renderIssues(chartGuid, result, options) {
        return saveAggregate(chartGuid, result, "ISSUES", options);
    }
    // Called by the chart's own ConstructChart: no second CHECK collection.
    function renderStored(chartGuid, options) {
        options = options || {};
        var element = options.element || GetElementByGuid(chartGuid);
        if (!element) throw new Error("DynamicChart introuvable.");
        var tag = findDataTag(element);
        var chart = element.GetChart();
        chart.SetChartType(9, 1, false, true);
        if (!tag) {
            chart.Title = "CHECK — Actualiser les résultats";
            chart.Redraw();
            return null;
        }
        var data = readData(tag);
        validateData(data);
        chart.Title = data.title + " (" + data.total + ")"
            + (data.missingSnapshots > 0 ? " — Collecte incomplète" : "");
        var series = chart.CreateSeries(
            data.kind === "ACTIONS" ? "Nombre de recommandations" : "Nombre d’anomalies"
        );
        for (var i = 0; i < data.items.length; i++)
            series.AddDataPoint3(label(data.items[i].name, data.items[i].count, data.total),
                data.items[i].count);
        chart.Redraw();
        return data;
    }

    return { renderConformity: renderConformity, conformity: conformity,
        renderActions: renderActions, renderIssues: renderIssues,
        renderStored: renderStored, aggregate: aggregate };
})();
