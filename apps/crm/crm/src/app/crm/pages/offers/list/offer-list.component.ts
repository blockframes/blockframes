import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { orderBy, where } from 'firebase/firestore';
import { Bucket, CrmOffer, crmOffersToExport, bucketsToCrmBuckets, crmBucketsToExport } from '@blockframes/model';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { BucketService } from '@blockframes/contract/bucket/service';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'crm-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersListComponent {
  public exporting = false;

  offers$ = this.service.valueChanges([orderBy('_meta.createdAt', 'desc')]).pipe(
    joinWith({
      contracts: offer => this.getContracts(offer.id)
    })
  );

  buckets$ = this.bucketService.valueChanges();

  constructor(
    private service: OfferService,
    private contractService: ContractService,
    private titleService: MovieService,
    private bucketService: BucketService,
    private cdr: ChangeDetectorRef,
    private orgService: OrganizationService,
    private snackbar: MatSnackBar,
  ) { }

  private getContracts(offerId: string) {
    return this.contractService.valueChanges([where('offerId', '==', offerId)]).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.adminLastNegotiation(contract.id)
      })
    )
  }

  public exportTable(crmOffers: CrmOffer[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const rows = crmOffersToExport(crmOffers, 'csv');

      downloadCsvFromJson(rows, 'offer-list');

      this.exporting = false;
    } catch (err) {
      console.log(err);
      this.exporting = false;
    }

    this.cdr.markForCheck();
  }

  public async exportBuckets(buckets: Bucket[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      if (buckets.length) {
        const orgs = await this.orgService.load(buckets.map(b => b.id));
        const crmBuckets = bucketsToCrmBuckets(buckets, orgs);
        const rows = crmBucketsToExport(crmBuckets, 'csv');

        downloadCsvFromJson(rows, 'bucket-list');
      } else {
        this.snackbar.open('No data to export', 'close', { duration: 5000 });
      }


      this.exporting = false;
    } catch (err) {
      console.log(err);
      this.exporting = false;
    }

    this.cdr.markForCheck();
  }
}

