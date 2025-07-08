import React, { useEffect } from 'react';
import ListEquipement from '../../pages/ListEquipement'; // Import the ListEquipement component
import DemandeMaintenance from '../../pages/DemandeMaintenance';

const TechnicienDashboard = ({ activeComponent, setActiveComponent }) => {
  // Set the default activeComponent to 'liste_equipements' when the component mounts
  useEffect(() => {
    setActiveComponent('equipements');
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
      {/* Render the appropriate component based on the activeComponent prop */}
      {activeComponent === 'equipements' && <ListEquipement />}
      {activeComponent === 'maintenance' && <DemandeMaintenance />}
    </div>
  );
};

export default TechnicienDashboard;