/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as DOM from '@singleware/jsx';
import * as Control from '@singleware/ui-control';

import { Properties } from './properties';
import { Element } from './element';
import { Render } from './render';
import { States } from './states';

/**
 * List template class.
 */
@Class.Describe()
export class Template<T extends Object = any> extends Control.Component<Properties> {
  /**
   * List states.
   */
  @Class.Private()
  private states = {
    name: '',
    items: [],
    required: false,
    readOnly: false,
    disabled: false,
    draggable: false
  } as States;

  /**
   * Current element.
   */
  @Class.Private()
  private current?: HTMLElement;

  /**
   * Mirror element.
   */
  @Class.Private()
  private mirror?: HTMLElement;

  /**
   * Hidden element to hide the default drag and drop image.
   */
  @Class.Private()
  private hidden = <span style="position: absolute; height: 0px; width: 0px; left: 0px; top: 0px;" /> as HTMLSpanElement;

  /**
   * List items slot.
   */
  @Class.Private()
  private itemSlot = <slot name="item" class="item" /> as HTMLSlotElement;

  /**
   * Matched elements.
   */
  @Class.Private()
  private matchedElements = new WeakMap<HTMLElement, T>();

  /**
   * Matched items.
   */
  @Class.Private()
  private matchedItems = new WeakMap<T, HTMLElement>();

  /**
   * Move mirror callback.
   */
  @Class.Private()
  private moveMirrorCallback = this.moveMirrorHandler.bind(this);

  /**
   * List styles.
   */
  @Class.Private()
  private styles = (
    <style>
      {`:host {
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 100%;
  height: 100%;
}
:host > .item::slotted(*) {
  width: 100%;
}
:host([data-draggable]:not([data-disabled])) > .item::slotted(*) {
  cursor: move;
  cursor: grab;
}
:host([data-draggable][data-active]) > .item::slotted(*) {
  cursor: move;
  cursor: grabbing;
}
:host > .item::slotted([data-mirror]) {
  position: absolute;
  pointer-events: none;
  opacity: 1;
}`}
    </style>
  ) as HTMLStyleElement;

  /**
   * List skeleton.
   */
  @Class.Private()
  private skeleton = (
    <div slot={this.properties.slot} class={this.properties.class}>
      {this.children}
    </div>
  ) as Element;

  /**
   * Updates the specified property state.
   * @param property Property name.
   * @param state Property state.
   */
  @Class.Private()
  private updatePropertyState(property: string, state: boolean): void {
    if (state) {
      this.skeleton.dataset[property] = 'on';
    } else {
      delete this.skeleton.dataset[property];
    }
  }

  /**
   * Renders a new item for the specified data.
   * @param data Item data.
   * @returns Returns the rendered item or undefined when there is no rendered output.
   */
  @Class.Private()
  private renderItem(data: T): HTMLElement | undefined {
    const detail = { input: data, output: void 0 } as Render;
    const event = new CustomEvent<Render>('renderitem', { bubbles: true, cancelable: true, detail: detail });
    if (this.skeleton.dispatchEvent(event) && detail.output) {
      const item = detail.output;
      item.addEventListener('dragstart', this.dragStartHandler.bind(this, item), true);
      item.addEventListener('dragend', this.dragEndHandler.bind(this), true);
      item.addEventListener('dragenter', this.dragEnterHandler.bind(this, item), true);
      item.addEventListener('dragover', this.dragOverHandler.bind(this), true);
      item.addEventListener('drop', this.dropHandler.bind(this), true);
      item.draggable = this.draggable;
      item.slot = 'item';
      this.matchedElements.set(item, data);
      this.matchedItems.set(data, item);
      return item;
    }
    return void 0;
  }

  /**
   * Renders a new mirror element based on the specified base element.
   * @param base Base element.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @returns Returns the rendered mirror element or undefined when there is no rendered output.
   */
  @Class.Private()
  private renderMirror(base: HTMLElement, x: number, y: number): HTMLElement | undefined {
    const mirror = base.cloneNode(true) as HTMLElement;
    const detail = { input: mirror, output: mirror } as Render;
    const event = new CustomEvent<Render>('rendermirror', { bubbles: true, cancelable: true, detail: detail });
    if (this.skeleton.dispatchEvent(event) && detail.output) {
      mirror.draggable = false;
      mirror.dataset.mirror = 'on';
      mirror.style.width = `${base.offsetWidth}px`;
      mirror.style.height = `${base.offsetHeight}px`;
      this.updateMirrorPosition(mirror, x, y);
    }
    return detail.output;
  }

  /**
   * Notify changes into this list.
   */
  @Class.Private()
  private notifyChanges(): void {
    this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
  }

  /**
   * Updates the mirror position based on the specified coordinates.
   * @param mirror Mirror element.
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  @Class.Private()
  private updateMirrorPosition(mirror: HTMLElement, x: number, y: number): void {
    mirror.style.left = `${x}px`;
    mirror.style.top = `${y}px`;
  }

  /**
   * Drag start event handler.
   * @param item Item element.
   * @param event Event information.
   */
  @Class.Private()
  private dragStartHandler(item: HTMLElement, event: DragEvent): void {
    if (this.canDragAndDrop) {
      if (event.dataTransfer) {
        DOM.append(this.skeleton, this.hidden);
        event.dataTransfer.setDragImage(this.hidden, 0, 0);
        event.dataTransfer.effectAllowed = 'move';
      }
      DOM.append(this.skeleton, (this.mirror = this.renderMirror(item, event.pageX, event.pageY)));
      document.addEventListener('dragover', this.moveMirrorCallback, true);
      this.updatePropertyState('active', true);
      this.current = item;
      this.current.dataset.dragging = 'on';
    }
  }

  /**
   * Drag end event handler.
   */
  @Class.Private()
  private dragEndHandler(): void {
    document.removeEventListener('dragover', this.moveMirrorCallback, true);
    this.updatePropertyState('active', false);
    this.hidden.remove();
    if (this.mirror) {
      this.mirror.remove();
      this.mirror = void 0;
    }
    if (this.current) {
      delete this.current.dataset.dragging;
      this.current = void 0;
    }
  }

  /**
   * Drag enter event handler.
   * @param item Item element.
   * @param event Event information.
   */
  @Class.Private()
  private dragEnterHandler(item: HTMLElement, event: DragEvent): void {
    if (this.current && this.current !== item) {
      const list = this.states.items;
      const source = list.splice(list.indexOf(this.matchedElements.get(this.current)), 1)[0];
      if (item.offsetTop + item.offsetHeight / 2 <= event.pageY) {
        if (item.previousSibling) {
          list.splice(list.indexOf(this.matchedElements.get(item)), 0, source);
        } else {
          list.unshift(source);
        }
        this.skeleton.insertBefore(this.current, item);
      } else {
        if (item.nextSibling) {
          list.splice(list.indexOf(this.matchedElements.get(item.nextSibling as HTMLElement)), 0, source);
        } else {
          list.push(source);
        }
        this.skeleton.insertBefore(this.current, item.nextSibling);
      }
    }
  }

  /**
   * Drag over event handler.
   * @param event Event information.
   */
  @Class.Private()
  private dragOverHandler(event: DragEvent): void {
    if (this.canDragAndDrop) {
      event.preventDefault();
    }
  }

  /**
   * Drop event handler.
   * @param event Event information.
   */
  @Class.Private()
  private dropHandler(event: DragEvent): void {
    if (this.canDragAndDrop) {
      event.preventDefault();
      this.notifyChanges();
    }
  }

  /**
   * Render item event handler.
   * @param event Event information.
   */
  @Class.Private()
  private renderItemHandler(event: CustomEvent<Render>): void {
    event.detail.output = this.properties.onRenderItem(event.detail.input);
    event.stopPropagation();
  }

  /**
   * Render mirror event handler.
   * @param event Event information.
   */
  @Class.Private()
  private renderMirrorHandler(event: CustomEvent<Render>): void {
    if (this.properties.onRenderMirror) {
      event.detail.output = this.properties.onRenderMirror(event.detail.input);
      event.stopPropagation();
    }
  }

  /**
   * Move mirror item event handler.
   * @param event Event information.
   */
  @Class.Private()
  private moveMirrorHandler(event: MouseEvent): void {
    if (this.mirror) {
      this.updateMirrorPosition(this.mirror, event.pageX, event.pageY);
    }
  }

  /**
   * Change item event handler.
   */
  @Class.Private()
  private changeItemHandler(): void {
    if (this.properties.onChange) {
      this.properties.onChange();
    }
  }

  /**
   * Bind all element handlers.
   */
  @Class.Private()
  private bindHandlers(): void {
    this.skeleton.addEventListener('renderitem', this.renderItemHandler.bind(this));
    this.skeleton.addEventListener('rendermirror', this.renderMirrorHandler.bind(this));
    this.skeleton.addEventListener('change', this.changeItemHandler.bind(this));
  }

  /**
   * Bind exposed properties to the custom element.
   */
  @Class.Private()
  private bindProperties(): void {
    this.bindComponentProperties(this.skeleton, [
      'name',
      'value',
      'defaultValue',
      'length',
      'empty',
      'disabled',
      'required',
      'draggable',
      'canDragAndDrop',
      'readOnly',
      'addItem',
      'insertItem',
      'removeItem',
      'clear',
      'checkValidity',
      'reportValidity',
      'reset'
    ]);
  }

  /**
   * Assign all elements properties.
   */
  @Class.Private()
  private assignProperties(): void {
    this.assignComponentProperties(this.properties, ['name', 'value', 'required', 'readOnly', 'disabled', 'draggable', 'readOnly']);
  }

  /**
   * Default constructor.
   * @param properties List properties.
   * @param children List children.
   */
  constructor(properties?: Properties, children?: any[]) {
    super(properties, children);
    DOM.append((this.skeleton as HTMLDivElement).attachShadow({ mode: 'closed' }), this.styles, this.itemSlot);
    this.bindHandlers();
    this.bindProperties();
    this.assignProperties();
  }

  /**
   * Gets the list name.
   */
  @Class.Public()
  public get name(): string {
    return this.states.name;
  }

  /**
   * Sets the list name.
   */
  public set name(name: string) {
    this.states.name = name;
  }

  /**
   * Gets the list values.
   */
  @Class.Public()
  public get value(): any[] {
    return this.states.items.slice();
  }

  /**
   * Sets the list values.
   */
  public set value(values: any[]) {
    this.clear();
    for (const value of values) {
      this.addItem(value);
    }
  }

  /**
   * Gets the default value.
   */
  @Class.Public()
  public get defaultValue(): T[] {
    return this.properties.value || [];
  }

  /**
   * Gets the drag and drop state.
   */
  @Class.Public()
  public get canDragAndDrop(): boolean {
    return this.draggable && !this.disabled && !this.readOnly;
  }

  /**
   * Gets the list length.
   */
  @Class.Public()
  public get length(): number {
    return this.states.items.length;
  }

  /**
   * Gets the empty state.
   */
  @Class.Public()
  public get empty(): boolean {
    return this.length === 0;
  }

  /**
   * Gets the required state.
   */
  @Class.Public()
  public get required(): boolean {
    return this.states.required;
  }

  /**
   * Sets the required state.
   */
  public set required(state: boolean) {
    this.updatePropertyState('required', (this.states.required = state));
    Control.setChildrenProperty(this.itemSlot, 'required', state);
  }

  /**
   * Gets the read-only state.
   */
  @Class.Public()
  public get readOnly(): boolean {
    return this.states.readOnly;
  }

  /**
   * Sets the read-only state.
   */
  public set readOnly(state: boolean) {
    this.updatePropertyState('readonly', (this.states.readOnly = state));
    Control.setChildrenProperty(this.itemSlot, 'readOnly', state);
  }

  /**
   * Gets the disabled state.
   */
  @Class.Public()
  public get disabled(): boolean {
    return this.states.disabled;
  }

  /**
   * Sets the disabled state.
   */
  public set disabled(state: boolean) {
    this.updatePropertyState('disabled', (this.states.disabled = state));
    Control.setChildrenProperty(this.itemSlot, 'disabled', state);
  }

  /**
   * Gets the draggable state.
   */
  @Class.Public()
  public get draggable(): boolean {
    return this.states.draggable;
  }

  /**
   * Sets the draggable state.
   */
  public set draggable(state: boolean) {
    this.updatePropertyState('draggable', (this.states.draggable = state));
    Control.setChildrenProperty(this.itemSlot, 'draggable', state);
  }

  /**
   * Gets the list element.
   */
  @Class.Public()
  public get element(): Element {
    return this.skeleton;
  }

  /**
   * Adds a new item into this list.
   * @param data Item data.
   * @returns Returns true when the item was added, false otherwise.
   */
  @Class.Public()
  public addItem(data: T): boolean {
    const item = this.renderItem(data);
    if (!item) {
      return false;
    }
    this.states.items.push(data);
    this.skeleton.appendChild(item);
    return true;
  }

  /**
   * Inserts a new item at the specified point into this list.
   * @param data Item data.
   * @param offset Offset data.
   * @returns Returns true when the item was inserted, false otherwise.
   */
  @Class.Public()
  public insertItem(data: T, offset: T): boolean {
    const element = this.matchedItems.get(offset);
    if (!element) {
      throw new Error(`Element does not exists at the specified offset.`);
    }
    const list = this.states.items;
    const item = this.renderItem(data);
    if (item) {
      list.splice(list.indexOf(offset) + 1, 0, data);
      this.skeleton.insertBefore(item, element.nextSibling);
      return true;
    }
    return false;
  }

  /**
   * Removes the specified item from this list.
   * @param data Item data.
   * @returns Returns true when the item was removed, false otherwise.
   */
  @Class.Public()
  public removeItem(data: T): boolean {
    const list = this.states.items;
    const element = this.matchedItems.get(data);
    if (element) {
      element.remove();
      list.splice(list.indexOf(data), 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all list items.
   */
  @Class.Public()
  public clear(): void {
    DOM.clear(this.skeleton);
    this.states.items = [];
  }

  /**
   * Checks the list validity.
   * @returns Returns true when the list is valid, false otherwise.
   */
  @Class.Public()
  public checkValidity(): boolean {
    return (
      (!this.required || !this.empty) &&
      Control.listChildrenByProperty(this.itemSlot, 'checkValidity', (item: any) => (item.checkValidity() ? void 0 : false)) !== false
    );
  }

  /**
   * Reports the list validity.
   * @returns Returns true when the list is valid, false otherwise.
   */
  @Class.Public()
  public reportValidity(): boolean {
    return (
      (!this.required || !this.empty) &&
      Control.listChildrenByProperty(this.itemSlot, 'reportValidity', (item: any) => (item.reportValidity() ? void 0 : false)) !== false
    );
  }

  /**
   * Resets the list to its initial values.
   */
  @Class.Public()
  public reset(): void {
    if (this.properties.value) {
      this.value = this.properties.value;
    } else {
      this.clear();
    }
  }
}
