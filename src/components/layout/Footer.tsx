import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-surface-950 border-t border-surface-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              GameDraft
            </span>
            <p className="text-surface-400 mt-2 font-medium">Draft. Compita. Divirta-se.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link to="/how-to-play" className="text-surface-400 hover:text-white transition-colors">Como jogar</Link>
            <Link to="/privacy" className="text-surface-400 hover:text-white transition-colors">Privacidade</Link>
            <Link to="/terms" className="text-surface-400 hover:text-white transition-colors">Termos</Link>
          </nav>
        </div>
        
        <div className="mt-12 pt-8 border-t border-surface-800 text-center text-surface-500 text-sm">
          <p>Copyright &copy; {new Date().getFullYear()} GameDraft. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
