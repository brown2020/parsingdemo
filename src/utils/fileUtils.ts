import { storage, db } from "@/firebase/firebaseClient";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { FileUrl } from "@/types/FileUrl";
import {
  convertDocxToPdf,
  convertDocxToText,
  convertEmlToPdf,
  convertEmlToText,
  convertHeicToJpeg,
  convertImageToPdf,
  convertMsgToPdf,
  convertMsgToText,
  convertPdfToText,
} from "./convertUtils";

export const fetchFiles = async (userId: string): Promise<FileUrl[]> => {
  const fileCollection = collection(doc(db, "users", userId), "documents");
  const fileDocs = await getDocs(fileCollection);

  const fileUrls = await Promise.all(
    fileDocs.docs.map(async (doc) => {
      const data = doc.data();
      let urlPdf = null;
      let urlTxt = null;

      try {
        if (data.pathPdf) {
          urlPdf = await getDownloadURL(ref(storage, data.pathPdf));
        }
        if (data.pathTxt) {
          urlTxt = await getDownloadURL(ref(storage, data.pathTxt));
        }
        return {
          id: doc.id,
          name: data.name,
          urlPdf,
          urlTxt,
          client: data.client || "",
          type: data.type || "",
        } as FileUrl;
      } catch (error) {
        console.error(`Error fetching file data for doc id ${doc.id}:`, error);
        return null;
      }
    })
  );

  return fileUrls.filter((file): file is FileUrl => file !== null);
};

export const deleteFile = async (
  userId: string,
  docId: string
): Promise<void> => {
  const fileDocRef = doc(db, "users", userId, "documents", docId);
  const fileDoc = await getDoc(fileDocRef);

  if (fileDoc.exists()) {
    const fileData = fileDoc.data();
    if (fileData?.pathPdf) {
      await deleteObject(ref(storage, fileData.pathPdf));
    }
    if (fileData?.pathTxt) {
      await deleteObject(ref(storage, fileData.pathTxt));
    }
    await deleteDoc(fileDocRef);
  }
};

export const updateFileMetadata = async (
  userId: string,
  docId: string,
  client: string,
  type: string
): Promise<void> => {
  await setDoc(
    doc(db, "users", userId, "documents", docId),
    { client, type },
    { merge: true }
  );
};

export const uploadFile = async (
  file: File,
  userId: string,
  client: string,
  type: string
): Promise<void> => {
  let pdfBlob: Blob = new Blob(); // Initialize with an empty Blob
  let textBlob: Blob = new Blob(); // Initialize with an empty Blob

  if (file.type === "image/heic") {
    ({ pdfBlob, textBlob } = await prepareHeicFile(file, userId));
  } else if (file.name.endsWith(".docx")) {
    ({ pdfBlob, textBlob } = await prepareDocxFile(file, userId));
  } else if (file.type.startsWith("image/")) {
    ({ pdfBlob, textBlob } = await prepareImageFile(file, userId));
  } else if (file.name.endsWith(".eml")) {
    ({ pdfBlob, textBlob } = await prepareEmlFile(file, userId));
  } else if (file.name.endsWith(".msg")) {
    ({ pdfBlob, textBlob } = await prepareMsgFile(file, userId));
  } else if (file.type === "application/pdf") {
    ({ pdfBlob, textBlob } = await preparePdfFile(file));
  } else {
    throw new Error(
      "Unsupported file type. Please upload a PDF, DOCX, image, EML, or MSG file."
    );
  }

  const userDocRef = doc(db, "users", userId);
  await setDoc(userDocRef, { id: userId }, { merge: true });

  const docRef = await addDoc(collection(userDocRef, "documents"), {
    name: file.name,
    client,
    type,
  });

  const storagePathPdf = `${userId}/documents/${docRef.id}.pdf`;
  await uploadBytes(ref(storage, storagePathPdf), pdfBlob);
  const urlPdf = await getDownloadURL(ref(storage, storagePathPdf));

  const storagePathTxt = `${userId}/documents/${docRef.id}.txt`;
  await uploadBytes(ref(storage, storagePathTxt), textBlob);
  const urlTxt = await getDownloadURL(ref(storage, storagePathTxt));

  await setDoc(
    docRef,
    {
      id: docRef.id,
      pathPdf: storagePathPdf,
      pathTxt: storagePathTxt,
      urlPdf,
      urlTxt,
    },
    { merge: true }
  );
};

const prepareHeicFile = async (
  file: File,
  userId: string
): Promise<{ pdfBlob: Blob; textBlob: Blob }> => {
  const jpegFile = await convertHeicToJpeg(file);
  const pdfBlob = await convertImageToPdf(jpegFile, userId);
  const textBlob = new Blob([""], { type: "text/plain" }); // Placeholder as text conversion is not applicable for HEIC
  return { pdfBlob, textBlob };
};

const prepareDocxFile = async (
  file: File,
  userId: string
): Promise<{ pdfBlob: Blob; textBlob: Blob }> => {
  const pdfBlob = await convertDocxToPdf(file, userId);
  const text = await convertDocxToText(file, userId);
  const textBlob = new Blob([text], { type: "text/plain" });
  return { pdfBlob, textBlob };
};

const prepareImageFile = async (
  file: File,
  userId: string
): Promise<{ pdfBlob: Blob; textBlob: Blob }> => {
  const pdfBlob = await convertImageToPdf(file, userId);
  const textContent = `Filename: ${file.name}`; // Using filename as text content
  const textBlob = new Blob([textContent], { type: "text/plain" });
  return { pdfBlob, textBlob };
};

const prepareEmlFile = async (
  file: File,
  userId: string
): Promise<{ pdfBlob: Blob; textBlob: Blob }> => {
  const pdfBlob = await convertEmlToPdf(file, userId);
  const text = await convertEmlToText(file, userId);
  const textBlob = new Blob([text], { type: "text/plain" });
  return { pdfBlob, textBlob };
};

const prepareMsgFile = async (
  file: File,
  userId: string
): Promise<{ pdfBlob: Blob; textBlob: Blob }> => {
  const pdfBlob = await convertMsgToPdf(file, userId);
  const text = await convertMsgToText(file, userId);
  const textBlob = new Blob([text], { type: "text/plain" });
  return { pdfBlob, textBlob };
};

const preparePdfFile = async (
  file: File
): Promise<{ pdfBlob: Blob; textBlob: Blob }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
  const text = await convertPdfToText(file);
  const textBlob = new Blob([text], { type: "text/plain" });
  return { pdfBlob, textBlob };
};
