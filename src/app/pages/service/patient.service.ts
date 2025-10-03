import { Injectable } from '@angular/core';

export interface Patient {
    id?: string;
    nombreCompleto: string;
    cedula: string;
    fechaNacimiento: Date;
    genero: string;
    direccion: string;
    telefono: string;
    correoElectronico: string;
    fechaRegistro?: Date;
}



@Injectable()
export class PatientService {
    private patients: Patient[] = [
        {
            id: '1',
            nombreCompleto: 'Juan Pérez García',
            cedula: '128-0023456-9',
            fechaNacimiento: new Date('1990-05-15'),
            genero: 'Masculino',
            direccion: 'Calle 123 #45-67, Bogotá',
            telefono: '3001234567',
            correoElectronico: 'juan.perez@email.com',
            fechaRegistro: new Date('2024-01-15')
        },
        {
            id: '2',
            nombreCompleto: 'María González López',
            cedula: '031-4567890-2',
            fechaNacimiento: new Date('1985-08-22'),
            genero: 'Femenino',
            direccion: 'Carrera 45 #78-90, Medellín',
            telefono: '3009876543',
            correoElectronico: 'maria.gonzalez@email.com',
            fechaRegistro: new Date('2024-01-20')
        },
        {
            id: '3',
            nombreCompleto: 'Carlos Rodríguez Martínez',
            cedula: '402-0922985-1',
            fechaNacimiento: new Date('1992-12-10'),
            genero: 'Masculino',
            direccion: 'Avenida 80 #12-34, Cali',
            telefono: '3005555555',
            correoElectronico: 'carlos.rodriguez@email.com',
            fechaRegistro: new Date('2024-02-01')
        }
    ];

    getPatients(): Promise<Patient[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.patients]);
            }, 100);
        });
    }

    createPatient(patient: Patient): Promise<Patient> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPatient = {
                    ...patient,
                    id: this.generateId(),
                    fechaRegistro: new Date()
                };
                this.patients.push(newPatient);
                resolve(newPatient);
            }, 100);
        });
    }

    updatePatient(patient: Patient): Promise<Patient> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.patients.findIndex(p => p.id === patient.id);
                if (index !== -1) {
                    this.patients[index] = { ...patient };
                    resolve(this.patients[index]);
                }
                resolve(patient);
            }, 100);
        });
    }

    deletePatient(id: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.patients.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.patients.splice(index, 1);
                    resolve(true);
                }
                resolve(false);
            }, 100);
        });
    }

    isNombreCompletoUnique(nombreCompleto: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.patients.some(p =>
                    p.nombreCompleto.toLowerCase() === nombreCompleto.toLowerCase() &&
                    p.id !== excludeId
                );
                resolve(!exists);
            }, 50);
        });
    }

    isCedulaUnique(cedula: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.patients.some(p =>
                    p.cedula === cedula &&
                    p.id !== excludeId
                );
                resolve(!exists);
            }, 50);
        });
    }

    isCorreoElectronicoUnique(correoElectronico: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.patients.some(p =>
                    p.correoElectronico.toLowerCase() === correoElectronico.toLowerCase() &&
                    p.id !== excludeId
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
