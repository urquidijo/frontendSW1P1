'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Code2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Smartphone, 
  Sparkles,
  X 
} from 'lucide-react';
import { codeGenAPI } from '@/lib/api';

interface CodeGenerationPanelProps {
  diagramId: string;
  diagramName: string;
  onClose?: () => void;
}

export default function CodeGenerationPanel({ diagramId, diagramName, onClose }: CodeGenerationPanelProps) {
  const [isGeneratingBackend, setIsGeneratingBackend] = useState(false);
  const [isGeneratingFrontend, setIsGeneratingFrontend] = useState(false);
  const [backendResult, setBackendResult] = useState<any>(null);
  const [frontendResult, setFrontendResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSpringBoot = async () => {
    setIsGeneratingBackend(true);
    setError(null);
    setBackendResult(null);

    try {
      const result = await codeGenAPI.generateSpringBoot(diagramId);

      if (result.success) {
        setBackendResult(result);
      } else {
        setError(result.error || 'No se pudo generar el proyecto Spring Boot');
      }
    } catch (error: any) {
      console.error('Code generation error:', error);
      setError(error.response?.data?.error || 'Error al generar proyecto Spring Boot');
    } finally {
      setIsGeneratingBackend(false);
    }
  };

  const handleGenerateFlutter = async () => {
    setIsGeneratingFrontend(true);
    setError(null);
    setFrontendResult(null);

    try {
      const result = await codeGenAPI.generateFlutter(diagramId);

      if (result.success) {
        setFrontendResult(result);
      } else {
        setError(result.error || 'No se pudo generar el proyecto Flutter');
      }
    } catch (error: any) {
      console.error('Flutter generation error:', error);
      setError(error.response?.data?.error || 'Error al generar proyecto Flutter');
    } finally {
      setIsGeneratingFrontend(false);
    }
  };

  const handleDownloadBackend = async () => {
    if (!backendResult?.generatedCodeId) return;

    try {
      const blob = await codeGenAPI.downloadProject(backendResult.generatedCodeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagramName.toLowerCase().replace(/\s+/g, '-')}-springboot.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error al descargar el proyecto backend');
    }
  };

  const handleDownloadFrontend = async () => {
    if (!frontendResult?.generatedCodeId) return;

    try {
      const blob = await codeGenAPI.downloadProject(frontendResult.generatedCodeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagramName.toLowerCase().replace(/\s+/g, '-')}-flutter.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error al descargar el proyecto frontend');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/80 shadow-xl text-slate-800">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Generación de Código</h3>
            <p className="text-xs text-slate-500">Convierte tu modelo UML en código funcional</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Backend Card - Spring Boot */}
        <div className="rounded-2xl p-4 bg-white/70 border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Backend • Spring Boot
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Java 17/21
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            API REST completa con JPA Entities, DTOs, Repositorios, Servicios y Controladores.
          </p>

          <button
            onClick={handleGenerateSpringBoot}
            disabled={isGeneratingBackend}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingBackend ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Spring Boot...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Spring Boot</span>
              </>
            )}
          </button>

          {backendResult && (
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 mt-3">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-emerald-900 mb-0.5">
                    ¡Backend generado con éxito!
                  </h5>
                  <p className="text-[11px] text-emerald-700 mb-2">{backendResult.message}</p>
                  <button
                    onClick={handleDownloadBackend}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar ZIP</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frontend Card - Flutter */}
        <div className="rounded-2xl p-4 bg-white/70 border border-slate-200/80 shadow-2xs hover:border-violet-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Frontend • Flutter Mobile
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200/60">
              Dart
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            App móvil Flutter con modelos, servicios HTTP y pantallas CRUD listas para usar.
          </p>

          <button
            onClick={handleGenerateFlutter}
            disabled={isGeneratingFrontend}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingFrontend ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Flutter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar App Flutter</span>
              </>
            )}
          </button>

          {frontendResult && (
            <div className="bg-violet-50/80 border border-violet-200/80 rounded-xl p-3 mt-3">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-violet-900 mb-0.5">
                    ¡App Flutter generada con éxito!
                  </h5>
                  <p className="text-[11px] text-violet-700 mb-2">{frontendResult.message}</p>
                  <button
                    onClick={handleDownloadFrontend}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-xs font-semibold shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar ZIP</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error en la generación</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}