import XEUtils from 'xe-utils'

function getFormatDate (value, props, defaultFormat) {
  return XEUtils.toDateString(value, props.format || defaultFormat)
}

function getFormatDates (values, props, separator, defaultFormat) {
  return XEUtils.map(values, date => getFormatDate(date, props, defaultFormat)).join(separator)
}

function equalDaterange (cellValue, data, props, defaultFormat) {
  cellValue = getFormatDate(cellValue, props, defaultFormat)
  return cellValue >= getFormatDate(data[0], props, defaultFormat) && cellValue <= getFormatDate(data[1], props, defaultFormat)
}

function matchCascaderData (index, list, values, labels) {
  let val = values[index]
  if (list && values.length > index) {
    XEUtils.each(list, item => {
      if (item.value === val) {
        labels.push(item.label)
        matchCascaderData(++index, item.children, values, labels)
      }
    })
  }
}

function getProps ({ $table }, { props }) {
  return XEUtils.assign($table.vSize ? { size: $table.vSize } : {}, props)
}

function getCellEvents (editRender, params) {
  let { events } = editRender
  let { $table } = params
  let type = 'on-change'
  let on = {
    [type]: () => $table.updateStatus(params)
  }
  if (events) {
    XEUtils.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
  }
  return on
}

function defaultCellRender (h, editRender, params) {
  let { row, column } = params
  let { attrs } = editRender
  let props = getProps(params, editRender)
  return [
    h(editRender.name, {
      props,
      attrs,
      model: {
        value: XEUtils.get(row, column.property),
        callback (value) {
          XEUtils.set(row, column.property, value)
        }
      },
      on: getCellEvents(editRender, params)
    })
  ]
}

function getFilterEvents (on, filterRender, params) {
  let { events } = filterRender
  if (events) {
    XEUtils.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
  }
  return on
}

function defaultFilterRender (h, filterRender, params, context) {
  let { column } = params
  let { name, attrs } = filterRender
  let type = 'on-change'
  let props = getProps(params, filterRender)
  return column.filters.map(item => {
    return h(name, {
      props,
      attrs,
      model: {
        value: item.data,
        callback (optionValue) {
          item.data = optionValue
        }
      },
      on: getFilterEvents({
        [type] () {
          handleConfirmFilter(context, column, !!item.data, item)
        }
      }, filterRender, params)
    })
  })
}

function handleConfirmFilter (context, column, checked, item) {
  context[column.filterMultiple ? 'changeMultipleOption' : 'changeRadioOption']({}, checked, item)
}

function defaultFilterMethod ({ option, row, column }) {
  let { data } = option
  let cellValue = XEUtils.get(row, column.property)
  return cellValue === data
}

function renderOptions (h, options, optionProps) {
  let labelProp = optionProps.label || 'label'
  let valueProp = optionProps.value || 'value'
  return XEUtils.map(options, (item, index) => {
    return h('Option', {
      props: {
        value: item[valueProp],
        label: item[labelProp]
      },
      key: index
    })
  })
}

function cellText (h, cellValue) {
  return ['' + (cellValue === null || cellValue === void 0 ? '' : cellValue)]
}

/**
 * 渲染函数
 */
const renderMap = {
  Input: {
    autofocus: 'input.ivu-input',
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  AutoComplete: {
    autofocus: 'input.ivu-input',
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  InputNumber: {
    autofocus: 'input.ivu-input-number-input',
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  Select: {
    renderEdit (h, editRender, params) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = editRender
      let { row, column } = params
      let { attrs } = editRender
      let props = getProps(params, editRender)
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return [
          h('Select', {
            props,
            attrs,
            model: {
              value: XEUtils.get(row, column.property),
              callback (cellValue) {
                XEUtils.set(row, column.property, cellValue)
              }
            },
            on: getCellEvents(editRender, params)
          }, XEUtils.map(optionGroups, (group, gIndex) => {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        ]
      }
      return [
        h('Select', {
          props,
          attrs,
          model: {
            value: XEUtils.get(row, column.property),
            callback (cellValue) {
              XEUtils.set(row, column.property, cellValue)
            }
          },
          on: getCellEvents(editRender, params)
        }, renderOptions(h, options, optionProps))
      ]
    },
    renderCell (h, editRender, params) {
      let { options, optionGroups, props = {}, optionProps = {}, optionGroupProps = {} } = editRender
      let { row, column } = params
      let labelProp = optionProps.label || 'label'
      let valueProp = optionProps.value || 'value'
      let groupOptions = optionGroupProps.options || 'options'
      let cellValue = XEUtils.get(row, column.property)
      if (!(cellValue === null || cellValue === undefined || cellValue === '')) {
        return cellText(h, XEUtils.map(props.multiple ? cellValue : [cellValue], optionGroups ? value => {
          let selectItem
          for (let index = 0; index < optionGroups.length; index++) {
            selectItem = XEUtils.find(optionGroups[index][groupOptions], item => item[valueProp] === value)
            if (selectItem) {
              break
            }
          }
          return selectItem ? selectItem[labelProp] : null
        } : value => {
          let selectItem = XEUtils.find(options, item => item[valueProp] === value)
          return selectItem ? selectItem[labelProp] : null
        }).join(';'))
      }
      return cellText(h, '')
    },
    renderFilter (h, filterRender, params, context) {
      let { options, optionGroups, optionProps = {}, optionGroupProps = {} } = filterRender
      let { column } = params
      let { attrs } = filterRender
      let props = getProps(params, filterRender)
      if (optionGroups) {
        let groupOptions = optionGroupProps.options || 'options'
        let groupLabel = optionGroupProps.label || 'label'
        return column.filters.map(item => {
          return h('Select', {
            props,
            attrs,
            model: {
              value: item.data,
              callback (optionValue) {
                item.data = optionValue
              }
            },
            on: getFilterEvents({
              'on-change' (value) {
                handleConfirmFilter(context, column, value && value.length > 0, item)
              }
            }, filterRender, params)
          }, XEUtils.map(optionGroups, (group, gIndex) => {
            return h('OptionGroup', {
              props: {
                label: group[groupLabel]
              },
              key: gIndex
            }, renderOptions(h, group[groupOptions], optionProps))
          }))
        })
      }
      return column.filters.map(item => {
        return h('Select', {
          props,
          attrs,
          model: {
            value: item.data,
            callback (optionValue) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            'on-change' (value) {
              handleConfirmFilter(context, column, value && value.length > 0, item)
            }
          }, filterRender, params)
        }, renderOptions(h, options, optionProps))
      })
    },
    filterMethod ({ option, row, column }) {
      let { data } = option
      let { property, filterRender } = column
      let { props = {} } = filterRender
      let cellValue = XEUtils.get(row, property)
      if (props.multiple) {
        if (XEUtils.isArray(cellValue)) {
          return XEUtils.includeArrays(cellValue, data)
        }
        return data.indexOf(cellValue) > -1
      }
      return cellValue === data
    }
  },
  Cascader: {
    renderEdit: defaultCellRender,
    renderCell (h, { props = {} }, params) {
      let { row, column } = params
      let cellValue = XEUtils.get(row, column.property)
      let values = cellValue || []
      let labels = []
      matchCascaderData(0, props.data, values, labels)
      return cellText(h, labels.join(` ${props.separator || '/'} `))
    }
  },
  DatePicker: {
    renderEdit: defaultCellRender,
    renderCell (h, { props = {} }, params) {
      let { row, column } = params
      let { separator } = props
      let cellValue = XEUtils.get(row, column.property)
      switch (props.type) {
        case 'week':
          cellValue = getFormatDate(cellValue, props, 'yyyywWW')
          break
        case 'month':
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM')
          break
        case 'year':
          cellValue = getFormatDate(cellValue, props, 'yyyy')
          break
        case 'dates':
          cellValue = getFormatDates(cellValue, props, ', ', 'yyyy-MM-dd')
          break
        case 'daterange':
          cellValue = getFormatDates(cellValue, props, ` ${separator || '-'} `, 'yyyy-MM-dd')
          break
        case 'datetimerange':
          cellValue = getFormatDates(cellValue, props, ` ${separator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
          break
        default:
          cellValue = getFormatDate(cellValue, props, 'yyyy-MM-dd')
          break
      }
      return cellText(h, cellValue)
    },
    renderFilter (h, filterRender, params, context) {
      let { column } = params
      let { attrs } = filterRender
      let props = getProps(params, filterRender)
      return column.filters.map(item => {
        return h(filterRender.name, {
          props,
          attrs,
          model: {
            value: item.data,
            callback (optionValue) {
              item.data = optionValue
            }
          },
          on: getFilterEvents({
            'on-change' (value) {
              handleConfirmFilter(context, column, !!value, item)
            }
          }, filterRender, params)
        })
      })
    },
    filterMethod ({ option, row, column }) {
      let { data } = option
      let { filterRender } = column
      let { props = {} } = filterRender
      let cellValue = XEUtils.get(row, column.property)
      if (data) {
        switch (props.type) {
          case 'daterange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM-dd')
          case 'datetimerange':
            return equalDaterange(cellValue, data, props, 'yyyy-MM-dd HH:ss:mm')
          default:
            return cellValue === data
        }
      }
      return false
    }
  },
  TimePicker: {
    renderEdit: defaultCellRender
  },
  Rate: {
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  },
  iSwitch: {
    renderEdit: defaultCellRender,
    renderFilter: defaultFilterRender,
    filterMethod: defaultFilterMethod
  }
}

/**
 * 事件兼容性处理
 */
function handleClearEvent (params, evnt, context) {
  let { getEventTargetNode } = context
  if (
    // 下拉框、日期
    getEventTargetNode(evnt, document.body, 'ivu-select-dropdown').flag
  ) {
    return false
  }
}

const VXETablePluginIView = {
  install ({ interceptor, renderer }) {
    // 添加到渲染器
    renderer.mixin(renderMap)
    // 处理事件冲突
    interceptor.add('event.clear_filter', handleClearEvent)
    interceptor.add('event.clear_actived', handleClearEvent)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginIView)
}

export default VXETablePluginIView
