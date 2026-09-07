# Filamentos com cores

Na categoria **Filamentos**, cada cor continua sendo um produto de estoque com SKU único, foto, preço no PIX, preço total no cartão e quantidade próprios.

1. Cadastre um produto por cor.
2. Escolha o mesmo **Tipo/modelo do filamento** em todas as cores que devem aparecer juntas. O menu começa com `BASIC`, `MATTE` e `SILK`, e novos tipos podem ser adicionados no próprio formulário.
3. Use a mesma **Marca** para as cores que devem aparecer juntas.
4. Informe o **Nome da cor** e escolha a **Cor da bolinha**.
5. Salve o produto. A loja reúne automaticamente as cores visíveis em um único cartão por modelo e marca.

Materiais, pesos, diâmetros ou linhas diferentes devem usar modelos diferentes. Filamentos antigos sem esses campos continuam como produtos individuais. Impressoras e acessórios não são agrupados.

Ao selecionar uma bolinha, foto, preço no PIX e preço total no cartão mudam. Cores esgotadas ficam riscadas: podem ser consultadas, mas não adicionadas ao carrinho. Um grupo sem nenhuma cor em estoque não aparece na listagem. Cores ocultas não aparecem.

O carrinho e o pedido identificam modelo e cor. A baixa de estoque continua ocorrendo quando o administrador conclui o pedido, pelo SKU/slug da cor comprada, conforme o fluxo existente.

## Verificação

- `node --test tests/product-variants.test.cjs`
- `npm run build`

A migração é aditiva: cria `filament_model`, `color_name` e `color_hex` e mantém os dados existentes. A versão da migração fica na chave `filament_variants_schema` em `site_settings`.
