import { FormGroupEntriesPipe } from './form-group-to-list.pipe';

describe('FormGroupToListPipe', () => {
  it('create an instance', () => {
    const pipe = new FormGroupEntriesPipe();
    expect(pipe).toBeTruthy();
  });
});
