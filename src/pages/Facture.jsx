import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlusCircle, FaCheckCircle, FaEuroSign, FaSearch } from 'react-icons/fa';

const Facture = () => {
  // États
  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    patient_id: '',
    date_facture: '',
    montant: '',
    statut: 'en_attente',
    details: ''
  });

  const statutOptions = [
    { value: 'payé', label: 'Payé', color: 'bg-green-100 text-green-800' },
    { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'annulé', label: 'Annulé', color: 'bg-red-100 text-red-800' }
  ];

  // Fonctions utilitaires
  const getInitials = (patient) => {
    return `${patient?.prenom?.[0]?.toUpperCase() || ''}${patient?.nom?.[0]?.toUpperCase() || ''}`;
  };

  // Filtrage des données
  useEffect(() => {
    const results = factures.filter(facture => {
      const patient = patients.find(p => p.id === facture.patient_id);
      const searchLower = searchQuery.toLowerCase();
      return [
        facture.montant?.toString(),
        patient?.nom,
        patient?.prenom,
        facture.date_facture
      ].some(val => val?.toLowerCase().includes(searchLower));
    });
    setFilteredFactures(results);
  }, [searchQuery, factures, patients]);

  // Chargement des données
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [facturesRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/factures', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setFactures(facturesRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      handleError('Erreur de chargement', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Gestion des erreurs
  const handleError = (message, error) => {
    console.error(message, error);
    setMessage(`${message}: ${error.response?.data?.message || error.message}`);
  };

  // Gestion formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.date_facture || !formData.montant) {
      setMessage('Les champs Patient, Date et Montant sont obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editMode ? 'put' : 'post';
      const url = editMode 
        ? `http://localhost:8000/api/factures/${formData.id}`
        : 'http://localhost:8000/api/factures';

      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });

      setMessage(`Facture ${editMode ? 'modifiée' : 'ajoutée'} avec succès 🎉!`);
      setShowSuccessModal(true);
      fetchData();
      handleCloseModal();
    } catch (error) {
      handleError('Erreur de soumission', error);
    }
  };

  // Gestion suppression
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/factures/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Facture supprimée avec succès 🗑️!');
      setShowSuccessModal(true);
      fetchData();
    } catch (error) {
      handleError('Erreur de suppression', error);
    }
    setShowDeleteModal(false);
  };

  // Édition
  const handleEdit = (facture) => {
    setFormData({
      ...facture,
      date_facture: facture.date_facture.split('T')[0]
    });
    setEditMode(true);
    setShowModal(true);
  };

  // Fermeture modales
  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      id: null,
      patient_id: '',
      date_facture: '',
      montant: '',
      statut: 'en_attente',
      details: ''
    });
  };

  // Composant Modale de Confirmation
  const DeleteConfirmationModal = () => (
    showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir supprimer cette facture ?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div >
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
  
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h2            className="mb-4 text-primary">Gestion des Factures</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaPlusCircle className="mr-2" />  Nouvelle Facture
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 relative">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par patient, montant, date..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

    

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Montant</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFactures.map(facture => {
              const patient = patients.find(p => p.id === facture.patient_id);
              return (
                <tr key={facture.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    {patient && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
                        {getInitials(patient)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{patient?.nom}</span>
                      <span className="text-gray-500 text-sm">{patient?.prenom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <div className="flex items-center">
                      <FaEuroSign className="mr-1 text-gray-600" />
                      {parseFloat(facture.montant).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      statutOptions.find(o => o.value === facture.statut)?.color
                    }`}>
                      {statutOptions.find(o => o.value === facture.statut)?.label}
                    </span>
                  </td>
                 
                  <td className="px-4 py-3">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(facture)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(facture.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            )}
          </tbody>
        </table>
        {filteredFactures.length === 0 && (
          <div className="text-center p-6 text-gray-500">Aucune facture trouvée</div>
        )}
      </div>

      {/* Modale Formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editMode ? 'Modifier Facture' : 'Nouvelle Facture'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient *</label>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nom} {patient.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date de facture *</label>
                  <input
                    type="date"
                    name="date_facture"
                    value={formData.date_facture}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Montant (€) *</label>
                  <div className="flex items-center border rounded-md">
                    <span className="px-3 bg-gray-100 border-r">
                      <FaEuroSign className="text-gray-500" />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name="montant"
                      value={formData.montant}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Statut *</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {statutOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editMode ? 'Modifier' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Suppression */}
      <DeleteConfirmationModal />

      {/* Modale Succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <FaCheckCircle className="text-green-500 mx-auto mb-4" size={40} />
            <h3 className="text-lg font-medium mb-4">{message}</h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
    </div>

  );
};

export default Facture;