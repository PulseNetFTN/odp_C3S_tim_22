import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';
import AuthInput from '../../components/auth/AuthInput';
import AuthError from '../../components/auth/AuthError';
import AuthSubmitButton from '../../components/auth/AuthSubmitButton';
import { useAnimatedBackground } from '../../hooks/other/useAnimatedBackground';
import { validateLogin } from '../../utils/authValidations';
import { API } from '../../constants/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { pCanvasRef, ekgWrapRef, eCanvasRef, mounted } = useAnimatedBackground('centered');

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
        setError('');
        const validationError = validateLogin(username, password);
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API.BASE_URL}auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!data.success) { setError(data.message || 'Login failed'); return; }
            login(data.data.accessToken);
            navigate('/feed');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-surface-base font-dm overflow-hidden">
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&family=Roboto:wght@700;900&display=swap"
                rel="stylesheet"
            />

            <canvas
                ref={pCanvasRef}
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{ zIndex: 0, height: '100vh' }}
            />

            <div
                ref={ekgWrapRef}
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    top: '45%',
                    left: 0,
                    width: '100%',
                    height: '360px',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                }}
            >
                <canvas
                    ref={eCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
            </div>

            <div
                className="relative flex items-center justify-center min-h-screen"
                style={{ zIndex: 2 }}
            >
                <div
                    className="w-full max-w-[420px] mx-4"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    <div className="text-center mb-8">
                        <Link to="/" className="no-underline inline-block">
                            <span className="font-syne text-white font-black text-3xl tracking-tight">
                                Pulse<span className="text-pulse">Net</span>
                            </span>
                        </Link>
                    </div>

                    <div
                        className="rounded-lg px-8 py-8"
                        style={{
                            background: 'rgba(10,10,16,0.80)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(32px)',
                            WebkitBackdropFilter: 'blur(32px)',
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 40px 100px rgba(0,0,0,0.6)',
                        }}
                    >
                        <div className="text-center mb-7">
                            <p
                                className="text-pulse mb-1.5"
                                style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
                            >
                                Authentication
                            </p>
                            <h1
                                className="text-white text-[1.5rem] leading-tight"
                                style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}
                            >
                                Login to continue
                            </h1>
                        </div>

                        <AuthError message={error} />

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <AuthInput
                                label="Username"
                                value={username}
                                onChange={setUsername}
                                placeholder="username"
                                required
                            />
                            <AuthInput
                                label="Password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder="••••••••"
                                required
                            />
                            <div className="pt-2">
                                <AuthSubmitButton loading={loading} label="Sign in" loadingLabel="Signing in..." />
                            </div>
                        </form>
                    </div>

                    <p className="mt-5 text-sm font-light text-muted-soft text-center">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-pulse no-underline hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}