import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Paciente } from './paciente/paciente';
import { DoctorComponent } from './doctor/doctor';
import { Cita } from './cita/cita';
import { Ingreso } from './ingreso/ingreso';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'pacientes', component: Paciente },
    { path: 'doctores', component: DoctorComponent },
    { path: 'citas', component: Cita },
    { path: 'empty', component: Empty },
    { path: 'ingresos', component: Ingreso},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
