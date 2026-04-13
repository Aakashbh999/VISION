-- Q&A workflow fields:
-- - qa_post_type: question or answer
-- - qa_question_post_id: links an answer to a question post

ALTER TABLE portal.group_posts
ADD COLUMN IF NOT EXISTS qa_post_type text,
ADD COLUMN IF NOT EXISTS qa_question_post_id bigint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'group_posts_qa_post_type_check'
  ) THEN
    ALTER TABLE portal.group_posts
    ADD CONSTRAINT group_posts_qa_post_type_check
    CHECK (qa_post_type IS NULL OR qa_post_type IN ('question', 'answer'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'group_posts_qa_question_fk'
  ) THEN
    ALTER TABLE portal.group_posts
    ADD CONSTRAINT group_posts_qa_question_fk
    FOREIGN KEY (qa_question_post_id)
    REFERENCES portal.group_posts(post_id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_group_posts_qa_questions
  ON portal.group_posts(group_id, user_id, created_at DESC)
  WHERE section = 'qa' AND qa_post_type = 'question' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_group_posts_qa_answers
  ON portal.group_posts(qa_question_post_id)
  WHERE section = 'qa' AND qa_post_type = 'answer' AND deleted_at IS NULL;
