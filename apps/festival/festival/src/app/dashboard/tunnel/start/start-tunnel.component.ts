import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieService, createMovie } from '@blockframes/movie/+state';
import { Router, ActivatedRoute } from '@angular/router';
import { TunnelService } from '@blockframes/ui/tunnel';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

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
  selector: 'festival-start-tunnel',
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
    private route: ActivatedRoute,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.tunnelService.previousUrl || '../../';
  }

  async begin() {
    this.loading = true;
    const createdBy = this.auth.getValue().uid;
    const movie = createMovie({ _meta: { createdBy } });
    try {
      const movieId = await this.movieService.add(movie);
      this.loading = false;
      this.router.navigate([movieId], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }
}
