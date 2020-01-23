import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie';
import { Router, ActivatedRoute } from '@angular/router';
import { ContractService, createContractTitleDetail } from '@blockframes/contract/contract/+state';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';

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
  public loading: boolean;

  constructor(
    private db: AngularFirestore,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async begin() {
    this.loading = true;
    try {
      const movieId = await this.movieService.add({});
      this.loading = false;
      this.router.navigate([movieId], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }
}
