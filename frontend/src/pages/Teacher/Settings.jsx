import { useState } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import './TeacherPages.css';

const Settings = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [message, setMessage] = useState('');

  const saveSettings = (event) => {
    event.preventDefault();
    localStorage.setItem(`teacherSettings-${user.id}`, JSON.stringify({ emailNotifications }));
    setMessage('Settings saved.');
  };

  return (
    <DashboardLayout role="TEACHER">
      <div className="welcome-section">
        <h1>⚙️ Settings</h1>
        <p>Manage your teacher workspace preferences.</p>
      </div>
      <Card>
        <CardBody>
          <form className="teacher-settings-form" onSubmit={saveSettings}>
            <label>
              <input type="checkbox" checked={emailNotifications} onChange={(event) => setEmailNotifications(event.target.checked)} />
              Email notifications for new submissions and grading activity
            </label>
            <Button type="submit" variant="primary" text="Save Settings" />
            {message && <p className="settings-message">{message}</p>}
          </form>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default Settings;
