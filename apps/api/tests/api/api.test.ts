import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('School Result Processing REST API Endpoints', () => {
  const app = createApp();
  let sampleClassId = '';
  let sampleStudentId = '';
  let sampleCheckingItemId = '';

  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/classes returns all classes with student counts', async () => {
    const res = await request(app).get('/api/classes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    sampleClassId = res.body.data[0].id;
  });

  it('GET /api/classes/:classId/students returns students in the class', async () => {
    const res = await request(app).get(`/api/classes/${sampleClassId}/students`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleStudentId = res.body.data[0].studentId;
  });

  it('GET /api/students returns paginated list of students', async () => {
    const res = await request(app).get('/api/students?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(10);
    expect(res.body.total).toBeGreaterThanOrEqual(60);
  });

  it('GET /api/students/:studentId returns single student with marks and result', async () => {
    const res = await request(app).get(`/api/students/${sampleStudentId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe(sampleStudentId);
    expect(res.body.data.marks.length).toBe(7);
  });

  it('GET /api/results returns dashboard executive metrics', async () => {
    const res = await request(app).get('/api/results');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalStudents).toBeGreaterThanOrEqual(60);
    expect(res.body.data.passedCount).toBeDefined();
    expect(res.body.data.failedCount).toBeDefined();
    expect(res.body.data.averageGPA).toBeDefined();
    expect(res.body.data.gradeDistribution).toBeDefined();
  });

  it('GET /api/results/:studentId/trace returns full auditable trace', async () => {
    const res = await request(app).get(`/api/results/${sampleStudentId}/trace`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.traces.length).toBe(7);
    expect(res.body.data.compulsoryTraces.length).toBe(6);
    expect(res.body.data.optionalTrace).toBeDefined();
    expect(res.body.data.result).toBeDefined();
  });

  it('GET /api/checking returns all review items', async () => {
    const res = await request(app).get('/api/checking');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleCheckingItemId = res.body.data[0].id;
  });

  it('GET /api/checking/optional returns optional review items (GP <= 2)', async () => {
    const res = await request(app).get('/api/checking/optional');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((i: any) => i.type === 'OPTIONAL')).toBe(true);
  });

  it('GET /api/checking/practical-fail returns practical fail items (< 8)', async () => {
    const res = await request(app).get('/api/checking/practical-fail');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((i: any) => i.type === 'PRACTICAL_FAIL')).toBe(true);
  });

  it('GET /api/checking/absent returns absent review items', async () => {
    const res = await request(app).get('/api/checking/absent');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((i: any) => i.type === 'ABSENT')).toBe(true);
  });

  it('PATCH /api/checking/:id/verify updates item status to VERIFIED', async () => {
    const res = await request(app)
      .patch(`/api/checking/${sampleCheckingItemId}/verify`)
      .send({ notes: 'Verified by department head' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('VERIFIED');
    expect(res.body.data.verificationNotes).toBe('Verified by department head');
  });

  it('PATCH /api/checking/:id/reject updates item status to REJECTED', async () => {
    const res = await request(app)
      .patch(`/api/checking/${sampleCheckingItemId}/reject`)
      .send({ notes: 'Mark discrepancy flagged' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('REJECTED');
    expect(res.body.data.verificationNotes).toBe('Mark discrepancy flagged');
  });

  it('POST /api/results/recalculate triggers full transactional recalculation', async () => {
    const res = await request(app).post('/api/results/recalculate').send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.calculatedCount).toBeGreaterThanOrEqual(60);
  });
});
