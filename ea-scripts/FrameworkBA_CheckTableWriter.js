/**
 * EA JavaScript library: ETNIC_FrameworkBA.FrameworkBA_CheckTableWriter.
 * Writes the data memo and synchronizes only dataFormat grid.rows.
 * Preserves styles, columns and layout; never modifies colors or ElementGrid.
 */
var FrameworkBA_CheckTableWriter = (function () {
    var busy = false;
    var typeLabels = { ARTIFACT: "Artefact", DIAGRAM: "Diagramme", PACKAGE: "Package" };
    var actionLabels = {
        INIT: "Initialiser", INITIALIZE: "Initialiser",
        COMPLETE: "Compléter", REPAIR: "Exécuter Réparer",
        MANUAL_COMPLETE: "Compléter manuellement",
        MANUAL_REMOVE: "Examiner puis supprimer manuellement",
        MANUAL_MOVE: "Déplacer vers le package attendu",
        MAKE_TECHNICAL: "Rendre technique",
        MAKE_BUSINESS: "Rendre métier",
        MANUAL_REVIEW: "Examiner manuellement"
    };
    var issueLabels = {
        ARTIFACT_TECHNICAL_NAME: "Le nom de l’artefact utilise une convention technique.",
        DIAGRAM_TECHNICAL_NAME: "Le nom du diagramme utilise une convention technique."
    };
    function isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }
    function escapeXml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    }
    function decodeXml(value) {
        return value.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi,
            function (match, entity) {
                var named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
                if (entity.charAt(0) !== "#") return named[entity] || match;
                var number = entity.charAt(1).toLowerCase() === "x"
                    ? parseInt(entity.substring(2), 16) : parseInt(entity.substring(1), 10);
                if (number <= 65535) return String.fromCharCode(number);
                number -= 65536;
                return String.fromCharCode(55296 + (number >> 10), 56320 + (number & 1023));
            });
    }
    // This compares the simple CustomTable row/column payload, not XML whitespace.
    function readRows(xml) {
        if (!/<customtable\b/i.test(xml) || !/<table\b/i.test(xml)) return null;
        var rows = [], rowPattern = /<row\b[^>]*>([\s\S]*?)<\/row\s*>/gi, row;
        while ((row = rowPattern.exec(xml)) !== null) {
            var cells = [], columnPattern = /<column\b[^>]*\/>|<column\b[^>]*>([\s\S]*?)<\/column\s*>/gi, cell;
            while ((cell = columnPattern.exec(row[1])) !== null) {
                var text = cell[1] || "";
                cells.push(/^<!\[CDATA\[[\s\S]*\]\]>$/.test(text)
                    ? text.substring(9, text.length - 3) : decodeXml(text));
            }
            rows.push(cells);
        }
        return rows;
    }
    function sameRows(a, b) {
        if (!a || !b || a.length !== b.length) return false;
        for (var r = 0; r < a.length; r++) {
            if (a[r].length !== b[r].length) return false;
            for (var c = 0; c < a[r].length; c++)
                if (a[r][c] !== b[r][c]) return false;
        }
        return true;
    }
    function findTag(element, name) {
        element.TaggedValues.Refresh();
        for (var i = 0; i < element.TaggedValues.Count; i++) {
            var tag = element.TaggedValues.GetAt(i);
            if (String(tag.Name) === name) return tag;
        }
        return null;
    }
    function tagText(tag) {
        var value = String(tag.Value || "");
        return value === "<memo>" || value === "" ? String(tag.Notes || "") : value;
    }
    function buildRows(result) {
        if (!result || !isArray(result.issues))
            throw new Error("Resultat de collecte invalide.");
        var rows = [["Type", "Objet", "Gravité", "Anomalie", "Action recommandée"]];
        for (var i = 0; i < result.issues.length; i++) {
            var issue = result.issues[i];
            var message = issue.message;
            if (!message || message === issue.code)
                message = issueLabels[issue.code] || issue.code || "Détail indisponible";
            rows.push([
                typeLabels[issue.objectType] || issue.objectType,
                String(issue.objectName || ""), String(issue.severity || ""),
                String(message), actionLabels[issue.action] || String(issue.action || "")
            ]);
        }
        // Information rows are separate from CHECK issues and have no invented severity.
        var unplanned = result.objectsWithoutSnapshot || [];
        for (var n = 0; n < unplanned.length; n++) {
            rows.push(["Diagramme", String(unplanned[n].objectName || ""),
                "—", "Snapshot individuel non prévu par le framework.",
                "Consulter le résultat du CHECK du package"]);
        }
        if (result.summary && result.summary.missing > 0)
            rows.push(["Collecte", "", "—", result.summary.missing
                + " snapshot(s) attendu(s) manquant(s).", "Consulter le journal CHECK COLLECT"]);
        if (rows.length === 1)
            rows.push(["Collecte", "", "—", "Aucune anomalie détaillée collectée.", ""]);
        return rows;
    }
    function buildXml(rows) {
        var xml = '<?xml version="1.0" standalone="no" ?>\n<customtable>\n\t<table>\n';
        for (var r = 0; r < rows.length; r++) {
            xml += "\t\t<row>\n";
            for (var c = 0; c < rows[r].length; c++)
                xml += "\t\t\t<column>" + escapeXml(rows[r][c]) + "</column>\n";
            xml += "\t\t</row>\n";
        }
        return xml + "\t</table>\n</customtable>";
    }
    function write(tableGuid, result, options) {
        options = options || {};
        var repository = options.repository || Repository;
        var output = options.output || function (message) {
            Session.Output("[CHECK TABLE] " + message);
        };
        if (busy) {
            output("Appel ignore pendant une actualisation en cours.");
            return { skipped: true };
        }
        busy = true;
        try {
            var table = repository.GetElementByGuid(tableGuid);
            if (!table) throw new Error("CustomTable introuvable.");
            var data = findTag(table, "data");
            var format = findTag(table, "dataFormat");
            if (!data || !format)
                throw new Error("Tags data/dataFormat absents sur " + table.Name);
            var rows = buildRows(result);
            var originalFormat = tagText(format);
            var grids = originalFormat.match(/<grid\b[^>]*>/gi);
            if (!grids || grids.length !== 1)
                throw new Error("Une seule grille est requise; aucune ecriture effectuee.");
            var grid = grids[0];
            var rowCount = /\brows\s*=\s*["'](\d+)["']/i.exec(grid);
            var columnCount = /\bcolumns\s*=\s*["'](\d+)["']/i.exec(grid);
            if (!rowCount || !columnCount)
                throw new Error("Dimensions de la grille illisibles; aucune ecriture effectuee.");
            if (Number(columnCount[1]) !== 5)
                throw new Error("Configurer 5 colonnes manuellement; aucune ecriture effectuee.");

            // Change only the rows attribute, preserving all other XML bytes.
            var newGrid = grid.replace(/(\brows\s*=\s*["'])\d+(["'])/i,
                function (match, prefix, suffix) { return prefix + rows.length + suffix; });
            var newFormat = originalFormat.replace(grid, newGrid);
            var dataChanged = !sameRows(rows, readRows(tagText(data)));
            var formatChanged = newFormat !== originalFormat;
            var changed = dataChanged || formatChanged;
            output("Grille | Avant=" + rowCount[1] + " | Apres=" + rows.length
                + " | Colonnes=5");
            if (dataChanged) {
                data.Value = "<memo>";
                data.Notes = buildXml(rows);
                var updated = data.Update();
                output("Tag.Update=" + updated);
                if (!updated) throw new Error("Echec sauvegarde du tag data.");
            }
            if (formatChanged) {
                format.Value = "<memo>";
                format.Notes = newFormat;
                var formatUpdated = format.Update();
                output("DataFormat.Update=" + formatUpdated);
                if (!formatUpdated)
                    throw new Error("Echec sauvegarde de dataFormat; verifier la grille avant affichage.");
            }
            var reloaded = repository.GetElementByGuid(tableGuid);
            var persisted = findTag(reloaded, "data");
            var persistedFormat = findTag(reloaded, "dataFormat");
            if (!persisted || !sameRows(rows, readRows(tagText(persisted))))
                throw new Error("Les cellules relues different des cellules attendues.");
            var verifiedGrid = persistedFormat && /<grid\b[^>]*>/i.exec(tagText(persistedFormat));
            var verifiedRows = verifiedGrid && /\brows\s*=\s*["'](\d+)["']/i.exec(verifiedGrid[0]);
            var verifiedColumns = verifiedGrid && /\bcolumns\s*=\s*["'](\d+)["']/i.exec(verifiedGrid[0]);
            if (!verifiedRows || Number(verifiedRows[1]) !== rows.length
                || !verifiedColumns || Number(verifiedColumns[1]) !== 5)
                throw new Error("Les dimensions relues different des dimensions attendues.");
            output("Table=" + table.Name + " | Lignes=" + rows.length
                + " | Anomalies=" + result.issues.length + " | Cellules identiques=true"
                + " | Grille verifiee=true | Modifie=" + changed);
            // No refresh when unchanged: prevents repeated writes on diagram reload.
            if (changed && options.refresh !== false)
                repository.AdviseElementChange(table.ElementID);
            return { changed: changed, dataChanged: dataChanged, formatChanged: formatChanged,
                rows: rows.length, issues: result.issues.length };
        } finally {
            busy = false;
        }
    }
    function findOnDiagram(diagram, tableName, repository) {
        repository = repository || Repository;
        if (!diagram) throw new Error("Diagramme courant absent.");
        var found = null;
        for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
            var object = diagram.DiagramObjects.GetAt(i);
            var element = repository.GetElementByID(object.ElementID);
            if (element && String(element.Name) === tableName) {
                if (found) throw new Error("Plusieurs tables portent le nom " + tableName);
                found = element;
            }
        }
        if (!found) throw new Error("Table absente du diagramme: " + tableName);
        return found;
    }
    return { write: write, findOnDiagram: findOnDiagram, buildRows: buildRows };
})();
