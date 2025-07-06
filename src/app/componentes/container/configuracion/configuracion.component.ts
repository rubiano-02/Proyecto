import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
  
  animations: [
    trigger('desplegar', [
      state('cerrado', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('abierto', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      transition('cerrado <=> abierto', [
        animate('300ms ease')
      ]),
    ])
  ]
})
export class ConfiguracionComponent {
  
  isSidebarActive = false;
  constructor(private router: Router, private http: HttpClient, private translate: TranslateService) { }
  mostrarModal = false;
  calificacionSeleccionada = 0;
  estrellas = Array(5).fill(0);

  irAPrincipal() {
    const preferencia = localStorage.getItem('preferencia');
    if (preferencia === 'lectura') {
      this.router.navigate(['/prin-lectura']);
    } else {
      this.router.navigate(['/principal']);
    }
  }
  irAEjercicio() {
    const preferencia = localStorage.getItem('preferencia');
    if (preferencia === 'lectura') {
      this.router.navigate(['/ejercicios']);
    } else {
      this.router.navigate(['/ejer-matematicas']);
    }
  }
  esRutaActivaEjercicio(): boolean {
    const ruta = this.router.url;
    return ruta.includes('ejer-lectura') || ruta.includes('ejer-matematicas');
  }
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
  abrirModal() {
    this.mostrarModal = true;
  }
testClick() {
  console.log('✅ Click recibido en ConfiguracionComponent');
}

  cerrarModal() {
    this.mostrarModal = false;
    this.calificacionSeleccionada = 0;
  }

  seleccionarCalificacion(valor: number) {
    this.calificacionSeleccionada = valor;
  }

 enviarCalificacion() {
      console.log('▶ enviarCalificacion disparado, calif =', this.calificacionSeleccionada);
  console.log('▶ URL que voy a llamar:', 'http://localhost:3000/foro/calificar');
  const idUsuario = localStorage.getItem('user_id');
  if (!idUsuario) {
    alert('No se encontró el ID de usuario.');
    return;
  }
  if (this.calificacionSeleccionada === 0) {
    alert('Por favor selecciona una calificación.');
    return;
  }
  const data = {
    id_usuario: idUsuario,
    calificacion: this.calificacionSeleccionada,
  };
  this.http.post('/foro/calificar', data)
  .subscribe(
    () => {
      alert('¡Gracias por calificar!');
      this.cerrarModal();
    },
    (error) => {
      console.error('Error enviando calificación:', error);
      alert('Ocurrió un error al enviar la calificación.');
    }
  );
}
mostrarModalAyuda = false;

preguntasFrecuentes = [
  {
    pregunta: '¿Cómo cambio mi preferencia de ejercicio?',
    respuesta: 'Ve a Configuración > Preferencias y selecciona tu tipo de ejercicio favorito.',
    mostrar: false
  },
  {
    pregunta: '¿Cómo puedo ver mi progreso?',
    respuesta: 'Desde la página principal, tu progreso aparece en un cuadro de estadísticas actualizado en tiempo real.',
    mostrar: false
  },
  {
    pregunta: '¿Cómo participo en el foro?',
    respuesta: 'Entra a la sección Foro, escribe tu publicación y compártela con otros usuarios.',
    mostrar: false
  },
  {
    pregunta: '¿Puedo actualizar mi foto de perfil?',
    respuesta: 'Sí, desde tu perfil puedes subir una nueva foto que aparecerá en tus publicaciones.',
    mostrar: false
  },
  {
    pregunta: '¿Cómo contacto al soporte?',
    respuesta: 'Escríbenos a soporte@tusitio.com y te ayudaremos lo antes posible.',
    mostrar: false
  }
];

abrirModalAyuda() {
  this.mostrarModalAyuda = true;
}

cerrarModalAyuda() {
  this.mostrarModalAyuda = false;
}

toggleRespuesta(index: number) {
  this.preguntasFrecuentes[index].mostrar = !this.preguntasFrecuentes[index].mostrar;
}
mostrarModalConfiguracion = false;
modoOscuro = false;
idiomaSeleccionado = 'es';

abrirModalConfiguracion() {
  this.mostrarModalConfiguracion = true;
}

cerrarModalConfiguracion() {
  this.mostrarModalConfiguracion = false;
}


toggleModoOscuro() {
  this.modoOscuro = !this.modoOscuro;
  console.log('Modo oscuro:', this.modoOscuro);
  if (this.modoOscuro) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}


cambiarIdioma() {
  this.translate.use(this.idiomaSeleccionado); // es o en
}

irACambioEleccion() {
  this.router.navigate(['/eleccion']);
  this.cerrarModalConfiguracion();
}

}
