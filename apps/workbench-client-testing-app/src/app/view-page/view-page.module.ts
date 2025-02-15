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
import {RouterModule, Routes} from '@angular/router';
import {SciAccordionModule, SciCheckboxModule, SciFormFieldModule, SciParamsEnterModule, SciPropertyModule} from '@scion/toolkit.internal/widgets';
import {ReactiveFormsModule} from '@angular/forms';
import {ViewPageComponent} from './view-page.component';
import {UtilModule} from '../util/util.module';
import {SciViewportModule} from '@scion/toolkit/viewport';

const routes: Routes = [
  {path: '', component: ViewPageComponent},
  {path: ':segment1/segment2/:segment3', component: ViewPageComponent},
  {path: 'view1', component: ViewPageComponent},
  {path: 'view2', component: ViewPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciPropertyModule,
    SciCheckboxModule,
    SciParamsEnterModule,
    SciAccordionModule,
    SciViewportModule,
    UtilModule,
  ],
  declarations: [
    ViewPageComponent,
  ],
})
export class ViewPageModule {
}
