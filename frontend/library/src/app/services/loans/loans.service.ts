import {Injectable} from "@angular/core";
import {ServiceGeneric} from "../base/service-generic.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Loan} from "./loan.model";

@Injectable({ providedIn: 'root' })
export class LoanService extends ServiceGeneric<Loan> {
  private url = `${environment.baseUrl}/library/loans/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }
}
