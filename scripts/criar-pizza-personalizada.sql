-- Criar prato especial para pizzas personalizadas (ID 999)
-- Este prato serve como placeholder para pizzas com múltiplos sabores

INSERT INTO pratos (
  id,
  nome,
  descricao,
  preco,
  ativo,
  destaque,
  categoria_id,
  created_at,
  updated_at
)
SELECT 
  999,
  'Pizza Personalizada',
  'Pizza com sabores combinados à sua escolha (2-4 sabores)',
  0.00,
  false, -- Não aparece no cardápio normal
  false,
  (SELECT id FROM categorias WHERE nome = 'Pizzas Tradicionais' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM pratos WHERE id = 999
);
