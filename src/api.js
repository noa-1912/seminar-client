const GATEWAY_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:7000');

export async function fetchFromGateway(path) {
  const url = `${GATEWAY_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gateway error: ${res.status}`);
  return res.json().catch(() => res.text());
}
