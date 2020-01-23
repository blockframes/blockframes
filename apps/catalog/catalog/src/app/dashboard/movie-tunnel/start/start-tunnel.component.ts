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
    private contractService: ContractService,
    private dealService: DistributionDealService,
    private contractVersionService: ContractVersionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async begin() {
    this.loading = true;
    try {
      const write = this.db.firestore.batch();
      ///////////////
      // Create Movie
      const movieId = await this.movieService.add({}, { write });
      // Create Contract
      const contractId = await this.contractService.add({ titleIds: [movieId]}, { write });
      // Create first Distribution Deal for this contract 
      const dealId = await this.dealService.add({ contractId }, { write, params: { movieId } });
      // Create Details for this movie on the first contract version
      const details = createContractTitleDetail({ titleId: movieId, distributionDealIds: [dealId] });
      const titles = { [movieId]: details };
      const versionId = await this.contractVersionService.add({ id: '1', titles }, {
        write,
        params: { contractId }
      });
      console.log({ movieId, contractId, dealId, versionId })
      ///////////////
      write.commit();
      this.loading = false;
      this.router.navigate([movieId], { relativeTo: this.route });
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }
}
