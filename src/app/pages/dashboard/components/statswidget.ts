import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, RouterModule],
    template: `<button class="col-span-12 lg:col-span-6 xl:col-span-3 bg-transparent border-none p-0 cursor-pointer" [routerLink]="['/pages/pacientes']" routerLinkActive="router-link-active"  type="button">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pacientes Registrados</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl text-left">152</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-address-book text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <div class="text-left">
                <span class="text-primary font-medium">24 </span>
                <span class="text-muted-color">nuevos pacientes</span>
                </div>
            </div>
        </button>
        <button class="col-span-12 lg:col-span-6 xl:col-span-3 bg-transparent border-none p-0 cursor-pointer" [routerLink]="['/pages/ingresos']" routerLinkActive="router-link-active" type="button">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ingresos del Dia</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl text-left">$25,000.50</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <div class="text-left">
                <span class="text-primary font-medium">%52+ </span>
                <span class="text-muted-color">desde ayer</span>
                </div>
            </div>
        </button>
        <button class="col-span-12 lg:col-span-6 xl:col-span-3 bg-transparent border-none p-0 cursor-pointer" [routerLink]="['/pages/historial']" type="button">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pacientes Atendidos Hoy</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl text-left">28441</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <div class="text-left">
                <span class="text-primary font-medium">6 </span>
                <span class="text-muted-color">nuevos pacientes</span>
                </div>
            </div>
        </button>
        <button class="col-span-12 lg:col-span-6 xl:col-span-3 bg-transparent border-none p-0 cursor-pointer" [routerLink]="['/pages/citas']" routerLinkActive="router-link-active"
         type="button">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Citas del Dia</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl text-left">15 Citas</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <div class="text-left">
                <span class="text-primary font-medium">5 </span>
                <span class="text-muted-color">atendidas</span>
                </div>
            </div>
        </button>`
})
export class StatsWidget {

}
