/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the basic list template.
 */
import * as List from '../source';
import * as DOM from '@singleware/jsx';

/**
 * Render handler.
 * @param event Event information.
 */
function renderItem(input: any): HTMLElement {
  return <div slot="item">{input.name}</div> as HTMLDivElement;
}

const list = <List.Template onRenderItem={renderItem} /> as List.Element;

list.addItem({ name: 'Item A' });
list.addItem({ name: 'Item B' });
