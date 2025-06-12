import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la aplicación
})
export class FileUploadService {
  private apiUrl = 'http://localhost:3000'; // Asegúrate de que esta URL sea la correcta para tu backend

  constructor(private http: HttpClient) { }

  // Método para subir la foto de perfil (avatar)
  uploadAvatar(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file, file.name); // 'avatar' debe coincidir con el nombre del campo que Multer espera en el backend (en tu index.js)

    return this.http.post(`${this.apiUrl}/usuarios/${userId}/avatar`, formData);
  }

  // Método para subir la foto de fondo (banner)
  uploadBanner(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('banner', file, file.name); // 'banner' debe coincidir con el nombre del campo que Multer espera en el backend (en tu index.js)

    return this.http.post(`${this.apiUrl}/usuarios/${userId}/banner`, formData);
  }
}