export enum actionTypeEnum {
  information= 1,
  validation= 2
}

export class DialogData {
  title = 'Confirmation';
  message = 'Etes-vous sur ?';

  iconType = ''; // '' | warning |...
  buttonTextTrue = 'OUI';
  buttonTextFalse = 'NON';
  buttonColorTrue = 'warn';
  buttonColorFalse = '';
  buttonJustify = 'end'; // start | center | end

  actionType: actionTypeEnum; // types d'actions possible
  action = actionTypeEnum.validation; // action choisie
}
