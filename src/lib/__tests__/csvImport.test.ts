import { parseHoldingsCsv, holdingsCsvTemplate } from '@/lib/csvImport';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function csv(...lines: string[]): string {
  return lines.join('\n') + '\n';
}

// ─── Clean Indian file ────────────────────────────────────────────────────────

describe('parseHoldingsCsv – clean Indian file', () => {
  const input = csv(
    'Symbol,Quantity,Buy Price,Buy Date',
    'RELIANCE.NS,10,2450.50,2024-06-15',
    'TCS.NS,5,3900.00,2024-01-10',
    'INFY.NS,20,1600.75,2023-12-01'
  );

  it('returns three valid rows', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(3);
    expect(skipped).toHaveLength(0);
  });

  it('maps fields correctly', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid[0]).toMatchObject({
      symbol: 'RELIANCE.NS',
      quantity: 10,
      buyPrice: 2450.5,
      buyDate: '2024-06-15',
      quoteType: 'EQUITY',
    });
  });

  it('returns detected mapping', () => {
    const { detected } = parseHoldingsCsv(input);
    expect(detected.symbol).toBeDefined();
    expect(detected.quantity).toBeDefined();
    expect(detected.buyPrice).toBeDefined();
    expect(detected.buyDate).toBeDefined();
  });

  it('returns headers array', () => {
    const { headers } = parseHoldingsCsv(input);
    expect(headers).toEqual(['Symbol', 'Quantity', 'Buy Price', 'Buy Date']);
  });
});

// ─── Headers in a different order/casing ─────────────────────────────────────

describe('parseHoldingsCsv – alternate header order and casing', () => {
  const input = csv(
    'buy_date,TICKER,AVG COST,QTY',
    '2024-03-01,HDFCBANK.NS,1600.00,8'
  );

  it('auto-detects despite different casing and order', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(skipped).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0]).toMatchObject({
      symbol: 'HDFCBANK.NS',
      quantity: 8,
      buyPrice: 1600,
      buyDate: '2024-03-01',
    });
  });
});

// ─── Quoted company name containing a comma ───────────────────────────────────

describe('parseHoldingsCsv – quoted name with comma', () => {
  const input = csv(
    'symbol,name,quantity,buy_price,buy_date',
    '"ICICIBANK.NS","ICICI Bank, Ltd.",50,1100.00,2024-05-20'
  );

  it('parses quoted name with comma correctly', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(skipped).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('ICICIBANK.NS');
    expect(valid[0].name).toBe('ICICI Bank, Ltd.');
    expect(valid[0].quantity).toBe(50);
  });
});

// ─── US row via ISIN ─────────────────────────────────────────────────────────

describe('parseHoldingsCsv – US stock via ISIN', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date,isin',
    'AAPL,5,170.00,2024-01-15,US0378331005'
  );

  it('skips US row with correct reason', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toBe('US stocks not yet supported');
    expect(skipped[0].row).toBe(1);
  });
});

// ─── US row via exchange ─────────────────────────────────────────────────────

describe('parseHoldingsCsv – US stock via exchange', () => {
  const input = csv(
    'ticker,units,average,date,exchange',
    'MSFT,3,380.00,2024-02-01,NASDAQ',
    'GOOGL,1,170.00,2024-02-01,NYSE',
    'NSDQ-STOCK,2,50.00,2024-02-01,NSDQ'
  );

  it('skips all US-exchange rows', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(0);
    expect(skipped).toHaveLength(3);
    skipped.forEach((s) => expect(s.reason).toBe('US stocks not yet supported'));
  });
});

// ─── Bad quantity ─────────────────────────────────────────────────────────────

describe('parseHoldingsCsv – invalid quantity', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'TCS.NS,abc,3900.00,2024-01-10',
    'INFY.NS,-5,1600.00,2024-01-10',
    'RELIANCE.NS,0,2450.00,2024-01-10',
    'WIPRO.NS,10,500.00,2024-01-10'
  );

  it('skips rows with non-positive or NaN quantity', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('WIPRO.NS');
    expect(skipped).toHaveLength(3);
    skipped.forEach((s) =>
      expect(s.reason).toMatch(/quantity/i)
    );
  });
});

// ─── Bad buy price ────────────────────────────────────────────────────────────

describe('parseHoldingsCsv – invalid buy price', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'TCS.NS,5,xyz,2024-01-10',
    'INFY.NS,10,-100,2024-01-10',
    'HDFCBANK.NS,8,1600.00,2024-01-10'
  );

  it('skips rows with negative or NaN price', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('HDFCBANK.NS');
    expect(skipped).toHaveLength(2);
  });

  it('accepts zero buy price', () => {
    const zeroInput = csv(
      'symbol,quantity,buy_price,buy_date',
      'BONUS.NS,100,0,2024-01-10'
    );
    const { valid } = parseHoldingsCsv(zeroInput);
    expect(valid).toHaveLength(1);
    expect(valid[0].buyPrice).toBe(0);
  });
});

// ─── Bad date ─────────────────────────────────────────────────────────────────

describe('parseHoldingsCsv – invalid date', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'TCS.NS,5,3900.00,not-a-date',
    'INFY.NS,10,1600.00,2024-13-01',
    'WIPRO.NS,8,500.00,2024-06-15'
  );

  it('skips rows with unparseable date', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('WIPRO.NS');
    expect(skipped).toHaveLength(2);
    expect(skipped[0].reason).toMatch(/date/i);
  });
});

// ─── DD-MM-YYYY date normalisation ───────────────────────────────────────────

describe('parseHoldingsCsv – DD-MM-YYYY date format', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'RELIANCE.NS,10,2450.50,15-06-2024'
  );

  it('normalises DD-MM-YYYY to YYYY-MM-DD', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].buyDate).toBe('2024-06-15');
  });
});

// ─── DD/MM/YYYY date normalisation ───────────────────────────────────────────

describe('parseHoldingsCsv – DD/MM/YYYY date format', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'TCS.NS,5,3900.00,10/01/2024'
  );

  it('normalises DD/MM/YYYY to YYYY-MM-DD', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].buyDate).toBe('2024-01-10');
  });
});

// ─── DD-MMM-YYYY date normalisation ──────────────────────────────────────────

describe('parseHoldingsCsv – DD-MMM-YYYY date format', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'WIPRO.NS,8,500.00,10-Jan-2025'
  );

  it('normalises DD-MMM-YYYY to YYYY-MM-DD', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].buyDate).toBe('2025-01-10');
  });
});

// ─── Absent date → defaulted to today ────────────────────────────────────────

describe('parseHoldingsCsv – missing date defaults to today', () => {
  const input = csv(
    'symbol,quantity,buy_price',
    'HDFCBANK.NS,8,1600.00'
  );

  it('defaults to today and sets dateDefaulted flag', () => {
    const today = new Date().toISOString().slice(0, 10);
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].buyDate).toBe(today);
    expect(valid[0].dateDefaulted).toBe(true);
  });
});

// ─── Row cap at 200 ──────────────────────────────────────────────────────────

describe('parseHoldingsCsv – 200-row cap', () => {
  const lines = ['symbol,quantity,buy_price,buy_date'];
  for (let i = 0; i < 205; i++) {
    lines.push(`STOCK${i}.NS,${i + 1},100.00,2024-01-01`);
  }
  const input = lines.join('\n');

  it('accepts exactly 200 and skips the remaining 5', () => {
    const { valid, skipped } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(200);
    expect(skipped).toHaveLength(5);
    expect(skipped[0].reason).toMatch(/limit/i);
  });
});

// ─── Bare ticker → .NS appended ──────────────────────────────────────────────

describe('parseHoldingsCsv – bare ticker auto-suffixed .NS', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'RELIANCE,10,2450.50,2024-06-15'
  );

  it('appends .NS to bare tickers', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('RELIANCE.NS');
  });
});

// ─── Index symbol (^ prefix) kept as-is ─────────────────────────────────────

describe('parseHoldingsCsv – index symbol with ^ prefix', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    '^NSEI,1,24000.00,2024-06-15'
  );

  it('keeps ^ prefix as-is', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('^NSEI');
  });
});

// ─── .BO suffix kept as-is ───────────────────────────────────────────────────

describe('parseHoldingsCsv – .BO suffix kept as-is', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'RELIANCE.BO,10,2450.00,2024-06-15'
  );

  it('keeps .BO suffix unchanged', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].symbol).toBe('RELIANCE.BO');
  });
});

// ─── mappingOverride ─────────────────────────────────────────────────────────

describe('parseHoldingsCsv – mappingOverride', () => {
  const input = csv(
    'scrip_code,no_shares,avg_cost,purchase_date',
    'WIPRO.NS,15,450.00,2024-06-01'
  );

  it('uses override mapping when provided', () => {
    const { valid, skipped } = parseHoldingsCsv(input, {
      symbol:   'scrip_code',
      quantity: 'no_shares',
      buyPrice: 'avg_cost',
      buyDate:  'purchase_date',
    });
    expect(skipped).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0]).toMatchObject({
      symbol: 'WIPRO.NS',
      quantity: 15,
      buyPrice: 450,
      buyDate: '2024-06-01',
    });
  });
});

// ─── Template round-trip ─────────────────────────────────────────────────────

describe('holdingsCsvTemplate – round-trip', () => {
  it('produces a template that parses to at least one valid row', () => {
    const template = holdingsCsvTemplate();
    const { valid, skipped } = parseHoldingsCsv(template);
    expect(valid.length).toBeGreaterThanOrEqual(1);
    expect(valid[0].symbol).toBe('RELIANCE.NS');
    // Template should not cause skips
    expect(skipped).toHaveLength(0);
  });

  it('template CSV is a non-empty string', () => {
    expect(typeof holdingsCsvTemplate()).toBe('string');
    expect(holdingsCsvTemplate().length).toBeGreaterThan(0);
  });
});

// ─── Comma-separated quantity/price (e.g. 1,000.00) ─────────────────────────

describe('parseHoldingsCsv – comma-formatted numbers', () => {
  const input = csv(
    'symbol,quantity,buy_price,buy_date',
    'RELIANCE.NS,"1,000","2,450.50",2024-06-15'
  );

  it('strips commas from numeric fields', () => {
    const { valid } = parseHoldingsCsv(input);
    expect(valid).toHaveLength(1);
    expect(valid[0].quantity).toBe(1000);
    expect(valid[0].buyPrice).toBe(2450.5);
  });
});
