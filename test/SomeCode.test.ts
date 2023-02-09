import { unlinkSync, readdirSync } from 'fs';

test.skip('Clean up old model files', async () => {
  readdirSync('./models/')
    .filter((f) => /^..\.json$/.test(f))
    .map((f) => unlinkSync('./models/' + f));
});
