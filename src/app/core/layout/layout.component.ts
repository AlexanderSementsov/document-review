import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet],
  template: `
    <div class="layout-wrapper">
      <app-header />
      <main class="content page-container">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {}
