-- CreateIndex
CREATE INDEX IF NOT EXISTS "pedidos_telefone_idx" ON "pedidos"("telefone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex  
CREATE INDEX IF NOT EXISTS "pedidos_created_at_idx" ON "pedidos"("created_at");

-- CreateIndex (compound index for common query patterns)
CREATE INDEX IF NOT EXISTS "pedidos_telefone_status_created_at_idx" ON "pedidos"("telefone", "status", "created_at");