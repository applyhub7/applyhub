import type { Job } from "../types";

type Props = {
  jobs: Job[];
  onSelect?: (job: Job) => void;
  selectedJobId?: string | null;
  getJobCount?: (jobId: string) => number;
  appliedJobIds?: Set<string>;
  title?: string;
  subtitle?: string;
};

export function JobList({
  jobs,
  onSelect,
  selectedJobId,
  getJobCount,
  appliedJobIds,
  title = "Jobs",
  subtitle = "Fresh roles on ApplyHub.",
}: Props) {
  const showHeader = Boolean(title || subtitle);

  return (
    <section className="card panel-inner">
      {showHeader ? (
        <div className="section-head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="stack">
        {jobs.length === 0 ? (
          <div className="status-item muted">No jobs posted yet.</div>
        ) : (
          jobs.map((job) => (
            <article
              key={job.id}
              className={`job-card status-item ${onSelect ? "job-card-clickable" : ""}`}
              onClick={onSelect ? () => onSelect(job) : undefined}
              role={onSelect ? "button" : undefined}
              aria-selected={selectedJobId === job.id}
              tabIndex={onSelect ? 0 : undefined}
              >
              <div className="job-top">
                <strong>{job.title}</strong>
                <div className="job-top-meta">
                  {appliedJobIds?.has(job.id) ? <span className="job-status-chip">Applied</span> : null}
                  {getJobCount ? <span className="badge">{getJobCount(job.id)} CVs</span> : null}
                </div>
              </div>
              <div className="meta">{job.location}</div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
