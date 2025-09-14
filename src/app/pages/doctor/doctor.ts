import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, FormArray } from '@angular/forms';
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
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { Doctor, DoctorService, DoctorSchedule } from '../service/doctor.service';
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
    selector: 'app-doctor-component',
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
        CheckboxModule,
        TagModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button 
                    label="Nuevo Doctor" 
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
                    (onClick)="deleteSelectedDoctors()" 
                    [disabled]="!selectedDoctors || !selectedDoctors.length" 
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
            [value]="doctors()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['nombre', 'codigo', 'especialidad', 'correo', 'telefono']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedDoctors"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} doctores"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h5 class="m-0 text-center lg:text-left">Gestión de Doctores</h5>
                    <p-iconfield class="w-full lg:w-auto">
                        <p-inputicon styleClass="pi pi-search" />
                        <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(dt, $event)" 
                            placeholder="Buscar por nombre, código, especialidad o correo..." 
                            class="w-full"
                        />
                    </p-iconfield>
                </div>
            </ng-template>
            
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="nombre" style="min-width: 20rem">
                        Nombre
                        <p-sortIcon field="nombre" />
                    </th>
                    <th pSortableColumn="codigo" style="min-width: 12rem">
                        Código
                        <p-sortIcon field="codigo" />
                    </th>
                    <th pSortableColumn="especialidad" style="min-width: 12rem">
                        Especialidad
                        <p-sortIcon field="especialidad" />
                    </th>
                    <th pSortableColumn="telefono" style="min-width: 12rem">
                        Teléfono
                        <p-sortIcon field="telefono" />
                    </th>
                    <th pSortableColumn="correo" style="min-width: 16rem">
                        Correo Electrónico
                        <p-sortIcon field="correo" />
                    </th>
                    <th style="min-width: 12rem">Acciones</th>
                </tr>
            </ng-template>
            
            <ng-template #body let-doctor>
                <tr (click)="showDoctorDetails(doctor)" style="cursor: pointer;">
                    <td style="width: 3rem" (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="doctor" />
                    </td>
                    <td style="min-width: 20rem">{{ doctor.nombre }}</td>
                    <td style="min-width: 12rem">{{ doctor.codigo }}</td>
                    <td style="min-width: 12rem">{{ doctor.especialidad }}</td>
                    <td style="min-width: 12rem">{{ doctor.telefono }}</td>
                    <td style="min-width: 16rem">{{ doctor.correo }}</td>
                    <td (click)="$event.stopPropagation()">
                        <p-button 
                            icon="pi pi-pencil" 
                            class="mr-2" 
                            [rounded]="true" 
                            [outlined]="true" 
                            (click)="editDoctor(doctor)" 
                        />
                        <p-button 
                            icon="pi pi-trash" 
                            severity="danger" 
                            [rounded]="true" 
                            [outlined]="true" 
                            (click)="deleteDoctor(doctor)" 
                        />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal para crear/editar doctor -->
        <p-dialog 
            [(visible)]="doctorDialog" 
            [style]="{ width: '800px' }" 
            [header]="isEditMode ? 'Editar Doctor' : 'Nuevo Doctor'" 
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [styleClass]="'doctor-form-dialog'"
        >
            <ng-template #content>
                <form [formGroup]="doctorForm" class="flex flex-col gap-4">
                    <!-- Información básica -->
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label for="nombre" class="block font-bold mb-2">Nombre Completo *</label>
                            <input 
                                type="text" 
                                pInputText 
                                id="nombre" 
                                formControlName="nombre"
                                placeholder="Ingrese el nombre completo del doctor"
                                [class.ng-invalid]="submitted && doctorForm.get('nombre')?.invalid"
                                fluid 
                            />
                             <small 
                                 class="text-red-500" 
                                 *ngIf="submitted && doctorForm.get('nombre')?.errors?.['required']"
                             >
                                 El nombre completo es requerido.
                             </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="doctorForm.get('nombre')?.errors?.['unique']"
                             >
                                 Este nombre ya está registrado.
                             </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="codigo" class="block font-bold mb-2">Código *</label>
                            <input 
                                type="text" 
                                pInputText 
                                id="codigo" 
                                formControlName="codigo"
                                placeholder="UDR001"
                                maxlength="6"
                                [class.ng-invalid]="submitted && doctorForm.get('codigo')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && doctorForm.get('codigo')?.errors?.['required']"
                            >
                                El código es requerido.
                            </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="submitted && doctorForm.get('codigo')?.errors?.['pattern']"
                             >
                                 El código debe tener el formato UDR seguido de 3 números (ej: UDR001).
                             </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="doctorForm.get('codigo')?.errors?.['unique']"
                             >
                                 Este código ya está registrado.
                             </small>
                        </div>
                        <div class="col-span-6">
                            <label for="especialidad" class="block font-bold mb-2">Especialidad *</label>
                            <p-select 
                                id="especialidad" 
                                formControlName="especialidad"
                                [options]="especialidades" 
                                placeholder="Seleccione especialidad"
                                [class.ng-invalid]="submitted && doctorForm.get('especialidad')?.invalid"
                                fluid
                                [appendTo]="'body'"
                                [virtualScroll]="false"
                                [filter]="true"
                                filterPlaceholder="Buscar especialidad..."
                                [showClear]="true"
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && doctorForm.get('especialidad')?.errors?.['required']"
                            >
                                La especialidad es requerida.
                            </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="telefono" class="block font-bold mb-2">Teléfono *</label>
                            <input 
                                type="tel" 
                                pInputText 
                                id="telefono" 
                                formControlName="telefono"
                                placeholder="809-555-0101"
                                [class.ng-invalid]="submitted && doctorForm.get('telefono')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && doctorForm.get('telefono')?.errors?.['required']"
                            >
                                El teléfono es requerido.
                            </small>
                        </div>
                        <div class="col-span-6">
                            <label for="correo" class="block font-bold mb-2">Correo Electrónico *</label>
                            <input 
                                type="email" 
                                pInputText 
                                id="correo" 
                                formControlName="correo"
                                placeholder="doctor@clinicapp.com"
                                [class.ng-invalid]="submitted && doctorForm.get('correo')?.invalid"
                                fluid 
                            />
                            <small 
                                class="text-red-500" 
                                *ngIf="submitted && doctorForm.get('correo')?.errors?.['required']"
                            >
                                El correo electrónico es requerido.
                            </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="submitted && doctorForm.get('correo')?.errors?.['email']"
                             >
                                 Ingrese un correo electrónico válido.
                             </small>
                             <small 
                                 class="text-red-500" 
                                 *ngIf="doctorForm.get('correo')?.errors?.['unique']"
                             >
                                 Este correo electrónico ya está registrado.
                             </small>
                        </div>
                    </div>

                    <!-- Sección de horarios -->
                    <div class="border-t pt-4 mt-4">
                        <div class="flex justify-between items-center mb-4">
                            <h6 class="text-lg font-bold">Horarios Disponibles</h6>
                            <p-button 
                                label="Agregar Horario" 
                                icon="pi pi-plus" 
                                severity="secondary"
                                size="small"
                                (onClick)="addSchedule()"
                            />
                        </div>

                        <div formArrayName="horarios" class="space-y-3">
                            <div 
                                *ngFor="let schedule of horariosArray.controls; let i = index" 
                                [formGroupName]="i"
                                class="border border-surface-200 dark:border-surface-700 rounded-lg p-4"
                            >
                                <div class="grid grid-cols-12 gap-4 items-end">
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">Día de la Semana *</label>
                                        <p-select 
                                            formControlName="diaSemana"
                                            [options]="diasSemana" 
                                            placeholder="Seleccione día"
                                            [class.ng-invalid]="submitted && schedule.get('diaSemana')?.invalid"
                                            fluid
                                            [appendTo]="'body'"
                                            [virtualScroll]="false"
                                            [filter]="true"
                                            filterPlaceholder="Buscar día..."
                                            [showClear]="true"
                                        />
                                    </div>
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">Hora Inicio *</label>
                                        <input 
                                            type="time" 
                                            pInputText 
                                            formControlName="horaInicio"
                                            [class.ng-invalid]="submitted && schedule.get('horaInicio')?.invalid"
                                            fluid 
                                        />
                                    </div>
                                    <div class="col-span-3">
                                        <label class="block font-bold mb-2">Hora Fin *</label>
                                        <input 
                                            type="time" 
                                            pInputText 
                                            formControlName="horaFin"
                                            [class.ng-invalid]="submitted && schedule.get('horaFin')?.invalid"
                                            fluid 
                                        />
                                    </div>
                                    <div class="col-span-2 flex items-center gap-2">
                                        <label class="flex items-center">
                                            <p-checkbox 
                                                formControlName="activo"
                                                [binary]="true"
                                                inputId="activo-{{i}}"
                                            />
                                            <label for="activo-{{i}}" class="ml-2">Activo</label>
                                        </label>
                                    </div>
                                    <div class="col-span-1">
                                        <p-button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            [rounded]="true" 
                                            [outlined]="true"
                                            size="small"
                                            (click)="removeSchedule(i)" 
                                            [disabled]="horariosArray.length === 1"
                                        />
                                    </div>
                                </div>
                            </div>
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
                    (click)="saveDoctor()" 
                />
            </ng-template>
        </p-dialog>

        <!-- Modal para ver detalles del doctor -->
        <p-dialog 
            [(visible)]="doctorDetailsDialog" 
            [style]="{ width: '600px', height: 'auto', maxHeight: '90vh' }" 
            header="Detalles del Doctor" 
            [modal]="true"
            [closable]="true"
            [styleClass]="'doctor-details-dialog'"
            [position]="'bottom'"
            [draggable]="false"
            [resizable]="false"
        >
            <ng-template #content>
                <div class="grid grid-cols-12 gap-4" *ngIf="doctor">
                    <div class="col-span-12">
                        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-lg">
                            <div class="text-center mb-6">
                                <i class="pi pi-user text-8xl text-blue-500 mb-3 block" style="font-size: 5rem;"></i>
                                <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ doctor.nombre }}</h3>
                                <p class="text-lg text-surface-600 dark:text-surface-400">{{ doctor.especialidad }}</p>
                            </div>
                            
                            <div class="grid grid-cols-1 gap-4">
                                <div class="flex items-center">
                                    <i class="pi pi-id-card text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Código</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ doctor.codigo }}</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center">
                                    <i class="pi pi-phone text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Teléfono</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ doctor.telefono }}</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center">
                                    <i class="pi pi-envelope text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Correo Electrónico</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ doctor.correo }}</span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center" *ngIf="doctor.fechaRegistro">
                                    <i class="pi pi-clock text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Fecha de Registro</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ doctor.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</span>
                                    </div>
                                </div>

                                <!-- Horarios disponibles -->
                                <div class="border-t pt-4 mt-4">
                                    <h5 class="font-bold text-lg text-surface-900 dark:text-surface-0 mb-3">Horarios Disponibles</h5>
                                    <div class="space-y-2" *ngIf="doctor.horarios && doctor.horarios.length > 0">
                                        <div 
                                            *ngFor="let horario of doctor.horarios" 
                                            class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg"
                                        >
                                            <div class="flex items-center">
                                                <i class="pi pi-calendar text-surface-600 dark:text-surface-400 mr-2"></i>
                                                <span class="font-medium text-surface-900 dark:text-surface-0">{{ horario.diaSemana }}</span>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <span class="text-surface-700 dark:text-surface-300">
                                                    {{ horario.horaInicio }} - {{ horario.horaFin }}
                                                </span>
                                                <p-tag 
                                                    [value]="horario.activo ? 'Activo' : 'Inactivo'" 
                                                    [severity]="horario.activo ? 'success' : 'danger'"
                                                    [rounded]="true"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div *ngIf="!doctor.horarios || doctor.horarios.length === 0" class="text-center py-4">
                                        <i class="pi pi-info-circle text-surface-400 text-2xl mb-2 block"></i>
                                        <p class="text-surface-600 dark:text-surface-400">No hay horarios configurados</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-between w-full">
                    <p-button 
                        label="Editar" 
                        icon="pi pi-pencil" 
                        severity="secondary"
                        (click)="editDoctorFromDetails()" 
                    />
                    <p-button 
                        label="Cerrar" 
                        icon="pi pi-times" 
                        text 
                        (click)="hideDetailsDialog()" 
                    />
                </div>
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    styles: [`
        :host ::ng-deep .doctor-details-dialog .p-dialog-content {
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        :host ::ng-deep .doctor-details-dialog .p-dialog-content > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }
        
        :host ::ng-deep .doctor-details-dialog .p-dialog-content .bg-surface-0,
        :host ::ng-deep .doctor-details-dialog .p-dialog-content .dark\\:bg-surface-900 {
            margin-bottom: 0;
        }
        
        :host ::ng-deep .doctor-details-dialog .p-dialog-footer {
            margin-top: 0;
            padding-top: 1rem;
        }
    `],
    providers: [MessageService, DoctorService, ConfirmationService]
})
export class DoctorComponent implements OnInit {
    doctorDialog: boolean = false;
    isEditMode: boolean = false;
    doctorDetailsDialog: boolean = false;
    doctors = signal<Doctor[]>([]);
    doctor!: Doctor;
    selectedDoctors!: Doctor[] | null;
    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];
    cols!: Column[];

    doctorForm: FormGroup;
    especialidades: string[] = [];
    diasSemana: string[] = [];

    constructor(
        private doctorService: DoctorService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        this.doctorForm = this.fb.group({
            nombre: ['', 
                [Validators.required, Validators.minLength(2)], 
                [createUniqueValidator(this.doctorService.isNombreUnique.bind(this.doctorService))]
            ],
            codigo: ['', 
                [Validators.required, Validators.pattern(/^UDR\d{3}$/)], 
                [createUniqueValidator(this.doctorService.isCodigoUnique.bind(this.doctorService))]
            ],
            especialidad: ['', Validators.required],
            telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
            correo: ['', 
                [Validators.required, Validators.email], 
                [createUniqueValidator(this.doctorService.isCorreoUnique.bind(this.doctorService))]
            ],
            horarios: this.fb.array([])
        });
    }

    get horariosArray(): FormArray {
        return this.doctorForm.get('horarios') as FormArray;
    }

    ngOnInit() {
        this.loadDoctors();
        this.loadEspecialidades();
        this.loadDiasSemana();
        this.setupTableColumns();
        this.setupCodigoFormatting();
    }

    loadDoctors() {
        this.doctorService.getDoctors().then((data) => {
            this.doctors.set(data);
        });
    }

    loadEspecialidades() {
        this.doctorService.getEspecialidades().then((data) => {
            this.especialidades = data;
        });
    }

    loadDiasSemana() {
        this.doctorService.getDiasSemana().then((data) => {
            this.diasSemana = data;
        });
    }

    setupTableColumns() {
        this.cols = [
            { field: 'nombre', header: 'Nombre' },
            { field: 'codigo', header: 'Código' },
            { field: 'especialidad', header: 'Especialidad' },
            { field: 'telefono', header: 'Teléfono' },
            { field: 'correo', header: 'Correo Electrónico' }
        ];

        this.exportColumns = this.cols.map((col) => ({ 
            title: col.header, 
            dataKey: col.field 
        }));
    }

    setupCodigoFormatting() {
        this.doctorForm.get('codigo')?.valueChanges.subscribe(value => {
            if (value && typeof value === 'string') {
                const formattedValue = this.formatCodigo(value);
                const control = this.doctorForm.get('codigo');
                if (control && formattedValue !== value) {
                    control.setValue(formattedValue, { emitEvent: false });
                }
            }
        });
    }

    formatCodigo(value: string): string {
        // Convertir a mayúsculas y remover caracteres no válidos
        let formatted = value.toUpperCase().replace(/[^UDR0-9]/g, '');
        
        // Si no empieza con UDR, agregarlo
        if (!formatted.startsWith('UDR')) {
            if (formatted.startsWith('U')) {
                formatted = 'U' + formatted.substring(1);
            } else if (formatted.startsWith('UD')) {
                formatted = 'UD' + formatted.substring(2);
            } else {
                formatted = 'UDR' + formatted;
            }
        }
        
        // Limitar a UDR + máximo 3 números
        const match = formatted.match(/^(UDR)(\d{0,3})/);
        if (match) {
            return match[0];
        }
        
        return formatted;
    }

    addSchedule() {
        const scheduleForm = this.fb.group({
            diaSemana: ['', Validators.required],
            horaInicio: ['', Validators.required],
            horaFin: ['', Validators.required],
            activo: [true]
        });
        this.horariosArray.push(scheduleForm);
    }

    removeSchedule(index: number) {
        if (this.horariosArray.length > 1) {
            this.horariosArray.removeAt(index);
        }
    }

    updateValidatorsForNew() {
        this.doctorForm.get('nombre')?.setAsyncValidators([
            createUniqueValidator(this.doctorService.isNombreUnique.bind(this.doctorService))
        ]);
        this.doctorForm.get('codigo')?.setAsyncValidators([
            createUniqueValidator(this.doctorService.isCodigoUnique.bind(this.doctorService))
        ]);
        this.doctorForm.get('correo')?.setAsyncValidators([
            createUniqueValidator(this.doctorService.isCorreoUnique.bind(this.doctorService))
        ]);
    }

    updateValidatorsForEdit(excludeId?: string) {
        this.doctorForm.get('nombre')?.setAsyncValidators([
            createUniqueValidator(this.doctorService.isNombreUnique.bind(this.doctorService), excludeId)
        ]);
        this.doctorForm.get('codigo')?.setAsyncValidators([
            createUniqueValidator(this.doctorService.isCodigoUnique.bind(this.doctorService), excludeId)
        ]);
        this.doctorForm.get('correo')?.setAsyncValidators([
            createUniqueValidator(this.doctorService.isCorreoUnique.bind(this.doctorService), excludeId)
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
        this.doctor = {
            nombre: '',
            codigo: '',
            especialidad: '',
            telefono: '',
            correo: '',
            horarios: []
        };
        this.submitted = false;
        this.updateValidatorsForNew();
        this.doctorForm.reset();
        
        // Generar código automático
        const autoCode = this.doctorService.generateCodigoUDR();
        this.doctorForm.patchValue({ codigo: autoCode });
        
        // Limpiar horarios y agregar uno por defecto
        while (this.horariosArray.length !== 0) {
            this.horariosArray.removeAt(0);
        }
        this.addSchedule();
        
        this.doctorDialog = true;
    }

    editDoctor(doctor: Doctor) {
        this.isEditMode = true;
        this.doctor = { ...doctor };
        this.submitted = false;
        
        this.updateValidatorsForEdit(doctor.id);
        
        // Configurar horarios
        while (this.horariosArray.length !== 0) {
            this.horariosArray.removeAt(0);
        }
        
        if (doctor.horarios && doctor.horarios.length > 0) {
            doctor.horarios.forEach(horario => {
                const scheduleForm = this.fb.group({
                    diaSemana: [horario.diaSemana, Validators.required],
                    horaInicio: [horario.horaInicio, Validators.required],
                    horaFin: [horario.horaFin, Validators.required],
                    activo: [horario.activo]
                });
                this.horariosArray.push(scheduleForm);
            });
        } else {
            this.addSchedule();
        }
        
        this.doctorForm.patchValue({
            nombre: doctor.nombre,
            codigo: doctor.codigo,
            especialidad: doctor.especialidad,
            telefono: doctor.telefono,
            correo: doctor.correo
        });
        
        this.doctorDialog = true;
    }

    deleteSelectedDoctors() {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar los doctores seleccionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.doctors.set(this.doctors().filter((val) => !this.selectedDoctors?.includes(val)));
                this.selectedDoctors = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Doctores eliminados correctamente',
                    life: 1500
                });
            }
        });
    }

    hideDialog() {
        this.doctorDialog = false;
        this.submitted = false;
        this.doctorForm.reset();
    }

    showDoctorDetails(doctor: Doctor) {
        this.doctor = { ...doctor };
        this.doctorDetailsDialog = true;
    }

    hideDetailsDialog() {
        this.doctorDetailsDialog = false;
        this.doctor = {} as Doctor;
    }

    editDoctorFromDetails() {
        this.doctorDetailsDialog = false;
        this.editDoctor(this.doctor);
    }

    deleteDoctor(doctor: Doctor) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar al doctor ' + doctor.nombre + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.doctorService.deleteDoctor(doctor.id!).then((success) => {
                    if (success) {
                        this.doctors.set(this.doctors().filter((val) => val.id !== doctor.id));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Doctor eliminado correctamente',
                            life: 1500
                        });
                    }
                });
            }
        });
    }

    saveDoctor() {
        this.submitted = true;

        Object.keys(this.doctorForm.controls).forEach(key => {
            if (key !== 'horarios') {
                this.doctorForm.get(key)?.markAsTouched();
            }
        });

        // Marcar como tocados los controles de horarios
        this.horariosArray.controls.forEach(control => {
            Object.keys(control.value).forEach(key => {
                control.get(key)?.markAsTouched();
            });
        });

        if (this.doctorForm.valid) {
            const formValue = this.doctorForm.value;
            const horarios: DoctorSchedule[] = formValue.horarios.map((h: any, index: number) => ({
                id: this.isEditMode && this.doctor.horarios && this.doctor.horarios[index] 
                    ? this.doctor.horarios[index].id 
                    : this.doctorService.generateScheduleId(),
                diaSemana: h.diaSemana,
                horaInicio: h.horaInicio,
                horaFin: h.horaFin,
                activo: h.activo || false
            }));

            const doctorData: Doctor = {
                ...formValue,
                id: this.isEditMode ? this.doctor.id : undefined,
                horarios: horarios
            };

            if (this.isEditMode) {
                this.doctorService.updateDoctor(doctorData).then((updatedDoctor) => {
                    const index = this.doctors().findIndex(d => d.id === updatedDoctor.id);
                    if (index !== -1) {
                        const updatedDoctors = [...this.doctors()];
                        updatedDoctors[index] = updatedDoctor;
                        this.doctors.set(updatedDoctors);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Doctor actualizado correctamente',
                        life: 1500
                    });
                    this.hideDialog();
                });
            } else {
                this.doctorService.createDoctor(doctorData).then((newDoctor) => {
                    this.doctors.set([...this.doctors(), newDoctor]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Doctor creado correctamente',
                        life: 1500
                    });
                    this.hideDialog();
                });
            }
        } else {
            const hasUniqueErrors = Object.keys(this.doctorForm.controls).some(key => {
                const control = this.doctorForm.get(key);
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
