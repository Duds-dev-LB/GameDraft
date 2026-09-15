import { Card } from '@/components/ui/Card';

export function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">Política de Privacidade</h1>
      
      <Card className="p-6 md:p-8 space-y-6 text-surface-300">
        <p>
          O GameDraft respeita a sua privacidade. Esta política descreve como tratamos os poucos dados que coletamos.
        </p>
        
        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Coleta de Dados</h2>
          <p>
            Não coletamos dados pessoais identificáveis (como e-mail, telefone, CPF). A identidade no jogo é baseada inteiramente no apelido (nickname) que você escolhe ao criar ou entrar em uma sala e em um ID de sessão temporário gerado no seu navegador.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Armazenamento Local</h2>
          <p>
            Utilizamos o <code>localStorage</code> do seu navegador de forma mínima para manter o estado da sua sessão enquanto você participa de uma sala de draft. Se você limpar os dados do navegador, sua sessão será perdida.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Compartilhamento de Dados</h2>
          <p>
            Todas as ações realizadas em uma sala (escolhas, chat, estado) são compartilhadas apenas com os outros participantes ativos da mesma sala, enquanto a sala estiver aberta. Não vendemos ou repassamos informações para terceiros.
          </p>
        </div>
      </Card>
    </div>
  );
}
