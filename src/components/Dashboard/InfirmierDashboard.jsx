import React, { useEffect } from 'react';
import ListPatient from '../../pages/ListPatient'; // Import the ListPatient component
import ObservationsPatient from '../../pages/ObservationsPatient'; // Import the ObservationsPatient component

const InfirmierDashboard = ({ activeComponent, setActiveComponent }) => {
  // Set the default activeComponent to 'patients' when the component mounts
  useEffect(() => {
    setActiveComponent('patients');
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
      {activeComponent === 'patients' && <ListPatient />}
      {activeComponent === 'observations' && <ObservationsPatient />}
    </div>
  );
};

export default InfirmierDashboard;