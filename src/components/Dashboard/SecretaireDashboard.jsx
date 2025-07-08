// SecretaireDashboard.js
import React, { useEffect } from 'react';
import Patient from '../../pages/Patient'; // Correct relative path
import RendezVous from '../../pages/RendezVous';
import CongesSecretaire from '../../pages/CongesSecretaire';
import Facture from '../../pages/Facture'; // Import the Facture component // Import the CongesSecretaire component
import Statistique from '../../pages/Statistique'; 
const SecretaireDashboard = ({ activeComponent,setActiveComponent }) => {
    useEffect(() => {
      setActiveComponent('dashboard');
    }, [setActiveComponent]);
  return (
    <div>
      
    <div>
       {activeComponent === 'dashboard' && <Statistique />}

    </div>

    <div
    className=" min-h-screen p-6"
    style={{
      backgroundImage:` url('bg-banner.jpg'`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}
  >
         {/* Render Statistique component when activeComponent is 'dashboard' */}
        
      {activeComponent === 'patient' && <Patient />}
      {activeComponent === 'rendez_vous' && <RendezVous />}
      {activeComponent === 'conges' && <CongesSecretaire />} {/* Render CongesSecretaire */}
      {activeComponent === 'facture' && <Facture />} {/* Render Facture */}
    </div>
    </div>
  );
};

export default SecretaireDashboard;