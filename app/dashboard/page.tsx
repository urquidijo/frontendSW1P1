'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  X, 
  Layers, 
  LogOut, 
  FolderKanban, 
  Users, 
  FileText, 
  ArrowRight, 
  Sparkles,
  Share2,
  FolderPlus
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { workspaces, fetchWorkspaces, createWorkspace, isLoading } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'owned' | 'collaborated'>('owned');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchWorkspaces();
  }, [user, router, fetchWorkspaces]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      const newWorkspace = await createWorkspace(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      router.push(`/workspace/${newWorkspace.id}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('No se pudo crear el espacio de trabajo. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setFormData({ name: '', description: '' });
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({ name: '', description: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const totalDiagrams = (workspaces.owned || []).reduce((acc, w) => acc + (w._count?.diagrams || 0), 0);

  return (
    <div className="min-h-screen mesh-bg">
      {/* Modern Glass Navbar */}
      <nav className="glass-nav sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight">UML Studio</span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                  Colaborativo
                </span>
              </div>
            </div>

            {/* Right actions: User pill & Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700">{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl border border-transparent hover:border-red-200/60 transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl glass-card border border-white/80 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Panel de Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Hola, {user.name} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500 max-w-xl">
                Gestiona tus espacios de trabajo, modela arquitecturas de software y genera código Spring Boot o Flutter en un solo lugar.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center space-x-4">
              <div className="px-4 py-3 rounded-xl bg-white/70 border border-slate-200/80 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Espacios</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{workspaces.owned.length}</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/70 border border-slate-200/80 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diagramas</p>
                <p className="text-xl font-bold text-indigo-600 mt-0.5">{totalDiagrams}</p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm hover:shadow-md shadow-indigo-500/20 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Espacio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Section Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('owned')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'owned'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Mis Espacios</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 font-semibold">
                {workspaces.owned.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('collaborated')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'collaborated'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Compartidos Conmigo</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold">
                {workspaces.collaborated.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content Grids */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'owned' ? (
              /* Owned Workspaces Grid */
              workspaces.owned.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl glass-card border border-dashed border-slate-300">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <FolderPlus className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Aún no tienes espacios de trabajo</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                    Crea tu primer espacio para comenzar a diseñar diagramas UML y generar código completo.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Espacio de Trabajo</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workspaces.owned.map((workspace) => (
                    <div
                      key={workspace.id}
                      onClick={() => router.push(`/workspace/${workspace.id}`)}
                      className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-200/80 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <FolderKanban className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                            Propietario
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {workspace.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                          {workspace.description || 'Sin descripción'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1 text-slate-600">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{workspace._count?.diagrams || 0}</span>
                            <span className="text-[11px]">diag.</span>
                          </span>
                          <span className="flex items-center space-x-1 text-slate-600">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{workspace._count?.collaborators || 0}</span>
                            <span className="text-[11px]">colab.</span>
                          </span>
                        </div>

                        <div className="text-indigo-600 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Collaborated Workspaces Grid */
              workspaces.collaborated.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl glass-card border border-dashed border-slate-300">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Sin espacios compartidos</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                    Cuando otros usuarios te inviten a colaborar en sus espacios, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workspaces.collaborated.map((workspace) => (
                    <div
                      key={workspace.id}
                      onClick={() => router.push(`/workspace/${workspace.id}`)}
                      className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-200/80 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <FolderKanban className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded-full">
                            Colaborador
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                          {workspace.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                          {workspace.description || 'Sin descripción'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-slate-600">
                          De: <span className="font-semibold text-slate-800">{workspace.owner?.name}</span>
                        </span>

                        <div className="text-violet-600 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Modern Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nuevo Espacio de Trabajo</h3>
              </div>
              <button
                onClick={closeCreateModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nombre del Espacio *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Ej. Sistema de Telemetría OBD"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Breve resumen del propósito de este espacio..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || isCreating}
                  className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Crear Espacio</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}