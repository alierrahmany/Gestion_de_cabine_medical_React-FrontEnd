import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Modal, Form, Container, Card, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { 
  FaCheckCircle, FaPlusCircle, FaTools, FaAlignLeft, 
  FaInfoCircle, FaClock, FaCheck, FaEdit, FaTrash, 
  FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';

const DemandeMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null); // Fixed: renamed from equipmentToDelete to requestToDelete
  const [isChecked, setIsChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    id: null,
    equipment_id: '',
    description: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const filterRequests = () => {
    let filtered = [...requests];
    
    // Apply search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        (request.equipment?.name?.toLowerCase().includes(term)) ||
        (request.description?.toLowerCase().includes(term)) ||
        (request.equipment?.serial_number?.toLowerCase().includes(term))
      );
    }
    
    // Apply status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [requestsRes, equipmentsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/maintenance-requests', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/equipments', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setRequests(requestsRes.data);
      setFilteredRequests(requestsRes.data);
      setEquipments(equipmentsRes.data);
    } catch (error) {
      handleError('Erreur de chargement', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message, error) => {
    console.error(message, error);
    setError(`${message}: ${error.response?.data?.message || error.message}`);
  };

  const handleEdit = (request = null) => {
    if (request) {
      setFormData({
        id: request.id,
        equipment_id: request.equipment_id,
        description: request.description,
        status: request.status
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        equipment_id: equipments[0]?.id || '',
        description: '',
        status: 'pending'
      });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editMode ? 'put' : 'post';
      const url = editMode 
        ? `http://localhost:8000/api/maintenance-requests/${formData.id}`
        : 'http://localhost:8000/api/maintenance-requests';

      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      
      setSuccess(`Demande ${editMode ? 'modifiée' : 'créée'} avec succès 🎉`);
      setShowSuccessModal(true);
      fetchData();
      setShowModal(false);
    } catch (error) {
      handleError(`Erreur ${editMode ? 'de modification' : 'de création'}`, error);
    }
  };

  const handleDelete = (id) => {
    setRequestToDelete(id); // Fixed: use setRequestToDelete instead of setEquipmentToDelete
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!isChecked) {
      setError('Veuillez cocher la case pour confirmer la suppression.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/maintenance-requests/${requestToDelete}`, { // Fixed: use requestToDelete
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Demande supprimée avec succès 🗑️');
      setShowSuccessModal(true);
      fetchData();
      setShowDeleteModal(false); // Fixed: close modal after successful deletion
      setRequestToDelete(null); // Fixed: reset requestToDelete
      setIsChecked(false); // Fixed: reset checkbox
    } catch (error) {
      handleError('Erreur de suppression', error);
      setShowDeleteModal(false); // Close modal even on error
      setRequestToDelete(null);
      setIsChecked(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/maintenance-requests/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Demande marquée comme terminée ✅');
      setShowSuccessModal(true);
      fetchData();
    } catch (error) {
      handleError('Erreur de mise à jour', error);
    }
  };

  // Function to get the first letter of the equipment name
  const getFirstLetterIcon = (name) => {
    if (!name) return null;
    const firstLetter = name.charAt(0).toUpperCase();
    return (
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '10px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {firstLetter}
      </div>
    );
  };

  const SuccessModal = () => (
    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
      <Modal.Body className="text-center p-4">
        <FaCheckCircle className="text-success mb-3" size={40} />
        <h5 className="mb-3">{success}</h5>
        <Button 
          variant="outline-success" 
          onClick={() => setShowSuccessModal(false)}
          className="d-flex align-items-center gap-2 mx-auto"
        >
          <FaCheckCircle /> Fermer
        </Button>
      </Modal.Body>
    </Modal>
  );

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <SuccessModal />

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => {
          setShowDeleteModal(false);
          setRequestToDelete(null); // Reset when closing modal
          setIsChecked(false); // Reset checkbox when closing modal
        }} centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-2">
              <FaInfoCircle className="text-danger" />
              Confirmation de suppression
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="text-center mb-3">
              <FaInfoCircle className="text-danger mb-3" size={40} />
              <h5 className="mb-3">Êtes-vous sûr de vouloir supprimer cette demande?</h5>
              <p className="text-muted">Cette action est irréversible.</p>
            </div>
            <Form.Check
              type="checkbox"
              label="Je confirme la suppression"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mb-3"
            />
            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setRequestToDelete(null);
                  setIsChecked(false);
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                onClick={confirmDelete}
                disabled={!isChecked}
                className="d-flex align-items-center gap-2"
              >
                <FaTrash /> Confirmer la suppression
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h2 className="text-primary d-flex align-items-center mb-0">
            <FaTools className="me-2" />
            Gestion des Demandes de Maintenance
          </h2>
          <Button 
            variant="primary" 
            onClick={() => handleEdit()}
            className="d-flex align-items-center gap-2 shadow-sm"
          >
            <FaPlusCircle />
            Nouvelle Demande
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2">
            <FaInfoCircle /> {error}
          </Alert>
        )}

        <Card className="shadow-sm border-0 mb-4 overflow-hidden">
          <Card.Header className="bg-primary text-white py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FaTools /> Liste des Demandes de Maintenance
              </h5>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Search and Filter Section */}
            <div className="mb-4 row g-3">
              <div className="col-md-6">
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-end-0">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Rechercher un équipement, un numéro de série ou une description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </div>
              <div className="col-md-3">
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-end-0">
                    <FaFilter />
                  </InputGroup.Text>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-start-0"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="completed">Terminées</option>
                  </Form.Select>
                </InputGroup>
              </div>
              <div className="col-md-3">
                <Button 
                  variant="outline-secondary" 
                  onClick={clearFilters}
                  className="w-100"
                >
                  Effacer les filtres
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-primary">Chargement des données...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center p-5 bg-light rounded">
                <FaInfoCircle size={30} className="text-secondary mb-3" />
                <h5>Aucune demande trouvée</h5>
                <p className="text-muted">
                  {searchTerm || statusFilter !== 'all' ? 
                    "Aucun résultat ne correspond à votre recherche. Essayez de modifier vos filtres." : 
                    "Aucune demande de maintenance n'a été créée. Cliquez sur 'Nouvelle Demande' pour commencer."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-blue-700">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/4">
                        <div className="d-flex align-items-center">
                          Équipement
                          <FaSortAmountDown className="ms-2" size={12} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/4">Description</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/4">Statut</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left w-1/4">
                        <div className="d-flex align-items-center">
                          Date
                          <FaSortAmountDown className="ms-2" size={12} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-center w-1/4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(request => (
                      <tr key={request.id} className="align-middle"> 
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            {getFirstLetterIcon(request.equipment?.name)}
                            <div>
                              <div className="fw-bold">{request.equipment?.name || 'N/A'}</div>
                              <small className="text-muted">{request.equipment?.serial_number || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div style={{ maxHeight: "80px", overflow: "auto" }}>
                            {request.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge bg={request.status === 'pending' ? 'warning' : 'success'} 
                                pill 
                                className="px-3 py-2 d-inline-flex align-items-center gap-1">
                            {request.status === 'pending' ? (
                              <><FaClock /> En attente</>
                            ) : (
                              <><FaCheck /> Terminée</>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex flex-column">
                            <span>{new Date(request.request_date).toLocaleDateString('fr-FR')}</span>
                            <small className="text-muted">
                              {new Date(request.request_date).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(request)}
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: "36px", height: "36px" }}
                              title="Modifier"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(request.id)}
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: "36px", height: "36px" }}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </Button>
                            {request.status === 'pending' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleComplete(request.id)}
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "36px", height: "36px" }}
                                title="Marquer comme terminée"
                              >
                                <FaCheckCircle />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="d-flex align-items-center gap-2">
              {editMode ? <FaEdit /> : <FaPlusCircle />}
              {editMode ? 'Modifier Demande' : 'Nouvelle Demande'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center gap-2 fw-bold">
                  <FaTools /> Équipement *
                </Form.Label>
                <Form.Select
                  name="equipment_id"
                  value={formData.equipment_id}
                  onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                  required
                  disabled={equipments.length === 0}
                  className="shadow-sm"
                >
                  {equipments.length === 0 ? (
                    <option value="">Aucun équipement disponible</option>
                  ) : (
                    equipments.map(equipment => (
                      <option key={equipment.id} value={equipment.id}>
                        {equipment.name} ({equipment.serial_number})
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="d-flex align-items-center gap-2 fw-bold">
                  <FaAlignLeft /> Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="shadow-sm"
                  placeholder="Décrivez le problème ou la maintenance requise..."
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit" className="d-flex align-items-center gap-2">
                  {editMode ? <FaEdit /> : <FaCheckCircle />}
                  {editMode ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
    </div>
  );
};

export default DemandeMaintenance;