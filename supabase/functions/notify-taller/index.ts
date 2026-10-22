// ============================================================
//  EDGE FUNCTION: notify-taller
//  Envía el aviso de una cita nueva al taller por WhatsApp
//  (CallMeBot) y Telegram. Los tokens viven en los SECRETS de
//  Supabase (no en el repo público). Se dispara con un Database
//  Webhook sobre INSERT en la tabla "appointments".
// ============================================================

Deno.serve(async (req) => {
  try {
    // Seguridad: exige un secreto compartido que envía el webhook
    const expected = Deno.env.get("NOTIFY_SECRET");
    if (expected) {
      const got = req.headers.get("x-notify-secret");
      if (got !== expected) {
        return json({ ok: false, error: "unauthorized" }, 401);
      }
    }

    const payload = await req.json().catch(() => ({}));
    // El webhook de INSERT manda { record: {...fila...} }.
    // La cita completa está en la columna jsonb "data".
    const a = (payload?.record?.data) ?? payload?.record ?? payload ?? {};

    const text =
`🔔 NUEVA CITA - LUBRIPOINT
Código: ${a.id ?? "-"}
Cliente: ${a.client ?? "-"} (${a.phone ?? "-"})
Vehículo: ${a.vehicleType ?? ""} ${a.brand ?? ""} ${a.model ?? ""} (${a.year ?? ""})
Placa: ${a.plate ?? "-"}
Servicio: ${a.service ?? "-"}
Aceite: ${a.oilViscosity ?? ""} - ${a.oilBrand ?? ""}
Fecha: ${a.date ?? "-"} ${a.time ?? ""}
Sede: ${a.branch ?? "-"}
Obs: ${a.observations ?? "-"}`;

    const tasks: Promise<unknown>[] = [];

    // WhatsApp vía CallMeBot
    const cmPhone = Deno.env.get("CALLMEBOT_PHONE");
    const cmKey = Deno.env.get("CALLMEBOT_APIKEY");
    if (cmPhone && cmKey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cmPhone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(cmKey)}`;
      tasks.push(fetch(url));
    }

    // Telegram
    const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const tgChat = Deno.env.get("TELEGRAM_CHAT_ID");
    if (tgToken && tgChat) {
      const url = `https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${encodeURIComponent(tgChat)}&text=${encodeURIComponent(text)}`;
      tasks.push(fetch(url));
    }

    await Promise.allSettled(tasks);
    return json({ ok: true, channels: tasks.length });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
