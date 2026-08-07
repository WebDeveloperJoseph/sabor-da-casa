-- Adiciona a borda ao cardápio sem duplicar o registro em reexecuções.
INSERT INTO "pratos" (
    "nome",
    "descricao",
    "preco",
    "ativo",
    "destaque",
    "categoria_id",
    "created_at",
    "updated_at"
)
SELECT
    'Dois amores',
    'Borda recheada de chocolate branco e chocolate ao leite',
    15.00,
    true,
    false,
    categoria."id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "categorias" AS categoria
WHERE LOWER(categoria."nome") LIKE '%borda%'
  AND LOWER(categoria."nome") LIKE '%extra%'
  AND NOT EXISTS (
      SELECT 1
      FROM "pratos" AS prato
      WHERE prato."categoria_id" = categoria."id"
        AND LOWER(prato."nome") = LOWER('Dois amores')
  )
ORDER BY categoria."id"
LIMIT 1;
