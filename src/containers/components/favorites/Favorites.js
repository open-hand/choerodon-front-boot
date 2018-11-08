import React, { Component, createElement } from 'react';
import { Button, Col, Icon, Row, Tooltip, Popover, Modal } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import CreateModal from './CreateModal';
import './style';

const PREFIX_CLS = 'c7n-boot-favorites';

@inject('MenuStore', 'FavoritesStore')
@injectIntl
@observer
export default class Favorites extends Component {
  state = {
    modalVisible: false,
    popoverVisible: false,
  };

  dndItemId = null;

  componentWillMount() {
    const { FavoritesStore } = this.props;
    FavoritesStore.loadData();
  }

  handleCreateItemClick = (e) => {
    const { FavoritesStore } = this.props;
    FavoritesStore.setType('create');
    FavoritesStore.setDefaultFields();
    this.setState({
      modalVisible: true,
      popoverVisible: false,
    });
  };

  handleItemClick = (e, url) => {
    this.setState({
      popoverVisible: false,
    });
    window.location = url;
    // window.open(url);
  };

  handleEdit = (e, id) => {
    e.stopPropagation();
    const { FavoritesStore } = this.props;
    FavoritesStore.setType('edit');
    FavoritesStore.setDefaultFields(id);
    this.setState({
      modalVisible: true,
      popoverVisible: false,
    });
  };

  handleDrop = (e, id) => {
    e.preventDefault();
    const { FavoritesStore } = this.props;
    FavoritesStore.swapSort(id, this.dndItemId);
  };

  handleDrag = (e, id) => {
    this.dndItemId = id;
  };

  handleDragOver = (e, id) => {
    if (id !== this.dndItemId) e.preventDefault();
  };

  handleDelete = (e, id) => {
    const { FavoritesStore, intl } = this.props;
    e.stopPropagation();
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: '删除书签',
      content: '真的要删掉吗',
      zIndex: 100000,
      onOk: () => FavoritesStore.deleteFavorite(id).then(({ failed, message }) => {
        if (failed) {
          Choerodon.prompt(message);
        } else {
          Choerodon.prompt('删除成功');
          FavoritesStore.deleteFavoriteLocal(id);
        }
      }),
    });
  };

  renderCreateItem() {
    return (
      <a onClick={this.handleCreateItemClick} className={`${PREFIX_CLS}-popover-item`}>
        <div className={`${PREFIX_CLS}-popover-item-icon`}>
          <Icon type="add" style={{ color: '#000', fontSize: 24, margin: 12 }} />
        </div>
        <span className={`${PREFIX_CLS}-popover-item-text`}>添加快捷方式</span>
      </a>
    );
  }

  renderItem({ name, icon, url, color, id }) {
    return (
      <Tooltip title={name} placement="topLeft">
        <a
          draggable
          onClick={e => this.handleItemClick(e, url)}
          className={`${PREFIX_CLS}-popover-item`}
          onDrag={e => this.handleDrag(e, id)}
          onDrop={e => this.handleDrop(e, id)}
          onDragOver={e => this.handleDragOver(e, id)}
        >
          <div className={`${PREFIX_CLS}-popover-item-icon`}>
            <Icon type={icon} style={{ color, fontSize: 24, margin: 12 }} />
            <Icon onClick={e => this.handleEdit(e, id)} type="mode_edit" />
            <Icon onClick={e => this.handleDelete(e, id)} type="delete_forever" />
          </div>
          <span className={`${PREFIX_CLS}-popover-item-text`}>{name}</span>
          <Icon type="edit" />
        </a>
      </Tooltip>
    );
  }

  renderPopoverContent() {
    const { FavoritesStore } = this.props;
    return (
      <div className={`${PREFIX_CLS}-popover-wrapper`}>
        <span className={`${PREFIX_CLS}-popover-title`} style={{ margin: '20px' }}>快捷方式</span>
        <div className={`${PREFIX_CLS}-popover-content`}>
          {FavoritesStore.getFavorites.map(v => this.renderItem(v))}
          {FavoritesStore.getFavorites.length < 9 && this.renderCreateItem()}
        </div>
      </div>
    );
  }

  handleOk = (e) => {
    this.setState({
      modalVisible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      modalVisible: false,
    });
  };

  handlePopoverVisibleChange = (visible) => {
    this.setState({
      popoverVisible: visible,
    });
  };

  render() {
    const { MenuStore, FavoritesStore } = this.props;
    const { modalVisible, popoverVisible } = this.state;

    return (
      <React.Fragment>
        <Popover
          placement="bottom"
          title={null}
          content={this.renderPopoverContent()}
          trigger="click"
          overlayClassName={PREFIX_CLS}
          visible={popoverVisible}
          onVisibleChange={this.handlePopoverVisibleChange}
        >
          <Button
            functype="flat"
            shape="circle"
            onClick={() => this.setState({ popoverVisible: true })}
          >
            <Icon type="apps" />
          </Button>
        </Popover>
        <CreateModal
          visible={modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}

          {...FavoritesStore.getFields}
        />

      </React.Fragment>
    );
  }
}
