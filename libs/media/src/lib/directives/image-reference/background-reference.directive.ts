import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ImgRef } from '../../+state/media.firestore';
import { BehaviorSubject, combineLatest, Subscription, Observable } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { getAssetPath, getMediaUrl } from '@blockframes/media/+state/media.model';

@Directive({
  selector: '[bgRef], [bgAsset]'
})
export class BackgroundReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');
  private assetUrl$: Observable<string>;

  @HostBinding('style.backgroundImage') src: SafeStyle;

  /** Set background-image attribute in any html tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set bgRef(path: ImgRef) {
    if(!path){
      this.ref$.next('');
    } try {
      const url = getMediaUrl(path);
      this.ref$.next(url);
    } catch (err) {
      this.ref$.next('')
    }
  }

  @Input() set bgAsset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
    private sanitazier: DomSanitizer
  ) { }

  ngOnInit() {
    this.assetUrl$ = combineLatest([this.theme.theme$, this.asset$]).pipe(
      map(([theme, asset]) => asset ? getAssetPath(asset, theme, 'images') : '')
    );
    this.sub = combineLatest([
      this.ref$,
      this.assetUrl$
    ]).subscribe(([ref, assetUrl]) => {
      if (ref) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url(${ref})`);
        this.cdr.markForCheck();
      } else if (assetUrl) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url(${assetUrl})`);
        this.cdr.markForCheck();
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
