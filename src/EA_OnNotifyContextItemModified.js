// Réception du signal EA_OnNotifyContextItemModified.
// Certains paramètres de réception EA sont enveloppés dans { val: ... }.
if (!this.checkInvalidationSuppressed)
{
    var modifiedGuid = GUID != null && typeof GUID === "object"
        && typeof GUID.val !== "undefined" ? GUID.val : GUID;
    var modifiedType = ot != null && typeof ot === "object"
        && typeof ot.val !== "undefined" ? ot.val : ot;

    if (typeof modifiedGuid !== "string" ||
        (typeof modifiedType !== "number" && typeof modifiedType !== "string"))
    {
        this.logger.error("Paramètres événement CHECK invalides"
            + " | GUIDType=" + typeof modifiedGuid
            + " | ObjectTypeType=" + typeof modifiedType);
    }
    else
    {
        modifiedType = Number(modifiedType);
        this.logger.info("EA_OnNotifyContextItemModified | GUID=" + modifiedGuid
            + " | ObjectType=" + modifiedType);
        this.frameworkBA.notifyContextItemModified(modifiedGuid, modifiedType);
    }
}
