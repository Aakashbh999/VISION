const ONLINE_WINDOW_MINUTES = 5;

const buildPresenceSelect = (alias = "u") => `
  ${alias}.last_seen_at,
  CASE
    WHEN ${alias}.last_seen_at IS NOT NULL
     AND ${alias}.last_seen_at >= NOW() - INTERVAL '${ONLINE_WINDOW_MINUTES} minutes'
    THEN TRUE
    ELSE FALSE
  END AS is_online
`;

module.exports = {
  ONLINE_WINDOW_MINUTES,
  buildPresenceSelect,
};
