import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, shareReplay, switchMap } from 'rxjs/operators';

// Services
import { ContractService } from '@blockframes/contract/contract/service';
import { NavigationService } from '@blockframes/ui/navigation.service';

@Component({
  selector: 'crm-term-form',
  templateUrl: './term-form.component.html',
  styleUrls: ['./term-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermFormComponent {
  contractId$ = this.route.params.pipe(map(({ contractId }: { contractId: string }) => contractId));
  titleId$ = this.contractId$.pipe(
    switchMap(contractId => this.contractService.valueChanges(contractId)),
    map(({ titleId }) => titleId),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private navService: NavigationService,
  ) { }

  goBack() {
    this.navService.goBack(1);
  }
}
