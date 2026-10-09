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

## One-time normal-script initialization when Scriptlet AddNew returns no tag

The EA test confirmed that missing tag creation fails in the Scriptlet context,
while normal-script tag creation worked for Actions and Issues.
Install FrameworkBA_InitializeCheckDashboard.js as a NORMAL JavaScript script
named FrameworkBA_InitializeCheckDashboard in ETNIC_FrameworkBA.
Activate the CHECK dashboard and run it once. It prepares the real data for all nine
charts using the same libraries, without GetChart/Redraw or refresh notifications.
It creates missing memo tags and verifies persistence. Existing tags are not cleared.
Then execute Refresh check result to test updates of existing tags in the Scriptlet.
The included global conformity element name is now "Conformité", as confirmed by
the user's EA log; the displayed title remains "Conformité des artefacts et diagrammes".
Adapt names and GUIDs consistently in both entry scripts for another model.
Normal initialization of all nine and subsequent Scriptlet updates still require
EA validation. Opening-order limitations remain.

## Prototype package dashboard (current procedure)

Install library `FrameworkBA_CheckDashboard.js` in EA group `ETNIC_FrameworkBA`, alongside Collector, TableWriter and ChartWriter. Replace the code of `_Check_Refresh` with `FrameworkBA_CheckDashboard.scriptlet.js`.

The whole prototype package is copied. The diagram belongs to its dashboard package. On that package's Element configure:
- `FrameworkBA_Check_TargetGuid`: checked analysis package GUID.
- `FrameworkBA_Check_RootGuid`: analysis folder GUID used for snapshot lookup.
- `FrameworkBA_Check_Scope`: `PACKAGE` (ROOT is explicitly unsupported).
- `FrameworkBA_Check_TemplateVersion`: `1`.
- Optional `FrameworkBA_Check_DiagramGuidsWithoutSnapshot`: JSON array of diagrams for which individual snapshots are not planned.
- Optional `FrameworkBA_Check_ForeignDiagramGuids`: JSON array of diagrams explicitly confirmed outside the metamodel.

The two lists have different meanings. For the Exigences test, both contain `["{F3504F31-1749-4640-8C4B-2EFC294168B7}"]`. Empty/absent lists mean no declarations. Lists can be memo tags. Prototype target/root remain empty; set them in each instance.

Elements referenced on the diagram must have these unique technical names:
`_Detail_Table`, `_Chart_Conformity_All`, `_Chart_Conformity_Artifacts`, `_Chart_Conformity_Diagrams`, `_Chart_Actions`, `_Chart_Issues`, `_Chart_Classification_All`, `_Chart_Classification_Packages`, `_Chart_Classification_Artifacts`, `_Chart_Classification_Diagrams`.

Dynamic Text/Note elements:
`_Summary_Title`, `_Summary_Check_Date`, `_Summary_Error_Count`, `_Summary_Warning_Count`, `_Summary_Object_Count`, `_Summary_Snapshot_Coverage`, `_Summary_Snapshot_NotPlanned_Count`, `_Summary_Conformity_Title`, `_Summary_Compliant_Value`, `_Summary_NonCompliant_Value`, `_Summary_Foreign_Value`, `_Summary_Scope`.

Fixed labels retain their existing content and style. Text updates replace Notes with plain content; embedded HTML formatting is not preserved. Diagram font, positioning and colors are not modified.

All nine charts require an existing `FrameworkBA_CheckChart_Data` tag in the prototype. The table requires its existing data/dataFormat tags. All payloads and targets are resolved before writes; writes are sequential, not transactional. Failed persistence can leave a partial update; rerun after correction. Tag creation remains backlog issue #7.

The Scriptlet prepares data and text only. Each chart keeps its ConstructChart wrapper calling `FrameworkBA_CheckChartWriter.renderStored(guid)`. No chart rendering, chart notifications, automatic diagram reopening or reload occurs in the Scriptlet. If EA already rendered before preparation, reopen the diagram once to show the new values.

Validation: JavaScript syntax and mocked PACKAGE configuration/summary calculations; live EA execution still needs user verification. Legacy scripts below/above containing Exigences GUIDs are diagnostic fixtures, not the common runtime.

## Automatic foreign-diagram declarations (supersedes manual lists)

A new PACKAGE CHECK writes `content.diagramsWithoutSnapshot`: descriptors containing `guid`, `name`, `reason: "DIAGRAM_NOT_IN_METAMODEL"` and the object's CHECK `issues`. Foreign diagrams have no generated DGC in the current framework. No DGC is created by this change.

The collector validates each descriptor against `content.diagrams`. When the field exists it is authoritative, even when empty; old manual exclusion lists are ignored. A received individual snapshot takes precedence to avoid duplicate issue counting. Otherwise the package-carried issues are included in the result, and classification trusts the explicit outside-metamodel declaration. An unrelated missing snapshot still remains missing.

Deploy the updated Add-In `analysisStructureSynchronizer`, Collector and ChartWriter, then rerun CHECK on the analysis package before refreshing the dashboard. Older snapshots without this field still accept the temporary manual tags. After the new CHECK, these two optional dashboard tags may be removed or emptied.

Exigences fixture: expected snapshots remain 8/8, notPlanned=1; issues become 15 (all ERROR) because the previously omitted DIAGRAM_NOT_IN_METAMODEL issue is now preserved. MANUAL_REVIEW becomes 2. Conformity/classification object totals do not change.

Validation: mocked collection tests cover automatic exclusion, issue preservation, classification, invalid declarations, empty authoritative declarations and genuinely missing snapshots. Native EA execution remains to verify after deployment.

## Prototype cloning test before INIT integration

Install `FrameworkBA_CheckDashboardFactory.js` as `FrameworkBA_CheckDashboardFactory` in the EA group ETNIC_FrameworkBA. Install the normal script `FrameworkBA_TestCreateCheckDashboard.js` in the same group. Select the prototype package named _Check_results (not a results instance), then execute the normal script. This diagnostic script targets the Exigences fixture; reusable factory.create accepts prototype, target and analysis-root GUIDs without fixed model identifiers.

The factory uses EA Package.Clone(), checks fresh element/diagram GUIDs and rejects external diagram references. The package with _Check_Result_Diagram must directly own that diagram; all required dynamic elements must be placed on it. Child package and child-element contents are allowed and cloned. Each chart must already have its memo data tag in the prototype.

The normal test creates analysisRoot/_Librairie/_Check_results/_CHECK - Exigences. It reuses the existing technical library (also accepts _librairies) and result container (also accepts check_results). The library must already exist. A linked READY instance in the old root-level _Check_results container is moved into the library and renamed, preserving its GUID and content; the old container is not deleted. The clone retains _Check_Result_Diagram and technical element names, fonts/layout/scripts, and receives target/root/scope/template tags. FrameworkBA_Check_PrototypeGuid identifies its prototype and FrameworkBA_Check_State marks PREPARING or READY. Fixed summary labels are preserved; dynamic texts and cached chart data are reset. Keep the common _Check_Refresh and ConstructChart wrappers in the prototype before cloning.

The factory never opens a diagram, executes CHECK, renders a chart or installs EA scripts. The normal test driver prepares the copied dashboard using persisted CHECK snapshots, then calls ReloadDiagram once and OpenDiagram. Reload stays outside Scriptlets and modification events. If CreateSeries returns no series during native cloning, renderStored logs deferred rendering and returns without Redraw; it can render on the subsequent diagram load.

A second call for the same target returns an existing validated READY instance without writes once its destination and name are correct. The normal driver still prepares data and refreshes the diagram. A manually created dashboard without READY is reported as incomplete rather than silently adopted. Duplicate result containers or linked instances abort. Errors retain the incomplete clone (logged GUID); there is no destructive automatic rollback. Inspect that clone before retrying, especially if failure occurred before moving it from the prototype's parent.

This step provides the creation library and normal test, not automatic INIT/COMPLETE/REPAIR wiring. Those operations will call the library after native cloning is validated and the prototype GUID has been registered in framework configuration. ROOT dashboard aggregation remains unsupported.

Validation: `node ea-scripts/tests/CheckDashboardFactory.test.cjs` checks copy configuration, fresh identifiers, cache reset, unchanged source, existing-instance reuse and external-reference rejection using mocked EA objects.

## Add-In ownership of dashboard creation (current architecture)

Dashboard creation now belongs to the Scripted Add-In module `src/checkDashboardFactory.js` (internal code/property `checkDashboardFactory`, using the same module registration mechanism as repositoryService and analysisStructureSynchronizer). Deploy it together with updated `src/frameworkBA.js` and `src/fbaConstants.js`. It has no dependency on the Scripting factory or TableWriter libraries.

Set `FrameworkBA_Check_PrototypeGuid` on the analysis ROOT package Element to the GUID of the whole prototype _Check_results package. An optional CHECK_DASHBOARD_PROTOTYPE_GUID constant is the fallback. Without either configuration, dashboard creation logs a warning and existing INIT behavior continues.

On successful INIT PACKAGE, create/reuse a linked dashboard if the package initialization state is INITIALIZED. This also handles INIT's already-initialized SKIP. Cancelled or incomplete initializations do not create dashboards. On successful INIT ROOT, visit initialized analysis packages recursively, excluding technical package subtrees. No ROOT dashboard is created because ROOT collection is not yet supported.

The normal Scripting factory/test introduced earlier is a diagnostic fixture; use the Add-In module for production ownership. The common Scriptlet still prepares results; each ConstructChart still renders its own stored data. No scripts are rendered or diagrams opened during INIT. CHECK invalidation is suppressed only during technical dashboard writes.

Creation preserves cloned styles/layout, clears chart caches, resets summary text and writes a two-row table saying Results to refresh. Manual existing dashboards without READY are reported for COMPLETE/REPAIR instead of being modified silently. Native cloning and INIT hooks still need live EA verification. COMPLETE/REPAIR wiring and ROOT dashboard aggregation remain subsequent work.

Mock validation: native factory copy/reuse tests and initialized-package selection tests; no claim of native EA execution.

## Normal test destination and refresh correction

The Scripting factory/driver now use the library destination and ordinary hyphen described above. The existing Add-In module remains unchanged pending validation of this normal-script test. Update Collector, TableWriter, ChartWriter, Dashboard and Scripting Factory libraries before running the updated normal test driver. Select the prototype _Check_results package. Mock tests verify legacy-instance migration without cloning again and data preparation before one reload/open; native EA rendering remains to validate.

## ROOT/ANALYSIS persistence diagnostic before dashboard extension

Run FrameworkBA_TestInspectRootCheck.js as a normal script in ETNIC_FrameworkBA after selecting the analysis ROOT and executing CHECK ROOT. It only reads ETNIC_Check_Result and logs its issues, root/global rules and persisted summary/metrics. No cloning, writes, chart rendering or refresh occurs.

The ROOT snapshot currently aggregates local package issues and uniqueness issues. Global duplicate issues carry scope=GLOBAL and objectGuids; one issue is stored in root.issues and referenced on affected root.objects entries. Do not sum root.issues together with these object issue lists. Missing issue.scope is reported UNSPECIFIED, never guessed to be root-local. The test separately reports direct root ownership by GUID; absence of such issues does not establish that all root-local validation rules exist.

The agreed future ANALYSIS dashboard uses full-analysis figures but a global-only detail table. ROOT_LOCAL uses only root-owned local results. These dashboard scopes are not enabled by this diagnostic. Runtime output is needed to confirm the actual persisted structure and any missing root-local sources before implementing aggregation.

## Compact distributed ROOT CHECK persistence (schema 2)

CHECK ROOT still returns the complete runtime result for existing callers, but persists a schemaVersion=2 / storage=DISTRIBUTED snapshot. Package-local issues and rules are excluded by their aggregation provenance (identity), not by guessing absent scope fields. It retains root-pass rules/issues, root date/success, package GUID references, analysisSummary and metrics. Detailed objects are no longer duplicated in ROOT storage.

summary counts only retained root-pass issues; analysisSummary preserves the whole runtime analysis counters. issuePartitions.local/global are indices into issues (no duplicated descriptors). LOCAL root-pass groups can concern descendants; they are not automatically root-owned. ANALYSIS details must select GLOBAL; ROOT_LOCAL must resolve ownership. Objects metrics are aggregate counters, not a business-only inventory.

Update analysisStructureSynchronizer, rerun CHECK ROOT, then the updated normal FrameworkBA_TestInspectRootCheck script. Existing PACKAGE charts/collectors are unchanged. Live EA persistence must still verify ExpectedSize=PersistedSize and Identical=true. The compact format does not yet enable ROOT_LOCAL/ANALYSIS dashboards.

## Direct ROOT content rules in framework constants

ANALYSIS_ROOT_CONTENT in fbaConstants declares _Librairie and TXT Accueil (Logical, MDGDgm=Labnaf - Common::Free Text). Direct packages are permitted only when named exactly _Librairie or linked by TAG_SOURCE_ANALYSIS_ELEMENT_GUID to a known analysis definition. The underscore prefix alone does not exempt foreign packages. All direct root Elements are foreign. Other direct diagrams are foreign, including Dashboard/coverage charts. The library subtree is not inspected by this structural rule.

Accueil is required and must match name, UML type and MDG identity; multiple valid Accueil diagrams and multiple libraries are reported. This change does not require a missing library or create/delete/move any objects. Each issue is LOCAL/ANALYSIS_ROOT, owned by the ROOT GUID, with separate affected-object fields for the offending package/element/diagram. The root rule and issues are included in compact persistence and full-analysis counters; they are not global inter-package anomalies.

Deploy fbaConstants and analysisStructureSynchronizer together, reload the Add-In and run CHECK ROOT followed by the normal inspection script. ROOT_LOCAL and ANALYSIS dashboard rendering remains separate pending work.
