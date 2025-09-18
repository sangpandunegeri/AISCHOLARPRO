import jsPDF from 'jspdf';
import htmlToDocx from 'html-to-docx';
import saveAs from 'file-saver';
import { Project } from '../types';

// Helper to sanitize filenames
const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9_-\s]/gi, '_').replace(/[\s]/g, '_');
};

/**
 * Exports the project content to a PDF file.
 * @param project The project data to export.
 */
export const exportToPdf = async (project: Project): Promise<void> => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const addText = (text: string, size: number, isBold: boolean = false) => {
    if (cursorY > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, usableWidth);
    doc.text(lines, margin, cursorY);
    cursorY += (lines.length * size * 0.35) + 5; // Approximate line height
  };

  // Title Page
  addText(project.title, 22, true);
  cursorY += 10;
  addText(`By: ${project.authorName}`, 14);
  addText(`NIM: ${project.studentId}`, 12);
  addText(`${project.studyProgram}, ${project.faculty}`, 12);
  addText(`${project.university}`, 12);
  addText(`${project.year}`, 12);
  doc.addPage();
  cursorY = margin;
  
  // Document Content
  project.sections.forEach(section => {
    if (section.level === 1) { // Add page break before major chapters
        if (cursorY > margin * 2) { // Avoid adding a blank page at the very beginning
           doc.addPage();
           cursorY = margin;
        }
    }
    addText(section.title, section.level === 1 ? 16 : 14, true);
    // Remove markdown for PDF export, treat as plain text
    const plainContent = section.content.replace(/(\*|_|`)/g, '');
    addText(plainContent, 12);
    cursorY += 10;
  });

  doc.save(`${sanitizeFilename(project.title)}.pdf`);
};

/**
 * Exports the project content to a DOCX file.
 * @param project The project data to export.
 */
export const exportToDocx = async (project: Project): Promise<void> => {
    // Basic Markdown to HTML conversion
    const markdownToHtml = (text: string) => {
        return text
            .replace(/\n/g, '<br />')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italic
    };

    let htmlString = `
        <div style="font-family: Times New Roman, serif; font-size: 12pt;">
            <h1 style="text-align: center;">${project.title}</h1>
            <p style="text-align: center;">By: ${project.authorName}</p>
            <p style="text-align: center;">NIM: ${project.studentId}</p>
            <p style="text-align: center;">${project.studyProgram}, ${project.faculty}</p>
            <p style="text-align: center;">${project.university}</p>
            <p style="text-align: center;">${project.year}</p>
            <br page-break-before="always" />
    `;

    project.sections.forEach(section => {
        const headingLevel = Math.min(section.level + 1, 6); // h2 for level 1, h3 for level 2, etc.
        htmlString += `<h${headingLevel}>${section.title}</h${headingLevel}>`;
        htmlString += `<p>${markdownToHtml(section.content)}</p>`;
    });

    htmlString += '</div>';

    const fileBuffer = await htmlToDocx(htmlString, undefined, {
        orientation: 'portrait',
        margins: {
            top: 720, // 0.5 inch
            bottom: 720,
            left: 720,
            right: 720,
        }
    });

    saveAs(fileBuffer as Blob, `${sanitizeFilename(project.title)}.docx`);
};