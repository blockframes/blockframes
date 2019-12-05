import { Directive, Renderer2, ElementRef, Input } from '@angular/core'
import { ImgRef } from '@blockframes/utils/image-uploader';

@Directive({
  selector: 'img[imgRef]'
})
export class ImageReferenceDirective {
  placeholder: string;
  url: string;

  /** Set src attribute in img tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set imgRef(path: ImgRef) {
    if(!path){
      this.updateUrl();
    } try {
      this.updateUrl(path.url);
    } catch (err) {
      this.updateUrl();
    }
  }

  @Input() set placeholderUrl(placeholder: string) {
    this.placeholder = placeholder;
    this.updateSrc()
  };

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  updateSrc() {
    this._renderer.setProperty(this._elementRef.nativeElement, 'src', this.url || this.placeholder || '')
  }

  updateUrl(url?: string) {
    this.url = url;
    this.updateSrc();
  }

}
