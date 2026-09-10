export function downloadVCard(card) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${card.name};;;;`,
    `FN:${card.name}`,
    card.businessName ? `ORG:${card.businessName}` : "",
    card.designation ? `TITLE:${card.designation}` : "",
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.address ? `ADR;TYPE=WORK:;;${card.address.replace(/\n/g, " ")};;;;` : "",
    card.website ? `URL:${card.website}` : "",
    "END:VCARD",
  ].filter(Boolean);

  const blob = new Blob([lines.join("\n")], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(card.name || "contact").replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
