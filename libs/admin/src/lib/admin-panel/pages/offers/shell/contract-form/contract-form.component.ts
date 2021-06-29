import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Services
import { MovieService } from "@blockframes/movie/+state";
import { IncomeService } from '@blockframes/contract/income/+state';
import { ContractService } from '@blockframes/contract/contract/+state';

// Components
import { OfferShellComponent } from '../shell.component';

// RXJS
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: 'contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormComponent implements OnInit {
  form = new FormGroup({
    titleId: new FormControl(),
    price: new FormControl(0),
  })
  titles$ = this.service.valueChanges(ref => ref.where('app.catalog.status', '==', 'approved'));
  contractId$: Observable<string> = this.route.params.pipe(pluck('contractId'));
  subscription: Subscription;
  
  income$ = combineLatest([
    this.contractId$,
    this.shell.incomes$,
  ]).pipe(
    map(([contractId, incomes]) => incomes.find((income) => income.contractId === contractId)));
    
  constructor(
    private service: MovieService,
    private route: ActivatedRoute,
    private shell: OfferShellComponent,
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
    }
}
