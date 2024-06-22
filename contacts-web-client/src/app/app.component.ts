import { Component } from '@angular/core';
import '@cds/core/icon/register.js';
import { ClarityIcons, userIcon, angleIcon, plusIcon } from '@cds/core/icon';

ClarityIcons.addIcons(userIcon, angleIcon, plusIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'contacts-web-client';
}
