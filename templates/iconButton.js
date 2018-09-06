function iconButton({ icon = 'plus', title, onClick,
    fontFamily = 'awesome', type = 'softly', key = title, component, ...ext }) {

    return {
        name: key,
        component: 'Button',
        className: 'common-icon-button',
        type: type,
        //iconFontFamily: fontFamily,
        title: title,
        icon: icon,
        onClick: onClick ? `{{$${onClick}(data)}}` : undefined,
        ...ext
    }
}

export default {
    iconButton
}