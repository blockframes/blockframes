import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DistributionDealService, DistributionDeal } from '@blockframes/movie/distribution-deals';
import { DistributionDealStatus } from '@blockframes/movie/distribution-deals/+state/distribution-deal.firestore';
import { DealAdminForm } from '../../forms/deal-admin.form';


@Component({
  selector: 'admin-distribution-deal',
  templateUrl: './distribution-deal.component.html',
  styleUrls: ['./distribution-deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealComponent implements OnInit {
  public dealId = '';
  public movieId = '';
  private deal: DistributionDeal;
  public dealForm: DealAdminForm;
  public statuses: string[];

  constructor(
    private distributionDealService: DistributionDealService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.dealId = this.route.snapshot.paramMap.get('dealId');
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.deal = await this.distributionDealService.getValue(this.dealId, { params: { movieId: this.movieId } });
    this.dealForm = new DealAdminForm(this.deal);

    this.statuses = Object.keys(DistributionDealStatus);
    this.cdRef.detectChanges();
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

}
