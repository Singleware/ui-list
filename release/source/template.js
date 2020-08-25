"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Template_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
/**
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * List template class.
 */
let Template = Template_1 = class Template extends Control.Component {
    /**
     * Default constructor.
     * @param properties List properties.
     * @param children List children.
     */
    constructor(properties, children) {
        super(properties, children);
        /**
         * Matched items.
         */
        this.matchedItems = new WeakMap();
        /**
         * List states.
         */
        this.states = {
            name: '',
            items: [],
            required: false,
            readOnly: false,
            disabled: false,
            draggable: false,
            shareable: false
        };
        /**
         * Hidden element to hide the default drag and drop image.
         */
        this.hidden = (JSX.create("span", { style: "position: absolute; height: 0px; width: 0px; left: 0px; top: 0px;" }));
        /**
         * List items slot.
         */
        this.itemSlot = (JSX.create("slot", { name: "item", class: "item" }));
        /**
         * Move mirror callback.
         */
        this.moveMirrorCallback = this.moveMirrorHandler.bind(this);
        /**
         * List styles.
         */
        this.styles = (JSX.create("style", null, `:host {
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
}`));
        /**
         * List skeleton.
         */
        this.skeleton = (JSX.create("div", { slot: this.properties.slot, class: this.properties.class }, this.children));
        JSX.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.itemSlot);
        this.bindHandlers();
        this.bindProperties();
        this.assignProperties();
    }
    /**
     * Updates the specified property state.
     * @param property Property name.
     * @param state Property state.
     */
    updatePropertyState(property, state) {
        if (state) {
            this.skeleton.dataset[property] = 'on';
        }
        else {
            delete this.skeleton.dataset[property];
        }
    }
    /**
     * Renders a new item for the specified value.
     * @param value Value item.
     * @returns Returns the rendered item or undefined when there is no rendered output.
     */
    renderItem(value) {
        const detail = { input: value, output: void 0 };
        const event = new CustomEvent('renderitem', { bubbles: true, cancelable: true, detail: detail });
        if (this.skeleton.dispatchEvent(event) && detail.output) {
            const element = detail.output;
            element.addEventListener('dragstart', this.dragStartHandler.bind(this, element), true);
            element.addEventListener('dragend', this.dragEndHandler.bind(this), true);
            element.addEventListener('dragenter', this.dragEnterHandler.bind(this, element), true);
            element.addEventListener('dragover', this.dragOverHandler.bind(this), true);
            element.addEventListener('drop', this.dropHandler.bind(this), true);
            element.draggable = this.draggable;
            element.slot = 'item';
            Template_1.matchedElements.set(element, value);
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
    renderMirror(base, x, y) {
        const mirror = base.cloneNode(true);
        const detail = { input: mirror, output: mirror };
        const event = new CustomEvent('rendermirror', { bubbles: true, cancelable: true, detail: detail });
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
    updateMirrorPosition(mirror, x, y) {
        mirror.style.left = `${x}px`;
        mirror.style.top = `${y}px`;
    }
    /**
     * Drag start event handler.
     * @param element Item element.
     * @param event Event information.
     */
    dragStartHandler(element, event) {
        if (this.canDragAndDrop) {
            if (event.dataTransfer) {
                JSX.append(this.skeleton, this.hidden);
                event.dataTransfer.setDragImage(this.hidden, 0, 0);
                event.dataTransfer.effectAllowed = 'move';
            }
            JSX.append(this.skeleton, (this.mirror = this.renderMirror(element, event.pageX, event.pageY)));
            document.addEventListener('dragover', this.moveMirrorCallback, true);
            this.updatePropertyState('active', true);
            Template_1.dragType = this.type;
            Template_1.dragItems = this.states.items;
            Template_1.dragListElement = this.skeleton;
            Template_1.dragItemElement = element;
            Template_1.dragItemElement.dataset.dragging = 'on';
        }
    }
    /**
     * Drag end event handler.
     */
    dragEndHandler() {
        document.removeEventListener('dragover', this.moveMirrorCallback, true);
        this.updatePropertyState('active', false);
        this.hidden.remove();
        if (this.mirror) {
            this.mirror.remove();
            this.mirror = void 0;
        }
        if (Template_1.dragListElement === this.skeleton) {
            if (Template_1.dragItemElement) {
                delete Template_1.dragItemElement.dataset.dragging;
            }
            this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
            Template_1.dragListElement = void 0;
            Template_1.dragItemElement = void 0;
            Template_1.dragItems = void 0;
            Template_1.dragType = void 0;
        }
    }
    /**
     * Drag enter event handler.
     * @param element Item element.
     * @param event Event information.
     */
    dragEnterHandler(element, event) {
        const isLocal = Template_1.dragListElement === this.skeleton;
        const isExternal = this.shareable && Template_1.dragType === this.type;
        const sourceElement = Template_1.dragItemElement;
        if (sourceElement !== element && (isLocal || isExternal)) {
            const sourceItems = Template_1.dragItems;
            const sourceValue = Template_1.matchedElements.get(sourceElement);
            const targetElement = Template_1.dragListElement === this.skeleton ? sourceElement : this.renderItem(sourceValue);
            const targetItems = this.states.items;
            if (targetElement !== void 0) {
                const clientRect = element.getBoundingClientRect();
                const sourceIndex = sourceItems.indexOf(sourceValue);
                if (sourceIndex !== -1) {
                    sourceItems.splice(sourceIndex, 1);
                }
                sourceElement.remove();
                if (clientRect.top + clientRect.height / 2 > event.pageY) {
                    const targetValue = Template_1.matchedElements.get(element);
                    const targetIndex = targetItems.indexOf(targetValue);
                    if (targetIndex !== -1) {
                        targetItems.splice(targetIndex, 0, sourceValue);
                    }
                    else {
                        targetItems.unshift(sourceValue);
                    }
                    this.skeleton.insertBefore(targetElement, element);
                }
                else {
                    const targetValue = Template_1.matchedElements.get(element.nextSibling);
                    const targetIndex = targetItems.indexOf(targetValue);
                    if (targetIndex !== -1) {
                        targetItems.splice(targetIndex, 0, sourceValue);
                    }
                    else {
                        targetItems.push(sourceValue);
                    }
                    this.skeleton.insertBefore(targetElement, element.nextSibling);
                }
                if (Template_1.dragListElement !== this.skeleton) {
                    this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
                    Template_1.dragListElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
                    Template_1.dragListElement = this.skeleton;
                    Template_1.dragItemElement = targetElement;
                    Template_1.dragItems = targetItems;
                }
            }
        }
    }
    /**
     * Drag over event handler.
     * @param event Event information.
     */
    dragOverHandler(event) {
        if (this.canDragAndDrop) {
            event.preventDefault();
        }
    }
    /**
     * Drop event handler.
     * @param event Event information.
     */
    dropHandler(event) {
        if (this.canDragAndDrop) {
            event.preventDefault();
        }
    }
    /**
     * Drag enter event handler.
     */
    dragListEnterHandler() {
        if (this.states.items.length == 0 && this.shareable && this.type === Template_1.dragType) {
            const sourceItems = Template_1.dragItems;
            const sourceElement = Template_1.dragItemElement;
            const sourceValue = Template_1.matchedElements.get(sourceElement);
            const targetElement = this.renderItem(sourceValue);
            if (targetElement != void 0) {
                sourceItems.splice(sourceItems.indexOf(sourceValue), 1);
                sourceElement.remove();
                this.states.items.push(sourceValue);
                this.skeleton.appendChild(targetElement);
                this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
                Template_1.dragListElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
                Template_1.dragListElement = this.skeleton;
                Template_1.dragItemElement = targetElement;
                Template_1.dragItems = this.states.items;
            }
        }
    }
    /**
     * Render item event handler.
     * @param event Event information.
     */
    renderItemHandler(event) {
        event.detail.output = this.properties.onRenderItem(event.detail.input);
        event.stopPropagation();
    }
    /**
     * Render mirror event handler.
     * @param event Event information.
     */
    renderMirrorHandler(event) {
        if (this.properties.onRenderMirror) {
            event.detail.output = this.properties.onRenderMirror(event.detail.input);
            event.stopPropagation();
        }
    }
    /**
     * Move mirror item event handler.
     * @param event Event information.
     */
    moveMirrorHandler(event) {
        if (this.mirror) {
            this.updateMirrorPosition(this.mirror, event.pageX, event.pageY);
        }
    }
    /**
     * Change item event handler.
     */
    changeItemHandler() {
        if (this.properties.onChange) {
            this.properties.onChange();
        }
    }
    /**
     * Bind all element handlers.
     */
    bindHandlers() {
        this.skeleton.addEventListener('renderitem', this.renderItemHandler.bind(this));
        this.skeleton.addEventListener('rendermirror', this.renderMirrorHandler.bind(this));
        this.skeleton.addEventListener('dragenter', this.dragListEnterHandler.bind(this), true);
        this.skeleton.addEventListener('dragover', this.dragOverHandler.bind(this), true);
        this.skeleton.addEventListener('change', this.changeItemHandler.bind(this));
    }
    /**
     * Bind exposed properties to the custom element.
     */
    bindProperties() {
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
    assignProperties() {
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
     * Gets the list name.
     */
    get name() {
        return this.states.name;
    }
    /**
     * Sets the list name.
     */
    set name(name) {
        this.states.name = name;
    }
    /**
     * Gets the list type.
     */
    get type() {
        return this.states.type;
    }
    /**
     * Sets the list type.
     */
    set type(type) {
        this.states.type = type;
    }
    /**
     * Gets the list values.
     */
    get value() {
        return this.states.items.slice();
    }
    /**
     * Sets the list values.
     */
    set value(values) {
        this.clear();
        for (const value of values) {
            this.addItem(value);
        }
    }
    /**
     * Gets the default value.
     */
    get defaultValue() {
        return this.properties.value || [];
    }
    /**
     * Gets the drag and drop state.
     */
    get canDragAndDrop() {
        return this.draggable && !this.disabled && !this.readOnly;
    }
    /**
     * Gets the list length.
     */
    get length() {
        return this.states.items.length;
    }
    /**
     * Gets the empty state.
     */
    get empty() {
        return this.length === 0;
    }
    /**
     * Gets the required state.
     */
    get required() {
        return this.states.required;
    }
    /**
     * Sets the required state.
     */
    set required(state) {
        this.updatePropertyState('required', (this.states.required = state));
        Control.setChildrenProperty(this.itemSlot, 'required', state);
    }
    /**
     * Gets the read-only state.
     */
    get readOnly() {
        return this.states.readOnly;
    }
    /**
     * Sets the read-only state.
     */
    set readOnly(state) {
        this.updatePropertyState('readonly', (this.states.readOnly = state));
        Control.setChildrenProperty(this.itemSlot, 'readOnly', state);
    }
    /**
     * Gets the disabled state.
     */
    get disabled() {
        return this.states.disabled;
    }
    /**
     * Sets the disabled state.
     */
    set disabled(state) {
        this.updatePropertyState('disabled', (this.states.disabled = state));
        Control.setChildrenProperty(this.itemSlot, 'disabled', state);
    }
    /**
     * Gets the draggable state.
     */
    get draggable() {
        return this.states.draggable;
    }
    /**
     * Sets the draggable state.
     */
    set draggable(state) {
        this.updatePropertyState('draggable', (this.states.draggable = state));
        Control.setChildrenProperty(this.itemSlot, 'draggable', state);
    }
    /**
     * Gets the shareable state.
     */
    get shareable() {
        return this.states.shareable;
    }
    /**
     * Sets the shareable state.
     */
    set shareable(state) {
        this.updatePropertyState('shareable', (this.states.shareable = state));
        Control.setChildrenProperty(this.itemSlot, 'shareable', state);
    }
    /**
     * Gets the list element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Adds a new item into this list.
     * @param value Value item.
     * @returns Returns true when the item was added, false otherwise.
     */
    addItem(value) {
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
    insertItem(value, offset) {
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
    removeItem(value) {
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
    clear() {
        JSX.clear(this.skeleton);
        this.states.items = [];
        this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
    }
    /**
     * Checks the list validity.
     * @returns Returns true when the list is valid, false otherwise.
     */
    checkValidity() {
        return ((!this.required || !this.empty) &&
            Control.listChildrenByProperty(this.itemSlot, 'checkValidity', (element) => (element.checkValidity() ? void 0 : false)) !==
                false);
    }
    /**
     * Reports the list validity.
     * @returns Returns true when the list is valid, false otherwise.
     */
    reportValidity() {
        return ((!this.required || !this.empty) &&
            Control.listChildrenByProperty(this.itemSlot, 'reportValidity', (element) => element.reportValidity() ? void 0 : false) !== false);
    }
    /**
     * Resets the list to its initial values.
     */
    reset() {
        if (this.properties.value) {
            this.value = this.properties.value;
        }
        else {
            this.clear();
        }
    }
};
/**
 * Matched elements.
 */
Template.matchedElements = new WeakMap();
__decorate([
    Class.Private()
], Template.prototype, "matchedItems", void 0);
__decorate([
    Class.Private()
], Template.prototype, "states", void 0);
__decorate([
    Class.Private()
], Template.prototype, "mirror", void 0);
__decorate([
    Class.Private()
], Template.prototype, "hidden", void 0);
__decorate([
    Class.Private()
], Template.prototype, "itemSlot", void 0);
__decorate([
    Class.Private()
], Template.prototype, "moveMirrorCallback", void 0);
__decorate([
    Class.Private()
], Template.prototype, "styles", void 0);
__decorate([
    Class.Private()
], Template.prototype, "skeleton", void 0);
__decorate([
    Class.Private()
], Template.prototype, "updatePropertyState", null);
__decorate([
    Class.Private()
], Template.prototype, "renderItem", null);
__decorate([
    Class.Private()
], Template.prototype, "renderMirror", null);
__decorate([
    Class.Private()
], Template.prototype, "updateMirrorPosition", null);
__decorate([
    Class.Private()
], Template.prototype, "dragStartHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "dragEndHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "dragEnterHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "dragOverHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "dropHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "dragListEnterHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "renderItemHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "renderMirrorHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "moveMirrorHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "changeItemHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "bindHandlers", null);
__decorate([
    Class.Private()
], Template.prototype, "bindProperties", null);
__decorate([
    Class.Private()
], Template.prototype, "assignProperties", null);
__decorate([
    Class.Public()
], Template.prototype, "name", null);
__decorate([
    Class.Public()
], Template.prototype, "type", null);
__decorate([
    Class.Public()
], Template.prototype, "value", null);
__decorate([
    Class.Public()
], Template.prototype, "defaultValue", null);
__decorate([
    Class.Public()
], Template.prototype, "canDragAndDrop", null);
__decorate([
    Class.Public()
], Template.prototype, "length", null);
__decorate([
    Class.Public()
], Template.prototype, "empty", null);
__decorate([
    Class.Public()
], Template.prototype, "required", null);
__decorate([
    Class.Public()
], Template.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Template.prototype, "disabled", null);
__decorate([
    Class.Public()
], Template.prototype, "draggable", null);
__decorate([
    Class.Public()
], Template.prototype, "shareable", null);
__decorate([
    Class.Public()
], Template.prototype, "element", null);
__decorate([
    Class.Public()
], Template.prototype, "addItem", null);
__decorate([
    Class.Public()
], Template.prototype, "insertItem", null);
__decorate([
    Class.Public()
], Template.prototype, "removeItem", null);
__decorate([
    Class.Public()
], Template.prototype, "clear", null);
__decorate([
    Class.Public()
], Template.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Template.prototype, "reportValidity", null);
__decorate([
    Class.Public()
], Template.prototype, "reset", null);
__decorate([
    Class.Private()
], Template, "dragType", void 0);
__decorate([
    Class.Private()
], Template, "dragItems", void 0);
__decorate([
    Class.Private()
], Template, "dragListElement", void 0);
__decorate([
    Class.Private()
], Template, "dragItemElement", void 0);
__decorate([
    Class.Private()
], Template, "matchedElements", void 0);
Template = Template_1 = __decorate([
    Class.Describe()
], Template);
exports.Template = Template;
