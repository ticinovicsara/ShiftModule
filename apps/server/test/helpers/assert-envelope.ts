export function expectEnvelope(body: unknown): void {
  const obj = body as Record<string, unknown>;
  expect(obj).toHaveProperty('data');
  expect(obj).toHaveProperty('error');
  expect(obj).toHaveProperty('message');
  expect(typeof obj.message).toBe('string');
}
