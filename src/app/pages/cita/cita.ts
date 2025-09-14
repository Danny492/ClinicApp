import { Component, OnInit, AfterViewInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { Appointment, AppointmentService, Doctor, MedicalService, AppointmentStatus } from '../service/appointment.service';
import { Patient, PatientService } from '../service/patient.service';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
  selector: 'app-cita',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        DatePickerModule,
        TagModule,
        BadgeModule,
        ChipModule
    ],
  templateUrl: './cita.html',
    styleUrl: './cita.scss',
    providers: [MessageService, AppointmentService, PatientService, ConfirmationService]
})
export class Cita implements OnInit, AfterViewInit {
    appointmentDialog: boolean = false;
    isEditMode: boolean = false;
    appointmentDetailsDialog: boolean = false;
    cancelDialog: boolean = false;
    appointments = signal<Appointment[]>([]);
    patients = signal<Patient[]>([]);
    doctors = signal<Doctor[]>([]);
    medicalServices = signal<MedicalService[]>([]);
    appointment!: Appointment;
    selectedAppointments!: Appointment[] | null;
    submitted: boolean = false;
    minDate: Date = new Date();
    maxDate: Date = new Date();
    availableTimeSlots: string[] = [];
    selectedDoctor: Doctor | null = null;
    selectedService: MedicalService | null = null;
    selectedPatient: Patient | null = null;
    appointmentToCancel: Appointment | null = null;
    motivoCancelacionText: string = '';

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];
    cols!: Column[];

    appointmentForm: FormGroup;

    statusOptions = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Confirmada', value: 'confirmada' },
        { label: 'Cancelada', value: 'cancelada' },
        { label: 'Completada', value: 'completada' }
    ];

    statusSeverity = {
        'pendiente': 'warning',
        'confirmada': 'success',
        'cancelada': 'danger',
        'completada': 'info'
    } as const;

    constructor(
        private appointmentService: AppointmentService,
        private patientService: PatientService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
        
        this.appointmentForm = this.fb.group({
            pacienteId: ['', Validators.required],
            doctorId: ['', Validators.required],
            servicioId: ['', Validators.required],
            fecha: ['', Validators.required],
            hora: ['', Validators.required],
            motivo: ['', Validators.required],
            notas: [''],
            estado: ['pendiente', Validators.required]
        });
    }

    ngOnInit() {
        this.loadData();
        this.setupTableColumns();
        this.setupFormListeners();
    }

    ngAfterViewInit() {
        // Forzar recarga de datos para asegurar que se muestren las fechas actualizadas
        setTimeout(() => {
            this.loadAppointments();
        }, 100);
    }

    loadData() {
        this.loadAppointments();
        this.loadPatients();
        this.loadDoctors();
        this.loadMedicalServices();
    }

    loadAppointments() {
        this.appointmentService.getAppointments().then((data) => {
            this.appointments.set(data);
        });
    }

    refreshAppointments() {
        // Método para forzar recarga de citas
        this.loadAppointments();
        this.messageService.add({
            severity: 'info',
            summary: 'Actualizado',
            detail: 'Datos de citas actualizados',
            life: 1000
        });
    }

    loadPatients() {
        this.patientService.getPatients().then((data) => {
            this.patients.set(data);
        });
    }

    loadDoctors() {
        this.appointmentService.getDoctors().then((data) => {
            this.doctors.set(data);
        });
    }

    loadMedicalServices() {
        this.appointmentService.getMedicalServices().then((data) => {
            this.medicalServices.set(data);
        });
    }

    setupTableColumns() {
        this.cols = [
            { field: 'fecha', header: 'Fecha' },
            { field: 'hora', header: 'Hora' },
            { field: 'paciente', header: 'Paciente' },
            { field: 'doctor', header: 'Doctor' },
            { field: 'servicio', header: 'Servicio' },
            { field: 'estado', header: 'Estado' },
            { field: 'motivo', header: 'Motivo' }
        ];

        this.exportColumns = this.cols.map((col) => ({ 
            title: col.header, 
            dataKey: col.field 
        }));
    }

    setupFormListeners() {
        // Escuchar cambios en el doctor para cargar horarios disponibles
        this.appointmentForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
            if (doctorId) {
                this.selectedDoctor = this.doctors().find(d => d.id === doctorId) || null;
                this.loadAvailableTimeSlots();
            }
        });

        // Escuchar cambios en la fecha para cargar horarios disponibles
        this.appointmentForm.get('fecha')?.valueChanges.subscribe(fecha => {
            if (fecha && this.selectedDoctor) {
                this.loadAvailableTimeSlots();
            }
        });

        // Escuchar cambios en el servicio para actualizar duración
        this.appointmentForm.get('servicioId')?.valueChanges.subscribe(servicioId => {
            if (servicioId) {
                this.selectedService = this.medicalServices().find(s => s.id === servicioId) || null;
            }
        });

        // Escuchar cambios en el paciente
        this.appointmentForm.get('pacienteId')?.valueChanges.subscribe(pacienteId => {
            if (pacienteId) {
                this.selectedPatient = this.patients().find(p => p.id === pacienteId) || null;
            }
        });
    }

    loadAvailableTimeSlots() {
        const doctorId = this.appointmentForm.get('doctorId')?.value;
        const fecha = this.appointmentForm.get('fecha')?.value;
        const servicioId = this.appointmentForm.get('servicioId')?.value;

        if (doctorId && fecha && servicioId) {
            const service = this.medicalServices().find(s => s.id === servicioId);
            const duracion = service?.duracionMinutos || 30;

            this.appointmentService.getAvailableTimeSlots(doctorId, fecha, duracion).then(slots => {
                this.availableTimeSlots = slots;
                
                // Si la hora actual no está disponible, limpiar el campo
                const currentHora = this.appointmentForm.get('hora')?.value;
                if (currentHora && !slots.includes(currentHora)) {
                    this.appointmentForm.get('hora')?.setValue('');
                }
            });
        }
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.isEditMode = false;
        this.appointment = {
            pacienteId: '',
            doctorId: '',
            servicioId: '',
            fecha: new Date(),
            hora: '',
            duracion: 30,
            estado: 'pendiente',
            motivo: '',
            notas: ''
        };
        this.submitted = false;
        this.availableTimeSlots = [];
        this.selectedDoctor = null;
        this.selectedService = null;
        this.selectedPatient = null;
        this.appointmentForm.reset();
        this.appointmentForm.patchValue({
            estado: 'pendiente',
            fecha: new Date()
        });
        this.appointmentDialog = true;
    }

    editAppointment(appointment: Appointment) {
        this.isEditMode = true;
        this.appointment = { ...appointment };
        this.submitted = false;
        
        // Cargar datos relacionados
        this.selectedPatient = this.patients().find(p => p.id === appointment.pacienteId) || null;
        this.selectedDoctor = this.doctors().find(d => d.id === appointment.doctorId) || null;
        this.selectedService = this.medicalServices().find(s => s.id === appointment.servicioId) || null;

        this.appointmentForm.patchValue({
            pacienteId: appointment.pacienteId,
            doctorId: appointment.doctorId,
            servicioId: appointment.servicioId,
            fecha: new Date(appointment.fecha),
            hora: appointment.hora,
            motivo: appointment.motivo,
            notas: appointment.notas,
            estado: appointment.estado
        });

        // Cargar horarios disponibles
        this.loadAvailableTimeSlots();
        
        this.appointmentDialog = true;
    }

    deleteSelectedAppointments() {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar las citas seleccionadas?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.appointments.set(this.appointments().filter((val) => !this.selectedAppointments?.includes(val)));
                this.selectedAppointments = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Citas eliminadas correctamente',
                    life: 1500
                });
            }
        });
    }

    hideDialog() {
        this.appointmentDialog = false;
        this.submitted = false;
        this.appointmentForm.reset();
        this.availableTimeSlots = [];
        this.selectedDoctor = null;
        this.selectedService = null;
        this.selectedPatient = null;
    }

    showAppointmentDetails(appointment: Appointment) {
        this.appointment = { ...appointment };
        this.appointmentDetailsDialog = true;
    }

    hideDetailsDialog() {
        this.appointmentDetailsDialog = false;
        this.appointment = {} as Appointment;
    }

    editAppointmentFromDetails() {
        this.appointmentDetailsDialog = false;
        this.editAppointment(this.appointment);
    }

    deleteAppointment(appointment: Appointment) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar esta cita?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.appointmentService.deleteAppointment(appointment.id!).then((success) => {
                    if (success) {
                        this.appointments.set(this.appointments().filter((val) => val.id !== appointment.id));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Cita eliminada correctamente',
                            life: 1500
                        });
                    }
                });
            }
        });
    }

    openCancelDialog(appointment: Appointment) {
        this.appointmentToCancel = appointment;
        this.motivoCancelacionText = '';
        this.cancelDialog = true;
    }

    hideCancelDialog() {
        this.cancelDialog = false;
        this.appointmentToCancel = null;
        this.motivoCancelacionText = '';
    }

    cancelAppointment() {
        if (this.appointmentToCancel && this.motivoCancelacionText.trim()) {
            this.appointmentService.cancelAppointment(this.appointmentToCancel.id!, this.motivoCancelacionText.trim()).then((updatedAppointment) => {
                if (updatedAppointment) {
                    const index = this.appointments().findIndex(a => a.id === updatedAppointment.id);
                    if (index !== -1) {
                        const updatedAppointments = [...this.appointments()];
                        updatedAppointments[index] = updatedAppointment;
                        this.appointments.set(updatedAppointments);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cita cancelada correctamente',
                        life: 1500
                    });
                    this.hideCancelDialog();
                }
            });
        } else if (!this.motivoCancelacionText.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor ingrese el motivo de cancelación',
                life: 3000
            });
        }
    }

    confirmAppointment(appointment: Appointment) {
        this.appointmentService.confirmAppointment(appointment.id!).then((updatedAppointment) => {
            if (updatedAppointment) {
                const index = this.appointments().findIndex(a => a.id === updatedAppointment.id);
                if (index !== -1) {
                    const updatedAppointments = [...this.appointments()];
                    updatedAppointments[index] = updatedAppointment;
                    this.appointments.set(updatedAppointments);
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita confirmada correctamente',
                    life: 1500
                });
            }
        });
    }

    completeAppointment(appointment: Appointment) {
        this.appointmentService.completeAppointment(appointment.id!).then((updatedAppointment) => {
            if (updatedAppointment) {
                const index = this.appointments().findIndex(a => a.id === updatedAppointment.id);
                if (index !== -1) {
                    const updatedAppointments = [...this.appointments()];
                    updatedAppointments[index] = updatedAppointment;
                    this.appointments.set(updatedAppointments);
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita completada correctamente',
                    life: 1500
                });
            }
        });
    }

    saveAppointment() {
        this.submitted = true;

        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(this.appointmentForm.controls).forEach(key => {
            this.appointmentForm.get(key)?.markAsTouched();
        });

        if (this.appointmentForm.valid) {
            const formValue = this.appointmentForm.value;
            const selectedService = this.medicalServices().find(s => s.id === formValue.servicioId);
            
            const appointmentData: Appointment = {
                ...formValue,
                fecha: new Date(formValue.fecha),
                duracion: selectedService?.duracionMinutos || 30,
                id: this.isEditMode ? this.appointment.id : undefined
            };

            // Verificar conflictos de horario antes de guardar
            this.appointmentService.checkTimeConflict(
                formValue.doctorId,
                formValue.fecha,
                formValue.hora,
                appointmentData.duracion,
                this.isEditMode ? this.appointment.id : undefined
            ).then(conflictResult => {
                if (conflictResult.hasConflict) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Conflicto de Horario',
                        detail: 'Ya existe una cita programada para este doctor en el horario seleccionado',
                        life: 3000
                    });
                    return;
                }

                // Si no hay conflictos, proceder a guardar
                if (this.isEditMode) {
                    this.appointmentService.updateAppointment(appointmentData).then((updatedAppointment) => {
                        const index = this.appointments().findIndex(a => a.id === updatedAppointment.id);
                        if (index !== -1) {
                            const updatedAppointments = [...this.appointments()];
                            updatedAppointments[index] = updatedAppointment;
                            this.appointments.set(updatedAppointments);
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Cita actualizada correctamente',
                            life: 1500
                        });
                        this.hideDialog();
                    });
                } else {
                    this.appointmentService.createAppointment(appointmentData).then((newAppointment) => {
                        this.appointments.set([...this.appointments(), newAppointment]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Cita creada correctamente',
                            life: 1500
                        });
                        this.hideDialog();
                    });
                }
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor complete todos los campos requeridos correctamente',
                life: 3000
            });
        }
    }

    getPatientName(patientId: string): string {
        const patient = this.patients().find(p => p.id === patientId);
        return patient ? patient.nombreCompleto : 'Paciente no encontrado';
    }

    getDoctorName(doctorId: string): string {
        const doctor = this.doctors().find(d => d.id === doctorId);
        return doctor ? doctor.nombreCompleto : 'Doctor no encontrado';
    }

    getServiceName(serviceId: string): string {
        const service = this.medicalServices().find(s => s.id === serviceId);
        return service ? service.nombre : 'Servicio no encontrado';
    }

    getStatusSeverity(status: AppointmentStatus): string {
        return this.statusSeverity[status] || 'secondary';
    }

    getStatusLabel(status: AppointmentStatus): string {
        const statusOption = this.statusOptions.find(option => option.value === status);
        return statusOption ? statusOption.label : status;
    }

    canEditAppointment(appointment: Appointment): boolean {
        return appointment.estado !== 'cancelada' && appointment.estado !== 'completada';
    }

    canCancelAppointment(appointment: Appointment): boolean {
        return appointment.estado === 'pendiente' || appointment.estado === 'confirmada';
    }

    canConfirmAppointment(appointment: Appointment): boolean {
        return appointment.estado === 'pendiente';
    }

    canCompleteAppointment(appointment: Appointment): boolean {
        return appointment.estado === 'confirmada';
    }
}
