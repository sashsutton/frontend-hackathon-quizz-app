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
                const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data.success) {
                    setUser(res.data);
                    setForm({ promotion: res.data.promotion || '', mention: res.data.mention || '' });
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [isLoaded]);

    const handleSave = async () => {
        setSaving(true); setSaved(false);
        try {
            const token = await getToken();
            await axios.put(`${API}/auth/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
            setUser(prev => ({ ...prev, ...form }));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const winRate = user ? (user.total_duels > 0 ? Math.round((user.wins / user.total_duels) * 100) : 0) : 0;

    if (loading) return (
        <div className="retro-page">
            <div className="retro-spinner" />
            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--cyan)', marginTop: 24, letterSpacing: '0.15em', fontSize: 12 }}>CHARGEMENT...</p>
        </div>
    );

    if (!user) return (
        <div className="retro-page">
            <p style={{ fontFamily: 'var(--font-pixel)', color: 'var(--magenta)', fontSize: 13 }}>JOUEUR INTROUVABLE</p>
        </div>
    );

    const stats = [
        { label: 'ELO', value: user.elo ?? 1200, color: 'var(--cyan)' },
        { label: 'WINS', value: user.wins ?? 0, color: 'var(--green)' },
        { label: 'LOSSES', value: user.losses ?? 0, color: 'var(--magenta)' },
        { label: 'W-RATE', value: `${winRate}%`, color: 'var(--yellow)' },
        { label: 'DUELS', value: user.total_duels ?? 0, color: 'var(--orange)' },
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '80px 20px 60px', maxWidth: 800, margin: '0 auto' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{
                    width: 90, height: 90, margin: '0 auto 20px',
                    border: '3px solid var(--cyan)', boxShadow: '0 0 25px var(--cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-pixel)', fontSize: 36, color: 'var(--cyan)',
                    background: 'rgba(0,255,255,0.05)',
                }}>
                    {(user.first_name?.[0] ?? '?').toUpperCase()}
                </div>
                <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(12px, 2vw, 18px)', color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan)', marginBottom: 8 }}>
                    {user.first_name} {user.last_name}
                </h1>
                <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--dim)', fontSize: 12, letterSpacing: '0.1em' }}>{user.email}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
                {stats.map(st => (
                    <div key={st.label} style={{
                        border: `1px solid ${st.color}44`,
                        background: `${st.color}08`,
                        padding: '16px 8px', textAlign: 'center',
                        boxShadow: `0 0 10px ${st.color}22`,
                    }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(12px, 2vw, 20px)', color: st.color, textShadow: `0 0 8px ${st.color}`, marginBottom: 8 }}>
                            {st.value}
                        </div>
                        <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.15em' }}>
                            {st.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit form */}
            <div className="retro-card">
                <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: 'var(--magenta)', textShadow: '0 0 8px var(--magenta)', marginBottom: 28 }}>
                    ✏ MODIFIER MON PROFIL
                </h2>

                <div style={{ marginBottom: 20 }}>
                    <label className="retro-label">Promotion</label>
                    <select
                        value={form.promotion}
                        onChange={e => setForm(f => ({ ...f, promotion: e.target.value }))}
                        className="retro-select"
                    >
                        <option value="">-- CHOISIR --</option>
                        {PROMOTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: 28 }}>
                    <label className="retro-label">Mention / Filière</label>
                    <select
                        value={form.mention}
                        onChange={e => setForm(f => ({ ...f, mention: e.target.value }))}
                        className="retro-select"
                    >
                        <option value="">-- CHOISIR --</option>
                        {MENTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`retro-btn ${saved ? 'retro-btn-green' : 'retro-btn-magenta'}`}
                    style={{ width: '100%', padding: '14px', fontSize: 12, letterSpacing: '0.15em' }}
                >
                    {saving ? '... SAUVEGARDE' : saved ? '✔ SAUVEGARDÉ !' : '▶ SAUVEGARDER'}
                </button>
            </div>
        </div>
    );
}
