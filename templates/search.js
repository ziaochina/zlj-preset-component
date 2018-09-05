import { fixPath } from './internal'

function search({ name, bindPath, dsPath, valueIsObj, idField = 'id', codeField, displayField = 'name', onFocus,component, ...ext }) {
    var name = name || bindPath.replace('.','&')
    return {
        name,
        component: 'Input.Search',
        value: `{{${bindPath}}}`,
        onChange: `{{ (e)=>{$sf('${bindPath}', e.target.value);$searchChange(e.target.value)}}}`,
        ...ext
    }
}

export default {
    search
}