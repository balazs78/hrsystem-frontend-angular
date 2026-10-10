import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnDestroy {
  @Input() set appHasRole(roles: string[]) {
    this.allowedRoles = roles;
    this.updateView();
  }

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private allowedRoles: string[] = [];
  private effectFn = effect(() => {
    // Watch for role changes
    this.authService.role();
    this.updateView();
  });

  private updateView() {
    const userRole = this.authService.role();
    if (this.allowedRoles.length > 0 && this.allowedRoles.includes(userRole)) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }

  ngOnDestroy() {
    this.effectFn.destroy();
  }
}
