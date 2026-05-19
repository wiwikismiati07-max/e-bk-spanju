import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Database,
  Search, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeftCircle, 
  DatabaseBackup,
  Copy,
  FolderDown,
  X,
  FileCheck,
  Flame,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Siswa } from '../types';
import { getSupabase, isSupabaseConfigured, supabaseService } from '../supabase';

interface SiswaMasterFormProps {
  onBack: () => void;
}

export default function SiswaMasterForm({ onBack }: SiswaMasterFormProps) {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [dbMode, setDbMode] = useState<'supabase' | 'local'>(isSupabaseConfigured ? 'supabase' : 'local');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create Individual Siswa Form
  const [nisInput, setNisInput] = useState('');
  const [namaInput, setNamaInput] = useState('');
  const [kelasInput, setKelasInput] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Table Page State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Excel Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [excelPreview, setExcelPreview] = useState<any[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadStats, setUploadStats] = useState({ success: 0, failed: 0 });

  // Alerts
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string }>({ type: null, message: '' });

  // Copy Schema Toast
  const [showCopied, setShowCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Siswa Records Based on selected Database Mode
  const loadSiswaRecords = async () => {
    setIsLoading(true);
    setAlertInfo({ type: null, message: '' });

    if (dbMode === 'supabase' && isSupabaseConfigured) {
      try {
        const data = await supabaseService.getSiswa();
        setSiswaList(data);
      } catch (err: any) {
        console.error(err);
        setAlertInfo({ 
          type: 'error', 
          message: `Gagal memuat data dari Supabase: ${err.message}. Layanan beralih ke penyimpanan lokal sementara.` 
        });
        // fallback to local storage
        loadFromLocalStorage();
        setDbMode('local');
      }
    } else {
      loadFromLocalStorage();
    }
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    try {
      const offlineData = localStorage.getItem('siswa_master_data');
      if (offlineData) {
        setSiswaList(JSON.parse(offlineData));
      } else {
        // Preset default student list for demo purposes if empty
        const defaultSiswa: Siswa[] = [
          { nis: '10201', nama: 'Aditya Pratama', kelas: 'VIII-A' },
          { nis: '10202', nama: 'Clarissa Maharani', kelas: 'VIII-B' },
          { nis: '10203', nama: 'Dimas Setiawan', kelas: 'IX-A' },
          { nis: '10204', nama: 'Eka Lestari', kelas: 'VII-C' },
          { nis: '10205', nama: 'Fajar Nugroho', kelas: 'IX-B' },
          { nis: '10206', nama: 'Gita Amalia', kelas: 'VIII-A' },
          { nis: '10207', nama: 'Hendra Wijaya', kelas: 'VII-A' }
        ];
        setSiswaList(defaultSiswa);
        localStorage.setItem('siswa_master_data', JSON.stringify(defaultSiswa));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger loading when dbMode changes
  useEffect(() => {
    loadSiswaRecords();
  }, [dbMode]);

  // Handle Save Student Form
  const handleAddNewSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!nisInput.trim()) {
      setModalError('NIS (Nomor Induk Siswa) wajib diisi.');
      return;
    }
    if (!namaInput.trim()) {
      setModalError('Nama Siswa wajib diisi.');
      return;
    }
    if (!kelasInput.trim()) {
      setModalError('Kelas wajib diisi.');
      return;
    }

    const newRecord: Siswa = {
      nis: nisInput.trim(),
      nama: namaInput.trim(),
      kelas: kelasInput.trim().toUpperCase()
    };

    setIsLoading(true);
    try {
      if (dbMode === 'supabase' && isSupabaseConfigured) {
        // Save to Supabase
        await supabaseService.upsertSiswa(newRecord);
        setModalSuccess('Siswa berhasil disimpan ke tabel Supabase.');
      } else {
        // Save to Local
        const existsIdx = siswaList.findIndex(s => s.nis === newRecord.nis);
        let updatedList = [...siswaList];
        if (existsIdx > -1) {
          updatedList[existsIdx] = newRecord;
        } else {
          updatedList.push(newRecord);
        }
        setSiswaList(updatedList);
        localStorage.setItem('siswa_master_data', JSON.stringify(updatedList));
        setModalSuccess('Siswa berhasil disimpan ke penyimpanan lokal.');
      }

      // Reload
      loadSiswaRecords();

      // Clear inputs
      setNisInput('');
      setNamaInput('');
      setKelasInput('');
    } catch (err: any) {
      setModalError(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Individual Record
  const handleDeleteSiswa = async (nis: string) => {
    setIsLoading(true);
    try {
      if (dbMode === 'supabase' && isSupabaseConfigured) {
        await supabaseService.deleteSiswaByNis(nis);
        setAlertInfo({ type: 'success', message: `Berhasil menghapus siswa dengan NIS ${nis} dari Supabase.` });
      } else {
        const updated = siswaList.filter(s => s.nis !== nis);
        setSiswaList(updated);
        localStorage.setItem('siswa_master_data', JSON.stringify(updated));
        setAlertInfo({ type: 'success', message: `Berhasil menghapus siswa dengan NIS ${nis} dari penyimpanan lokal.` });
      }
      loadSiswaRecords();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: `Gagal menghapus siswa: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear All Master Data with confirmation
  const handleClearAll = async () => {
    if (!confirm('PERINGATAN! Tindakan ini akan menghapus SELURUH data master siswa. Apakah Anda yakin ingin melanjutkan?')) {
      return;
    }

    setIsLoading(true);
    try {
      if (dbMode === 'supabase' && isSupabaseConfigured) {
        await supabaseService.clearAllSiswa();
        setAlertInfo({ type: 'success', message: 'Seluruh data master siswa berhasil dihapus dari tabel Supabase.' });
      } else {
        setSiswaList([]);
        localStorage.removeItem('siswa_master_data');
        setAlertInfo({ type: 'success', message: 'Seluruh data master siswa berhasil dibersihkan dari penyimpanan lokal.' });
      }
      loadSiswaRecords();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: `Gagal membersihkan data: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // --- EXCEL PARSING ENGINE ---
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processExcelFile(e.target.files[0]);
    }
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawJson.length < 2) {
          alert('Negosiasi Excel Gagal: Berkas tidak memiliki baris data yang cukup atau baris judul kolom.');
          return;
        }

        // Detect columns from first header row
        const headers = rawJson[0] as any[];
        
        // Dynamic mapping check for headers like "nis", "id", "nama", "name", "kelas", "class"
        let nisIdx = headers.findIndex(h => {
          const s = String(h).toLowerCase();
          return s.includes('nis') || s.includes('induk') || s.includes('notabel') || s.includes('id siswa');
        });
        let namaIdx = headers.findIndex(h => {
          const s = String(h).toLowerCase();
          return s.includes('nama') || s.includes('name') || s.includes('lengkap');
        });
        let kelasIdx = headers.findIndex(h => {
          const s = String(h).toLowerCase();
          return s.includes('kelas') || s.includes('class') || s.includes('tingkat');
        });

        // Fail-safe default column index if map not found (0=NIS, 1=Nama, 2=Kelas)
        if (nisIdx === -1) nisIdx = 0;
        if (namaIdx === -1) namaIdx = 1;
        if (kelasIdx === -1) kelasIdx = 2;

        const studentsExtracted: Siswa[] = [];
        
        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (row && row.length > 0) {
            const nisValue = row[nisIdx] !== undefined ? String(row[nisIdx]).trim() : '';
            const namaValue = row[namaIdx] !== undefined ? String(row[namaIdx]).trim() : '';
            const kelasValue = row[kelasIdx] !== undefined ? String(row[kelasIdx]).trim() : '';

            if (nisValue && namaValue) { // Must-have minimal constraints for safety
              studentsExtracted.push({
                nis: nisValue,
                nama: namaValue,
                kelas: kelasValue || 'UMUM'
              });
            }
          }
        }

        if (studentsExtracted.length > 0) {
          setExcelPreview(studentsExtracted);
          setShowPreviewModal(true);
        } else {
          alert('Format Kolom Tidak Sesuai. Mohon pastikan baris pertama memiliki header atau kolom (NIS, Nama Siswa, Kelas) secara urut.');
        }

      } catch (err: any) {
        alert(`Gagal mem-parsing file excel: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Convert Excel Preview parsed records directly to Database / local
  const commitImportedSiswa = async () => {
    setIsLoading(true);
    setShowPreviewModal(false);
    
    try {
      if (dbMode === 'supabase' && isSupabaseConfigured) {
        // Upload bulk in Supabase
        await supabaseService.bulkInsertSiswa(excelPreview);
        setAlertInfo({ 
          type: 'success', 
          message: `Berhasil mengimpor ${excelPreview.length} data siswa baru secara massal ke database Supabase!` 
        });
      } else {
        // Upload locally, merging or overwriting duplicate Nis
        const localMap = new Map<string, Siswa>();
        siswaList.forEach(s => localMap.set(s.nis, s));
        excelPreview.forEach(s => localMap.set(s.nis, s));
        const mergedList = Array.from(localMap.values());

        setSiswaList(mergedList);
        localStorage.setItem('siswa_master_data', JSON.stringify(mergedList));
        setAlertInfo({ 
          type: 'success', 
          message: `Menggunakan Penyimpanan Lokal: Berhasil memproses ${excelPreview.length} siswa dan menggabungkan dengan total daftar.` 
        });
      }
      setExcelPreview([]);
      loadSiswaRecords();
    } catch (err: any) {
      setAlertInfo({ 
        type: 'error', 
        message: `Gagal menyimpan batch import ke database: ${err.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download simple dynamic Template Excel xlsx file
  const handleDownloadTemplate = () => {
    const templateData = [
      { 'Nomor Induk Siswa (NIS)': '10201', 'Nama Siswa': 'Andi Hermawan', 'Kelas': 'VIII-A' },
      { 'Nomor Induk Siswa (NIS)': '10202', 'Nama Siswa': 'Siti Nurhaliza', 'Kelas': 'VIII-B' },
      { 'Nomor Induk Siswa (NIS)': '10203', 'Nama Siswa': 'Rian Hidayat', 'Kelas': 'IX-A' },
      { 'Nomor Induk Siswa (NIS)': '10204', 'Nama Siswa': 'Clara Indriati', 'Kelas': 'VII-B' },
      { 'Nomor Induk Siswa (NIS)': '10205', 'Nama Siswa': 'Bambang Triyadi', 'Kelas': 'IX-C' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa SPANJU');
    
    XLSX.writeFile(workbook, 'template_master_siswa_spanju.xlsx');
  };

  // Map Filter and Search
  const availableClasses = Array.from(new Set(['Semua', ...siswaList.map(s => s.kelas).filter(Boolean)]));

  const filteredSiswa = siswaList.filter(siswa => {
    const matchesSearch = siswa.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'Semua' || siswa.kelas === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Pagination calculation
  const totalItems = filteredSiswa.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSiswa = filteredSiswa.slice(startIndex, startIndex + itemsPerPage);

  const copySqlSchema = () => {
    const sql = `create table public.siswa (
  id uuid default gen_random_uuid() not null primary key,
  nis varchar(50) unique not null,
  nama text not null,
  kelas varchar(50) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;
    navigator.clipboard.writeText(sql);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] p-4 lg:p-6 overflow-y-auto animate-fade-in" id="siswa-master-dashboard-container">
      
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 bg-white p-6 rounded-2xl glass-panel relative overflow-hidden mb-6 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-rose-500 to-indigo-500 opacity-80" />
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-zinc-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Kembali ke Dasbor Utama"
          >
            <ArrowLeftCircle className="w-5 h-5 text-cyan-600" />
          </button>
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
              <span>Form Master Siswa SPANJU</span>
              <span className="text-[10px] uppercase tracking-wider bg-cyan-50 text-cyan-600 border border-cyan-200 px-2.5 py-0.5 rounded-full font-display font-semibold">
                Admin Panel
              </span>
            </h2>
            <p className="text-xs text-slate-600 font-sans font-medium">
              Kelola, validasi, dan sinkronisasi seluruh database siswa kelas VII, VIII, dan IX secara massal atau manual.
            </p>
          </div>
        </div>

        {/* Database Toggle Option Widget */}
        <div className="bg-slate-100 p-1 border border-slate-200 rounded-xl flex items-center space-x-1 shadow-inner shrink-0">
          <button
            onClick={() => setDbMode('local')}
            className={`px-3.5 py-1.5 text-[11px] font-display font-extrabold rounded-lg transition-all duration-150 cursor-pointer ${
              dbMode === 'local' 
                ? 'bg-amber-100 border border-amber-300 text-amber-800 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Penyimpanan Lokal
          </button>
          <button
            onClick={() => {
              if (!isSupabaseConfigured) {
                alert('Supabase belum dikonfigurasi dalam berkas rahasia (Secrets)! Layanan dialihkan ke mode demo simulasi.');
                return;
              }
              setDbMode('supabase');
            }}
            className={`px-3.5 py-1.5 text-[11px] font-display font-extrabold rounded-lg transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
              dbMode === 'supabase' 
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm' 
                : isSupabaseConfigured 
                  ? 'text-zinc-500 hover:text-zinc-700' 
                  : 'text-zinc-400 line-through opacity-40 cursor-not-allowed'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Supabase</span>
          </button>
        </div>
      </div>

      {/* Database Setup Helper (Show SQL Schema commands if Supabase configuration is pending or enabled) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Supabase connection status */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Status Integrasi</span>
            <h4 className="text-sm font-semibold font-display text-slate-800 flex items-center gap-1.5">
              <span>Integrasi Database Core</span>
              <Info className="w-3.5 h-3.5 text-cyan-600 cursor-help" title="Sistem mendeteksi apakah kredensial database sudah dipasang di panel rahasia" />
            </h4>
            <div className="text-xs text-slate-500 pt-1.5 font-sans leading-relaxed">
              {isSupabaseConfigured ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-ping" />
                  Berhasil Terkoneksi ke Supabase.
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-550" />
                  Mode offline. Disimpan di peramban lokal.
                </span>
              )}
            </div>
          </div>
          <div className="mt-3.5 text-[10px] leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono font-bold">
            VITE_SUPABASE_URL = <span className="text-cyan-600">{isSupabaseConfigured ? '✓ Terpasang' : '✗ Kosong (Gunakan Rahasia)'}</span>
          </div>
        </div>

        {/* Supabase Schema Helper script */}
        <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-rose-500">Instruksi Supabase</span>
                <h4 className="text-sm font-bold font-display text-slate-800">Skema Query SQL Siswa</h4>
              </div>
              <button
                onClick={copySqlSchema}
                className="px-2.5 py-1 text-[10px] font-display font-bold text-cyan-700 hover:text-white bg-cyan-50 hover:bg-cyan-600 rounded-lg border border-cyan-200 hover:border-transparent flex items-center space-x-1 cursor-pointer transition-all active:scale-95 duration-100 shadow-sm"
              >
                {showCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{showCopied ? 'Tersalin' : 'Salin SQL'}</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500 pb-2 font-medium">
              Jalankan query SQL berikut di dalam <span className="text-slate-800 font-bold">Supabase SQL Editor</span> Anda agar tabel master siswa sinkron sempurna:
            </p>
          </div>
          <pre className="text-[10px] font-mono bg-slate-50 text-amber-900 p-3 rounded-xl border border-slate-250/60 overflow-x-auto leading-relaxed max-h-24 font-bold">
{`create table public.siswa (
  id uuid default gen_random_uuid() not null primary key,
  nis varchar(50) unique not null,
  nama text not null,
  kelas varchar(50) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
          </pre>
        </div>
      </div>

      {alertInfo.message && (
        <div className={`p-4 rounded-xl border mb-6 flex items-start space-x-3 text-xs leading-relaxed ${
          alertInfo.type === 'error' 
            ? 'bg-rose-950/20 text-rose-200 border-rose-900/30' 
            : alertInfo.type === 'warning'
              ? 'bg-amber-950/20 text-amber-200 border-amber-900/30'
              : 'bg-emerald-950/20 text-emerald-200 border-emerald-950/30'
        }`}>
          {alertInfo.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <span>{alertInfo.message}</span>
        </div>
      )}

      {/* Main Core Body Segment: Split into Left Form Input and Right list viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column (Form input, excel uploader, template) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Box 1: Excel Import Engine */}
          <div className="glass-panel border border-zinc-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-sm text-zinc-100 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Unggah Data Excel (XLSX / CSV)</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Unggah file spreadsheet Anda untuk memasukkan nama-nama siswa Kelas VII - IX secara massal. Sistem secara cerdas akan me-map baris siswa.
            </p>

            {/* Drag & Drop Window Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 h-40 ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-lg' 
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-650 hover:bg-zinc-900/50'
              }`}
            >
              <Upload className={`w-8 h-8 mb-3 transition-colors duration-150 ${isDragging ? 'text-cyan-400 animate-bounce' : 'text-zinc-550'}`} />
              <span className="text-xs text-zinc-200 font-display font-bold mb-1">
                Letakkan file Excel (.xlsx) atau klik untuk memilih
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Mendukung berkas tabel Excel & CSV</span>
            </div>

            {/* Hidden real input */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx, .xls, .csv"
              className="hidden" 
            />

            {/* Excel Template Helper Download */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <FolderDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-display font-bold text-zinc-200">Gunakan Template Contoh?</h4>
                  <p className="text-[10px] text-zinc-500 font-sans">Mencegah terjadinya kesalahan struktur kolom data</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 text-[11px] font-display font-bold text-emerald-400 hover:text-slate-950 bg-emerald-500/10 hover:bg-emerald-400 border border-emerald-500/30 hover:border-transparent rounded-lg transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
              >
                Unduh Template
              </button>
            </div>

          </div>

          {/* Box 2: Individual additions details Form (Manual Entry) */}
          <div className="glass-panel border border-zinc-800/60 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-sm text-zinc-100 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Input Siswa Manual</span>
            </h3>

            <form onSubmit={handleAddNewSiswa} className="space-y-4">
              {modalError && (
                <div className="p-2.5 text-[10px] text-rose-400 bg-rose-950/20 border border-rose-900/20 rounded-lg flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              {modalSuccess && (
                <div className="p-2.5 text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-950/20 rounded-lg flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-semibold">Nomor Induk (NIS)</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 10214" 
                    value={nisInput}
                    onChange={(e) => setNisInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-805 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 font-mono transition shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-semibold">Kelas</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: VIII-A" 
                    value={kelasInput}
                    onChange={(e) => setKelasInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-805 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 font-mono transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1 font-semibold">Nama Lengkap Siswa</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Muhammad Akhyar" 
                  value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-805 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 transition shadow-inner"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setNisInput('');
                    setNamaInput('');
                    setKelasInput('');
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-display font-bold transition duration-150 cursor-pointer text-center"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-cyan-550 hover:bg-cyan-500 text-slate-950 font-display font-extrabold text-xs tracking-wide rounded-xl border border-cyan-400/20 hover:border-transparent transition duration-150 cursor-pointer text-center shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right column: Search, Filter, list of registered students */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          
          {/* Header Row of Student Spreadsheet Viewer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-205">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Rincian Master Database Siswa</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">TERDAPAT {totalItems} DATA YANG DITEMUKAN</p>
            </div>

            {/* Clear All command */}
            {siswaList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-lg text-xs font-display font-bold flex items-center space-x-1.5 transition duration-150 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Master</span>
              </button>
            )}
          </div>

          {/* Quick Filters Block */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan NIS, Nama, atau Kelas..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            {/* Dropdown class filter */}
            <div className="shrink-0">
              <select 
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
                className="w-full md:w-36 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Semua">Semua Kelas</option>
                {availableClasses.filter(c => c !== 'Semua').map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Spreadsheet view */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-inner">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[10px] uppercase bg-slate-50 border-b border-slate-200 text-slate-500 tracking-wider font-mono font-bold">
                <tr>
                  <th className="px-4 py-3">NIS</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400 font-medium">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2.5 text-slate-300" />
                      <span>Belum ada data siswa yang cocok dengan filter pencarian.</span>
                    </td>
                  </tr>
                ) : (
                  paginatedSiswa.map((siswa, idx) => (
                    <tr key={siswa.nis || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-700 tracking-wide font-bold">{siswa.nis}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{siswa.nama}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                          {siswa.kelas}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteSiswa(siswa.nis)}
                          className="px-2 py-1 text-[10px] text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-transparent transition-all cursor-pointer font-bold"
                          title="Hapus Record"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination row controls */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 font-mono uppercase text-[10px] font-bold">
              Menampilkan {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} records
            </span>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white shadow-sm"
              >
                Kembali
              </button>
              
              <span className="px-3 py-1.5 font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white shadow-sm"
              >
                Lanjut
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL / DIALOG DETECTED EXCEL PREVIEW DIALOG */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden max-h-[85vh] shadow-2xl animate-fade-in">
            
            {/* Modal Head */}
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">Verifikasi Unggah Data Excel</h3>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">TERPADU: BERHASIL MENDETEKSI {excelPreview.length} BARIS DATA SISWA</p>
                </div>
              </div>

              <button 
                onClick={() => { setExcelPreview([]); setShowPreviewModal(false); }}
                className="p-1 px-2.5 rounded-lg border border-slate-200 text-zinc-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Table body scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs rounded-xl flex items-start space-x-2 font-medium">
                <Info className="w-5 h-5 shrink-0 text-cyan-600 mt-0.5" />
                <p className="leading-relaxed text-justify">
                  Silakan periksa kembali pratinjau tabel siswa di bawah sebelum melakukan impor permanen ke {dbMode === 'supabase' ? 'tabel cloud Supabase' : 'Browser LocalStorage'}. Duplikat NIS akan otomatis diperbarui (Upsert).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
                <table className="w-full text-[11px] text-left text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 tracking-wider font-mono font-bold">
                    <tr>
                      <th className="px-4 py-2">No. Row</th>
                      <th className="px-4 py-2">NIS</th>
                      <th className="px-4 py-2">Nama Siswa</th>
                      <th className="px-4 py-2">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {excelPreview.slice(0, 10).map((student, index) => (
                      <tr key={index} className="hover:bg-slate-50/40">
                        <td className="px-4 py-2 text-slate-400 font-mono">{index + 1}</td>
                        <td className="px-4 py-2 font-mono text-cyan-700 font-bold">{student.nis}</td>
                        <td className="px-4 py-2 font-bold text-slate-800">{student.nama}</td>
                        <td className="px-4 py-2">
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono text-[9px] font-semibold">
                            {student.kelas}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {excelPreview.length > 10 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-center text-slate-450 font-mono italic font-bold">
                          ... dan {excelPreview.length - 10} baris data siswa lainnya ...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal actions */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex space-x-3 justify-end">
              <button
                type="button"
                onClick={() => { setExcelPreview([]); setShowPreviewModal(false); }}
                className="px-4 py-2 text-xs font-display font-bold border border-slate-200 bg-white rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Batalkan Impor
              </button>
              <button
                type="button"
                onClick={commitImportedSiswa}
                className="px-5 py-2 text-xs font-display bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center space-x-1 shadow-sm active:translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan {excelPreview.length} Siswa</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
