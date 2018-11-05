"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the basic list template.
 */
const List = require("../source");
const DOM = require("@singleware/jsx");
/**
 * Render handler.
 * @param event Event information.
 */
function render(input) {
    return DOM.create("div", { slot: "item" }, input.name);
}
const list = DOM.create(List.Template, { onRender: render });
list.addItem({ name: 'Item A' });
list.addItem({ name: 'Item B' });
