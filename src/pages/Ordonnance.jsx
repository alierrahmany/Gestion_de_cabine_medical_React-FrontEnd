import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Button, Form, Modal, Card, 
  Container, Row, Col, Badge, Alert, Spinner
} from 'react-bootstrap';
import { 
  FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, 
  FaPills, FaInfoCircle, FaUserInjured, FaCalendarDay,
  FaPrint, FaEye
} from 'react-icons/fa';

const Ordonnance = () => {
  const [ordonnances, setOrdonnances] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentOrdonnance, setCurrentOrdonnance] = useState(null);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    patient_id: '',
    date: new Date().toISOString().split('T')[0],
    prescriptions: [
      { nom: '', dosage: '', frequence: '', duree: '' }
    ],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
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
      
      // CORRECTION ICI : Vérifier la structure de la réponse
      let ordonnancesData = [];
      
      if (ordRes.data && ordRes.data.success !== false) {
        // Si la réponse a une structure {success: true, data: [...]}
        ordonnancesData = ordRes.data.data || ordRes.data;
      } else {
        // Si la réponse est directement un tableau
        ordonnancesData = Array.isArray(ordRes.data) ? ordRes.data : [];
      }
      
      // S'assurer que c'est un tableau
      if (!Array.isArray(ordonnancesData)) {
        console.warn('Les données des ordonnances ne sont pas un tableau:', ordonnancesData);
        ordonnancesData = [];
      }
      
      setOrdonnances(ordonnancesData.map(ord => ({
        ...ord,
        date: formatDate(ord.date),
        // S'assurer que prescriptions est toujours un tableau
        prescriptions: Array.isArray(ord.prescriptions) ? ord.prescriptions : []
      })));

      // Même traitement pour les patients
      let patientsData = [];
      if (patientsRes.data && patientsRes.data.success !== false) {
        patientsData = patientsRes.data.data || patientsRes.data;
      } else {
        patientsData = Array.isArray(patientsRes.data) ? patientsRes.data : [];
      }
      
      if (!Array.isArray(patientsData)) {
        console.warn('Les données des patients ne sont pas un tableau:', patientsData);
        patientsData = [];
      }
      
      setPatients(patientsData);

    } catch (error) {
      console.error('Erreur détaillée:', error);
      handleError('Erreur de chargement des données', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdonnanceDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/ordonnances/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // CORRECTION : Gérer la structure de réponse
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      handleError('Erreur de chargement des détails', error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
  };

  const handleError = (message, error) => {
    console.error(message, error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Erreur inconnue';
    setError(`${message}: ${errorMessage}`);
    setTimeout(() => setError(''), 5000);
  };

  const handleModal = (ordonnance = null) => {
    setCurrentOrdonnance(ordonnance);
    
    if (ordonnance) {
      setFormData({ 
        ...ordonnance,
        prescriptions: Array.isArray(ordonnance.prescriptions) && ordonnance.prescriptions.length > 0 
          ? ordonnance.prescriptions 
          : [{ nom: '', dosage: '', frequence: '', duree: '' }]
      });
    } else {
      setFormData({
        patient_id: '',
        date: new Date().toISOString().split('T')[0],
        prescriptions: [{ nom: '', dosage: '', frequence: '', duree: '' }],
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleViewDetails = async (ordonnance) => {
    try {
      const details = await fetchOrdonnanceDetails(ordonnance.id);
      if (details) {
        setSelectedOrdonnance(details);
        setShowDetailModal(true);
      }
    } catch (error) {
      handleError('Erreur lors du chargement des détails', error);
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updatedPrescriptions = [...formData.prescriptions];
    updatedPrescriptions[index][field] = value;
    setFormData({
      ...formData,
      prescriptions: updatedPrescriptions
    });
  };

  const addPrescriptionLine = () => {
    setFormData({
      ...formData,
      prescriptions: [
        ...formData.prescriptions,
        { nom: '', dosage: '', frequence: '', duree: '' }
      ]
    });
  };

  const removePrescriptionLine = (index) => {
    if (formData.prescriptions.length > 1) {
      const updatedPrescriptions = formData.prescriptions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        prescriptions: updatedPrescriptions
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.patient_id || !formData.date) {
      setError('Les champs Patient et Date sont obligatoires');
      return;
    }

    const filteredPrescriptions = formData.prescriptions.filter(
      prescription => prescription.nom.trim() !== '' && prescription.dosage.trim() !== ''
    );

    if (filteredPrescriptions.length === 0) {
      setError('Au moins un médicament doit être renseigné');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = currentOrdonnance ? 'put' : 'post';
      const url = currentOrdonnance 
        ? `http://localhost:8000/api/ordonnances/${currentOrdonnance.id}`
        : 'http://localhost:8000/api/ordonnances';

      const submitData = {
        ...formData,
        prescriptions: filteredPrescriptions
      };

      const response = await axios[method](url, submitData, {
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

  const printOrdonnance = (ordonnance) => {
    const printWindow = window.open('', '_blank');
    const patientInfo = getPatientInfo(ordonnance.patient_id);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Ordonnance - ${patientInfo.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .patient-info { margin-bottom: 30px; }
            .medicaments { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .medicaments th, .medicaments td { border: 1px solid #000; padding: 10px; text-align: left; }
            .notes { margin-top: 30px; padding: 15px; border: 1px solid #000; }
            .signature { margin-top: 50px; text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ORDONNANCE MÉDICALE</h1>
            <p>Date: ${new Date(ordonnance.date).toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="patient-info">
            <h3>Patient: ${patientInfo.fullName}</h3>
          </div>
          
          <table class="medicaments">
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Dosage</th>
                <th>Fréquence</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              ${ordonnance.prescriptions.map(med => `
                <tr>
                  <td>${med.nom}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequence}</td>
                  <td>${med.duree}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${ordonnance.notes ? `
            <div class="notes">
              <strong>Notes et instructions:</strong>
              <p>${ordonnance.notes}</p>
            </div>
          ` : ''}
          
          <div class="signature">
            <p>Signature et cachet du médecin</p>
            <br><br>
            <p>_________________________</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const getPatientInfo = (patientId) => {
    const patient = patients.find(p => p.id == patientId);
    return patient ? {
      initials: `${patient.prenom?.[0]?.toUpperCase() || ''}.${patient.nom?.[0]?.toUpperCase() || ''}.`,
      fullName: `${patient.prenom || ''} ${patient.nom || ''}`.trim(),
      fullInfo: patient
    } : { initials: 'N/A', fullName: 'Patient inconnu', fullInfo: null };
  };

  const filteredOrdonnances = ordonnances.filter(ordonnance => {
    const patientInfo = getPatientInfo(ordonnance.patient_id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      patientInfo.fullName.toLowerCase().includes(searchLower) ||
      ordonnance.date.includes(searchTerm) ||
      (Array.isArray(ordonnance.prescriptions) && ordonnance.prescriptions.some(med => 
        med.nom && med.nom.toLowerCase().includes(searchLower)
      )) ||
      (ordonnance.notes && ordonnance.notes.toLowerCase().includes(searchLower))
    );
  });

  const SuccessModal = () => (
    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
      <Modal.Body className="text-center p-4">
        <FaCheckCircle className="text-success mb-3" size={40} />
        <h5 className="mb-3">{success}</h5>
        <Button 
          variant="success"
          onClick={() => setShowSuccessModal(false)}
        >
          Fermer
        </Button>
      </Modal.Body>
    </Modal>
  );

  const DetailModal = () => (
    <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaEye className="me-2" />
          Détails de l'Ordonnance
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedOrdonnance && (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Patient:</strong>
                <p className="mb-2">{getPatientInfo(selectedOrdonnance.patient_id).fullName}</p>
              </Col>
              <Col md={6}>
                <strong>Date:</strong>
                <p className="mb-2">{new Date(selectedOrdonnance.date).toLocaleDateString('fr-FR')}</p>
              </Col>
            </Row>
            
            <strong>Médicaments prescrits:</strong>
            <Table striped bordered className="mt-2">
              <thead className="bg-light">
                <tr>
                  <th>Médicament</th>
                  <th>Dosage</th>
                  <th>Fréquence</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(selectedOrdonnance.prescriptions) ? (
                  selectedOrdonnance.prescriptions.map((med, index) => (
                    <tr key={index}>
                      <td>{med.nom || 'Non spécifié'}</td>
                      <td>{med.dosage || 'Non spécifié'}</td>
                      <td>{med.frequence || 'Non spécifié'}</td>
                      <td>{med.duree || 'Non spécifié'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      Aucun médicament prescrit
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            
            {selectedOrdonnance.notes && (
              <div>
                <strong>Notes et instructions:</strong>
                <p className="mt-2 p-3 bg-light rounded">{selectedOrdonnance.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowDetailModal(false)}>
          Fermer
        </Button>
        <Button variant="primary" onClick={() => printOrdonnance(selectedOrdonnance)}>
          <FaPrint className="me-2" />
          Imprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <Container fluid className="py-4">
      <SuccessModal />
      <DetailModal />
      
      <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary mb-0">
            <FaPills className="me-2" />
            Gestion des Ordonnances
          </h2>
          <Button 
            variant="primary" 
            onClick={() => handleModal()}
            className="fw-semibold"
          >
            <FaPlusCircle className="me-2" />
            Nouvelle Ordonnance
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <FaInfoCircle className="me-2" />
            {error}
          </Alert>
        )}

        <Card className="shadow border-0">
          <Card.Header className="bg-primary text-white py-3">
            <Row className="align-items-center">
              <Col md={6}>
                <h5 className="mb-0">
                  <FaPills className="me-2" />
                  Liste des Ordonnances
                </h5>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher par patient, date ou médicament..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Chargement des ordonnances...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th width="25%">Patient</th>
                      <th width="15%">Date</th>
                      <th width="40%">Médicaments</th>
                      <th width="20%" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrdonnances.length > 0 ? (
                      filteredOrdonnances.map(ord => {
                        const patientInfo = getPatientInfo(ord.patient_id);
                        const prescriptions = Array.isArray(ord.prescriptions) ? ord.prescriptions : [];
                        
                        return (
                          <tr key={ord.id} className="align-middle">
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                  style={{ width: '40px', height: '40px', fontSize: '14px' }}
                                >
                                  {patientInfo.initials}
                                </div>
                                <div>
                                  <div className="fw-semibold">{patientInfo.fullName}</div>
                                  {patientInfo.fullInfo && patientInfo.fullInfo.date_naissance && (
                                    <small className="text-muted">
                                      Né le {new Date(patientInfo.fullInfo.date_naissance).toLocaleDateString('fr-FR')}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold text-primary">
                                {new Date(ord.date).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                {prescriptions.slice(0, 3).map((med, idx) => (
                                  <Badge 
                                    key={idx} 
                                    bg="info" 
                                    className="d-flex align-items-center px-3 py-2"
                                    style={{ fontSize: '12px' }}
                                  >
                                    <FaPills className="me-1" />
                                    {med.nom} {med.dosage ? `- ${med.dosage}` : ''}
                                  </Badge>
                                ))}
                                {prescriptions.length > 3 && (
                                  <Badge bg="secondary" className="px-3 py-2">
                                    +{prescriptions.length - 3} autres
                                  </Badge>
                                )}
                                {prescriptions.length === 0 && (
                                  <span className="text-muted">Aucun médicament</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-1">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleViewDetails(ord)}
                                  title="Voir les détails"
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleModal(ord)}
                                  title="Modifier"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => printOrdonnance(ord)}
                                  title="Imprimer"
                                >
                                  <FaPrint />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(ord.id)}
                                  title="Supprimer"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          <FaPills size={40} className="mb-3 opacity-50" />
                          <div>
                            {searchTerm ? 'Aucune ordonnance trouvée pour votre recherche' : 'Aucune ordonnance enregistrée'}
                          </div>
                          {!searchTerm && (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => handleModal()}
                            >
                              <FaPlusCircle className="me-1" />
                              Créer la première ordonnance
                            </Button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>
              <FaPills className="me-2" />
              {currentOrdonnance ? 'Modifier Ordonnance' : 'Nouvelle Ordonnance'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <FaUserInjured className="me-2" />
                      Patient *
                    </Form.Label>
                    <Form.Select
                      value={formData.patient_id}
                      onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                      required
                      className="border-2"
                    >
                      <option value="">Sélectionner un patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.prenom} {patient.nom} 
                          {patient.date_naissance && ` - Né le ${new Date(patient.date_naissance).toLocaleDateString('fr-FR')}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <FaCalendarDay className="me-2" />
                      Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                      className="border-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-semibold">
                    <FaPills className="me-2" />
                    Médicaments Prescrits
                  </h6>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={addPrescriptionLine}
                  >
                    <FaPlusCircle className="me-1" />
                    Ajouter une ligne
                  </Button>
                </Card.Header>
                <Card.Body>
                  {formData.prescriptions.map((prescription, index) => (
                    <Row key={index} className="g-2 mb-3 p-3 border rounded bg-white position-relative">
                      {formData.prescriptions.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="position-absolute"
                          style={{ top: '5px', right: '5px' }}
                          onClick={() => removePrescriptionLine(index)}
                          title="Supprimer cette ligne"
                        >
                          <FaTrash size={10} />
                        </Button>
                      )}
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Nom du médicament *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: Paracétamol"
                            value={prescription.nom}
                            onChange={(e) => handlePrescriptionChange(index, 'nom', e.target.value)}
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Dosage *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: 500mg"
                            value={prescription.dosage}
                            onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Fréquence</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: 3 fois/jour"
                            value={prescription.frequence}
                            onChange={(e) => handlePrescriptionChange(index, 'frequence', e.target.value)}
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Durée</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ex: 7 jours"
                            value={prescription.duree}
                            onChange={(e) => handlePrescriptionChange(index, 'duree', e.target.value)}
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  ))}
                  <Alert variant="info" className="small mb-0">
                    <FaInfoCircle className="me-2" />
                    Remplissez au moins un médicament. Les lignes vides seront ignorées.
                  </Alert>
                </Card.Body>
              </Card>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <FaInfoCircle className="me-2" />
                  Notes et Instructions
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Instructions supplémentaires pour le patient..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border-2"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button variant="success" type="submit" className="px-4">
                  {currentOrdonnance ? 'Modifier' : 'Enregistrer'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </Container>
  );
};

export default Ordonnance;