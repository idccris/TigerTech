# Auditoria de segurança — Tiger Tech 3D

Data: 30/08/2026

## Resultado

Foram confirmadas e corrigidas vulnerabilidades no código. O projeto corrigido passou pelo ESLint, pela verificação TypeScript, pelo build de produção do Next.js e pelo `npm audit`, que terminou com 0 vulnerabilidades conhecidas.

## Falhas corrigidas

1. **Credencial administrativa codificada no repositório — risco alto**
   - O banco era inicializado com nome de usuário e hash de senha fixos, permitindo que a mesma credencial fosse reaproveitada entre instalações.
   - A credencial fixa foi removida. Uma instalação nova só cria o primeiro administrador usando `ADMIN_INITIAL_USERNAME` e `ADMIN_INITIAL_PASSWORD`, configuradas de forma privada no ambiente da Vercel. A senha deve ter pelo menos 12 caracteres.

2. **Tentativas ilimitadas de login — risco alto**
   - Não havia proteção contra força bruta.
   - Foi implementado limite persistente de 5 tentativas por usuário/IP a cada 15 minutos, com resposta HTTP 429 e comparação de hash também para usuários inexistentes.

3. **Criação automatizada ilimitada de pedidos — risco alto**
   - A rota pública poderia ser usada para gerar spam no banco e armazenar dados em massa.
   - Foi aplicado limite persistente de 10 pedidos por IP por hora.

4. **Injeção de fórmulas na exportação Excel — risco moderado**
   - Campos fornecidos pelo cliente poderiam começar com `=`, `+`, `-` ou `@` e ser interpretados como fórmulas ao abrir a planilha.
   - Todas as células textuais controladas pelo cliente agora são neutralizadas antes da exportação.

5. **Integridade incorreta do carrinho — risco moderado**
   - Itens repetidos e quantidades fracionárias poderiam contornar a conferência individual de estoque e gerar pedidos impossíveis de concluir.
   - Produtos repetidos agora são agrupados, quantidades precisam ser inteiras e o limite de 99 unidades é aplicado ao total por produto.

6. **Proteção insuficiente das mutações administrativas — risco moderado**
   - As rotas dependiam apenas do cookie `SameSite` contra requisições entre sites.
   - Foi adicionada validação de `Origin` e Fetch Metadata às operações de escrita.

7. **Cookies e cache administrativos — risco moderado**
   - O cookie foi endurecido com prefixo `__Host-` em produção e prioridade alta. A consulta de sessão deixou de ser armazenada em cache.
   - Sessões expiradas são removidas durante a migração de segurança.

8. **Mensagens internas expostas ao cliente — risco baixo**
   - Erros do banco podiam ser devolvidos diretamente nas rotas de login e pedido.
   - O cliente recebe agora uma mensagem genérica; o detalhe fica somente no log do servidor.

9. **Headers de segurança ausentes — risco moderado**
   - Foram adicionados CSP, HSTS, `nosniff`, bloqueio de iframe, política de referência e restrição de câmera, microfone, geolocalização e pagamentos. O header que divulga Next.js foi removido.

10. **Dependências vulneráveis — risco moderado**
    - O `npm audit` encontrou 2 ocorrências moderadas ligadas ao `uuid` transitivo do ExcelJS.
    - A versão segura foi fixada por override. O resultado final do `npm audit` é 0 vulnerabilidades.

11. **Validações de entrada incompletas — risco baixo/moderado**
    - Foram adicionados limites de tamanho para campos, validação estrita de imagens, estoque inteiro e política mínima de senha com 12 caracteres, letras e números.

## Testes executados

- `npm audit`: aprovado, 0 vulnerabilidades.
- `npm run lint`: aprovado.
- `npm run build`: aprovado.
- TypeScript: aprovado durante o build.
- Geração das 22 páginas/rotas: aprovada durante o build.

O teste HTTP com servidor local não pôde ser executado neste ambiente porque o runtime não conseguiu consultar as interfaces de rede (`uv_interface_addresses`). A compilação de produção e as validações estáticas foram concluídas normalmente.

## Ação obrigatória antes/depois da publicação

- **Troque imediatamente a senha do usuário administrativo atual.** A remoção da credencial fixa protege o código e novas instalações, mas não altera automaticamente a senha que já está salva no banco de produção.
- Na Vercel, mantenha `DATABASE_URL` apenas como variável privada. Para um banco novo, configure também `ADMIN_INITIAL_USERNAME` e `ADMIN_INITIAL_PASSWORD`; depois da primeira inicialização, elas podem ser removidas.
- Publique este projeto corrigido para que as novas proteções e a migração do banco entrem em vigor.

## Limites da auditoria

A análise cobriu o código e as dependências fornecidas no ZIP. Não incluiu teste de invasão no domínio publicado, configurações externas da conta Vercel/Neon, permissões dessas contas ou vazamentos fora do repositório.
