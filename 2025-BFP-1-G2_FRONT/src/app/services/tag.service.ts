import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class TagService {

  private baseUrl = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) {
  }

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/list`);
  }

  getOfferTags(offerId: number): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/${offerId}`);
  }

  addTagsToOffer(offerId: number, tagIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${offerId}`,
      {tagIds},
      {responseType: 'text'}
    );
  }


  removeTagFromOffer(offerId: number, tagId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${offerId}/${tagId}`,
      {responseType: 'text'}
    );
  }


  updateOfferTags(offerId: number, tagIds: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/${offerId}`,
      {tagIds},
      {responseType: 'text'}
    );
  }

  createTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(`${this.baseUrl}/add`, tag);
  }

  deleteTag(tagId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${tagId}`);
  }


  updateTag(tag: Tag): Observable<Tag> {
    return this.http.put<Tag>(`${this.baseUrl}`, tag);
  }

  getCandidateTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/candidate`);
  }

  updateCandidateTags(tagIds: number[]): Observable<any> {
    return this.http.put(`${environment.apiUrl}/tags/candidate`,
      {tagIds},
      {responseType: 'text'}
    );
  }

  getCandidateTagsByUsername(username: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/candidate/${username}`);
  }

  getTopTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/mostFrequent`);
  }
}
