import { observer } from 'mobx-react-lite';

import {
  flexCenterHorizontal,
  flexColumn,
  flexValue,
  fullSize,
  padding,
} from '../../styles';
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
    <div css={[flexCenterHorizontal, { overflow: 'auto' }]}>
      <div css={[fullSize, flexColumn, { gap: 5, width: 'min(100%, 600px)' }]}>
        <div css={[padding('md')]}>
          <InputGroup />
        </div>
        <div
          css={[
            flexValue(1),
            padding('md'),
            { overflow: 'auto' },
            flexColumn,
            { gap: 5 },
          ]}
        >
          {storageSystemList.map((system) => (
            <Button
              key={system.name}
              minimal
              css={[{ display: 'block', minHeight: 'unset' }]}
              onClick={() =>
                props.openPanel(
                  createPanel(system.name, (panelProps) => (
                    <SystemPanel system={system} {...panelProps} />
                  )),
                )
              }
            >
              <div>
                <h3>{system.name}</h3>
                <div>Storage Count: {system.storages.length}</div>
                <div>Item Count: Idk</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});
