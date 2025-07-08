import React, { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaSort,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaUserMd,
  FaUserNurse,
  FaUserCog
} from 'react-icons/fa';
import axios from 'axios';

const GererUtilisateur = ({ users: initialUsers, handleDeleteUser, fetchAllUsers }) => {
  const [users, setUsers] = useState(initialUsers || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('id');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'medcin',
    specialite: '',
  });

  const [editUser, setEditUser] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'medcin',
    specialite: '',
  });

  // Spécialités prédéfinies par rôle
  const specialitesParRole = {
    medcin: ['Cardiologie', 'Dermatologie', 'Pédiatrie', 'Neurologie', 'Chirurgie'],
    infirmier: ['Soins intensifs', 'Pédiatrie', 'Bloc opératoire', 'Urgences', 'Gériatrie'],
    technicien: ['Radiologie', 'Laboratoire', 'Maintenance', 'Biomédical', 'Informatique']
  };

  useEffect(() => {
    setUsers(initialUsers || []);
  }, [initialUsers]);

  const handleInputChange = (e, isEdit) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditUser((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const emailExists = users.some((user) => user.email === newUser.email);
      if (emailExists) {
        setError('Cet email est déjà utilisé par un autre utilisateur !');
        return;
      }

      const response = await axios.post('http://localhost:8000/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      const createdUser = response.data.user;
      setUsers((prevUsers) => [...prevUsers, createdUser]);

      setSuccessMessage('Utilisateur créé avec succès !');
      setShowSuccessModal(true);
      setShowCreateModal(false);

      setNewUser({ name: '', email: '', password: '', role: 'medcin', specialite: '' });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Erreur lors de la création';

      if (errorMessage.toLowerCase().includes('email')) {
        setError('Cet email est déjà utilisé !');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/users/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === editUser.id ? { ...user, ...editUser } : user))
      );

      setSuccessMessage('Utilisateur modifié avec succès !');
      setShowSuccessModal(true);
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = (id) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await handleDeleteUser(deleteUserId);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteUserId));

      setSuccessMessage('Utilisateur supprimé avec succès !');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
      setShowDeleteModal(false);
      setDeleteUserId(null);
    }
  };

  const handleSort = (field) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.specialite && user.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((user) => (filterRole ? user.role === filterRole : true))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  const getRoleIcon = (role) => {
    const iconClasses = 'inline-block w-2 h-2 rounded-full mr-2';
    switch (role) {
      case 'medcin':
        return <span className={`${iconClasses} bg-green-500`}></span>;
      case 'infirmier':
        return <span className={`${iconClasses} bg-blue-500`}></span>;
      case 'secretaire':
        return <span className={`${iconClasses} bg-purple-500`}></span>;
      case 'administratif':
        return <span className={`${iconClasses} bg-yellow-500`}></span>;
      case 'technicien':
        return <span className={`${iconClasses} bg-gray-500`}></span>;
      default:
        return <span className={`${iconClasses} bg-gray-300`}></span>;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'medcin':
        return 'bg-green-100 text-green-800';
      case 'infirmier':
        return 'bg-blue-100 text-blue-800';
      case 'secretaire':
        return 'bg-purple-100 text-purple-800';
      case 'administratif':
        return 'bg-yellow-100 text-yellow-800';
      case 'technicien':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIconComponent = (role) => {
    switch (role) {
      case 'medcin':
        return <FaUserMd className="text-green-500" />;
      case 'infirmier':
        return <FaUserNurse className="text-blue-500" />;
      case 'technicien':
        return <FaUserCog className="text-gray-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="mb-4 text-primary fw-bold">Gestion des utilisateurs</h2>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
        >
          <FaUserPlus className="mr-2" /> Nouvel Utilisateur
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center animate-shake">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 ml-4"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous les rôles</option>
              <option value="medcin">Médecin</option>
              <option value="infirmier">Infirmier</option>
              <option value="secretaire">Secrétaire</option>
              <option value="administratif">Administratif</option>
              <option value="technicien">Technicien</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-4 py-4 text-sm font-semibold text-white text-left">ID</th>
                <th className="px-4 py-4 text-sm font-semibold text-white text-left">Nom</th>
                <th className="px-4 py-4 text-sm font-semibold text-white text-left">Email</th>
                <th className="px-4 py-4 text-sm font-semibold text-white text-left">Rôle</th>
                <th className="px-4 py-4 text-sm font-semibold text-white text-left">Spécialité</th>
                <th className="px-4 py-4 text-sm font-semibold text-white text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-900 flex items-center justify-center text-white dark:text-blue-300 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role === 'medcin'
                          ? 'Médecin'
                          : user.role === 'infirmier'
                          ? 'Infirmier'
                          : user.role === 'secretaire'
                          ? 'Secrétaire'
                          : user.role === 'administratif'
                          ? 'Administratif'
                          : 'Technicien'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user.specialite || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Modifier"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="font-medium">Total:</span> {filteredUsers.length} utilisateurs
          </div>
          <div>
            <span className="font-medium">Médecins:</span> {filteredUsers.filter((u) => u.role === 'medcin').length}
          </div>
          <div>
            <span className="font-medium">Infirmiers:</span> {filteredUsers.filter((u) => u.role === 'infirmier').length}
          </div>
          <div>
            <span className="font-medium">Secrétaires:</span> {filteredUsers.filter((u) => u.role === 'secretaire').length}
          </div>
          <div>
            <span className="font-medium">Administratifs:</span> {filteredUsers.filter((u) => u.role === 'administratif').length}
          </div>
          <div>
            <span className="font-medium">Techniciens:</span> {filteredUsers.filter((u) => u.role === 'technicien').length}
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {showCreateModal ? 'Nouvel Utilisateur' : 'Modifier Utilisateur'}
              </h3>
              <button
                onClick={() => (showCreateModal ? setShowCreateModal(false) : setShowEditModal(false))}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    name="name"
                    value={showCreateModal ? newUser.name : editUser.name}
                    onChange={(e) => handleInputChange(e, !showCreateModal)}
                    required
                    placeholder="Nom complet"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={showCreateModal ? newUser.email : editUser.email}
                    onChange={(e) => handleInputChange(e, !showCreateModal)}
                    required
                    placeholder="email@exemple.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe {showEditModal && <span className="text-gray-500 dark:text-gray-400">(optionnel)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={showCreateModal ? newUser.password : editUser.password}
                    onChange={(e) => handleInputChange(e, !showCreateModal)}
                    required={showCreateModal}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserTag className="text-gray-400" />
                  </div>
                  <select
                    name="role"
                    value={showCreateModal ? newUser.role : editUser.role}
                    onChange={(e) => handleInputChange(e, !showCreateModal)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="medcin">Médecin</option>
                    <option value="infirmier">Infirmier</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="administratif">Administratif</option>
                    <option value="technicien">Technicien</option>
                  </select>
                </div>
              </div>

              {['medcin', 'infirmier', 'technicien'].includes(showCreateModal ? newUser.role : editUser.role) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spécialité</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getRoleIconComponent(showCreateModal ? newUser.role : editUser.role)}
                    </div>
                    <select
                      name="specialite"
                      value={showCreateModal ? newUser.specialite : editUser.specialite}
                      onChange={(e) => handleInputChange(e, !showCreateModal)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionnez une spécialité</option>
                      {specialitesParRole[showCreateModal ? newUser.role : editUser.role]?.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => (showCreateModal ? setShowCreateModal(false) : setShowEditModal(false))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  {showCreateModal ? 'Créer' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirmation de suppression</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 text-center max-w-sm animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-500 dark:text-green-400 text-4xl" />
            </div>
            <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{successMessage}</h4>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GererUtilisateur;