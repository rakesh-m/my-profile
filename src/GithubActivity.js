import { useEffect, useState } from 'react';
import './App.css';

// Turns "2026-08-20T10:15:00Z" into a short relative label like "3 days ago".
function relativeTime(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return 'just now';
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hr ago`;
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`;
  const yr = Math.round(mo / 12);
  return `${yr} year${yr === 1 ? '' : 's'} ago`;
}

// Builds a readable summary for a GitHub public event.
function describeEvent(ev) {
  const p = ev.payload || {};
  switch (ev.type) {
    case 'PushEvent': {
      const n = (p.commits && p.commits.length) || p.size || 0;
      return `Pushed ${n} commit${n === 1 ? '' : 's'} to`;
    }
    case 'CreateEvent':
      return `Created ${p.ref_type || 'a repository'} in`;
    case 'PullRequestEvent':
      return `${p.action === 'closed' ? 'Closed' : 'Opened'} a pull request in`;
    case 'IssuesEvent':
      return `${p.action === 'closed' ? 'Closed' : 'Opened'} an issue in`;
    case 'IssueCommentEvent':
      return 'Commented on an issue in';
    case 'WatchEvent':
      return 'Starred';
    case 'ForkEvent':
      return 'Forked';
    case 'ReleaseEvent':
      return 'Published a release in';
    default:
      return `${ev.type.replace(/Event$/, '')} in`;
  }
}

export default function GithubActivity({ username }) {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return undefined;
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(
            username
          )}/events/public?per_page=30`,
          { headers: { Accept: 'application/vnd.github+json' } }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data = await res.json();
        if (active) setEvents(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch (e) {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [username]);

  const profileUrl = `https://github.com/${username}`;

  return (
    <section>
      <h2>GitHub Activity</h2>

      <a
        className="gh-profile-link"
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        @{username}
      </a>

      <div className="gh-graph">
        <img
          src={`https://ghchart.rshah.org/409ba5/${encodeURIComponent(
            username
          )}`}
          alt={`${username} GitHub contribution graph`}
          loading="lazy"
        />
      </div>

      <h3 className="gh-recent-heading">Recent public activity</h3>
      {error && (
        <p className="gh-note">
          Couldn't load recent activity right now.{' '}
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
          .
        </p>
      )}
      {!error && !events && <p className="gh-note">Loading activity…</p>}
      {!error && events && events.length === 0 && (
        <p className="gh-note">No recent public activity.</p>
      )}
      {!error && events && events.length > 0 && (
        <ul className="gh-events">
          {events.map((ev) => (
            <li key={ev.id}>
              <span className="gh-action">{describeEvent(ev)}</span>{' '}
              {ev.repo && (
                <a
                  href={`https://github.com/${ev.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gh-repo"
                >
                  {ev.repo.name}
                </a>
              )}
              <span className="gh-when"> · {relativeTime(ev.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
