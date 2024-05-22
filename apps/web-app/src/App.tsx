import { observer } from 'mobx-react-lite';
import './App.css';

import { AppModel } from './models/AppModel';
import { absolute, flexCenter, fullSize, padding } from './styles';
import { PanelManager } from './components/panels/PanelManager';

import { Wap } from 'utils';
import {} from 'types/';

export const appModel = new AppModel();
appModel.updateStorageSystemCollection();

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
