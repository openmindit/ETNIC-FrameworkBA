/**
 * Common PACKAGE and ANALYSIS CHECK dashboard. Configuration belongs to diagram's package.
 * No chart rendering, tag creation or diagram reload in this library.
 */
var FrameworkBA_CheckDashboard = (function () {
    function tagValue(element, name, required) {
        element.TaggedValues.Refresh();
        var found = null;
        for (var i = 0; i < element.TaggedValues.Count; i++) {
            var tag = element.TaggedValues.GetAt(i);
            if (String(tag.Name) !== name) continue;
            if (found !== null) throw new Error("Tag duplique: " + name);
            found = String(tag.Value === "<memo>" ? tag.Notes : tag.Value || "");
        }
        if (required && (found === null || !found.replace(/\s/g, "")))
            throw new Error("Configuration absente: " + name);
        return found;
    }
    function guidList(element, name) {
        var raw = tagValue(element, name, false);
        if (!raw) return [];
        var list = JSON.parse(raw);
        if (Object.prototype.toString.call(list) !== "[object Array]")
            throw new Error(name + " doit contenir un tableau JSON de GUID.");
        for (var i = 0; i < list.length; i++)
            if (typeof list[i] !== "string" || !/^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i.test(list[i]))
                throw new Error("GUID invalide dans " + name);
        return list;
    }
    function readConfiguration(diagram, repository) {
        if (!diagram) throw new Error("Diagramme CHECK absent.");
        var pkg = repository.GetPackageByID(diagram.PackageID);
        if (!pkg) throw new Error("Dossier du diagramme introuvable.");
        var sourceElement = pkg.Element, sourceTags = sourceElement.TaggedValues, tags = [];
        sourceTags.Refresh();
        var tagCount = sourceTags.Count;
        for (var ti = 0; ti < tagCount; ti++) {
            var sourceTag = sourceTags.GetAt(ti);
            tags.push({ Name: String(sourceTag.Name), Value: String(sourceTag.Value || ""), Notes: String(sourceTag.Notes || "") });
        }
        var element = { TaggedValues: { Count: tags.length, Refresh: function () {}, GetAt: function (i) { return tags[i]; } } };
        var config = {
            targetGuid: tagValue(element, "FrameworkBA_Check_TargetGuid", true),
            rootGuid: tagValue(element, "FrameworkBA_Check_RootGuid", true),
            scope: tagValue(element, "FrameworkBA_Check_Scope", true),
            version: tagValue(element, "FrameworkBA_Check_TemplateVersion", true),
            withoutSnapshot: guidList(element, "FrameworkBA_Check_DiagramGuidsWithoutSnapshot"),
            foreignDiagrams: guidList(element, "FrameworkBA_Check_ForeignDiagramGuids")
        };
        if (config.scope !== "PACKAGE" && config.scope !== "ANALYSIS") throw new Error("Perimetre non implemente: " + config.scope);
        if (config.scope === "ANALYSIS" && String(config.targetGuid).replace(/[{}]/g, "").toUpperCase()
            !== String(config.rootGuid).replace(/[{}]/g, "").toUpperCase())
            throw new Error("La cible ANALYSIS doit etre la racine.");
        if (config.version !== "1") throw new Error("Version prototype non supportee: " + config.version);
        if (!repository.GetPackageByGuid(config.targetGuid) || !repository.GetPackageByGuid(config.rootGuid))
            throw new Error("Package cible ou racine introuvable.");
        return config;
    }

    function analysisView(collected) {
        if (collected.missing > 0 || !collected.summaryMatchesRoot)
            throw new Error("Synthese Analyse incomplete ou differente du CHECK ROOT; aucune ecriture.");
        var metrics = { artifacts: { found: 0, compliant: 0, nonCompliant: 0, foreign: 0 },
            diagrams: { found: 0, compliant: 0, nonCompliant: 0, foreign: 0 } };
        var s = { referenced: 0, found: 0, expected: 0, missing: collected.missing,
            notPlanned: collected.notPlanned, errors: collected.summary.errors, warnings: collected.summary.warnings };
        for (var p = 0; p < collected.packages.length; p++) {
            var part = collected.packages[p];
            s.referenced += part.summary.referenced;
            s.found += part.summary.found;
            s.expected += part.summary.expected;
            for (var type in metrics) if (Object.prototype.hasOwnProperty.call(metrics, type)) {
                if (!part.metrics[type]) throw new Error("Metriques absentes: " + type + " | Package=" + part.packageGuid);
                for (var field in metrics[type]) if (Object.prototype.hasOwnProperty.call(metrics[type], field)) {
                    var value = part.metrics[type][field];
                    if (typeof value !== "number" || !isFinite(value) || value < 0 || Math.floor(value) !== value)
                        throw new Error("Metrique invalide: " + type + "." + field);
                    metrics[type][field] += value;
                }
            }
        }
        function normalize(issue) {
            if (issue.rawIssue) return issue;
            return { objectGuid: issue.objectGuid || issue.diagramGuid || "",
                objectType: issue.objectType || "", objectName: issue.objectName || issue.affectedObjectName || issue.uniquenessName || "",
                code: issue.code || issue.rule || "", severity: issue.severity || "",
                message: issue.message || issue.description || issue.code || "",
                action: issue.action || "", rawIssue: issue };
        }
        var issues = [], detail = [], foreignPackages = [];
        for (var fp = 0; fp < (collected.rootLocalIssues || []).length; fp++) {
            var rootIssue = collected.rootLocalIssues[fp];
            if (rootIssue.code === "ROOT_FOREIGN_PACKAGE" && rootIssue.affectedObjectGuid)
                foreignPackages.push(rootIssue.affectedObjectGuid);
        }
        for (var i = 0; i < collected.issues.length; i++) issues.push(normalize(collected.issues[i]));
        for (var j = 0; j < collected.detailIssues.length; j++) detail.push(normalize(collected.detailIssues[j]));
        return { packageGuid: collected.rootGuid, checkedAt: collected.checkedAt, scope: "ANALYSIS",
            title: "Analyse - " + collected.rootName, packages: collected.packages,
            snapshots: collected.snapshots, metrics: metrics, summary: s, issues: issues,
            foreignPackageGuids: foreignPackages, detailIssues: detail, globalCount: detail.length,
            objectsWithoutSnapshot: [] };
    }

    function summary(result, writer) {
        var s = result.summary, c = writer.conformity(result.metrics, "ALL");
        var packageName = result.title || "";
        for (var i = 0; i < result.snapshots.length; i++) {
            var snap = result.snapshots[i];
            if (snap.scope === "PACKAGE" && String(snap.object.guid).replace(/[{}]/g, "").toUpperCase() === String(result.packageGuid).replace(/[{}]/g, "").toUpperCase()) {
                packageName = snap.object.name;
                break;
            }
        }
        function value(n) { return n + " • " + (c.total ? n * 100 / c.total : 0).toFixed(1).replace(".", ",") + " %"; }
        return [
            ["_Summary_Title", "SYNTHÈSE CHECK — " + packageName],
            ["_Summary_Check_Date", "Dernier CHECK : " + result.checkedAt],
            ["_Summary_Error_Count", String(s.errors)],
            ["_Summary_Warning_Count", String(s.warnings)],
            ["_Summary_Object_Count", String(s.referenced)],
            ["_Summary_Snapshot_Coverage", s.found + "/" + s.expected],
            ["_Summary_Snapshot_NotPlanned_Count", String(s.notPlanned)],
            ["_Summary_Conformity_Title", "Conformité des artefacts et diagrammes — " + c.total + " objets"],
            ["_Summary_Compliant_Value", value(c.compliant)],
            ["_Summary_NonCompliant_Value", value(c.nonCompliant)],
            ["_Summary_Foreign_Value", value(c.foreign)]
        ];
    }

    function xmlText(value) {
        var parts = String(value).split(/(<!\[CDATA\[[\s\S]*?\]\]>)/g), out = "";
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].indexOf("<![CDATA[") === 0) out += parts[i].slice(9, -3);
            else out += parts[i].replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, function (_, entity) {
                var names = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
                if (entity.charAt(0) !== "#") return names[entity.toLowerCase()];
                var n = entity.charAt(1).toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
                if (n <= 65535) return String.fromCharCode(n);
                n -= 65536;
                return String.fromCharCode(55296 + (n >> 10), 56320 + (n & 1023));
            });
        }
        return out;
    }
    function sqlField(row, name, required) {
        var match = new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i").exec(row);
        if (match) return xmlText(match[1]);
        if (required) throw new Error("Colonne SQL CHECK absente: " + name);
        return "";
    }
    function indexDiagramSql(diagram, repository) {
        var diagramId = Number(diagram.DiagramID);
        if (!isFinite(diagramId) || diagramId <= 0 || Math.floor(diagramId) !== diagramId)
            throw new Error("Identifiant diagramme invalide.");
        var xml = String(repository.SQLQuery("SELECT o.Object_ID AS TargetId, o.Name AS TargetName FROM t_diagramobjects d INNER JOIN t_object o ON o.Object_ID = d.Object_ID WHERE d.Diagram_ID = " + diagramId));
        if (!/<EADATA(?:\s|>)/i.test(xml) || !/<Dataset_0(?:\s|>|\/)/i.test(xml))
            throw new Error("Reponse SQL invalide pour les cibles du dashboard.");
        var rows = /<Row(?:\s[^>]*)?>([\s\S]*?)<\/Row>/gi, row, byName = {}, seen = {}, cache = {};
        var index = { reads: 0, mode: "SQL", find: function (name) {
            var targets = byName["$" + name];
            if (!targets || !targets.length) throw new Error("Cible absente du diagramme: " + name);
            if (targets.length !== 1) throw new Error("Plusieurs cibles portent le nom " + name);
            var id = targets[0];
            if (!cache[id]) {
                var element = repository.GetElementByID(id);
                index.reads++;
                if (!element || String(element.Name) !== name) throw new Error("Cible dashboard modifiee pendant la preparation: " + name);
                cache[id] = element;
            }
            return cache[id];
        } };
        while ((row = rows.exec(xml)) !== null) {
            var id = Number(sqlField(row[1], "TargetId", true));
            if (!isFinite(id) || id <= 0 || Math.floor(id) !== id) throw new Error("Identifiant cible SQL invalide.");
            if (seen[id]) continue;
            seen[id] = true;
            var name = "$" + sqlField(row[1], "TargetName", false);
            if (!byName[name]) byName[name] = [];
            byName[name].push(id);
        }
        return index;
    }

    function indexDiagram(diagram, repository) {
        if (typeof repository.SQLQuery !== "undefined") return indexDiagramSql(diagram, repository);
        var byName = {}, seen = {}, reads = 0;
        var objects = diagram.DiagramObjects;
        var total = objects.Count;
        for (var i = 0; i < total; i++) {
            var id = objects.GetAt(i).ElementID;
            if (seen["$" + id]) continue;
            seen["$" + id] = true;
            var element = repository.GetElementByID(id);
            reads++;
            if (!element) continue;
            var name = "$" + String(element.Name);
            if (!Object.prototype.hasOwnProperty.call(byName, name)) byName[name] = [];
            byName[name].push(element);
        }
        return { reads: reads, find: function (name) {
            var targets = byName["$" + name];
            if (!targets || !targets.length) throw new Error("Cible absente du diagramme: " + name);
            if (targets.length !== 1) throw new Error("Plusieurs cibles portent le nom " + name);
            return targets[0];
        } };
    }

    function refresh(diagram, options) {
        options = options || {};
        var started = new Date().getTime();
        var repo = options.repository || Repository;
        var log = options.output || function (m) { repo.WriteOutput("ETNIC_FrameworkBA", "[CHECK DASHBOARD] " + m, 0); };
        var config = readConfiguration(diagram, repo);
        log("Debut | Cible=" + config.targetGuid + " | Perimetre=" + config.scope);
        var result = config.scope === "ANALYSIS" ? analysisView(FrameworkBA_CheckAnalysisCollector.collect(config.rootGuid, { repository: repo, output: log })) : FrameworkBA_CheckSnapshotCollector.collect(config.targetGuid, config.rootGuid, {
            repository: repo, diagramGuidsWithoutSnapshot: config.withoutSnapshot,
            output: function (m) { repo.WriteOutput("ETNIC_FrameworkBA", "[CHECK COLLECT] " + m, 0); }
        });
        log("Temps | Collecte ms=" + (new Date().getTime() - started));
        var writer = FrameworkBA_CheckChartWriter;
        var classifyOptions = { foreignDiagramGuids: config.foreignDiagrams };
        var definitions = [
            ["_Chart_Conformity_All", writer.prepareConformity(result, "ALL")],
            ["_Chart_Conformity_Artifacts", writer.prepareConformity(result, "ARTIFACT")],
            ["_Chart_Conformity_Diagrams", writer.prepareConformity(result, "DIAGRAM")],
            ["_Chart_Actions", writer.aggregate(result, "ACTIONS")],
            ["_Chart_Issues", writer.aggregate(result, "ISSUES")],
            ["_Chart_Classification_All", writer.prepareClassification(result, "ALL", classifyOptions)],
            ["_Chart_Classification_Packages", writer.prepareClassification(result, "PACKAGE", classifyOptions)],
            ["_Chart_Classification_Artifacts", writer.prepareClassification(result, "ARTIFACT", classifyOptions)],
            ["_Chart_Classification_Diagrams", writer.prepareClassification(result, "DIAGRAM", classifyOptions)]
        ];
        var texts = summary(result, writer);
        // Scope counts come from the target PACKAGE content, including foreign objects.
        var targetSnapshot = null;
        for (var k = 0; k < result.snapshots.length; k++)
            if (result.snapshots[k].scope === "PACKAGE" && String(result.snapshots[k].object.guid).replace(/[{}]/g,"").toUpperCase() === String(result.packageGuid).replace(/[{}]/g,"").toUpperCase())
                targetSnapshot = result.snapshots[k];
        if (config.scope === "ANALYSIS") {
            var artifactTotal = 0, diagramTotal = 0;
            for (var ap = 0; ap < result.packages.length; ap++) {
                for (var ps = 0; ps < result.packages[ap].snapshots.length; ps++) {
                    var packageSnap = result.packages[ap].snapshots[ps];
                    if (packageSnap.scope === "PACKAGE") {
                        artifactTotal += packageSnap.content.artifacts.length;
                        diagramTotal += packageSnap.content.diagrams.length;
                    }
                }
            }
            texts.push(["_Summary_Scope", "Analyse : " + result.packages.length + " packages controles • "
                + artifactTotal + " artefacts • " + diagramTotal + " diagrammes"]);
        } else {
        if (!targetSnapshot || !targetSnapshot.content) throw new Error("Contenu du snapshot cible absent.");
        texts.push(["_Summary_Scope", "Périmètre : 1 package • " + targetSnapshot.content.artifacts.length + " artefacts • " + targetSnapshot.content.diagrams.length + " diagrammes"]);
        }
        var targetsIndex = indexDiagram(diagram, repo);
        function find(name) { return targetsIndex.find(name); }
        var table = find("_Detail_Table"), charts = [], textTargets = [];
        for (var i = 0; i < definitions.length; i++) {
            var chart = find(definitions[i][0]);
            if (String(chart.Stereotype) !== "SSDynamicChart") throw new Error("DynamicChart attendu: " + chart.Name);
            if (tagValue(chart, "FrameworkBA_CheckChart_Data", false) === null)
                throw new Error("Tag FrameworkBA_CheckChart_Data absent sur " + chart.Name + " : initialiser le prototype.");
            charts.push(chart);
        }
        for (var t = 0; t < texts.length; t++) {
            var text = find(texts[t][0]);
            if (String(text.Type) !== "Text" && String(text.Type) !== "Note")
                throw new Error("Text ou Note attendu: " + text.Name);
            textTargets.push(text);
        }
        log("Cibles indexees | Mode=" + (targetsIndex.mode || "COM") + " | Elements lus=" + targetsIndex.reads);
        log("Temps | Collecte et preparation ms=" + (new Date().getTime() - started));
        // All payloads and targets resolved before the first write.
        var tableUpdate = FrameworkBA_CheckTableWriter.write(table.ElementGUID, config.scope === "ANALYSIS" ? { issues: result.detailIssues, summary: { missing: 0 }, emptyMessage: "Aucune anomalie globale interpackages." } : result, { repository: repo, refresh: false, output: log });
        var chartsChanged = 0, textsChanged = 0;
        for (var j = 0; j < charts.length; j++)
            if (writer.saveData(charts[j].ElementGUID, definitions[j][1], { repository: repo, refresh: false, output: log }).changed) chartsChanged++;
        for (var n = 0; n < texts.length; n++) {
            var e = textTargets[n], content = texts[n][1];
            if (String(e.Notes || "") === content) continue;
            e.Notes = content;
            if (!e.Update()) throw new Error("Ecriture du texte impossible: " + e.Name);
            var reread = repo.GetElementByGuid(e.ElementGUID);
            if (!reread || String(reread.Notes) !== content) throw new Error("Texte non persiste: " + e.Name);
            textsChanged++;
        }
        // No element notifications here: EA can re-execute Scriptlets on each one.
        // The NORMAL driver performs one diagram reload after all writes.
        log("Temps | Total ms=" + (new Date().getTime() - started));
        log("Fin | Graphiques prepares=" + charts.length + " | Graphiques modifies=" + chartsChanged + " | Textes modifies=" + textsChanged);
        return { result: result, chartsChanged: chartsChanged, textsChanged: textsChanged };
    }
    return { indexDiagram: indexDiagram, analysisView: analysisView, readConfiguration: readConfiguration, buildSummary: summary, refresh: refresh };
})();


