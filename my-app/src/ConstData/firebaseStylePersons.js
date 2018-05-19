import Person from '../Types/Person'

export default {
 'Adrienne_Tran': new Person('Adrienne_Tran', 'Adrienne Tran', [ 'Micah_Catlin', 'Benjamin_Reinhardt' ]),
 'Micah_Catlin': {
    id: 'Micah_Catlin',
    name: 'Micah Catlin',
    knownByPersons: [
      'Micah_Catlin',
      'Benjamin_Reinhardt'
    ]
  },
  'Benjamin_Reinhardt':{
    id: 'Benjamin_Reinhardt',
    name: 'Benjamin Reinhardt',
    knownByPersons: [
      'Micah_Catlin',
      'Benjamin_Reinhardt',
      'Sasha_Sheng'
    ]
  },
    'Sasha_Sheng':{
    id: 'Sasha_Sheng',
    name: 'Sasha Sheng',
    knownByPersons: [
      'Benjamin_Reinhardt'
    ]
  }
};
