import Person from './Person'
import Tag from './Tag'

it('Person can be constructed', () => {
  const p1 = new Person('i dee', 'naaaame', [])
  expect(p1.name).toBe('naaaame')
})

it('Tag can be constructed', () => {
  const t1 = new Tag('eye dee', 'PersonId1', 'PersonId2', 'Laaable', 'timestamp', 'public')
})
