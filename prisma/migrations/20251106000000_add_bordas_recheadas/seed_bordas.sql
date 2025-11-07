-- SQL para popular bordas recheadas iniciais
-- Execute este script no Supabase SQL Editor quando a conexão voltar

-- Inserir bordas recheadas comuns
INSERT INTO bordas_recheadas (nome, preco_adicional, ativo, created_at, updated_at) VALUES
('Catupiry', 5.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cheddar', 6.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cream Cheese', 7.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chocolate', 8.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cheddar Bacon', 8.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nome) DO NOTHING;
