import React from 'react';
import PropTypes from 'prop-types';
import Pager from './Pager';
import Options from './Options';
import KEYCODE from './keyCode';
import './RePagination.less';

function noop() {
}

function isInteger(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
}

function defaultItemRender(page, type, element) {
  return element;
}

class RePagination extends React.Component {
  static defaultProps = {
    // defaultCurrent: 1,
    total: 0,
    defaultPageSize: 10,
    onChange: noop,
    className: '',
    selectPrefixCls: 'rc-select',
    prefixCls: 'rc-rePagination',
    selectComponentClass: null,
    showQuickJumper: false,
    showSizeChanger: false,
    showLessItems: false,
    showTitle: true,
    onShowSizeChange: noop,
    style: {},
    itemRender: defaultItemRender,
  };

  constructor(props) {
    super(props);

    // const hasOnChange = props.onChange !== noop;
    // const hasCurrent = ('current' in props);
    // if (hasCurrent && !hasOnChange) {
    //   console.warn('Warning: You provided a `current` prop to a Pagination component
    // without an `onChange` handler. This will render a read-only component.');
    // eslint-disable-line
    // }

    let current = props.defaultCurrent;
    if ('current' in props) {
      current = props.current;
    }

    let pageSize = props.defaultPageSize;
    if ('pageSize' in props) {
      pageSize = props.pageSize;
    }

    this.state = {
      current,
      currentInputValue: current,
      pageSize,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('current' in nextProps) {
      this.setState({
        current: nextProps.current,
        currentInputValue: nextProps.current,
      });
    }

    if ('pageSize' in nextProps) {
      const newState = {};
      let current = this.state.current;
      const newCurrent = this.calculatePage(nextProps.pageSize);
      current = current > newCurrent ? newCurrent : current;
      if (!('current' in nextProps)) {
        newState.current = current;
        newState.currentInputValue = current;
      }
      newState.pageSize = nextProps.pageSize;
      this.setState(newState);
    }
  }

  getJumpPrevPage() {
    return Math.max(1, this.state.current - (this.props.showLessItems ? 3 : 5));
  }

  getJumpNextPage() {
    return Math.min(this.calculatePage(), this.state.current + (this.props.showLessItems ? 3 : 5));
  }

  calculatePage = (p) => {
    let pageSize = p;
    if (typeof pageSize === 'undefined') {
      pageSize = this.state.pageSize;
    }
    return Math.floor((this.props.total - 1) / pageSize) + 1;
  }

  isValid = page => isInteger(page) && page >= 1 && page !== this.state.current;

  handleKeyDown = (e) => {
    if (e.keyCode === KEYCODE.ARROW_UP || e.keyCode === KEYCODE.ARROW_DOWN) {
      e.preventDefault();
    }
  }

  handleKeyUp = (e) => {
    const inputValue = e.target.value;
    const currentInputValue = this.state.currentInputValue;
    let value;

    if (inputValue === '') {
      value = inputValue;
    } else if (isNaN(Number(inputValue))) {
      value = currentInputValue;
    } else {
      value = Number(inputValue);
    }

    if (value !== currentInputValue) {
      this.setState({
        currentInputValue: value,
      });
    }

    if (e.keyCode === KEYCODE.ENTER) {
      this.handleChange(value);
    } else if (e.keyCode === KEYCODE.ARROW_UP) {
      this.handleChange(value - 1);
    } else if (e.keyCode === KEYCODE.ARROW_DOWN) {
      this.handleChange(value + 1);
    }
  }

  changePageSize = (size) => {
    let current = this.state.current;
    const newCurrent = this.calculatePage(size);
    current = current > newCurrent ? newCurrent : current;
    if (typeof size === 'number') {
      if (!('pageSize' in this.props)) {
        this.setState({
          pageSize: size,
        });
      }
      if (!('current' in this.props)) {
        this.setState({
          current,
          currentInputValue: current,
        });
      }
    }
    this.props.onShowSizeChange(current, size);
  }

  handleChange = (p) => {
    let page = p;
    if (this.isValid(page)) {
      if (page > this.calculatePage()) {
        page = this.calculatePage();
      }

      if (!('current' in this.props)) {
        this.setState({
          current: page,
          currentInputValue: page,
        });
      }

      const pageSize = this.state.pageSize;
      this.props.onChange(page, pageSize);

      return page;
    }

    return this.state.current;
  }

  prev = () => {
    if (this.hasPrev()) {
      this.handleChange(this.state.current - 1);
    }
  }

  next = () => {
    if (this.hasNext()) {
      this.handleChange(this.state.current + 1);
    }
  }

  toFirstPage = () => {
    if (this.hasPrev()) {
      this.setState({ current: 1 });
      this.handleChange(1);
    }
    // const { current } = this.state;
    // if (current !== 1) {
    //   this.setState({ current: 1 });
    //   this.handleChange(1);
    // }
  }

  toLastPage = () => {
    if (this.hasNext()) {
      const lastPage = this.calculatePage(this.state.pageSize);
      this.setState({ current: lastPage });
      this.handleChange(lastPage);
    }
    // const lastPage = this.calculatePage(this.state.pageSize);
    // const { current } = this.state;
    // if (current !== lastPage) {
    //   this.setState({ current: lastPage });
    // }
  }

  // getJumpPrevPage() {
  //   return Math.max(1, this.state.current - (this.props.showLessItems ? 3 : 5));
  // }
  //
  // getJumpNextPage() {
  //   return Math.min(this.calculatePage(),
  // this.state.current + (this.props.showLessItems ? 3 : 5));
  // }

  jumpPrev = () => {
    this.handleChange(this.getJumpPrevPage());
  }

  jumpNext = () => {
    this.handleChange(this.getJumpNextPage());
  }

  hasPrev = () => this.state.current > 1;

  hasNext = () => this.state.current < this.calculatePage();

  runIfEnter = (event, callback, ...restParams) => {
    if (event.key === 'Enter' || event.charCode === 13) {
      callback(...restParams);
    }
  }

  runIfEnterPrev = (e) => {
    this.runIfEnter(e, this.prev);
  }

  runIfEnterNext = (e) => {
    this.runIfEnter(e, this.next);
  }

  runIfEnterJumpPrev = (e) => {
    this.runIfEnter(e, this.jumpPrev);
  }

  runIfEnterJumpNext = (e) => {
    this.runIfEnter(e, this.jumpNext);
  }

  handleGoTO = (e) => {
    if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
      this.handleChange(this.state.currentInputValue);
    }
  }

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const allPages = this.calculatePage();
    const pagerList = [];
    let jumpPrev = null;
    let jumpNext = null;
    let firstPager = null;
    let lastPager = null;
    let gotoButton = null;

    const goButton = (props.showQuickJumper && props.showQuickJumper.goButton);
    const pageBufferSize = props.showLessItems ? 1 : 2;
    const { current, pageSize } = this.state;

    const prevPage = current - 1 > 0 ? current - 1 : 0;
    const nextPage = current + 1 < allPages ? current + 1 : allPages;

    if (props.simple) {
      if (goButton) {
        if (typeof goButton === 'boolean') {
          gotoButton = (
            <li
              title={this.props.showTitle ? `{Choerodon.getMessage('跳至'，'jumpTo')} ${this.state.current}/${allPages}` : null}
              className={`${prefixCls}-simple-pager`}
            >
              <button
                type="button"
                onClick={this.handleGoTO}
                onKeyUp={this.handleGoTO}
              >
                {Choerodon.getMessage('确定', 'sure')}
              </button>
            </li>
          );
        } else {
          gotoButton = goButton;
        }
      }
      return (
        <ul className={`${prefixCls} ${prefixCls}-simple ${props.className}`} style={this.props.style}>
          <li>
            <a role="button" onClick={this.toFirstPage}>
              <span className="icon-first_page" />
            </a>
          </li>
          <li>
            <a
              title={this.props.showTitle ? Choerodon.getMessage('上一页', 'last page') : null}
              onClick={this.prev}
              tabIndex="0"
              role="button"
              onKeyPress={this.runIfEnterPrev}
              className={`${this.hasPrev() ? '' : `${prefixCls}-disabled`} ${prefixCls}-prev`}
              aria-disabled={!this.hasPrev()}
            >
              {this.props.itemRender(prevPage, 'prev', <span className="icon-chevron_left" />)}
            </a>
          </li>
          <li
            title={this.props.showTitle ? `${this.state.current}/${allPages}` : null}
            className={`${prefixCls}-simple-pager`}
          >
            <input
              type="text"
              value={this.state.currentInputValue}
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
              onChange={this.handleKeyUp}
              size="3"
            />
            <span className={`${prefixCls}-slash`}>／</span>
            {allPages}
          </li>
          <li>
            <a
              title={this.props.showTitle ? Choerodon.getMessage('下一页', 'next page') : null}
              onClick={this.next}
              role="button"
              tabIndex="0"
              onKeyPress={this.runIfEnterNext}
              className={`${this.hasNext() ? '' : `${prefixCls}-disabled`} ${prefixCls}-next`}
              aria-disabled={!this.hasNext()}
            >
              {this.props.itemRender(nextPage, 'next', <span className="icon-chevron_right" />)}
            </a>
          </li>
          <li>
            <a role="button" onClick={this.toLastPage}>
              <span className="icon-last_page" />
            </a>
          </li>
          {gotoButton}
        </ul>
      );
    }

    if (allPages <= 5 + (pageBufferSize * 2)) {
      for (let i = 1; i <= allPages; i += 1) {
        const active = this.state.current === i;
        pagerList.push(
          <Pager
            rootPrefixCls={prefixCls}
            onClick={this.handleChange}
            onKeyPress={this.runIfEnter}
            key={i}
            page={i}
            active={active}
            showTitle={this.props.showTitle}
            itemRender={this.props.itemRender}
          />,
        );
      }
    } else {
      const prevItemTitle = props.showLessItems ? Choerodon.getMessage('向前3页', 'forward three pages') : Choerodon.getMessage('向前5页', 'forward five pages');
      const nextItemTitle = props.showLessItems ? Choerodon.getMessage('向后3页', 'backward three pages') : Choerodon.getMessage('向后5页', 'backward five pages');
      jumpPrev = (
        <li>
          <a
            title={this.props.showTitle ? prevItemTitle : null}
            key="prev"
            role="button"
            onClick={this.jumpPrev}
            tabIndex="0"
            onKeyPress={this.runIfEnterJumpPrev}
            className={`${prefixCls}-jump-prev`}
          >
            {this.props.itemRender(this.getJumpPrevPage(), 'jump-prev', <a className={`${prefixCls}-item-link`} />,
            )}
          </a>
        </li>
      );
      jumpNext = (
        <li>
          <a
            title={this.props.showTitle ? nextItemTitle : null}
            key="next"
            tabIndex="0"
            role="button"
            onClick={this.jumpNext}
            onKeyPress={this.runIfEnterJumpNext}
            className={`${prefixCls}-jump-next`}
          >
            {this.props.itemRender(this.getJumpNextPage(), 'jump-next', <a className={`${prefixCls}-item-link`} />,
            )}
          </a>
        </li>
      );
      lastPager = (
        <Pager
          last
          rootPrefixCls={prefixCls}
          onClick={this.handleChange}
          onKeyPress={this.runIfEnter}
          key={allPages}
          page={allPages}
          active={false}
          showTitle={this.props.showTitle}
          itemRender={this.props.itemRender}
        />
      );
      firstPager = (
        <Pager
          rootPrefixCls={prefixCls}
          onClick={this.handleChange}
          onKeyPress={this.runIfEnter}
          key={1}
          page={1}
          active={false}
          showTitle={this.props.showTitle}
          itemRender={this.props.itemRender}
        />
      );

      let left = Math.max(1, current - pageBufferSize);
      let right = Math.min(current + pageBufferSize, allPages);

      if (current - 1 <= pageBufferSize) {
        right = 1 + (pageBufferSize * 2);
      }

      if (allPages - current <= pageBufferSize) {
        left = allPages - (pageBufferSize * 2);
      }

      for (let i = left; i <= right; i += 1) {
        const active = current === i;
        pagerList.push(
          <Pager
            rootPrefixCls={prefixCls}
            onClick={this.handleChange}
            onKeyPress={this.runIfEnter}
            key={i}
            page={i}
            active={active}
            showTitle={this.props.showTitle}
            itemRender={this.props.itemRender}
          />,
        );
      }

      if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
        pagerList[0] = React.cloneElement(pagerList[0], {
          className: `${prefixCls}-item-after-jump-prev`,
        });
        pagerList.unshift(jumpPrev);
      }
      if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
        pagerList[pagerList.length - 1] = React.cloneElement(pagerList[pagerList.length - 1], {
          className: `${prefixCls}-item-before-jump-next`,
        });
        pagerList.push(jumpNext);
      }

      if (left !== 1) {
        pagerList.unshift(firstPager);
      }
      if (right !== allPages) {
        pagerList.push(lastPager);
      }
    }

    let totalText = null;

    if (this.props.showTotal) {
      totalText = (
        <li className={`${prefixCls}-total-text`}>
          {this.props.showTotal(
            props.total,
            [
              ((current - 1) * pageSize) + 1,
              (current * pageSize) > props.total ? props.total : (current * pageSize),
            ],
          )}
        </li>
      );
    }
    const prevDisabled = !this.hasPrev();
    const nextDisabled = !this.hasNext();
    return (
      <ul
        className={`${prefixCls} ${props.className}`}
        style={this.props.style}
        unselectable="unselectable"
      >
        {totalText}
        <li>
          <a
            role="button"
            onClick={this.toFirstPage}
            className={`${!prevDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-first`}
          >
            <span className="icon-first_page" />
          </a>
        </li>
        <li>
          <a
            title={this.props.showTitle ? Choerodon.getMessage('上一页', 'last page') : null}
            onClick={this.prev}
            tabIndex="0"
            role="button"
            onKeyPress={this.runIfEnterPrev}
            className={`${!prevDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-prev`}
            aria-disabled={prevDisabled}
          >
            {this.props.itemRender(prevPage, 'prev', <span className="icon-keyboard_arrow_left" />)}
          </a>
        </li>
        {pagerList}
        <li>
          <a
            title={this.props.showTitle ? Choerodon.getMessage('下一页', 'next page') : null}
            onClick={this.next}
            tabIndex="0"
            role="button"
            onKeyPress={this.runIfEnterNext}
            className={`${!nextDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-next`}
            aria-disabled={nextDisabled}
          >
            {this.props.itemRender(nextPage, 'next', <span className="icon-keyboard_arrow_right" />)}
          </a>
        </li>
        <li>
          <a
            role="button"
            onClick={this.toLastPage}
            className={`${!nextDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-last`}
          >
            <span className="icon-last_page" />
          </a>
        </li>
        <Options
          rootPrefixCls={prefixCls}
          selectComponentClass={this.props.selectComponentClass}
          selectPrefixCls={props.selectPrefixCls}
          changeSize={this.props.showSizeChanger ? this.changePageSize : null}
          current={this.state.current}
          pageSize={this.state.pageSize}
          pageSizeOptions={this.props.pageSizeOptions}
          quickGo={this.props.showQuickJumper ? this.handleChange : null}
          goButton={goButton}
        />
      </ul>
    );
  }
}

RePagination.propTypes = {
  current: PropTypes.number,
  defaultCurrent: PropTypes.number,
  total: PropTypes.number,
  pageSize: PropTypes.number,
  defaultPageSize: PropTypes.number,
  onChange: PropTypes.func,
  showSizeChanger: PropTypes.bool,
  showLessItems: PropTypes.bool,
  onShowSizeChange: PropTypes.func,
  selectComponentClass: PropTypes.func,
  showQuickJumper: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  showTitle: PropTypes.bool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.string),
  showTotal: PropTypes.func,
  // style: PropTypes.arrayOf(PropTypes.object),
  itemRender: PropTypes.func,
};
export default RePagination;
