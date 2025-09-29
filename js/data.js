const DATA = {
    projects: [
        {
            id: 'CL-3421',
            country: 'Chile',
            city: 'Santiago',
            client: 'Edifício Andes',
            stage: 'Instalação',
            orderDate: '2025-07-01',
            handover: '2025-09-01',
            milestones: [
                { name: 'Engenharia', planned: '2025-07-05', actual: '2025-07-05' },
                { name: 'Fabricação', planned: '2025-07-20', actual: '2025-07-18' },
                {
                    name: 'Entrega em Obra',
                    planned: '2025-08-01',
                    actual: '2025-08-02'
                },
                { name: 'Instalação', planned: '2025-08-18', actual: '2025-08-19' },
                { name: 'Testes', planned: '2025-08-27', actual: null },
                { name: 'Handover', planned: '2025-09-01', actual: null }
            ],
            budget: 100,
            actualCost: 104,
            quality: [
                {
                    id: 'NC-01',
                    severity: 'Alta',
                    status: 'Aberta',
                    title: 'Ajuste de nivelamento do poço',
                    due: '2025-08-22'
                },
                {
                    id: 'NC-02',
                    severity: 'Média',
                    status: 'Em Progresso',
                    title: 'Proteção de cabos',
                    due: '2025-08-25'
                },
                {
                    id: 'NC-03',
                    severity: 'Baixa',
                    status: 'Resolvida',
                    title: 'Acabamento de botoeira',
                    due: '2025-08-15'
                }
            ],
            fpy: 0.92
        },
        {
            id: 'BR-5510',
            country: 'Brasil',
            city: 'São Paulo',
            client: 'Torre Atlântica',
            stage: 'Fabricação',
            orderDate: '2025-06-20',
            handover: '2025-09-10',
            milestones: [
                { name: 'Engenharia', planned: '2025-06-28', actual: '2025-06-29' },
                { name: 'Fabricação', planned: '2025-07-20', actual: '2025-07-26' },
                {
                    name: 'Entrega em Obra',
                    planned: '2025-08-05',
                    actual: '2025-08-06'
                },
                { name: 'Instalação', planned: '2025-08-25', actual: null },
                { name: 'Testes', planned: '2025-09-05', actual: null },
                { name: 'Handover', planned: '2025-09-10', actual: null }
            ],
            budget: 180,
            actualCost: 187,
            quality: [
                {
                    id: 'NC-04',
                    severity: 'Média',
                    status: 'Aberta',
                    title: 'Ancoragem de guia',
                    due: '2025-08-28'
                }
            ],
            fpy: 0.9
        },
        {
            id: 'AR-1207',
            country: 'Argentina',
            city: 'Rosario',
            client: 'Puerto Norte',
            stage: 'Testes',
            orderDate: '2025-06-30',
            handover: '2025-09-05',
            milestones: [
                { name: 'Engenharia', planned: '2025-07-03', actual: '2025-07-03' },
                { name: 'Fabricação', planned: '2025-07-18', actual: '2025-07-17' },
                {
                    name: 'Entrega em Obra',
                    planned: '2025-08-01',
                    actual: '2025-08-01'
                },
                { name: 'Instalação', planned: '2025-08-18', actual: '2025-08-17' },
                { name: 'Testes', planned: '2025-08-30', actual: '2025-08-29' },
                { name: 'Handover', planned: '2025-09-05', actual: null }
            ],
            budget: 120,
            actualCost: 118,
            quality: [],
            fpy: 0.95
        }
    ]
};

const FEEDBACK = [
    {
        id: 'fb1',
        projectId: 'BR-5510',
        project: 'Torre Atlântica',
        country: 'Brasil',
        city: 'São Paulo',
        nps: 10,
        csat: 5,
        date: '2025-08-22',
        comment: 'Equipe excelente, instalação rápida e sem imprevistos.'
    },
    {
        id: 'fb2',
        projectId: 'BR-5510',
        project: 'Torre Atlântica',
        country: 'Brasil',
        city: 'São Paulo',
        nps: 9,
        csat: 5,
        date: '2025-08-19',
        comment: 'Elevador ficou lindo, prazo cumprido.'
    },
    {
        id: 'fb3',
        projectId: 'CL-3421',
        project: 'Edifício Andes',
        country: 'Chile',
        city: 'Santiago',
        nps: 9,
        csat: 5,
        date: '2025-08-21',
        comment: 'Ótimo atendimento e comunicação clara.'
    },
    {
        id: 'fb4',
        projectId: 'AR-1207',
        project: 'Puerto Norte',
        country: 'Argentina',
        city: 'Rosario',
        nps: 8,
        csat: 4,
        date: '2025-08-20',
        comment: 'Tudo dentro do esperado, equipe atenciosa.'
    },
    {
        id: 'fb5',
        projectId: 'AR-1207',
        project: 'Puerto Norte',
        country: 'Argentina',
        city: 'Rosario',
        nps: 9,
        csat: 5,
        date: '2025-08-18',
        comment: 'Instalação rápida e organização impecável.'
    },
    {
        id: 'fb6',
        projectId: 'BR-5510',
        project: 'Torre Atlântica',
        country: 'Brasil',
        city: 'São Paulo',
        nps: 7,
        csat: 4,
        date: '2025-08-17',
        comment: 'Pequenos ajustes, mas tudo resolvido rapidamente.'
    },
    {
        id: 'fb7',
        projectId: 'CL-3421',
        project: 'Edifício Andes',
        country: 'Chile',
        city: 'Santiago',
        nps: 10,
        csat: 5,
        date: '2025-08-16',
        comment: 'Acima das expectativas, obra muito bem conduzida.'
    },
    {
        id: 'fb8',
        projectId: 'AR-1207',
        project: 'Puerto Norte',
        country: 'Argentina',
        city: 'Rosario',
        nps: 9,
        csat: 5,
        date: '2025-08-15',
        comment: 'Entrega no prazo e excelente qualidade.'
    },
    {
        id: 'fb9',
        projectId: 'CL-3421',
        project: 'Edifício Andes',
        country: 'Chile',
        city: 'Santiago',
        nps: 8,
        csat: 4,
        date: '2025-08-13',
        comment: 'Boa experiência geral, equipe prestativa.'
    }
];

const STEPS = ['Pedido', 'Fabricação', 'Entrega', 'Instalação', 'Testes', 'Handover'];

const TARGETS = {
    onTime: 0.85,        // 85%
    leadTime: 60,        // 60 dias
    costVar: 0.02,       // 2%
    fpy: 0.95            // 95%
};

window.AppData = {
    DATA,
    FEEDBACK,
    STEPS,
    TARGETS
};
