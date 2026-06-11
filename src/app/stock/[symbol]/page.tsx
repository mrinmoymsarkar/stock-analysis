import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isValidSymbol } from '@/lib/symbols';
import StockDetailView from '@/components/detail/StockDetailView';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();
  return {
    title: `${symbol} | Indian Stock Market Dashboard`,
    description: `Price, key statistics, analyst recommendations, and news for ${symbol}.`,
  };
}

export default async function StockPage({ params }: PageProps) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  if (!isValidSymbol(symbol)) {
    notFound();
  }

  return <StockDetailView symbol={symbol} />;
}
