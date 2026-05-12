SET client_min_messages TO WARNING;

\echo '--- Starting Consolidated Database Migration ---'

\echo 'Step 01: Initial Schema (Types, Functions, Triggers)'
\i 001_initial_schema.sql

\echo 'Step 02: Core Identity (Users, Auth, Programs)'
\i 002_core_identity.sql

\echo 'Step 03: Learning & Resources (Roadmaps, Skills)'
\i 003_learning_and_resources.sql

\echo 'Step 04: Social & Groups (Discussions, Clubs)'
\i 004_social_and_groups.sql

\echo 'Step 05: Engagement & Reference (XP, Stats, IT Fields)'
\i 005_engagement_and_reference.sql

\echo '--- ✅ Consolidated Migrations Completed Successfully ---'