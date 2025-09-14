import { Injectable } from '@angular/core';
import { Patient } from './patient.service';

export interface Doctor {
    id: string;
    nombreCompleto: string;
    especialidad: string;
    telefono: string;
    correoElectronico: string;
    horarioTrabajo: {
        inicio: string;
        fin: string;
    };
}

export interface MedicalService {
    id: string;
    nombre: string;
    descripcion: string;
    duracionMinutos: number;
    precio: number;
}

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Appointment {
    id?: string;
    pacienteId: string;
    paciente?: Patient; // Información del paciente para mostrar
    doctorId: string;
    doctor?: Doctor; // Información del doctor para mostrar
    servicioId: string;
    servicio?: MedicalService; // Información del servicio para mostrar
    fecha: Date;
    hora: string; // Formato HH:mm
    duracion: number; // Duración en minutos
    estado: AppointmentStatus;
    motivo?: string; // Motivo de la cita
    notas?: string; // Notas adicionales
    motivoCancelacion?: string; // Motivo de cancelación si aplica
    fechaCreacion?: Date;
    fechaModificacion?: Date;
}

@Injectable()
export class AppointmentService {
    private appointments: Appointment[] = [
        {
            id: '1',
            pacienteId: '1',
            doctorId: '1',
            servicioId: '1',
            fecha: new Date('2025-09-20'),
            hora: '09:00',
            duracion: 30,
            estado: 'confirmada',
            motivo: 'Consulta general',
            notas: 'Primera consulta del paciente',
            fechaCreacion: new Date('2025-09-15'),
            fechaModificacion: new Date('2025-09-15')
        },
        {
            id: '2',
            pacienteId: '2',
            doctorId: '2',
            servicioId: '2',
            fecha: new Date('2025-09-21'),
            hora: '10:30',
            duracion: 45,
            estado: 'pendiente',
            motivo: 'Control de presión arterial',
            notas: 'Seguimiento mensual',
            fechaCreacion: new Date('2025-09-16'),
            fechaModificacion: new Date('2025-09-16')
        },
        {
            id: '3',
            pacienteId: '3',
            doctorId: '1',
            servicioId: '3',
            fecha: new Date('2025-09-22'),
            hora: '14:00',
            duracion: 60,
            estado: 'cancelada',
            motivo: 'Consulta especializada',
            motivoCancelacion: 'Paciente canceló por motivos personales',
            fechaCreacion: new Date('2025-09-17'),
            fechaModificacion: new Date('2025-09-18')
        },
        {
            id: '4',
            pacienteId: '1',
            doctorId: '3',
            servicioId: '4',
            fecha: new Date('2025-09-25'),
            hora: '11:00',
            duracion: 20,
            estado: 'pendiente',
            motivo: 'Examen de laboratorio',
            notas: 'Análisis de sangre de rutina',
            fechaCreacion: new Date('2025-09-20'),
            fechaModificacion: new Date('2025-09-20')
        },
        {
            id: '5',
            pacienteId: '2',
            doctorId: '1',
            servicioId: '1',
            fecha: new Date('2025-09-28'),
            hora: '15:30',
            duracion: 30,
            estado: 'confirmada',
            motivo: 'Consulta de seguimiento',
            notas: 'Revisión de tratamiento',
            fechaCreacion: new Date('2025-09-22'),
            fechaModificacion: new Date('2025-09-22')
        }
    ];

    private doctors: Doctor[] = [
        {
            id: '1',
            nombreCompleto: 'Dr. Carlos Mendoza',
            especialidad: 'Medicina General',
            telefono: '3001234567',
            correoElectronico: 'carlos.mendoza@clinica.com',
            horarioTrabajo: {
                inicio: '08:00',
                fin: '17:00'
            }
        },
        {
            id: '2',
            nombreCompleto: 'Dra. Ana García',
            especialidad: 'Cardiología',
            telefono: '3009876543',
            correoElectronico: 'ana.garcia@clinica.com',
            horarioTrabajo: {
                inicio: '09:00',
                fin: '18:00'
            }
        },
        {
            id: '3',
            nombreCompleto: 'Dr. Luis Rodríguez',
            especialidad: 'Pediatría',
            telefono: '3005555555',
            correoElectronico: 'luis.rodriguez@clinica.com',
            horarioTrabajo: {
                inicio: '08:30',
                fin: '16:30'
            }
        }
    ];

    private medicalServices: MedicalService[] = [
        {
            id: '1',
            nombre: 'Consulta General',
            descripcion: 'Consulta médica general de rutina',
            duracionMinutos: 30,
            precio: 50000
        },
        {
            id: '2',
            nombre: 'Control de Presión Arterial',
            descripcion: 'Control y monitoreo de presión arterial',
            duracionMinutos: 45,
            precio: 35000
        },
        {
            id: '3',
            nombre: 'Consulta Especializada',
            descripcion: 'Consulta con especialista médico',
            duracionMinutos: 60,
            precio: 80000
        },
        {
            id: '4',
            nombre: 'Examen de Laboratorio',
            descripcion: 'Toma de muestras para exámenes de laboratorio',
            duracionMinutos: 20,
            precio: 25000
        }
    ];

    // Métodos para obtener datos maestros
    getDoctors(): Promise<Doctor[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.doctors]);
            }, 100);
        });
    }

    getMedicalServices(): Promise<MedicalService[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.medicalServices]);
            }, 100);
        });
    }

    // Métodos para citas
    getAppointments(): Promise<Appointment[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.appointments]);
            }, 100);
        });
    }

    getAppointmentById(id: string): Promise<Appointment | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const appointment = this.appointments.find(a => a.id === id);
                resolve(appointment);
            }, 100);
        });
    }

    createAppointment(appointment: Appointment): Promise<Appointment> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newAppointment = {
                    ...appointment,
                    id: this.generateId(),
                    fechaCreacion: new Date(),
                    fechaModificacion: new Date()
                };
                this.appointments.push(newAppointment);
                resolve(newAppointment);
            }, 100);
        });
    }

    updateAppointment(appointment: Appointment): Promise<Appointment> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.appointments.findIndex(a => a.id === appointment.id);
                if (index !== -1) {
                    this.appointments[index] = {
                        ...appointment,
                        fechaModificacion: new Date()
                    };
                    resolve(this.appointments[index]);
                }
                resolve(appointment);
            }, 100);
        });
    }

    deleteAppointment(id: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.appointments.findIndex(a => a.id === id);
                if (index !== -1) {
                    this.appointments.splice(index, 1);
                    resolve(true);
                }
                resolve(false);
            }, 100);
        });
    }

    // Método para detectar conflictos de horario
    checkTimeConflict(
        doctorId: string, 
        fecha: Date, 
        hora: string, 
        duracion: number, 
        excludeAppointmentId?: string
    ): Promise<{ hasConflict: boolean; conflictingAppointments: Appointment[] }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const appointmentDate = new Date(fecha);
                const appointmentTime = this.parseTime(hora);
                const appointmentEndTime = appointmentTime + duracion;

                const conflictingAppointments = this.appointments.filter(appointment => {
                    // Excluir la cita actual si se está editando
                    if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
                        return false;
                    }

                    // Verificar que sea el mismo doctor
                    if (appointment.doctorId !== doctorId) {
                        return false;
                    }

                    // Verificar que sea la misma fecha
                    const appointmentDateToCheck = new Date(appointment.fecha);
                    if (appointmentDateToCheck.toDateString() !== appointmentDate.toDateString()) {
                        return false;
                    }

                    // Verificar que no esté cancelada
                    if (appointment.estado === 'cancelada') {
                        return false;
                    }

                    // Verificar conflicto de horario
                    const existingTime = this.parseTime(appointment.hora);
                    const existingEndTime = existingTime + appointment.duracion;

                    return !(appointmentEndTime <= existingTime || appointmentTime >= existingEndTime);
                });

                resolve({
                    hasConflict: conflictingAppointments.length > 0,
                    conflictingAppointments
                });
            }, 100);
        });
    }

    // Método para obtener citas por rango de fechas
    getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filteredAppointments = this.appointments.filter(appointment => {
                    const appointmentDate = new Date(appointment.fecha);
                    return appointmentDate >= startDate && appointmentDate <= endDate;
                });
                resolve(filteredAppointments);
            }, 100);
        });
    }

    // Método para obtener citas por estado
    getAppointmentsByStatus(status: AppointmentStatus): Promise<Appointment[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filteredAppointments = this.appointments.filter(appointment => 
                    appointment.estado === status
                );
                resolve(filteredAppointments);
            }, 100);
        });
    }

    // Método para cancelar cita
    cancelAppointment(id: string, motivoCancelacion: string): Promise<Appointment | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.appointments.findIndex(a => a.id === id);
                if (index !== -1) {
                    this.appointments[index] = {
                        ...this.appointments[index],
                        estado: 'cancelada',
                        motivoCancelacion,
                        fechaModificacion: new Date()
                    };
                    resolve(this.appointments[index]);
                }
                resolve(null);
            }, 100);
        });
    }

    // Método para confirmar cita
    confirmAppointment(id: string): Promise<Appointment | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.appointments.findIndex(a => a.id === id);
                if (index !== -1) {
                    this.appointments[index] = {
                        ...this.appointments[index],
                        estado: 'confirmada',
                        fechaModificacion: new Date()
                    };
                    resolve(this.appointments[index]);
                }
                resolve(null);
            }, 100);
        });
    }

    // Método para completar cita
    completeAppointment(id: string): Promise<Appointment | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.appointments.findIndex(a => a.id === id);
                if (index !== -1) {
                    this.appointments[index] = {
                        ...this.appointments[index],
                        estado: 'completada',
                        fechaModificacion: new Date()
                    };
                    resolve(this.appointments[index]);
                }
                resolve(null);
            }, 100);
        });
    }

    // Método auxiliar para parsear tiempo
    private parseTime(timeString: string): number {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Método auxiliar para generar ID
    private generateId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    // Método para obtener horarios disponibles de un doctor en una fecha específica
    getAvailableTimeSlots(doctorId: string, fecha: Date, duracion: number = 30): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const doctor = this.doctors.find(d => d.id === doctorId);
                if (!doctor) {
                    resolve([]);
                    return;
                }

                const availableSlots: string[] = [];
                const startTime = this.parseTime(doctor.horarioTrabajo.inicio);
                const endTime = this.parseTime(doctor.horarioTrabajo.fin);
                const slotDuration = duracion;

                // Obtener citas existentes para el doctor en esa fecha
                const existingAppointments = this.appointments.filter(appointment => {
                    const appointmentDate = new Date(appointment.fecha);
                    return appointment.doctorId === doctorId &&
                           appointmentDate.toDateString() === fecha.toDateString() &&
                           appointment.estado !== 'cancelada';
                });

                // Generar slots de tiempo disponibles
                for (let time = startTime; time + slotDuration <= endTime; time += 15) {
                    const timeString = this.formatTime(time);
                    const hasConflict = existingAppointments.some(appointment => {
                        const appointmentTime = this.parseTime(appointment.hora);
                        const appointmentEndTime = appointmentTime + appointment.duracion;
                        return !(time + slotDuration <= appointmentTime || time >= appointmentEndTime);
                    });

                    if (!hasConflict) {
                        availableSlots.push(timeString);
                    }
                }

                resolve(availableSlots);
            }, 100);
        });
    }

    // Método auxiliar para formatear tiempo
    private formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}
