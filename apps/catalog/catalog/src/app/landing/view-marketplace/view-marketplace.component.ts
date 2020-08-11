import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-view-marketplace',
  templateUrl: './view-marketplace.component.html',
  styleUrls: ['./view-marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogViewMarketplaceComponent {
  public cover = true;
  public url: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  public xs$ = this.breakpointsService.xs;
  public sm$ = this.breakpointsService.sm;
  public videoWidth$ = combineLatest([this.xs$, this.sm$]).pipe(
    map(([isMobile, isTablet]) => isMobile ? '340' : isTablet ? '600' : '1024')
  );
  public videoHeight$ = combineLatest([this.xs$, this.sm$]).pipe(
    map(([isMobile, isTablet]) => isMobile ? '300' : isTablet ? '400' : '560')
  );

  constructor(
    public sanitizer: DomSanitizer,
    private breakpointsService: BreakpointsService
  ) {}

  play() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/410957544?autoplay=1');
    this.cover = !this.cover;
  }
}
