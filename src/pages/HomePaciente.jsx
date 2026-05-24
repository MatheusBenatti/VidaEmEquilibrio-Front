import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/HomePaciente.css';

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

const HUMORES = [
  { key: 'muito_feliz', emoji: '😄', label: 'Muito feliz' },
  { key: 'feliz', emoji: '🙂', label: 'Feliz' },
  { key: 'neutro', emoji: '😐', label: 'Neutro' },
  { key: 'triste', emoji: '🙁', label: 'Triste' },
  { key: 'muito_triste', emoji: '😢', label: 'Muito triste' },
];

function HomePaciente() {
  const [paciente, setPaciente] = useState(null);
  const [mostrarMudarSenha, setMostrarMudarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [textoRelato, setTextoRelato] = useState('');
  const [humorSelecionado, setHumorSelecionado] = useState('neutro');
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [erroRelato, setErroRelato] = useState('');
  const [sucessoRelato, setSucessoRelato] = useState('');
  const [salvandoRelato, setSalvandoRelato] = useState(false);
  const [diasCalendario, setDiasCalendario] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPaciente(user);

      if (user.primeira_senha) {
        setMostrarMudarSenha(true);
      } else if (!user.perfil_configurado) {
        navigate('/configurar-perfil');
      }
    }
  }, []);

  const carregarCalendario = async () => {
    try {
      const response = await authService.meusRelatosCalendario();
      setDiasCalendario(response.data.dias || []);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    }
  };

  useEffect(() => {
    carregarCalendario();
  }, []);

  const handleMudarSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    setCarregando(true);
    try {
      await authService.mudarSenha(senhaAtual, novaSenha);
      setSucesso('Senha alterada! Redirecionando...');

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      userInfo.primeira_senha = false;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setTimeout(() => {
        navigate('/configurar-perfil');
      }, 1500);
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarRelato = async (e) => {
    e.preventDefault();
    setErroRelato('');
    setSucessoRelato('');
    if (!textoRelato.trim()) {
      setErroRelato('Escreva algo antes de salvar.');
      return;
    }
    setSalvandoRelato(true);
    try {
      await authService.salvarRelato(textoRelato.trim(), humorSelecionado);
      setSucessoRelato('Relato salvo!');
      setTextoRelato('');
      setHumorSelecionado('neutro');
      setMostrarEmojis(false);
      carregarCalendario();
      setTimeout(() => setSucessoRelato(''), 3000);
    } catch (error) {
      setErroRelato(error.response?.data?.error || 'Erro ao salvar relato');
    } finally {
      setSalvandoRelato(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="home-paciente">
      <nav className="navbar">
        <h1>Vida em Equilíbrio</h1>
        <div>
          <span>Olá, {paciente?.nome}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        {mostrarMudarSenha && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Altere sua Senha</h2>
              <p>Você precisa alterar sua senha temporária antes de continuar.</p>
              {erro && <p className="erro">{erro}</p>}
              {sucesso && <p className="sucesso">{sucesso}</p>}
              <form onSubmit={handleMudarSenha}>
                <input
                  type="password"
                  placeholder="Senha atual (temporária)"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Nova senha (mínimo 8 caracteres)"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
                <button type="submit" disabled={carregando}>
                  {carregando ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>
            </div>
          </div>
        )}

        {!mostrarMudarSenha && (
          <div className="main-content">
            <div className="left-column">
              <p className="tamagochi-nome">{paciente?.nome}</p>
              <img
                src={getAvatarImg(paciente?.avatar)}
                alt="Seu avatar"
                className="tamagochi-avatar"
              />

              <div className="relato-area">
                <h3>Como foi seu dia?</h3>
                <form onSubmit={handleSalvarRelato}>
                  <textarea
                    placeholder="Escreva seu relato aqui..."
                    value={textoRelato}
                    onChange={(e) => setTextoRelato(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="relato-footer">
                    <div className="humor-section">
                      <div
                        className="humor-selecionado"
                        onClick={() => setMostrarEmojis(!mostrarEmojis)}
                      >
                        {HUMORES.find(h => h.key === humorSelecionado)?.emoji} Como você está?
                      </div>
                      {mostrarEmojis && (
                        <div className="humor-picker">
                          {HUMORES.map((h) => (
                            <button
                              key={h.key}
                              type="button"
                              className={`humor-emoji ${humorSelecionado === h.key ? 'ativo' : ''}`}
                              onClick={() => {
                                setHumorSelecionado(h.key);
                                setMostrarEmojis(false);
                              }}
                              title={h.label}
                            >
                              {h.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="char-count">{textoRelato.length}/1000</span>
                    {erroRelato && <p className="erro">{erroRelato}</p>}
                    {sucessoRelato && <p className="sucesso">{sucessoRelato}</p>}
                    <button type="submit" disabled={salvandoRelato}>
                      {salvandoRelato ? 'Salvando...' : 'Salvar relato'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <CalendarioRelatos
              dias={diasCalendario}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onDiaClick={setDiaSelecionado}
            />

            {diaSelecionado && (
              <ModalDiaRelatos
                dia={diaSelecionado}
                onClose={() => setDiaSelecionado(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente do Calendário
function CalendarioRelatos({ dias, currentMonth, setCurrentMonth, onDiaClick }) {
  const HUMOR_EMOJIS = {
    'muito_feliz': '😄',
    'feliz': '🙂',
    'neutro': '😐',
    'triste': '🙁',
    'muito_triste': '😢',
  };

  const diasMap = {};
  dias.forEach(d => {
    diasMap[d.data_iso] = d;
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <button onClick={prevMonth}>←</button>
        <h3>{monthNames[month]} {year}</h3>
        <button onClick={nextMonth}>→</button>
      </div>
      <div className="calendario-grid">
        {weekDays.map(d => <div key={d} className="calendario-weekday">{d}</div>)}
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="calendario-day empty"></div>;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const diaData = diasMap[dateStr];
          return (
            <div
              key={idx}
              className={`calendario-day ${diaData ? 'has-relatos' : ''}`}
              onClick={() => diaData && onDiaClick(diaData)}
            >
              <span className="day-number">{day}</span>
              {diaData && (
                <span className="day-emoji">{HUMOR_EMOJIS[diaData.humor_mais_frequente]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente do Modal de Relatos do Dia
function ModalDiaRelatos({ dia, onClose }) {
  const HUMOR_EMOJIS = {
    'muito_feliz': '😄',
    'feliz': '🙂',
    'neutro': '😐',
    'triste': '🙁',
    'muito_triste': '😢',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dia-relatos" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Relatos de {dia.data}</h3>
          <button className="btn-fechar" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          {dia.relatos.length === 0 ? (
            <p>Nenhum relato para este dia.</p>
          ) : (
            <div className="relatos-lista">
              {dia.relatos.map((relato) => (
                <div key={relato.id} className="relato-item">
                  <div className="relato-header">
                    <span className="relato-hora">{relato.criado_em}</span>
                    <span className="relato-humor">{HUMOR_EMOJIS[relato.humor]}</span>
                  </div>
                  <p className="relato-texto">{relato.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePaciente;