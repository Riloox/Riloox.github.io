export type SectionId = 'identity' | 'hostkind' | 'experience' | 'projects' | 'skills' | 'education' | 'github' | 'contact';

export interface Section {
  id: SectionId;
  index: string;
  title: string;
}

export const SECTIONS: Section[] = [
  { id: 'identity', index: '01', title: 'Identity' },
  { id: 'hostkind', index: '02', title: 'Featured project' },
  { id: 'experience', index: '03', title: 'Experience' },
  { id: 'projects', index: '04', title: 'Projects' },
  { id: 'skills', index: '05', title: 'Skills' },
  { id: 'education', index: '06', title: 'Education & certs' },
  { id: 'github', index: '07', title: 'GitHub / OS' },
  { id: 'contact', index: '08', title: 'Contact' },
];

export const isSectionId = (value: string | null): value is SectionId =>
  value !== null && SECTIONS.some(section => section.id === value);
