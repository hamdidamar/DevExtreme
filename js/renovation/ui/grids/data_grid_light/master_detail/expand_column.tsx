import {
  Component, JSXComponent, ComponentBindings, OneWay,
  Effect, InternalState, Consumer, Ref, RefObject,
} from '@devextreme-generator/declarations';
import { Plugins, PluginsContext } from '../../../../utils/plugin/context';

import { Key, KeyExpr, RowData } from '../types';
import { IsExpanded, SetExpanded } from './plugins';
import eventsEngine from '../../../../../events/core/events_engine';
import { name as clickEvent } from '../../../../../events/click';
import { KeyExprPlugin } from '../data_grid_light';

export const viewFunction = (viewModel: ExpandColumn): JSX.Element => (
  <td
    ref={viewModel.cellRef}
    className="dx-command-expand dx-datagrid-group-space dx-datagrid-expand"
  >
    <div className={viewModel.isExpanded ? 'dx-datagrid-group-opened' : 'dx-datagrid-group-closed'} />
  </td>
);

@ComponentBindings()
export class ExpandColumnProps {
  @OneWay()
  data!: RowData;
}

@Component({
  defaultOptionRules: null,
  view: viewFunction,
})
export class ExpandColumn extends JSXComponent<ExpandColumnProps, 'data'>(ExpandColumnProps) {
  @Ref()
  cellRef!: RefObject<HTMLElement>;

  @Consumer(PluginsContext)
  plugins: Plugins = new Plugins();

  @InternalState()
  keyExpr: KeyExpr = '';

  @InternalState()
  isExpanded = false;

  @Effect()
  watchKeyExpr(): () => void {
    return this.plugins.watch(KeyExprPlugin, (keyExpr) => {
      this.keyExpr = keyExpr;
    });
  }

  @Effect()
  updateIsExpanded(): () => void {
    return this.plugins.watch(IsExpanded, (isExpanded) => {
      this.isExpanded = isExpanded(this.props.data[this.keyExpr]);
    });
  }

  @Effect()
  subscribeToRowClick(): () => void {
    eventsEngine.on(this.cellRef.current, clickEvent, this.onExpandColumnClick);
    return (): void => eventsEngine.off(this.cellRef.current, clickEvent, this.onExpandColumnClick);
  }

  onExpandColumnClick(e: Event): void {
    const target = e.target as Element;

    if (target.closest('.dx-datagrid-expand')) {
      this.toggleExpanded(this.props.data[this.keyExpr]);
    }
  }

  toggleExpanded(key: Key): void {
    this.plugins.callAction(SetExpanded, key, !this.isExpanded);
  }
}
