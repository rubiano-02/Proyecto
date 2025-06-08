import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true
    });
  }
}
