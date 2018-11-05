/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Render item event detail interface.
 */
export interface Render<T = any> extends CustomEvent {
  /**
   * Input data.
   */
  input: T;
  /**
   * Output element.
   */
  output: HTMLElement | undefined;
}
