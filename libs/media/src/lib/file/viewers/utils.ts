import { ElementRef } from "@angular/core";

interface WebkitElement extends Element {
  webkitRequestFullscreen();
}
interface WebkitDocument extends Document {
  webkitExitFullscreen();

}


function isWebkitForElement(el: Node): el is WebkitElement {
  console.log('in isWebkit');
  return 'webkitRequestFullscreen' in el;
}

function isWebkitForDocument(doc: Document): doc is WebkitDocument {
return 'webkitExitFullscreen' in doc;
}

/** Toggle the full screen mode depending on the current full screen state */
export function toggleFullScreen(container: ElementRef<HTMLDivElement>, document: Document, fullScreen: boolean) {
 const is_safari = navigator.userAgent.indexOf('Safari') > -1;
 const is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
 console.log('safari:', is_safari);
 console.log('chrome:', is_chrome);
 console.log('is_really_safari', is_safari && !is_chrome);

  console.log('in function', container.nativeElement);

  if (!fullScreen) {
    if (container.nativeElement.requestFullscreen) {
      container.nativeElement.requestFullscreen();

      // Safari Browser
    } else if (is_safari && !is_chrome) {
      console.log('in Webkit Open');
      container.nativeElement['webkitRequestFullscreen']();
      return fullScreen = true;
    }
  } else {
    console.log('is close');
    if (document.exitFullscreen) {
      document.exitFullscreen();
      // Safari Browser
    } else if (is_safari && !is_chrome) {
      console.log('in Webkit Close');
      document['webkitExitFullscreen']();
      return fullScreen = false;
    }
  }
}
