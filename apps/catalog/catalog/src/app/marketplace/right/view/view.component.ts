import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'marketplace-right-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {

  public contract$ = this.query.selectActive();
  public version$ = this.query.activeVersion$;
  public versionView$ = this.query.activeVersionView$;

  constructor(private query: ContractQuery) { }

}
