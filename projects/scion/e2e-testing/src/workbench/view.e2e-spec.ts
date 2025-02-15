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
import {ViewPagePO} from './page-object/view-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {consumeBrowserLog} from '../helper/testing.util';
import {logging} from 'protractor';
import Level = logging.Level;

describe('Workbench View', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  it('should allow updating the view tab title', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await ViewPagePO.openInNewTab();

    await viewPagePO.enterTitle('TITLE');
    await expect(await viewPagePO.viewTabPO.getTitle()).toEqual('TITLE');

    await viewPagePO.enterTitle('title');
    await expect(await viewPagePO.viewTabPO.getTitle()).toEqual('title');
  });

  it('should allow updating the view tab heading', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await ViewPagePO.openInNewTab();

    await viewPagePO.enterHeading('HEADING');
    await expect(await viewPagePO.viewTabPO.getHeading()).toEqual('HEADING');

    await viewPagePO.enterHeading('heading');
    await expect(await viewPagePO.viewTabPO.getHeading()).toEqual('heading');
  });

  it('should allow to mark the view dirty', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await ViewPagePO.openInNewTab();

    // View tab expected to be pristine for new views
    await expect(await viewPagePO.viewTabPO.isDirty()).toBe(false);

    // Mark the view dirty
    await viewPagePO.checkDirty(true);
    await expect(await viewPagePO.viewTabPO.isDirty()).toBe(true);

    // Mark the view pristine
    await viewPagePO.checkDirty(false);
    await expect(await viewPagePO.viewTabPO.isDirty()).toBe(false);
  });

  it('should unset the dirty state when navigating to a different route', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();
    const viewPagePO = await ViewPagePO.openInNewTab();
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Mark the view dirty
    await viewPagePO.checkDirty(true);
    await expect(await viewTabPO.isDirty()).toBe(true);

    // Navigate to a different route in the same view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-router');
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(viewId);
    await routerPagePO.clickNavigateViaRouter();

    // Expect the view to be pristine
    await expect(await viewTabPO.isDirty()).toBe(false);
  });

  it('should not unset the dirty state when the navigation resolves to the same route, e.g., when updating matrix params or route params', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();
    const viewPagePO = await ViewPagePO.openInNewTab();
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Mark the view dirty
    await viewPagePO.checkDirty(true);
    await expect(await viewTabPO.isDirty()).toBe(true);

    // Update matrix params (does not affect routing)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(viewId);
    await routerPagePO.enterMatrixParams({matrixParam: 'value'});
    await routerPagePO.clickNavigateViaRouter();

    // Expect the view to still be dirty
    await expect(await viewTabPO.isDirty()).toBe(true);

    // Verify matrix params have changed
    await viewTabPO.activate();
    await expect(await viewPagePO.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  it('should not unset the title when the navigation resolves to the same route, e.g., when updating matrix params or route params', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();
    const viewPagePO = await ViewPagePO.openInNewTab();
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Set the title
    await viewPagePO.enterTitle('TITLE');
    await expect(await viewTabPO.getTitle()).toEqual('TITLE');

    // Update matrix params (does not affect routing)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(viewId);
    await routerPagePO.enterMatrixParams({matrixParam: 'value'});
    await routerPagePO.clickNavigateViaRouter();

    // Expect the title has not changed
    await expect(await viewTabPO.getTitle()).toEqual('TITLE');
    // Verify matrix params have changed
    await viewTabPO.activate();
    await expect(await viewPagePO.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  it('should not unset the heading when the navigation resolves to the same route, e.g., when updating matrix params or route params', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();
    const viewPagePO = await ViewPagePO.openInNewTab();
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Set the heading
    await viewPagePO.enterHeading('HEADING');
    await expect(await viewTabPO.getHeading()).toEqual('HEADING');

    // Update matrix params (does not affect routing)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(viewId);
    await routerPagePO.enterMatrixParams({matrixParam: 'value'});
    await routerPagePO.clickNavigateViaRouter();

    // Expect the heading has not changed
    await expect(await viewTabPO.getHeading()).toEqual('HEADING');

    // Verify matrix params have changed
    await viewTabPO.activate();
    await expect(await viewPagePO.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  it('should remove the closing handle from the view tab', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await ViewPagePO.openInNewTab();

    // View tab expected to be pristine for new views
    await expect(await viewPagePO.viewTabPO.isClosable()).toBe(true);

    // Prevent the view from being closed
    await viewPagePO.checkClosable(false);
    await expect(await viewPagePO.viewTabPO.isClosable()).toBe(false);

    // Mark the view closable
    await viewPagePO.checkClosable(true);
    await expect(await viewPagePO.viewTabPO.isClosable()).toBe(true);
  });

  it('should emit when activating or deactivating a viewtab', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to testee-1 view
    const testee1ViewPagePO = await ViewPagePO.openInNewTab();
    const testee1ComponentInstanceId = await testee1ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));

    // navigate to testee-2 view
    const testee2ViewPagePO = await ViewPagePO.openInNewTab();
    const testee2ComponentInstanceId = await testee2ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]));

    // activate testee-1 view
    await testee1ViewPagePO.viewTabPO.activate();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));

    // activate testee-2 view
    await testee2ViewPagePO.viewTabPO.activate();
    await testee2ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]));

    // navigate to testee-3 view
    const testee3ViewPagePO = await ViewPagePO.openInNewTab();
    const testee3ComponentInstanceId = await testee3ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]));

    // activate testee-1 view
    await testee1ViewPagePO.viewTabPO.activate();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));
  });

  it('should allow to register view actions', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO1 = await ViewPagePO.openInNewTab();
    const viewTabPO1 = viewPagePO1.viewTabPO;
    await viewPagePO1.addViewAction({icon: 'search', cssClass: 'view-1-search-action'});

    const viewPagePO2 = await ViewPagePO.openInNewTab();
    const viewTabPO2 = viewPagePO2.viewTabPO;
    await viewPagePO2.addViewAction({icon: 'settings', cssClass: 'view-2-settings-action'});
    await viewPagePO2.addViewAction({icon: 'launch', cssClass: 'view-2-launch-action'});

    await viewTabPO1.activate();
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-1-search-action'}).isPresent()).toBe(true);
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-2-settings-action'}).isPresent()).toBe(false);
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-2-launch-action'}).isPresent()).toBe(false);

    await viewTabPO2.activate();
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-1-search-action'}).isPresent()).toBe(false);
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-2-settings-action'}).isPresent()).toBe(true);
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-2-launch-action'}).isPresent()).toBe(true);

    await appPO.closeAllViewTabs();
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-1-search-action'}).isPresent()).toBe(false);
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-2-settings-action'}).isPresent()).toBe(false);
    await expect(await appPO.findViewPartAction({buttonCssClass: 'view-2-launch-action'}).isPresent()).toBe(false);
  });

  it('should allow to close the view', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await ViewPagePO.openInNewTab();
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await viewPagePO.viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.viewPO.isPresent()).toBe(true);

    await viewPagePO.clickClose();

    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await viewPagePO.viewTabPO.isPresent()).toBe(false);
    await expect(await viewPagePO.viewPO.isPresent()).toBe(false);
  });
});
