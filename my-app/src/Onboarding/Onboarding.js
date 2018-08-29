import React, { Component } from 'react';
import stepOne from './static/step-1-click-settings.gif';
import stepTwo from './static/step-2-click-info.gif';
import stepThree from './static/step-3-settings.gif';
import stepFour from './static/step-4-create.gif';
import stepFive from './static/step-5-email-time.png';
import stepSix from './static/step-6-go-to-tab.gif';
import stepSeven from './static/step-7-download.gif';
import stepEight from './static/step-8-unzip.gif';
import stepNine from './static/step-9-navigate-to-friends.gif';

const facebookDateToDate = facebookDate => {
  if (facebookDate === 'Today') {
    return new Date(Date.now());
  }
  if (facebookDate.split(' ').length === 2) {
    return new Date(facebookDate + ' ' + new Date(Date.now()).getFullYear());
  } else {
    return new Date(facebookDate);
  }
};

export default class Onboarding extends Component {
  uploadFBData = files => {
    console.log('uploading fb data from ' + files);
    const defaultLabel = 'from facebook';
    const dontSync = true;
    var fr = new FileReader();
    fr.onload = e => {
      const filename = files[0].name;
      const type = filename.split('.')[filename.split('.').length - 1];

      if (type === 'json') {
        const friends = JSON.parse(e.target.result).friends;
        friends.forEach(friend => {
          this.props.createPerson(friend.name).then(id => {
            var tag_text = 'datemetfb:' + friend.timestamp;
            this.props.createTag(tag_text, id, 'private');
            if (friend.contact_info != null) {
              this.props.createTag(
                'email:' + friend.contact_info,
                id,
                'private'
              );
            }
          });
        });
        this.props.updateAccount({ connected_facebook: true });
      }
      if (type === 'html') {
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(e.target.result, 'text/html');
        var friend_html = htmlDoc.body.children[1].children[2].children;
        //for (var i = 0; i < friend_html.length; i++) {
        for (var i = 0; i < 1; i++) {
          // TODO: need to handle corner case where person has >2 names
          var name = friend_html[i].innerText.split(' (')[0];
          const addedDate = facebookDateToDate(
            friend_html[i].innerText.split(' (')[1].split(')')[0]
          );
          // Create a person for each person
          this.props.createPerson(name).then(id => {
            var tag_text = 'datemetfb:' + addedDate;
            this.props.createTag(tag_text, id, 'private');
          });
        }
        this.props.updateAccount({ connected_facebook: true });
      }
    };

    fr.readAsText(files[0]);
  };

  render() {
    return (
      <div>
        <div>
          {' '}
          If you have already downloaded your facebook data (friends.json), load
          it here: This May Take a While. Please Be Patient.
        </div>

        <div className="input-group">
          <label className="input-group-btn">
            <span className="btn btn-primary">
              Upload friends.json{' '}
              <input
                type="file"
                placeholder="friends.json"
                style={{ display: 'none' }}
                multiple
                onChange={e => this.uploadFBData(e.target.files)}
              />
            </span>
          </label>
          <input type="text" class="form-control" readonly />
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepOne}
              className="figure-img img-fluid rounded"
              alt="Step One"
            />

            <figcaption className="figure-caption">
              Step 1 of 9: First, go to{' '}
              <a
                href="http://www.facebook.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                www.facebook.com
              </a>{' '}
              and go to settings.
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepTwo}
              className="figure-img img-fluid rounded"
              alt="Step Two"
            />

            <figcaption className="figure-caption">
              Step 2 of 9: click <b>Your Facebook Information</b> and then on
              the next page, <b>Download Your Information</b>
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepThree}
              className="figure-img img-fluid rounded"
              alt="Step Three"
            />

            <figcaption className="figure-caption">
              Step 3 of 9: select <b>Format: JSON</b>, <b>Media Qualty: Low</b>{' '}
              and unselect every option but <b>Friends</b>
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepFour}
              className="figure-img img-fluid rounded"
              alt="Step Four"
            />

            <figcaption className="figure-caption">
              Step 4 of 9: click <b>Create</b>
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepFive}
              className="figure-img img-fluid rounded"
              alt="Step Five"
            />

            <figcaption className="figure-caption">
              Step 5 of 9: You will have to wait for an email confirming your
              information is available. This takes a few minutes. In the
              meantime, <b>Play Around with Friendforce</b>.
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepSix}
              className="figure-img img-fluid rounded"
              alt="Step Six"
            />

            <figcaption className="figure-caption">
              Step 6 of 9: Once you receive the confirmation email, click the{' '}
              <b>"Avaible Files"</b> link.
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepSeven}
              className="figure-img img-fluid rounded"
              alt="Step Seven"
            />

            <figcaption className="figure-caption">
              Step 7 of 9: On the <b>Download Your Information</b> page, click
              the <b>Download</b> button
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepEight}
              className="figure-img img-fluid rounded"
              alt="Step Eight"
            />
            <figcaption className="figure-caption">
              Step 8 of 9: Unzip the file
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img
              src={stepNine}
              className="figure-img img-fluid rounded"
              alt="Step Nine"
            />
            <figcaption className="figure-caption">
              Step 9 of 9: Click "Upload friends.json" and navigate to facebook
              data folder=>friends.json
            </figcaption>
          </figure>
        </div>

        <div>
          <h4>Upload your Data - This May Take a While. Please Be Patient.</h4>
          <div className="input-group">
            <label className="input-group-btn">
              <span className="btn btn-primary">
                Upload friends.json{' '}
                <input
                  placeholder="friends.json"
                  type="file"
                  name="files"
                  style={{ display: 'none' }}
                  multiple
                  onChange={e => this.uploadFBData(e.target.files)}
                />
              </span>
            </label>
            <input type="text" class="form-control" readonly />
          </div>
        </div>
      </div>
    );
  }
}
