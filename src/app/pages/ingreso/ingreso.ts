import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { ButtonModule, Button } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule, Toast } from 'primeng/toast';
import { ToolbarModule, Toolbar } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule, Dialog } from 'primeng/dialog';
import { InputIconModule, InputIcon } from 'primeng/inputicon';
import { IconFieldModule, IconField } from 'primeng/iconfield';
import { ConfirmDialogModule, ConfirmDialog } from 'primeng/confirmdialog';
import { Patient, PatientService } from '../service/patient.service';
import { Observable, map } from 'rxjs';
import { Income, IncomeService } from '../service/income.service';

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
  selector: 'app-ingreso',
  imports: [CommonModule,
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
        ConfirmDialogModule],
  template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button
                    label="Nuevo Ingreso"
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
                    (onClick)="deleteSelectedIncomes()"
                    [disabled]="!selectedIncomes || !selectedIncomes.length"
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
            [value]="incomes()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['nombreCompleto', 'cedula', 'correoElectronico', 'telefono']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedIncomes"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pacientes"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h5 class="m-0 text-center lg:text-left">Gestión de Ingresos</h5>
                    <p-iconfield class="w-full lg:w-auto">
                        <p-inputicon styleClass="pi pi-search" />
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dt, $event)"
                            placeholder="Buscar por nombre, cédula o correo..."
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
                    <th pSortableColumn="paciente" style="min-width: 12rem">
                        Paciente
                        <p-sortIcon field="paciente" />
                    </th>
                    <th pSortableColumn="servicio" style="min-width: 12rem">
                        Servicio
                        <p-sortIcon field="servicio" />
                    </th>
                    <th pSortableColumn="amount" style="min-width: 12rem">
                        Monto
                        <p-sortIcon field="amount" />
                    </th>
                    <th pSortableColumn="paymentMethod" style="min-width: 12rem">
                        Método de Pago
                        <p-sortIcon field="paymentMethod" />
                    </th>
                    <th pSortableColumn="paymentDate" style="min-width: 10rem">
                        Fecha de Pago
                        <p-sortIcon field="paymentDate" />
                    </th>
                    <th pSortableColumn="paymentRecordedBy" style="min-width: 10rem">
                        Registrado Por
                        <p-sortIcon field="paymentRecordedBy" />
                    </th>
                    <th style="min-width: 12rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-income>
                <tr (click)="showIncomeDetails(income)" style="cursor: pointer;">
                    <td style="width: 3rem" (click)="$event.stopPropagation()">
                        <p-tableCheckbox [value]="income" />
                    </td>
                    <td style="min-width: 12rem">{{ income.patient }}</td>
                    <td style="min-width: 12rem">{{ income.service }}</td>
                    <td style="min-width: 12rem">{{ income.amount | currency: 'DOP '}}</td>
                    <td style="min-width: 12rem">{{ income.paymentMethod }}</td>
                    <td style="min-width: 10rem">{{ income.paymentDate | date:'dd/MM/yyyy HH:mm'}}</td>
                    <td style="min-width: 10rem">{{ income.paymentRecordedBy }}</td>
                    <td (click)="$event.stopPropagation()">
                        <p-button
                            icon="pi pi-pencil"
                            class="mr-2"
                            [rounded]="true"
                            [outlined]="true"
                            (click)="editIncome(income)"
                        />
                        <p-button
                            icon="pi pi-trash"
                            severity="danger"
                            [rounded]="true"
                            [outlined]="true"
                            (click)="deleteIncome(income)"
                        />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog
            [(visible)]="incomeDialog"
            [style]="{ width: '600px' }"
            [header]="isEditMode ? 'Editar Ingreso' : 'Nuevo Ingreso'"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [styleClass]="'income-form-dialog'"
        >
            <ng-template #content>
                <form [formGroup]="incomeForm" class="flex flex-col gap-4">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label for="patient" class="block font-bold mb-2">Paciente *</label>
                            <input
                                type="text"
                                pInputText
                                id="patient"
                                formControlName="patient"
                                placeholder="Ingrese el nombre del paciente"
                                [class.ng-invalid]="submitted && incomeForm.get('patient')?.invalid"
                                fluid
                            />
                             <small
                                 class="text-red-500"
                                 *ngIf="submitted && incomeForm.get('patient')?.errors?.['required']"
                             >
                                 El nombre del paciente es requerido.
                             </small>
                             <small
                                 class="text-red-500"
                                 *ngIf="incomeForm.get('patient')?.errors?.['unique']"
                             >
                                 Este nombre del paciente ya está registrado.
                             </small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label for="service" class="block font-bold mb-2">Servicio *</label>
                            <input
                                type="text"
                                pInputText
                                id="service"
                                formControlName="service"
                                placeholder="Ingrese el servicio"
                                [class.ng-invalid]="submitted && incomeForm.get('service')?.invalid"
                                fluid
                            />
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('service')?.errors?.['required']"
                            >
                                El servicio es requerido.
                            </small>
                             <small
                                 class="text-red-500"
                                 *ngIf="incomeForm.get('service')?.errors?.['unique']"
                             >
                                 Este servicio ya está registrado.
                             </small>
                        </div>
                        <div class="col-span-6">
                            <label for="amount" class="block font-bold mb-2">Monto *</label>
                            <input
                                type="number"
                                pInputText
                                id="amount"
                                formControlName="amount"
                                placeholder="Ingrese el monto"
                                [class.ng-invalid]="submitted && incomeForm.get('amount')?.invalid"
                                fluid
                            />
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('amount')?.errors?.['required']"
                            >
                                El monto es requerido.
                            </small>
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('amount')?.errors?.['min']"
                            >
                                El monto debe ser mayor que 0.
                            </small>
                        </div>
                        <div class="col-span-6">
                            <label for="paymentMethod" class="block font-bold mb-2">Metodo de Pago *</label>
                            <input
                                type="text"
                                pInputText
                                id="paymentMethod"
                                formControlName="paymentMethod"
                                placeholder="Ingrese el método de pago"
                                [class.ng-invalid]="submitted && incomeForm.get('paymentMethod')?.invalid"
                                fluid
                            />
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('paymentMethod')?.errors?.['required']"
                            >
                                El método de pago es requerido.
                            </small>
                        </div>
                        <div class="col-span-6">
                            <label for="paymentDate" class="block font-bold mb-2">Fecha de Pago *</label>
                            <input
                                type="date"
                                pInputText
                                id="paymentDate"
                                formControlName="paymentDate"
                                [class.ng-invalid]="submitted && incomeForm.get('paymentDate')?.invalid"
                                fluid
                            />
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('paymentDate')?.errors?.['required']"
                            >
                                La fecha de pago es requerida.
                            </small>
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('paymentDate')?.errors?.['min']"
                            >
                                La fecha de pago debe ser posterior a hoy.
                            </small>
                        </div>
                        <div class="col-span-6">
                            <label for="paymentRecordedBy" class="block font-bold mb-2">Registrado por *</label>
                            <input
                                type="text"
                                pInputText
                                id="paymentRecordedBy"
                                formControlName="paymentRecordedBy"
                                placeholder="Personal que registró el pago"
                                [class.ng-invalid]="submitted && incomeForm.get('paymentRecordedBy')?.invalid"
                                fluid
                            />
                            <small
                                class="text-red-500"
                                *ngIf="submitted && incomeForm.get('paymentRecordedBy')?.errors?.['required']"
                            >
                                El registrador es requerido.
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

        <p-dialog
            [(visible)]="incomeDetailsDialog"
            [style]="{ width: '500px', height: 'auto', maxHeight: '90vh' }"
            header="Detalles del Ingreso"
            [modal]="true"
            [closable]="true"
            [styleClass]="'income-details-dialog'"
            [position]="'bottom'"
            [draggable]="false"
            [resizable]="false"
        >
            <ng-template #content>
                <div class="grid grid-cols-12 gap-4" *ngIf="income">
                    <div class="col-span-12">
                        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-lg">
                            <div class="text-center mb-6">
                                    <i class="pi pi-user text-8xl text-blue-500 mb-3 block" style="font-size: 5rem;"></i>
                                <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ income.patient }}</h3>
                            </div>

                            <div class="grid grid-cols-1 gap-4">
                                <div class="flex items-center">
                                    <i class="pi pi-id-card text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Servicio</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ income.service }}</span>
                                    </div>
                                </div>

                                <div class="flex items-center">
                                    <i class="pi pi-users text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Metodo de Pago</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ income.paymentMethod }}</span>
                                    </div>
                                </div>

                                <div class="flex items-center">
                                    <i class="pi pi-id-card text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Cantidad</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ income.amount }}</span>
                                    </div>
                                </div>

                                <div class="flex items-center" *ngIf="income.paymentDate">
                                    <i class="pi pi-clock text-surface-600 dark:text-surface-400 mr-3"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Fecha de Pago</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ income.paymentDate | date:'dd/MM/yyyy HH:mm' }}</span>
                                    </div>
                                </div>

                                 <div class="flex items-start">
                                    <i class="pi pi-map-marker text-surface-600 dark:text-surface-400 mr-3 mt-2"></i>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Registrado por</span>
                                        <span class="text-surface-700 dark:text-surface-300">{{ income.paymentRecordedBy }}</span>
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
                        (click)="editIncomeFromDetails()"
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
    styles:[ `
        :host ::ng-deep .patient-details-dialog .p-dialog-content {
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        :host ::ng-deep .patient-details-dialog .p-dialog-content > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }

        :host ::ng-deep .patient-details-dialog .p-dialog-content .bg-surface-0,
        :host ::ng-deep .patient-details-dialog .p-dialog-content .dark\\:bg-surface-900 {
            margin-bottom: 0;
        }

        :host ::ng-deep .patient-details-dialog .p-dialog-footer {
            margin-top: 0;
            padding-top: 1rem;
        }
    `],
    providers: [MessageService, ConfirmationService, IncomeService]
})
export class Ingreso {
    incomeDialog: boolean = false;
    isEditMode: boolean = false;
    incomeDetailsDialog: boolean = false;
    incomes = signal<Income[]>([]);
    income!: Income;
    selectedIncomes!: Income[] | null;
    submitted: boolean = false;
    maxDate: Date = new Date();

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];
    cols!: Column[];

    incomeForm: FormGroup;

    generoOptions = [
        { label: 'Masculino', value: 'Masculino' },
        { label: 'Femenino', value: 'Femenino' },
        { label: 'Otro', value: 'Otro' }
    ];

    constructor(
        private incomeService: IncomeService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        this.incomeForm = this.fb.group({
            patient: ['',
                [Validators.required, Validators.minLength(2)],
                [createUniqueValidator(this.incomeService.isNombreCompletoUnique.bind(this.incomeService))]
            ],
            service: ['', Validators.required],
            amount: [0, [Validators.required, Validators.min(0)]],
            paymentMethod: ['', Validators.required],
            paymentDate: ['', Validators.required],
            paymentRecordedBy: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadIncomes();
        this.setupTableColumns();
        // this.setupCedulaFormatting();
    }

    loadIncomes() {
        this.incomeService.getIncomes().then((data) => {
            this.incomes.set(data);
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

    updateValidatorsForNew() {
        // Para nuevos ingresos, no excluir ningún ID
        this.incomeForm.get('patient')?.setAsyncValidators([
            createUniqueValidator(this.incomeService.isNombreCompletoUnique.bind(this.incomeService))
        ]);
    }

    updateValidatorsForEdit(excludeId?: string) {
        // Para edición, excluir el ID del ingreso actual
        this.incomeForm.get('nombreCompleto')?.setAsyncValidators([
            createUniqueValidator(this.incomeService.isNombreCompletoUnique.bind(this.incomeService), excludeId)
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
        this.income = {
            patient: '',
            service: '',
            amount: 0,
            paymentMethod: '',
            paymentDate: new Date(),
            paymentRecordedBy: ''
        };
        this.submitted = false;
        this.updateValidatorsForNew();
        this.incomeForm.reset();
        this.incomeDialog = true;
    };

    editIncome(income: Income) {
        this.isEditMode = true;
        this.income = { ...income };
        this.submitted = false;

        // Actualizar los validadores para excluir el ID del paciente actual
        this.updateValidatorsForEdit(income.id);

        this.incomeForm.patchValue({
            patient: income.patient,
            service: income.service,
            amount: income.amount,
            paymentMethod: income.paymentMethod,
            paymentDate: new Date(income.paymentDate).toISOString().split('T')[0],
            paymentRecordedBy: income.paymentRecordedBy
        });

        this.incomeDialog = true;
    }

    // deleteSelectedIncomes() {
    //     this.confirmationService.confirm({
    //         message: '¿Está seguro de que desea eliminar los ingresos seleccionados?',
    //     });

    //     this.incomeDialog = true;
    // }

    deleteSelectedIncomes() {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar los pacientes seleccionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.incomes.set(this.incomes().filter((val) => !this.selectedIncomes?.includes(val)));
                this.selectedIncomes = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Ingresos eliminados correctamente',
                    life: 1500
                });
            }
        });
    }

    hideDialog() {
        this.incomeDialog = false;
        this.submitted = false;
        this.incomeForm.reset();
    }

    showIncomeDetails(income: Income) {
        this.income = { ...income };
        this.incomeDetailsDialog = true;
    }

    hideDetailsDialog() {
        this.incomeDetailsDialog = false;
        this.income = {} as Income;
    }

    editIncomeFromDetails() {
        this.incomeDetailsDialog = false;
        this.editIncome(this.income);
    }

    deleteIncome(income: Income) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar el ingreso de ' + income.patient + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.incomeService.deleteIncome(income.id!).then((success) => {
                    if (success) {
                        this.incomes.set(this.incomes().filter((val) => val.id !== income.id));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Ingreso eliminado correctamente',
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
        Object.keys(this.incomeForm.controls).forEach(key => {
            this.incomeForm.get(key)?.markAsTouched();
        });

        if (this.incomeForm.valid) {
            const formValue = this.incomeForm.value;
            const incomeData: Income = {
                ...formValue,
                paymentDate: new Date(formValue.paymentDate),
                id: this.isEditMode ? this.income.id : undefined
            };

            if (this.isEditMode) {
                this.incomeService.updateIncome(incomeData).then((updatedIncome) => {
                    const index = this.incomes().findIndex(i => i.id === updatedIncome.id);
                    if (index !== -1) {
                        const updatedIncomes = [...this.incomes()];
                        updatedIncomes[index] = updatedIncome;
                        this.incomes.set(updatedIncomes);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Ingreso actualizado correctamente',
                        life: 1500
                    });
                    this.hideDialog();
                });
            } else {
                this.incomeService.createIncome(incomeData).then((newIncome) => {
                    this.incomes.set([...this.incomes(), newIncome]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Ingreso creado correctamente',
                        life: 1500
                    });
                    this.hideDialog();
                });
            }
        } else {
            // Verificar si hay errores de unicidad
            const hasUniqueErrors = Object.keys(this.incomeForm.controls).some(key => {
                const control = this.incomeForm.get(key);
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
