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
    return { renderConformity: renderConformity, conformity: conformity };
})();
