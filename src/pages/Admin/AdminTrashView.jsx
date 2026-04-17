import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { ArrowLeft, RefreshCw, Trash2, RotateCcw, CheckSquare, Square, Calendar, User, Trash } from 'lucide-react';

const AdminTrashView = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (!localStorage.getItem('admin_auth')) {
            navigate('/admin');
            return;
        }
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .not('deleted_at', 'is', null)
                .order('deleted_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
            setSelectedIds([]); 
        } catch (error) {
            console.error("Erro ao buscar lixeira", error);
            alert("Erro ao buscar dados da lixeira.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === reports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reports.map(r => r.id));
        }
    };

    const handleRestore = async (ids) => {
        if (!window.confirm(`Deseja restaurar ${ids.length} item(ns) para o painel principal?`)) return;
        try {
            const { error } = await supabase
                .from('assessments')
                .update({ deleted_at: null })
                .in('id', ids);
            if (error) throw error;
            alert('Itens restaurados com sucesso.');
            fetchTrash();
        } catch (error) {
            console.error(error);
            alert('Erro ao restaurar itens.');
        }
    };

    const handlePermanentDelete = async (ids) => {
        if (!window.confirm(`ATENÇÃO: Deseja EXCLUIR PERMANENTEMENTE ${ids.length} item(ns)? Esta ação não pode ser desfeita.`)) return;
        try {
            const { error } = await supabase
                .from('assessments')
                .delete()
                .in('id', ids);
            if (error) throw error;
            alert('Itens excluídos permanentemente.');
            fetchTrash();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir itens.');
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary" style={{ padding: '8px 16px', border: '1px solid #E2E8F0' }}>
                        <ArrowLeft size={18} /> Voltar ao Painel
                    </button>
                    <h2 style={{ color: '#C53030', margin: 0, fontSize: '1.8rem' }}>Lixeira</h2>
                </div>
                <button onClick={fetchTrash} className="btn-secondary" style={{ border: '1px solid #E2E8F0' }}>
                    <RefreshCw size={18} className={loading ? 'spin' : ''} /> Atualizar
                </button>
            </div>

            {selectedIds.length > 0 && (
                <div style={{ 
                    marginBottom: '24px', 
                    padding: '16px 24px', 
                    background: '#FFF5F5', 
                    borderRadius: '12px', 
                    border: '1px solid #FED7D7',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#C53030' }}>{selectedIds.length} item(ns) selecionado(s)</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={() => handleRestore(selectedIds)} style={{ border: 'none', background: '#F0FFF4', color: '#38A169' }}>
                            <RotateCcw size={18} /> Restaurar
                        </button>
                        <button className="btn-primary" onClick={() => handlePermanentDelete(selectedIds)} style={{ background: '#C53030' }}>
                            <Trash2 size={18} /> Excluir Definitivamente
                        </button>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Carregando lixeira...</div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                        <Trash size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <p>A lixeira está vazia.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #EDF2F7' }}>
                                    <th style={{ padding: '16px 24px', width: '50px', cursor: 'pointer' }} onClick={toggleAll}>
                                        {selectedIds.length === reports.length ? <CheckSquare size={22} color="var(--color-primary)" /> : <Square size={22} color="#CBD5E0" />}
                                    </th>
                                    <th style={{ padding: '16px 24px', color: '#4A5568', fontWeight: 700 }}><Calendar size={14} style={{ marginRight: '6px' }} /> EXCLUÍDO EM</th>
                                    <th style={{ padding: '16px 24px', color: '#4A5568', fontWeight: 700 }}><User size={14} style={{ marginRight: '6px' }} /> REQUERENTE</th>
                                    <th style={{ padding: '16px 24px', color: '#4A5568', fontWeight: 700 }}>CPF</th>
                                    <th style={{ padding: '16px 24px', color: '#4A5568', fontWeight: 700, textAlign: 'center' }}>AÇÕES RÁPIDAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} style={{ borderBottom: '1px solid #EDF2F7', background: selectedIds.includes(report.id) ? '#F7FAFC' : 'transparent' }} className="table-row">
                                        <td style={{ padding: '16px 24px', cursor: 'pointer' }} onClick={() => toggleSelection(report.id)}>
                                            {selectedIds.includes(report.id) ? <CheckSquare size={22} color="var(--color-primary)" /> : <Square size={22} color="#E2E8F0" />}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#4A5568' }}>
                                            <div style={{ fontWeight: 500 }}>{report.deleted_at ? new Date(report.deleted_at).toLocaleDateString('pt-BR') : '-'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>{report.deleted_at ? new Date(report.deleted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: 600, color: '#4A5568' }}>{report.applicant_name}</td>
                                        <td style={{ padding: '16px 24px', color: '#4A5568' }}>{report.cpf}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                                <button onClick={() => handleRestore([report.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38A169' }} title="Restaurar">
                                                    <RotateCcw size={20} /> 
                                                </button>
                                                <button onClick={() => handlePermanentDelete([report.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }} title="Excluir Definitivamente">
                                                    <Trash2 size={20} /> 
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <p style={{ textAlign: 'center', color: '#A0AEC0', fontSize: '0.85rem', marginTop: '24px' }}>
                Relatórios na lixeira serão excluídos automaticamente após 30 dias pela rotina do banco de dados.
            </p>
            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .table-row:hover { background: #F8FAFC; }
            `}</style>
        </div>
    );
};

export default AdminTrashView;
