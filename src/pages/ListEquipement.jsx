import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Modal, Form, Container, Card, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, FaTools, FaInfoCircle, FaCheck, FaTimes, FaWrench, FaSearch } from 'react-icons/fa';

const ListEquipement = () => {
  const [equipments, setEquipments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'actif',
    last_maintenance: new Date().toISOString().split('T')[0],
  });

  const statusConfig = {
    actif: { variant: 'success', icon: <FaCheck className="me-1" /> },
    inactif: { variant: 'danger', icon: <FaTimes className="me-1" /> },
    'en maintenance': { variant: 'warning', icon: <FaWrench className="me-1" /> },
  };

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/equipments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipments(response.data);
    } catch (error) {
      handleError('Erreur de chargement', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleError = (message, error) => {
    console.error(message, error);
    setError(`${message}: ${error.response?.data?.message || error.message}`);
  };

  const handleShowModal = (equipment = null) => {
    if (equipment) {
      setCurrentEquipment(equipment);
      setFormData({
        ...equipment,
        last_maintenance: new Date(equipment.last_maintenance).toISOString().split('T')[0],
      });
    } else {
      setCurrentEquipment(null);
      setFormData({
        name: '',
        type: '',
        status: 'actif',
        last_maintenance: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = currentEquipment ? 'put' : 'post';
      const url = currentEquipment
        ? `http://localhost:8000/api/equipments/${currentEquipment.id}`
        : 'http://localhost:8000/api/equipments';

      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(`Équipement ${currentEquipment ? 'modifié' : 'ajouté'} avec succès 🎉`);
      setShowSuccessModal(true);
      fetchEquipments();
      setShowModal(false);
    } catch (error) {
      handleError('Erreur de sauvegarde', error);
    }
  };

  const handleDelete = async (id) => {
    setEquipmentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!isChecked) {
      setError('Veuillez cocher la case pour confirmer la suppression.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/equipments/${equipmentToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Équipement supprimé avec succès 🗑️');
      setShowSuccessModal(true);
      fetchEquipments();
    } catch (error) {
      handleError('Erreur de suppression', error);
    } finally {
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
      setIsChecked(false);
    }
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

  const DeleteConfirmationModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation de suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <label htmlFor="confirmDelete" className="ms-2">
            Êtes-vous sûr de vouloir supprimer définitivement cet équipement ? Cette action est irréversible.
          </label>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Annuler
        </Button>
        <Button variant="danger" onClick={confirmDelete} disabled={!isChecked}>
          Confirmer la suppression
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const getInitial = (name) => {
    return name ? name[0].toUpperCase() : '?';
  };

  const filteredEquipments = equipments.filter((equipment) =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <SuccessModal />
        <DeleteConfirmationModal />

        <h2 className="mb-4 text-primary d-flex align-items-center">
          <FaTools className="me-2" />
          Gestion des Équipements
          <Button
            variant="outline-primary"
            onClick={() => handleShowModal()}
            className="ms-3"
            size="sm"
          >
            <FaPlusCircle className="me-2" />
            Nouvel Équipement
          </Button>
        </h2>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2">
            <FaInfoCircle /> {error}
          </Alert>
        )}

        <Card>
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FaTools /> Liste des Équipements
            </h5>
           
          </Card.Header>
        
          <Card.Body>
       <div className='mb-3'>
       <InputGroup className="w-25 shadow-sm">
              <InputGroup.Text className="bg-light border-end-0">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Rechercher un equipement ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
       </div>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="min-w-full divide-y 0">
                  <thead className="bg-blue-600">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left">Nom</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left">Type</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left">Statut</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-left">Dernière Maintenance</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredEquipments.map((equipment) => (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center me-2">
                              {getInitial(equipment.name)}
                            </div>
                            <span>{equipment.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{equipment.type}</td>
                        <td className="px-4 py-3">
                          <Badge pill bg={statusConfig[equipment.status].variant}>
                            {statusConfig[equipment.status].icon}
                            {equipment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{new Date(equipment.last_maintenance).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="link"
                            className="text-primary me-2 p-0"
                            onClick={() => handleShowModal(equipment)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => handleDelete(equipment.id)}
                          >
                            <FaTrash />
                          </Button>
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
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-2">
              {currentEquipment ? <FaEdit /> : <FaPlusCircle />}
              {currentEquipment ? 'Modifier Équipement' : 'Nouvel Équipement'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center gap-2">
                  <FaTools /> Nom *
                </Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center gap-2">
                  <FaInfoCircle /> Type *
                </Form.Label>
                <Form.Control
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center gap-2">
                  <FaCheckCircle /> Statut *
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.keys(statusConfig).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="d-flex align-items-center gap-2">
                  <FaWrench /> Dernière Maintenance *
                </Form.Label>
                <Form.Control
                  type="date"
                  name="last_maintenance"
                  value={formData.last_maintenance}
                  onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit" className="d-flex align-items-center gap-2">
                  {currentEquipment ? <FaEdit /> : <FaCheckCircle />}
                  {currentEquipment ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
  
    </div>
  );
};

export default ListEquipement;