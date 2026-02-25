import jsPDF from 'jspdf';
import { calculateNetIncome } from './businessRules';

const getDataUri = (url) => {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this, 0, 0);
            resolve({ dataUrl: canvas.toDataURL('image/png'), ratio: this.naturalWidth / this.naturalHeight });
        };
        image.onerror = () => resolve(null);
        image.src = url;
    });
};

export const generatePDF = async (data, result) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // ─── Helpers ────────────────────────────────────────────────────────────
    const checkPageBreak = (h) => {
        if (y + h > pageHeight - 25) { doc.addPage(); y = margin; return true; }
        return false;
    };

    const sectionTitle = (text) => {
        checkPageBreak(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 59, 40);
        doc.text(text, margin, y);
        doc.setDrawColor(0, 59, 40);
        doc.line(margin, y + 1, pageWidth - margin, y + 1);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0);
        y += 8;
    };

    const row = (label, value) => {
        checkPageBreak(7);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(`${label}: `);
        doc.text(String(value), margin + labelWidth, y);
        y += 6;
    };

    // ─── CABEÇALHO INSTITUCIONAL ─────────────────────────────────────────────
    // Aviso institucional em destaque (caixa colorida no topo)
    doc.setFillColor(0, 59, 40);
    doc.rect(0, 0, pageWidth, 14, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const avisoText = 'AVISO: Este documento é orientativo e NÃO substitui a análise do/a Defensor/a Público/a Federal. Uso interno.';
    doc.text(avisoText, pageWidth / 2, 9, { align: 'center' });
    doc.setTextColor(0);
    y = 18;

    // Logo + título
    try {
        const logoObj = await getDataUri('/logo_dpu_header.png');
        if (logoObj?.dataUrl) {
            const fixedH = 20;
            const logoW = fixedH * logoObj.ratio;
            doc.addImage(logoObj.dataUrl, 'PNG', margin, y, logoW, fixedH);
            const tx = margin + logoW + 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(0, 59, 40);
            doc.text('Defensoria Pública da União', tx, y + 7);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text('Relatório Socioeconômico de Pré-Avaliação', tx, y + 14);
            y += 28;
        } else {
            throw new Error('no logo');
        }
    } catch {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 59, 40);
        doc.text('Defensoria Pública da União', margin, y + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text('Relatório Socioeconômico de Pré-Avaliação', margin, y + 13);
        y += 22;
    }

    // Linha separadora
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Data de emissão
    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Emitido em: ${hoje}`, pageWidth - margin, y, { align: 'right' });
    doc.setTextColor(0);
    y += 8;

    // ─── RESULTADO DA AVALIAÇÃO ─────────────────────────────────────────────
    sectionTitle('Resultado da Avaliação');

    const statusColors = {
        'ELIGIBLE_AUTOMATIC': [46, 125, 50],
        'NOT_ELIGIBLE': [198, 40, 40],
        'NEEDS_ANALYSIS': [230, 120, 0],
    };
    const [r, g, b] = statusColors[result.status] || [0, 0, 0];
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.setFontSize(11);
    doc.text(result.message.toUpperCase(), margin, y);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y += 6;

    const splitJust = doc.splitTextToSize(`Justificativa: ${result.justification}`, pageWidth - 2 * margin);
    doc.text(splitJust, margin, y);
    y += splitJust.length * 5 + 4;

    if (result.appliedArticles?.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`Fundamentação: ${result.appliedArticles.join(' | ')}`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0);
        y += 6;
    }

    if (result.alerts?.length > 0) {
        checkPageBreak(12);
        doc.setTextColor(198, 40, 40);
        doc.setFont("helvetica", "bold");
        const alertLines = doc.splitTextToSize(`⚠ ${result.alerts.join(' | ')}`, pageWidth - 2 * margin);
        doc.text(alertLines, margin, y);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        y += alertLines.length * 5 + 4;
    }

    // ─── DADOS DO ASSISTIDO ─────────────────────────────────────────────────
    sectionTitle('Dados do Assistido');
    row('Nome', data.personal?.name || '-');
    row('Endereço', data.personal?.address || '-');
    y += 2;

    // ─── GRUPO FAMILIAR E RENDA ─────────────────────────────────────────────
    sectionTitle('Grupo Familiar e Renda');

    const members = data.family?.members || [];
    if (members.length === 0) {
        doc.text('Nenhum membro informado.', margin, y);
        y += 6;
    } else {
        // Cabeçalho da tabela
        checkPageBreak(10);
        const colX = [margin, margin + 55, margin + 85, margin + 110, margin + 148];
        doc.setFont("helvetica", "bold");
        doc.setFillColor(220, 230, 220);
        doc.rect(margin, y - 4, pageWidth - 2 * margin, 7, 'F');
        ['Nome', 'Parentesco', 'Idade', 'Origem da Renda', 'Renda'].forEach((h, i) => {
            doc.text(h, colX[i], y);
        });
        doc.setFont("helvetica", "normal");
        y += 6;
        doc.setDrawColor(180);
        doc.line(margin, y - 1, pageWidth - margin, y - 1);

        members.forEach((m) => {
            checkPageBreak(8);
            const isBpcBolsa = m.benefitType === 'BPC' || m.benefitType === 'Bolsa Família';
            const rendaStr = isBpcBolsa
                ? `${m.benefitType} (desconsid.)`
                : (parseFloat(m.incomeValue) > 0 ? `R$ ${parseFloat(m.incomeValue).toFixed(2)}` : 'Sem Renda');
            const originStr = isBpcBolsa ? `Benefício Social` : (m.incomeSource || '-');

            doc.text(String(m.name || '-').substring(0, 22), colX[0], y);
            doc.text(String(m.kinship || '-').substring(0, 14), colX[1], y);
            doc.text(String(m.age || '-'), colX[2], y);
            doc.text(String(originStr).substring(0, 18), colX[3], y);

            if (isBpcBolsa) { doc.setTextColor(150); }
            doc.text(rendaStr, colX[4], y);
            doc.setTextColor(0);
            y += 6;
            doc.setDrawColor(220);
            doc.line(margin, y - 1, pageWidth - margin, y - 1);
        });
        y += 3;
    }

    // Totais de renda
    const netIncome = calculateNetIncome(data);
    const totalMem = members.length || 1;
    const perCapita = netIncome / totalMem;

    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text(`Renda Familiar Bruta: R$ ${(data.totalFamilyIncome || 0).toFixed(2)}`, margin, y); y += 6;
    if ((data.financial?.deductionItems || []).length > 0) {
        const totalDed = (data.financial.deductionItems).reduce((a, d) => a + (parseFloat(d.value) || 0), 0);
        doc.text(`Total de Deduções Extra-Judiciais: R$ ${totalDed.toFixed(2)}`, margin, y); y += 6;
    }
    doc.text(`Renda Líquida Apurada: R$ ${netIncome.toFixed(2)}`, margin, y); y += 6;
    doc.text(`Renda Per Capita: R$ ${perCapita.toFixed(2)}`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 8;

    // ─── GASTOS DECLARADOS ──────────────────────────────────────────────────
    sectionTitle('Gastos Declarados');

    const expLabels = {
        rent: 'Aluguel',
        water: 'Água',
        light: 'Luz',
        food: 'Alimentação',
        health: 'Saúde',
        transport: 'Transporte',
    };
    const exp = data.financial?.expenses || {};
    const filledExp = Object.entries(expLabels).filter(([k]) => parseFloat(exp[k]) > 0);

    const customExp = (data.financial?.customExpenses || []).filter(e => parseFloat(e.value) > 0);

    if (filledExp.length === 0 && customExp.length === 0) {
        doc.setTextColor(100);
        doc.setFont("helvetica", "italic");
        doc.text('Nenhuma despesa informada.', margin, y);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        y += 6;
    } else {
        filledExp.forEach(([k, label]) => {
            checkPageBreak(6);
            row(label, `R$ ${parseFloat(exp[k]).toFixed(2)}`);
        });
        customExp.forEach(item => {
            checkPageBreak(6);
            row(item.description, `R$ ${parseFloat(item.value).toFixed(2)}`);
        });
        y += 2;
    }

    // ─── GASTOS EXTRAORDINÁRIOS / DEDUÇÕES ─────────────────────────────────
    sectionTitle('Gastos Extraordinários (Deduções)');

    const dedItems = data.financial?.deductionItems || [];
    if (dedItems.length === 0) {
        checkPageBreak(14);
        doc.setFillColor(255, 243, 205);
        doc.setDrawColor(255, 193, 7);
        doc.roundedRect(margin, y - 1, pageWidth - 2 * margin, 10, 2, 2, 'FD');
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 70, 0);
        doc.text('Observação: O assistido não informou gastos extraordinários dedutíveis nesta avaliação.', margin + 3, y + 5);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y += 14;
    } else {
        dedItems.forEach(item => {
            checkPageBreak(6);
            doc.text(`  • ${item.description}: R$ ${parseFloat(item.value).toFixed(2)}`, margin, y);
            y += 6;
        });
        y += 2;
    }

    // ─── INVESTIMENTOS ──────────────────────────────────────────────────────
    if (data.financial?.hasInvestments === 'sim' && (data.financial?.investments || []).length > 0) {
        sectionTitle('Investimentos Financeiros Declarados');
        (data.financial.investments).forEach(inv => {
            checkPageBreak(6);
            doc.text(`  • ${inv.description}: R$ ${parseFloat(inv.value).toFixed(2)}`, margin, y);
            y += 6;
        });
        y += 2;
    }

    // ─── DECLARAÇÃO E ASSINATURA ────────────────────────────────────────────
    checkPageBreak(60);
    sectionTitle('Declaração e Assinatura');

    const declaracao = doc.splitTextToSize(
        'Declaro que as informações prestadas são verdadeiras e que estou ciente de que a prestação de informações falsas sujeita o declarante às penalidades previstas em lei.',
        pageWidth - 2 * margin
    );
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(declaracao, margin, y);
    y += declaracao.length * 5 + 12;

    // Linha de assinatura
    doc.setDrawColor(0);
    doc.line(margin, y, margin + 100, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text('Assinatura do Assistido(a)', margin, y);
    y += 5;
    doc.text(`Local e Data: ______________________, ${hoje}`, margin, y);
    doc.setTextColor(0);
    y += 14;

    // ─── RODAPÉ COM NÚMERO DE PÁGINAS ───────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.text('DPU — Defensoria Pública da União', margin, pageHeight - 8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
    }

    // ─── PÁGINA ADICIONAL: COMUNICADO DE INDEFERIMENTO (Somente se NOT_ELIGIBLE) ───
    if (result.status === 'NOT_ELIGIBLE') {
        doc.addPage();
        y = 25;

        // Título Centralizado e Sublinhado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const title1 = "COMUNICADO DE INDEFERIMENTO DA ASSISTÊNCIA e ARQUIVAMENTO DO PAJ";
        doc.text(title1, pageWidth / 2, y, { align: 'center' });
        doc.setDrawColor(0);
        doc.line(margin + 10, y + 1, pageWidth - margin - 10, y + 1);
        y += 15;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0);

        const texto1 = `Para fins de atendimento na Defensoria Pública da União, a Resolução nº 134, de 07 de dezembro de 2016, do Conselho Superior da DPU, estabelece que o valor de presunção de necessidade econômica é de renda familiar bruta de até R$ 2.000,00 (dois mil reais).`;
        const splitT1 = doc.splitTextToSize(texto1, pageWidth - 2 * margin);
        doc.text(splitT1, margin, y);
        y += splitT1.length * 5 + 8;

        const texto2 = `Na pesquisa socioeconômica realizada, ficou demonstrado que sua renda bruta familiar é superior ao limite estabelecido.`;
        const splitT2 = doc.splitTextToSize(texto2, pageWidth - 2 * margin);
        doc.text(splitT2, margin, y);
        y += splitT2.length * 5 + 6;

        // Caixa de Renda Bruta
        doc.setFont("helvetica", "bold");
        doc.text("Renda bruta declarada:", margin + 20, y);
        doc.setFillColor(230);
        doc.rect(margin + 75, y - 4, 30, 6, 'F');
        doc.text(`R$ ${(data.totalFamilyIncome || 0).toFixed(2)}`, margin + 90, y, { align: 'center' });
        y += 12;

        const texto3 = `As despesas ordinárias e comuns (água, luz, telefone, alimentação, moradia, etc) e aquelas que evidenciam gastos não compatíveis com a condição de pobreza (plano de saúde, tv por assinatura, escolas privadas etc) não são dedutíveis para fins de atendimento. Somente gastos extraordinários com saúde decorrentes de moléstia ou acidente e os gastos extraordinários considerados indispensáveis, temporários e imprevistos poderão ser deduzidos da renda bruta familiar (art. 5º da Resolução 133/2016 do CSDPU).`;
        const splitT3 = doc.splitTextToSize(texto3, pageWidth - 2 * margin);
        doc.text(splitT3, margin, y);
        y += splitT3.length * 5 + 8;

        // Gastos extraordinários
        const totalSaude = (data.financial?.deductionItems || []).reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
        doc.setFont("helvetica", "normal");
        doc.text("Gastos extraordinários com saúde decorrentes de moléstia ou acidente declarados:", margin, y);
        doc.setFillColor(230);
        doc.rect(pageWidth - margin - 30, y - 4, 30, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(`R$ ${totalSaude.toFixed(2)}`, pageWidth - margin - 15, y, { align: 'center' });
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.text("Gastos extraordinários diversos (indispensáveis, temporários e imprevistos) declarados:", margin, y);
        doc.setFillColor(230);
        doc.rect(pageWidth - margin - 30, y - 4, 30, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(`R$ 0.00`, pageWidth - margin - 15, y, { align: 'center' }); // Placeholder as we don't separate these types yet
        y += 12;

        // Bloco Cinza de Conclusão
        doc.setFillColor(220);
        doc.rect(margin, y, pageWidth - 2 * margin, 85, 'F');
        y += 8;
        doc.setFontSize(10);

        const textoConclusao = `Considerando que a renda familiar bruta declarada ultrapassa o parâmetro definido na Resolução nº 134/2016, do CSDPU, fica o requerente intimado do INDEFERIMENTO do requerimento de assistência jurídica gratuita e, consequentemente, do arquivamento do Procedimento de Assistência Jurídica - PAJ.`;
        const splitC = doc.splitTextToSize(textoConclusao, pageWidth - 2 * margin - 10);
        doc.text(splitC, margin + 5, y);
        y += splitC.length * 5 + 8;

        const textoCiente = `O requerente fica ciente de que, em razão do indeferimento da assistência jurídica gratuita, não haverá prática de qualquer ato, administrativo ou judicial, em seu favor, e que eventuais prazos judiciais existentes continuam em curso, normalmente.`;
        const splitCi = doc.splitTextToSize(textoCiente, pageWidth - 2 * margin - 10);
        doc.text(splitCi, margin + 5, y);
        y += splitCi.length * 5 + 8;

        const textoRecurso = `Caso não concorde com o indeferimento, o requerente poderá, no prazo de 30 dias, apresentar documentação complementar que prove sua condição de pobreza, juntamente com os comprovantes de renda de todos os integrantes da família (contracheque, carteira de trabalho e cópia da última declaração de imposto de renda, se houver declarado) e com comprovantes dos gastos extraordinários dedutíveis, se houver.`;
        const splitR = doc.splitTextToSize(textoRecurso, pageWidth - 2 * margin - 10);
        doc.text(splitR, margin + 5, y);
        y += splitR.length * 5 + 8;

        const textoAnalise = `Apresentada a documentação, será reanalisado o requerimento pelo Defensor Público responsável, que poderá manter o arquivamento ou deferir a assistência jurídica solicitada, caso considere provada a condição de pobreza.`;
        const splitA = doc.splitTextToSize(textoAnalise, pageWidth - 2 * margin - 10);
        doc.text(splitA, margin + 5, y);
        y += 10;
    }

    doc.save('relatorio_dpu.pdf');
};
