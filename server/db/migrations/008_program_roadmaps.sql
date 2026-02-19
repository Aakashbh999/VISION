-- ============================================
-- program_roadmaps : maps academic degrees to career roadmaps
-- ============================================

CREATE TABLE IF NOT EXISTS portal.program_roadmaps (
    program_id INT NOT NULL REFERENCES portal.programs(program_id) ON DELETE CASCADE,
    roadmap_id INT NOT NULL REFERENCES portal.roadmaps(roadmap_id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (program_id, roadmap_id)
);

-- Helpful index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_program_roadmaps_program
ON portal.program_roadmaps(program_id);

CREATE INDEX IF NOT EXISTS idx_program_roadmaps_roadmap
ON portal.program_roadmaps(roadmap_id);
