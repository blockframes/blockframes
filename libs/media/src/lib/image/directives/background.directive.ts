import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { BehaviorSubject, combineLatest, Subscription, Observable } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { map, switchMap } from 'rxjs/operators';
import { getAssetPath } from '@blockframes/media/+state/media.model';
import { ImageParameters } from './imgix-helpers';
import { MediaService } from '@blockframes/media/+state/media.service';

@Directive({
  selector: '[bgStoragePath][bgDocRef][bgField] [bgAsset], [bgAsset]'
})
export class BackgroundDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private asset$ = new BehaviorSubject('');
  private storagePath$ = new BehaviorSubject('');
  private docRef$ = new BehaviorSubject('');
  private field$ = new BehaviorSubject('');
  private assetUrl$: Observable<string>;
  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);

  private parameters: ImageParameters = {
    auto: 'compress,format',
    fit: 'crop',
  };

  @HostBinding('style.backgroundImage') src: SafeStyle;

  @Input() set storagePath(value: string) {
    this.storagePath$.next(value);
  }

  @Input() set docRef(value: string) {
    this.docRef$.next(value);
  }

  @Input() set field(value: string) {
    this.field$.next(value);
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
    private mediaService: MediaService,
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

    const imgUrl$ = combineLatest([
      this.storagePath$,
      this.docRef$,
      this.field$,
    ]).pipe(
      switchMap(([storagePath, docRef, field]) =>
        this.mediaService.generateBackgroundImageUrl(storagePath, docRef, field, this.parameters)
          .catch(() => '')
      ),
    );

    this.sub = combineLatest([
      imgUrl$,
      this.assetUrl$
    ]).subscribe(([imgUrl, assetUrl]) => {
      if (!!imgUrl) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url("${imgUrl}"), url("${assetUrl}")`);
        this.cdr.markForCheck();
      } else if (assetUrl) {
        this.src = this.sanitazier.bypassSecurityTrustStyle(`url("${assetUrl}")`);
        this.cdr.markForCheck();
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
