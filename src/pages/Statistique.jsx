import React, { useEffect, useState } from 'react';
import { 
  FaUserInjured, 
  FaCalendarCheck, 
  FaUmbrellaBeach, 
  FaTools,
  FaUserMd, 
  FaUserNurse, 
  FaCogs, 
  FaUserSecret 
} from 'react-icons/fa';
import StatisticsChart from './StatisticsChart';

const StatisticCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className={`card ${bgColor} ${textColor} shadow h-100`}>
    <div className="card-body">
      <div className="d-flex align-items-center">
        <Icon size={40} className="mr-3" />
        <div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text h4">{value}</p>
        </div>
      </div>
    </div>
  </div>
);

const Statistique = () => {
  const [statistiques, setStatistiques] = useState({
    totalPatients: 0,
    totalRendezvous: 0,
    totalConges: 0,
    totalEquipments: 0,
    totalMedecins: 0,
    totalTechniciens: 0,
    totalSecretaires: 0,
  });

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/statistiques', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Erreur de récupération des données');
        
        const data = await response.json();
        setStatistiques(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchStatistiques();
  }, []);

  return (
    <div className="container-fluid">
      {/* Première ligne - Statistiques principales */}
      <div className="row mt-4">
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Patients"
            value={statistiques.totalPatients}
            icon={FaUserInjured}
            bgColor="bg-primary"
            textColor="text-white"
          />
        </div>
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Rendez-vous"
            value={statistiques.totalRendezvous}
            icon={FaCalendarCheck}
            bgColor="bg-success"
            textColor="text-white"
          />
        </div>
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Congés"
            value={statistiques.totalConges}
            icon={FaUmbrellaBeach}
            bgColor="bg-warning"
            textColor="text-dark"
          />
        </div>
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Équipements"
            value={statistiques.totalEquipments}
            icon={FaTools}
            bgColor="bg-danger"
            textColor="text-white"
          />
        </div>
      </div>

      {/* Deuxième ligne - Statistiques du personnel */}
      <div className="row">
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Médecins"
            value={statistiques.totalMedecins}
            icon={FaUserMd}
            bgColor="bg-info"
            textColor="text-white"
          />
        </div>
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Techniciens"
            value={statistiques.totalTechniciens}
            icon={FaCogs}
            bgColor="bg-dark"
            textColor="text-white"
          />
        </div>
        <div className="col-md-3 mb-4">
          <StatisticCard
            title="Secrétaires"
            value={statistiques.totalSecretaires}
            icon={FaUserSecret}
            bgColor="bg-light"
            textColor="text-dark"
          />
        </div>
      </div>

      <StatisticsChart statistiques={statistiques} />
    </div>
  );
};

export default Statistique;