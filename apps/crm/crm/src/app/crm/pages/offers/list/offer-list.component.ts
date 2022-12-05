import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { orderBy, where } from 'firebase/firestore';
import { Contract, Movie, Negotiation, Offer, toLabel, sum, Bucket } from '@blockframes/model';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { format } from 'date-fns';
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

  public exportTable(offers: (
    { contracts: (Contract & { title: Movie, negotiation?: Negotiation })[] }
    & Offer)[]
  ) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const exportedRows = offers.map(offer => ({
        reference: offer.id,
        created: format(offer._meta.createdAt, 'MM/dd/yyyy'),
        buyerId: offer.buyerId,
        '# of title': offer.contracts.length,
        titles: offer.contracts.map(c => c.title?.title?.international).join(', '),
        'specific terms': offer.specificity ? 'yes' : '--',
        'total package price': `${sum(offer.contracts.map(c => c.negotiation.price).filter(value => typeof value === 'number'))} ${offer.currency || ''}`,
        status: toLabel(offer.status, 'offerStatus')
      }));

      downloadCsvFromJson(exportedRows, 'offer-list');

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
        const exportedRows = [];
        const orgs = await this.orgService.load(buckets.map(b => b.id));
        for (const bucket of buckets) {
          const org = orgs.find(o => o.id === bucket.id);
          exportedRows.push({
            'bucket reference': bucket.id,
            'org name': org ? org.name : '--deleted org--',
            '# of title': bucket.contracts.length,
            delivery: bucket.delivery ?? '--',
            specificity: bucket.specificity ?? '--',
            'total bucket price': `${sum(bucket.contracts.map(c => c.price).filter(value => typeof value === 'number' && !isNaN(value)))} ${bucket.currency || ''}`
          });
        }

        downloadCsvFromJson(exportedRows, 'bucket-list');
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

