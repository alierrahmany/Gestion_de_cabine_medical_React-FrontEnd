import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUser,
  FaUserInjured,
  FaUserAlt,
  FaCalendarCheck,
  FaFileMedical,
  FaFileInvoice,
  FaCalendarAlt,
  FaTools,
  FaWrench,
  FaHome,
  FaMoon,
  FaSun,
  FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdministratifDashboard from './components/Dashboard/AdministratifDashboard';
import MedcinDashboard from './components/Dashboard/MedcinDashboard';
import SecretaireDashboard from './components/Dashboard/SecretaireDashboard';
import TechnicienDashboard from './components/Dashboard/TechnicienDashboard';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialisation du thème
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(savedTheme);
    setDarkMode(savedTheme === 'dark');

    // Chargement des données utilisateur
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        handleLogout();
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userData?.role === 'administratif') {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:8000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [userData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const renderDashboardContent = () => {
    if (!userData) return <div>Loading...</div>;
    
    const props = { activeComponent, setActiveComponent, users, handleDeleteUser };

    switch (userData.role) {
      case 'medcin': return <MedcinDashboard {...props} />;
      case 'secretaire': return <SecretaireDashboard {...props} />;
      case 'administratif': return <AdministratifDashboard {...props} />;
      case 'technicien': return <TechnicienDashboard {...props} />;
      default: return <div>No dashboard available for your role</div>;
    }
  };

  const renderSidebarItems = () => {
    if (!userData) return null;

    const roleConfig = {
     
      administratif: [
        { id: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
        { id: 'utilisateur', icon: <FaUser />, label: 'Utilisateurs' },
        { id: 'conges', icon: <FaCalendarCheck />, label: 'Congés' }
      ],
      secretaire: [
        { id: 'patient', icon: <FaUserInjured />, label: 'Patients' },
        { id: 'rendez_vous', icon: <FaCalendarAlt />, label: 'Rendez-vous' },
        { id: 'facture', icon: <FaFileInvoice />, label: 'Factures' },
        { id: 'conges', icon: <FaCalendarCheck />, label: 'Congés' }
      ],
      medcin: [
        { id: 'rendez_vous', icon: <FaCalendarCheck />, label: 'Rendez-vous' },
        { id: 'ordonnance', icon: <FaFileMedical />, label: 'Ordonnances' }
      ],
      technicien: [
        { id: 'equipements', icon: <FaTools />, label: 'Équipements' },
        { id: 'maintenance', icon: <FaWrench />, label: 'Maintenance' }
      ]
    };

    return roleConfig[userData.role]?.map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveComponent(item.id)}
        className={`w-full flex items-center p-3 mb-1 rounded-lg transition-colors
          hover:bg-blue-100 dark:hover:bg-gray-700
          ${activeComponent === item.id ? 'bg-blue-100 dark:bg-gray-700' : ''}`}
      >
        <span className="text-blue-500 dark:text-blue-400 mr-2">{item.icon}</span>
        <span className="dark:text-gray-200">{item.label}</span>
      </button>
    ));
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg fixed h-full">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
        </div>
        <nav className="mt-6">{renderSidebarItems()}</nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
  <div className="flex justify-between items-center mb-6">
    <div >
    <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  {userData ? `Bienvenue, ${userData.name} !` : 'Chargement...'}
</h1>
      
    </div>
  



            
            
            
            <div className="flex items-center gap-4">
              {/* Toggle Dark Mode Button */}
             
              
              {/* Enhanced User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {userData?.name?.charAt(0).toUpperCase() || <FaUserAlt />}
                  </div>
                
                  <svg 
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-800 dark:text-white">{userData?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{userData?.email}</p>
                    </div>
                    
                    <div className="py-2">
                     
                       
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FaSignOutAlt className="mr-3" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;