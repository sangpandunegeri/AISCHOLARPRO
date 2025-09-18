
import { Project, DocumentSection, Status, EducationLevel } from './types';

export const DOCUMENT_STRUCTURE: Omit<DocumentSection, 'content' | 'status'>[] = [
  { id: 'title_page', title: 'Halaman Judul', level: 1 },
  { id: 'approval_page', title: 'Halaman Pengesahan', level: 1 },
  { id: 'abstract', title: 'Abstrak', level: 1 },
  { id: 'foreword', title: 'Kata Pengantar', level: 1 },
  { id: 'toc', title: 'Daftar Isi', level: 1 },
  { id: 'bab1', title: 'BAB I: PENDAHULUAN', level: 1 },
  { id: '1.1', title: '1.1 Latar Belakang', level: 2 },
  { id: '1.2', title: '1.2 Rumusan Masalah', level: 2 },
  { id: '1.3', title: '1.3 Tujuan Penelitian', level: 2 },
  { id: '1.4', title: '1.4 Manfaat Penelitian', level: 2 },
  { id: 'bab2', title: 'BAB II: TINJAUAN PUSTAKA', level: 1 },
  { id: '2.1', title: '2.1 Penelitian Terdahulu', level: 2 },
  { id: '2.2', title: '2.2 Landasan Teori', level: 2 },
  { id: '2.3', title: '2.3 Kerangka Pemikiran', level: 2 },
  { id: 'bab3', title: 'BAB III: METODOLOGI PENELITIAN', level: 1 },
  { id: '3.1', title: '3.1 Jenis Penelitian', level: 2 },
  { id: '3.2', title: '3.2 Waktu dan Tempat', level: 2 },
  { id: '3.3', title: '3.3 Metode Pengumpulan Data', level: 2 },
  { id: '3.4', title: '3.4 Metode Analisis Data', level: 2 },
  { id: 'bab4', title: 'BAB IV: HASIL DAN PEMBAHASAN', level: 1 },
  { id: '4.1', title: '4.1 Hasil Penelitian', level: 2 },
  { id: '4.2', title: '4.2 Pembahasan', level: 2 },
  { id: 'bab5', title: 'BAB V: PENUTUP', level: 1 },
  { id: '5.1', title: '5.1 Kesimpulan', level: 2 },
  { id: '5.2', title: '5.2 Saran', level: 2 },
  { id: 'bibliography', title: 'Daftar Pustaka', level: 1 },
  { id: 'appendices', title: 'Lampiran', level: 1 },
];

export const DEFAULT_PROJECT: Omit<Project, 'id' | 'sections'> = {
  title: '',
  authorName: '',
  studentId: '',
  university: '',
  faculty: '',
  studyProgram: '',
  year: new Date().getFullYear(),
  educationLevel: EducationLevel.S1,
  stats: {
    completionPercentage: 0,
    totalWords: 0,
    avgAIDetectionScore: 0,
  },
};
