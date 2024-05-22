import { observer } from 'mobx-react-lite';

import { fullSize } from '../../styles';
import { useEffect, useState } from 'react';
import { Panel, PanelStack2 } from '@blueprintjs/core';
import { SystemSelectionPanel } from './SystemSelectionPanel';

export interface PanelInfo {
  title: string;
  stack: Panel<PanelInfo>[];
  onClose: () => void;
  openPanel: (panel: Panel<PanelInfo>) => void;
}

export const PanelManager = observer(() => {
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
          stack: currentPanelStack,
          onClose: popPanel,
          openPanel: pushPanel,
        }),
      title,
    };
  }

  const systemSelectionPanel = createPanel('System Selection', (panelProps) => (
    <SystemSelectionPanel {...panelProps} />
  ));

  const [currentPanelStack, setCurrentPanelStack] = useState<Panel<PanelInfo>[]>([
    systemSelectionPanel,
  ]);

  useEffect(() => {
    // const interval = setInterval(() => {
    //   setCurrentPanelStack((currentPanelStack) => {
    //     return [...currentPanelStack, newPanel];
    //   });
    // }, 5000);
    // return () => clearInterval(interval);
  }, []);

  const popPanel = () => {
    setCurrentPanelStack((currentPanelStack) => {
      const newPanelStack = [...currentPanelStack];
      newPanelStack.pop();
      return newPanelStack;
    });
  };

  const pushPanel = (panel: Panel<PanelInfo>) => {
    setCurrentPanelStack((currentPanelStack) => {
      return [...currentPanelStack, panel];
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <PanelStack2<Panel<any>>
      css={[fullSize]}
      stack={currentPanelStack}
      onClose={popPanel}
    />
  );
});
