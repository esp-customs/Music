import { should, use } from 'chai';
import spies from 'chai-spies';
import events from 'chai-events';

use(spies);
use(events);
use(should);

import './unit/q.tests';

import './integration/player.tests';