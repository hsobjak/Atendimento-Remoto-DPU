export const maskCPF = (value) => {
    return value
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 3 primeiros dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 6 primeiros dígitos
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen após os 9 primeiros dígitos
        .replace(/(-\d{2})\d+?$/, '$1'); // Limita o tamanho
};

export const maskCEP = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
};

export const maskPhone = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};
export const maskCurrency = (value) => {
    if (value === undefined || value === null || value === "") return "";

    let v = value.toString();

    // Se for um número puro (vindo do estado), tratamos o ponto como decimal
    if (typeof value === 'number') {
        v = v.replace('.', ',');
        // Se for número inteiro, adicionamos a vírgula para consistência se necessário? 
        // Não, vamos deixar o usuário decidir o decimal no input.
    }

    // Remove tudo que não é dígito ou vírgula
    v = v.replace(/[^\d,]/g, '');

    // Garante apenas uma vírgula
    const parts = v.split(',');
    if (parts.length > 2) v = parts[0] + ',' + parts.slice(1).join('');

    // Formata a parte inteira (milhares com ponto)
    let intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Se houver parte decimal, limita a 2 dígitos
    let decPart = parts.length > 1 ? ',' + parts[1].slice(0, 2) : '';

    return 'R$ ' + intPart + decPart;
};

export const unmaskCurrency = (value) => {
    if (!value) return 0;
    // Remove R$, pontos de milhar e converte vírgula em ponto
    const clean = value.toString()
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.');
    return parseFloat(clean) || 0;
};
