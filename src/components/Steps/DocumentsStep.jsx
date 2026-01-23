import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { TIPOS_DEMANDA } from '../../utils/constants';
import { scanDocument, extractValues, detectInconsistency, findPersonInText } from '../../utils/ocrService';
import { calculateNetIncome } from '../../utils/businessRules';
import { Upload, FileText, CheckSquare, BrainCircuit, AlertTriangle } from 'lucide-react';

const DocumentsStep = () => {
    const { data, updateData } = useAssessment();
    const navigate = useNavigate();
    const [analyzing, setAnalyzing] = useState(false);

    const updateDemand = (field, value) => {
        updateData('demand', { [field]: value });
    };

    const updateDeclaration = (field, value) => {
        updateData('demand', {
            declarations: { ...data.demand?.declarations, [field]: value }
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newDocs = files.map(file => ({
            id: Date.now() + Math.random(), // Unique ID
            name: file.name,
            fileObj: file,
            status: 'ready',
            inconsistency: 'none',
            detectedIncome: 0
        }));

        const updatedDocs = [...data.documents.files, ...newDocs];
        updateData('documents', { files: updatedDocs });
    };

    const executeAnalysis = async () => {
        setAnalyzing(true);

        const processedDocs = await Promise.all(data.documents.files.map(async (doc) => {
            if (doc.status === 'processed') return doc;

            // 1. OCR Scan
            // Safety check: Needs fileObj. If missing (legacy usage), skip.
            if (!doc.fileObj) return doc;

            const text = await scanDocument(doc.fileObj);

            // 2. Extract Values
            const values = extractValues(text);
            const highestValue = values.length > 0 ? values[0] : 0;

            // 3. Compare with Declared Family Income
            const declared = data.totalFamilyIncome || 0;
            const isInconsistent = detectInconsistency(highestValue, declared);

            return {
                ...doc,
                status: 'processed',
                rawText: text,
                detectedIncome: highestValue,
                inconsistency: isInconsistent ? 'high_value' : 'none'
            };
        }));

        updateData('documents', { files: processedDocs });
        setAnalyzing(false);

        navigate('/result');
    };

    return (
        <div className="card">
            <h2>4. Documentação e Análise</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Contexto, envio de arquivos e análise automatizada.
            </p>

            <div className="form-group">
                <label className="form-label">Tipo de Demanda</label>
                <select className="form-control" value={data.demand?.type} onChange={e => updateDemand('type', e.target.value)}>
                    <option value="">Selecione...</option>
                    {Object.values(TIPOS_DEMANDA).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Objeto / Pedido</label>
                <input className="form-control" placeholder="Ex: Auxílio-Doença, Medicamento oncológico, Absolvição" value={data.demand?.object} onChange={e => updateDemand('object', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">Nº Processo (Se houver)</label>
                <input className="form-control" placeholder="Opcional" value={data.demand?.processNumber} onChange={e => updateDemand('processNumber', e.target.value)} />
            </div>

            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '24px', marginBottom: '16px' }}>1. Upload de Documentos</h3>

            <div style={{ border: '2px dashed #ddd', padding: '30px', textAlign: 'center', borderRadius: '8px', background: '#fafafa' }}>
                <Upload size={30} color="#fbc02d" style={{ marginBottom: '10px' }} />
                <p style={{ fontWeight: 500 }}>Clique para os documentos (RG, CPF, Renda, Residência)</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>Suporta PDF e Imagens</p>
                <input type="file" multiple onChange={handleFileUpload} style={{ marginTop: '10px' }} />
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                {data.documents.files.length === 0 ? 'Nenhum arquivo.' : `${data.documents.files.length} arquivo(s) anexado(s).`}
            </div>

            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '24px', marginBottom: '16px' }}>2. Declarações</h3>

            <div style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #90caf9', cursor: 'pointer', color: '#1565c0', fontWeight: 500 }}>
                    <input type="checkbox" checked={data.demand?.declarations?.truthfulness} onChange={e => updateDeclaration('truthfulness', e.target.checked)} />
                    Atesto a veracidade das informações e documentos.
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #90caf9', cursor: 'pointer', color: '#1565c0', fontWeight: 500 }}>
                    <input type="checkbox" checked={data.demand?.declarations?.hyposufficiency} onChange={e => updateDeclaration('hyposufficiency', e.target.checked)} />
                    Declaro hipossuficiência econômica.
                </label>
            </div>

            <h3 style={{ fontSize: '1rem', color: '#444', marginTop: '24px', marginBottom: '16px' }}>3. Análise Inteligente</h3>

            <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '6px', fontSize: '0.9rem', color: '#444', marginBottom: '20px' }}>
                O sistema irá executar a análise baseada na Portaria DPU 2026, com individualização de renda e presunção restrita.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className="btn-secondary" onClick={() => navigate('/step/3')}>Voltar</button>
                <button className="btn-primary" style={{ background: '#0d47a1', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={executeAnalysis}>
                    {analyzing ? 'Analisando...' : <><BrainCircuit size={18} /> Executar Análise IA</>}
                </button>
            </div>
        </div>
    );
};

export default DocumentsStep;
