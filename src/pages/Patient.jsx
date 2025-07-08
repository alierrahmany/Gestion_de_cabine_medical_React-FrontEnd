import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaCheckCircle, FaSearch, FaFilter } from 'react-icons/fa';

const Patient = () => {
    const [patients, setPatients] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        id: null,
        nom: '',
        prenom: '',
        date_naissance: '',
        telephone: '',
        email: '',
        adresse: '',
        antecedents_medicaux: '',
        hospitalise: false,
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/patients', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setMessage('Erreur lors de la récupération des patients');
        }
    };
    const getInitials = (nom, prenom) => {
        const firstLetter = nom?.[0]?.toUpperCase() || '';
        const secondLetter = prenom?.[0]?.toUpperCase() || '';
        return `${firstLetter}${secondLetter}`;
      };
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFormSubmit = async (e, isEdit) => {
        e.preventDefault();
        if (!formData.nom || !formData.prenom) {
            setMessage('Les champs Nom et Prénom sont obligatoires');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const url = isEdit 
                ? `http://localhost:8000/api/patients/${formData.id}`
                : 'http://localhost:8000/api/patients';
            
            const method = isEdit ? 'put' : 'post';
            
            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage(`Patient ${isEdit ? 'modifié' : 'ajouté'} avec succès !`);
            setShowSuccessModal(true);
            fetchPatients();
            isEdit ? setShowEditModal(false) : setShowAddModal(false);
            resetFormData();
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} patient:`, error);
            setMessage(`Erreur lors de ${isEdit ? 'la modification' : "l'ajout"} du patient`);
        }
    };

    const handleDeletePatient = async (id) => {
        setSelectedPatientId(id);
        setShowDeleteModal(true);
    };

    const confirmDeletePatient = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/patients/${selectedPatientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Patient supprimé avec succès !');
            setShowSuccessModal(true);
            fetchPatients();
        } catch (error) {
            console.error('Error deleting patient:', error);
            setMessage('Erreur lors de la suppression du patient');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleEditPatient = (patient) => {
        setFormData({
            id: patient.id,
            ...patient
        });
        setShowEditModal(true);
    };

    const resetFormData = () => {
        setFormData({
            id: null,
            nom: '',
            prenom: '',
            date_naissance: '',
            telephone: '',
            email: '',
            adresse: '',
            antecedents_medicaux: '',
            hospitalise: false,
        });
    };

    const filteredPatients = patients.filter(patient => 
        patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.telephone && patient.telephone.includes(searchTerm))
    );

    const SuccessModal = () => (
        <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
            <Modal.Body className="text-center p-4">
                <FaCheckCircle className="text-success mb-3" size={40} />
                <h5 className="mb-3">{message}</h5>
                <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
                    Fermer
                </Button>
            </Modal.Body>
        </Modal>
    );

    const DeleteConfirmationModal = () => (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Body className="text-center p-4">
                <h5 className="mb-3">Êtes-vous sûr de vouloir supprimer définitivement ce patient ? Cette action est irréversible.</h5>
                <div className="d-flex justify-content-center gap-2">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="rounded-pill">
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={confirmDeletePatient} className="rounded-pill">
                        Confirmer la suppression
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );

    const renderFormModal = (isEdit) => (
        <Modal 
            show={isEdit ? showEditModal : showAddModal} 
            onHide={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
            size="lg"
        >
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="text-primary">
                    {isEdit ? 'Modifier le patient' : 'Nouveau patient'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={(e) => handleFormSubmit(e, isEdit)}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleInputChange}
                                    required
                                    className="rounded-pill"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Prénom <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleInputChange}
                                    required
                                    className="rounded-pill"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date de naissance</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date_naissance"
                                    value={formData.date_naissance}
                                    onChange={handleInputChange}
                                    className="rounded-pill"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Téléphone</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleInputChange}
                                    pattern="[0-9]{10}"
                                    title="Numéro de téléphone à 10 chiffres"
                                    className="rounded-pill"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="rounded-pill"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Adresse</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleInputChange}
                            className="rounded-3"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Antécédents médicaux</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="antecedents_medicaux"
                            value={formData.antecedents_medicaux}
                            onChange={handleInputChange}
                            className="rounded-3"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Check
                            type="switch"
                            id="hospitalise-switch"
                            name="hospitalise"
                            label="Patient hospitalisé"
                            checked={formData.hospitalise}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="light" onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)} className="rounded-pill">
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" className="rounded-pill">
                            {isEdit ? 'Modifier' : 'Enregistrer'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );

    return (
        <div >
        <Container fluid className="p-4">
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <h2 className="mb-4 text-primary">Gestion des patients</h2>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <InputGroup className="w-50">
                        <InputGroup.Text className="bg-light border-end-0">
                            <FaSearch className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Rechercher par nom, prénom, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-start-0 rounded-end"
                        />
                    </InputGroup>
                    
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-secondary" 
                            className="rounded-pill d-flex align-items-center"
                        >
                            <FaFilter className="me-2" />
                            Filtrer
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => setShowAddModal(true)}
                            className="rounded-pill d-flex align-items-center"
                        >
                            <FaPlus className="me-2" />
                            Nouveau patient
                        </Button>
                    </div>
                </div>
                <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
  <div className="overflow-x-auto rounded-lg shadow">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-blue-600">
        <tr>
          <th className="px-4 py-4 text-sm font-semibold text-white text-left">ID</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">NOM</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">PRÉNOM</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">NAISSANCE</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">TÉLÉPHONE</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">EMAIL</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">ADRESSE</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">ANTÉCÉDENTS</th>
          <th className="px-4 py-4 text-sm font-semibold text-white">STATUT</th>
          <th className="px-4 py-4 text-sm font-semibold text-white text-center">ACTIONS</th>
        </tr>
      </thead>
      
      <tbody className="bg-white">
        {filteredPatients.map((patient) => (
          <tr 
            key={patient.id} 
            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            {/* ID */}
            <td className="px-4 py-3 text-gray-700">{patient.id}</td>

            {/* Nom avec avatar */}
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{getInitials(patient.nom, patient.prenom)}</span>
                </div>
                <span className="font-medium text-gray-800">{patient.nom}</span>
              </div>
            </td>

            {/* Prénom */}
            <td className="px-4 py-3 text-gray-700">{patient.prenom}</td>

            {/* Date de naissance */}
            <td className="px-4 py-3 text-gray-600">{patient.date_naissance || '-'}</td>

            {/* Téléphone */}
            <td className="px-4 py-3 text-gray-600">{patient.telephone || '-'}</td>

            {/* Email */}
            <td className="px-4 py-3 text-gray-600">{patient.email || '-'}</td>

            {/* Adresse */}
            <td className="px-4 py-3 text-gray-600 max-w-[200px]">{patient.adresse || '-'}</td>

            {/* Antécédents */}
            <td className="px-4 py-3 text-gray-600 max-w-[250px]">{patient.antecedents_medicaux || '-'}</td>

            {/* Statut */}
            <td>
        <span className={`badge rounded-pill ${patient.hospitalise ? 'bg-danger' : 'bg-success'}`}>
          {patient.hospitalise ? 'Hospitalisé' : 'Ambulatoire'}
        </span>
      </td>

            {/* Actions */}
            <td className="px-4 py-3 text-center">
              <div className="flex justify-center gap-2">
            
                                        <Button
                                            variant="link"
                                            className="text-primary me-2 p-0"
                                            onClick={() => handleEditPatient(patient)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-danger p-0"
                                            onClick={() => handleDeletePatient(patient.id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                 
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
            </div>

            {renderFormModal(false)}
            {renderFormModal(true)}
            <SuccessModal />
            <DeleteConfirmationModal />
        </Container>
        </div>
    );
};

export default Patient;