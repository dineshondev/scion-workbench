/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {RouterPagePO} from './page-object/router-page.po';
import {consumeBrowserLog} from '../helper/testing.util';
import {logging} from 'protractor';
import Level = logging.Level;

describe('Navigational State', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  describe('ActivatedRoute.data', () => {

    it('should emit `undefined` when not passing state to the view navigation', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPagePO = await RouterPagePO.openInNewTab();
      await routerPagePO.enterPath('test-view');
      await routerPagePO.clickNavigateViaRouter();

      // expect ActivatedRoute.data emitted undefined as state
      const testeeViewId = await appPO.findActiveView().getViewId();
      await expect(await consumeBrowserLog(Level.DEBUG, /ActivatedRouteDataChange/)).toEqual(jasmine.arrayWithExactContents([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state=undefined]`,
      ]));
    });

    it('should emit the state as passed to the view navigation', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPagePO = await RouterPagePO.openInNewTab();
      await routerPagePO.enterPath('test-view');
      await routerPagePO.enterNavigationalState({'some': 'state'});
      await routerPagePO.clickNavigateViaRouter();

      // expect ActivatedRoute.data emitted the passed state
      const testeeViewId = await appPO.findActiveView().getViewId();
      await expect(await consumeBrowserLog(Level.DEBUG, /ActivatedRouteDataChange/)).toEqual(jasmine.arrayWithExactContents([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state={\\"some\\":\\"state\\"}]`,
      ]));
    });

    it('should not restore navigational state after page reload', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPagePO = await RouterPagePO.openInNewTab();
      await routerPagePO.enterPath('test-view');
      await routerPagePO.enterNavigationalState({'some': 'state'});
      await routerPagePO.clickNavigateViaRouter();

      // expect ActivatedRoute.data emitted the passed state
      const testeeViewId = await appPO.findActiveView().getViewId();
      await expect(await consumeBrowserLog(Level.DEBUG, /ActivatedRouteDataChange/)).toEqual(jasmine.arrayWithExactContents([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state={\\"some\\":\\"state\\"}]`,
      ]));

      await appPO.reload();
      // expect ActivatedRoute.data emitting undefined as state after page reload
      await expect(await consumeBrowserLog(Level.DEBUG, /ActivatedRouteDataChange/)).toEqual(jasmine.arrayWithExactContents([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state=undefined]`,
      ]));
    });

    it('should not emit when updating matrix params of a view ', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await RouterPagePO.openInNewTab();

      // navigate to the test view
      await routerPagePO.enterPath('test-view');
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterMatrixParams({'param': 'value 1'});
      await routerPagePO.clickNavigateViaRouter();

      const testeeViewId = await appPO.findActiveView().getViewId();

      // expect ActivatedRoute.data emitted undefined as state
      await expect(await consumeBrowserLog(Level.DEBUG, /ActivatedRouteDataChange/)).toEqual(jasmine.arrayWithExactContents([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state=undefined]`,
      ]));

      // update matrix param
      await routerPagePO.viewTabPO.activate();
      await routerPagePO.enterMatrixParams({'param': 'value 2'});
      await routerPagePO.selectTarget('self');
      await routerPagePO.enterSelfViewId(testeeViewId);
      await routerPagePO.clickNavigateViaRouter();

      // expect ActivatedRoute.data not to emit
      await expect(await consumeBrowserLog(Level.DEBUG, /ActivatedRouteDataChange/)).toEqual([]);
    });
  });
});
