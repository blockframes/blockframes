import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieService } from '@blockframes/movie';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthQuery } from '@blockframes/auth';
import { MovieTunnelService } from '../movie-tunnel.service';

const cardContents = [
  {
    title: 'Title Information',
    description: 'Your title will be published on the platform only once you have signed a contract with us.'
  },
  {
    title: 'Licensed Rights',
    description: 'Your title will be published on the platform only once you have signed a contract with us.'
  },
  {
    title: 'Upload Media',
    description: 'Your title will be published on the platform only once you have signed a contract with us.'
  },
  {
    title: 'Legal Information',
    description: 'Your title will be published on the platform only once you have signed a contract with us.'
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
    private tunnelService: MovieTunnelService,
    private auth: AuthQuery,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.routeBeforeTunnel = this.tunnelService.previousUrl;
  }

  async begin() {
    this.loading = true;
    try {
      const createdBy = this.auth.getValue().uid;
      const movieId = await this.movieService.add({ _meta: { createdBy }});
      this.loading = false;
      this.router.navigate([movieId], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

}
