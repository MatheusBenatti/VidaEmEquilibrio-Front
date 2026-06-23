import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

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
    // Endpoint unificado de login
    login: (email, senha) =>
      axios.post(`${API_URL}login/`, { email, senha }),
    
    // Registro de psicólogo
    registroPsicologo: (nome, email, senha, crp) =>
      axios.post(`${API_URL}registrar-psicologo/`, {
        nome,
        username: email,
        password: senha,
        crp,
      }),
    
    // Registro de paciente
    registroPaciente: (nome, email, senha) =>
      axios.post(`${API_URL}registrar-paciente/`, {
        nome,
        username: email,
        password: senha,
      }),
    
    // Adicionar paciente (psicólogo)
    adicionarPaciente: (email, nome) =>
      api.post('adicionar-paciente/', { email, nome }),
    
    // Listar pacientes do psicólogo logado
    meusPacientes: () =>
      api.get('meus-pacientes/'),
    
    // Mudar senha
    mudarSenha: (senha_atual, nova_senha) =>
      api.post('mudar-senha/', { senha_atual, nova_senha }),

    // Configurar perfil do paciente (avatar + nome)
    configurarPerfil: (nome, avatar) =>
      api.post('configurar-perfil/', { nome, avatar }),

    // Atualizar avatar do paciente
    atualizarAvatar: (avatar) =>
      api.patch('atualizar-avatar/', { avatar }),

    // Relatos
    salvarRelato: (texto, humor) =>
      api.post('salvar-relato/', { texto, humor }),

    relatosPaciente: (pacienteId) =>
      api.get(`relatos-paciente/${pacienteId}/`),

    meusRelatosCalendario: () =>
      api.get('meus-relatos-calendario/'),
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
};

export default api;
