import { Component, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Services
import { MovieService } from "@blockframes/movie/+state";
import { IncomeService } from '@blockframes/contract/income/+state';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Term, TermService } from "@blockframes/contract/term/+state";

// Forms
import { FormList } from '@blockframes/utils/form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { MovieVersionInfoForm } from "@blockframes/movie/form/movie.form";

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  form = new FormGroup({
    titleId: new FormControl(null, Validators.required),
    price: new FormControl(Validators.min(0)),
    terms: FormList.factory([], (term: Term) => new FormGroup({
      avails: new AvailsForm(term, []),
      versions: new MovieVersionInfoForm(term.languages)
    }))
  })
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'approved'));
  currency?: string;
  termColumns = {
    'avails.duration': 'Duration',
    'avails.territories': 'Territories',
    'avails.medias': 'Medias',
    'avails.exclusive': 'Exclusivity',
    'versions': 'Versions'
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
      this.currency = income?.currency;
      const terms = await this.termService.getValue(contract.termIds);
      console.log( terms);
      
      (this.form.get('terms') as FormList<any>).patchAllValue(terms);
    }
}
