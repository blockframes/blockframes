import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'catalog-privacy-page',
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPageComponent {}
