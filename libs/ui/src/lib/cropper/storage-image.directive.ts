import { Directive, Renderer2, ElementRef, Input, OnInit, OnDestroy } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

@Directive({
  selector: 'img[storageRef]'
})
export class StorageImageDirective implements OnInit, OnDestroy {

  ref = new BehaviorSubject<string>('');
  sub: Subscription;

  @Input() set storageRef(ref: string) {
    this.ref.next(ref);
  }

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef, private storage: AngularFireStorage) {}

  ngOnInit() {
    this.sub = this.ref.pipe(
      filter(ref => !!ref),
      switchMap(ref => this.storage.ref(ref).getDownloadURL())
    ).subscribe(url => {
      this._renderer.setProperty(this._elementRef.nativeElement, 'src', url)
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
