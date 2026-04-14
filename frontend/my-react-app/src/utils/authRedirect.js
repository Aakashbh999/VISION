export const getUserLandingPath = (user) => {
  if (!user) return null;
  if (user.role === "admin") return "/admin/dashboard";
  if (user.email_status !== "verified") return "/verify-email";
  if (user.student_status !== "approved") return "/pending-approval";
  return "/dashboard";
};
