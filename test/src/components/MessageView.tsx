import React from 'react'
import { connect } from 'react-redux'
import * as store from '../store'
import { Container, Row, Col } from 'reactstrap'

import './MessageView.scss'

interface MessageViewProps {

}

const MessageView = (props: MessageViewProps & store.AppState) => {
  const messages = props.inbox.selectedIds.map(id => {
    const matches = props.inbox.messages.data.filter(m => m.id === id)
    if (matches.length) {
      return matches[0]
    }
    return null
  }).filter(m => m !== null)
  return (
    <Container className="message-view">
      {(() => messages.map((message, i) =>
        <Row key={`content-${i}`}>
          <Col>
            {message?.content}
          </Col>
        </Row>
      ))()}
    </Container>
  )
}

export default connect<void, typeof store.thunkCreators.inbox, MessageViewProps, store.AppState>(
  (state: store.AppState) => state,
  store.thunkCreators.inbox
)(MessageView as any)
