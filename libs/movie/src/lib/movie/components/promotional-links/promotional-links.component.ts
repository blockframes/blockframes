import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '@blockframes/model';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
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
  public videos = false;

  public xs$ = this.breakpointsService.xs

  constructor(private breakpointsService: BreakpointsService) {}

  ngOnInit() {
    this.videos = this.movie.promotional.videos.otherVideos.some(
      (video) => video.storagePath && video.privacy === 'public'
    );
  }

  async scrollToFooter() {
    // wait for man-menu to be closed
    if (document.getElementById('mat-menu-open')) await delay(250);
    scrollIntoView(document.getElementById('videoFooter'));
  }
}
