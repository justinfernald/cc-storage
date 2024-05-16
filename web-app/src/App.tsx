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
        <Card css={{}}>
          <h1>Fetching Update...</h1>
        </Card>
      </div>
    );
  }

  return (
    <div css={[absolute(), fullSize]}>
      <PanelManager />
    </div>
  );
});
