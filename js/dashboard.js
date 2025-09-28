function renderKPIs(container, projects) {
    const allMilestones = projects.flatMap((p) => p.milestones);
    const onTime = AppCommon.onTimeRatio(allMilestones);
    const avgLeadTime = Math.round(
        projects.reduce((sum, p) => sum + (AppCommon.leadTime(p) || 0), 0) / projects.length
    );
    const avgCostVariance =
        projects.reduce((sum, p) => sum + AppCommon.costVariance(p), 0) / projects.length;
    const avgFPY = projects.reduce((sum, p) => sum + p.fpy, 0) / projects.length;

    container.innerHTML = `
        <div class="card kpi">
            <h3>Marcos no prazo</h3>
            <div class="value">${AppCommon.formatPercent(onTime)}</div>
            <div class="delta">média geral</div>
        </div>

        <div class="card kpi">
            <h3>Lead Time Médio</h3>
            <div class="value">${avgLeadTime} dias</div>
            <div class="delta">pedido → entrega</div>
        </div>

        <div class="card kpi">
            <h3>Variação de custo</h3>
            <div class="value">${(avgCostVariance * 100).toFixed(1)}%</div>
            <div class="delta">orçado × realizado</div>
        </div>

        <div class="card kpi">
            <h3>Primeiro passe (FPY)</h3>
            <div class="value">${AppCommon.formatPercent(avgFPY)}</div>
            <div class="delta">sem retrabalho</div>
        </div>
    `;
}

// Inicialização do Dashboard
document.addEventListener('DOMContentLoaded', () => {
    const kpiContainer = AppCommon.select('#kpis');
    const tableBody = AppCommon.select('#tbody');
    const projects = AppData.DATA.projects;

    renderKPIs(kpiContainer, projects);
    AppCommon.renderTable(tableBody, projects);
});
