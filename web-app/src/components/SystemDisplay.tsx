import { observer } from 'mobx-react-lite';

import { flexCenterHorizontal, flexColumn, fullSize, padding } from '../styles';
import { StorageSystem } from '../interfaces/types';
import { useState } from 'react';
import { Button, ControlGroup, InputGroup } from '@blueprintjs/core';
import {
  FilterInfo,
  SortDirection,
  SortMode,
  SystemDisplayMode,
} from '../interfaces/item-filter-types';
import { SystemListView } from './SystemListView';
import { SystemInventoryView } from './SystemInventoryView';

interface SystemDisplayProps {
  system: StorageSystem;
}
export const SystemDisplay = observer((props: SystemDisplayProps) => {
  const { system } = props;

  const [displayMode, setDisplayMode] = useState(SystemDisplayMode.LIST);
  const [filterInfo, setFilterInfo] = useState<FilterInfo>({
    search: '',
    regexMode: false,
    searchTags: new Set(),
    sortMode: SortMode.NAME,
    sortDirection: SortDirection.ASC,
  });

  return (
    <div css={[fullSize, flexCenterHorizontal]}>
      <div css={[fullSize, flexColumn, { gap: 5, width: 'min(100%, 600px)' }]}>
        <ControlGroup css={[padding('md')]} fill={true} vertical={false}>
          <Button
            icon={displayMode === SystemDisplayMode.LIST ? 'list' : 'box'}
            title={
              displayMode === SystemDisplayMode.LIST ? 'List View' : 'Inventory View'
            }
            onClick={() => {
              setDisplayMode((mode) =>
                mode === SystemDisplayMode.LIST
                  ? SystemDisplayMode.INVENTORY
                  : SystemDisplayMode.LIST,
              );
            }}
          />
          <InputGroup fill={true} rightElement={<Button minimal icon="filter-list" />} />
        </ControlGroup>
        <div css={[{ overflow: 'auto' }]}>
          {displayMode === SystemDisplayMode.LIST && (
            <SystemListView filterInfo={filterInfo} system={system} />
          )}
          {displayMode === SystemDisplayMode.INVENTORY && (
            <SystemInventoryView filterInfo={filterInfo} system={system} />
          )}
        </div>
      </div>
    </div>
  );
});
