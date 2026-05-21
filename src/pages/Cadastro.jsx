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
        <h2>Cadastro de Psicólogo</h2>
        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p className="sucesso">{sucesso}</p>}
        <form onSubmit={handleCadastro}>
          <input
            type="text"
            placeholder="Qual nome gostaria de ser chamado(a)?"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="CRP"
            value={crp}
            onChange={(e) => setCrp(e.target.value)}
            required
          />
          <button type="submit">Cadastrar</button>
        </form>
        <p>
          Já tem conta? <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;