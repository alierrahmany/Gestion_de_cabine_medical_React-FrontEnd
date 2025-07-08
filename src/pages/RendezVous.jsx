import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import { 
  FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, 
  FaSearch, FaUserCircle, FaCalendarAlt 
} from 'react-icons/fa';

const RendezVous = () => {
  const [rendezvous, setRendezvous] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    patient_id: '',
    date_heure: '',
    motif: ''
  });

  // Chargement des données
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [rdvRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/rendezvous', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setRendezvous(rdvRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      handleError('Erreur de chargement des données', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Gestion des erreurs
  const handleError = (message, error) => {
    console.error(message, error);
    setMessage(`${message}: ${error.response?.data?.message || error.message}`);
    setShowSuccessModal(true);
  };

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.date_heure) {
      setMessage('Les champs Patient et Date/Heure sont obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editMode ? 'put' : 'post';
      const url = editMode 
        ? `http://localhost:8000/api/rendezvous/${formData.id}`
        : 'http://localhost:8000/api/rendezvous';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(`Rendez-vous ${editMode ? 'modifié' : 'ajouté'} avec succès !`);
      setShowSuccessModal(true);
      fetchData();
      handleCloseModal();
    } catch (error) {
      handleError(`Erreur lors de ${editMode ? 'la modification' : "l'ajout"}`, error);
    }
  };

  // Gestion suppression
  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/rendezvous/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Rendez-vous supprimé avec succès !');
      setShowSuccessModal(true);
      fetchData();
    } catch (error) {
      handleError('Erreur de suppression', error);
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  // Édition d'un rendez-vous
  const handleEdit = (rdv) => {
    setFormData({
      ...rdv,
      date_heure: rdv.date_heure.slice(0, 16)
    });
    setEditMode(true);
    setShowModal(true);
  };

  // Fermeture modale
  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({ id: null, patient_id: '', date_heure: '', motif: '' });
  };

  // Filtrage des résultats
  const filteredRendezVous = rendezvous.filter(rdv => {
    const searchLower = searchQuery.toLowerCase();
    const patient = patients.find(p => p.id === rdv.patient_id);
    return (
      patient?.nom?.toLowerCase().includes(searchLower) ||
      patient?.prenom?.toLowerCase().includes(searchLower) ||
      rdv.date_heure?.toLowerCase().includes(searchLower) ||
      rdv.motif?.toLowerCase().includes(searchLower)
    );
  });

  // Badge statut
  const getStatusBadge = (date) => {
    const now = new Date();
    const rdvDate = new Date(date);
    return rdvDate > now ? (
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
        À VENIR
      </span>
    ) : (
      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
        PASSÉ
      </span>
    );
  };

  // Formatage date
  const FormattedDate = ({ date }) => (
    <div className="flex items-center gap-2">
      <FaCalendarAlt className="text-gray-400" />
      <div className="flex flex-col">
        <span className="font-medium">
          {new Date(date).toLocaleDateString('fr-FR')}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(date).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-4 my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Rendez-vous</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <FaPlusCircle /> Nouveau RDV
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tableau principal */}
      <div className="rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Date/Heure</th>
              <th className="px-4 py-3 text-left">Motif</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center">Chargement...</td>
              </tr>
            ) : filteredRendezVous.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  Aucun rendez-vous trouvé
                </td>
              </tr>
            ) : (
              filteredRendezVous.map(rdv => {
                const patient = patients.find(p => p.id === rdv.patient_id);
                return (
                  <tr key={rdv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          {patient?.prenom?.[0]?.toUpperCase()}{patient?.nom?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{patient?.prenom} {patient?.nom}</div>
                          <div className="text-sm text-gray-500">{patient?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <FormattedDate date={rdv.date_heure} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {rdv.motif || 'Non spécifié'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(rdv.date_heure)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline-warning"
                          onClick={() => handleEdit(rdv)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleDelete(rdv.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modale formulaire */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient *</Form.Label>
              <Form.Select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nom} {patient.prenom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date et Heure *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date_heure"
                value={formData.date_heure}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motif</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="motif"
                value={formData.motif}
                onChange={handleInputChange}
                placeholder="Décrire le motif..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? 'Modifier' : 'Enregistrer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modales de confirmation */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        message={message}
      />
    </div>
  );
};

// Composants modaux
const DeleteConfirmationModal = ({ show, onHide, onConfirm }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Body className="text-center p-6">
      <FaUserCircle className="text-red-500 text-4xl mx-auto mb-4" />
      <h5 className="text-lg font-medium mb-4">
        Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
      </h5>
      <div className="flex justify-center gap-3">
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirmer
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

const SuccessModal = ({ show, onHide, message }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Body className="text-center p-6">
      <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
      <h5 className="text-lg font-medium mb-4">{message}</h5>
      <Button variant="success" onClick={onHide}>
        Fermer
      </Button>
    </Modal.Body>
  </Modal>
);

export default RendezVous;