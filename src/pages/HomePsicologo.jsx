import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/HomePsicologo.css';

const AVATARES = [
  require('../images/avatar-01.png'),
  require('../images/avatar-02.png'),
  require('../images/avatar-03.png'),
  require('../images/avatar-04.png'),
  require('../images/avatar-05.png'),
  require('../images/avatar-06.png'),
  require('../images/avatar-07.png'),
  require('../images/avatar-08.png'),
];

const getAvatarImg = (num) => AVATARES[(num || 1) - 1];

function HomePsicologo() {
  const [psicologo, setPsicologo] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [emailPaciente, setEmailPaciente] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modalRelatorio, setModalRelatorio] = useState(null);
  const [relatos, setRelatos] = useState([]);
  const [carregandoRelatos, setCarregandoRelatos] = useState(false);
  const [humorMaisFrequente, setHumorMaisFrequente] = useState(null);
  const navigate = useNavigate();

  const HUMOR_EMOJIS = {
    'muito_feliz': '😄',
    'feliz': '🙂',
    'neutro': '😐',
    'triste': '🙁',
    'muito_triste': '😢',
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setPsicologo(JSON.parse(userInfo));
    }
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const response = await authService.meusPacientes();
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleAdicionarPaciente = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      const response = await authService.adicionarPaciente(emailPaciente, nomePaciente);
      const senhaTemp = response.data.senha_temporaria;
      setSucesso(`Paciente adicionado! Senha temporária: ${senhaTemp}`);
      setEmailPaciente('');
      setNomePaciente('');
      carregarPacientes();
      setTimeout(() => {
        setMostrarModal(false);
        setSucesso('');
      }, 4000);
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao adicionar paciente');
    } finally {
      setCarregando(false);
    }
  };

  const handleVerRelatorio = async (paciente) => {
    setModalRelatorio(paciente);
    setRelatos([]);
    setCarregandoRelatos(true);
    try {
      const response = await authService.relatosPaciente(paciente.id);
      setRelatos(response.data.relatos);
      setHumorMaisFrequente(response.data.humor_mais_frequente);
    } catch (error) {
      console.error('Erro ao carregar relatos:', error);
    } finally {
      setCarregandoRelatos(false);
    }
  };

  const exportarCSV = () => {
    if (!relatos.length || !modalRelatorio) return;

    const csvContent = [
      ['#', 'Data e Hora', 'Humor', 'Relato'],
      ...relatos.map((r, i) => [relatos.length - i, r.criado_em, HUMOR_EMOJIS[r.humor] || '-', `"${r.texto.replace(/"/g, '""')}"`]),
      [],
      ['Humor mais frequente:', HUMOR_EMOJIS[humorMaisFrequente] || '-']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatos_${modalRelatorio.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="home-psicologo">
      <nav className="navbar">
        <h1>Vida em Equilíbrio</h1>
        <div>
          <span>Bem-vindo, {psicologo?.nome}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2>Meus Pacientes</h2>
        <div className="pacientes-grid">
          {pacientes.map(paciente => (
            <div key={paciente.id} className="paciente-box">
              <div className="paciente-card-body">
                <div className="paciente-avatar-col">
                  <img
                    src={getAvatarImg(paciente.avatar)}
                    alt={`Avatar de ${paciente.nome}`}
                    className="paciente-avatar-svg"
                  />
                </div>
                <div className="paciente-info-col">
                  <span className="paciente-label">Paciente</span>
                  <h3>{paciente.nome}</h3>
                  <p>{paciente.email}</p>
                </div>
              </div>
              <button className="btn-relatorio" onClick={() => handleVerRelatorio(paciente)}>Relatório</button>
            </div>
          ))}

          <div 
            className="adicionar-box"
            onClick={() => { setMostrarModal(true); setErro(''); setSucesso(''); }}
          >
            <div className="icon-plus">+</div>
            <p>Adicionar Paciente</p>
          </div>
        </div>
      </div>

      {modalRelatorio && (
        <div className="modal-overlay" onClick={() => setModalRelatorio(null)}>
          <div className="modal-relatorio" onClick={(e) => e.stopPropagation()}>
            <div className="modal-relatorio-header">
              <h2>Relatos — {modalRelatorio.nome}</h2>
              <div className="header-actions">
                {!carregandoRelatos && relatos.length > 0 && (
                  <button className="btn-exportar" onClick={exportarCSV}>
                    Exportar CSV
                  </button>
                )}
                <button className="btn-fechar" onClick={() => setModalRelatorio(null)}>✕</button>
              </div>
            </div>
            {carregandoRelatos ? (
              <p className="relatorio-loading">Carregando relatos...</p>
            ) : relatos.length === 0 ? (
              <p className="relatorio-vazio">Nenhum relato registrado ainda.</p>
            ) : (
              <div className="relatorio-table-wrapper">
                <table className="relatorio-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Data e Hora</th>
                      <th>Humor</th>
                      <th>Relato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatos.map((r, i) => (
                      <tr key={r.id}>
                        <td>{relatos.length - i}</td>
                        <td className="td-data">{r.criado_em}</td>
                        <td className="td-humor">{HUMOR_EMOJIS[r.humor]}</td>
                        <td className="td-texto">{r.texto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {humorMaisFrequente && (
                  <div className="humor-resumo">
                    <strong>Humor mais frequente:</strong>{' '}
                    <span className="humor-destaque">
                      {HUMOR_EMOJIS[humorMaisFrequente]} {humorMaisFrequente.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Adicionar Paciente</h2>
              <p>O paciente receberá um email com as credenciais de acesso.</p>
            </div>
            <div className="modal-body">
              {erro && <p className="erro">{erro}</p>}
              {sucesso && <p className="sucesso">{sucesso}</p>}
              <form onSubmit={handleAdicionarPaciente}>
                <div className="input-group">
                  <label>Nome do paciente</label>
                  <input
                    type="text"
                    placeholder="Como o paciente quer ser chamado"
                    value={nomePaciente}
                    onChange={(e) => setNomePaciente(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email do paciente</label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={emailPaciente}
                    onChange={(e) => setEmailPaciente(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" disabled={carregando}>
                    {carregando ? 'Adicionando...' : 'Adicionar'}
                  </button>
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePsicologo;