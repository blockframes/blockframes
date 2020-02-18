import { firestore } from "firebase";

type Timestamp = firestore.Timestamp;

/** Raw model of a template. */
export interface TemplateRaw<D> {
  id: string;
  name: string;
  orgId: string;
  created: D;
  updated: D;
  _type: 'templates';
}

export interface TemplateDocument extends TemplateRaw<Timestamp> {}

export interface TemplateDocumentWithDates extends TemplateRaw<Date> {}
