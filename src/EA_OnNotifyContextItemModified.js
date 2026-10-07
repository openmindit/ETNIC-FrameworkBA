// Réception du signal EA_OnNotifyContextItemModified (GUID, ot).
// Le Repository est fourni par le contexte du Model-Based Add-In.
if (!this.checkInvalidationSuppressed)
{
    this.logger.info("EA_OnNotifyContextItemModified | GUID=" + GUID
        + " | ObjectType=" + ot);
    this.frameworkBA.notifyContextItemModified(GUID, ot);
}
