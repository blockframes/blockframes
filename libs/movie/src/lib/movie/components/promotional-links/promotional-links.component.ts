import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: '[movie] movie-promotional-links',
  templateUrl: './promotional-links.component.html',
  styleUrls: ['./promotional-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalLinksComponent implements OnInit {

  @Input() movie: Movie;
  @Input() links: string[];
  public videos = false;

  ngOnInit() {
    this.videos = this.movie.promotional.videos.otherVideos.some(video => video.storagePath);
  }

  scrollToFooter() {
    const footer = document.getElementsByTagName('footer');
    footer[0].scrollIntoView({ behavior: 'smooth' });
    return;
  }
}
