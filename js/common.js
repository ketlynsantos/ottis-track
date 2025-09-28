function daysBetween(start, end) {
    if (!start || !end) return null;
    return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}

function scheduleStatus(project) {
    const onTime = onTimeRatio(project.milestones); // fraction 0..1
    if (onTime >= 0.9) return { label: 'No prazo', cls: 'on' };
    if (onTime >= 0.7) return { label: 'Em risco', cls: 'risk' };
    return { label: 'Atrasado', cls: 'delay' };
}

function select(selector, root = document) {
    return root.querySelector(selector);
}

function selectAll(selector, root = document) {
    return [...root.querySelectorAll(selector)];
}

function formatPercent(value) {
    return (value * 100).toFixed(0) + '%';
}

function onTimeRatio(milestones) {
    const completed = milestones.filter((m) => m.actual != null);
    if (!completed.length) return 0;

    let onTimeCount = 0;
    completed.forEach((m) => {
        const actualDate = new Date(m.actual);
        const plannedDate = new Date(m.planned);

        if (actualDate <= plannedDate) {
            onTimeCount++;
        }
    });

    return onTimeCount / completed.length;
}

function leadTime(project) {
    return daysBetween(project.orderDate, project.handover);
}

function costVariance(project) {
    return (project.actualCost - project.budget) / project.budget;
}

function statusBadge(stage) {
    if (!stage) return 'unknown'

    const s = stage.toLowerCase();
    if (s.includes('handover')) return 'done';
    if (s.includes('fabr') || s.includes('inst') || s.includes('test')) return 'inprogress';
    return 'peding';
}

function renderTable(tbody, projects) {
    tbody.innerHTML = projects
        .map((project) => {
            const onTime = formatPercent(onTimeRatio(project.milestones));
            const lead = leadTime(project) ?? '—';
            const schedule = scheduleStatus(project);

            return `
                <tr>
                    <td><a href="project.html?id=${encodeURIComponent(project.id)}">${project.id}</a></td>
                    <td>${project.country}</td>
                    <td>${project.client}</td>
                    <td>${project.stage}</td>
                    <td class="num">${onTime}</td>
                    <td class="num">${lead}d</td>
                    <td><span class="chip ${schedule.cls}">${schedule.label}</span></td>
                </tr>
            `;
        })
        .join('');
}

window.AppCommon = {
    select,
    selectAll,
    formatPercent,
    onTimeRatio,
    leadTime,
    costVariance,
    statusBadge,
    renderTable
};
