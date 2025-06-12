import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario);
  }
  // ¡NUEVO MÉTODO QUE FALTABA!
  obtenerUsuarioPorId(id: number): Observable<any> {
    // Esta ruta apunta a http://localhost:3000/usuarios/ID_DEL_USUARIO
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
