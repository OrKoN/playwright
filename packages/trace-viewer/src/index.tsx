/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '@web/common.css';
import { applyTheme } from '@web/theme';
import '@web/third_party/vscode/codicon.css';
import * as ReactDOM from 'react-dom/client';
import { WorkbenchLoader } from './ui/workbenchLoader';
import { LiveWorkbenchLoader } from './ui/liveWorkbenchLoader';

(async () => {
  const queryParams = new URLSearchParams(window.location.search);

  applyTheme();
  if (window.location.protocol !== 'file:') {
    if (queryParams.get('isUnderTest') === 'true')
      await new Promise(f => setTimeout(f, 1000));
    if (!navigator.serviceWorker)
      throw new Error(`Service workers are not supported.\nMake sure to serve the Trace Viewer (${window.location}) via HTTPS or localhost.`);
    navigator.serviceWorker.register('sw.bundle.js');
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>(f => {
        navigator.serviceWorker.oncontrollerchange = () => f();
      });
    }

    // Keep SW running.
    setInterval(function() { fetch('ping'); }, 10000);
  }

  const trace = queryParams.get('trace');
  const traceIsLive = trace?.endsWith('.json');
  const workbench = traceIsLive ? <LiveWorkbenchLoader traceJson={trace!} /> : <WorkbenchLoader/>;
  ReactDOM.createRoot(document.querySelector('#root')!).render(workbench);
})();
