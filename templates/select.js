import { fixPath } from './internal'

function select({ name, bindPath, dsPath, valueIsObj, idField = 'id', codeField, displayField = 'name', onFocus,component, ...ext }) {
    var name = name || bindPath.replace('.','&')
    return {
        name: name,
        component: 'Select',
        showSearch: true,
        dropdownStyle: { maxHeight: 400, overflow: 'auto' },
        dropdownMatchSelectWidth: false,
        notFoundContent: ' ',
        allowClear: true,
        onChange: `{{{
           return (v)=> {
               if(!v){
                $sfs({
                    '${bindPath}': undefined
                 })   
                 return
               }

               if(${valueIsObj}){
                   if(!v){$sf('${bindPath}', undefined)}
                   $sfs({
                       '${bindPath}': $fromJS(${dsPath}.find(o=>o.${idField}==v), null)
                    })    
               }
               else{
                    $sf('${bindPath}', v || '')    
               }
           }
        }}}`,
        onFocus: onFocus ? `{{$${onFocus}(data)}}` : undefined,
        value: `{{{
            if(${valueIsObj}){
                return (${dsPath} && ${fixPath(`${bindPath}.${idField}`)}) || ( ${fixPath(`${bindPath}.${displayField}`)}) || undefined
            }
            else{
                return ((${fixPath(bindPath)}) && (${fixPath(bindPath)})) || undefined
            }
        }}}`,
        optionLabelProp: 'title',
        optionFilterProp: 'filter',
        children: {
            name: 'option',
            component: 'Select.Option',
            value: `{{ ${dsPath} && ${dsPath}[_rowIndex].${idField} }}`,
            title: `{{ ${dsPath} && ${dsPath}[_rowIndex].${displayField} }}`,
            filter: `{{{
                var id =  ${dsPath} && ${dsPath}[_rowIndex].${idField}
                var code =  ${dsPath} && ${dsPath}[_rowIndex].${codeField}
                var display =  ${dsPath} && ${dsPath}[_rowIndex].${displayField}
                return code ? (id+code+display) : (id+display)
            }}}`,
            children: codeField ? `{{ ${dsPath} && '(' + ${dsPath}[_rowIndex].${codeField} + ')' + ${dsPath}[_rowIndex].${displayField} }}` : `{{ ${dsPath} && ${dsPath}[_rowIndex].${displayField} }}`,
            _power: `for in ${dsPath}`
        },
        ...ext
    }
}

export default {
    select
}