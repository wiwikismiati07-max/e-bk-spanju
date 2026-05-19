import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Layers, 
  Tag, 
  Sparkles, 
  X, 
  FolderDot, 
  Search,
  Check,
  AlertCircle,
  Users,
  Calendar
} from 'lucide-react';
import { SavedLink, ThemeAccent } from '../types';
import { COLOR_THEMES, ICON_MAP } from '../utils';

interface SidebarProps {
  links: SavedLink[];
  categories: string[];
  activeLinkId: string | null;
  onSelectLink: (id: string) => void;
  onAddLink: (link: Omit<SavedLink, 'id'>) => void;
  onDeleteLink: (id: string) => void;
  onImportLinks: (imported: SavedLink[]) => void;
}

export default function Sidebar({
  links,
  categories,
  activeLinkId,
  onSelectLink,
  onAddLink,
  onDeleteLink,
  onImportLinks
}: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Add Link state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Informasi');
  const [newColor, setNewColor] = useState<ThemeAccent>('emerald');
  const [newIcon, setNewIcon] = useState('Link');
  const [formError, setFormError] = useState('');

  // Hidden file input ref for uploads
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter links
  const filteredLinks = links.filter(link => {
    const matchesCategory = selectedCategory === 'Semua' || link.category === selectedCategory;
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          link.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle addition
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Judul aplikasi tidak boleh kosong');
      return;
    }
    if (!newUrl.trim()) {
      setFormError('Alamat URL tidak boleh kosong');
      return;
    }

    // Check url basic validity or prepend scheme if not starting with schema
    let urlToSave = newUrl.trim();
    if (!urlToSave.startsWith('http://') && !urlToSave.startsWith('https://') && !urlToSave.startsWith('local://')) {
      urlToSave = `https://${urlToSave}`;
    }

    onAddLink({
      title: newTitle.trim(),
      url: urlToSave,
      category: newCategory,
      color: newColor,
      icon: newIcon
    });

    // Reset Form
    setNewTitle('');
    setNewUrl('');
    setNewCategory('Informasi');
    setNewColor('emerald');
    setNewIcon('Link');
    setShowAddForm(false);
  };

  // Handle Backup (download as JSON)
  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(links, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dasbor-tautan-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('Gagal mendownload backup data: ' + e);
    }
  };

  // Handle Upload/Restore (JSON file import)
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Quick validation checks on items
          const validated = json.filter(item => item && item.title && item.url);
          if (validated.length > 0) {
            onImportLinks(validated);
            alert(`Berhasil mengimpor ${validated.length} tautan dari file cadangan!`);
          } else {
            alert('Format berkas tidak valid atau tidak memiliki data tautan yang valid.');
          }
        } else {
          alert('Format data berkas JSON salah. Harus berupa list array.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON. Format tidak valid.');
      }
    };
    reader.readAsText(file);
    // Clear input value to allow uploading same file repeatedly
    e.target.value = '';
  };

  return (
    <div className="w-full lg:w-96 flex flex-col h-full bg-[#0e0f14] border-r border-zinc-800/80 p-4 lg:p-6" id="left-sidebar-panel">
      
      {/* Brand Header containing Logo and Title */}
      <div className="flex items-center space-x-4 mb-6 pb-5 border-b border-zinc-800/85 relative" id="sidebar-brand-header">
        {/* User requested logo URL: https://iili.io/KDFk4fI.png */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl blur-md opacity-40 group-hover:opacity-75 transition-all duration-300" />
          <img 
            src="https://iili.io/KDFk4fI.png" 
            alt="App Logo"
            referrerPolicy="no-referrer"
            className="w-12 h-12 object-contain rounded-xl relative z-10 border border-zinc-700 bg-zinc-900/90 p-1 transform group-hover:scale-105 transition-transform duration-200"
            id="brand-logo-img"
          />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight text-white leading-tight">
            E-BK <span className="text-cyan-400">SPANJU</span>
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Bimbingan Konseling SMPN 7</p>
        </div>
      </div>

      {/* Modern Filter Search */}
      <div className="relative mb-5" id="search-filter-box">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Cari tautan aplikasi..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/85 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-150"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Categories Tag Pills */}
      <div className="mb-5 flex flex-col space-y-2 shrink-0">
        <div className="flex items-center space-x-1.5 text-xs text-zinc-500 font-display">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kategori Filter:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[10px] font-display font-medium rounded-full border transition-all duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                  : 'bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Admin Counseling Tools Action Cards */}
      <div className="mb-4 shrink-0 space-y-3" id="admin-siswa-quick-access">
        {/* Form Master Siswa Button */}
        <button
          onClick={() => onSelectLink('siswa-master')}
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all duration-155 transform cursor-pointer ${
            activeLinkId === 'siswa-master'
              ? 'bg-rose-500 text-white border-rose-600 shadow-md translate-y-[3px]'
              : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-850 text-rose-400 shadow-[0_4px_0_0_rgb(244,63,94)] hover:shadow-[0_6px_0_0_rgb(244,63,94)] hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-none font-semibold'
          }`}
        >
          <div className="flex items-center space-x-3 text-left">
            <span className={`p-1.5 rounded-lg shrink-0 ${
              activeLinkId === 'siswa-master' ? 'bg-black/20' : 'bg-rose-500/10 border border-rose-500/20 text-rose-455'
            }`}>
              <Users className="w-4 h-4" />
            </span>
            <div>
              <p className="font-display text-xs tracking-wide">Form Master Siswa</p>
              <p className={`text-[10px] ${activeLinkId === 'siswa-master' ? 'text-white/70' : 'text-zinc-500'}`}>
                Unggah Excel & Sinkron Supabase
              </p>
            </div>
          </div>
          <Sparkles className={`w-4 h-4 animate-pulse ${activeLinkId === 'siswa-master' ? 'text-white' : 'text-rose-400'}`} />
        </button>

        {/* Agenda Kerja BK Button */}
        <button
          onClick={() => onSelectLink('agenda-bk')}
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all duration-155 transform cursor-pointer ${
            activeLinkId === 'agenda-bk'
              ? 'bg-cyan-500 text-slate-950 border-cyan-600 shadow-md translate-y-[3px]'
              : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-850 text-cyan-400 shadow-[0_4px_0_0_rgb(6,182,212)] hover:shadow-[0_6px_0_0_rgb(6,182,212)] hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-none font-semibold'
          }`}
        >
          <div className="flex items-center space-x-3 text-left">
            <span className={`p-1.5 rounded-lg shrink-0 ${
              activeLinkId === 'agenda-bk' ? 'bg-black/20' : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-600'
            }`}>
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <p className="font-display text-xs tracking-wide font-bold">Agenda Kerja BK</p>
              <p className={`text-[10px] ${activeLinkId === 'agenda-bk' ? 'text-slate-950/70' : 'text-zinc-500'}`}>
                Saran, 8 Uraian & Laporan Excel
              </p>
            </div>
          </div>
          <Sparkles className={`w-4 h-4 animate-pulse ${activeLinkId === 'agenda-bk' ? 'text-slate-950' : 'text-cyan-400'}`} />
        </button>
      </div>

      {/* Scrollable List of Interactive 3D Apps Buttons */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 pb-4 h-full" id="sidebar-links-list">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-zinc-800/70 rounded-xl bg-zinc-900/10">
            <FolderDot className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Belum ada tautan yang cocok</p>
          </div>
        ) : (
          filteredLinks.map((link) => {
            const hasActive = activeLinkId === link.id;
            const theme = COLOR_THEMES[link.color as ThemeAccent] || COLOR_THEMES.emerald;
            const Icon = ICON_MAP[link.icon || 'Link'] || FolderDot;

            return (
              /* ISOMETRIC/3D PUSH BUTTON STYLE */
              <div 
                key={link.id} 
                className="relative group transition-all duration-150"
                id={`link-item-${link.id}`}
              >
                <button
                  onClick={() => onSelectLink(link.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all duration-150 transform cursor-pointer ${
                    hasActive 
                      ? `${theme.solidBg} translate-y-[3px]` // Pressed solid look on active
                      : `bg-[#13141b] border-zinc-800 text-zinc-200 ${theme.deepShadow} ${theme.deepShadowHover} hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-none`
                  }`}
                >
                  <div className="flex items-center space-x-3.5 overflow-hidden">
                    <span className={`p-2 rounded-lg shrink-0 transition-colors ${
                      hasActive ? 'bg-black/20 border border-white/10' : 'bg-zinc-800/80 border border-zinc-700/40'
                    }`}>
                      <Icon className={`w-4 h-4 ${hasActive ? 'text-white' : theme.text}`} />
                    </span>
                    <div className="overflow-hidden">
                      <p className="font-display font-semibold text-xs tracking-wide truncate">{link.title}</p>
                      <p className={`text-[10px] truncate ${hasActive ? 'text-white/70' : 'text-zinc-500'}`}>
                        {link.category} • {link.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Custom 3D styled Trash Delete trigger on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Apakah Anda yakin ingin menghapus tautan "${link.title}"?`)) {
                      onDeleteLink(link.id);
                    }
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 p-2 bg-rose-950/90 text-rose-400 hover:text-white rounded-lg border border-rose-800/40 hover:bg-rose-600 transition-all duration-150 shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer"
                  title="Hapus Tautan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Option Bar for Addition and Backup/Restore */}
      <div className="pt-4 border-t border-zinc-900 flex flex-col space-y-3 shrink-0" id="sidebar-action-footer">
        
        {/* "Tambah Tautan Baru" button (gorgeous 3D cyber action) */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 text-slate-950 hover:text-white font-display font-extrabold text-xs tracking-wider uppercase rounded-xl border border-cyan-400/30 shadow-[0_4px_0_0_#0891b2] hover:shadow-[0_6px_0_0_#4f46e5] hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-none transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Tutup Formulir' : 'Tambah Tautan Baru'}</span>
        </button>

        {/* Dynamic drawer form when adding links */}
        {showAddForm && (
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-3 shadow-2xl transition-all duration-200">
            <h3 className="text-xs font-display font-bold text-white tracking-wide uppercase flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Formulir Tautan Baru</span>
            </h3>

            {formError && (
              <div className="p-2 text-[10px] text-rose-400 bg-rose-950/20 border border-rose-800/20 rounded-md flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1">Judul Aplikasi</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Google Translate" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1">Alamat Link / URL</label>
                <input 
                  type="text" 
                  placeholder="Contoh: translate.google.com" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1">Kategori</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-zinc-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1">Warna 3D</label>
                  <select 
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value as ThemeAccent)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-zinc-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="emerald">Emerald Green</option>
                    <option value="indigo">Indigo Purple</option>
                    <option value="cyan">Cyan Blue</option>
                    <option value="amber">Amber Yellow</option>
                    <option value="rose">Rose Red</option>
                    <option value="purple">Noble Purple</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Icon Grid Selection */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1">Pilih Simbol Ikon</label>
                <div className="grid grid-cols-6 gap-1.5 p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                  {Object.keys(ICON_MAP).slice(0, 12).map((iconName) => {
                    const TargetIcon = ICON_MAP[iconName];
                    const isSelected = newIcon === iconName;
                    return (
                      <button
                        type="button"
                        key={iconName}
                        onClick={() => setNewIcon(iconName)}
                        className={`p-1.5 rounded-md flex items-center justify-center border transition-all duration-100 hover:bg-zinc-800 cursor-pointer ${
                          isSelected ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400 scale-110' : 'border-transparent text-zinc-400'
                        }`}
                        title={iconName}
                      >
                        <TargetIcon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 text-[11px] font-display hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 cursor-pointer text-center"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-[11px] font-display bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-center cursor-pointer"
                >
                  Simpan Tautan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3D secondary bar with Backup & Upload (grid rows) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Backup Button */}
          <button
            onClick={handleBackup}
            className="py-2.5 px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-display flex items-center justify-center space-x-1.5 shadow-[0_3px_0_0_#18181b] active:translate-y-[3px] active:shadow-none transition-all duration-100 cursor-pointer"
            title="Ekspor list tautan ke file JSON di komputer Anda"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Backup Data</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            className="py-2.5 px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-display flex items-center justify-center space-x-1.5 shadow-[0_3px_0_0_#18181b] active:translate-y-[3px] active:shadow-none transition-all duration-100 cursor-pointer"
            title="Import kembali konfigurasi tautan Anda dari file JSON cadangan"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unggah Backup</span>
          </button>
        </div>

        {/* Hidden File Input for uploading */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden" 
        />

        <div className="text-[9px] font-mono text-zinc-600 text-center uppercase tracking-widest pt-1.5">
          PRO-EDITION CORES • BUILD 2026
        </div>
      </div>
    </div>
  );
}
