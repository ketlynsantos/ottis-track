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
    AppCommon.select('#p-ot').textContent = AppCommon.formatPercent(
        AppCommon.onTimeRatio(p.milestones)
    );
    AppCommon.select('#p-lt').textContent = (AppCommon.leadTime(p) || '—') + ' dias';
    AppCommon.select('#p-cv').textContent = (AppCommon.costVariance(p) * 100).toFixed(1) + '%';
    AppCommon.select('#p-fpy').textContent = AppCommon.formatPercent(p.fpy);

    renderInsights(p);

    const tl = AppCommon.select('#timeline');
    tl.innerHTML = p.milestones
        .map((m, index) => {
            let cls = 'item';
            if (m.actual && new Date(m.actual) <= new Date(m.planned)) cls += ' done';
            if (m.actual && new Date(m.actual) > new Date(m.planned)) cls += ' delay';
            if (!m.actual) cls += ' risk';

            const prev = index > 0 ? p.milestones[index - 1] : null;

            // Base real para cálculo do tempo corrido
            const baseReal =
                index === 0
                    ? p.orderDate
                        ? new Date(p.orderDate)
                        : m.planned
                        ? new Date(m.planned)
                        : null
                    : prev && prev.actual
                    ? new Date(prev.actual)
                    : prev && prev.planned
                    ? new Date(prev.planned)
                    : null;

            // Base planejada para cálculo da meta
            const basePlan =
                index === 0
                    ? p.orderDate
                        ? new Date(p.orderDate)
                        : null
                    : prev && prev.planned
                    ? new Date(prev.planned)
                    : null;

            const thisReal = m.actual ? new Date(m.actual) : null;
            const tempoDias = !m.actual
                ? 0
                : baseReal
                ? Math.round((thisReal - baseReal) / 86400000)
                : null;

            const thisPlan = m.planned ? new Date(m.planned) : null;
            const metaDias =
                basePlan && thisPlan ? Math.round((thisPlan - basePlan) / 86400000) : null;

            const tempoStr = tempoDias == null ? '—' : `${tempoDias} dias`;
            const metaStr = metaDias == null ? '—' : `${metaDias} dias`;

            return `
                <div class="${cls}">
                    <div class="row">
                        <strong>${m.name}</strong>
                        <div class="etapa-kpis">
                            <span class="kdot">Tempo corrido: <b>${tempoStr}</b></span>
                            <span class="kdot">Meta: <b>${metaStr}</b></span>
                        </div>
                    </div>
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
    AppCommon.selectAll('.tab').forEach((e) => e.classList.remove('tab--active'));
    AppCommon.selectAll('.tabpanel').forEach((e) => (e.style.display = 'none'));
    AppCommon.select(`[data-tab='${n}']`).classList.add('tab--active');
    AppCommon.select(`#panel-${n}`).style.display = 'block';
}

function renderInsights(p) {
    const list = [];

    // Status geral
    const sched = AppCommon.scheduleStatus(p); // {label, cls}
    if (sched.cls === 'delay') {
        list.push({
            sev: 'bad',
            text: 'Projeto atrasado',
            detail: `Marcos no prazo: ${AppCommon.formatPercent(AppCommon.onTimeRatio(p.milestones))}`
        });
    } else if (sched.cls === 'risk') {
        list.push({
            sev: 'warn',
            text: 'Projeto em risco de atraso',
            detail: `Marcos no prazo: ${AppCommon.formatPercent(AppCommon.onTimeRatio(p.milestones))}`
        });
    } else {
        list.push({
            sev: 'good',
            text: 'Projeto no prazo',
            detail: `Marcos no prazo: ${AppCommon.formatPercent(AppCommon.onTimeRatio(p.milestones))}`
        });
    }

    // Etapas ruins (atrasadas ou vencidas e não realizadas)
    const today = new Date();
    const ruins = p.milestones
        .filter(
            (m) =>
                (m.actual && new Date(m.actual) > new Date(m.planned)) ||
                (!m.actual && new Date(m.planned) < today)
        )
        .map((m) => m.name);
    if (ruins.length) {
        list.push({ sev: 'bad', text: `Etapas com problema: ${ruins.join(', ')}` });
    } else {
        list.push({ sev: 'good', text: 'Nenhuma etapa com atraso.' });
    }

    // Etapas boas (concluídas até a data planejada)
    const boas = p.milestones
        .filter((m) => m.actual && new Date(m.actual) <= new Date(m.planned))
        .map((m) => m.name);
    if (boas.length) {
        list.push({ sev: 'good', text: `Etapas no prazo: ${boas.join(', ')}` });
    }

    // Qualidade
    if (p.quality && p.quality.length) {
        list.push({ sev: 'warn', text: `${p.quality.length} não conformidade(s) aberta(s).` });
    } else {
        list.push({ sev: 'good', text: 'Sem não conformidades abertas.' });
    }

    // Custo
    const cv = AppCommon.costVariance(p); // fraction
    if (cv > 0.001) {
        list.push({ sev: 'warn', text: `Custo acima do orçamento em ${(cv * 100).toFixed(1)}%.` });
    } else {
        list.push({ sev: 'good', text: `Dentro do orçamento (Δ ${(cv * 100).toFixed(1)}%).` });
    }

    // Lead time vs meta
    const lt = AppCommon.leadTime(p);
    if (lt && AppData.TARGETS.leadTime) {
        const diffLT = lt - AppData.TARGETS.leadTime;
        if (diffLT > 0)
            list.push({ sev: 'warn', text: `Lead time acima da meta em ${diffLT} dia(s).` });
        else list.push({ sev: 'good', text: `Lead time dentro da meta (${lt} dias).` });
    }

    // FPY vs meta
    if (typeof p.fpy === 'number') {
        const goalFPY = AppData.TARGETS.fpy || 0;
        if (p.fpy < goalFPY)
            list.push({
                sev: 'warn',
                text: `FPY abaixo da meta (${AppCommon.formatPercent(p.fpy)} vs meta ${AppCommon.formatPercent(goalFPY)}).`
            });
        else list.push({ sev: 'good', text: `FPY na meta (${AppCommon.formatPercent(p.fpy)}).` });
    }

    // Próximo marco
    const next = p.milestones.find((m) => !m.actual);
    if (next) {
        const d = AppCommon.daysBetween(new Date(), next.planned);
        const sev = d != null && d < 0 ? 'bad' : 'info';
        const infoText =
            d == null
                ? `Próximo marco: ${next.name}`
                : d < 0
                ? `Próximo marco vencido: ${next.name} (${Math.abs(d)} dia(s) em atraso).`
                : `Próximo marco: ${next.name} (falta(m) ${d} dia(s)).`;
        list.push({ sev, text: infoText });
    }

    // Render
    const cont = AppCommon.select('#insights');
    if (!cont) return;
    cont.innerHTML = list
        .map((item) => {
            const sevClass =
                item.sev === 'bad'
                    ? 'bad'
                    : item.sev === 'warn'
                    ? 'warn'
                    : item.sev === 'info'
                    ? ''
                    : 'good';
            const detail = item.detail ? `<div class="small">${item.detail}</div>` : '';
            return `
                <div class="item">
                    <span class="dot ${sevClass}"></span>
                    <div>
                        <div>${item.text}</div>
                        ${detail}
                    </div>
                </div>
            `;
        })
        .join('');
}

function renderPortal(p) {
    AppCommon.select('#portal-title').textContent = `${p.client} — ${p.city}/${p.country}`;
    const idx =
        AppData.STEPS.findIndex((s) =>
            s.toLowerCase().includes(p.stage.toLowerCase().slice(0, 4))
        ) || 0;
    AppCommon.select('#steps').innerHTML = STEPS.map(
        (s, i) => `
            <div class="step ${i <= idx ? 'done' : ''}">
                <div class="dot"></div>
                <div>${s}</div>
            </div>
        `
    ).join('');
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
};
