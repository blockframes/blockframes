import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'catalog-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContactPageComponent {}
