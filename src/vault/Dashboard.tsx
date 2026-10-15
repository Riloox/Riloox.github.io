/* The terminal's home screen: every file at a glance, laid out like a wall
   of status panels. Each panel opens the full file on the same glass. */

import type { MouseEvent, ReactNode } from 'react';
import { certifications, contact, cvFiles, education, experience, heroContent, hostkind, projects, skills } from '../data/profile';
import type { GithubRepo } from '../hooks/useGithubProjects';
import { SECTIONS, type SectionId } from './sections';

const h = heroContent.en;
const featured = hostkind.en;
const job = experience.en[0];
const [cleta, freecam] = projects.en;
const me = contact.en;
const cert = certifications.en;
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];

interface PanelProps {
  id: SectionId;
  label?: string;
  className?: string;
  onOpen: (id: SectionId) => void;
  children: ReactNode;
}

/** Clicking anywhere on a panel opens it, except on its own links and buttons. */
function Panel({ id, label, className = '', onOpen, children }: PanelProps) {
  const section = SECTIONS.find(item => item.id === id)!;
  const onClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    onOpen(id);
  };
  return (
    <section className={`t-panel ${className}`} onClick={onClick} aria-labelledby={`t-${id}`}>
      <header className="t-panel-head">
        <button id={`t-${id}`} type="button" onClick={() => onOpen(id)}>
          <span className="t-caret" aria-hidden="true">&gt;</span>
          {label ?? section.title}
        </button>
        <i aria-hidden="true">{section.index}</i>
      </header>
      <div className="t-panel-body">{children}</div>
    </section>
  );
}

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="t-btn" href={href} target="_blank" rel="noreferrer">
    {children} <span aria-hidden="true">&gt;</span>
  </a>
);

const HOSTKIND_ROWS: Array<[string, string, string]> = [
  ['survival-01', 'RUNNING', '2.1 GB'],
  ['creative-hub', 'RUNNING', '1.4 GB'],
  ['modpack-test', 'STOPPED', '—'],
  ['nightly-backup', 'QUEUED', '03:00'],
];

export function Dashboard({
  onOpen,
  repos,
  loading,
}: {
  onOpen: (id: SectionId) => void;
  repos: GithubRepo[];
  loading: boolean;
}) {
  return (
    <div className="t-dash">
      <div className="t-col t-col-a">
        <Panel id="identity" onOpen={onOpen} className="t-identity">
          <p className="t-kicker">{h.kicker}</p>
          <h1 className="t-name">
            <span>{h.firstName}</span>
            <span>{h.lastName}</span>
          </h1>
          <p className="t-copy t-clamp-2">{firstSentence(h.summary)}</p>
          <div className="t-actions">
            <button className="t-btn" type="button" onClick={() => onOpen('identity')}>
              View more <span aria-hidden="true">&gt;</span>
            </button>
            <a className="t-btn" href={cvFiles.en} download>
              Download CV <span aria-hidden="true">&gt;</span>
            </a>
          </div>
        </Panel>

        <div className="t-row-bottom">
          {/* Sits behind the resident's head in the overview: decoration only. */}
          <div className="t-decor" aria-hidden="true">
            <svg viewBox="0 0 120 60" preserveAspectRatio="none">
              <path d="M0 30 Q 10 6 20 30 T 40 30 T 60 30 T 80 30 T 100 30 T 120 30" />
            </svg>
            <p>SIG 0.98</p>
            <p>LOAD 0.12</p>
            <p>TEMP 41°C</p>
          </div>
          <Panel id="experience" onOpen={onOpen} className="t-experience">
            <h2 className="t-title">{job.company}</h2>
            <p className="t-sub">{job.role}</p>
            <p className="t-meta">{job.duration.split(' · ')[0]}</p>
          </Panel>
          <Panel id="projects" onOpen={onOpen} className="t-projects">
            {[
              { project: cleta, href: cleta.links?.video, label: 'Demo' },
              { project: freecam, href: freecam.links?.repo, label: 'GitHub' },
            ].map(({ project, href, label }) => (
              <div className="t-proj" key={project.name}>
                <div className="t-proj-head">
                  <h2 className="t-title">{project.name}</h2>
                  {href && <Ext href={href}>{label}</Ext>}
                </div>
                <p className="t-copy">{project.tagline}</p>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      <div className="t-col t-col-b">
        <Panel id="hostkind" onOpen={onOpen} className="t-featured">
          <div className="t-featured-copy">
            <h2 className="t-title t-title-xl">{featured.name}</h2>
            <p className="t-sub">{featured.tagline}</p>
            <p className="t-copy t-clamp-3">{featured.description}</p>
            <ul className="t-chips">
              {['Open source', 'Self-hosting', ...featured.stack.slice(0, 3)].map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="t-mock" aria-hidden="true">
            <div className="t-mock-bar">
              <i />
              <i />
              <i />
              <span>hostkind · control plane</span>
            </div>
            <table>
              <tbody>
                {HOSTKIND_ROWS.map(([name, state, mem]) => (
                  <tr key={name} data-state={state}>
                    <td>
                      <b />
                      {name}
                    </td>
                    <td>{state}</td>
                    <td>{mem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="t-mock-console">
              <span>&gt; [survival-01] Saved the world (3.2s)</span>
              <span>&gt; backup: snapshot 14 kept, 2 pruned</span>
            </div>
          </div>
          <div className="t-actions t-featured-actions">
            {featured.links.demo && <Ext href={featured.links.demo}>View project</Ext>}
            {featured.links.repo && <Ext href={featured.links.repo}>Source</Ext>}
          </div>
        </Panel>

        <div className="t-row-split">
          <Panel id="skills" onOpen={onOpen} className="t-skills">
            <div className="t-skill-grid">
              {skills.en.groups
                .filter(group => ['Languages', 'Backend', 'Cloud & DevOps', 'Data'].includes(group.group))
                .map(group => (
                  <div key={group.group}>
                    <h3>{group.group}</h3>
                    <ul>
                      {group.items.slice(0, 3).map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </Panel>
          <Panel id="education" onOpen={onOpen} className="t-education">
            {education.en.slice(0, 1).map(entry => (
              <div key={entry.school}>
                <h2 className="t-title t-title-sm">{entry.school}</h2>
                <p className="t-meta">{entry.degree}</p>
              </div>
            ))}
            <h3 className="t-label">{cert.certLabel}:</h3>
            <ul className="t-list">
              {cert.certs.slice(0, 3).map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="t-col t-col-c">
        <Panel id="github" onOpen={onOpen} className="t-github">
          {loading && !repos.length ? (
            <ul className="t-repos" aria-busy="true">
              {[0, 1, 2, 3, 4].map(i => (
                <li className="t-skeleton" key={i}>
                  <span />
                  <span />
                </li>
              ))}
            </ul>
          ) : repos.length ? (
            <ul className="t-repos">
              {repos.slice(0, 5).map(repo => (
                <li key={repo.id}>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    <b>{repo.name}</b>
                    <span>{repo.description || 'No description'}</span>
                    <i aria-hidden="true">↗</i>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-copy">Feed offline. Full archive at github.com/Riloox.</p>
          )}
        </Panel>

        <Panel id="contact" onOpen={onOpen} className="t-contact">
          <p className="t-copy">{me.blurb}</p>
          <ul className="t-contact-list">
            <li>
              <span aria-hidden="true">✉</span>
              <a href={`mailto:${me.email}`}>{me.email}</a>
            </li>
            <li>
              <span aria-hidden="true">⌖</span>
              Montevideo, Uruguay
            </li>
          </ul>
          <a className="t-btn t-btn-wide" href={`mailto:${me.email}`}>
            Let's build together <span aria-hidden="true">&gt;</span>
          </a>
        </Panel>
      </div>
    </div>
  );
}
