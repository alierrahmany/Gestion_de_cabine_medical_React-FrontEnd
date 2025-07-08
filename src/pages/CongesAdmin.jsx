import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const useConges = () => {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/api/conges', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConges(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConges();
  }, []);

  return { conges, loading, error, fetchConges, setConges };
};

const CongesAdmin = () => {
  const { conges, loading, error, fetchConges, setConges } = useConges();
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStates, setLoadingStates] = useState({});
  const [message, setMessage] = useState({ variant: '', text: '' });

  const STATUS_CONFIG = {
    'en attente': { label: 'En Attente', icon: '⏳' },
    accepté: { label: 'Approuvé', icon: '✅' },
    refusé: { label: 'Rejeté', icon: '❌' },
  };

  const filteredConges = conges.filter((conge) =>
    conge.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conge.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, action) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `http://localhost:8000/api/conges/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mise à jour optimiste de l'état local
      setConges(prevConges => 
        prevConges.map(conge => 
          conge.id === id ? { ...conge, statut: data.statut } : conge
        )
      );

      showSuccess(`Statut mis à jour : ${data.statut}`);
    } catch (error) {
      console.error('Erreur:', error.response?.data || error.message);
      showError('Échec de la mise à jour du statut');
      // Recharger les données originales en cas d'erreur
      fetchConges();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const showSuccess = (text) => {
    setMessage({ variant: 'success', text });
    setTimeout(() => setMessage({ variant: '', text: '' }), 3000);
  };

  const showError = (text) => {
    setMessage({ variant: 'danger', text });
    setTimeout(() => setMessage({ variant: '', text: '' }), 5000);
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error.message}</Alert>;

  return (
    <div className="min-h-screen p-6" style={{ backgroundImage: `url('bg-banner.jpg')` }}>
      <Container className="mt-2 p-4 bg-white rounded-4 shadow-sm">
        <h2 className="mb-4 text-primary fw-bold">Gestion des Congés - Administration</h2>

        {message.text && (
          <Alert variant={message.variant} className="animate__animated animate__fadeIn">
            {message.text}
          </Alert>
        )}

        <div className="position-relative mb-4" style={{ width: '100%', maxWidth: '500px' }}>
          <Form.Control
            type="text"
            placeholder="Rechercher par nom d'employé ou type de congé..."
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-gray-400" />
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              <th className="px-4 py-4 text-sm font-semibold text-white text-left">Employé</th>
              <th className="px-4 py-4 text-sm font-semibold text-white text-left">Type de congé</th>
              <th className="px-4 py-4 text-sm font-semibold text-white text-left">Statut</th>
              <th className="px-4 py-4 text-sm font-semibold text-white text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConges.map((conge) => (
              <tr key={conge.id} className="align-middle border-bottom hover:bg-gray-100 transition-colors">
                <td className="px-6 py-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {conge.user?.name?.charAt(0).toUpperCase() || 'N'}
                    </div>
                    <span className="ms-3">{conge.user?.name || 'Non spécifié'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{conge.type || '-'}</td>
                <td className="py-3">
                  <div className="d-flex align-items-center gap-2">
                    <span>{STATUS_CONFIG[conge.statut]?.icon}</span>
                    <span>{STATUS_CONFIG[conge.statut]?.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {conge.statut === 'en attente' ? (
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-success"
                        onClick={() => handleStatusUpdate(conge.id, 'approve')}
                        disabled={loadingStates[conge.id]}
                      >
                        {loadingStates[conge.id] ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          <>
                            <FaCheck /> Accepter
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleStatusUpdate(conge.id, 'reject')}
                        disabled={loadingStates[conge.id]}
                      >
                        {loadingStates[conge.id] ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          <>
                            <FaTimes /> Refuser
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted">Traitée</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </div>
  );
};

export default CongesAdmin;