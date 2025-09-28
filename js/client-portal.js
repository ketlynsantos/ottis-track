function calcNpsPercent(feedbacks) {
    if (!feedbacks.length) return 0;
    let promoters = 0, detractors = 0;
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
    if (nps >= 9) return ['Promotor', 'pro'];
    if (nps <= 6) return ['Detrator', 'det'];
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

        // KPIs
        AppCommon.select('#kpi-nps .val').textContent = calcNpsPercent(feedbacks) + '%';
        AppCommon.select('#kpi-csat .val').textContent = avgCsatScore(feedbacks);
        AppCommon.select('#kpi-total .val').textContent = feedbacks.length;
        const promoters = feedbacks.filter((item) => item.nps >= 9).length;
        const detractors = feedbacks.filter((item) => item.nps <= 6).length;
        AppCommon.select('#kpi-split .val').textContent = `${promoters}↑ / ${detractors}↓`;

        // Bars
        const npsCounts = npsDistribution(feedbacks);
        const max = Math.max(1, ...npsCounts);
        const bars = npsCounts
            .map((count, score) => {
                let category = 'neu';
                if (score <= 6) category = 'det';
                if (score >= 9) category = 'pro';
                const height = Math.round((count / max) * 100);
                return `<div class='bar' data-t='${category}' title='${score}: ${count}' style='height:${height}%' ></div>`;
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
                    <div class="comment">
                        <div class="meta">
                            <span class="tag ${categoryClass}">${categoryLabel}</span>
                            <span>${item.date}</span>
                            <span>•</span>
                            <span>${item.project} — ${item.city}/${item.country}</span>
                            <span>•</span>
                            <span>NPS ${item.nps}, CSAT ${item.csat}</span>
                        </div>
                        <div class="body">${item.comment}</div>
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

// Inicialização do Portal do Cliente
document.addEventListener('DOMContentLoaded', () => {
    renderFeedbackDashboard();
});
