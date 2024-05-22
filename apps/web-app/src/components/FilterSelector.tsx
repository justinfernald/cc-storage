import { observer } from 'mobx-react-lite';

import { flexColumn, padding } from '../styles';
import { Checkbox } from '@blueprintjs/core';
import {
  FilterInfo,
  SearchTag,
  SortDirection,
  SortMode,
} from '../interfaces/item-filter-types';
import { makeSimpleAutoObservable } from '../utils/mobx/mobx';
import { BaseViewModel } from '../utils/mobx/ViewModel';

export class FilterSelectorViewModel extends BaseViewModel {
  constructor() {
    super();
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }

  filterInfo: FilterInfo = {
    search: '',
    regexMode: false,
    searchTags: new Set([
      SearchTag.DISPLAY_NAME,
      SearchTag.NAME,
      SearchTag.LORE,
      SearchTag.ENCHANTMENTS,
      SearchTag.TAGS,
    ]),
    sortMode: SortMode.DISPLAY_NAME,
    sortDirection: SortDirection.ASC,
  };

  setSearch(search: string) {
    this.filterInfo.search = search;
  }

  toggleSortDirection() {
    this.filterInfo.sortDirection =
      this.filterInfo.sortDirection === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC;
  }

  setSearchTag(tag: SearchTag, enabled: boolean) {
    if (enabled) {
      this.filterInfo.searchTags.add(tag);
    } else {
      this.filterInfo.searchTags.delete(tag);
    }
  }
}

export interface FilterSelectorProps {
  viewModel: FilterSelectorViewModel;
}

export const FilterSelector = observer((props: FilterSelectorProps) => {
  const { viewModel } = props;

  return (
    <div css={[padding('md'), flexColumn, { gap: 5 }]}>
      <div>Text Search Filter</div>
      <div>
        {Object.values(SearchTag).map((tag) => (
          <Checkbox
            key={tag}
            checked={viewModel.filterInfo.searchTags.has(tag)}
            onChange={(event) => {
              viewModel.setSearchTag(tag, event.target.checked);
            }}
            label={tag}
          />
        ))}
      </div>
    </div>
  );
});
