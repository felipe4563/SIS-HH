import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login as loginService } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api.js';

const Login = () => {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const [identificador, setIdentificador] = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState('');
  const [isLoading,     setIsLoading]     = useState(false);

  /* ── Google (huésped) ─────────────────────────────────── */
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/cliente/google', {
        token: credentialResponse.credential,
      });
      login(response.data);
      const reservaPendiente = sessionStorage.getItem('reservaPendiente');
      navigate('/', { state: reservaPendiente ? { completarReserva: true } : undefined });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Personal del sistema ─────────────────────────────── */
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await loginService(identificador, password);
      login(data);
      navigate('/sistema');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .login-root { font-family: 'Outfit', sans-serif; }
        .brand-serif { font-family: 'Cormorant Garamond', serif; }

        @keyframes cardUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes logoReveal {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3;  transform: translate(-50%, -50%) scale(1);    }
          50%       { opacity: 0.52; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        .anim-logo { animation: logoReveal 0.75s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .anim-card { animation: cardUp     0.85s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .anim-1    { animation: fadeIn     0.5s  ease                        0.35s both; }
        .anim-2    { animation: fadeIn     0.5s  ease                        0.5s  both; }
        .anim-3    { animation: fadeIn     0.5s  ease                        0.65s both; }
        .anim-4    { animation: fadeIn     0.5s  ease                        0.78s both; }
        .anim-5    { animation: fadeIn     0.5s  ease                        0.92s both; }
        .anim-glow {
          animation: glowPulse 5s ease-in-out infinite;
          position: absolute;
          top: 50%; left: 50%;
          width: 720px; height: 720px;
          background: radial-gradient(ellipse, rgba(240,163,10,0.11) 0%, transparent 68%);
          border-radius: 50%;
          pointer-events: none;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(240,163,10,0.065) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 12px 16px;
          color: #F0EDE6;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.22); }
        .field-input:focus {
          border-color: rgba(240,163,10,0.55);
          background: rgba(240,163,10,0.04);
          box-shadow: 0 0 0 3px rgba(240,163,10,0.11);
        }
        .field-input-pr { padding-right: 48px; }

        .submit-btn {
          width: 100%;
          padding: 13px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F0A30A 0%, #E8840A 60%, #FF6F00 100%);
          color: #0D0F12;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.025em;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 22px rgba(240,163,10,0.32), 0 1px 4px rgba(0,0,0,0.4);
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.91;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(240,163,10,0.42), 0 2px 8px rgba(0,0,0,0.4);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 11px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.09);
          background: transparent;
          color: rgba(255,255,255,0.38);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .back-btn:hover {
          border-color: rgba(240,163,10,0.3);
          color: rgba(240,163,10,0.8);
          background: rgba(240,163,10,0.04);
        }

        .pw-toggle {
          position: absolute;
          top: 0; bottom: 0; right: 12px;
          display: flex; align-items: center;
          background: none; border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.28);
          padding: 0 4px;
          transition: color 0.2s;
        }
        .pw-toggle:hover { color: rgba(240,163,10,0.7); }
      `}</style>

      <div
        className="login-root dot-grid min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: '#0D0F12' }}
      >
        {/* Ambient amber glow */}
        <div className="anim-glow" />

        {/* Corner vignettes */}
        <div className="pointer-events-none absolute top-0 left-0 w-72 h-72"
          style={{ background: 'radial-gradient(circle at 0% 0%, rgba(240,163,10,0.055) 0%, transparent 65%)' }} />
        <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72"
          style={{ background: 'radial-gradient(circle at 100% 100%, rgba(240,163,10,0.045) 0%, transparent 65%)' }} />

        {/* ── Logo ─────────────────────────────────────────── */}
        <div className="anim-logo relative z-10 mb-5 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute"
              style={{
                inset: '-12px',
                background: 'radial-gradient(ellipse, rgba(240,163,10,0.22) 0%, transparent 70%)',
                filter: 'blur(16px)',
                borderRadius: '50%',
              }}
            />
            <img
              src="/logo.png"
              alt="H&H Residencial"
              style={{
                height: 88,
                width: 'auto',
                position: 'relative',
                filter: 'drop-shadow(0 6px 20px rgba(240,163,10,0.28)) drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
              }}
            />
          </div>
        </div>

        {/* ── Card ─────────────────────────────────────────── */}
        <div
          className="anim-card relative z-10 w-full"
          style={{
            maxWidth: 430,
            background: 'rgba(16,19,28,0.96)',
            border: '1px solid rgba(240,163,10,0.16)',
            borderRadius: 22,
            boxShadow:
              '0 0 0 1px rgba(240,163,10,0.04), ' +
              '0 40px 90px rgba(0,0,0,0.75), ' +
              '0 8px 32px rgba(0,0,0,0.5), ' +
              'inset 0 1px 0 rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            padding: '34px 34px 30px',
          }}
        >
          {/* Brand heading */}
          <div className="anim-1 text-center mb-8">
            <h1
              className="brand-serif"
              style={{ fontSize: 32, fontWeight: 600, color: '#F5F0E6', letterSpacing: '0.015em', lineHeight: 1.1 }}
            >
              RESIDENCIAL
            </h1>
            <p
              style={{
                marginTop: 8,
                fontSize: 11.5,
                color: 'rgba(255,255,255,0.32)',
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Bienvenido &middot; Inicia sesión
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ color: '#FCA5A5', fontSize: 13 }}>{error}</p>
            </div>
          )}

          {/* ── Google — huéspedes ── */}
          <div className="anim-2 mb-6">
            
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center gap-2 py-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(240,163,10,0.5)', borderTopColor: 'transparent' }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Iniciando sesión...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError('Error al iniciar sesión con Google')}
                  useOneTap
                  text="continue_with"
                  locale="es"
                />
              )}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="anim-3 flex items-center gap-3 mb-6">
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: 'rgba(240,163,10,0.5)',
                whiteSpace: 'nowrap',
              }}
            >
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* ── Formulario personal ── */}
          <form onSubmit={handlePersonalSubmit} className="anim-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.04em' }}>
                CI o Correo Electrónico
              </label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
                placeholder="ejemplo@residencial.com"
                className="field-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.04em' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingrese su contraseña"
                  className="field-input field-input-pr"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="pw-toggle">
                  {showPassword ? (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="submit-btn" style={{ marginTop: 4 }}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg className="animate-spin" width="15" height="15" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Iniciar sesión
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Volver al inicio */}
          <div className="anim-5 mt-4">
            <button onClick={() => navigate('/')} className="back-btn">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver al inicio
            </button>
          </div>
        </div>

        {/* Footer */}
        <p
          className="anim-5 relative z-10 mt-7"
          style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}
        >
          © {new Date().getFullYear()}{' '}
          <span style={{ color: 'rgba(240,163,10,0.45)' }}>H&amp;H Residencial</span>
          . Todos los derechos reservados.
        </p>
      </div>
    </>
  );
};

export default Login;
