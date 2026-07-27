type Props = {
  jobForm: {
    title: string;
    location: string;
    description: string;
  };
  setJobForm: (value: Props["jobForm"]) => void;
  onCreate: () => void;
};

export function RecruiterJobs({ jobForm, setJobForm, onCreate }: Props) {
  return (
    <section className="card panel-inner">
      <div className="section-head">
        <div>
          <h2>Post a job</h2>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>Job title</label>
          <input placeholder="Frontend Engineer" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
        </div>
        <div className="field">
          <label>Location</label>
          <input placeholder="Ho Chi Minh City" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            placeholder="Summarize responsibilities, required stack, and what success looks like."
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
          />
        </div>
        <div className="button-row">
          <button onClick={onCreate}>Publish job</button>
        </div>
      </div>
    </section>
  );
}
