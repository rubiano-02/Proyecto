import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-2',
  standalone: false,
  templateUrl: './lectura-2.component.html',
  styleUrl: './lectura-2.component.css'
})
export class Lectura2Component {
ejercicios = [
    {
      texto: 'Lola salió al parque con su perro. El cielo estaba oscuro y de pronto...',
      opciones: ['Se encontró con un dragón.', 'Comenzó a llover.', 'El perro se subió a una bicicleta.'],
      correcta: 'Comenzó a llover.'
    },
    {
      texto: 'Mateo escuchó un ruido en el armario. Cuando lo abrió...',
      opciones: ['Un ratón salió corriendo.', 'Se cayó una estrella.', 'Apareció un pastel.'],
      correcta: 'Un ratón salió corriendo.'
    },
    {
      texto: 'Ana estaba cocinando galletas, pero olvidó revisar el horno...',
      opciones: ['Las galletas se quemaron.', 'El horno desapareció.', 'El gato las decoró.'],
      correcta: 'Las galletas se quemaron.'
    },
    {
      texto: 'Carlos lanzaba una pelota muy alto. En uno de esos lanzamientos...',
      opciones: ['La atrapó un pájaro.', 'Cayó en una nube.', 'Se convirtió en globo.'],
      correcta: 'La atrapó un pájaro.'
    },
    {
      texto: 'Mía regaba las plantas en el jardín. Al levantar la regadera...',
      opciones: ['Salió una rana saltando.', 'Empezó a nevar.', 'Apareció un arcoíris.'],
      correcta: 'Salió una rana saltando.'
    }
  ];

  ejercicioActual = 0;
  totalEjercicios = this.ejercicios.length;
  calificacion = 0;
  color = '';
  mensaje = '';
  terminado = false;

  constructor(private resultadosService: ResultadosService) {}
modalAbierto: boolean = false;

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  seleccionar(opcion: string) {
    const ejercicio = this.ejercicios[this.ejercicioActual];
    const esCorrecta = opcion === ejercicio.correcta;

    if (esCorrecta) {
      this.mensaje = '✔ Correcto';
      this.color = 'green';
      this.calificacion++;
    } else {
      this.mensaje = `Casi. ¡Corrige!`;
      this.color = 'red';
    }

    setTimeout(() => {
      this.mensaje = '';
      if (this.ejercicioActual < this.totalEjercicios - 1) {
        this.ejercicioActual++;
      } else {
        this.terminado = true;
        this.guardarResultado();
      }
    }, 2000);
  }

  guardarResultado() {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;
    const idUsuario = Number(idUsuarioStr);
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: (res) => console.log('✅ Resultado guardado:', res),
      error: (err) => console.error('❌ Error al guardar resultado:', err)
    });
  }
}
