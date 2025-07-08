import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Spinner, Badge } from 'react-bootstrap';

const ListPatient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getInitials = (prenom, nom) => {
    const firstLetter = prenom?.[0]?.toUpperCase() || '?';
    const lastLetter = nom?.[0]?.toUpperCase() || '?';
    return `${firstLetter}${lastLetter}`;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data);
      } catch (error) {
        setError('Erreur lors de la récupération des patients');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div>
    <Card className="shadow-lg">
    <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3">
      <h5 className="mb-0 font-semibold">Liste des patiens </h5>
    </Card.Header>
   
      <Card.Body>
        {loading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-left">Patient</th>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-left">Date Naissance</th>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-left">Téléphone</th>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-left">Email</th>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-left">Adresse</th>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-left">Antécédents</th>
                  <th className="px-4 py-4 text-sm font-semibold text-white text-center">Hospitalisé</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div 
                          className="rounded-full bg-blue-600 text-white flex items-center justify-center" 
                          style={{
                            width: '35px',
                            height: '35px',
                            fontSize: '14px'
                          }}
                        >
                          {getInitials(patient.prenom, patient.nom)}
                        </div>
                        <span className="font-medium">
                          {patient.prenom} {patient.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{new Date(patient.date_naissance).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{patient.telephone}</td>
                    <td className="px-4 py-3">{patient.email}</td>
                    <td className="px-4 py-3">{patient.adresse}</td>
                    <td className="px-4 py-3">{patient.antecedents_medicaux}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        bg={patient.hospitalise ? 'success' : 'warning'} 
                        className="px-3 py-1.5 rounded-full"
                      >
                        {patient.hospitalise ? 'Oui' : 'Non'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card.Body>
    </Card>
    </div>
  );
};

export default ListPatient;