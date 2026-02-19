import { retryWithBackoff, isDefined, isError, generateId } from '../../src/utils/helpers';

describe('Utility Functions', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, { 
        maxRetries: 3,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(
        retryWithBackoff(fn, { 
          maxRetries: 2,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('Failed');

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should apply exponential backoff', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelayMs: 100,
        backoffMultiplier: 2,
      });
      const duration = Date.now() - startTime;

      // Should wait ~100ms + ~200ms = ~300ms
      expect(duration).toBeGreaterThanOrEqual(250);
    });
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new TypeError('test'))).toBe(true);
      expect(isError(new RangeError('test'))).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('error')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs in expected format', () => {
      const id = generateId();

      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
