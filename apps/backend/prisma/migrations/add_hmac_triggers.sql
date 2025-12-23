-- Função para gerar HMAC usando chave secreta
-- Esta função é executada automaticamente antes de cada INSERT em audit_logs
CREATE OR REPLACE FUNCTION generate_audit_hmac()
RETURNS TRIGGER AS $$
DECLARE
  secret_key TEXT;
  previous_hash TEXT;
  data_to_hash TEXT;
BEGIN
  -- Busca a chave secreta ativa
  SELECT secret INTO secret_key
  FROM audit_keys
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF secret_key IS NULL THEN
    RAISE EXCEPTION 'Nenhuma chave de auditoria ativa encontrada. Execute o seed primeiro.';
  END IF;
  
  -- Busca o hash anterior (último registro da mesma escola)
  SELECT "logHash" INTO previous_hash
  FROM audit_logs
  WHERE "schoolId" = NEW."schoolId"
  ORDER BY "createdAt" DESC
  LIMIT 1;
  
  -- Prepara dados para hash (concatena todos os campos relevantes)
  data_to_hash := CONCAT(
    NEW."schoolId", '|',
    COALESCE(NEW."userId", ''), '|',
    NEW.action, '|',
    NEW.entity, '|',
    COALESCE(NEW."entityId", ''), '|',
    COALESCE(NEW.meta::TEXT, ''), '|',
    COALESCE(previous_hash, 'GENESIS')
  );
  
  -- Gera HMAC SHA-256
  NEW."logHash" := encode(
    hmac(data_to_hash, secret_key, 'sha256'),
    'hex'
  );
  
  -- Armazena o hash anterior para criar a chain
  NEW."previousHash" := previous_hash;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar antes de cada INSERT em audit_logs
DROP TRIGGER IF EXISTS audit_log_hmac_trigger ON audit_logs;
CREATE TRIGGER audit_log_hmac_trigger
BEFORE INSERT ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION generate_audit_hmac();

-- Constraint para garantir que logHash nunca seja NULL após o trigger
ALTER TABLE audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_hash_not_null;

ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_hash_not_null
CHECK ("logHash" IS NOT NULL);

-- Comentários para documentação
COMMENT ON FUNCTION generate_audit_hmac() IS 'Gera HMAC SHA-256 para cada log de auditoria, criando uma blockchain-style chain imutável';
COMMENT ON TRIGGER audit_log_hmac_trigger ON audit_logs IS 'Trigger que executa generate_audit_hmac() antes de cada INSERT';
COMMENT ON CONSTRAINT audit_logs_hash_not_null ON audit_logs IS 'Garante integridade: todo log deve ter um hash HMAC';
