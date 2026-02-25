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
        doc.text(String(value), margin + labelWidth + 2, y); // Added + 2 for spacing
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
    row('CPF', data.personal?.cpf || '-');

    const { street, number, neighborhood, zipCode, complement } = data.personal || {};
    const fullAddress = street
        ? `${street}, Nº ${number || 'S/N'}, ${neighborhood || ''}${complement ? ` (${complement})` : ''} - CEP: ${zipCode || ''}`
        : '-';

    row('Endereço', fullAddress);

    y += 1;

    sectionTitle('Grupo Familiar e Renda');
    const members = data.family?.members || [];
    if (members.length === 0) {
        doc.text('Nenhum membro informado.', margin, y);
        y += 5;
    } else {
        const colX = [margin, margin + 40, margin + 70, margin + 85, margin + 115, margin + 150];
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setFillColor(240, 245, 240);
        doc.rect(margin, y - 3, pageWidth - 2 * margin, 4.5, 'F');
        ['Nome', 'CPF', 'Parentesco', 'Idade', 'Origem', 'Renda'].forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont("helvetica", "normal");
        y += 4.5;
        members.forEach((m) => {
            checkPageBreak(5);
            const isBpcBolsa = m.benefitType === 'BPC' || m.benefitType === 'Bolsa Família';
            const rendaStr = isBpcBolsa ? m.benefitType : (parseFloat(m.incomeValue) > 0 ? `R$ ${parseFloat(m.incomeValue).toFixed(2)}` : 'R$ 0,00');
            doc.text(String(m.name || '-').substring(0, 18), colX[0], y);
            doc.text(String(m.cpf || '-').substring(0, 14), colX[1], y);
            doc.text(String(m.kinship || '-').substring(0, 12), colX[2], y);
            doc.text(String(m.age || '-'), colX[3], y);
            doc.text(String(isBpcBolsa ? 'Benefício' : (m.incomeSource || '-')).substring(0, 15), colX[4], y);
            if (isBpcBolsa) doc.setTextColor(120);
            doc.text(rendaStr, colX[5], y);
            doc.setTextColor(0);
            y += 4.5;
        });
    }

    const netIncome = calculateNetIncome(data);
    doc.setFont("helvetica", "bold");
    doc.text(`Renda Familiar Bruta: R$ ${(data.totalFamilyIncome || 0).toFixed(2)}`, margin, y + 2); y += 5;
    doc.text(`Renda Líquida Apurada: R$ ${netIncome.toFixed(2)}`, margin, y + 1); y += 5;

    y += 8; // Extra spacing before section
    sectionTitle('Gastos Declarados');
    const expLabels = { rent: 'Aluguel', water: 'Água', light: 'Luz', food: 'Alimentação', health: 'Saúde', transport: 'Transporte' };

    const exp = data.financial?.expenses || {};
    const filledExp = Object.entries(expLabels).filter(([k]) => parseFloat(exp[k]) > 0);
    const customExp = (data.financial?.customExpenses || []).filter(e => parseFloat(e.value) > 0);
    const dedItems = data.financial?.deductionItems || [];

    if (filledExp.length === 0 && customExp.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text('Nenhum gasto comum informado.', margin, y);
        y += 5;
    } else {
        filledExp.forEach(([k, label]) => row(label, `R$ ${parseFloat(exp[k]).toFixed(2)}`));
        customExp.forEach(item => row(item.description, `R$ ${parseFloat(item.value).toFixed(2)}`));
    }

    if (dedItems.length > 0) {
        y += 8;
        sectionTitle('Gastos Extraordinários (Deduções)');
        doc.setTextColor(198, 40, 40); // Red
        doc.setFont("helvetica", "bold");

        dedItems.forEach(item => {
            checkPageBreak(5);
            const labelText = `${item.description}: `;
            doc.text(labelText, margin, y);
            const labelWidth = doc.getTextWidth(labelText);
            doc.text(`R$ ${parseFloat(item.value).toFixed(2)}`, margin + labelWidth + 2, y);
            y += 4.5;
        });

        doc.setTextColor(0); // Reset color
        doc.setFont("helvetica", "normal");
    }

    checkPageBreak(30);

    y += 8; // Extra spacing before section
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

        const t1 = `Para fins de atendimento na Defensoria Pública da União, a Resolução nº 134, de 07 de dezembro de 2016, do Conselho Superior da DPU, estabelece que o valor de presunção de necessidade econômica é de renda familiar bruta de até R$ 2.000,00 (dois mil reais).`;
        const s1 = doc.splitTextToSize(t1, pageWidth - 2 * margin);
        doc.text(s1, margin, y);
        y += s1.length * 4 + 4;

        doc.text(`Na pesquisa socioeconômica realizada, ficou demonstrado que sua renda bruta familiar é superior ao limite estabelecido.`, margin, y);
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.text(`Renda bruta declarada:`, margin + 30, y);
        doc.setFillColor(230);
        doc.rect(margin + 75, y - 4, 30, 6, 'F');
        doc.text(`R$ ${(data.totalFamilyIncome || 0).toFixed(2)}`, margin + 90, y, { align: 'center' });
        y += 10;

        doc.setFont("helvetica", "bold");
        const t2_bold = `As despesas ordinárias e comuns (água, luz, telefone, alimentação, moradia, etc) e aquelas que evidenciam gastos não compatíveis com a condição de pobreza (plano de saúde, tv por assinatura, escolas privadas etc) não são dedutíveis para fins de atendimento. Somente gastos extraordinários com saúde decorrentes de moléstia ou acidente e os gastos extraordinários considerados indispensáveis, temporários e imprevistos poderão ser deduzidos da renda bruta familiar (art. 5º da Resolução 133/2016 do CSDPU).`;
        const s2 = doc.splitTextToSize(t2_bold, pageWidth - 2 * margin);
        doc.text(s2, margin, y);
        y += s2.length * 4 + 6;

        const totS = (data.financial?.deductionItems || []).reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Gastos extraordinários com saúde decorrentes de moléstia ou acidente declarados:`, margin, y);
        doc.setFillColor(230);
        doc.rect(pageWidth - margin - 25, y - 4, 25, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(`R$ ${totS.toFixed(2)}`, pageWidth - margin - 12.5, y, { align: 'center' });
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.text(`Gastos extraordinários diversos (indispensáveis, temporários e imprevistos) declarados:`, margin, y);
        doc.setFillColor(230);
        doc.rect(pageWidth - margin - 25, y - 4, 25, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(`R$ 0.00`, pageWidth - margin - 12.5, y, { align: 'center' });
        y += 10;

        doc.setFillColor(235);
        doc.rect(margin, y, pageWidth - 2 * margin, 68, 'F');
        y += 4;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        const c1 = `Considerando que a renda familiar bruta declarada ultrapassa o parâmetro definido na Resolução nº 134/2016, do CSDPU, fica o requerente intimado do INDEFERIMENTO do requerimento de assistência jurídica gratuita e, consequentemente, do arquivamento do Procedimento de Assistência Jurídica - PAJ.`;
        const sc1 = doc.splitTextToSize(c1, pageWidth - 2 * margin - 10);
        doc.text(sc1, margin + 5, y);
        y += sc1.length * 4 + 3;

        const c2 = `O requerente fica ciente de que, em razão do indeferimento da assistência jurídica gratuita, não haverá prática de qualquer ato, administrativo ou judicial, em seu favor, e que eventuais prazos judiciais existentes continuam em curso, normalmente.`;
        const sc2 = doc.splitTextToSize(c2, pageWidth - 2 * margin - 10);
        doc.text(sc2, margin + 5, y);
        y += sc2.length * 4 + 3;

        doc.setFont("helvetica", "normal");
        const c3 = `Caso não concorde com o indeferimento, o requerente poderá, no prazo de 30 dias, apresentar documentação complementar que prove sua condição de pobreza, juntamente com os comprovantes de renda de todos os integrantes da família e com comprovantes dos gastos extraordinários dedutíveis, se houver.`;
        const sc3 = doc.splitTextToSize(c3, pageWidth - 2 * margin - 10);
        doc.text(sc3, margin + 5, y);
        y += sc3.length * 4 + 3;

        const c4 = `Apresentada a documentação, será reanalisado o requerimento pelo Defensor Público responsável, que poderá manter o arquivamento ou deferir a assistência jurídica solicitada, caso considere provada a condição de pobreza.`;
        const sc4 = doc.splitTextToSize(c4, pageWidth - 2 * margin - 10);
        doc.text(sc4, margin + 5, y);

        y += 15;
        doc.setDrawColor(0);
        doc.line(margin, y, margin + 70, y);
        doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
        y += 4;
        doc.setFontSize(7.5);
        doc.text('Assinatura do Assistido(a)', margin, y);
        doc.text('Atendente da DPU', pageWidth - margin, y, { align: 'right' });

        doc.setFontSize(7.5);
        doc.setTextColor(150);
        doc.text('Defensoria Pública da União', margin, pageHeight - 8);
        doc.text(`Emitido em: ${hoje}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    doc.save('relatorio_dpu.pdf');
};
