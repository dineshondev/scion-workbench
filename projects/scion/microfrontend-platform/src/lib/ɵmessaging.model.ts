/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { IntentMessage, TopicMessage } from './messaging.model';

/**
 * Declares the message transports.
 */
export enum MessagingTransport {
  /**
   * Transport used by clients to communicate with the broker.
   */
  ClientToBroker = 'sci://microfrontend-platform/client-to-broker',
  /**
   * Transport used by the broker to communicate with its clients.
   */
  BrokerToClient = 'sci://microfrontend-platform/broker-to-client',
  /**
   * Transport to send messages from the client to the gateway.
   */
  ClientToGateway = 'sci://microfrontend-platform/client-to-gateway',
  /**
   * Transport to send messages from the gateway to the client.
   */
  GatewayToClient = 'sci://microfrontend-platform/gateway-to-client',
  /**
   * Transport to send messages from the gateway to the broker.
   */
  GatewayToBroker = 'sci://microfrontend-platform/gateway-to-broker',
  /**
   * Transport to send messages from the broker to the gateway.
   */
  BrokerToGateway = 'sci://microfrontend-platform/broker-to-gateway',
}

/**
 * Defines the channels to which messages can be sent.
 */
export enum MessagingChannel {
  TopicSubscribe = 'topic-subscribe',
  TopicUnsubscribe = 'topic-unsubscribe',
  Topic = 'topic',
  Intent = 'intent',
}

/**
 * Envelope for all messages.
 */
export interface MessageEnvelope<Message = IntentMessage | TopicMessage | TopicSubscribeCommand | TopicUnsubscribeCommand> {
  senderId?: string;
  messageId: string;
  transport: MessagingTransport;
  channel: MessagingChannel;
  message?: Message;
}

/**
 * Declares internal platform topics.
 */
export enum PlatformTopics {
  /**
   * Allows requesting the subscription count on a topic.
   */
  RequestSubscriberCount = 'ɵREQUEST_SUBSCRIBER_COUNT',
  /**
   * A broker gateway broadcasts a connect request to this topic in order to discover the broker.
   */
  ClientConnect = 'ɵCLIENT_CONNECT',
  /**
   * A broker gateway sends a disconnect message to this topic before being disposed.
   */
  ClientDisconnect = 'ɵCLIENT_DISCONNECT',
  /**
   * A message client sends an info request to this topic to request information about the gateway and the broker.
   */
  RequestGatewayInfo = 'ɵGATEWAY_INFO',
  /**
   * Allows observing the platform state of the host. The last state is retained on the topic.
   */
  HostPlatformState = 'ɵHOST_PLATFORM_STATE',
}

/**
 * Sent by a client gateway to initiate a connection to the broker.
 * The broker responds with a @{link ConnackMessage} message.
 */
export interface ConnectMessage {
  symbolicAppName: string;
}

/**
 * Sent by the broker in response to a {@link ConnectMessage} request from a client gateway.
 */
export interface ConnackMessage {
  returnCode: 'accepted' | 'refused:bad-request' | 'refused:rejected' | 'refused:blocked';
  returnMessage?: string;
  /**
   * Unique id assigned to the client by the broker. Is only set on success.
   */
  clientId?: string;
}

export interface TopicSubscribeCommand {
  topic: string;
}

export interface TopicUnsubscribeCommand {
  topic: string;
}

export interface MessageDeliveryStatus {
  ok: boolean;
  details?: string;
}
