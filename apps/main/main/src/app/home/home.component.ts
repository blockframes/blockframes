import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

interface AppDetails {
  name: string;
  logoSrc: string;
  href: string;
}

@Component({
  selector: 'blockframes-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
