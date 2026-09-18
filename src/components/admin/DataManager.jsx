import React, { useState } from 'react';
import { Card, Button, Row, Col, Alert, Badge, Form, Spinner } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import { PLATFORM_VERSION } from '../../config/version';
import { exportAllDatabaseData, clearServerDatabase } from '../../services/supabaseDataService';
import {
  FaDatabase,
  FaFileDownload,
  FaFileUpload,
  FaRedoAlt,
  FaTrashAlt,
  FaCheck,
  FaExclamationTriangle,
  FaHistory,
  FaShieldAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export function clearClientCache() {
  const keysToKeep = [
    // Auth tokens — managed by Supabase, do not remove
    // Theme preference — user's chosen theme, respect it
    'codelift_theme',
    'codelift_auth'
  ];

  const keysToRemove = [
    'codelift_data',
    'codelift_admin_data_v2',
    'codelift_students',
    'codelift_students_cache',
    'codelift_batches',
    'codelift_courses',
    'codelift_fees',
    'codelift_tests',
    'codelift_submissions',
    'codelift_certificates',
    'codelift_course_sidebar_hidden',
    'codelift_coding_problems',
    'codelift_coding_attempts',
    'fees_unlocked',
  ];

  keysToRemove.forEach(k => localStorage.removeItem(k));

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('codelift_') && !keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  }

  sessionStorage.clear();
}

export default function DataManager() {
  const data = useData();
  const { resetToDefaults, importAllData } = data;
  const [importJsonText, setImportJsonText] = useState('');
  const [jsonValidationErr, setJsonValidationErr] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDatabase = async () => {
    if (!window.confirm('This will delete ALL data. Continue?')) return;
    const confirmInput = window.prompt('Type CONFIRM to proceed with database and cache clearing:');
    if (confirmInput !== 'CONFIRM') return;

    setIsClearing(true);
    const toastId = toast.loading('Clearing database and client cache...');
    try {
      // 1. Clear client cache FIRST (in case DB call fails)
      clearClientCache();

      // 2. Clear the server database
      await clearServerDatabase();

      // 3. Reset local state to clean seed
      resetToDefaults();

      toast.success('Database and client cache cleared', { id: toastId });
      // 4. Force reload so the app refetches fresh state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      toast.error('Failed to clear database: ' + err.message, { id: toastId });
    } finally {
      setIsClearing(false);
    }
  };

  // 1. Download Unified Backup as .json file (Supabase tables + local state)
  const handleDownloadBackup = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Extracting full database snapshot from Supabase...');
    try {
      // Query raw database tables from Supabase
      const supaSnapshot = await exportAllDatabaseData();

      // Formulate complete, backwards-compatible export payload
      const exportPayload = {
        version: PLATFORM_VERSION,
        exportedAt: new Date().toISOString(),
        engine: 'supabase + local',
        // Complete raw Supabase database tables
        database: supaSnapshot.tables || {},
        // Static configuration & template metadata
        static: {
          platformSettings: data.platformSettings,
          certificateTemplates: data.certificateTemplates
        },
        // Backwards-compatible root collections
        batches: data.batches,
        students: data.students,
        fees: data.fees,
        tests: data.tests,
        testAttempts: data.testAttempts,
        reviews: data.reviews,
        courses: data.courses,
        assignments: data.assignments,
        submissions: data.submissions,
        certificates: data.certificates,
        activities: data.activities,
        codingProblems: data.codingProblems,
        codingAttempts: data.codingAttempts
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `codelift-full-db-${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Complete Supabase database snapshot exported successfully.', { id: toastId });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export JSON: ' + err.message, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        setImportJsonText(text);
        JSON.parse(text);
        setJsonValidationErr('');
        toast.success(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      } catch (err) {
        setJsonValidationErr('Invalid JSON syntax: ' + err.message);
        toast.error('Could not parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  // 3. Apply Import to Supabase DB & State
  const handleApplyImport = async () => {
    if (!importJsonText.trim()) {
      toast.error('Please paste JSON or upload a file first');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(importJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Payload is not a valid JSON object');
      }
    } catch (err) {
      setJsonValidationErr(err.message);
      toast.error('Import failed: ' + err.message);
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading('Restoring data to Supabase and platform state...');
    try {
      await importAllData(parsed);
      toast.success('Data restored successfully into Supabase and local platform state.', { id: toastId });
      setImportJsonText('');
      setJsonValidationErr('');
    } catch (err) {
      console.error('Import failed:', err);
      setJsonValidationErr(err.message);
      toast.error('Import failed: ' + err.message, { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Snapshot Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="shadow-sm border rounded-3 p-3">
            <div className="small text-muted fw-semibold">Students Enrolled</div>
            <div className="fs-4 fw-bold text-primary">{data.students?.length || 0}</div>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm border rounded-3 p-3">
            <div className="small text-muted fw-semibold">Batches Active</div>
            <div className="fs-4 fw-bold text-success">{data.batches?.length || 0}</div>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm border rounded-3 p-3">
            <div className="small text-muted fw-semibold">Fee Ledgers</div>
            <div className="fs-4 fw-bold text-info">{data.fees?.length || 0}</div>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="shadow-sm border rounded-3 p-3">
            <div className="small text-muted fw-semibold">Certificates Issued</div>
            <div className="fs-4 fw-bold text-warning">{data.certificates?.length || 0}</div>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Export Backup Card */}
        <Col lg={6}>
          <Card className="shadow-sm border rounded-3 h-100">
            <Card.Header className="bg-transparent py-3 border-bottom">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaFileDownload className="text-success" />
                <span>Export System Snapshot</span>
              </h6>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted small">
                  Generate a complete, self-contained JSON file with all records (batches, students, fee ledgers, tests, submissions, reviews, and certificates).
                </p>
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between small py-1 border-bottom">
                    <span>Courses & Modules</span>
                    <strong className="text-dark">{data.courses?.length || 0} courses</strong>
                  </div>
                  <div className="d-flex justify-content-between small py-1 border-bottom">
                    <span>Tests & Quizzes</span>
                    <strong className="text-dark">{data.tests?.length || 0} tests</strong>
                  </div>
                  <div className="d-flex justify-content-between small py-1">
                    <span>Storage Engine</span>
                    <Badge bg="primary">Supabase Database + Local Cache</Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="success"
                onClick={handleDownloadBackup}
                disabled={isExporting}
                className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold shadow-sm"
              >
                {isExporting ? <Spinner size="sm" animation="border" /> : <FaFileDownload />}
                <span>{isExporting ? 'Exporting Supabase Snapshot...' : 'Download Full Supabase JSON Backup'}</span>
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Restore / Import Card */}
        <Col lg={6}>
          <Card className="shadow-sm border rounded-3 h-100">
            <Card.Header className="bg-transparent py-3 border-bottom">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaFileUpload className="text-primary" />
                <span>Restore Snapshot from JSON</span>
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted small mb-3">
                Upload a valid CodeLift JSON file or paste the JSON content directly to restore your database.
              </p>

              {jsonValidationErr && (
                <Alert variant="danger" className="py-2 small">
                  <FaExclamationTriangle className="me-2" />
                  {jsonValidationErr}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Upload Backup File (.json)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  size="sm"
                  disabled={isImporting}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Or Paste Raw JSON</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setJsonValidationErr('');
                  }}
                  placeholder='{"version":"CodeLift Platform 1.0","database":{...}}'
                  className="font-monospace small"
                  disabled={isImporting}
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleApplyImport}
                disabled={!importJsonText.trim() || isImporting}
                className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
              >
                {isImporting ? <Spinner size="sm" animation="border" /> : <FaCheck />}
                <span>{isImporting ? 'Restoring to Supabase...' : 'Verify & Restore Database'}</span>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Danger Zone: Clear Database & Factory Reset */}
      <Card className="shadow-sm border-danger border rounded-3">
        <Card.Header className="bg-danger bg-opacity-10 py-3 border-bottom border-danger">
          <h6 className="fw-bold text-danger mb-0 d-flex align-items-center gap-2">
            <FaShieldAlt />
            <span>Danger Zone — Database & Cache Reset</span>
          </h6>
        </Card.Header>
        <Card.Body className="p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div>
            <div className="fw-bold text-dark">Clear Database & Client Cache</div>
            <p className="text-muted small mb-0">
              Permanently clears database tables and wipes all client-side localStorage/sessionStorage cache while preserving user theme preference.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 flex-shrink-0">
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearDatabase}
              disabled={isClearing}
              className="d-flex align-items-center gap-2"
            >
              {isClearing ? <Spinner size="sm" animation="border" /> : <FaTrashAlt size={12} />}
              <span>{isClearing ? 'Clearing...' : 'Clear Database'}</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data to default seeds? Any unsaved local edits will be replaced.')) {
                  resetToDefaults();
                  toast.success('Database reset to fresh seeds.');
                }
              }}
              className="d-flex align-items-center gap-2"
            >
              <FaRedoAlt size={12} />
              <span>Reset to Factory Seeds</span>
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
