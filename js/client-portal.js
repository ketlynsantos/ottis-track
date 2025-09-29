function calcNpsPercent(feedbacks) {
    if (!feedbacks.length) return 0;
    let promoters = 0,
        detractors = 0;
    let lengthFeedbacks = feedbacks.length;

    feedbacks.forEach((item) => {
        if (item.nps >= 9) promoters++;
        else if (item.nps <= 6) detractors++;
    });
    return Math.round((promoters / lengthFeedbacks - detractors / lengthFeedbacks) * 100);
}

function avgCsatScore(feedbacks) {
    if (!feedbacks.length) return 0;
    return (feedbacks.reduce((a, item) => a + item.csat, 0) / feedbacks.length).toFixed(1);
}

function npsDistribution(feedbacks) {
    const arr = Array.from({ length: 11 }, () => 0);
    feedbacks.forEach((item) => {
        if (item.nps >= 0 && item.nps <= 10) arr[item.nps]++;
    });
    return arr;
}

function npsCategory(nps) {
    if (nps >= 9) return ['Promotor', 'promoter'];
    if (nps <= 6) return ['Detrator', 'detractor'];
    return ['Neutro', 'neutral'];
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
        let feedbacks = AppData.FEEDBACK.slice();
        if (selCountry.value !== 'Todos') {
            feedbacks = feedbacks.filter((item) => item.country === selCountry.value);
        }
        if (selProject.value !== 'Todos') {
            feedbacks = feedbacks.filter((item) => item.project === selProject.value);
        }
        const period = selPeriod.value; // 30, 90, 365, all
        if (period !== 'all') {
            const days = parseInt(period, 10);
            const now = new Date('2025-08-25'); // static reference for demo
            feedbacks = feedbacks.filter(
                (item) => (now - new Date(item.date)) / (1000 * 60 * 60 * 24) <= days
            );
        }

        window.FILTERED_FEEDBACKS = feedbacks

        // KPIs
        AppCommon.select('#kpi-nps .kpis__value').textContent = calcNpsPercent(feedbacks) + '%';
        AppCommon.select('#kpi-csat .kpis__value').textContent = avgCsatScore(feedbacks);
        AppCommon.select('#kpi-total .kpis__value').textContent = feedbacks.length;
        const promoters = feedbacks.filter((item) => item.nps >= 9).length;
        const detractors = feedbacks.filter((item) => item.nps <= 6).length;
        AppCommon.select('#kpi-split .kpis__value').textContent = `${promoters}↑ / ${detractors}↓`;

        // Bars
        const npsCounts = npsDistribution(feedbacks);
        const max = Math.max(1, ...npsCounts);
        const bars = npsCounts
            .map((count, score) => {
                let category = 'neutral';
                if (score <= 6) category = 'detractor';
                if (score >= 9) category = 'promoter';

                const height = Math.round((count / max) * 100);

                return `
                    <div
                        class='nps-chart__bar nps-chart__bar--${category}'
                        title='${score}: ${count}'
                        style='height:${height}%'
                    ></div>
                `;
            })
            .join('');
        AppCommon.select('#bar-container').innerHTML = bars;

        // Comments
        const recentFeedbacks = feedbacks
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8)
            .map((item) => {
                const [categoryLabel, categoryClass] = npsCategory(item.nps);
                return `
                    <div class="feedback__comment">
                        <div class="feedback__comment-meta">
                            <span class="feedback__comment-tag feedback__comment-tag--${categoryClass}">
                                ${categoryLabel}
                            </span>
                            <span class="feedback__comment-date">${item.date}</span>
                            <span class="feedback__comment-separator">•</span>
                            <span class="feedback__comment-project">
                                ${item.project} — ${item.city}/${item.country}
                            </span>
                            <span class="feedback__comment-separator">•</span>
                            <span class="feedback__comment-nps">
                                NPS ${item.nps}, CSAT ${item.csat}
                            </span>
                        </div>
                        <div class="feedback__comment-body">${item.comment}</div>
                    </div>
                `;
            })
            .join('');
        AppCommon.select('#comments').innerHTML =
            recentFeedbacks || '<div class="card">Sem feedbacks no período.</div>';
    }
    selCountry.onchange = apply;
    selProject.onchange = apply;
    selPeriod.onchange = apply;
    apply();
}

function renderNpsDistributionNumber() {
    const container = AppCommon.select('#number-nps');

    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i <= 10; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        container.appendChild(span);
    }
}

function rowsToCSV(feedbacks) {
    const header = ['Data', 'ID', 'Nome do Projeto', 'País', 'Cidade', 'NPS', 'CSAT', 'Comentário'];
    const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    const lines = [header.join(',')].concat(
        feedbacks.map((feedback) =>
            [feedback.date, feedback.projectId, feedback.project, feedback.country, feedback.city, feedback.nps, feedback.csat, feedback.comment]
                .map(esc)
                .join(',')
        )
    );

    return lines.join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
    }, 0);
}

function exportFeedbackCSV() {
    const rows =
        window.FILTERED_FEEDBACKS && window.FILTERED_FEEDBACKS.length
            ? window.FILTERED_FEEDBACKS
            : typeof AppData.FEEDBACK !== 'undefined'
            ? AppData.FEEDBACK
            : [];

    if (!rows.length) {
        alert('Sem dados para exportar.');
        return;
    }
    const csv = rowsToCSV(rows);
    downloadCSV(csv, 'feedbacks_filtrados.csv');
}

AppCommon.select('#fb-export').addEventListener('click', () => {
    exportFeedbackCSV();
})

// Inicialização do Portal do Cliente
document.addEventListener('DOMContentLoaded', () => {
    renderNpsDistributionNumber();
    renderFeedbackDashboard();
});
