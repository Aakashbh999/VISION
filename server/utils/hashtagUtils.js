
function extractHashtagsAndSemester(text) {
  const hashtags = [];
  let semester = null;
  if (!text) return { hashtags, semester };

  const regex = /#(\w+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    hashtags.push(match[1]);

    const semMatch = match[1].match(/^semester(\d)$/i);
    if (semMatch) {
      semester = parseInt(semMatch[1], 10);
    }
  }
  return { hashtags, semester };
}

module.exports = { extractHashtagsAndSemester };
