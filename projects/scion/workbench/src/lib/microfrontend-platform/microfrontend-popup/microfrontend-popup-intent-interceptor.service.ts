/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, NgZone, StaticProvider} from '@angular/core';
import {APP_IDENTITY, Handler, IntentInterceptor, IntentMessage, mapToBody, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPopup, WorkbenchPopupCapability, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupCommand} from '@scion/workbench-client';
import {MicrofrontendPopupComponent} from './microfrontend-popup.component';
import {WbRouterOutletComponent} from '../../routing/wb-router-outlet.component';
import {ROUTER_OUTLET_NAME} from '../../workbench.constants';
import {combineLatest, Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';
import {fromDimension$} from '@scion/toolkit/observable';
import {RouterUtils} from '../../routing/router.util';
import {Commands} from '../../routing/workbench-router.service';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {Router} from '@angular/router';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../messaging.util';
import {Maps} from '@scion/toolkit/util';
import {PopupService} from '../../popup/popup.service';
import {Popup, PopupOrigin} from '../../popup/popup.config';

/**
 * Handles microfrontend popup intents, instructing the Workbench {@link PopupService} to navigate to the microfrontend of a given popup capability.
 *
 * Popup intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench. They are not transported to the providing application.
 */
@Injectable()
export class MicrofrontendPopupIntentInterceptor implements IntentInterceptor {

  private _openedPopups = new Set<string>();

  constructor(private _popupService: PopupService,
              private _logger: Logger,
              private _viewRegistry: WorkbenchViewRegistry,
              private _router: Router,
              private _zone: NgZone) {
  }

  /**
   * Popup intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): void {
    if (intentMessage.intent.type === WorkbenchCapabilities.Popup) {
      this.consumePopupIntent(intentMessage).then();
    }
    else {
      next.handle(intentMessage);
    }
  }

  private async consumePopupIntent(message: IntentMessage<ɵWorkbenchPopupCommand>): Promise<void> {
    const command = message.body!;

    // Ignore subsequent intents if a popup is already open, as it would lead to the first popup being closed.
    if (this._openedPopups.has(command.popupId)) {
      this._logger.warn('Ignoring popup intent because multiple popup providers found that match the popup intent. Most likely this is not intended and may indicate an incorrect manifest configuration.', message.intent);
      return;
    }

    const replyTo = message.headers.get(MessageHeaders.ReplyTo);
    const params = new Map([
      ...Maps.coerce(message.intent.params),
      ...Maps.coerce(message.intent.qualifier),
    ]);
    this._logger.debug(() => 'Handling microfrontend popup command', LoggerNames.MICROFRONTEND, command);

    const capability = message.capability as WorkbenchPopupCapability;
    const isHostPopup = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    this._openedPopups.add(command.popupId);
    try {
      const result = isHostPopup ? await this.openHostComponentPopup(capability, params, command) : await this.openMicrofrontendPopup(capability, params, command);
      await Beans.get(MessageClient).publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      await Beans.get(MessageClient).publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
    finally {
      this._openedPopups.delete(command.popupId);
    }
  }

  /**
   * Opens a popup for displaying a microfrontend provided by an application other than the host app.
   */
  private async openMicrofrontendPopup(capability: WorkbenchPopupCapability, params: Map<string, any>, command: ɵWorkbenchPopupCommand): Promise<any> {
    const popupContext: ɵPopupContext = {
      popupId: command.popupId,
      capability: capability,
      params: params,
      closeOnFocusLost: command.closeStrategy?.onFocusLost ?? true,
    };
    return this._popupService.open({
      component: MicrofrontendPopupComponent,
      input: popupContext,
      anchor: this.observePopupAnchor$(command),
      context: command.context,
      align: command.align,
      size: capability.properties?.size,
      closeStrategy: {
        ...command.closeStrategy,
        onFocusLost: false, // Closing the popup on focus loss is handled in {MicrofrontendPopupComponent}
      },
      cssClass: capability.properties?.cssClass,
    });
  }

  /**
   * Opens a popup for displaying a routed component of the host app. Unlike popups opened via {@link openMicrofrontendPopup},
   * this popup uses a `<router-outlet>` and not a `<sci-router-outlet>`, thus does not integrate the microfrontend via an iframe.
   */
  private async openHostComponentPopup(capability: WorkbenchPopupCapability, params: Map<string, any>, command: ɵWorkbenchPopupCommand): Promise<any> {
    const popupOutletName = `popup.${command.popupId}`;
    const path = capability.properties?.path;
    if (!path) {
      throw Error(`[PopupProviderError] Popup capability has no path to the microfrontend defined: ${JSON.stringify(capability)}`);
    }

    // Perform navigation in the named router outlet.
    const navigateSuccess = await this.navigate(path, {outletName: popupOutletName, params});
    if (!navigateSuccess) {
      throw Error('[PopupNavigateError] Navigation canceled, most likely by a route guard.');
    }

    return this._popupService.open({
      component: WbRouterOutletComponent,
      componentConstructOptions: {
        providers: [
          {provide: ROUTER_OUTLET_NAME, useValue: popupOutletName},
          provideWorkbenchPopup(capability, params),
        ],
      },
      anchor: this.observePopupAnchor$(command),
      context: command.context,
      align: command.align,
      size: capability.properties?.size,
      closeStrategy: command.closeStrategy,
      cssClass: capability.properties?.cssClass,
    }).finally(() => this.navigate(null, {outletName: popupOutletName})); // Remove the outlet from the URL
  }

  /**
   * Constructs an Observable that, upon subscription, emits the position of the popup anchor, and then each time it is repositioned.
   */
  private observePopupAnchor$(command: ɵWorkbenchPopupCommand): Observable<PopupOrigin> {
    const contextualViewId = command.context?.viewId;
    return combineLatest([
      contextualViewId ? this.observeViewBoundingBox$(contextualViewId) : of(undefined),
      this.observeMicrofrontendPopupOrigin$(command.popupId),
    ])
      .pipe(
        filter(([viewBoundingBox, popupOrigin]) => {
          // Swallow emissions until both sources report a non-empty dimension. For example, when deactivating
          // the popup's contextual view, the view reports an empty bounding box, causing the popup to flicker
          // when activating it again.
          return (!viewBoundingBox || !isNullClientRect(viewBoundingBox)) && !isNullClientRect(popupOrigin);
        }),
        map(([viewBoundingBox, popupOrigin]: [ClientRect | undefined, ClientRect]) => {
          return {
            x: (viewBoundingBox?.left ?? 0) + popupOrigin.left,
            y: (viewBoundingBox?.top ?? 0) + popupOrigin.top,
            width: popupOrigin.width,
            height: popupOrigin.height,
          };
        }),
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        observeInside(continueFn => this._zone.run(continueFn)),
      );
  }

  /**
   * Observes the bounding box of the view in which the popup is opened.
   */
  private observeViewBoundingBox$(viewId: string): Observable<ClientRect> {
    const view = this._viewRegistry.getElseThrow(viewId);
    return fromDimension$(view.portal.componentRef.location.nativeElement)
      .pipe(map(dimension => dimension.element.getBoundingClientRect()));
  }

  /**
   * Observes the bounding box of the popup anchor in which the popup is opened.
   */
  private observeMicrofrontendPopupOrigin$(popupId: string): Observable<ClientRect> {
    return Beans.get(MessageClient).observe$<ClientRect>(ɵWorkbenchCommands.popupOriginTopic(popupId))
      .pipe(mapToBody());
  }

  /**
   * Performs navigation in the specified outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras: {outletName: string; params?: Map<string, any>}): Promise<boolean> {
    // Replace placeholders with the values of the qualifier and params, if any.
    path = RouterUtils.substituteNamedParameters(path, extras.params);

    const outletCommands: Commands | null = (path !== null ? RouterUtils.segmentsToCommands(RouterUtils.parsePath(this._router, path)) : null);
    const commands: Commands = [{outlets: {[extras.outletName]: outletCommands}}];
    return this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'merge'});
  }
}

function isNullClientRect(clientRect: ClientRect): boolean {
  return clientRect.top === 0 && clientRect.right === 0 && clientRect.bottom === 0 && clientRect.left === 0;
}

/**
 * Provides the {@link WorkbenchPopup} handle for interacting with the popup in a routed component of the host app.
 */
function provideWorkbenchPopup(capability: WorkbenchPopupCapability, params: Map<string, any>): StaticProvider {
  return {
    provide: WorkbenchPopup,
    deps: [Popup],
    useFactory: (popup: Popup): WorkbenchPopup => {
      return new class implements WorkbenchPopup {
        public readonly capability = capability;
        public readonly params = params;

        public close<R = any>(result?: R | undefined): void {
          popup.close(result);
        }

        public closeWithError(error: Error | string): void {
          popup.closeWithError(error);
        }
      };
    },
  };
}
