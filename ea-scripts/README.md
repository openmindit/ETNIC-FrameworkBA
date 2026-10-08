# CHECK snapshot collector for EA Scripting

This directory contains standalone EA JavaScript scripts, separate from the Scripted Add-In modules in src.

## Installation in Enterprise Architect

1. Open the Scripting window.
2. In the normal script group ETNIC_FrameworkBA, create a **JavaScript** script named FrameworkBA_CheckSnapshotCollector.
3. Paste the entire contents of FrameworkBA_CheckSnapshotCollector.js and save.
4. Paste FrameworkBA_CheckSnapshotCollector.scriptlet.js into the existing Scriptlet.
5. Replace the package and root GUIDs for another analysis folder.

The library and Scriptlet must use JavaScript. The library has no automatic entry point.
Git updates do not automatically update scripts stored in the EA model.

## API

FrameworkBA_CheckSnapshotCollector.collect(packageGuid, rootGuid, options)

Returns packageGuid, checkedAt, snapshots, issues, summary, diagnostics.
options can override repository, output(message), and tagName for testing.

The collector reads the target package snapshot, selects its content.artifacts and
content.diagrams (including foreign objects listed there), and searches snapshot
carriers within the analysis root, including technical diagram elements.
ROOT snapshots use a different schema and are ignored.
Snapshots are matched by normalized object GUID, not by carrier name.
Results sort by object type (artifact, diagram, package), object name/identity,
then severity (ERROR before WARNING).
Missing or malformed snapshots are reported; a zero issue count with missing
snapshots is not evidence that the whole package is conformant.

This stage only reads and logs. It does not update CustomTable data, dataFormat,
colors, or diagram display. Keep UpdateCheckColors disabled.

## Example

The included Scriptlet uses the Exigences package and analysis root GUIDs from
the test model. Its content lists 3 artifacts and 5 diagrams, so 9 snapshots
are expected including the package.

## Diagrams without a planned snapshot

options.diagramGuidsWithoutSnapshot is an explicit array of confirmed diagram GUIDs
for which the framework does not plan an individual snapshot. The example declares
TEST_FOREIGN_DIAGRAM from the test model. Adapt this list for another package.

Do not infer identities from metrics.diagrams.foreign: it is only an aggregate count.
A declaration must reference content.diagrams and the diagram must still exist.
Other missing snapshots remain missing. If a declared diagram actually has a snapshot,
it is collected normally.

summary.referenced counts all referenced objects; summary.notPlanned counts existing
declared diagrams without snapshots; summary.expected/found/missing count planned
snapshots. The result also exposes the original package metrics and
objectsWithoutSnapshot. No CHECK issue or severity is manufactured for these objects.
Complete snapshot retrieval does not imply detailed foreign-diagram issues are available.

## CustomTable writer

Install FrameworkBA_CheckTableWriter.js as a JavaScript script named
FrameworkBA_CheckTableWriter in ETNIC_FrameworkBA.
Use FrameworkBA_CheckTable.scriptlet.js on the diagram containing the table.
The example finds a single element named "_CHECK — Détail des résultats" on
the Scriptlet's theDiagram. Change the name to match your model exactly.

The table must have 5 columns. grid.rows is synchronized automatically with
header + collected issues + information rows, including shrink and growth.
The writer replaces only the rows attribute of the existing grid, preserving
all remaining dataFormat bytes (styles and layout). No color generation is used.
An absent/ambiguous grid or a column count other than 5 aborts before any write.

The writer preserves collected issue order, translates known actions and supplies
readable labels for technical-name issues without a message. Original object names
are retained. Information rows have no CHECK severity and do not add to issue counts.

The existing data and dataFormat memo tags are saved only when changed. Verification compares decoded row/cell
values after reloading, so XML whitespace/entity normalization is tolerated.
AdviseElementChange is called only after changed data has been verified.
Grid dimensions are also verified after reloading. Identical repeat runs skip writes and refresh. options.refresh=false disables refresh.
No colors, ElementGrid mutations, or automatic entry point are included.

Keep diagrams without planned snapshots explicitly declared in this test;
aggregate foreign metrics do not identify individual diagrams.

## EA validation for automatic row count

Run the unchanged Scriptlet after updating FrameworkBA_CheckTableWriter.
With 14 issues and one information row, expect grid.rows=16.
Check the footer and paging visually; tag persistence alone does not verify rendering.
Styles and the opaque layout block are preserved rather than regenerated.
The earlier UpdateCheckColors crash is not reproduced by mock tests; this minimal
row-only update still requires validation in the EA test model.

## Actions and anomalies: one collection shared with the table

Update FrameworkBA_CheckChartWriter in the EA JavaScript group ETNIC_FrameworkBA.
In both DynamicChart elements replace the simulated code with
FrameworkBA_CheckIssues.chart.js. Keep the conformity chart scripts unchanged.

The integrated FrameworkBA_CheckDashboard.scriptlet.js remains experimental: EA closed during a previous test. Keep chart preparation in a normal EA script until integration is validated. The table-only Scriptlet remains the validated path.

FrameworkBA_CheckDashboard.scriptlet.js is the integration candidate for the table and these two charts.
Its target element names are "Actions recommandées" and "Répartition des anomalies".
They must match the EA element names exactly, not only the displayed chart titles.
The already-existing output tab ETNIC_FrameworkBA is reused and never cleared.

The Scriptlet collects once. The table uses result.issues and each chart saves only
its compact grouped counts to its FrameworkBA_CheckChart_Data memo tag. Its own
ConstructChart reads that tag, so chart loading does not repeat the collection or
restore simulated values. The new memo tag is created when absent.
No full snapshot duplication and no CustomTable XML parsing is involved.

Each issue contributes once, including WARNING. Rows without planned snapshots
are informational and excluded. Actions group by translated action; anomalies use
explicit code mappings. Unknown codes/actions are retained under their raw code.
The charts show descending horizontal bars with count and percent in each label.
The denominator is the collected issue count, not a count of unique objects/actions.
An incomplete collection is marked in the chart title.

All target payloads are saved before notifications. Only changed targets are refreshed.
If EA does not immediately reconstruct a chart after AdviseElementChange, reopen the
diagram to run ConstructChart from the saved data.

## Shared stored-data renderer

Install the entire updated FrameworkBA_CheckChartWriter.js in EA; do not append a
second definition of renderStored. FrameworkBA_CheckIssues.chart.js is the common
ConstructChart wrapper and logs errors to the existing ETNIC_FrameworkBA tab.

Each chart owns its FrameworkBA_CheckChart_Data memo tag:
schemaVersion=1, kind (ACTIONS/ISSUES/CONFORMITY/CLASSIFICATION), optional scope,
chartType (BAR/PIE), title, packageGuid, checkedAt, total, items [{name,count}].
Counts must be nonnegative integers and their sum must equal total.
Old ACTIONS/ISSUES tags without chartType remain compatible and render as bars.
CONFORMITY/CLASSIFICATION default to PIE. An explicit unknown chartType is rejected.
Validation occurs before GetChart; rendering never writes tags or collects snapshots.

Existing renderConformity remains available. Keep the working conformity chart
scripts until their stored payload preparation has been implemented.
Classification payload preparation is also a subsequent step.
The normal-script write and ACTIONS rendering were validated by the user in EA.
The generalized renderer requires an EA test; Node mocks cannot validate EA
loading order or the earlier application crash.

## Refresh check result: all nine stored chart payloads

Install the complete FrameworkBA_CheckChartWriter library, then replace the Notes
of the existing Refresh check result Scriptlet with FrameworkBA_CheckDashboard.scriptlet.js.
Use FrameworkBA_CheckIssues.chart.js as ConstructChart for all nine charts.
The nine element names in the dashboard configuration must match exactly.
Target resolution and all payload calculations finish before writing begins.
Writes are sequential, not transactional; an EA persistence failure can leave earlier
targets updated. Re-execution completes unchanged targets idempotently.

One collector result feeds the table, three conformity pies, actions/anomalies bars,
and four classification pies. Missing tags are created as memo tags. Chart writes
use refresh=false; only the already-tested table notification remains. There are
no GetChart/Redraw calls or chart refresh notifications in the Scriptlet.
Opening order is still an EA runtime validation point: if ConstructChart ran before
preparation, reopen the diagram after the tags exist. No redraw loop is introduced.

Classification covers exactly the target package plus content artifacts/diagrams;
it does not recursively classify the entire analysis folder or dashboard elements.
Technical names use the framework "_" prefix (snapshot technicalName when present).
Technical has priority over metamodel membership. Recognized objects are identified
by framework TECHNICAL_NAMING rules or package ANALYSIS_ELEMENT_REFERENCE.actual.found.
NOT_IN_METAMODEL issues identify foreign objects. Unknown membership aborts rather
than guessing. Diagrams without snapshots additionally require explicit confirmed
foreign GUIDs and an aggregate consistency check. The included GUID is the confirmed
TEST_FOREIGN_DIAGRAM, not a general inference from a foreign count.
Classification is independent of conformity.

Node mocks validate the current nine-object fixture (4 technical, 3 business,
2 outside), scope totals, foreign confirmation, tag creation and idempotence.
These tests do not establish EA Scriptlet execution order or application stability.
