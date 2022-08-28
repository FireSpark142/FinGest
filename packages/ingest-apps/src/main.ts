import { mapper } from './app/symbolmapper';
import { startStreams } from './app/sendTrades';
import { startDataFlow } from '@finjest/ingest';

(function main() {
  mapper();
  startDataFlow();
  startStreams();
})();
