import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { LogOut, FileText, Search, RefreshCw, Trash2 } from 'lucide-react';

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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ color: '#004d40' }}>Painel Administrativo - Relatórios</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/admin/trash')} className="btn-secondary" style={{ border: '1px solid #c62828', color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={16} />
                        Lixeira
                    </button>
                    <button onClick={handleLogout} className="btn-secondary" style={{ border: 'none', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#999' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nome ou CPF..."
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchReports} className="btn-secondary" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={16} /> Atualizar
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Carregando dados...</div>
                ) : filteredReports.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Nenhum relatório encontrado.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '16px' }}>Data</th>
                                    <th style={{ padding: '16px' }}>Requerente</th>
                                    <th style={{ padding: '16px' }}>CPF</th>
                                    <th style={{ padding: '16px' }}>Demanda</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Situação</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px' }}>{new Date(report.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{report.applicant_name}</td>
                                        <td style={{ padding: '16px' }}>{report.cpf}</td>
                                        <td style={{ padding: '16px' }}>{report.demand_type}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                background: report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? '#e8f5e9' : report.eligibility_status === 'NOT_ELIGIBLE' ? '#ffebee' : '#fffde7',
                                                color: report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? '#2e7d32' : report.eligibility_status === 'NOT_ELIGIBLE' ? '#c62828' : '#f57f17'
                                            }}>
                                                {report.eligibility_status === 'ELIGIBLE_AUTOMATIC' ? 'Enquadra-se' : report.eligibility_status === 'NOT_ELIGIBLE' ? 'Não se Enquadra' : 'Análise Necessária'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <Link to={`/admin/report/${report.id}`} style={{ color: '#004d40', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold' }}>
                                                <FileText size={18} /> Ver Detalhes
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
