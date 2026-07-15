import { randomUUID } from 'node:crypto';
import { ensureCvBucket, getResumeObject, uploadResume } from './minio.js';
import {
  createApplication,
  findApplicationById,
  findApplicationsByCandidate,
  findApplicationsByJob,
  updateApplicationStatus,
} from './repository.js';

const allowedStatuses = ['pending', 'reviewed', 'rejected', 'accepted'];

function resumeDownloadPath(item) {
  return item.resume_object_key ? `/applications/${item.id}/resume` : '';
}

function canTransition(from, to) {
  const rules = {
    pending: ['reviewed', 'rejected', 'accepted'],
    reviewed: ['rejected', 'accepted'],
    rejected: [],
    accepted: [],
  };

  return rules[from]?.includes(to);
}

export async function applyToJob(user, body) {
  if (user.role !== 'candidate') {
    return { error: { status: 403, message: 'forbidden' } };
  }

  if (
    !body.jobId ||
    !body.jobTitle ||
    !body.companyId ||
    !body.candidateEmail ||
    !body.resumeData ||
    !body.resumeFileName
  ) {
    return { error: { status: 400, message: 'invalid payload' } };
  }

  try {
    await ensureCvBucket();

    const resume = await uploadResume({
      candidateId: user.id,
      jobId: body.jobId,
      fileName: body.resumeFileName,
      dataUrl: body.resumeData,
    });

    const application = await createApplication({
      id: randomUUID(),
      jobId: body.jobId,
      jobTitle: body.jobTitle,
      companyId: body.companyId,
      candidateId: user.id,
      candidateName: body.fullName || user.name,
      candidateEmail: body.candidateEmail,
      candidatePhone: body.candidatePhone || '',
      resumeFileName: resume.fileName,
      resumeObjectKey: resume.objectKey,
      status: 'pending',
    });

    return { application };
  } catch (error) {
    if (error?.code === '23505') {
      return { error: { status: 409, message: 'already applied' } };
    }

    console.error('applyToJob failed', error);

    return {
      error: {
        status: 500,
        message: error?.message || 'failed to submit application',
      },
    };
  }
}

export async function listMyApplications(user) {
  const items = await findApplicationsByCandidate(user.id);

  return {
    items: items.map((item) => ({
      ...item,
      resume_download_url: resumeDownloadPath(item),
    })),
  };
}

export async function listJobApplications(user, jobId) {
  const items = await findApplicationsByJob(jobId);

  if (
    items.length > 0 &&
    items[0].company_id !== user.id &&
    user.role !== 'candidate'
  ) {
    return { error: { status: 403, message: 'forbidden' } };
  }

  return {
    items: items.map((item) => ({
      ...item,
      resume_download_url: resumeDownloadPath(item),
    })),
  };
}

export async function getApplicationResume(user, id) {
  const application = await findApplicationById(id);

  if (!application) {
    return { error: { status: 404, message: 'application not found' } };
  }

  if (
    application.candidate_id !== user.id &&
    application.company_id !== user.id
  ) {
    return { error: { status: 403, message: 'forbidden' } };
  }

  if (!application.resume_object_key) {
    return { error: { status: 404, message: 'resume not found' } };
  }

  const { stat, stream } = await getResumeObject(
    application.resume_object_key
  );

  return {
    fileName: application.resume_file_name || 'resume',
    contentType:
      stat.metaData?.['content-type'] ||
      stat.metaData?.['Content-Type'] ||
      'application/octet-stream',
    stream,
  };
}

export async function changeApplicationStatus(user, id, status) {
  if (user.role !== 'recruiter') {
    return { error: { status: 403, message: 'forbidden' } };
  }

  if (!allowedStatuses.includes(status)) {
    return { error: { status: 400, message: 'invalid status' } };
  }

  const application = await findApplicationById(id);

  if (!application) {
    return { error: { status: 404, message: 'application not found' } };
  }

  if (application.company_id !== user.id) {
    return { error: { status: 403, message: 'forbidden' } };
  }

  if (
    !canTransition(application.status, status) &&
    application.status !== status
  ) {
    return { error: { status: 400, message: 'invalid transition' } };
  }

  return {
    application: await updateApplicationStatus(id, status),
  };
}