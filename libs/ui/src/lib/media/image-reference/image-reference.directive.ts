import { Directive, Renderer2, ElementRef, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ImgRef } from '@blockframes/utils/image-uploader';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from '@blockframes/ui/theme';

@Directive({
  selector: 'img[imgRef]'
})
export class ImageReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private asset$ = new BehaviorSubject('');
  private placeholder$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');
  private assetUrl$: Observable<string>;
  placeholder: string;
  url: string;

  @HostBinding('src') src: string;

  /** Set src attribute in img tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set imgRef(path: ImgRef) {
    if(!path){
      // this.updateUrl();
      this.ref$.next('');
    } try {
      // this.updateUrl(path.url);
      this.ref$.next(path.url);
    } catch (err) {
      // this.updateUrl();
      this.ref$.next('')
    }
  }

  @Input() set placeholderUrl(placeholder: string) {
    // this.placeholder = placeholder;
    // this.updateSrc()
    this.placeholder$.next(placeholder);
  };

  @Input() set placeholderAsset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
    // private _renderer: Renderer2,
    // private _elementRef: ElementRef,
  ) {}

  ngOnInit() {
    this.assetUrl$ = combineLatest([this.theme.theme$, this.asset$]).pipe(
      map(([theme, asset]) => `assets/images/${theme}/${asset}`)
    );
    this.sub = combineLatest([
      this.ref$,
      this.placeholder$,
      this.assetUrl$
    ]).subscribe(([ ref, placeholder, assetUrl ]) => {
      this.src = ref || placeholder || assetUrl;
      this.cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // updateSrc() {
  //   this._renderer.setProperty(this._elementRef.nativeElement, 'src', this.url || this.placeholder || '')
  // }

  // updateUrl(url?: string) {
  //   this.url = url;
  //   this.updateSrc();
  // }

}
