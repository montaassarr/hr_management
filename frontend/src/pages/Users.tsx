import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import { Plus, Edit, Trash2, Shield, User, Crown } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { useForm } from 'react-hook-form';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users || data || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [refresh]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles');
        if (!res.ok) throw new Error('Failed to fetch roles');
        const data = await res.json();
        setRoles(data || []);
      } catch (err) {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // Add User Dialog Form
  const addForm = useForm({ defaultValues: { name: '', email: '', role: '' } });
  const handleAdd = async (values: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to add user');
      setOpenAdd(false);
      setRefresh(r => !r);
      addForm.reset();
    } catch (err) {
      alert('Error adding user');
    }
  };

  // Edit User Dialog Form
  const editForm = useForm({ defaultValues: { name: '', email: '', role: '' } });
  useEffect(() => {
    if (editUser) {
      editForm.reset({
        name: editUser.name,
        email: editUser.email,
        role: editUser.role
      });
    }
  }, [editUser]);
  const handleEdit = async (values: any) => {
    if (!editUser) return;
    try {
      const res = await fetch(`/api/users/${editUser.id || editUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to update user');
      setOpenEdit(false);
      setEditUser(null);
      setRefresh(r => !r);
    } catch (err) {
      alert('Error updating user');
    }
  };

  // Delete User
  const handleDelete = async (user: any) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id || user._id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setRefresh(r => !r);
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return Crown;
      case 'HR Manager':
        return Shield;
      default:
        return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-gradient-purple';
      case 'HR Manager':
        return 'bg-gradient-cyan';
      case 'Department Manager':
        return 'bg-gradient-to-br from-green-400 to-emerald-500';
      default:
        return 'bg-gradient-to-br from-orange-400 to-pink-500';
    }
  };

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout
      title="Users & Roles"
      subtitle="Manage user accounts and role-based permissions"
      customHeader={
        <Header
          title="Users & Roles"
          subtitle="Manage user accounts and role-based permissions"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      }
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">User Management</h2>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <button className="bg-gradient-purple hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                <Plus size={20} />
                <span>Add User</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                  <FormField name="name" control={addForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="email" control={addForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="role" control={addForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full bg-background border border-input rounded-md px-3 py-2">
                          <option value="">Select role</option>
                          {roles.map((role: any) => (
                            <option key={role.id || role._id} value={role.nom}>{role.nom}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <button type="submit" className="bg-gradient-purple text-white px-4 py-2 rounded-lg">Add</button>
                    <DialogClose asChild>
                      <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Loading/Error State */}
        {loading && <div className="text-center text-white">Loading users...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        {/* Users Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-300 font-medium">User</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-medium">Email</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && !error && filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id || user._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-purple rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{user.name?.split(' ').map((n: string) => n[0]).join('')}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${getRoleColor(user.role)}`}>
                            <RoleIcon size={14} className="text-white" />
                          </div>
                          <span className="text-white">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Dialog open={openEdit && editUser?.id === user.id} onOpenChange={(open) => {
                            setOpenEdit(open);
                            if (!open) setEditUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <button onClick={() => { setEditUser(user); setOpenEdit(true); }} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                                <Edit size={16} />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                                  <FormField name="name" control={editForm.control} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Name</FormLabel>
                                      <FormControl><Input {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <FormField name="email" control={editForm.control} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl><Input type="email" {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <FormField name="role" control={editForm.control} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Role</FormLabel>
                                      <FormControl>
                                        <select {...field} className="w-full bg-background border border-input rounded-md px-3 py-2">
                                          <option value="">Select role</option>
                                          {roles.map((role: any) => (
                                            <option key={role.id || role._id} value={role.nom}>{role.nom}</option>
                                          ))}
                                        </select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <DialogFooter>
                                    <button type="submit" className="bg-gradient-purple text-white px-4 py-2 rounded-lg">Save</button>
                                    <DialogClose asChild>
                                      <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                                    </DialogClose>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          <button onClick={() => handleDelete(user)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
