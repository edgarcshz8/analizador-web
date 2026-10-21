import { useState } from 'react';
import axios from 'axios';
import {
  Search, AlertCircle, CheckCircle, AlertTriangle,
  ExternalLink, Clock, Shield, FileText, Link, Image,
} from 'lucide-react';

/* ── Status helpers ──────────────────────────────────────────── */
const S = {
  ok:       { Icon: CheckCircle,   text: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', label: 'OK' },
  warning:  { Icon: AlertTriangle, text: 'text-amber-500',   bg: 'bg-amber-50',    border: 'border-amber-200',   label: 'Aviso' },
  critical: { Icon: AlertCircle,   text: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',     label: 'Crítico' },
  error:    { Icon: AlertCircle,   text: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',     label: 'Error' },
};

function scoreColor(n) {
  if (n >= 80) return 'text-emerald-400';
  if (n >= 60) return 'text-amber-400';
  return 'text-red-400';
}
function scoreBorder(n) {
  if (n >= 80) return 'border-emerald-800';
  if (n >= 60) return 'border-amber-800';
  return 'border-red-800';
}

/* ── Reusable components ─────────────────────────────────────── */
function CheckItem({ label, value, status, detail }) {
  const s = S[status] || S.ok;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
      <s.Icon size={15} className={`mt-0.5 flex-shrink-0 ${s.text}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          {value && <span className={`text-xs font-semibold ${s.text} flex-shrink-0`}>{value}</span>}
        </div>
        {detail && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={17} className="text-orange-600" />
        <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
        {badge && <span className="text-xs text-gray-400 ml-1">{badge}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function UrlList({ items, color }) {
  if (!items.length) return null;
  const bg     = color === 'red'  ? 'bg-red-50 border-red-100'    : 'bg-amber-50 border-amber-100';
  const text   = color === 'red'  ? 'text-red-700 bg-red-100'     : 'text-amber-700 bg-amber-100';
  return (
    <div className={`border rounded-xl overflow-hidden mt-1 ${bg}`}>
      {items.slice(0, 8).map((item, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 border-b last:border-0 gap-3">
          <p className="text-xs font-mono text-gray-600 truncate">{item.url || item.src || item.originalSrc}</p>
          {item.status !== undefined && (
            <span className={`text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full ${text}`}>
              {item.status || 'Error'}
            </span>
          )}
        </div>
      ))}
      {items.length > 8 && (
        <div className="px-3 py-2 text-xs text-gray-400">y {items.length - 8} más...</div>
      )}
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────────── */
export default function App() {
  const [url,     setUrl]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await axios.post('/api/analyze', { url: url.trim() }, { timeout: 90000 });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const r = result;

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Search size={17} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Analizador Web</p>
            <p className="text-orange-400 text-xs">Detecta problemas en cualquier sitio</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">

        {/* Input */}
        <div className="bg-white rounded-2xl border p-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">URL del sitio a analizar</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && analyze()}
                placeholder="https://ejemplo.com"
                className="w-full pl-9 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={analyze}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              {loading ? 'Analizando...' : 'Analizar'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">El análisis puede tardar entre 15 y 60 segundos según el tamaño del sitio.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-semibold text-gray-800">Analizando el sitio...</p>
            <p className="text-sm text-gray-400 mt-1">Verificando SSL, velocidad, SEO, enlaces e imágenes</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Error al analizar</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {r && (
          <>
            {/* Score banner */}
            <div className={`bg-gray-900 rounded-2xl border p-6 ${scoreBorder(r.summary.score)}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Puntuación general</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-7xl font-black leading-none ${scoreColor(r.summary.score)}`}>{r.summary.score}</span>
                    <span className="text-gray-500 text-xl mb-1">/100</span>
                  </div>
                  <a href={r.url} target="_blank" rel="noreferrer"
                     className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-400 mt-2 transition-colors">
                    <ExternalLink size={11} /> {r.url}
                  </a>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-black text-red-400">{r.summary.critical}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Críticos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-amber-400">{r.summary.warnings}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Avisos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400">{r.summary.passed}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Correctos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Speed + SSL */}
            <div className="grid grid-cols-2 gap-4">
              <Section icon={Clock} title="Velocidad">
                <CheckItem
                  label="Tiempo de respuesta"
                  value={`${r.speed.responseTime} ms`}
                  status={r.speed.status}
                  detail={
                    r.speed.status === 'ok'       ? 'Respuesta rápida — menos de 1 segundo' :
                    r.speed.status === 'warning'  ? 'Respuesta lenta — considera optimizar' :
                                                    'Respuesta muy lenta — afecta posicionamiento SEO'
                  }
                />
              </Section>

              <Section icon={Shield} title="Certificado SSL">
                {r.ssl.valid ? (
                  <CheckItem
                    label="HTTPS válido"
                    value={r.ssl.expiresIn !== null ? `Vence en ${r.ssl.expiresIn} días` : undefined}
                    status={r.ssl.status}
                    detail={`Emitido por: ${r.ssl.issuer || 'Desconocido'}`}
                  />
                ) : (
                  <CheckItem
                    label="Sin HTTPS o certificado inválido"
                    status="critical"
                    detail={r.ssl.error || 'El sitio no usa HTTPS — inseguro para los visitantes'}
                  />
                )}
              </Section>
            </div>

            {/* SEO */}
            <Section icon={FileText} title="SEO">
              <CheckItem
                label="Título de la página"
                value={r.seo.title.value ? `${r.seo.title.length} caracteres` : undefined}
                status={r.seo.title.status}
                detail={
                  !r.seo.title.value             ? 'Sin título — crítico para el posicionamiento' :
                  r.seo.title.length < 30         ? `Muy corto (ideal: 30–60): "${r.seo.title.value}"` :
                  r.seo.title.length > 60         ? `Muy largo, se corta en Google: "${r.seo.title.value.slice(0, 60)}..."` :
                                                    `"${r.seo.title.value}"`
                }
              />
              <CheckItem
                label="Meta descripción"
                value={r.seo.description.value ? `${r.seo.description.length} caracteres` : undefined}
                status={r.seo.description.status}
                detail={
                  !r.seo.description.value              ? 'Sin meta description — Google la genera automáticamente (no ideal)' :
                  r.seo.description.length < 120         ? 'Muy corta (ideal: 120–160 caracteres)' :
                  r.seo.description.length > 160         ? 'Muy larga, se corta en resultados de búsqueda' :
                                                           `"${r.seo.description.value.slice(0, 80)}..."`
                }
              />
              <CheckItem
                label={`Etiqueta H1 — ${r.seo.h1.count} encontradas`}
                status={r.seo.h1.status}
                detail={
                  r.seo.h1.count === 0 ? 'Sin H1 — la página debe tener exactamente una' :
                  r.seo.h1.count > 1   ? `Múltiples H1 confunden a Google: "${r.seo.h1.values.slice(0,2).join('", "')}"` :
                                         `"${r.seo.h1.values[0]}"`
                }
              />
              <CheckItem
                label="URL canónica (canonical)"
                status={r.seo.canonical.exists ? 'ok' : 'warning'}
                detail={r.seo.canonical.exists ? r.seo.canonical.value : 'Sin canonical — puede generar contenido duplicado'}
              />
              <CheckItem
                label="Viewport (diseño responsivo)"
                status={r.seo.viewport.exists ? 'ok' : 'critical'}
                detail={r.seo.viewport.exists ? 'Configurado — el sitio adapta al móvil' : 'Sin viewport — el sitio no es mobile-friendly'}
              />
              <CheckItem
                label="Open Graph (redes sociales)"
                status={r.seo.og.title.exists && r.seo.og.description.exists && r.seo.og.image.exists ? 'ok' : 'warning'}
                detail={
                  [
                    !r.seo.og.title.exists       && 'Falta og:title',
                    !r.seo.og.description.exists  && 'Falta og:description',
                    !r.seo.og.image.exists        && 'Falta og:image',
                  ].filter(Boolean).join(' · ') || 'Todos los tags og: configurados'
                }
              />
            </Section>

            {/* Links */}
            <Section icon={Link} title="Enlaces" badge={`${r.links.total} encontrados · ${r.links.checked} verificados`}>
              {r.links.broken.length === 0 ? (
                <CheckItem label="Sin enlaces rotos" status="ok" detail="Todos los enlaces verificados responden correctamente" />
              ) : (
                <>
                  <CheckItem
                    label={`${r.links.broken.length} enlace${r.links.broken.length > 1 ? 's' : ''} roto${r.links.broken.length > 1 ? 's' : ''}`}
                    status="critical"
                    detail="Estos enlaces devuelven error — deben corregirse"
                  />
                  <UrlList items={r.links.broken} color="red" />
                </>
              )}
              {r.links.redirects.length > 0 && (
                <CheckItem
                  label={`${r.links.redirects.length} redirección${r.links.redirects.length > 1 ? 'es' : ''} detectadas`}
                  status="warning"
                  detail="Considera actualizar estos enlaces apuntando directo a la URL final"
                />
              )}
            </Section>

            {/* Images */}
            <Section icon={Image} title="Imágenes" badge={`${r.images.total} encontradas`}>
              {r.images.broken.length === 0 ? (
                <CheckItem label="Sin imágenes rotas" status="ok" detail="Todas las imágenes cargan correctamente" />
              ) : (
                <>
                  <CheckItem
                    label={`${r.images.broken.length} imagen${r.images.broken.length > 1 ? 'es' : ''} rota${r.images.broken.length > 1 ? 's' : ''}`}
                    status="critical"
                    detail="Estas imágenes no cargan — el visitante ve un ícono de imagen rota"
                  />
                  <UrlList items={r.images.broken} color="red" />
                </>
              )}
              {r.images.missingAlt.length === 0 ? (
                <CheckItem label="Todas las imágenes tienen atributo alt" status="ok" detail="Correcto para SEO y accesibilidad" />
              ) : (
                <>
                  <CheckItem
                    label={`${r.images.missingAlt.length} imagen${r.images.missingAlt.length > 1 ? 'es' : ''} sin atributo alt`}
                    status="warning"
                    detail="El atributo alt describe la imagen a Google y a lectores de pantalla"
                  />
                  <UrlList items={r.images.missingAlt} color="amber" />
                </>
              )}
            </Section>

            <p className="text-center text-xs text-gray-600 pb-6">
              Análisis realizado el {new Date(r.analyzedAt).toLocaleString('es-CL')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
