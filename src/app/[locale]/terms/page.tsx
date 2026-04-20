import { useLocale } from "next-intl";
import { LegalArticle } from "@/components/legal-article";

export default function TermsPage() {
  const locale = useLocale();
  const es = locale === "es";

  return (
    <LegalArticle
      eyebrow={es ? "Documentos legales" : "Legal documents"}
      title={es ? "Condiciones de uso" : "Terms of service"}
      lastUpdated={es ? "Última actualización: 19 de abril de 2026" : "Last updated: April 19, 2026"}
      draftLabel={es ? "Borrador, pendiente de revisión legal" : "Draft, pending legal review"}
    >
      {es ? <SpanishTerms /> : <EnglishTerms />}
    </LegalArticle>
  );
}

function SpanishTerms() {
  return (
    <>
      <p>
        Estas condiciones regulan el acceso y uso de CuidaMascotas, una plataforma que
        conecta dueños de mascotas con cuidadores locales y con una red de negocios
        del sector (veterinarios, tiendas, peluquerías caninas) en España.
      </p>

      <h2>1. Aceptación</h2>
      <p>
        Al crear una cuenta o utilizar el servicio aceptas estas condiciones. Si no
        estás conforme, no utilices la plataforma.
      </p>

      <h2>2. Cuenta de usuario</h2>
      <p>
        Para usar el servicio debes ser mayor de edad, proporcionar información
        veraz y mantener la confidencialidad de tus credenciales. Eres responsable
        de toda actividad realizada desde tu cuenta.
      </p>

      <h2>3. Roles</h2>
      <h3>Dueños</h3>
      <p>
        Los dueños pueden buscar cuidadores, reservar servicios, comunicarse con
        ellos y dejar valoraciones tras una reserva completada.
      </p>
      <h3>Cuidadores</h3>
      <p>
        Los cuidadores ofrecen servicios bajo su propia responsabilidad. Antes de
        recibir reservas deben verificar su identidad (DNI o NIE) y, cuando aplique,
        su seguro de responsabilidad civil.
      </p>
      <h3>Negocios partner</h3>
      <p>
        Los negocios partner ofrecen descuentos a la red. CuidaMascotas verifica
        la titularidad pero no actúa como intermediario en la prestación del
        servicio del partner.
      </p>

      <h2>4. Comisión y pagos</h2>
      <p>
        CuidaMascotas aplica una comisión del 18% sobre cada reserva confirmada.
        Los pagos se procesan a través de Stripe. Las cancelaciones siguen la
        política seleccionada por el cuidador (flexible, moderada o estricta).
      </p>

      <h2>5. Conducta</h2>
      <ul>
        <li>No publicar contenido falso, ofensivo o ilegal.</li>
        <li>No suplantar a terceros ni eludir las verificaciones.</li>
        <li>No utilizar la plataforma para actividades fuera de su finalidad.</li>
      </ul>
      <p>
        El incumplimiento puede dar lugar a la suspensión o eliminación de la
        cuenta sin reembolso.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        Los contenidos, marcas y diseños de CuidaMascotas pertenecen a sus
        titulares. El contenido subido por usuarios sigue siendo de su propiedad,
        pero concede a CuidaMascotas una licencia limitada para mostrarlo dentro
        de la plataforma.
      </p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        CuidaMascotas facilita el contacto entre las partes pero no es parte del
        contrato de servicio entre dueño y cuidador, ni entre usuario y partner.
        En la máxima medida permitida por la ley, no respondemos por incidentes
        derivados de la prestación del servicio fuera de la plataforma.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        Podemos actualizar estas condiciones. Te avisaremos por correo electrónico
        de cualquier cambio sustancial con al menos 15 días de antelación.
      </p>

      <h2>9. Ley aplicable y jurisdicción</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para consumidores,
        son competentes los juzgados del domicilio del consumidor.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para cualquier consulta sobre estas condiciones escríbenos a{" "}
        <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>.
      </p>
    </>
  );
}

function EnglishTerms() {
  return (
    <>
      <p>
        These terms govern access to and use of CuidaMascotas, a platform that
        connects pet owners with local sitters and a network of pet-related
        businesses (vets, shops, groomers) in Spain.
      </p>

      <h2>1. Acceptance</h2>
      <p>
        By creating an account or using the service, you accept these terms. If
        you do not agree, do not use the platform.
      </p>

      <h2>2. Account</h2>
      <p>
        You must be of legal age, provide accurate information, and keep your
        credentials confidential. You are responsible for all activity on your
        account.
      </p>

      <h2>3. Roles</h2>
      <h3>Owners</h3>
      <p>
        Owners can search sitters, book services, communicate with them, and
        leave reviews after a completed booking.
      </p>
      <h3>Sitters</h3>
      <p>
        Sitters offer services under their own responsibility. Before receiving
        bookings they must verify their identity (DNI or NIE) and, where
        applicable, their liability insurance.
      </p>
      <h3>Partner businesses</h3>
      <p>
        Partner businesses offer discounts to the network. CuidaMascotas verifies
        ownership but does not act as an intermediary in the partner's service
        delivery.
      </p>

      <h2>4. Commission and payments</h2>
      <p>
        CuidaMascotas applies an 18% commission on each confirmed booking.
        Payments are processed via Stripe. Cancellations follow the policy
        selected by the sitter (flexible, moderate, or strict).
      </p>

      <h2>5. Conduct</h2>
      <ul>
        <li>No false, offensive, or illegal content.</li>
        <li>No impersonation or circumvention of verifications.</li>
        <li>No use of the platform outside its intended purpose.</li>
      </ul>
      <p>
        Breach may result in suspension or removal of the account without refund.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        CuidaMascotas content, trademarks, and designs belong to their owners.
        User-uploaded content remains the user's property but grants
        CuidaMascotas a limited license to display it within the platform.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        CuidaMascotas facilitates contact between parties but is not a party to
        the service contract between owner and sitter, or between user and
        partner. To the maximum extent permitted by law, we are not liable for
        incidents arising from service delivery outside the platform.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms. We will notify you by email of any material
        change at least 15 days in advance.
      </p>

      <h2>9. Governing law and jurisdiction</h2>
      <p>
        These terms are governed by Spanish law. For consumers, the courts of
        the consumer's domicile have jurisdiction.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any question about these terms, write to{" "}
        <a href="mailto:hola@cuidamascotas.es">hola@cuidamascotas.es</a>.
      </p>
    </>
  );
}
