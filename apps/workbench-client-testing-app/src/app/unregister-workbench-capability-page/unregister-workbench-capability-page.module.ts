/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SciFormFieldModule} from '@scion/toolkit.internal/widgets';
import {ReactiveFormsModule} from '@angular/forms';
import {UnregisterWorkbenchCapabilityPageComponent} from './unregister-workbench-capability-page.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {path: '', component: UnregisterWorkbenchCapabilityPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
  ],
  declarations: [
    UnregisterWorkbenchCapabilityPageComponent,
  ],
})
export class UnregisterWorkbenchCapabilityPageModule {
}
