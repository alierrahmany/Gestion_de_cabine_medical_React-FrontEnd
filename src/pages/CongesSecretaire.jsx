import React, { useState, useEffect } from 'react';
import { 
  Button, Modal, Form, Alert, 
  Badge, InputGroup, Pagination, Spinner 
} from 'react-bootstrap';
import { 
  FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, 
  FaSearch, FaFileExcel 
} from 'react-icons/fa';
import axios from 'axios';
import * as XLSX from 'xlsx';

const CongesSecretaire = () => {
  // États
  const [conges, setConges] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    date_debut: '',
    date_fin: '',
    type: 'annuel',
    motif: '',
    statut: 'en attente'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentCongeId, setCurrentCongeId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Configuration
  const STATUT_CONFIG = {
    'en attente': { label: 'En Attente', variant: 'warning' },
    'accepté': { label: 'Accepté', variant: 'success' },
    'refusé': { label: 'Refusé', variant: 'danger' }
  };

  const TYPES_CONGE = ['annuel', 'maladie', 'maternité', 'exceptionnel'];

  // Effets
  useEffect(() => {
    fetchConges();
    fetchEmployees();
  }, []);

  // Fonctions d'API
  const fetchConges = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/api/conges', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConges(data);
    } catch (error) {
      handleError('Erreur de chargement des congés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/api/users/conge', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(data);
    } catch (error) {
      handleError('Erreur de chargement des employés:', error);
    }
  };

  // Gestion des erreurs
  const handleError = (message, error) => {
    console.error(message, error);
    setError(error.response?.data?.message || error.message);
    setShowSuccessModal(true);
  };

  // Gestion des formulaires
  const handleShowModal = (conge = null) => {
    if (conge) {
      setFormData({
        user_id: conge.user_id,
        date_debut: conge.date_debut.split('T')[0],
        date_fin: conge.date_fin.split('T')[0],
        type: conge.type,
        motif: conge.motif,
        statut: conge.statut
      });
      setEditMode(true);
      setCurrentCongeId(conge.id);
    } else {
      setFormData({
        user_id: '',
        date_debut: '',
        date_fin: '',
        type: 'annuel',
        motif: '',
        statut: 'en attente'
      });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      setMessage('La date de fin doit être postérieure à la date de début');
      setShowSuccessModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editMode 
        ? `http://localhost:8000/api/conges/${currentCongeId}`
        : 'http://localhost:8000/api/conges';

      const method = editMode ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`Congé ${editMode ? 'modifié' : 'ajouté'} avec succès !`);
      setShowSuccessModal(true);
      fetchConges();
      setShowModal(false);
    } catch (error) {
      handleError('Erreur:', error);
    }
  };

  // Gestion suppression
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/conges/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConges();
      setMessage('Congé supprimé avec succès !');
      setShowSuccessModal(true);
    } catch (error) {
      handleError('Erreur de suppression:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Export Excel
  const exportExcel = () => {
    try {
      const data = filteredConges.map(conge => {
        const employee = employees.find(e => e.id === conge.user_id);
        const startDate = new Date(conge.date_debut);
        const endDate = new Date(conge.date_fin);
        const jours = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        return {
          'Employé': employee?.name || 'Inconnu',
     
          'Début': startDate.toLocaleDateString('fr-FR'),
          'Fin': endDate.toLocaleDateString('fr-FR'),
          'Jours': jours,
          'Type': conge.type.charAt(0).toUpperCase() + conge.type.slice(1),
          'Statut': STATUT_CONFIG[conge.statut]?.label,
          'Motif': conge.motif
        };
      });

      if(data.length === 0) {
        setMessage('Aucune donnée à exporter');
        setShowSuccessModal(true);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Congés');
      XLSX.writeFile(wb, `conges_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      setMessage('Erreur lors de l\'export : ' + err.message);
      setShowSuccessModal(true);
    }
  };

  // Filtrage et pagination
  const filteredConges = conges.filter(conge => {
    const searchLower = searchQuery.toLowerCase();
    const employee = employees.find(e => e.id === conge.user_id);
    return (
      (employee?.name?.toLowerCase().includes(searchLower)) ||
      (conge.type?.toLowerCase().includes(searchLower)) ||
      (conge.statut?.toLowerCase().includes(searchLower))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConges.slice(indexOfFirstItem, indexOfLastItem);

  // Rendu
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-4 my-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Congés</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
          {error}
        </Alert>
      )}

      {/* Barre d'outils */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <InputGroup className="w-full md:w-96">
          <InputGroup.Text>
            <FaSearch className="text-gray-500" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Rechercher par nom, type ou statut..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <div className="flex gap-3">
          <Button 
            variant="primary" 
            onClick={() => handleShowModal()}
            className="flex items-center gap-2"
          >
            <FaPlusCircle /> Nouveau congé
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={exportExcel}
            disabled={filteredConges.length === 0}
            className="flex items-center gap-2"
          >
            <FaFileExcel /> Exporter ({filteredConges.length})
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="text-center py-8">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Tableau */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date Début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date Fin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map(conge => {
                  const employee = employees.find(e => e.id === conge.user_id);
                  return (
                    <tr key={conge.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            {employee?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium">{employee?.name || 'Inconnu'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{new Date(conge.date_debut).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">{new Date(conge.date_fin).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 capitalize">{conge.type}</td>
                      <td className="px-4 py-3">
                        <Badge pill bg={STATUT_CONFIG[conge.statut]?.variant}>
                          {STATUT_CONFIG[conge.statut]?.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleShowModal(conge)}
                            className="px-3 py-1"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(conge.id)}
                            className="px-3 py-1"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination>
              {Array.from({ length: Math.ceil(filteredConges.length / itemsPerPage) }).map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </>
      )}

      {/* Modals */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Modifier Congé' : 'Nouveau Congé'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Group>
                <Form.Label>Employé</Form.Label>
                <Form.Select
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Type de congé</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  {TYPES_CONGE.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Date Début</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Date Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="md:col-span-2">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value})}
                  required
                >
                  {Object.entries(STATUT_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="md:col-span-2">
                <Form.Label>Motif</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.motif}
                  onChange={(e) => setFormData({...formData, motif: e.target.value})}
                  placeholder="Décrivez le motif du congé..."
                />
              </Form.Group>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                className="px-6"
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="px-6"
              >
                {editMode ? 'Modifier' : 'Enregistrer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modals de confirmation */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
          <p className="text-lg">{message}</p>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="text-red-500 text-4xl mb-3">
            <FaTrash />
          </div>
          <p className="text-lg">Êtes-vous sûr de vouloir supprimer définitivement ce congé ?</p>
        </Modal.Body>
        <Modal.Footer className="justify-center">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="px-6">
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} className="px-6">
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CongesSecretaire;