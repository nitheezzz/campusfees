export function isAuthorizedStaff(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.FEE_ADMIN_EMAILS ?? "")
    .split(",")
    .map(value => value.trim().toLocaleLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLocaleLowerCase());
}
