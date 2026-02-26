import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaSearch, FaPlusCircle } from 'react-icons/fa';
function HomePage() {
    return (
        <div style={containerStyle}>
            <header style={heroSection}>
                <h1 style={mainTitle}>Quiz for CS Students</h1>
                <div style={underline}></div>
            </header>

            <div style={gridStyle}>
                
                <Link to="/play" style={cardStyle} className="quiz-card">
                <div style={iconBox}>
                        <FaGamepad style={iconStyle} />
                    </div>
                    <h3>Jouer</h3>
                    <p>Affronte tes amis ou joue en solo.</p>
                </Link>

                <Link to="/quiz-list" style={cardStyle} className="quiz-card">
                <div style={iconBox}>
                        <FaSearch style={iconStyle} />
                    </div>
                    <h3>Explorer</h3>
                    <p>Découvre tous les quiz créés par la communauté.</p>
                </Link>

                <Link to="/make" style={cardStyle} className="quiz-card">
                <div style={iconBox}>
                        <FaPlusCircle style={iconStyle} />
                    </div>
                    <h3>Créer</h3>
                    <p>Importe ton fichier CSV et lance ton propre défi.</p>
                </Link>

            </div>

            <footer style={footerStyle}>
                <p>Bonne chance à toutes les équipes !</p>
            </footer>
        </div>
    );
}
const heroSection = {
    marginBottom: '40px'
};

const containerStyle = {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#1a1a2e', 
    color: 'white',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif'
};

const mainTitle = { fontSize: '4rem', margin: '0', fontWeight: '900', letterSpacing: '2px' };
const subTitle = { fontSize: '1.5rem', color: '#a29bfe', marginTop: '10px' };
const underline = { width: '80px', height: '5px', background: '#e84393', margin: '20px auto', borderRadius: '5px' };

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    maxWidth: '1000px',
    margin: '60px auto'
};

const cardStyle = {
    backgroundColor: '#16213e',
    padding: '40px',
    borderRadius: '20px',
    textDecoration: 'none',
    color: 'white',
    border: '2px solid #0f3460',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};
const iconStyle = {
    fontSize: '3.5rem',
    color: '#a29bfe', 
    transition: 'color 0.3s ease'
};

const iconBox = { fontSize: '3rem', marginBottom: '20px' };
const footerStyle = { marginTop: '50px', opacity: '0.7', fontSize: '1.1rem' };

export default HomePage;