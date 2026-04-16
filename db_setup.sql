-- Create assessments table for Supabase
CREATE TABLE assessments (
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

-- Enable RLS and setup permissive policies (since it's internal we just allow insert from anon)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (from the Wizard)
CREATE POLICY "Allow public insert"
ON assessments FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to read, update and delete
CREATE POLICY "Allow authenticated full access"
ON assessments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

/*
CRON JOB PARA EXCLUSÃO DEFINITIVA (Mapeando o pg_cron na Nuvem Supabase via SQL):
No painel Supabase, em "SQL Editor", você pode rodar esse script oficial para limpar tudo que está na lixeira há mais de 30 dias:

SELECT cron.schedule(
  'limpa_lixeira_30_dias', 
  '0 0 * * *', -- Roda à meia-noite todo dia
  $$
    DELETE FROM assessments WHERE deleted_at < now() - interval '30 days';
  $$
);
*/
