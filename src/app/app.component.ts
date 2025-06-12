import { Component, OnInit } from '@angular/core';
import AOS from 'aos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DIJU';

ngOnInit() {
  if (typeof window !== 'undefined') {
    AOS.init();
  }
}
}