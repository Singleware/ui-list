/**
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Render } from './render';

/**
 * List properties interface.
 */
export interface Properties {
  /**
   * List classes.
   */
  class?: string;
  /**
   * List slot.
   */
  slot?: string;
  /**
   * List name.
   */
  name?: string;
  /**
   * List type.
   */
  type?: string;
  /**
   * List values.
   */
  value?: any[];
  /**
   * Determines whether or not this list is required.
   */
  required?: boolean;
  /**
   * Determines whether or not this list is read-only.
   */
  readOnly?: boolean;
  /**
   * Determines whether or not this list is disabled.
   */
  disabled?: boolean;
  /**
   * Determines whether or not list items is draggable.
   */
  draggable?: boolean;
  /**
   * Determines whether or not the list item is shareable among other similar lists.
   */
  shareable?: boolean;
  /**
   * List column children.
   */
  children?: {};
  /**
   * Render item event.
   */
  onRenderItem: (input: any) => HTMLElement | undefined;
  /**
   * Render mirror event.
   */
  onRenderMirror?: (input: HTMLElement) => HTMLElement | undefined;
  /**
   * Change event.
   */
  onChange?: () => void;
}
