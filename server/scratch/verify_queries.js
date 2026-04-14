const pool = require("../config/db");

async function verifyQueries(testUserId, testDiscussionId) {
    console.log(`--- Testing Queries for User: ${testUserId} ---`);

    try {
        // 1. Test getDiscussions equivalent
        const discussionsRes = await pool.query(`
            SELECT 
                d.discussion_id, d.title,
                EXISTS(
                    SELECT 1 FROM portal.discussion_likes dl 
                    WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $1 AND dl.vote_type = 1
                ) AS user_liked,
                COALESCE((
                    SELECT vote_type FROM portal.discussion_likes dl
                    WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $1
                ), 0) AS user_vote
            FROM portal.discussions d
            WHERE d.discussion_id = $2
        `, [testUserId, testDiscussionId]);

        console.log("Discussion Listing Result:", discussionsRes.rows[0]);

        // 2. Test Trending logic
        const trendingRes = await pool.query(`
            SELECT 
                d.discussion_id, d.title,
                EXISTS(
                    SELECT 1 FROM portal.discussion_likes dl 
                    WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $1 AND dl.vote_type = 1
                ) AS user_liked
            FROM portal.discussions d
            WHERE d.discussion_id = $2
        `, [testUserId, testDiscussionId]);

        console.log("Trending Result:", trendingRes.rows[0]);

    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        pool.end();
    }
}

// NOTE: Replace these with real IDs found in your DB for testing
const USER_ID = 5; 
const DISC_ID = 8;

verifyQueries(USER_ID, DISC_ID);
