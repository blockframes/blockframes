import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieService, createMovie } from '@blockframes/movie';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthQuery } from '@blockframes/auth';
import { TunnelService } from '@blockframes/ui/tunnel';

const cardContents = [
  {
    title: 'Title Information'
  },
  {
    title: 'Media'
  },
  {
    title: 'Legal Information'
  },
];

@Component({
  selector: 'catalog-start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class StartTunnelComponent implements OnInit {
  public cardContents = cardContents;
  public loading: boolean;
  public routeBeforeTunnel: string;

  constructor(
    private movieService: MovieService,
    private tunnelService: TunnelService,
    private auth: AuthQuery,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.tunnelService.previousUrl;
  }

  async begin() {
    this.loading = true;
    try {
      const createdBy = this.auth.getValue().uid;
      const movie = createMovie({ _meta: { createdBy } });
      const movieId = await this.movieService.add(movie);
      this.loading = false;
      this.router.navigate([movieId], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }
}
