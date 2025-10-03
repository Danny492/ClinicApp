import { Injectable } from '@angular/core';
import { Patient } from './patient.service';

export interface Income {
    id?: string;
    patient: string;
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


private incomes: Income[] = [
  {
    id: '1',
    patient: 'Juan Perez',
    service: 'Consulta general',
    amount: 1500,
    paymentMethod: 'Tarjeta',
    paymentDate: new Date('2025-10-01'),
    paymentRecordedBy: 'Admin',
  },
  {
    id: '2',
    patient: 'María Gómez',
    service: 'Radiografía',
    amount: 2500,
    paymentMethod: 'Efectivo',
    paymentDate: new Date('2025-10-02'),
    paymentRecordedBy: 'Recepcionista',
  },
  {
    id: '3',
    patient: 'Luis Rodríguez',
    service: 'Análisis de sangre',
    amount: 1800,
    paymentMethod: 'Transferencia',
    paymentDate: new Date('2025-10-03'),
    paymentRecordedBy: 'Admin',
  },
  {
    id: '4',
    patient: 'Ana Martínez',
    service: 'Chequeo anual',
    amount: 3000,
    paymentMethod: 'Tarjeta',
    paymentDate: new Date('2025-10-03'),
    paymentRecordedBy: 'Recepcionista',
  },
  {
    id: '5',
    patient: 'Carlos Fernández',
    service: 'Electrocardiograma',
    amount: 2200,
    paymentMethod: 'Efectivo',
    paymentDate: new Date('2025-10-04'),
    paymentRecordedBy: 'Admin',
  },
];

  getIncomes(): Promise<Income[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.incomes]);
            }, 100);
        });
    }

    createIncome(income: Income): Promise<Income> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newIncome = {
                    ...income,
                    id: this.generateId(),
                    paymentDate: new Date()
                };
                this.incomes.push(newIncome);
                resolve(newIncome);
            }, 100);
        });
    }

    updateIncome(income: Income): Promise<Income> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.incomes.findIndex(i => i.id === income.id);
                if (index !== -1) {
                    this.incomes[index] = { ...income };
                    resolve(this.incomes[index]);
                }
                resolve(income);
            }, 100);
        });
    }

    deleteIncome(id: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.incomes.findIndex(i => i.id === id);
                if (index !== -1) {
                    this.incomes.splice(index, 1);
                    resolve(true);
                }
                resolve(false);
            }, 100);
        });
    }

    isNombreCompletoUnique(nombreCompleto: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.incomes.some(i =>
                    i.patient.toLowerCase() === nombreCompleto.toLowerCase() &&
                    i.id !== excludeId
                );
                resolve(!exists);
            }, 50);
        });
    }

    private generateId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }
}
