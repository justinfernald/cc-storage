import { observer } from 'mobx-react-lite';

import { flexCenterHorizontal, fullSize, padding } from '../../styles';
import { Button, InputGroup, Panel } from '@blueprintjs/core';
import { PanelInfo } from './PanelManager';
import { appModel } from '../../App';
import { SystemPanel } from './SystemPanel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SystemSelectionPanelInfo extends PanelInfo {}

export const SystemSelectionPanel = observer((props: SystemSelectionPanelInfo) => {
  function createPanel(
    title: string,
    renderPanel: (panelProps: PanelInfo) => JSX.Element,
  ): Panel<PanelInfo> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: {} as any,
      renderPanel: () =>
        renderPanel({
          title,
          stack: props.stack,
          onClose: props.onClose,
          openPanel: props.openPanel,
        }),
      title,
    };
  }

  const { storageSystems } = appModel;

  if (storageSystems === null) {
    return <div>Loading...</div>;
  }

  const storageSystemList = Array.from(storageSystems.values());

  return (
    <div css={[fullSize, flexCenterHorizontal, padding('md')]}>
      <div css={[{ width: 'min(90%, 600px)' }]}>
        <InputGroup />
        <div>
          {storageSystemList.map((system) => (
            <div key={system.name}>
              <div>{system.name}</div>
              <div>Storage Count: {system.storages.length}</div>
              <div>Item Count: Idk</div>
              <Button
                onClick={() =>
                  props.openPanel(
                    createPanel(system.name, (panelProps) => (
                      <SystemPanel system={system} {...panelProps} />
                    )),
                  )
                }
              >
                Open System
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
