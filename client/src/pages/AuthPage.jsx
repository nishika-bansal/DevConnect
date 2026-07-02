import { Code2, Github, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const AuthPage = ({ mode = 'login' }) => {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    headline: 'Full Stack Developer',
    skills: 'React, Node.js',
    technologies: 'Express, MongoDB'
  });
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate('/');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-visual">
        <div className="brand-lockup">
          <span className="brand-mark">DC</span>
          <div>
            <h1>DevConnect</h1>
            <p>Build your developer graph.</p>
          </div>
        </div>
        <div className="network-preview">
          <div className="preview-card main">
            <Code2 size={24} />
            <strong>API launch checklist</strong>
            <span>JWT, pagination, search, uploads</span>
          </div>
          <div className="preview-card top">
            <Github size={22} />
            <span>Project showcase</span>
          </div>
          <div className="preview-card bottom">
            <Linkedin size={22} />
            <span>Developer network</span>
          </div>
        </div>
      </section>

      <section className="auth-panel panel">
        <h2>{isRegister ? 'Create account' : 'Log in'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Name" />
              <input value={form.username} onChange={(event) => updateField('username', event.target.value)} placeholder="Username" />
            </>
          )}
          <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="Email" />
          <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Password" />
          {isRegister && (
            <>
              <input value={form.headline} onChange={(event) => updateField('headline', event.target.value)} placeholder="Headline" />
              <input value={form.skills} onChange={(event) => updateField('skills', event.target.value)} placeholder="Skills" />
              <input value={form.technologies} onChange={(event) => updateField('technologies', event.target.value)} placeholder="Technologies" />
            </>
          )}
          <button className="button primary full" disabled={submitting}>
            {isRegister ? 'Join DevConnect' : 'Log in'}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create one'}</Link>
        </p>
      </section>
    </main>
  );
};

export default AuthPage;
