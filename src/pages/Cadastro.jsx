import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Cadastro.css';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [crp, setCrp] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      await authService.registroPsicologo(nome, email, senha, crp);
      setSucesso('Cadastro realizado! Redirecionando para login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErro('Erro ao cadastrar. Verifique os dados.');
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <div className="cadastro-header">
          <div className="cadastro-header-icon">👨‍⚕️</div>
          <h2>Cadastro de Psicólogo</h2>
          <p className="cadastro-subtitle">Comece a acompanhar seus pacientes de forma moderna</p>
        </div>
        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p className="sucesso">{sucesso}</p>}
        <form onSubmit={handleCadastro}>
          <div className="input-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              placeholder="Como gostaria de ser chamado?"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email profissional</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="crp">CRP</label>
            <input
              id="crp"
              type="text"
              placeholder="XX/XXXXX"
              value={crp}
              onChange={(e) => setCrp(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit">Criar conta</button>
        </form>
        <div className="cadastro-footer">
          <p>
            Já tem conta? <a href="/login">Faça login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;