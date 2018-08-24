import React, { Component, createElement } from 'react';
import { Button, Col, Icon, Row, Spin } from 'choerodon-ui';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import classNames from 'classnames';
import Column from './Column';
import './style';

const COLUMN_COUNT = 3;

function normalizeColumns(items) {
  const columns = new Array(COLUMN_COUNT).fill().map(() => []);
  items.slice().sort(({ sort }, { sort: sort2 }) => sort - sort2).forEach((item) => {
    columns[(item.sort - 1) % COLUMN_COUNT].push(item);
  });
  return columns;
}

function resortColumn(column, columnIndex) {
  if (column.length > 0) {
    column.forEach(action((data, index) => {
      const sort = index * COLUMN_COUNT + columnIndex + 1;
      data.sort = sort;
      return sort;
    }));
  }
}

const PREFIX_CLS = 'c7n-boot-dashboard';

const dragCard = {
  data: null,
  column: null,
  sort: null,
};

function clearDragCard() {
  Object.assign(dragCard, {
    data: null,
    column: null,
    sort: null,
  });
}

const animations = {
  length: 0,
  runLength: 0,
  callback: null,
};

@inject('DashboardStore')
@injectIntl
@observer
export default class Dashboard extends Component {
  fetchData = () => {
    this.props.DashboardStore.loadDashboardData();
  };

  componentWillMount() {
    this.fetchData();
  }

  componentWillReceiveProps() {
    this.fetchData();
  }

  handleAnimateEnd = (callback) => {
    animations.runLength += 1;
    if (callback) {
      animations.callback = callback;
    }
    if (animations.length === animations.runLength && animations.callback) {
      animations.callback();
      animations.runLength = 0;
      animations.callback = null;
    }
  };

  handleEdit = () => {
    this.props.DashboardStore.setEditing(true);
  };

  handleComplete = () => {
    const { DashboardStore } = this.props;
    if (DashboardStore.dirty) {
      DashboardStore.updateDashboardData().then(() => {
        this.handleEditSuccess();
      });
    } else {
      this.handleEditSuccess();
    }
  };

  handleEditSuccess() {
    const { DashboardStore, intl } = this.props;
    DashboardStore.setEditing(false);
    Choerodon.prompt(intl.formatMessage({ id: 'boot.dashboard.success' }));
  }

  handleDragStart = (data, column, sort) => {
    Object.assign(dragCard, {
      data,
      column,
      sort,
    });
    this.forceUpdate();
  };

  handleDragEnd = () => {
    clearDragCard();
    this.forceUpdate();
  };

  handleDrop = (data, column, side, sort) => {
    const { data: dragData, column: dragColumn, sort: dragSort } = dragCard;
    if (dragData && dragColumn && column) {
      dragColumn.splice(dragColumn.indexOf(dragData), 1);
      const index = column.indexOf(dragData);
      if (index > -1) {
        column.splice(index, 1);
      }
      if (data && side) {
        const newIndex = column.indexOf(data) + (side === 'bottom' ? 1 : 0);
        column.splice(newIndex, 0, dragData);
      } else {
        column.push(dragData);
      }
      resortColumn(dragColumn, dragSort);
      resortColumn(column, sort);
      clearDragCard();
      const { DashboardStore, intl } = this.props;
      DashboardStore.updateDashboardData().then(() => {
        Choerodon.prompt(intl.formatMessage({ id: 'boot.dashboard.success' }));
      });
    }
  };

  renderHeader(editing) {
    return (
      <header className={`${PREFIX_CLS}-header`}>
        <Icon type="home" />
        <FormattedMessage id="boot.dashboard.home" />
        {
          editing ? (
            <Button
              icon="check"
              className={`${PREFIX_CLS}-header-button`}
              onClick={this.handleComplete}
            >
              <FormattedMessage id="boot.dashboard.complete" />
            </Button>
          ) : (
            <Button
              icon="mode_edit"
              className={`${PREFIX_CLS}-header-button`}
              onClick={this.handleEdit}
            >
              <FormattedMessage id="boot.dashboard.customize" />
            </Button>
          )
        }
      </header>
    );
  }

  renderColumns() {
    const { DashboardStore: { getDashboardData: items }, dashboardLocale, dashboardComponents } = this.props;
    const columns = normalizeColumns(items);
    animations.length = items.length;
    return Object.keys(columns).map(key => (
      <Col key={key} span={8}>
        <Column
          prefixCls={PREFIX_CLS}
          column={columns[key]}
          sort={key}
          components={dashboardComponents}
          locale={dashboardLocale}
          dragData={dragCard.data}
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          onDrop={this.handleDrop}
          onAnimateEnd={this.handleAnimateEnd}
        />
      </Col>
    ));
  }

  render() {
    const { DashboardStore: { editing, loading } } = this.props;
    const classString = classNames(`${PREFIX_CLS}-container`, {
      [`${PREFIX_CLS}-dragging`]: !!dragCard.data,
      [`${PREFIX_CLS}-editing`]: editing,
    });

    return (
      <div className={PREFIX_CLS}>
        {this.renderHeader(editing)}
        <Spin spinning={loading} wrapperClassName={classString}>
          <Row type="flex" gutter={20}>
            {this.renderColumns()}
          </Row>
        </Spin>
      </div>
    );
  }
}
