import React, { useState, useRef, useEffect } from 'react';
import { 
  ExternalLink, 
  RotateCw, 
  AlertCircle, 
  Settings, 
  Maximize2, 
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  MousePointer,
  Trash2,
  Calendar,
  Compass
} from 'lucide-react';
import { SavedLink } from '../types';
import { COLOR_THEMES, ICON_MAP, ThemeKey, getSafeEmbedUrl } from '../utils';

interface LinkViewerProps {
  activeLink: SavedLink | null;
  totalLinksCount: number;
  totalCategoriesCount: number;
}

export default function LinkViewer({ activeLink, totalLinksCount, totalCategoriesCount }: LinkViewerProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  // Local apps stats & states
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  // Sketch pad states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#10b981'); // default emerald
  const [brushSize, setBrushSize] = useState(5);

  // General live clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  // --- Calculator 3D Logic ---
  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcFormula('');
      setIsCalculated(false);
    } else if (val === 'DEL') {
      if (calcDisplay.length > 1) {
        setCalcDisplay(calcDisplay.slice(0, -1));
      } else {
        setCalcDisplay('0');
      }
    } else if (val === '=') {
      try {
        // Safe evaluation of simple math
        const cleaned = (calcFormula + calcDisplay).replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = eval(cleaned);
        const formatted = Number(result).toLocaleString('id-ID', { maximumFractionDigits: 4 });
        setCalcDisplay(formatted.toString());
        setCalcFormula('');
        setIsCalculated(true);
      } catch (err) {
        setCalcDisplay('Error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setCalcFormula(calcDisplay.replace(/\./g, '') + ' ' + val + ' ');
      setCalcDisplay('0');
      setIsCalculated(false);
    } else {
      if (calcDisplay === '0' || isCalculated) {
        setCalcDisplay(val);
        setIsCalculated(false);
      } else {
        setCalcDisplay(calcDisplay + val);
      }
    }
  };

  // --- HTML5 Canvas Sketch Logic ---
  useEffect(() => {
    if (activeLink?.url === 'local://sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
      }
    }
  }, [activeLink, brushColor, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Re-fill matches light palette
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Initialize canvas background once mounted
  useEffect(() => {
    if (activeLink?.url === 'local://sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeLink]);

  // Is standard web URL
  const isLocalApp = activeLink?.url.startsWith('local://');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] p-4 lg:p-6 animate-fade-in" id="right-view-panel">
      {activeLink ? (
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden glass-panel shadow-lg relative">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50" id="viewer-header">
            <div className="flex items-center space-x-3 truncate">
              <span className={`p-2 rounded-lg bg-white border border-slate-200`}>
                {(() => {
                  const Icon = ICON_MAP[activeLink.icon || 'Link'] || HelpCircle;
                  return <Icon className="w-4 h-4 text-slate-700" />;
                })()}
              </span>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 truncate">{activeLink.title}</h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-sm lg:max-w-md">{activeLink.url}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isLocalApp && (
                <button 
                  onClick={handleRefresh}
                  className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-205 transition-all duration-150 active:scale-95 cursor-pointer"
                  title="Muat Ulang Bingkai"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}
              
              <a 
                href={isLocalApp ? '#' : activeLink.url} 
                target={isLocalApp ? undefined : "_blank"}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (isLocalApp) {
                    e.preventDefault();
                    alert('Ini adalah aplikasi bawaan lokal, tidak dapat dibuka di tab eksternal baru.');
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-all duration-150 shadow-sm"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Fallback Warning for Web URL Embeds */}
          {!isLocalApp && (
            <div className="bg-rose-50 border-l-4 border-rose-500 border-b border-rose-100 px-4 py-2.5 flex items-center space-x-3 text-rose-800 text-xs shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-semibold text-rose-700">E-BK SPANJU (Electronic Bimbingan Konseling SMPN 7 Pasuruan):</span> Jika tautan BK atau situs web tidak terbuka dengan sempurna di dalam bingkai, silakan klik tombol <span className="font-semibold text-cyan-600 hover:underline">"Buka di Tab Baru"</span> di pojok kanan atas.
              </p>
            </div>
          )}

          {/* Iframe or Local Widget viewport */}
          <div className="flex-1 w-full bg-slate-50 relative" id="iframe-viewport-container">
            {activeLink.url === 'local://calculator' ? (
              /* --- CUSTOM 3D CALCULATOR --- */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 overflow-y-auto bg-slate-100/40">
                <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl flex flex-col p-6 space-y-4">
                  {/* Cal Head */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-display font-semibold tracking-widest text-slate-400">CASIO 3D-LITE</span>
                    <div className="flex space-x-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Display window with realistic inset depth */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right shadow-inner">
                    <div className="text-slate-400 text-xs font-mono h-5 mb-0.5 tracking-wider truncate">
                      {calcFormula || <span className="opacity-0">placeholder</span>}
                    </div>
                    <div className="text-2xl font-mono font-bold text-slate-800 tracking-tight break-all truncate">
                      {calcDisplay}
                    </div>
                  </div>

                  {/* Simple 3D Glass Keyboard Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {/* Row 1 */}
                    {['C', 'DEL', '/', '*'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleCalcPress(key)}
                        className={`py-3.5 rounded-xl font-display font-bold text-sm tracking-wider transition-all duration-100 transform active:translate-y-[3px] active:shadow-none border cursor-pointer ${
                          ['C', 'DEL'].includes(key)
                            ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-zinc-700 border-slate-200 shadow-sm'
                        }`}
                      >
                        {key}
                      </button>
                    ))}

                    {/* Row 2 */}
                    {['7', '8', '9', '-'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleCalcPress(key)}
                        className={`py-3.5 rounded-xl font-display font-bold text-sm transition-all duration-100 transform active:translate-y-[3px] active:shadow-none border cursor-pointer ${
                          key === '-' 
                            ? 'bg-slate-100 hover:bg-slate-200 text-zinc-700 border-slate-200 shadow-sm' 
                            : 'bg-white hover:bg-slate-50 text-zinc-800 border-slate-200 shadow-sm'
                        }`}
                      >
                        {key}
                      </button>
                    ))}

                    {/* Row 3 */}
                    {['4', '5', '6', '+'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleCalcPress(key)}
                        className={`py-3.5 rounded-xl font-display font-bold text-sm transition-all duration-100 transform active:translate-y-[3px] active:shadow-none border cursor-pointer ${
                          key === '+' 
                            ? 'bg-slate-100 hover:bg-slate-200 text-zinc-700 border-slate-200 shadow-sm' 
                            : 'bg-white hover:bg-slate-50 text-zinc-800 border-slate-200 shadow-sm'
                        }`}
                      >
                        {key}
                      </button>
                    ))}

                    {/* Row 4 */}
                    {['1', '2', '3', '='].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleCalcPress(key)}
                        className={`py-3.5 rounded-xl font-display font-bold text-sm transition-all duration-100 transform active:translate-y-[3px] active:shadow-none border cursor-pointer ${
                          key === '=' 
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md row-span-2 flex items-center justify-center h-full' 
                            : 'bg-white hover:bg-slate-50 text-zinc-800 border-slate-200 shadow-sm'
                        }`}
                        style={key === '=' ? { gridRowEnd: 'span 2' } : undefined}
                      >
                        {key}
                      </button>
                    ))}

                    {/* Row 5 */}
                    {['0', '.'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleCalcPress(key)}
                        className={`py-3.5 rounded-xl font-display font-bold text-sm transition-all duration-100 transform active:translate-y-[3px] active:shadow-none border cursor-pointer ${
                          key === '0' ? 'col-span-2' : ''
                        } bg-white hover:bg-slate-50 text-zinc-800 border-slate-200 shadow-sm`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeLink.url === 'local://sketch' ? (
              /* --- CUSTOM SKETCH PAD --- */
              <div className="absolute inset-0 flex flex-col p-6 items-center justify-center bg-slate-100/40">
                <div className="w-full h-full max-w-2xl bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-lg">
                  {/* Toolbar */}
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-sans">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-display font-bold text-slate-600">Pilih Warna:</span>
                      <div className="flex items-center space-x-1.5">
                        {['#10b981', '#6366f1', '#06b6d4', '#f59e0b', '#f43f5e', '#000000'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={`w-5 h-5 rounded-full border cursor-pointer transition-all duration-100 ${
                              brushColor === color ? 'ring-2 ring-offset-2 ring-offset-white ring-cyan-500 scale-110' : 'border-black/10'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Brush Size */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-display font-bold text-slate-600">Ketebalan:</span>
                        <input 
                          type="range" 
                          min="2" 
                          max="20" 
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-20 accent-cyan-500 h-1 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-600 w-5 text-right font-bold">{brushSize}px</span>
                      </div>

                      {/* Clear Canvas */}
                      <button
                        onClick={clearCanvas}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-lg font-display font-bold transition-all duration-100 shadow-sm cursor-pointer"
                      >
                        Bersihkan
                      </button>
                    </div>
                  </div>

                  {/* Painting Area */}
                  <div className="flex-1 w-full bg-slate-50 relative overflow-hidden flex items-center justify-center p-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={380}
                      className="bg-white rounded-lg cursor-crosshair border border-slate-200 shadow-inner"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="absolute bottom-4 right-4 pointer-events-none bg-white/95 px-3 py-1 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-500 flex items-center space-x-1 shadow-sm font-bold">
                      <MousePointer className="w-3 h-3 text-cyan-550" />
                      <span>Seret mouse untuk menggambar coretan kreatif!</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- STANDARD IFRAME --- */
              <iframe
                key={`${activeLink.id}-${iframeKey}`}
                src={getSafeEmbedUrl(activeLink.url)}
                className="w-full h-full border-none"
                title={activeLink.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      ) : (
        /* --- HIGH-FIDELITY WELCOME CONSOLE / DASHBOARD SPLASH --- */
        <div className="flex-1 flex flex-col justify-between" id="splash-viewport">
          
          {/* Header row containing dynamic welcome + mini clock */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80 bg-white p-6 rounded-2xl glass-panel relative overflow-hidden shadow-sm" id="dashboard-welcome-banner">
            {/* Top decorative subtle strip */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-80" />
 
            <div className="space-y-1 z-10">
              <h2 className="text-2xl font-display font-semibold tracking-tight text-slate-800 flex items-center gap-2">
                Selamat Datang di <span className="font-extrabold text-[#0891b2]">E-BK SPANJU</span>
                <Sparkles className="w-5 h-5 text-rose-500 fill-rose-500/10" />
              </h2>
              <p className="text-sm text-slate-500 max-w-xl font-medium">
                Layanan Electronic Bimbingan Konseling SMPN 7 Pasuruan - Akses semua layanan dan situs tautan akademik secara cepat dan aman.
              </p>
            </div>
 
            <div className="z-10 bg-slate-50 py-3 px-5 border border-slate-200 rounded-xl flex items-center space-x-4 shadow-sm shrink-0 self-start md:self-auto">
              <div className="p-2 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Waktu Berjalan (WIB)</p>
                <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">{timestamp}</p>
              </div>
            </div>
          </div>
 
          {/* Core Interactive Grid - Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6 flex-1">
            
            {/* Interactive Card 1: Status Stat */}
            <div className="glass-panel border border-slate-200 p-5 rounded-2xl flex flex-col justify-between isometric-card relative overflow-hidden shadow-sm bg-white">
              <div className="absolute top-4 right-4 text-emerald-500/10">
                <Layers className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-1 text-[10px] font-display font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                  Ringkasan Data
                </div>
                <h4 className="text-slate-800 text-sm font-display font-semibold mt-2">Jumlah Tautan Tersimpan</h4>
                <p className="text-xs text-slate-400">Total tautan akurat yang siap dimuat instan di menu pintar sebelah kiri.</p>
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-4xl font-display font-extrabold text-slate-800">{totalLinksCount}</span>
                <span className="text-xs text-slate-400 font-medium">Tautan tersimpan</span>
              </div>
            </div>
 
            {/* Interactive Card 2: 3D App Integration */}
            <div className="glass-panel border border-slate-200 p-5 rounded-2xl flex flex-col justify-between isometric-card relative overflow-hidden shadow-sm bg-white">
              <div className="absolute top-4 right-4 text-indigo-500/10">
                <Compass className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-1 text-[10px] font-display font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
                  Integrasi Kategori
                </div>
                <h4 className="text-slate-800 text-sm font-display font-semibold mt-2">Kompilasi Kategori Workspace</h4>
                <p className="text-xs text-slate-400">Saring serta bersihkan tautan Anda demi klasifikasi rapi.</p>
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-4xl font-display font-extrabold text-slate-800">{totalCategoriesCount}</span>
                <span className="text-xs text-slate-400 font-medium font-semibold">Klasifikasi aktif</span>
              </div>
            </div>
 
            {/* Interactive Card 3: Quick Info Help */}
            <div className="glass-panel border border-slate-200 p-5 rounded-2xl flex flex-col justify-between isometric-card relative overflow-hidden shadow-sm bg-white">
              <div className="absolute top-4 right-4 text-amber-500/10">
                <Calendar className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-1 text-[10px] font-display font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full">
                  Info Penting
                </div>
                <h4 className="text-slate-800 text-sm font-display font-semibold mt-2">Pencadangan Berkas Eksternal</h4>
                <p className="text-xs text-slate-400 font-medium">Cadangkan setelan halaman demi keamanan data.</p>
              </div>
              <div className="mt-4 text-[11px] text-justify text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>E-BK SPANJU: Gunakan tombol "Backup Data" dan "Unggah Backup" di pojok kiri bawah untuk menyimpan serta memulihkan data setelan Anda kapan pun.</span>
              </div>
            </div>
 
          </div>
 
          {/* Quick Instructions list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 glass-panel shadow-sm" id="dashboard-instructions">
            <h4 className="font-display font-semibold text-slate-800 mb-4 text-sm flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
              <span>Petunjuk Cepat Penggunaan Sistem</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-500 text-xs font-sans font-semibold">
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <h5 className="font-semibold text-slate-800 flex items-center space-x-1.5 font-bold">
                  <span className="text-cyan-600">1.</span>
                  <span>Buka Tautan Aplikasi</span>
                </h5>
                <p className="leading-relaxed font-sans text-slate-400">Klik salah satu tombol menu di kolom menu sebelah kiri. Aplikasi akan langsung dimuat secara instan di panel kanan ini.</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <h5 className="font-semibold text-slate-800 flex items-center space-x-1.5 font-bold">
                  <span className="text-cyan-600">2.</span>
                  <span>Modifikasi & Tambahkan Tautan</span>
                </h5>
                <p className="leading-relaxed font-sans text-slate-400">Gunakan tombol "Tambah Tautan Baru" di bagian bawah menu kiri. Berikan judul, alamat URL lengkap, ikon favorit, serta warna tema 3D!</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <h5 className="font-semibold text-slate-800 flex items-center space-x-1.5 font-bold">
                  <span className="text-cyan-600">3.</span>
                  <span>Kelola Cadangan</span>
                </h5>
                <p className="leading-relaxed font-sans text-slate-400">Unduh data tautan Anda sebagai cadangan (.json) atau unggah kembali untuk meload konfigurasi dashboard kustomisasi kapan pun di perangkat lain.</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
