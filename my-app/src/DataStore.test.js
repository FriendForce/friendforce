import DataStore from './DataStore';

describe('DataStore', () => {
  it('can be created without throwing', () => {
    expect(DataStore.data().length).toEqual(0);
  });
  it('successfully loads persons', () => {
    expect(DataStore.persons().length).toBeGreaterThan(0);
  });
  it('successfully loads tags', () => {
    expect(DataStore.tags().length).toBeGreaterThan(0);
  });
  it('successfully resets data', () => {
    var oldNumPersons = DataStore.persons().length;
    DataStore._persons= [{id:-1, name:'john doe'}];
    DataStore.resetData();
    var newNumPersons = DataStore.persons().length;
    expect(newNumPersons).toEqual(0);
  });
  it('successfully adds person', async () => {
    var oldNumPersons = DataStore._persons.length;
    const data = await DataStore.addPersonByName('john doe');
    var newNumPersons = DataStore.persons().length;
    expect(newNumPersons-oldNumPersons).toEqual(1);
    DataStore.resetData();
  });

  it('successfully adds tags', async () => {
    var oldNumTags = DataStore.tags().length;
    const data = await DataStore.addTag('z','foo', '0', '0', 'public');
    var newNumTags = DataStore.tags().length;
    expect(newNumTags-oldNumTags).toEqual(1);
    DataStore.resetData(); 
  });

  it('getPersonsByName', async () => {
    await DataStore.addPersonByName('john doe');
    const data = await DataStore.getPersonsByName('john doe');
    expect(data[0].name).toEqual('john doe');
    DataStore.resetData();
  });

  it('getTagsBySubect', async () => {
    await DataStore.addTag('z','foo', '0', '0', 'public');
    const data = await DataStore.getTagsBySubject('z');
    expect(data[0].subject).toEqual('z');
    DataStore.resetData();
  });

  it('can firebasePushPerson', async() => {
    var person = {name:"test", id:"test"}
    var user = {name:"test_user", id:"test_user"}
    DataStore.firebasePushPerson(person, user);
    DataStore.resetData();
  });

  it ('can firebase sync', async() => {
    var person = {name:"test", id:"test"}
    var user = {name:"test_user", id:"test_user"}
    DataStore.addPersonByName(person.name)
    .then((id) =>{
      DataStore.firebaseSync(user);
      expect(DataStore.numPersonDiffs()).toEqual(0);
    });
    DataStore.resetData();
  });

  it('addPersonByName', async () => {
    //NOT IMPLEMENTED
  });

  it('addTag', async () => {
    //NOT IMPLEMENTED
  });

  it('deleteTag', async () => {
    //NOT IMPLEMENTED
  });

  it('deletePerson', async () => {
    //NOT IMPLEMENTED
  });

  it('updateTag', async () => {
    //NOT IMPLEMENTED
  });

  it('updatePerson', async () => {
    //NOT IMPLEMENTED
  });
  
})
