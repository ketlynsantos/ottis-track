function renderKPIs(container, projects) {
    const TARGETS = {
        onTime: 0.85,        // 85%
        leadTime: 60,        // 60 dias
        costVar: 0.02,       // 2%
        fpy: 0.95            // 95%
    };

    const allMilestones = projects.flatMap((p) => p.milestones);
    const onTime = AppCommon.onTimeRatio(allMilestones);
    const avgLeadTime = Math.round(
        projects.reduce((sum, p) => sum + (AppCommon.leadTime(p) || 0), 0) / projects.length
    );
    const avgCostVariance =
        projects.reduce((sum, p) => sum + AppCommon.costVariance(p), 0) / projects.length;
    const avgFPY = projects.reduce((sum, p) => sum + p.fpy, 0) / projects.length;

    container.innerHTML = `
        <div class="kpi">
            <h3>
                Marcos no prazo
                <span
                    class="kpi__info"
                    tabindex="0"
                    data-tip="Proporção de marcos entregues dentro do prazo planejado."
                >i</span>
            </h3>
            <div class="kpi__value">${AppCommon.formatPercent(onTime)}</div>
            <div class="kpi__goal">Meta: ${AppCommon.formatPercent(TARGETS.onTime)} ou mais</div>
            <div class="kpi__delta">média geral</div>
        </div>

        <div class="kpi">
            <h3>
                Lead Time Médio
                <span
                    class="kpi__info"
                    tabindex="0"
                    data-tip="Tempo médio entre o início e a entrega dos projetos."
                >i</span>
            </h3>
            <div class="kpi__value">${avgLeadTime} dias</div>
            <div class="kpi__goal">Meta: ${TARGETS.leadTime} dias ou menos</div>
            <div class="kpi__delta">pedido → entrega</div>
        </div>

        <div class="kpi">
            <h3>
                Variação de custo
                <span
                    class="kpi__info"
                    tabindex="0"
                    data-tip="Diferença percentual entre o custo planejado e o custo real."
                >i</span>
            </h3>
            <div class="kpi__value">${(avgCostVariance * 100).toFixed(1)}%</div>
            <div class="kpi__goal">Meta: ${(TARGETS.costVar * 100).toFixed(1)}% ou menos</div>
            <div class="kpi__delta">orçado × realizado</div>
        </div>

        <div class="kpi">
            <h3>
                Primeiro passe (FPY)
                <span
                    class="kpi__info"
                    tabindex="0"
                    data-tip="Proporção de entregas que foram aprovadas na primeira tentativa, sem retrabalho."
                >i</span>
            </h3>
            <div class="kpi__value">${AppCommon.formatPercent(avgFPY)}</div>
            <div class="kpi__goal">Meta: ${AppCommon.formatPercent(TARGETS.fpy)} ou mais</div>
            <div class="kpi__delta">sem retrabalho</div>
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
