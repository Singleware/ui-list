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
  name: string;
  /**
   * List type.
   */
  type: string;
  /**
   * List values.
   */
  value: any[];
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
   * Determine whether or not the list is empty.
   */
  readonly empty: boolean;
  /**
   * Determines whether or not the list is required.
   */
  required: boolean;
  /**
   * Determines whether or not the list is read-only.
   */
  readOnly: boolean;
  /**
   * Determines whether or not the list is disabled.
   */
  disabled: boolean;
  /**
   * Determines whether or not the list items are draggable.
   */
  draggable: boolean;
  /**
   * Determines whether or not the list item is shareable among other similar lists.
   */
  shareable: boolean;
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
