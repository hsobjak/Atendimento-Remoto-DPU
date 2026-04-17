import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { LogOut, FileText, Search, RefreshCw, Trash2, Calendar, User, ClipboardList } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('admin_auth')) {
            navigate('/admin');
            return;
        }
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error("Erro ao buscar relatórios", error);
            alert("Erro ao buscar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        navigate('/admin');
    };

    const filteredReports = reports.filter(r => 
        (r.applicant_name && r.applicant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.cpf && r.cpf.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ color: 'var(--color-primary)', fontSize: '1.8rem', margin: 0 }}>Gestão de Atendimentos</h2>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Visualize e analise os formulários enviados pelos cidadãos.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/admin/trash')} className="btn-secondary" style={{ border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={18} color="#718096" />
                        Lixeira
                    </button>
                    <button onClick={handleLogout} className="btn-secondary" style={{ border: 'none', background: '#FFF5F5', color: '#C53030', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} />
                        Sair do Sistema
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: '#A0AEC0' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nome completo ou CPF..."
                            style={{ paddingLeft: '48px', height: '48px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchReports} className="btn-secondary" style={{ padding: '0 24px', height: '48px' }}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} /> {loading ? 'Carregando...' : 'Atualizar'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                        <RefreshCw size={40} className="spin" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <p>Buscando relatórios na base de dados...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                        <ClipboardList size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <p>Nenhum atendimento encontrado com estes critérios.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #EDF2F7' }}>
                                    <th style={{ padding: '16px 12px', color: '#4A5568', fontWeight: 700 }}><Calendar size={14} style={{ marginRight: '6px' }} /> DATA</th>
                                    <th style={{ padding: '16px 12px', color: '#4A5568', fontWeight: 700 }}><User size={14} style={{ marginRight: '6px' }} /> REQUERENTE</th>
                                    <th style={{ padding: '16px 12px', color: '#4A5568', fontWeight: 700 }}>CPF</th>
                                    <th style={{ padding: '16px 12px', color: '#4A5568', fontWeight: 700 }}>DEMANDA</th>
                                    <th style={{ padding: '16px 12px', color: '#4A5568', fontWeight: 700, textAlign: 'center' }}>SITUAÇÃO</th>
                                    <th style={{ padding: '16px 12px', color: '#4A5568', fontWeight: 700, textAlign: 'right' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="table-row">
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ fontWeight: 500 }}>{new Date(report.created_at).toLocaleDateString('pt-BR')}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>{new Date(report.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--color-primary)' }}>{report.applicant_name}</td>
                                        <td style={{ padding: '16px 12px', color: '#4A5568' }}>{report.cpf}</td>
                                        <td style={{ padding: '16px 12px', color: '#4A5568' }}>{report.demand_type}</td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '50px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.025em',
                                                whiteSpace: 'nowrap',
                                                background: report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? '#F0FFF4' : report.eligibility_status === 'NOT_ELIGIBLE' ? '#FFF5F5' : '#FFFBEB',
                                                color: report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? '#38A169' : report.eligibility_status === 'NOT_ELIGIBLE' ? '#E53E3E' : '#D69E2E',
                                                border: `1px solid ${report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? '#C6F6D5' : report.eligibility_status === 'NOT_ELIGIBLE' ? '#FED7D7' : '#FEFCBF'}`
                                            }}>
                                                {report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? 'Enquadra-se' : report.eligibility_status === 'NOT_ELIGIBLE' ? 'Não Enquadra' : 'Análise'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                            <Link to={`/admin/report/${report.id}`} style={{ 
                                                color: 'var(--color-primary)', 
                                                textDecoration: 'none', 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                fontWeight: 700,
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                background: 'rgba(0, 59, 40, 0.05)',
                                                transition: 'var(--transition)'
                                            }} className="action-link">
                                                <FileText size={16} /> Detalhes
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .table-row { transition: background 0.2s; }
                .table-row:hover { background: #F8FAFC; }
                .action-link:hover { background: rgba(0, 59, 40, 0.1); transform: translateX(2px); }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
