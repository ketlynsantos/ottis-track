function daysBetween(a, b) {
    if (!a || !b) return null;
    return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function scheduleStatus(p) {
    const ot = onTimePct(p.milestones); // fraction 0..1
    if (ot >= 0.9) return { label: 'No prazo', cls: 'on' };
    if (ot >= 0.7) return { label: 'Em risco', cls: 'risk' };
    return { label: 'Atrasado', cls: 'delay' };
}

function q(s, r = document) {
    return r.querySelector(s);
}

function qa(s, r = document) {
    return [...r.querySelectorAll(s)];
}

function fmtPct(n) {
    return (n * 100).toFixed(0) + '%';
}

function onTimePct(ms) {
    const v = ms.filter((m) => m.actual != null);
    if (!v.length) return 0;
    let on = 0;
    v.forEach((m) => {
        if (new Date(m.actual) <= new Date(m.planned)) on += 1;
    });
    return on / v.length;
}

function leadTime(p) {
    return daysBetween(p.orderDate, p.handover);
}

function costVariance(p) {
    return (p.actualCost - p.budget) / p.budget;
}

function statusBadge(stage) {
    const s = stage.toLowerCase();
    if (s.includes('handover')) return 'done';
    if (s.includes('fabr') || s.includes('inst') || s.includes('test')) return 'inprogress';
    return 'inprogress';
}

function renderTable(tbody, projs) {
    tbody.innerHTML = projs
        .map((p) => {
            const ot = fmtPct(onTimePct(p.milestones));
            const lt = leadTime(p) ?? '—';
            const sch = scheduleStatus(p);
            return `
                <tr>
                    <td><a href="project.html?id=${encodeURIComponent(p.id)}">${p.id}</a></td>
                    <td>${p.country}</td>
                    <td>${p.client}</td>
                    <td>${p.stage}</td>
                    <td class="num">${ot}</td>
                    <td class="num">${lt}d</td>
                    <td><span class="chip ${sch.cls}">${sch.label}</span></td>
                </tr>
            `;
        })
        .join('');
}

window.AppCommon = {
    q,
    qa,
    fmtPct,
    onTimePct,
    leadTime,
    costVariance,
    statusBadge,
    renderTable
};
