!INC Local Scripts.ChartAutomation
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter

function ConstructChart(guid)
{
    try {
        FrameworkBA_CheckChartWriter.renderStored(guid);
    } catch (error) {
        Repository.WriteOutput("ETNIC_FrameworkBA",
            "[CHECK CHART] Erreur=" + error.message, 0);
    }
}
