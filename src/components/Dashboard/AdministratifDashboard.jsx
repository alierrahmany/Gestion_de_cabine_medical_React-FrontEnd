import React, { useEffect } from 'react';
import GererUtilisateur from '../../pages/GererUtilisateur';
import CongesAdmin from '../../pages/CongesAdmin';
import Statistique from '../../pages/Statistique'; // Import the Statistique component

const AdministratifDashboard = ({ activeComponent, users, handleDeleteUser, fetchAllUsers, setActiveComponent }) => {
  // Set the default activeComponent to 'dashboard' when the component mounts
  useEffect(() => {
    setActiveComponent('dashboard');
  }, [setActiveComponent]);

  return (
    <div>
       <div>
       {activeComponent === 'dashboard' && <Statistique />}

    </div> 
       <div
    className="min-h-screen p-6 relative"
    style={{
      backgroundImage: `url('bg-banner.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}
  >
    {/* Superposition semi-transparente */}
   
   
    <div className="container-fluid">
      {/* Render Statistique component when activeComponent is 'dashboard' */}
     

      {/* Render GererUtilisateur component when activeComponent is 'utilisateur' */}
      {activeComponent === 'utilisateur' && (
        <GererUtilisateur
          users={users}
          handleDeleteUser={handleDeleteUser}
          fetchAllUsers={fetchAllUsers}
        />
      )}

      {/* Render CongesAdmin component when activeComponent is 'conges' */}
      {activeComponent === 'conges' && <CongesAdmin />}
    </div>
    </div>
    </div>
  );
};

export default AdministratifDashboard;