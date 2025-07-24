import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  imports: [Navbar, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  host: {
    '[@routeAnimation]': 'true'
  },
  animations: [
    trigger('routeAnimation', [
      transition(':enter', [
        query('.monitor, .route', [
          style({ opacity: 0, transform: 'translateX(-40px)' }),
          stagger('200ms', [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
          ]),
        ], { optional: true })
      ]),
      transition(':leave', [
        query('.monitor, .route', [
          style({ opacity: 1, transform: 'translateX(0)' }),
        animate('500ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ]
),
  ]
})
export class Home {

}
