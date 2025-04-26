import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <small>Document Review 2025</small>
    </footer>
  `,
  styleUrls: ['./layout.component.scss']
})
export class FooterComponent {}
