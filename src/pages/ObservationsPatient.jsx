import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, Alert, Container, Card, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const ObservationsPatient = () => {
  const [observations, setObservations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteObservationId, setDeleteObservationId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    patient_id: '',
    text: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [obsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/observations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setObservations(obsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      handleError('Erreur de chargement des données', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message, error) => {
    console.error(message, error);
    setMessage(`${message}: ${error.response?.data?.message || error.message}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.text) {
      setMessage('Les champs Patient et Observation sont obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editMode ? 'put' : 'post';
      const url = editMode 
        ? `http://localhost:8000/api/observations/${formData.id}`
        : 'http://localhost:8000/api/observations';

      const { data } = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(`Observation ${editMode ? 'modifiée' : 'ajoutée'} avec succès 🎉 !`);
      setShowSuccessModal(true);
      fetchData();
      handleCloseModal();
    } catch (error) {
      handleError(`Erreur lors de ${editMode ? 'la modification' : "l'ajout"}`, error);
    }
  };

  const handleDelete = (id) => {
    setDeleteObservationId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/observations/${deleteObservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Observation supprimée avec succès 🗑️!');
      setShowSuccessModal(true);
      fetchData();
    } catch (error) {
      handleError('Erreur de suppression', error);
    } finally {
      setShowDeleteModal(false);
      setDeleteObservationId(null);
    }
  };

  const handleEdit = (observation) => {
    setFormData({
      id: observation.id,
      patient_id: observation.patient_id,
      text: observation.text
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({ id: null, patient_id: '', text: '' });
  };

  const SuccessModal = () => (
    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
      <Modal.Body className="text-center p-4">
        <FaCheckCircle className="text-success mb-3" size={40} />
        <h5 className="mb-3">{message}</h5>
        <Button variant="outline-success" onClick={() => setShowSuccessModal(false)}>
          Fermer
        </Button>
      </Modal.Body>
    </Modal>
  );

  const DeleteConfirmationModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
      <Modal.Body className="text-center p-4">
        <h5 className="mb-3">Êtes-vous sûr de vouloir supprimer cette observation ?</h5>
        <p>Cette action est irréversible.</p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Confirmer la suppression
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.nom} ${patient.prenom}` : 'Patient inconnu';
  };

  const getPatientInitials = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.prenom?.[0].toUpperCase()}${patient.nom?.[0].toUpperCase()}` : '??';
  };

  const renderFormModal = () => (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {editMode ? 'Modifier Observation' : 'Nouvelle Observation'}
          <FaInfoCircle className="ms-2" title="Les champs marqués d'un * sont obligatoires" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Patient *</Form.Label>
            {editMode ? (
              <Form.Control 
                value={getPatientName(formData.patient_id)}
                readOnly 
              />
            ) : (
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
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Observation *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              required
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
  );

  return (
   
 <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
  
      <h2 className="mb-4 text-primary">
        Observations des Patients
      </h2>
      <Button 
        variant="primary" 
        onClick={() => setShowModal(true)}
        className="mb-4"
        size="sm"
      >
        <FaPlusCircle className="me-2" />
        Nouvelle Observation
      </Button>

      

<Card className="shadow-lg">
  <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3">
    <h5 className="mb-0 font-semibold">Liste des Observations</h5>
  </Card.Header>
  <Card.Body className="p-4">
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-white text-left">Patient</th>
                    <th className="px-6 py-4 text-sm font-semibold text-white text-left">Observation</th>
                    <th className="px-6 py-4 text-sm font-semibold text-white text-left">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-white text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map(obs => (
                    <tr key={obs.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            {getPatientInitials(obs.patient_id)}
                          </div>
                          <span className="ml-2 font-medium text-gray-800">
                            {getPatientName(obs.patient_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{obs.text}</td>
                      <td className="px-6 py-4">
                        {new Date(obs.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="link"
                          className="text-primary me-2 p-0"
                          onClick={() => handleEdit(obs)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleDelete(obs.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {observations.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center px-6 py-4">
                        Aucune observation enregistrée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {renderFormModal()}
      <SuccessModal />
      <DeleteConfirmationModal />

    </div>
  );
};

export default ObservationsPatient;