import heic2any from "heic2any";

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  const convertedBlob = await heic2any({
    blob: file,
    toType: "image/jpeg",
  });

  const blobsArray = Array.isArray(convertedBlob)
    ? convertedBlob
    : [convertedBlob];

  return new File(blobsArray, file.name.replace(/\.heic$/, ".jpg"), {
    type: "image/jpeg",
  });
};

export const convertDocxToPdf = async (
  file: File,
  userId: string
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertDocxToPdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name.replace(/\.[^/.]+$/, ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.blob();
  } else {
    throw new Error("Failed to convert DOCX to PDF");
  }
};

export const convertImageToPdf = async (
  file: File,
  userId: string
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertImageToPdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      fileType: file.type,
      filename: file.name.replace(/\.[^/.]+$/, ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.blob();
  } else {
    throw new Error("Failed to convert Image to PDF");
  }
};

export const convertPdfUrlToText = async (url: string): Promise<string> => {
  console.log("Starting PDF URL to text conversion for URL:", url);
  const response = await fetch("/api/convertPdfToText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (response.ok) {
    const result = await response.json();
    console.log("Successfully fetched PDF text:", result.text);
    return result.text;
  } else {
    const error = await response.json();
    console.error("Error fetching PDF text:", error);
    throw new Error(error.error || "Failed to convert PDF to text");
  }
};

export const convertEmlToPdf = async (
  file: File,
  userId: string
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertEmlToPdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name.replace(".eml", ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.blob();
  } else {
    throw new Error("Failed to convert EML to PDF");
  }
};

export const convertEmlToText = async (
  file: File,
  userId: string
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertEmlToText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name.replace(".eml", ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error("Failed to convert EML to text");
  }
};

export const convertMsgToPdf = async (
  file: File,
  userId: string
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertMsgToPdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name.replace(".msg", ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.blob();
  } else {
    throw new Error("Failed to convert MSG to PDF");
  }
};

export const convertMsgToText = async (
  file: File,
  userId: string
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertMsgToText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name.replace(".msg", ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error("Failed to convert MSG to text");
  }
};

export const convertDocxToText = async (
  file: File,
  userId: string
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertDocxToText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name.replace(".docx", ""),
      userId: userId,
    }),
  });

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error("Failed to convert DOCX to text");
  }
};

export const convertPdfToText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch("/api/convertPdfToText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileBuffer: Array.from(new Uint8Array(arrayBuffer)),
    }),
  });

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error("Failed to convert PDF to text");
  }
};
