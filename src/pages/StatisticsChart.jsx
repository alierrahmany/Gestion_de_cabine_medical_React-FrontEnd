import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const StatisticsChart = ({ statistiques }) => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  useEffect(() => {
    // Destruction des graphiques existants
    const destroyCharts = () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
        barChartInstance.current = null;
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
        pieChartInstance.current = null;
      }
    };

    destroyCharts();

    if (statistiques && barChartRef.current && pieChartRef.current) {
      // Configuration commune des données
      const chartLabels = [
        'Patients', 
        'Rendez-vous', 
        'Congés', 
        'Équipements',
        'Médecins',
        'Infirmiers',
        'Techniciens',
        'Secrétaires'
      ];

      const chartData = [
        statistiques.totalPatients || 0,
        statistiques.totalRendezvous || 0,
        statistiques.totalConges || 0,
        statistiques.totalEquipments || 0,
        statistiques.totalMedecins || 0,
        statistiques.totalInfirmiers || 0,
        statistiques.totalTechniciens || 0,
        statistiques.totalSecretaires || 0,
      ];

      const chartColors = [
        { bg: 'rgba(102, 178, 255, 0.6)', border: 'rgba(102, 178, 255, 1)' },
        { bg: 'rgba(153, 204, 255, 0.6)', border: 'rgba(153, 204, 255, 1)' },
        { bg: 'rgba(102, 255, 178, 0.6)', border: 'rgba(102, 255, 178, 1)' },
        { bg: 'rgba(255, 204, 102, 0.6)', border: 'rgba(255, 204, 102, 1)' },
        { bg: 'rgba(204, 153, 255, 0.6)', border: 'rgba(204, 153, 255, 1)' },
        { bg: 'rgba(255, 153, 204, 0.6)', border: 'rgba(255, 153, 204, 1)' },
        { bg: 'rgba(255, 255, 153, 0.6)', border: 'rgba(255, 255, 153, 1)' },
        { bg: 'rgba(153, 255, 255, 0.6)', border: 'rgba(153, 255, 255, 1)' },
      ];
      
      // Création du bar chart
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [{
            label: 'Statistiques',
            data: chartData,
            backgroundColor: chartColors.map(c => c.bg),
            borderColor: chartColors.map(c => c.border),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
      
      // Création du pie chart
      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors.map(c => c.bg),
            borderColor: chartColors.map(c => c.border),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' },
            tooltip: { enabled: true }
          }
        }
      });
    }

    // Nettoyage lors du démontage du composant
    return () => destroyCharts();
  }, [statistiques]);

  return (
    <div className="row mt-4">
      <div className="col-md-12">
        <h4>Statistiques globales</h4>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h5 className="card-title">Répartition par catégorie (Barres)</h5>
                <div style={{ height: '400px' }}>
                  <canvas ref={barChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h5 className="card-title">Répartition proportionnelle (Circulaire)</h5>
                <div style={{ height: '400px' }}>
                  <canvas ref={pieChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;