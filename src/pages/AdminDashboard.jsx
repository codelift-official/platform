import React, { useState } from 'react';
import { Container, Row, Col, Offcanvas, Button } from 'react-bootstrap';
import AdminSidebar from '../components/common/AdminSidebar';
import BatchManager from '../components/admin/BatchManager';
import StudentManager from '../components/admin/StudentManager';
import FeeManager from '../components/admin/FeeManager';
import GradingPanel from '../components/admin/GradingPanel';
import { FaBars } from 'react-icons/fa';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setShowMobileSidebar(false);
  };

  return (
    <Container fluid className="p-0">
      {/* Mobile Sidebar Toggle Button */}
      <div
        className="d-md-none p-2 px-3 d-flex justify-content-between align-items-center border-bottom"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      >
        <span className="fw-semibold small text-uppercase tracking-wider">
          Admin: {activeTab.toUpperCase()}
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowMobileSidebar(true)}
          className="d-flex align-items-center gap-1.5"
        >
          <FaBars size={12} />
          <span>Menu</span>
        </Button>
      </div>

      <Row className="g-0">
        {/* Desktop Sidebar (visible md and up) */}
        <Col md={3} lg={2} className="d-none d-md-block">
          <AdminSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />
        </Col>

        {/* Mobile Offcanvas Sidebar — z-index kept below Bootstrap Modal (1055+) */}
        <Offcanvas
          show={showMobileSidebar}
          onHide={() => setShowMobileSidebar(false)}
          responsive="md"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', zIndex: 1040 }}
        >
          <Offcanvas.Header closeButton style={{ borderBottom: '1px solid var(--border-color)' }}>
            <Offcanvas.Title className="fw-bold fs-6">CodeLift Admin Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <AdminSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />
          </Offcanvas.Body>
        </Offcanvas>


        {/* Main Content Area */}
        <Col md={9} lg={10} className="p-3 p-md-4 p-lg-5 min-vh-100" style={{ backgroundColor: 'var(--bg-body)' }}>
          {activeTab === 'batches' && <BatchManager />}
          {activeTab === 'students' && <StudentManager />}
          {activeTab === 'fees' && <FeeManager />}
          {activeTab === 'grading' && <GradingPanel />}
        </Col>
      </Row>
    </Container>
  );
}
