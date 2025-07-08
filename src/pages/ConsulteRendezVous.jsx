import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Alert, Container, Card } from 'react-bootstrap';

const ConsulteRendezVous = () => {
    const [rendezvous, setRendezvous] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRdv, setCurrentRdv] = useState(null);
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

    const handleViewRdv = (rdv) => {
        setCurrentRdv(rdv);
        setShowModal(true);
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
                    <h2 className="text-2xl font-bold text-blue"  style={{ 
  fontSize: '1.75rem',
  fontWeight: 800,
  color: '#2563eb',
  letterSpacing: '-0.025em',
  margin: '1rem 0'
}}>Consultation des Rendez-vous</h2>
                </Card.Header>

                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-blue-700">
                            <tr>
                                <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/4">Patient</th>
                                <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/4">Date et Heure</th>
                                <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/3">Motif</th>
                                <th className="px-4 py-3 text-sm font-semibold text-white text-center w-1/6">Actions</th>
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
                                        <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[200px]">
                                            {rdv.motif}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button 
                                                onClick={() => handleViewRdv(rdv)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 text-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                                Détails
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-6 text-center text-gray-500">
                                        Aucun rendez-vous trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>

            {/* Modal Détails */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton className="border-b-2 border-gray-200 py-4">
                    <Modal.Title className="text-xl font-bold text-gray-800">
                        Détails du Rendez-vous
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="py-6">
                    {currentRdv && (
                        <div className="space-y-6">
                            {/* En-tête Patient */}
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                                    {getInitials(currentRdv.patient)}
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {currentRdv.patient ? 
                                            `${currentRdv.patient.nom} ${currentRdv.patient.prenom}` : 
                                            'Patient inconnu'}
                                    </h3>
                                    {currentRdv.patient?.age && (
                                        <p className="text-gray-600 mt-1">
                                            {currentRdv.patient.age} ans
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Détails RDV */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-500 mb-2">Date et Heure</h4>
                                        <p className="text-gray-900 font-medium">
                                            {formatDateTime(currentRdv.date_heure)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="col-span-1">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-500 mb-2">Motif</h4>
                                        <p className="text-gray-900 font-medium">
                                            {currentRdv.motif}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Historique Patient */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Historique Médical</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Antécédents médicaux:</label>
                                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                                            {currentRdv.patient?.antecedents || 'Non renseigné'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Traitements en cours:</label>
                                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                                            {currentRdv.patient?.traitements || 'Aucun traitement en cours'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="border-t-2 border-gray-200 py-4">
                    <Button 
                        onClick={() => setShowModal(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
     
        </div>
    );
};

export default ConsulteRendezVous;