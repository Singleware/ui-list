/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * List element interface.
 */
export interface Element extends HTMLDivElement {
  /**
   * List name.
   */
  name?: string;
  /**
   * List values.
   */
  value?: any[];
  /**
   * Default list value.
   */
  readonly defaultValue: any[];
  /**
   * Determines whether the list items can be draggable or not.
   */
  readonly canDragAndDrop: boolean;
  /**
   * List length.
   */
  readonly length: number;
  /**
   * Determine whether list is empty or not.
   */
  readonly empty: boolean;
  /**
   * Determines whether this list is required or not.
   */
  required: boolean;
  /**
   * Determines whether this list is read-only or not.
   */
  readOnly: boolean;
  /**
   * Determines whether this list is disabled or not.
   */
  disabled: boolean;
  /**
   * Determines whether list items are draggable or not.
   */
  draggable: boolean;
  /**
   * Adds a new item into this list.
   * @param data Item data.
   * @returns Returns true when the item was added, false otherwise.
   */
  addItem(data: any): boolean;
  /**
   * Inserts a new item at the specified point into this list.
   * @param data Item data.
   * @param offset Offset data.
   * @returns Returns true when the item was inserted, false otherwise.
   */
  insertItem(data: any, offset: any): boolean;
  /**
   * Removes the specified item from this list.
   * @param data Item data.
   * @returns Returns true when the item was removed, false otherwise.
   */
  removeItem(data: any): boolean;
  /**
   * Clear all list items.
   */
  clear(): void;
  /**
   * Checks the list validity.
   * @returns Returns true when the list is valid, false otherwise.
   */
  checkValidity(): boolean;
  /**
   * Reports the list validity.
   * @returns Returns true when the list is valid, false otherwise.
   */
  reportValidity(): boolean;
  /**
   * Resets the list to its initial value and state.
   */
  reset(): void;
}
