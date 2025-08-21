import {
  HOME,
  ABOUT,
  PROFILE,
  SETTINGS,
  MORE,
  MORE_SUB_ITEM_1,
  MORE_SUB_ITEM_2,
} from '@/lib/constants/routes/Dashboard';

describe('Dashboard Routes', () => {
  it('exports correct route constants', () => {
    expect(HOME).toBe('/');
    expect(ABOUT).toBe('/about');
    expect(PROFILE).toBe('/profile');
    expect(SETTINGS).toBe('/settings');
    expect(MORE).toBe('/more');
    expect(MORE_SUB_ITEM_1).toBe('/more/sub-item-1');
    expect(MORE_SUB_ITEM_2).toBe('/more/sub-item-2');
  });

  it('all routes are defined', () => {
    expect(HOME).toBeDefined();
    expect(ABOUT).toBeDefined();
    expect(PROFILE).toBeDefined();
    expect(SETTINGS).toBeDefined();
    expect(MORE).toBeDefined();
    expect(MORE_SUB_ITEM_1).toBeDefined();
    expect(MORE_SUB_ITEM_2).toBeDefined();
  });

  it('should have correct route values', () => {
    expect(HOME).toBe('/');
    expect(ABOUT).toBe('/about');
    expect(PROFILE).toBe('/profile');
    expect(SETTINGS).toBe('/settings');
    expect(MORE).toBe('/more');
    expect(MORE_SUB_ITEM_1).toBe('/more/sub-item-1');
    expect(MORE_SUB_ITEM_2).toBe('/more/sub-item-2');
  });

  it('routes have expected types', () => {
    expect(typeof HOME).toBe('string');
    expect(typeof ABOUT).toBe('string');
    expect(typeof PROFILE).toBe('string');
    expect(typeof SETTINGS).toBe('string');
    expect(typeof MORE).toBe('string');
    expect(typeof MORE_SUB_ITEM_1).toBe('string');
    expect(typeof MORE_SUB_ITEM_2).toBe('string');
  });

  it('routes start with forward slash', () => {
    expect(HOME.startsWith('/')).toBe(true);
    expect(ABOUT.startsWith('/')).toBe(true);
    expect(PROFILE.startsWith('/')).toBe(true);
    expect(SETTINGS.startsWith('/')).toBe(true);
    expect(MORE.startsWith('/')).toBe(true);
    expect(MORE_SUB_ITEM_1.startsWith('/')).toBe(true);
    expect(MORE_SUB_ITEM_2.startsWith('/')).toBe(true);
  });

  it('sub-routes contain their parent route', () => {
    expect(MORE_SUB_ITEM_1.includes(MORE)).toBe(true);
    expect(MORE_SUB_ITEM_2.includes(MORE)).toBe(true);
  });
});
