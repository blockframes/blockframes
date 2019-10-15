import { firestore } from "firebase";

type Timestamp = firestore.Timestamp;

/** Document model of a template. */
export interface TemplateDocument {
  id: string;
  name: string;
  orgId: string;
  created: Timestamp;
  _type: 'templates';
}
