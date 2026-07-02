# ApplyHub

[![CI](https://github.com/noseyug/applyhub/actions/workflows/ci-dev.yml/badge.svg?branch=dev-ci)](https://github.com/noseyug/applyhub/actions/workflows/ci-dev.yml)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MinIO](https://img.shields.io/badge/MinIO-Latest-C72E49?logo=minio&logoColor=white)](https://min.io/)

ApplyHub là một nền tảng tuyển dụng gồm frontend React/Vite và 4 backend service tách rời để:

- Đăng ký, đăng nhập và phân quyền `candidate` / `recruiter`
- Candidate xem danh sách job, xem chi tiết và nộp CV
- Recruiter tạo job và xem danh sách ứng viên đã nộp
- API Gateway điều phối request giữa các service

## Kiến Trúc

- `frontend`: giao diện người dùng với React, TypeScript, Vite
- `backend/auth-service`: xác thực, đăng ký, đăng nhập, refresh token và verify JWT
- `backend/job-service`: quản lý job posting bằng FastAPI
- `backend/application-service`: quản lý đơn ứng tuyển, lưu CV lên MinIO và trả URL tải CV
- `backend/api-gateway`: reverse proxy cho frontend gọi vào một điểm duy nhất

## Công Nghệ

- React 19
- TypeScript
- Vite
- Node.js cho `auth-service`, `api-gateway` và `application-service`
- Python cho `job-service`
- Fastify
- Express
- FastAPI
- PostgreSQL
- MinIO

## Yêu Cầu

- Node.js 18+ cho `auth-service`, `api-gateway`, `application-service` và `frontend`
- Python 3.11+ cho `job-service`
- PostgreSQL cho `auth-service`, `job-service`, `application-service`
- MinIO cho lưu CV của ứng viên

## Cấu Hình Môi Trường

Mỗi service có file mẫu `.env.example`. Hãy copy sang `.env` tương ứng trước khi chạy.

### `backend/auth-service/.env`

```env
AUTH_PORT=4001
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_NAME=your_database
AUTH_DB_USER=your_user
AUTH_DB_PASSWORD=your_password
JWT_SECRET=change-me
```

### `backend/job-service/.env`

```env
JOB_PORT=4002
JOB_DB_HOST=localhost
JOB_DB_PORT=5432
JOB_DB_NAME=job_db
JOB_DB_USER=applyhub
JOB_DB_PASSWORD=applyhub
```

### `backend/job-service` chạy bằng Python

```bash
cd backend/job-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 4002
```

### `backend/application-service/.env`

```env
APPLICATION_PORT=4003
APPLICATION_DB_HOST=localhost
APPLICATION_DB_PORT=5435
APPLICATION_DB_NAME=your_database
APPLICATION_DB_USER=your_user
APPLICATION_DB_PASSWORD=your_password
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=your_bucket
```

### `backend/api-gateway/.env`

```env
NODE_ENV=development
GATEWAY_PORT=4000
AUTH_URL=http://auth:4001
JOB_URL=http://job:4002
APPLICATION_URL=http://application:4003
# Chỉ dùng khi NODE_ENV không phải production, ví dụ frontend local gọi gateway local.
CORS_ORIGIN=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```

Khi deploy production theo mô hình same-origin qua Ingress, frontend nên build với:

```env
VITE_API_URL=/api
```

Ingress route `/api` vào `api-gateway` và rewrite về `/`. Khi đó browser gọi cùng domain với frontend nên `api-gateway` không cần cấu hình `CORS_ORIGIN` trong production; domain production chỉ cần khai báo ở DNS/Ingress/TLS.

## Chạy Local

### 1. Cài dependencies

```bash
cd frontend
npm install

cd ../backend/auth-service
npm install

cd ../backend/application-service
npm install

cd ../api-gateway
npm install
```

### 2. Chạy các service backend

Mở 4 terminal riêng và chạy:

```bash
cd backend/auth-service
npm run dev
```

```bash
cd backend/application-service
npm run dev
```

```bash
cd backend/api-gateway
npm run dev
```

### 3. Chạy frontend

```bash
cd frontend
npm run dev
```

Mặc định frontend sẽ chạy ở `http://localhost:5173`.

## Scripts

- `frontend`: `npm run dev`, `npm run build`
- `backend/auth-service`: `npm run dev`, `npm start`
- `backend/job-service`: `pip install -r requirements.txt`, `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 4002`
- `backend/application-service`: `npm run dev`, `npm start`
- `backend/api-gateway`: `npm run dev`, `npm start`

## CI

Repository hiện có GitHub Actions workflow tại `.github/workflows/ci-dev.yml` để build Docker image cho `backend/application-service` khi có pull request vào nhánh `dev-ci`.

## Ghi Chú

- Candidate có thể nộp CV dưới dạng file `.pdf`, `.doc`, hoặc `.docx`.
- Recruiter có thể tạo job và xem số CV của từng job.
- Dữ liệu CV được trả về dưới dạng `resume_download_url` từ backend.
