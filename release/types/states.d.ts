/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * List states interface.
 */
export interface States {
  /**
   * List name.
   */
  name: string;
  /**
   * List items.
   */
  items: any[];
  /**
   * Disabled state.
   */
  disabled: boolean;
  /**
   * Required state.
   */
  required: boolean;
  /**
   * Draggable state.
   */
  draggable: boolean;
  /**
   * Readonly state.
   */
  readOnly: boolean;
}
