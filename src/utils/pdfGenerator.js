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

    const avisoText = 'AVISO: Este documento é orientativo e NÃO substitui a análise do Defensor Público Federal.';

    // --- Helpers ---
    const checkPageBreak = (h) => {
        if (y + h > pageHeight - 15) { doc.addPage(); y = 20; return true; }
        return false;
    };

    const drawHeader = async (title) => {
        // Green institutional bar
        doc.setFillColor(0, 59, 40);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(avisoText, pageWidth / 2, 8, { align: 'center' });

        y = 16;
        try {
            const logoObj = await getDataUri('/logo_dpu_header.png');
            if (logoObj?.dataUrl) {
                const fixedH = 15;
                const logoW = fixedH * logoObj.ratio;
                doc.addImage(logoObj.dataUrl, 'PNG', margin, y, logoW, fixedH);
                const tx = margin + logoW + 5;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 59, 40);
                doc.text('Defensoria Pública da União', tx, y + 6);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(title, tx, y + 11);
                y += 18;
            }
        } catch {
            y += 10;
        }
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
    };

    const sectionTitle = (text) => {
        checkPageBreak(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 59, 40);
        doc.text(text, margin, y);
        doc.setDrawColor(0, 59, 40);
        doc.line(margin, y + 0.5, pageWidth - margin, y + 0.5);
        doc.setFont("helvetica", "normal");
        y += 5;
    };

    const row = (label, value) => {
        checkPageBreak(5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const labelText = `${label}: `;
        doc.text(labelText, margin, y);
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(labelText);
        doc.text(String(value), margin + labelWidth, y);
        y += 4.5;
    };

    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // --- PÁGINA 1: RELATÓRIO ---
    await drawHeader('Relatório Socioeconômico de Pré-Avaliação');

    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(`Emitido em: ${hoje}`, pageWidth - margin, y, { align: 'right' });
    doc.setTextColor(0);
    y += 4;

    sectionTitle('Resultado da Avaliação');
    const statusColors = { ELIGIBLE_AUTOMATIC: [46, 125, 50], NOT_ELIGIBLE: [198, 40, 40], NEEDS_ANALYSIS: [230, 120, 0] };
    const [r, g, b] = statusColors[result.status] || [0, 0, 0];
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.setFontSize(10);
    doc.text(result.message.toUpperCase(), margin, y);
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    y += 5;

    const splitJust = doc.splitTextToSize(`Justificativa: ${result.justification}`, pageWidth - 2 * margin);
    doc.text(splitJust, margin, y);
    y += splitJust.length * 4 + 2;

    if (result.alerts?.length > 0) {
        doc.setTextColor(198, 40, 40);
        doc.setFont("helvetica", "bold");
        const alertsText = result.alerts.join(' | ');
        const splitAlerts = doc.splitTextToSize(alertsText, pageWidth - 2 * margin);
        doc.text(splitAlerts, margin, y);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        y += splitAlerts.length * 4 + 4;
    }

    sectionTitle('Dados do Assistido');
    row('Nome', data.personal?.name || '-');
    row('Endereço', data.personal?.address || '-');
    y += 1;

    sectionTitle('Grupo Familiar e Renda');
    const members = data.family?.members || [];
    if (members.length === 0) {
        doc.text('Nenhum membro informado.', margin, y);
        y += 5;
    } else {
        const colX = [margin, margin + 45, margin + 75, margin + 100, margin + 140];
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setFillColor(240, 245, 240);
        doc.rect(margin, y - 3, pageWidth - 2 * margin, 4.5, 'F');
        ['Nome', 'Parentesco', 'Idade', 'Origem', 'Renda'].forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont("helvetica", "normal");
        y += 4.5;
        members.forEach((m) => {
            checkPageBreak(5);
            const isBpcBolsa = m.benefitType === 'BPC' || m.benefitType === 'Bolsa Família';
            const rendaStr = isBpcBolsa ? m.benefitType : (parseFloat(m.incomeValue) > 0 ? `R$ ${parseFloat(m.incomeValue).toFixed(2)}` : 'R$ 0,00');
            doc.text(String(m.name || '-').substring(0, 20), colX[0], y);
            doc.text(String(m.kinship || '-').substring(0, 12), colX[1], y);
            doc.text(String(m.age || '-'), colX[2], y);
            doc.text(String(isBpcBolsa ? 'Benefício' : (m.incomeSource || '-')).substring(0, 15), colX[3], y);
            if (isBpcBolsa) doc.setTextColor(120);
            doc.text(rendaStr, colX[4], y);
            doc.setTextColor(0);
            y += 4.5;
        });
    }

    const netIncome = calculateNetIncome(data);
    doc.setFont("helvetica", "bold");
    doc.text(`Renda Familiar Bruta: R$ ${(data.totalFamilyIncome || 0).toFixed(2)}`, margin, y + 2); y += 5;
    doc.text(`Renda Líquida Apurada: R$ ${netIncome.toFixed(2)}`, margin, y + 1); y += 5;

    sectionTitle('Gastos Declarados');
    const expLabels = { rent: 'Aluguel', water: 'Água', light: 'Luz', food: 'Alimentação', health: 'Saúde', transport: 'Transporte' };
    const exp = data.financial?.expenses || {};
    const filledExp = Object.entries(expLabels).filter(([k]) => parseFloat(exp[k]) > 0);
    const customExp = (data.financial?.customExpenses || []).filter(e => parseFloat(e.value) > 0);
    const dedItems = data.financial?.deductionItems || [];

    if (filledExp.length === 0 && customExp.length === 0 && dedItems.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text('Nenhuma despesa ou dedução informada.', margin, y);
        y += 5;
    } else {
        filledExp.forEach(([k, label]) => row(label, `R$ ${parseFloat(exp[k]).toFixed(2)}`));
        customExp.forEach(item => row(item.description, `R$ ${parseFloat(item.value).toFixed(2)}`));
        dedItems.forEach(item => row(`DEDUÇÃO: ${item.description}`, `R$ ${parseFloat(item.value).toFixed(2)}`));
    }

    checkPageBreak(30);
    sectionTitle('Declaração e Assinatura');
    const decl = doc.splitTextToSize('Declaro a veracidade das informações e estou ciente das penalidades legais.', pageWidth - 2 * margin);
    doc.setFontSize(8);
    doc.text(decl, margin, y);
    y += 10;
    doc.line(margin, y, margin + 70, y);
    doc.text('Assinatura do Assistido(a)', margin, y + 4);

    // --- PÁGINA 2: INDEFERIMENTO ---
    if (result.status === 'NOT_ELIGIBLE') {
        doc.addPage();
        await drawHeader('Comunicado de Indeferimento');

        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 59, 40);
        doc.text("COMUNICADO DE INDEFERIMENTO DA ASSISTÊNCIA", pageWidth / 2, y, { align: 'center' });
        doc.text("e ARQUIVAMENTO DO PAJ", pageWidth / 2, y + 5, { align: 'center' });
        doc.setDrawColor(0, 59, 40);
        doc.line(margin + 25, y + 7, pageWidth - margin - 25, y + 7);
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0);

        const t1 = `A Resolução nº 134/2016 do Conselho Superior da DPU estabelece presunção de necessidade para renda familiar bruta de até R$ 2.000,00. No caso avaliado, sua renda familiar bruta é superior a esse limite:`;
        const s1 = doc.splitTextToSize(t1, pageWidth - 2 * margin);
        doc.text(s1, margin, y);
        y += s1.length * 4 + 4;

        doc.setFillColor(245, 250, 245);
        doc.roundedRect(pageWidth / 2 - 45, y - 4, 90, 7, 1, 1, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(`Renda Bruta Declarada: R$ ${(data.totalFamilyIncome || 0).toFixed(2)}`, pageWidth / 2, y + 0.5, { align: 'center' });
        y += 9;

        doc.setFont("helvetica", "normal");
        const t2 = `Somente gastos extraordinários com saúde decorrentes de moléstia ou acidente e gastos indispensáveis, imprevistos e temporários podem ser deduzidos da renda bruta (Res. 133/2016).`;
        const s2 = doc.splitTextToSize(t2, pageWidth - 2 * margin);
        doc.text(s2, margin, y);
        y += s2.length * 4 + 5;

        const totS = (data.financial?.deductionItems || []).reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
        doc.text(`• Gastos extraordinários com saúde declarados: R$ ${totS.toFixed(2)}`, margin, y); y += 4.5;
        doc.text(`• Outros gastos extraordinários declarados: R$ 0.00`, margin, y); y += 8;

        doc.setFillColor(248);
        doc.rect(margin, y, pageWidth - 2 * margin, 65, 'F');
        y += 5;
        doc.setTextColor(30);
        doc.setFontSize(8.5);
        const tC = `Fica o requerente intimado do INDEFERIMENTO do pedido e arquivamento do PAJ por ultrapassar o limite legal.\n\nNão haverá atos em seu favor e prazos judiciais seguem correndo. Caso discorde, apresente documentação complementar em 30 dias para reanálise pelo Defensor Público responsável.`;
        const sC = doc.splitTextToSize(tC, pageWidth - 2 * margin - 10);
        doc.text(sC, margin + 5, y);

        doc.setFontSize(7.5);
        doc.setTextColor(150);
        doc.text('Defensoria Pública da União', margin, pageHeight - 8);
        doc.text(`Emitido em: ${hoje}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    doc.save('relatorio_dpu.pdf');
};
