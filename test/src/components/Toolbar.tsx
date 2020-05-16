import React from 'react';
import { connect } from 'react-redux';
import { AppState, thunkCreators, InboxState } from '../store';
import { Button } from 'reactstrap';

import './Toolbar.scss'

interface ToolbarProps {
}

const Toolbar = function (props: ToolbarProps & typeof thunkCreators.inbox & InboxState) {
  const requestMessages = () => {
    props.requestMessages();
  }

  return (
    <div className="toolbar">
      <Button onClick={requestMessages} data-testid="btn-get-messages">&#x21BA;</Button>
    </div>
  )
}

export default connect<void, typeof thunkCreators.inbox, ToolbarProps, AppState>(
  (state: AppState) => state.inbox,
  thunkCreators.inbox
)(Toolbar as any)
