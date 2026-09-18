import React from 'react';
import { Accordion, Button, Badge, Card, ProgressBar } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaBookOpen, FaCheckCircle, FaCircle, FaGraduationCap } from 'react-icons/fa';

export default function CourseViewer() {
  const { courses = [], students = [] } = useData();
  const { currentStudent, auth } = useAuth();

  const student = Array.isArray(students)
    ? students.find(s =>
        (auth?.studentId && (s.id === auth.studentId || s.legacyId === auth.studentId)) ||
        (auth?.id && (s.id === auth.id || s.legacyId === auth.id)) ||
        (auth?.userId && (s.id === auth.userId || s.legacyId === auth.userId)) ||
        (auth?.email && s.email?.toLowerCase() === auth.email?.toLowerCase())
      )
    : null;

  const progress = student?.progress || currentStudent?.progress || {};

  // Compute overall course progress
  let totalTopics = 0;
  courses.forEach((c) => {
    c.modules?.forEach((m) => {
      totalTopics += m.topics?.length || 0;
    });
  });

  const completedCount = Object.keys(progress).length;
  const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const isCompleted = (topicId) => progress[topicId] === 'completed' || progress[topicId] === true;

  return (
    <div className="space-y-4">
      {/* Course Progress Summary Card */}
      <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <FaGraduationCap className="text-primary" />
                <span style={{ color: 'var(--text-primary)' }}>{courses[0]?.title || 'Course Curriculum'}</span>
              </h5>
              <p className="text-muted small mb-0">
                Track your syllabus milestones and interactive reading modules.
              </p>
            </div>
            <div className="text-sm-end">
              <span className="badge bg-primary fs-6 font-monospace">
                {percentage}% Completed
              </span>
              <div className="text-muted small mt-1 font-monospace">
                {completedCount} of {totalTopics} topics finished
              </div>
            </div>
          </div>
          <ProgressBar variant="success" now={percentage} style={{ height: 10 }} className="rounded-pill" />
        </Card.Body>
      </Card>

      {/* Modules Accordion */}
      {courses.map((course) => (
        <div key={course.id} className="space-y-3">
          <Accordion defaultActiveKey={['0']} alwaysOpen className="shadow-sm rounded-3">
            {course.modules?.map((mod, modIdx) => (
              <Accordion.Item key={mod.id} eventKey={String(modIdx)} className="border-0 border-bottom" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                <Accordion.Header>
                  <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                    <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{mod.title}</span>
                    <Badge className="border px-2.5 py-1" style={{ background: 'var(--card-bg-alt)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                      {mod.topics?.filter((t) => isCompleted(t.id)).length} / {mod.topics?.length} Done
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <div className="space-y-4">
                    {mod.topics?.map((topic, tIdx) => {
                      const done = isCompleted(topic.id);
                      return (
                        <Card key={topic.id} className="border rounded-3 mb-3" style={{ backgroundColor: done ? 'var(--card-bg-alt)' : 'var(--card-bg)', borderColor: done ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-color)' }}>
                          <Card.Header className="bg-transparent d-flex justify-content-between align-items-center py-2.5 px-3" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="d-flex align-items-center gap-2">
                              {done ? (
                                <FaCheckCircle className="text-success" size={16} />
                              ) : (
                                <FaCircle className="text-muted opacity-50" size={14} />
                              )}
                              <span className="fw-semibold small" style={{ color: done ? 'var(--bs-primary)' : 'var(--text-primary)' }}>
                                {topic.title}
                              </span>
                            </div>

                            {done ? (
                              <Badge bg="success" className="d-flex align-items-center gap-1 px-2.5 py-1.5">
                                <FaCheckCircle size={11} />
                                <span>Completed</span>
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="bg-opacity-10 text-secondary border px-2.5 py-1.5">
                                <span>In Progress</span>
                              </Badge>
                            )}
                          </Card.Header>

                          <Card.Body className="px-4 py-3">
                            <div className="markdown-body" style={{ color: 'var(--text-primary)' }}>
                              <ReactMarkdown>{topic.contentMd}</ReactMarkdown>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
