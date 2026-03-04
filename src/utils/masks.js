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
    if (!value) return '';

    // Remove tudo o que não é dígito
    let v = value.toString().replace(/\D/g, '');

    // Converte para centavos e então formata
    v = (Number(v) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return v;
};

export const unmaskCurrency = (value) => {
    if (!value) return 0;
    return Number(value.replace(/\D/g, '')) / 100;
};
