import { createClient } from '@supabase/supabase-js';
import { Siswa } from './types';

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
