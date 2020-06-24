import { ImgRef } from '@blockframes/media/+state/media.firestore';

export interface Slide {
  /** Key list manager prob */
  disabled: boolean;

  /** Appearance */
  image: ImgRef;
  overlayColor: string;
  hideOverlay: boolean;
}
