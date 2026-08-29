import './App.css';
import ExperienceBlock from './ExperienceBlock';
import linkedin from './images/linkedin.svg';
import email from './images/email.svg';
import github from './images/github.svg';
import {
  profile,
  summaryLine,
  strengths,
  currentProfile,
  relevantExperience,
  pastWork,
  education,
  personalDetails,
} from './resumeData';

export default function App() {
  return (
    <div className="App">
      <header>
        <div className="name">{profile.name}</div>
        <div className="contact">
          {profile.location} &nbsp;|&nbsp;{' '}
          <a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>
            {profile.phone}
          </a>
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
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>From - To</th>
                <th>Designation</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {pastWork.map((row, i) => (
                <tr key={i}>
                  <td>{row.organization}</td>
                  <td>{row.duration}</td>
                  <td>{row.designation}</td>
                  <td>{row.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Education and Certifications</h2>
          <table>
            <thead>
              <tr>
                <th>Degree</th>
                <th>University / Institution</th>
                <th>Passing year</th>
                <th>Class / Score</th>
              </tr>
            </thead>
            <tbody>
              {education.map((row, i) => (
                <tr key={i}>
                  <td>{row.degree}</td>
                  <td>{row.institution}</td>
                  <td>{row.year}</td>
                  <td>{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Personal Details</h2>
          <div className="details-grid">
            {personalDetails.map((row, i) => (
              <div className="details-row" key={i}>
                <div className="label">{row.label}</div>
                <div className="value">{row.value}</div>
              </div>
            ))}
          </div>
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
        <a
          href={`mailto:${profile.email}`}
          className="email"
          title="Email"
        >
          <img src={email} height="24px" alt="Email" />
        </a>
      </footer>
    </div>
  );
}
