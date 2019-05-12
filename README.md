# vxe-table-plugin-iview

[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-iview.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-iview)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-iview.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-iview)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-iview/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vxe-table-plugin-iview/blob/master/LICENSE)

该插件用于 vxe-table 列中渲染 iview 组件中提供简化的配置

## API

### edit-render 配置项说明

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 支持的渲染组件 | String | Input / InputNumber / Select / Cascader / DatePicker / TimePicker / Rate / iSwitch | — |
| props | 渲染组件附加属性，参数请查看被渲染的 Component props | Object | — | {} |
| options | 只对 name=Select 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=Select 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| events | 渲染组件附加事件，参数为 ( {row,rowIndex,column,columnIndex}, ...Component arguments ) | Object | — | — |

## Demo

```html
<vxe-table
  border
  class="vxe-table-iview"
  height="600"
  :data.sync="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-table-column type="selection" width="60" fixed="left"></vxe-table-column>
  <vxe-table-column type="index" width="60" fixed="left"></vxe-table-column>
  <vxe-table-column prop="name" label="Input" min-width="140" :edit-render="{name: 'Input'}"></vxe-table-column>
  <vxe-table-column prop="age" label="InputNumber" width="140" :edit-render="{name: 'InputNumber', props: {max: 35, min: 18}}"></vxe-table-column>
  <vxe-table-column prop="sex" label="Select" width="140" :edit-render="{name: 'Select', options: sexList}"></vxe-table-column>
  <vxe-table-column prop="region" label="Cascader" width="200" :edit-render="{name: 'Cascader', props: {data: regionList}}"> </vxe-table-column>
  <vxe-table-column prop="date" label="DatePicker" width="200" :edit-render="{name: 'DatePicker', props: {type: 'date', format: 'yyyy/MM/dd'}}"></vxe-table-column>
  <vxe-table-column prop="date2" label="TimePicker" width="200" :edit-render="{name: 'TimePicker', props: {type: 'time'}}"></vxe-table-column>
  <vxe-table-column prop="rate" label="Rate" width="200" :edit-render="{name: 'Rate', type: 'visible'}"></vxe-table-column>
  <vxe-table-column prop="flag" label="iSwitch" width="100" fixed="right" :edit-render="{name: 'iSwitch', type: 'visible'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [],
      sexList: [
        {
          'label': '男',
          'value': '1'
        },
        {
          'label': '女',
          'value': '0'
        }
      ],
      regionList: [
        {
          'label': '深圳',
          'value': 'shenzhen'
        },
        {
          'label': '广州',
          'value': 'guangzhou'
        }
      ]
    }
  }
}
```

## License

Copyright (c) 2019-present, Xu Liangzhan