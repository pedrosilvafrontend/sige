import { FormGroupEntriesPipe } from './form-group-entries.pipe';

describe('FormGroupToListPipe', () => {
  it('create an instance', () => {
    const pipe = new FormGroupEntriesPipe();
    expect(pipe).toBeTruthy();
  });
});
