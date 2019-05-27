import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

export default ({ dataSet }) => (
  <Table
    dataSet={dataSet}
    mode="tree"
    defaultRowExpanded
  >
    <Column name="name" width={450} />
    <Column name="unitCode" />
    <Column name="positionName" />
    <Column name="description" />
  </Table>
);
