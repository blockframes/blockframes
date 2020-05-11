import { ImgRef } from '@blockframes/utils/image-uploader';

export interface Slide {
  /** Key list manager prob */
  disabled: boolean;

  /** Appearance */
  image: ImgRef;
  overlayColor: string;
  hideOverlay: boolean;
}
