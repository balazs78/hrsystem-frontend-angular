import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiselectLabel',
})
export class MultiselectLabelPipe implements PipeTransform {

  /**
   * @param selectedIds - Array of selected IDs (e.g., [1, 2, 5])
   * @param allOptions - The original list (e.g., departments array)
   * @param labelKey - The property to display (default 'name')
   */
  transform(
    selectedIds: Array<number | string> | null | undefined,
    allOptions: unknown[] | null | undefined,
    labelKey: string = 'name'
  ): string {
    
    // Defensive check: If no IDs or no options list, return empty string
    if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0 || !allOptions) {
      return '';
    }

    const firstId = selectedIds[0];
    const firstItem = allOptions.find(option => {
      if (typeof option === 'object' && option !== null && 'id' in option) {
        return option.id === firstId;
      }
      return option === firstId;
    });
    const firstName = this.getLabel(firstItem, labelKey);

    const remainingCount = selectedIds.length - 1;

    if (remainingCount === 0) {
      return firstName;
    }

    return `${firstName} (+${remainingCount} other${remainingCount > 1 ? 's' : ''})`;
  }

  private getLabel(option: unknown, labelKey: string): string {
    if (typeof option === 'object' && option !== null && labelKey in option) {
      const label = option[labelKey as keyof typeof option];
      return typeof label === 'string' || typeof label === 'number' ? String(label) : '';
    }
    return typeof option === 'string' || typeof option === 'number' ? String(option) : '';
  }

}
