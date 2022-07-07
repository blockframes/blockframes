import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { MovieService } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { NegotiationForm } from '@blockframes/contract/negotiation';
import { ContractService } from '@blockframes/contract/contract/service';
import { TermService } from '@blockframes/contract/term/service';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { createMandate, createTerm, Scope, Term } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { centralOrgId } from '@env';

import {
  BehaviorSubject, combineLatest, filter, firstValueFrom, map, shareReplay, switchMap
} from 'rxjs';

import { where } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';

const mandateQuery = (titleId: string) => [
  where('titleId', '==', titleId),
  where('type', '==', 'mandate'),
];

function isTerm(term: Partial<Term>): term is Term {
  return term.contractId ? true : false;
}

@Component({
  selector: 'term-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermFormComponent implements OnInit {
  public form = new NegotiationForm({ terms: [] });
  public activeTerm:number;
  private _titleId = new BehaviorSubject<string>('');
  public termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions',
  };

  @Input() set titleId(id: string) {
    this._titleId.next(id);
  }

  public title$ = this._titleId.pipe(
    filter(id => !!id),
    switchMap(id => this.titleService.valueChanges(id)),
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
    private navService: NavigationService,
    private snackBar: MatSnackBar,
    private contractService: ContractService,
    private termService: TermService,
    private dialog: MatDialog,
    private orgService: OrganizationService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const data$ = combineLatest([this.title$, this.terms$]);
    const [movie, terms] = await firstValueFrom(data$);
    const pageTitle = `Manage avails of ${movie.title.international}`;
    this.dynTitleService.setPageTitle(pageTitle);
    this.form.hardReset({ terms });
    this.activeTerm = +this.route.snapshot.queryParams.termIndex;
  }

  openDetails(terms: string[], scope: Scope) {
    const data = { data: createModalData({ terms, scope }), autoFocus: false };
    this.dialog.open(DetailedTermsComponent, data);
  }

  async saveAvails() {
    const existingTerms = await firstValueFrom(this.terms$);
    const toCreate = this.form.value.terms.filter(term => !isTerm(term));
    const toUpdate = this.form.value.terms.filter(term => isTerm(term))
      .map((term: Term) => {
        const existingTerm = existingTerms.find(({ id }) => term.id === id) ?? {};
        //Include missing properties of the form eg: licensedOriginal
        return { ...existingTerm, ...term };
      });

    if (toUpdate.length) await this.termService.update(toUpdate);
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
      sellerId: orgId,
      stakeholders: [centralOrgId.catalog, orgId]
    });

    //@dev firestore rules impose creating the contract before it's terms.
    await this.contractService.add(mandate);
    await this.termService.add(terms);
    const message = toUpdate.length ? 'Terms updated' : 'Terms created';
    this.snackBar.open(message, null, { duration: 6000 });
    this.goBack();
  }

  goBack() {
    this.navService.goBack(1);
  }
}
