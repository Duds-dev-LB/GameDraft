import { Card } from '@/components/ui/Card';

export function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">Termos de Uso</h1>
      
      <Card className="p-6 md:p-8 space-y-6 text-surface-300">
        <p>
          Ao utilizar o GameDraft, você concorda com os seguintes termos:
        </p>
        
        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Uso da Plataforma</h2>
          <p>
            O GameDraft é uma plataforma gratuita com foco em entretenimento. É estritamente proibido o uso da plataforma para fins comerciais, práticas ilegais, assédio, ou distribuição de conteúdo ofensivo através de nicknames ou mensagens na sala.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Disponibilidade e Dados</h2>
          <p>
            O serviço é oferecido "como está". Não garantimos disponibilidade 100% do tempo. Salas e sessões são voláteis e temporárias. Caso ocorra uma desconexão do servidor ou fechamento da plataforma, o progresso da sua sala pode ser perdido irrecuperavelmente.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Direitos Autorais</h2>
          <p>
            Os nomes e possíveis imagens de jogadores, personagens ou entidades representadas durante os drafts pertencem aos seus respectivos detentores de direitos autorais. O GameDraft faz uso dessas referências exclusivamente em caráter recreativo e de paródia (Fair Use).
          </p>
        </div>
      </Card>
    </div>
  );
}
