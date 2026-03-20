SET client_min_messages TO WARNING;

\echo '--- Starting Full Database Migration ---'

\echo 'Step 01: Auth Schema'
\i 001_auth.sql

\echo 'Step 02: Portal Core'
\i 002_portal_core.sql

\echo 'Step 03: Social Features'
\i 003_social.sql

\echo 'Step 04: Roadmaps & Progress'
\i 004_roadmap.sql

\echo 'Step 05: Recommendation Base (Tags)'
\i 005_recommendation.sql

\echo 'Step 06: User Resource Interactions'
\i 006_user_interactions.sql

\echo 'Step 07: Recommendation Engine (Scoring)'
\i 007_recommendation_engine.sql

\echo 'Step 08: Program Roadmaps & Resources'
\i 008_program_roadmaps.sql

\echo 'Step 09: Groups & IT Clubs'
\i 009_groups.sql

\echo 'Step 10: Notifications & Reports'
\i 010_add_role_column.sql

\echo 'Step 11: IT Reference Tables'
\i 011_it_reference_tables.sql

\echo 'Step 12: Unique Auth User Constraint'
\i 012_add_unique_auth_user_constraint.sql

\echo 'Step 13: Password Reset Tokens (skip if exists)'
\i 013_password_reset_tokens.sql

\echo 'Step 14: Sync Schema (add missing columns/tables)'
\i 014_sync_schema.sql

\echo 'Step 15: Job Market Analytics'
\i 015_job_market_analytics.sql

\echo 'Step 16: Discussion System Upgrade'
\i 016_discussion_system_upgrade.sql

\echo 'Step 16b: Fix Tags Table'
\i 016b_fix_tags_table.sql

\echo 'Step 17: Resource Schema Cleanup'
\i 017_resource_schema_cleanup.sql

\echo 'Step 18: Ensure Discussion Schema'
\i 018_ensure_discussion_schema.sql

\echo 'Step 19: Add Reputation Points'
\i 019_add_reputation_points.sql

\echo 'Step 20: Enhance Groups Schema'
\i 020_enhance_groups_schema.sql

\echo 'Step 21: IT Clubs Directory Model'
\i 021_it_clubs_directory_model.sql

\echo 'Step 22: Feature Upgrades (degree filtering, moderation, gamification, boost)'
\i 022_feature_upgrades.sql

\echo 'Step 23: Add created_by to resources'
\i 023_add_created_by_to_resources.sql

\echo 'Step 24: Add cloudinary columns to resources'
\i 024_add_cloudinary_columns_to_resources.sql

\echo 'Step 25: Add original filename to resources'
\i 025_add_original_filename_to_resources.sql

\echo 'Step 26: Reporting and discussion upgrades'
\i 026_reporting_and_discussion_upgrades.sql

\echo 'Step 27a: Add image caption to discussions'
\i 027_add_image_caption_to_discussions.sql

\echo 'Step 27b: Add vote type to likes'
\i 027_add_vote_type_to_likes.sql

\echo 'Step 28: Comment likes and counters'
\i 028_comment_likes_and_counters.sql

\echo 'Step 29: Group Sectional Architecture'
\i 029_group_sectional_architecture.sql

\echo 'Step 30: Profile management'
\i 030_profile_management.sql

\echo 'Step 31: Group advanced schema'
\i 031_group_advanced_schema.sql

\echo '--- ✅ All 31 Migrations Completed Successfully ---'