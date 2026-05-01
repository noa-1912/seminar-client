export function extractRoleFromJwt(token) {
  if (!token) return '';
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return '';
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized));

    return (
      json?.role ||
      json?.roles?.[0] ||
      json?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      ''
    );
  } catch {
    return '';
  }
}

export function resolveCurrentUserRole(user) {
  const directRole = user?.role || user?.Role || user?.roles?.[0] || user?.Roles?.[0];
  if (directRole) return String(directRole);

  const token =
    (typeof window !== 'undefined' && window.localStorage.getItem('authToken')) ||
    (typeof window !== 'undefined' && window.localStorage.getItem('token')) ||
    '';

  return extractRoleFromJwt(token);
}

export function isManagerRole(user) {
  const role = resolveCurrentUserRole(user).toLowerCase();
  return role === 'manager' || role === 'admin' || role === 'employer';
}
