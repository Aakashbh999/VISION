exports.reportContent = async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.body;
    const reporterId = req.user.portal_user_id;

    await pool.query(
      `
      INSERT INTO portal.reports
      (reporter_user_id, target_type, target_id, reason)
      VALUES ($1, $2, $3, $4)
      `,
      [reporterId, target_type, target_id, reason],
    );

    res.json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit report" });
  }
};
