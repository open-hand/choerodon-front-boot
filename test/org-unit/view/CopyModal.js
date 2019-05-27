import React from 'react';
import { CheckBox, Form, IntlField, Lov, TextField } from 'choerodon-ui/pro';

export default ({ dataSet }) => (
  <Form style={{ width: '4rem' }}>
    <TextField dataSet={dataSet} name="unitCode" />
    <Lov dataSet={dataSet} name="parent" />
    <IntlField dataSet={dataSet} name="name" />
    <IntlField dataSet={dataSet} name="description" />
    <CheckBox dataSet={dataSet} name="enabledFlag" value="Y" unCheckedValue="N" />
  </Form>
);
