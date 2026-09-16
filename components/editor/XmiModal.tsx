'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileCode, CheckCircle, AlertCircle, Loader2, FileUp } from 'lucide-react';
import { xmiAPI } from '@/lib/api';

interface XmiModalProps {
  diagramId?: string;
  diagramName?: string;
  workspaceId: string;
  defaultTab?: 'export' | 'import';
  onClose: () => void;
  onImportSuccess: (diagram: any, mode?: 'current' | 'new') => void;
}

type Tab = 'export' | 'import';
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function XmiModal({
  diagramId,
  diagramName = 'Diagrama',
  workspaceId,
  defaultTab,
  onClose,
  onImportSuccess,
}: XmiModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab || (diagramId ? 'export' : 'import'));
  const [importMode, setImportMode] = useState<'current' | 'new'>(diagramId ? 'current' : 'new');
  const [exportStatus, setExportStatus] = useState<Status>('idle');
  const [importStatus, setImportStatus] = useState<Status>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importStats, setImportStats] = useState<{ classesImported: number; relationsImported: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importName, setImportName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── EXPORT ──────────────────────────────────────────────
  const handleExport = async () => {
    if (!diagramId) return;
    setExportStatus('loading');
    try {
      const xmiContent = await xmiAPI.exportXmi(diagramId);

      // Trigger file download in browser
      const blob = new Blob([xmiContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${diagramName.replace(/\s+/g, '_')}.xmi`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error exportando XMI:', err);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 4000);
    }
  };

  // ── IMPORT ──────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!file.name.match(/\.(xmi|xml)$/i)) {
      setImportMessage('Solo se aceptan archivos .xmi o .xml');
      setImportStatus('error');
      return;
    }
    setSelectedFile(file);
    setImportMessage('');
    setImportStatus('idle');
    if (!importName) {
      setImportName(file.name.replace(/\.(xmi|xml)$/i, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImportStatus('loading');
    setImportMessage('');
    try {
      const result = await xmiAPI.importXmi(selectedFile, workspaceId, importName || undefined);
      setImportStats(result.stats);
      setImportMessage(result.message);
      setImportStatus('success');
      onImportSuccess(result.diagram, importMode);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al importar el archivo XMI';
      setImportMessage(msg);
      setImportStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[540px] max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-700 to-slate-800">
          <div className="flex items-center gap-3">
            <FileCode className="text-white" size={22} />
            <div>
              <h2 className="text-white font-semibold text-base">Enterprise Architect</h2>
              <p className="text-slate-300 text-xs">
                {diagramId ? 'Exportar / Importar XMI 2.1' : 'Importar Diagrama XMI 2.1'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - Only show tabs if we have a diagramId to export */}
        {diagramId && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'export'
                  ? 'text-slate-800 border-b-2 border-slate-700 bg-slate-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Download size={16} />
              Exportar a EA
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'import'
                  ? 'text-slate-800 border-b-2 border-slate-700 bg-slate-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Upload size={16} />
              Importar desde EA
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── EXPORT TAB ── */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">¿Qué se exporta?</h3>
                <ul className="text-xs text-blue-700 space-y-1 mt-2">
                  <li>✅ Clases e interfaces con nombre y estereotipo</li>
                  <li>✅ Atributos (nombre, tipo, visibilidad, multiplicidad)</li>
                  <li>✅ Métodos/operaciones con parámetros</li>
                  <li>✅ Relaciones: Asociación, Composición, Agregación</li>
                  <li>✅ Herencia, Realización, Dependencia</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <FileCode size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{diagramName}</p>
                    <p className="text-xs text-gray-500">Formato: XMI 2.1 • Compatible con Enterprise Architect 6.5+</p>
                  </div>
                </div>
              </div>

              {/* Export status */}
              {exportStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle size={16} />
                  <span>¡Archivo XMI descargado exitosamente!</span>
                </div>
              )}
              {exportStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />
                  <span>Error al exportar. Verifica la conexión con el servidor.</span>
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={exportStatus === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors text-sm"
              >
                {exportStatus === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Generando XMI...</>
                ) : (
                  <><Download size={16} /> Descargar .xmi</>
                )}
              </button>
            </div>
          )}

          {/* ── IMPORT TAB ── */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-1">¿Qué se importa?</h3>
                <ul className="text-xs text-amber-700 space-y-1 mt-2">
                  <li>✅ Clases e interfaces (<code>uml:Class</code>, <code>uml:Interface</code>)</li>
                  <li>✅ Atributos y métodos con tipos y parámetros</li>
                  <li>✅ Asociaciones, Composiciones, Agregaciones</li>
                  <li>✅ Generalizaciones, Realizaciones, Dependencias</li>
                </ul>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                    ? 'border-slate-500 bg-slate-50'
                    : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-slate-400 hover:bg-gray-50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xmi,.xml"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {selectedFile ? (
                  <div className="space-y-1">
                    <CheckCircle size={32} className="text-green-500 mx-auto" />
                    <p className="text-sm font-semibold text-green-700">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Haz clic para cambiar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileUp size={32} className="text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-600">
                      Arrastra tu archivo .xmi aquí
                    </p>
                    <p className="text-xs text-gray-400">o haz clic para seleccionar</p>
                    <p className="text-xs text-gray-400">Máx. 10 MB • Formato XMI 2.1</p>
                  </div>
                )}
              </div>

              {/* Destination selector when inside an existing diagram */}
              {selectedFile && diagramId && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    ¿Dónde deseas cargar los elementos?
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors">
                      <input
                        type="radio"
                        name="importMode"
                        value="current"
                        checked={importMode === 'current'}
                        onChange={() => setImportMode('current')}
                        className="text-slate-700 focus:ring-slate-500"
                      />
                      <span className="font-medium text-slate-900">
                        ⚡ Cargar directo en este diagrama actual
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        (sin recargar la página ni salir del editor)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors">
                      <input
                        type="radio"
                        name="importMode"
                        value="new"
                        checked={importMode === 'new'}
                        onChange={() => setImportMode('new')}
                        className="text-slate-700 focus:ring-slate-500"
                      />
                      <span className="font-medium text-slate-900">
                        📄 Crear como nuevo diagrama independiente
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Diagram name( only when creating a new diagram or from workspace) */}
              {selectedFile && (importMode === 'new' || !diagramId) && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nombre del nuevo diagrama (opcional)
                  </label>
                  <input
                    type="text"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    placeholder="Se usará el nombre del archivo si se deja vacío"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              )}

              {/* Import status */}
              {importStatus === 'success' && importStats && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
                    <CheckCircle size={16} />
                    {importMessage}
                  </div>
                  <div className="flex gap-4 text-xs text-green-600">
                    <span>📦 {importStats.classesImported} clases importadas</span>
                    <span>🔗 {importStats.relationsImported} relaciones importadas</span>
                  </div>
                </div>
              )}
              {importStatus === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{importMessage || 'Error al importar el archivo XMI'}</span>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!selectedFile || importStatus === 'loading' || importStatus === 'success'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
              >
                {importStatus === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Importando...</>
                ) : importStatus === 'success' ? (
                  <><CheckCircle size={16} /> Importado</>
                ) : (
                  <><Upload size={16} /> Importar Diagrama</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
