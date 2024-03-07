
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WaterfallContractForm } from '@blockframes/waterfall/form/contract.form';
import { BehaviorSubject } from 'rxjs';

type Path = 'Documents' | 'Contracts' | 'Financing Plan' | 'Budget';

@Component({
  selector: 'waterfall-title-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {

  public contractForm = new WaterfallContractForm({ id: '' });
  public crumbs$ = new BehaviorSubject<Path[]>(['Documents']);
  public currentPath$ = new BehaviorSubject<Path>('Documents');

  public navigate(path: Path[]) {
    this.crumbs$.next(path);
    this.currentPath$.next(path[path.length - 1]);
  }
}
