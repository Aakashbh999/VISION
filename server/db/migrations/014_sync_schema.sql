-- Migration: Sync Schema with vision-schema2.sql
-- This migration safely adds any missing columns/tables without affecting existing data
-- Uses IF NOT EXISTS and DO blocks for safety

-- ============================================
-- 1. Add missing columns to portal.users
-- ============================================
DO $$ 
BEGIN
    -- profile_image
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'profile_image') THEN
        ALTER TABLE portal.users ADD COLUMN profile_image text;
    END IF;
    
    -- profile_image_public_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'profile_image_public_id') THEN
        ALTER TABLE portal.users ADD COLUMN profile_image_public_id text;
    END IF;
    
    -- cover_image
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'cover_image') THEN
        ALTER TABLE portal.users ADD COLUMN cover_image text;
    END IF;
    
    -- cover_image_public_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'cover_image_public_id') THEN
        ALTER TABLE portal.users ADD COLUMN cover_image_public_id text;
    END IF;
    
    -- is_verified
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE portal.users ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
    
    -- reset_password_token
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'reset_password_token') THEN
        ALTER TABLE portal.users ADD COLUMN reset_password_token text;
    END IF;
    
    -- reset_password_expires
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'reset_password_expires') THEN
        ALTER TABLE portal.users ADD COLUMN reset_password_expires timestamp without time zone;
    END IF;
    
    -- role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE portal.users ADD COLUMN role varchar(20) DEFAULT 'student';
    END IF;
    
    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE portal.users ADD COLUMN status varchar(20) DEFAULT 'active';
    END IF;
    
    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE portal.users ADD COLUMN updated_at timestamp without time zone DEFAULT now();
    END IF;
    
    RAISE NOTICE 'portal.users columns synced';
END $$;

-- ============================================
-- 2. Add missing columns to portal.discussions
-- ============================================
DO $$ 
BEGIN
    -- image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'image_url') THEN
        ALTER TABLE portal.discussions ADD COLUMN image_url text;
    END IF;
    
    -- image_public_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'image_public_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN image_public_id text;
    END IF;
    
    RAISE NOTICE 'portal.discussions columns synced';
END $$;

-- ============================================
-- 3. Create moderation_logs table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS portal.moderation_logs (
    log_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    admin_user_id integer REFERENCES portal.users(user_id) ON DELETE SET NULL,
    action_type varchar(50),
    target_type varchar(50),
    target_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Create password_reset_tokens table if not exists (auth schema)
-- Uses token_hash for security (raw token only sent to user, never stored)
-- ============================================
CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
    token_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    auth_user_id integer NOT NULL REFERENCES auth.users(auth_user_id) ON DELETE CASCADE,
    token_hash varchar(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4b. Add token_hash column if table exists with old schema
-- ============================================
DO $$
BEGIN
    -- Add token_hash if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' AND table_name = 'password_reset_tokens' AND column_name = 'token_hash') THEN
        ALTER TABLE auth.password_reset_tokens ADD COLUMN token_hash varchar(255);
    END IF;
    RAISE NOTICE 'auth.password_reset_tokens token_hash column ensured';
END $$;

-- ============================================
-- 5. Create refresh_tokens table (DB-backed token storage with hashing)
-- ============================================
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    auth_user_id integer NOT NULL REFERENCES auth.users(auth_user_id) ON DELETE CASCADE,
    token_hash varchar(255) NOT NULL UNIQUE,
    device_id varchar(64),
    device_info jsonb,
    ip_address varchar(45),
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_used_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON auth.refresh_tokens(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON auth.refresh_tokens(token_hash) WHERE revoked = false;

-- ============================================
-- 5. Create notifications table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS portal.notifications (
    notification_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id integer REFERENCES portal.users(user_id) ON DELETE CASCADE,
    title varchar(150),
    message text NOT NULL,
    type varchar(40),
    is_read boolean DEFAULT false,
    actor_user_id integer REFERENCES portal.users(user_id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Create reports table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS portal.reports (
    report_id serial PRIMARY KEY,
    reporter_user_id integer REFERENCES portal.users(user_id),
    target_type varchar(50),
    target_id integer,
    reason text,
    status varchar(30) DEFAULT 'open',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Done
-- ============================================
SELECT '✅ Schema sync migration completed successfully' AS status;
