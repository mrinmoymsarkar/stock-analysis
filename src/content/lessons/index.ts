import type { Lesson } from '../types';
import stockMarketBasics from './stock-market-basics';
import dematAndBrokers from './demat-and-brokers';
import mutualFunds101 from './mutual-funds-101';
import sipInvesting from './sip-investing';
import readingFundamentals from './reading-fundamentals';
import taxesInIndia from './taxes-in-india';

export const ALL_LESSONS: Lesson[] = [
  stockMarketBasics,
  dematAndBrokers,
  mutualFunds101,
  sipInvesting,
  readingFundamentals,
  taxesInIndia,
];
