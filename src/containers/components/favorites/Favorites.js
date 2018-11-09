import React, { Component, createElement } from 'react';
import { Button, Col, Icon, Row, Tooltip, Popover, Modal } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import CreateModal from './CreateModal';
import './style';

const PREFIX_CLS = 'c7n-boot-favorites';
const COLUMN_SIZE = 3;
const HORIZONTAL_MARGIN = 88;
const VERTICAL_MARGIN = 104;

@inject('MenuStore', 'FavoritesStore')
@injectIntl
@observer
export default class Favorites extends Component {
  state = {
    modalVisible: false,
    popoverVisible: false,
    needChangePopover: true,
    dndItemId: null,
  };

  dndItemId = null;

  dndTimeout = null;

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
    window.open(url);
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
    this.setState({ dndItemId: null });
    const { FavoritesStore } = this.props;
    if (this.dndItemId !== id) {
      FavoritesStore.swapSort(this.dndItemId, id);
    }
    this.dndItemId = 0;
  };

  handleDragEnd = (e) => {
    this.setState({ dndItemId: null });
  }

  handleDrag = (e, id) => {
    const { FavoritesStore } = this.props;
    this.dndItemId = id;
  };

  handleDragEnter = (e, id) => {
    const { FavoritesStore } = this.props;
    e.preventDefault();
    if (this.dndTimeout === null && this.dndItemId !== id) {
      this.setState({ dndItemId: this.dndItemId });
      if (id !== this.dndItemId) {
        e.preventDefault();
        FavoritesStore.swapSort(this.dndItemId, id);
      }
    }
    if (this.dndTimeout !== null && this.dndItemId !== id) {
      clearTimeout(this.dndTimeout);
      this.dndTimeout = setTimeout(() => { this.dndTimeout = null; this.forceUpdate(); }, 100);
    } else {
      this.dndTimeout = setTimeout(() => { this.dndTimeout = null; this.forceUpdate(); }, 100);
    }
  };

  handleDelete = (e, id) => {
    const { FavoritesStore, intl } = this.props;
    e.stopPropagation();
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: '删除书签',
      content: '确认要删除此书签吗？',
      zIndex: 100000,
      onOk: () => {
        this.setState({ popoverVisible: true, needChangePopover: false });
        this.needChangePopover = false;
        setTimeout(() => { this.setState({ needChangePopover: true }); }, 10);
        FavoritesStore.deleteFavorite(id).then(({ failed, message }) => {
          if (failed) {
            Choerodon.prompt(message);
          } else {
            Choerodon.prompt('删除成功');
            FavoritesStore.deleteFavoriteLocal(id);
          }
        });
      },
      onCancel: () => {
        this.setState({ popoverVisible: true, needChangePopover: false });
        this.needChangePopover = false;
        setTimeout(() => { this.setState({ needChangePopover: true }); }, 10);
      },
    });
  };

  renderCreateItem() {
    const { FavoritesStore } = this.props;
    const itemStyle = {
      position: 'absolute',
      top: parseInt(FavoritesStore.getFavorites.length / COLUMN_SIZE, 10) * VERTICAL_MARGIN + 73,
      left: (FavoritesStore.getFavorites.length % COLUMN_SIZE) * HORIZONTAL_MARGIN + 20,
    };
    return (
      <a style={itemStyle} onClick={this.handleCreateItemClick} className={`${PREFIX_CLS}-popover-item`}>
        <div className={`${PREFIX_CLS}-popover-item-icon`}>
          <Icon type="add" style={{ color: '#000', fontSize: 26, margin: 11 }} />
        </div>
        <span className={`${PREFIX_CLS}-popover-item-text`}>添加快捷方式</span>
      </a>
    );
  }

  renderItem({ name, icon, url, color, id }) {
    const { FavoritesStore } = this.props;
    const itemStyle = {
      position: 'absolute',
      top: parseInt(FavoritesStore.getIndex.get(id) / 3, 10) * VERTICAL_MARGIN + 73,
      left: (FavoritesStore.getIndex.get(id) % 3) * HORIZONTAL_MARGIN + 20,
      display: this.state.dndItemId === id ? 'none' : 'block',
    };
    return (
      <Tooltip title={name} placement="topLeft" key={id}>
        <a
          draggable
          onClick={e => this.handleItemClick(e, url)}
          className={`${PREFIX_CLS}-popover-item`}
          onDrag={this.state.dndItemId !== id ? e => this.handleDrag(e, id) : null}
          onDrop={this.state.dndItemId !== id ? e => this.handleDrop(e, id) : null}
          onDragOver={this.state.dndItemId !== id ? e => e.preventDefault() : null}
          onDragEnter={this.state.dndItemId !== id ? e => this.handleDragEnter(e, id) : null}
          onDragEnd={this.handleDragEnd}
          style={itemStyle}
        >
          <div className={`${PREFIX_CLS}-popover-item-icon`}>
            <Icon type={icon} style={{ color, fontSize: 26, margin: 11 }} />
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
          {FavoritesStore.getFavorites.map((v, index) => this.renderItem(v, index))}
          {FavoritesStore.getFavorites.length < 9 && this.renderCreateItem()}
        </div>
      </div>
    );
  }

  handleOk = (err) => {
    if (!err) {
      this.setState({
        modalVisible: false,
      });
    }
  };

  handleCancel = (e) => {
    this.setState({
      modalVisible: false,
    });
  };

  handlePopoverVisibleChange = (visible) => {
    setTimeout(() => {
      if (this.state.needChangePopover) {
        this.setState({
          popoverVisible: visible,
        });
      }
    }, 5);
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
