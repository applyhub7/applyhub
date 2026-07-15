import pg from 'pg';
import { applicationConfig } from './config.js';

export const applicationPool = new pg.Pool(applicationConfig.db);

export async function initApplicationDb() {
  // Bỏ qua khởi tạo database khi chạy test
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 Test mode: Skipping database initialization');
    return;
  }

  try {
    await applicationPool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY,
        job_id TEXT NOT NULL,
        job_title TEXT NOT NULL,
        company_id TEXT NOT NULL,
        candidate_id TEXT NOT NULL,
        candidate_name TEXT NOT NULL,
        candidate_email TEXT NOT NULL DEFAULT '',
        candidate_phone TEXT NOT NULL DEFAULT '',
        resume_file_name TEXT NOT NULL DEFAULT '',
        resume_object_key TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (job_id, candidate_id)
      );
    `);

    // Các ALTER TABLE
    await applicationPool.query(
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS candidate_email TEXT NOT NULL DEFAULT ''`
    );
    await applicationPool.query(
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS candidate_phone TEXT NOT NULL DEFAULT ''`
    );
    await applicationPool.query(
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_file_name TEXT NOT NULL DEFAULT ''`
    );
    await applicationPool.query(
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_object_key TEXT NOT NULL DEFAULT ''`
    );

    await applicationPool.query(`ALTER TABLE applications DROP COLUMN IF EXISTS company_name`);
    await applicationPool.query(`ALTER TABLE applications DROP COLUMN IF EXISTS resume_url`);
    await applicationPool.query(`ALTER TABLE applications DROP COLUMN IF EXISTS cover_note`);

    console.log('✅ Application database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}