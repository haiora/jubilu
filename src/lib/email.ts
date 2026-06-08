import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? 'Jubilé d\'Israël <contact@jubilee-israel.org>';
const websiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jubilee-israel.org';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Build a one-click unsubscribe URL for a given recipient email.
 */
export function unsubscribeUrl(email: string, locale = 'fr'): string {
  const token = Buffer.from(email, 'utf8').toString('base64url');
  return `${websiteUrl}/${locale}/desabonnement?token=${token}`;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY absent — email non envoyé (mode démo) :', { to, subject });
    return { id: null, skipped: true as const };
  }
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    replyTo
  });
  if (error) {
    console.error('[email] Erreur Resend :', error);
    throw new Error(error.message);
  }
  return { id: data?.id ?? null, skipped: false as const };
}

// ==========================================
// EMAIL DESIGN SYSTEM (Premium Templates)
// ==========================================

const COLOR_NAVY = '#1f3350';
const COLOR_GOLD = '#cf9d4f';
const COLOR_BG = '#f7f4ee';
const COLOR_TEXT = '#384a63';

const UNSUB_LABEL: Record<string, string> = {
  fr: 'Se désabonner',
  en: 'Unsubscribe',
  es: 'Darse de baja',
  he: 'הסרה מרשימת התפוצה'
};

function buildLayout(title: string, content: string, locale: string, unsub?: string): string {
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const align = locale === 'he' ? 'right' : 'left';
  const unsubHtml = unsub
    ? `<p style="margin:12px 0 0;"><a href="${unsub}" style="color:#8a8170;text-decoration:underline;">${UNSUB_LABEL[locale] ?? UNSUB_LABEL.fr}</a></p>`
    : '';
  
  const signature = {
    fr: "Avec toute notre gratitude,<br/><strong>L'équipe de Jubilé depuis Jérusalem</strong>",
    en: "With all our gratitude,<br/><strong>The Jubilee Team from Jerusalem</strong>",
    es: "Con toda nuestra gratitud,<br/><strong>El equipo de Jubileo desde Jerusalén</strong>",
    he: "בהכרת תודה עמוקה,<br/><strong>צוות יובל מירושלים</strong>"
  }[locale as 'fr'|'en'|'es'|'he'] ?? "L'équipe de Jubilé depuis Jérusalem";

  const verse = {
    fr: "« Priez pour la paix de Jérusalem. » — Psaume 122:6",
    en: "« Pray for the peace of Jerusalem. » — Psalm 122:6",
    es: "« Pedid por la paz de Jerusalén. » — Salmo 122:6",
    he: "« שַׁאֲלוּ שְׁלוֹם יְרוּשָׁלָ‍ִם » — תהילים קכ\"ב:ו"
  }[locale as 'fr'|'en'|'es'|'he'] ?? "« Priez pour la paix de Jérusalem. » — Psaume 122:6";

  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<body style="margin:0;background:${COLOR_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';color:${COLOR_TEXT}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR_BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e0d4;box-shadow:0 10px 25px rgba(31,51,80,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:${COLOR_NAVY};padding:36px;text-align:center;">
              <div style="color:${COLOR_GOLD};font-size:28px;font-weight:700;letter-spacing:2px;font-family:Georgia,serif;">JUBILÉ</div>
              <div style="color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:4px;margin-top:8px;text-transform:uppercase;">ISRAËL</div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;text-align:${align};">
              <h1 style="margin:0 0 24px;font-size:24px;color:${COLOR_NAVY};font-family:Georgia,serif;font-weight:normal;">${title}</h1>
              <div style="font-size:16px;line-height:1.7;color:${COLOR_TEXT};">
                ${content}
              </div>
              <div style="margin-top:40px;padding-top:30px;border-top:1px solid #e7e0d4;font-size:16px;line-height:1.6;color:${COLOR_NAVY};">
                ${signature}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:${COLOR_BG};text-align:center;font-size:13px;color:#8a8170;line-height:1.5;">
              <p style="margin:0 0 12px;font-family:Georgia,serif;color:${COLOR_GOLD};font-size:14px;font-style:italic;">${verse}</p>
              <p style="margin:0;"><a href="${websiteUrl}" style="color:#8a8170;text-decoration:none;">${websiteUrl.replace('https://','')}</a></p>
              ${unsubHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ------------------------------------------
// 1. WELCOME / NEWSLETTER EMAIL
// ------------------------------------------
export function getWelcomeEmail(locale: string, name?: string, email?: string): { subject: string, html: string } {
  const translations = {
    fr: {
      subject: "Bienvenue dans la famille Jubilé",
      title: name ? `Shalom ${name},` : "Shalom,",
      body: `
        <p>Nous sommes très heureux de vous compter parmi les proches de Jubilé.</p>
        <p>En vous inscrivant à notre lettre de nouvelles, vous venez de rejoindre une communauté attachée à l'Histoire, aux racines de la foi, et à l'excellence de la Terre d'Israël.</p>
        <p>Vous recevrez prochainement des nouvelles de nos vignerons, des aperçus de notre atelier de calligraphie à Jérusalem, ainsi que nos offres exclusives.</p>
        <p>Merci pour votre soutien et votre amour pour la Terre sainte.</p>
      `
    },
    en: {
      subject: "Welcome to the Jubilee family",
      title: name ? `Shalom ${name},` : "Shalom,",
      body: `
        <p>We are thrilled to welcome you to the Jubilee family.</p>
        <p>By subscribing to our newsletter, you have joined a community attached to History, the roots of faith, and the excellence of the Land of Israel.</p>
        <p>You will soon receive updates from our winemakers, glimpses of our calligraphy workshop in Jerusalem, and our exclusive offers.</p>
        <p>Thank you for your support and your love for the Holy Land.</p>
      `
    },
    es: {
      subject: "Bienvenido a la familia Jubileo",
      title: name ? `Shalom ${name},` : "Shalom,",
      body: `
        <p>Estamos muy felices de contarle entre los allegados de Jubileo.</p>
        <p>Al suscribirse a nuestro boletín, se ha unido a una comunidad apegada a la Historia, a las raíces de la fe y a la excelencia de la Tierra de Israel.</p>
        <p>Pronto recibirá noticias de nuestros viticultores, un vistazo a nuestro taller de caligrafía en Jerusalén, así como nuestras ofertas exclusivas.</p>
        <p>Gracias por su apoyo y su amor por la Tierra Santa.</p>
      `
    },
    he: {
      subject: "ברוכים הבאים למשפחת יובל",
      title: name ? `שלום ${name},` : "שלום,",
      body: `
        <p>אנו שמחים מאוד לצרף אותך למעגל הקרובים של יובל.</p>
        <p>בהרשמתך לניוזלטר שלנו, הצטרפת לקהילה המחוברת להיסטוריה, לשורשי האמונה ולמצוינות של ארץ ישראל.</p>
        <p>בקרוב תקבל/י עדכונים מהכורמים שלנו, הצצה לסדנת הקליגרפיה שלנו בירושלים, וכן הצעות בלעדיות.</p>
        <p>תודה על תמיכתך ואהבתך לארץ הקודש.</p>
      `
    }
  };
  const t = translations[locale as 'fr'|'en'|'es'|'he'] ?? translations.fr; // fallback to fr

  return {
    subject: t.subject,
    html: buildLayout(t.title, t.body, locale, email ? unsubscribeUrl(email, locale) : undefined)
  };
}

// ------------------------------------------
// 2. ORDER CONFIRMATION EMAIL
// ------------------------------------------
export function getOrderConfirmationEmail(locale: string, name: string, orderNumber: string, itemsHtml: string, total: string): { subject: string, html: string } {
  const translations = {
    fr: {
      subject: `Confirmation de votre commande n°${orderNumber}`,
      title: `Merci pour votre confiance, ${name}.`,
      body: `
        <p>Nous avons bien reçu votre commande <strong>n°${orderNumber}</strong>. Nous préparons vos articles avec le plus grand soin.</p>
        <div style="margin:30px 0;padding:20px;background:#fcfbf9;border-radius:12px;border:1px solid #e7e0d4;">
          <h2 style="margin:0 0 16px;font-size:16px;color:${COLOR_NAVY};text-transform:uppercase;letter-spacing:1px;">Résumé de votre commande</h2>
          <ul style="padding:0;margin:0;list-style:none;">
            ${itemsHtml}
          </ul>
          <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #cf9d4f;text-align:right;font-weight:bold;font-size:18px;">
            Total : ${total}
          </div>
        </div>
        <p>Vous recevrez un nouvel e-mail dès que votre colis quittera nos ateliers.</p>
      `
    },
    en: {
      subject: `Order Confirmation #${orderNumber}`,
      title: `Thank you for your trust, ${name}.`,
      body: `
        <p>We have received your order <strong>#${orderNumber}</strong>. We are preparing your items with the utmost care.</p>
        <div style="margin:30px 0;padding:20px;background:#fcfbf9;border-radius:12px;border:1px solid #e7e0d4;">
          <h2 style="margin:0 0 16px;font-size:16px;color:${COLOR_NAVY};text-transform:uppercase;letter-spacing:1px;">Order Summary</h2>
          <ul style="padding:0;margin:0;list-style:none;">
            ${itemsHtml}
          </ul>
          <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #cf9d4f;text-align:right;font-weight:bold;font-size:18px;">
            Total: ${total}
          </div>
        </div>
        <p>You will receive another email as soon as your package leaves our workshop.</p>
      `
    },
    es: {
      subject: `Confirmación de su pedido n°${orderNumber}`,
      title: `Gracias por su confianza, ${name}.`,
      body: `
        <p>Hemos recibido su pedido <strong>n°${orderNumber}</strong>. Estamos preparando sus artículos con el mayor cuidado.</p>
        <div style="margin:30px 0;padding:20px;background:#fcfbf9;border-radius:12px;border:1px solid #e7e0d4;">
          <h2 style="margin:0 0 16px;font-size:16px;color:${COLOR_NAVY};text-transform:uppercase;letter-spacing:1px;">Resumen del pedido</h2>
          <ul style="padding:0;margin:0;list-style:none;">
            ${itemsHtml}
          </ul>
          <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #cf9d4f;text-align:right;font-weight:bold;font-size:18px;">
            Total: ${total}
          </div>
        </div>
        <p>Recibirá un nuevo correo electrónico tan pronto como su paquete salga de nuestros talleres.</p>
      `
    },
    he: {
      subject: `אישור הזמנה מס' ${orderNumber}`,
      title: `תודה על האמון שלך, ${name}.`,
      body: `
        <p>קיבלנו את הזמנתך <strong>מס' ${orderNumber}</strong>. אנו מכינים את הפריטים שלך בקפידה רבה.</p>
        <div style="margin:30px 0;padding:20px;background:#fcfbf9;border-radius:12px;border:1px solid #e7e0d4;">
          <h2 style="margin:0 0 16px;font-size:16px;color:${COLOR_NAVY};text-transform:uppercase;letter-spacing:1px;">סיכום הזמנה</h2>
          <ul style="padding:0;margin:0;list-style:none;">
            ${itemsHtml}
          </ul>
          <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #cf9d4f;text-align:left;font-weight:bold;font-size:18px;">
            סה"כ: ${total}
          </div>
        </div>
        <p>תקבל/י אימייל נוסף ברגע שהחבילה שלך תעזוב את הסדנאות שלנו.</p>
      `
    }
  };
  const t = translations[locale as 'fr'|'en'|'es'|'he'] ?? translations.fr;

  return {
    subject: t.subject,
    html: buildLayout(t.title, t.body, locale)
  };
}

// ------------------------------------------
// 3. CONTACT AUTO-REPLY EMAIL
// ------------------------------------------
export function getContactAutoReply(locale: string, name: string): { subject: string, html: string } {
  const translations = {
    fr: {
      subject: "Nous avons bien reçu votre message",
      title: `Bonjour ${name},`,
      body: `
        <p>Ceci est un message automatique pour vous confirmer que nous avons bien reçu votre demande.</p>
        <p>Notre équipe prendra soin de vous lire et de vous répondre dans les plus brefs délais (généralement sous 48h).</p>
        <p>Merci pour votre patience.</p>
      `
    },
    en: {
      subject: "We have received your message",
      title: `Hello ${name},`,
      body: `
        <p>This is an automated message to confirm that we have received your inquiry.</p>
        <p>Our team will carefully read your message and respond as soon as possible (usually within 48 hours).</p>
        <p>Thank you for your patience.</p>
      `
    },
    es: {
      subject: "Hemos recibido su mensaje",
      title: `Hola ${name},`,
      body: `
        <p>Este es un mensaje automático para confirmar que hemos recibido su solicitud.</p>
        <p>Nuestro equipo leerá atentamente su mensaje y le responderá lo antes posible (generalmente dentro de las 48 horas).</p>
        <p>Gracias por su paciencia.</p>
      `
    },
    he: {
      subject: "קיבלנו את הודעתך",
      title: `שלום ${name},`,
      body: `
        <p>זוהי הודעה אוטומטית לאישור שקיבלנו את פנייתך.</p>
        <p>הצוות שלנו יקרא את הודעתך וישיב בהקדם האפשרי (בדרך כלל תוך 48 שעות).</p>
        <p>תודה על סבלנותך.</p>
      `
    }
  };
  const t = translations[locale as 'fr'|'en'|'es'|'he'] ?? translations.fr;

  return {
    subject: t.subject,
    html: buildLayout(t.title, t.body, locale)
  };
}

// ------------------------------------------
// Old compat baseTemplate
// ------------------------------------------
export function baseTemplate(title: string, body: string): string {
  return buildLayout(title, body, 'fr');
}
