import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Application, Job, User, UserRole } from "./types";
import { api } from "./api/client";
import { AuthForm } from "./components/AuthForm";
import { RecruiterJobs } from "./components/RecruiterJobs";
import { JobList } from "./components/JobList";

function normalizeJob(job: any): Job {
  return {
    id: job.id,
    title: job.title,
    companyId: job.companyId ?? job.company_id ?? "",
    location: job.location,
    description: job.description,
    status: job.status,
  };
}

function normalizeApplication(app: any): Application {
  return {
    id: app.id,
    jobId: app.jobId ?? app.job_id ?? "",
    jobTitle: app.jobTitle ?? app.job_title ?? "",
    candidateName: app.candidateName ?? app.candidate_name ?? "",
    candidateEmail: app.candidateEmail ?? app.candidate_email ?? "",
    candidatePhone: app.candidatePhone ?? app.candidate_phone ?? "",
    resumeFileName: app.resumeFileName ?? app.resume_file_name ?? "",
    resumeObjectKey: app.resumeObjectKey ?? app.resume_object_key ?? "",
    resumeDownloadUrl: app.resumeDownloadUrl ?? app.resume_download_url ?? "",
    status: app.status,
  };
}

function normalizeUser(user: any): User {
  return {
    id: user.id ?? user.sub ?? "",
    email: user.email ?? "",
    name: user.name ?? user.email?.split("@")[0] ?? "",
    role: user.role,
  };
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.pathname;
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedRecruiterJob, setSelectedRecruiterJob] = useState<Job | null>(null);
  const [selectedRecruiterApplications, setSelectedRecruiterApplications] = useState<Application[]>([]);
  const [recruiterJobCounts, setRecruiterJobCounts] = useState<Record<string, number>>({});
  const [previewCvUrl, setPreviewCvUrl] = useState("");
  const [previewCvName, setPreviewCvName] = useState("");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeData: "",
    resumeFileName: "",
  });
  const [authMode, setAuthMode] = useState<"register" | "login">("login");
  const [form, setForm] = useState<{ email: string; password: string; role: UserRole; name: string }>({
    email: "",
    password: "",
    role: "candidate",
    name: "",
  });
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "",
    description: "",
  });

  async function loadJobs() {
    const data = await api.jobs(token);
    setJobs((data.items || []).map(normalizeJob));
  }

  async function loadApplications() {
    if (!token) return;
    const data = await api.myApplications(token);
    setApplications((data.items || []).map(normalizeApplication));
  }

  async function loadRecruiterApplications(jobId?: string) {
    if (!token || !user || user.role !== "recruiter") return;
    const targetJob = jobId ? jobs.find((job) => job.id === jobId && job.companyId === user.id) : selectedRecruiterJob;
    if (!targetJob) {
      setSelectedRecruiterApplications([]);
      return;
    }
    const data = await api.jobApplications(targetJob.id, token);
    setSelectedRecruiterApplications((data.items || []).map(normalizeApplication));
    setRecruiterJobCounts((current) => ({
      ...current,
      [targetJob.id]: (data.items || []).length,
    }));
  }

  async function loadRecruiterJobCounts() {
    if (!token || !user || user.role !== "recruiter") return;
    const counts = await Promise.all(
      myJobs.map(async (job) => {
        const data = await api.jobApplications(job.id, token);
        return [job.id, (data.items || []).length] as const;
      }),
    );
    setRecruiterJobCounts(Object.fromEntries(counts));
  }

  useEffect(() => {
    loadJobs().catch(() => null);
  }, []);

  useEffect(() => {
    if (!token) return;
    api
      .verify(token)
      .then((data) => {
        if (data?.user) setUser(normalizeUser(data.user));
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setToken(null);
        setRefreshToken(null);
        setUser(null);
      });
    loadJobs().catch(() => null);
    loadApplications().catch(() => null);
  }, [token]);

  useEffect(() => {
    const candidateApply = route.match(/^\/candidate\/apply\/([^/]+)$/);
    const candidateJob = route.match(/^\/candidate\/jobs\/([^/]+)$/);
    if (candidateApply || candidateJob) {
      const jobId = (candidateApply || candidateJob)?.[1];
      const job = jobs.find((item) => item.id === jobId);
      if (job) {
        setSelectedJob(job);
        setApplySubmitted(false);
        if (candidateApply) {
          setApplyForm({ fullName: "", email: "", phone: "", resumeData: "", resumeFileName: "" });
        }
      }
    }
  }, [route, jobs]);

  useEffect(() => {
    const match = route.match(/^\/recruiter\/jobs\/([^/]+)$/);
    if (!match) return;
    const job = jobs.find((item) => item.id === match[1] && item.companyId === user?.id);
    if (job) {
      setSelectedRecruiterJob(job);
      loadRecruiterApplications(job.id).catch(() => null);
      setPreviewCvUrl("");
      setPreviewCvName("");
    }
  }, [route, jobs, user]);

  useEffect(() => {
    if (token && user?.role === "recruiter") {
      if (selectedRecruiterJob) {
        loadRecruiterApplications(selectedRecruiterJob.id).catch(() => null);
      } else {
        setSelectedRecruiterApplications([]);
      }
    }
  }, [token, user, jobs, selectedRecruiterJob]);

  useEffect(() => {
    if (token && user?.role === "recruiter" && myJobs.length > 0) {
      loadRecruiterJobCounts().catch(() => null);
    } else {
      setRecruiterJobCounts({});
    }
  }, [token, user, jobs]);

  async function handleAuth(endpoint: "register" | "login") {
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = await api[endpoint](form);
      if (data.user) setUser(normalizeUser(data.user));
      if (data.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (endpoint === "register") {
        setAuthMode("login");
        setForm((current) => ({ ...current, password: "" }));
        setMessage("Account created. Sign in to continue.");
        return;
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function doLogout() {
    if (refreshToken) {
      await api.logout({ refreshToken });
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setApplications([]);
    setSelectedJob(null);
    setSelectedRecruiterJob(null);
    navigate("/");
  }

  async function createJob() {
    if (!user) return;
    await api.createJob(
      {
        ...jobForm,
        companyId: user.id,
        status: "open",
      },
      token,
    );
    setMessage("Job published");
    setJobForm({ title: "", location: "", description: "" });
    await loadJobs();
  }

  async function submitApplication() {
    if (!selectedJob) return;
    if (appliedJobIds.has(selectedJob.id)) {
      setApplySubmitted(true);
      setMessage("Application already submitted");
      return;
    }
    if (!applyForm.fullName.trim() || !applyForm.email.trim() || !applyForm.resumeData.trim() || !applyForm.resumeFileName.trim()) return;

    await api.apply(
      {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        fullName: applyForm.fullName,
        candidateEmail: applyForm.email,
        candidatePhone: applyForm.phone,
        resumeData: applyForm.resumeData,
        resumeFileName: applyForm.resumeFileName,
      },
      token,
    );

    setApplySubmitted(true);
    setMessage("Application submitted");
    setApplyForm({ fullName: "", email: "", phone: "", resumeData: "", resumeFileName: "" });
    await loadApplications();
  }

  const isRecruiter = user?.role === "recruiter";
  const appliedJobIds = useMemo(() => new Set(applications.map((application) => application.jobId)), [applications]);
  const myJobs = jobs.filter((job) => job.companyId === user?.id);
  const recruiterJobCvCount = (jobId: string) => recruiterJobCounts[jobId] ?? 0;
  const candidateJobsRoute = route === "/candidate/jobs" || route.startsWith("/candidate/jobs/");
  const candidateApplyRoute = route.startsWith("/candidate/apply/");
  const recruiterJobsRoute = route.startsWith("/recruiter/jobs/");

  if (token && candidateApplyRoute) {
    return (
      <main className="shell">
        <header className="topbar">
          <div className="brand">
            <strong>ApplyHub</strong>
          </div>
          <button
            className="topbar-action button-secondary"
            onClick={() => {
              setApplySubmitted(false);
              setSelectedJob(null);
              setMessage("");
              navigate("/candidate/jobs");
            }}
          >
            Back to jobs
          </button>
        </header>

        <section className="apply-page">
          <div className="apply-breadcrumb">Jobs / Apply</div>
          <div className="apply-page-card panel-inner card">
            {applySubmitted || (selectedJob ? appliedJobIds.has(selectedJob.id) : false) ? (
              <div className="apply-sent-card">
                <div className="section-head apply-sent-head">
                  <div>
                    <h2>Application submitted</h2>
                    <p>Your CV has been sent.</p>
                  </div>
                </div>
              </div>
            ) : selectedJob ? (
              <>
                <div className="section-head">
                  <div>
                    <h2>Apply for {selectedJob.title}</h2>
                    <p>Fill in your details and upload your CV.</p>
                  </div>
                </div>
                <div className="status-item" style={{ marginBottom: 16 }}>
                  <div className="status-line">
                    <strong>{selectedJob.title}</strong>
                  </div>
                  <div className="meta">{selectedJob.location}</div>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>Full name</label>
                    <input value={applyForm.fullName} onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} placeholder="+84..." />
                  </div>
                  <div className="field">
                    <label>CV upload</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setApplyForm((current) => ({ ...current, resumeData: String(reader.result || ""), resumeFileName: file.name }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    {applyForm.resumeFileName ? <div className="field-hint">Selected file: {applyForm.resumeFileName}</div> : null}
                  </div>
                  <div className="button-row">
                    <button onClick={submitApplication}>Submit application</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="section-head">
                <div>
                  <h2>Apply</h2>
                  <p>Select a job first.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (token && recruiterJobsRoute && isRecruiter) {
    return (
      <main className="shell">
        <header className="topbar">
          <div className="brand">
            <strong>ApplyHub</strong>
          </div>
          <button
            className="topbar-action button-secondary"
            onClick={() => {
              setPreviewCvUrl("");
              setPreviewCvName("");
              setSelectedRecruiterJob(null);
              setSelectedRecruiterApplications([]);
              navigate("/recruiter/jobs");
            }}
          >
            Back to jobs
          </button>
        </header>

        <div className="recruiter-review-layout">
          <section className="card panel-inner recruiter-applicant-panel">
            <div className="section-head">
              <div>
                <h2>Applicants</h2>
                <p>
                  {selectedRecruiterJob
                    ? `${selectedRecruiterJob.title} · ${selectedRecruiterJob.location}`
                    : "Click a job to preview applicants."}
                </p>
              </div>
              <span className="badge">{selectedRecruiterApplications.length} CVs</span>
            </div>

            {selectedRecruiterJob ? (
              <div className="recruiter-applicant-scroll">
                <div className="status-stack">
                  {selectedRecruiterApplications.length === 0 ? (
                    <div className="status-item muted">No applications for this job yet.</div>
                    ) : (
                      selectedRecruiterApplications.map((app) => (
                        <div
                          key={app.id}
                          className={`status-item ${app.resumeDownloadUrl ? "clickable-card" : ""}`}
                          onClick={
                            app.resumeDownloadUrl
                              ? () => {
                                  setPreviewCvUrl(app.resumeDownloadUrl || "");
                                  setPreviewCvName(app.resumeFileName || "CV");
                                }
                              : undefined
                          }
                          role={app.resumeDownloadUrl ? "button" : undefined}
                          tabIndex={app.resumeDownloadUrl ? 0 : undefined}
                        >
                        <div className="status-line">
                          <strong>{app.candidateName}</strong>
                        </div>
                        <div className="meta">{app.candidateEmail}</div>
                        <div className="meta">{app.candidatePhone}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="status-item muted">Select a job first to load applicants.</div>
            )}
          </section>

          <section key={selectedRecruiterJob?.id || "recruiter-cv-empty"} className="card panel-inner recruiter-cv-panel">
            {previewCvUrl ? (
              <div className="cv-viewer-shell">
                <iframe className="cv-frame recruiter" src={previewCvUrl} title={previewCvName || "CV preview"} />
              </div>
            ) : (
              <div className="cv-empty-state">No CV selected yet.</div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>ApplyHub</strong>
        </div>
        {token ? (
          <button className="topbar-action button-secondary" onClick={doLogout}>
            Logout
          </button>
        ) : null}
      </header>

      <div className="layout">
        {token ? (
          <div className="stack">
            {message ? <div className="alert">{message}</div> : null}

            {isRecruiter ? (
              <div className="dashboard-grid">
                <div className="dashboard-col">
                  <RecruiterJobs jobForm={jobForm} setJobForm={setJobForm} onCreate={createJob} />
                </div>
                <div className="dashboard-col">
                  <JobList
                    jobs={myJobs}
                    onSelect={(job) => {
                      setSelectedRecruiterJob(job);
                      loadRecruiterApplications(job.id).catch(() => null);
                      loadRecruiterJobCounts().catch(() => null);
                      navigate(`/recruiter/jobs/${job.id}`);
                    }}
                    selectedJobId={selectedRecruiterJob?.id || null}
                    getJobCount={recruiterJobCvCount}
                    title="My jobs"
                    subtitle="Jobs you have published."
                  />
                </div>
              </div>
            ) : candidateJobsRoute ? (
              <div className="dashboard-grid">
                <div className="dashboard-col">
                  <JobList
                    jobs={jobs}
                    appliedJobIds={appliedJobIds}
                    onSelect={(job) => {
                      setSelectedJob(job);
                      setApplySubmitted(false);
                      navigate(`/candidate/jobs/${job.id}`);
                    }}
                    title="Jobs"
                    subtitle="Browse roles and open details to apply."
                  />
                </div>
                <div className="dashboard-col">
                  {selectedJob ? (
                    <section className="card panel-inner">
                      <div className="section-head">
                        <div>
                          <h2>Job Details</h2>
                          <p>Quick overview before you apply.</p>
                        </div>
                      </div>
                      <div className="status-stack">
                        <div className="status-item">
                          <div className="status-line">
                            <strong>{selectedJob.title}</strong>
                          </div>
                          <div className="meta">{selectedJob.location}</div>
                          <p className="muted" style={{ marginTop: 0, lineHeight: 1.6 }}>
                            {selectedJob.description}
                          </p>
                          <div className="button-row" style={{ marginTop: 16 }}>
                            {appliedJobIds.has(selectedJob.id) ? (
                              <span className="status-action status-applied">Applied</span>
                            ) : (
                              <button
                                className="status-action status-apply"
                                onClick={() => {
                                  setMessage("");
                                  setApplySubmitted(false);
                                  navigate(`/candidate/apply/${selectedJob.id}`);
                                }}
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section className="card panel-inner">
                      <div className="section-head">
                        <div>
                          <h2>Job Details</h2>
                          <p>Select a job to view detail and apply.</p>
                        </div>
                      </div>
                      <div className="status-item muted">Click any job on the left to see the description and apply.</div>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashboard-grid">
                <div className="dashboard-col">
                  <JobList
                    jobs={jobs}
                    appliedJobIds={appliedJobIds}
                    onSelect={(job) => {
                      setSelectedJob(job);
                      setApplySubmitted(false);
                      navigate(`/candidate/jobs/${job.id}`);
                    }}
                    title="Jobs"
                    subtitle="Browse roles and open details to apply."
                  />
                </div>
                <div className="dashboard-col">
                  <section className="card panel-inner">
                    <div className="section-head">
                      <div>
                        <h2>Job Details</h2>
                        <p>Select a job to view detail and apply.</p>
                      </div>
                    </div>
                    <div className="status-item muted">Click any job on the left to see the description and apply.</div>
                  </section>
                </div>
              </div>
            )}
          </div>
        ) : (
          <section className="panel panel-inner auth-shell">
            <AuthForm
              form={form}
              setForm={setForm}
              onRegister={() => handleAuth("register")}
              onLogin={() => handleAuth("login")}
              mode={authMode}
              setMode={setAuthMode}
              error={authError}
              loading={authLoading}
            />
          </section>
        )}
      </div>
    </main>
  );
}
