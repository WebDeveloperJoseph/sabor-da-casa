-- Otimizações de performance para consultas de pedidos
-- Adicionar índices para melhorar performance

-- Índice para busca por telefone (usado na página Meus Pedidos)
CREATE INDEX IF NOT EXISTS idx_pedidos_telefone ON pedidos(telefone);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);

-- Índice para busca por data de criação
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);

-- Índice composto para admin dashboard (status + data)
CREATE INDEX IF NOT EXISTS idx_pedidos_status_created_at ON pedidos(status, created_at);

-- Índice para avaliações por pedido
CREATE INDEX IF NOT EXISTS idx_avaliacoes_pedido_id ON avaliacoes(pedido_id);

-- Índice para itens do pedido
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);