import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'catalog-view-marketplace',
  templateUrl: './view-marketplace.component.html',
  styleUrls: ['./view-marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogViewMarketplaceComponent implements OnInit {
  public cover = true;
  public url: SafeResourceUrl;
  public mobileQuery: MediaQueryList;
  public tabletQuery: MediaQueryList;

  private _responsiveQueryListener: () => void;

  constructor(public sanitizer: DomSanitizer, private changeDetectorRef: ChangeDetectorRef, private media: MediaMatcher) {}

  ngOnInit() {
    this.mobileQuery = this.media.matchMedia('(max-width: 599px)');
    this.tabletQuery = this.media.matchMedia('(max-width: 959px)');
    this._responsiveQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._responsiveQueryListener);
    this.tabletQuery.addEventListener('change', this._responsiveQueryListener);
  }

  play() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/391939808?autoplay=1');
    this.cover = !this.cover;
  }

  get videoWidth() {
    return this.mobileQuery.matches ? '340' : this.tabletQuery.matches ? '600' : '1024';
  }

  get videoHeight() {
    return this.mobileQuery.matches ? '300' : this.tabletQuery.matches ? '400' : '560';
  }
}
