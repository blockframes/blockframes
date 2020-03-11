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
  public url: SafeResourceUrl;
  public isMobile$ = this.breakpointsService.xs;
  public isTablet$ = this.breakpointsService.sm;
  public videoWidth$ = combineLatest([this.isMobile$, this.isTablet$]).pipe(
    map(([isMobile, isTablet]) => isMobile ? '340' : isTablet ? '600' : '1024')
  );
  public videoHeight$ = combineLatest([this.isMobile$, this.isTablet$]).pipe(
    map(([isMobile, isTablet]) => isMobile ? '300' : isTablet ? '400' : '560')
  );

  constructor(
    public sanitizer: DomSanitizer,
    private breakpointsService: BreakpointsService
  ) {}

  play() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/391939808?autoplay=1');
    this.cover = !this.cover;
  }
}
