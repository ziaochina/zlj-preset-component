const pkgJson = require('./package.json')

__webpack_public_path__ = window[`__pub_${pkgJson.name}__`];

import { defaultComponent } from 'mk-meta-engine'
import { form, readonlyGrid, editableGrid, iconButton, button, sortMenu, select, search } from './templates'
const data = require('./data')
const config = require('./config')
require('./style.less')

MK && MK.metaEngine.templateFactory.registerTemplates([{
    name: 'iconButton',
    templateHandler: iconButton
}, {
    name: 'button',
    templateHandler: button
}, {
    name: 'select',
    templateHandler: select
}, {
    name: 'search',
    templateHandler: search
}, {
    name: 'sortMenu',
    templateHandler: sortMenu
}, {
    name: 'readonlyGrid',
    templateHandler: readonlyGrid
}, {
    name: 'form',
    templateHandler: form
}, {
    name: 'editableGrid',
    templateHandler: editableGrid
}])

export default {
    name: pkgJson.name,
    version: pkgJson.version,
    description: pkgJson.description,
    meta: data.getMeta(),
    components: [],
    config: config,
    load: (cb) => {
        cb(defaultComponent, require('./action'), require('./reducer'))
    }
}