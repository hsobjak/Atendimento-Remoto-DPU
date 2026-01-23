
export const SALARIO_MINIMO = 1518.00;

export const LIMITES = {
    RENDA_FAMILIAR_GERAL: 2 * SALARIO_MINIMO,
    RENDA_PER_CAPITA_GERAL: 0.5 * SALARIO_MINIMO,
    RENDA_SAUDE_TOTAL: 5 * SALARIO_MINIMO,
    RENDA_SAUDE_PER_CAPITA: 1 * SALARIO_MINIMO,
    RENDA_TRABALHO: 1.5 * SALARIO_MINIMO,
    RENDA_PREVIDENCIARIA_IDOSO: 1 * SALARIO_MINIMO,
};

// Updated from Screenshot 4
export const TIPOS_DEMANDA = {
    CIVEL_GERAL: 'Cível Geral',
    CIVEL_SAUDE: 'Cível - Saúde (Medicamentos/Tratamento)',
    CRIMINAL: 'Criminal',
    PREVIDENCIARIO: 'Previdenciário (INSS)',
    DIREITOS_HUMANOS: 'Direitos Humanos',
};

export const ESTADO_CIVIL = [
    'Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'
];

export const PARENTESCO = [
    'Requerente (Próprio)', 'Cônjuge/Companheiro(a)', 'Filho(a)', 'Pai/Mãe', 'Irmão/Irmã', 'Outro'
];
