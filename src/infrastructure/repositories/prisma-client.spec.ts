import { describe, it, expect } from 'vitest';
import { resolveConnectionString } from './prisma-client';

describe('resolveConnectionString', () => {
  it('rewrites Supabase session pooler port 5432 to transaction pooler 6543', () => {
    const url =
      'postgresql://postgres.ujilpnpevmghhevyjmig:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
    expect(resolveConnectionString(url)).toBe(
      'postgresql://postgres.ujilpnpevmghhevyjmig:secret@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?connection_limit=1',
    );
  });

  it('keeps existing query params when rewriting the port', () => {
    const url =
      'postgresql://user:pass@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require';
    expect(resolveConnectionString(url)).toBe(
      'postgresql://user:pass@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&connection_limit=1',
    );
  });

  it('does not rewrite a local URL', () => {
    const url = 'postgresql://planificador:planificador@localhost:5432/planificador';
    expect(resolveConnectionString(url)).toBe(
      'postgresql://planificador:planificador@localhost:5432/planificador?connection_limit=1',
    );
  });

  it('does not rewrite a Supabase direct connection host', () => {
    const url =
      'postgresql://postgres.ujilpnpevmghhevyjmig:secret@db.ujilpnpevmghhevyjmig.supabase.co:5432/postgres';
    expect(resolveConnectionString(url)).toBe(`${url}?connection_limit=1`);
  });

  it('does not rewrite a URL already on the transaction pooler port', () => {
    const url = 'postgresql://user:pass@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';
    expect(resolveConnectionString(url)).toBe(`${url}?connection_limit=1`);
  });

  it('does not duplicate connection_limit when already present', () => {
    const url =
      'postgresql://user:pass@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?connection_limit=1';
    expect(resolveConnectionString(url)).toBe(
      'postgresql://user:pass@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?connection_limit=1',
    );
  });

  it('handles a URL without a port', () => {
    const url = 'postgresql://user:pass@db.xxx.supabase.co/postgres';
    expect(resolveConnectionString(url)).toBe(`${url}?connection_limit=1`);
  });
});
