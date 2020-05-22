import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ImgRef } from '@blockframes/utils/media/media.firestore';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from '@blockframes/ui/theme';

// @todo(#2528) merge ImageAssetDirective here
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
      this.ref$.next('');
    } try {
      this.ref$.next(path.urls.original);
    } catch (err) {
      this.ref$.next('')
    }
  }

  @Input() set placeholderUrl(placeholder: string) {
    this.placeholder$.next(placeholder);
  };

  @Input() set placeholderAsset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
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
}
