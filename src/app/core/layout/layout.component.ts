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
    <app-header />
    <main class="content">
      <router-outlet></router-outlet>
    </main>
    <app-footer />
  `,
})
export class LayoutComponent {}
