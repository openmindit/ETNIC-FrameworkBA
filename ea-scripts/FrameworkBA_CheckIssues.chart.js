!INC Local Scripts.ChartAutomation
!INC ETNIC_FrameworkBA.FrameworkBA_CheckChartWriter

function ConstructChart(guid)
{
    FrameworkBA_CheckChartWriter.renderStored(guid);
}
