/**
 * Copyright (C) 2018 Silas B. Domingos
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
   * List values.
   */
  value?: any[];
  /**
   * Determines whether this list is required or not.
   */
  required?: boolean;
  /**
   * Determines whether this list is read-only or not.
   */
  readOnly?: boolean;
  /**
   * Determines whether this list is disabled or not.
   */
  disabled?: boolean;
  /**
   * Determines whether list items is draggable or not.
   */
  draggable?: boolean;
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
