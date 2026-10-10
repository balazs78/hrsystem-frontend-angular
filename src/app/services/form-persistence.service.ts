import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormPersistenceService {

  save(key: string, form: FormGroup, exclude: string[] = ['password']): void {
    const data = form.getRawValue();
    exclude.forEach(field => delete data[field]);
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Restores a form's value from localStorage if it exists.
   */
  restore(key: string, form: FormGroup): void {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      // patchValue is safer than setValue as it handles partial data
      form.patchValue(JSON.parse(savedData), { emitEvent: false });
    }
  }

  /**
   * Clears the storage. Call this after a successful form submission!
   */
  clear(key: string): void {
    localStorage.removeItem(key);
  }
}