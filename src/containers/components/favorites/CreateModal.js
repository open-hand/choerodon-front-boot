import React, { Component, createElement } from 'react';
import { Button, Modal, Form, Input, IconSelect, Radio } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { BlockPicker } from 'react-color';
import './style';

const RadioGroup = Radio.Group;
const PREFIX_CLS = 'c7n-boot-favorites';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};
const defaultColors = ['#2196F3', '#E8453C', '#4CAF50', '#FFC107', '#692AE8', '#FF8B15', '#E91E63', '#00BCD4'];


@Form.create({
  mapPropsToFields: props => ({
    name: Form.createFormField({
      ...props.name,
      value: props.name.value,
    }),
    url: Form.createFormField({
      ...props.url,
      value: props.url.value,
    }),
    icon: Form.createFormField({
      ...props.icon,
      value: props.icon.value,
    }),
    color: Form.createFormField({
      ...props.color,
      value: props.color.value,
    }),
  }),
})
@inject('MenuStore', 'FavoritesStore')
@injectIntl
@observer
export default class CreateModal extends Component {
  state = {
    showUrl: false,
    pickShow: false,
  };

  handleRadioChange = () => {
    const { showUrl } = this.state;
    this.setState({
      showUrl: !showUrl,
    });
  };

  renderRadioGroup() {
    const { showUrl } = this.state;
    const { FavoritesStore } = this.props;
    if (FavoritesStore.getType === 'create') {
      return (
        <RadioGroup
          name="radiogroup"
          value={showUrl}
          label="添加类型"
          className={`${PREFIX_CLS}-radio`}
          onChange={this.handleRadioChange}
        >
          <Radio value={false}>添加当前页面</Radio>
          <Radio value>添加其他页面</Radio>
        </RadioGroup>
      );
    } else {
      return null;
    }
  }

  listenClose = (e) => {
    setTimeout(() => {
      const pick = document.getElementsByClassName('block-picker')[0].getClientRects()[0];
      if (!(e.clientX > pick.x && e.clientX < pick.x + pick.width && e.clientY > pick.y && e.clientY < pick.y + pick.height)) {
        document.removeEventListener('click', this.listenClose);
        this.setState({ pickShow: false });
      }
    }, 10);
  };

  renderColorModify() {
    const { form } = this.props;
    const { pickShow } = this.state;
    return (
      <div className={`${PREFIX_CLS}-color`}>
        颜色：
        <div
          onClick={(e) => {
            e.stopPropagation();
            this.setState({ pickShow: true });
            document.addEventListener('click', this.listenClose);
          }}
          className={`${PREFIX_CLS}-color-box`}
          style={{ backgroundColor: form.getFieldValue('color') }}
        />
        <div
          style={pickShow
            ? {
              display: 'block', position: 'absolute', bottom: -176, left: -2, zIndex: 10000,
            }
            : { display: 'none' }}
        >
          <BlockPicker
            color={form.getFieldValue('color')}
            onChangeComplete={(color) => {
              form.setFieldsValue({ color: color.hex });
            }}
            colors={defaultColors}
          />
          <div onClick={() => this.setState({ pickShow: false })} />
        </div>
      </div>
    );
  }

  renderContainer() {
    const {
      form: { getFieldDecorator }, FavoritesStore,
    } = this.props;
    const { showUrl } = this.state;
    return (
      <Form className={`${PREFIX_CLS}-form`}>
        { this.renderRadioGroup() }
        {
          getFieldDecorator('color', {
            rules: [
              {
                required: true,
              },
            ],
          })(
            <input type="hidden" />,
          )
        }
        <FormItem {...formItemLayout}>
          {
            getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '请输入名称',
                },
              ],
              initialValue: 'name-initialValue',
            })(
              <Input
                autoComplete="off"
                label="名称"
                maxLength={32}
                showLengthInfo={false}
              />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          style={{ display: showUrl || FavoritesStore.getType === 'edit' ? 'block' : 'none' }}
        >
          {
            getFieldDecorator('url', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '请输入url',
                },
              ],
              initialValue: 'url-initialValue',
            })(
              <Input
                autoComplete="off"
                label="url"
                maxLength={2048}
                showLengthInfo={false}
              />,
            )
          }
        </FormItem>
        <FormItem {...formItemLayout}>
          {
            getFieldDecorator('icon', {
              initialValue: 'cancel',
            })(
              <IconSelect
                label="图标"
                showArrow
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }

  handleOk = () => {
    const { form, intl, onOk, FavoritesStore } = this.props;
    form.validateFields((error, values, modify) => {
      if (onOk) onOk(error);
      Object.keys(values).forEach((key) => {
        // 去除form提交的数据中的全部前后空格
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!error) {
        if (FavoritesStore.getType === 'create') {
          if (FavoritesStore.getFavorites.some(v => v.url === values.url)) {
            Choerodon.prompt('添加成功');
          } else {
            const len = FavoritesStore.getFavorites.length;
            const createData = {
              ...values,
              sort: (len > 0 ? FavoritesStore.getFavorites.reduce((previousValue, current) => (previousValue > current.sort ? previousValue : current.sort), -999999) : 1) + 1,
            };
            FavoritesStore.createFavorite(createData);
          }
        } else {
          FavoritesStore.updateFavorite(values);
        }
      } else {
        Choerodon.prompt(error);
      }
    });
  };

  render() {
    const { FavoritesStore } = this.props;

    return (
      <Modal
        {...this.props}
        title={`${FavoritesStore.getType === 'edit' ? '修改' : '创建'}快捷方式`}
        className=""
        width={560}
        closable={false}
        maskClosable={false}
        onOk={this.handleOk}
        onText="添加"
      >
        {this.renderContainer()}
        {FavoritesStore.getType === 'edit' ? this.renderColorModify() : null}
      </Modal>
    );
  }
}
