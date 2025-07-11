import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ChatService {

    private baseUrl = `${environment.apiUrl}/messages`;

    constructor(private http: HttpClient) { }

    getAllMessages(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/history`);
    }
}
