import { fixPath } from './internal'

function readonlyGrid({ name = 'dataGrid', bindPath = 'data.list',
    paginationPath = 'data.pagination', onPageChange = 'pageChanged',
    footerClassName = 'f-table-content-footer', columns, 
    component, footerVisible = true, ...ext }) {
    var ret = [{
        name: name,
        component: 'DataGrid',
        headerHeight: 30,
        rowHeight: 30,
        enableSequence: true,
        startSequence: `{{(${paginationPath}.current-1)*${paginationPath}.pageSize + 1}}`,
        rowsCount: `{{${bindPath}.length}}`,
        onColumnResizeEndCallback: `{{$onColumnResizeEndCallback('${name}',data)}}`,
        columnWidths: `{{data.other && data.other.${name}ColumnWidths}}`,
        columns: [],
        ...ext
    }]
    if(footerVisible){
        ret.push({
            name: 'footer',
            className: footerClassName,
            component: 'Layout',
            children: [{
                name: 'selectedCount',
                component: '::h3',
                children: `{{'选中' + $getSelectedCount('${name}') + '条'}}`
            }, {
                name: 'pagination',
                component: 'Pagination',
                showSizeChanger: true,
                pageSize: `{{${paginationPath}.pageSize}}`,
                current: `{{${paginationPath}.current}}`,
                total: `{{${paginationPath}.total}}`,
                onChange: `{{$${onPageChange}}}`,
                onShowSizeChange: `{{$${onPageChange}}}`
            }]
        })
    }

    columns.forEach(c => {
        var option = { ...c, grid: name, bindPath }, x
        switch (c.type) {
            case 'sel':
                x = gridSelColumn(option)
                break;
            case 'modifyAndDel':
                x = gridModifyAndDelColumn(option)
                break;
            case 'del':
                x = gridDelColumn(option)
                break;
            case 'link':
                x = gridLinkColumn(option)
                break;
            case 'boolText':
                x = gridBoolTextColumn(option)
                break;
            case 'numberText':
                x = gridNumberTextColumn(option)
                break;
            case 'datePickerText':
                x = gridDatePickerTextColumn(option)
                break;
            case 'text':
                x = gridTextColumn(option)
                break;
            default:
                x = c
                break;
        }
        ret[0].columns.push(x)
    })
    return ret
}

function editableGrid({ name = 'grid', bindPath, columns, component, type, ...ext }) {
    var ret = {
        name: name,
        component: 'DataGrid',
        headerHeight: 30,
        rowHeight: 30,
        rowsCount: `{{${bindPath}.length}}`,
        enableSequence: true,
        enableAddDelrow: true,
        startSequence: 1,
        readonly: false,
        onAddrow: `{{$addRow('${name}')}}`,
        onDelrow: `{{$delRow('${name}')}}`,
        onKeyDown: '{{$gridKeydown}}',
        scrollToColumn: `{{data.other.${name}ScrollToColumn}}`,
        scrollToRow: `{{data.other.${name}ScrollToRow}}`,
        onColumnResizeEndCallback: `{{$onColumnResizeEndCallback('${name}',data)}}`,
        columnWidths: `{{data.other && data.other.${name}ColumnWidths}}`,
        columns: [],
        ...ext
    }

    columns.forEach(c => {
        let option = { ...c, grid: name, bindPath }, x

        switch (c.type) {
            case 'input':
                x = gridInputColumn(option)
                break;
            case 'number':
                x = gridNumberColumn(option)
                break;
            case 'datePicker':
                x = gridDatePickerColumn(option)
                break;
            case 'select':
                x = gridSelectColumn(option)
                break;
            case 'checkbox':
                x = gridCheckboxColumn(option)
                break;
            case 'text':
                x = gridReadonlyColumn(option)
                break;
            default:
                x = c;
                break;

        }
        ret.columns.push(x)
    })
    return ret
}

function gridReadonlyColumn(option) {
    var {
        name, bindPath, bindField, title, width = 130, flexGrow = 1, required,
        align = 'left', component, type, fixed, _visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    var ret = {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow,
        width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: title
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            className: `f-table-cell f-table-cell-${align} f-table-cell-disabled`,
            children: `{{${fixPath(`${bindPath}[_rowIndex].${bindField}`)}}}`,
            
            /*[{
                name: 'disabled',
                component: 'Icon',
                fontFamily: 'awesome',
                type: 'ban'
            }, `{{{return ${fixPath(`${bindPath}[_rowIndex].${bindField}`)}}}}`],*/
            _power: '({rowIndex})=>rowIndex',
            ...ext
        },
        fixed,
        _visible
    }
    return ret
}

function gridSelColumn(option) {
    var { grid, bindPath, bindField, component, type, ...ext } = option

    return {
        name: 'sel',
        component: 'DataGrid.Column',
        columnKey: 'sel',
        width: 40,
        fixed: true,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: {
                name: 'cb',
                component: 'Checkbox',
                checked: `{{$isSelectAll('${grid}')}}`,
                onChange: `{{$selectAll('${grid}')}}`
            }
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            children: {
                name: 'checkbox',
                component: 'Checkbox',
                checked: `{{${bindPath}[_rowIndex].${bindField}}}`,
                onChange: `{{ (e, option) => $sf('${bindPath}.' + _rowIndex + '.${bindField}', e.target.checked ) }}`,
            },
            _power: '({rowIndex})=>rowIndex',
            ...ext
        }
    }
}

function gridModifyAndDelColumn(option){
    var { bindPath, bindField, onDel, onModify, component, type } = option
    return {
        name: 'modifyAndDel',
        component: 'DataGrid.Column',
        columnKey: 'modifyAndDel',
        fixed: true,
        width: 70,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: '操作'
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            _power: '({rowIndex})=>rowIndex',
            children: [{
                name: 'del',
                component: 'Icon',
                showStyle: 'showy',
                type: 'close',
                style: {
                    fontSize: 18
                },
                title: '删除',
                onClick: `{{$${onDel}(${bindPath}[_rowIndex])}}`,
            },{
                name: 'modify',
                component: 'Icon',
                showStyle: 'softly',
                type: 'edit',
                style: {
                    fontSize: 18
                },
                title: '修改',
                onClick: `{{$${onModify}(${bindPath}[_rowIndex])}}`,
            }]
        },
    }
}

function gridDelColumn(option) {
    var { bindPath, bindField, onDel, component, type, ...ext } = option
    return {
        name: 'del',
        component: 'DataGrid.Column',
        columnKey: 'del',
        fixed: true,
        width: 40,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: '操作'
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            _power: '({rowIndex})=>rowIndex',
            children: [{
                name: 'del',
                component: 'Icon',
                showStyle: 'showy',
                type: 'close',
                style: {
                    fontSize: 18
                },
                title: '删除',
                onClick: `{{$${onDel}(${bindPath}[_rowIndex])}}`,
                ...ext
            }]
        },
    }
}

function gridLinkColumn(option) {
    var {
        bindPath, name, title, width = 130, flexGrow = 1, align = 'left', bindField,
        idField, onClick, component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    var ret = {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow,
        width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: title
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            className: `f-table-cell f-table-cell-${align}`,
            children: {
                name: 'link',
                component: '::a',
                children: `{{${bindPath}[_rowIndex].${bindField}}}`,
                onClick: `{{$${onClick}(${bindPath}[_rowIndex])}}`
            },
            _power: '({rowIndex})=>rowIndex',
            ...ext
        },
        fixed,
        _visible
    }
    return ret
}

function gridTextColumn(option) {
    var {
        name, bindPath, bindField, title, width = 130, flexGrow = 1,
        required, align = 'left', component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    var ret = {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow: flexGrow,
        width: width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: title
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            className: `f-table-cell f-table-cell-${align}`,
            _power: '({rowIndex})=>rowIndex',
            children: `{{${fixPath(`${bindPath}[_rowIndex].${bindField}`)}}}`,
            ...ext
        },
        fixed,
        _visible
    }
    return ret
}

function gridBoolTextColumn(option) {
    var {
        name, bindPath, bindField, title, width = 130, flexGrow = 1,
        required, align = 'center', component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    var ret = {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow: flexGrow,
        width: width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: title
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            className: `f-table-cell f-table-cell-${align}`,
            _power: '({rowIndex})=>rowIndex',
            children: `{{{
                var o = (${fixPath(`${bindPath}[_rowIndex].${bindField}`)})
                return (o || o == '1' || o == 'true') ? '是' : '否'
            }}}`,
            ...ext
        },
        fixed,
        _visible
    }
    return ret
}

function gridNumberTextColumn(option) {
    var {
        name, bindPath, bindField, title, width = 130, flexGrow = 1,
        required, align = 'right', component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    var ret = {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow: flexGrow,
        width: width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: title
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            className: `f-table-cell f-table-cell-${align}`,
            _power: '({rowIndex})=>rowIndex',
            children: `{{${fixPath(`${bindPath}[_rowIndex].${bindField}`)}}}`,
            ...ext
        },
        fixed,
        _visible
    }
    return ret
}

function gridDatePickerTextColumn(option) {
    var {
        name, bindPath, bindField, title, width = 130, flexGrow = 1,
        required, align = 'center', component, type, format,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')
    format = format || 'YYYY-MM-DD'

    var ret = {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow: flexGrow,
        width: width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: title
        },
        cell: {
            name: 'cell',
            component: 'DataGrid.Cell',
            className: `f-table-cell f-table-cell-${align}`,
            _power: '({rowIndex})=>rowIndex',
            children: `{{{
                var o = ${fixPath(`${bindPath}[_rowIndex].${bindField}`)}
                if(!o) return ''
                o = $stringToMoment(o)
                return  $momentToString(o,'${format}')
            }}}`,
            ...ext
        },
        fixed,
        _visible
    }
    return ret
}

function gridInputColumn(option) {
    var {
        grid, name, bindPath, bindField, title, width = 130, flexGrow = 1, required,
        align = 'left', component, type, onFocus,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    return {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow: flexGrow,
        width: width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: [{
                name: 'label',
                component: '::label',
                className: required ? 'ant-form-item-required' : '',
                children: title
            }]
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Input' : 'DataGrid.TextCell'}}",
            className: `{{$getCellClassName(_ctrlPath,'${align}')}}`,
            value: `{{${bindPath}[_rowIndex].${bindField}}}`,
            onChange: `{{(e)=> $cellChange('${grid}', _rowIndex, '${bindField}', e.target.value)}}`,
            _power: '({rowIndex})=>rowIndex',
            ...ext
        },
        fixed,
        _visible
    }
}

function gridNumberColumn(option) {
    var {
        grid, name, bindPath, bindField, title, width = 130, flexGrow = 1, required,
        align = 'left', component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    return {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow: flexGrow,
        width: width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: [{
                name: 'label',
                component: '::label',
                className: required ? 'ant-form-item-required' : '',
                children: title
            }]
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Input.Number' : 'DataGrid.TextCell'}}",
            className: `{{$getCellClassName(_ctrlPath,'${align}')}}`,
            value: `{{${bindPath}[_rowIndex].${bindField}}}`,
            onChange: `{{(v)=> { 
                $cellChange('${grid}', _rowIndex, '${bindField}', v)
            }}}`,
            _power: '({rowIndex})=>rowIndex',
            ...ext
        },
        fixed,
        _visible

    }
}

function gridCheckboxColumn(option) {
    var {
        grid, name, bindPath, bindField, title, width = 130, flexGrow = 1, required,
        align = 'left', component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')

    return {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow,
        width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: [{
                name: 'label',
                component: '::label',
                className: required ? 'ant-form-item-required' : '',
                children: title
            }]
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Checkbox' : 'DataGrid.TextCell'}}",
            className: `{{$getCellClassName(_ctrlPath,'${align}')}}`,
            checked: `{{${bindPath}[_rowIndex].${bindField}}}`,
            onChange: `{{(e)=> $cellChange('${grid}', _rowIndex, '${bindField}', e.target.checked)}}`,
            value: `{{${bindPath}[_rowIndex].${bindField} ? '是': '否'}}`,
            _power: '({rowIndex})=>rowIndex',
            ...ext
        },
        fixed,
        _visible
    }
}


function gridDatePickerColumn(option) {
    var {
        grid, name, bindPath, bindField, title, width = 130, flexGrow = 1, required,
        align = 'left', format = 'YYYY-MM-DD', component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')
    
    return {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow,
        width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: [{
                name: 'label',
                component: '::label',
                className: required ? 'ant-form-item-required' : '',
                children: title
            }]
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'DatePicker' : 'DataGrid.TextCell'}}",
            className: `{{$getCellClassName(_ctrlPath,'${align}')}}`,
            value: `{{{
                return $isFocus(_ctrlPath)
                    ? $stringToMoment(${bindPath}[_rowIndex].${bindField})
                    : ${bindPath}[_rowIndex].${bindField} && $stringToMoment(${bindPath}[_rowIndex].${bindField}).format('${format}')
            }}}`,
            onChange: `{{(v)=> $cellChange('${grid}',_rowIndex, '${bindField}',  $momentToString(v,'${format}'))}}`,
            _power: '({rowIndex})=>rowIndex',
            format,
            ...ext
        },
        fixed,
        _visible
    }
}


function gridSelectColumn(option) {
    var {
        grid, name, bindPath, bindField, title, width = 130, flexGrow = 1, required,
        align = 'left', dsPath, valueIsObj = true, idField = 'id', codeField,
        displayField = 'name', titleField, onFocus, component, type,fixed,_visible, ...ext
    } = option

    name = name || bindField.replace('.', '&')
    titleField = titleField || displayField

    return {
        name,
        component: 'DataGrid.Column',
        columnKey: name,
        flexGrow,
        width,
        header: {
            name: 'header',
            component: 'DataGrid.Cell',
            children: [{
                name: 'label',
                component: '::label',
                className: required ? 'ant-form-item-required' : '',
                children: title
            }]
        },
        cell: {
            name: 'cell',
            component: "{{$isFocus(_ctrlPath) ? 'Select' : 'DataGrid.TextCell'}}",
            className: `{{$getCellClassName(_ctrlPath,'${align}')}}`,
            optionLabelProp: 'title',
            optionFilterProp: 'filter',
            dropdownMatchSelectWidth: false,
            notFoundContent: ' ',
            allowClear:true,
            value: `{{{
                if( $isFocus(_ctrlPath) ){
                    if(${valueIsObj}){
                        return ( ${dsPath} && ${fixPath(`${bindPath}[_rowIndex].${bindField}.${idField}`)})
                            || (${fixPath(`${bindPath}[_rowIndex].${bindField}.${titleField}`)}) 
                            || ''
                    }
                    else{
                        return  ${fixPath(`${bindPath}[_rowIndex].${bindField}`)}
                    }
                }
                else{
                    if(${valueIsObj}){
                        return ( ${fixPath(`${bindPath}[_rowIndex].${bindField}.${titleField}`)}) || ''
                    }
                    else{
                        var v =  ${fixPath(`${bindPath}[_rowIndex].${bindField}`)}
                        v = ${dsPath} && v && ${dsPath}.find(o=>o.${idField}==v)
                        return  v && v.${titleField}
                    }
                }
            }}}`,
            children: {
                name: 'option',
                component: 'Select.Option',
                value: `{{${dsPath}[_lastIndex].${idField}}}`,
                title: `{{ ${dsPath} && ${dsPath}[_lastIndex].${titleField} }}`,
                filter: `{{{
                    var id =  ${dsPath} && ${dsPath}[_lastIndex].${idField}
                    var code =  ${dsPath} && ${dsPath}[_lastIndex].${codeField || 'code'}
                    var display =  ${dsPath} && ${dsPath}[_lastIndex].${displayField}
                    return code ? (id+code+display) : (id+display)
                }}}`,
                children: codeField ? `{{ ${dsPath} && '(' + ${dsPath}[_lastIndex].${codeField} + ')' + ${dsPath}[_lastIndex].${displayField} }}` : `{{ ${dsPath} && ${dsPath}[_lastIndex].${displayField} }}`,
                _power: `for in ${dsPath}`
            },
            onChange: `{{(v)=>{
                var r = v || ''
                if(${valueIsObj}){
                    const obj = ${dsPath}.find(o=>o.${idField}==v)
                    r =  $fromJS(obj,undefined)
                }
                $cellChange('${grid}', _rowIndex, '${bindField}', r )
            }}}`,
            onFocus: onFocus ? `{{$${onFocus}(data,_rowIndex)}}` : undefined,
            _excludeProps: "{{$isFocus(_ctrlPath)? ['onClick'] : ['children', 'optionLabelProp', 'onFocus'] }}",
            _power: '({rowIndex})=>rowIndex',
            ...ext
        },
        fixed,
        _visible
    }
}

export default {
    readonlyGrid,
    editableGrid
}