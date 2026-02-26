import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaBolt } from 'react-icons/fa';

const styles = {
    container: { padding: '80px 20px', textAlign: 'center', backgroundColor: '#1a1a2e', minHeight: '100vh', color: 'white' },
    title: { fontSize: '3.5rem', fontWeight: '900', marginBottom: '10px' },
    underline: { width: '60px', height: '4px', background: '#e84393', margin: '0 auto 50px auto' },
    grid: { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' },
    card: { 
        backgroundColor: '#16213e', padding: '50px 30px', borderRadius: '20px', width: '320px', 
        textDecoration: 'none', color: 'white', border: '2px solid #0f3460', transition: 'all 0.3s ease', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'block'
    },
    icon: { fontSize: '3.5rem', marginBottom: '20px', color: '#a29bfe' }
};

function PlayPage() {
    const handleHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.borderColor = '#e84393';
        e.currentTarget.style.boxShadow = '0 0 25px rgba(232, 67, 147, 0.6)';
        const icon = e.currentTarget.querySelector('.mode-icon');
        if (icon) icon.style.color = '#e84393';
    };

    const handleLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#0f3460';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        const icon = e.currentTarget.querySelector('.mode-icon');
        if (icon) icon.style.color = '#a29bfe';
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Mode de Jeu</h1>
            <div style={styles.underline}></div>
            <p style={{fontSize: '1.2rem', color: '#a29bfe', marginBottom: '50px'}}>Sélectionnez votre défi</p>

            <div style={styles.grid}>
                <Link to="/quiz-list" style={styles.card} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
                    <div style={styles.icon}>
                        <FaUser className="mode-icon" style={{ transition: 'color 0.3s' }} />
                    </div>
                    <h3 style={{fontSize: '1.8rem', marginBottom: '15px'}}> Solo</h3>
                    <p style={{color: '#b2bec3'}}>Améliorez vos connaissances.</p>
                </Link>

                <Link to="/play/versus" style={styles.card} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
                    <div style={styles.icon}>
                        <FaBolt className="mode-icon" style={{ transition: 'color 0.3s' }} />
                    </div>
                    <h3 style={{fontSize: '1.8rem', marginBottom: '15px'}}>Duel </h3>
                    <p style={{color: '#b2bec3'}}>Affrontez un ami.</p>
                </Link>
            </div>
        </div>
    );
}

export default PlayPage;