import { observer } from 'mobx-react-lite';

import { fullSize, padding } from '../../styles';
import { StorageSystem } from '../../interfaces/types';
import { SystemDisplay } from '../../components/SystemDisplay';
import { PanelInfo } from './PanelManager';

export interface SystemPanelInfo extends PanelInfo {
  system: StorageSystem;
}

export const SystemPanel = observer((props: SystemPanelInfo) => {
  const { system } = props;

  return (
    <div css={[fullSize, { overflow: 'auto' }]}>
      <SystemDisplay system={system} />
      {/* {system.storages.map((storage) => (
        <Storage key={storage.name} storage={storage} />
      ))} */}
    </div>
  );
});
