import React, { Component } from 'react';
import stepOne from './static/step-1-click-settings.gif';
import stepTwo from './static/step-2-click-info.gif';
import stepThree from './static/step-3-settings.gif';
import stepFour from './static/step-4-create.gif';
import stepFive from './static/step-5-email-time.png';
import stepSix from './static/step-6-go-to-tab.gif';
import stepSeven from './static/step-7-download.gif';
import stepEight from './static/step-8-unzip.gif';

export default class Onboarding extends Component {
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
