import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core'
import {  HostedMedia } from '../../+state/media.firestore';
import { BehaviorSubject, combineLatest, Subscription, Observable } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { getAssetPath } from '@blockframes/media/+state/media.model';
import { ImageParameters, generateBackgroundImageUrl } from './imgix-helpers';

@Directive({
  selector: '[bgRef] [bgAsset], [bgAsset]'
})
export class BackgroundReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');
  private assetUrl$: Observable<string>;
  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);

  private parameters: ImageParameters = {
    auto: 'compress,format',
    fit: 'crop',
  };

  @HostBinding('style.backgroundImage') src: SafeStyle;

  /** Set background-image attribute in any html tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set bgRef(image: HostedMedia) {
    if(!image || !image.ref){

      this.ref$.next('');
    } else {
      try {

        const url = generateBackgroundImageUrl(image.ref, this.parameters);

        this.ref$.next(url);
      } catch (err) {
        this.ref$.next('')
      }
    }
  }

  @Input() set bgAsset(asset: string) {
    this.asset$.next(asset);
  }

  /** Override the app theme for placeholders images.
   * This value is automatically set to the current app theme,
   * but you can use it to override the theme.
   */
  @Input() set bgTheme(theme: 'dark' | 'light') {
    this.localTheme$.next(theme);
  }

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private sanitazier: DomSanitizer
  ) { }

  ngOnInit() {

    // Can force a local theme
    const theme$ = combineLatest([
      this.localTheme$,
      this.themeService.theme$
    ]).pipe(
      map(([local, global]) => local || global)
    );

    this.assetUrl$ = combineLatest([
      theme$,
      this.asset$
    ]).pipe(
      map(([theme, asset]) => !!asset ? getAssetPath(asset, theme, 'images') : '')
    );

    this.sub = combineLatest([
      this.ref$,
      this.assetUrl$
    ]).subscribe(([ref, assetUrl]) => {
      if (ref) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url(${ref}), url(${assetUrl})`);
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
