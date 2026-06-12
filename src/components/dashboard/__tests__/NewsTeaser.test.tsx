import { render, screen, waitFor } from '@testing-library/react';
import NewsTeaser from '../NewsTeaser';

global.fetch = jest.fn();

const mockNewsItems = [
  {
    uuid: '1',
    title: 'Nifty 50 rises sharply on FII inflows',
    publisher: 'Economic Times',
    link: 'https://example.com/1',
    providerPublishTime: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000), // 2h ago
  },
  {
    uuid: '2',
    title: 'RBI holds rates steady in June policy meeting',
    publisher: 'Mint',
    link: 'https://example.com/2',
    providerPublishTime: Math.floor((Date.now() - 5 * 60 * 60 * 1000) / 1000), // 5h ago
  },
  {
    uuid: '3',
    title: 'Sensex crosses 75,000 mark for the first time',
    publisher: 'Business Standard',
    link: 'https://example.com/3',
    providerPublishTime: Math.floor((Date.now() - 30 * 60 * 1000) / 1000), // 30m ago
  },
  {
    uuid: '4',
    title: 'Fourth headline — should not appear',
    publisher: 'Test Publisher',
    link: 'https://example.com/4',
    providerPublishTime: Math.floor(Date.now() / 1000),
  },
];

function mockFetchSuccess(items = mockNewsItems) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValueOnce({ news: items }),
  });
}

function mockFetchError() {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
}

describe('NewsTeaser', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('shows loading skeletons initially', () => {
    mockFetchSuccess();
    render(<NewsTeaser />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders exactly 3 headlines after successful fetch', async () => {
    mockFetchSuccess();
    render(<NewsTeaser />);
    await waitFor(() => {
      expect(screen.getByText('Nifty 50 rises sharply on FII inflows')).toBeInTheDocument();
    });
    expect(screen.getByText('RBI holds rates steady in June policy meeting')).toBeInTheDocument();
    expect(screen.getByText('Sensex crosses 75,000 mark for the first time')).toBeInTheDocument();
    // 4th item must be excluded
    expect(screen.queryByText('Fourth headline — should not appear')).not.toBeInTheDocument();
  });

  it('renders publisher names', async () => {
    mockFetchSuccess();
    render(<NewsTeaser />);
    await waitFor(() => {
      expect(screen.getByText('Economic Times')).toBeInTheDocument();
    });
    expect(screen.getByText('Mint')).toBeInTheDocument();
    expect(screen.getByText('Business Standard')).toBeInTheDocument();
  });

  it('renders relative times', async () => {
    mockFetchSuccess();
    render(<NewsTeaser />);
    await waitFor(() => {
      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });
    expect(screen.getByText('5h ago')).toBeInTheDocument();
    expect(screen.getByText('30m ago')).toBeInTheDocument();
  });

  it('renders nothing (no DOM output) on fetch error', async () => {
    mockFetchError();
    const { container } = render(<NewsTeaser />);
    await waitFor(() => {
      // After error resolves, component renders null so container should be empty
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders nothing when the news array is empty', async () => {
    mockFetchSuccess([]);
    const { container } = render(<NewsTeaser />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders "View all" link pointing to /news', async () => {
    mockFetchSuccess();
    render(<NewsTeaser />);
    await waitFor(() => {
      expect(screen.getByText('Nifty 50 rises sharply on FII inflows')).toBeInTheDocument();
    });
    const viewAllLink = screen.getByRole('link', { name: /view all/i });
    expect(viewAllLink).toHaveAttribute('href', '/news');
  });

  it('renders news headline links with correct hrefs', async () => {
    mockFetchSuccess();
    render(<NewsTeaser />);
    await waitFor(() => {
      expect(screen.getByText('Nifty 50 rises sharply on FII inflows')).toBeInTheDocument();
    });
    const headlineLink = screen.getByRole('link', {
      name: 'Nifty 50 rises sharply on FII inflows',
    });
    expect(headlineLink).toHaveAttribute('href', 'https://example.com/1');
    expect(headlineLink).toHaveAttribute('target', '_blank');
  });
});
