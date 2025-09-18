
export enum EducationLevel {
  S1 = 'S1', // Bachelor
  S2 = 'S2', // Master
  S3 = 'S3', // Doctorate
}

export enum Status {
  PENDING = 'Menunggu',
  GENERATING = 'Sedang Dibuat',
  DONE = 'Selesai',
  OUTDATED = 'Usang',
}

export interface DocumentSection {
  id: string;
  title: string;
  level: number;
  content: string;
  status: Status;
  groundingChunks?: any[];
  aiDetectionScore?: number;
}

export interface ProjectStats {
  completionPercentage: number;
  totalWords: number;
  avgAIDetectionScore: number;
}

export interface Project {
  id: string;
  title: string;
  authorName: string;
  studentId: string; // NIM
  university: string;
  faculty: string;
  studyProgram: string;
  year: number;
  educationLevel: EducationLevel;
  sections: DocumentSection[];
  stats: ProjectStats;
}

export enum AppState {
  DASHBOARD,
  EDITOR,
}

export type ModalType = 'statistics' | 'proofread' | 'paraphrase' | 'revisions' | 'auth';
