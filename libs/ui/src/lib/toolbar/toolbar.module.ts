import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuSidebarComponent } from './context-menu-sidebar/context-menu-sidebar.component';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { CatalogLeftMenuComponent } from './catalog-left-menu/catalog-left-menu.component';
import { FooterComponent } from './footer/footer.component';

//Modules
import { RouterModule } from '@angular/router';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

    // Material
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatTabsModule,
    MatGridListModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [
    HeaderComponent,
    ContextMenuComponent,
    ContextMenuSidebarComponent,
    LeftMenuComponent,
    FooterComponent,
    CatalogLeftMenuComponent
  ],
  exports: [
    HeaderComponent,
    LeftMenuComponent,
    FooterComponent,
    CatalogLeftMenuComponent,
    ContextMenuSidebarComponent
  ]
})
export class ToolbarModule {}
