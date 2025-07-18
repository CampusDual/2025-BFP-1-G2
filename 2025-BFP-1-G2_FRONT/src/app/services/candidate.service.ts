import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Candidate } from '../models/candidate.model';
import { MonthlyCountDTO } from '../models/metrics.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root'
})
export class CandidateService {

    private candidateDetailsCache: Observable<Candidate> | null = null;

    deleteCandidateDetails() {
        this.candidateDetailsCache = null;
    }

    private baseUrl = `${environment.apiUrl}/candidate`;

    constructor(private http: HttpClient) { }

    getCandidatesOffers(): Observable<MonthlyCountDTO[]> {
        return this.http.get<MonthlyCountDTO[]>(`${this.baseUrl}/list`);
    }



    getCandidateDetails(): Observable<Candidate> {
        if (!this.candidateDetailsCache) {
            this.candidateDetailsCache = this.http.get<Candidate>(`${this.baseUrl}/me`).pipe(
                shareReplay(1)
            );
        }
        return this.candidateDetailsCache;
    }

    getSpecificCandidateDetails(username: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.baseUrl}/get/${username}`);
    }

    getCandidatesByOffer(offerId: number, page: number, candidatesPageSize: number) {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', candidatesPageSize.toString());
        return this.http.get<PageResponse<Candidate>>(`${this.baseUrl}/myOffers/${offerId}`, { params });
    }

    getRecommendedCandidates(offerId: number, page: number = 0, size: number = 4): Observable<PageResponse<Candidate>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<Candidate>>(`${this.baseUrl}/recommended/myOffers/${offerId}`, { params });
    }

    updateCandidateDetails(candidateData: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/edit`, candidateData).pipe(
            tap(() => {
                this.candidateDetailsCache = null;
            })
        );
    }


    deleteExperience(experienceId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/experience/${experienceId}`);
    }

    createExperience(experience: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/experience`, experience);
    }

    deleteEducation(educationId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/education/${educationId}`);
    }

    createEducation(education: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/education`, education);
    }
}
