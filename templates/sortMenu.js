function sortMenu({ bindPath, selectedClassName, onClick, options = [], component, ...ext}) {
    var ret = {
        name: 'sort',
        component: 'Dropdown',
        overlay: {
            name: 'menu',
            component: 'Menu',
            onClick: onClick ? `{{$${onClick}}}` : undefined,
            children: []
        },
        children: {
            name: 'sort',
            component: 'Button',
            className: 'common-icon-button',
            type: 'softly',
            iconFontFamily: 'awesome',
            icon: 'sort-amount-desc',
        }
    }

    options.forEach(o => {
        ret.overlay.children.push({
            name: o.key,
            component: 'Menu.Item',
            key: o.key,
            className: `{{${bindPath || 'data.filter.orderBy'} == '${o.key}' ? '${selectedClassName || 'sort-selected'}':'' }}`,
            children: [o.title, {
                name: 'checked',
                component: 'Icon',
                type: 'check',
                _visible: `{{${bindPath || 'data.filter.orderBy'} == '${o.key}'}}`
            }],
        })
    })
    return ret
}

export default {
    sortMenu
}