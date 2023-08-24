import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Movie, Scope, Waterfall, WaterfallContract, WaterfallDocument, convertDocumentTo, isContract } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
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

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfalllDocumentService: WaterfallDocumentsService,
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
      this.waterfalllDocumentService.getValue(documentId, { waterfallId })
    ])
    this.movie = movie;
    this.waterfall = waterfall;
    this.document = document;
    if (isContract(this.document)) this.contract = convertDocumentTo<WaterfallContract>(this.document);
    this.cdRef.markForCheck();
  }

  openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }



}