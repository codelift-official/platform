import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Row, Col, InputGroup, Form } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import {
  FaGraduationCap,
  FaEye,
  FaDownload,
  FaUsers,
  FaFileAlt,
  FaClipboardList,
  FaSearch,
  FaCalendarCheck,
  FaCertificate,
  FaTrophy
} from 'react-icons/fa';

export default function CompletedBatches() {
  const {
    completedBatches = [],
    batches = [],
    students = [],
    testAttempts = [],
    submissions = [],
    certificates = []
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Combine completedBatches state and any batches with isCompleted === true
  const allCompleted = (() => {
    const list = [...(completedBatches || [])];
    (batches || []).forEach(b => {
      if (b.isCompleted && !list.some(cb => cb.originalBatchId === b.id || cb.id === b.id)) {
        const bStudents = students.filter(s => s.batchId === b.id || (s.completedBatchIds || []).includes(b.id));
        const sIds = bStudents.map(s => s.id);
        list.push({
          id: b.id,
          originalBatchId: b.id,
          name: b.name,
          description: b.description || '',
          startDate: b.startDate,
          endDate: b.completedAt || b.endDate || new Date().toISOString(),
          completedAt: b.completedAt || new Date().toISOString(),
          studentIds: sIds,
          testIds: testAttempts.filter(t => sIds.includes(t.studentId)).map(t => t.id),
          assignmentIds: submissions.filter(sub => sIds.includes(sub.studentId)).map(sub => sub.id)
        });
      }
    });
    return list;
  })();

  const filteredBatches = allCompleted.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDetails = (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const exportBatchCSV = (batch) => {
    const batchStudentIds = batch.studentIds || [];
    const batchStudentList = students.filter(s => batchStudentIds.includes(s.id));
    const batchAttempts = testAttempts.filter(t => batchStudentIds.includes(t.studentId));
    const batchSubs = submissions.filter(s => batchStudentIds.includes(s.studentId));

    const rows = [
      ['Student Name', 'Email', 'Phone', 'Test Attempts', 'Avg Test Score (%)', 'Assignments Submitted', 'Avg Assignment Grade', 'Certificates Earned'],
      ...batchStudentList.map(s => {
        const sAttempts = batchAttempts.filter(a => a.studentId === s.id);
        const avgTest = sAttempts.length
          ? Math.round(sAttempts.reduce((sum, a) => sum + (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0), 0) / sAttempts.length)
          : 'N/A';
        const sSubs = batchSubs.filter(sub => sub.studentId === s.id);
        const gradedSubs = sSubs.filter(sub => typeof sub.grade === 'number');
        const avgAsgn = gradedSubs.length
          ? Math.round(gradedSubs.reduce((sum, sub) => sum + sub.grade, 0) / gradedSubs.length)
          : 'N/A';
        const sCerts = certificates.filter(c => c.studentId === s.id).map(c => c.courseName).join('; ');

        return [
          s.name,
          s.email,
          s.phone || 'N/A',
          sAttempts.length,
          avgTest,
          sSubs.length,
          avgAsgn,
          sCerts || 'None'
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${batch.name.replace(/\s+/g, '_')}_Completed_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="p-1.5 rounded-3 bg-success bg-opacity-10 text-success d-inline-flex">
              <FaGraduationCap size={20} />
            </span>
            <span>Completed Batches & Alumni Archive</span>
          </h4>
        </div>
        <div style={{ maxWidth: 300 }} className="w-100">
          <InputGroup size="sm">
            <InputGroup.Text style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search completed cohorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
          </InputGroup>
        </div>
      </div>

      {/* Main Table */}
      <Card className="shadow-sm border-0 rounded-4" style={{ background: 'var(--card-bg)' }}>
        <Card.Body className="p-0">
          {filteredBatches.length > 0 ? (
            <div className="table-responsive">
              <Table hover striped className="mb-0 align-middle" style={{ color: 'var(--text-primary)' }}>
                <thead>
                  <tr>
                    <th>Batch Name</th>
                    <th>Completion Date</th>
                    <th>Students</th>
                    <th>Test Attempts</th>
                    <th>Assignments</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((cb) => {
                    const studentCount = (cb.studentIds || []).length;
                    const attemptsCount = testAttempts.filter(t => (cb.studentIds || []).includes(t.studentId)).length;
                    const subsCount = submissions.filter(s => (cb.studentIds || []).includes(s.studentId)).length;

                    return (
                      <tr key={cb.id}>
                        <td className="fw-bold text-primary">
                          <div className="d-flex align-items-center gap-2">
                            <FaGraduationCap className="text-success" />
                            <span>{cb.name}</span>
                          </div>
                        </td>
                        <td className="small text-muted">
                          {new Date(cb.completedAt || cb.endDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td>
                          <Badge bg="secondary" className="px-2 py-1">
                            <FaUsers size={10} className="me-1" />
                            {studentCount} Students
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="info" className="text-dark px-2 py-1">
                            <FaFileAlt size={10} className="me-1" />
                            {attemptsCount} Attempts
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="primary" className="px-2 py-1">
                            <FaClipboardList size={10} className="me-1" />
                            {subsCount} Filed
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="success">Completed</Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1.5">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenDetails(cb)}
                              className="d-inline-flex align-items-center gap-1 rounded-2"
                            >
                              <FaEye size={12} />
                              <span>View Roster</span>
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => exportBatchCSV(cb)}
                              className="d-inline-flex align-items-center gap-1 rounded-2"
                              title="Export CSV Batch Report"
                            >
                              <FaDownload size={12} />
                              <span>Export</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-5 text-muted">
              <FaGraduationCap size={48} className="mb-3 text-secondary opacity-50" />
              <h5>No Completed Batches Found</h5>
              <p className="small mb-0">When an active batch is marked complete in Batch Management, it will appear here.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Details & Roster Modal */}
      {selectedBatch && (() => {
        const bStudentIds = selectedBatch.studentIds || [];
        const bStudents = students.filter(s => bStudentIds.includes(s.id));
        const bAttempts = testAttempts.filter(t => bStudentIds.includes(t.studentId));
        const bSubs = submissions.filter(s => bStudentIds.includes(s.studentId));
        const bCerts = certificates.filter(c => bStudentIds.includes(c.studentId));

        const avgScorePercent = bAttempts.length
          ? Math.round(bAttempts.reduce((sum, a) => sum + (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0), 0) / bAttempts.length)
          : 0;

        const gradedSubs = bSubs.filter(s => typeof s.grade === 'number');
        const avgAssignmentGrade = gradedSubs.length
          ? Math.round(gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length)
          : 0;

        return (
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
            <Modal.Header closeButton style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FaGraduationCap className="text-success" />
                <span>{selectedBatch.name} — Completed Cohort Audit</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ background: 'var(--card-bg)' }}>
              {/* Summary Stats Header */}
              <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                  <div className="p-3 rounded-3 border text-center" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="fs-4 fw-bold text-primary">{bStudents.length}</div>
                    <div className="small text-muted">Graduated Students</div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="p-3 rounded-3 border text-center" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="fs-4 fw-bold text-success">{avgScorePercent}%</div>
                    <div className="small text-muted">Avg Test Score</div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="p-3 rounded-3 border text-center" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="fs-4 fw-bold text-info">{avgAssignmentGrade}%</div>
                    <div className="small text-muted">Avg Assignment Grade</div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="p-3 rounded-3 border text-center" style={{ background: 'var(--bg-body)', borderColor: 'var(--border-color)' }}>
                    <div className="fs-4 fw-bold text-warning">{bCerts.length}</div>
                    <div className="small text-muted">Certificates Issued</div>
                  </div>
                </Col>
              </Row>

              {/* Student Roster Table */}
              <h6 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FaUsers className="text-primary" />
                <span>Archived Student Roster</span>
              </h6>
              <div className="table-responsive border rounded-3 mb-3">
                <Table hover className="mb-0 align-middle small" style={{ color: 'var(--text-primary)' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Tests Attempted</th>
                      <th>Assignments</th>
                      <th>Certificates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bStudents.map(s => {
                      const sAttempts = bAttempts.filter(a => a.studentId === s.id);
                      const sSubs = bSubs.filter(sub => sub.studentId === s.id);
                      const sCertList = bCerts.filter(c => c.studentId === s.id);

                      return (
                        <tr key={s.id}>
                          <td className="fw-semibold">{s.name}</td>
                          <td className="text-muted">{s.email}</td>
                          <td>
                            <Badge bg="info" className="text-dark">{sAttempts.length} Tests</Badge>
                          </td>
                          <td>
                            <Badge bg="primary">{sSubs.length} Filed</Badge>
                          </td>
                          <td>
                            {sCertList.length > 0 ? (
                              <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                                <FaCertificate size={10} />
                                <span>{sCertList.length} Earned</span>
                              </Badge>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <Modal.Footer style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button variant="success" size="sm" onClick={() => exportBatchCSV(selectedBatch)} className="d-flex align-items-center gap-1.5">
                <FaDownload size={12} />
                <span>Export Batch Report (CSV)</span>
              </Button>
            </Modal.Footer>
          </Modal>
        );
      })()}
    </div>
  );
}
