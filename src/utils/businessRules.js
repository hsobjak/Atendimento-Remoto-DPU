import { SALARIO_MINIMO, LIMITES, TIPOS_DEMANDA } from './constants';
import { unmaskCurrency } from './masks';

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value || 0);
};

export const calculateNetIncome = (data) => {
    // Gross Income comes from Family Members sum (BPC and Bolsa Família already excluded)
    // data.totalFamilyIncome is already a number (calculated in AssessmentContext)
    const gross = data.totalFamilyIncome || 0;

    // Sum all deduction items (described individually for the report)
    const deductions = (data.financial?.deductionItems || []).reduce(
        (acc, item) => acc + unmaskCurrency(item.value), 0
    );

    return Math.max(0, gross - deductions);
};

export const checkEligibility = (data) => {
    const { family, demand, financial, documents } = data;
    const alerts = [];
    const appliedArticles = [];

    // 0. Preliminary Check: Document Inconsistencies (New Requirement)
    // If documents show high value inconsistency, we flag immediately.
    const inconsistentDocs = documents.files.filter(d => d.inconsistency === 'high_value');
    if (inconsistentDocs.length > 0) {
        return {
            status: 'NEEDS_ANALYSIS', // Or NOT_ELIGIBLE depending on severity, let's use Needs Analysis for human review.
            message: 'Divergência Documental Identificada',
            justification: `Foi detectada renda superior à declarada nos documentos: ${inconsistentDocs.map(d => d.name).join(', ')}.`,
            appliedArticles: ['Verificação de Veracidade (Art. 7º)'],
            alerts: ['ATENÇÃO: Renda detectada no documento é incompatível com a declarada.']
        };
    }

    const totalMembers = family.members.length > 0 ? family.members.length : 1;
    const netIncome = calculateNetIncome(data);
    const perCapita = netIncome / totalMembers;

    // 1. Demand specific limits
    let limitTotal = LIMITES.RENDA_FAMILIAR_GERAL;
    let limitPerCapita = LIMITES.RENDA_PER_CAPITA_GERAL;

    if (demand.type === TIPOS_DEMANDA.CIVEL_SAUDE) {
        limitTotal = LIMITES.RENDA_SAUDE_TOTAL;
        limitPerCapita = LIMITES.RENDA_SAUDE_PER_CAPITA;
        appliedArticles.push('Art. 3º (Critério Saúde)');
    }

    // 2. High Value Assets
    // We need to check the dropdowns from Step 3
    if (financial.assets.realEstate.includes('extra') || financial.assets.vehicle.includes('luxo')) {
        appliedArticles.push('Art. 5º (Patrimônio Vultoso)');
        return {
            status: 'NEEDS_ANALYSIS',
            message: 'Enquadra-se mediante análise do/a Defensor/a',
            justification: 'Indício de patrimônio incompatível ou vultoso declarado.',
            appliedArticles,
            alerts: ['Verificar compatibilidade do patrimônio com a hipossuficiência.']
        };
    }

    // 3. Quantitative
    if (netIncome <= limitTotal || perCapita <= limitPerCapita) {
        appliedArticles.push('Art. 2º (Critério de Renda)');
        return {
            status: 'ELIGIBLE_AUTOMATIC',
            message: 'Enquadra-se nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
            justification: `Renda familiar (${formatCurrency(netIncome)}) ou per capita (${formatCurrency(perCapita)}) dentro dos limites.`,
            appliedArticles,
            alerts
        };
    }

    if (financial?.deductionItems?.length > 0) {
        alerts.push('Foram declarados gastos extraordinários que devem ser avaliados pelo/a Defensor/a.');
    }

    return {
        status: 'NOT_ELIGIBLE',
        message: 'Não se enquadra nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
        justification: `Renda superior aos limites objetivos (Total: ${formatCurrency(netIncome)} > ${formatCurrency(limitTotal)}).`,
        appliedArticles,
        alerts
    };
};
