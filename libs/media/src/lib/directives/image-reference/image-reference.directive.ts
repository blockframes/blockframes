import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ImgRef, getImgSize, imgSizeDirectory } from '../../+state/media.firestore';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';
import { map } from 'rxjs/operators';
import { getMediaUrl } from '../../+state/media.model';

@Directive({
  selector: 'img[ref], img[asset]'
})
export class ImageReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private localTheme$ = new BehaviorSubject<'dark' | 'light'>(null);
  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');
  private srcset$ = new BehaviorSubject('');

  @HostBinding('src') src: string;
  @HostBinding('srcset') srcset: string;

  /** Set src attribute in img tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set ref(path: ImgRef) {
    if (!path) {
      this.ref$.next('');
    }
    try {
      if (path.xs && path.md && path.lg) {
        const sizes = getImgSize(path.xs.ref);
        const srcset = imgSizeDirectory.map(size => `${path[size].url} ${sizes[size]}w`)
          .join(', ');
        this.srcset$.next(srcset);
      }
      const url = getMediaUrl(path);
      this.ref$.next(url);
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
  ) { }

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
        if (srcset) this.srcset = srcset;
        this.src = ref || `assets/${this.type}/${theme}/${asset}`;
        this.cdr.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
