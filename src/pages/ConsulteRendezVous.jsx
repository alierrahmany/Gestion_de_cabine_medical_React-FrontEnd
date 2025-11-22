import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Container, Card } from 'react-bootstrap';

const ConsulteRendezVous = () => {
    const [rendezvous, setRendezvous] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchRendezvous();
    }, []);

    const fetchRendezvous = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/rendezvous', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRendezvous(response.data);
        } catch (error) {
            setError('Erreur lors de la récupération des rendez-vous');
            console.error(error);
        }
    };

    const formatDateTime = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const getInitials = (patient) => {
        if (!patient) return '?';
        const nom = patient.nom || '';
        const prenom = patient.prenom || '';
        return (nom.charAt(0) + prenom.charAt(0)).toUpperCase();
    };

    return (
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible className="mb-4">
                    {success}
                </Alert>
            )}

            <Card.Header className="bg- border-b-2 border-gray-200 py-4">
                <h2 className="text-2xl font-bold text-blue" style={{ 
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#2563eb',
                    letterSpacing: '-0.025em',
                    margin: '1rem 0'
                }}>
                    Consultation des Rendez-vous
                </h2>
            </Card.Header>

            <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-blue-700">
                        <tr>
                            <th className="px-4 py-3 text-sm font-semibold text-white text-left">Patient</th>
                            <th className="px-4 py-3 text-sm font-semibold text-white text-left">Date et Heure</th>
                            <th className="px-4 py-3 text-sm font-semibold text-white text-left">Motif</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {rendezvous.length > 0 ? (
                            rendezvous.map((rdv) => (
                                <tr key={rdv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                                                {getInitials(rdv.patient)}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {rdv.patient ? 
                                                        `${rdv.patient.nom} ${rdv.patient.prenom}` : 
                                                        'Patient inconnu'}
                                                </div>
                                                {rdv.patient?.age && (
                                                    <div className="text-xs text-gray-500">
                                                        {rdv.patient.age} ans
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatDateTime(rdv.date_heure)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {rdv.motif}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-6 text-center text-gray-500">
                                    Aucun rendez-vous trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConsulteRendezVous;