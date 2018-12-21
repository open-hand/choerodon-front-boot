import * as React from 'react';
import Dragger from './dragger/index';
import { checkInContainer } from './util/correction';

const checkWidthHeight = (GridX, w, h, col) => {
  let newW = w;
  let newH = h;
  if (GridX + w > col - 1) newW = col - GridX; // 右边界
  if (w < 1) newW = 1;
  if (h < 1) newH = 1;
  return {
    w: newW, h: newH,
  };
};

export default class GridItem extends React.Component {
  constructor(props) {
    super(props);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.calGridXY = this.calGridXY.bind(this);
    this.calColWidth = this.calColWidth.bind(this);
  }


    static defaultProps = {
      col: 12,
      containerWidth: 500,
      containerPadding: [0, 0],
      margin: [10, 10],
      rowHeight: 30,
      w: 1,
      h: 1,
    }

    /** 计算容器的每一个格子多大 */
    calColWidth() {
      const { containerWidth, col, containerPadding, margin } = this.props;

      if (margin) {
        return (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col;
      }
      return (containerWidth - containerPadding[0] * 2 - 0 * (col + 1)) / col;
    }

    /** 转化，计算网格的GridX,GridY值 */
    calGridXY(x, y) {
      const { margin, containerWidth, col, w, rowHeight } = this.props;

      /** 坐标转换成格子的时候，无须计算margin */
      const GridX = Math.round(x / containerWidth * col);
      const GridY = Math.round(y / (rowHeight + (margin ? margin[1] : 0)));

      // /**防止元素出container */
      return checkInContainer(GridX, GridY, col, w);
    }


    /** 给予一个grid的位置，算出元素具体的在容器中位置在哪里，单位是px */
    calGridItemPosition(GridX, GridY) {
      let { margin } = this.props;
      const { rowHeight } = this.props;
      if (!margin) margin = [0, 0];

      const x = Math.round(GridX * this.calColWidth() + (GridX + 1) * margin[0]);
      const y = Math.round(GridY * rowHeight + margin[1] * (GridY + 1));


      return {
        x,
        y,
      };
    }


    shouldComponentUpdate(props, state) {
      let isUpdate = false;
      Object.keys(props).forEach((key) => {
        if ((props)[key] !== (this.props)[key]) {
          isUpdate = true;
        }
      });
      return isUpdate;

      // return this.props.GridX !== props.GridX ||
      //     this.props.GridY !== props.GridY ||
      //     this.props.isUserMove !== props.isUserMove ||
      //     this.props.w !== props.w ||
      //     this.props.h !== props.h ||
      //     this.props.containerWidth !== props.containerWidth ||
      //     this.props.col !== props.col ||
      //     this.props.rowHeight !== props.rowHeight
    }

    /** 宽和高计算成为px */
    calWHtoPx(w, h) {
      let { margin } = this.props;

      if (!margin) margin = [0, 0];
      const wPx = Math.round(w * this.calColWidth() + (w - 1) * margin[0]);
      const hPx = Math.round(h * this.props.rowHeight + (h - 1) * margin[1]);

      return { wPx, hPx };
    }

    calPxToWH(wPx, hPx) {
      const calWidth = this.calColWidth();

      const w = Math.round((wPx - calWidth * 0.5) / calWidth);
      const h = Math.round((hPx - this.props.rowHeight * 0.5) / this.props.rowHeight);
      return checkWidthHeight(this.props.GridX, w, h, this.props.col);
    }

    onDragStart(x, y) {
      const { w, h, UniqueKey } = this.props;

      if (this.props.static) return;

      const { GridX, GridY } = this.calGridXY(x, y);

      if (this.props.onDragStart) {
        this.props.onDragStart({
          event: null, GridX, GridY, w, h, UniqueKey: `${UniqueKey}`,
        });
      }
    }

    onDrag(event, x, y) {
      if (this.props.static) return;
      const { GridX, GridY } = this.calGridXY(x, y);
      const { w, h, UniqueKey } = this.props;
      if (this.props.onDrag) {
        this.props.onDrag({ GridX, GridY, w, h, UniqueKey: `${UniqueKey}`, event });
      }
    }

    onDragEnd(event, x, y) {
      if (this.props.static) return;
      const { GridX, GridY } = this.calGridXY(x, y);
      const { w, h, UniqueKey } = this.props;
      if (this.props.onDragEnd) this.props.onDragEnd({ GridX, GridY, w, h, UniqueKey: `${UniqueKey}`, event });
    }

    onResizeStart = (event, wPx, hPx) => {
      const { GridX, GridY, UniqueKey, w, h } = this.props;
      if (this.props.onResizeStart) {
        this.props.onResizeStart({ GridX, GridY, w, h, UniqueKey: `${UniqueKey}`, event });
      }
    }

    onResizing = (event, wPx, hPx) => {
      const { w, h } = this.calPxToWH(wPx, hPx);

      const { GridX, GridY, UniqueKey } = this.props;
      if (this.props.onResizing) {
        this.props.onResizing({ GridX, GridY, w, h, UniqueKey: `${UniqueKey}`, event });
      }
    }

    onResizeEnd = (event, wPx, hPx) => {
      const { w, h } = this.calPxToWH(wPx, hPx);
      const { GridX, GridY, UniqueKey } = this.props;

      if (this.props.onResizeEnd) {
        this.props.onResizeEnd({ GridX, GridY, w, h, UniqueKey: `${UniqueKey}`, event });
      }
    }

    render() {
      const { w, h, style, bounds, GridX, GridY, handle, canDrag, canResize } = this.props;
      const { x, y } = this.calGridItemPosition(GridX, GridY);
      const { wPx, hPx } = this.calWHtoPx(w, h);
      const dragIndex = (this.props.dragType === 'drag' ? 10 : 2);
      return (
        <Dragger
          style={{
            ...style,
            width: wPx,
            height: hPx,
            position: 'absolute',
            transition: this.props.isUserMove ? '' : 'all .2s ease-out',
            zIndex: this.props.isUserMove ? dragIndex : 2,
          }}
          onDragStart={this.onDragStart}
          onMove={this.onDrag}
          onDragEnd={this.onDragEnd}
          onResizeStart={this.onResizeStart}
          onResizing={this.onResizing}
          onResizeEnd={this.onResizeEnd}
          x={x}
          y={y}
          w={wPx}
          h={hPx}
          isUserMove={this.props.isUserMove}
          bounds={bounds}
          handle={handle}
          canDrag={canDrag}
          canResize={canResize}
        >
          {(provided, draggerProps, resizerProps) => this.props.children(provided, draggerProps, resizerProps)}
        </Dragger>
      );
    }
}
