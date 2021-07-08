import { Component, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Services
import { MovieService } from "@blockframes/movie/+state";
import { IncomeService } from '@blockframes/contract/income/+state';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Term, TermService } from "@blockframes/contract/term/+state";

// Forms
import { FormList } from '@blockframes/utils/form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { MovieVersionInfoForm } from "@blockframes/movie/form/movie.form";
import { RunsForm } from "@blockframes/contract/avails/form/runs.form";

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
  private contract?: Contract
  form = new FormGroup({
    titleId: new FormControl(null, Validators.required),
    price: new FormControl(Validators.min(0)),
    terms: FormList.factory([], (term: Term) => new FormGroup({
      id: new FormControl(term.id),
      avails: new AvailsForm(term, []),
      versions: new MovieVersionInfoForm(term.languages),
      runs: new RunsForm(term.runs)
    }))
  })
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'approved'));
  currency?: string;
  termColumns = {
    'avails.duration': 'Duration',
    'avails.territories': 'Territories',
    'avails.medias': 'Medias',
    'avails.exclusive': 'Exclusivity',
    'versions': 'Versions',
    'runs': '# of broadcasts'
  }
  
  constructor(
    private service: MovieService,
    private route: ActivatedRoute,
    private incomeService: IncomeService,
    private contractService: ContractService,
    private termService: TermService
    ){}

    async ngOnInit() {
      const contractId: string = this.route.snapshot.params.contractId;
      const [ contract, income ] = await Promise.all([
        this.contractService.getValue(contractId),
        this.incomeService.getValue(contractId),
      ]);
      this.form.patchValue({
        titleId: contract?.titleId,
        price: income?.price
      })
      this.contract = contract;
      this.currency = income?.currency;
      const terms = await this.termService.getValue(contract.termIds);
      (this.form.get('terms') as FormList<any>).patchAllValue(terms);
    }

    async save() {
      if (this.form.valid) {
        const { terms, titleId, price } = this.form.value;
        const contractId = this.route.snapshot.params.contractId;
        const write = this.contractService.batch(); // create a batch
        const termList = (terms as any[]).map(term => toTerm(term, contractId));
        const termIds = await this.termService.upsert(termList, { write });
        const existingTermIds = this.contract?.termIds || [];
        const termIdsToDelete = existingTermIds.filter(id => !termIds.includes(id));
        await this.termService.remove(termIdsToDelete, { write })
        .catch(err => console.log(err));
        await this.contractService.update(contractId, { titleId, termIds  }, { write })
        .catch(err => console.log(err));;
        await this.incomeService.update(contractId, { price }, { write })
        .catch(err => console.log(err));; // Update the price in the batch
        await write.commit();
      }
    }
}
