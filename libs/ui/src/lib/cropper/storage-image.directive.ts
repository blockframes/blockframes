import { Directive, Renderer2, ElementRef, Input } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage';
@Directive({
  selector: 'img[storageRef]'
})
export class StorageImageDirective {
  placeholder: string;
  url: string;

  /** Set src attribute in img tag with the path for storage.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set storageRef(path: string) {
    if(!path){
      this.updateUrl();
    }
    try {
      const ref = this.storage.ref(path);
      ref.getDownloadURL().toPromise()
        .then(url => this.updateUrl(url))
        .catch(_ => this.updateUrl());
    } catch (err) {
      this.updateUrl();
    }
  }

  @Input() set placeholderUrl(placeholder: string) {
    this.placeholder = placeholder;
    this.updateSrc()
  };

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef, private storage: AngularFireStorage) {}

  updateSrc() {
    this._renderer.setProperty(this._elementRef.nativeElement, 'src', this.url || this.placeholder || '')
  }

  updateUrl(url?: string) {
    this.url = url;
    this.updateSrc();
  }

}
