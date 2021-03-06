import '@testing-library/jest-dom/extend-expect'
import { enableFetchMocks } from 'jest-fetch-mock'
import * as enzyme from 'enzyme'
import EnzymeAdapter from 'enzyme-adapter-react-16'
import { useStethoscope } from 'react-redux-stethoscope'
import { getLogger } from 'log4js'

getLogger().level = 'error'

enableFetchMocks()
fetchMock.dontMock()

getLogger('React-Redux Stethoscope').level = 'error'
useStethoscope()

enzyme.configure({ adapter: new EnzymeAdapter() })
