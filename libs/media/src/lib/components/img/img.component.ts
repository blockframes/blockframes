import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';
import { getAssetPath, HostedMedia } from '@blockframes/media/+state/media.model';
import { ImageParameters, formatParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

@Component({
  selector: '[ref] bf-img, [asset] bf-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImgComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);

  private parameters: ImageParameters = {
    auto: 'compress,enhance,format',
    fit: 'crop',
  };

  private ref$ = new BehaviorSubject('');
  public refSrc: string;

  private asset$ = new BehaviorSubject('');
  public assetSrc: string;

  public format: string;

  /** The alt attribute for the image */
  @Input() alt: string;

  // -----------------------------------
  //           MEDIA IMAGE INPUT
  // -----------------------------------

  /** width of the image in px */
  @Input() set width(w: number) {
    this.parameters.width = w;
  }

  /** height of the image in px */
  @Input() set height(h: number) {
    this.parameters.height = h;
  }

  /** the image to display */
  @Input() set ref(image: HostedMedia) {
    if (!image.ref) return;
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
    private breakpointsService: BreakpointsService,
  ) {}

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
      this.breakpointsService.currentWidth,
    ]).subscribe(([asset, ref, theme, width]) => {

      // asset
      this.assetSrc = getAssetPath(asset, theme, this.type);
      this.format = this.assetSrc.split('.').pop();

      // ref
      if (!!ref) {
        // copy the image parameters because we might change the width
        const sizeParameters = { ...this.parameters };

        // get the smallest image width
        sizeParameters.width = Math.min(
          width,
          this.parameters.width || Infinity // in case width is undefined we pick Infinity instead
        );

        const query = formatParameters(sizeParameters);
        this.refSrc = `https://blockframes-pl-2.imgix.net/${ref}?${query}`;
      }

      this.cdr.markForCheck()
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
