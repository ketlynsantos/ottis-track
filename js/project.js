function getProject(id) {
    return AppData.DATA.projects.find((p) => p.id === id);
}

function renderProject(p) {
    if (!p) {
        AppCommon.select('#project').innerHTML = "<div class='card'>Projeto não encontrado.</div>";
        return;
    }

    AppCommon.select('#p-title').textContent = `${p.client} — ${p.city}/${p.country} (${p.id})`;
    AppCommon.select('#p-stage').textContent = p.stage;
    AppCommon.select('#p-stage').className = 'badge ' + AppCommon.statusBadge(p.stage);
    AppCommon.select('#p-ot').textContent = AppCommon.formatPercent(AppCommon.onTimeRatio(p.milestones));
    AppCommon.select('#p-lt').textContent = (AppCommon.leadTime(p) || '—') + ' dias';
    AppCommon.select('#p-cv').textContent = (AppCommon.costVariance(p) * 100).toFixed(1) + '%';
    AppCommon.select('#p-fpy').textContent = AppCommon.formatPercent(p.fpy);

    const tl = AppCommon.select('#timeline');
    tl.innerHTML = p.milestones
        .map((m) => {
            let cls = 'item';
            if (m.actual && new Date(m.actual) <= new Date(m.planned)) cls += ' done';
            if (m.actual && new Date(m.actual) > new Date(m.planned)) cls += ' delay';
            if (!m.actual) cls += ' risk';
            return `
                <div class="${cls}">
                    <strong>${m.name}</strong>
                    <div class="small">
                        Planejado: ${m.planned || '—'} •
                        Real: ${m.actual || '—'}
                    </div>
                </div>
            `;
        })
        .join('');

    AppCommon.select('#cost-line').textContent = `Orçado: ${p.budget} • Realizado: ${p.actualCost}`;
    const delta = Math.round(((p.actualCost - p.budget) / p.budget) * 1000) / 10;
    AppCommon.select('#cost-delta').textContent = `Δ ${delta}%`;
    const fill = Math.min(100, Math.max(2, Math.round((p.actualCost / p.budget) * 100)));
    AppCommon.select('#cost-bar .fill').style.width = fill + '%';

    const ql = AppCommon.select('#quality');
    ql.innerHTML = p.quality.length
        ? p.quality
              .map(
                  (qc) => `
                    <div class="card">
                        <div>
                            <strong>${qc.id}</strong> •
                            Gravidade: ${qc.severity} •
                            Status: ${qc.status}
                        </div>
                        <div class="small">${qc.title} • Prazo: ${qc.due}</div>
                    </div>
                `
              )
              .join('')
        : `<div class="card">Sem Não Conformidades.</div>`;
}

function openModal() {
    AppCommon.select('#nc-dialog').showModal();
}

function closeModal() {
    AppCommon.select('#nc-dialog').close();
    showToast('Registro salvo');
}

function showToast(msg) {
    const t = AppCommon.select('.toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

function tabTo(n) {
    AppCommon.selectAll('.tab').forEach((e) => e.classList.remove('active'));
    AppCommon.selectAll('.tabpanel').forEach((e) => (e.style.display = 'none'));
    AppCommon.select(`[data-tab='${n}']`).classList.add('active');
    AppCommon.select(`#panel-${n}`).style.display = 'block';
}

function renderPortal(p) {
    AppCommon.select('#portal-title').textContent = `${p.client} — ${p.city}/${p.country}`;
    const idx =
        AppData.STEPS.findIndex((s) => s.toLowerCase().includes(p.stage.toLowerCase().slice(0, 4))) || 0;
    AppCommon.select('#steps').innerHTML = STEPS.map(
        (s, i) => `
            <div class="step ${i <= idx ? 'done' : ''}">
                <div class="dot"></div>
                <div>${s}</div>
            </div>
        `)
        .join('');
    AppCommon.select('#fb-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Feedback enviado. Obrigado!');
        e.target.reset();
    });
}

window.AppProject = {
    getProject,
    renderProject,
    openModal,
    closeModal,
    showToast,
    tabTo,
    renderPortal
}
