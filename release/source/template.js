"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const DOM = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * List template class.
 */
let Template = class Template extends Control.Component {
    /**
     * Default constructor.
     * @param properties List properties.
     * @param children List children.
     */
    constructor(properties, children) {
        super(properties, children);
        /**
         * List states.
         */
        this.states = {
            name: '',
            items: [],
            required: false,
            readOnly: false,
            disabled: false,
            draggable: false
        };
        /**
         * Hidden element to hide the default drag and drop image.
         */
        this.hidden = DOM.create("span", { style: "position: absolute; height: 0px; width: 0px; left: 0px; top: 0px;" });
        /**
         * List items slot.
         */
        this.itemSlot = DOM.create("slot", { name: "item", class: "item" });
        /**
         * Matched elements.
         */
        this.matchedElements = new WeakMap();
        /**
         * Matched items.
         */
        this.matchedItems = new WeakMap();
        /**
         * Move mirror callback.
         */
        this.moveMirrorCallback = this.moveMirrorHandler.bind(this);
        /**
         * List styles.
         */
        this.styles = (DOM.create("style", null, `:host {
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
        this.skeleton = (DOM.create("div", { slot: this.properties.slot, class: this.properties.class }, this.children));
        DOM.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.itemSlot);
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
     * Renders a new item for the specified data.
     * @param data Item data.
     * @returns Returns the rendered item or undefined when there is no rendered output.
     */
    renderItem(data) {
        const detail = { input: data, output: void 0 };
        const event = new CustomEvent('renderitem', { bubbles: true, cancelable: true, detail: detail });
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
     * Notify changes into this list.
     */
    notifyChanges() {
        this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
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
     * @param item Item element.
     * @param event Event information.
     */
    dragStartHandler(item, event) {
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
    dragEndHandler() {
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
    dragEnterHandler(item, event) {
        if (this.current && this.current !== item) {
            const list = this.states.items;
            const source = list.splice(list.indexOf(this.matchedElements.get(this.current)), 1)[0];
            if (item.offsetTop + item.offsetHeight / 2 <= event.pageY) {
                if (item.previousSibling) {
                    list.splice(list.indexOf(this.matchedElements.get(item)), 0, source);
                }
                else {
                    list.unshift(source);
                }
                this.skeleton.insertBefore(this.current, item);
            }
            else {
                if (item.nextSibling) {
                    list.splice(list.indexOf(this.matchedElements.get(item.nextSibling)), 0, source);
                }
                else {
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
            this.notifyChanges();
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
        this.skeleton.addEventListener('change', this.changeItemHandler.bind(this));
    }
    /**
     * Bind exposed properties to the custom element.
     */
    bindProperties() {
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
    assignProperties() {
        this.assignComponentProperties(this.properties, ['name', 'value', 'required', 'readOnly', 'disabled', 'draggable', 'readOnly']);
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
     * Gets the list element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Adds a new item into this list.
     * @param data Item data.
     * @returns Returns true when the item was added, false otherwise.
     */
    addItem(data) {
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
    insertItem(data, offset) {
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
    removeItem(data) {
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
    clear() {
        DOM.clear(this.skeleton);
        this.states.items = [];
    }
    /**
     * Checks the list validity.
     * @returns Returns true when the list is valid, false otherwise.
     */
    checkValidity() {
        return ((!this.required || !this.empty) &&
            Control.listChildrenByProperty(this.itemSlot, 'checkValidity', (item) => (item.checkValidity() ? void 0 : false)) !== false);
    }
    /**
     * Reports the list validity.
     * @returns Returns true when the list is valid, false otherwise.
     */
    reportValidity() {
        return ((!this.required || !this.empty) &&
            Control.listChildrenByProperty(this.itemSlot, 'reportValidity', (item) => (item.reportValidity() ? void 0 : false)) !== false);
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
__decorate([
    Class.Private()
], Template.prototype, "states", void 0);
__decorate([
    Class.Private()
], Template.prototype, "current", void 0);
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
], Template.prototype, "matchedElements", void 0);
__decorate([
    Class.Private()
], Template.prototype, "matchedItems", void 0);
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
], Template.prototype, "notifyChanges", null);
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
Template = __decorate([
    Class.Describe()
], Template);
exports.Template = Template;
