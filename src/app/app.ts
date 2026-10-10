import { Component, inject, signal } from '@angular/core';
import { Sidebar } from './components/menu/sidebar/sidebar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LoaderComponent } from './components/common/loader/loader';
import { Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [
    Sidebar,
    LoaderComponent,
    MatSidenavModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal(environment.appName);
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(this.title());
  }
}
