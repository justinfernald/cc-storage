import { observer } from 'mobx-react-lite';

import { flexCenterHorizontal, flexColumn, fullSize, padding } from '../styles';
import { StorageSystem } from '@cc-storage/common/src/types/types';
import { useState } from 'react';
import { Button, ControlGroup, InputGroup, Popover } from '@blueprintjs/core';
import { SortDirection, SystemDisplayMode } from '../interfaces/item-filter-types';
import { SystemListView } from './SystemListView';
import { SystemInventoryView } from './SystemInventoryView';
import { FilterSelector, FilterSelectorViewModel } from './FilterSelector';
import { useViewModelConstructor } from '../utils/mobx/ViewModel';

interface SystemDisplayProps {
  system: StorageSystem;
}
export const SystemDisplay = observer((props: SystemDisplayProps) => {
  const { system } = props;

  const [displayMode, setDisplayMode] = useState(SystemDisplayMode.LIST);
  const filterSelectorViewModel = useViewModelConstructor(FilterSelectorViewModel);

  return (
    <div css={[fullSize, flexCenterHorizontal]}>
      <div css={[fullSize, flexColumn, { gap: 5, width: 'min(100%, 600px)' }]}>
        <ControlGroup css={[padding('md')]} fill={true} vertical={false}>
          <Button
            // disabled since box view is not complete
            // disabled
            // title="Disabled due to incomplete feature"
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
          <InputGroup
            fill={true}
            rightElement={
              <>
                <Popover
                  interactionKind="click"
                  content={<FilterSelector viewModel={filterSelectorViewModel} />}
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  renderTarget={({ isOpen, ...targetProps }) => (
                    <Button {...targetProps} minimal icon="filter-list" />
                  )}
                />
                <Button
                  minimal
                  onClick={filterSelectorViewModel.toggleSortDirection}
                  icon={
                    filterSelectorViewModel.filterInfo.sortDirection === SortDirection.ASC
                      ? 'sort-alphabetical'
                      : 'sort-alphabetical-desc'
                  }
                />
              </>
            }
            onValueChange={filterSelectorViewModel.setSearch}
          />
        </ControlGroup>
        <div css={[{ overflow: 'auto' }]}>
          {displayMode === SystemDisplayMode.LIST && (
            <SystemListView
              filterInfo={filterSelectorViewModel.filterInfo}
              system={system}
            />
          )}
          {displayMode === SystemDisplayMode.INVENTORY && (
            <SystemInventoryView
              filterInfo={filterSelectorViewModel.filterInfo}
              system={system}
            />
          )}
        </div>
      </div>
    </div>
  );
});
