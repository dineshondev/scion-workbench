/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { RouterModule } from '@angular/router';

export const ACTIVATOR = new InjectionToken<any[]>('ACTIVATOR');

@NgModule({
  providers: [],
  imports: [
    RouterModule.forChild([]),
  ],
})
export class ActivatorModule {

  constructor(@Optional() @Inject(ACTIVATOR) activators: any[]) {
  }
}