import React, { useEffect } from 'react';
import ConsulteRendezVous from '../../pages/ConsulteRendezVous';
import Ordonnance from '../../pages/Ordonnance';

const MedcinDashboard = ({ activeComponent, setActiveComponent }) => {
  // Set the default activeComponent to 'rendez_vous' when the component mounts
  useEffect(() => {
    setActiveComponent('rendez_vous');
  }, [setActiveComponent]);

  return (
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
      {activeComponent === 'rendez_vous' && <ConsulteRendezVous />}
      {activeComponent === 'ordonnance' && <Ordonnance />}
    </div>
  );
};

export default MedcinDashboard;