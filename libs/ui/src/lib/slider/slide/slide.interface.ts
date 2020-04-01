import { SafeStyle } from '@angular/platform-browser';

export interface Slide {
  // Key list manager prob
  disabled: boolean;

  // Appearance
  image: SafeStyle;
  overlayColor: string;
  hideOverlay: boolean;
}
