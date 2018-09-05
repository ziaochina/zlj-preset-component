import { fixPath } from './internal'

function form({ name = 'form', className = 'simple-modal-card-form', items, component, ...ext }) {
    var ret = {
        name: 'form',
        component: 'Form',
        className: className,
        children: [],
        ...ext
    }

    items.forEach(item => {
        let x
        switch (item.type) {
            case 'treeSelect':
                x = treeSelectFormItem(item)
                break;
            case 'input':
                x = inputFormItem(item)
                break;
            case 'number':
                x = numberFormItem(item)
                break;
            case 'checkbox':
                x = checkboxFormItem(item)
                break;
            case 'datePicker':
                x = datePickerFormItem(item)
                break;
            case 'monthPicker':
                x = monthPickerFormItem(item)
                break; 
            case 'select':
                x = selectFormItem(item)
                break;
            case 'multiSelect':
                x = multiSelectFormItem(item)
                break;
            default:
                x = item
                break;
        }
        ret.children.push(x)
    })
    return ret
}

function inputFormItem(option) {
    var { name, title, required, bindPath, disabled, component, type, _power, _visible, ...ext } = option
    name = name || bindPath.replace('.','&')
    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'Input',
            value: `{{${fixPath(bindPath)}}}`,
            onChange: disabled ? undefined : `{{(e)=>$sf('${bindPath}',e.target.value)}}`,
            disabled,
            ...ext
        }],
        _power,
        _visible
    }
}

function numberFormItem(option) {
    var { name, title, required, bindPath, disabled, component, type, ...ext } = option
    name = name || bindPath.replace('.','&')
    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'Input.Number',
            value: `{{${fixPath(bindPath)}}}`,
            onChange: disabled ? undefined : `{{(v)=>$sf('${bindPath}',v)}}`,
            disabled,
            ...ext
        }],
    }
}

function datePickerFormItem(option) {
    var { name, title, required, bindPath, disabled, component, format, type, ...ext } = option
    name = name || bindPath.replace('.','&')
    format = format  || 'YYYY-MM-DD'
    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'DatePicker',
            value: `{{$stringToMoment(${fixPath(bindPath)})}}`,
            onChange: disabled ? undefined : `{{(v)=>$sf('${bindPath}', $momentToString(v,'${format}'))}}`,
            disabled,
            format,
            ...ext
        }]
    }
}

function monthPickerFormItem(option) {
    var { name, title, required, bindPath, disabled, component,  type, ...ext } = option
    name = name || bindPath.replace('.','&')
    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'DatePicker.MonthPicker',
            value: `{{${fixPath(bindPath)}}}`,
            onChange: disabled ? undefined : `{{(v)=>$sf('${bindPath}',v)}}`,
            disabled,
            ...ext
        }]
    }
}

function checkboxFormItem(option) {
    var { name, title, required, bindPath, disabled, component, type, ...ext } = option
    name = name || bindPath.replace('.','&')
    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'Checkbox',
            checked: `{{${fixPath(bindPath)}}}`,
            onChange: disabled ? undefined : `{{(e)=>$sf('${bindPath}',e.target.checked)}}`,
            disabled,
            ...ext
        }],
    }
}


function treeSelectFormItem(option) {
    var {
        name, title, required, bindPath, disabled = false,
        dsPath, idField = 'id', codeField = 'code', displayField = 'name',
        loopTreeSelectChildren = 'loopTreeSelectChildren', onFocus,
        treeFind = 'treeFind', childrenProp = 'children',
        component, type, ...ext
    } = option

    name = name || bindPath.replace('.','&')

    var fixIdField = fixPath(`${bindPath}.${idField}`),
        fixCodeField = fixPath(`${bindPath}.${codeField}`),
        fixDisplayField = fixPath(`${bindPath}.${displayField}`)


    var ret = {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'TreeSelect',
            treeDefaultExpandAll: true,
            allowClear:true,
            dropdownMatchSelectWidth: false,
            dropdownStyle: { maxHeight: 400, overflow: 'auto' },
            onChange: `{{(v)=>{
                $sf('${bindPath}', $fromJS($${treeFind}(${dsPath},v, '${idField}', '${childrenProp}'), null) || {id:null})
            }}}`,
            onFocus: onFocus ? `{{$${onFocus}(data)}}` : undefined,
            value: `{{{
                return (${dsPath} && ${fixIdField}) || ( (${fixCodeField}) && ('(' + (${fixCodeField}) + ')' + (${fixDisplayField}) )) || ''
            }}}`,
            children: `{{$${loopTreeSelectChildren}(${dsPath}, '${childrenProp}', '${idField}', '${displayField}', '${codeField}')}}`,
            disabled,
            ...ext
        }],
    }
    return ret
}




function selectFormItem(option) {
    var {
        name, title, required, bindPath, disabled = false,
        dsPath, idField = 'id', codeField, displayField = 'name',
        titleField,
        loopTreeSelectChildren = 'loopTreeSelectChildren', onFocus,
        treeFind = 'treeFind', childrenProp = 'children',
        valueIsObj = true, component, type, ...ext
    } = option

    name = name || bindPath.replace('.','&')
    titleField = titleField || displayField

    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'Select',
            showSearch: true,
            treeDefaultExpandAll: true,
            dropdownStyle: { maxHeight: 400, overflow: 'auto' },
            dropdownMatchSelectWidth: false,
            notFoundContent: ' ',
            allowClear:true,
            onChange: `{{{
               return (v)=> {
                   if(!v){
                    $sfs({
                        '${bindPath}': null,
                        '${bindPath}Id': null
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
                    return (${dsPath} && ${fixPath(`${bindPath}.${idField}`)}) || ( ${fixPath(`${bindPath}.${titleField}`)}) || ''
                }
                else{
                    return ((${fixPath(bindPath)}) && (${fixPath(bindPath)})) || ''
                }
            }}}`,
            optionLabelProp: 'title',
            optionFilterProp: 'filter',
            children: {
                name: 'option',
                component: 'Select.Option',
                value: `{{ ${dsPath} && ${dsPath}[_rowIndex].${idField} }}`,
                title: `{{ ${dsPath} && ${dsPath}[_rowIndex].${titleField} }}`,
                filter: `{{{
                    var id =  ${dsPath} && ${dsPath}[_rowIndex].${idField}
                    var code =  ${dsPath} && ${dsPath}[_rowIndex].${codeField || 'code'}
                    var display =  ${dsPath} && ${dsPath}[_rowIndex].${displayField}
                    return code ? (id+code+display) : (id+display)
                }}}`,
                children: codeField ? `{{ ${dsPath} && '(' + ${dsPath}[_rowIndex].${codeField} + ')' + ${dsPath}[_rowIndex].${displayField} }}` : `{{ ${dsPath} && ${dsPath}[_rowIndex].${displayField} }}`,
                _power: `for in ${dsPath}`
            },
            disabled,
            
            ...ext
        }],

    }
}

function multiSelectFormItem(option) {
    var {
        name, title, required, bindPath, disabled = false,
        dsPath, idField = 'id', codeField, displayField = 'name',
        titleField, relaField,
        loopTreeSelectChildren = 'loopTreeSelectChildren', onFocus,
        treeFind = 'treeFind', childrenProp = 'children',
        valueIsObj = true, component, type, ...ext
    } = option

    name = name || bindPath.replace('.','&')
    titleField = titleField || displayField

    return {
        name: name,
        component: 'Form.Item',
        label: title,
        required: required,
        children: [{
            name: name,
            component: 'Select',
            //showSearch: true,
            dropdownStyle: { maxHeight: 400, overflow: 'auto' },
            dropdownMatchSelectWidth: false,
            notFoundContent: ' ',
            allowClear:false,
            onChange: `{{{
               return (v)=> {
                   var sels = []
                   v.forEach((o)=>{
                        let hit = ${dsPath}.find(x=>x.${idField}==o)
                        if(hit){
                            let hit1 = ${bindPath}.find(x=>x.${relaField}==o)
                            let relaObjField = '${relaField}'
                            relaObjField = relaObjField.substr(0,relaObjField.length -2 )
                            if(hit1){
                                sels.push({
                                    ...hit1,
                                    [relaObjField]:hit
                                })
                            }
                            else{
                                sels.push({
                                    [relaObjField]:hit,
                                    ${relaField}:hit.id
                                })
                            }
                        }
                   })
                   $sf('${bindPath}', $fromJS(sels,null))    
               }
            }}}`,
            onFocus: onFocus ? `{{$${onFocus}(data)}}` : undefined,
            value: `{{{
                if(!${bindPath}) return
                let relaObjField = '${relaField}'
                relaObjField = relaObjField.substr(0,relaObjField.length -2 )
                if(${dsPath}){
                    var ret = ${bindPath}.reduce((a,b)=> {a.push(b.${relaField}+''); return a;}, [])
                    return ret.length > 0 ? ret : []
                }
                else{
                    var ret =  ${bindPath}.reduce((a,b)=>{a.push(b[relaObjField].name); return a;},[])
                    return ret.length > 0 ? ret : []
                }
                
            }}}`,
            //optionLabelProp: 'title',
            optionFilterProp: 'filter',
            children: {
                name: 'option',
                component: 'Select.Option',
                key: `{{ ${dsPath} && ${dsPath}[_rowIndex].${idField} }}`,
                //value: `{{ ${dsPath} && ${dsPath}[_rowIndex].${idField} }}`,
                //title: `{{ ${dsPath} && ${dsPath}[_rowIndex].${titleField} }}`,
                filter: `{{{
                    var id =  ${dsPath} && ${dsPath}[_rowIndex].${idField}
                    var code =  ${dsPath} && ${dsPath}[_rowIndex].${codeField || 'code'}
                    var display =  ${dsPath} && ${dsPath}[_rowIndex].${displayField}
                    return code ? (id+code+display) : (id+display)
                }}}`,
                children: codeField ? `{{ ${dsPath} && '(' + ${dsPath}[_rowIndex].${codeField} + ')' + ${dsPath}[_rowIndex].${displayField} }}` : `{{ ${dsPath} && ${dsPath}[_rowIndex].${displayField} }}`,
                _power: `for in ${dsPath}`
            },
            disabled,
            
            ...ext
        }],

    }
}

export default {
    form
}