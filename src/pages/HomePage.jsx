import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    const cards = [
        {
            to: '/quiz-list',
            icon: '🎮',
            title: 'SOLO QUIZ',
            desc: 'Affronte des questions en solo. Bats ton propre score.',
            color: 'var(--cyan)',
        },
        {
            to: '/duel',
            icon: '⚔️',
            title: 'DUEL MODE',
            desc: 'Affronte un adversaire en temps réel. ELO en jeu.',
            color: 'var(--magenta)',
        },
        {
            to: '/leaderboard',
            icon: '🏆',
            title: 'CLASSEMENT',
            desc: 'Consulte le top des meilleurs joueurs par ELO.',
            color: 'var(--yellow)',
        },
        {
            to: '/make',
            icon: '🛠️',
            title: 'CRÉER',
            desc: 'Crée tes propres quiz et défie la communauté.',
            color: 'var(--green)',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '80px 40px 60px', fontFamily: 'var(--font-mono)' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 70 }}>
                <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: 'clamp(10px, 2vw, 16px)',
                    color: 'var(--dim)',
                    letterSpacing: '0.3em',
                    marginBottom: 24,
                    textTransform: 'uppercase',
                }}>
                    ★ INSERT COIN ★
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: 'clamp(22px, 5vw, 52px)',
                    color: 'var(--cyan)',
                    textShadow: '0 0 20px var(--cyan), 0 0 60px rgba(0,255,255,0.4)',
                    lineHeight: 1.4,
                    marginBottom: 24,
                }}>
                    QUIZ APP
                </h1>

                <p style={{
                    fontFamily: 'var(--font-hud)',
                    fontSize: 14,
                    color: 'var(--magenta)',
                    textShadow: '0 0 10px var(--magenta)',
                    letterSpacing: '0.2em',
                    marginBottom: 40,
                }}>
                    ARCADE EDITION — SAISON 2026
                </p>

                {/* Decorative divider */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
                    <div style={{ height: 1, width: 100, background: 'linear-gradient(to right, transparent, var(--cyan))' }} />
                    <span style={{ color: 'var(--cyan)', fontSize: 12 }}>◆</span>
                    <div style={{ height: 1, width: 100, background: 'linear-gradient(to left, transparent, var(--cyan))' }} />
                </div>
            </div>

            {/* Cards grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 24,
                maxWidth: 900,
                margin: '0 auto',
            }}>
                {cards.map(card => (
                    <Link
                        key={card.to}
                        to={card.to}
                        style={{ textDecoration: 'none' }}
                    >
                        <div
                            className="retro-card quiz-card"
                            style={{
                                textAlign: 'center',
                                padding: '36px 24px',
                                borderColor: card.color,
                                boxShadow: `0 0 12px ${card.color}33`,
                                cursor: 'pointer',
                                height: '100%',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = `0 0 30px ${card.color}66, inset 0 0 20px ${card.color}0a`;
                                e.currentTarget.style.transform = 'translateY(-6px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = `0 0 12px ${card.color}33`;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ fontSize: 42, marginBottom: 16 }}>{card.icon}</div>
                            <h3 style={{
                                fontFamily: 'var(--font-pixel)',
                                fontSize: 13,
                                color: card.color,
                                textShadow: `0 0 10px ${card.color}`,
                                marginBottom: 14,
                            }}>
                                {card.title}
                            </h3>
                            <p style={{ color: 'var(--dim)', fontSize: 13, lineHeight: 1.8 }}>
                                {card.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer */}
            <p style={{
                textAlign: 'center',
                fontFamily: 'var(--font-pixel)',
                fontSize: 9,
                color: 'var(--dim)',
                marginTop: 70,
                letterSpacing: '0.2em',
                opacity: 0.5,
            }}>
                © 2026 QUIZAPP — TOUS DROITS RÉSERVÉS — HIGH SCORE: ???
            </p>
        </div>
    );
}

export default HomePage;