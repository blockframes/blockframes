import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { boolean } from "@blockframes/utils/decorators/decorators";

@Component({
  selector: 'auth-cookies-policy-text',
  templateUrl: './cookies-policy-text.component.html',
  styleUrls: ['./cookies-policy-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CookiesPolicyTextComponent {
  @Input() @boolean dialog = false;
}
