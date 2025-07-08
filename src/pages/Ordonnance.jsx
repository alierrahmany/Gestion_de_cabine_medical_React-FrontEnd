import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Form, Modal, Card, 
  Container, Row, Col, Badge, Alert, Spinner
} from 'react-bootstrap';
import { 
  FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, 
  FaPills, FaInfoCircle, FaUserInjured, FaCalendarDay 
} from 'react-icons/fa';

const Ordonnance = () => {
  const [ordonnances, setOrdonnances] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentOrdonnance, setCurrentOrdonnance] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    date: new Date().toISOString().split('T')[0],
    prescriptions: [],
    notes: ''
  });
  
  const [newMedicament, setNewMedicament] = useState({
    nom: '',
    dosage: '',
    frequence: '',
    duree: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [ordRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/ordonnances', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setOrdonnances(ordRes.data.map(ord => ({
        ...ord,
        date: formatDate(ord.date)
      })));
      setPatients(patientsRes.data);
    } catch (error) {
      handleError('Erreur de chargement des données', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleError = (message, error) => {
    console.error(message, error);
    setError(`${message}: ${error.response?.data?.message || error.message}`);
    setTimeout(() => setError(''), 5000);
  };

  const handleModal = (ordonnance = null) => {
    setCurrentOrdonnance(ordonnance);
    setFormData(ordonnance ? { 
      ...ordonnance,
      prescriptions: ordonnance.prescriptions || []
    } : {
      patient_id: '',
      date: new Date().toISOString().split('T')[0],
      prescriptions: [],
      notes: ''
    });
    setShowModal(true);
  };

  const handleAddMedicament = () => {
    if (!newMedicament.nom.trim() || !newMedicament.dosage.trim()) {
      setError('Le nom et le dosage sont obligatoires');
      return;
    }

    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { ...newMedicament }]
    }));

    setNewMedicament({ nom: '', dosage: '', frequence: '', duree: '' });
  };

  const handleRemoveMedicament = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.patient_id || !formData.date) {
      setError('Les champs Patient et Date sont obligatoires');
      return;
    }

    if (formData.prescriptions.length === 0) {
      setError('Au moins un médicament doit être ajouté');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = currentOrdonnance ? 'put' : 'post';
      const url = currentOrdonnance 
        ? `http://localhost:8000/api/ordonnances/${currentOrdonnance.id}`
        : 'http://localhost:8000/api/ordonnances';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Ordonnance ${currentOrdonnance ? 'modifiée' : 'créée'} avec succès`);
      setShowSuccessModal(true);
      fetchData();
      setShowModal(false);
    } catch (error) {
      handleError('Erreur lors de la sauvegarde', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/ordonnances/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Ordonnance supprimée avec succès');
        setShowSuccessModal(true);
        fetchData();
      } catch (error) {
        handleError('Erreur de suppression', error);
      }
    }
  };

  const SuccessModal = () => (
    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
      <Modal.Body className="text-center p-4">
        <FaCheckCircle className="text-success mb-3" size={40} />
        <h5 className="mb-3">{success}</h5>
        <Button 
          variant="success"
          onClick={() => setShowSuccessModal(false)}
          className="mx-auto"
        >
          Fermer
        </Button>
      </Modal.Body>
    </Modal>
  );

  const getPatientInfo = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? {
      initials: `${patient.prenom?.[0]?.toUpperCase()}.${patient.nom?.[0]?.toUpperCase()}.`,
      fullName: `${patient.prenom} ${patient.nom}`
    } : { initials: 'N/A', fullName: 'Patient inconnu' };
  };

  return (
    
  <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
      <SuccessModal />
      
      <h2 className="flex justify-between items-center mb-6">
      <h2            className="mb-4 text-primary">    Gestion des Ordonnances</h2>
     
        <Button 
          variant="primary" 
          onClick={() => handleModal()}
          className="ms-3"
        >
          <FaPlusCircle className="me-2" />
          Nouvelle Ordonnance
        </Button>
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <FaInfoCircle className="me-2" />
          {error}
        </Alert>
      )}
<Card className="shadow">
  <Card.Header className="bg-blue-600 text-white">
    
  </Card.Header>
  <Card.Body>
    {loading ? (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : (
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Patient</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Médicaments</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ordonnances.map(ord => {
            const patientInfo = getPatientInfo(ord.patient_id);
            return (
              <tr key={ord.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-600 text-white flex items-center justify-center" 
                         style={{ width: '35px', height: '35px', marginRight: '10px' }}>
                      {patientInfo.initials}
                    </div>
                    <div className="text-gray-900">
                      {patientInfo.fullName}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                  {new Date(ord.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {ord.prescriptions.map((med, idx) => (
                      <Badge 
                        key={`${ord.id}-${med.nom}-${idx}`} 
                        bg="info" 
                        pill
                        className="d-flex align-items-center"
                      >
                        <FaPills className="me-1" />
                        {med.nom}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <Button
                    variant="outline-warning"
                    className="me-2"
                    onClick={() => handleModal(ord)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleDelete(ord.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            );
          })}
          {ordonnances.length === 0 && (
            <tr>
              <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                Aucune ordonnance enregistrée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </Card.Body>
</Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaPills className="me-2" />
            {currentOrdonnance ? 'Modifier Ordonnance' : 'Nouvelle Ordonnance'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaUserInjured className="me-2" />
                    Patient *
                  </Form.Label>
                  <Form.Select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.prenom} {patient.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaCalendarDay className="me-2" />
                    Date *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>
                <FaInfoCircle className="me-2" />
                Notes
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Form.Group>

            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h6 className="mb-0">
                  <FaPills className="me-2" />
                  Médicaments Prescrits
                </h6>
                <Badge bg="primary">{formData.prescriptions.length}</Badge>
              </Card.Header>
              <Card.Body>
                {formData.prescriptions.map((med, index) => (
                  <div key={index} className="d-flex align-items-center gap-2 mb-2">
                    <div className="flex-grow-1">
                      <strong>{med.nom}</strong> ({med.dosage}) - {med.frequence} pendant {med.duree}
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveMedicament(index)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
                {formData.prescriptions.length === 0 && (
                  <Alert variant="info" className="mb-0">
                    <FaInfoCircle className="me-2" />
                    Aucun médicament ajouté
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <FaPlusCircle className="me-2" />
                Ajouter un Médicament
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Control
                      placeholder="Nom *"
                      value={newMedicament.nom}
                      onChange={(e) => setNewMedicament({...newMedicament, nom: e.target.value})}
                      required
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      placeholder="Dosage *"
                      value={newMedicament.dosage}
                      onChange={(e) => setNewMedicament({...newMedicament, dosage: e.target.value})}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      placeholder="Fréquence"
                      value={newMedicament.frequence}
                      onChange={(e) => setNewMedicament({...newMedicament, frequence: e.target.value})}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      placeholder="Durée"
                      value={newMedicament.duree}
                      onChange={(e) => setNewMedicament({...newMedicament, duree: e.target.value})}
                    />
                  </Col>
                  <Col md={1}>
                    <Button 
                      variant="primary" 
                      onClick={handleAddMedicament}
                      className="w-100"
                    >
                      <FaPlusCircle />
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="success" type="submit">
                {currentOrdonnance ? 'Modifier' : 'Enregistrer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
  
    </div>
  );
};

export default Ordonnance;