import { applicationPool } from './db.js';

export async function createApplication(record) {
  const result = await applicationPool.query(
    `INSERT INTO applications
     (id, job_id, job_title, company_id, candidate_id, candidate_name, candidate_email, candidate_phone, resume_file_name, resume_object_key, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      record.id,
      record.jobId,
      record.jobTitle,
      record.companyId,
      record.candidateId,
      record.candidateName,
      record.candidateEmail,
      record.candidatePhone,
      record.resumeFileName,
      record.resumeObjectKey,
      record.status,
    ]
  );
  return result.rows[0];
}

export async function findApplicationsByCandidate(candidateId) {
  const result = await applicationPool.query(
    'SELECT * FROM applications WHERE candidate_id = $1 ORDER BY created_at DESC',
    [candidateId]
  );
  return result.rows;
}

export async function findApplicationsByJob(jobId) {
  const result = await applicationPool.query(
    'SELECT * FROM applications WHERE job_id = $1 ORDER BY created_at DESC',
    [jobId]
  );
  return result.rows;
}

export async function findApplicationById(id) {
  const result = await applicationPool.query('SELECT * FROM applications WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function updateApplicationStatus(id, status) {
  const result = await applicationPool.query(
    'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] || null;
}
