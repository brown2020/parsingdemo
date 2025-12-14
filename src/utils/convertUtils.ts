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

function buildFormData(
  file: File,
  options?: { userId?: string; filenameBase?: string }
) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  if (options?.userId) formData.append("userId", options.userId);
  if (options?.filenameBase)
    formData.append("filenameBase", options.filenameBase);
  return formData;
}

export const convertDocxToPdf = async (
  file: File,
  userId: string
): Promise<Blob> => {
  const response = await fetch("/api/convertDocxToPdf", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.[^/.]+$/, ""),
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
  const response = await fetch("/api/convertImageToPdf", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.[^/.]+$/, ""),
    }),
  });

  if (response.ok) {
    return await response.blob();
  } else {
    throw new Error("Failed to convert Image to PDF");
  }
};

export const convertEmlToPdf = async (
  file: File,
  userId: string
): Promise<Blob> => {
  const response = await fetch("/api/convertEmlToPdf", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.eml$/i, ""),
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
  const response = await fetch("/api/convertEmlToText", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.eml$/i, ""),
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
  const response = await fetch("/api/convertMsgToPdf", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.msg$/i, ""),
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
  const response = await fetch("/api/convertMsgToText", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.msg$/i, ""),
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
  const response = await fetch("/api/convertDocxToText", {
    method: "POST",
    body: buildFormData(file, {
      userId,
      filenameBase: file.name.replace(/\.docx$/i, ""),
    }),
  });

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error("Failed to convert DOCX to text");
  }
};

export const convertPdfToText = async (file: File): Promise<string> => {
  const response = await fetch("/api/convertPdfToText", {
    method: "POST",
    body: buildFormData(file),
  });

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error("Failed to convert PDF to text");
  }
};
