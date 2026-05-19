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
      // Re-fill dark background matches palette
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Initialize canvas background once mounted
  useEffect(() => {
    if (activeLink?.url === 'local://sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeLink]);

  // Is standard web URL
  const isLocalApp = activeLink?.url.startsWith('local://');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0c10] p-4 lg:p-6" id="right-view-panel">
      {activeLink ? (
        <div className="flex-1 flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden glass-panel shadow-2xl relative">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-950/70" id="viewer-header">
            <div className="flex items-center space-x-3 truncate">
              <span className={`p-2 rounded-lg bg-zinc-800 border border-zinc-700/60`}>
                {(() => {
                  const Icon = ICON_MAP[activeLink.icon || 'Link'] || HelpCircle;
                  return <Icon className="w-4 h-4 text-zinc-300" />;
                })()}
              </span>
              <div>
                <h3 className="font-display font-medium text-sm text-zinc-100 truncate">{activeLink.title}</h3>
                <p className="text-xs text-zinc-500 font-mono truncate max-w-sm lg:max-w-md">{activeLink.url}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isLocalApp && (
                <button 
                  onClick={handleRefresh}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700/50 transition-all duration-150 active:scale-95"
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
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/40 hover:border-cyan-500/50 rounded-lg transition-all duration-150 shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Fallback Warning for Web URL Embeds */}
          {!isLocalApp && (
            <div className="bg-rose-950/20 border-l-4 border-rose-500 border-b border-zinc-900 px-4 py-2.5 flex items-center space-x-3 text-rose-200 text-xs shadow-md">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-semibold text-rose-400">E-BK SPANJU (Electronic Bimbingan Konseling SMPN 7 Pasuruan):</span> Jika tautan BK atau situs web tidak terbuka dengan sempurna di dalam bingkai, silakan klik tombol <span className="font-semibold text-cyan-400 hover:underline">"Buka di Tab Baru"</span> di pojok kanan atas.
              </p>
            </div>
          )}

          {/* Iframe or Local Widget viewport */}
          <div className="flex-1 w-full bg-zinc-950/90 relative" id="iframe-viewport-container">
            {activeLink.url === 'local://calculator' ? (
              /* --- CUSTOM 3D CALCULATOR --- */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-sm glass-panel border border-zinc-700/50 rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col p-6 space-y-4">
                  {/* Cal Head */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-display font-semibold tracking-widest text-zinc-500">CASIO 3D-LITE</span>
                    <div className="flex space-x-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Display window with realistic inset depth */}
                  <div className="bg-[#121318] border-2 border-zinc-800 rounded-2xl p-4 text-right shadow-[inset_0_4px_4px_rgba(0,0,0,0.6)]">
                    <div className="text-zinc-500 text-xs font-mono h-5 mb-0.5 tracking-wider truncate">
                      {calcFormula || <span className="opacity-0">placeholder</span>}
                    </div>
                    <div className="text-2xl font-mono font-medium text-white tracking-tight break-all truncate">
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
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-[0_3px_0_0_#991b1b]'
                            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 shadow-[0_3px_0_0_#27272a]'
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
                            ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 shadow-[0_3px_0_0_#27272a]' 
                            : 'bg-zinc-900/90 text-white border-zinc-800/80 shadow-[0_3px_0_0_#18181b]'
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
                            ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 shadow-[0_3px_0_0_#27272a]' 
                            : 'bg-zinc-900/90 text-white border-zinc-800/80 shadow-[0_3px_0_0_#18181b]'
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
                            ? 'bg-emerald-500 text-slate-900 border-emerald-600 shadow-[0_3px_0_0_#065f46] row-span-2 flex items-center justify-center h-full' 
                            : 'bg-zinc-900/90 text-white border-zinc-800/80 shadow-[0_3px_0_0_#18181b]'
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
                        } bg-zinc-900/90 text-white border-zinc-800/80 shadow-[0_3px_0_0_#18181b]`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeLink.url === 'local://sketch' ? (
              /* --- CUSTOM SKETCH PAD --- */
              <div className="absolute inset-0 flex flex-col p-6 items-center justify-center">
                <div className="w-full h-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                  {/* Toolbar */}
                  <div className="border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-display text-zinc-400">Pilih Warna:</span>
                      <div className="flex items-center space-x-1.5">
                        {['#10b981', '#6366f1', '#06b6d4', '#f59e0b', '#f43f5e', '#ffffff'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={`w-5 h-5 rounded-full border cursor-pointer transition-all duration-100 ${
                              brushColor === color ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-cyan-400 scale-110' : 'border-black/40'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Brush Size */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-display text-zinc-400">Ketebalan:</span>
                        <input 
                          type="range" 
                          min="2" 
                          max="20" 
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-20 accent-cyan-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 w-5 text-right">{brushSize}px</span>
                      </div>

                      {/* Clear Canvas */}
                      <button
                        onClick={clearCanvas}
                        className="px-3 py-1.5 text-xs text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-600 border border-rose-800/40 hover:border-rose-500 rounded-lg font-display transition-all duration-100 shadow-[0_3px_0_0_rgba(153,27,27,0.4)] hover:shadow-none hover:translate-y-[3px] active:translate-y-[3px] cursor-pointer"
                      >
                        Bersihkan
                      </button>
                    </div>
                  </div>

                  {/* Painting Area */}
                  <div className="flex-1 w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center p-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={380}
                      className="bg-zinc-900 rounded-lg cursor-crosshair border border-zinc-800 shadow-inner"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="absolute bottom-4 right-4 pointer-events-none bg-zinc-950/80 px-3 py-1 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 flex items-center space-x-1">
                      <MousePointer className="w-3 h-3 text-cyan-400" />
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-zinc-800/80 bg-zinc-900/60 p-6 rounded-2xl glass-panel relative overflow-hidden" id="dashboard-welcome-banner">
            {/* Top decorative subtle strip */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 opacity-60" />

            <div className="space-y-1 z-10">
              <h2 className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-2">
                Selamat Datang di <span>E-BK SPANJU 3D</span>
                <Sparkles className="w-5 h-5 text-rose-400 fill-rose-400/20" />
              </h2>
              <p className="text-sm text-zinc-400 max-w-xl">
                Layanan Electronic Bimbingan Konseling SMPN 7 Pasuruan - Akses semua layanan dan situs tautan akademik secara cepat dan aman.
              </p>
            </div>

            <div className="z-10 bg-zinc-950/70 py-3 px-5 border border-zinc-800 rounded-xl flex items-center space-x-4 shadow-[0_8px_16px_rgba(0,0,0,0.4)] shrink-0 self-start md:self-auto">
              <div className="p-2 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Waktu Berjalan (WIB)</p>
                <p className="text-lg font-mono font-bold text-white tracking-wider">{timestamp}</p>
              </div>
            </div>
          </div>

          {/* Core Interactive Grid - Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6 flex-1">
            
            {/* Interactive Card 1: Status Stat */}
            <div className="glass-panel border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between isometric-card relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-emerald-400/25">
                <Layers className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-1 text-[10px] font-display font-medium uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  Ringkasan Data
                </div>
                <h4 className="text-zinc-100 text-sm font-display font-semibold mt-2">Jumlah Tautan Tersimpan</h4>
                <p className="text-xs text-zinc-400">Total tautan aktif yang siap diakses di sidebar pintar Anda.</p>
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-4xl font-display font-extrabold text-white">{totalLinksCount}</span>
                <span className="text-xs text-zinc-500">Tautan tersimpan</span>
              </div>
            </div>

            {/* Interactive Card 2: 3D App Integration */}
            <div className="glass-panel border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between isometric-card relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-indigo-400/25">
                <Compass className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-1 text-[10px] font-display font-medium uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  Integrasi Kategori
                </div>
                <h4 className="text-zinc-100 text-sm font-display font-semibold mt-2">Kompilasi Kategori Workspace</h4>
                <p className="text-xs text-zinc-400">Saring tautan Anda berdasarkan tag klasifikasi rapi.</p>
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-4xl font-display font-extrabold text-white">{totalCategoriesCount}</span>
                <span className="text-xs text-zinc-500">Klasifikasi aktif</span>
              </div>
            </div>

            {/* Interactive Card 3: Quick Info Help */}
            <div className="glass-panel border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between isometric-card relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-amber-400/25">
                <Calendar className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-1 text-[10px] font-display font-medium uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  Info Penting
                </div>
                <h4 className="text-zinc-100 text-sm font-display font-semibold mt-2">Pencadangan Berkas Eksternal</h4>
                <p className="text-xs text-zinc-400">Selalu backup pengaturan tautan Anda untuk disimpan demi keamanan data.</p>
              </div>
              <div className="mt-4 text-xs text-rose-300 bg-rose-500/5 p-3 rounded-lg border border-rose-500/30 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>E-BK SPANJU (Electronic Bimbingan Konseling SMPN 7 Pasuruan): Gunakan tombol "Backup Data" dan "Unggah Backup" di pojok kiri bawah untuk menyimpan serta memulihkan data setelan Anda kapan pun.</span>
              </div>
            </div>

          </div>

          {/* Quick Instructions list */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 glass-panel" id="dashboard-instructions">
            <h4 className="font-display font-semibold text-white mb-4 text-sm flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Petunjuk Cepat Penggunaan Sistem</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-zinc-400 text-xs">
              <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800/40">
                <h5 className="font-semibold text-zinc-100 flex items-center space-x-1.5">
                  <span className="text-cyan-400">1.</span>
                  <span>Buka Tautan Aplikasi</span>
                </h5>
                <p className="leading-relaxed">Klik salah satu tombol menu di kolom menu sebelah kiri. Aplikasi akan langsung dimuat secara instan di panel kanan ini.</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800/40">
                <h5 className="font-semibold text-zinc-100 flex items-center space-x-1.5">
                  <span className="text-cyan-400">2.</span>
                  <span>Modifikasi & Tambahkan Tautan</span>
                </h5>
                <p className="leading-relaxed">Gunakan tombol "Tambah Tautan Baru" di bagian bawah menu kiri. Berikan judul, alamat URL lengkap, ikon favorit, serta warna tema 3D!</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800/40">
                <h5 className="font-semibold text-zinc-100 flex items-center space-x-1.5">
                  <span className="text-cyan-400">3.</span>
                  <span>Kelola Cadangan</span>
                </h5>
                <p className="leading-relaxed">Unduh data tautan Anda sebagai cadangan (.json) atau unggah kembali untuk meload konfigurasi dashboard kustomisasi kapan pun di perangkat lain.</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
