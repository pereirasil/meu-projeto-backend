-- Script para verificar se as tabelas de sprint existem
USE gogoto38_votacao;

-- Verificar se a tabela sprints existe
SELECT 'sprints' as table_name, COUNT(*) as count FROM information_schema.tables 
WHERE table_schema = 'gogoto38_votacao' AND table_name = 'sprints';

-- Verificar se a tabela sprint_tasks existe
SELECT 'sprint_tasks' as table_name, COUNT(*) as count FROM information_schema.tables 
WHERE table_schema = 'gogoto38_votacao' AND table_name = 'sprint_tasks';

-- Se as tabelas existirem, mostrar a estrutura
DESCRIBE sprints;
DESCRIBE sprint_tasks;

