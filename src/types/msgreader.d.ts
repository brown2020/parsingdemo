declare module "@kenjiuno/msgreader" {
  export class MSGReader {
    constructor(buffer: ArrayBuffer);
    getFileData(): MsgData;
  }

  export interface Recipient {
    name: string;
  }

  export interface MsgData {
    subject: string;
    senderName: string;
    recipients: Recipient[];
    date: string | number | Date;
    bodyHTML: string;
    body: string;
  }
}
