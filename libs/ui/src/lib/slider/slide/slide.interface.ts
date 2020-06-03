import { ImgRef } from '@blockframes/utils/media/media.firestore';

export interface Slide {
  /** Key list manager prob */
  disabled: boolean;

  /** Appearance */
  image: ImgRef;
  overlayColor: string;
  hideOverlay: boolean;
}
