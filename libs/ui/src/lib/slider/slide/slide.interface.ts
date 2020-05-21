import { ImgRef } from '@blockframes/utils/media';

export interface Slide {
  /** Key list manager prob */
  disabled: boolean;

  /** Appearance */
  image: ImgRef;
  overlayColor: string;
  hideOverlay: boolean;
}
