import * as Control from '@singleware/ui-control';
import { Properties } from './properties';
import { Element } from './element';
/**
 * List template class.
 */
export declare class Template<T extends Object = any> extends Control.Component<Properties> {
    /**
     * List states.
     */
    private states;
    /**
     * Matched elements.
     */
    private static matchedElements;
    /**
     * Matched items.
     */
    private static matchedItems;
    /**
     * Drag type.
     */
    private static dragType?;
    /**
     * Drag list items.
     */
    private static dragItems?;
    /**
     * Drag list element.
     */
    private static dragListElement?;
    /**
     * Drag item element.
     */
    private static dragItemElement?;
    /**
     * Mirror element.
     */
    private mirror?;
    /**
     * Hidden element to hide the default drag and drop image.
     */
    private hidden;
    /**
     * List items slot.
     */
    private itemSlot;
    /**
     * Move mirror callback.
     */
    private moveMirrorCallback;
    /**
     * List styles.
     */
    private styles;
    /**
     * List skeleton.
     */
    private skeleton;
    /**
     * Updates the specified property state.
     * @param property Property name.
     * @param state Property state.
     */
    private updatePropertyState;
    /**
     * Renders a new item for the specified value.
     * @param value Value item.
     * @returns Returns the rendered item or undefined when there is no rendered output.
     */
    private renderItem;
    /**
     * Renders a new mirror element based on the specified base element.
     * @param base Base element.
     * @param x X coordinate.
     * @param y Y coordinate.
     * @returns Returns the rendered mirror element or undefined when there is no rendered output.
     */
    private renderMirror;
    /**
     * Updates the mirror position based on the specified coordinates.
     * @param mirror Mirror element.
     * @param x X coordinate.
     * @param y Y coordinate.
     */
    private updateMirrorPosition;
    /**
     * Drag start event handler.
     * @param element Item element.
     * @param event Event information.
     */
    private dragStartHandler;
    /**
     * Drag end event handler.
     */
    private dragEndHandler;
    /**
     * Drag enter event handler.
     * @param element Item element.
     * @param event Event information.
     */
    private dragEnterHandler;
    /**
     * Drag over event handler.
     * @param event Event information.
     */
    private dragOverHandler;
    /**
     * Drop event handler.
     * @param event Event information.
     */
    private dropHandler;
    /**
     * Drag enter event handler.
     */
    private dragListEnterHandler;
    /**
     * Render item event handler.
     * @param event Event information.
     */
    private renderItemHandler;
    /**
     * Render mirror event handler.
     * @param event Event information.
     */
    private renderMirrorHandler;
    /**
     * Move mirror item event handler.
     * @param event Event information.
     */
    private moveMirrorHandler;
    /**
     * Change item event handler.
     */
    private changeItemHandler;
    /**
     * Bind all element handlers.
     */
    private bindHandlers;
    /**
     * Bind exposed properties to the custom element.
     */
    private bindProperties;
    /**
     * Assign all elements properties.
     */
    private assignProperties;
    /**
     * Default constructor.
     * @param properties List properties.
     * @param children List children.
     */
    constructor(properties?: Properties, children?: any[]);
    /**
     * Gets the list name.
     */
    /**
    * Sets the list name.
    */
    name: string;
    /**
     * Gets the list type.
     */
    /**
    * Sets the list type.
    */
    type: string | undefined;
    /**
     * Gets the list values.
     */
    /**
    * Sets the list values.
    */
    value: any[];
    /**
     * Gets the default value.
     */
    readonly defaultValue: T[];
    /**
     * Gets the drag and drop state.
     */
    readonly canDragAndDrop: boolean;
    /**
     * Gets the list length.
     */
    readonly length: number;
    /**
     * Gets the empty state.
     */
    readonly empty: boolean;
    /**
     * Gets the required state.
     */
    /**
    * Sets the required state.
    */
    required: boolean;
    /**
     * Gets the read-only state.
     */
    /**
    * Sets the read-only state.
    */
    readOnly: boolean;
    /**
     * Gets the disabled state.
     */
    /**
    * Sets the disabled state.
    */
    disabled: boolean;
    /**
     * Gets the draggable state.
     */
    /**
    * Sets the draggable state.
    */
    draggable: boolean;
    /**
     * Gets the shareable state.
     */
    /**
    * Sets the shareable state.
    */
    shareable: boolean;
    /**
     * Gets the list element.
     */
    readonly element: Element;
    /**
     * Adds a new item into this list.
     * @param value Value item.
     * @returns Returns true when the item was added, false otherwise.
     */
    addItem(value: T): boolean;
    /**
     * Inserts a new item at the specified point into this list.
     * @param value Value item.
     * @param offset Value offset.
     * @returns Returns true when the item was inserted, false otherwise.
     */
    insertItem(value: T, offset: T): boolean;
    /**
     * Removes the specified item from this list.
     * @param value Value item.
     * @returns Returns true when the item was removed, false otherwise.
     */
    removeItem(value: T): boolean;
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
     * Resets the list to its initial values.
     */
    reset(): void;
}
