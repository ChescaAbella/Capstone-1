import { useAuth } from '../../context/AuthContext';
import MemberProfile from './MemberProfile';
import ManagerProfile from './ManagerProfile';
import AdminProfile from './AdminProfile';

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'MEMBER':
      return <MemberProfile userId={user.id} />;
    case 'MANAGER':
      return <ManagerProfile userId={user.id} />;
    case 'ADMIN':
      return <AdminProfile userId={user.id} />;
    default:
      return <MemberProfile userId={user.id} />;
  }
};

