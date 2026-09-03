export function buildLeadMessage(lead) {
  const lines = [];

  if (lead.vehiculoNombre) {
    lines.push(`Quiere comprar: ${lead.vehiculoNombre}`);
    lines.push("Y entrega su usado como parte de pago:");
  } else {
    lines.push("Nueva solicitud de tasación:");
  }

  lines.push(`Modelo: ${lead.modelo} (${lead.anio})`);
  lines.push(`Kilómetros: ${lead.km != null ? lead.km : "s/d"}`);
  lines.push(`Estado general: ${lead.estado || "s/d"}`);
  if (lead.historial) lines.push(`Historial de service: ${lead.historial}`);
  if (lead.neumaticos) lines.push(`Neumáticos: ${lead.neumaticos}`);
  if (lead.busca) lines.push(`Busca llevarse: ${lead.busca}`);
  if (lead.detalles) lines.push(`Detalles: ${lead.detalles}`);
  lines.push(`Teléfono de contacto: ${lead.telefono}`);

  return lines.join("\n");
}
