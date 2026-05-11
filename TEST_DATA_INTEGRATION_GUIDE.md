# 🧪 Test Data Integration Guide

## Quick Start (3 Steps)

### 1️⃣ Load Test Data Into Database

From the `server` directory:

```bash
cd server
npm run load-test-data
```

**What this does:**

- ✅ Loads 30 test users across 3 academic programs (CSIT, BIT, BCA)
- ✅ Creates 150 test resources (5 per user)
- ✅ Generates 150 test discussions (5 per user)
- ✅ Simulates 750+ user interactions
- ✅ Verifies all data loads correctly

**Expected output:**

```
✅ Successfully executed 150/150 statements

📈 Test Data Summary:
Users with Interests:    30
Users:                   30
Resources:               150
Discussions:             150
Interactions:            750+

✅ All data loaded successfully!
```

---

### 2️⃣ Start the Backend Server

```bash
cd server
npm run dev
```

**Expected output:**

```
Server running on port 5000
DB connected: search path set to [auth, portal, public]
```

---

### 3️⃣ Start the Frontend

**In a new terminal:**

```bash
cd frontend/my-react-app
npm run dev
```

**Expected output:**

```
VITE v7.2.4  ready in 345 ms
➜  Local:   http://localhost:5173
```

---

## 🎯 Where to Find Test Data

Once running, explore test data at:

### Discussions

- **URL**: `http://localhost:5173/discussions`
- **Test Data**: 150 test discussions from users across all programs
- **Features**: View, comment, vote on test discussions

### Feed

- **URL**: `http://localhost:5173/feed`
- **Test Data**: Live feed showing test user activity
- **Features**: See discussions, resources shared by test users

### Resources

- **URL**: `http://localhost:5173/resources`
- **Test Data**: 150 test resources (notes, books, projects, links)
- **Features**: Search, filter, view by program/tag

### Recommendations

- **URL**: `http://localhost:5173/recommendations`
- **Test Data**: Personalized recommendations based on test user interests
- **Features**: Algorithm provides program-matched, tag-relevant resources

### Study Groups

- **URL**: `http://localhost:5173/study-groups`
- **Test Data**: Groups created by test users
- **Features**: Join, view discussions

### User Profiles

- **URL**: `http://localhost:5173/profile`
- **Test Data**: Test user profiles with interests and resources
- **Features**: View all test user data

---

## 🔐 Authentication with Test Data

### Option 1: Auto-Login as Test User (Recommended)

Test users are pre-created with known credentials:

```
Email: testuser1@example.com
Password: TestPassword123!

Email: testuser2@example.com
Password: TestPassword123!

... and so on for users 1-30
```

**All test users use the same password for convenience.**

### Option 2: Register New Test User

1. Click "Sign Up"
2. Fill registration form with any test data
3. Account is automatically created
4. You can now upload resources and create discussions

### Option 3: Login as Admin (If Configured)

Check `.env` file for admin account credentials to access admin panel.

---

## 📊 Test Data Details

### Test Users by Program

**CSIT (Computer Science & IT) - Users 1-10**

- Interests: web-development, ai-ml, cybersecurity, database
- Resources: 50 (highly engaged)
- Discussions: 50

**BIT (Business IT) - Users 11-20**

- Interests: cloud-computing, data-science, devops
- Resources: 50 (moderately engaged)
- Discussions: 50

**BCA (Bachelor of Computer Applications) - Users 21-30**

- Interests: web-development, database, mobile-development
- Resources: 50 (growing engagement)
- Discussions: 50

### Resource Distribution

**By Type:**

- Notes: 45 (30%)
- Books: 40 (26.7%)
- Links: 35 (23.3%)
- Projects: 30 (20%)

**By Topic:**

- Web Development: 28 resources
- Data Science: 22 resources
- AI/ML: 22 resources
- Cybersecurity: 20 resources
- Cloud Computing: 20 resources
- DevOps: 18 resources
- Database: 18 resources
- Networking: 10 resources
- UI/UX: 10 resources
- Mobile Development: 10 resources

---

## 🧪 Real User Experience Testing Scenarios

### Scenario 1: Browse as New User

1. Don't log in initially
2. Browse public discussions and resources
3. Create an account
4. Get personalized recommendations
5. Create and share content

### Scenario 2: Explore Program-Specific Content

1. Filter resources by program (CSIT, BIT, BCA)
2. View tag-based recommendations
3. Join study groups in your program
4. Participate in program discussions

### Scenario 3: Test Recommendation Engine

1. Login as a test user
2. View top 10 recommendations
3. Click on resources to view interactions
4. Check how algorithm ranks resources
5. Review program match and tag overlap

### Scenario 4: Content Collaboration

1. Create discussion on a topic
2. Comment and vote on existing discussions
3. Upload a resource
4. Tag resources appropriately
5. See engagement metrics

### Scenario 5: Search & Discovery

1. Search resources by keyword
2. Filter by tag, program, type
3. Sort by popularity, recency
4. Discover related content
5. Add to learning goals

---

## 📈 Performance Testing with Test Data

### Check Query Performance

```bash
# Terminal 1: Start backend with performance monitoring
cd server
npm run dev

# Terminal 2: Test recommendation endpoint
curl -X GET http://localhost:5000/api/recommendations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Monitor Response Times

```javascript
// In browser DevTools → Network tab:
// 1. Open Feed page - watch API calls
// 2. Check response times (should be < 200ms)
// 3. Verify data loads in smooth scroll
```

### Database Performance

```sql
-- SSH into your database and run:
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

---

## 🧹 Cleanup (Remove Test Data)

When ready to clean up test data:

```bash
cd server
npm run load-test-data:cleanup
```

**Prompts:**

```
⚠️  This will DELETE all test data (Users 1-30). Continue? (yes/no): yes
```

**What happens:**

- ✅ Deletes all test users (1-30) and their data
- ✅ Removes test resources and discussions
- ✅ Cleans up test interactions
- ✅ Preserves all other production data
- ✅ Verifies complete cleanup

---

## ⚠️ Important Notes

### Test Data Identifiers

These help you identify test data vs production:

- **User IDs**: 1-30 (sequential test IDs)
- **Emails**: `testuser{id}@example.com`
- **Resource creators**: All created by users 1-30
- **Discussions**: All authored by users 1-30

### Do NOT Deploy Test Data to Production!

Test data is clearly identifiable. Before production deployment:

```bash
# Verify no test users exist
psql $DATABASE_URL -c "SELECT COUNT(*) FROM portal.users WHERE user_id <= 30;"
# Should return: 0
```

### Backup Test Data

To save your test data setup:

```bash
# Export test data to a new SQL file
pg_dump $DATABASE_URL \
  --data-only \
  --schema=portal \
  --table='portal.users' \
  --table='portal.resources' \
  --table='portal.discussions' \
  --where="user_id BETWEEN 1 AND 30" \
  > backup_test_data.sql
```

---

## 🐛 Troubleshooting

### Test data doesn't load

**Error**: `psql: command not found`

```bash
# Install PostgreSQL client tools or use Docker
# OR use the Node.js script instead:
npm run load-test-data
```

**Error**: `connection refused`

```bash
# Verify DATABASE_URL in .env file
# Check if PostgreSQL service is running
# Test connection: psql $DATABASE_URL
```

### Can't see test data in frontend

**Problem**: Logged in but no test discussions

- [ ] Verify backend is running (`npm run dev`)
- [ ] Check browser console for API errors
- [ ] Verify database connection in server logs
- [ ] Run verification: `npm run load-test-data` (it will verify)

**Problem**: Login not working

- [ ] Clear browser cache/cookies
- [ ] Try incognito mode
- [ ] Check email/password format
- [ ] Verify JWT_SECRET in .env

### Recommendation endpoint returns empty

**Problem**: No recommendations despite test data

- [ ] Check if user has interests assigned
- [ ] Verify resources have tags
- [ ] Check if resources are marked "approved"
- [ ] Run: `SELECT * FROM evaluation_queries.sql`

---

## 📞 Support Commands

### List All Test Users

```bash
psql $DATABASE_URL << EOF
SELECT user_id, username, email, program_id
FROM portal.users
WHERE user_id BETWEEN 1 AND 30
ORDER BY user_id;
EOF
```

### Count Test Data

```bash
psql $DATABASE_URL << EOF
SELECT
  COUNT(*) FILTER (WHERE user_id BETWEEN 1 AND 30) as test_users,
  COUNT(*) FILTER (WHERE created_by BETWEEN 1 AND 30) as test_resources,
  COUNT(*) FILTER (WHERE user_id BETWEEN 1 AND 30) as test_discussions
FROM portal.users, portal.resources, portal.discussions;
EOF
```

### View Test Data Statistics

```bash
cd server
node scripts/loadTestData.js  # Shows full verification report
```

---

## ✅ Checklist for Testing

- [ ] Test data loaded without errors
- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Can see discussions on feed
- [ ] Can view resources
- [ ] Can search by tag
- [ ] Recommendations appear for test users
- [ ] Can login as test user (testuser1@example.com)
- [ ] Can create new content
- [ ] Can comment/vote on content
- [ ] Performance acceptable (<200ms queries)
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## 📖 Related Documentation

- [Test Data Evaluation Report](RECOMMENDATION_ENGINE_EVALUATION_REPORT.md)
- [Load Test Data Guide](LOAD_TEST_DATA.md)
- [Evaluation Queries](evaluation_queries.sql)
- [Test Data SQL Schema](test_data_recommendation_engine.sql)

---

**Created**: May 11, 2026  
**Last Updated**: May 11, 2026  
**Status**: Ready for Real User Experience Testing
