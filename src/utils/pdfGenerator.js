import jsPDF from 'jspdf';
import { formatCurrency, calculateNetIncome } from './businessRules';
import { unmaskCurrency } from './masks';

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

export const generatePDF = async (data, result, mode = 'objective') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    const isComplete = mode === 'complete';
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
                doc.setFontSize(10);
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
        checkPageBreak(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 59, 40);
        doc.text(text, margin, y);
        doc.setDrawColor(0, 59, 40);
        doc.line(margin, y + 0.5, pageWidth - margin, y + 0.5);
        doc.setFont("helvetica", "normal");
        y += 6;
    };

    const row = (label, value) => {
        checkPageBreak(6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const labelText = `${label}: `;
        doc.text(labelText, margin, y);
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(labelText);
        doc.text(String(value || '-'), margin + labelWidth + 2, y);
        y += 5.5;
    };


    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // --- PÁGINA 1: RELATÓRIO ---
    await drawHeader(isComplete ? 'Formulário Socioeconômico Detalhado' : 'Formulário Socioeconômico');

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Emitido em: ${hoje} `, pageWidth - margin, y, { align: 'right' });
    doc.setTextColor(0);
    y += 4;

    sectionTitle('Resultado da Avaliação');
    const statusColors = { ELIGIBLE_AUTOMATIC: [46, 125, 50], NOT_ELIGIBLE: [198, 40, 40], NEEDS_ANALYSIS: [230, 120, 0] };
    const [r, g, b] = statusColors[result.status] || [0, 0, 0];
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.setFontSize(10);
    const splitMessage = doc.splitTextToSize(result.message.toUpperCase(), pageWidth - 2 * margin);
    doc.text(splitMessage, margin, y);
    y += splitMessage.length * 5;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    y += 6;

    const splitJust = doc.splitTextToSize(`Justificativa: ${result.justification} `, pageWidth - 2 * margin);
    doc.text(splitJust, margin, y);
    y += splitJust.length * 5 + 2;

    if (result.alerts?.length > 0) {
        doc.setTextColor(198, 40, 40);
        doc.setFont("helvetica", "bold");
        const alertsText = result.alerts.join(' | ');
        const splitAlerts = doc.splitTextToSize(alertsText, pageWidth - 2 * margin);
        doc.text(splitAlerts, margin, y);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        y += splitAlerts.length * 5 + 4;
    }

    sectionTitle('1. Dados do Assistido');
    row('Nome', data.personal?.name);
    row('CPF', data.personal?.cpf);

    if (isComplete) {
        row('RG', data.personal?.rg);
        row('Nascimento', data.personal?.birthDate ? new Date(data.personal.birthDate).toLocaleDateString('pt-BR') : '-');
        row('Estado Civil', data.personal?.civilStatus);
        row('Profissão', data.personal?.profession);
        row('Telefone', data.personal?.phone);

        const priorities = [];
        if (data.personal?.priorities?.elderly) priorities.push('Idoso');
        if (data.personal?.priorities?.pwd) priorities.push('PcD');
        if (data.personal?.priorities?.illness) priorities.push('Doença Grave');
        if (data.personal?.priorities?.urgency) priorities.push('Urgência');
        row('Prioridades', priorities.length > 0 ? priorities.join(', ') : 'Nenhuma');

        if (data.personal?.isRepresented === 'sim') {
            row('Representado por', data.personal.representativeName);
        }
    }

    const { street, number, neighborhood, zipCode, complement } = data.personal || {};
    const fullAddress = street
        ? `${street}, Nº ${number || 'S/N'}, ${neighborhood || ''}${complement ? ` (${complement})` : ''} - CEP: ${zipCode || ''} `
        : '-';

    row('Endereço', fullAddress);

    y += 1;

    if (isComplete) {
        sectionTitle('2. Contexto da Demanda');
        row('Tipo', data.demand?.type);
        row('Objeto/Pedido', data.demand?.object);
        if (data.demand?.processNumber) row('Nº Processo', data.demand.processNumber);
        y += 2;
    }

    sectionTitle(isComplete ? '3. Grupo Familiar e Renda' : 'Grupo Familiar e Renda');
    const members = data.family?.members || [];
    if (members.length === 0) {
        doc.text('Nenhum membro informado.', margin, y);
        y += 5;
    } else {
        const colX = [margin, margin + 35, margin + 68, margin + 105, margin + 120, margin + 155];
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setFillColor(240, 245, 240);
        doc.rect(margin, y - 4, pageWidth - 2 * margin, 6, 'F');
        ['Nome', 'CPF', 'Parentesco', 'Idade', 'Origem', 'Renda'].forEach((h, i) => doc.text(h, colX[i], y));
        doc.setFont("helvetica", "normal");
        y += 6;
        members.forEach((m) => {
            checkPageBreak(6);
            const isBpcBolsa = m.benefitType === 'BPC' || m.benefitType === 'Bolsa Família';
            const val = unmaskCurrency(m.incomeValue);
            const rendaStr = isBpcBolsa ? m.benefitType : (val > 0 ? formatCurrency(val) : 'R$ 0,00');
            doc.text(String(m.name || '-').substring(0, 16), colX[0], y);
            doc.text(String(m.cpf || '-').substring(0, 14), colX[1], y);
            doc.text(String(m.kinship || '-').substring(0, 16), colX[2], y);
            doc.text(String(m.age || '-'), colX[3], y);
            doc.text(String(isBpcBolsa ? 'Benefício' : (m.incomeSource || '-')).substring(0, 15), colX[4], y);
            if (isBpcBolsa) doc.setTextColor(120);
            doc.text(rendaStr, colX[5], y);
            doc.setTextColor(0);
            y += 6;
        });
    }

    const netIncome = calculateNetIncome(data);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Renda Familiar Bruta: ${formatCurrency(data.totalFamilyIncome)} `, margin, y + 2); y += 6;
    doc.text(`Renda Líquida Apurada: ${formatCurrency(netIncome)} `, margin, y + 1); y += 6;

    y += 8; // Extra spacing before section
    sectionTitle(isComplete ? '4. Gastos Declarados' : 'Gastos Declarados');
    const expLabels = { rent: 'Aluguel', water: 'Água', light: 'Luz', food: 'Alimentação', health: 'Saúde', transport: 'Transporte' };

    const exp = data.financial?.expenses || {};
    const filledExp = Object.entries(expLabels).filter(([k]) => unmaskCurrency(exp[k]) > 0);
    const customExp = (data.financial?.customExpenses || []).filter(e => unmaskCurrency(e.value) > 0);
    const deductions = data.financial?.deductionItems || [];

    if (filledExp.length === 0 && customExp.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text('Nenhum gasto comum informado.', margin, y);
        y += 5;
    } else {
        filledExp.forEach(([k, label]) => row(label, formatCurrency(unmaskCurrency(exp[k]))));
        customExp.forEach(item => row(item.description, formatCurrency(unmaskCurrency(item.value))));
    }

    if (deductions.length > 0) {
        y += 8;
        sectionTitle('Gastos Extraordinários (Deduções)');
        doc.setTextColor(198, 40, 40); // Red
        doc.setFont("helvetica", "bold");

        deductions.forEach(item => {
            checkPageBreak(5);
            const labelText = `${item.description}: `;
            doc.text(labelText, margin, y);
            const labelWidth = doc.getTextWidth(labelText);
            doc.text(formatCurrency(unmaskCurrency(item.value)), margin + labelWidth + 2, y);
            y += 4.5;
        });

        doc.setTextColor(0); // Reset color
        doc.setFont("helvetica", "normal");
    }

    if (isComplete) {
        y += 8;
        sectionTitle('5. Patrimônio e Investimentos');
        const assets = data.financial?.assets || {};
        const assetLabels = {
            nao: 'Não possui',
            sim_moradia: 'Sim, único (Moradia)',
            sim_extra: 'Sim, possui outros imóveis',
            sim_trabalho: 'Sim, popular/trabalho',
            sim_luxo: 'Sim, luxo/alto valor'
        };
        row('Imóvel', assetLabels[assets.realEstate]);
        row('Veículo', assetLabels[assets.vehicle]);

        const investments = data.financial?.investments || [];
        if (investments.length > 0) {
            y += 2;
            doc.setFont("helvetica", "bold");
            doc.text('Investimentos Financeiros:', margin, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            investments.forEach(inv => {
                checkPageBreak(5);
                doc.text(`- ${inv.description}: ${formatCurrency(unmaskCurrency(inv.value))} `, margin + 5, y);
                y += 5;
            });
        } else {
            row('Investimentos', 'Não possui');
        }
    }

    checkPageBreak(40);
    y += 10;
    sectionTitle(isComplete ? '5. Declarações Finais' : 'Declarações Finais');
    doc.setFontSize(10);
    const truthSelected = data.demand?.declarations?.truthfulness ? 'X' : ' ';
    const hypoSelected = data.demand?.declarations?.hyposufficiency ? 'X' : ' ';
    doc.text(`[${truthSelected}]  Atesto a veracidade das informações prestadas.`, margin, y);
    y += 7;
    doc.text(`[${hypoSelected}]  Declaro hipossuficiência econômica para fins de assistência.`, margin, y);
    y += 12;
    y += 15;
    checkPageBreak(10);
    doc.line(margin, y, margin + 70, y);
    doc.setFontSize(8);
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
        doc.setFontSize(11);
        doc.setTextColor(0);

        const t1 = `Para fins de atendimento na Defensoria Pública da União, a Resolução nº 240, de 04 de dezembro de 2025, do Conselho Superior da DPU, estabelece que o valor de presunção de necessidade econômica é de renda familiar bruta de até 2(dois) salários mínimos, atualmente R$ 3.036,00.`;
        const s1 = doc.splitTextToSize(t1, pageWidth - 2 * margin);
        doc.text(s1, margin, y, { align: 'justify', maxWidth: pageWidth - 2 * margin });
        y += s1.length * 5 + 4;

        const t3 = `Na pesquisa socioeconômica realizada, ficou demonstrado que sua renda bruta familiar é superior ao limite estabelecido.`;
        const s3 = doc.splitTextToSize(t3, pageWidth - 2 * margin);
        doc.text(s3, margin, y, { align: 'justify', maxWidth: pageWidth - 2 * margin });
        y += s3.length * 5 + 4;

        doc.setFont("helvetica", "bold");
        doc.text(`Renda bruta declarada: `, margin + 30, y);
        doc.setFillColor(230);
        doc.rect(margin + 75, y - 5, 40, 7, 'F');
        doc.text(formatCurrency(data.totalFamilyIncome), margin + 95, y, { align: 'center' });
        y += 12;

        doc.setFont("helvetica", "bold");
        const t2_bold = `As despesas ordinárias e comuns(água, luz, telefone, alimentação, moradia, etc) e aquelas que evidenciam gastos não compatíveis com a condição de pobreza(plano de saúde, tv por assinatura, escolas privadas etc) não são dedutíveis para fins de atendimento.Somente gastos extraordinários com saúde decorrentes de moléstia ou acidente e os gastos extraordinários considerados indispensáveis, temporários e imprevistos poderão ser deduzidos da renda bruta familiar(Resolução nº 240 / 2025 do CSDPU).`;
        const s2 = doc.splitTextToSize(t2_bold, pageWidth - 2 * margin);
        doc.text(s2, margin, y, { align: 'justify', maxWidth: pageWidth - 2 * margin });
        y += s2.length * 5 + 6;

        const totS = (data.financial?.deductionItems || []).reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
        doc.setFont("helvetica", "normal");
        const t4 = `Gastos extraordinários com saúde decorrentes de moléstia ou acidente declarados: `;
        const s4 = doc.splitTextToSize(t4, pageWidth - 2 * margin - 40);
        doc.text(s4, margin, y);
        doc.setFillColor(230);
        doc.rect(pageWidth - margin - 35, y - 5, 35, 7, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrency(totS), pageWidth - margin - 17.5, y, { align: 'center' });
        y += s4.length * 5 + 3;

        doc.setFont("helvetica", "normal");
        const t5 = `Gastos extraordinários diversos(indispensáveis, temporários e imprevistos) declarados: `;
        const s5 = doc.splitTextToSize(t5, pageWidth - 2 * margin - 40);
        doc.text(s5, margin, y);
        doc.setFillColor(230);
        doc.rect(pageWidth - margin - 35, y - 5, 35, 7, 'F');
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrency(0), pageWidth - margin - 17.5, y, { align: 'center' });
        y += s5.length * 5 + 7;

        doc.setFillColor(235);
        doc.rect(margin, y, pageWidth - 2 * margin, 75, 'F');
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        const c1 = `Considerando que a renda familiar bruta declarada ultrapassa o parâmetro definido na Resolução nº 240 / 2025, do CSDPU, fica o requerente intimado do INDEFERIMENTO do requerimento de assistência jurídica gratuita e, consequentemente, do arquivamento do Procedimento de Assistência Jurídica - PAJ.`;
        const sc1 = doc.splitTextToSize(c1, pageWidth - 2 * margin - 10);
        doc.text(sc1, margin + 5, y, { align: 'justify', maxWidth: pageWidth - 2 * margin - 10 });
        y += sc1.length * 5 + 3;

        const c2 = `O requerente fica ciente de que, em razão do indeferimento da assistência jurídica gratuita, não haverá prática de qualquer ato, administrativo ou judicial, em seu favor, e que eventuais prazos judiciais existentes continuam em curso, normalmente.`;
        const sc2 = doc.splitTextToSize(c2, pageWidth - 2 * margin - 10);
        doc.text(sc2, margin + 5, y, { align: 'justify', maxWidth: pageWidth - 2 * margin - 10 });
        y += sc2.length * 5 + 3;

        doc.setFont("helvetica", "normal");
        const c3 = `Caso não concorde com o indeferimento, o requerente poderá, no prazo de 30 dias, apresentar documentação complementar que prove sua condição de pobreza, juntamente com os comprovantes de renda de todos os integrantes da família e com comprovantes dos gastos extraordinários dedutíveis, se houver.`;
        const sc3 = doc.splitTextToSize(c3, pageWidth - 2 * margin - 10);
        doc.text(sc3, margin + 5, y, { align: 'justify', maxWidth: pageWidth - 2 * margin - 10 });
        y += sc3.length * 5 + 3;

        const c4 = `Apresentada a documentação, será reanalisado o requerimento pelo Defensor Público responsável, que poderá manter o arquivamento ou deferir a assistência jurídica solicitada, caso considere provada a condição de pobreza.`;
        const sc4 = doc.splitTextToSize(c4, pageWidth - 2 * margin - 10);
        doc.text(sc4, margin + 5, y, { align: 'justify', maxWidth: pageWidth - 2 * margin - 10 });

        y = pageHeight - 45;
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
        doc.text(`Emitido em: ${hoje} `, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    doc.save('relatorio_dpu.pdf');
};
