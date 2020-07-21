import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import {  HostedMedia } from '../../+state/media.firestore';
import { BehaviorSubject, combineLatest, Subscription, Observable } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { getAssetPath, getImageUrl } from '@blockframes/media/+state/media.model';

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
  @Input() set bgRef(image: HostedMedia) {
    if(!image){
      this.ref$.next('');
    } try {
      // TODO IMPLEMENT IMGIX issue#3283
      // TODO format the url and get the needed query parameters
      this.ref$.next(image.url);
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
