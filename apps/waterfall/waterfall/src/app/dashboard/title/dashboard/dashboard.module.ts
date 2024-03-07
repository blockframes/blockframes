// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReactiveFormsModule } from '@angular/forms';

// Pages
import { DashboardComponent } from './dashboard.component';

// Blockframes
import { DashboardCardModule } from '@blockframes/waterfall/components/dashboard-card/dashboard-card.module';
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder/rightholder-select/rightholder-select.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version-selector/version-selector.module';
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgApexchartsModule,

    DashboardCardModule,
    ImageModule,
    TableModule,
    PricePerCurrencyModule,
    LogoSpinnerModule,
    RightholderSelectModule,
    EmptyWaterfallModule,
    VersionSelectorModule,

    // Material
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      canActivate: [WaterfallAdminGuard],
      component: DashboardComponent,
      data: { redirect: 'statements', relative: true }
    }]),
  ],
})
export class DashboardModule { }
