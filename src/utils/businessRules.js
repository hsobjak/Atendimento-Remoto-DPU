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

    // As per new rules, extraordinary expenses are no longer deducted mathematically from the total family income,
    // they are merely presented for the defender's analysis.
    return Math.max(0, gross);
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

    const requerente = family.members.find(m => m.kinship === 'Requerente (Próprio)');
    const isElderly = requerente ? (data.personal?.priorities?.elderly || (parseInt(requerente.age) >= 60)) : false;
    const reqIncomeVal = requerente ? unmaskCurrency(requerente.incomeValue) : 0;

    const metCriteria = {
        I: netIncome <= limitTotal,
        II: perCapita <= limitPerCapita,
        III: requerente?.benefitType === 'Bolsa Família' || false,
        IV: requerente?.benefitType === 'BPC' || false,
        V: isElderly && requerente?.incomeSource === 'Aposentadoria' && reqIncomeVal <= SALARIO_MINIMO
    };

    const metCriteriaList = [];
    if (metCriteria.I) metCriteriaList.push('I');
    if (metCriteria.II) metCriteriaList.push('II');
    if (metCriteria.III) metCriteriaList.push('III');
    if (metCriteria.IV) metCriteriaList.push('IV');
    if (metCriteria.V) metCriteriaList.push('V');

    if (financial?.deductionItems?.length > 0) {
        alerts.push('Foram declaradas despesas dedutíveis que devem ser avaliadas pelo/a Defensor/a.');
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
            alerts: ['Verificar compatibilidade do patrimônio com a hipossuficiência.'],
            metCriteria, metCriteriaList
        };
    }

    // 3. Presunção Automática do Requerente (Art. 2º, Incisos III, IV e V)
    if (requerente) {
        if (metCriteria.III) {
            appliedArticles.push('Art. 2º, III (Bolsa Família)');
            return {
                status: 'ELIGIBLE_AUTOMATIC',
                message: 'Enquadra-se nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
                justification: 'Requerente titular do Programa Bolsa Família.',
                appliedArticles,
                alerts, metCriteria, metCriteriaList
            };
        }
        if (metCriteria.IV) {
            appliedArticles.push('Art. 2º, IV (BPC/LOAS)');
            return {
                status: 'ELIGIBLE_AUTOMATIC',
                message: 'Enquadra-se nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
                justification: 'Requerente titular do Benefício de Prestação Continuada (BPC/LOAS).',
                appliedArticles,
                alerts, metCriteria, metCriteriaList
            };
        }
        if (metCriteria.V) {
            appliedArticles.push('Art. 2º, V (Idoso / Previdenciário)');
            return {
                status: 'ELIGIBLE_AUTOMATIC',
                message: 'Enquadra-se nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
                justification: `Requerente idoso cuja renda provém de benefício previdenciário de até 1 salário-mínimo.`,
                appliedArticles,
                alerts, metCriteria, metCriteriaList
            };
        }
    }

    // 4. Quantitative
    if (metCriteria.I || metCriteria.II) {
        appliedArticles.push('Art. 2º (Critério de Renda)');
        return {
            status: 'ELIGIBLE_AUTOMATIC',
            message: 'Enquadra-se nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
            justification: `Renda familiar (${formatCurrency(netIncome)}) ou per capita (${formatCurrency(perCapita)}) dentro dos limites.`,
            appliedArticles,
            alerts, metCriteria, metCriteriaList
        };
    }



    return {
        status: 'NOT_ELIGIBLE',
        message: 'Não se enquadra nos critérios objetivos, conforme Resolução CSDPU nº 240/2025',
        justification: `Renda superior aos limites objetivos (Total: ${formatCurrency(netIncome)} > ${formatCurrency(limitTotal)}).`,
        appliedArticles,
        alerts, metCriteria, metCriteriaList
    };
};
