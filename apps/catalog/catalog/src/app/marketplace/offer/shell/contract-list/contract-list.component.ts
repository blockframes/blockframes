import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { OfferShellComponent } from '../shell.component';

@Component({
  selector: 'catalog-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent {

  constructor(
    private shell: OfferShellComponent,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  goToContract({ id }: { id: string }) {
    this.router.navigate([id], { relativeTo: this.route });
  }

}
