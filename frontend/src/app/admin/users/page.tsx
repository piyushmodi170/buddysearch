'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Loader2, Ban, CheckCircle, Trash2, ShieldCheck, Pencil, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatDate, getInitials, purchasedPlanName } from '../../../lib/utils';
import { useDebounce } from '../../../hooks/useDebounce';
import { Filter, Pagination, ErrorCard } from '../../../components/admin/AdminControls';
import { Modal } from '../../../components/ui/Modal';
import { UserDetailModal } from '../../../components/admin/UserDetailModal';

interface AdminUser {
  id: string; name: string; email: string; phone?: string; role: string; city?: string;
  avatar?: string; verified: boolean; banned: boolean; isAdmin: boolean;
  membershipPlan: string; membershipExpiry?: string | Date | null; createdAt: string;
  onboardingCompleted?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', membershipPlan: 'NONE', role: 'CLIENT', city: '' });

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (debouncedSearch) params.search = debouncedSearch;
      if (role) params.role = role;
      if (status === 'verified') params.verified = 'true';
      if (status === 'unverified') params.verified = 'false';
      if (status === 'banned') params.banned = 'true';
      if (plan) params.plan = plan;

      const res = await api.get('/api/admin/users', { params });
      setUsers(res.data.data.data);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, role, status, plan]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, role, status, plan]);

  const act = async (id: string, fn: () => Promise<any>, okMsg: string) => {
    setBusyId(id);
    try {
      await fn();
      toast.success(okMsg);
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const toggleBan = (u: AdminUser) =>
    act(u.id, () => api.put(`/api/admin/users/${u.id}/ban`, { banned: !u.banned }), u.banned ? 'User unbanned' : 'User banned');

  const toggleVerify = (u: AdminUser) =>
    act(u.id, () => api.put(`/api/admin/users/${u.id}/verify`, { verified: !u.verified }), u.verified ? 'Verification removed' : 'User verified');

  const remove = (u: AdminUser) => {
    if (!window.confirm(`Permanently delete ${u.name}? This also removes their requests, chats and payments.`)) return;
    act(u.id, () => api.delete(`/api/admin/users/${u.id}`), 'User deleted');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('en-IN')} total. Open View to see every signup and onboarding answer.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input icon={<Search size={18} />} placeholder="Search name, email, city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Filter options={[['', 'All roles'], ['CLIENT', 'Clients'], ['BUDDY', 'Buddies'], ['BOTH', 'Both']]} value={role} onChange={setRole} />
        <Filter options={[['', 'All ID status'], ['verified', 'ID verified'], ['unverified', 'Unverified'], ['banned', 'Banned']]} value={status} onChange={setStatus} />
        <Filter options={[['', 'All plans'], ['NONE', 'None (not purchased)'], ['BASIC', 'BASIC'], ['STANDARD', 'STANDARD'], ['PREMIUM', 'PREMIUM'], ['STAR', 'STAR']]} value={plan} onChange={setPlan} />
      </div>

      <ErrorCard message={error} />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-16 text-center"><Loader2 className="animate-spin text-gray-400 mx-auto" size={28} /></td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No users match these filters</td></tr>
              )}
              {!loading && users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar
                        ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">{getInitials(u.name)}</div>}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          <button type="button" className="text-left hover:text-primary" onClick={() => setDetailId(u.id)}>
                            {u.name}
                          </button>
                          {u.isAdmin && <ShieldCheck size={13} className="text-primary" aria-label="Admin" />}
                        </div>
                        <div className="text-gray-500 text-xs truncate">{u.email}</div>
                        {u.onboardingCompleted === false && (
                          <div className="text-[11px] text-amber-600">Onboarding incomplete</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.role}</td>
                  <td className="px-6 py-4">
                    {u.banned
                      ? <Badge variant="danger">Banned</Badge>
                      : u.verified
                        ? <Badge variant="success">ID verified</Badge>
                        : <Badge variant="warning">Unverified</Badge>}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{purchasedPlanName(u)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" disabled={busyId === u.id} onClick={() => setDetailId(u.id)}>
                        <Eye size={14} className="mr-1" />View
                      </Button>
                      <Button variant="outline" size="sm" disabled={busyId === u.id} onClick={() => {
                        setEditing(u);
                        setEditForm({
                          name: u.name,
                          email: u.email,
                          membershipPlan: purchasedPlanName(u) === 'None' ? 'NONE' : u.membershipPlan,
                          role: u.role,
                          city: u.city || '',
                        });
                      }}>
                        <Pencil size={14} className="mr-1" />Edit
                      </Button>
                      <Button variant="outline" size="sm" disabled={busyId === u.id} onClick={() => toggleVerify(u)}>
                        <CheckCircle size={14} className="mr-1" />{u.verified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button variant={u.banned ? 'ghost' : 'danger'} size="sm" disabled={busyId === u.id} onClick={() => toggleBan(u)}>
                        <Ban size={14} className="mr-1" />{u.banned ? 'Unban' : 'Ban'}
                      </Button>
                      <Button variant="ghost" size="sm" disabled={busyId === u.id} onClick={() => remove(u)} aria-label={`Delete ${u.name}`}>
                        <Trash2 size={14} className="text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} pages={pages} onChange={setPage} />

      <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit user">
        {editing && (
          <form
            className="p-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusyId(editing.id);
              try {
                await api.put(`/api/admin/users/${editing.id}`, editForm);
                toast.success('User updated');
                setEditing(null);
                await load();
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Update failed');
              } finally {
                setBusyId(null);
              }
            }}
          >
            <Input label="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            <Input label="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            <Input label="City" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
              <option value="CLIENT">CLIENT</option>
              <option value="BUDDY">BUDDY</option>
              <option value="BOTH">BOTH</option>
            </select>
            <label className="block text-sm font-medium text-gray-700">Membership (only after purchase)</label>
            <select className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" value={editForm.membershipPlan} onChange={e => setEditForm({ ...editForm, membershipPlan: e.target.value })}>
              <option value="NONE">None — not purchased</option>
              <option value="BASIC">BASIC</option>
              <option value="STANDARD">STANDARD</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="STAR">STAR</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" isLoading={busyId === editing.id}>Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
