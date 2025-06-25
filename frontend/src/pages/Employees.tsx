import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, Users, Upload } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '../components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { useForm } from 'react-hook-form';
import Header from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

function EmployeeTxtUploadInline({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (uploadFile: File) => {
    setLoading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', uploadFile);
    const res = await fetch('/api/employees/upload-txt', { method: 'POST', body: formData });
    const data = await res.json();
    setLoading(false);
    if (data.status === 'success') {
      setMessage(`✅ Added ${data.added} employees.`);
      setFile(null);
      onUpload();
    } else {
      setMessage(data.error || 'Upload failed');
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <DropdownMenuItem
        onSelect={() => fileInputRef.current?.click()}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <Upload size={16} className="text-purple-400" />
        <span>Bulk Upload (.txt)</span>
      </DropdownMenuItem>
      {message && <span className={`ml-2 text-xs ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</span>}
    </>
  );
}

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any | null>(null);

  // Fetch employees and departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [empRes, depRes] = await Promise.all([
          fetch('/api/employes'),
          fetch('/api/departements')
        ]);
        if (!empRes.ok) throw new Error('Failed to fetch employees');
        if (!depRes.ok) throw new Error('Failed to fetch departments');
        const empData = await empRes.json();
        const depData = await depRes.json();
        setEmployees(empData.employes || []);
        setDepartments(depData || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  // Add Employee Dialog Form
  const addForm = useForm({ defaultValues: { nom: '', prenom: '', email: '', departement: '' } });
  const handleAdd = async (values: any) => {
    try {
      const res = await fetch('/api/employes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to add employee');
      setOpenAdd(false);
      setRefresh(r => !r);
      addForm.reset();
    } catch (err) {
      alert('Error adding employee');
    }
  };

  // Edit Employee Dialog Form
  const editForm = useForm({ defaultValues: { nom: '', prenom: '', email: '', departement: '' } });
  useEffect(() => {
    if (editEmployee) {
      editForm.reset({
        nom: editEmployee.nom,
        prenom: editEmployee.prenom,
        email: editEmployee.email,
        departement: editEmployee.departement
      });
    }
  }, [editEmployee]);
  const handleEdit = async (values: any) => {
    if (!editEmployee) return;
    try {
      const res = await fetch(`/api/employes/${editEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to update employee');
      setOpenEdit(false);
      setEditEmployee(null);
      setRefresh(r => !r);
    } catch (err) {
      alert('Error updating employee');
    }
  };

  // Delete Employee
  const handleDelete = async (emp: any) => {
    if (!window.confirm(`Delete employee "${emp.nom} ${emp.prenom}"?`)) return;
    try {
      const res = await fetch(`/api/employes/${emp.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete employee');
      setRefresh(r => !r);
    } catch (err) {
      alert('Error deleting employee');
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      (employee.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment =
      selectedDepartment === 'all' || employee.departement === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <Layout
      title="Employees"
      subtitle="Manage your team members and their information"
      customHeader={
        <Header
          title="Employees"
          subtitle="Manage your team members and their information"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      }
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Department Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
              >
                <option value="all" className="bg-gray-800">All Departments</option>
                {departments.map((dept: any) => (
                  <option key={dept.id || dept._id} value={dept.nom}>{dept.nom}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Add Employee Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-gradient-purple hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                <Plus size={20} />
                <span>Add Employee</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setOpenAdd(true)} className="flex items-center space-x-2 cursor-pointer">
                <Plus size={16} className="text-purple-400" />
                <span>Add Manually</span>
              </DropdownMenuItem>
              <EmployeeTxtUploadInline onUpload={() => setRefresh(r => !r)} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {!loading && !error && filteredEmployees.map((employee) => (
            <div key={employee.id} className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in">
              {/* Employee Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{employee.nom?.[0]}{employee.prenom?.[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{employee.nom} {employee.prenom}</h3>
                    <p className="text-gray-400 text-sm">{employee.role || ''}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  'bg-green-500/20 text-green-400'
                }`}>
                  Active
                </span>
              </div>
              {/* Employee Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail size={16} />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="text-gray-300">
                  <span className="text-sm">Department: </span>
                  <span className="text-white font-medium">{employee.departement}</span>
                </div>
                <div className="text-gray-300">
                  <span className="text-sm">Joined: </span>
                  <span className="text-white">{employee.date_embauche ? new Date(employee.date_embauche).toLocaleDateString() : '-'}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex space-x-2">
                <Dialog open={openEdit && editEmployee?.id === employee.id} onOpenChange={(open) => {
                  setOpenEdit(open);
                  if (!open) setEditEmployee(null);
                }}>
                  <DialogTrigger asChild>
                    <button onClick={() => { setEditEmployee(employee); setOpenEdit(true); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Employee</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                        <FormField name="nom" control={editForm.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField name="prenom" control={editForm.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
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
                        <FormField name="departement" control={editForm.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full bg-background border border-input rounded-md px-3 py-2">
                                <option value="">Select department</option>
                                {departments.map((dept: any) => (
                                  <option key={dept.id || dept._id} value={dept.nom}>{dept.nom}</option>
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
                <button onClick={() => handleDelete(employee)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {!loading && !error && filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-white text-lg font-medium mb-2">No employees found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogTrigger asChild>
          <span style={{ display: 'none' }} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>Fill in the details to add a new employee.</DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
              <FormField name="nom" control={addForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="prenom" control={addForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
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
              <FormField name="departement" control={addForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full bg-background border border-input rounded-md px-3 py-2">
                      <option value="">Select department</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id || dept._id} value={dept.nom}>{dept.nom}</option>
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
    </Layout>
  );
};

export default Employees;
