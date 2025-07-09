import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { throwError, Observable } from 'rxjs';



@Injectable({

  providedIn: 'root'

})

export class ResultadosService {

  private apiUrl = 'http://localhost:3000/resultados';



  constructor(private http: HttpClient) { }



  guardarResultado(id_usuario: number, calificacion: number, tiempo_dedicado: number): Observable<any> {

    const resultado = {

      id_usuario,

      calificacion,

      tiempo_dedicado

    };



    console.log('📤 Enviando resultado:', resultado); // <- agrega esto



    return this.http.post<any>(this.apiUrl, resultado);

  }





  getProgresoUsuario(id_usuario: number): Observable<any> {

    return this.http.get<any>(`http://localhost:3000/progreso/${id_usuario}`);

  }

}