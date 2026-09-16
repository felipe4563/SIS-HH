import axios from 'axios';

let cachedToken = null;
let tokenExpiresAt = 0;

export class QrBanecoService {
  static getConfig() {
    const baseUrl = (process.env.BANCO_ECONOMICO_BASE_URL || '').replace(/\/$/, '');
    return {
      baseUrl,
      user: process.env.BANCO_ECONOMICO_USER,
      password: process.env.BANCO_ECONOMICO_PASSWORD,
      aesKey: process.env.BANCO_ECONOMICO_AES_KEY,
      accountCredit: process.env.BANCO_ECONOMICO_ACCOUNT_CREDIT,
    };
  }

  /**
   * El banco expone su propio endpoint de cifrado AES-256; no se reimplementa
   * el algoritmo localmente. Es un GET con query params, y devuelve texto plano.
   */
  static async encriptar(texto) {
    const config = this.getConfig();
    const response = await axios.get(`${config.baseUrl}/api/authentication/encrypt`, {
      params: { text: texto, aesKey: config.aesKey },
    });
    return typeof response.data === 'string' ? response.data.trim() : String(response.data);
  }

  static decodificarExpiracionToken(token) {
    try {
      const payload = token.split('.')[1];
      const json = Buffer.from(payload, 'base64').toString('utf8');
      const { exp } = JSON.parse(json);
      return exp ? exp * 1000 : Date.now() + 20 * 60 * 1000;
    } catch {
      return Date.now() + 20 * 60 * 1000;
    }
  }

  /**
   * Cachea el token Bearer en memoria del proceso; solo vuelve a autenticar
   * cuando falta menos de 1 minuto para que expire (o no hay token todavía).
   */
  static async autenticar() {
    if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
      return cachedToken;
    }

    const config = this.getConfig();
    const passwordCifrado = await this.encriptar(config.password);

    const response = await axios.post(`${config.baseUrl}/api/authentication/authenticate`, {
      userName: config.user,
      password: passwordCifrado,
    });

    if (response.data.responseCode !== 0) {
      throw new Error(response.data.message || 'Error al autenticar con Banco Económico');
    }

    cachedToken = response.data.token;
    tokenExpiresAt = this.decodificarExpiracionToken(cachedToken);
    return cachedToken;
  }

  /**
   * Genera un QR de pago único (singleUse) por el monto exacto (modifyAmount:false).
   * dueDate del banco es solo fecha (yyyy-MM-dd) - no controla la expiración real
   * de 20 minutos, esa la maneja pago.controller.js con `fecha_expiracion`.
   */
  static async generarQR({ transactionId, monto, descripcion }) {
    const config = this.getConfig();
    const token = await this.autenticar();
    const accountCreditCifrado = await this.encriptar(config.accountCredit);

    const hoy = new Date();
    const dueDate = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    let desc = descripcion || `Reserva ${transactionId}`;
    if (desc.length > 200) {
      desc = desc.substring(0, 200);
    }

    const response = await axios.post(
      `${config.baseUrl}/api/qrsimple/generateQR`,
      {
        transactionId: String(transactionId),
        accountCredit: accountCreditCifrado,
        currency: 'BOB',
        amount: parseFloat(monto),
        description: desc,
        dueDate,
        singleUse: true,
        modifyAmount: false,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.responseCode !== 0) {
      throw new Error(response.data.message || 'Error al generar el QR');
    }

    return {
      qrId: response.data.qrId,
      qrImage: response.data.qrImage,
      fechaExpiracion: new Date(Date.now() + 20 * 60 * 1000),
    };
  }

  /**
   * statusQrCode: 0 = activo pendiente de pago, 1 = pagado, 9 = anulado.
   * El campo `payment` de la respuesta del banco viene como lista; se toma
   * el primer elemento si existe.
   */
  static async consultarEstado(qrId) {
    const config = this.getConfig();
    const token = await this.autenticar();

    const response = await axios.get(`${config.baseUrl}/api/qrsimple/v2/statusQR/${qrId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.responseCode !== 0) {
      throw new Error(response.data.message || 'Error al consultar el estado del QR');
    }

    const pagos = Array.isArray(response.data.payment)
      ? response.data.payment
      : (response.data.payment ? [response.data.payment] : []);

    return {
      statusQrCode: response.data.statusQrCode,
      pago: pagos[0] || null,
    };
  }

  /**
   * Best-effort: si falla la anulación no debe romper el flujo de expiración
   * (el QR de todas formas ya no se muestra al usuario).
   */
  static async cancelarQR(qrId) {
    try {
      const config = this.getConfig();
      const token = await this.autenticar();
      await axios.delete(`${config.baseUrl}/api/qrsimple/cancelQR`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { qrId },
      });
    } catch (error) {
      console.error('⚠️ No se pudo cancelar el QR (best-effort):', error.message);
    }
  }
}
