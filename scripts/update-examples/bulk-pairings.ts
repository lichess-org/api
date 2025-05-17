import { example, localClient } from './config';

example('bulk-pairing', 'getMyBulkPairings', await localClient().GET('/api/bulk-pairing'));
