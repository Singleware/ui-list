/**
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as JSX from '@singleware/jsx';
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
   * Drag type.
   */
  @Class.Private()
  private static dragType?: string;

  /**
   * Drag list items.
   */
  @Class.Private()
  private static dragItems?: any[];

  /**
   * Drag list element.
   */
  @Class.Private()
  private static dragListElement?: HTMLElement;

  /**
   * Drag item element.
   */
  @Class.Private()
  private static dragItemElement?: HTMLElement;

  /**
   * Matched elements.
   */
  @Class.Private()
  private static matchedElements = new WeakMap<HTMLElement, any>();

  /**
   * Matched items.
   */
  @Class.Private()
  private matchedItems = new WeakMap<any, HTMLElement>();

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
    draggable: false,
    shareable: false
  } as States;

  /**
   * Mirror element.
   */
  @Class.Private()
  private mirror?: HTMLElement;

  /**
   * Hidden element to hide the default drag and drop image.
   */
  @Class.Private()
  private hidden = (<span style="position: absolute; height: 0px; width: 0px; left: 0px; top: 0px;" />) as HTMLSpanElement;

  /**
   * List items slot.
   */
  @Class.Private()
  private itemSlot = (<slot name="item" class="item" />) as HTMLSlotElement;

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
   * Renders a new item for the specified value.
   * @param value Value item.
   * @returns Returns the rendered item or undefined when there is no rendered output.
   */
  @Class.Private()
  private renderItem(value: T): HTMLElement | undefined {
    const detail = { input: value, output: void 0 } as Render;
    const event = new CustomEvent<Render>('renderitem', { bubbles: true, cancelable: true, detail: detail });
    if (this.skeleton.dispatchEvent(event) && detail.output) {
      const element = detail.output;
      element.addEventListener('dragstart', this.dragStartHandler.bind(this, element), true);
      element.addEventListener('dragend', this.dragEndHandler.bind(this), true);
      element.addEventListener('dragenter', this.dragEnterHandler.bind(this, element), true);
      element.addEventListener('dragover', this.dragOverHandler.bind(this), true);
      element.addEventListener('drop', this.dropHandler.bind(this), true);
      element.draggable = this.draggable;
      element.slot = 'item';
      Template.matchedElements.set(element, value);
      this.matchedItems.set(value, element);
      return element;
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
   * @param element Item element.
   * @param event Event information.
   */
  @Class.Private()
  private dragStartHandler(element: HTMLElement, event: DragEvent): void {
    if (this.canDragAndDrop) {
      if (event.dataTransfer) {
        JSX.append(this.skeleton, this.hidden);
        event.dataTransfer.setDragImage(this.hidden, 0, 0);
        event.dataTransfer.effectAllowed = 'move';
      }
      JSX.append(this.skeleton, (this.mirror = this.renderMirror(element, event.pageX, event.pageY)));
      document.addEventListener('dragover', this.moveMirrorCallback, true);
      this.updatePropertyState('active', true);
      Template.dragType = this.type;
      Template.dragItems = this.states.items;
      Template.dragListElement = this.skeleton;
      Template.dragItemElement = element;
      Template.dragItemElement.dataset.dragging = 'on';
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
    if (Template.dragListElement === this.skeleton) {
      if (Template.dragItemElement) {
        delete Template.dragItemElement.dataset.dragging;
      }
      this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
      Template.dragListElement = void 0;
      Template.dragItemElement = void 0;
      Template.dragItems = void 0;
      Template.dragType = void 0;
    }
  }

  /**
   * Drag enter event handler.
   * @param element Item element.
   * @param event Event information.
   */
  @Class.Private()
  private dragEnterHandler(element: HTMLElement, event: DragEvent): void {
    const isLocal = Template.dragListElement === this.skeleton;
    const isExternal = this.shareable && Template.dragType === this.type;
    const sourceElement = Template.dragItemElement!;
    if (sourceElement !== element && (isLocal || isExternal)) {
      const sourceItems = Template.dragItems!;
      const sourceValue = Template.matchedElements.get(sourceElement);
      const targetElement = Template.dragListElement === this.skeleton ? sourceElement : this.renderItem(sourceValue);
      const targetItems = this.states.items;
      if (targetElement !== void 0) {
        const clientRect = element.getBoundingClientRect();
        const sourceIndex = sourceItems.indexOf(sourceValue);
        if (sourceIndex !== -1) {
          sourceItems.splice(sourceIndex, 1);
        }
        sourceElement.remove();
        if (clientRect.top + clientRect.height / 2 > event.pageY) {
          const targetValue = Template.matchedElements.get(element);
          const targetIndex = targetItems.indexOf(targetValue);
          if (targetIndex !== -1) {
            targetItems.splice(targetIndex, 0, sourceValue);
          } else {
            targetItems.unshift(sourceValue);
          }
          this.skeleton.insertBefore(targetElement, element);
        } else {
          const targetValue = Template.matchedElements.get(element.nextSibling as HTMLElement);
          const targetIndex = targetItems.indexOf(targetValue);
          if (targetIndex !== -1) {
            targetItems.splice(targetIndex, 0, sourceValue);
          } else {
            targetItems.push(sourceValue);
          }
          this.skeleton.insertBefore(targetElement, element.nextSibling);
        }
        if (Template.dragListElement !== this.skeleton) {
          this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
          Template.dragListElement!.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
          Template.dragListElement = this.skeleton;
          Template.dragItemElement = targetElement;
          Template.dragItems = targetItems;
        }
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
    }
  }

  /**
   * Drag enter event handler.
   */
  @Class.Private()
  private dragListEnterHandler(): void {
    if (this.states.items.length == 0 && this.shareable && this.type === Template.dragType) {
      const sourceItems = Template.dragItems as any[];
      const sourceElement = Template.dragItemElement as HTMLElement;
      const sourceValue = Template.matchedElements.get(sourceElement);
      const targetElement = this.renderItem(sourceValue);
      if (targetElement != void 0) {
        sourceItems.splice(sourceItems.indexOf(sourceValue), 1);
        sourceElement.remove();
        this.states.items.push(sourceValue);
        this.skeleton.appendChild(targetElement);
        this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
        Template.dragListElement!.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
        Template.dragListElement = this.skeleton;
        Template.dragItemElement = targetElement;
        Template.dragItems = this.states.items;
      }
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
    this.skeleton.addEventListener('renderitem', this.renderItemHandler.bind(this) as EventListenerOrEventListenerObject);
    this.skeleton.addEventListener('rendermirror', this.renderMirrorHandler.bind(this) as EventListenerOrEventListenerObject);
    this.skeleton.addEventListener('dragenter', this.dragListEnterHandler.bind(this), true);
    this.skeleton.addEventListener('dragover', this.dragOverHandler.bind(this), true);
    this.skeleton.addEventListener('change', this.changeItemHandler.bind(this));
  }

  /**
   * Bind exposed properties to the custom element.
   */
  @Class.Private()
  private bindProperties(): void {
    this.bindComponentProperties(this.skeleton, [
      'type',
      'name',
      'value',
      'defaultValue',
      'length',
      'empty',
      'disabled',
      'required',
      'draggable',
      'shareable',
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
    this.assignComponentProperties(this.properties, [
      'name',
      'value',
      'required',
      'readOnly',
      'disabled',
      'draggable',
      'shareable',
      'readOnly'
    ]);
  }

  /**
   * Default constructor.
   * @param properties List properties.
   * @param children List children.
   */
  constructor(properties?: Properties, children?: any[]) {
    super(properties, children);
    JSX.append((this.skeleton as HTMLDivElement).attachShadow({ mode: 'closed' }), this.styles, this.itemSlot);
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
   * Gets the list type.
   */
  @Class.Public()
  public get type(): string | undefined {
    return this.states.type;
  }

  /**
   * Sets the list type.
   */
  public set type(type: string | undefined) {
    this.states.type = type;
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
   * Gets the shareable state.
   */
  @Class.Public()
  public get shareable(): boolean {
    return this.states.shareable;
  }

  /**
   * Sets the shareable state.
   */
  public set shareable(state: boolean) {
    this.updatePropertyState('shareable', (this.states.shareable = state));
    Control.setChildrenProperty(this.itemSlot, 'shareable', state);
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
   * @param value Value item.
   * @returns Returns true when the item was added, false otherwise.
   */
  @Class.Public()
  public addItem(value: T): boolean {
    const element = this.renderItem(value);
    if (!element) {
      return false;
    }
    this.states.items.push(value);
    this.skeleton.appendChild(element);
    this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
    return true;
  }

  /**
   * Inserts a new item at the specified point into this list.
   * @param value Value item.
   * @param offset Value offset.
   * @returns Returns true when the item was inserted, false otherwise.
   */
  @Class.Public()
  public insertItem(value: T, offset: T): boolean {
    const element = this.matchedItems.get(offset);
    if (!element) {
      throw new Error(`Element does not exists at the specified offset.`);
    }
    const list = this.states.items;
    const newer = this.renderItem(value);
    if (newer) {
      list.splice(list.indexOf(offset) + 1, 0, value);
      this.skeleton.insertBefore(newer, element.nextSibling);
      this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
      return true;
    }
    return false;
  }

  /**
   * Removes the specified item from this list.
   * @param value Value item.
   * @returns Returns true when the item was removed, false otherwise.
   */
  @Class.Public()
  public removeItem(value: T): boolean {
    const list = this.states.items;
    const element = this.matchedItems.get(value);
    if (element) {
      element.remove();
      list.splice(list.indexOf(value), 1);
      this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
      return true;
    }
    return false;
  }

  /**
   * Clear all list items.
   */
  @Class.Public()
  public clear(): void {
    JSX.clear(this.skeleton);
    this.states.items = [];
    this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
  }

  /**
   * Checks the list validity.
   * @returns Returns true when the list is valid, false otherwise.
   */
  @Class.Public()
  public checkValidity(): boolean {
    return (
      (!this.required || !this.empty) &&
      Control.listChildrenByProperty(this.itemSlot, 'checkValidity', (element: any) => (element.checkValidity() ? void 0 : false)) !==
        false
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
      Control.listChildrenByProperty(this.itemSlot, 'reportValidity', (element: any) =>
        element.reportValidity() ? void 0 : false
      ) !== false
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
