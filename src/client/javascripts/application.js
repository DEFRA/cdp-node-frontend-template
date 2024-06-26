/*
  eslint-disable @typescript-eslint/no-unsafe-call
  -- No types available: https://github.com/alphagov/govuk-frontend/issues/2835
*/

import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
  // @ts-expect-error -- No types available
} from 'govuk-frontend'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)
