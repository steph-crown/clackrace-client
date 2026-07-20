/** Admin API via Next rewrite → Fastify (`/api/clack/admin/*`). */

const CLACK = "/api/clack";

export type AdminMe = {
  user: {
    id: string;
    username: string | null;
    email: string;
    role: string;
  };
};

export type AdminOverview = {
  counts: {
    users: number;
    sessions: number;
    races: number;
    events: number;
    events7d: number;
  };
  topEvents7d: { name: string; count: number }[];
  entities: string[];
};

export type EntityPage = {
  entity: string;
  page: number;
  limit: number;
  total: number;
  rows: Record<string, unknown>[];
};

async function adminFetch<T>(
  path: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  try {
    const res = await fetch(`${CLACK}${path}`, { credentials: "include" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
        message?: string;
      };
      return {
        ok: false,
        status: res.status,
        message:
          body.error?.message ?? body.message ?? "Request failed.",
      };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, status: 0, message: "Couldn't reach the server." };
  }
}

export function fetchAdminMe() {
  return adminFetch<AdminMe>("/admin/me");
}

export function fetchAdminOverview() {
  return adminFetch<AdminOverview>("/admin/overview");
}

export function fetchAdminEntity(
  entity: string,
  params: {
    page?: number;
    limit?: number;
    q?: string;
    name?: string;
    scope?: string;
    mode?: string;
    visibility?: string;
  } = {},
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  if (params.name) qs.set("name", params.name);
  if (params.scope) qs.set("scope", params.scope);
  if (params.mode) qs.set("mode", params.mode);
  if (params.visibility) qs.set("visibility", params.visibility);
  const q = qs.toString();
  return adminFetch<EntityPage>(
    `/admin/entities/${encodeURIComponent(entity)}${q ? `?${q}` : ""}`,
  );
}
