import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { generatePDF } from '../../utils/pdfGenerator';
import { ArrowLeft, FileText, Download, User, MapPin, Briefcase, Users, DollarSign, Activity, Trash2, CheckCircle } from 'lucide-react';
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

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Activity className="spin" size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Carregando dados do relatório...</p>
        </div>
    );
    
    if (!report) return null;

    const { full_data: data, analysis_result: result } = report;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary" style={{ padding: '8px 16px', border: '1px solid #E2E8F0' }}>
                        <ArrowLeft size={18} /> Voltar
                    </button>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.8rem' }}>{data.personal?.name}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>Ficha de Atendimento Socioeconômico</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => generatePDF(data, result, 'complete')} style={{ border: '1px solid #E2E8F0', padding: '10px 20px' }}>
                        <Download size={18} /> Baixar PDF
                    </button>
                    <button className="btn-primary" onClick={handleDelete} style={{ padding: '10px 24px' }}>
                        <CheckCircle size={18} /> Concluir Atendimento
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '32px', borderTop: `6px solid ${result.status === 'ELIGIBLE_AUTOMATIC' ? '#48BB78' : result.status === 'NOT_ELIGIBLE' ? '#F56565' : '#ECC94B'}` }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ 
                        background: result.status === 'ELIGIBLE_AUTOMATIC' ? '#F0FFF4' : result.status === 'NOT_ELIGIBLE' ? '#FFF5F5' : '#FFFBEB',
                        padding: '20px',
                        borderRadius: '12px',
                        color: result.status === 'ELIGIBLE_AUTOMATIC' ? '#38A169' : result.status === 'NOT_ELIGIBLE' ? '#E53E3E' : '#D69E2E'
                    }}>
                        <Activity size={32} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resultado da Triagem Automática</h4>
                        <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{result.message}</p>
                        <p style={{ margin: '12px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                            CPF: <strong>{data.personal?.cpf}</strong> &nbsp; | &nbsp; 
                            ID do Sistema: <strong>{report.id.split('-')[0].toUpperCase()}</strong>
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--color-primary)' }}>
                        <User size={20} /> Informações do Assistido
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '4px' }}>Data de Nascimento</p>
                            <p style={{ fontWeight: 600 }}>{data.personal.birthDate || 'Não informada'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '4px' }}>Estado Civil</p>
                            <p style={{ fontWeight: 600 }}>{data.personal.civilStatus || 'Não informado'}</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '4px' }}>Endereço Residencial</p>
                        <p style={{ fontWeight: 600, lineHeight: 1.5 }}>
                            {data.personal.street}, {data.personal.number} {data.personal.complement && `- ${data.personal.complement}`}<br />
                            {data.personal.neighborhood} — CEP: {data.personal.zipCode}
                        </p>
                    </div>
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #EDF2F7' }}>
                        <h5 style={{ fontSize: '0.9rem', marginBottom: '16px', color: '#4A5568' }}>Canais de Contato</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>Telefone Principal</p>
                                <p style={{ fontWeight: 600 }}>{data.personal.phone || 'Não inf.'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>E-mail</p>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.personal.email || 'Não inf.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--color-primary)' }}>
                        <Briefcase size={20} /> Objeto da Demanda
                    </h4>
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '4px' }}>Área de Atuação</p>
                        <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{data.demand.type}</p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '4px' }}>Assunto / Pedido</p>
                        <p style={{ fontWeight: 600 }}>{data.demand.object}</p>
                    </div>
                    {data.demand.processNumber && (
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '4px' }}>Número do Processo</p>
                            <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{data.demand.processNumber}</p>
                        </div>
                    )}
                    {data.demand.observations && (
                        <div style={{ marginTop: '20px', padding: '12px', background: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>Observações Internas</p>
                            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{data.demand.observations}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #EDF2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--color-primary)' }}>
                        <Users size={20} /> Composição Familiar e Renda Mensal
                    </h4>
                    <span style={{ fontSize: '0.9rem', color: '#718096' }}>{data.family?.members?.length} pessoas no núcleo familiar</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', color: '#4A5568', fontSize: '0.85rem' }}>NOME / IDADE</th>
                                <th style={{ padding: '16px 24px', color: '#4A5568', fontSize: '0.85rem' }}>PARENTESCO</th>
                                <th style={{ padding: '16px 24px', color: '#4A5568', fontSize: '0.85rem' }}>FONTE DE RENDA</th>
                                <th style={{ padding: '16px 24px', color: '#4A5568', fontSize: '0.85rem', textAlign: 'right' }}>VALOR DECLARADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.family?.members?.map((m, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7' }} className="table-row">
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>{m.age ? `${m.age} anos` : 'Idade não inf.'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#4A5568' }}>{m.kinship}</td>
                                    <td style={{ padding: '16px 24px', color: '#4A5568' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <DollarSign size={14} color="#A0AEC0" />
                                            {m.incomeSource} {m.benefitType && <span style={{ fontSize: '0.85rem', color: '#718096' }}>({m.benefitType})</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        {formatCurrency(unmaskCurrency(m.incomeValue))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#F8FAFC', fontWeight: 700 }}>
                                <td colSpan="3" style={{ padding: '20px 24px', textAlign: 'right', color: '#4A5568' }}>RENDA FAMILIAR TOTAL</td>
                                <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                                    {formatCurrency(data.family.totalFamilyIncome)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .table-row:hover { background: #F8FAFC; }
            `}</style>
        </div>
    );
};

export default AdminReportView;
