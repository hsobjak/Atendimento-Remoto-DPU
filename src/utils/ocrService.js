import Tesseract from 'tesseract.js';

/**
 * Scan image file for text using Tesseract.js
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const scanDocument = async (file) => {
    // Simple check: only images supported directly by Tesseract.
    // For PDFs, we'd need to convert to canvas first with PDF.js.
    // Implementing simplified image support for MVP.

    if (file.type === 'application/pdf') {
        console.warn("PDF OCR not fully implemented in this lightweight MVP. Only checking metadata/filename or simple text extraction if possible.");
        return "OCR de PDF simplificado: texto não extraído neste MVP. Verifique visualmente.";
    }

    try {
        const worker = await Tesseract.createWorker('por');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
    } catch (error) {
        console.error("OCR Error:", error);
        return "";
    }
};

/**
 * Extracts possible currency values from text
 * @param {string} text 
 * @returns {number[]} list of values found
 */
export const extractValues = (text) => {
    // 1. Cleaner Text (remove extra spaces)
    const cleanText = text.replace(/\s+/g, ' ');

    // Helper to parse currency string (Europ. format 1.234,56 or simple 1234.56)
    const parseCurrency = (str) => {
        if (!str) return NaN;
        // Check if it has comma as last separator logic
        // If it matches 1.234,56 -> remove dots, replace comma with dot
        if (/^[\d\.]+,\d{2}$/.test(str)) {
            return parseFloat(str.replace(/\./g, '').replace(',', '.'));
        }
        // If it matches 1234.56 -> just parse
        if (/^\d+\.\d{2}$/.test(str)) {
            return parseFloat(str);
        }
        // Fallback: try standard pt-BR approach first
        let val = parseFloat(str.replace(/\./g, '').replace(',', '.'));
        if (isNaN(val)) {
            // Try en-US approach
            val = parseFloat(str);
        }
        return val;
    };

    // 2. Specific Strategies

    // Strategy A: "Líquido" context - highly specific
    // Regex allows specific misspellings/OCR errors: "Liq.", "Liquido", "Líquido", "Total Liquido"
    // Also captures value which might use dot or comma as decimal separator.
    const liquidoRegex = /(?:L[ií]quido|LIQUIDO|Liq\.|Total\s+L[ií]quido)[^0-9$]*([0-9\.,]+)/i;
    const liquidoMatch = cleanText.match(liquidoRegex);

    if (liquidoMatch) {
        const valStr = liquidoMatch[1];
        // Clean potential trailing punctuation like "." from OCR noise
        const cleanVal = valStr.replace(/[.,]$/, '');
        const val = parseCurrency(cleanVal);
        if (!isNaN(val)) return [val];
    }

    // Strategy B: "Proventos" or "Total" (Gross Income)
    const proventosRegex = /(?:Proventos|Bruto|Total|Vencimentos)[^0-9$]*([0-9\.,]+)/i;
    const proventosMatch = cleanText.match(proventosRegex);

    if (proventosMatch) {
        // Captured but still prefer strategy C sort if unsure, but keep this context logic if we needed gross.
        // For the MVP, we feed everything to the list.
    }

    // Strategy C: Find ALL currency-like values (X.XXX,XX or XXXX,XX) and sort descending (Fallback)
    // This regex looks for patterns like: 1.000,00 | 1000,00 | 1000.00
    const regex = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2})/gi;
    const matches = [...cleanText.matchAll(regex)];

    const values = matches.map(m => {
        return parseCurrency(m[1] || m[0]); // Logic handles the format
    }).filter(v => !isNaN(v) && v > 100); // Filter out small amounts

    // Sort descending
    return values.sort((a, b) => b - a);
};

export const detectInconsistency = (detectedValue, declaredValue, tolerance = 0.1) => {
    if (!detectedValue) return false;
    // Logic: If detected is significantly HIGHER than declared, it's a problem for Hipossuficiencia.
    // If detected is LOWER, usually not a problem (errors in OCR or net vs gross).
    // Let's flag if Detected > Declared + 10%

    if (detectedValue > (declaredValue + (declaredValue * tolerance))) {
        return true;
    }
    return false;
};

/**
 * Searches for known people names in the text
 * @param {string} text 
 * @param {string[]} peopleNames 
 * @returns {string|null} found name or null
 */
export const findPersonInText = (text, peopleNames) => {
    if (!text || !peopleNames || peopleNames.length === 0) return null;

    const cleanText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    for (const name of peopleNames) {
        if (!name) continue;
        // Search by full name or at least First + Last name if long enough
        const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        // Simple inclusion check
        if (cleanText.includes(cleanName)) {
            return name;
        }

        // Optional: Check purely First Name + Last Name? 
        // Might be too risky for common names (Maria, Jose). Sticking to full name provided or significant parts.
        const parts = cleanName.split(' ');
        if (parts.length >= 2) {
            const firstLast = `${parts[0]} ${parts[parts.length - 1]}`;
            if (cleanText.includes(firstLast)) return name;
        }
    }
    return null;
};
