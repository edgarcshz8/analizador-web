import tls from 'tls';
import { URL } from 'url';

export function checkSSL(urlStr) {
  return new Promise((resolve) => {
    try {
      const { protocol, hostname } = new URL(urlStr);

      if (protocol !== 'https:') {
        return resolve({ valid: false, expiresIn: null, issuer: null, status: 'critical', error: 'El sitio no usa HTTPS' });
      }

      const socket = tls.connect(443, hostname, { servername: hostname, timeout: 6000 }, () => {
        try {
          const cert = socket.getPeerCertificate();
          const valid = socket.authorized;
          const expiresIn = Math.floor((new Date(cert.valid_to) - Date.now()) / 86400000);
          socket.end();

          let status = 'ok';
          if (!valid || expiresIn < 0) status = 'critical';
          else if (expiresIn < 30)     status = 'warning';

          resolve({ valid, expiresIn, issuer: cert.issuer?.O || 'Desconocido', status });
        } catch {
          socket.end();
          resolve({ valid: false, expiresIn: null, issuer: null, status: 'critical', error: 'Error al leer certificado' });
        }
      });

      socket.on('error',   (err) => resolve({ valid: false, expiresIn: null, issuer: null, status: 'critical', error: err.message }));
      socket.on('timeout', ()    => { socket.end(); resolve({ valid: false, expiresIn: null, issuer: null, status: 'critical', error: 'Timeout al verificar SSL' }); });
    } catch {
      resolve({ valid: false, expiresIn: null, issuer: null, status: 'error', error: 'URL inválida' });
    }
  });
}
