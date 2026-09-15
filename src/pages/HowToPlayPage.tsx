import { Card } from '@/components/ui/Card';

export function HowToPlayPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-4xl font-black mb-8 text-center bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
        Como Jogar
      </h1>

      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">1. O que é o GameDraft?</h2>
        <p className="text-surface-300 leading-relaxed">
          GameDraft é uma plataforma para você e seus amigos simularem drafts competitivos sobre diversos temas: futebol, basquete, games, personagens, ou até mesmo temas personalizados. Vocês escolhem alternadamente, montam seus times e depois votam para decidir quem montou o melhor esquadrão!
        </p>
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">2. Como criar uma sala</h2>
        <ul className="list-disc pl-5 space-y-2 text-surface-300">
          <li>Clique em "Criar sala" na página inicial.</li>
          <li>Escolha seu nickname.</li>
          <li>Selecione o tema do draft (ex: Futebol).</li>
          <li>Defina o limite de jogadores (2 a 8).</li>
          <li>Configure o tempo de cada escolha e a quantidade de escolhas.</li>
          <li>Escolha o modo de draft.</li>
          <li>Compartilhe o código da sala com seus amigos!</li>
        </ul>
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">3. Como funciona o draft</h2>
        <div className="space-y-4 text-surface-300">
          <p>
            <strong className="text-white">Draft Clássico:</strong> A ordem de escolha é mantida a mesma em todas as rodadas. Se você é o 1º a escolher na 1ª rodada, será o 1º na 2ª rodada também.
          </p>
          <p>
            <strong className="text-white">Snake Draft:</strong> A ordem de escolha inverte a cada rodada. O último a escolher na 1ª rodada será o primeiro a escolher na 2ª rodada.
          </p>
          <p>
            Durante sua vez, use a barra de busca para encontrar sua opção, selecione o card e confirme antes que o tempo acabe! Se o tempo esgotar, sua escolha será pulada.
          </p>
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">4. Pontuação e Resultado</h2>
        <p className="text-surface-300 leading-relaxed">
          Após todos completarem seus times (ou atingirem o limite de rodadas), a sala passa para a fase de votação. Cada jogador avalia os times dos adversários e vota no melhor (você não pode votar no seu próprio time). O jogador com mais votos é coroado o grande vencedor da sessão!
        </p>
      </Card>

      <Card className="p-6 md:p-8 bg-primary-900/20 border-primary-900/50">
        <h2 className="text-2xl font-bold mb-4 text-primary-400">💡 Dicas</h2>
        <ul className="list-disc pl-5 space-y-2 text-surface-300">
          <li>Fique de olho no relógio! Escolhas não feitas não podem ser recuperadas.</li>
          <li>Preste atenção nas escolhas dos seus amigos para não procurar jogadores que já foram escolhidos (o sistema avisa, mas economiza tempo).</li>
          <li>No modo Snake, planeje duas escolhas seguidas quando for sua vez nas "curvas" (último da rodada e primeiro da próxima).</li>
        </ul>
      </Card>
    </div>
  );
}
