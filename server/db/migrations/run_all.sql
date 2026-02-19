SET client_min_messages TO WARNING;
\echo 'Running 001_auth.sql'
\i 001_auth.sql

\echo 'Running 002_portal_core.sql'
\i 002_portal_core.sql

\echo 'Running 003_social.sql'
\i 003_social.sql

\echo 'Running 004_roadmap.sql'
\i 004_roadmap.sql

\echo 'Running 006_user_interactions.sql'
\i 006_user_interactions.sql

\echo 'All migrations completed'
