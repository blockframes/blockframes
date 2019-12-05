import { Directive, Renderer2, ElementRef, Input } from '@angular/core'
import { ImgRef } from '@blockframes/utils/image-uploader';

@Directive({
  selector: '[backgroundImage]'
})
export class BackgroundImageDirective {
  placeholder: string;
  url: string;
  backgroundType: string;

  /** Set src attribute in img tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  // @Input() set backgroundImage(path: ImgRef, type: string) {
  //   if(!path){
  //     this.updateUrl();
  //   } try {
  //     const background = path.find(el => el.type === type)
  //     this.updateUrl(path.url);
  //   } catch (err) {
  //     this.updateUrl();
  //   }
  // }

  @Input() set placeholderUrl(placeholder: string) {
    this.placeholder = placeholder;
    this.updateSrc()
  };

  @Input() set type(backgroundType: string){

  }

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  updateSrc() {
    // this._renderer.setProperty(this._elementRef.nativeElement, 'background-image', this.url || this.placeholder || '')
    this._renderer.setStyle(this._elementRef.nativeElement, 'background-image', this.url || this.placeholder || '')
  }

  updateUrl(url?: string) {
    this.url = url;
    this.updateSrc();
  }

}
