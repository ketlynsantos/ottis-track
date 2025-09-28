function npsScore(rows) {
    if (!rows.length) return 0;
    let pro = 0,
        det = 0;
    rows.forEach((r) => {
        if (r.nps >= 9) pro++;
        else if (r.nps <= 6) det++;
    });
    return Math.round((pro / rows.length - det / rows.length) * 100);
}

function avgCsat(rows) {
    if (!rows.length) return 0;
    return (rows.reduce((a, r) => a + r.csat, 0) / rows.length).toFixed(1);
}

function dist0to10(rows) {
    const arr = Array.from({ length: 11 }, () => 0);
    rows.forEach((r) => {
        if (r.nps >= 0 && r.nps <= 10) arr[r.nps]++;
    });
    return arr;
}

function tagFor(n) {
    if (n >= 9) return ['Promotor', 'pro'];
    if (n <= 6) return ['Detrator', 'det'];
    return ['Neutro', 'neu'];
}

function renderFeedbackDashboard() {
    // Toolbar
    const selCountry = AppCommon.select('#fb-country');
    const selProject = AppCommon.select('#fb-project');
    const selPeriod = AppCommon.select('#fb-period');

    // Build filters
    const countries = [...new Set(AppData.FEEDBACK.map((f) => f.country))].sort();
    selCountry.innerHTML =
        '<option value="Todos">Todos</option>' +
        countries.map((c) => `<option>${c}</option>`).join('');
    const projects = [...new Set(AppData.FEEDBACK.map((f) => f.project))].sort();
    selProject.innerHTML =
        '<option value="Todos">Todos</option>' +
        projects.map((p) => `<option>${p}</option>`).join('');

    // Filter function
    function apply() {
        let rows = AppData.FEEDBACK.slice();
        if (selCountry.value !== 'Todos') {
            rows = rows.filter((r) => r.country === selCountry.value);
        }
        if (selProject.value !== 'Todos') {
            rows = rows.filter((r) => r.project === selProject.value);
        }
        const p = selPeriod.value; // 30, 90, 365, all
        if (p !== 'all') {
            const days = parseInt(p, 10);
            const now = new Date('2025-08-25'); // static reference for demo
            rows = rows.filter((r) => (now - new Date(r.date)) / (1000 * 60 * 60 * 24) <= days);
        }

        // KPIs
        AppCommon.select('#kpi-nps .val').textContent = npsScore(rows) + '%';
        AppCommon.select('#kpi-csat .val').textContent = avgCsat(rows);
        AppCommon.select('#kpi-total .val').textContent = rows.length;
        const pro = rows.filter((r) => r.nps >= 9).length;
        const det = rows.filter((r) => r.nps <= 6).length;
        AppCommon.select('#kpi-split .val').textContent = `${pro}↑ / ${det}↓`;

        // Bars
        const d = dist0to10(rows);
        const max = Math.max(1, ...d);
        const bars = d
            .map((v, i) => {
                let t = 'neu';
                if (i <= 6) t = 'det';
                if (i >= 9) t = 'pro';
                const h = Math.round((v / max) * 100);
                return `<div class='bar' data-t='${t}' title='${i}: ${v}' style='height:${h}%' ></div>`;
            })
            .join('');
        AppCommon.select('#bar-container').innerHTML = bars;

        // Comments
        const list = rows
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8)
            .map((r) => {
                const [label, cls] = tagFor(r.nps);
                return `
                    <div class="comment">
                        <div class="meta">
                            <span class="tag ${cls}">${label}</span>
                            <span>${r.date}</span>
                            <span>•</span>
                            <span>${r.project} — ${r.city}/${r.country}</span>
                            <span>•</span>
                            <span>NPS ${r.nps}, CSAT ${r.csat}</span>
                        </div>
                        <div class="body">${r.comment}</div>
                    </div>
                `;
            })
            .join('');
        AppCommon.select('#comments').innerHTML = list || '<div class="card">Sem feedbacks no período.</div>';
    }
    selCountry.onchange = apply;
    selProject.onchange = apply;
    selPeriod.onchange = apply;
    apply();
}

// Inicialização do Portal do Cliente
document.addEventListener('DOMContentLoaded', () => {
    renderFeedbackDashboard();
})
