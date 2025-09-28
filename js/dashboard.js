function renderKPIs(el, projs) {
    const all = projs.flatMap((p) => p.milestones);
    const onTime = AppCommon.onTimeRatio(all);
    const avgLead = Math.round(projs.reduce((a, p) => a + (AppCommon.leadTime(p) || 0), 0) / projs.length);
    const avgCV = projs.reduce((a, p) => a + AppCommon.costVariance(p), 0) / projs.length;
    const avgFPY = projs.reduce((a, p) => a + p.fpy, 0) / projs.length;

    el.innerHTML = `
        <div class="card kpi">
            <h3>Marcos no prazo</h3>
            <div class="value">${AppCommon.formatPercent(onTime)}</div>
            <div class="delta">média geral</div>
        </div>

        <div class="card kpi">
            <h3>Lead Time Médio</h3>
            <div class="value">${avgLead} dias</div>
            <div class="delta">pedido → entrega</div>
        </div>

        <div class="card kpi">
            <h3>Variação de custo</h3>
            <div class="value">${(avgCV * 100).toFixed(1)}%</div>
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
