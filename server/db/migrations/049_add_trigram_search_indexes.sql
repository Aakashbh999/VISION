-- Enable trigram extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Discussions 
CREATE INDEX IF NOT EXISTS idx_discussions_title_trgm ON portal.discussions USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_discussions_content_trgm ON portal.discussions USING GIN (content gin_trgm_ops);

-- Resources
CREATE INDEX IF NOT EXISTS idx_resources_title_trgm ON portal.resources USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_description_trgm ON portal.resources USING GIN (description gin_trgm_ops);

-- Learning Circles (Groups)
CREATE INDEX IF NOT EXISTS idx_groups_name_trgm ON portal.study_groups USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_groups_description_trgm ON portal.study_groups USING GIN (description gin_trgm_ops);
