import React, { Component } from 'react';

import stepOne from './static/step-1-click-settings.gif';
import stepTwo from './static/step-2-click-info.gif';
import stepThree from './static/step-3-settings.gif';
import stepFour from './static/step-4-create.gif';
import stepFive from './static/step-5-email-time.png';
import stepSix from './static/step-6-go-to-tab.gif';
import stepSeven from './static/step-7-download.gif';
import stepEight from './static/step-8-unzip.gif';

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
  uploadFbHtmlData = files => {
    console.log('uploading fb data from ' + files);
    const defaultLabel = 'from facebook';
    const dontSync = true;
    var fr = new FileReader();
    fr.onload = e => {
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(e.target.result, 'text/html');
      var friend_html = htmlDoc.body.children[1].children[2].children;
      for (var i = 0; i < friend_html.length; i++) {
        // TODO: need to handle corner case where person has >2 names

        var name = friend_html[i].innerText.split(' (')[0];
        const addedDate = facebookDateToDate(
          friend_html[i].innerText.split(' (')[1].split(')')[0]
        );

        // Create a person for each person
        this.props.createPerson(name, dontSync).then(id => {
          this.props.addTag(defaultLabel, id, 'private', dontSync);
          this.props.addTag('datemetfb:' + addedDate, id, 'private', dontSync);
        });
      }
    };
    fr.readAsText(files[0]);
  };

  uploadFbJsonData = files => {
    console.log('uploading fb data from ' + files);
    var fr = new FileReader();
    fr.onload = e => {
      var json = JSON.parse(e.target.result);
      json.forEach(person => {
        console.log('adding ' + person.name);
      });
    };
    fr.readAsText(files[0]);
  };

  uploadFbData = files => {
    // probably a smarter way to know the type of a file here
    const type = files[0].split('.')[-1];
    if (type === 'json') {
      this.uploadFbJsonData(files);
    } else if (type === 'html') {
      this.uploadFbHtmlData(files);
    }
  };

  render() {
    return (
      <div>
        <div>
          {' '}
          If you have already downloaded your facebook data, load it here:{' '}
        </div>

        <div className="input-group">
          <label className="input-group-btn">
            <span className="btn btn-primary">
              Upload Facebook Data Folder&hellip;{' '}
              <input type="file" style={{ display: 'none' }} multiple />
            </span>
          </label>
          <input type="text" class="form-control" readonly />
        </div>

        <div>
          <figure className="figure">
            <img src={stepOne} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              First, go to{' '}
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
            <img src={stepTwo} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              Second, click <b>Your Facebook Information</b> and then on the
              next page, <b>Download Your Information</b>
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img src={stepThree} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              Third, select <b>Format: JSON</b>, <b>Media Qualty: Low</b> and
              unselect every option but <b>Friends</b>
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img src={stepFour} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              Fourth, click <b>Create</b>
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img src={stepFive} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              You will have to wait for an email confirming your information is
              available. This takes a few minutes. In the meantime,{' '}
              <b>Play Around with Friendforce</b>.
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img src={stepSix} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              Once you receive the confirmation email, click the{' '}
              <b>"Avaible Files"</b> link.
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img src={stepSeven} className="figure-img img-fluid rounded" />

            <figcaption className="figure-caption">
              On the <b>Download Your Information</b> page, click the{' '}
              <b>Download</b> button
            </figcaption>
          </figure>
        </div>

        <div>
          <figure className="figure">
            <img src={stepEight} className="figure-img img-fluid rounded" />
            <figcaption className="figure-caption">Unzip the file</figcaption>
          </figure>
        </div>
        <div>
          <h4>Upload your Data</h4>
          <div className="input-group">
            <label className="input-group-btn">
              <span className="btn btn-primary">
                Upload Facebook Data Folder&hellip;{' '}
                <input type="file" style={{ display: 'none' }} multiple />
              </span>
            </label>
            <input type="text" class="form-control" readonly />
          </div>
        </div>
      </div>
    );
  }
}
