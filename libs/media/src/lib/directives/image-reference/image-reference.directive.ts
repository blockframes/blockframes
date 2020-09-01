import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { HostedMedia } from '../../+state/media.firestore';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';
import { getAssetPath } from '../../+state/media.model';
import { ImageParameters, generateImageSrcset } from './imgix-helpers';

@Directive({
  selector: 'img[ref][asset], img[asset]'
})
export class ImageReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;

  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);

  private parameters: ImageParameters = {
    auto: 'compress,format',
    fit: 'crop',
  };

  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');

  @HostBinding('srcset') srcset: string;
  @HostBinding('src') src: string;
  @HostBinding('alt') alt: string;
  @HostBinding('loading') loading = 'lazy';

  // -----------------------------------
  //           MEDIA IMAGE INPUT
  // -----------------------------------

  /** the image to display */
  @Input() set ref(image: HostedMedia) {
    if (!image?.ref) return;
    this.ref$.next(image.ref);
  }

  // -----------------------------------
  //   STATIC / PLACEHOLDER IMAGE INPUT
  // -----------------------------------

  /** Override the app theme for placeholders images.
   * This value is automatically set to the current app theme,
   * but you can use it to override the theme.
   */
  @Input() set theme(theme: 'dark' | 'light') {
    this.localTheme$.next(theme);
  }

  /**
   * Use only to compute the placeholder (`[asset]`) image path
   * Default value is `'images'`
   */
  @Input() type: 'images' | 'logo' = 'images';

  /**
   * The placeholder asset to display.
   * Just specify the file name, and the component
   * will compute the image path depending on the theme, image format, etc...
   * @example asset="empty_poster.webp"
   */
  @Input() set asset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) { }

  @HostListener('error')
  error() {

    const asset = this.asset$.getValue();
    const local = this.localTheme$.getValue();
    const global = this.themeService.theme;
    const theme = local || global;

    this.srcset = getAssetPath(asset, theme, this.type);
    this.src = this.srcset
  }

  ngOnInit() {
    // Can force a local theme
    const theme$ = combineLatest([
      this.localTheme$,
      this.themeService.theme$
    ]).pipe(
      map(([local, global]) => local || global)
    );

    // apply latest changes
    this.sub = combineLatest([
      this.asset$,
      this.ref$,
      theme$,
    ]).subscribe(([asset, ref, theme]) => {

      if (!!ref) {

        // ref
        this.srcset = generateImageSrcset(ref, this.parameters);
        this.src = this.srcset.split(' ')[0];

      } else {

        // asset
        this.srcset = getAssetPath(asset, theme, this.type);
        this.src = this.srcset;

      }

      this.cdr.markForCheck()
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
