import { Injectable } from '@angular/core';
import { Patient } from './patient.service';

export interface Income {
    id?: string;
    patient: Patient;
    service: String;
    amount: number;
    paymentMethod: String;
    paymentDate: Date;
    paymentRecordedBy: String;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

}
