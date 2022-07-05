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
import { combineLatest, firstValueFrom, map, pluck, shareReplay, switchMap } from 'rxjs';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { where } from 'firebase/firestore';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { createMandate, createTerm, Scope, Term } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { centralOrgId } from '@env';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationService } from '@blockframes/ui/navigation.service';

const mandateQuery = (titleId: string) => [
  where('titleId', '==', titleId),
  where('type', '==', 'mandate'),
];

function isTerm(term: Partial<Term>): term is Term {
  return term.contractId ? true : false;
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
  public indexId = 1;
  public termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions',
  };

  public title$ = this.route.params.pipe(
    pluck('titleId'),
    switchMap((titleId: string) => this.titleService.valueChanges(titleId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private mandates$ = this.title$.pipe(
    switchMap(title => this.contractService.valueChanges(mandateQuery(title.id))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private terms$ = this.mandates$.pipe(
    map(contracts => contracts.flatMap(({ termIds }) => termIds)),
    switchMap(termIds => this.termService.valueChanges(termIds)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private route: ActivatedRoute,
    private navService: NavigationService,
    private snackBar: MatSnackBar,
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

  openDetails(terms: string[], scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: createModalData({ terms, scope }), autoFocus: false });
  }

  async saveAvails() {
    const existingTerms = await firstValueFrom(this.terms$);
    const toCreate = this.form.value.terms.filter(term => !isTerm(term));
    let toUpdate = this.form.value.terms.filter(term => isTerm(term));

    //Include missing properties of the form eg: licensedOriginal
    toUpdate = toUpdate.map((term: Term) => {
      const existingTerm = existingTerms.find(({ id }) => term.id === id) ?? {};
      return { ...existingTerm, ...term };
    });

    if (toUpdate.length) this.termService.update(toUpdate);
    if (!toCreate.length) return;
    const contractId = this.contractService.createId();
    const terms = toCreate.map(term => createTerm({
      ...term,
      licensedOriginal: true,
      contractId,
      id: this.termService.createId()
    }));
    const termIds = terms.map(({ id }) => id);
    const data$ = combineLatest([
      this.title$,
      this.orgService.currentOrg$,
    ]);
    const [{ id: titleId }, { id: orgId }] = await firstValueFrom(data$);

    const mandate = createMandate({
      status: 'accepted',
      id: contractId,
      titleId,
      termIds,
      buyerId: centralOrgId.catalog,
      buyerUserId: '',
      sellerId: orgId,
      stakeholders: [centralOrgId.catalog, orgId]
    })

    //@dev firestore rules impose creating the contract before it's terms.
    await this.contractService.add(mandate)
    await this.termService.add(terms);
    const message = toUpdate.length ? 'Terms updated' : 'Terms created';
    this.snackBar.open(message, null, { duration: 6000 });
    this.goBack();
  }

  goBack() {
    this.navService.goBack(1);
  }
}
