import DashboardLayout from '../Dashboard/DashboardLayout';
import Submissions from './Submissions';

const TeacherDeliverables = () => (
  <DashboardLayout role="TEACHER">
    <div className="welcome-section">
      <h1>📋 Deliverables</h1>
      <p> Create, publish, review, and grade student assignments.</p>
    </div>
    <Submissions />
  </DashboardLayout>
);

export default TeacherDeliverables;
