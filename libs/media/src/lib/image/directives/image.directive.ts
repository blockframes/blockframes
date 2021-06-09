import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';
import { getAssetPath } from '../../+state/media.model';
import { ImageParameters } from './imgix-helpers';
import { MediaService } from '../../+state/media.service';
import { StorageFile } from '../../+state/media.firestore';

@Directive({
  selector: 'img[ref][asset], img[asset]'
})
export class ImageDirective implements OnInit, OnDestroy {
  private sub: Subscription;

  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);

  private parameters = new BehaviorSubject<ImageParameters>({
    auto: 'compress,format',
    fit: 'crop',
  });

  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject<StorageFile>(undefined);

  @HostBinding('srcset') srcset: string;
  @HostBinding('style') style: string;
  @HostBinding('src') src: string;
  @HostBinding('alt') alt: string;
  @HostBinding('loading') _loading: 'lazy' | 'eager' = 'lazy';

  // -----------------------------------
  //           MEDIA IMAGE INPUT
  // -----------------------------------

  /** the image to display */
  @Input() set ref(file: StorageFile) {
    this.ref$.next(file);
  }

  /** Set the aspect ratio of the image */
  @Input() set size(_size: 'poster' | 'banner' | 'avatar') {
    let value = '3/4';
    if (_size === 'banner') {
      value = '16/9';
    } else if (_size === 'avatar') {
      value = '1/1';
    }
    // If this.style is undefined, the appended text will be `undefined aspect-ratio...`
    if (this.style) {
      this.style += ` aspect-ratio: ${value};`;
    } else {
      this.style = ` aspect-ratio: ${value};`;
    }
  }

  @Input() set loading(strategy: 'lazy' | 'eager') {
    this._loading = strategy;
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

  @Input() set ratio(ar: string) {
    this.parameters.next({ ...this.parameters.getValue(), ar });
  }

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
    private mediaService: MediaService,
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


    const obs$: Observable<any>[] = [this.asset$, this.parameters, theme$, this.ref$]

    // apply latest changes
    this.sub = combineLatest(obs$).subscribe(async ([asset, params, theme, ref]) => {

      if (ref) {
        // ref
        this.srcset = await this.mediaService.generateImageSrcset(ref, params);
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
