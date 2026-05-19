import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});


export const authService = {
    login: (email, senha) =>
    axios.post(`${API_URL}login/`, {
      email,
      senha,
    }),

    cadastro: (nome, email, senha, crp) => 
        api.post('psicologos/', {
            nome,
            email,
            senha,
            crp,
        }),

    logout: () => localStorage.removeItem('token'),
};

export default api;
