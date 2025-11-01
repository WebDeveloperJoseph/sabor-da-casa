-- ========================================
-- Script para limpar pedidos de teste
-- ATENÇÃO: Isso deleta TODOS os pedidos!
-- ========================================

-- 1. Deletar todos os itens de pedidos (dependência)
DELETE FROM itens_pedido;

-- 2. Deletar todos os pedidos
DELETE FROM pedidos;

-- 3. Resetar o contador de IDs para começar do #1 novamente
ALTER SEQUENCE pedidos_id_seq RESTART WITH 1;
ALTER SEQUENCE itens_pedido_id_seq RESTART WITH 1;

-- 4. (Opcional) Se quiser limpar clientes de teste também:
-- DELETE FROM clientes;
-- ALTER SEQUENCE clientes_id_seq RESTART WITH 1;

-- ========================================
-- Verificar resultado
-- ========================================
SELECT COUNT(*) as total_pedidos FROM pedidos;
SELECT COUNT(*) as total_itens FROM itens_pedido;

-- Deve retornar 0 para ambos
