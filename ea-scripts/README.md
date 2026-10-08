# CHECK snapshot collector for EA Scripting

This directory contains standalone EA JavaScript scripts, separate from the Scripted Add-In modules in src.

## Installation in Enterprise Architect

1. Open the Scripting window.
2. In the normal script group ETNIC_FrameworkBA, create a **JavaScript** script named checkSnapshotCollector.
3. Paste the entire contents of checkSnapshotCollector.js and save.
4. Paste checkSnapshotCollector.scriptlet.js into the existing Scriptlet.
5. Replace the package and root GUIDs for another analysis folder.

The library and Scriptlet must use JavaScript. The library has no automatic entry point.
Git updates do not automatically update scripts stored in the EA model.

## API

ETNIC_CheckSnapshotCollector.collect(packageGuid, rootGuid, options)

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
