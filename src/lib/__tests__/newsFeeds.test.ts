import { normalizeRssItem, mergeAndDedupeNews, NewsItem } from '@/lib/newsFeeds';

describe('normalizeRssItem', () => {
  it('maps a full item with enclosure image to NewsItem', () => {
    const item = {
      guid: 'guid-1',
      title: '  Test Title  ',
      link: 'https://example.com/article-1',
      isoDate: '2024-01-15T10:00:00.000Z',
      enclosure: { url: 'https://example.com/img.jpg', type: 'image/jpeg' },
    };
    const result = normalizeRssItem(item, 'TestSource');
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Test Title');
    expect(result!.publisher).toBe('TestSource');
    expect(result!.link).toBe('https://example.com/article-1');
    expect(result!.uuid).toBe('guid-1');
    expect(result!.providerPublishTime).toBe('2024-01-15T10:00:00.000Z');
    expect(result!.thumbnail).toEqual({ resolutions: [{ url: 'https://example.com/img.jpg' }] });
  });

  it('maps item with media:content to thumbnail', () => {
    const item = {
      title: 'Media Content Article',
      link: 'https://example.com/article-2',
      'media:content': { $: { url: 'https://example.com/media.jpg' } },
    };
    const result = normalizeRssItem(item, 'Source2');
    expect(result).not.toBeNull();
    expect(result!.thumbnail).toEqual({ resolutions: [{ url: 'https://example.com/media.jpg' }] });
  });

  it('maps item with media:thumbnail to thumbnail', () => {
    const item = {
      title: 'Media Thumbnail Article',
      link: 'https://example.com/article-3',
      'media:thumbnail': { $: { url: 'https://example.com/thumb.jpg' } },
    };
    const result = normalizeRssItem(item, 'Source3');
    expect(result).not.toBeNull();
    expect(result!.thumbnail).toEqual({ resolutions: [{ url: 'https://example.com/thumb.jpg' }] });
  });

  it('ignores non-image enclosures', () => {
    const item = {
      title: 'Audio Article',
      link: 'https://example.com/audio',
      enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg' },
    };
    const result = normalizeRssItem(item, 'Source');
    expect(result).not.toBeNull();
    expect(result!.thumbnail).toBeUndefined();
  });

  it('returns null for item missing title', () => {
    const item = { link: 'https://example.com/article' };
    expect(normalizeRssItem(item, 'Source')).toBeNull();
  });

  it('returns null for item with empty title', () => {
    const item = { title: '   ', link: 'https://example.com/article' };
    expect(normalizeRssItem(item, 'Source')).toBeNull();
  });

  it('returns null for item missing link', () => {
    const item = { title: 'Some Title' };
    expect(normalizeRssItem(item, 'Source')).toBeNull();
  });

  it('falls back to link as uuid when guid is absent', () => {
    const item = { title: 'No GUID', link: 'https://example.com/article-x' };
    const result = normalizeRssItem(item, 'Source');
    expect(result).not.toBeNull();
    expect(result!.uuid).toBe('https://example.com/article-x');
  });

  it('falls back to pubDate when isoDate is absent', () => {
    const item = { title: 'Old Article', link: 'https://example.com/old', pubDate: 'Mon, 15 Jan 2024 10:00:00 +0000' };
    const result = normalizeRssItem(item, 'Source');
    expect(result).not.toBeNull();
    expect(result!.providerPublishTime).toBe('Mon, 15 Jan 2024 10:00:00 +0000');
  });
});

describe('mergeAndDedupeNews', () => {
  const makeItem = (overrides: Partial<NewsItem>): NewsItem => ({
    uuid: 'uuid-1',
    title: 'Default Title',
    publisher: 'Publisher',
    link: 'https://example.com/article-1',
    providerPublishTime: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  });

  it('dedupes items with the same link across two lists', () => {
    const list1 = [makeItem({ uuid: 'a', link: 'https://example.com/article' })];
    const list2 = [makeItem({ uuid: 'b', link: 'https://example.com/article' })];
    const result = mergeAndDedupeNews([list1, list2]);
    expect(result).toHaveLength(1);
  });

  it('dedupes by normalized link (strips query string and trailing slash, case-insensitive)', () => {
    const list1 = [makeItem({ uuid: 'a', link: 'https://Example.com/Article/' })];
    const list2 = [makeItem({ uuid: 'b', link: 'https://example.com/article?ref=rss' })];
    const result = mergeAndDedupeNews([list1, list2]);
    expect(result).toHaveLength(1);
  });

  it('dedupes by title when links differ', () => {
    const list1 = [makeItem({ uuid: 'a', link: 'https://example.com/a', title: 'Same Title' })];
    const list2 = [makeItem({ uuid: 'b', link: 'https://example.com/b', title: 'Same Title' })];
    const result = mergeAndDedupeNews([list1, list2]);
    expect(result).toHaveLength(1);
  });

  it('sorts items newest first', () => {
    const list = [
      makeItem({ uuid: 'a', link: 'https://example.com/old', title: 'Old', providerPublishTime: new Date('2024-01-01T00:00:00Z') }),
      makeItem({ uuid: 'b', link: 'https://example.com/new', title: 'New', providerPublishTime: new Date('2024-01-15T00:00:00Z') }),
      makeItem({ uuid: 'c', link: 'https://example.com/mid', title: 'Mid', providerPublishTime: new Date('2024-01-08T00:00:00Z') }),
    ];
    const result = mergeAndDedupeNews([list]);
    expect(result[0].title).toBe('New');
    expect(result[1].title).toBe('Mid');
    expect(result[2].title).toBe('Old');
  });

  it('sorts with ISO string dates', () => {
    const list = [
      makeItem({ uuid: 'a', link: 'https://example.com/a', title: 'Older', providerPublishTime: '2024-01-01T00:00:00.000Z' }),
      makeItem({ uuid: 'b', link: 'https://example.com/b', title: 'Newer', providerPublishTime: '2024-01-15T00:00:00.000Z' }),
    ];
    const result = mergeAndDedupeNews([list]);
    expect(result[0].title).toBe('Newer');
  });

  it('sorts with Unix timestamp (seconds) dates', () => {
    const list = [
      makeItem({ uuid: 'a', link: 'https://example.com/a', title: 'Older', providerPublishTime: 1704067200 }),
      makeItem({ uuid: 'b', link: 'https://example.com/b', title: 'Newer', providerPublishTime: 1705363200 }),
    ];
    const result = mergeAndDedupeNews([list]);
    expect(result[0].title).toBe('Newer');
  });

  it('caps output at 40 items', () => {
    const list = Array.from({ length: 50 }, (_, i) =>
      makeItem({ uuid: `u${i}`, link: `https://example.com/article-${i}`, title: `Article ${i}` })
    );
    const result = mergeAndDedupeNews([list]);
    expect(result).toHaveLength(40);
  });

  it('returns empty array for empty input', () => {
    expect(mergeAndDedupeNews([])).toEqual([]);
    expect(mergeAndDedupeNews([[]])).toEqual([]);
  });

  it('handles distinct items from two lists', () => {
    const list1 = [makeItem({ uuid: 'a', link: 'https://example.com/a', title: 'Article A' })];
    const list2 = [makeItem({ uuid: 'b', link: 'https://example.com/b', title: 'Article B' })];
    const result = mergeAndDedupeNews([list1, list2]);
    expect(result).toHaveLength(2);
  });
});
