export default class Person {
  constructor(id, name) {
    /*
     * Creates a Person. Two different Constructors:
     * Person(id, name, knownByPersons)
     * @param id {string->id} id of the person
     * @param name {string} name of the person
     * @param knownByPersons {string list} list of ids of person known by
     * @return {Person}
     *
     * Person(id, data)
     * @param id {string->id} id of the person
     * @param name {object} data to initialize the person
     * @return {Person}
     */
    this.id = id;
    this.name = name || '';
  }
}
