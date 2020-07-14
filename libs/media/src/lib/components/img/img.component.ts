import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';
import { getMediaUrl, getImgSize, ImgRef, imgSizeDirectory, getAssetPath } from '@blockframes/media/+state/media.model';

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

  public srcset: string;
  public srcFallback: string;
  public assetSrc: string;
  public assetFallback: string;
  public format: string;

  @Input() alt: string;

  /** Set src attribute in img tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set ref(path: ImgRef) {
    try {
      if (path.ref && path.urls) {
        this.srcFallback = path.urls.fallback;
        const sizes = getImgSize(path.ref);
        const imgSizesNoOriginal = imgSizeDirectory.filter(size => size !== 'original');
        const srcset = imgSizesNoOriginal
          .map(size => `${path.urls[size]} ${sizes[size]}w`)
          .join(', ');
        this.srcset = srcset;
      } else {
        const url = getMediaUrl(path);
        this.srcset = url;
      }
    } catch (err) {
      this.srcset = undefined;
      this.srcFallback = undefined;
    }
  }

  @Input() set theme(theme: 'dark' | 'light') {
    this.localTheme$.next(theme);
  }

  @Input() type: 'images' | 'logo' = 'images';

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
      this.format = asset.split('.').pop();
      this.assetSrc = getAssetPath(asset, theme, this.type);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
