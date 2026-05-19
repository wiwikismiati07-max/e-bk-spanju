import { createClient } from '@supabase/supabase-js';
import { Siswa, AgendaBK } from './types';

// Retrieve credentials safely
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if credentials exist and are not placeholder values
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key'
);

// Lazy initialization of Supabase client
let supabaseInstance: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Service helpers for Siswa master tables
 */
export const supabaseService = {
  /**
   * Fetch all siswa
   */
  async getSiswa(): Promise<Siswa[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .order('nis', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  },

  /**
   * Save a single siswa
   */
  async upsertSiswa(record: Siswa): Promise<Siswa> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    // Check with NIS
    const { data, error } = await supabase
      .from('siswa')
      .upsert({
        nis: record.nis,
        nama: record.nama,
        kelas: record.kelas
      }, { onConflict: 'nis' })
      .select();

    if (error) {
      throw error;
    }
    return data[0];
  },

  /**
   * Add / Insert multiple siswa records at once (typical for excel uploads)
   */
  async bulkInsertSiswa(records: Siswa[]): Promise<Siswa[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    // Prepare standard clean format
    const cleaned = records.map(r => ({
      nis: r.nis,
      nama: r.nama,
      kelas: r.kelas
    }));

    const { data, error } = await supabase
      .from('siswa')
      .upsert(cleaned, { onConflict: 'nis' })
      .select();

    if (error) {
      throw error;
    }
    return data || [];
  },

  /**
   * Delete a student by NIS or ID
   */
  async deleteSiswaByNis(nis: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const { error } = await supabase
      .from('siswa')
      .delete()
      .eq('nis', nis);

    if (error) {
      throw error;
    }
    return true;
  },

  /**
   * Clear all siswa records
   */
  async clearAllSiswa(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const { error } = await supabase
      .from('siswa')
      .delete()
      .neq('nis', ''); // delete all where matching any nis

    if (error) {
      throw error;
    }
    return true;
  }
};

/**
 * Service helpers for Counseling Agenda (Agenda Kerja BK)
 */
export const supabaseAgendaService = {
  /**
   * Fetch all agenda
   */
  async getAgenda(): Promise<AgendaBK[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const { data, error } = await supabase
      .from('agenda_bk')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  },

  /**
   * Upsert a search or single entry
   */
  async upsertAgenda(record: AgendaBK): Promise<AgendaBK> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const row: any = {
      tanggal: record.tanggal,
      hari: record.hari,
      uraian_1: record.uraian_1,
      uraian_2: record.uraian_2,
      uraian_3: record.uraian_3,
      uraian_4: record.uraian_4,
      uraian_5: record.uraian_5,
      uraian_6: record.uraian_6,
      uraian_7: record.uraian_7,
      uraian_8: record.uraian_8,
      sasaran: record.sasaran,
      link_dokumentasi: record.link_dokumentasi,
      keterangan: record.keterangan,
    };

    if (record.id) {
      row.id = record.id;
    }

    const { data, error } = await supabase
      .from('agenda_bk')
      .upsert(row)
      .select();

    if (error) {
      throw error;
    }
    return data[0];
  },

  /**
   * Delete an Agenda by ID
   */
  async deleteAgenda(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const { error } = await supabase
      .from('agenda_bk')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    return true;
  },

  /**
   * Clear all agenda records
   */
  async clearAllAgenda(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Setup keys in secrets.');
    }

    const { error } = await supabase
      .from('agenda_bk')
      .delete()
      .neq('tanggal', ''); // Delete all matching rows

    if (error) {
      throw error;
    }
    return true;
  }
};

