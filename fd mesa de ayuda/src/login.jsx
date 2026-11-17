import { API_BASE_URL } from './config/api.js';
import { useState } from "react";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    HeartPulse,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
    Stethoscope,
    UserRound,
    Wrench
} from "lucide-react";
import clinica from "./assets/clinica.png";
import logo from "./assets/logo.png";

const mesas = [
    { id: 1, nombre: "TIC", descripcion: "Tecnología y sistemas", icono: Building2 },
    { id: 2, nombre: "Biomédica", descripcion: "Equipos biomédicos", icono: Stethoscope },
    { id: 3, nombre: "Mantenimiento", descripcion: "Infraestructura y servicios", icono: Wrench }
];

function Login({ setLogeado, setLogeo }) {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [mesa, setMesa] = useState(0);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const obtenerIp = async () => {
        try {
            const respuesta = await fetch("https://api.ipify.org?format=json");
            if (!respuesta.ok) return null;
            const datos = await respuesta.json();
            return datos.ip || null;
        } catch {
            return null;
        }
    };

    const iniciarSesion = async (evento) => {
        evento.preventDefault();
        if (!usuario.trim() || !password) {
            setError("Ingresa tu usuario y contraseña.");
            return;
        }
        if (!Number(mesa)) {
            setError("Selecciona la mesa de ayuda que necesitas.");
            return;
        }

        setCargando(true);
        setError("");
        try {
            const ip = await obtenerIp();
            const respuesta = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: usuario.trim(),
                    password,
                    ip,
                    mesa: Number(mesa)
                })
            });
            const datos = await respuesta.json().catch(() => null);
            if (!respuesta.ok) {
                throw new Error(datos?.mensaje || datos?.message || "Usuario o contraseña incorrectos.");
            }

            localStorage.setItem("token", datos.token);
            localStorage.setItem("usuario", JSON.stringify(datos));
            setLogeo(datos);
            setLogeado(true);
        } catch (errorInicio) {
            setError(
                errorInicio instanceof TypeError
                    ? "No fue posible conectar con el servidor. Intenta nuevamente."
                    : errorInicio.message
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="login-magic-shell">
            <div className="login-grid-pattern" aria-hidden="true" />
            <div className="login-orb login-orb-one" aria-hidden="true" />
            <div className="login-orb login-orb-two" aria-hidden="true" />

            <section className="login-magic-card">
                <aside className="login-showcase">
                    <img src={clinica} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#062d68]/55 via-[#073b78]/72 to-[#031d43]/95" />
                    <div className="login-showcase-pattern" aria-hidden="true" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white sm:p-9 lg:p-11">
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/95 p-2 shadow-xl">
                                <img src={logo} alt="Clínica Belén" className="h-full w-full object-contain" />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">Clínica Belén</p>
                                <p className="mt-0.5 text-sm text-white/75">Servicios institucionales</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                                <HeartPulse size={15} /> Mesa de ayuda multiservicio
                            </span>
                            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                                Estamos aquí para ayudarte.
                            </h1>
                            <p className="mt-5 max-w-sm text-sm leading-6 text-blue-50/80 sm:text-base">
                                Registra y consulta tus solicitudes de manera rápida, segura y centralizada.
                            </p>
                        </div>

                        <div className="grid gap-2 text-sm text-blue-50/85 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            {["Atención organizada", "Seguimiento claro", "Información segura"].map((texto) => (
                                <span key={texto} className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="shrink-0 text-cyan-300" /> {texto}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="flex min-h-0 flex-col justify-center bg-white/95 px-5 py-8 backdrop-blur-xl sm:px-10 lg:px-12">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-7">
                            <span className="login-icon-badge"><HeartPulse size={24} /></span>
                            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Acceso institucional</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Bienvenido</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Selecciona tu mesa e ingresa tus credenciales.
                            </p>
                        </div>

                        <form onSubmit={iniciarSesion} className="space-y-5" noValidate>
                            <fieldset disabled={cargando}>
                                <legend className="mb-3 text-sm font-bold text-slate-700">¿Qué servicio necesitas?</legend>
                                <div className="grid grid-cols-3 gap-2">
                                    {mesas.map(({ id, nombre, descripcion, icono: Icono }) => {
                                        const seleccionada = Number(mesa) === id;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => { setMesa(id); setError(""); }}
                                                aria-pressed={seleccionada}
                                                title={descripcion}
                                                className={`login-service-option ${seleccionada ? "login-service-option-active" : ""}`}
                                            >
                                                <Icono size={20} />
                                                <span>{nombre}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-bold text-slate-700">Usuario</span>
                                    <span className="login-input-wrapper">
                                        <UserRound size={18} aria-hidden="true" />
                                        <input
                                            type="text"
                                            value={usuario}
                                            onChange={(evento) => { setUsuario(evento.target.value); setError(""); }}
                                            autoComplete="username"
                                            placeholder="Ingresa tu usuario"
                                            disabled={cargando}
                                            className="login-input"
                                        />
                                    </span>
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-bold text-slate-700">Contraseña</span>
                                    <span className="login-input-wrapper">
                                        <LockKeyhole size={18} aria-hidden="true" />
                                        <input
                                            type={mostrarPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(evento) => { setPassword(evento.target.value); setError(""); }}
                                            autoComplete="current-password"
                                            placeholder="Ingresa tu contraseña"
                                            disabled={cargando}
                                            className="login-input pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarPassword((visible) => !visible)}
                                            className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                            aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        >
                                            {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={cargando} className="login-submit-button">
                                {cargando ? (
                                    <><LoaderCircle size={19} className="animate-spin" /> Validando acceso...</>
                                ) : (
                                    <>Iniciar sesión <ArrowRight size={19} /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
                            <ShieldCheck size={17} className="text-emerald-500" />
                            Acceso protegido para personal autorizado
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;
