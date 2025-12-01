-- Criar prato placeholder para pizzas mistas se não existir
INSERT INTO "pratos" (id, nome, descricao, preco, ativo, destaque, categoria_id, created_at, updated_at)
VALUES (999, 'Pizza Mista (Personalizada)', 'Pizza com sabores personalizados escolhidos pelo cliente', 0.00, true, false, 
  (SELECT id FROM "categorias" WHERE nome ILIKE '%pizza%' LIMIT 1), 
  NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
