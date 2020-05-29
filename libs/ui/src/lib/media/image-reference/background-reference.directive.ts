import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { ImgRef } from '@blockframes/utils/media/media.firestore';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { ThemeService } from '@blockframes/ui/theme';

@Directive({
  selector: '[bgRef], [bgAsset]'
})
export class BackgroundReferenceDirective implements OnInit, OnDestroy {
  private sub: Subscription;
  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject('');

  @HostBinding('style.backgroundImage') src: string;

  /** Set background-image attribute in any html tag with the url stored in firestore.
   *  If path is wrong, src will be set with provided placeholder or empty string */
  @Input() set bgRef(path: ImgRef) {
    if(!path){
      this.ref$.next('');
    } try {
      this.ref$.next(path.urls.original);
    } catch (err) {
      this.ref$.next('')
    }
  }

  @Input() set bgAsset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private theme: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.sub = combineLatest([this.asset$, this.theme.theme$, this.ref$]).subscribe(([asset, theme, ref]) => {
      this.src = ref || `url(asset/images/${theme}/${asset})`;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
