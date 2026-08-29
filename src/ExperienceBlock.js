import './App.css';

export default function ExperienceBlock({ job }) {
  return (
    <div className="job">
      <div className="job-title">
        {job.title} <span className="muted">at</span> {job.company}{' '}
        <span className="muted">{job.when}</span>
      </div>
      <div className="job-grid">
        <div className="label">Projects</div>
        <div className="value">
          <strong>{job.project}</strong>
          {job.projectDesc}
        </div>

        <div className="label">Languages/Tools</div>
        <div className="value">{job.tools}</div>

        <div className="label">Tasks</div>
        <div className="value">
          <ol>
            {job.tasks.map((task, i) => (
              <li key={i}>
                <strong>{task.lead}</strong> {task.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
