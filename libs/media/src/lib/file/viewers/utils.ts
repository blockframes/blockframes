import { ElementRef } from "@angular/core";

/** Toggle the full screen mode depending on the current full screen state */
export function toggleFullScreen(container: ElementRef<HTMLDivElement>, document: Document, fullScreen: boolean) {

  if (!fullScreen) {
    if (!!container.nativeElement.requestFullscreen) {
      container.nativeElement.requestFullscreen();

      // Safari Browser
    } else {
      (container.nativeElement as any).webkitRequestFullscreen();
    }
  } else {
    if (!!document.exitFullscreen) {
      document.exitFullscreen();

      // Safari Browser
    } else {
      (document as any).webkitExitFullscreen();
    }
  }
}