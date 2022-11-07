import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AnalyticsService } from '@blockframes/analytics/service';
import { Movie } from '@blockframes/model';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { delay } from '@blockframes/utils/helpers';

@Component({
  selector: '[movie] movie-promotional-links',
  templateUrl: './promotional-links.component.html',
  styleUrls: ['./promotional-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionalLinksComponent implements OnInit {
  @Input() movie: Movie;
  @Input() links: string[];
  public video = false;

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    this.video = this.movie.promotional.videos.otherVideo.storagePath && this.movie.promotional.videos.otherVideo.privacy === 'public';
  }

  async scrollToFooter() {
    if (document.getElementById('mat-menu-open')) await delay(250); // wait for mat-menu to be closed
    scrollIntoView(document.getElementById('videoFooter'));
  }

  promotionalElementOpened() {
    this.analytics.addTitle('promoElementOpened', this.movie);
  }
}
