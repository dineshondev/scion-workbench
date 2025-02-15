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
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {expectPromise} from '../helper/expect-promise-matcher';
import {assertPageToDisplay, consumeBrowserLog} from '../helper/testing.util';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';
import {WebdriverExecutionContexts} from '../helper/webdriver-execution-context';
import {$, logging} from 'protractor';
import {RouterOutletPO} from './page-object/router-outlet.po';
import Level = logging.Level;

export declare type HTMLElement = any;

describe('Popup Router', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should navigate to own public popups', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isDisplayed()).toBe(true);
  });

  it('should navigate to own private popups', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isDisplayed()).toBe(true);
  });

  it('should not navigate to private popups of other apps', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as private popup in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // register popup intention in app 1
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await expectPromise(popupOpenerPagePO.clickOpen()).toReject(/NullProviderError/);

    // expect popup not to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isPresent()).toBe(false);
  });

  it('should navigate to public popups of other apps', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // register popup intention in app 1
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isDisplayed()).toBe(true);
  });

  it('should not navigate to public popups of other apps if missing the intention', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await expectPromise(popupOpenerPagePO.clickOpen()).toReject(/NotQualifiedError/);

    // expect popup not to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isPresent()).toBe(false);
  });

  it('should allow opening multiple popups simultaneously in different views', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'popup',
        cssClass: 'testee-1',
      },
    });
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'popup',
        cssClass: 'testee-2',
      },
    });
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-3'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee-3',
      },
    });

    // open the first popup for app-1
    const popupOpenerApp1aPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerApp1aPagePO.enterQualifier({component: 'testee-1'});
    await popupOpenerApp1aPagePO.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp1aPagePO.clickOpen();

    // expect popup to display
    const popupPageApp1aPO = new PopupPagePO('testee-1');
    await expect(await popupPageApp1aPO.isDisplayed()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp1aPO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');

    // open the second popup for app-1
    const popupOpenerApp1bPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerApp1bPagePO.enterQualifier({component: 'testee-2'});
    await popupOpenerApp1bPagePO.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp1bPagePO.clickOpen();

    // expect popup to display
    const popupPageApp1bPO = new PopupPagePO('testee-2');
    await expect(await popupPageApp1bPO.isDisplayed()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp1bPO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');

    // open the popup for app-2
    const popupOpenerApp2PagePO = await PopupOpenerPagePO.openInNewTab('app2');
    await popupOpenerApp2PagePO.enterQualifier({component: 'testee-3'});
    await popupOpenerApp2PagePO.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp2PagePO.clickOpen();

    // expect popup to display
    const popupPageApp2PO = new PopupPagePO('testee-3');
    await expect(await popupPageApp2PO.isDisplayed()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp2PO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app2');
  });

  it('should throw when the requested popup has no microfrontend path declared', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'undefined'},
      properties: {
        path: '<undefined>',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'null'},
      properties: {
        path: '<null>',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '<empty>',
        cssClass: 'testee',
      },
    });

    // open the popup with `undefined` as path
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee', path: 'undefined'});
    await expectPromise(popupOpenerPagePO.clickOpen()).toReject(/PopupProviderError/);

    // expect popup not to display
    await expect(await new PopupPagePO('testee').isPresent()).toBe(false);

    // open the popup with `null` as path
    await popupOpenerPagePO.enterQualifier({component: 'testee', path: 'null'});
    await expectPromise(popupOpenerPagePO.clickOpen()).toReject(/PopupProviderError/);

    // expect popup not to display
    await expect(await new PopupPagePO('testee').isPresent()).toBe(false);

    // open the popup with `empty` as path
    await popupOpenerPagePO.enterQualifier({component: 'testee', path: 'empty'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    await expect(await new PopupPagePO('testee').isPresent()).toBe(false);

    const popupId = await new RouterOutletPO().resolveRouterOutletName('e2e-popup', 'testee');
    await WebdriverExecutionContexts.switchToIframe(popupId);
    await assertPageToDisplay($('app-root'));
  });

  it('should not throw if another app provides an equivalent but private popup capability', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerIntentionPage2PO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPage2PO.registerIntention({
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isDisplayed()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPagePO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');
  });

  it('should not throw if another app provides an equivalent public popup capability if not declared an intention', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isDisplayed()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPagePO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');
  });

  it('should log warning if another app provides an equivalent public popup capability', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerIntentionPage2PO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPage2PO.registerIntention({
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect first popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isPresent()).toBe(true);

    // expect warning to be logged for the second popup
    await expect((await consumeBrowserLog(Level.WARNING, /Ignoring popup intent/))).not.toEqual([]);
  });

  it('should log warning if multiple popup providers match the qualifier', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect first popup to display
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.isPresent()).toBe(true);

    // expect warning to be logged for the second popup
    await expect((await consumeBrowserLog(Level.WARNING, /Ignoring popup intent/))).not.toEqual([]);
  });

  it('should allow closing and re-opening a popup', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup for the first time
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO1 = new PopupPagePO('testee');
    await expect(await popupPagePO1.isDisplayed()).toBe(true);

    // close the popup
    await popupPagePO1.clickClose();
    await expect(await popupPagePO1.isDisplayed()).toBe(false);

    // open the popup for the second time
    await popupOpenerPagePO.clickOpen();
    const popupPagePO2 = new PopupPagePO('testee');
    await expect(await popupPagePO2.isDisplayed()).toBe(true);
  });
});
