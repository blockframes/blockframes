import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie';
import { Router, ActivatedRoute } from '@angular/router';

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

export class StartTunnelComponent{
  public cardContents = cardContents;

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async begin() {
    const movieId = await this.service.add({});
    this.router.navigate([movieId], { relativeTo: this.route });
  }
}
