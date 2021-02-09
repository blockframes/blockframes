
import { StorageReference } from '@blockframes/media/+state/media.firestore';

export interface Slide {
  /** Key list manager prob */
  disabled: boolean;

  /** Appearance */
  image: { storagePath: string } & StorageReference;
  overlayColor: string;
  hideOverlay: boolean;
}
