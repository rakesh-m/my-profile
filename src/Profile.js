import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import './App.css';
import { db } from './firebase';
import ExperienceBlock from './ExperienceBlock';
import CollapsibleRows from './CollapsibleRows';
import linkedin from './images/linkedin.svg';
import email from './images/email.svg';
import github from './images/github.svg';
import * as seed from './resumeData';

// Assemble the résumé shape from the local seed module so we always have a
// fallback if the Firestore document has not been created yet.
const seedContent = {
  profile: seed.profile,
  summaryLine: seed.summaryLine,
  strengths: seed.strengths,
  currentProfile: seed.currentProfile,
  relevantExperience: seed.relevantExperience,
  pastWork: seed.pastWork,
  education: seed.education,
};

export default function Profile() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'resume', 'content'));
        if (!active) return;
        setContent(snap.exists() ? snap.data() : seedContent);
      } catch (e) {
        // On any read error, fall back to the local seed so the page still
        // renders for an authenticated user.
        if (active) setContent(seedContent);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading || !content) {
    return <div className="loading">Loading profile…</div>;
  }

  const {
    profile,
    summaryLine,
    strengths,
    currentProfile,
    relevantExperience,
    pastWork,
    education,
  } = content;

  return (
    <div className="App">
      <header>
        <div className="name">{profile.name}</div>
        <div className="contact">
          {profile.location}
          <br />
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
      </header>

      <main>
        <section>
          <h2>1-Line Summary</h2>
          <p className="summary-line">{summaryLine}</p>
        </section>

        <section>
          <h2>Experience and Strengths</h2>
          <ul className="strengths">
            {strengths.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Current Profile</h2>
          <ExperienceBlock job={currentProfile} />
        </section>

        <section>
          <h2>Relevant Past Experience</h2>
          <ExperienceBlock job={relevantExperience} />
        </section>

        <section>
          <h2>Other Past Work Experience Summary</h2>
          <CollapsibleRows
            items={pastWork}
            renderSummary={(row) => `${row.organization} · ${row.duration}`}
            fields={[
              { key: 'designation', label: 'Designation' },
              { key: 'summary', label: 'Summary' },
            ]}
          />
        </section>

        <section>
          <h2>Education and Certifications</h2>
          <CollapsibleRows
            items={education}
            renderSummary={(row) => `${row.degree} · ${row.year}`}
            fields={[
              { key: 'institution', label: 'University / Institution' },
              { key: 'score', label: 'Class / Score' },
            ]}
          />
        </section>
      </main>

      <footer>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={profile.linkedin}
          title="LinkedIn"
        >
          <img src={linkedin} height="24px" alt="LinkedIn" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={profile.github}
          title="GitHub"
        >
          <img src={github} height="24px" alt="GitHub" />
        </a>
        <a href={`mailto:${profile.email}`} className="email" title="Email">
          <img src={email} height="24px" alt="Email" />
        </a>
      </footer>
    </div>
  );
}
