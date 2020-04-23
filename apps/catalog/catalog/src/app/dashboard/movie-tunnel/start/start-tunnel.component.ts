import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TunnelService } from '@blockframes/ui/tunnel/tunnel.service';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

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
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Add a title')
  }

  ngOnInit() {
    this.routeBeforeTunnel = this.tunnelService.previousUrl || '../../';
  }

  async begin() {
    this.loading = true;
    try {
      const movieId = await this.movieService.create();
      this.loading = false;
      this.router.navigate([movieId], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }
}
