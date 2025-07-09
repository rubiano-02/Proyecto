import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import AOS from 'aos';

declare const AdobeAn: any;
declare const createjs: any;
@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements AfterViewInit {
  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true
    });
  }
   
  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.cargarCreateJS(() => {
      this.cargarAnimacionKoala(() => {
        this.inicializarAnimacionKoala(); // ✅ Aquí inicializamos todo
      });
    });
  }

  cargarCreateJS(callback: () => void) {
    const script = this.renderer.createElement('script');
    script.src = 'https://code.createjs.com/1.0.0/createjs.min.js';
    script.onload = () => {
      console.log('CreateJS cargado');
      callback();
    };
    this.renderer.appendChild(document.body, script);
  }

cargarAnimacionKoala(callback: () => void) {
  const script = this.renderer.createElement('script');
  script.src = 'assets/animaciones/saludo-koala.js';
  script.onload = () => {
    console.log('Animación Koala cargada');
    
    setTimeout(() => {
      callback();
    }, 100);
  };
  this.renderer.appendChild(document.body, script);
}



inicializarAnimacionKoala() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  const comp = AdobeAn.getComposition('0A1E3D76CB76F84F86AB852F0969F4BD');
  const lib = comp.getLibrary();
const exportRoot = new lib.KoalaV2();

  // 🔧 Escalar (tamaño) y posicionar
exportRoot.scaleX = 0.7; // O ajusta a gusto
exportRoot.scaleY = 0.7;
exportRoot.x = -25; // Puedes moverlo un poco para que se vea bien dentro del canvas
exportRoot.y = 50;
    // Mueve hacia arriba (ajusta si se ve muy abajo)


  (window as any).stage = new lib.Stage(canvas); // <- ESTA ES LA CLAVE

 (window as any).stage.addChild(exportRoot);

createjs.Ticker.framerate = lib.properties.fps;
createjs.Ticker.addEventListener("tick", (window as any).stage);


  AdobeAn.compositionLoaded(lib.properties.id);
  AdobeAn.makeResponsive(true, 'both', true, 1, [canvas]);
}


}
