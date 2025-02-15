/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {NgModule, NgModuleFactoryLoader} from '@angular/core';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '@angular/router/testing';
import {Router} from '@angular/router';
import {WorkbenchModule} from '../workbench.module';

describe('WorkbenchModule', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchModule.forRoot(),
        RouterTestingModule.withRoutes([{path: 'lazy-module-forroot', loadChildren: './lazy-forroot.module'}]),
        RouterTestingModule.withRoutes([{path: 'lazy-module-forchild', loadChildren: './lazy-forchild.module'}]),
      ],
    });
  });

  // TODO [Angular 9]:
  // As of Angular 8.0 there is no workaround to configure lazily loaded routes without using `NgModuleFactoryLoader`.
  // See Angular internal tests in `integration.spec.ts` file.
  it('throws an error when forRoot() is used in a lazy context', fakeAsync(inject([Router, NgModuleFactoryLoader], async (router: Router, loader: SpyNgModuleFactoryLoader) => {
    // Use forRoot() in a lazy context (illegal)
    @NgModule({
      imports: [
        WorkbenchModule.forRoot(),
      ],
    })
    class LazyForRootModule {
    }

    // Use forChild() in a lazy context
    @NgModule({
      imports: [
        WorkbenchModule.forChild(),
      ],
    })
    class LazyForChildModule {
    }

    loader.stubbedModules = {
      './lazy-forroot.module': LazyForRootModule,
      './lazy-forchild.module': LazyForChildModule,
    };

    // Navigate to LazyForRootModule
    expect(() => {
      router.navigate(['lazy-module-forroot']).then();
      tick();
    }).toThrowError(/ModuleForRootError/);

    // Navigate to LazyForChildModule
    expect(() => {
      router.navigate(['lazy-module-forchild']).then();
      tick();
    }).not.toThrowError(/ModuleForRootError/);
  })));
});
