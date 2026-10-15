/* Full, readable versions of each hologram. The canvas paints the preview seen
   from across the room; this is what you get once you zoom in. */

import { useState } from 'react';
import { certifications, contact, education, experience, heroContent, hostkind, projects, skills, ui } from '../data/profile';
import type { GithubRepo } from '../hooks/useGithubProjects';
import type { SectionId } from './sections';

const GITHUB = 'Riloox';
const copy = ui.en;
const h = heroContent.en;
const featured = hostkind.en;
const exp = experience.en[0];
const [cleta, freecam] = projects.en;
const me = contact.en;
const cert = certifications.en;

const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="v-eyebrow">{children}</p>;

const Chips = ({ items }: { items: string[] }) => (
  <ul className="v-chips">
    {items.map(item => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

function EmailButton() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(me.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${me.email}`;
    }
  };
  return (
    <button className="v-email" onClick={copyEmail} type="button">
      {copied ? copy.copied : me.email}
      <span aria-hidden="true">{copied ? '▣' : '⧉'}</span>
    </button>
  );
}

export function SectionBody({ id, repos, loading }: { id: SectionId; repos: GithubRepo[]; loading: boolean }) {
  switch (id) {
    case 'identity':
      return (
        <div className="v-flow">
          <Eyebrow>{h.kicker}</Eyebrow>
          <h2 className="v-display">
            <span>{h.firstName}</span>
            <span>{h.lastName}</span>
          </h2>
          <p className="v-lede">{h.summary}</p>
          <div className="v-rule" />
          <dl className="v-kv">
            <div>
              <dt>Role</dt>
              <dd>AI agent infrastructure · Backend</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>Montevideo, Uruguay · GMT-3</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="v-live">Open to remote work</dd>
            </div>
          </dl>
          <Chips items={h.marquee} />
          <p className="v-note">
            {loading ? 'Indexing termlink…' : `${repos.length} public repositories cached.`}
          </p>
        </div>
      );

    case 'hostkind':
      return (
        <div className="v-flow">
          <Eyebrow>02 / Flagship build · open source</Eyebrow>
          <h2 className="v-display">
            <span>{featured.name}</span>
          </h2>
          <p className="v-lede">{featured.tagline}</p>
          <p className="v-body">{featured.description}</p>
          <ul className="v-stats">
            {featured.stats.map(stat => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
          <ul className="v-list">
            {featured.features.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Chips items={featured.stack} />
          <div className="v-actions">
            <a className="v-btn v-btn-fill" href={featured.links.demo} target="_blank" rel="noreferrer">
              {copy.liveDemo} ↗
            </a>
            <a className="v-btn" href={featured.links.repo} target="_blank" rel="noreferrer">
              {copy.sourceCode} ↗
            </a>
          </div>
        </div>
      );

    case 'experience':
      return (
        <div className="v-flow">
          <Eyebrow>03 / Employment log</Eyebrow>
          <h2 className="v-display">
            <span>{exp.company}</span>
          </h2>
          <p className="v-lede">{exp.role}</p>
          <p className="v-meta">{exp.duration}</p>
          <div className="v-timeline" aria-hidden="true">
            <span className="v-timeline-fill">2025 — 2026</span>
          </div>
          <ul className="v-list">
            {exp.highlights.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case 'projects':
      return (
        <div className="v-flow v-cards">
          {[freecam, cleta].map((project, index) => (
            <article className="v-card" key={project.name}>
              <Eyebrow>{index === 0 ? 'Java mod' : 'UTEC capstone'}</Eyebrow>
              <h3>{project.name}</h3>
              <p className="v-lede">{project.tagline}</p>
              <p className="v-body">{project.description}</p>
              <ul className="v-list">
                {project.highlights.slice(0, 2).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Chips items={project.stack} />
              <div className="v-actions">
                {project.links?.download && (
                  <a className="v-btn v-btn-fill" href={project.links.download} target="_blank" rel="noreferrer">
                    {copy.downloadPage} ↗
                  </a>
                )}
                {project.links?.video && (
                  <a className="v-btn v-btn-fill" href={project.links.video} target="_blank" rel="noreferrer">
                    {copy.watchDemo} ↗
                  </a>
                )}
                {project.links?.repo && (
                  <a className="v-btn" href={project.links.repo} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
                {project.privateRepo && <span className="v-tag">{copy.privateRepo}</span>}
              </div>
            </article>
          ))}
        </div>
      );

    case 'skills':
      return (
        <div className="v-flow">
          <Eyebrow>05 / Capability matrix</Eyebrow>
          <div className="v-skill-grid">
            {skills.en.groups.map((group, index) => (
              <section key={group.group}>
                <h3>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {group.group}
                </h3>
                <ul>
                  {group.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      );

    case 'education':
      return (
        <div className="v-flow">
          <Eyebrow>06 / Academic record</Eyebrow>
          <div className="v-cards">
            {education.en.map(entry => (
              <article className="v-card" key={entry.school}>
                <h3>{entry.school}</h3>
                <p className="v-body">{entry.degree}</p>
                <p className="v-meta">{entry.duration}</p>
              </article>
            ))}
          </div>
          <div className="v-columns">
            <section>
              <h4>{cert.certLabel}</h4>
              <ul className="v-list">
                {cert.certs.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4>{cert.langLabel}</h4>
              <dl className="v-kv v-kv-tight">
                {cert.languages.map(item => (
                  <div key={item.name}>
                    <dt>{item.name}</dt>
                    <dd>{item.level}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      );

    case 'github':
      return (
        <div className="v-flow">
          <Eyebrow>07 / Live feed · {GITHUB.toLowerCase()}</Eyebrow>
          {loading && <p className="v-body">Querying the GitHub API…</p>}
          <ul className="v-repos">
            {repos.map(repo => (
              <li key={repo.id}>
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  <b>{repo.name}</b>
                  <span>{repo.description || 'No description'}</span>
                  <small>
                    {repo.language || 'Code'} · ★ {repo.stargazers_count}
                  </small>
                </a>
              </li>
            ))}
          </ul>
          <div className="v-actions">
            <a className="v-btn v-btn-fill" href={`https://github.com/${GITHUB}`} target="_blank" rel="noreferrer">
              {copy.viewAllGithub} ↗
            </a>
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="v-flow">
          <Eyebrow>08 / Open channel</Eyebrow>
          <h2 className="v-display">
            <span>{"Let's talk"}</span>
          </h2>
          <p className="v-lede">{me.blurb}</p>
          <EmailButton />
          <ul className="v-social">
            {me.social.map(item => (
              <li key={item.label}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <span>{item.label}</span>
                  <em>connect ↗</em>
                </a>
              </li>
            ))}
          </ul>
          <p className="v-note">{me.responseTime}</p>
        </div>
      );

    default:
      return null;
  }
}
