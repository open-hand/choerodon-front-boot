import axios from '../../../src/containers/components/pro/axios';

const unitCodeValidator = (value, name, record) => {
  if (record.status === 'add') {
    return axios.get(`/hr/unit/checkunitcode?unitCode=${value}`)
      .then(valid => valid || '组织编码已存在');
  } else {
    return true;
  }
};

export default {
  primaryKey: 'unitId',
  name: 'OrgUnitXml',
  autoQuery: true,
  fields: [
    { name: 'unitId', type: 'number', label: '组织id' },
    { name: 'unitCode', type: 'string', label: '组织编码', required: true, validator: unitCodeValidator },
    { name: 'name', type: 'intl', label: '组织名称', required: true },
    { name: 'unitCategory', type: 'string', label: '组织类别', lookupCode: 'SYS.UNIT_CATEGORY' },
    { name: 'unitType', type: 'string', label: '组织分类', lookupCode: 'SYS.UNIT_TYPE' },
    { name: 'parentId', bind: 'parent.unitId', type: 'number', label: '上级组织id' },
    { name: 'parentCode', bind: 'parent.unitCode', type: 'string', label: '上级组织编码' },
    { name: 'parentName', bind: 'parent.name', type: 'string', label: '上级组织名称' },
    { name: 'parent', type: 'object', label: '上级组织', textField: 'name', lovCode: 'LOV_UNIT' },
    { name: 'companyId', type: 'number', bind: 'company.companyId', label: '公司id' },
    { name: 'companyCode', type: 'string', bind: 'company.companyCode', label: '公司代码' },
    { name: 'companyName', type: 'string', bind: 'company.companyFullName', label: '公司名称' },
    { name: 'company', type: 'object', label: '公司', textField: 'companyFullName', lovCode: 'LOV_COMPANY' },
    { name: 'description', type: 'intl', label: '描述' },
    { name: 'managerPosition', type: 'number', bind: 'position.positionId', label: '主管岗位id' },
    { name: 'positionName', type: 'string', bind: 'position.name', label: '主管岗位' },
    { name: 'position', type: 'object', label: '主管岗位', textField: 'name', lovCode: 'LOV_POSITION' },
    { name: 'enabledFlag', type: 'boolean', label: '是否启用', required: true, defaultValue: 'Y', trueValue: 'Y', falseValue: 'N' },
    { name: 'objectVersionNumber', type: 'number', label: '当前版本' },
  ],
  queryFields: [
    { name: 'unitCode', type: 'string', label: '组织编码' },
    { name: 'name', type: 'string', label: '组织名称' },
    { name: 'unitType', type: 'string', lookupCode: 'SYS.UNIT_TYPE', label: '组织类别' },
    { name: 'parentId', type: 'number', bind: 'parent.unitId' },
    { name: 'parentName', type: 'object', bind: 'parent.name' },
    { name: 'parent', type: 'object', textField: 'name', lovCode: 'LOV_UNIT', label: '上级组织' },
  ],
};
