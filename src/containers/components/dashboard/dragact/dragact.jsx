import * as React from 'react';
import GridItem from './gridItem';
import { compactLayout } from './util/compact';
import { getMaxContainerHeight } from './util/sort';
import { layoutCheck } from './util/collison';
import { correctLayout } from './util/correction';
import { stringJoin } from './utils';
import { layoutItemForkey, syncLayout } from './util/initiate';

import './style.css';

export default class Dragact extends React.Component {
  constructor(props) {
    super(props);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    const { layout } = props;

    this.state = {
      GridXMoving: 0,
      GridYMoving: 0,
      wMoving: 0,
      hMoving: 0,
      placeholderShow: false,
      placeholderMoving: false,
      layout,
      containerHeight: 500,
      dragType: 'drag',
      mapLayout: undefined,
    };
  }

    onResizeStart = (layoutItem) => {
      const { GridX, GridY, w, h } = layoutItem;
      const { mapLayout, layout } = this.state;
      if (mapLayout) {
        const newlayout = syncLayout(mapLayout, layoutItem);
        this.setState({
          GridXMoving: GridX,
          GridYMoving: GridY,
          wMoving: w,
          hMoving: h,
          placeholderShow: true,
          placeholderMoving: true,
          mapLayout: newlayout,
          dragType: 'resize',
        });
      }
      if (this.props.onDragStart) {
        this.props.onDragStart(layoutItem, layout);
      }
    }

    onResizing = (layoutItem) => {
      const newLayout = layoutCheck(
        this.state.layout,
        layoutItem,
        `${layoutItem.UniqueKey}`,
        `${layoutItem.UniqueKey}`,
        0,
      );
      const { containerHeight } = this.state;

      const { compacted, mapLayout } = compactLayout(
        newLayout,
        layoutItem,
        this.state.mapLayout,
      );

      this.setState({
        layout: compacted,
        wMoving: layoutItem.w,
        hMoving: layoutItem.h,
        mapLayout,
        containerHeight: getMaxContainerHeight(
          compacted,
          this.props.rowHeight,
          this.props.margin[1],
          containerHeight,
          false,
        ),
      });
    }

    onResizeEnd = (layoutItem) => {
      const { compacted, mapLayout } = compactLayout(
        this.state.layout,
        undefined,
        this.state.mapLayout,
      );
      const { containerHeight } = this.state;
      this.setState({
        placeholderShow: false,
        layout: compacted,
        mapLayout,
        containerHeight: getMaxContainerHeight(
          compacted,
          this.props.rowHeight,
          this.props.margin[1],
          containerHeight,
        ),
      });
      if (this.props.onDragEnd) {
        this.props.onDragEnd(layoutItem, compacted);
      }
    }

    onDragStart(bundles) {
      const { GridX, GridY, w, h } = bundles;
      const { mapLayout } = this.state;
      if (this.state.mapLayout) {
        this.setState({
          GridXMoving: GridX,
          GridYMoving: GridY,
          wMoving: w,
          hMoving: h,
          placeholderShow: true,
          placeholderMoving: true,
          mapLayout: syncLayout(mapLayout, bundles),
          dragType: 'drag',
        });
      }
      if (this.props.onDragStart) {
        this.props.onDragStart(bundles, this.state.layout);
      }
    }

    onDrag(layoutItem) {
      const { GridY, UniqueKey } = layoutItem;
      const moving = GridY - this.state.GridYMoving;
      const { containerHeight } = this.state;
      const newLayout = layoutCheck(
        this.state.layout,
        layoutItem,
        `${UniqueKey}`,
        `${UniqueKey}` /* 用户移动方块的key */,
        moving,
      );
      const { compacted, mapLayout } = compactLayout(
        newLayout,
        layoutItem,
        this.state.mapLayout,
      );
      this.setState({
        GridXMoving: layoutItem.GridX,
        GridYMoving: layoutItem.GridY,
        layout: compacted,
        mapLayout,
        containerHeight: getMaxContainerHeight(
          compacted,
          this.props.rowHeight,
          this.props.margin[1],
          containerHeight,
        ),
      });
      if (this.props.onDrag) {
        this.props.onDrag(layoutItem, compacted);
      }
    }

    onDragEnd(layoutItem) {
      const { compacted, mapLayout } = compactLayout(
        this.state.layout,
        undefined,
        this.state.mapLayout,
      );

      const { containerHeight } = this.state;

      this.setState({
        placeholderShow: false,
        layout: compacted,
        mapLayout,
        containerHeight: getMaxContainerHeight(
          compacted,
          this.props.rowHeight,
          this.props.margin[1],
          containerHeight,
        ),
      });
      if (this.props.onDragEnd) {
        this.props.onDragEnd(layoutItem, compacted);
      }
    }

    renderPlaceholder() {
      if (!this.state.placeholderShow) return null;
      const { col, rowHeight, margin, placeholder, width } = this.props;
      let { padding } = this.props;
      const {
        GridXMoving,
        GridYMoving,
        wMoving,
        hMoving,
        placeholderMoving,
        dragType,
      } = this.state;

      if (!placeholder) return null;
      if (!padding) padding = 0;
      return (
        <GridItem
          margin={margin}
          col={col}
          containerWidth={width}
          containerPadding={[padding, padding]}
          rowHeight={rowHeight}
          GridX={GridXMoving}
          GridY={GridYMoving}
          w={wMoving}
          h={hMoving}
          style={{
            background: 'rgba(15,15,15,0.3)',
            zIndex: dragType === 'drag' ? 1 : 10,
            transition: ' all .15s ease-out',
          }}
          isUserMove={!placeholderMoving}
          dragType={dragType}
          canDrag={false}
          canResize={false}
        >
          {(p, resizerProps) => <div {...p} />}
        </GridItem>
      );
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.layout.length > nextProps.layout.length) {
        // remove
        const mapLayoutCopy = { ...this.state.mapLayout };
        nextProps.layout.forEach((child) => {
          if ((mapLayoutCopy)[`${child.key}`] !== void 666) delete (mapLayoutCopy)[`${child.key}`];
        });
        const { containerHeight } = this.state;
        const copyed = { ...this.state.mapLayout };
        const newLayout = nextProps.layout.map((item) => {
          const { w, h, GridX, GridY, key, ...others } = item;

          return {
            ...copyed[item.key],
            others,
          };
        });
        const { compacted, mapLayout } = compactLayout(
          newLayout,
          undefined,
          this.state.mapLayout,
        );
        this.setState({
          containerHeight: getMaxContainerHeight(
            compacted,
            this.props.rowHeight,
            this.props.margin[1],
            containerHeight,
          ),
          layout: compacted,
          mapLayout,
        });
      } else if (this.props.layout.length < nextProps.layout.length) {
        // add
        const copyed = { ...this.state.mapLayout };
        const newLayout = nextProps.layout.map((v) => {
          if (copyed[v.key]) {
            return {
              ...v,
              GridX: copyed[v.key].GridX,
              GridY: copyed[v.key].GridY,
              w: copyed[v.key].w,
              h: copyed[v.key].h,
              key: copyed[v.key].key,
            };
          }

          return {
            ...v,
            isUserMove: false,
            key: `${v.key}`,
          };
        });
        const { containerHeight } = this.state;
        const { compacted, mapLayout } = compactLayout(
          newLayout,
          undefined,
          this.state.mapLayout,
        );
        this.setState({
          containerHeight: getMaxContainerHeight(
            compacted,
            this.props.rowHeight,
            this.props.margin[1],
            containerHeight,
            false,
          ),
          layout: compacted,
          mapLayout,
        });
      } else {
        this.recalculateLayout(nextProps.layout, nextProps.col);
      }
    }

    recalculateLayout = (layout, col) => {
      const corrected = correctLayout(layout, col);
      const { containerHeight } = this.state;
      const { compacted, mapLayout } = compactLayout(
        corrected,
        undefined,
        undefined,
      );
      this.setState({
        layout: compacted,
        mapLayout,
        containerHeight: getMaxContainerHeight(
          compacted,
          this.props.rowHeight,
          this.props.margin[1],
          containerHeight,
          false,
        ),
      });
    }

    componentDidMount() {
      setTimeout(() => {
        this.recalculateLayout(this.state.layout, this.props.col);
      }, 1);
    }

    getGridItem(child, index) {
      const { dragType, mapLayout } = this.state;
      const { col, rowHeight, margin, width } = this.props;
      let { padding } = this.props;
      if (mapLayout) {
        const renderItem = layoutItemForkey(mapLayout, `${child.key}`);
        if (!padding) padding = 0;
        return (
          <GridItem
            {...renderItem}
            margin={margin}
            col={col}
            containerWidth={width}
            containerPadding={[padding, padding]}
            rowHeight={rowHeight}
            onDrag={this.onDrag}
            onDragStart={this.onDragStart}
            onDragEnd={this.onDragEnd}
            isUserMove={
                        renderItem.isUserMove !== void 666
                          ? renderItem.isUserMove
                          : false
                    }
            UniqueKey={child.key}
            onResizing={this.onResizing}
            onResizeStart={this.onResizeStart}
            onResizeEnd={this.onResizeEnd}
            dragType={dragType}
            key={child.key}
          >
            {(GridItemProvided, dragHandle, resizeHandle) => this.props.children(child, {
              isDragging:
                                renderItem.isUserMove !== void 666
                                  ? renderItem.isUserMove
                                  : false,
              props: GridItemProvided,
              dragHandle,
              resizeHandle,
            })
                    }
          </GridItem>
        );
      }
    }

    render() {
      const { className, layout, style, width } = this.props;
      const { containerHeight } = this.state;

      return (
        <div
          className={stringJoin('DraggerLayout', `${className}`)}
          style={{
            ...style,
            left: 100,
            width,
            height: containerHeight,
            zIndex: 1,
          }}
        >
          {layout.map((item, index) => this.getGridItem(item, index))}
          {this.renderPlaceholder()}
        </div>
      );
    }

    // api
    getLayout() {
      return this.state.layout;
    }

    // api
    deleteItem(key) {}
}
