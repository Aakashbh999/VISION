-- Migration 027: Add image_caption to discussions
-- Schema: portal

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'image_caption') THEN
        ALTER TABLE portal.discussions ADD COLUMN image_caption TEXT;
    END IF;
END $$;
