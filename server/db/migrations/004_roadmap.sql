-- ============================================
-- Migration: 004_roadmap.sql (FINAL CLEAN)
-- Description: Roadmap learning system
-- Schema: portal
-- ============================================

-- 1. ROADMAPS (career paths)
CREATE TABLE IF NOT EXISTS portal.roadmaps (
    roadmap_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration VARCHAR(50), -- e.g., '5-7 months'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROADMAP STEPS (ordered learning steps)
CREATE TABLE IF NOT EXISTS portal.roadmap_steps (
    step_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    roadmap_id INT NOT NULL REFERENCES portal.roadmaps(roadmap_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    step_order INT NOT NULL,
    estimated_time VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(roadmap_id, step_order)
);

-- 3. LINK STEPS TO GLOBAL RESOURCES (IMPORTANT FIX)
CREATE TABLE IF NOT EXISTS portal.step_resource_map (
    step_id INT REFERENCES portal.roadmap_steps(step_id) ON DELETE CASCADE,
    resource_id INT REFERENCES portal.resources(resource_id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY(step_id, resource_id)
);

-- 4. USER PROGRESS TRACKING
CREATE TABLE IF NOT EXISTS portal.user_roadmap_progress (
    progress_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    step_id INT NOT NULL REFERENCES portal.roadmap_steps(step_id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, step_id)
);
