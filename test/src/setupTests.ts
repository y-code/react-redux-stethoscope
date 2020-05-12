import '@testing-library/jest-dom/extend-expect'
import { enableFetchMocks } from 'jest-fetch-mock'
import * as enzyme from 'enzyme'
import EnzymeAdapter from 'enzyme-adapter-react-16'
import { useStethoscope, logger as stethoscopeLogger } from 'react-redux-stethoscope'
import logger from './logger'

logger.level = 'error'

enableFetchMocks()
fetchMock.dontMock()

stethoscopeLogger.level = 'error'
useStethoscope()

enzyme.configure({ adapter: new EnzymeAdapter() })
