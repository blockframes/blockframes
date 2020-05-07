import { Component, OnInit, HostBinding } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Movie, MovieService } from '@blockframes/movie/+state';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

  @HostBinding('style.background-image') background: string;
  url: SafeResourceUrl;
  public movie: Movie;

  constructor(private sanitizer: DomSanitizer, private movieService: MovieService ) { }

  ngOnInit(): void {
    // this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/391939808');

    const merde = this.movieService.getValue('sSPXqHc4DivQOATem20k');
    merde.then(data => {
      this.movie = data,
      this.background = `url(${data.promotionalElements.banner.media.url})`;
    });
  }
}
