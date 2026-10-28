import MsgReader from "@kenjiuno/msgreader";

export type ParsedMsg = {
  subject: string;
  from: string;
  to: string;
  html: string;
  text: string;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Read an Outlook .msg compound file. mailparser only understands MIME. */
export function parseMsg(buffer: Buffer): ParsedMsg {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const data = new MsgReader(arrayBuffer).getFileData();
  const recipients = (data.recipients ?? [])
    .map((recipient) => asText(recipient.name) || asText(recipient.email))
    .filter(Boolean)
    .join(", ");
  const from = [asText(data.senderName), asText(data.senderEmail)]
    .filter(Boolean)
    .join(" ");

  return {
    subject: asText(data.subject) || "No Subject",
    from: from || "Unknown",
    to: recipients || "Unknown",
    html: asText(data.bodyHtml),
    text: asText(data.body),
  };
}
