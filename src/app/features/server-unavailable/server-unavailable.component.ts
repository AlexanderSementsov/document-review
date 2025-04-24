import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-server-down',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Server is unavailable</h1>
      <p>We're currently having trouble connecting to the server.</p>
      <p>Please try again later.</p>
      <button routerLink="/login">Try again</button>
    </div>
  `,
  styles: [`
    .container {
      text-align: center;
      margin-top: 5rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    button {
      margin-top: 2rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
  `]
})
export class ServerUnavailableComponent {}
