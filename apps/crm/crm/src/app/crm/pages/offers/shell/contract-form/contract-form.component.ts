import { Component, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Services
import { Movie, MovieService } from "@blockframes/movie/+state";
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Term, TermService } from "@blockframes/contract/term/+state";
import { OfferService } from '@blockframes/contract/offer/+state';

// Components
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';

// Forms
import { FormList } from '@blockframes/utils/form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { MovieVersionInfoForm } from "@blockframes/movie/form/movie.form";
import { Scope } from '@blockframes/utils/static-model';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

function toTerm({ id, avails, runs, versions }, contractId: string): Partial<Term> {
  return { id, contractId, runs, languages: versions, ...avails };
}

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  private contract?: Contract;
  private income?: Income;
  title?: Movie;
  form = new FormGroup({
    price: new FormControl(Validators.min(0)),
    terms: FormList.factory([], (term: Term) => new FormGroup({
      id: new FormControl(term.id),
      avails: new AvailsForm(term, []),
      versions: new MovieVersionInfoForm(term.languages),
    }))
  });
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'accepted'));
  currency?: string;
  indexId: number;
  termColumns = {
    'avails.duration': 'Duration',
    'avails.territories': 'Territories',
    'avails.medias': 'Medias',
    'avails.exclusive': 'Exclusivity',
    'versions': 'Versions',
    'runs': '# of broadcasts'
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private service: MovieService,
    private snackbar: MatSnackBar,
    private termService: TermService,
    private titleService: MovieService,
    private offerService: OfferService,
    private incomeService: IncomeService,
    private contractService: ContractService,
  ) { }

  async ngOnInit() {
    const contractId: string = this.route.snapshot.params.contractId;
    const offerId: string = this.route.snapshot.params.offerId;
    const [ contract, income, offer ] = await Promise.all([
      this.contractService.getValue(contractId),
      this.incomeService.getValue(contractId),
      this.offerService.getValue(offerId)
    ]);
    this.title = await this.titleService.getValue(contract.titleId);
    this.form.patchValue({  price: income?.price ??  0 });
    this.contract = contract;
    this.income = income;
    this.currency = offer?.currency;
    const terms = await this.termService.getValue(contract.termIds);
    (this.form.get('terms') as FormList<any>).patchAllValue(terms);

    // We show the term sent in the Query from the view terms page
    if (this.route.snapshot.queryParams.termId) {
      const termId = this.route.snapshot.queryParams.termId;
      const tabTerms = this.form.get('terms').value;
      const index = tabTerms.findIndex(value => value.id === termId);
      this.indexId = index;
    }
  }

  async save() {
    if (this.form.valid) {
      const { terms, price } = this.form.value;
      const contractId = this.route.snapshot.params.contractId;
      const write = this.contractService.batch(); // create a batch
      const termList = (terms as any[]).map(term => toTerm(term, contractId));
      const termIds = await this.termService.upsert(termList, { write });
      const existingTermIds = this.contract?.termIds || [];
      const termIdsToDelete = existingTermIds.filter(id => !termIds.includes(id));
      await this.termService.remove(termIdsToDelete, { write });
      await this.contractService.update(contractId, { termIds  }, { write });
      if (price !== this.income?.price) {
        await this.incomeService.update(contractId, { price }, { write });
      }

      await write.commit();
      this.snackbar.open('Contract updated!', 'ok', { duration: 1000 });
    }
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }
}
