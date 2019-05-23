import React, { PureComponent } from 'react';
import { DataSet, Table, TextField } from 'choerodon-ui/pro';
import Content from '../../src/containers/components/pro/page/Content';
import LanguageDataSet from './stores/LanguageDataSet';

const { Column } = Table;

function editorRenderer(record) {
  return record.status === 'add' ? <TextField /> : null;
}

export default class Index extends PureComponent {
  languageDS = new DataSet(LanguageDataSet);

  render() {
    /**
     * 渲染表格内容
     */
    return (
      <Content>
        <Table
          buttons={['add', 'save', 'delete']}
          dataSet={this.languageDS}
          queryFieldsLimit={2}
        >
          <Column name="langCode" editor={editorRenderer} />
          <Column name="description" editor />
        </Table>
      </Content>
    );
  }
}
