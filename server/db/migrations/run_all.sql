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

\echo '--- ✅ All 10 Migrations Completed Successfully ---'