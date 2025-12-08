const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class AdminAPI {
  private token: string | null = localStorage.getItem('adminToken');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  getToken() {
    return this.token;
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) this.setToken(data.data.token);
    return data;
  }

  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: this.headers(),
    });
    return res.json();
  }

  async getCourses(page = 1, limit = 20, search = '') {
    const url = new URL(`${API_BASE}/admin/courses`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (search) url.searchParams.append('search', search);

    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    return res.json();
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

    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    return res.json();
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

    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    return res.json();
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

  async getSystemStats() {
    const res = await fetch(`${API_BASE}/admin/system/stats`, {
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

    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    return res.json();
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
