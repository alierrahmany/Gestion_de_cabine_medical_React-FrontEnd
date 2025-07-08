import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    
    <div className="min-h-screen flex  bg-wite-100">
      {/* Logo */}
      <div className="absolute top-5 left-5 flex items-center">
  <img src="/logo2.png" alt="Logo Hopital" className="h-10 mr-2" />
  <span className="text-lg font-bold" style={{ color: '#3363ff' }}>
  Hôpital Mohammed V
</span>

</div>

      
      {/* Formulaire */}

        <div className="w-1/2 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          {/* Titre */}
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontSize: '1.25rem' }}>
            Connexion 
          </h2>
          
          <form onSubmit={handleLogin}>
            {/* Log in */}
            <div className="mb-8 flex items-center  px-35 py-2 ">
              <img src="./icon1.png" alt="Icon" className="h-6 w-6 mr-3" />
              
            </div>
             {/* Champ Email */}
            <div className="mb-4 relative">
              <input
                type="email"
                placeholder="Entrez votre e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-10 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <img
                src="../public/icons8-email-26.png" 
                alt="Email Icon" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
            </div>

            {/* Champ Password */}
            <div className="mb-6 relative">
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-10 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <img
                src="../public/icons8-password-book-48.png" 

                alt="Password Icon" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
            </div>

            {/* Remember Me & Mot de Passe Oublié */}
            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-blue-500 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton Login */}   <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition"
            >
              Accéder au portail
            </button>
          </form>

          {/* Message d'erreur */}
          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </div>
      </div>

      {/* Image à droite */}
      {/* Bande vert */}
      <div
    className="absolute top-0 left-285 h-full w-[10%] bg-[#b3ffe6]"
    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}
  ></div>

<div
  className="w-1/2 flex flex-col items-center justify-center inset-0 bg-[#3363ff] clip-path-polygon"
  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}
>
  {/* Titre - Bienvenue */}
  <h1 className="text-4xl font-bold text-white mb-6">Bienvenue !</h1>

  {/* Image  hnnnnnnnnnnnnnnnnnnnn */}
  <img
    src="/ph2.png"
    alt="Image Médicale"
    className="max-w-full max-h-96 object-contain mb-4"
  />

  {/* Texte - Accès réservé */}
  <p className="text-lg text-white/70">Accès réservé au personnel autorisé</p>
</div>

      
    </div>
    
  );
}

export default Login;                             