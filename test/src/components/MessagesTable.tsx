import React from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Input, Button } from 'reactstrap'
import { thunkCreators, AppState } from '../store'

import './MessagesTable.scss'
import Header from './Header'

interface MessagesTableProps {
}

const MessagesTable = (props: MessagesTableProps & AppState & typeof thunkCreators.inbox) => {
  const isAllSelected = props.inbox.messages.data.length === props.inbox.selectedIds.length
  return (
    <Container className="messages-table">
      <Header/>
      <Row className="table-header">
        <Col className="col-checkbox" xs={1}>
          <Input
            id={`check-all`}
            type="checkbox"
            checked={isAllSelected}
            onChange={e => isAllSelected ? props.deselectAllMessages() : props.selectAllMessages()}
          />
        </Col>
        <Col xs={4}>
          From
        </Col>
        <Col xs={7}>
          Subject
        </Col>
      </Row>
      {(() => {
        if (props.inbox.messages.error) {
          return (
            <Row className="table-row">
              <Col>
                {props.inbox.messages.error}
              </Col>
            </Row>
          )
        } else if (props.inbox.messages.loading){
          return (
            <Row className="table-row">
              <Col className="col-loading" data-testid="message.loading">
                Loading...
              </Col>
            </Row>
          )
        } else if (!props.inbox.messages.data.length) {
          return (
            <Row>
              <Col>
                <Button onClick={e => props.requestMessages()}>Load messages</Button>
              </Col>
            </Row>
          )
        } else {
          return props.inbox.messages.data.map((message, i) => {
            const isChecked = props.inbox.selectedIds.includes(message.id)
            return (
              <Row
                key={`message-${i}`}
                className="table-row"
                onClick={e => isChecked ? props.deselectMessage(message) : props.selectMessage(message)}
              >
                <Col className="col-checkbox" xs={1}>
                  <Input
                    id={`check-${i}`}
                    type="checkbox"
                    checked={props.inbox.selectedIds.includes(message.id)}
                    onChange={e => {}}
                    />
                </Col>
                <Col xs={4}>
                  {message.from}
                </Col>
                <Col xs={7} data-testid="message.subject">
                  {message.subject}
                </Col>
              </Row>
            )
          })
        }
      })()}
    </Container>
  )
}

export default connect<void, typeof thunkCreators.inbox, MessagesTableProps, AppState>(
  (state: AppState) => state,
  thunkCreators.inbox,
)(MessagesTable as any)
