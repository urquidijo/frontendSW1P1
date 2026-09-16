'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { ArrowLeft, Sparkles, Code2, FolderKanban, AlertCircle } from 'lucide-react';
import UMLEditor from '@/components/editor/UMLEditor';
import AIChatInterface from '@/components/chat/AIChatInterface';
import CodeGenerationPanel from '@/components/code-generation/CodeGenerationPanel';
import { useAuthStore } from '@/stores/auth';
import { diagramAPI } from '@/lib/api';
import { Diagram } from '@/types/uml';

interface DiagramPageProps {
  params: {
    workspaceId: string;
    diagramId: string;
  };
}

export default function DiagramPage({ params }: DiagramPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCodeGenOpen, setIsCodeGenOpen] = useState(false);

  // Fetch diagram data
  useEffect(() => {
    const fetchDiagram = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);
        const diagramData = await diagramAPI.getDiagramById(params.diagramId);
        setDiagram(diagramData);
      } catch (error: any) {
        console.error('Error fetching diagram:', error);
        setError(error.response?.data?.message || 'Error al cargar diagrama');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagram();
  }, [params.diagramId, user, router]);

  // Handle diagram save
  const handleSave = async (diagramData: any) => {
    if (!diagram) return;

    try {
      console.log('💾 Guardando diagrama:', {
        diagramId: diagram.id,
        classesCount: diagramData.classes?.length,
        relationsCount: diagramData.relations?.length
      });

      await diagramAPI.updateDiagram(diagram.id, diagramData);
      console.log('✅ Diagrama guardado exitosamente');
    } catch (error: any) {
      console.error('❌ Error guardando diagrama:', error);
      setError(error.response?.data?.message || error.message || 'Error al guardar diagrama');
    }
  };

  // Handle UML generation from AI
  const handleUMLGenerated = (umlModel: any) => {
    if (!diagram) return;

    console.log('🎯 Aplicando modelo UML generado:', umlModel);

    const updatedData = {
      ...diagram.data,
      classes: umlModel.classes || [],
      relations: umlModel.relations || [],
      metadata: {
        ...diagram.data.metadata,
        lastAIGeneration: new Date().toISOString(),
      },
    };

    setDiagram({
      ...diagram,
      data: updatedData,
    });
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen mesh-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-base font-bold text-slate-900">Cargando Editor UML...</h2>
        </div>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="flex items-center justify-center min-h-screen mesh-bg">
        <div className="text-center p-8 glass-card rounded-2xl max-w-md border border-red-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Error al abrir el diagrama</h2>
          <p className="text-xs text-slate-600 mb-6">{error || 'No se encontró el diagrama solicitado'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col mesh-bg overflow-hidden">
      {/* Top Glass Navigation Bar */}
      <div className="glass-nav z-30 px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Breadcrumbs & Title */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => router.push(`/workspace/${params.workspaceId}`)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white/80 rounded-xl border border-slate-200/80 transition-all shadow-xs"
              title="Regresar al espacio"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Espacio</span>
            </button>

            <div className="h-5 w-px bg-slate-200" />

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                  {diagram.name}
                </h1>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                  v{diagram.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Última modif. {new Date(diagram.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2.5">
            {/* AI Chat Button */}
            <button
              onClick={() => {
                if (!isChatOpen) setIsCodeGenOpen(false);
                setIsChatOpen(!isChatOpen);
              }}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                isChatOpen
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-indigo-500/20'
                  : 'bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isChatOpen ? 'Cerrar Chat IA' : 'Asistente IA'}</span>
            </button>

            {/* Code Generation Button */}
            <button
              onClick={() => {
                if (!isCodeGenOpen) setIsChatOpen(false);
                setIsCodeGenOpen(!isCodeGenOpen);
              }}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                isCodeGenOpen
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isCodeGenOpen ? 'Cerrar Generador' : 'Generar Código'}</span>
            </button>

            <button
              onClick={() => router.push(`/workspace/${params.workspaceId}`)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl border border-slate-200/60 transition-all"
              title="Ver Espacio"
            >
              <FolderKanban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        <ReactFlowProvider>
          <UMLEditor
            diagram={diagram}
            workspaceId={params.workspaceId}
            userId={user.id}
            userName={user.name}
            onSave={handleSave}
          />
        </ReactFlowProvider>

        {/* AI Chat Drawer Interface */}
        {isChatOpen && (
          <div className="fixed right-5 top-16 w-96 max-h-[calc(100vh-5rem)] z-50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 border border-slate-200">
            <AIChatInterface
              diagramId={diagram.id}
              onUMLGenerated={handleUMLGenerated}
              onClose={() => setIsChatOpen(false)}
              isOpen={isChatOpen}
            />
          </div>
        )}

        {/* Floating Code Generation Drawer Panel */}
        {isCodeGenOpen && (
          <div className="fixed right-5 top-16 w-96 max-h-[calc(100vh-5rem)] overflow-y-auto z-50 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200">
            <CodeGenerationPanel
              diagramId={diagram.id}
              diagramName={diagram.name}
              onClose={() => setIsCodeGenOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}