export type LanguageKey = 'en' | 'es';

export const cvFiles: Record<LanguageKey, string> = {
  en: `${import.meta.env.BASE_URL}cv.pdf`,
  es: `${import.meta.env.BASE_URL}cv-es.pdf`,
};

/* ------------------------------------------------------------------ */
/* UI strings                                                          */
/* ------------------------------------------------------------------ */

export const ui: Record<
  LanguageKey,
  {
    nav: { work: string; experience: string; skills: string; contact: string };
    available: string;
    scrollHint: string;
    sections: {
      work: string;
      workSub: string;
      experience: string;
      skills: string;
      education: string;
      contact: string;
    };
    featured: string;
    liveDemo: string;
    downloadPage: string;
    sourceCode: string;
    privateRepo: string;
    watchDemo: string;
    moreGithub: string;
    moreGithubSub: string;
    viewAllGithub: string;
    copyEmail: string;
    copied: string;
    downloadCv: string;
    emailMe: string;
    seeHostkind: string;
    letsTalk: string;
    footerNote: string;
    updatedRepo: string;
  }
> = {
  en: {
    nav: { work: 'Work', experience: 'Experience', skills: 'Skills', contact: 'Contact' },
    available: 'Open to remote work',
    scrollHint: 'scroll',
    sections: {
      work: 'Selected work',
      workSub: 'Live projects with real users and test coverage.',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education & certs',
      contact: 'Contact',
    },
    featured: 'Featured project',
    liveDemo: 'Live demo',
    downloadPage: 'Download page',
    sourceCode: 'Source code',
    privateRepo: 'Private repo — built for UTEC',
    watchDemo: 'Watch demo',
    moreGithub: 'More on GitHub',
    moreGithubSub: 'Smaller experiments and utilities.',
    viewAllGithub: 'All repositories',
    copyEmail: 'Copy email',
    copied: 'Copied!',
    downloadCv: 'Download CV',
    emailMe: 'Email me',
    seeHostkind: 'See Hostkind live',
    letsTalk: "Let's talk",
    footerNote: 'React · TypeScript · Vite',
    updatedRepo: 'updated',
  },
  es: {
    nav: { work: 'Proyectos', experience: 'Experiencia', skills: 'Skills', contact: 'Contacto' },
    available: 'Abierto a trabajo remoto',
    scrollHint: 'scroll',
    sections: {
      work: 'Proyectos destacados',
      workSub: 'Proyectos en producción, con tests y usuarios reales.',
      experience: 'Experiencia',
      skills: 'Skills',
      education: 'Educación y certificaciones',
      contact: 'Contacto',
    },
    featured: 'Proyecto destacado',
    liveDemo: 'Demo en vivo',
    downloadPage: 'Página de descarga',
    sourceCode: 'Código fuente',
    privateRepo: 'Repo privado — desarrollado para UTEC',
    watchDemo: 'Ver demo',
    moreGithub: 'Más en GitHub',
    moreGithubSub: 'Experimentos y utilidades más chicas.',
    viewAllGithub: 'Todos los repositorios',
    copyEmail: 'Copiar correo',
    copied: '¡Copiado!',
    downloadCv: 'Descargar CV',
    emailMe: 'Escribime',
    seeHostkind: 'Ver Hostkind en vivo',
    letsTalk: 'Hablemos',
    footerNote: 'React · TypeScript · Vite',
    updatedRepo: 'actualizado',
  },
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const heroContent: Record<
  LanguageKey,
  {
    kicker: string;
    firstName: string;
    lastName: string;
    summary: string;
    marquee: string[];
  }
> = {
  en: {
    kicker: 'Backend engineer — Montevideo, Uruguay · GMT-3',
    firstName: 'Federico',
    lastName: 'Prunell',
      summary:
        'Backend engineer with experience as a Software Development Analyst at Bantotal, writing Java services for core banking. Triaged and resolved 50+ incidents. After hours I ship Hostkind: an open-source, self-hosted control plane for game servers and long-running processes.',
    marquee: [
      'Java',
      'TypeScript',
      'React',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Python',
      'SQL',
      'AWS',
      'GCP',
      'Docker',
      'Drizzle ORM',
    ],
  },
  es: {
    kicker: 'Ingeniero backend — Montevideo, Uruguay · GMT-3',
    firstName: 'Federico',
    lastName: 'Prunell',
      summary:
        'Ingeniero backend con experiencia como Analista de Desarrollo de Software en Bantotal, escribiendo servicios Java para core bancario. Atendí y resolví más de 50 incidentes. Fuera de hora desarrollo Hostkind: un panel de control open source y autoalojado para servidores de juegos y procesos de larga duración. Inglés C2, listo para remoto.',
    marquee: [
      'Java',
      'TypeScript',
      'React',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Python',
      'SQL',
      'AWS',
      'GCP',
      'Docker',
      'Drizzle ORM',
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export interface ProjectLink {
  repo?: string;
  demo?: string;
  video?: string;
  download?: string;
}

export interface FeaturedProject {
  name: string;
  tagline: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
  features: string[];
  stack: string[];
  links: ProjectLink;
}

export const hostkind: Record<LanguageKey, FeaturedProject> = {
  en: {
    name: 'Hostkind',
    tagline: 'Every server. One self-hosted control plane.',
    description:
      'An open-source control plane for game servers and long-running processes. It combines process supervision, live WebSocket consoles, health metrics, file operations, backups, schedules, users, roles, and an audit trail in one local application.',
    stats: [
      { value: '1', label: 'Node.js process' },
      { value: '3', label: 'desktop platforms' },
      { value: '0', label: 'cloud accounts required' },
      { value: 'AGPL', label: 'open-source edition' },
    ],
    features: [
      'Start, stop, restart, and monitor multiple servers from one deck',
      'Stream live consoles and send commands over WebSocket',
      'Schedule backups and maintenance with restore and retention workflows',
      'Local users, roles, audit logging, and crash-recovery state in SQLite',
    ],
    stack: ['Node.js 22', 'React', 'Express', 'WebSocket', 'SQLite', 'Electron', 'Vite'],
    links: {
      demo: 'https://hostkind.site/',
      repo: 'https://github.com/Riloox/hostkind-open',
    },
  },
  es: {
    name: 'Hostkind',
    tagline: 'Todos tus servidores. Un solo panel autoalojado.',
    description:
      'Un panel de control open source para servidores de juegos y procesos de larga duración. Reúne supervisión de procesos, consolas en vivo por WebSocket, métricas, archivos, backups, tareas programadas, usuarios, roles y auditoría en una aplicación local.',
    stats: [
      { value: '1', label: 'proceso Node.js' },
      { value: '3', label: 'plataformas de escritorio' },
      { value: '0', label: 'cuentas cloud requeridas' },
      { value: 'AGPL', label: 'edición open source' },
    ],
    features: [
      'Iniciar, detener, reiniciar y monitorear varios servidores desde un solo panel',
      'Transmitir consolas en vivo y enviar comandos por WebSocket',
      'Programar backups y mantenimiento con restauración y políticas de retención',
      'Usuarios locales, roles, auditoría y recuperación de operaciones con SQLite',
    ],
    stack: ['Node.js 22', 'React', 'Express', 'WebSocket', 'SQLite', 'Electron', 'Vite'],
    links: {
      demo: 'https://hostkind.site/',
      repo: 'https://github.com/Riloox/hostkind-open',
    },
  },
};

export interface Project {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  links?: ProjectLink;
  privateRepo?: boolean;
}

export const projects: Record<LanguageKey, Project[]> = {
  en: [
    {
      name: 'Cleta',
      tagline: 'Campus bike-sharing platform',
      description:
        'Capstone project: a free bicycle-lending system for the UTEC Fray Bentos campus — mobile app, web admin panel, and a backend integrating Allegion smart locks over BLE. Built by a team of three over 16 weeks of Scrum.',
      highlights: [
        'Owned backend architecture, API design, PostgreSQL schema, and security',
        'Google OAuth 2.0 + revocable JWTs, RBAC with ownership checks',
        'Encryption at rest & in transit, audit logging, CI/CD on Google Cloud',
      ],
      stack: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'GCP', 'Docker'],
      links: { video: 'https://www.youtube.com/watch?v=lo06qph9CIk' },
      privateRepo: true,
    },
    {
      name: 'Freecam',
      tagline: 'Hytale server mod · 3,900+ downloads',
      description:
        'A small server-side Java mod that lets Hytale players detach the camera from their character, adjust movement speed, and return safely to their original state and position.',
      highlights: [
        '3,900+ verified downloads on CurseForge',
        'Preserves player state and blocks world interaction while active',
        'Shipped publicly with user feedback, fixes, and versioned releases',
      ],
      stack: ['Java', 'Hytale Server API', 'Maven'],
      links: {
        repo: 'https://github.com/Riloox/freecam',
        download: 'https://www.curseforge.com/hytale/mods/freecam',
      },
    },
  ],
  es: [
    {
      name: 'Cleta',
      tagline: 'Plataforma de bicicletas compartidas',
      description:
        'Proyecto final de grado: un sistema gratuito de préstamo de bicicletas para el campus de UTEC Fray Bentos — app móvil, panel web de administración y un backend que integra candados inteligentes Allegion por BLE. Construido por un equipo de tres en 16 semanas de Scrum.',
      highlights: [
        'Responsable de la arquitectura backend, diseño de API, esquema PostgreSQL y seguridad',
        'Google OAuth 2.0 + JWTs revocables, RBAC con chequeos de propiedad',
        'Cifrado en reposo y en tránsito, audit logging, CI/CD en Google Cloud',
      ],
      stack: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'GCP', 'Docker'],
      links: { video: 'https://www.youtube.com/watch?v=lo06qph9CIk' },
      privateRepo: true,
    },
    {
      name: 'Freecam',
      tagline: 'Mod de servidor para Hytale · 3.900+ descargas',
      description:
        'Un pequeño mod server-side en Java que permite separar la cámara del personaje en Hytale, ajustar la velocidad y volver de forma segura al estado y posición originales.',
      highlights: [
        'Más de 3.900 descargas verificadas en CurseForge',
        'Preserva el estado del jugador y bloquea la interacción con el mundo mientras está activo',
        'Publicado con feedback de usuarios, correcciones y releases versionadas',
      ],
      stack: ['Java', 'Hytale Server API', 'Maven'],
      links: {
        repo: 'https://github.com/Riloox/freecam',
        download: 'https://www.curseforge.com/hytale/mods/freecam',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

export const experience: Record<
  LanguageKey,
  Array<{
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }>
> = {
  en: [
    {
      company: 'Bantotal',
      role: 'Software Development Analyst',
      duration: 'Apr 2025 — Aug 2026 · Montevideo, Uruguay',
      highlights: [
        'Triaged and resolved 50+ incidents across dev environments, improving system reliability and logging practices.',
        'Picked for the company’s newest project by supervisors at under one year in the role.',
      ],
    },
  ],
  es: [
    {
      company: 'Bantotal',
      role: 'Analista de Desarrollo de Software',
      duration: 'Abr 2025 — Ago 2026 · Montevideo, Uruguay',
      highlights: [
        'Atención y resolución de más de 50 incidentes en entornos de desarrollo mediante triage, mejorando la confiabilidad del sistema y las prácticas de logging.',
        'Elegido por mis supervisores para el proyecto más nuevo de la empresa con menos de un año en el rol.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export const skills: Record<
  LanguageKey,
  {
    groups: Array<{ group: string; items: string[] }>;
  }
> = {
  en: {
    groups: [
      { group: 'Languages', items: ['Java', 'TypeScript', 'Python', 'SQL', 'JavaScript'] },
      { group: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'Drizzle ORM', 'Event-driven', 'Concurrency'] },
      { group: 'Frontend', items: ['React', 'React Native', 'Vite', 'Tailwind'] },
      { group: 'Cloud & DevOps', items: ['AWS', 'GCP', 'Docker', 'CI/CD', 'Linux', 'Git'] },
      { group: 'Data', items: ['PostgreSQL', 'Oracle SQL', 'Supabase', 'SQLite'] },
      { group: 'Quality', items: ['JUnit', 'PyTest', 'Integration tests', 'Code reviews', 'Security audits'] },
    ],
  },
  es: {
    groups: [
      { group: 'Lenguajes', items: ['Java', 'TypeScript', 'Python', 'SQL', 'JavaScript'] },
      { group: 'Backend', items: ['Node.js', 'Express', 'APIs REST', 'Drizzle ORM', 'Event-driven', 'Concurrencia'] },
      { group: 'Frontend', items: ['React', 'React Native', 'Vite', 'Tailwind'] },
      { group: 'Cloud y DevOps', items: ['AWS', 'GCP', 'Docker', 'CI/CD', 'Linux', 'Git'] },
      { group: 'Datos', items: ['PostgreSQL', 'Oracle SQL', 'Supabase', 'SQLite'] },
      { group: 'Calidad', items: ['JUnit', 'PyTest', 'Tests de integración', 'Code reviews', 'Auditorías de seguridad'] },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Education & certifications                                          */
/* ------------------------------------------------------------------ */

export const education: Record<
  LanguageKey,
  Array<{
    school: string;
    degree: string;
    duration: string;
  }>
> = {
  en: [
    {
      school: 'Technological University of Uruguay (UTEC)',
      degree: 'B.Sc. in Information Technology',
      duration: 'Graduated 2025 · Montevideo, Uruguay',
    },
    {
      school: 'Karelia University of Applied Sciences',
      degree: 'Exchange Program · Information Technology',
      duration: 'Aug 2023 — Dec 2023 · Joensuu, Finland',
    },
  ],
  es: [
    {
      school: 'Universidad Tecnológica del Uruguay (UTEC)',
      degree: 'Licenciatura en Tecnologías de la Información',
      duration: 'Graduado 2025 · Montevideo, Uruguay',
    },
    {
      school: 'Karelia University of Applied Sciences',
      degree: 'Programa de Intercambio · Tecnologías de la Información',
      duration: 'Ago 2023 — Dic 2023 · Joensuu, Finlandia',
    },
  ],
};

export const certifications: Record<
  LanguageKey,
  {
    certLabel: string;
    langLabel: string;
    certs: string[];
    languages: Array<{ name: string; level: string }>;
  }
> = {
  en: {
    certLabel: 'Certifications',
    langLabel: 'Languages',
    certs: [
      'AWS Academy Cloud Foundations',
      'Google Cloud Computing',
      'Google Cloud Cybersecurity',
      'Kaggle: Machine Learning',
    ],
    languages: [
      { name: 'English', level: 'C2' },
      { name: 'Spanish', level: 'Native' },
    ],
  },
  es: {
    certLabel: 'Certificaciones',
    langLabel: 'Idiomas',
    certs: [
      'AWS Academy Cloud Foundations',
      'Google Cloud Computing',
      'Google Cloud Cybersecurity',
      'Kaggle: Machine Learning',
    ],
    languages: [
      { name: 'Inglés', level: 'C2' },
      { name: 'Español', level: 'Nativo' },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const contact: Record<
  LanguageKey,
  {
    email: string;
    blurb: string;
    responseTime: string;
    social: Array<{ label: string; url: string }>;
  }
> = {
  en: {
    email: 'fprunell10@gmail.com',
    blurb:
      'Open to backend / full-stack roles, remote or Montevideo-based.',
    responseTime: 'Usually replies within 24h',
    social: [
      { label: 'GitHub', url: 'https://github.com/Riloox' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/federico-prunell-36b684207' },
      { label: 'Codewars', url: 'https://www.codewars.com/users/Riloox' },
    ],
  },
  es: {
    email: 'fprunell10@gmail.com',
    blurb:
      'Abierto a roles backend / full-stack, remoto o desde Montevideo.',
    responseTime: 'Normalmente respondo en 24h',
    social: [
      { label: 'GitHub', url: 'https://github.com/Riloox' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/federico-prunell-36b684207' },
      { label: 'Codewars', url: 'https://www.codewars.com/users/Riloox' },
    ],
  },
};
