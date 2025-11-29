import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NarrativeElementModel, NarrativeElementTypeModel, RelationshipModel, RelationshipTypeModel } from '../models/narrative-element.model';
import { IPoint } from '@foblex/2d';

@Injectable({
  providedIn: 'root'
})
export class NarrativeelementsService {
  
  private elementsUrl = `${environment.apiUrl}/narrativeelement`;
  private typesUrl = `${environment.apiUrl}/narrativeelementtype`;
  private relationshipsTypesUrl = `${environment.apiUrl}/relationshiptype`;
  private relationshipUrl = `${environment.apiUrl}/relationship`;

  constructor(private http: HttpClient) { }

  getElementsByHistory(historyId: Number): Observable<any> {
    return this.http.get(`${this.elementsUrl}/${historyId}`);
  }

  getRelationshipsByElement(elementId: Number): Observable<any> {
    return this.http.get(`${this.elementsUrl}/${elementId}/relations`);
  }

  getElementTypes(): Observable<any> {
    return this.http.get(`${this.typesUrl}`);
  }

  getRelationshipTypes(): Observable<any> {
    return this.http.get(`${this.relationshipsTypesUrl}`);
  }

  createNarrativeElement(newElement: NarrativeElementModel): Observable<any> {
    
    let element = {
      ...newElement,
      history: { id: newElement.historyId },
      nodePosition: JSON.stringify(newElement.nodePosition),
    };

    return this.http.post(`${this.elementsUrl}`, element);
  }

  updateNodePosition(elementId: number, position: IPoint): Observable<any> {
    const body = JSON.stringify(position);
    return this.http.patch(`${this.elementsUrl}/${elementId}/position`, body);
  }

  createNarrativeElementType(newType: NarrativeElementTypeModel): Observable<any> {
    return this.http.post(`${this.typesUrl}`, newType);
  }

  createRelationshipType(newRelType: RelationshipTypeModel): Observable<any> {
    return this.http.post(`${this.relationshipsTypesUrl}`, newRelType);
  }

  newElementRelationship(from: number, to: number, type: number): Observable<any> {
    return this.http.post(`${this.relationshipUrl}`, {from: from, to: to, type: type})
  }

}
