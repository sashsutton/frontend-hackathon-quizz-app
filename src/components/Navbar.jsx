import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar">
            <ul className="nav-crumbs">
                <li className="nav-crumb"><Link to="/">Accueil</Link></li>
                <li className="nav-crumb"><Link to="/quiz-list">Quiz</Link></li>
                <li className="nav-crumb"><Link to="/duel">⚔️ Duel</Link></li>
                <li className="nav-crumb"><Link to="/leaderboard">🏆 Classement</Link></li>
                <li className="nav-crumb"><Link to="/make">Créer</Link></li>

                <SignedOut>
                    <li className="nav-crumb"><SignInButton mode="modal" /></li>
                    <li className="nav-crumb"><SignUpButton mode="modal" /></li>
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