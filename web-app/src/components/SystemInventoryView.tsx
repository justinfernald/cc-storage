import { observer } from 'mobx-react-lite';

import { StorageSystem } from '../interfaces/types';
import { FilterInfo } from '../interfaces/item-filter-types';

export interface SystemInventoryViewProps {
  system: StorageSystem;
  filterInfo: FilterInfo;
}

export const SystemInventoryView = observer((props: SystemInventoryViewProps) => {
  const { system } = props;

  return <div></div>;
});
