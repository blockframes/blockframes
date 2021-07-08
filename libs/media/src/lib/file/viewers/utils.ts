import { ElementRef } from "@angular/core";

interface WebkitElement extends Element {
  webkitRequestFullscreen();
  webkitExitFullscreen();
}

function isWebkit(el: Node, mode: 'request' | 'exit' ): el is WebkitElement {
  return mode === 'request' ? 'webkitRequestFullscreen' in el : 'webkitExitFullscreen' in el;
}

/** Toggle the full screen mode depending on the current full screen state */
export function toggleFullScreen(container: ElementRef<HTMLDivElement>, document: Document, fullScreen: boolean) {
  if (!fullScreen) {
    if (container.nativeElement.requestFullscreen) {
      container.nativeElement.requestFullscreen();
      // Safari Browser
    } else if (isWebkit(container.nativeElement, 'request')) {
      container.nativeElement.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      // Safari Browser
    } else if (isWebkit(document, 'exit')) {
      document.webkitExitFullscreen();
    }
  }
}