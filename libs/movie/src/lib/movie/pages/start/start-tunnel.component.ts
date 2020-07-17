import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { Router, ActivatedRoute } from '@angular/router';
import { TunnelService } from '@blockframes/ui/tunnel';

const cardContents = [
  {
    title: 'Title Information',
    img: 'title_infos.webp'
  },
  {
    title: 'Media',
    img: 'media.webp'
  },
  {
    title: 'Legal Information',
    img: 'legal_informartion.webp'
  },
];

@Component({
  selector: 'movie-form-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MovieFormStartTunnelComponent implements OnInit {
  public cardContents = cardContents;
  public loading: boolean;
  public routeBeforeTunnel: string;

  constructor(
    private movieService: MovieService,
    private tunnelService: TunnelService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.tunnelService.previousUrl || '../../';
  }

  async begin() {
    this.loading = true;
    try {
      const { id } = await this.movieService.create();
      this.loading = false;
      this.router.navigate([id], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }
}
