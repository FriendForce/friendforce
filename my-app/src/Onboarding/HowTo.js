import React, { Component } from 'react';
import personSearch from './static/friendforce_person_search.gif';
import tagSearch from './static/friendforce_tag_search.gif';
import miniPersonSelect from './static/friendforce_miniperson_select.gif';
import createPerson from './static/friendforce_create_person.gif';
import addTag from './static/friendforce_add_tag.gif';
import addManyTags from './static/friendforce_add_tags.gif';

export default class HowTo extends Component {
  render() {
    return (
      <div>
        <h2> How to Use FriendForce </h2>
        Welcome to friendforce! Here are some quick pointers on how to use
        friendforce.
        <div>
          <figure className="figure">
            <img
              src={personSearch}
              className="figure-img img-fluid rounded"
              alt="Person Search"
            />

            <figcaption className="figure-caption">
              A main function of Friendforce is learning about people you know.
              To search for someone, type their name in the search box.
            </figcaption>
          </figure>
        </div>
        <div>
          <figure className="figure">
            <img
              src={tagSearch}
              className="figure-img img-fluid rounded"
              alt="Tag Search"
            />

            <figcaption className="figure-caption">
              You can also search for people by tags, either by clicking on the
              tag or typing it into the search bar
            </figcaption>
          </figure>
        </div>
        <div>
          <figure className="figure">
            <img
              src={miniPersonSelect}
              className="figure-img img-fluid rounded"
              alt="Mini Person Select"
            />

            <figcaption className="figure-caption">
              Searching by tags will show you all the people the tags apply to.
              You can click on any of these people.
            </figcaption>
          </figure>
        </div>
        <div>
          <figure className="figure">
            <img
              src={addTag}
              className="figure-img img-fluid rounded"
              alt="Add Tag"
            />

            <figcaption className="figure-caption">
              You can add more tags to anybody - use these to remember things
              for later.
            </figcaption>
          </figure>
        </div>
        <div>
          <figure className="figure">
            <img
              src={createPerson}
              className="figure-img img-fluid rounded"
              alt="Create Person"
            />

            <figcaption className="figure-caption">
              You can also add people to friendforce if they aren't here yet
            </figcaption>
          </figure>
        </div>
        <div>
          <figure className="figure">
            <img
              src={addManyTags}
              className="figure-img img-fluid rounded"
              alt="Add Many Tags"
            />

            <figcaption className="figure-caption" />
          </figure>
        </div>
        To get started, why not <b>Show All Labels</b> and click on one?
      </div>
    );
  }
}
