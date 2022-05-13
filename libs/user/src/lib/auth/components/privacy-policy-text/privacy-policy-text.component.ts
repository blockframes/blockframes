import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { boolean } from "@blockframes/utils/decorators/decorators";

@Component({
  selector: 'auth-privacy-policy-text',
  templateUrl: './privacy-policy-text.component.html',
  styleUrls: ['./privacy-policy-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyTextComponent {
  @Input() @boolean dialog = false;
}
