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
    <div className="w-full lg:w-96 flex flex-col h-full bg-white border-r border-slate-200 p-4 lg:p-6" id="left-sidebar-panel">
      
      {/* Brand Header containing Logo and Title */}
      <div className="flex items-center space-x-4 mb-6 pb-5 border-b border-zinc-100 relative" id="sidebar-brand-header">
        {/* User requested logo URL: https://iili.io/KDFk4fI.png */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-all duration-300" />
          <img 
            src="https://iili.io/KDFk4fI.png" 
            alt="App Logo"
            referrerPolicy="no-referrer"
            className="w-12 h-12 object-contain rounded-xl relative z-10 border border-slate-200 bg-slate-50 p-1 transform group-hover:scale-105 transition-transform duration-200 animate-fade-in"
            id="brand-logo-img"
          />
        </div>
        <div>
          <h1 className="font-display font-semibold text-lg tracking-tight text-zinc-900 leading-tight">
            E-BK <span className="text-cyan-600 font-bold">SPANJU</span>
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-zinc-400 font-semibold uppercase">Bimbingan Konseling SMPN 7</p>
        </div>
      </div>

      {/* Modern Filter Search */}
      <div className="relative mb-5" id="search-filter-box">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Cari tautan aplikasi..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#f8fafc] border border-zinc-200/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-550/30 transition-all duration-150"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Categories Tag Pills */}
      <div className="mb-5 flex flex-col space-y-2 shrink-0">
        <div className="flex items-center space-x-1.5 text-xs text-zinc-600 font-display">
          <Tag className="w-3.5 h-3.5 text-cyan-600" />
          <span className="font-bold">Kategori Filter:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[10px] font-display font-semibold rounded-full border transition-all duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200/70 hover:text-zinc-900 hover:bg-zinc-100'
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
              : 'bg-rose-50/60 hover:bg-rose-50 border-rose-100/80 text-rose-700 shadow-[0_4px_0_0_rgba(244,63,94,0.15)] hover:shadow-[0_6px_0_0_rgba(244,63,94,0.22)] hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-none font-semibold'
          }`}
        >
          <div className="flex items-center space-x-3 text-left">
            <span className={`p-1.5 rounded-lg shrink-0 ${
              activeLinkId === 'siswa-master' ? 'bg-black/20' : 'bg-rose-500/10 border border-rose-500/20 text-rose-600'
            }`}>
              <Users className="w-4 h-4" />
            </span>
            <div>
              <p className="font-display text-xs tracking-wide font-bold">Form Master Siswa</p>
              <p className={`text-[10px] ${activeLinkId === 'siswa-master' ? 'text-white/70' : 'text-slate-500'}`}>
                Unggah Excel & Sinkron Supabase
              </p>
            </div>
          </div>
          <Sparkles className={`w-4 h-4 animate-pulse ${activeLinkId === 'siswa-master' ? 'text-white' : 'text-rose-500'}`} />
        </button>

        {/* Agenda Kerja BK Button */}
        <button
          onClick={() => onSelectLink('agenda-bk')}
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all duration-155 transform cursor-pointer ${
            activeLinkId === 'agenda-bk'
              ? 'bg-cyan-550 text-white border-cyan-700 shadow-md translate-y-[3px]'
              : 'bg-cyan-50/60 hover:bg-cyan-50 border-cyan-100/80 text-cyan-800 shadow-[0_4px_0_0_rgba(6,182,212,0.15)] hover:shadow-[0_6px_0_0_rgba(6,182,212,0.22)] hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-none font-semibold'
          }`}
        >
          <div className="flex items-center space-x-3 text-left">
            <span className={`p-1.5 rounded-lg shrink-0 ${
              activeLinkId === 'agenda-bk' ? 'bg-black/20' : 'bg-cyan-600/10 border border-cyan-600/20 text-cyan-700'
            }`}>
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <p className="font-display text-xs tracking-wide font-bold">Agenda Kerja BK</p>
              <p className={`text-[10px] ${activeLinkId === 'agenda-bk' ? 'text-white/70' : 'text-slate-500'}`}>
                Saran, 8 Uraian & Laporan Excel
              </p>
            </div>
          </div>
          <Sparkles className={`w-4 h-4 animate-pulse ${activeLinkId === 'agenda-bk' ? 'text-white' : 'text-cyan-600'}`} />
        </button>
      </div>

      {/* Scrollable List of Interactive 3D Apps Buttons */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 pb-4 h-full" id="sidebar-links-list">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/80">
            <FolderDot className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-sans font-medium">Belum ada tautan yang cocok</p>
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
                      : `bg-slate-50/70 border-slate-200 text-zinc-800 ${theme.deepShadow} ${theme.deepShadowHover} hover:-translate-y-[2px] hover:bg-slate-50 active:translate-y-[4px] active:shadow-none`
                  }`}
                >
                  <div className="flex items-center space-x-3.5 overflow-hidden">
                    <span className={`p-2 rounded-lg shrink-0 transition-colors ${
                      hasActive ? 'bg-black/10' : 'bg-white border border-slate-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${hasActive ? 'text-white' : theme.text}`} />
                    </span>
                    <div className="overflow-hidden">
                      <p className="font-display font-bold text-xs tracking-wide truncate">{link.title}</p>
                      <p className={`text-[10px] truncate ${hasActive ? 'text-white/80' : 'text-slate-400 font-semibold'}`}>
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 p-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg border border-rose-200 hover:border-transparent transition-all duration-150 shadow-sm cursor-pointer"
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
      <div className="pt-4 border-t border-slate-200 flex flex-col space-y-3 shrink-0" id="sidebar-action-footer">
        
        {/* "Tambah Tautan Baru" button (gorgeous 3D cyber action) */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-cyan-550 to-indigo-650 text-white font-display font-extrabold text-xs tracking-wider uppercase rounded-xl border border-cyan-500/10 shadow-[0_4px_0_0_#0891b2] hover:shadow-[0_6px_0_0_#4338ca] hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-none transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Tutup Formulir' : 'Tambah Tautan Baru'}</span>
        </button>

        {/* Dynamic drawer form when adding links */}
        {showAddForm && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xl transition-all duration-200">
            <h3 className="text-xs font-display font-bold text-slate-800 tracking-wide uppercase flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Formulir Tautan Baru</span>
            </h3>

            {formError && (
              <div className="p-2 text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-1.5 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-bold">Judul Aplikasi</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Google Translate" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/20"
                />
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-bold">Alamat Link / URL</label>
                <input 
                  type="text" 
                  placeholder="Contoh: translate.google.com" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/20 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-bold">Kategori</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-zinc-700 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-bold">Warna 3D</label>
                  <select 
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value as ThemeAccent)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-zinc-700 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
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
                <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-bold">Pilih Simbol Ikon</label>
                <div className="grid grid-cols-6 gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                  {Object.keys(ICON_MAP).slice(0, 12).map((iconName) => {
                    const TargetIcon = ICON_MAP[iconName];
                    const isSelected = newIcon === iconName;
                    return (
                      <button
                        type="button"
                        key={iconName}
                        onClick={() => setNewIcon(iconName)}
                        className={`p-1.5 rounded-md flex items-center justify-center border transition-all duration-100 hover:bg-slate-100 cursor-pointer ${
                          isSelected ? 'border-cyan-500 bg-cyan-50 text-cyan-600 scale-110' : 'border-transparent text-zinc-400'
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
                  className="flex-1 py-2 text-[11px] font-display font-bold hover:bg-slate-100 border border-slate-200 rounded-xl text-zinc-500 cursor-pointer text-center"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-[11px] font-display font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-center cursor-pointer shadow-sm active:scale-95 transition-all"
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
            className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-zinc-700 hover:text-slate-900 rounded-xl text-xs font-display font-bold flex items-center justify-center space-x-1.5 shadow-sm active:translate-y-[2px] transition-all duration-100 cursor-pointer"
            title="Ekspor list tautan ke file JSON di komputer Anda"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Backup Data</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-zinc-700 hover:text-slate-900 rounded-xl text-xs font-display font-bold flex items-center justify-center space-x-1.5 shadow-sm active:translate-y-[2px] transition-all duration-100 cursor-pointer"
            title="Import kembali konfigurasi tautan Anda dari file JSON cadangan"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-600" />
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

        <div className="text-[9px] font-mono text-slate-400 text-center uppercase tracking-widest pt-1.5 font-bold">
          PRO-EDITION CORES • BUILD 2026
        </div>
      </div>
    </div>
  );
}
