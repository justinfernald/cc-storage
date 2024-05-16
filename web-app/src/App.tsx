import { observer } from 'mobx-react-lite';
import './App.css';

import { Card } from './components/base';
import { AppModel } from './models/AppModel';
import { absolute, flexCenter, fullSize, padding } from './styles';
import { PanelManager } from './components/panels/PanelManager';

export const appModel = new AppModel();
appModel.fetchUpdate();

export const App = observer(() => {
  if (!appModel.storageSystems) {
    return (
      <div css={[absolute(), fullSize, flexCenter, padding('md')]}>
        Fetching Update...
      </div>
    );
  }

  return (
    <div css={[absolute(), fullSize]}>
      <PanelManager />
    </div>
  );
});
