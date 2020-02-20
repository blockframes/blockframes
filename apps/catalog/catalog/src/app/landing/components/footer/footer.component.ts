import { Component, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'catalog-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogFooterComponent {
  constructor() { }

}
