import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API = 'http://127.0.0.1:5000';

const PROMOTIONS = ['L1', 'L2', 'L3', 'M1', 'M2', 'BUT1', 'BUT2', 'BUT3', 'Autre'];
const MENTIONS = ['Informatique', 'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Économie', 'Droit', 'Lettres', 'Autre'];

export default function ProfilePage() {
    const { getToken, isLoaded } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ promotion: '', mention: '' });

    useEffect(() => {
        if (!isLoaded) return;
        (async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${API}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setUser(res.data);
                    setForm({ promotion: res.data.promotion || '', mention: res.data.mention || '' });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [isLoaded]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const token = await getToken();
            await axios.put(`${API}/auth/profile`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(prev => ({ ...prev, ...form }));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const winRate = user ? (user.total_duels > 0 ? Math.round((user.wins / user.total_duels) * 100) : 0) : 0;

    if (loading) {
        return (
            <div style={s.page}>
                <style>{spin}</style>
                <div style={s.spinner} />
            </div>
        );
    }

    if (!user) return <div style={s.page}><p style={{ color: 'white' }}>Utilisateur introuvable.</p></div>;

    return (
        <div style={s.page}>
            <style>{spin}</style>
            <div style={s.container}>
                {/* Avatar + name */}
                <div style={s.hero}>
                    <div style={s.avatar}>
                        {(user.first_name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <h1 style={s.name}>{user.first_name} {user.last_name}</h1>
                    <p style={s.email}>{user.email}</p>
                </div>

                {/* Stats row */}
                <div style={s.statsRow}>
                    {[
                        { label: 'ELO', value: user.elo ?? 1200, color: '#a29bfe' },
                        { label: 'Victoires', value: user.wins ?? 0, color: '#2ecc71' },
                        { label: 'Défaites', value: user.losses ?? 0, color: '#e74c3c' },
                        { label: 'Win rate', value: `${winRate}%`, color: '#f39c12' },
                        { label: 'Duels', value: user.total_duels ?? 0, color: '#3498db' },
                    ].map(stat => (
                        <div key={stat.label} style={s.statCard}>
                            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                            <div style={s.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Edit form */}
                <div style={s.card}>
                    <h2 style={s.cardTitle}>✏️ Modifier mon profil</h2>

                    <div style={s.field}>
                        <label style={s.label}>Promotion</label>
                        <select
                            value={form.promotion}
                            onChange={e => setForm(f => ({ ...f, promotion: e.target.value }))}
                            style={s.select}
                        >
                            <option value="">-- Choisir --</option>
                            {PROMOTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Mention / Filière</label>
                        <select
                            value={form.mention}
                            onChange={e => setForm(f => ({ ...f, mention: e.target.value }))}
                            style={s.select}
                        >
                            <option value="">-- Choisir --</option>
                            {MENTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ ...s.btn, ...(saved ? s.btnSaved : {}) }}
                    >
                        {saving ? '⏳ Sauvegarde...' : saved ? '✅ Sauvegardé !' : '💾 Sauvegarder'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const spin = `@keyframes spin { to { transform: rotate(360deg); } }`;

const s = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '60px',
        paddingBottom: '60px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    spinner: {
        width: '60px', height: '60px', borderRadius: '50%',
        border: '4px solid rgba(255,255,255,0.1)',
        borderTop: '4px solid #a29bfe',
        animation: 'spin 1s linear infinite',
    },
    container: { width: '100%', maxWidth: '800px', padding: '0 20px' },
    hero: { textAlign: 'center', marginBottom: '40px' },
    avatar: {
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #e84393, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '42px', fontWeight: 'bold', color: 'white',
        margin: '0 auto 20px',
        boxShadow: '0 0 30px rgba(232, 67, 147, 0.4)',
    },
    name: { color: 'white', fontSize: '32px', margin: '0 0 8px' },
    email: { color: '#a29bfe', fontSize: '16px', margin: 0 },
    statsRow: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px', marginBottom: '32px',
    },
    statCard: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '20px 10px',
        textAlign: 'center',
    },
    statValue: { fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' },
    statLabel: { color: '#a29bfe', fontSize: '13px', fontWeight: '600' },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '32px',
    },
    cardTitle: { color: 'white', fontSize: '20px', marginBottom: '24px', marginTop: 0 },
    field: { marginBottom: '20px' },
    label: { display: 'block', color: '#a29bfe', fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
    select: {
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px', color: 'white', fontSize: '16px',
        cursor: 'pointer',
    },
    btn: {
        width: '100%', padding: '14px',
        background: 'linear-gradient(135deg, #e84393, #a855f7)',
        border: 'none', borderRadius: '12px',
        color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
        transition: 'opacity 0.2s',
        marginTop: '8px',
    },
    btnSaved: { background: 'linear-gradient(135deg, #2ecc71, #27ae60)' },
};
