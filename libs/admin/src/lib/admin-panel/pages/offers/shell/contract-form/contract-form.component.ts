import { Component, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Services
import { MovieService } from "@blockframes/movie/+state";
import { IncomeService } from '@blockframes/contract/income/+state';
import { ContractService } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  form = new FormGroup({
    titleId: new FormControl(null, Validators.required),
    price: new FormControl(0, Validators.min(0)),
  })
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'approved'));
  currency: String;
  
  constructor(
    private service: MovieService,
    private route: ActivatedRoute,
    private incomeService: IncomeService,
    private contractService: ContractService
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
    }
}
