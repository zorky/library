import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Author} from "./author.model";

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private url =  `${environment.baseUrl}/library/authors/`;
  constructor(private httpClient: HttpClient) { }

  /**
   * Liste de tous les auteurs
   */
  public fetchAll() {
    return this.httpClient.get<Author[]>(this.url);
  }

  /**
   * Obtient un auteur particulier par son id
   * @param {number} id : l'identifiant de l'auteur
   */
  public fetch(id: number) {
    const urlId = `${this.url}${id}/`;
    return this.httpClient.get<Author>(urlId);
  }
}
