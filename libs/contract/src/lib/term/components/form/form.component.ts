import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
import { scrollIntoView } from '@blockframes/utils/browser/utils';

import {
  BehaviorSubject, combineLatest, distinctUntilChanged,
  firstValueFrom, map, shareReplay, switchMap, filter,
} from 'rxjs';

import { where } from 'firebase/firestore';

const mandateQuery = (titleId: string) => [
  where('titleId', '==', titleId),
  where('type', '==', 'mandate'),
];

function isTermToBeUpdated(term: Partial<Term>): term is Term {
  return term.id ? true : false;
}

const from = new Date();
const duration = {
  from,
  to: new Date(from.getFullYear() + 1, from.getMonth(), from.getDate())
};

@Component({
  selector: 'term-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermFormComponent implements OnInit {
  public form = new NegotiationForm();
  public defaultValue = { duration, exclusive: true };
  public activeTerm: number;
  private _titleId = new BehaviorSubject<string>('');
  public termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions',
  };

  @ViewChild('pageTop') pageTop: ElementRef<HTMLHeadElement>;
  @Input() set titleId(id: string) {
    this._titleId.next(id);
  }

  @Input() backUrl: string[];

  public title$ = this._titleId.pipe(
    filter(id => !!id),
    distinctUntilChanged(),
    switchMap(id => this.titleService.valueChanges(id))
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
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    const data$ = combineLatest([this.title$, this.terms$]);
    const [movie, terms] = await firstValueFrom(data$);
    const pageTitle = `Manage avails of ${movie.title.international}`;
    this.dynTitleService.setPageTitle(pageTitle);
    this.form.hardReset({ terms });
    const termIndex = this.route.snapshot.queryParams.termIndex;
    if (termIndex) this.activeTerm = +termIndex;
  }

  openDetails(terms: string[], scope: Scope) {
    const data = { data: createModalData({ terms, scope }), autoFocus: false };
    this.dialog.open(DetailedTermsComponent, data);
  }

  async saveAvails() {
    const existingTerms = await firstValueFrom(this.terms$);
    const allTerms = this.form.value.terms.map(({ duration: { from, to }, ...rest }) => {
      from.setHours(1, 0, 0, 0);
      to.setHours(1, 0, 0, 0);
      return { ...rest, duration: { from, to } };
    });
    const toCreate = allTerms.filter(term => !isTermToBeUpdated(term));
    const toUpdate = allTerms.filter(term => isTermToBeUpdated(term))
      .map((term: Term) => {
        const existingTerm = existingTerms.find(({ id }) => term.id === id) ?? {};
        //Include missing properties of the form eg: licensedOriginal
        return {
          ...existingTerm,
          ...term
        };
      });

    if (toUpdate.length) await this.termService.update(toUpdate);
    if (!toCreate.length) {
      const message = `${toUpdate.length} Terms updated.`;
      this.snackBar.open(message, null, { duration: 6000 });
      this.goBack();
      return;
    };
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
    const message = toUpdate.length
      ? `${toUpdate.length} Term(s) updated and ${toCreate.length} Term(s) created.`
      : `${toCreate.length} Term(s) created.`;
    this.snackBar.open(message, null, { duration: 6000 });
    this.goBack();
  }

  goBack() {
    if (this.backUrl) this.router.navigate(this.backUrl);
    else this.navService.goBack(1);
  }

  scrollToTop() {
    scrollIntoView(this.pageTop.nativeElement);
    this.pageTop.nativeElement.focus();
  }
}
