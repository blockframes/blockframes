import { HostedMedia } from '@blockframes/media/+state/media.firestore';

export interface Slide {
  /** Key list manager prob */
  disabled: boolean;

  /** Appearance */
  image: HostedMedia;
  overlayColor: string;
  hideOverlay: boolean;
}
