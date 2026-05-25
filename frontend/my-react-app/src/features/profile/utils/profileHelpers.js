export const MAX_BIO_WORDS = 130;

import { createElement } from "react";

export const RedditIcon = (props) =>
  createElement(
    "svg",
    { viewBox: "0 0 24 24", fill: "currentColor", ...props },
    createElement("path", {
      d: "M24 11.5c0-1.654-1.346-3-3-3-.396 0-.77.081-1.114.223-1.644-1.22-3.903-2.007-6.398-2.126l1.353-6.347 4.417.941c.05 1.05.918 1.889 1.989 1.889 1.103 0 2-.897 2-2s-.897-2-2-2c-1.034 0-1.876.79-1.982 1.808l-4.904-1.045c-.171-.036-.347.051-.416.211L13.25 5.567c-2.55.074-4.878.783-6.577 2.016-.328-.135-.688-.203-1.057-.203-1.654 0-3 1.346-3 3 0 .977.472 1.84 1.196 2.38-.035.197-.059.399-.059.604 0 3.321 4.14 6.016 9.25 6.016s9.25-2.695 9.25-6.016c0-.202-.023-.401-.057-.594.743-.541 1.233-1.413 1.233-2.407zm-16.75 3.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm10.75 0c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm-1.096 4.398c-.689.689-1.785 1.102-2.904 1.102s-2.215-.413-2.904-1.102c-.146-.146-.146-.384 0-.53.147-.147.384-.146.53 0 .546.547 1.458.882 2.374.882s1.828-.335 2.374-.882c.073-.073.169-.11.265-.11s.192.037.265.11c.146.146.146.384 0 .53z",
    }),
  );

export const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const buildDraftProfile = (profile) => ({
  full_name: profile?.full_name || "",
  bio: profile?.bio || "",
  program_id: profile?.program_id ? String(profile.program_id) : "",
  batch_year: profile?.batch_year ? String(profile.batch_year) : "",
  semester: profile?.semester ? String(profile.semester) : "",
  semester_is_manual: Boolean(profile?.semester_is_manual),
  tu_registration_no: profile?.tu_registration_no || "",
  linkedin_url: profile?.linkedin_url || "",
  facebook_url: profile?.facebook_url || "",
  instagram_url: profile?.instagram_url || "",
  youtube_url: profile?.youtube_url || "",
  reddit_url: profile?.reddit_url || "",
  twitter_url: profile?.twitter_url || "",
  github_url: profile?.github_url || "",
  website_url: profile?.website_url || "",
  campus: profile?.campus || "",
  university: profile?.university || "",
  career_scope: profile?.career_scope || "",
  hide_member_since: Boolean(profile?.hide_member_since),
  hide_registration_number: Boolean(profile?.hide_registration_number),
});
