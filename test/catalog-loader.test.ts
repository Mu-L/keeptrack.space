import { CatalogLoader } from '@app/app/data/catalog-loader';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { readFileSync } from 'fs';

describe('Catalog Loader', () => {
  beforeAll(() => {
    setupStandardEnvironment();
  });

  beforeEach(() => {
    const tle = readFileSync('./test/environment/TLE2.json');
    const json = JSON.parse(tle.toString());

    // Mock fetch for this test
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(json),
        text: () => Promise.resolve(''),
        ok: true,
        status: 200,
      } as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load the catalog', async () => {
    settingsManager.isDisableAsciiCatalog = true;
    await CatalogLoader.load();
    expect(globalThis.fetch).toHaveBeenCalled();
  });
});
