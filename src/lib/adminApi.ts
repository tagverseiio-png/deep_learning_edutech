const API_BASE = import.meta.env.VITE_API_URL || 'https://api.deeplearningedutech.com/api';

class AdminAPI {
  private token: string | null = localStorage.getItem('adminToken');
  private static readonly TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminTokenExpiry', String(Date.now() + AdminAPI.TOKEN_EXPIRY_TIME));
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
  }

  getToken() {
    // Check if token has expired
    const expiry = localStorage.getItem('adminTokenExpiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }
    return this.token;
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async login(email: string, password: string) {
    console.log('🔵 Admin Login - Calling /admin/login', { email });
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log('✅ Admin Login - Response:', { success: data.success, role: data.data?.user?.role });
    if (!res.ok) {
      console.error('❌ Admin Login - Error:', data);
      throw new Error(data.message || 'Login failed');
    }
    if (data.success) this.setToken(data.data.token);
    return data;
  }

  async getDashboardStats() {
    console.log('🔵 getDashboardStats - Calling /admin/dashboard/stats');
    const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: this.headers(),
    });
    const data = await res.json();
    console.log('✅ getDashboardStats - Response:', data);
    if (!res.ok) {
      console.error('❌ getDashboardStats - Error:', data);
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }
    return data;
  }

  async getSystemStats() {
    console.log('🔵 getSystemStats - Calling /admin/system/stats');
    const res = await fetch(`${API_BASE}/admin/system/stats`, {
      headers: this.headers(),
    });
    const data = await res.json();
    console.log('✅ getSystemStats - Response:', data);
    if (!res.ok) {
      console.error('❌ getSystemStats - Error:', data);
      throw new Error(data.message || 'Failed to fetch system stats');
    }
    return data;
  }

  async getCourses(page = 1, limit = 20, search = '') {
    const url = new URL(`${API_BASE}/admin/courses`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (search) url.searchParams.append('search', search);

    console.log('🔵 getCourses - Calling /admin/courses', { page, limit, search });
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    const data = await res.json();
    console.log('✅ getCourses - Response:', data);
    if (!res.ok) {
      console.error('❌ getCourses - Error:', data);
      throw new Error(data.message || 'Failed to fetch courses');
    }
    return data;
  }

  async updateCourse(courseId: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async deleteCourse(courseId: string) {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.json();
  }

  async togglePublishCourse(courseId: string) {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/publish`, {
      method: 'PATCH',
      headers: this.headers(),
    });
    return res.json();
  }

  async getTeachers(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const { page = 1, limit = 20, status = '', search = '' } = params;
    const url = new URL(`${API_BASE}/admin/teachers`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (status) url.searchParams.append('status', status.toUpperCase());
    if (search) url.searchParams.append('search', search);

    console.log('🔵 getTeachers - Calling /admin/teachers', { page, limit, status, search });
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    const data = await res.json();
    console.log('✅ getTeachers - Response:', data);
    if (!res.ok) {
      console.error('❌ getTeachers - Error:', data);
      throw new Error(data.message || 'Failed to fetch teachers');
    }
    return data;
  }

  async verifyTeacher(teacherId: string, verificationStatus: string) {
    const res = await fetch(`${API_BASE}/admin/teachers/${teacherId}/verify`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ verificationStatus }),
    });
    return res.json();
  }

  async updateTeacher(teacherId: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/teachers/${teacherId}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async deleteTeacher(teacherId: string) {
    const res = await fetch(`${API_BASE}/admin/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.json();
  }

  async getStudents(params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search = '' } = params;
    const url = new URL(`${API_BASE}/admin/students`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (search) url.searchParams.append('search', search);

    console.log('🔵 getStudents - Calling /admin/students', { page, limit, search });
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    const data = await res.json();
    console.log('✅ getStudents - Response:', data);
    if (!res.ok) {
      console.error('❌ getStudents - Error:', data);
      throw new Error(data.message || 'Failed to fetch students');
    }
    return data;
  }

  async updateStudent(studentId: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async deleteStudent(studentId: string) {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.json();
  }

  async updateUser(userId: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async getPayments(params: { page?: number; limit?: number; status?: string; purpose?: string } = {}) {
    const { page = 1, limit = 20, status = '', purpose = '' } = params;
    const url = new URL(`${API_BASE}/admin/payments`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (status) url.searchParams.append('status', status);
    if (purpose) url.searchParams.append('purpose', purpose);

    console.log('🔵 getPayments - Calling /admin/payments', { page, limit, status, purpose });
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    const data = await res.json();
    console.log('✅ getPayments - Response:', data);
    if (!res.ok) {
      console.error('❌ getPayments - Error:', data);
      throw new Error(data.message || 'Failed to fetch payments');
    }
    return data;
  }

  async deletePayment(paymentId: string) {
    const res = await fetch(`${API_BASE}/admin/payments/${paymentId}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.json();
  }

  logout() {
    this.clearToken();
  }
}

export const adminApi = new AdminAPI();
