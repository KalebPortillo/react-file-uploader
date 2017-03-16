import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import shortid from 'shortid';
import status from './constants/status';

class Receiver extends Component {
  constructor(props) {
    super(props);

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onFileDrop = this.onFileDrop.bind(this);
    this.open = this.open.bind(this);

    // this is to monitor the hierarchy
    // for window onDragEnter event
    this.state = {
      dragLevel: 0,
    };
  }

  componentDidMount() {
    invariant(
      !!window.DragEvent && !!window.DataTransfer,
      'Upload end point must be provided to upload files'
    );

    window.addEventListener('dragenter', this.onDragEnter);
    window.addEventListener('dragleave', this.onDragLeave);
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onFileDrop);
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.onDragEnter);
    window.removeEventListener('dragleave', this.onDragLeave);
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onFileDrop);
  }

  onDragEnter(e) {
    const dragLevel = this.state.dragLevel + 1;

    this.setState({ dragLevel });

    if (!this.props.isOpen) {
      this.props.onDragEnter(e);
    }
  }

  onDragLeave(e) {
    const dragLevel = this.state.dragLevel - 1;

    this.setState({ dragLevel });

    if (dragLevel === 0) {
      this.props.onDragLeave(e);
    }
  }

  onDragOver(e) {
    e.preventDefault();
    this.props.onDragOver(e);
  }

  onFileDrop(e) {
    // eslint-disable-next-line no-param-reassign
    e = e || window.event;
    e.preventDefault();

    const files = [];

    let fileList = [];

    if (!!e.dataTransfer) {
      console.log("DATA TRANFER TYPE");
      fileList = e.dataTransfer.files || [];
    } else if (!!e.target) {
      console.log("TARGET TYPE");
      fileList = e.target.files || [];
    }

    for (let i = 0; i < fileList.length; i++) {
      fileList[i].id = shortid.generate();
      fileList[i].status = status.PENDING;
      fileList[i].progress = 0;
      fileList[i].src = null;
      files.push(fileList[i]);
    }

    // reset drag level once dropped
    this.setState({ dragLevel: 0 });

    this.props.onFileDrop(e, files);
  }

  open() {
    this.inputRef.click();
  }

  render() {
    const { isOpen, customClass, style, children } = this.props;

    return (
      isOpen ? (
          <div className={classNames(customClass)} style={style}>
            <input
              type='file'
              ref={(ref) => this.inputRef = ref}
              multiple
              onChange={this.onFileDrop}
            />
            {children}
          </div>
        ) : null
    );
  }
}

Receiver.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  isOpen: PropTypes.bool.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func.isRequired,
  onFileDrop: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default Receiver;
