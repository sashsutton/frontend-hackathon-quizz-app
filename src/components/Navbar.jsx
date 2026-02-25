import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';


function Navbar() {

    return(
        <nav className="navbar">
        
        <ul className="nav-crumbs">
            <li className="nav-crumb"><a href="/">Accueil</a></li>
            <li className="nav-crumb"><a href="/play">Jouer</a></li>
            <li className="nav-crumb"><a href="/make">Créer</a></li>
            <li className="nav-crumb"><a href="/quiz-list">Liste des quiz</a></li>

            <SignedOut>
                <li className="nav-crumb">
                    <SignInButton mode="modal" />
                </li>
                <li className="nav-crumb">
                    <SignUpButton mode="modal" />
                </li>
            </SignedOut>

            <SignedIn>
                <li className="nav-crumb">
                    <UserButton afterSignOutUrl="/" />
                </li>
            </SignedIn>
        </ul>
        </nav>

    )
}


export default Navbar
