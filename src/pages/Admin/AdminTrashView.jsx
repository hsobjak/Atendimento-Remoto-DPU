import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { ArrowLeft, RefreshCw, Trash2, RotateCcw, CheckSquare, Square } from 'lucide-react';

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
            // Auto delete older than 30 days logic can be done on fetch, 
            // but normally it's done via cron job on supabase.
            // For UI purposes, we'll just fetch all deleted items.
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .not('deleted_at', 'is', null)
                .order('deleted_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
            setSelectedIds([]); // reset selection
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Voltar ao Painel
                    </button>
                    <h2 style={{ color: '#c62828', margin: 0 }}>Lixeira</h2>
                </div>
                <button onClick={fetchTrash} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} /> Atualizar
                </button>
            </div>

            {selectedIds.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '16px', background: '#ffebee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#c62828' }}>{selectedIds.length} item(ns) selecionado(s)</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={() => handleRestore(selectedIds)} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#2e7d32', color: '#2e7d32' }}>
                            <RotateCcw size={16} /> Restaurar Selecionados
                        </button>
                        <button className="btn-primary" onClick={() => handlePermanentDelete(selectedIds)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#c62828' }}>
                            <Trash2 size={16} /> Excluir Definitivamente
                        </button>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Carregando lixeira...</div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>A lixeira está vazia.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '16px', width: '50px', cursor: 'pointer' }} onClick={toggleAll}>
                                        {selectedIds.length === reports.length ? <CheckSquare size={20} color="#004d40" /> : <Square size={20} color="#999" />}
                                    </th>
                                    <th style={{ padding: '16px' }}>Excluído Em</th>
                                    <th style={{ padding: '16px' }}>Requerente</th>
                                    <th style={{ padding: '16px' }}>CPF</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Ações Rápidas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} style={{ borderBottom: '1px solid #eee', background: selectedIds.includes(report.id) ? '#f0f4f8' : 'transparent' }}>
                                        <td style={{ padding: '16px', cursor: 'pointer' }} onClick={() => toggleSelection(report.id)}>
                                            {selectedIds.includes(report.id) ? <CheckSquare size={20} color="#004d40" /> : <Square size={20} color="#ccc" />}
                                        </td>
                                        <td style={{ padding: '16px' }}>{report.deleted_at ? new Date(report.deleted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                        <td style={{ padding: '16px', fontWeight: 'bold', color: '#666' }}>{report.applicant_name}</td>
                                        <td style={{ padding: '16px', color: '#666' }}>{report.cpf}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                                <button onClick={() => handleRestore([report.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <RotateCcw size={16} /> 
                                                </button>
                                                <button onClick={() => handlePermanentDelete([report.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Trash2 size={16} /> 
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
            
            <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', marginTop: '16px' }}>
                Relatórios na lixeira serão excluídos automaticamente após 30 dias pela rotina do banco de dados.
            </p>
        </div>
    );
};

export default AdminTrashView;
