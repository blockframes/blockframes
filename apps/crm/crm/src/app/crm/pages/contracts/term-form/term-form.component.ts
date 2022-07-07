import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

// Services
import { ContractService } from '@blockframes/contract/contract/service';

// Material
import { NavigationService } from '@blockframes/ui/navigation.service';

@Component({
  selector: 'crm-term-form',
  templateUrl: './term-form.component.html',
  styleUrls: ['./term-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermFormComponent {
  titleId$ = this.route.params.pipe(
    switchMap(({ contractId }: { contractId: string }) => this.contractService.valueChanges(contractId)),
    map(({ titleId }) => titleId)
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
