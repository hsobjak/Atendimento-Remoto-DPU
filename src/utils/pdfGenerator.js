import jsPDF from 'jspdf';
import { calculateNetIncome } from './businessRules';

const getDataUri = (url) => {
    return new Promise((resolve, reject) => {
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
            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                ratio: this.naturalWidth / this.naturalHeight
            });
        };
        image.onerror = () => resolve(null); // Resolve null if fails
        image.src = url;
    });
};

export const generatePDF = async (data, result) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    // Helper to check page break
    const checkPageBreak = (heightNeeded) => {
        if (y + heightNeeded > pageHeight - 30) { // 30mm bottom margin for footer
            doc.addPage();
            y = 20; // Reset Y
            return true;
        }
        return false;
    };

    // Header Function (to be usable on new pages if needed, but for now just first page or manual)
    const drawHeader = async () => {
        try {
            const logoObj = await getDataUri('/logo_dpu_header.png');
            if (logoObj && logoObj.dataUrl) {
                // Determine dimensions maintaining aspect ratio
                // Fix height, adjust width
                const fixedHeight = 25;
                const logoWidth = fixedHeight * logoObj.ratio;

                doc.addImage(logoObj.dataUrl, 'PNG', margin, y, logoWidth, fixedHeight);

                doc.setFontSize(14); // Smaller title
                doc.setTextColor(0, 59, 40);

                // Adjust text position based on logo width
                const textX = margin + logoWidth + 5;

                doc.text('Defensoria Pública da União', textX, y + 8);

                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text('Garantia de Assistência Jurídica Integral e Gratuita', textX, y + 14);
                doc.text('Relatório Socioeconômico de Pré-Avaliação', textX, y + 20);

                y += 35;
            } else {
                // Fallback text only
                doc.setFontSize(16);
                doc.setTextColor(0, 59, 40);
                doc.text('Defensoria Pública da União', margin, y);
                y += 20;
            }
        } catch (e) {
            console.error("Logo error", e);
            y += 20;
        }

        doc.setDrawColor(200);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
    };

    await drawHeader();

    // Section 1: Result
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resultado da Avaliação: ' + result.message.toUpperCase(), margin, y);
    y += 8;

    doc.setFontSize(10);
    // Split text to fit width
    const splitJustification = doc.splitTextToSize('Justificativa: ' + result.justification, pageWidth - 2 * margin);
    doc.text(splitJustification, margin, y);
    y += splitJustification.length * 5 + 5;

    if (result.alerts.length > 0) {
        checkPageBreak(20);
        doc.setTextColor(200, 0, 0);
        const alertText = doc.splitTextToSize('Alertas: ' + result.alerts.join(', '), pageWidth - 2 * margin);
        doc.text(alertText, margin, y);
        doc.setTextColor(0);
        y += alertText.length * 5 + 10;
    }

    // Section 2: Requerente
    checkPageBreak(60);
    doc.setFontSize(12);
    doc.setTextColor(0, 59, 40);
    doc.text('Dados do Requerente', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0);

    const personalInfo = [
        `Nome: ${data.personal?.name || '-'}`,
        `CPF: ${data.personal?.cpf || '-'}`,
        `RG: ${data.personal?.rg || '-'}`,
        `Nascimento: ${data.personal?.birthDate || '-'}`,
        `Profissão: ${data.personal?.profession || '-'}`,
        `Endereço: ${data.personal?.address || '-'}`,
        `Telefone: ${data.personal?.phone || '-'}`
    ];

    personalInfo.forEach(line => {
        checkPageBreak(7);
        doc.text(line, margin, y);
        y += 5;
    });

    // Family Members List
    y += 5;
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.text('Composição Familiar', margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;

    // Combine Applicant + Members for display
    const allMembers = [
        {
            name: data.personal?.name || 'Requerente',
            kinship: 'Requerente (Próprio)',
            incomeValue: 0, // Fallback, though usually redundant as FamilyStep adds Applicant to members
            age: data.personal?.age || '-'
        },
        ...(data.family?.members || [])
    ];

    // If data.family.members ALREADY contains the applicant (depending on FamilyStep logic), we might duplicate.
    // In FamilyStep, the applicant is usually added to the members list implicitly or explicitly.
    // Looking at the screenshot provided earlier, "Marcos Silva" is in the list.
    // If the Context separates them, we merge. If Applicant is in members array, we just use members array.
    // Let's rely on data.family.members if it's populated, otherwise fallback to manual merge.

    const membersToDisplay = data.family?.members && data.family.members.length > 0
        ? data.family.members
        : allMembers.slice(0, 1); // Just applicant if empty

    membersToDisplay.forEach(member => {
        checkPageBreak(15);

        let incomeStr;
        const val = parseFloat(member.incomeValue);

        if (member.incomeValue === 0 || member.incomeValue === '0' || isNaN(val) || val === 0) {
            incomeStr = 'Sem Renda';
        } else {
            incomeStr = `R$ ${val.toFixed(2)}`;
        }

        const info = `${member.name} (${member.kinship || 'Outro'}) - ${member.age || '?'} anos - Renda: ${incomeStr}`;
        doc.text(info, margin, y);
        y += 5;
    });

    // Demand
    y += 5;
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.text('Dados da Demanda', margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;

    doc.text(`Tipo de Demanda: ${data.demand?.type || '-'}`, margin, y); y += 5;
    doc.text(`Objeto: ${data.demand?.object || '-'}`, margin, y); y += 5;
    doc.text(`Processo: ${data.demand?.processNumber || 'Sem processo'}`, margin, y); y += 5;

    const priorities = [];
    if (data.personal?.priorities?.elderly) priorities.push('Idoso');
    if (data.personal?.priorities?.pwd) priorities.push('PCD');
    doc.text(`Prioridades: ${priorities.length ? priorities.join(', ') : 'Nenhuma'}`, margin, y);
    y += 10;

    // Section 3: Financeiro
    checkPageBreak(60);
    doc.setFontSize(12);
    doc.setTextColor(0, 59, 40);
    doc.text('Análise Financeira e Patrimonial', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0);

    const netIncome = calculateNetIncome(data);
    const totalMembers = data.family.members.length || 1;
    const perCapita = netIncome / totalMembers;

    doc.text(`Membros do Núcleo Familiar: ${totalMembers}`, margin, y); y += 5;
    doc.text(`Renda Familiar Bruta: R$ ${data.totalFamilyIncome?.toFixed(2)}`, margin, y); y += 5;
    doc.text(`Deduções Extras: R$ ${data.financial?.extraDeduction?.value?.toFixed(2) || '0.00'}`, margin, y); y += 5;
    doc.text(`Renda Líquida: R$ ${netIncome.toFixed(2)}`, margin, y); y += 5;
    doc.text(`Renda Per Capita: R$ ${perCapita.toFixed(2)}`, margin, y); y += 10;

    // Expenses table simulation
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.text('Despesas Declaradas', margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const exp = data.financial?.expenses || {};
    doc.text(`Habitação (Aluguel/Água/Luz): R$ ${(parseFloat(exp.rent || 0) + parseFloat(exp.water || 0) + parseFloat(exp.light || 0)).toFixed(2)}`, margin, y); y += 5;
    doc.text(`Saúde/Alimentação: R$ ${(parseFloat(exp.health || 0) + parseFloat(exp.food || 0)).toFixed(2)}`, margin, y); y += 5;
    doc.text(`Transporte: R$ ${parseFloat(exp.transport || 0).toFixed(2)}`, margin, y); y += 10;

    // Assets
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.text('Patrimônio', margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const assetMap = {
        'nao': 'Não Possui',
        'sim_moradia': 'Único Imóvel (Moradia)',
        'sim_extra': 'Outros Imóveis',
        'sim_trabalho': 'Veículo de Trabalho',
        'sim_luxo': 'Veículo de Luxo'
    };
    doc.text(`Imóveis: ${assetMap[data.financial?.assets?.realEstate] || '-'}`, margin, y); y += 5;
    doc.text(`Veículos: ${assetMap[data.financial?.assets?.vehicle] || '-'}`, margin, y); y += 10;

    // Section 4: Documentos
    if (data.documents.files.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(12);
        doc.setTextColor(0, 59, 40);
        doc.text('Análise Documental (IA)', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(0);

        data.documents.files.forEach(d => {
            checkPageBreak(15);
            let statusText = d.inconsistency === 'none' ? 'Validado' : 'INCONSISTÊNCIA';
            let color = d.inconsistency === 'none' ? [0, 0, 0] : [220, 0, 0];
            doc.setTextColor(...color);
            doc.text(`Arquivo: ${d.name} (${statusText})`, margin, y);
            y += 5;
            if (d.detectedIncome) {
                doc.text(`Valor Detectado: R$ ${d.detectedIncome.toFixed(2)}`, margin, y);
                y += 5;
            }
            if (d.foundPerson) {
                doc.text(`Titular Identificado: ${d.foundPerson}`, margin, y);
                y += 5;
            }
        });
        doc.setTextColor(0);
    }

    // Disclaimer footer on ALL pages or just at end?
    // User requested overlap fix. Putting it at bottom of the current page if space, or new page.

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);

        // Institutional Disclaimer fixed at bottom
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont("helvetica", "italic");
        const footerText = 'AVISO: O resultado apresentado é orientativo e não substitui a análise do/a Defensor/a Público/a.';
        doc.text(footerText, margin, pageHeight - 15);
    }

    doc.save('relatorio_dpu.pdf');
};
