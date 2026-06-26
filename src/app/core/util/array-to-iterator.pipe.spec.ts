import { ArrayToIteratorPipe } from './array-to-iterator.pipe';

describe('ArrayToIteratorPipe', () => {
  it('create an instance', () => {
    const pipe = new ArrayToIteratorPipe();
    expect(pipe).toBeTruthy();
  });
});
