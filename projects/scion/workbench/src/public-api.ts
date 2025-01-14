/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Entry point for all public APIs of this package.
 */
export {WorkbenchModule} from './lib/workbench.module';
export * from './lib/workbench-module-config';
export {WorkbenchTestingModule} from './lib/spec/workbench-testing.module';
export {WorkbenchService} from './lib/workbench.service';
export {WbBeforeDestroy, WorkbenchViewPartAction} from './lib/workbench.model';
export {WbRouterLinkDirective, WbRouterLinkWithHrefDirective} from './lib/routing/wb-router-link.directive';
export {WorkbenchRouter, WbNavigationExtras} from './lib/routing/workbench-router.service';
export {WorkbenchAuxiliaryRoutesRegistrator} from './lib/routing/workbench-auxiliary-routes-registrator.service';
export {WorkbenchComponent} from './lib/workbench.component';
export {WbActivityDirective} from './lib/activity-part/wb-activity.directive';
export {Activity} from './lib/activity-part/activity';
export {ActivityPartComponent} from './lib/activity-part/activity-part.component';
export {WorkbenchActivityPartService} from './lib/activity-part/workbench-activity-part.service';
export {WbActivityActionDirective} from './lib/activity-part/wb-activity-action.directive';
export * from './lib/message-box/public_api';
export * from './lib/notification/public_api';
export {WB_VIEW_TITLE_PARAM, WB_VIEW_HEADING_PARAM, WB_STATE_DATA} from './lib/routing/routing.constants';
export {ROUTE_REUSE_PROVIDER, VIEW_TAB_CONTEXT, ViewTabContext} from './lib/workbench.constants';
export {WorkbenchLauncher, WorkbenchStartup} from './lib/startup/workbench-launcher.service';
export {WorkbenchInitializer, WORKBENCH_STARTUP, WORKBENCH_PRE_STARTUP, MICROFRONTEND_PLATFORM_POST_STARTUP, WORKBENCH_POST_STARTUP} from './lib/startup/workbench-initializer';
export {WbRouteReuseProvider, WbRouteReuseStrategy} from './lib/routing/wb-route-reuse-strategy.service';
export {Disposable} from './lib/disposable';
export {ContentAsOverlayComponent} from './lib/content-projection/content-as-overlay.component';
export {PopupService} from './lib/popup/popup.service';
export {Popup, PopupConfig, CloseStrategy, PopupOrigin, PopupSize} from './lib/popup/popup.config';
export {ViewMenuItemDirective} from './lib/view-part/view-context-menu/view-menu.directive';
export {ViewPartActionDirective} from './lib/view-part/view-part-action-bar/view-part-action.directive';
export {WorkbenchView} from './lib/view/workbench-view.model';
export {WorkbenchViewPart} from './lib/view-part/workbench-view-part.model';
export {MicrofrontendPlatformConfigLoader} from './lib/microfrontend-platform/microfrontend-platform-config-loader';
export {LogAppender, LogEvent, LogLevel, LoggerName, Logger, ConsoleAppender} from './lib/logging';
