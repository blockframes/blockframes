import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription, Observable } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { StorageFile } from '@blockframes/shared/model';
import { ImageParameters } from './imgix-helpers';
import { MediaService } from '../../+state/media.service';
import { getAssetPath } from './utils';

@Directive({
  selector: '[bgRef] [bgAsset], [bgAsset]',
})
export class BackgroundDirective implements OnInit, OnDestroy {
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
  @Input() set bgRef(file: StorageFile) {
    if (!file) {
      this.ref$.next('');
    } else {
      this.mediaService
        .generateBackgroundImageUrl(file, this.parameters)
        .then(url => this.ref$.next(url))
        .catch(() => this.ref$.next(''));
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
    private sanitazier: DomSanitizer,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    // Can force a local theme
    const theme$ = combineLatest([this.localTheme$, this.themeService.theme$]).pipe(map(([local, global]) => local || global));

    this.assetUrl$ = combineLatest([theme$, this.asset$]).pipe(
      map(([theme, asset]) => (asset ? getAssetPath(asset, theme, 'images') : ''))
    );

    this.sub = combineLatest([this.ref$, this.assetUrl$]).subscribe(([ref, assetUrl]) => {
      if (ref) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url("${ref}"), url("${assetUrl}")`);
        this.cdr.markForCheck();
      } else if (assetUrl) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url("${assetUrl}")`);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
