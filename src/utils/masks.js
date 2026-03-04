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

    // Se for um número (quando carregando dados salvos ou resultados de cálculo)
    if (typeof value === 'number') {
        v = v.toFixed(2).replace('.', ',');
    }

    // Remove R$ e limpa o que não é dígito ou vírgula
    v = v.replace('R$ ', '').replace(/[^\d,]/g, '');

    // Se o usuário apagou tudo, retorna vazio para não travar no "0"
    if (v === "") return "";

    // Garante apenas uma vírgula
    const parts = v.split(',');
    let intPart = parts[0];
    let decPart = parts.length > 1 ? parts[1].slice(0, 2) : null;

    // Remove zeros à esquerda da parte inteira, mas mantém um "0" se estiver vazio ou se for "0,"
    intPart = intPart.replace(/^0+(?!$)/, '');
    if (intPart === "" && decPart !== null) intPart = "0";

    // Formata a parte inteira (milhares com ponto)
    let maskedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decPart !== null) {
        return 'R$ ' + (maskedInt || "0") + ',' + decPart;
    }

    return maskedInt ? 'R$ ' + maskedInt : "";
};

export const unmaskCurrency = (value) => {
    if (value === undefined || value === null || value === "") return 0;

    let v = value.toString()
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.');

    const num = parseFloat(v);
    return isNaN(num) ? 0 : num;
};
