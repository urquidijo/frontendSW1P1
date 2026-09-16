'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Users, 
  Calendar, 
  FileText, 
  ArrowLeft, 
  Share2, 
  X, 
  Trash2, 
  FileCode, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';
import { diagramAPI, workspaceAPI } from '@/lib/api';
import { Diagram } from '@/types/uml';
import XmiModal from '@/components/editor/XmiModal';

interface WorkspacePageProps {
  params: {
    workspaceId: string;
  };
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentWorkspace, fetchWorkspaceById, isLoading } = useWorkspaceStore();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [isCreatingDiagram, setIsCreatingDiagram] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [isInviting, setIsInviting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<Diagram | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isXmiModalOpen, setIsXmiModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchWorkspaceById(params.workspaceId);
  }, [params.workspaceId, user, router, fetchWorkspaceById]);

  useEffect(() => {
    if (currentWorkspace?.diagrams) {
      const validDiagrams = currentWorkspace.diagrams.map(diagram => ({
        ...diagram,
        data: diagram.data || { classes: [], relations: [] }
      }));
      setDiagrams(validDiagrams);
    }
  }, [currentWorkspace]);

  const handleCreateDiagram = async () => {
    if (!newDiagramName.trim() || !user) return;

    try {
      setIsCreatingDiagram(true);
      const newDiagram = await diagramAPI.createDiagram(params.workspaceId, newDiagramName);
      setDiagrams(prev => [newDiagram, ...prev]);
      setNewDiagramName('');
      router.push(`/workspace/${params.workspaceId}/diagram/${newDiagram.id}`);
    } catch (error: any) {
      console.error('Error creating diagram:', error);
      alert(error.response?.data?.message || 'Error al crear diagrama');
    } finally {
      setIsCreatingDiagram(false);
    }
  };

  const handleDiagramClick = (diagramId: string) => {
    router.push(`/workspace/${params.workspaceId}/diagram/${diagramId}`);
  };

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorEmail.trim()) return;

    try {
      setIsInviting(true);
      await workspaceAPI.addCollaborator(params.workspaceId, collaboratorEmail, collaboratorRole);
      await fetchWorkspaceById(params.workspaceId);
      setIsShareModalOpen(false);
      setCollaboratorEmail('');
      setCollaboratorRole('VIEWER');
      alert('Colaborador invitado exitosamente');
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      alert(error.response?.data?.message || 'Error al invitar colaborador');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteDiagram = async () => {
    if (!diagramToDelete) return;

    try {
      setIsDeleting(true);
      await diagramAPI.deleteDiagram(diagramToDelete.id);
      setDiagrams(prev => prev.filter(d => d.id !== diagramToDelete.id));
      setIsDeleteModalOpen(false);
      setDiagramToDelete(null);
      alert('Diagrama eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting diagram:', error);
      alert(error.response?.data?.message || 'Error al eliminar diagrama');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (diagram: Diagram, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiagramToDelete(diagram);
    setIsDeleteModalOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen mesh-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isLoading || !currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen mesh-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Cargando espacio...</h2>
          <p className="text-xs text-slate-500">Un momento por favor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      {/* Sticky Glass Header */}
      <header className="glass-nav sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button and Workspace Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white/80 rounded-xl border border-slate-200/80 transition-all shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <div className="h-5 w-px bg-slate-200" />

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    {currentWorkspace.name}
                  </h1>
                </div>
                {currentWorkspace.description && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {currentWorkspace.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Diagramas</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{diagrams.length}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Colaboradores</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{currentWorkspace.collaborators.length + 1}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Creado El</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {new Date(currentWorkspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Diagram Creation Bar */}
        <div className="glass-card rounded-2xl p-6 border border-white/80">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Crear o Importar Diagrama UML
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              placeholder="Nombre del nuevo diagrama..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateDiagram()}
            />

            <button
              onClick={handleCreateDiagram}
              disabled={!newDiagramName.trim() || isCreatingDiagram}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm hover:shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isCreatingDiagram ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Crear Diagrama</span>
            </button>

            <button
              onClick={() => setIsXmiModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all whitespace-nowrap"
              title="Importar diagrama XMI desde Enterprise Architect"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Importar EA / XMI</span>
            </button>
          </div>
        </div>

        {/* Diagrams List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Diagramas UML en este Espacio
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {diagrams.length} {diagrams.length === 1 ? 'diagrama' : 'diagramas'}
            </span>
          </div>

          {diagrams.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl glass-card border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No hay diagramas aún</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Escribe un nombre arriba y crea tu primer diagrama o importa un modelo XMI existente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {diagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  onClick={() => handleDiagramClick(diagram.id)}
                  className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/80 cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          v{diagram.version}
                        </span>
                        <button
                          onClick={(e) => openDeleteModal(diagram, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar diagrama"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {diagram.name}
                    </h3>

                    <div className="flex items-center space-x-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-700 font-medium">
                        {diagram.data?.classes?.length || 0} clases
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {diagram.data?.relations?.length || 0} relaciones
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {new Date(diagram.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="text-indigo-600 flex items-center space-x-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Abrir editor</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collaborators List Section */}
        <div className="glass-card rounded-2xl p-6 border border-white/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Miembros y Colaboradores
              </h3>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invitar</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Owner Row */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-semibold">
                  {currentWorkspace.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentWorkspace.owner.name}</p>
                  <p className="text-[11px] text-slate-500">{currentWorkspace.owner.email}</p>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                <span>Propietario</span>
              </span>
            </div>

            {/* Collaborators Rows */}
            {currentWorkspace.collaborators.map((collaborator) => (
              <div key={collaborator.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                    {collaborator.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{collaborator.user.name}</p>
                    <p className="text-[11px] text-slate-500">{collaborator.user.email}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  collaborator.role === 'EDITOR'
                    ? 'text-violet-700 bg-violet-50 border-violet-200/60'
                    : 'text-slate-600 bg-slate-100 border-slate-200/60'
                }`}>
                  {collaborator.role === 'EDITOR' ? 'Editor' : 'Lector'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Invite Collaborator Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Invitar Colaborador</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteCollaborator} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="colaborador@ejemplo.com"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  El usuario debe estar registrado previamente en la plataforma
                </p>
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Rol de Acceso
                </label>
                <select
                  id="role"
                  value={collaboratorRole}
                  onChange={(e) => setCollaboratorRole(e.target.value as 'EDITOR' | 'VIEWER')}
                  className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="VIEWER">Lector (Solo visualización)</option>
                  <option value="EDITOR">Editor (Modificar y guardar)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!collaboratorEmail.trim() || isInviting}
                  className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isInviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Invitando...</span>
                    </>
                  ) : (
                    <span>Enviar Invitación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Diagram Confirmation Modal */}
      {isDeleteModalOpen && diagramToDelete && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Eliminar diagrama?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              ¿Estás seguro de que deseas eliminar permanentemente el diagrama{' '}
              <span className="font-semibold text-slate-900">"{diagramToDelete.name}"</span>?
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteDiagram}
                disabled={isDeleting}
                className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar Diagrama</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal XMI Import */}
      {isXmiModalOpen && (
        <XmiModal
          workspaceId={params.workspaceId}
          defaultTab="import"
          onClose={() => setIsXmiModalOpen(false)}
          onImportSuccess={(newDiagram) => {
            setIsXmiModalOpen(false);
            setDiagrams((prev) => [newDiagram, ...prev]);
            router.push(`/workspace/${params.workspaceId}/diagram/${newDiagram.id}`);
          }}
        />
      )}
    </div>
  );
}