
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Project, EducationLevel } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

const Dashboard: React.FC = () => {
  const { project, setProject } = useContext(AppContext);
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'sections' | 'stats'>>({
    title: '',
    authorName: '',
    studentId: '',
    university: '',
    faculty: '',
    studyProgram: '',
    year: new Date().getFullYear(),
    educationLevel: EducationLevel.S1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setProject) {
      setProject(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">AIScholar</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Your Intelligent Academic Writing Assistant</p>
        </header>

        <Card>
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100 border-b pb-3">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <Input label="Judul" name="title" value={formData.title} onChange={handleChange} required />
                <Input label="Nama Penulis" name="authorName" value={formData.authorName} onChange={handleChange} required />
                <Input label="NIM" name="studentId" value={formData.studentId} onChange={handleChange} required />
                <Select label="Jenjang Pendidikan" name="educationLevel" value={formData.educationLevel} onChange={handleChange}>
                  <option value={EducationLevel.S1}>S1 (Skripsi)</option>
                  <option value={EducationLevel.S2}>S2 (Tesis)</option>
                  <option value={EducationLevel.S3}>S3 (Disertasi)</option>
                </Select>
              </div>
              {/* Right Column */}
              <div>
                <Input label="Universitas" name="university" value={formData.university} onChange={handleChange} required />
                <Input label="Fakultas" name="faculty" value={formData.faculty} onChange={handleChange} required />
                <Input label="Program Studi" name="studyProgram" value={formData.studyProgram} onChange={handleChange} required />
                <Input label="Tahun" name="year" type="number" value={formData.year} onChange={handleChange} required />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button type="submit" variant="primary">
                <i className="fas fa-rocket mr-2"></i> Mulai Buat Draf
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

// Helper Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
    />
  </div>
);

// Helper Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}
const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
    >
      {children}
    </select>
  </div>
);

export default Dashboard;
