import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ImgRef } from '@blockframes/utils/image-uploader';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from '@blockframes/ui/theme';

@Directive({
  selector: '[backgroundRef]'
})
export class BackgroundReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');
  private assetUrl$: Observable<string>;

  @HostBinding('style.backgroundImage') src: string;

  /** Set background-image attribute in any html tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set backgroundRef(path: ImgRef) {
    if(!path){
      this.ref$.next('');
    } try {
      this.ref$.next(path.url);
    } catch (err) {
      this.ref$.next('')
    }
  }

  @Input() set placeholderAsset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.assetUrl$ = combineLatest([this.theme.theme$, this.asset$]).pipe(
      map(([theme, asset]) => asset ? `assets/images/${theme}/${asset}` : '')
    );
    this.sub = combineLatest([
      this.ref$,
      this.assetUrl$
    ]).subscribe(([ ref, assetUrl ]) => {
      if (ref || assetUrl) {
        this.src = `url(${ref || assetUrl})`;
        this.cdr.markForCheck();
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
