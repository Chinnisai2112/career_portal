function parseAdminHostEmails() {
  const raw = process.env.ADMIN_HOST_EMAIL || "";
  return raw
    .split(/[,;\n\r]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isHostAdminEmail(email) {
  if (!email) return false;
  return parseAdminHostEmails().includes(String(email).toLowerCase());
}

/** @param {{ email?: string, isAdmin?: boolean } | null | undefined} user */
function isAdminUser(user) {
  if (!user) return false;
  if (user.isAdmin) return true;
  return isHostAdminEmail(user.email);
}

module.exports = { parseAdminHostEmails, isHostAdminEmail, isAdminUser };
