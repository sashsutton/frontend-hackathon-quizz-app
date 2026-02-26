import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span className="nav-logo">⚡ QuizApp</span>
                </Link>
            </div>
            <ul className="nav-crumbs">
                <li className="nav-crumb"><Link to="/quiz-list">Quiz</Link></li>
                <li className="nav-crumb"><Link to="/duel">⚔️ Duel</Link></li>
                <li className="nav-crumb"><Link to="/leaderboard">🏆 Classement</Link></li>
                <li className="nav-crumb"><Link to="/make">Créer</Link></li>

                <SignedOut>
                    <li className="nav-crumb">
                        <SignInButton mode="modal">
                            <button className="nav-btn nav-btn-outline">Se connecter</button>
                        </SignInButton>
                    </li>
                    <li className="nav-crumb">
                        <SignUpButton mode="modal">
                            <button className="nav-btn nav-btn-primary">S'inscrire</button>
                        </SignUpButton>
                    </li>
                </SignedOut>

                <SignedIn>
                    <li className="nav-crumb"><Link to="/profile">👤 Profil</Link></li>
                    <li className="nav-crumb">
                        <UserButton afterSignOutUrl="/" />
                    </li>
                </SignedIn>
            </ul>
        </nav>
    );
}

export default Navbar;