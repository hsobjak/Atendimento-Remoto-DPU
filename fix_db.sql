-- SCRIPT DE CORREÇÃO PARA O SUPABASE
-- Se o erro "Erro ao enviar" persistir, cole e execute este script no "SQL Editor" do seu painel Supabase.

-- 1. Garante que a extensão de UUID esteja ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Garante que a tabela exista com a estrutura correta (não apaga dados se já existir)
CREATE TABLE IF NOT EXISTS assessments (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    applicant_name text not null,
    cpf text,
    demand_type text,
    eligibility_status text,
    full_data jsonb not null,
    analysis_result jsonb,
    deleted_at timestamp with time zone default null
);

-- 3. Habilita o RLS (Row Level Security)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 4. Remove políticas antigas para evitar conflito ao recriar
DROP POLICY IF EXISTS "Allow public insert" ON assessments;
DROP POLICY IF EXISTS "Allow authenticated full access" ON assessments;

-- 5. Cria a política que permite QUALQUER PESSOA enviar o formulário (Necessário para o Wizard)
CREATE POLICY "Allow public insert"
ON assessments FOR INSERT
TO public
WITH CHECK (true);

-- 6. Cria a política que permite apenas usuários AUTENTICADOS (você no Admin) verem os dados
CREATE POLICY "Allow authenticated full access"
ON assessments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- AVISO: Se você estiver usando o Vercel ou outra hospedagem, lembre-se de cadastrar 
-- VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações de variáveis de ambiente do painel deles.
