import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'hide-email',
  templateUrl: './hide-email.component.html',
  styleUrls: ['./hide-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HideEmailComponent {
  @Input() control: FormControl;
}
