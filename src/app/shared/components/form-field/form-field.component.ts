import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-form-field',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <label [attr.for]="controlName()">
      {{ label() }}
      @if (control) {
        <input
          [formControl]="control"
          [type]="type()"
          [id]="controlName()"
          [placeholder]="placeholder()"
        />
      }
    </label>

    @if (control?.invalid && control?.dirty) {
      <div class="error">{{ error() }}</div>
    }
  `
})
export class FormFieldComponent {
  label = input('');
  placeholder = input('');
  type = input<'text' | 'email' | 'password'>('text');
  controlName = input<string>();
  formGroup = input<FormGroup>();
  error = input('Invalid field');

  get control(): FormControl | null {
    const formGroup = this.formGroup();
    const controlName = this.controlName();

    if (!formGroup || !controlName) return null;
    return formGroup.get(controlName) as FormControl;
  }
}
