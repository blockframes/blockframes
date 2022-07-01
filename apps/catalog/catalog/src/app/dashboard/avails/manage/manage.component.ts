import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { MovieService } from '@blockframes/movie/service';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, map, pluck, switchMap, tap } from 'rxjs';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { QueryConstraint, where } from 'firebase/firestore';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { BucketTerm, createTerm, Scope, Term } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatDialog } from '@angular/material/dialog';


const contractQuery = (titleId: string): QueryConstraint[] => [
  where('titleId', '==', titleId),
  where('type', '==', 'mandate'),
];

function isTerm(term: Partial<Term>): term is Term {
  if (term.contractId) return true;
  return false;
}

@Component({
  selector: 'catalog-manage-avails',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogManageAvailsComponent implements OnInit {
  public availsForm = new AvailsForm();
  public form = new NegotiationForm({ terms: [] });
  private currentOrg$ = this.orgService.currentOrg$
  indexId = 1;
  termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions',
  };
  public title$ = this.route.params.pipe(
    pluck('titleId'),
    switchMap((titleId: string) => this.titleService.valueChanges(titleId))
  );

  public terms$ = this.title$.pipe(
    switchMap(title => this.contractService.valueChanges(contractQuery(title.id))),
    map(contracts => contracts.flatMap(({ termIds }) => termIds)),
    switchMap(termIds => this.termService.valueChanges(termIds)),
    tap(terms => console.log({ terms }))
  );

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService,
    private dialog: MatDialog,
    private orgService: OrganizationService,
  ) { }

  async ngOnInit() {
    const promises = [
      firstValueFrom(this.title$),
      firstValueFrom(this.terms$)
    ] as const;
    const [movie, terms] = await Promise.all(promises);
    const pageTitle = `Manage avails of ${movie.title.international}`;
    this.dynTitleService.setPageTitle(pageTitle);
    this.form.hardReset({ terms });
  }


  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: createModalData({ terms, scope }), autoFocus: false });
  }

  saveAvails() {
    const toCreate: BucketTerm[] = [];
    const toUpdate: Term[] = [];
    for (const term of this.form.value.terms ?? []) {
      if (isTerm(term)) toUpdate.push(term);
      else toCreate.push(term);
    }
    if (toUpdate.length) this.termService.update(toUpdate);
    if (!toCreate.length) return;
    //@Continue from here.
    // collect a mandate contract and create the terms with this contract id.
    const contract = await firstValueFrom()
    const terms = toCreate.map(term => {
      const partialTerm: Partial<Term> = {
        ...term,
        licensedOriginal:true,
        contractId:
      }
      return createTerm(partialTerm);
    });

  }
}
