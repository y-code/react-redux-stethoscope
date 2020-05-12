import React from "react"
import { AppState, thunkCreators } from "../store"
import { connect } from "react-redux"
import { Row, Col } from "reactstrap"

interface HeaderProps {
}

const header = ((props: HeaderProps & AppState) => {
  return (
    <Row>
      <Col>
        {props.inbox.selectedIds.length
          ? `${props.inbox.selectedIds.length} message${props.inbox.selectedIds.length < 2 ? ' is' : 's are'} selected`
          : `Select a message to read the content`}
      </Col>
    </Row>
  )
}) as any

export default connect<void, typeof thunkCreators.inbox, HeaderProps, AppState>(
  (state: AppState) => state,
  thunkCreators.inbox,
)(header)
