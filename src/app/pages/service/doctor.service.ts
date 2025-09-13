import { Injectable } from '@angular/core';

export interface DoctorSchedule {
    id: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    activo: boolean;
}

export interface Doctor {
    id?: string;
    nombre: string;
    cedula: string;
    especialidad: string;
    correo: string;
    telefono: string;
    horarios: DoctorSchedule[];
    fechaRegistro?: Date;
}

@Injectable()
export class DoctorService {
    private doctors: Doctor[] = [
        {
            id: '1',
            nombre: 'Dr. Carlos Mendoza',
            cedula: '001-1234567-8',
            especialidad: 'Cardiología',
            correo: 'carlos.mendoza@clinicapp.com',
            telefono: '809-555-0101',
            fechaRegistro: new Date('2024-01-15'),
            horarios: [
                { id: '1', diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '16:00', activo: true },
                { id: '2', diaSemana: 'Martes', horaInicio: '08:00', horaFin: '16:00', activo: true },
                { id: '3', diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '16:00', activo: true },
                { id: '4', diaSemana: 'Jueves', horaInicio: '08:00', horaFin: '16:00', activo: true },
                { id: '5', diaSemana: 'Viernes', horaInicio: '08:00', horaFin: '16:00', activo: true }
            ]
        },
        {
            id: '2',
            nombre: 'Dra. Ana García',
            cedula: '002-2345678-9',
            especialidad: 'Pediatría',
            correo: 'ana.garcia@clinicapp.com',
            telefono: '809-555-0102',
            fechaRegistro: new Date('2024-01-20'),
            horarios: [
                { id: '6', diaSemana: 'Lunes', horaInicio: '09:00', horaFin: '17:00', activo: true },
                { id: '7', diaSemana: 'Miércoles', horaInicio: '09:00', horaFin: '17:00', activo: true },
                { id: '8', diaSemana: 'Viernes', horaInicio: '09:00', horaFin: '17:00', activo: true },
                { id: '9', diaSemana: 'Sábado', horaInicio: '08:00', horaFin: '12:00', activo: true }
            ]
        },
        {
            id: '3',
            nombre: 'Dr. Roberto Silva',
            cedula: '003-3456789-0',
            especialidad: 'Neurología',
            correo: 'roberto.silva@clinicapp.com',
            telefono: '809-555-0103',
            fechaRegistro: new Date('2024-02-01'),
            horarios: [
                { id: '10', diaSemana: 'Martes', horaInicio: '07:00', horaFin: '15:00', activo: true },
                { id: '11', diaSemana: 'Jueves', horaInicio: '07:00', horaFin: '15:00', activo: true },
                { id: '12', diaSemana: 'Sábado', horaInicio: '07:00', horaFin: '11:00', activo: true }
            ]
        },
        {
            id: '4',
            nombre: 'Dra. María López',
            cedula: '004-4567890-1',
            especialidad: 'Ginecología',
            correo: 'maria.lopez@clinicapp.com',
            telefono: '809-555-0104',
            fechaRegistro: new Date('2024-02-10'),
            horarios: [
                { id: '13', diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '16:00', activo: true },
                { id: '14', diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '16:00', activo: true },
                { id: '15', diaSemana: 'Viernes', horaInicio: '08:00', horaFin: '16:00', activo: true }
            ]
        },
        {
            id: '5',
            nombre: 'Dr. José Ramírez',
            cedula: '005-5678901-2',
            especialidad: 'Ortopedia',
            correo: 'jose.ramirez@clinicapp.com',
            telefono: '809-555-0105',
            fechaRegistro: new Date('2024-02-15'),
            horarios: [
                { id: '16', diaSemana: 'Lunes', horaInicio: '10:00', horaFin: '18:00', activo: true },
                { id: '17', diaSemana: 'Martes', horaInicio: '10:00', horaFin: '18:00', activo: true },
                { id: '18', diaSemana: 'Miércoles', horaInicio: '10:00', horaFin: '18:00', activo: true },
                { id: '19', diaSemana: 'Jueves', horaInicio: '10:00', horaFin: '18:00', activo: true },
                { id: '20', diaSemana: 'Viernes', horaInicio: '10:00', horaFin: '18:00', activo: true }
            ]
        }
    ];

    private especialidades: string[] = [
        'Cardiología',
        'Pediatría',
        'Neurología',
        'Ginecología',
        'Ortopedia',
        'Dermatología',
        'Oftalmología',
        'Psiquiatría',
        'Medicina Interna',
        'Cirugía General',
        'Endocrinología',
        'Neumología'
    ];

    private diasSemana: string[] = [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo'
    ];

    getDoctors(): Promise<Doctor[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.doctors]);
            }, 100);
        });
    }

    createDoctor(doctor: Doctor): Promise<Doctor> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newDoctor = {
                    ...doctor,
                    id: this.generateId(),
                    fechaRegistro: new Date(),
                    horarios: doctor.horarios || []
                };
                this.doctors.push(newDoctor);
                resolve(newDoctor);
            }, 100);
        });
    }

    updateDoctor(doctor: Doctor): Promise<Doctor> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.doctors.findIndex(d => d.id === doctor.id);
                if (index !== -1) {
                    this.doctors[index] = { ...doctor };
                    resolve(this.doctors[index]);
                }
                resolve(doctor);
            }, 100);
        });
    }

    deleteDoctor(id: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.doctors.findIndex(d => d.id === id);
                if (index !== -1) {
                    this.doctors.splice(index, 1);
                    resolve(true);
                }
                resolve(false);
            }, 100);
        });
    }

    getEspecialidades(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.especialidades]);
            }, 50);
        });
    }

    getDiasSemana(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.diasSemana]);
            }, 50);
        });
    }

    isNombreUnique(nombre: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.doctors.some(d => 
                    d.nombre.toLowerCase() === nombre.toLowerCase() && 
                    d.id !== excludeId
                );
                resolve(!exists);
            }, 50);
        });
    }

    isCedulaUnique(cedula: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.doctors.some(d => 
                    d.cedula === cedula && 
                    d.id !== excludeId
                );
                resolve(!exists);
            }, 50);
        });
    }

    isCorreoUnique(correo: string, excludeId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = this.doctors.some(d => 
                    d.correo.toLowerCase() === correo.toLowerCase() && 
                    d.id !== excludeId
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

    generateScheduleId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }
}
