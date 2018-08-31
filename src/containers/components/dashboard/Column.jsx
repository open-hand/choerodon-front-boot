import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import Card from './Card';
import asyncLocaleProvider from '../util/asyncLocaleProvider';
import asyncRouter from '../util/asyncRouter';

const cache = {};

function getCachedIntlProvider(key, language, getMessage) {
  if (!cache[key]) {
    cache[key] = asyncLocaleProvider(language, getMessage);
  }
  return cache[key];
}

function getCachedRouter(key, componentImport) {
  if (!cache[key]) {
    cache[key] = asyncRouter(componentImport);
  }
  return cache[key];
}

@inject('AppState', 'DashboardStore')
@observer
export default class Column extends Component {
  static defaultProps = {
    column: [],
  };

  state = {
    dragOver: false,
  };

  handleDragStart = (data) => {
    const { onDragStart, column, sort } = this.props;
    if (typeof onDragStart === 'function') {
      onDragStart(data, column, sort);
    }
  };

  handleDragEnd = () => {
    const { onDragEnd } = this.props;
    if (typeof onDragEnd === 'function') {
      onDragEnd();
    }
  };

  handleDropEnter = () => {
    this.setState({
      dragOver: true,
    });
  };

  handleDropLeave = () => {
    this.setState({
      dragOver: false,
    });
  };

  handleDrop = (e, data, side) => {
    const { onDrop, column, sort } = this.props;
    if (typeof onDrop === 'function') {
      onDrop(data, column, side, sort);
    }
    this.setState({
      dragOver: false,
    });
  };

  renderCard(data) {
    const { prefixCls, components, dragData, locale, AppState, onAnimateEnd } = this.props;
    const { dashboardCode, dashboardNamespace, sort } = data;
    const language = AppState.currentLanguage;
    const key = `${dashboardNamespace}/${dashboardCode}`;
    const localeKey = `${dashboardNamespace}/${language}`;
    const getMessage = locale[localeKey];
    const componentImport = components[key];
    const card = (
      <Card
        key={`${key}-${sort}`}
        prefixCls={prefixCls}
        data={data}
        dragData={dragData}
        component={componentImport && getCachedRouter(`router-${key}`, componentImport)}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        onDrop={this.handleDrop}
        onAnimateEnd={onAnimateEnd}
      />
    );

    if (getMessage) {
      const IntlProviderAsync = getCachedIntlProvider(`locale-${localeKey}`, language, getMessage);
      return (
        <IntlProviderAsync key={`${key}-${sort}`}>
          {card}
        </IntlProviderAsync>
      );
    } else {
      return card;
    }
  }

  render() {
    const { column, DashboardStore } = this.props;
    if (column.length > 0
      && (DashboardStore.editing || column.filter(({ visible }) => visible).length > 0)) {
      return (
        <div>
          {column.map(item => this.renderCard(item))}
        </div>
      );
    } else {
      const { prefixCls, dragData } = this.props;
      const { dragOver } = this.state;
      const columnProps = {
        className: classNames(`${prefixCls}-column-empty`, {
          [`${prefixCls}-column-drag-over`]: dragOver,
        }),
      };
      if (dragData) {
        Object.assign(columnProps, {
          onMouseEnter: this.handleDropEnter,
          onMouseLeave: this.handleDropLeave,
          onMouseUp: this.handleDrop,
        });
      }
      return (
        <div {...columnProps} />
      );
    }
  }
}
