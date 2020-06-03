import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ImgRef, getImgSize, imgSizeDirectory } from '@blockframes/utils/media/media.firestore';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';

@Directive({
  selector: 'img[ref], img[asset]'
})
export class ImageReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);
  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');
  private srcset$ = new BehaviorSubject('');
  placeholder: string;

  @HostBinding('src') src: string;
  @HostBinding('srcset') srcset: string;

  /** Set src attribute in img tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set ref(path: ImgRef) {
    if (!path) {
      this.ref$.next('');
    }
    try {
      if (path.ref) {
        const sizes = getImgSize(path.ref);
        const imgSizesNoOriginal = imgSizeDirectory.filter(size => size !== 'original');
        const srcset = imgSizesNoOriginal
          .map(size => {
            return `${path.urls[size]} ${sizes[size]}w`;
          })
          .join(', ');
        this.srcset$.next(srcset);
      }
      this.ref$.next(path.urls.original);
    } catch (err) {
      this.ref$.next('');
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

    this.sub = combineLatest([this.asset$, theme$, this.ref$, this.srcset$]).subscribe(
      ([asset, theme, ref, srcset]) => {
        this.src = ref || `assets/${this.type}/${theme}/${asset}`;
        if (srcset) this.srcset = srcset;
        this.cdr.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
