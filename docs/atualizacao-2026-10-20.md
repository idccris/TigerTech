# Atualização de 20/10/2026

Backup anterior no GitHub: backup/producao-2026-10-20-antes-ajustes, commit 4fe0ac28cd6d43529f60352ee550df0c02d6d105.

Referência de produtos: https://tigertech-demo.pages.dev/catalogo/ (API pública /api/publico/catalogo).
Foram atualizados 583 cadastros existentes e removidos 34 sem correspondência. Foram preservados os estoques e identificadores locais. Os preços informados na referência foram aplicados ao Pix e ao total no cartão; 31 itens sem preço na origem ficam sob consulta. Produtos mantidos ficam visíveis, sujeitos à regra de estoque da loja. O plano detalhado da operação foi salvo separadamente dos arquivos públicos.

Backup dos dados antes da operação: tabelas products_backup_20261020 e product_images_backup_20261020 no mesmo banco. Reverter o código pelo Git não reverte os preços ou exclusões do banco: a restauração desses dados deve usar as tabelas de backup em transação, após conferir eventuais vendas/edições posteriores.

Modo escuro: botão na navbar pública e administrativa, preferência local tiger-theme. Estilos em public/tiger-theme.css.

Destaques: todas as cores de um modelo são atualizadas em transação; o limite de seis conta modelos, não SKUs. Uma cor visível com estoque é necessária para destacar. A edição de uma cor preserva o destaque do modelo.

Painel: filtros por presença efetiva na loja (visibilidade e estoque), destaque e busca. Catálogo administrativo contém somente os nove PDFs e seleção para ZIP. A antiga gestão do operador foi preservada em /admin/produtos.

Validação: 49 testes aprovados; compilação Next.js concluída. Tema alternado e persistido após reload; desktop 1440px e celular 390px sem overflow horizontal. APIs administrativas mantêm autenticação e validação de origem.
