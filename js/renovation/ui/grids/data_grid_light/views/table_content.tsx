import {
  Component, JSXComponent, ComponentBindings, OneWay, Fragment,
  Consumer, Effect, Ref, RefObject,
} from '@devextreme-generator/declarations';

import { Table } from '../widgets/table';
import { DataRow } from '../widgets/data_row';
import { Column, Row } from '../types';
import {
  createValue, Plugins, PluginsContext,
} from '../../../../utils/plugin/context';
import eventsEngine from '../../../../../events/core/events_engine';
import { name as clickEvent } from '../../../../../events/click';

export const viewFunction = (viewModel: TableContent): JSX.Element => (
  <div className="dx-datagrid-rowsview dx-datagrid-nowrap dx-datagrid-after-headers" role="presentation">
    <div ref={viewModel.divRef} className="dx-datagrid-content">
      <Table>
        <Fragment>
          {
          viewModel.props.dataSource.map((item, rowIndex) => (
            <DataRow
              // eslint-disable-next-line react/no-array-index-key
              key={rowIndex}
              row={item}
              rowIndex={rowIndex}
              columns={viewModel.props.columns}
            />
          ))
          }
        </Fragment>
      </Table>
    </div>
  </div>
);

export const RowClick = createValue<(row: Row) => void>();

@ComponentBindings()
export class TableContentProps {
  @OneWay()
  dataSource: Row[] = [];

  @OneWay()
  columns: Column[] = [];
}

@Component({
  defaultOptionRules: null,
  jQuery: { register: false },
  view: viewFunction,
})
export class TableContent extends JSXComponent(TableContentProps) {
  @Ref()
  divRef!: RefObject<HTMLDivElement>;

  @Consumer(PluginsContext)
  plugins: Plugins = new Plugins();

  @Effect()
  subscribeToRowClick(): () => void {
    eventsEngine.on(this.divRef.current, clickEvent, '.dx-row', this.onRowClick);
    return (): void => eventsEngine.off(this.divRef.current, clickEvent, this.onRowClick);
  }

  onRowClick(e: Event): void {
    const allRows = this.divRef.current!.getElementsByClassName('dx-row');
    const index = Array.from(allRows).indexOf(e.currentTarget as Element);
    if (index >= 0) {
      this.plugins.callAction(RowClick, this.props.dataSource[index]);
    }
  }
}
