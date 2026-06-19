# API Documentation

Base URL: `http://localhost:3000/api`

All admin endpoints require a valid JWT token in the `admin_token` HTTP-only cookie.

## Authentication

### POST /admin/auth/login

Admin login.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Administrator"
  }
}
```

**Rate Limit:** 5 attempts per 15 minutes per IP.

### POST /admin/auth/logout

Clear admin session.

**Response (200):**
```json
{ "success": true }
```

### GET /admin/auth/logout

Check authentication status.

**Response (200):**
```json
{
  "authenticated": true,
  "admin": { "id": "uuid", "email": "...", "name": "..." }
}
```

---

## Test (Public)

### POST /test/start

Start a new test session.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "studentId": "STU001"
}
```

**Response (200):**
```json
{
  "sessionId": "uuid",
  "csrfToken": "hex-string",
  "questions": [
    {
      "id": "uuid",
      "questionText": "Choose the correct form...",
      "options": [
        { "key": "A", "text": "go" },
        { "key": "B", "text": "goes" }
      ],
      "category": "Grammar",
      "difficulty": "easy"
    }
  ],
  "config": {
    "questionCount": 20,
    "passPercentage": 60,
    "timerEnabled": true,
    "timerMinutes": 30
  }
}
```

**Rate Limit:** 10 attempts per hour per IP.

### POST /test/progress

Auto-save test progress.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "answers": { "question-id": "A" },
  "currentIndex": 5
}
```

**Response (200):**
```json
{ "success": true }
```

### GET /test/progress?sessionId=uuid

Retrieve saved progress.

**Response (200):**
```json
{
  "answers": { "question-id": "A" },
  "currentIndex": 5,
  "studentData": { "fullName": "...", "email": "...", "studentId": null }
}
```

### POST /test/submit

Submit completed test.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "answers": { "question-id-1": "A", "question-id-2": "B" },
  "timeTaken": 1200,
  "csrfToken": "hex-string"
}
```

**Response (200):**
```json
{
  "resultId": "uuid",
  "score": 16,
  "total": 20,
  "percentage": 80.0,
  "passed": true,
  "studentName": "John Doe",
  "downloadUrl": "/api/download/uuid",
  "downloadFileName": "certificate.txt"
}
```

**Validation:**
- All questions must be answered
- Valid CSRF token required
- Rate limit: 5 submissions per hour per IP

---

## Download (Public)

### GET /download/:id

Download a configured file after test submission.

**Response:** File binary with appropriate Content-Type and Content-Disposition headers.

---

## Admin — Results

### GET /admin/results

List test results with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search name, email, student ID |
| sortBy | string | createdAt, percentage, score, name |
| sortOrder | string | asc, desc |
| dateFrom | string | ISO date filter start |
| dateTo | string | ISO date filter end |
| page | number | Page number (default 1) |
| limit | number | Results per page (default 20) |

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "score": 16,
      "total": 20,
      "percentage": 80.0,
      "passed": true,
      "timeTaken": 1200,
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-06-20T10:00:00Z",
      "student": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "studentId": "STU001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### DELETE /admin/results

Delete results by ID.

**Request Body:**
```json
{
  "ids": ["uuid-1", "uuid-2"]
}
```

**Response (200):**
```json
{ "success": true, "deleted": 2 }
```

---

## Admin — Statistics

### GET /admin/stats

Dashboard statistics.

**Response (200):**
```json
{
  "totalParticipants": 150,
  "averageScore": 72.5,
  "highestScore": 100.0,
  "lowestScore": 25.0,
  "passRate": 68.0,
  "passCount": 102,
  "failCount": 48,
  "scoreDistribution": [
    { "range": "90-100", "count": 20 },
    { "range": "80-89", "count": 35 }
  ],
  "recentResults": []
}
```

---

## Admin — Export

### GET /admin/export

Export results to CSV or Excel.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | csv or xlsx |
| dateFrom | string | Optional date filter |
| dateTo | string | Optional date filter |

**Response:** File download (CSV or XLSX).

---

## Admin — Questions

### GET /admin/questions

List all questions.

### POST /admin/questions

Create a question.

**Request Body:**
```json
{
  "questionText": "Choose the correct form...",
  "optionA": "go",
  "optionB": "goes",
  "optionC": "going",
  "optionD": "gone",
  "correctAnswer": "B",
  "category": "Grammar",
  "difficulty": "medium",
  "isActive": true
}
```

### PUT /admin/questions/:id

Update a question.

### DELETE /admin/questions/:id

Delete a question.

### POST /admin/questions/import

Import questions from CSV (multipart/form-data).

**Form Fields:**
- `file`: CSV file

**Response (200):**
```json
{
  "success": true,
  "imported": 25,
  "errors": ["Row 5: Missing required fields"]
}
```

---

## Admin — Configuration

### GET /admin/config

Get test configuration.

### PUT /admin/config

Update test configuration.

**Request Body:**
```json
{
  "questionCount": 30,
  "passPercentage": 70,
  "timerEnabled": true,
  "timerMinutes": 45,
  "randomizeQuestions": true,
  "randomizeAnswers": true
}
```

---

## Admin — Files

### GET /admin/files

List downloadable files.

### POST /admin/files

Upload a file (multipart/form-data).

**Form Fields:**
- `file`: File to upload
- `description`: Optional description

### PUT /admin/files/:id

Update file (toggle active, update description).

### DELETE /admin/files/:id

Delete a file.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": {}
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (CSRF) |
| 404 | Not found |
| 410 | Session expired |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Security Headers

All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Rate-limited responses include:
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
