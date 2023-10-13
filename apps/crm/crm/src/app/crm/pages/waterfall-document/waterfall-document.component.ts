import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  Movie,
  Right,
  Scope,
  Term,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  getDeclaredAmount,
  isContract
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';

@Component({
  selector: 'crm-waterfall-document',
  templateUrl: './waterfall-document.component.html',
  styleUrls: ['./waterfall-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallDocumentComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public document: WaterfallDocument;
  public contract: WaterfallContract;
  public rootContract: WaterfallContract;
  public childContracts: WaterfallContract[];
  public rights: Right[];
  private allContracts: WaterfallContract[];
  private terms: Term[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const documentId = this.route.snapshot.paramMap.get('documentId');
    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = data.waterfall;
    this.document = data.documents.find(d => d.id === documentId);

    if (isContract(this.document)) {
      this.contract = data.contracts.find(c => c.id === this.document.id);
      this.allContracts = [this.contract];
      this.rights = data.rights.filter(r => r.contractId === this.contract.id);
      if (this.contract.rootId) {
        this.rootContract = data.contracts.find(c => c.id === this.contract.rootId);
      } else {
        this.childContracts = data.contracts.filter(c => c.rootId === this.contract.id);
        this.allContracts = [...this.allContracts, ...this.childContracts];
      }
      this.terms = data.terms.filter(t => this.allContracts.map(c => c.id).includes(t.contractId));
    }
    this.cdRef.markForCheck();
  }

  public openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getDeclaredAmount(contract: WaterfallContract) {
    return getDeclaredAmount({ ...contract, terms: this.terms.filter(t => t.contractId === contract.id) });
  }

  public getTermAmount(term: Term) {
    return { [term.currency]: term.price };
  }
}