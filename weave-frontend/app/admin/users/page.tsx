"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminConfirmDialog } from "../../../components/admin-confirm-dialog";
import { Card, Pill } from "../../../components/ui";
import { SurfacePage, Tabs } from "../../../components/surface";
import { api } from "../../../lib/api";

type AdminUser = {
  id: number;
  email: string;
  phone?: string | null;
  role: string;
  locale: string;
  notificationPreference: string;
  suspended: boolean;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [action, setAction] = useState<"suspend" | "restore" | null>(null);
  const [busy, setBusy] = useState(false);

  const activeCount = useMemo(() => users.filter((user) => !user.suspended).length, [users]);
  const suspendedCount = users.length - activeCount;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      setUsers(await api<AdminUser[]>("/admin/users"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function submitAction() {
    if (!pendingUser || !action) return;
    setBusy(true);
    setMessage("");
    try {
      const updated = await api<AdminUser>(`/admin/users/${pendingUser.id}/${action}`, {
        method: "PATCH",
      });
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      setPendingUser(null);
      setAction(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the user state.");
    } finally {
      setBusy(false);
    }
  }

  const confirmTitle = action === "restore" ? "Restore this account?" : "Suspend this account?";
  const confirmCopy =
    action === "restore"
      ? "Restoring will allow the account back into the workspace and remove the suspended state."
      : "Suspending will block the account from normal workspace actions until an admin restores it.";
  const confirmLabel = action === "restore" ? "Restore account" : "Suspend account";

  return (
    <SurfacePage role="admin" title="User management." eyebrow="Admin">
      <Tabs labels={["All users", "Creators", "Brands", "Editors"]} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Total users</p>
          <p className="mt-3 text-3xl font-black tabular-nums">{users.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Active</p>
          <p className="mt-3 text-3xl font-black tabular-nums">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Suspended</p>
          <p className="mt-3 text-3xl font-black tabular-nums">{suspendedCount}</p>
        </Card>
      </div>

      {message ? (
        <p role="alert" aria-live="polite" className="mt-4 rounded-2xl border border-[var(--danger)]/30 bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--danger)]">
          {message}
        </p>
      ) : null}

      <div className="mt-6 space-y-4 lg:hidden">
        {loading ? (
          <Card className="text-sm text-[var(--muted)]">Loading users...</Card>
        ) : users.length ? (
          users.map((user) => (
            <Card key={user.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-black">{user.email}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{user.phone ?? "No phone number"}</p>
                </div>
                <Pill tone={user.suspended ? "coral" : "forest"}>{user.suspended ? "Suspended" : "Active"}</Pill>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">Role</dt>
                  <dd className="mt-1 font-bold">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">Locale</dt>
                  <dd className="mt-1 font-bold">{user.locale}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">Notifications</dt>
                  <dd className="mt-1 font-bold">{user.notificationPreference}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPendingUser(user);
                    setAction(user.suspended ? "restore" : "suspend");
                  }}
                  className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition-transform active:scale-[.97] ${
                    user.suspended
                      ? "bg-[var(--accent)] text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)]"
                      : "bg-[var(--danger)] text-white shadow-[4px_4px_0_var(--ink)]"
                  }`}
                >
                  {user.suspended ? "Restore account" : "Suspend account"}
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-sm text-[var(--muted)]">{message ? "No users to show." : "Loading users..."}</Card>
        )}
      </div>

      <Card className="mt-6 hidden overflow-x-auto p-0 lg:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]">
            <tr>
              <th scope="col" className="p-4">User</th>
              <th scope="col" className="p-4">Role</th>
              <th scope="col" className="p-4">Locale</th>
              <th scope="col" className="p-4">Notifications</th>
              <th scope="col" className="p-4">Status</th>
              <th scope="col" className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-sm text-[var(--muted)]">Loading users...</td>
              </tr>
            ) : users.length ? (
              users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--line)]">
                  <td className="p-4">
                    <div className="font-bold">{user.email}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{user.phone ?? "No phone number"}</div>
                  </td>
                  <td className="p-4"><Pill>{user.role}</Pill></td>
                  <td className="p-4 text-[var(--muted)]">{user.locale}</td>
                  <td className="p-4 text-[var(--muted)]">{user.notificationPreference}</td>
                  <td className="p-4">
                    <Pill tone={user.suspended ? "coral" : "forest"}>{user.suspended ? "Suspended" : "Active"}</Pill>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingUser(user);
                        setAction(user.suspended ? "restore" : "suspend");
                      }}
                      className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold transition-transform active:scale-[.97] ${
                        user.suspended
                          ? "bg-[var(--accent)] text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)]"
                          : "bg-[var(--danger)] text-white shadow-[4px_4px_0_var(--ink)]"
                      }`}
                    >
                      {user.suspended ? "Restore" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-sm text-[var(--muted)]">No users to show.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <AdminConfirmDialog
        open={Boolean(pendingUser && action)}
        title={confirmTitle}
        description={confirmCopy}
        confirmLabel={confirmLabel}
        busy={busy}
        onClose={() => {
          if (busy) return;
          setPendingUser(null);
          setAction(null);
        }}
        onConfirm={submitAction}
      />
    </SurfacePage>
  );
}
