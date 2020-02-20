import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'catalog-view-marketplace',
  templateUrl: './view-marketplace.component.html',
  styleUrls: ['./view-marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogViewMarketplaceComponent {
  public cover = true;
  public url: SafeResourceUrl;

  constructor(public sanitizer: DomSanitizer) {}

  play() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/391939808?autoplay=1');
    this.cover = !this.cover;
  }
}
