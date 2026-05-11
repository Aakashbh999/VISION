# Loading Test Data for User Experience Testing

## Quick Start

This guide shows how to load the comprehensive test dataset into your VISION platform for real user experience testing.

### Method 1: Direct SQL Loading (Recommended)

**Prerequisites:**

- PostgreSQL installed with `psql` client
- Your `DATABASE_URL` from `.env` file
- The SQL test data file exists at: `server/db/test_data_recommendation_engine.sql`

**Step 1: Navigate to the database directory**

```bash
cd server/db
```

**Step 2: Load test data into your database**

```bash
# Using environment variable
psql $DATABASE_URL < test_data_recommendation_engine.sql

# OR using connection string directly (replace with your actual URL)
psql "postgresql://user:password@localhost:5432/vision_db" < test_data_recommendation_engine.sql
```

**Step 3: Verify data was loaded**

```bash
psql $DATABASE_URL << EOF
SELECT 'Users' as entity, COUNT(*) as count FROM portal.users WHERE user_id BETWEEN 1 AND 30
UNION ALL
SELECT 'Resources' as entity, COUNT(*) as count FROM portal.resources WHERE created_by BETWEEN 1 AND 30
UNION ALL
SELECT 'Discussions' as entity, COUNT(*) as count FROM portal.discussions WHERE user_id BETWEEN 1 AND 30
UNION ALL
SELECT 'Interactions' as entity, COUNT(*) as count FROM portal.user_resource_interactions;
EOF
```

**Expected Output:**

```
   entity    | count
─────────────┤───────
 Users       |    30
 Resources   |   150
 Discussions |   150
 Interactions|   750+
```

---

### Method 2: Node.js Script (For Integration)

Create a file: `server/scripts/loadTestData.js`

```javascript
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function loadTestData() {
  try {
    console.log("Loading test data...");

    const sqlPath = path.join(
      __dirname,
      "../db/test_data_recommendation_engine.sql",
    );
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    // Split by semicolons to handle multiple statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    let executedCount = 0;
    for (const statement of statements) {
      try {
        await pool.query(statement);
        executedCount++;
      } catch (err) {
        console.error(
          `Error executing statement: ${statement.substring(0, 50)}...`,
        );
        console.error(err.message);
      }
    }

    console.log(`✅ Loaded ${executedCount} statements`);

    // Verify
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM portal.users WHERE user_id BETWEEN 1 AND 30) as users,
        (SELECT COUNT(*) FROM portal.resources WHERE created_by BETWEEN 1 AND 30) as resources,
        (SELECT COUNT(*) FROM portal.discussions WHERE user_id BETWEEN 1 AND 30) as discussions,
        (SELECT COUNT(*) FROM portal.user_resource_interactions) as interactions
    `);

    console.log("✅ Test data loaded successfully:");
    console.table(result.rows[0]);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error loading test data:", err);
    process.exit(1);
  }
}

loadTestData();
```

**Run with:**

```bash
node server/scripts/loadTestData.js
```

---

### Method 3: Docker Container (Development)

If using Docker, add to your docker-compose.yml:

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - ./server/db/test_data_recommendation_engine.sql:/docker-entrypoint-initdb.d/10-test-data.sql
    environment:
      POSTGRES_DB: vision_db
```

---

## ⚠️ Important Notes

### Test Data Details

- **User Count**: 30 users across 3 programs (CSIT, BIT, BCA)
- **Resources**: 150 resources (5 per user)
- **Discussions**: 150 discussions (5 per user)
- **Interactions**: 750+ simulated interactions
- **User IDs**: 1-30 (reserved for testing)
- **Email Pattern**: `testuser{id}@example.com`

### Frontend Access

The test data is automatically accessible through:

- **Feed Page**: Shows all discussions from test users
- **Resources**: Shows all approved resources
- **Discussions**: Full discussion threads visible
- **Recommendations**: Algorithm evaluates test data

### Cleanup

**To remove test data (keep other data):**

```sql
-- Connect to database first
psql $DATABASE_URL << EOF

-- Delete test data in reverse dependency order
DELETE FROM portal.user_resource_interactions
  WHERE user_id BETWEEN 1 AND 30;

DELETE FROM portal.user_interests
  WHERE user_id BETWEEN 1 AND 30;

DELETE FROM portal.resource_tags
  WHERE resource_id IN (
    SELECT resource_id FROM portal.resources
    WHERE created_by BETWEEN 1 AND 30
  );

DELETE FROM portal.resources
  WHERE created_by BETWEEN 1 AND 30;

DELETE FROM portal.discussions
  WHERE user_id BETWEEN 1 AND 30;

DELETE FROM portal.users
  WHERE user_id BETWEEN 1 AND 30;

EOF
```

---

## 🔍 Testing the Integration

### 1. View Test Users in Database

```bash
psql $DATABASE_URL << EOF
SELECT user_id, username, email, program_id
FROM portal.users
WHERE user_id BETWEEN 1 AND 5
ORDER BY user_id;
EOF
```

### 2. Test Frontend Feed

Navigate to `http://localhost:3000/feed` and verify:

- ✅ Test user discussions appear
- ✅ Test user resources are visible
- ✅ Comments and interactions show correctly

### 3. Test Recommendations

```bash
# Check recommendations for test user 1
curl http://localhost:5000/api/recommendations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Discussions

Navigate to `http://localhost:3000/discussions` and verify:

- ✅ Test discussions appear
- ✅ Can view/comment on test discussions
- ✅ Voting works correctly

---

## 📊 Performance Testing

After loading, run evaluation queries:

```bash
psql $DATABASE_URL < server/db/evaluation_queries.sql
```

This will output:

- Program match rates by specialization
- Tag diversity metrics
- Query performance analytics
- Data distribution verification

---

## 🚀 Production Deployment

**Do NOT load test data into production!**

Test data is identifiable by:

- User emails ending in `@example.com`
- User IDs 1-30 (sequential test IDs)
- Test discussion titles with patterns
- Test resource names

If accidentally loaded to production:

1. Run cleanup SQL (see "Cleanup" section above)
2. Verify with: `SELECT COUNT(*) FROM portal.users WHERE user_id <= 30;` (should be 0)
3. Monitor production for data integrity

---

## ✅ Verification Checklist

- [ ] Test data loaded without errors
- [ ] Frontend displays test users and content
- [ ] Recommendations working for test users
- [ ] Database queries complete in <200ms
- [ ] No production data affected
- [ ] Cache working (if enabled)

---

## Support

If test data doesn't appear:

1. Check database connection: `psql $DATABASE_URL -c "SELECT version();"`
2. Verify data exists: `SELECT COUNT(*) FROM portal.users WHERE user_id BETWEEN 1 AND 30;`
3. Check frontend API calls in browser DevTools
4. Review backend logs for errors

---

**Created**: May 11, 2026  
**Last Updated**: May 11, 2026
