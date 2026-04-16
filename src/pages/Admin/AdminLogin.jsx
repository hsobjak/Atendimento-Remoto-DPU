import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (password === '1811') {
            localStorage.setItem('admin_auth', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Senha incorreta.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', color: '#004d40', marginBottom: '24px' }}>Acesso Restrito</h2>
                
                {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label">Senha Administrativa</label>
                        <input
                            type="password"
                            className="form-control"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                        Entrar
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>
                            Voltar para o Início
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
