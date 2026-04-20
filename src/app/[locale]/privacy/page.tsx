import { useLocale } from "next-intl";
import { LegalArticle } from "@/components/legal-article";

export default function PrivacyPage() {
  const locale = useLocale();
  const es = locale === "es";

  return (
    <LegalArticle
      eyebrow={es ? "Documentos legales" : "Legal documents"}
      title={es ? "Política de privacidad" : "Privacy policy"}
      lastUpdated={es ? "Última actualización: 19 de abril de 2026" : "Last updated: April 19, 2026"}
      draftLabel={es ? "Borrador, pendiente de revisión legal" : "Draft, pending legal review"}
    >
      {es ? <SpanishPrivacy /> : <EnglishPrivacy />}
    </LegalArticle>
  );
}

function SpanishPrivacy() {
  return (
    <>
      <p>
        En CuidaMascotas tratamos tus datos personales con respeto y conforme al
        Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica
        3/2018 de Protección de Datos y Garantía de los Derechos Digitales
        (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        CuidaMascotas (datos de contacto y NIF: pendientes de incorporación
        societaria). Email de contacto:{" "}
        <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>.
      </p>

      <h2>2. Datos que tratamos</h2>
      <ul>
        <li>Datos de identificación: nombre, email, teléfono, ciudad o barrio.</li>
        <li>Datos de verificación: copia de DNI o NIE y, en su caso, póliza de seguro (cuidadores).</li>
        <li>Datos de mascotas: especie, raza, edad, notas relevantes para el cuidado.</li>
        <li>Datos de uso: reservas, mensajes, valoraciones, ubicación durante visitas activas.</li>
        <li>Datos de pago: gestionados directamente por Stripe; no almacenamos datos completos de tarjeta.</li>
      </ul>

      <h2>3. Finalidades y base jurídica</h2>
      <ul>
        <li>Prestar el servicio de la plataforma — base: ejecución del contrato.</li>
        <li>Verificar identidad y prevenir fraude — base: interés legítimo y obligación legal.</li>
        <li>Procesar pagos y emitir resúmenes para tu facturación — base: ejecución del contrato.</li>
        <li>Enviarte comunicaciones operativas (reservas, verificaciones) — base: ejecución del contrato.</li>
        <li>Enviarte comunicaciones comerciales — base: consentimiento, revocable en cualquier momento.</li>
      </ul>

      <h2>4. Plazo de conservación</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa y, tras su baja,
        durante los plazos exigidos legalmente (hasta 6 años para datos
        contables, hasta 5 años para datos relativos a contratos).
      </p>

      <h2>5. Destinatarios</h2>
      <ul>
        <li>Stripe Payments Europe Ltd. — procesamiento de pagos.</li>
        <li>Supabase Inc. — alojamiento de datos (servidores en la UE).</li>
        <li>Vercel Inc. — alojamiento web (CDN europeo, Frankfurt).</li>
        <li>Otros usuarios de la plataforma — solo los datos necesarios para la reserva.</li>
      </ul>
      <p>
        No realizamos transferencias internacionales fuera del Espacio Económico
        Europeo salvo a proveedores con garantías adecuadas (cláusulas
        contractuales tipo de la Comisión Europea).
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento los siguientes derechos:
      </p>
      <ul>
        <li>Acceso a tus datos.</li>
        <li>Rectificación de datos inexactos.</li>
        <li>Supresión cuando ya no sean necesarios.</li>
        <li>Oposición al tratamiento basado en interés legítimo.</li>
        <li>Limitación del tratamiento.</li>
        <li>Portabilidad de tus datos.</li>
        <li>Revocar el consentimiento prestado.</li>
      </ul>
      <p>
        Para ejercerlos, escríbenos a{" "}
        <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>{" "}
        adjuntando copia de tu DNI/NIE.
      </p>

      <h2>7. Reclamación ante la AEPD</h2>
      <p>
        Si consideras que el tratamiento de tus datos no se ajusta a la
        normativa, puedes presentar una reclamación ante la Agencia Española de
        Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>8. Cookies</h2>
      <p>
        Utilizamos únicamente cookies técnicas necesarias para el funcionamiento
        del servicio (sesión, preferencias de idioma). No utilizamos cookies
        publicitarias ni de seguimiento de terceros sin tu consentimiento.
      </p>
    </>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <p>
        At CuidaMascotas we process your personal data with respect and in
        accordance with the General Data Protection Regulation (GDPR) and the
        Spanish Organic Law 3/2018 on Personal Data Protection (LOPDGDD).
      </p>

      <h2>1. Data controller</h2>
      <p>
        CuidaMascotas (contact details and tax ID: pending company
        incorporation). Contact email:{" "}
        <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>.
      </p>

      <h2>2. Data we process</h2>
      <ul>
        <li>Identification data: name, email, phone, city or neighborhood.</li>
        <li>Verification data: copy of DNI or NIE and, where applicable, insurance policy (sitters).</li>
        <li>Pet data: species, breed, age, relevant care notes.</li>
        <li>Usage data: bookings, messages, reviews, location during active visits.</li>
        <li>Payment data: handled directly by Stripe; we do not store full card data.</li>
      </ul>

      <h2>3. Purposes and legal basis</h2>
      <ul>
        <li>Provide the platform service — basis: contract performance.</li>
        <li>Verify identity and prevent fraud — basis: legitimate interest and legal obligation.</li>
        <li>Process payments and issue summaries for your invoicing — basis: contract performance.</li>
        <li>Send operational communications (bookings, verifications) — basis: contract performance.</li>
        <li>Send marketing communications — basis: consent, revocable at any time.</li>
      </ul>

      <h2>4. Retention period</h2>
      <p>
        We keep your data while your account is active and, after closure, for
        the periods required by law (up to 6 years for accounting data, up to
        5 years for contractual data).
      </p>

      <h2>5. Recipients</h2>
      <ul>
        <li>Stripe Payments Europe Ltd. — payment processing.</li>
        <li>Supabase Inc. — data hosting (EU servers).</li>
        <li>Vercel Inc. — web hosting (European CDN, Frankfurt).</li>
        <li>Other platform users — only the data necessary for the booking.</li>
      </ul>
      <p>
        We do not make international transfers outside the European Economic
        Area except to providers with adequate safeguards (Standard Contractual
        Clauses from the European Commission).
      </p>

      <h2>6. Your rights</h2>
      <p>You can exercise the following rights at any time:</p>
      <ul>
        <li>Access to your data.</li>
        <li>Rectification of inaccurate data.</li>
        <li>Erasure when no longer necessary.</li>
        <li>Objection to processing based on legitimate interest.</li>
        <li>Restriction of processing.</li>
        <li>Portability of your data.</li>
        <li>Withdrawal of consent.</li>
      </ul>
      <p>
        To exercise them, write to{" "}
        <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>{" "}
        attaching a copy of your ID.
      </p>

      <h2>7. Complaint to the AEPD</h2>
      <p>
        If you consider that the processing of your data does not comply with
        the regulations, you may file a complaint with the Spanish Data
        Protection Agency (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use only technical cookies necessary for the service to function
        (session, language preference). We do not use advertising or
        third-party tracking cookies without your consent.
      </p>
    </>
  );
}
