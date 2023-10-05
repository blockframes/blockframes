import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  Movie,
  Scope,
  Term,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  convertDocumentTo,
  getDeclaredAmount,
  isContract
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { where } from 'firebase/firestore';
import { TermService } from '@blockframes/contract/term/service';

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
  private allContracts: WaterfallContract[];
  private terms: Term[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfallDocumentService: WaterfallDocumentsService,
    private termService: TermService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const documentId = this.route.snapshot.paramMap.get('documentId');
    const [movie, waterfall, document] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.waterfallDocumentService.getValue(documentId, { waterfallId })
    ]);
    this.movie = movie;
    this.waterfall = waterfall;
    this.document = document;
    if (isContract(this.document)) {
      this.contract = convertDocumentTo<WaterfallContract>(this.document);
      this.allContracts = [this.contract];
      if (this.contract.rootId) {
        this.rootContract = await this.waterfallDocumentService.getContract(this.contract.rootId, waterfallId);
      } else {
        const childDocuments = await this.waterfallDocumentService.getValue([where('rootId', '==', this.contract.id)], { waterfallId });
        this.childContracts = childDocuments.map(d => convertDocumentTo<WaterfallContract>(d));
        this.allContracts = [...this.allContracts, ...this.childContracts];
      }

      this.terms = (await Promise.all(this.allContracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();
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