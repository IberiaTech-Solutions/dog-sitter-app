import { useLocale } from "next-intl";
import { LegalArticle } from "@/components/legal-article";

export default function LegalNoticePage() {
  const locale = useLocale();
  const es = locale === "es";

  return (
    <LegalArticle
      eyebrow={es ? "Documentos legales" : "Legal documents"}
      title={es ? "Aviso legal" : "Legal notice"}
      lastUpdated={es ? "Última actualización: 19 de abril de 2026" : "Last updated: April 19, 2026"}
      draftLabel={es ? "Borrador, pendiente de revisión legal" : "Draft, pending legal review"}
    >
      {es ? <SpanishLegal /> : <EnglishLegal />}
    </LegalArticle>
  );
}

function SpanishLegal() {
  return (
    <>
      <p>
        En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la
        Información y Comercio Electrónico (LSSI-CE), se informa de los
        siguientes datos del titular del sitio web cuidamascotas.es.
      </p>

      <h2>1. Datos del titular</h2>
      <ul>
        <li>Denominación: CuidaMascotas (nombre comercial).</li>
        <li>NIF / CIF: pendiente de incorporación societaria.</li>
        <li>Domicilio: Gijón, Asturias (España). Dirección postal por definir.</li>
        <li>Email de contacto: <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>.</li>
      </ul>

      <h2>2. Actividad</h2>
      <p>
        CuidaMascotas opera una plataforma online que conecta dueños de
        mascotas con cuidadores locales y con una red de negocios del sector
        del cuidado animal. La plataforma facilita reservas, pagos,
        comunicación entre partes y una red local de descuentos.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y uso de la plataforma se rige por nuestras{" "}
        <a href="/terms">Condiciones de uso</a> y nuestra{" "}
        <a href="/privacy">Política de privacidad</a>.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Los contenidos del sitio (textos, imágenes, logotipos, código) son
        titularidad de CuidaMascotas o de terceros que han autorizado su uso.
        Su reproducción total o parcial sin autorización está prohibida.
      </p>

      <h2>5. Resolución de conflictos</h2>
      <p>
        Conforme al Reglamento (UE) 524/2013, los consumidores pueden acudir a
        la plataforma europea de resolución de litigios en línea:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>.
      </p>

      <h2>6. Legislación aplicable</h2>
      <p>
        El presente aviso legal se rige por la legislación española. Para los
        consumidores serán competentes los juzgados de su domicilio.
      </p>
    </>
  );
}

function EnglishLegal() {
  return (
    <>
      <p>
        In compliance with Spanish Law 34/2002 on Information Society Services
        and Electronic Commerce (LSSI-CE), the following data is provided
        regarding the owner of the website cuidamascotas.es.
      </p>

      <h2>1. Owner details</h2>
      <ul>
        <li>Trade name: CuidaMascotas.</li>
        <li>Tax ID: pending company incorporation.</li>
        <li>Address: Gijón, Asturias (Spain). Postal address to be defined.</li>
        <li>Contact email: <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>.</li>
      </ul>

      <h2>2. Activity</h2>
      <p>
        CuidaMascotas operates an online platform connecting pet owners with
        local sitters and a network of pet-care businesses. The platform
        facilitates bookings, payments, communication between parties, and a
        local discount network.
      </p>

      <h2>3. Terms of use</h2>
      <p>
        Access to and use of the platform is governed by our{" "}
        <a href="/terms">Terms of service</a> and our{" "}
        <a href="/privacy">Privacy policy</a>.
      </p>

      <h2>4. Intellectual property</h2>
      <p>
        The contents of the site (text, images, logos, code) are owned by
        CuidaMascotas or by third parties who have authorized their use. Total
        or partial reproduction without authorization is prohibited.
      </p>

      <h2>5. Dispute resolution</h2>
      <p>
        Under EU Regulation 524/2013, consumers may use the European online
        dispute resolution platform:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>.
      </p>

      <h2>6. Applicable law</h2>
      <p>
        This legal notice is governed by Spanish law. For consumers, the
        courts of their domicile have jurisdiction.
      </p>
    </>
  );
}
