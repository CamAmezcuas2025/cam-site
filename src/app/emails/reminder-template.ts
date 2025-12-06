export function reminderTemplate({
  name,
  type,
  endDate
}: {
  name: string;
  type: string;
  endDate: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background:#0a0a0a;color:white;font-family:Arial">

    <table width="100%" style="background:#111;padding:20px 0;text-align:center;">
      <tr><td>
        <h1 style="margin:0;color:#e60000;">C.A.M Amezcuas</h1>
        <p style="color:#bbb;margin:0;">Recordatorio de Membresía</p>
      </td></tr>
    </table>

    <table width="100%" style="padding:30px 0;">
      <tr><td align="center">
        <table width="90%" style="max-width:600px;background:#1a1a1a;padding:30px;border-radius:12px;border:1px solid #333;">

          <tr><td>
            <h2 style="color:#e60000;margin-top:0;">Hola ${name},</h2>

            <p style="color:#ccc;font-size:15px;line-height:1.6;">
              Tu membresía <strong style="color:white;">${type}</strong>
              vence el <strong style="color:white;">${endDate}</strong>.
            </p>

            <p style="color:#ccc;font-size:15px;line-height:1.6;">
              Te invitamos a realizar tu pago a tiempo para evitar interrupciones en tus clases.
            </p>

            <p style="margin-top:30px;color:#ccc;">
              Gracias por entrenar con nosotros 💪<br />
              <strong style="color:white;">C.A.M Amezcuas</strong>
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>

    <table width="100%" style="background:#111;padding:20px 0;text-align:center;color:#777;font-size:12px;">
      <tr><td>
        © ${new Date().getFullYear()} C.A.M Amezcuas — Tijuana, B.C.
      </td></tr>
    </table>

  </body>
</html>
`;
}
