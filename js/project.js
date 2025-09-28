function getProject(id) {
    return AppData.DATA.projects.find((p) => p.id === id);
}

function renderProject(p) {
    if (!p) {
        AppCommon.q('#project').innerHTML = "<div class='card'>Projeto não encontrado.</div>";
        return;
    }

    AppCommon.q('#p-title').textContent = `${p.client} — ${p.city}/${p.country} (${p.id})`;
    AppCommon.q('#p-stage').textContent = p.stage;
    AppCommon.q('#p-stage').className = 'badge ' + AppCommon.statusBadge(p.stage);
    AppCommon.q('#p-ot').textContent = AppCommon.fmtPct(AppCommon.onTimePct(p.milestones));
    AppCommon.q('#p-lt').textContent = (AppCommon.leadTime(p) || '—') + ' dias';
    AppCommon.q('#p-cv').textContent = (AppCommon.costVariance(p) * 100).toFixed(1) + '%';
    AppCommon.q('#p-fpy').textContent = AppCommon.fmtPct(p.fpy);

    const tl = AppCommon.q('#timeline');
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

    AppCommon.q('#cost-line').textContent = `Orçado: ${p.budget} • Realizado: ${p.actualCost}`;
    const delta = Math.round(((p.actualCost - p.budget) / p.budget) * 1000) / 10;
    AppCommon.q('#cost-delta').textContent = `Δ ${delta}%`;
    const fill = Math.min(100, Math.max(2, Math.round((p.actualCost / p.budget) * 100)));
    AppCommon.q('#cost-bar .fill').style.width = fill + '%';

    const ql = AppCommon.q('#quality');
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
    AppCommon.q('#nc-dialog').showModal();
}

function closeModal() {
    AppCommon.q('#nc-dialog').close();
    showToast('Registro salvo');
}

function showToast(msg) {
    const t = AppCommon.q('.toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

function tabTo(n) {
    AppCommon.qa('.tab').forEach((e) => e.classList.remove('active'));
    AppCommon.qa('.tabpanel').forEach((e) => (e.style.display = 'none'));
    AppCommon.q(`[data-tab='${n}']`).classList.add('active');
    AppCommon.q(`#panel-${n}`).style.display = 'block';
}

function renderPortal(p) {
    q('#portal-title').textContent = `${p.client} — ${p.city}/${p.country}`;
    const idx =
        STEPS.findIndex((s) => s.toLowerCase().includes(p.stage.toLowerCase().slice(0, 4))) || 0;
    q('#steps').innerHTML = STEPS.map(
        (s, i) => `
            <div class="step ${i <= idx ? 'done' : ''}">
                <div class="dot"></div>
                <div>${s}</div>
            </div>
        `)
        .join('');
    q('#fb-form').addEventListener('submit', (e) => {
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
