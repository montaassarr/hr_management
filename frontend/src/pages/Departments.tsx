import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import { Plus, Edit, Trash2, Users, Building2 } from 'lucide-react';
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

const Departments = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editDepartment, setEditDepartment] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/departements');
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line
  }, [refresh]);

  // Add Department Dialog Form
  const addForm = useForm({ defaultValues: { nom: '' } });
  const handleAdd = async (values: any) => {
    try {
      const res = await fetch('/api/departements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: values.nom })
      });
      if (!res.ok) throw new Error('Failed to add department');
      setOpenAdd(false);
      setRefresh(r => !r);
      addForm.reset();
    } catch (err) {
      alert('Error adding department');
    }
  };

  // Edit Department Dialog Form
  const editForm = useForm({ defaultValues: { nom: '' } });
  useEffect(() => {
    if (editDepartment) {
      editForm.reset({ nom: editDepartment.nom || editDepartment.name });
    }
  }, [editDepartment]);
  const handleEdit = async (values: any) => {
    if (!editDepartment) return;
    try {
      const res = await fetch(`/api/departements/${editDepartment.id || editDepartment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: values.nom })
      });
      if (!res.ok) throw new Error('Failed to update department');
      setOpenEdit(false);
      setEditDepartment(null);
      setRefresh(r => !r);
    } catch (err) {
      alert('Error updating department');
    }
  };

  // Delete Department
  const handleDelete = async (dep: any) => {
    if (!window.confirm(`Delete department "${dep.nom || dep.name}"?`)) return;
    try {
      const res = await fetch(`/api/departements/${dep.id || dep._id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete department');
      setRefresh(r => !r);
    } catch (err) {
      alert('Error deleting department');
    }
  };

  // Filtered departments
  const filteredDepartments = departments.filter((department) => {
    const term = searchTerm.toLowerCase();
    return (
      (department.nom || department.name)?.toLowerCase().includes(term) ||
      (department.description || '').toLowerCase().includes(term) ||
      (department.manager || '').toLowerCase().includes(term) ||
      (department.location || '').toLowerCase().includes(term)
    );
  });

  return (
    <Layout
      title="Departments"
      subtitle="Manage organizational departments and their details"
      customHeader={
        <Header
          title="Departments"
          subtitle="Manage organizational departments and their details"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      }
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-purple rounded-lg">
                  <Building2 className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Departments</p>
                  <p className="text-white text-xl font-bold">{filteredDepartments.length}</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-cyan rounded-lg">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Employees</p>
                  <p className="text-white text-xl font-bold">
                    {filteredDepartments.reduce((sum, dept) => sum + (dept.nombre_employes || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                  <span className="text-white font-bold">$</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Budget</p>
                  <p className="text-white text-xl font-bold">-</p>
                </div>
              </div>
            </div>
          </div>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <button className="bg-gradient-purple hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                <Plus size={20} />
                <span>Add Department</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Department</DialogTitle>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                  <FormField name="nom" control={addForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
        {loading && <div className="text-center text-white">Loading departments...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        {/* Departments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!loading && !error && filteredDepartments.map((department) => (
            <div key={department.id || department._id} className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in">
              {/* Department Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2">{department.nom || department.name}</h3>
                  {department.description && <p className="text-gray-400 text-sm">{department.description}</p>}
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              {/* Department Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Employees</p>
                  <p className="text-white font-bold text-lg">{department.nombre_employes || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Budget</p>
                  <p className="text-white font-bold text-lg">-</p>
                </div>
              </div>
              {/* Department Details */}
              <div className="space-y-2 mb-6">
                {department.manager && (
                  <div>
                    <span className="text-gray-400 text-sm">Manager: </span>
                    <span className="text-white font-medium">{department.manager}</span>
                  </div>
                )}
                {department.location && (
                  <div>
                    <span className="text-gray-400 text-sm">Location: </span>
                    <span className="text-white">{department.location}</span>
                  </div>
                )}
              </div>
              {/* Actions */}
              <div className="flex space-x-3">
                <Dialog open={openEdit && editDepartment?.id === (department.id || department._id)} onOpenChange={(open) => {
                  setOpenEdit(open);
                  if (!open) setEditDepartment(null);
                }}>
                  <DialogTrigger asChild>
                    <button onClick={() => { setEditDepartment(department); setOpenEdit(true); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Department</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                        <FormField name="nom" control={editForm.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
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
                <button onClick={() => handleDelete(department)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {!loading && !error && filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-white text-lg font-medium mb-2">No departments found</h3>
            <p className="text-gray-400">Try adding a new department</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Departments;
