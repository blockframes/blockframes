import { ChangeDetectionStrategy, Component, Inject, Input } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { App } from "@blockframes/model";
import { APP } from "@blockframes/utils/routes/utils";

@Component({
  selector: '[form] user-hide-email',
  templateUrl: './hide-email.component.html',
  styleUrls: ['./hide-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideEmailComponent {
  @Input() form: UntypedFormControl;

  constructor(@Inject(APP) public app: App) { }
}
