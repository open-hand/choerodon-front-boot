import React from 'react';
import { Button, CheckBox, DataSet, Modal, Table, TextField } from 'choerodon-ui/pro';
import CopyModal from './CopyModal';

const { Column } = Table;
const textField = <TextField />;
const checkBox = <CheckBox value="Y" unCheckedValue="N" />;
const modalKey = Modal.key();

function editorRenderer(record) {
  return record.status === 'add' ? textField : null;
}

export default ({ dataSet }) => {
  /**
   * 数据校验成功时保存
   * @returns {Promise<boolean>}
   */
  async function handleOnOkCopyDrawer() {
    if (await dataSet.current.validate()) {
      await dataSet.submit();
    } else {
      return false;
    }
  }

  /**
   * 关闭时移除
   * @returns {Promise<void>}
   */
  async function handleOnCancelCopyDrawer() {
    dataSet.query();
  }

  function openCopyModal() {
    const { selected } = dataSet;
    if (selected.length === 1) {
      const created = selected[0].clone();
      dataSet.unshift(created);
      dataSet.current = created;
      Modal.open({
        key: modalKey,
        title: '新建',
        drawer: true,
        children: (
          <CopyModal dataSet={dataSet} />
        ),
        onOk: handleOnOkCopyDrawer,
        afterClose: handleOnCancelCopyDrawer,
        style: { width: 500 },
        okText: '新建',
      });
    } else {
      Modal.info('请选择一行');
    }
  }

  const copyBtn = (
    <Button
      key="copy"
      funcType="flat"
      color="blue"
      icon="content_copy"
      onClick={openCopyModal}
    >
      复制
    </Button>
  );

  /**
   * 渲染表格内容
   */
  return (
    <Table
      buttons={['add', 'save', 'delete', copyBtn]}
      dataSet={dataSet}
      queryFieldsLimit={2}
    >
      <Column name="unitCode" editor={editorRenderer} width={80} sortable />
      <Column name="name" editor width={200} />
      <Column name="unitCategory" editor width={100} />
      <Column name="unitType" editor width={100} />
      <Column name="parentCode" width={100} />
      <Column name="parent" editor width={200} />
      <Column name="companyCode" width={100} />
      <Column name="company" editor width={150} />
      <Column name="position" editor width={100} />
      <Column name="description" editor width={200} />
      <Column name="enabledFlag" editor={checkBox} width={80} align="center" sortable />
    </Table>
  );
};
