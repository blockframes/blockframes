import { Directive, Renderer2, ElementRef, Input } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage';
import { BehaviorSubject, Subscription } from 'rxjs';

@Directive({
  selector: 'img[storageRef]'
})
export class StorageImageDirective {

  @Input() set storageRef(path: string) {
    try {
      const ref = this.storage.ref(path);
      ref.getDownloadURL().toPromise()
        .then(url => this.updateUrl(url))
        .catch(_ => this.updateUrl());
    } catch (err) {
      this.updateUrl();
    }
  }

  @Input() placeholderUrl: string;

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef, private storage: AngularFireStorage) {}

  updateUrl(url?: string) {
    this._renderer.setProperty(this._elementRef.nativeElement, 'src', url || this.placeholderUrl || '')
  }

}
