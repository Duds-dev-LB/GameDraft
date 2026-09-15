import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state } = useGame();
  const location = useLocation();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-sm border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent" onClick={closeMenu}>
              GameDraft
            </Link>
            {state.room && location.pathname.includes('/room/') && (
              <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-800 text-surface-300 border border-surface-700">
                SALA: {state.room.code || state.room.id}
              </span>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-surface-300 hover:text-white font-medium transition-colors">Home</Link>
            <Link to="/how-to-play" className="text-surface-300 hover:text-white font-medium transition-colors">Como jogar</Link>
            <Link to="/create" className="text-surface-300 hover:text-white font-medium transition-colors">Criar sala</Link>
            <Link to="/join" className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold transition-colors">Entrar</Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-surface-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-900 border-b border-surface-800 absolute w-full left-0">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col shadow-xl">
            <Link to="/" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-surface-200 hover:text-white hover:bg-surface-800">Home</Link>
            <Link to="/how-to-play" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-surface-200 hover:text-white hover:bg-surface-800">Como jogar</Link>
            <Link to="/create" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-surface-200 hover:text-white hover:bg-surface-800">Criar sala</Link>
            <Link to="/join" onClick={closeMenu} className="block px-3 py-3 mt-4 text-center rounded-lg text-base font-bold text-white bg-primary-600 hover:bg-primary-500">Entrar</Link>
          </div>
        </div>
      )}
    </header>
  );
}
