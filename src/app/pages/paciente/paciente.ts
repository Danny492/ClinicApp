import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
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
import { Patient, PatientService } from '../service/patient.service';
import { Observable, map } from 'rxjs';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

// Validadores personalizados para campos únicos
function createUniqueValidator(
    validatorFn: (value: string, excludeId?: string) => Promise<boolean>,
    excludeId?: string
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return new Observable(observer => observer.next(null));
        }
        
        return new Observable(observer => {
            validatorFn(control.value, excludeId).then(isUnique => {
                observer.next(isUnique ? null : { unique: true });
                observer.complete();
            });
        });
    };
}

@Component({
    selector: 'app-paciente',
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
        ConfirmDialogModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button 
                    label="Nuevo Paciente" 
                    icon="pi pi-plus" 
                    severity="secondary" 
                    class="mr-2" 
                    (onClick)="openNew()" 
                />
                <p-button 
                    severity="secondary" 
                    label="Eliminar Seleccionados" 
                    icon="pi pi-trash" 
                    outlined 
                    (onClick)="deleteSelectedPatients()" 
                    [disabled]="!selectedPatients || !selectedPatients.length" 
                />
            </ng-template>

            <ng-template #end>
                <p-button 
                    label="Exportar" 
                    icon="pi pi-upload" 
                    severity="secondary" 
                    (onClick)="exportCSV()" 
                />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="patients()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['nombreCompleto', 'cedula', 'correoElectronico', 'telefono']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedPatients"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pacientes"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gestión de Pacientes</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(dt, $event)" 
                            placeholder="Buscar por nombre, cédula o correo..." 
                        />
                    </p-iconfield>
                </div>
            </ng-template>
            
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="nombreCompleto" style="min-width: 20rem">
                        Nombre Completo
                        <p-sortIcon field="nombreCompleto" />
                    </th>
                    <th pSortableColumn="cedula" style="min-width: 12rem">
                        Cédula
                        <p-sortIcon field="cedula" />
                    </th>
                    <th pSortableColumn="telefono" style="min-width: 12rem">
                        Teléfono
                        <p-sortIcon field="telefono" />
                    </th>
                    <th pSortableColumn="correoElectronico" style="min-width: 16rem">
                        Correo Electrónico
                        <p-sortIcon field="correoElectronico" />
                    </th>
                    <th pSortableColumn="genero" style="min-width: 10rem">
                        Género
                        <p-sortIcon field="genero" />
                    </th>
                    <th style="min-width: 12rem">Acciones</th>
                </tr>
            </ng-template>
            
            <ng-template #body let-patient>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="patient" />
                    </td>
                    <td style="min-width: 20rem">{{ patient.nombreCompleto }}</td>
                    <td style="min-width: 12rem">{{ patient.cedula }}</td>
                    <td style="min-width: 12rem">{{ patient.telefono }}</td>
                    <td style="min-width: 16rem">{{ patient.correoElectronico }}</td>
                    <td style="min-width: 10rem">{{ patient.genero }}</td>
                    <td>
                        <p-button 
                            icon="pi pi-pencil" 
                            class="mr-2" 
                            [rounded]="true" 
                            [outlined]="true" 
                            (click)="editPatient(patient)" 
                        />
                        <p-button 
                            icon="pi pi-trash" 
                            severity="danger" 
                            [rounded]="true" 
                            [outlined]="true" 
                            (click)="deletePatient(patient)" 
                        />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog 
            [(visible)]="patientDialog" 
            [style]="{ width: '600px' }" 
            [header]="isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'" 
            [modal]="true"
            [closable]="true"
        >
            <ng-template #content>
                <form [formGroup]="patientForm" class="flex flex-col gap-4">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label for="nombreCompleto" class="block font-bold mb-2">Nombre Completo *</label>
                            <input 
                                type="text" 
                                pInputText 
                                id="nombreCompleto" 
                                formControlName="nombreCompleto"
                                placeholder="Ingrese el nombre completo"
                                [class.ng-invalid]="submitted && patientForm.get('nombreCompleto')?.invalid"
                                fluid 
                            />
                             <small 
                                 class="text-red-500" 
                                 *ngIf="submitted && patientForm.get('nombreCompleto')?.errors?.['required']"
                             >
                                 El nombre completo es requerido.
                             </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="patientForm.get('nombreCompleto')?.errors?.['unique']"
                             >
                                 Este nombre completo ya está registrado.
                             </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="cedula" class="block font-bold mb-2">Cédula *</label>
                            <input 
                                type="text" 
                                pInputText 
                                id="cedula" 
                                formControlName="cedula"
                                placeholder="12345678901"
                                maxlength="13"
                                [class.ng-invalid]="submitted && patientForm.get('cedula')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('cedula')?.errors?.['required']"
                            >
                                La cédula es requerida.
                            </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="submitted && patientForm.get('cedula')?.errors?.['pattern']"
                             >
                                 La cédula debe tener el formato XXX-XXXXXXX-X (11 dígitos).
                             </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="patientForm.get('cedula')?.errors?.['unique']"
                             >
                                 Esta cédula ya está registrada.
                             </small>
                        </div>
                        <div class="col-span-6">
                            <label for="fechaNacimiento" class="block font-bold mb-2">Fecha de Nacimiento *</label>
                            <input 
                                type="date" 
                                pInputText 
                                id="fechaNacimiento" 
                                formControlName="fechaNacimiento"
                                [max]="maxDate.toISOString().split('T')[0]"
                                [class.ng-invalid]="submitted && patientForm.get('fechaNacimiento')?.invalid"
                                fluid
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('fechaNacimiento')?.errors?.['required']"
                            >
                                La fecha de nacimiento es requerida.
                            </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="genero" class="block font-bold mb-2">Género *</label>
                            <p-select 
                                id="genero" 
                                formControlName="genero"
                                [options]="generoOptions" 
                                optionLabel="label" 
                                optionValue="value" 
                                placeholder="Seleccione género"
                                [class.ng-invalid]="submitted && patientForm.get('genero')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('genero')?.errors?.['required']"
                            >
                                El género es requerido.
                            </small>
                        </div>
                        <div class="col-span-6">
                            <label for="telefono" class="block font-bold mb-2">Teléfono *</label>
                            <input 
                                type="tel" 
                                pInputText 
                                id="telefono" 
                                formControlName="telefono"
                                placeholder="Número de teléfono"
                                [class.ng-invalid]="submitted && patientForm.get('telefono')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('telefono')?.errors?.['required']"
                            >
                                El teléfono es requerido.
                            </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label for="correoElectronico" class="block font-bold mb-2">Correo Electrónico *</label>
                            <input 
                                type="email" 
                                pInputText 
                                id="correoElectronico" 
                                formControlName="correoElectronico"
                                placeholder="correo@ejemplo.com"
                                [class.ng-invalid]="submitted && patientForm.get('correoElectronico')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('correoElectronico')?.errors?.['required']"
                            >
                                El correo electrónico es requerido.
                            </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="submitted && patientForm.get('correoElectronico')?.errors?.['email']"
                             >
                                 Ingrese un correo electrónico válido.
                             </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="patientForm.get('correoElectronico')?.errors?.['unique']"
                             >
                                 Este correo electrónico ya está registrado.
                             </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label for="direccion" class="block font-bold mb-2">Dirección *</label>
                            <textarea 
                                id="direccion" 
                                pInputText
                                formControlName="direccion"
                                placeholder="Ingrese la dirección completa"
                                rows="3"
                                [class.ng-invalid]="submitted && patientForm.get('direccion')?.invalid"
                                style="width: 100%; resize: vertical;"
                            ></textarea>
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('direccion')?.errors?.['required']"
                            >
                                La dirección es requerida.
                            </small>
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && patientForm.get('direccion')?.errors?.['minlength']"
                            >
                                La dirección debe tener al menos 10 caracteres.
                            </small>
                        </div>
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <p-button 
                    label="Cancelar" 
                    icon="pi pi-times" 
                    text 
                    (click)="hideDialog()" 
                />
                <p-button 
                    [label]="isEditMode ? 'Actualizar' : 'Guardar'" 
                    icon="pi pi-check" 
                    (click)="savePatient()" 
                />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, PatientService, ConfirmationService]
})
export class Paciente implements OnInit {
    patientDialog: boolean = false;
    isEditMode: boolean = false;
    patients = signal<Patient[]>([]);
    patient!: Patient;
    selectedPatients!: Patient[] | null;
    submitted: boolean = false;
    maxDate: Date = new Date();

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];
    cols!: Column[];

    patientForm: FormGroup;

    generoOptions = [
        { label: 'Masculino', value: 'Masculino' },
        { label: 'Femenino', value: 'Femenino' },
        { label: 'Otro', value: 'Otro' }
    ];

    constructor(
        private patientService: PatientService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        this.patientForm = this.fb.group({
            nombreCompleto: ['', 
                [Validators.required, Validators.minLength(2)], 
                [createUniqueValidator(this.patientService.isNombreCompletoUnique.bind(this.patientService))]
            ],
            cedula: ['', 
                [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d{1}$/)], 
                [createUniqueValidator(this.patientService.isCedulaUnique.bind(this.patientService))]
            ],
            fechaNacimiento: ['', Validators.required],
            genero: ['', Validators.required],
            direccion: ['', [Validators.required, Validators.minLength(10)]],
            telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
            correoElectronico: ['', 
                [Validators.required, Validators.email], 
                [createUniqueValidator(this.patientService.isCorreoElectronicoUnique.bind(this.patientService))]
            ]
        });
    }

    ngOnInit() {
        this.loadPatients();
        this.setupTableColumns();
        this.setupCedulaFormatting();
    }

    loadPatients() {
        this.patientService.getPatients().then((data) => {
            this.patients.set(data);
        });
    }

    setupTableColumns() {
        this.cols = [
            { field: 'nombreCompleto', header: 'Nombre Completo' },
            { field: 'cedula', header: 'Cédula' },
            { field: 'telefono', header: 'Teléfono' },
            { field: 'correoElectronico', header: 'Correo Electrónico' },
            { field: 'genero', header: 'Género' }
        ];

        this.exportColumns = this.cols.map((col) => ({ 
            title: col.header, 
            dataKey: col.field 
        }));
    }

    setupCedulaFormatting() {
        // Escuchar cambios en el campo de cédula para formateo automático
        this.patientForm.get('cedula')?.valueChanges.subscribe(value => {
            if (value && typeof value === 'string') {
                const formattedValue = this.formatCedula(value);
                const control = this.patientForm.get('cedula');
                if (control && formattedValue !== value) {
                    control.setValue(formattedValue, { emitEvent: false });
                }
            }
        });
    }

    formatCedula(value: string): string {
        // Remover todos los caracteres que no sean números
        const numbersOnly = value.replace(/\D/g, '');
        
        // Limitar a 11 dígitos máximo
        const limitedNumbers = numbersOnly.substring(0, 11);
        
        // Aplicar formato XXX-XXXXXXX-X
        if (limitedNumbers.length <= 3) {
            return limitedNumbers;
        } else if (limitedNumbers.length <= 10) {
            return `${limitedNumbers.substring(0, 3)}-${limitedNumbers.substring(3)}`;
        } else {
            return `${limitedNumbers.substring(0, 3)}-${limitedNumbers.substring(3, 10)}-${limitedNumbers.substring(10)}`;
        }
    }

    updateValidatorsForNew() {
        // Para nuevos pacientes, no excluir ningún ID
        this.patientForm.get('nombreCompleto')?.setAsyncValidators([
            createUniqueValidator(this.patientService.isNombreCompletoUnique.bind(this.patientService))
        ]);
        this.patientForm.get('cedula')?.setAsyncValidators([
            createUniqueValidator(this.patientService.isCedulaUnique.bind(this.patientService))
        ]);
        this.patientForm.get('correoElectronico')?.setAsyncValidators([
            createUniqueValidator(this.patientService.isCorreoElectronicoUnique.bind(this.patientService))
        ]);
    }

    updateValidatorsForEdit(excludeId?: string) {
        // Para edición, excluir el ID del paciente actual
        this.patientForm.get('nombreCompleto')?.setAsyncValidators([
            createUniqueValidator(this.patientService.isNombreCompletoUnique.bind(this.patientService), excludeId)
        ]);
        this.patientForm.get('cedula')?.setAsyncValidators([
            createUniqueValidator(this.patientService.isCedulaUnique.bind(this.patientService), excludeId)
        ]);
        this.patientForm.get('correoElectronico')?.setAsyncValidators([
            createUniqueValidator(this.patientService.isCorreoElectronicoUnique.bind(this.patientService), excludeId)
        ]);
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.isEditMode = false;
        this.patient = {
            nombreCompleto: '',
            cedula: '',
            fechaNacimiento: new Date(),
            genero: '',
            direccion: '',
            telefono: '',
            correoElectronico: ''
        };
        this.submitted = false;
        this.updateValidatorsForNew();
        this.patientForm.reset();
        this.patientDialog = true;
    }

    editPatient(patient: Patient) {
        this.isEditMode = true;
        this.patient = { ...patient };
        this.submitted = false;
        
        // Actualizar los validadores para excluir el ID del paciente actual
        this.updateValidatorsForEdit(patient.id);
        
        this.patientForm.patchValue({
            nombreCompleto: patient.nombreCompleto,
            cedula: patient.cedula,
            fechaNacimiento: new Date(patient.fechaNacimiento).toISOString().split('T')[0],
            genero: patient.genero,
            direccion: patient.direccion,
            telefono: patient.telefono,
            correoElectronico: patient.correoElectronico
        });
        
        this.patientDialog = true;
    }

    deleteSelectedPatients() {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar los pacientes seleccionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.patients.set(this.patients().filter((val) => !this.selectedPatients?.includes(val)));
                this.selectedPatients = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Pacientes eliminados correctamente',
                    life: 1500
                });
            }
        });
    }

    hideDialog() {
        this.patientDialog = false;
        this.submitted = false;
        this.patientForm.reset();
    }

    deletePatient(patient: Patient) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar a ' + patient.nombreCompleto + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.patientService.deletePatient(patient.id!).then((success) => {
                    if (success) {
                        this.patients.set(this.patients().filter((val) => val.id !== patient.id));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Paciente eliminado correctamente',
                            life: 1500
                        });
                    }
                });
            }
        });
    }

    savePatient() {
        this.submitted = true;

        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(this.patientForm.controls).forEach(key => {
            this.patientForm.get(key)?.markAsTouched();
        });

        if (this.patientForm.valid) {
            const formValue = this.patientForm.value;
            const patientData: Patient = {
                ...formValue,
                fechaNacimiento: new Date(formValue.fechaNacimiento),
                id: this.isEditMode ? this.patient.id : undefined
            };

            if (this.isEditMode) {
                this.patientService.updatePatient(patientData).then((updatedPatient) => {
                    const index = this.patients().findIndex(p => p.id === updatedPatient.id);
                    if (index !== -1) {
                        const updatedPatients = [...this.patients()];
                        updatedPatients[index] = updatedPatient;
                        this.patients.set(updatedPatients);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Paciente actualizado correctamente',
                        life: 1500
                    });
                    this.hideDialog();
                });
            } else {
                this.patientService.createPatient(patientData).then((newPatient) => {
                    this.patients.set([...this.patients(), newPatient]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Paciente creado correctamente',
                        life: 1500
                    });
                    this.hideDialog();
                });
            }
        } else {
            // Verificar si hay errores de unicidad
            const hasUniqueErrors = Object.keys(this.patientForm.controls).some(key => {
                const control = this.patientForm.get(key);
                return control?.errors?.['unique'];
            });

            if (hasUniqueErrors) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Algunos campos ya están registrados en el sistema',
                    life: 3000
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
    }
}