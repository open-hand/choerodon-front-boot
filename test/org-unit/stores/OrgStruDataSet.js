export default {
  primaryKey: 'unitId',
  name: 'OrgUnitXml',
  autoQuery: true,
  parentField: 'parentId',
  idField: 'unitId',
  selection: false,
  fields: [
    { name: 'unitId', type: 'number', label: '组织id' },
    { name: 'unitCode', type: 'string', label: '组织编码' },
    { name: 'name', type: 'string', label: '组织名称' },
    { name: 'parentId', type: 'number', label: '上级组织id' },
    { name: 'positionName', type: 'string', label: '主管岗位' },
    { name: 'description', type: 'string', label: '组织描述' },
  ],
};
