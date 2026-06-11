import React from 'react';
import { render, screen } from '@testing-library/react';
import NewsList from '@/components/detail/NewsList';

const mockNews = [
  {
    uuid: 'news-1',
    title: 'Reliance Industries posts record quarterly profit',
    publisher: 'Economic Times',
    link: 'https://example.com/news/1',
    providerPublishTime: Math.floor(Date.now() / 1000) - 7200, // 2h ago
    thumbnail: undefined,
  },
  {
    uuid: 'news-2',
    title: 'Nifty 50 crosses 25,000 mark',
    publisher: 'Mint',
    link: 'https://example.com/news/2',
    providerPublishTime: Math.floor(Date.now() / 1000) - 86400, // 1d ago
    thumbnail: undefined,
  },
];

describe('NewsList', () => {
  it('renders news items with titles as links', () => {
    render(<NewsList news={mockNews} />);
    const link1 = screen.getByText('Reliance Industries posts record quarterly profit');
    expect(link1.tagName.toLowerCase()).toBe('a');
    const link2 = screen.getByText('Nifty 50 crosses 25,000 mark');
    expect(link2.tagName.toLowerCase()).toBe('a');
  });

  it('links have target="_blank" and rel="noopener noreferrer"', () => {
    render(<NewsList news={mockNews} />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('shows publisher names', () => {
    render(<NewsList news={mockNews} />);
    expect(screen.getByText('Economic Times')).toBeInTheDocument();
    expect(screen.getByText('Mint')).toBeInTheDocument();
  });

  it('shows relative time strings', () => {
    render(<NewsList news={mockNews} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(screen.getByText('1d ago')).toBeInTheDocument();
  });

  it('renders loading skeletons when loading is true', () => {
    const { container } = render(<NewsList news={[]} loading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('returns null when news is empty and not loading', () => {
    const { container } = render(<NewsList news={[]} loading={false} />);
    expect(container.firstChild).toBeNull();
  });
});
