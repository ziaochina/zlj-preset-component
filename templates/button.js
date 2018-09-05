function button({ title, onClick, type = 'bluesky', key = title, component, ...ext }) {
    return {
        name: key,
        component: 'Button',
        type: type,
        children: title,
        onClick: onClick ? `{{$${onClick}(data)}}` : undefined,
        ...ext
    }
}

export default {
    button
}