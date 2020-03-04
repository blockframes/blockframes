import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DistributionDealService, DistributionDeal } from '@blockframes/movie/distribution-deals';
import { distributionDealStatus } from '@blockframes/movie/distribution-deals/+state/distribution-deal.firestore';
import { DealAdminForm } from '../../forms/deal-admin.form';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractService } from '@blockframes/contract/contract/+state';


@Component({
  selector: 'admin-distribution-deal',
  templateUrl: './distribution-deal.component.html',
  styleUrls: ['./distribution-deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealComponent implements OnInit {
  public dealId = '';
  public movieId = '';
  public deal: DistributionDeal;
  public dealForm: DealAdminForm;
  public distributionDealStatus = distributionDealStatus;
  public contract: Contract;

  constructor(
    private distributionDealService: DistributionDealService,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.dealId = this.route.snapshot.paramMap.get('dealId');
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    try {
      this.deal = await this.distributionDealService.getValue(this.dealId, { params: { movieId: this.movieId } });
      this.dealForm = new DealAdminForm(this.deal);

      if (this.deal.contractId) {
        this.contract = await this.contractService.getValue(this.deal.contractId);
      }

    } catch (error) {
      this.snackBar.open('There was an error while oppening deal', 'close', { duration: 5000 });
    }
    this.cdRef.markForCheck();
  }

  public async update() {
    if (this.dealForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      contractId: this.dealForm.get('contractId').value,
      status: this.dealForm.get('status').value,
      exclusive: this.dealForm.get('exclusive').value,
    }

    await this.distributionDealService.update(this.dealId, update, { params: { movieId: this.movieId } });

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public getMoviePath(movieId: string) {
    return `/c/o/admin/panel/movie/${movieId}`;
  }

  public getMovieTunnelPath(movieId: string) {
    return `/c/o/dashboard/tunnel/movie/${movieId}`;
  }

  public getContractTunnelPath(contract: Contract) {
    return `/c/o/marketplace/tunnel/contract/${contract.id}/${contract.type}`;
  }

  public getContractPath(contractId: string) {
    return `/c/o/admin/panel/contract/${contractId}`;
  }
}
