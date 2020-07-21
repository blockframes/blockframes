import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';
import { getAssetPath, HostedMedia } from '@blockframes/media/+state/media.model';
import { getImgSize } from '@blockframes/media/+state/media.firestore';
import { calculateViewPortWidth } from '@blockframes/media/directives/image-reference/imgix-helpers';

@Component({
  selector: '[ref] bf-img, [asset] bf-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImgComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);
  private asset$ = new BehaviorSubject('');

  private parameters: ImageParameters = {
    auto: 'compress,enhance,format',
    fit: 'crop',
  };

  public srcset: string;
  public assetSrc: string;
  public format: string;

  /** The alt attribute for the image */
  @Input() alt: string;

  // -----------------------------------
  //           MEDIA IMAGE INPUT
  // -----------------------------------

  @Input() set width(w: number) {
    this.parameters.width = w;
  }

  @Input() set height(h: number) {
    this.parameters.height = h;
  }

  @Input() set ref(image: HostedMedia) {

    if (!image.ref) return;

    const sizeParameters = { ...this.parameters };

    const viewPortWidth = calculateViewPortWidth();

    // load the smallest image size possible
    sizeParameters.width = Math.min(
      viewPortWidth,
      this.parameters.width || Infinity // in case width is undefined we pick Infinity instead
    );

    const query = formatParameter(sizeParameters);
    this.srcset = `https://blockframes-pl-2.imgix.net/${image.ref}?${query}`;
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
  ) {}

  ngOnInit() {
    // Can force a local theme
    const theme$ = combineLatest([
      this.localTheme$,
      this.themeService.theme$
    ]).pipe(
      map(([local, global]) => local || global)
    );

    this.sub = combineLatest([ this.asset$, theme$ ]).subscribe(([asset, theme]) => {
      this.assetSrc = getAssetPath(asset, theme, this.type);
      this.format = this.assetSrc.split('.').pop();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
