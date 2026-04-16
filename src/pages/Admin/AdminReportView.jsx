import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { generatePDF } from '../../utils/pdfGenerator';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/businessRules';
import { unmaskCurrency } from '../../utils/masks';

const AdminReportView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('admin_auth')) {
            navigate('/admin');
            return;
        }
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setReport(data);
        } catch (error) {
            console.error("Erro ao buscar relatório", error);
            alert("Não foi possível carregar os detalhes deste relatório.");
            navigate('/admin/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja Concluir? O relatório será movido para a Lixeira.')) {
            try {
                const { error } = await supabase
                    .from('assessments')
                    .update({ deleted_at: new Date().toISOString() })
                    .eq('id', id);
                    
                if (error) throw error;
                alert('Relatório movido para a Lixeira com sucesso.');
                navigate('/admin/dashboard');
            } catch (error) {
                console.error("Erro ao excluir", error);
                alert('Erro ao mover o relatório para a Lixeira.');
            }
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando dados...</div>;
    if (!report) return null;

    const { full_data: data, analysis_result: result } = report;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Voltar
                </button>
                <h2 style={{ margin: 0, color: '#333' }}>Detalhes do Assistido: {data.personal?.name}</h2>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Demanda: {data.demand?.type} - {data.demand?.object}</h3>
                        <p style={{ margin: '8px 0 0', color: '#666' }}><strong>CPF: </strong> {data.personal?.cpf} &nbsp; | &nbsp; <strong>Análise:</strong> {result.message}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={() => generatePDF(data, result, 'complete')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                            <Download size={18} /> Baixar Documento
                        </button>
                        <button className="btn-primary" onClick={handleDelete} style={{ background: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                            <FileText size={18} /> Concluir e Excluir
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card">
                    <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '16px' }}>Dados Pessoais</h4>
                    <p><strong>CPF:</strong> {data.personal.cpf}</p>
                    <p><strong>Nascimento:</strong> {data.personal.birthDate || 'Não inf.'}</p>
                    <p><strong>Estado Civil:</strong> {data.personal.civilStatus || 'Não inf.'}</p>
                    <p><strong>Endereço:</strong> {data.personal.street}, {data.personal.number} - {data.personal.neighborhood} (CEP: {data.personal.zipCode})</p>
                    <h5 style={{ marginTop: '16px', color: '#666' }}>Meios de Contato</h5>
                    <p><strong>Principal:</strong> {data.personal.phone || 'Não inf.'}</p>
                    <p><strong>Recado:</strong> {data.personal.alternativePhone || '-'}</p>
                    <p><strong>E-mail:</strong> {data.personal.email || '-'}</p>
                </div>
                
                <div className="card">
                    <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '16px' }}>Demanda</h4>
                    <p><strong>Tipo:</strong> {data.demand.type}</p>
                    <p><strong>Objeto:</strong> {data.demand.object}</p>
                    <p><strong>Nº Processo:</strong> {data.demand.processNumber || '-'}</p>
                    <p><strong>Observações:</strong> {data.demand.observations || '-'}</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '16px' }}>Composição Familiar e Renda</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Nome</th>
                            <th style={{ padding: '12px' }}>Parentesco</th>
                            <th style={{ padding: '12px' }}>Origem da Renda</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.family?.members?.map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{m.name} {m.age && `(${m.age} anos)`}</td>
                                <td style={{ padding: '12px' }}>{m.kinship}</td>
                                <td style={{ padding: '12px' }}>{m.incomeSource} {m.benefitType && `(${m.benefitType})`}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(unmaskCurrency(m.incomeValue))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default AdminReportView;
