import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AboutPageComponent {}
