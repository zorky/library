import {Injectable} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSnackBarConfig} from "@angular/material/snack-bar/snack-bar-config";

@Injectable({ providedIn: 'root' })
export class ToastyService {
  constructor(public snackBar: MatSnackBar) {
  }
  toasty(message: string, action: string,
         config: MatSnackBarConfig= {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'}) {
    this.snackBar.open(`${message}`, `${action}`, config);
  }
}
