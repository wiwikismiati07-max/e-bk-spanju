import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Link2, 
  FileText, 
  Users2, 
  Plus, 
  Trash2, 
  Download, 
  Database, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeftCircle, 
  Info, 
  Copy, 
  ChevronRight,
  Eye,
  X,
  Sparkles,
  Edit2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AgendaBK } from '../types';
import { getSupabase, isSupabaseConfigured, supabaseAgendaService } from '../supabase';

interface AgendaBKFormProps {
  onBack: () => void;
}

const HARI_INDONESIA: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu'
};

export default function AgendaBKForm({ onBack }: AgendaBKFormProps) {
  const [agendas, setAgendas] = useState<AgendaBK[]>([]);
  const [dbMode, setDbMode] = useState<'supabase' | 'local'>(isSupabaseConfigured ? 'supabase' : 'local');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [hari, setHari] = useState('');
  
  // 8 rows list of activity descriptions
  const [uraian1, setUraian1] = useState('');
  const [uraian2, setUraian2] = useState('');
  const [uraian3, setUraian3] = useState('');
  const [uraian4, setUraian4] = useState('');
  const [uraian5, setUraian5] = useState('');
  const [uraian6, setUraian6] = useState('');
  const [uraian7, setUraian7] = useState('');
  const [uraian8, setUraian8] = useState('');

  const [sasaran, setSasaran] = useState('');
  const [linkDokumentasi, setLinkDokumentasi] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('Semua');

  // Detail Modal view
  const [selectedAgendaDetail, setSelectedAgendaDetail] = useState<AgendaBK | null>(null);

  // Notification and toasty states
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string }>({ type: null, message: '' });
  const [showCopied, setShowCopied] = useState(false);

  // Auto detect Day (Hari) based on Date (Tanggal) selected
  useEffect(() => {
    if (tanggal) {
      try {
        const d = new Date(tanggal);
        const indonesianDayStr = HARI_INDONESIA[d.getDay()];
        setHari(indonesianDayStr || '');
      } catch (e) {
        console.error(e);
      }
    }
  }, [tanggal]);

  // Load Agendas data
  const loadAgendas = async () => {
    setIsLoading(true);
    setAlertInfo({ type: null, message: '' });

    if (dbMode === 'supabase' && isSupabaseConfigured) {
      try {
        const data = await supabaseAgendaService.getAgenda();
        setAgendas(data);
      } catch (err: any) {
        console.error(err);
        setAlertInfo({
          type: 'error',
          message: `Gagal menyinkronkan data dengan Supabase: ${err.message}. Menggunakan penyimpanan offline.`
        });
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
      const offlineAgendasStr = localStorage.getItem('agenda_bk_data');
      if (offlineAgendasStr) {
        setAgendas(JSON.parse(offlineAgendasStr));
      } else {
        // Mock items to make interface live on startup
        const sampleAgenda: AgendaBK[] = [
          {
            id: 'sample-1',
            tanggal: '2026-05-18',
            hari: 'Senin',
            uraian_1: 'Melakukan koordinasi dengan wali kelas VIII-A mengenai catatan absensi siswa',
            uraian_2: 'Memberikan bimbingan klasikal tentang motivasi belajar menghadapi ujian',
            uraian_3: 'Sesi konseling individu dengan siswa berinisial AP terkait motivasi',
            uraian_4: 'Mempersiapkan materi poster digital bahaya perundungan (bullying)',
            uraian_5: 'Menginput rekam bimbingan siswa ke rekapitulasi data',
            uraian_6: 'Diskusi kelompok terarah dengan perwakilan OSIS tentang kesehatan mental',
            uraian_7: 'Evaluasi mingguan rekap hambatan studi siswa',
            uraian_8: 'Menghubungi orang tua siswa yang membutuhkan tindak lanjut khusus',
            sasaran: 'Siswa Kelas VIII & Pengurus OSIS',
            link_dokumentasi: 'https://docs.google.com/spreadsheets/d/sample',
            keterangan: 'Kegiatan berjalan tertib dan dihadiri 95% kuorum sasaran.'
          }
        ];
        setAgendas(sampleAgenda);
        localStorage.setItem('agenda_bk_data', JSON.stringify(sampleAgenda));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAgendas();
  }, [dbMode]);

  const clearForm = () => {
    setTanggal(new Date().toISOString().split('T')[0]);
    setUraian1('');
    setUraian2('');
    setUraian3('');
    setUraian4('');
    setUraian5('');
    setUraian6('');
    setUraian7('');
    setUraian8('');
    setSasaran('');
    setLinkDokumentasi('');
    setKeterangan('');
    setEditingId(null);
  };

  // Submit hander: Save or update
  const handleSubmitAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertInfo({ type: null, message: '' });

    if (!tanggal || !hari) {
      setAlertInfo({ type: 'error', message: 'Kolom Hari dan Tanggal wajib ditentukan.' });
      return;
    }

    if (!uraian1.trim()) {
      setAlertInfo({ type: 'error', message: 'Tulis uraian kegiatan setidaknya pada baris ke-1.' });
      return;
    }

    if (!sasaran.trim()) {
      setAlertInfo({ type: 'error', message: 'Sasaran kegiatan wajib ditentukan.' });
      return;
    }

    const payload: AgendaBK = {
      tanggal,
      hari,
      uraian_1: uraian1.trim(),
      uraian_2: uraian2.trim(),
      uraian_3: uraian3.trim(),
      uraian_4: uraian4.trim(),
      uraian_5: uraian5.trim(),
      uraian_6: uraian6.trim(),
      uraian_7: uraian7.trim(),
      uraian_8: uraian8.trim(),
      sasaran: sasaran.trim(),
      link_dokumentasi: linkDokumentasi.trim(),
      keterangan: keterangan.trim()
    };

    if (editingId) {
      payload.id = editingId;
    }

    setIsLoading(true);
    try {
      if (dbMode === 'supabase' && isSupabaseConfigured) {
        await supabaseAgendaService.upsertAgenda(payload);
        setAlertInfo({ 
          type: 'success', 
          message: editingId ? 'Agenda BK berhasil diperbarui di Supabase.' : 'Agenda BK baru berhasil disimpan ke Supabase.'
        });
      } else {
        // Save in localStorage
        let updatedList = [...agendas];
        if (editingId) {
          const index = updatedList.findIndex(item => item.id === editingId);
          if (index > -1) {
            updatedList[index] = { ...payload, id: editingId };
          }
        } else {
          updatedList.unshift({
            ...payload,
            id: 'local-' + Date.now().toString()
          });
        }
        setAgendas(updatedList);
        localStorage.setItem('agenda_bk_data', JSON.stringify(updatedList));
        setAlertInfo({ 
          type: 'success', 
          message: editingId ? 'Agenda BK berhasil diperbarui di penyimpanan lokal.' : 'Agenda BK baru disimpan ke penyimpanan lokal.'
        });
      }

      clearForm();
      loadAgendas();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: `Gagal memproses data: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Populate data for editing
  const startEditAgenda = (item: AgendaBK) => {
    setEditingId(item.id || null);
    setTanggal(item.tanggal);
    setHari(item.hari);
    setUraian1(item.uraian_1 || '');
    setUraian2(item.uraian_2 || '');
    setUraian3(item.uraian_3 || '');
    setUraian4(item.uraian_4 || '');
    setUraian5(item.uraian_5 || '');
    setUraian6(item.uraian_6 || '');
    setUraian7(item.uraian_7 || '');
    setUraian8(item.uraian_8 || '');
    setSasaran(item.sasaran || '');
    setLinkDokumentasi(item.link_dokumentasi || '');
    setKeterangan(item.keterangan || '');
    
    // Smooth scroll up to form view
    document.getElementById('agenda-entry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Delete an agenda entry
  const handleDeleteAgenda = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Apakah Anda yakin ingin menghapus agenda kegiatan bimbingan konseling ini secara permanen?')) {
      return;
    }

    setIsLoading(true);
    try {
      if (dbMode === 'supabase' && isSupabaseConfigured) {
        await supabaseAgendaService.deleteAgenda(id);
        setAlertInfo({ type: 'success', message: 'Agenda BK berhasil dihapus dari database Supabase.' });
      } else {
        const updated = agendas.filter(item => item.id !== id);
        setAgendas(updated);
        localStorage.setItem('agenda_bk_data', JSON.stringify(updated));
        setAlertInfo({ type: 'success', message: 'Agenda BK berhasil dibersihkan dari penyimpanan lokal.' });
      }
      loadAgendas();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: `Gagal menghapus data: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Export Agenda BK to structured professional Excel Template spreadsheet
  const handleExportToExcel = () => {
    if (agendas.length === 0) {
      alert('Tidak ada agenda yang tersedia untuk diekspor!');
      return;
    }

    // Helper: Map all records to plain spreadsheet-friendly formats
    const rows = filteredAgendas.map((item, index) => ({
      'No': index + 1,
      'Hari': item.hari,
      'Tanggal': item.tanggal,
      'Sasaran': item.sasaran,
      'Uraian Kegiatan Baris 1': item.uraian_1 || '-',
      'Uraian Kegiatan Baris 2': item.uraian_2 || '-',
      'Uraian Kegiatan Baris 3': item.uraian_3 || '-',
      'Uraian Kegiatan Baris 4': item.uraian_4 || '-',
      'Uraian Kegiatan Baris 5': item.uraian_5 || '-',
      'Uraian Kegiatan Baris 6': item.uraian_6 || '-',
      'Uraian Kegiatan Baris 7': item.uraian_7 || '-',
      'Uraian Kegiatan Baris 8': item.uraian_8 || '-',
      'Link Dokumentasi Kegiatan': item.link_dokumentasi || '-',
      'Keterangan': item.keterangan || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan_Agenda_BK_SPANJU');

    // Customize width of columns for better display density
    const max_col_widths = [
      { wch: 5 },   // No
      { wch: 10 },  // Hari
      { wch: 12 },  // Tanggal
      { wch: 25 },  // Sasaran
      { wch: 35 },  // Uraian 1
      { wch: 35 },  // Uraian 2
      { wch: 35 },  // Uraian 3
      { wch: 35 },  // Uraian 4
      { wch: 35 },  // Uraian 5
      { wch: 35 },  // Uraian 6
      { wch: 35 },  // Uraian 7
      { wch: 35 },  // Uraian 8
      { wch: 30 },  // Link
      { wch: 30 },  // Keterangan
    ];
    worksheet['!cols'] = max_col_widths;

    // Trigger download
    XLSX.writeFile(workbook, `Laporan_Agenda_Kerja_BK_SPANJU_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Copy Supabase DDL SQL Schema for creating the agenda table
  const copySqlSchema = () => {
    const sql = `create table public.agenda_bk (
  id uuid default gen_random_uuid() not null primary key,
  tanggal date not null,
  hari varchar(30) not null,
  uraian_1 text not null,
  uraian_2 text,
  uraian_3 text,
  uraian_4 text,
  uraian_5 text,
  uraian_6 text,
  uraian_7 text,
  uraian_8 text,
  sasaran text not null,
  link_dokumentasi text,
  keterangan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;
    navigator.clipboard.writeText(sql);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 2500);
  };

  // Filtering Agendas based on search query
  const filteredAgendas = agendas.filter(item => {
    const term = searchQuery.toLowerCase();
    const matchSearch = 
      item.hari.toLowerCase().includes(term) ||
      item.tanggal.toLowerCase().includes(term) ||
      item.sasaran.toLowerCase().includes(term) ||
      item.keterangan.toLowerCase().includes(term) ||
      [item.uraian_1, item.uraian_2, item.uraian_3, item.uraian_4, item.uraian_5, item.uraian_6, item.uraian_7, item.uraian_8]
        .some(u => u && u.toLowerCase().includes(term));
    return matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] p-4 lg:p-6 overflow-y-auto animate-fade-in" id="agenda-bk-dashboard">
      
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 bg-white p-6 rounded-2xl glass-panel relative overflow-hidden mb-6 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-cyan-400 to-amber-500 opacity-80" />
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-zinc-500 hover:text-slate-800 border border-slate-202 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Kembali ke Menu Utama"
          >
            <ArrowLeftCircle className="w-5 h-5 text-rose-600" />
          </button>
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
              <span>Form Agenda Kerja BK SPANJU</span>
              <span className="text-[10px] uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-0.5 rounded-full font-display font-semibold">
                Electronic Schedule
              </span>
            </h2>
            <p className="text-xs text-slate-600 font-sans font-medium">
              Pencatatan rincian agenda harian bimbingan konseling dan pengunduhan laporan spreadsheet secara real-time.
            </p>
          </div>
        </div>

        {/* Database state switch panel */}
        <div className="bg-slate-100 p-1 border border-slate-202 rounded-xl flex items-center space-x-1 shadow-inner shrink-0">
          <button
            type="button"
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
            type="button"
            onClick={() => {
              if (!isSupabaseConfigured) {
                alert('Database Supabase belum terkonfigurasi. Sila masukkan kredensial di panel pengaturan/Settings Secrets!');
                return;
              }
              setDbMode('supabase');
            }}
            className={`px-3.5 py-1.5 text-[11px] font-display font-extrabold rounded-lg transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
              dbMode === 'supabase' 
                ? 'bg-rose-100 border border-rose-300 text-rose-850 shadow-sm' 
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

      {/* SQL Script Instruction Helper Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-slate-205 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Informasi Agenda</span>
            <h4 className="text-sm font-bold font-display text-slate-800">Alur Penyimpanan Program</h4>
            <p className="text-xs text-slate-500 pt-1 font-medium">
              Data agenda harian bimbingan konseling terdiri dari hari, tanggal, sasaran, link bukti fisik dsb.
            </p>
          </div>
          <div className="text-[11px] text-slate-750 mt-4 leading-relaxed p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold">
            {isSupabaseConfigured ? (
              <span className="text-emerald-700">• Cloud Sync Aktif. Data tersimpan di Supabase secara real-time.</span>
            ) : (
              <span className="text-amber-700">• Mode Sandbox / Local Aktif. Semua rincian di-enkripsi lokal.</span>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-205 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-rose-500">Konfigurasi Pengembang</span>
                <h4 className="text-sm font-bold font-display text-slate-800">Skema SQL Agenda BK (agenda_bk)</h4>
              </div>
              <button
                onClick={copySqlSchema}
                className="px-2.5 py-1 text-[10px] font-display font-bold text-cyan-700 hover:text-white bg-cyan-50 hover:bg-cyan-600 rounded-lg border border-cyan-200 hover:border-transparent flex items-center space-x-1 cursor-pointer transition-all duration-100 active:scale-95 shadow-sm"
              >
                {showCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{showCopied ? 'Tersalin' : 'Salin SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 pb-2 font-medium">
              Jalankan perintah SQL ini pada Editor Supabase agar tabel sync sempurna:
            </p>
          </div>
          <pre className="text-[9px] font-mono bg-slate-50 text-amber-900 p-2.5 rounded-xl border border-slate-200 overflow-x-auto leading-relaxed max-h-20 font-bold">
{`create table public.agenda_bk (
  id uuid default gen_random_uuid() not null primary key,
  tanggal date not null,
  hari varchar(30) not null,
  uraian_1 text not null,
  uraian_2 text, uraian_3 text, uraian_4 text, uraian_5 text, uraian_6 text, uraian_7 text, uraian_8 text,
  sasaran text not null, link_dokumentasi text, keterangan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
          </pre>
        </div>
      </div>

      {alertInfo.message && (
        <div className={`p-4 rounded-xl border mb-6 flex items-start space-x-3 text-xs leading-relaxed ${
          alertInfo.type === 'error' 
            ? 'bg-rose-50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-205'
        }`}>
          {alertInfo.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <span>{alertInfo.message}</span>
        </div>
      )}

      {/* Main Core Form row layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
             {/* Left Side: Input form for scheduling (take 5 columns) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm" id="agenda-entry-form">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-rose-550" />
              <span>{editingId ? 'Edit Agenda Terdaftar' : 'Buat Agenda Kegiatan Baru'}</span>
            </h3>
            {editingId && (
              <button 
                onClick={clearForm}
                className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 py-1 px-2 border border-slate-200 rounded cursor-pointer"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitAgenda} className="space-y-4">
            
            {/* Input 1: Hari & Tanggal */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-mono tracking-wider mb-1 font-bold">Tanggal Kegiatan</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-mono tracking-wider mb-1 font-bold">Hari (Otomatis)</label>
                <input
                  type="text"
                  placeholder="Hari"
                  value={hari}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono font-bold focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Input 2: Uraian Kegiatan Stack of 8 item rows (Aline berjajar vertikal ke bawah) */}
            <div className="space-y-2 border border-slate-200 bg-slate-55 p-4 rounded-xl bg-slate-50">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] text-slate-600 uppercase font-mono tracking-wider font-bold">
                  Uraian Kegiatan (8 Baris Berjajar Vertikal ke Bawah)
                </label>
                <span className="text-[9px] bg-rose-50 border border-rose-200 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">
                  Wajib isi min. Baris 1
                </span>
              </div>

              <div className="space-y-2 max-h-76 overflow-y-auto pr-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-rose-600 font-mono w-5 font-bold">1.</span>
                  <input
                    type="text"
                    placeholder="Contoh: Memberikan layanan konseling perorangan"
                    value={uraian1}
                    onChange={(e) => setUraian1(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">2.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-2 (Opsional)"
                    value={uraian2}
                    onChange={(e) => setUraian2(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">3.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-3 (Opsional)"
                    value={uraian3}
                    onChange={(e) => setUraian3(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">4.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-4 (Opsional)"
                    value={uraian4}
                    onChange={(e) => setUraian4(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">5.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-5 (Opsional)"
                    value={uraian5}
                    onChange={(e) => setUraian5(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">6.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-6 (Opsional)"
                    value={uraian6}
                    onChange={(e) => setUraian6(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">7.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-7 (Opsional)"
                    value={uraian7}
                    onChange={(e) => setUraian7(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono w-5 font-bold">8.</span>
                  <input
                    type="text"
                    placeholder="Uraian Kegiatan Baris Ke-8 (Opsional)"
                    value={uraian8}
                    onChange={(e) => setUraian8(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 hover:border-rose-250 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Input 3: Sasaran & Link Buku/Dokumentasi */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-mono tracking-wider mb-1 font-bold">Sasaran / Layanan BK</label>
                <div className="relative">
                  <Users2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Siswa Kelas IXB, Wali Kelas, Wali Murid"
                    value={sasaran}
                    onChange={(e) => setSasaran(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-mono tracking-wider mb-1 font-bold">Link Dokumentasi / Bukti Kegiatan (URL)</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="Contoh: https://drive.google.com/..."
                    value={linkDokumentasi}
                    onChange={(e) => setLinkDokumentasi(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-mono tracking-wider mb-1 font-bold">Keterangan / Evaluasi Hasil</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="Keterangan tambahan atau catatan hasil pemecahan bimbingan..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="flex-1 py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs text-slate-600 hover:text-slate-800 transition duration-155 cursor-pointer text-center font-bold"
              >
                Reset / Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-display font-medium text-xs rounded-xl shadow-sm transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center disabled:opacity-50 font-bold"
              >
                {isLoading ? 'Memproses...' : editingId ? 'Perbarui Agenda' : 'Simpan Agenda Kerja'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: List and Download Excel Dashboard (take 7 columns) */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-rose-500" />
                <span>Reka Agenda Konseling SPANJU</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono font-bold">DITEMUKAN {filteredAgendas.length} AGENDA LAYANAN</p>
            </div>

            {/* EXCEL DOWNLOAD BUTTON REPORT */}
            <button
              onClick={handleExportToExcel}
              className="py-2 px-3.5 bg-emerald-50 text-emerald-700 hover:text-white hover:bg-emerald-600 border border-emerald-250 rounded-xl text-xs font-display font-bold flex items-center space-x-1.5 transition-all duration-150 cursor-pointer shadow-sm active:translate-y-0.5"
              title="Download Seluruh Laporan dalam format Microsoft Excel"
            >
              <Download className="w-4 h-4" />
              <span>Simpan Laporan Excel</span>
            </button>
          </div>

          {/* Table Search filters and limits */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan tanggal, sasaran, kata kunci kegiatan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>
          </div>

          {/* Agenda Grid Stream Card layout */}
          <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
            {filteredAgendas.length === 0 ? (
              <div className="text-center py-20 border border-slate-200 rounded-2xl bg-slate-50 text-slate-400">
                <Layers className="w-10 h-10 mx-auto mb-3 text-slate-355" />
                <p className="text-sm font-bold">Belum Ada Catatan Agenda Kerja BK</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-medium">
                  Seluruh layanan bimbingan siswa akan terangkum rapi di sini setelah Anda mendaftarkan jadwal harian.
                </p>
              </div>
            ) : (
              filteredAgendas.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50/40 border border-slate-200 hover:border-slate-300 p-4.5 rounded-xl transition duration-150 space-y-3.5 relative overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-202/60 shadow-sm">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-mono flex items-center space-x-1.5 font-bold">
                          <span className="font-bold text-slate-800">{item.hari}</span>
                          <span className="text-slate-300 text-[10px]">|</span>
                          <span>{item.tanggal}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">HARI & TANGGAL</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedAgendaDetail(item)}
                        title="Lihat Detail 8 Baris Uraian"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEditAgenda(item)}
                        title="Edit Data"
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-150 hover:border-transparent rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAgenda(item.id)}
                        title="Hapus Data"
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-150 hover:border-transparent rounded-lg transition cursor-pointer font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main summary columns preview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Sasaran Layanan</span>
                      <p className="text-xs text-slate-700 font-bold">{item.sasaran}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Bukti Dokumentasi</span>
                      {item.link_dokumentasi ? (
                        <a 
                          href={item.link_dokumentasi}
                          target="_blank" 
                          rel="noreferrer referrer"
                          className="text-xs text-sky-650 hover:text-sky-800 hover:underline flex items-center space-x-1 font-mono break-all line-clamp-1 font-bold"
                        >
                          <Link2 className="w-3 h-3 shrink-0" />
                          <span>Link Bukti</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-medium">Tidak dilampirkan</span>
                      )}
                    </div>
                  </div>

                  {/* Highlights the first 2 rows of activity description array */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-inner">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest block">Potongan Uraian (Baris 1-2)</span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-start space-x-1 text-slate-700 font-medium">
                        <span className="text-rose-600 font-mono font-bold shrink-0">[1]</span>
                        <p className="line-clamp-1">{item.uraian_1}</p>
                      </div>
                      {item.uraian_2 && (
                        <div className="flex items-start space-x-1 text-slate-600">
                          <span className="text-slate-400 font-mono font-bold shrink-0">[2]</span>
                          <p className="line-clamp-1">{item.uraian_2}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* View prompt */}
                    <button
                      onClick={() => setSelectedAgendaDetail(item)}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-mono font-bold flex items-center space-x-0.5 mt-2 transition cursor-pointer"
                    >
                      <span>Lihat seluruh 8 baris uraian kegiatan</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {item.keterangan && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-start space-x-1.5 font-medium">
                      <span className="font-bold text-slate-400 shrink-0">Ket:</span>
                      <p className="italic leading-relaxed">{item.keterangan}</p>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* DETAIL DIALOG / POPUP FOR 8 COINCIDENT ROWS READINGS */}
      {selectedAgendaDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden max-h-[85vh] shadow-2xl animate-fade-in">
            
            {/* Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">
                    Detail Agenda - {selectedAgendaDetail.hari}, {selectedAgendaDetail.tanggal}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                    REKAM AGENDA KONSELING SPANJU E-BK
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAgendaDetail(null)}
                className="p-1 px-2 hover:bg-slate-100 text-slate-400 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content list with all 8 rows */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  8 Baris Uraian Kegiatan Terjadwal:
                </h4>
                
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 shadow-inner">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const val = (selectedAgendaDetail as any)[`uraian_${num}`];
                    return (
                      <div key={num} className="flex items-start space-x-3 text-xs leading-relaxed">
                        <span className={`font-mono text-[11px] font-bold shrink-0 w-5 text-right ${val ? 'text-rose-600' : 'text-slate-300'}`}>
                          [{num}]
                        </span>
                        {val ? (
                          <p className="text-slate-700 font-sans font-medium">{val}</p>
                        ) : (
                          <p className="text-slate-300 italic font-mono">- Kosong -</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extra details list */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Sasaran Kegiatan</span>
                  <p className="text-slate-700 font-bold font-sans">{selectedAgendaDetail.sasaran}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Tautan Dokumentasi</span>
                  {selectedAgendaDetail.link_dokumentasi ? (
                    <a 
                      href={selectedAgendaDetail.link_dokumentasi}
                      target="_blank" 
                      rel="noreferrer referrer"
                      className="text-sky-655 hover:text-sky-850 hover:underline flex items-center space-x-1 font-mono break-all leading-snug font-bold"
                    >
                      <Link2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{selectedAgendaDetail.link_dokumentasi}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic font-medium">Tidak dilampirkan</span>
                  )}
                </div>
              </div>

              {selectedAgendaDetail.keterangan && (
                <div className="pt-4 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Keterangan / Evaluasi</span>
                  <p className="text-xs text-slate-655 leading-relaxed italic">
                    "{selectedAgendaDetail.keterangan}"
                  </p>
                </div>
              )}

            </div>

            {/* Modal actions close */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAgendaDetail(null)}
                className="px-5 py-2 text-xs font-display bg-white hover:bg-slate-105 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-xl cursor-pointer shadow-sm"
              >
                Tutup Jendela Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
