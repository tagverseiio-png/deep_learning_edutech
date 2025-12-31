# Admin Panel Frontend - Backend API Reference

This document verifies that the frontend admin panel correctly implements all backend API endpoints as per the official Admin Panel API Documentation.

## ✅ Implementation Status

### Authentication Endpoints

#### Admin Login
- **Frontend**: `/src/pages/admin/AdminLogin.tsx`
- **API Method**: `adminApi.login(email, password)`
- **Backend Endpoint**: `POST /admin/login`
- **Status**: ✅ **IMPLEMENTED**
- **Details**:
  - Sends email and password
  - Receives `token` and `refreshToken`
  - Stores token in localStorage
  - Sets Authorization header for subsequent requests

---

### Dashboard & Stats Endpoints

#### Get Dashboard Stats
- **Frontend**: `/src/pages/admin/AdminDashboard.tsx`
- **API Method**: `adminApi.getDashboardStats()`
- **Backend Endpoint**: `GET /admin/dashboard/stats`
- **Status**: ✅ **IMPLEMENTED**
- **Response Fields**:
  - `totalStudents`
  - `totalTeachers`
  - `totalCourses`
  - `totalEnrollments`
  - `totalRevenue`
  - `recentPayments[]`

#### Get System Stats
- **Frontend**: `/src/pages/admin/SystemMonitoring.tsx`
- **API Method**: `adminApi.getSystemStats()`
- **Backend Endpoint**: `GET /admin/system/stats`
- **Status**: ✅ **IMPLEMENTED**
- **Response Fields**:
  - `totalUsers`
  - `activeUsers`
  - `totalPayments`
  - `successfulPayments`
  - `failedPayments`
  - `totalRevenue`
  - `averageRating`

---

### Management Endpoints

#### Get All Courses
- **Frontend**: `/src/pages/admin/CourseManagement.tsx`
- **API Method**: `adminApi.getCourses(page, limit, search)`
- **Backend Endpoint**: `GET /admin/courses`
- **Status**: ✅ **IMPLEMENTED**
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20, max: 100)
  - `search`: Optional search string
- **Response**: Includes `pagination` object with:
  - `page`, `limit`, `total`, `totalPages`

#### Get All Teachers
- **Frontend**: `/src/pages/admin/TeacherManagement.tsx`
- **API Method**: `adminApi.getTeachers({ page, limit, status, search })`
- **Backend Endpoint**: `GET /admin/teachers`
- **Status**: ✅ **IMPLEMENTED**
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status (APPROVED, PENDING, REJECTED)
  - `search`: Optional search string
- **Response**: Includes `pagination` object

#### Get All Students
- **Frontend**: `/src/pages/admin/StudentManagement.tsx`
- **API Method**: `adminApi.getStudents({ page, limit, search })`
- **Backend Endpoint**: `GET /admin/students`
- **Status**: ✅ **IMPLEMENTED**
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `search`: Optional search string
- **Response**: Includes `pagination` object

#### Get All Payments
- **Frontend**: `/src/pages/admin/PaymentManagement.tsx`
- **API Method**: `adminApi.getPayments({ page, limit, status, purpose })`
- **Backend Endpoint**: `GET /admin/payments`
- **Status**: ✅ **IMPLEMENTED**
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status (succeeded, failed, pending)
  - `purpose`: Filter by purpose (teacher_verification, course_enrollment)
- **Response**: Includes `pagination` object

---

## 🔐 Authentication

### Token Management
- **Access Token Storage**: `localStorage` (key: `adminToken`)
- **Token Expiry**: 24 hours
- **Header Format**: `Authorization: Bearer <token>`
- **Automatic Refresh**: Yes (via interceptors when token expires)

### Admin Role Check
- All requests include role validation
- Only `ADMIN` role can access these endpoints
- Unauthorized requests return 401 status

---

## 📊 Response Format Standard

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // endpoint-specific data
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Error description"
}
```

---

## 🔍 Debugging & Logging

All admin API calls include comprehensive console logging:

```javascript
// Request
🔵 getDashboardStats - Calling /admin/dashboard/stats

// Success Response
✅ getDashboardStats - Response: { success: true, data: {...} }

// Error Response
❌ getDashboardStats - Error: { success: false, error: "..." }
```

### View Logs
1. Open Browser Developer Tools (F12)
2. Go to **Console** tab
3. Perform admin actions
4. Look for messages with 🔵 ✅ ❌ emojis

---

## 📋 Admin Panel Components

| Component | File | Endpoints Used |
|-----------|------|-----------------|
| Admin Dashboard | `AdminDashboard.tsx` | `/admin/dashboard/stats` |
| System Monitoring | `SystemMonitoring.tsx` | `/admin/system/stats` |
| Course Management | `CourseManagement.tsx` | `/admin/courses` |
| Teacher Management | `TeacherManagement.tsx` | `/admin/teachers` |
| Student Management | `StudentManagement.tsx` | `/admin/students` |
| Payment Management | `PaymentManagement.tsx` | `/admin/payments` |
| Admin Login | `AdminLogin.tsx` | `/admin/login` |

---

## ✨ Features

### Pagination
- ✅ Page navigation
- ✅ Limit per page (configurable)
- ✅ Total count display
- ✅ Total pages calculation

### Filtering & Search
- ✅ Search by name/email/ID
- ✅ Filter by status
- ✅ Filter by payment purpose
- ✅ Debounced search (300ms)

### Actions
- ✅ View details
- ✅ Edit records
- ✅ Delete records
- ✅ Verify teachers
- ✅ Publish/unpublish courses

### Error Handling
- ✅ User-friendly error messages
- ✅ Toast notifications
- ✅ Automatic retry logic
- ✅ Comprehensive logging

---

## 🚀 Usage

### Example: Fetch Teachers with Filters
```typescript
const response = await adminApi.getTeachers({
  page: 1,
  limit: 20,
  status: 'PENDING',
  search: 'John'
});

// Response
{
  "success": true,
  "message": "Teachers retrieved",
  "data": {
    "teachers": [{ id, name, email, status, ... }],
    "pagination": { page: 1, limit: 20, total: 50, totalPages: 3 }
  }
}
```

### Example: Fetch Payments with Filters
```typescript
const response = await adminApi.getPayments({
  page: 1,
  limit: 20,
  status: 'succeeded',
  purpose: 'teacher_verification'
});
```

---

## ✅ Verification Checklist

- ✅ All endpoints match backend API documentation
- ✅ Pagination implemented correctly
- ✅ Authentication with Bearer token
- ✅ Error handling with proper messages
- ✅ Comprehensive logging for debugging
- ✅ Response parsing correct
- ✅ Query parameters formatted correctly
- ✅ CORS headers handled
- ✅ Token refresh on 401

---

## 📞 Support

If you encounter any issues:
1. Check the **Console Logs** (F12 → Console tab)
2. Look for 🔵 (request), ✅ (success), or ❌ (error) messages
3. Verify token is present in `localStorage` → `adminToken`
4. Ensure user has `ADMIN` role
5. Check network tab for actual HTTP requests/responses

---

**Last Updated**: 31 December 2025
**Status**: ✅ All endpoints verified and working
